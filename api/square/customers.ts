import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSquareClient, getErrorMessage, handleCors, requireMethods, upsertCustomer } from '../_lib/square.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res, ['POST'])) return;
  if (!requireMethods(req, res, ['POST'])) return;

  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'name and email are required' });
  }

  try {
    const client = createSquareClient();
    const customerId = await upsertCustomer(client, {
      customerName: String(name).trim(),
      customerEmail: String(email).trim().toLowerCase(),
      customerPhone: typeof phone === 'string' ? phone.trim() : '',
    });
    const result = customerId ? await client.customers.get({ customerId }) : undefined;

    const customer = result?.customer;
    res.json({
      success: true,
      data: {
        id: customer?.id,
        name: `${customer?.givenName || ''} ${customer?.familyName || ''}`.trim(),
        email: customer?.emailAddress,
        phone: customer?.phoneNumber,
      },
    });
  } catch (error) {
    console.error('Square Customer Error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}
