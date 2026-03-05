import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { squareClient } from '../_lib/square';
import { requireAdmin } from '../_lib/admin';
import { cors } from '../_lib/cors';
import { CATERING_PACKAGES, MENU_ADDONS, SIGNATURE_DISHES } from '../../src/data/constants';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const customAttrs = [
      { key: 'pp_min_guests', name: 'Min Guests', type: 'NUMBER' },
      { key: 'pp_includes', name: 'Includes', type: 'STRING' },
      { key: 'pp_pricing_type', name: 'Pricing Type', type: 'STRING' },
      { key: 'pp_icon', name: 'Icon', type: 'STRING' },
    ];

    for (const attr of customAttrs) {
      try {
        await squareClient.catalog.batchUpsert({
          idempotencyKey: randomUUID(),
          batches: [{ objects: [{ type: 'CUSTOM_ATTRIBUTE_DEFINITION', id: `#pp-attr-${attr.key}`, customAttributeDefinitionData: { type: attr.type as any, name: attr.name, key: attr.key, allowedObjectTypes: ['ITEM'], sellerVisibility: 'SELLER_VISIBILITY_READ_WRITE_VALUES' } }] }],
        });
      } catch {}
    }

    const objects: any[] = [];
    const categories = [
      { id: '#pp-cat-packages', name: 'Catering Packages' },
      { id: '#pp-cat-addons', name: 'Add-Ons' },
      { id: '#pp-cat-dishes', name: 'Signature Dishes' },
    ];
    for (const cat of categories) {
      objects.push({ type: 'CATEGORY', id: cat.id, categoryData: { name: cat.name } });
    }

    for (const pkg of CATERING_PACKAGES) {
      objects.push({
        type: 'ITEM', id: `#pp-${pkg.id}`,
        customAttributeValues: { pp_min_guests: { numberValue: String(pkg.minGuests) }, pp_includes: { stringValue: JSON.stringify(pkg.includes) }, pp_icon: { stringValue: pkg.icon } },
        itemData: { name: pkg.name, description: pkg.description, categories: [{ id: '#pp-cat-packages' }], variations: [{ type: 'ITEM_VARIATION', id: `#pp-${pkg.id}-var`, itemVariationData: { name: 'Per Person', pricingType: 'FIXED_PRICING', priceMoney: { amount: BigInt(pkg.pricePerPerson * 100), currency: 'USD' } } }] },
      });
    }

    for (const addon of MENU_ADDONS) {
      const pricingType = addon.per === 'person' ? 'per-person' : 'flat';
      objects.push({
        type: 'ITEM', id: `#pp-addon-${addon.id}`,
        customAttributeValues: { pp_pricing_type: { stringValue: pricingType } },
        itemData: { name: addon.name, description: `${addon.name} add-on`, categories: [{ id: '#pp-cat-addons' }], variations: [{ type: 'ITEM_VARIATION', id: `#pp-addon-${addon.id}-var`, itemVariationData: { name: 'Standard', pricingType: 'FIXED_PRICING', priceMoney: { amount: BigInt(addon.price * 100), currency: 'USD' } } }] },
      });
    }

    for (const dish of SIGNATURE_DISHES) {
      const slug = dish.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      objects.push({
        type: 'ITEM', id: `#pp-dish-${slug}`,
        itemData: { name: dish.name, description: dish.description, categories: [{ id: '#pp-cat-dishes' }], variations: [{ type: 'ITEM_VARIATION', id: `#pp-dish-${slug}-var`, itemVariationData: { name: 'Standard', pricingType: 'VARIABLE_PRICING' } }] },
      });
    }

    const result = await squareClient.catalog.batchUpsert({ idempotencyKey: randomUUID(), batches: [{ objects }] });
    res.json({ success: true, data: { objectsCreated: result.objects?.length ?? 0 } });
  } catch (error: any) {
    console.error('Square Seed Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
