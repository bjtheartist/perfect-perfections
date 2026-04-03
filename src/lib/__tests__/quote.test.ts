import { describe, it, expect } from 'vitest';
import { buildQuoteFromCatalog, DEFAULT_TAX_RATE } from '../quote';
import type { BookingRequest, CatalogData } from '../square/types';

const makeCatalog = (overrides?: Partial<CatalogData>): CatalogData => ({
  packages: [
    {
      id: 'pkg-fullservice',
      name: 'Full Service w/ Setup',
      description: '',
      pricePerPersonCents: 27500, // $275 flat service fee
      minGuests: 1,
      icon: 'utensils',
      includes: [],
      variationId: 'var-fullservice',
    },
    {
      id: 'pkg-dropoff',
      name: 'Drop-Off Service',
      description: '',
      pricePerPersonCents: 5000, // $50 flat delivery fee
      minGuests: 1,
      icon: 'truck',
      includes: [],
      variationId: 'var-dropoff',
    },
  ],
  addons: [
    {
      id: 'addon-decor',
      name: 'Setup & Basic Décor',
      priceCents: 20000,
      pricingType: 'flat',
      variationId: 'var-decor',
    },
  ],
  dishes: [],
  menuItems: [
    { id: 'menu-chicken', name: 'Baked Chicken', description: '', priceCents: 8000, largePriceCents: 15000, category: 'Entrées' },
    { id: 'menu-mac', name: 'Mac & Cheese', description: '', priceCents: 7500, largePriceCents: 13500, category: 'Sides' },
  ],
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
  packageId: 'pkg-fullservice',
  addonIds: [],
  menuItemIds: [],
  menuItemSizes: {},
  notes: '',
  ...overrides,
});

describe('buildQuoteFromCatalog', () => {
  it('adds service fee as flat line item', () => {
    const quote = buildQuoteFromCatalog(makeBooking(), makeCatalog());

    expect(quote.lineItems[0].name).toBe('Full Service w/ Setup');
    expect(quote.lineItems[0].quantity).toBe(1);
    expect(quote.lineItems[0].totalCents).toBe(27500);
    expect(quote.subtotalCents).toBe(27500);
  });

  it('uses small pan price by default for menu items', () => {
    const quote = buildQuoteFromCatalog(
      makeBooking({ menuItemIds: ['menu-chicken'], menuItemSizes: { 'menu-chicken': 'small' } }),
      makeCatalog(),
    );

    const chicken = quote.lineItems.find((li) => li.name.includes('Baked Chicken'));
    expect(chicken).toBeDefined();
    expect(chicken!.totalCents).toBe(8000);
    expect(chicken!.name).toContain('Small Pan');
  });

  it('uses large pan price when selected', () => {
    const quote = buildQuoteFromCatalog(
      makeBooking({ menuItemIds: ['menu-chicken'], menuItemSizes: { 'menu-chicken': 'large' } }),
      makeCatalog(),
    );

    const chicken = quote.lineItems.find((li) => li.name.includes('Baked Chicken'));
    expect(chicken).toBeDefined();
    expect(chicken!.totalCents).toBe(15000);
    expect(chicken!.name).toContain('Large Pan');
  });

  it('calculates total with service fee + menu items + add-ons', () => {
    const quote = buildQuoteFromCatalog(
      makeBooking({
        menuItemIds: ['menu-chicken', 'menu-mac'],
        menuItemSizes: { 'menu-chicken': 'large', 'menu-mac': 'small' },
        addonIds: ['addon-decor'],
      }),
      makeCatalog(),
    );

    // $275 service + $150 chicken (large) + $75 mac (small) + $200 decor = $700
    expect(quote.subtotalCents).toBe(70000);
  });

  it('adds flat-rate addon as single line item', () => {
    const quote = buildQuoteFromCatalog(
      makeBooking({ addonIds: ['addon-decor'] }),
      makeCatalog(),
    );

    const decor = quote.lineItems.find((li) => li.name === 'Setup & Basic Décor');
    expect(decor).toBeDefined();
    expect(decor!.quantity).toBe(1);
    expect(decor!.totalCents).toBe(20000);
  });

  it('computes tax as Math.round(subtotal × 0.1025)', () => {
    const quote = buildQuoteFromCatalog(makeBooking(), makeCatalog());
    const expectedTax = Math.round(27500 * DEFAULT_TAX_RATE);

    expect(quote.taxCents).toBe(expectedTax);
    expect(quote.totalCents).toBe(27500 + expectedTax);
  });

  it('computes deposit as Math.round(total × 0.50)', () => {
    const quote = buildQuoteFromCatalog(makeBooking(), makeCatalog());
    const expectedDeposit = Math.round(quote.totalCents * 0.50);

    expect(quote.depositCents).toBe(expectedDeposit);
  });

  it('skips service fee line item when package price is 0', () => {
    const quote = buildQuoteFromCatalog(
      makeBooking({ packageId: 'pkg-dropoff' }),
      makeCatalog({
        packages: [
          { id: 'pkg-dropoff', name: 'Drop-Off', description: '', pricePerPersonCents: 0, minGuests: 1, icon: 'truck', includes: [], variationId: '' },
        ],
      }),
    );

    expect(quote.lineItems.length).toBe(0);
    expect(quote.subtotalCents).toBe(0);
  });
});
