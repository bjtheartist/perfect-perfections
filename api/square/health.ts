import type { VercelRequest, VercelResponse } from '@vercel/node';
import { squareClient } from '../_lib/square';
import { cors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  try {
    const items: any[] = [];
    for await (const obj of await squareClient.catalog.list({ types: 'ITEM' })) {
      items.push(obj);
    }
    res.json({ success: true, data: { connected: true, environment: process.env.SQUARE_ENVIRONMENT || 'sandbox', catalogItems: items.length } });
  } catch (error: any) {
    res.json({ success: false, error: error.message, data: { connected: false } });
  }
}
