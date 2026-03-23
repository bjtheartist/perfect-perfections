import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createIdempotencyKey,
  createSquareClient,
  findCustomerByEmail,
  getErrorMessage,
  getOrderTotalCents,
  getSquareLocationId,
  handleCors,
} from '../_lib/square.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res, ['GET', 'POST'])) return;

  if (req.method === 'GET') return getInvoice(req, res);
  if (req.method === 'POST') return createInvoice(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

async function getInvoice(req: VercelRequest, res: VercelResponse) {
  const { invoiceId } = req.query;
  if (!invoiceId) return res.status(400).json({ success: false, error: 'invoiceId query param required' });

  try {
    const result = await createSquareClient().invoices.get({ invoiceId: invoiceId as string });
    const invoice = result.invoice;
    res.json({ success: true, data: { invoiceId: invoice?.id, status: invoice?.status, publicUrl: invoice?.publicUrl } });
  } catch (error) {
    console.error('Square Invoice Status Error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

async function createInvoice(req: VercelRequest, res: VercelResponse) {
  const { orderId, customerEmail, depositCents, dueDate } = req.body || {};
  const normalizedOrderId = typeof orderId === 'string' ? orderId.trim() : '';
  const normalizedEmail = typeof customerEmail === 'string' ? customerEmail.trim().toLowerCase() : '';
  const normalizedDepositCents = Math.round(Number(depositCents) || 0);
  const normalizedDueDate = typeof dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)
    ? dueDate
    : undefined;

  if (!normalizedOrderId) {
    return res.status(400).json({ success: false, error: 'orderId is required' });
  }
  if (!normalizedEmail) {
    return res.status(400).json({ success: false, error: 'customerEmail is required' });
  }
  if (normalizedDepositCents <= 0) {
    return res.status(400).json({ success: false, error: 'depositCents must be greater than zero' });
  }

  const locationId = getSquareLocationId();
  const client = createSquareClient();

  try {
    const orderResult = await client.orders.get({ orderId: normalizedOrderId });
    const order = orderResult.order;
    const orderTotalCents = await getOrderTotalCents(client, normalizedOrderId);
    if (orderTotalCents <= 0) {
      return res.status(400).json({ success: false, error: 'Order total is invalid' });
    }
    if (normalizedDepositCents > orderTotalCents) {
      return res.status(400).json({ success: false, error: 'Deposit cannot exceed order total' });
    }

    let customerId = order?.customerId;
    if (!customerId) {
      customerId = await findCustomerByEmail(client, normalizedEmail);
    }
    if (!customerId) {
      return res.status(400).json({ success: false, error: `Customer not found for ${normalizedEmail}` });
    }

    const invoiceResult = await client.invoices.create({
      invoice: {
        locationId,
        orderId: normalizedOrderId,
        primaryRecipient: { customerId },
        paymentRequests: [
          {
            requestType: 'DEPOSIT',
            dueDate: normalizedDueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
            fixedAmountRequestedMoney: { amount: BigInt(normalizedDepositCents), currency: 'USD' },
          },
          {
            requestType: 'BALANCE',
            dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          },
        ],
        deliveryMethod: 'EMAIL',
        title: 'Perfect Perfections Catering — Event Deposit',
        description: 'Thank you for choosing Perfect Perfections! This invoice includes your 25% deposit and remaining balance.',
        acceptedPaymentMethods: { card: true, squareGiftCard: false, bankAccount: true },
      },
      idempotencyKey: createIdempotencyKey('invoice', {
        orderId: normalizedOrderId,
        customerId,
        depositCents: normalizedDepositCents,
      }),
    });

    const invoice = invoiceResult.invoice;
    let publicUrl = invoice?.publicUrl;
    let finalStatus = invoice?.status;

    if (invoice?.id && invoice?.version !== undefined) {
      const publishResult = await client.invoices.publish({
        invoiceId: invoice.id,
        version: invoice.version,
      });
      publicUrl = publishResult.invoice?.publicUrl || publicUrl;
      finalStatus = publishResult.invoice?.status || finalStatus;
    }

    res.json({ success: true, data: { invoiceId: invoice?.id, status: finalStatus, publicUrl } });
  } catch (error) {
    console.error('Square Invoice Error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}
