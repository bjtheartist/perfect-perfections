import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'crypto';
import { SquareClient, SquareEnvironment } from 'square';
import { buildQuoteFromCatalog } from '../../src/lib/quote';
import type { BookingRequest, CatalogData } from '../../src/lib/square/types';

const SPECIAL_CATEGORIES = new Set(['Catering Packages', 'Add-Ons', 'Signature Dishes']);

type SquareEnvironmentName = 'sandbox' | 'production';

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSquareEnvironmentName(): SquareEnvironmentName {
  return process.env.SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
}

function getSquareEnvironment(): SquareEnvironment {
  return getSquareEnvironmentName() === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;
}

export function createSquareClient(): SquareClient {
  return new SquareClient({
    token: getRequiredEnv('SQUARE_ACCESS_TOKEN'),
    environment: getSquareEnvironment(),
  });
}

export function getSquareLocationId(): string {
  return getRequiredEnv('SQUARE_LOCATION_ID');
}

export function handleCors(req: VercelRequest, res: VercelResponse, methods: string[]): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', [...methods, 'OPTIONS'].join(','));
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function requireMethods(req: VercelRequest, res: VercelResponse, methods: string[]): boolean {
  if (req.method && methods.includes(req.method)) {
    return true;
  }
  res.status(405).json({ success: false, error: 'Method not allowed' });
  return false;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function createIdempotencyKey(prefix: string, payload: unknown): string {
  return `${prefix}-${createHash('sha256').update(stableStringify(payload)).digest('hex').slice(0, 44)}`;
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const maybeError = error as {
      message?: string;
      errors?: Array<{ detail?: string; code?: string; category?: string }>;
      body?: { errors?: Array<{ detail?: string; code?: string; category?: string }> };
    };
    const apiErrors = maybeError.errors || maybeError.body?.errors;
    if (apiErrors?.length) {
      return apiErrors
        .map((entry) => entry.detail || entry.code || entry.category)
        .filter(Boolean)
        .join('; ');
    }
    if (maybeError.message) {
      return maybeError.message;
    }
  }
  return 'Unexpected Square error';
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(normalizeString).filter(Boolean);
}

export function normalizeBooking(input: unknown): BookingRequest {
  const booking = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const rawSizes = booking.menuItemSizes && typeof booking.menuItemSizes === 'object'
    ? Object.entries(booking.menuItemSizes as Record<string, unknown>)
    : [];

  return {
    customerName: normalizeString(booking.customerName),
    customerEmail: normalizeString(booking.customerEmail).toLowerCase(),
    customerPhone: normalizeString(booking.customerPhone),
    eventType: normalizeString(booking.eventType),
    eventDate: normalizeString(booking.eventDate),
    eventTime: normalizeString(booking.eventTime),
    guestCount: Math.max(0, Math.round(Number(booking.guestCount) || 0)),
    packageId: normalizeString(booking.packageId),
    addonIds: normalizeStringArray(booking.addonIds),
    menuItemIds: normalizeStringArray(booking.menuItemIds),
    menuItemSizes: Object.fromEntries(
      rawSizes.filter(([, size]) => size === 'small' || size === 'large') as Array<[string, 'small' | 'large']>
    ),
    notes: normalizeString(booking.notes),
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateQuoteRequest(booking: BookingRequest): string | null {
  if (!booking.customerName) return 'Customer name is required';
  if (!booking.customerEmail || !isValidEmail(booking.customerEmail)) return 'A valid customer email is required';
  if (!booking.eventType) return 'Event type is required';
  if (!booking.eventDate) return 'Event date is required';
  if (!booking.packageId) return 'Package selection is required';
  return null;
}

export function validateOrderRequest(booking: BookingRequest): string | null {
  return validateQuoteRequest(booking)
    || (!booking.customerPhone ? 'Customer phone is required' : null)
    || (!booking.eventTime ? 'Event time is required' : null);
}

export async function listCatalogObjects(client: SquareClient, types: string): Promise<any[]> {
  const objects: any[] = [];
  for await (const object of await client.catalog.list({ types }) as any) {
    objects.push(object);
  }
  return objects;
}

export async function getCatalogData(client = createSquareClient()): Promise<CatalogData> {
  const allObjects = await listCatalogObjects(client, 'ITEM,CATEGORY,IMAGE');
  const categoryMap = new Map<string, string>();
  const imageMap = new Map<string, string>();

  for (const object of allObjects) {
    if (object.type === 'CATEGORY') categoryMap.set(object.id, object.categoryData?.name || '');
    if (object.type === 'IMAGE') imageMap.set(object.id, object.imageData?.url || '');
  }

  const packages: CatalogData['packages'] = [];
  const addons: CatalogData['addons'] = [];
  const dishes: CatalogData['dishes'] = [];
  const menuItems: NonNullable<CatalogData['menuItems']> = [];

  for (const object of allObjects) {
    if (object.type !== 'ITEM') continue;

    const itemData = object.itemData;
    if (!itemData) continue;

    const catId = itemData.categories?.[0]?.id || itemData.categoryId || '';
    const categoryName = categoryMap.get(catId) || '';
    const variation = itemData.variations?.[0];
    const customAttrs = object.customAttributeValues || {};
    const imageUrl = itemData.imageIds?.length ? imageMap.get(itemData.imageIds[0]) : undefined;

    if (categoryName === 'Catering Packages') {
      let includes: string[] = [];
      try {
        includes = JSON.parse(customAttrs.pp_includes?.stringValue || '[]');
      } catch {
        includes = [];
      }
      packages.push({
        id: object.id,
        name: itemData.name || '',
        description: itemData.descriptionPlaintext || itemData.description || '',
        pricePerPersonCents: Number(variation?.itemVariationData?.priceMoney?.amount ?? 0),
        minGuests: Number(customAttrs.pp_min_guests?.numberValue ?? 1),
        icon: customAttrs.pp_icon?.stringValue || 'utensils',
        includes,
        variationId: variation?.id || '',
      });
      continue;
    }

    if (categoryName === 'Add-Ons') {
      const pricingType = customAttrs.pp_pricing_type?.stringValue === 'per-person' ? 'per-person' : 'flat';
      addons.push({
        id: object.id,
        name: itemData.name || '',
        priceCents: Number(variation?.itemVariationData?.priceMoney?.amount ?? 0),
        pricingType,
        variationId: variation?.id || '',
      });
      continue;
    }

    if (categoryName === 'Signature Dishes') {
      dishes.push({
        id: object.id,
        name: itemData.name || '',
        description: itemData.descriptionPlaintext || itemData.description || '',
        imageUrl,
      });
      continue;
    }

    if (SPECIAL_CATEGORIES.has(categoryName)) continue;

    const variations = itemData.variations || [];
    const smallVariation = variations.find((entry: any) => /small|half/i.test(entry.itemVariationData?.name || '')) || variations[0];
    const largeVariation = variations.find((entry: any) => /large|full/i.test(entry.itemVariationData?.name || '')) || variations[1];
    const priceCents = Number(smallVariation?.itemVariationData?.priceMoney?.amount ?? 0);
    const largePriceCents = largeVariation
      ? Number(largeVariation.itemVariationData?.priceMoney?.amount ?? 0)
      : undefined;

    if (priceCents <= 0) continue;

    menuItems.push({
      id: object.id,
      name: (itemData.name || '').trim(),
      description: (itemData.descriptionPlaintext || itemData.description || '').trim(),
      priceCents,
      largePriceCents,
      smallVariationId: smallVariation?.id,
      largeVariationId: largeVariation?.id,
      category: categoryName || 'Menu',
      imageUrl,
    });
  }

  packages.sort((left, right) => left.name.localeCompare(right.name));
  addons.sort((left, right) => left.name.localeCompare(right.name));
  dishes.sort((left, right) => left.name.localeCompare(right.name));
  menuItems.sort((left, right) => {
    const categoryCompare = left.category.localeCompare(right.category);
    return categoryCompare !== 0 ? categoryCompare : left.name.localeCompare(right.name);
  });

  return { packages, addons, dishes, menuItems, fetchedAt: Date.now() };
}

export async function buildSquareQuote(booking: BookingRequest, client = createSquareClient()) {
  const catalog = await getCatalogData(client);
  return buildQuoteFromCatalog(booking, catalog);
}

export async function findCustomerByEmail(client: SquareClient, email: string): Promise<string | undefined> {
  if (!email) return undefined;
  const result = await client.customers.search({
    query: { filter: { emailAddress: { exact: email } } },
  });
  return result.customers?.[0]?.id;
}

export async function upsertCustomer(
  client: SquareClient,
  customer: Pick<BookingRequest, 'customerName' | 'customerEmail' | 'customerPhone'>
): Promise<string | undefined> {
  const existingCustomerId = await findCustomerByEmail(client, customer.customerEmail);
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const [givenName, ...rest] = customer.customerName.split(/\s+/).filter(Boolean);
  const result = await client.customers.create({
    idempotencyKey: createIdempotencyKey('customer', customer),
    givenName: givenName || customer.customerName,
    familyName: rest.join(' '),
    emailAddress: customer.customerEmail,
    phoneNumber: customer.customerPhone,
  });

  return result.customer?.id;
}

export async function getOrderTotalCents(client: SquareClient, orderId: string): Promise<number> {
  const result = await client.orders.get({ orderId });
  return Number(result.order?.totalMoney?.amount ?? 0);
}
