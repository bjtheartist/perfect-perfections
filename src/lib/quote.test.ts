import { describe, expect, it } from 'vitest';
import { buildQuoteFromCatalog, DEFAULT_TAX_RATE } from './quote';
import type { BookingRequest, CatalogData } from './square/types';

const catalog: CatalogData = {
  packages: [
    {
      id: 'pkg-basic',
      name: 'Basic Package',
      description: 'Simple service',
      pricePerPersonCents: 1000,
      minGuests: 10,
      icon: 'utensils',
      includes: ['Entree', 'Sides'],
      variationId: 'var-basic',
    },
  ],
  addons: [
    { id: 'addon-per', name: 'Per Person Addon', priceCents: 200, pricingType: 'per-person', variationId: '' },
    { id: 'addon-flat', name: 'Flat Addon', priceCents: 500, pricingType: 'flat', variationId: '' },
  ],
  dishes: [],
  fetchedAt: 0,
};

const baseBooking: BookingRequest = {
  customerName: 'Test User',
  customerEmail: 'test@example.com',
  customerPhone: '555-0000',
  eventType: 'Birthday',
  eventDate: '2026-01-01',
  eventTime: '18:00',
  guestCount: 10,
  packageId: 'pkg-basic',
  addonIds: ['addon-per', 'addon-flat'],
  notes: 'No peanuts',
};

describe('buildQuoteFromCatalog', () => {
  it('calculates line items, tax, and deposit from catalog data', () => {
    const quote = buildQuoteFromCatalog(baseBooking, catalog, DEFAULT_TAX_RATE);

    expect(quote.lineItems).toHaveLength(3);
    expect(quote.subtotalCents).toBe(12500);
    expect(quote.taxCents).toBe(1282);
    expect(quote.totalCents).toBe(13782);
    expect(quote.depositCents).toBe(3446);
  });

  it('falls back to the first package when the requested id is missing', () => {
    const quote = buildQuoteFromCatalog(
      { ...baseBooking, packageId: 'missing' },
      catalog
    );

    expect(quote.lineItems[0]?.name).toContain('Basic Package');
  });

  it('clamps negative guest counts to zero', () => {
    const quote = buildQuoteFromCatalog(
      { ...baseBooking, guestCount: -5 },
      catalog
    );

    expect(quote.lineItems[0]?.quantity).toBe(0);
    expect(quote.totalCents).toBe(0);
  });
});
