import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SquareClient, SquareEnvironment } from 'square';

function getClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment:
      process.env.SQUARE_ENVIRONMENT === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  try {
    const client = getClient();
    const allObjects: any[] = [];
    for await (const obj of await client.catalog.list({ types: 'ITEM,CATEGORY,IMAGE' }) as any) {
      allObjects.push(obj);
    }

    const categoryMap = new Map<string, string>();
    const imageMap = new Map<string, string>();
    for (const obj of allObjects) {
      if (obj.type === 'CATEGORY') categoryMap.set(obj.id, obj.categoryData?.name || '');
      if (obj.type === 'IMAGE') imageMap.set(obj.id, obj.imageData?.url || '');
    }

    const packages: any[] = [];
    const addons: any[] = [];
    const dishes: any[] = [];

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
          icon: customAttrs.pp_icon?.stringValue || 'utensils',
          includes,
          variationId: variation?.id || '',
        });
      } else if (categoryName === 'Add-Ons') {
        addons.push({
          id: obj.id,
          name: itemData.name || '',
          priceCents: Number(variation?.itemVariationData?.priceMoney?.amount ?? 0),
          pricingType: customAttrs.pp_pricing_type?.stringValue || 'flat',
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

    // Collect all real menu items (not in our catering/addon/dish categories)
    const cateringCategories = new Set(['Catering Packages', 'Add-Ons', 'Signature Dishes']);
    const menuItems: any[] = [];
    for (const obj of allObjects) {
      if (obj.type !== 'ITEM') continue;
      const itemData = obj.itemData;
      if (!itemData) continue;
      const catId = (itemData as any).categories?.[0]?.id || '';
      const categoryName = categoryMap.get(catId) || '';
      if (cateringCategories.has(categoryName)) continue;
      if (obj.customAttributeValues) continue; // skip our seeded items

      const variations = itemData.variations || [];

      // Support two variations: Small Pan and Large Pan
      let priceCents = 0;
      let largePriceCents: number | undefined;

      if (variations.length >= 2) {
        // Look for named variations (Small Pan / Large Pan)
        const smallVar = variations.find((v: any) => /small|half/i.test(v.itemVariationData?.name || ''));
        const largeVar = variations.find((v: any) => /large|full/i.test(v.itemVariationData?.name || ''));
        if (smallVar && largeVar) {
          priceCents = Number(smallVar.itemVariationData?.priceMoney?.amount ?? 0);
          largePriceCents = Number(largeVar.itemVariationData?.priceMoney?.amount ?? 0);
        } else {
          // Fallback: first = small, second = large
          priceCents = Number(variations[0].itemVariationData?.priceMoney?.amount ?? 0);
          largePriceCents = Number(variations[1].itemVariationData?.priceMoney?.amount ?? 0);
        }
      } else if (variations.length === 1) {
        priceCents = Number(variations[0].itemVariationData?.priceMoney?.amount ?? 0);
      }

      if (priceCents <= 0) continue;

      let imageUrl: string | undefined;
      if (itemData.imageIds?.length) imageUrl = imageMap.get(itemData.imageIds[0]);

      menuItems.push({
        id: obj.id,
        name: (itemData.name || '').trim(),
        description: (itemData.descriptionPlaintext || itemData.description || '').trim(),
        priceCents,
        largePriceCents,
        category: categoryName || 'Menu',
        imageUrl,
      });
    }

    res.json({ success: true, data: { packages, addons, dishes, menuItems, fetchedAt: Date.now() } });
  } catch (error: any) {
    console.error('Square Catalog Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
