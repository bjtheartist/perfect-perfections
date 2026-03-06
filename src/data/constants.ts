/**
 * FALLBACK DATA — edit in Square Dashboard
 *
 * These constants serve as fallback when Square Catalog is unavailable.
 * The live source of truth is Square Catalog (seeded via POST /api/square/seed).
 * Nikida can edit names, descriptions, prices, and photos from her Square Dashboard app.
 */

// --- Signature Dishes Data ---
export const SIGNATURE_DISHES = [
  {
    name: "Shrimp & Grits",
    description: "Creamy, buttery grits topped with seasoned shrimp and crispy bacon crumbles.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop"
  },
  {
    name: "Bacon-Wrapped Stuffed Chicken",
    description: "Tender chicken breast stuffed with spinach and cheese, wrapped in smoky bacon, served with sautéed mushrooms.",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&h=600&fit=crop"
  },
  {
    name: "Signature Soul Rolls",
    description: "Our famous crispy rolls filled with soul food favorites, served with a creamy dipping sauce.",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&h=600&fit=crop"
  },
  {
    name: "Southern Pecan Pie",
    description: "A rich, flaky crust filled with sweet, toasted pecans, served alongside chocolate-dipped strawberries.",
    image: "https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?w=800&h=600&fit=crop"
  },
  {
    name: "Gourmet Dipped Treats",
    description: "Decadent chocolate-covered cookies finished with gold dust and festive drizzles.",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop"
  }
];

// --- Catering Packages & Pricing ---
export type IconName = 'utensils' | 'truck' | 'cake';

export interface CateringPackage {
  id: string;
  name: string;
  description: string;
  pricePerPerson: number;
  minGuests: number;
  icon: IconName;
  includes: string[];
}

export const CATERING_PACKAGES: CateringPackage[] = [
  {
    id: 'drop-off',
    name: 'Drop-Off Service',
    description: 'Fresh platters and trays delivered to your venue, ready to serve.',
    pricePerPerson: 35,
    minGuests: 1,
    icon: 'truck',
    includes: ['Freshly prepared food', 'Delivery to your venue'],
  },
  {
    id: 'full-service-setup',
    name: 'Full Service w/ Setup',
    description: 'Everything you need for a seamless event — racks, burners, plates, napkins, and cutlery included.',
    pricePerPerson: 275,
    minGuests: 1,
    icon: 'utensils',
    includes: ['Racks & burners', 'Plates, napkins & cutlery', 'Full setup'],
  },
  {
    id: 'full-service-2-servers',
    name: 'Full Service w/ 2 Servers',
    description: 'Complete catering with two professional servers for setup, buffet maintenance, and breakdown.',
    pricePerPerson: 375,
    minGuests: 1,
    icon: 'utensils',
    includes: ['Racks & burners', 'Plates, napkins & cutlery', 'Setup & breakdown', 'Buffet maintenance', '2 professional servers'],
  },
  {
    id: 'full-service-3-servers',
    name: 'Full Service w/ 3 Servers',
    description: 'Our premium package with three servers for larger events — setup, buffet maintenance, and full breakdown.',
    pricePerPerson: 475,
    minGuests: 1,
    icon: 'utensils',
    includes: ['Racks & burners', 'Plates, napkins & cutlery', 'Setup & breakdown', 'Buffet maintenance', '3 professional servers'],
  },
];

export const MENU_ADDONS = [
  { id: 'dessert-table', name: 'Dessert Table', price: 150, per: 'flat' as const },
  { id: 'beverage', name: 'Beverage Service', price: 8, per: 'person' as const },
  { id: 'extra-protein', name: 'Extra Protein Option', price: 5, per: 'person' as const },
  { id: 'decor', name: 'Setup & Basic Décor', price: 200, per: 'flat' as const },
  { id: 'servers', name: 'Additional Servers (2hr)', price: 120, per: 'flat' as const },
];

export const DEPOSIT_RATE = 0.25;

// Map icon string identifiers to render at component level
export const ICON_MAP: Record<IconName, string> = {
  utensils: 'Utensils',
  truck: 'Truck',
  cake: 'Cake',
};
