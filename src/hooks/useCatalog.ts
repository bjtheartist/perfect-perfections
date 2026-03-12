import { useState, useEffect } from 'react';
import type { CatalogData, CatalogPackage, CatalogAddon, CatalogDish, IconName } from '../lib/square/types';
import { CATERING_PACKAGES, MENU_ADDONS, SIGNATURE_DISHES, FALLBACK_MENU_ITEMS } from '../data/constants';

/** Convert hardcoded constants to CatalogData shape as fallback */
function buildFallbackCatalog(): CatalogData {
  const packages: CatalogPackage[] = CATERING_PACKAGES.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    pricePerPersonCents: p.pricePerPerson * 100,
    minGuests: p.minGuests,
    icon: p.icon as IconName,
    includes: p.includes,
    variationId: '',
  }));

  const addons: CatalogAddon[] = MENU_ADDONS.map(a => ({
    id: a.id,
    name: a.name,
    priceCents: a.price * 100,
    pricingType: a.per === 'person' ? 'per-person' as const : 'flat' as const,
    variationId: '',
  }));

  const dishes: CatalogDish[] = SIGNATURE_DISHES.map((d, i) => ({
    id: `fallback-dish-${i}`,
    name: d.name,
    description: d.description,
    imageUrl: d.image,
  }));

  const menuItems = FALLBACK_MENU_ITEMS.map((item, i) => ({
    id: `fallback-menu-${i}`,
    name: item.name,
    description: '',
    priceCents: 0,
    category: item.category,
  }));

  return { packages, addons, dishes, menuItems, fetchedAt: Date.now() };
}

export function useCatalog() {
  const [catalog, setCatalog] = useState<CatalogData>(buildFallbackCatalog);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchCatalog() {
      try {
        const res = await fetch('/api/square/menu');
        const json = await res.json();
        if (!cancelled && json.success && json.data) {
          const data = json.data as CatalogData;
          // Only use live data if it has packages (seed has been run)
          if (data.packages.length > 0) {
            setCatalog(data);
            setIsLive(true);
          }
        }
      } catch {
        // Fallback already set
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCatalog();
    return () => { cancelled = true; };
  }, []);

  return { catalog, loading, isLive };
}
