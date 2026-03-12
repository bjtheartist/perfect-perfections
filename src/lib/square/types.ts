/**
 * Square Integration Types
 *
 * Shared types between frontend and backend.
 * These decouple our app from Square's internal types,
 * so SDK updates don't cascade through the whole codebase.
 */

// ── Menu / Catalog ──────────────────────────────────────────
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  pricePerPersonCents: number; // Store in cents, display in dollars
  category: 'full-service' | 'drop-off' | 'custom' | 'addon';
  imageUrl?: string;
  modifiers?: MenuModifier[];
}

export interface MenuModifier {
  id: string;
  name: string;
  priceCents: number;
  type: 'per-person' | 'flat';
}

// ── Catalog (Square as source of truth) ─────────────────────
export type IconName = 'utensils' | 'truck' | 'cake';

export interface CatalogPackage {
  id: string;
  name: string;
  description: string;
  pricePerPersonCents: number;
  minGuests: number;
  icon: IconName;
  includes: string[];
  variationId: string;
}

export interface CatalogAddon {
  id: string;
  name: string;
  priceCents: number;
  pricingType: 'per-person' | 'flat';
  variationId: string;
}

export interface CatalogDish {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface CatalogMenuItem {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  imageUrl?: string;
}

export interface CatalogData {
  packages: CatalogPackage[];
  addons: CatalogAddon[];
  dishes: CatalogDish[];
  menuItems?: CatalogMenuItem[];
  fetchedAt: number;
}

// ── Booking / Event ─────────────────────────────────────────
export interface BookingRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: string;
  eventDate: string; // ISO date
  eventTime: string;
  guestCount: number;
  packageId: string;
  addonIds: string[];
  menuItemIds: string[];
  notes: string;
}

export interface BookingResponse {
  bookingId: string;
  orderId: string;
  invoiceId?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalCents: number;
  depositCents: number;
  depositPaymentUrl?: string;
}

// ── Invoice / Quote ─────────────────────────────────────────
export interface QuoteLineItem {
  name: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

export interface Quote {
  lineItems: QuoteLineItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  depositCents: number; // 25% of total
  depositDueDate: string;
  balanceDueDate: string;
}

// ── Payment ─────────────────────────────────────────────────
export interface PaymentRequest {
  sourceId: string; // Token from Web Payments SDK
  amountCents: number;
  orderId: string;
  customerEmail: string;
  note?: string;
}

export interface PaymentResult {
  paymentId: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  receiptUrl?: string;
}

// ── Customer ────────────────────────────────────────────────
export interface CustomerInfo {
  id?: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

// ── Admin Summaries ─────────────────────────────────────────
export interface OrderSummary {
  id: string;
  referenceId: string;
  customerName: string;
  state: string;
  totalCents: number;
  eventType?: string;
  eventDate?: string;
  guestCount?: number;
  createdAt: string;
}

export interface TransactionSummary {
  id: string;
  orderId?: string;
  amountCents: number;
  status: string;
  cardBrand?: string;
  last4?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface CustomerSummary {
  id: string;
  displayName: string;
  emailAddress?: string;
  phoneNumber?: string;
  createdAt: string;
}

// ── API Responses ───────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
