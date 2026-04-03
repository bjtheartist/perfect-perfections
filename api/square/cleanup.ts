import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { setCorsOrigin, createSquareClient, getCatalogData } from '../_lib/square.js';

/**
 * POST /api/square/cleanup
 *
 * Removes duplicate catalog items and merges small/large single-price items
 * into proper items with two variations (Small Pan / Large Pan).
 * Also assigns categories to uncategorized "Menu" items.
 *
 * Requires x-admin-token header.
 * Pass ?dry=true to preview changes without executing.
 */

// Category assignments for uncategorized items
const CATEGORY_RULES: Record<string, string> = {
  // Entrées
  'Baked Chicken': 'Entrées',
  'Braised Beef Chuck Roast': 'Entrées',
  'Braised Beef Short Ribs': 'Entrées',
  'Chicken (Fried, Jerk, Rosemary, Greek, Teriyaki or Garlic & Herbs)': 'Entrées',
  'Chicken Pasta (Cajun, Jerk or Garlic & herbs)': 'Entrées',
  'Creamy Seafood Stuffed Salmon': 'Entrées',
  'Creamy Spinach Stuffed Salmon': 'Entrées',
  'Jerk Chicken Alfredo': 'Entrées',
  'Lamb Chops (Jerk, Greek, Garlic & Herbs)': 'Entrées',
  'Lasagna W/Turkey Italian Sausage': 'Entrées',
  'Mostaccioli w/Turkey Italian Sausage': 'Entrées',
  'Mostaccioli W/Veggies (Vegan)': 'Entrées',
  'Oven-Roasted Salmon (Jerk, Teriyaki, Lemon Butter or Garlic & Herb)': 'Entrées',
  'Oven Roasted Chicken Breast (Fried, Jerk, Rosemary, Greek, Teriyaki or Garlic & Herbs)': 'Entrées',
  'Over Roasted Chicken Breast': 'Entrées',
  'Philly Steak Alfredo': 'Entrées',
  'Rosemary Chicken': 'Entrées',
  'Rosemary Garlic & Herb Chicken': 'Entrées',
  'Salmon Pasta (Cajun, Jerk, Garlic & Herbs)': 'Entrées',
  'Salmon Stuffed Shells': 'Entrées',
  'Seafood Mac And Cheese': 'Entrées',
  'Shrimp Alfredo Pasta': 'Entrées',
  'Smothered Shrimp Grits W/Cajun Chicken Sausage': 'Entrées',
  'Spinach & Mushroom Stuffed Shells': 'Entrées',
  'Stuffed Chicken Breast (Cheese, Spinach, Mushroom or Bell Peppers)': 'Entrées',
  'Stuffed Shells w/Turkey Italian Sausage': 'Entrées',
  'Chicken Alfredo Grits': 'Entrées',
  'Roasted Vegetable Pasta': 'Entrées',
  'White Spaghetti': 'Entrées',
  'Pot Roast Mac & Cheese': 'Entrées',
  'Garlic & Herbs Turkey Breast': 'Entrées',
  'Turkey Garlic & Herbs': 'Entrées',
  'Shrimp Grits & Chicken Grits': 'Entrées',

  // Sides
  'Asparagus': 'Sides',
  'Cabbage': 'Sides',
  'Cornbread Muffins': 'Sides',
  'Classic Southern Cornbread Dressing': 'Sides',
  'Dirty Rice': 'Sides',
  'Garlic Bread': 'Sides',
  'Garlic Mashed Potatoes': 'Sides',
  'Garlic Parmesan Roasted Potatoes': 'Sides',
  'Garlic Sauteed Spinach': 'Sides',
  'Green Beans W/Smoked Turkey': 'Sides',
  'Jalapeño Cream Corn': 'Sides',
  'Mac & Cheese (Yellow or White Cheddar)': 'Sides',
  'Pesto Potatoes': 'Sides',
  'Red beans & rice': 'Sides',
  'Rice (Plain, garlic or lemon)': 'Sides',
  'Roasted Broccoli': 'Sides',
  'Roasted Mixed Vegetables': 'Sides',
  'Roasted Potatoes': 'Sides',
  'Seafood Dressing': 'Sides',
  'Southern Style Greens w/Smoked Turkey': 'Sides',
  'Sweet Potatoes': 'Sides',
  'Bread Rolls': 'Sides',
  'Hashbrown Casserole': 'Sides',
  'Grits': 'Sides',

  // Appetizers
  'Buffalo Chicken Empanadas': 'Appetizers',
  'Buffalo Chicken Rolls': 'Appetizers',
  'Caesar Salad': 'Appetizers',
  'Cake Pops': 'Appetizers',
  'Caramel Apple or Peach Cobbler Empanadas': 'Appetizers',
  'Charcuterie Tray': 'Appetizers',
  'Chicken Bites (Jerk, Greek, Fried, Teriyaki, Buffalo or Garlic & Herbs)': 'Appetizers',
  'Chicken Empanadas': 'Appetizers',
  'Chicken Mini Taco Cups': 'Appetizers',
  'Chicken Pasta Salad (Jerk, Greek, Buffalo or Garlic & Herbs)': 'Appetizers',
  'Crispy Salmon Bites (Cajun, Jerk, Teriyaki, Lemon Butter or Garlic & Herb)': 'Appetizers',
  'Fruit Tray': 'Appetizers',
  'Lamb Meatball': 'Appetizers',
  'Meatballs (Honey bbq, Tomato Basil or Brown Gravy)': 'Appetizers',
  'Mini Pastry Platter': 'Appetizers',
  'Mini Taco (Ground Beef or Turkey)': 'Appetizers',
  'Mini Taco Cup (Chicken)': 'Appetizers',
  'Mini Taco Cups (Steak)': 'Appetizers',
  'Mixed Green Salad': 'Appetizers',
  'Philly Cheesesteak Empanada': 'Appetizers',
  'Philly Steak Egg Rolls': 'Appetizers',
  'Philly Steak Sliders': 'Appetizers',
  'Salmon Rolls': 'Appetizers',
  'Salmon Sliders': 'Appetizers',
  'Seafood Pasta Salad': 'Appetizers',
  'Southwest Chicken Rolls': 'Appetizers',
  'Veggie Pasta Salad': 'Appetizers',
  'Veggie Tray': 'Appetizers',
  'Beef Birria Empanadas': 'Appetizers',
  'Chicken Sliders  (Garlic & herbs, Greek, Jerk or Buffalo)': 'Appetizers',
  'Chicken Sliders (Garlic & herbs, Greek, Jerk or Buffalo)': 'Appetizers',
  'Pinwheel Wrap Platter': 'Appetizers',
  'Pita/Toppings': 'Appetizers',

  // Breakfast & Brunch
  'Bacon (pork or turkey)': 'Breakfast & Brunch',
  'Breakfast Pastry Platter': 'Breakfast & Brunch',
  'Breakfast Potatoes & Onions': 'Breakfast & Brunch',
  'Egg Casserole (Plain, Cheese, Mixed Peppers or Spinach & Mushrooms)': 'Breakfast & Brunch',
  'French Toast Casserole': 'Breakfast & Brunch',
  'Peach Cobbler Casserole': 'Breakfast & Brunch',
  'Peach Cobbler French Toast Casserole': 'Breakfast & Brunch',
  'Salmon Croquettes': 'Breakfast & Brunch',
  'Shrimp Grits': 'Breakfast & Brunch',
  'Smoke Salmon Bagel Tray': 'Breakfast & Brunch',
  'Turkey Sausage & Peppers': 'Breakfast & Brunch',
  'Waffles': 'Breakfast & Brunch',
  'Scrambled Eggs': 'Breakfast & Brunch',
  'Pork or Turkey Bacon': 'Breakfast & Brunch',
  'Turkey Sausage': 'Breakfast & Brunch',

  // Desserts
  'Cookie & Brownie Tray': 'Desserts',
  'Peach Cobbler Empanadas': 'Desserts',
  'Gourmet Dipped Treats': 'Desserts',
  'Gourmet Dipped Treats (6 for $10)': 'Desserts',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsOrigin(req, res);
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-token');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.ADMIN_SECRET;
  if (!secret) return res.status(503).json({ success: false, error: 'Admin access not configured' });
  if (req.headers['x-admin-token'] !== secret) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const dry = req.query.dry === 'true';
  const client = createSquareClient();

  try {
    // 1. Fetch all catalog objects
    const allObjects: any[] = [];
    for await (const obj of await client.catalog.list({ types: 'ITEM,CATEGORY' })) {
      allObjects.push(obj);
    }

    // Build category maps
    const categoryNameToId = new Map<string, string>();
    const categoryIdToName = new Map<string, string>();
    for (const obj of allObjects) {
      if (obj.type === 'CATEGORY') {
        categoryNameToId.set(obj.categoryData?.name || '', obj.id);
        categoryIdToName.set(obj.id, obj.categoryData?.name || '');
      }
    }

    // Group items by name
    const itemsByName = new Map<string, any[]>();
    for (const obj of allObjects) {
      if (obj.type !== 'ITEM') continue;
      const name = obj.itemData?.name || '';
      if (!itemsByName.has(name)) itemsByName.set(name, []);
      itemsByName.get(name)!.push(obj);
    }

    const toDelete: string[] = [];
    const toUpsert: any[] = [];
    const report: any[] = [];

    for (const [name, items] of itemsByName) {
      if (items.length <= 1) {
        // Single item — check if it needs categorization
        const item = items[0];
        const catId = item.itemData?.categories?.[0]?.id || '';
        const catName = categoryIdToName.get(catId) || '';
        const targetCat = CATEGORY_RULES[name];

        if (targetCat && (!catName || catName === 'Menu')) {
          const targetCatId = categoryNameToId.get(targetCat);
          if (targetCatId) {
            report.push({ action: 'categorize', name, from: catName || 'none', to: targetCat });
            if (!dry) {
              toUpsert.push({
                type: 'ITEM',
                id: item.id,
                version: item.version,
                itemData: { ...item.itemData, categories: [{ id: targetCatId }] },
              });
            }
          }
        }
        continue;
      }

      // Multiple items with same name
      const variations = items.map(item => {
        const vars = item.itemData?.variations || [];
        const hasSmallLarge = vars.length >= 2;
        const singlePrice = vars.length === 1 ? Number(vars[0]?.itemVariationData?.priceMoney?.amount ?? 0) : 0;
        return { item, hasSmallLarge, singlePrice, vars };
      });

      // Find the "proper" item (has both small/large variations)
      const properItems = variations.filter(v => v.hasSmallLarge);
      const singleItems = variations.filter(v => !v.hasSmallLarge);

      if (properItems.length >= 1) {
        // MERGE PATTERN: Keep the proper item, delete singles
        const keep = properItems[0];
        const deleteItems = [...singleItems, ...properItems.slice(1)];

        for (const d of deleteItems) {
          toDelete.push(d.item.id);
          // Also delete variation objects
          for (const v of d.vars) {
            if (v.id) toDelete.push(v.id);
          }
        }

        report.push({
          action: 'delete_duplicates',
          name,
          kept: keep.item.id,
          deleted: deleteItems.map(d => d.item.id),
        });

        // Also categorize the kept item if needed
        const catId = keep.item.itemData?.categories?.[0]?.id || '';
        const catName = categoryIdToName.get(catId) || '';
        const targetCat = CATEGORY_RULES[name];
        if (targetCat && (!catName || catName === 'Menu')) {
          const targetCatId = categoryNameToId.get(targetCat);
          if (targetCatId && !dry) {
            toUpsert.push({
              type: 'ITEM',
              id: keep.item.id,
              version: keep.item.version,
              itemData: { ...keep.item.itemData, categories: [{ id: targetCatId }] },
            });
            report.push({ action: 'categorize', name, from: catName || 'none', to: targetCat });
          }
        }
      } else if (singleItems.length >= 2) {
        // PAIR PATTERN: Two separate items (small + large) — merge into one
        const prices = singleItems.map(s => s.singlePrice).sort((a, b) => a - b);
        const smallPrice = prices[0];
        const largePrice = prices[prices.length - 1];

        // Check if one is in a real category and others are in "Menu" — keep the categorized one
        const REAL_CATS = new Set(['Entrées', 'Appetizers', 'Sides', 'Breakfast & Brunch', 'Desserts', 'Signature Dishes']);
        const categorized = singleItems.filter(s => {
          const catId = s.item.itemData?.categories?.[0]?.id || '';
          const catName = categoryIdToName.get(catId) || '';
          return REAL_CATS.has(catName);
        });
        const uncategorized = singleItems.filter(s => {
          const catId = s.item.itemData?.categories?.[0]?.id || '';
          const catName = categoryIdToName.get(catId) || '';
          return !REAL_CATS.has(catName);
        });

        if (categorized.length >= 1 && uncategorized.length >= 1) {
          // Keep the categorized version, delete uncategorized duplicates
          for (const d of uncategorized) {
            toDelete.push(d.item.id);
            for (const v of d.vars) { if (v.id) toDelete.push(v.id); }
          }
          // Also delete extra categorized copies
          for (const d of categorized.slice(1)) {
            toDelete.push(d.item.id);
            for (const v of d.vars) { if (v.id) toDelete.push(v.id); }
          }
          report.push({
            action: 'delete_uncategorized_dupes',
            name,
            kept: categorized[0].item.id,
            deleted: [...uncategorized, ...categorized.slice(1)].map(d => d.item.id),
          });
        } else if (smallPrice === largePrice) {
          // Exact duplicates — just delete all but one
          for (const d of singleItems.slice(1)) {
            toDelete.push(d.item.id);
            for (const v of d.vars) {
              if (v.id) toDelete.push(v.id);
            }
          }
          report.push({
            action: 'delete_exact_duplicates',
            name,
            kept: singleItems[0].item.id,
            deleted: singleItems.slice(1).map(d => d.item.id),
          });
        } else {
          // Create merged item with two variations
          const targetCat = CATEGORY_RULES[name];
          const targetCatId = targetCat ? categoryNameToId.get(targetCat) : undefined;
          const existingCatId = singleItems[0].item.itemData?.categories?.[0]?.id || '';
          const existingCatName = categoryIdToName.get(existingCatId) || '';
          const finalCatId = targetCatId || (existingCatName && existingCatName !== 'Menu' ? existingCatId : undefined);

          const tempId = `#merged-${name.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30)}-${randomUUID().slice(0, 8)}`;

          const mergedItem: any = {
            type: 'ITEM',
            id: tempId,
            itemData: {
              name,
              description: singleItems[0].item.itemData?.descriptionPlaintext || singleItems[0].item.itemData?.description || '',
              ...(finalCatId ? { categories: [{ id: finalCatId }] } : {}),
              variations: [
                {
                  type: 'ITEM_VARIATION',
                  id: `${tempId}-small`,
                  itemVariationData: {
                    name: 'Small Pan',
                    pricingType: 'FIXED_PRICING',
                    priceMoney: { amount: BigInt(smallPrice), currency: 'USD' },
                  },
                },
                {
                  type: 'ITEM_VARIATION',
                  id: `${tempId}-large`,
                  itemVariationData: {
                    name: 'Large Pan',
                    pricingType: 'FIXED_PRICING',
                    priceMoney: { amount: BigInt(largePrice), currency: 'USD' },
                  },
                },
              ],
            },
          };

          toUpsert.push(mergedItem);

          // Delete all old items
          for (const d of singleItems) {
            toDelete.push(d.item.id);
            for (const v of d.vars) {
              if (v.id) toDelete.push(v.id);
            }
          }

          report.push({
            action: 'merge',
            name,
            smallPrice: smallPrice / 100,
            largePrice: largePrice / 100,
            deleted: singleItems.map(d => d.item.id),
            category: targetCat || existingCatName || 'none',
          });
        }
      }
    }

    // Execute changes
    let deletedCount = 0;
    let upsertedCount = 0;

    if (!dry && toDelete.length > 0) {
      // Batch delete in chunks of 200 (Square API limit)
      for (let i = 0; i < toDelete.length; i += 200) {
        const chunk = toDelete.slice(i, i + 200);
        await client.catalog.batchDelete({ objectIds: chunk });
        deletedCount += chunk.length;
      }
    }

    if (!dry && toUpsert.length > 0) {
      // Batch upsert in chunks of 1000
      for (let i = 0; i < toUpsert.length; i += 1000) {
        const chunk = toUpsert.slice(i, i + 1000);
        await client.catalog.batchUpsert({
          idempotencyKey: randomUUID(),
          batches: [{ objects: chunk }],
        });
        upsertedCount += chunk.length;
      }
    }

    res.json({
      success: true,
      dry,
      summary: {
        itemsToDelete: toDelete.length,
        itemsToUpsert: toUpsert.length,
        deletedCount,
        upsertedCount,
      },
      report,
    });
  } catch (error: any) {
    console.error('Cleanup Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
