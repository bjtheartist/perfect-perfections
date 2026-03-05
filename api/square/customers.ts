import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { squareClient } from '../_lib/square';
import { cors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone } = req.body;
  try {
    const [givenName, ...rest] = (name || '').split(' ');
    const result = await squareClient.customers.create({
      idempotencyKey: randomUUID(),
      givenName,
      familyName: rest.join(' '),
      emailAddress: email,
      phoneNumber: phone,
    });

    const customer = result.customer;
    res.json({
      success: true,
      data: {
        id: customer?.id,
        name: `${customer?.givenName || ''} ${customer?.familyName || ''}`.trim(),
        email: customer?.emailAddress,
        phone: customer?.phoneNumber,
      },
    });
  } catch (error: any) {
    console.error('Square Customer Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
