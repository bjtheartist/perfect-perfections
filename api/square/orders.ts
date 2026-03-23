import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { BookingRequest, CatalogData } from '../../src/lib/square/types';
import { buildQuoteFromCatalog } from '../_lib/quote';
import {
  createIdempotencyKey,
  createSquareClient,
  getCatalogData,
  getErrorMessage,
  getSquareLocationId,
  handleCors,
  normalizeBooking,
  requireMethods,
  upsertCustomer,
  validateOrderRequest,
} from '../_lib/square';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res, ['POST'])) return;
  if (!requireMethods(req, res, ['POST'])) return;

  const booking = normalizeBooking(req.body);
  const validationError = validateOrderRequest(booking);
  if (validationError) {
    return res.status(400).json({ success: false, error: validationError });
  }

  try {
    const client = createSquareClient();
    const locationId = getSquareLocationId();
    const customerId = await upsertCustomer(client, booking);
    const catalog = await getCatalogData(client);
    const quote = buildQuoteFromCatalog(booking, catalog);
    const lineItems = buildLineItems(booking, catalog);

    if (quote.totalCents <= 0) {
      return res.status(400).json({ success: false, error: 'Order must include at least one priced item' });
    }

    const orderResult = await client.orders.create({
      order: {
        locationId,
        customerId,
        referenceId: createIdempotencyKey('pp', {
          customerEmail: booking.customerEmail,
          eventDate: booking.eventDate,
          eventTime: booking.eventTime,
        }).slice(0, 40),
        lineItems,
        taxes: [{ name: 'Chicago Sales Tax', percentage: '10.25', scope: 'ORDER' }],
        fulfillments: [{
          type: 'PICKUP',
          state: 'PROPOSED',
          pickupDetails: {
            recipient: {
              displayName: booking.customerName,
              emailAddress: booking.customerEmail,
              phoneNumber: booking.customerPhone,
            },
            pickupAt: toChicagoPickupAt(booking.eventDate, booking.eventTime),
            note: `${booking.eventType} event — ${booking.guestCount} guests`,
          },
        }],
        metadata: Object.fromEntries(
          Object.entries({
            eventType: booking.eventType,
            eventDate: booking.eventDate,
            eventTime: booking.eventTime,
            guestCount: String(booking.guestCount),
            notes: booking.notes,
          }).filter(([, v]) => v !== '' && v !== undefined)
        ),
      },
      idempotencyKey: createIdempotencyKey('order', booking),
    });

    const order = orderResult.order;
    const totalCents = Number(order?.totalMoney?.amount ?? 0);
    const depositCents = Math.round(totalCents * 0.25);

    res.json({
      success: true,
      data: {
        bookingId: order?.id || '',
        orderId: order?.id || '',
        status: 'pending',
        totalCents,
        depositCents,
      },
    });
  } catch (error) {
    console.error('Square Order Error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

function convertTo24Hr(time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return '12:00';
  let [, h, m, period] = match;
  let hour = parseInt(h);
  if (period?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (period?.toUpperCase() === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${m}`;
}

function toChicagoPickupAt(eventDate: string, eventTime: string): string {
  const offsetFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    timeZoneName: 'shortOffset',
  });
  const offsetPart = offsetFormatter
    .formatToParts(new Date(`${eventDate}T12:00:00Z`))
    .find((part) => part.type === 'timeZoneName')
    ?.value
    .replace('GMT', '') || '-06:00';

  const normalizedOffset = /^[-+]\d{1,2}$/.test(offsetPart)
    ? `${offsetPart}:00`
    : offsetPart;

  return `${eventDate}T${convertTo24Hr(eventTime)}:00${normalizedOffset}`;
}

function buildLineItems(booking: BookingRequest, catalog: CatalogData) {
  const pkg = catalog.packages.find((entry) => entry.id === booking.packageId) || catalog.packages[0];
  const sizes = booking.menuItemSizes || {};
  const items: any[] = [];

  if (pkg?.pricePerPersonCents) {
    items.push({
      name: pkg.name,
      quantity: '1',
      catalogObjectId: pkg.variationId || undefined,
      ...(!pkg.variationId && {
        basePriceMoney: { amount: BigInt(pkg.pricePerPersonCents), currency: 'USD' },
      }),
    });
  }

  for (const itemId of booking.menuItemIds || []) {
    const menuItem = catalog.menuItems?.find((entry) => entry.id === itemId);
    if (!menuItem) {
      throw new Error(`Selected menu item is unavailable: ${itemId}`);
    }

    const size = sizes[itemId] || 'small';
    const variationId = size === 'large'
      ? menuItem.largeVariationId || menuItem.smallVariationId
      : menuItem.smallVariationId;
    const priceCents = size === 'large' && menuItem.largePriceCents
      ? menuItem.largePriceCents
      : menuItem.priceCents;
    const sizeLabel = size === 'large' ? 'Large Pan' : 'Small Pan';

    items.push({
      name: `${menuItem.name} (${sizeLabel})`,
      quantity: '1',
      catalogObjectId: variationId || undefined,
      ...(!variationId && {
        basePriceMoney: { amount: BigInt(priceCents), currency: 'USD' },
      }),
    });
  }

  for (const addonId of booking.addonIds || []) {
    const addon = catalog.addons.find((entry) => entry.id === addonId);
    if (!addon) {
      throw new Error(`Selected add-on is unavailable: ${addonId}`);
    }

    items.push({
      name: addon.name,
      quantity: '1',
      catalogObjectId: addon.variationId || undefined,
      ...(!addon.variationId && {
        basePriceMoney: { amount: BigInt(addon.priceCents), currency: 'USD' },
      }),
    });
  }

  return items;
}
