/**
 * Seed Square Catalog with full menu from constants.ts
 *
 * Creates categories and menu items with Small Pan / Large Pan variations.
 * Run: npx tsx scripts/seed-menu.ts
 */
import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';
import { FALLBACK_MENU_ITEMS } from '../src/data/constants';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox,
});

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').slice(0, 40);
}

async function seed() {
  // Get unique categories
  const categories = [...new Set(FALLBACK_MENU_ITEMS.map(item => item.category))];
  console.log(`Seeding ${FALLBACK_MENU_ITEMS.length} menu items across ${categories.length} categories...`);

  // Build category objects
  const categoryObjects = categories.map(cat => ({
    type: 'CATEGORY' as const,
    id: `#menu-cat-${slug(cat)}`,
    categoryData: { name: cat, categoryType: 'REGULAR_CATEGORY' as const },
  }));

  // Build menu item objects with Small Pan / Large Pan variations
  const itemObjects = FALLBACK_MENU_ITEMS.map(item => {
    const itemSlug = slug(item.name);
    const catSlug = slug(item.category);
    const hasTwoSizes = item.largePriceCents !== item.smallPriceCents;

    const variations: any[] = [
      {
        type: 'ITEM_VARIATION',
        id: `#menu-${itemSlug}-small`,
        itemVariationData: {
          name: 'Small Pan',
          pricingType: 'FIXED_PRICING',
          priceMoney: { amount: BigInt(item.smallPriceCents), currency: 'USD' },
        },
      },
    ];

    if (hasTwoSizes) {
      variations.push({
        type: 'ITEM_VARIATION',
        id: `#menu-${itemSlug}-large`,
        itemVariationData: {
          name: 'Large Pan',
          pricingType: 'FIXED_PRICING',
          priceMoney: { amount: BigInt(item.largePriceCents), currency: 'USD' },
        },
      });
    }

    return {
      type: 'ITEM' as const,
      id: `#menu-${itemSlug}`,
      itemData: {
        name: item.name,
        description: item.description || '',
        categories: [{ id: `#menu-cat-${catSlug}` }],
        variations,
      },
    };
  });

  // Square batchUpsert has a limit of 1000 objects per batch
  // and 10000 per request — we're well under that
  const allObjects = [...categoryObjects, ...itemObjects];

  console.log(`Total objects to upsert: ${allObjects.length}`);

  try {
    const result = await client.catalog.batchUpsert({
      idempotencyKey: randomUUID(),
      batches: [{ objects: allObjects }],
    });

    const created = result.objects?.length ?? 0;
    console.log(`✓ Successfully upserted ${created} catalog objects`);

    // Log mapping
    if (result.idMappings) {
      console.log(`\nID Mappings (${result.idMappings.length}):`);
      for (const mapping of result.idMappings.slice(0, 10)) {
        console.log(`  ${mapping.clientObjectId} → ${mapping.objectId}`);
      }
      if (result.idMappings.length > 10) {
        console.log(`  ... and ${result.idMappings.length - 10} more`);
      }
    }
  } catch (error: any) {
    console.error('Seed failed:', error.message || error);
    if (error.errors) {
      for (const err of error.errors) {
        console.error(`  - ${err.detail || err.code}`);
      }
    }
    process.exit(1);
  }
}

seed();
