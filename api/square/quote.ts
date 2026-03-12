import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SquareClient, SquareEnvironment } from 'square';

const TAX_RATE = 0.1025;
const DEPOSIT_RATE = 0.25;

function getClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const booking = req.body;
  try {
    const catalog = await fetchCatalog();
    const guestCount = Math.max(0, Math.round(booking.guestCount || 0));
    const pkg = catalog.packages.find((p: any) => p.id === booking.packageId) || catalog.packages[0];

    const lineItems: any[] = [];
    if (pkg) {
      lineItems.push({
        name: `${pkg.name} (${guestCount} guests)`,
        quantity: guestCount,
        unitPriceCents: pkg.pricePerPersonCents,
        totalCents: pkg.pricePerPersonCents * guestCount,
      });
    }

    for (const addonId of booking.addonIds || []) {
      const addon = catalog.addons.find((a: any) => a.id === addonId);
      if (!addon) continue;
      const qty = addon.pricingType === 'per-person' ? guestCount : 1;
      lineItems.push({
        name: addon.name,
        quantity: qty,
        unitPriceCents: addon.priceCents,
        totalCents: addon.priceCents * qty,
      });
    }

    const subtotalCents = lineItems.reduce((sum: number, item: any) => sum + item.totalCents, 0);
    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const totalCents = subtotalCents + taxCents;
    const depositCents = Math.round(totalCents * DEPOSIT_RATE);

    res.json({
      success: true,
      data: {
        lineItems,
        subtotalCents,
        taxCents,
        totalCents,
        depositCents,
        depositDueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        balanceDueDate: booking.eventDate,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function fetchCatalog() {
  const allObjects: any[] = [];
  for await (const obj of await getClient().catalog.list({ types: 'ITEM,CATEGORY' }) as any) {
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
    const catId = itemData.categories?.[0]?.id || '';
    const categoryName = categoryMap.get(catId) || '';
    const variation = itemData.variations?.[0];
    const customAttrs = obj.customAttributeValues || {};

    if (categoryName === 'Catering Packages') {
      packages.push({
        id: obj.id, name: itemData.name || '', pricePerPersonCents: Number(variation?.itemVariationData?.priceMoney?.amount ?? 0),
      });
    } else if (categoryName === 'Add-Ons') {
      addons.push({
        id: obj.id, name: itemData.name || '', priceCents: Number(variation?.itemVariationData?.priceMoney?.amount ?? 0),
        pricingType: customAttrs.pp_pricing_type?.stringValue || 'flat',
      });
    }
  }

  return { packages, addons };
}
