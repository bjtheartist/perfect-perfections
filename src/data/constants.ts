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

// --- Fallback Menu Items for Booking Selection ---
export const FALLBACK_MENU_ITEMS = [
  // Entrées
  { name: 'Shrimp & Grits', category: 'Entrées' },
  { name: 'Bacon-Wrapped Stuffed Chicken', category: 'Entrées' },
  { name: 'Signature Soul Rolls', category: 'Entrées' },
  { name: 'Baked Chicken', category: 'Entrées' },
  { name: 'Fried Chicken Wings', category: 'Entrées' },
  { name: 'BBQ Ribs', category: 'Entrées' },
  { name: 'Smothered Pork Chops', category: 'Entrées' },
  { name: 'Oxtails', category: 'Entrées' },
  { name: 'Salmon Croquettes', category: 'Entrées' },
  // Sides
  { name: 'Mac & Cheese', category: 'Sides' },
  { name: 'Collard Greens', category: 'Sides' },
  { name: 'Candied Yams', category: 'Sides' },
  { name: 'Dirty Rice', category: 'Sides' },
  { name: 'Corn on the Cob', category: 'Sides' },
  { name: 'Green Beans', category: 'Sides' },
  { name: 'Potato Salad', category: 'Sides' },
  { name: 'Coleslaw', category: 'Sides' },
  // Breakfast & Brunch
  { name: 'French Toast', category: 'Breakfast & Brunch' },
  { name: 'Scrambled Eggs', category: 'Breakfast & Brunch' },
  { name: 'Turkey Bacon & Sausage', category: 'Breakfast & Brunch' },
  { name: 'Waffle Bar', category: 'Breakfast & Brunch' },
  // Desserts
  { name: 'Southern Pecan Pie', category: 'Desserts' },
  { name: 'Banana Pudding', category: 'Desserts' },
  { name: 'Peach Cobbler', category: 'Desserts' },
  { name: 'Gourmet Dipped Treats', category: 'Desserts' },
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

export const FAQ_ITEMS = [
  {
    question: 'How much does catering cost?',
    answer: 'Packages start at $35 per person for drop-off service. Full-service catering with setup runs $275, with 2 servers $375, and with 3 servers $475 per person. Final pricing depends on guest count, menu selections, and event details.',
  },
  {
    question: 'What types of events do you cater?',
    answer: 'We cater weddings, corporate events, private parties, birthdays, graduations, holiday gatherings, funerals and repasts, and more. No event is too small or too large.',
  },
  {
    question: "What's on the menu?",
    answer: 'Our menu features made-from-scratch dishes with rich, layered flavors — including shrimp & grits, bacon-wrapped stuffed chicken, signature soul rolls, mac & cheese, collard greens, and more. We also offer breakfast/brunch, appetizers, and desserts. You can download our full menu PDF on our website.',
  },
  {
    question: 'Do you provide servers and setup?',
    answer: 'Yes! Our Full Service packages include racks, burners, plates, napkins, cutlery, setup, and breakdown. You can choose packages with 2 or 3 professional servers depending on your event size.',
  },
  {
    question: 'How do I book Perfect Perfections Catering?',
    answer: 'You can book by calling or texting (773) 936-6416, sending a message through our website contact form, or DMing us on Instagram @perfectperfectionscatering. We typically respond within 24 hours. A 25% deposit is required to secure your date.',
  },
  {
    question: 'What areas do you serve?',
    answer: 'We are based on Chicago\'s South Side and serve the greater Chicago metropolitan area including surrounding suburbs. Contact us for events outside the Chicagoland area.',
  },
];

// Map icon string identifiers to render at component level
export const ICON_MAP: Record<IconName, string> = {
  utensils: 'Utensils',
  truck: 'Truck',
  cake: 'Cake',
};
