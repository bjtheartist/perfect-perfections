import type { VercelRequest, VercelResponse } from '@vercel/node';

export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    res.status(503).json({ success: false, error: 'Admin access not configured' });
    return false;
  }
  const token = req.headers['x-admin-token'];
  if (token === secret) return true;
  res.status(401).json({ success: false, error: 'Unauthorized' });
  return false;
}
