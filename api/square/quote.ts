import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../_lib/cors';
import { buildQuoteFromCatalog } from '../../src/lib/quote';
import type { BookingRequest, CatalogData } from '../../src/lib/square/types';
import { squareClient } from '../_lib/square';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const booking: BookingRequest = req.body;
  try {
    const catalog = await fetchCatalogLight();
    const quote = buildQuoteFromCatalog(booking, catalog);
    res.json({ success: true, data: quote });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function fetchCatalogLight(): Promise<CatalogData> {
  // Inline light fetch — reuses same logic as menu.ts
  const { default: menuHandler } = await import('./menu');
  // We need the catalog data directly, so we'll duplicate the fetch logic
  const allObjects: any[] = [];
  for await (const obj of await squareClient.catalog.list({ types: 'ITEM,CATEGORY' })) {
    allObjects.push(obj);
  }

  const categoryMap = new Map<string, string>();
  for (const obj of allObjects) {
    if (obj.type === 'CATEGORY') categoryMap.set(obj.id, obj.categoryData?.name || '');
  }

  const packages: any[] = [];
  const addons: any[] = [];

  for (const obj of allObjects) {
    if (obj.type !== 'ITEM') continue;
    const itemData = obj.itemData;
    if (!itemData) continue;
    const catId = (itemData as any).categories?.[0]?.id || '';
    const categoryName = categoryMap.get(catId) || '';
    const variation = itemData.variations?.[0];
    const customAttrs = obj.customAttributeValues || {};

    if (categoryName === 'Catering Packages') {
      let includes: string[] = [];
      try { includes = JSON.parse(customAttrs.pp_includes?.stringValue || '[]'); } catch {}
      packages.push({
        id: obj.id, name: itemData.name || '', description: '', variationId: variation?.id || '',
        pricePerPersonCents: Number(variation?.itemVariationData?.priceMoney?.amount ?? 0),
        minGuests: Number(customAttrs.pp_min_guests?.numberValue ?? 1),
        icon: customAttrs.pp_icon?.stringValue || 'utensils', includes,
      });
    } else if (categoryName === 'Add-Ons') {
      addons.push({
        id: obj.id, name: itemData.name || '', variationId: variation?.id || '',
        priceCents: Number(variation?.itemVariationData?.priceMoney?.amount ?? 0),
        pricingType: customAttrs.pp_pricing_type?.stringValue || 'flat',
      });
    }
  }

  return { packages, addons, dishes: [], fetchedAt: Date.now() };
}
