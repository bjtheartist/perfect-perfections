import { DEPOSIT_RATE } from "../data/constants";
import type { BookingRequest, CatalogData, Quote } from "./square/types";

export const DEFAULT_TAX_RATE = 0.1025;

export function buildQuoteFromCatalog(
  booking: BookingRequest,
  catalog: CatalogData,
  taxRate: number = DEFAULT_TAX_RATE
): Quote {
  const guestCount = Math.max(0, Math.round(booking.guestCount || 0));
  const pkg = catalog.packages.find((p) => p.id === booking.packageId) || catalog.packages[0];

  const lineItems: Quote["lineItems"] = [];

  if (pkg) {
    const unitPriceCents = pkg.pricePerPersonCents;
    lineItems.push({
      name: `${pkg.name} (${guestCount} guests)`,
      quantity: guestCount,
      unitPriceCents,
      totalCents: unitPriceCents * guestCount,
    });
  }

  for (const addonId of booking.addonIds || []) {
    const addon = catalog.addons.find((a) => a.id === addonId);
    if (!addon) continue;
    const quantity = addon.pricingType === "per-person" ? guestCount : 1;
    lineItems.push({
      name: addon.name,
      quantity,
      unitPriceCents: addon.priceCents,
      totalCents: addon.priceCents * quantity,
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
    depositDueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    balanceDueDate: booking.eventDate,
  };
}
