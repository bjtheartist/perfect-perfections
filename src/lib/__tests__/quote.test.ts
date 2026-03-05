import { describe, it, expect } from 'vitest';
import { buildQuoteFromCatalog, DEFAULT_TAX_RATE } from '../quote';
import type { BookingRequest, CatalogData } from '../square/types';

const makeCatalog = (overrides?: Partial<CatalogData>): CatalogData => ({
  packages: [
    {
      id: 'pkg-gold',
      name: 'Gold Package',
      description: '',
      pricePerPersonCents: 5000,
      minGuests: 10,
      icon: 'utensils',
      includes: [],
      variationId: 'var-gold',
    },
    {
      id: 'pkg-silver',
      name: 'Silver Package',
      description: '',
      pricePerPersonCents: 3000,
      minGuests: 5,
      icon: 'truck',
      includes: [],
      variationId: 'var-silver',
    },
  ],
  addons: [
    {
      id: 'addon-drinks',
      name: 'Open Bar',
      priceCents: 1500,
      pricingType: 'per-person',
      variationId: 'var-drinks',
    },
    {
      id: 'addon-setup',
      name: 'Setup Fee',
      priceCents: 20000,
      pricingType: 'flat',
      variationId: 'var-setup',
    },
  ],
  dishes: [],
  fetchedAt: Date.now(),
  ...overrides,
});

const makeBooking = (overrides?: Partial<BookingRequest>): BookingRequest => ({
  customerName: 'Test User',
  customerEmail: 'test@example.com',
  customerPhone: '555-0100',
  eventType: 'Wedding',
  eventDate: '2026-06-15',
  eventTime: '6:00 PM',
  guestCount: 20,
  packageId: 'pkg-gold',
  addonIds: [],
  notes: '',
  ...overrides,
});

describe('buildQuoteFromCatalog', () => {
  it('calculates package line item as price × guest count', () => {
    const quote = buildQuoteFromCatalog(makeBooking(), makeCatalog());

    expect(quote.lineItems[0].unitPriceCents).toBe(5000);
    expect(quote.lineItems[0].quantity).toBe(20);
    expect(quote.lineItems[0].totalCents).toBe(100_000);
    expect(quote.subtotalCents).toBe(100_000);
  });

  it('calculates per-person addon as price × guests', () => {
    const quote = buildQuoteFromCatalog(
      makeBooking({ addonIds: ['addon-drinks'] }),
      makeCatalog(),
    );

    const addonItem = quote.lineItems.find((li) => li.name === 'Open Bar');
    expect(addonItem).toBeDefined();
    expect(addonItem!.quantity).toBe(20);
    expect(addonItem!.unitPriceCents).toBe(1500);
    expect(addonItem!.totalCents).toBe(30_000);
  });

  it('calculates flat-rate addon as price × 1', () => {
    const quote = buildQuoteFromCatalog(
      makeBooking({ addonIds: ['addon-setup'] }),
      makeCatalog(),
    );

    const addonItem = quote.lineItems.find((li) => li.name === 'Setup Fee');
    expect(addonItem).toBeDefined();
    expect(addonItem!.quantity).toBe(1);
    expect(addonItem!.totalCents).toBe(20_000);
  });

  it('computes tax as Math.round(subtotal × 0.1025)', () => {
    const quote = buildQuoteFromCatalog(makeBooking(), makeCatalog());
    const expectedTax = Math.round(100_000 * DEFAULT_TAX_RATE);

    expect(quote.taxCents).toBe(expectedTax);
    expect(quote.totalCents).toBe(100_000 + expectedTax);
  });

  it('computes deposit as Math.round(total × 0.25)', () => {
    const quote = buildQuoteFromCatalog(makeBooking(), makeCatalog());
    const expectedDeposit = Math.round(quote.totalCents * 0.25);

    expect(quote.depositCents).toBe(expectedDeposit);
  });

  it('returns subtotal 0 when guestCount is 0', () => {
    const quote = buildQuoteFromCatalog(
      makeBooking({ guestCount: 0 }),
      makeCatalog(),
    );

    expect(quote.subtotalCents).toBe(0);
    expect(quote.taxCents).toBe(0);
    expect(quote.totalCents).toBe(0);
    expect(quote.depositCents).toBe(0);
  });

  it('falls back to first package when packageId is missing', () => {
    const quote = buildQuoteFromCatalog(
      makeBooking({ packageId: 'nonexistent' }),
      makeCatalog(),
    );

    // Should use Gold Package (first in array)
    expect(quote.lineItems[0].name).toContain('Gold Package');
    expect(quote.lineItems[0].unitPriceCents).toBe(5000);
  });
});
