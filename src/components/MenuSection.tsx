import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import type { CatalogMenuItem } from '../lib/square/types';
import { trackEvent } from '../lib/analytics';
import { downloadMenu } from '../utils/downloadMenu';

// Deduplicate menu items by name (keep the one with lowest price)
function dedupeMenuItems(items: CatalogMenuItem[]): CatalogMenuItem[] {
  const seen = new Map<string, CatalogMenuItem>();
  for (const item of items) {
    const key = item.name.toLowerCase().trim();
    const existing = seen.get(key);
    if (!existing || item.priceCents < existing.priceCents) {
      seen.set(key, item);
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Categorize items by type based on name patterns
function categorizeItems(items: CatalogMenuItem[]) {
  const categories: Record<string, CatalogMenuItem[]> = {
    'Entrées': [],
    'Sides & Salads': [],
    'Appetizers': [],
    'Breakfast & Brunch': [],
    'Desserts': [],
  };

  const sideKeywords = /salad|mac.*cheese|rice|potato|grits|asparagus|broccoli|corn|cabbage|spinach|green bean|collard|veggie tray|bread|rolls|sweet potato|dirty rice|mostaccioli|veggie pasta/i;
  const appetizerKeywords = /roll|slider|empanada|taco cup|bites|pinwheel|meatball|charcuterie|bagel tray|mini |hotdog|polish|italian beef|sub |wrap/i;
  const breakfastKeywords = /breakfast|waffle|french toast|egg|bacon|sausage|hashbrown|scrambled|pastry platter/i;
  const dessertKeywords = /dessert|cookie|brownie|cobbler|pie|chocolate|dipped|fruit tray/i;
  const skipKeywords = /deposit|balance|gratuity|delivery|extra plate|individual packaging|liquor|mixer|decoration|beverage|juice|water|assorted snack|assorted chip|meal prep|vegetarian.*gluten|wine bar|full service|dropoff|catering for/i;

  for (const item of items) {
    if (skipKeywords.test(item.name)) continue;
    if (breakfastKeywords.test(item.name)) categories['Breakfast & Brunch'].push(item);
    else if (dessertKeywords.test(item.name)) categories['Desserts'].push(item);
    else if (appetizerKeywords.test(item.name)) categories['Appetizers'].push(item);
    else if (sideKeywords.test(item.name)) categories['Sides & Salads'].push(item);
    else categories['Entrées'].push(item);
  }

  // Remove empty categories
  return Object.fromEntries(Object.entries(categories).filter(([, v]) => v.length > 0));
}

export function MenuSection({ menuItems, onBook, onEstimate }: { menuItems: CatalogMenuItem[]; onBook: () => void; onEstimate: () => void }) {
  const deduped = dedupeMenuItems(menuItems);
  const categories = categorizeItems(deduped);
  const categoryNames = Object.keys(categories);
  const defaultCategory = categoryNames.includes('Entrées') ? 'Entrées' : categoryNames[0] || '';
  const [activeCategory, setActiveCategory] = useState(defaultCategory);

  // Sync active category when menu data loads async
  useEffect(() => {
    if (activeCategory === '' && defaultCategory !== '') {
      setActiveCategory(defaultCategory);
    }
  }, [defaultCategory, activeCategory]);

  if (deduped.length === 0) return null;

  const activeItems = categories[activeCategory] || [];

  return (
    <section id="menu" className="py-32 px-8 bg-zinc-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">from our kitchen</span>
          <h2 className="font-caveat text-4xl">Our Menu</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">Fresh dishes made from scratch with layers of rich flavor. Prices shown are per half or full pan — perfect for feeding your guests.</p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categoryNames.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); trackEvent('menu_category_click', { category: cat }); }}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              {cat}
              <span className="ml-1.5 text-xs opacity-60">({categories[cat].length})</span>
            </button>
          ))}
        </div>

        {/* Menu items */}
        <div className="bg-white rounded-[40px] shadow-sm border border-zinc-100 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {activeItems.map((item) => (
              <div key={item.id} className="flex justify-between items-baseline py-3 border-b border-zinc-50 last:border-0 group">
                <div className="flex-1 min-w-0 mr-4">
                  <h4 className="font-playfair text-lg group-hover:text-zinc-600 transition-colors">{item.name}</h4>
                  {item.description && (
                    <p className="text-zinc-400 text-xs mt-0.5 truncate">{item.description}</p>
                  )}
                </div>
                <span className="text-sm font-medium text-zinc-500 whitespace-nowrap">
                  ${(item.priceCents / 100).toFixed(0)}{item.largePriceCents ? <> <span className="text-zinc-300 mx-0.5">/</span> ${(item.largePriceCents / 100).toFixed(0)}</> : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-zinc-400 text-sm">Small pan feeds 12–15 · Large pan feeds 35–40 · prices may vary based on event details</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => { onBook(); trackEvent('cta_click_book', { location: 'menu' }); }} className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-zinc-800 transition-all">
              Book Your Event
            </button>
            <button onClick={() => { onEstimate(); trackEvent('cta_click_estimate', { location: 'menu' }); }} className="border-2 border-black text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-100 transition-all">
              Get Free Estimate
            </button>
            <button onClick={() => { downloadMenu(); trackEvent('menu_download'); }} className="border border-zinc-300 text-zinc-600 px-8 py-3 rounded-full font-medium hover:bg-zinc-50 transition-all flex items-center space-x-2">
              <Download className="w-4 h-4" /><span>Full Menu PDF</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
