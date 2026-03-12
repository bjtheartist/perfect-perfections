import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { SquareClient, SquareEnvironment } from 'square';

function getClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const booking = req.body;
  const locationId = process.env.SQUARE_LOCATION_ID || '';

  try {
    const client = getClient();

    // Find or create customer
    let customerId: string | undefined;
    try {
      const searchResult = await client.customers.search({
        query: { filter: { emailAddress: { exact: booking.customerEmail } } },
      });
      customerId = searchResult.customers?.[0]?.id;
    } catch {}

    if (!customerId) {
      const [givenName, ...rest] = booking.customerName.split(' ');
      const createResult = await client.customers.create({
        idempotencyKey: randomUUID(),
        givenName,
        familyName: rest.join(' '),
        emailAddress: booking.customerEmail,
        phoneNumber: booking.customerPhone,
      });
      customerId = createResult.customer?.id;
    }

    const lineItems = await buildLineItems(booking);

    const orderResult = await client.orders.create({
      order: {
        locationId,
        customerId,
        referenceId: `PP-${Date.now()}`,
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
            pickupAt: `${booking.eventDate}T${convertTo24Hr(booking.eventTime)}:00Z`,
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
      idempotencyKey: randomUUID(),
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
  } catch (error: any) {
    console.error('Square Order Error:', error);
    res.status(500).json({ success: false, error: error.message });
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

async function buildLineItems(booking: any) {
  const allObjects: any[] = [];
  for await (const obj of await getClient().catalog.list({ types: 'ITEM,CATEGORY' }) as any) {
    allObjects.push(obj);
  }

  const categoryMap = new Map<string, string>();
  for (const obj of allObjects) {
    if (obj.type === 'CATEGORY') categoryMap.set(obj.id, obj.categoryData?.name || '');
  }

  let pkg: any = null;
  const addonMap = new Map<string, any>();

  for (const obj of allObjects) {
    if (obj.type !== 'ITEM') continue;
    const catId = obj.itemData?.categories?.[0]?.id || '';
    const categoryName = categoryMap.get(catId) || '';
    const variation = obj.itemData?.variations?.[0];
    const customAttrs = obj.customAttributeValues || {};

    if (categoryName === 'Catering Packages' && obj.id === booking.packageId) {
      pkg = { variationId: variation?.id, pricePerPersonCents: Number(variation?.itemVariationData?.priceMoney?.amount ?? 0), name: obj.itemData?.name };
    } else if (categoryName === 'Catering Packages' && !pkg) {
      pkg = { variationId: variation?.id, pricePerPersonCents: Number(variation?.itemVariationData?.priceMoney?.amount ?? 0), name: obj.itemData?.name };
    }
    if (categoryName === 'Add-Ons') {
      addonMap.set(obj.id, {
        variationId: variation?.id,
        priceCents: Number(variation?.itemVariationData?.priceMoney?.amount ?? 0),
        pricingType: customAttrs.pp_pricing_type?.stringValue || 'flat',
        name: obj.itemData?.name,
      });
    }
  }

  const items: any[] = [];
  if (pkg) {
    items.push({
      name: `${pkg.name} (${booking.guestCount} guests)`,
      quantity: String(booking.guestCount),
      catalogObjectId: pkg.variationId || undefined,
      ...(!pkg.variationId && { basePriceMoney: { amount: BigInt(pkg.pricePerPersonCents), currency: 'USD' } }),
    });
  }

  for (const addonId of booking.addonIds || []) {
    const addon = addonMap.get(addonId);
    if (!addon) continue;
    items.push({
      name: addon.name,
      quantity: addon.pricingType === 'per-person' ? String(booking.guestCount) : '1',
      catalogObjectId: addon.variationId || undefined,
      ...(!addon.variationId && { basePriceMoney: { amount: BigInt(addon.priceCents), currency: 'USD' } }),
    });
  }

  return items;
}
