import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SquareClient, SquareEnvironment } from 'square';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  try {
    const client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment:
        process.env.SQUARE_ENVIRONMENT === 'production'
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
    });

    const items: any[] = [];
    for await (const obj of await client.catalog.list({ types: 'ITEM' }) as any) {
      items.push(obj);
    }

    res.json({
      success: true,
      data: {
        connected: true,
        environment: process.env.SQUARE_ENVIRONMENT,
        catalogItems: items.length,
      },
    });
  } catch (error: any) {
    res.json({ success: false, error: error.message, data: { connected: false } });
  }
}
