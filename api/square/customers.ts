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

  const { name, email, phone } = req.body;
  try {
    const [givenName, ...rest] = (name || '').split(' ');
    const result = await getClient().customers.create({
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
