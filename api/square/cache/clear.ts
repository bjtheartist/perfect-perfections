import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../../_lib/admin';
import { cors } from '../../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;
  // Serverless functions don't have persistent memory — cache is inherently cleared per invocation
  res.json({ success: true, data: { cleared: true } });
}
