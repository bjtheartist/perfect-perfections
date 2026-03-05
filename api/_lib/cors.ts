import type { VercelRequest, VercelResponse } from '@vercel/node';

export function cors(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
