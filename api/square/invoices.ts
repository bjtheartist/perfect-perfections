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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') return getInvoice(req, res);
  if (req.method === 'POST') return createInvoice(req, res);
  return res.status(405).json({ error: 'Method not allowed' });
}

async function getInvoice(req: VercelRequest, res: VercelResponse) {
  const { invoiceId } = req.query;
  if (!invoiceId) return res.status(400).json({ error: 'invoiceId query param required' });

  try {
    const result = await getClient().invoices.get({ invoiceId: invoiceId as string });
    const invoice = result.invoice;
    res.json({ success: true, data: { invoiceId: invoice?.id, status: invoice?.status, publicUrl: invoice?.publicUrl } });
  } catch (error: any) {
    console.error('Square Invoice Status Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function createInvoice(req: VercelRequest, res: VercelResponse) {
  const { orderId, customerEmail, depositCents, dueDate } = req.body;
  const locationId = process.env.SQUARE_LOCATION_ID || '';
  const client = getClient();

  try {
    let customerId: string | undefined;
    try {
      const searchResult = await client.customers.search({
        query: { filter: { emailAddress: { exact: customerEmail } } },
      });
      customerId = searchResult.customers?.[0]?.id;
    } catch (searchErr: any) {
      console.error('Customer search error:', searchErr);
    }
    if (!customerId) return res.status(400).json({ success: false, error: `Customer not found for ${customerEmail}` });

    const invoiceResult = await client.invoices.create({
      invoice: {
        locationId,
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
      const publishResult = await client.invoices.publish({
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
