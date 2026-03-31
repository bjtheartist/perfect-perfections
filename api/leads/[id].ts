import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SquareClient, SquareEnvironment } from 'square';
import { setCorsOrigin } from '../_lib/square.js';

function getClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  });
}

const VALID_STATUSES = ['new', 'contacted', 'booked', 'closed'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsOrigin(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-token');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return res.status(503).json({ success: false, error: 'Admin access not configured' });
  }
  if (req.headers['x-admin-token'] !== secret) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { id } = req.query;
  const { status } = req.body || {};

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    await (getClient() as any).customerCustomAttributes.upsert({
      customerId: id as string,
      key: 'pp_lead_status',
      customAttribute: { value: status },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Update Lead Error:', error);
    res.status(500).json({ error: error.message || 'Failed to update lead' });
  }
}
