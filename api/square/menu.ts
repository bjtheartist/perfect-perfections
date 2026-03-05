import type { VercelRequest, VercelResponse } from '@vercel/node';
import { squareClient } from '../_lib/square';
import { cors } from '../_lib/cors';
import type { CatalogData, CatalogPackage, CatalogAddon, CatalogDish, IconName } from '../../src/lib/square/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  try {
    const catalog = await fetchCatalog();
    res.json({ success: true, data: catalog });
  } catch (error: any) {
    console.error('Square Catalog Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function fetchCatalog(): Promise<CatalogData> {
  const allObjects: any[] = [];
  for await (const obj of await squareClient.catalog.list({ types: 'ITEM,CATEGORY,IMAGE' })) {
    allObjects.push(obj);
  }

  const categoryMap = new Map<string, string>();
  const imageMap = new Map<string, string>();
  for (const obj of allObjects) {
    if (obj.type === 'CATEGORY') categoryMap.set(obj.id, obj.categoryData?.name || '');
    if (obj.type === 'IMAGE') imageMap.set(obj.id, obj.imageData?.url || '');
  }

  const packages: CatalogPackage[] = [];
  const addons: CatalogAddon[] = [];
  const dishes: CatalogDish[] = [];

  for (const obj of allObjects) {
    if (obj.type !== 'ITEM') continue;
    const itemData = obj.itemData;
    if (!itemData) continue;

    const catId = (itemData as any).categories?.[0]?.id || (itemData as any).categoryId || '';
    const categoryName = categoryMap.get(catId) || '';
    const variation = itemData.variations?.[0];
    const customAttrs = obj.customAttributeValues || {};

    let imageUrl: string | undefined;
    if (itemData.imageIds?.length) imageUrl = imageMap.get(itemData.imageIds[0]);

    if (categoryName === 'Catering Packages') {
      let includes: string[] = [];
      try { includes = JSON.parse(customAttrs.pp_includes?.stringValue || '[]'); } catch {}
      packages.push({
        id: obj.id,
        name: itemData.name || '',
        description: itemData.descriptionPlaintext || itemData.description || '',
        pricePerPersonCents: Number(variation?.itemVariationData?.priceMoney?.amount ?? 0),
        minGuests: Number(customAttrs.pp_min_guests?.numberValue ?? 1),
        icon: (customAttrs.pp_icon?.stringValue as IconName) || 'utensils',
        includes,
        variationId: variation?.id || '',
      });
    } else if (categoryName === 'Add-Ons') {
      addons.push({
        id: obj.id,
        name: itemData.name || '',
        priceCents: Number(variation?.itemVariationData?.priceMoney?.amount ?? 0),
        pricingType: (customAttrs.pp_pricing_type?.stringValue as 'per-person' | 'flat') || 'flat',
        variationId: variation?.id || '',
      });
    } else if (categoryName === 'Signature Dishes') {
      dishes.push({
        id: obj.id,
        name: itemData.name || '',
        description: itemData.descriptionPlaintext || itemData.description || '',
        imageUrl,
      });
    }
  }

  return { packages, addons, dishes, fetchedAt: Date.now() };
}
