import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createIdempotencyKey,
  createSquareClient,
  getErrorMessage,
  getOrderTotalCents,
  getSquareLocationId,
  handleCors,
  requireMethods,
} from '../_lib/square';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res, ['POST'])) return;
  if (!requireMethods(req, res, ['POST'])) return;

  const { sourceId, amountCents, orderId, customerEmail, note } = req.body || {};
  const normalizedSourceId = typeof sourceId === 'string' ? sourceId.trim() : '';
  const normalizedOrderId = typeof orderId === 'string' ? orderId.trim() : '';
  const normalizedAmountCents = Math.round(Number(amountCents) || 0);
  const normalizedCustomerEmail = typeof customerEmail === 'string' ? customerEmail.trim().toLowerCase() : '';
  const normalizedNote = typeof note === 'string' ? note.trim() : '';

  if (!normalizedSourceId) {
    return res.status(400).json({ success: false, error: 'sourceId is required' });
  }
  if (!normalizedOrderId) {
    return res.status(400).json({ success: false, error: 'orderId is required' });
  }
  if (normalizedAmountCents <= 0) {
    return res.status(400).json({ success: false, error: 'amountCents must be greater than zero' });
  }

  try {
    const client = createSquareClient();
    const orderTotalCents = await getOrderTotalCents(client, normalizedOrderId);
    if (orderTotalCents <= 0) {
      return res.status(400).json({ success: false, error: 'Order total is invalid' });
    }
    if (normalizedAmountCents > orderTotalCents) {
      return res.status(400).json({ success: false, error: 'Payment amount cannot exceed order total' });
    }

    const result = await client.payments.create({
      sourceId: normalizedSourceId,
      idempotencyKey: createIdempotencyKey('payment', {
        orderId: normalizedOrderId,
        amountCents: normalizedAmountCents,
        sourceId: normalizedSourceId,
      }),
      amountMoney: { amount: BigInt(normalizedAmountCents), currency: 'USD' },
      orderId: normalizedOrderId,
      locationId: getSquareLocationId(),
      note: normalizedNote || 'Perfect Perfections Catering — Deposit',
      buyerEmailAddress: normalizedCustomerEmail || undefined,
      autocomplete: true,
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
  } catch (error) {
    console.error('Square Payment Error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}
