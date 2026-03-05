import type { VercelRequest, VercelResponse } from '@vercel/node';
import { squareClient } from '../../_lib/square';
import { cors } from '../../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { invoiceId } = req.query;
  try {
    const result = await squareClient.invoices.get({ invoiceId: invoiceId as string });
    const invoice = result.invoice;
    res.json({ success: true, data: { invoiceId: invoice?.id, status: invoice?.status, publicUrl: invoice?.publicUrl } });
  } catch (error: any) {
    console.error('Square Invoice Status Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
