import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
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

const PACKAGES = [
  { id: 'drop-off', name: 'Drop-Off Service', description: 'Fresh platters and trays delivered to your venue, ready to serve.', priceCents: 3500, minGuests: 1, icon: 'truck', includes: ['Freshly prepared food', 'Delivery to your venue'] },
  { id: 'full-service-setup', name: 'Full Service w/ Setup', description: 'Everything you need for a seamless event — racks, burners, plates, napkins, and cutlery included.', priceCents: 27500, minGuests: 1, icon: 'utensils', includes: ['Racks & burners', 'Plates, napkins & cutlery', 'Full setup'] },
  { id: 'full-service-2-servers', name: 'Full Service w/ 2 Servers', description: 'Complete catering with two professional servers for setup, buffet maintenance, and breakdown.', priceCents: 37500, minGuests: 1, icon: 'utensils', includes: ['Racks & burners', 'Plates, napkins & cutlery', 'Setup & breakdown', 'Buffet maintenance', '2 professional servers'] },
  { id: 'full-service-3-servers', name: 'Full Service w/ 3 Servers', description: 'Our premium package with three servers for larger events — setup, buffet maintenance, and full breakdown.', priceCents: 47500, minGuests: 1, icon: 'utensils', includes: ['Racks & burners', 'Plates, napkins & cutlery', 'Setup & breakdown', 'Buffet maintenance', '3 professional servers'] },
];

const ADDONS = [
  { id: 'dessert-table', name: 'Dessert Table', priceCents: 15000, pricing: 'flat' },
  { id: 'beverage', name: 'Beverage Service', priceCents: 800, pricing: 'per-person' },
  { id: 'extra-protein', name: 'Extra Protein Option', priceCents: 500, pricing: 'per-person' },
  { id: 'decor', name: 'Setup & Basic Décor', priceCents: 20000, pricing: 'flat' },
  { id: 'servers', name: 'Additional Servers (2hr)', priceCents: 12000, pricing: 'flat' },
];

const DISHES = [
  { name: 'Shrimp & Grits', description: 'Creamy, buttery grits topped with seasoned shrimp and crispy bacon crumbles.' },
  { name: 'Bacon-Wrapped Stuffed Chicken', description: 'Tender chicken breast stuffed with spinach and cheese, wrapped in smoky bacon, served with sautéed mushrooms.' },
  { name: 'Signature Soul Rolls', description: 'Our famous crispy rolls filled with soul food favorites, served with a creamy dipping sauce.' },
  { name: 'Southern Pecan Pie', description: 'A rich, flaky crust filled with sweet, toasted pecans, served alongside chocolate-dipped strawberries.' },
  { name: 'Gourmet Dipped Treats', description: 'Decadent chocolate-covered cookies finished with gold dust and festive drizzles.' },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-token');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.ADMIN_SECRET;
  if (secret && req.headers['x-admin-token'] !== secret) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const client = getClient();

    // Create custom attribute definitions one by one
    const attrs = [
      { key: 'pp_min_guests', name: 'Min Guests', type: 'NUMBER' },
      { key: 'pp_includes', name: 'Includes', type: 'STRING' },
      { key: 'pp_pricing_type', name: 'Pricing Type', type: 'STRING' },
      { key: 'pp_icon', name: 'Icon', type: 'STRING' },
    ];
    for (const attr of attrs) {
      try {
        await client.catalog.batchUpsert({
          idempotencyKey: randomUUID(),
          batches: [{ objects: [{ type: 'CUSTOM_ATTRIBUTE_DEFINITION', id: `#pp-attr-${attr.key}`, customAttributeDefinitionData: { type: attr.type as any, name: attr.name, key: attr.key, allowedObjectTypes: ['ITEM'], sellerVisibility: 'SELLER_VISIBILITY_READ_WRITE_VALUES' } }] }],
        });
      } catch {}
    }

    // Build all catalog objects
    const objects: any[] = [];

    // Categories
    objects.push({ type: 'CATEGORY', id: '#pp-cat-packages', categoryData: { name: 'Catering Packages' } });
    objects.push({ type: 'CATEGORY', id: '#pp-cat-addons', categoryData: { name: 'Add-Ons' } });
    objects.push({ type: 'CATEGORY', id: '#pp-cat-dishes', categoryData: { name: 'Signature Dishes' } });

    // Packages
    for (const pkg of PACKAGES) {
      objects.push({
        type: 'ITEM', id: `#pp-${pkg.id}`,
        customAttributeValues: {
          pp_min_guests: { numberValue: String(pkg.minGuests) },
          pp_includes: { stringValue: JSON.stringify(pkg.includes) },
          pp_icon: { stringValue: pkg.icon },
        },
        itemData: {
          name: pkg.name, description: pkg.description,
          categories: [{ id: '#pp-cat-packages' }],
          variations: [{ type: 'ITEM_VARIATION', id: `#pp-${pkg.id}-var`, itemVariationData: { name: 'Per Person', pricingType: 'FIXED_PRICING', priceMoney: { amount: BigInt(pkg.priceCents), currency: 'USD' } } }],
        },
      });
    }

    // Add-ons
    for (const addon of ADDONS) {
      objects.push({
        type: 'ITEM', id: `#pp-addon-${addon.id}`,
        customAttributeValues: { pp_pricing_type: { stringValue: addon.pricing } },
        itemData: {
          name: addon.name, description: `${addon.name} add-on`,
          categories: [{ id: '#pp-cat-addons' }],
          variations: [{ type: 'ITEM_VARIATION', id: `#pp-addon-${addon.id}-var`, itemVariationData: { name: 'Standard', pricingType: 'FIXED_PRICING', priceMoney: { amount: BigInt(addon.priceCents), currency: 'USD' } } }],
        },
      });
    }

    // Dishes
    for (const dish of DISHES) {
      const slug = dish.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      objects.push({
        type: 'ITEM', id: `#pp-dish-${slug}`,
        itemData: {
          name: dish.name, description: dish.description,
          categories: [{ id: '#pp-cat-dishes' }],
          variations: [{ type: 'ITEM_VARIATION', id: `#pp-dish-${slug}-var`, itemVariationData: { name: 'Standard', pricingType: 'VARIABLE_PRICING' } }],
        },
      });
    }

    const result = await client.catalog.batchUpsert({ idempotencyKey: randomUUID(), batches: [{ objects }] });
    res.json({ success: true, data: { objectsCreated: result.objects?.length ?? 0 } });
  } catch (error: any) {
    console.error('Square Seed Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
