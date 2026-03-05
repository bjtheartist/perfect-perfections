import type { VercelRequest, VercelResponse } from '@vercel/node';
import { squareClient } from '../../_lib/square';
import { requireAdmin } from '../../_lib/admin';
import { cors } from '../../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res)) return;

  try {
    const customers: any[] = [];
    for await (const c of await squareClient.customers.list({
      sortField: 'CREATED_AT',
      sortOrder: 'DESC',
    })) {
      customers.push(c);
      if (customers.length >= 20) break;
    }

    const data = customers.map((c: any) => ({
      id: c.id,
      displayName: `${c.givenName || ''} ${c.familyName || ''}`.trim() || 'Unknown',
      emailAddress: c.emailAddress,
      phoneNumber: c.phoneNumber,
      createdAt: c.createdAt || '',
    }));

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Admin Customers Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
