/**
 * Server-side quote builder — mirrors src/lib/quote.ts
 * Duplicated here to avoid cross-boundary imports that break Vercel serverless.
 */
import type { BookingRequest, CatalogData, Quote } from '../../src/lib/square/types.js';

const DEPOSIT_RATE = 0.25;
export const DEFAULT_TAX_RATE = 0.1025;

export function buildQuoteFromCatalog(
  booking: BookingRequest,
  catalog: CatalogData,
  taxRate: number = DEFAULT_TAX_RATE
): Quote {
  const pkg = catalog.packages.find((p) => p.id === booking.packageId) || catalog.packages[0];
  const sizes = booking.menuItemSizes || {};
  const lineItems: Quote['lineItems'] = [];

  if (pkg && pkg.pricePerPersonCents > 0) {
    lineItems.push({
      name: pkg.name,
      quantity: 1,
      unitPriceCents: pkg.pricePerPersonCents,
      totalCents: pkg.pricePerPersonCents,
    });
  }

  for (const itemId of booking.menuItemIds || []) {
    const item = (catalog.menuItems || []).find((m) => m.id === itemId);
    if (!item) continue;
    const size = sizes[itemId] || 'small';
    const priceCents = size === 'large' && item.largePriceCents ? item.largePriceCents : item.priceCents;
    const sizeLabel = size === 'large' ? 'Large Pan' : 'Small Pan';
    lineItems.push({
      name: `${item.name} (${sizeLabel})`,
      quantity: 1,
      unitPriceCents: priceCents,
      totalCents: priceCents,
    });
  }

  for (const addonId of booking.addonIds || []) {
    const addon = catalog.addons.find((a) => a.id === addonId);
    if (!addon) continue;
    lineItems.push({
      name: addon.name,
      quantity: 1,
      unitPriceCents: addon.priceCents,
      totalCents: addon.priceCents,
    });
  }

  const subtotalCents = lineItems.reduce((sum, item) => sum + item.totalCents, 0);
  const taxCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxCents;
  const depositCents = Math.round(totalCents * DEPOSIT_RATE);

  return {
    lineItems,
    subtotalCents,
    taxCents,
    totalCents,
    depositCents,
    depositDueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    balanceDueDate: booking.eventDate,
  };
}
