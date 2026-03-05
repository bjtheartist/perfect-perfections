import type { VercelRequest, VercelResponse } from '@vercel/node';
import { squareClient } from '../_lib/square';
import { requireAdmin } from '../_lib/admin';
import { cors } from '../_lib/cors';

const VALID_STATUSES = ['new', 'contacted', 'booked', 'closed'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  const { id } = req.query;
  const { status } = req.body || {};

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    await squareClient.customerCustomAttributes.upsert({
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
