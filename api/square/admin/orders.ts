import type { VercelRequest, VercelResponse } from '@vercel/node';
import { squareClient, LOCATION_ID } from '../../_lib/square';
import { requireAdmin } from '../../_lib/admin';
import { cors } from '../../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res)) return;

  try {
    const result = await squareClient.orders.search({
      locationIds: [LOCATION_ID],
      query: { sort: { sortField: 'CREATED_AT', sortOrder: 'DESC' } },
      limit: 20,
    });

    const orders = result.orders || [];
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
