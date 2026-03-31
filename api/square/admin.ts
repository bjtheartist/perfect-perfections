import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SquareClient, SquareEnvironment } from 'square';
import { setCorsOrigin } from '../_lib/square.js';

function getClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsOrigin(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-token');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return res.status(503).json({ success: false, error: 'Admin access not configured' });
  }
  if (req.headers['x-admin-token'] !== secret) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { resource } = req.query;
  const locationId = process.env.SQUARE_LOCATION_ID || '';

  switch (resource) {
    case 'orders': return handleOrders(res, locationId);
    case 'transactions': return handleTransactions(res, locationId);
    case 'customers': return handleCustomers(res);
    default: return res.status(400).json({ error: 'Invalid resource. Use ?resource=orders|transactions|customers' });
  }
}

async function handleOrders(res: VercelResponse, locationId: string) {
  try {
    const client = getClient();
    const result = await client.orders.search({
      locationIds: [locationId],
      query: { sort: { sortField: 'CREATED_AT', sortOrder: 'DESC' } },
      limit: 20,
    });

    const orders = result.orders || [];
    const customerIds = [...new Set(orders.map((o: any) => o.customerId).filter(Boolean))] as string[];
    const customerNameMap = new Map<string, string>();

    if (customerIds.length) {
      const results = await Promise.allSettled(
        customerIds.map(id => client.customers.get({ customerId: id }))
      );
      for (let i = 0; i < customerIds.length; i++) {
        const r = results[i];
        if (r.status === 'fulfilled') {
          const c = r.value.customer;
          if (c) customerNameMap.set(customerIds[i], `${c.givenName || ''} ${c.familyName || ''}`.trim());
        }
      }
    }

    const data = orders.map((o: any) => ({
      id: o.id,
      referenceId: o.referenceId || '',
      customerName: customerNameMap.get(o.customerId) || o.fulfillments?.[0]?.pickupDetails?.recipient?.displayName || 'Unknown',
      state: o.state || 'OPEN',
      totalCents: Number(o.totalMoney?.amount ?? 0),
      eventType: o.metadata?.eventType,
      eventDate: o.metadata?.eventDate,
      guestCount: o.metadata?.guestCount ? Number(o.metadata.guestCount) : undefined,
      createdAt: o.createdAt || '',
    }));

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Admin Orders Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleTransactions(res: VercelResponse, locationId: string) {
  try {
    const payments: any[] = [];
    for await (const p of await getClient().payments.list({
      locationId,
      sortField: 'CREATED_AT',
      sortOrder: 'DESC',
    }) as any) {
      payments.push(p);
      if (payments.length >= 20) break;
    }

    const data = payments.map((p: any) => ({
      id: p.id,
      orderId: p.orderId,
      amountCents: Number(p.amountMoney?.amount ?? 0),
      status: p.status || 'UNKNOWN',
      cardBrand: p.cardDetails?.card?.cardBrand,
      last4: p.cardDetails?.card?.last4,
      receiptUrl: p.receiptUrl,
      createdAt: p.createdAt || '',
    }));

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Admin Transactions Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleCustomers(res: VercelResponse) {
  try {
    const customers: any[] = [];
    for await (const c of await getClient().customers.list({
      sortField: 'CREATED_AT',
      sortOrder: 'DESC',
    }) as any) {
      customers.push(c);
      if (customers.length >= 20) break;
    }

    const data = customers.map((c: any) => ({
      id: c.id,
      displayName: `${c.givenName || ''} ${c.familyName || ''}`.trim() || 'Unknown',
      emailAddress: c.emailAddress,
      phoneNumber: c.phoneNumber,
      createdAt: c.createdAt || '',
    }));

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Admin Customers Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
