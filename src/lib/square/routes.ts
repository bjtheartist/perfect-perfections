/**
 * Square API Routes
 *
 * Express routes that proxy between our frontend and Square's APIs.
 * The frontend never talks to Square directly (except Web Payments SDK for tokenization).
 * All money amounts are in cents (USD smallest unit).
 *
 * Square SDK v43+ — uses squareClient.catalog.list(), squareClient.orders.create(), etc.
 * All create/update calls return response objects like { customer?, order?, payment?, invoice?, errors? }
 */
import { Router } from 'express';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { squareClient } from './client.js';
import { requireAdmin } from '../server/admin.js';
import type {
  BookingRequest,
  BookingResponse,
  PaymentRequest,
  PaymentResult,
  ApiResponse,
  Quote,
  CatalogData,
  CatalogPackage,
  CatalogAddon,
  CatalogDish,
  IconName,
  OrderSummary,
  TransactionSummary,
  CustomerSummary,
} from './types.js';
import { buildQuoteFromCatalog } from '../quote.js';
import {
  CATERING_PACKAGES,
  MENU_ADDONS,
  SIGNATURE_DISHES,
} from '../../data/constants.js';

const router = Router();
const LOCATION_ID = process.env.SQUARE_LOCATION_ID || '';

// ── Catalog Cache ──────────────────────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let catalogCache: CatalogData | null = null;

// ── Health Check ────────────────────────────────────────────
router.get('/square/health', async (_req: Request, res: Response) => {
  try {
    const items: any[] = [];
    for await (const obj of await squareClient.catalog.list({ types: 'ITEM' })) {
      items.push(obj);
    }
    res.json({
      success: true,
      data: {
        connected: true,
        environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
        catalogItems: items.length,
      },
    });
  } catch (error: any) {
    res.json({
      success: false,
      error: error.message || 'Failed to connect to Square',
      data: { connected: false },
    });
  }
});

// ── Seed Catalog ────────────────────────────────────────────
router.post('/square/seed', requireAdmin, async (_req: Request, res: Response) => {
  try {
    // 1. Ensure custom attribute definitions exist (one-at-a-time, skip if already created)
    const customAttrs = [
      { key: 'pp_min_guests', name: 'Min Guests', type: 'NUMBER' },
      { key: 'pp_includes', name: 'Includes', type: 'STRING' },
      { key: 'pp_pricing_type', name: 'Pricing Type', type: 'STRING' },
      { key: 'pp_icon', name: 'Icon', type: 'STRING' },
    ];

    for (const attr of customAttrs) {
      try {
        await squareClient.catalog.batchUpsert({
          idempotencyKey: randomUUID(),
          batches: [{
            objects: [{
              type: 'CUSTOM_ATTRIBUTE_DEFINITION',
              id: `#pp-attr-${attr.key}`,
              customAttributeDefinitionData: {
                type: attr.type as any,
                name: attr.name,
                key: attr.key,
                allowedObjectTypes: ['ITEM'],
                sellerVisibility: 'SELLER_VISIBILITY_READ_WRITE_VALUES',
              },
            }],
          }],
        });
      } catch {
        // Already exists — safe to ignore
      }
    }

    // 2. Build batch upsert objects (categories + items)
    const objects: any[] = [];

    // Categories
    const categories = [
      { id: '#pp-cat-packages', name: 'Catering Packages' },
      { id: '#pp-cat-addons', name: 'Add-Ons' },
      { id: '#pp-cat-dishes', name: 'Signature Dishes' },
    ];
    for (const cat of categories) {
      objects.push({
        type: 'CATEGORY',
        id: cat.id,
        categoryData: { name: cat.name },
      });
    }

    // Packages
    for (const pkg of CATERING_PACKAGES) {
      objects.push({
        type: 'ITEM',
        id: `#pp-${pkg.id}`,
        customAttributeValues: {
          pp_min_guests: { numberValue: String(pkg.minGuests) },
          pp_includes: { stringValue: JSON.stringify(pkg.includes) },
          pp_icon: { stringValue: pkg.icon },
        },
        itemData: {
          name: pkg.name,
          description: pkg.description,
          categories: [{ id: '#pp-cat-packages' }],
          variations: [
            {
              type: 'ITEM_VARIATION',
              id: `#pp-${pkg.id}-var`,
              itemVariationData: {
                name: 'Per Person',
                pricingType: 'FIXED_PRICING',
                priceMoney: {
                  amount: BigInt(pkg.pricePerPerson * 100),
                  currency: 'USD',
                },
              },
            },
          ],
        },
      });
    }

    // Add-ons
    for (const addon of MENU_ADDONS) {
      const pricingType = addon.per === 'person' ? 'per-person' : 'flat';
      objects.push({
        type: 'ITEM',
        id: `#pp-addon-${addon.id}`,
        customAttributeValues: {
          pp_pricing_type: { stringValue: pricingType },
        },
        itemData: {
          name: addon.name,
          description: `${addon.name} add-on`,
          categories: [{ id: '#pp-cat-addons' }],
          variations: [
            {
              type: 'ITEM_VARIATION',
              id: `#pp-addon-${addon.id}-var`,
              itemVariationData: {
                name: 'Standard',
                pricingType: 'FIXED_PRICING',
                priceMoney: {
                  amount: BigInt(addon.price * 100),
                  currency: 'USD',
                },
              },
            },
          ],
        },
      });
    }

    // Signature dishes
    for (const dish of SIGNATURE_DISHES) {
      const slug = dish.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      objects.push({
        type: 'ITEM',
        id: `#pp-dish-${slug}`,
        itemData: {
          name: dish.name,
          description: dish.description,
          categories: [{ id: '#pp-cat-dishes' }],
          variations: [
            {
              type: 'ITEM_VARIATION',
              id: `#pp-dish-${slug}-var`,
              itemVariationData: {
                name: 'Standard',
                pricingType: 'VARIABLE_PRICING',
              },
            },
          ],
        },
      });
    }

    // 3. Batch upsert
    const result = await squareClient.catalog.batchUpsert({
      idempotencyKey: randomUUID(),
      batches: [{ objects }],
    });

    // Clear cache so next menu fetch picks up new items
    catalogCache = null;

    res.json({
      success: true,
      data: {
        objectsCreated: result.objects?.length ?? 0,
        idMappings: result.idMappings?.map((m: any) => ({
          clientId: m.clientObjectId,
          serverId: m.objectId,
        })),
      },
    });
  } catch (error: any) {
    console.error('Square Seed Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Catalog / Menu (with cache) ─────────────────────────────
async function fetchCatalog(): Promise<CatalogData> {
  if (catalogCache && Date.now() - catalogCache.fetchedAt < CACHE_TTL_MS) {
    return catalogCache;
  }

  const allObjects: any[] = [];
  for await (const obj of await squareClient.catalog.list({ types: 'ITEM,CATEGORY,IMAGE' })) {
    allObjects.push(obj);
  }

  // Build category ID → name map
  const categoryMap = new Map<string, string>();
  for (const obj of allObjects) {
    if (obj.type === 'CATEGORY') {
      categoryMap.set(obj.id, obj.categoryData?.name || '');
    }
  }

  // Build image ID → URL map
  const imageMap = new Map<string, string>();
  for (const obj of allObjects) {
    if (obj.type === 'IMAGE') {
      imageMap.set(obj.id, obj.imageData?.url || '');
    }
  }

  const packages: CatalogPackage[] = [];
  const addons: CatalogAddon[] = [];
  const dishes: CatalogDish[] = [];

  for (const obj of allObjects) {
    if (obj.type !== 'ITEM') continue;

    const itemData = obj.itemData;
    if (!itemData) continue;

    // SDK v43+: categories is an array of { id } objects, not a single categoryId
    const catId = (itemData as any).categories?.[0]?.id || (itemData as any).categoryId || '';
    const categoryName = categoryMap.get(catId) || '';
    const variation = itemData.variations?.[0];
    const customAttrs = obj.customAttributeValues || {};

    // Resolve first image
    let imageUrl: string | undefined;
    if (itemData.imageIds?.length) {
      imageUrl = imageMap.get(itemData.imageIds[0]);
    }

    if (categoryName === 'Catering Packages') {
      const includesRaw = customAttrs.pp_includes?.stringValue;
      let includes: string[] = [];
      try { includes = JSON.parse(includesRaw || '[]'); } catch { /* keep empty */ }

      packages.push({
        id: obj.id,
        name: itemData.name || '',
        description: itemData.descriptionPlaintext || itemData.description || '',
        pricePerPersonCents: Number(variation?.itemVariationData?.priceMoney?.amount ?? 0),
        minGuests: Number(customAttrs.pp_min_guests?.numberValue ?? 1),
        icon: (customAttrs.pp_icon?.stringValue as IconName) || 'utensils',
        includes,
        variationId: variation?.id || '',
      });
    } else if (categoryName === 'Add-Ons') {
      addons.push({
        id: obj.id,
        name: itemData.name || '',
        priceCents: Number(variation?.itemVariationData?.priceMoney?.amount ?? 0),
        pricingType: (customAttrs.pp_pricing_type?.stringValue as 'per-person' | 'flat') || 'flat',
        variationId: variation?.id || '',
      });
    } else if (categoryName === 'Signature Dishes') {
      dishes.push({
        id: obj.id,
        name: itemData.name || '',
        description: itemData.descriptionPlaintext || itemData.description || '',
        imageUrl,
      });
    }
  }

  catalogCache = { packages, addons, dishes, fetchedAt: Date.now() };
  return catalogCache;
}

router.get('/square/menu', async (_req: Request, res: Response) => {
  try {
    const catalog = await fetchCatalog();
    res.json({ success: true, data: catalog } as ApiResponse<CatalogData>);
  } catch (error: any) {
    console.error('Square Catalog Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Clear Cache (dev) ───────────────────────────────────────
router.post('/square/cache/clear', requireAdmin, (_req: Request, res: Response) => {
  catalogCache = null;
  res.json({ success: true, data: { cleared: true } });
});

// ── Create Customer ─────────────────────────────────────────
router.post('/square/customers', async (req: Request, res: Response) => {
  const { name, email, phone } = req.body;
  try {
    const [givenName, ...rest] = (name || '').split(' ');
    const familyName = rest.join(' ');

    const result = await squareClient.customers.create({
      idempotencyKey: randomUUID(),
      givenName,
      familyName,
      emailAddress: email,
      phoneNumber: phone,
    });

    const customer = result.customer;
    res.json({
      success: true,
      data: {
        id: customer?.id,
        name: `${customer?.givenName || ''} ${customer?.familyName || ''}`.trim(),
        email: customer?.emailAddress,
        phone: customer?.phoneNumber,
      },
    });
  } catch (error: any) {
    console.error('Square Customer Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Create Order (Quote) ────────────────────────────────────
router.post('/square/orders', async (req: Request, res: Response) => {
  const booking: BookingRequest = req.body;

  try {
    // Find or create customer
    let customerId: string | undefined;
    try {
      const searchResult = await squareClient.customers.search({
        query: {
          filter: {
            emailAddress: { exact: booking.customerEmail },
          },
        },
      });
      customerId = searchResult.customers?.[0]?.id;
    } catch {
      // Customer doesn't exist yet
    }

    if (!customerId) {
      const [givenName, ...rest] = booking.customerName.split(' ');
      const createResult = await squareClient.customers.create({
        idempotencyKey: randomUUID(),
        givenName,
        familyName: rest.join(' '),
        emailAddress: booking.customerEmail,
        phoneNumber: booking.customerPhone,
      });
      customerId = createResult.customer?.id;
    }

    // Build line items from the booking (uses catalog)
    const lineItems = await buildLineItems(booking);

    const orderResult = await squareClient.orders.create({
      order: {
        locationId: LOCATION_ID,
        customerId,
        referenceId: `PP-${Date.now()}`,
        lineItems,
        taxes: [
          {
            name: 'Chicago Sales Tax',
            percentage: '10.25',
            scope: 'ORDER',
          },
        ],
        fulfillments: [
          {
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
          },
        ],
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

    const response: ApiResponse<BookingResponse> = {
      success: true,
      data: {
        bookingId: order?.id || '',
        orderId: order?.id || '',
        status: 'pending',
        totalCents,
        depositCents,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error('Square Order Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Create Invoice with Deposit ─────────────────────────────
router.post('/square/invoices', async (req: Request, res: Response) => {
  const { orderId, customerEmail, depositCents, dueDate } = req.body;

  try {
    // Look up customer by email for the invoice
    const searchResult = await squareClient.customers.search({
      query: {
        filter: {
          emailAddress: { exact: customerEmail },
        },
      },
    });
    const customerId = searchResult.customers?.[0]?.id;
    if (!customerId) {
      res.status(400).json({ success: false, error: 'Customer not found' });
      return;
    }

    const invoiceResult = await squareClient.invoices.create({
      invoice: {
        locationId: LOCATION_ID,
        orderId,
        primaryRecipient: { customerId },
        paymentRequests: [
          {
            requestType: 'DEPOSIT',
            dueDate: dueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
            fixedAmountRequestedMoney: {
              amount: BigInt(depositCents),
              currency: 'USD',
            },
          },
          {
            requestType: 'BALANCE',
            dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          },
        ],
        deliveryMethod: 'EMAIL',
        title: 'Perfect Perfections Catering — Event Deposit',
        description: 'Thank you for choosing Perfect Perfections! This invoice includes your 25% deposit and remaining balance.',
        acceptedPaymentMethods: {
          card: true,
          squareGiftCard: false,
          bankAccount: true,
        },
      },
      idempotencyKey: randomUUID(),
    });

    const invoice = invoiceResult.invoice;

    // Publish the invoice so Square sends it
    let publicUrl = invoice?.publicUrl;
    let finalStatus = invoice?.status;
    if (invoice?.id && invoice?.version !== undefined) {
      const publishResult = await squareClient.invoices.publish({
        invoiceId: invoice.id,
        version: invoice.version,
      });
      publicUrl = publishResult.invoice?.publicUrl || publicUrl;
      finalStatus = publishResult.invoice?.status || finalStatus;
    }

    res.json({
      success: true,
      data: {
        invoiceId: invoice?.id,
        status: finalStatus,
        publicUrl,
      },
    });
  } catch (error: any) {
    console.error('Square Invoice Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Get Invoice Status ──────────────────────────────────────
router.get('/square/invoices/:invoiceId', async (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  try {
    const result = await squareClient.invoices.get({ invoiceId });
    const invoice = result.invoice;
    res.json({
      success: true,
      data: {
        invoiceId: invoice?.id,
        status: invoice?.status,
        publicUrl: invoice?.publicUrl,
      },
    });
  } catch (error: any) {
    console.error('Square Invoice Status Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Process Payment (Deposit) ───────────────────────────────
router.post('/square/payments', async (req: Request, res: Response) => {
  const paymentReq: PaymentRequest = req.body;

  try {
    const result = await squareClient.payments.create({
      sourceId: paymentReq.sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(paymentReq.amountCents),
        currency: 'USD',
      },
      orderId: paymentReq.orderId,
      locationId: LOCATION_ID,
      note: paymentReq.note || 'Perfect Perfections Catering — Deposit',
      buyerEmailAddress: paymentReq.customerEmail,
    });

    const payment = result.payment;
    const response: ApiResponse<PaymentResult> = {
      success: true,
      data: {
        paymentId: payment?.id || '',
        status: (payment?.status || 'FAILED') as PaymentResult['status'],
        receiptUrl: payment?.receiptUrl,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error('Square Payment Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Get Quote Breakdown ─────────────────────────────────────
router.post('/square/quote', async (req: Request, res: Response) => {
  const booking: BookingRequest = req.body;

  try {
    const catalog = await fetchCatalog();
    const quote = buildQuoteFromCatalog(booking, catalog);
    res.json({ success: true, data: quote } as ApiResponse<Quote>);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Admin: Orders ───────────────────────────────────────────
router.get('/square/admin/orders', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const result = await squareClient.orders.search({
      locationIds: [LOCATION_ID],
      query: {
        sort: { sortField: 'CREATED_AT', sortOrder: 'DESC' },
      },
      limit: 20,
    });

    const orders = result.orders || [];

    // Batch-resolve customer names
    const customerIds = [...new Set(orders.map((o: any) => o.customerId).filter(Boolean))] as string[];
    const customerNameMap = new Map<string, string>();
    if (customerIds.length) {
      const results = await Promise.allSettled(
        customerIds.map(id => squareClient.customers.get({ customerId: id }))
      );
      for (let i = 0; i < customerIds.length; i++) {
        const r = results[i];
        if (r.status === 'fulfilled') {
          const c = r.value.customer;
          if (c) customerNameMap.set(customerIds[i], `${c.givenName || ''} ${c.familyName || ''}`.trim());
        }
      }
    }

    const data: OrderSummary[] = orders.map((o: any) => ({
      id: o.id,
      referenceId: o.referenceId || '',
      customerName:
        customerNameMap.get(o.customerId) ||
        o.fulfillments?.[0]?.pickupDetails?.recipient?.displayName ||
        'Unknown',
      state: o.state || 'OPEN',
      totalCents: Number(o.totalMoney?.amount ?? 0),
      eventType: o.metadata?.eventType,
      eventDate: o.metadata?.eventDate,
      guestCount: o.metadata?.guestCount ? Number(o.metadata.guestCount) : undefined,
      createdAt: o.createdAt || '',
    }));

    res.json({ success: true, data } as ApiResponse<OrderSummary[]>);
  } catch (error: any) {
    console.error('Admin Orders Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Admin: Transactions (Payments) ──────────────────────────
router.get('/square/admin/transactions', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const payments: any[] = [];
    for await (const p of await squareClient.payments.list({
      locationId: LOCATION_ID,
      sortOrder: 'DESC',
    })) {
      payments.push(p);
      if (payments.length >= 20) break;
    }

    const data: TransactionSummary[] = payments.map((p: any) => ({
      id: p.id,
      orderId: p.orderId,
      amountCents: Number(p.amountMoney?.amount ?? 0),
      status: p.status || 'UNKNOWN',
      cardBrand: p.cardDetails?.card?.cardBrand,
      last4: p.cardDetails?.card?.last4,
      receiptUrl: p.receiptUrl,
      createdAt: p.createdAt || '',
    }));

    res.json({ success: true, data } as ApiResponse<TransactionSummary[]>);
  } catch (error: any) {
    console.error('Admin Transactions Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Admin: Customers ────────────────────────────────────────
router.get('/square/admin/customers', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const customers: any[] = [];
    for await (const c of await squareClient.customers.list({
      sortField: 'CREATED_AT',
      sortOrder: 'DESC',
    })) {
      customers.push(c);
      if (customers.length >= 20) break;
    }

    const data: CustomerSummary[] = customers.map((c: any) => ({
      id: c.id,
      displayName: `${c.givenName || ''} ${c.familyName || ''}`.trim() || 'Unknown',
      emailAddress: c.emailAddress,
      phoneNumber: c.phoneNumber,
      createdAt: c.createdAt || '',
    }));

    res.json({ success: true, data } as ApiResponse<CustomerSummary[]>);
  } catch (error: any) {
    console.error('Admin Customers Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Helpers ─────────────────────────────────────────────────

/** Convert "6:00 PM" style time to "18:00" for Square */
function convertTo24Hr(time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return '12:00';
  let [, h, m, period] = match;
  let hour = parseInt(h);
  if (period?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (period?.toUpperCase() === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${m}`;
}

/** Build Square line items from a booking request using catalog data */
async function buildLineItems(booking: BookingRequest) {
  const catalog = await fetchCatalog();

  const pkg = catalog.packages.find(p => p.id === booking.packageId) || catalog.packages[0];
  const items: any[] = [];

  if (pkg) {
    items.push({
      name: `${pkg.name} (${booking.guestCount} guests)`,
      quantity: String(booking.guestCount),
      catalogObjectId: pkg.variationId || undefined,
      ...(!pkg.variationId && {
        basePriceMoney: {
          amount: BigInt(pkg.pricePerPersonCents),
          currency: 'USD',
        },
      }),
    });
  }

  for (const addonId of booking.addonIds) {
    const addon = catalog.addons.find(a => a.id === addonId);
    if (!addon) continue;
    items.push({
      name: addon.name,
      quantity: addon.pricingType === 'per-person' ? String(booking.guestCount) : '1',
      catalogObjectId: addon.variationId || undefined,
      ...(!addon.variationId && {
        basePriceMoney: {
          amount: BigInt(addon.priceCents),
          currency: 'USD',
        },
      }),
    });
  }

  return items;
}

export default router;
