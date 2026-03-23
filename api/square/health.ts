import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createSquareClient,
  getCatalogData,
  getErrorMessage,
  getSquareEnvironmentName,
  handleCors,
  requireMethods,
} from '../_lib/square.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res, ['GET'])) return;
  if (!requireMethods(req, res, ['GET'])) return;

  try {
    const catalog = await getCatalogData(createSquareClient());
    const catalogItems = catalog.packages.length
      + catalog.addons.length
      + catalog.dishes.length
      + (catalog.menuItems?.length || 0);

    res.json({
      success: true,
      data: {
        connected: true,
        environment: getSquareEnvironmentName(),
        catalogItems,
      },
    });
  } catch (error) {
    res.status(503).json({ success: false, error: getErrorMessage(error), data: { connected: false } });
  }
}
