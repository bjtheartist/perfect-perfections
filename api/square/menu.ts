import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSquareClient, getCatalogData, getErrorMessage, handleCors, requireMethods } from '../_lib/square';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res, ['GET'])) return;
  if (!requireMethods(req, res, ['GET'])) return;

  try {
    const data = await getCatalogData(createSquareClient());
    res.json({ success: true, data });
  } catch (error) {
    console.error('Square Catalog Error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}
