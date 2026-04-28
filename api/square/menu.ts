import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSquareClient, getCatalogData, getErrorMessage, handleCors, requireMethods } from '../_lib/square.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res, ['GET'])) return;
  if (!requireMethods(req, res, ['GET'])) return;

  try {
    const data = await getCatalogData(createSquareClient());
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json({ success: true, data });
  } catch (error) {
    console.error('Square Catalog Error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}
