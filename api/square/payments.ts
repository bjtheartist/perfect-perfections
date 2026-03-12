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

  const { sourceId, amountCents, orderId, customerEmail, note } = req.body;
  const locationId = process.env.SQUARE_LOCATION_ID || '';

  try {
    const result = await getClient().payments.create({
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: { amount: BigInt(amountCents), currency: 'USD' },
      orderId,
      locationId,
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
