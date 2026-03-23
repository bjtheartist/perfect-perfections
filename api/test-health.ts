import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SquareClient, SquareEnvironment } from 'square';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const token = process.env.SQUARE_ACCESS_TOKEN;
    const env = process.env.SQUARE_ENVIRONMENT;

    if (!token) {
      return res.json({ success: false, error: 'No SQUARE_ACCESS_TOKEN' });
    }

    const client = new SquareClient({
      token,
      environment: env === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    });

    const objects: any[] = [];
    for await (const obj of await (client.catalog.list({ types: 'CATEGORY' }) as any)) {
      objects.push(obj);
    }

    res.json({ success: true, categories: objects.length, env });
  } catch (error: any) {
    res.json({ success: false, error: error.message || String(error) });
  }
}
