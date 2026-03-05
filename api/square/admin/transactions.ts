import type { VercelRequest, VercelResponse } from '@vercel/node';
import { squareClient, LOCATION_ID } from '../../_lib/square';
import { requireAdmin } from '../../_lib/admin';
import { cors } from '../../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res)) return;

  try {
    const payments: any[] = [];
    for await (const p of await squareClient.payments.list({
      locationId: LOCATION_ID,
      sortField: 'CREATED_AT',
      sortOrder: 'DESC',
    })) {
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
