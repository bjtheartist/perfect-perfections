import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { squareClient, LOCATION_ID } from '../_lib/square';
import { cors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sourceId, amountCents, orderId, customerEmail, note } = req.body;
  try {
    const result = await squareClient.payments.create({
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: { amount: BigInt(amountCents), currency: 'USD' },
      orderId,
      locationId: LOCATION_ID,
      note: note || 'Perfect Perfections Catering — Deposit',
      buyerEmailAddress: customerEmail,
    });

    const payment = result.payment;
    res.json({
      success: true,
      data: {
        paymentId: payment?.id || '',
        status: payment?.status || 'FAILED',
        receiptUrl: payment?.receiptUrl,
      },
    });
  } catch (error: any) {
    console.error('Square Payment Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
