import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { squareClient, LOCATION_ID } from '../_lib/square';
import { cors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orderId, customerEmail, depositCents, dueDate } = req.body;
  try {
    const searchResult = await squareClient.customers.search({
      query: { filter: { emailAddress: { exact: customerEmail } } },
    });
    const customerId = searchResult.customers?.[0]?.id;
    if (!customerId) return res.status(400).json({ success: false, error: 'Customer not found' });

    const invoiceResult = await squareClient.invoices.create({
      invoice: {
        locationId: LOCATION_ID,
        orderId,
        primaryRecipient: { customerId },
        paymentRequests: [
          {
            requestType: 'DEPOSIT',
            dueDate: dueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
            fixedAmountRequestedMoney: { amount: BigInt(depositCents), currency: 'USD' },
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
      idempotencyKey: randomUUID(),
    });

    const invoice = invoiceResult.invoice;
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

    res.json({ success: true, data: { invoiceId: invoice?.id, status: finalStatus, publicUrl } });
  } catch (error: any) {
    console.error('Square Invoice Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
