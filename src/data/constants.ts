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
// Prices in cents: smallPriceCents = half/small pan, largePriceCents = full/large pan
export interface FallbackMenuItem {
  name: string;
  category: string;
  description?: string;
  smallPriceCents: number;
  largePriceCents: number;
}

export const FALLBACK_MENU_ITEMS: FallbackMenuItem[] = [
  // Entrées (small pan 15-20 | large pan 30-35)
  { name: 'Lamb Chops', category: 'Entrées', description: 'buttery garlic or jerk', smallPriceCents: 20000, largePriceCents: 38000 },
  { name: 'Salmon', category: 'Entrées', description: 'garlic, lemon, teriyaki, jerk', smallPriceCents: 13500, largePriceCents: 24000 },
  { name: 'Stuffed Salmon', category: 'Entrées', smallPriceCents: 15000, largePriceCents: 29000 },
  { name: 'Stuffed Salmon + Shrimp', category: 'Entrées', smallPriceCents: 17500, largePriceCents: 34000 },
  { name: 'Beef Short Ribs', category: 'Entrées', smallPriceCents: 20000, largePriceCents: 38000 },
  { name: 'Stuffed Chicken Breast', category: 'Entrées', description: 'cheese, spinach & mushroom, bell pepper & onion', smallPriceCents: 12000, largePriceCents: 22000 },
  { name: 'Baked Chicken', category: 'Entrées', description: 'jerk, lemon pepper, teriyaki, rosemary, garlic & herb', smallPriceCents: 8000, largePriceCents: 15000 },
  { name: 'Oven Roasted Chicken', category: 'Entrées', description: 'jerk, lemon pepper, teriyaki, rosemary, garlic & herb', smallPriceCents: 8000, largePriceCents: 15000 },
  { name: 'Cajun Chicken Pasta', category: 'Entrées', smallPriceCents: 10000, largePriceCents: 15000 },
  { name: 'Jerk Chicken Alfredo', category: 'Entrées', smallPriceCents: 10000, largePriceCents: 15000 },
  { name: 'Jerk Salmon Pasta', category: 'Entrées', smallPriceCents: 15000, largePriceCents: 28000 },

  // Appetizers & Finger Foods
  { name: 'Empanadas — Buffalo Chicken', category: 'Appetizers', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Empanadas — Philly Steak', category: 'Appetizers', smallPriceCents: 8000, largePriceCents: 15000 },
  { name: 'Empanadas — Salmon', category: 'Appetizers', smallPriceCents: 8000, largePriceCents: 15000 },
  { name: 'Empanadas — Southwest Chicken', category: 'Appetizers', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Empanadas — Jerk Chicken Rolls', category: 'Appetizers', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Mini Taco Cups — Steak', category: 'Appetizers', smallPriceCents: 7500, largePriceCents: 14000 },
  { name: 'Mini Taco Cups — Chicken', category: 'Appetizers', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Mini Taco Cups — Ground Beef or Turkey', category: 'Appetizers', smallPriceCents: 5500, largePriceCents: 10000 },
  { name: 'Sliders — Philly Steak', category: 'Appetizers', smallPriceCents: 8000, largePriceCents: 15000 },
  { name: 'Sliders — Chicken', category: 'Appetizers', smallPriceCents: 7000, largePriceCents: 13000 },
  { name: 'Sliders — Salmon', category: 'Appetizers', smallPriceCents: 8000, largePriceCents: 15000 },
  { name: 'Pasta Salad — Veggie', category: 'Appetizers', smallPriceCents: 5000, largePriceCents: 9000 },
  { name: 'Pasta Salad — Chicken', category: 'Appetizers', description: 'jerk or Greek', smallPriceCents: 6000, largePriceCents: 10000 },
  { name: 'Pasta Salad — Seafood', category: 'Appetizers', smallPriceCents: 7000, largePriceCents: 13000 },
  { name: 'Garden Salad', category: 'Appetizers', smallPriceCents: 4000, largePriceCents: 6000 },
  { name: 'Caesar Salad', category: 'Appetizers', smallPriceCents: 4000, largePriceCents: 6000 },
  { name: 'Caesar Salad w/ Chicken', category: 'Appetizers', smallPriceCents: 6000, largePriceCents: 8000 },
  { name: 'Charcuterie Board', category: 'Appetizers', smallPriceCents: 8000, largePriceCents: 15000 },
  { name: 'Fried or Garlic Butter Shrimp', category: 'Appetizers', smallPriceCents: 10000, largePriceCents: 18000 },
  { name: 'Chicken Breast Bites', category: 'Appetizers', smallPriceCents: 8000, largePriceCents: 15000 },
  { name: 'Salmon Bites', category: 'Appetizers', smallPriceCents: 10000, largePriceCents: 18000 },
  { name: 'Meatballs', category: 'Appetizers', smallPriceCents: 6000, largePriceCents: 10000 },
  { name: 'Rolls', category: 'Appetizers', smallPriceCents: 3500, largePriceCents: 5500 },
  { name: 'Sub Sandwich or Wraps', category: 'Appetizers', smallPriceCents: 7500, largePriceCents: 7500 },
  { name: 'Veggie Tray', category: 'Appetizers', smallPriceCents: 4000, largePriceCents: 4000 },
  { name: 'Fruit Tray', category: 'Appetizers', smallPriceCents: 4500, largePriceCents: 4500 },

  // Sides (small pan 10-15 | large pan 25-30)
  { name: 'Asparagus', category: 'Sides', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Lasagna or Stuffed Shells', category: 'Sides', smallPriceCents: 8500, largePriceCents: 15000 },
  { name: 'Salmon Stuffed Shells', category: 'Sides', smallPriceCents: 10000, largePriceCents: 18000 },
  { name: 'Mostaccioli or Spaghetti', category: 'Sides', smallPriceCents: 7500, largePriceCents: 14000 },
  { name: 'White Spaghetti', category: 'Sides', smallPriceCents: 8500, largePriceCents: 15000 },
  { name: 'Red Beans & Rice', category: 'Sides', smallPriceCents: 7500, largePriceCents: 14000 },
  { name: 'Dirty Rice', category: 'Sides', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Green Beans', category: 'Sides', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Creamed Corn', category: 'Sides', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Garlic Sautéed Spinach', category: 'Sides', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Broccoli', category: 'Sides', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Cabbage', category: 'Sides', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Garlic Mashed Potatoes', category: 'Sides', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Roasted Potatoes', category: 'Sides', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Pesto Potatoes', category: 'Sides', smallPriceCents: 7500, largePriceCents: 14000 },
  { name: 'Garlic Parmesan Potatoes', category: 'Sides', smallPriceCents: 7500, largePriceCents: 14000 },
  { name: 'Dressing', category: 'Sides', smallPriceCents: 7500, largePriceCents: 14000 },
  { name: 'Seafood Dressing', category: 'Sides', smallPriceCents: 10000, largePriceCents: 18000 },
  { name: 'Sweet Potatoes', category: 'Sides', smallPriceCents: 7500, largePriceCents: 12000 },
  { name: 'Mac & Cheese', category: 'Sides', smallPriceCents: 7500, largePriceCents: 13500 },
  { name: 'Garlic White Cheddar Mac', category: 'Sides', smallPriceCents: 7500, largePriceCents: 13500 },
  { name: 'Mac & Cheese w/ Seafood', category: 'Sides', smallPriceCents: 12000, largePriceCents: 20000 },
  { name: 'Pot Roast Mac & Cheese', category: 'Sides', smallPriceCents: 12000, largePriceCents: 20000 },

  // Breakfast & Brunch
  { name: 'Salmon Croquettes', category: 'Breakfast & Brunch', smallPriceCents: 7500, largePriceCents: 14000 },
  { name: 'Shrimp Grits', category: 'Breakfast & Brunch', smallPriceCents: 8000, largePriceCents: 15000 },
  { name: 'Chicken Alfredo Grits', category: 'Breakfast & Brunch', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Egg Casserole', category: 'Breakfast & Brunch', smallPriceCents: 5000, largePriceCents: 7500 },
  { name: 'Breakfast Potatoes & Onions', category: 'Breakfast & Brunch', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Turkey Sausage & Peppers', category: 'Breakfast & Brunch', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Pork or Turkey Bacon', category: 'Breakfast & Brunch', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'French Toast Casserole', category: 'Breakfast & Brunch', smallPriceCents: 6000, largePriceCents: 10000 },
  { name: 'Peach Cobbler Casserole', category: 'Breakfast & Brunch', smallPriceCents: 7500, largePriceCents: 12500 },
  { name: 'Waffles', category: 'Breakfast & Brunch', smallPriceCents: 6000, largePriceCents: 10000 },
  { name: 'Cinnamon Roll Waffles', category: 'Breakfast & Brunch', smallPriceCents: 7500, largePriceCents: 14000 },
  { name: 'Breakfast Pastry Platter', category: 'Breakfast & Brunch', smallPriceCents: 8500, largePriceCents: 15000 },
  { name: 'Smoke Salmon Bagel Tray', category: 'Breakfast & Brunch', smallPriceCents: 10000, largePriceCents: 18500 },
  { name: 'Breakfast Sliders — Ham & Swiss w/ Eggs', category: 'Breakfast & Brunch', smallPriceCents: 7000, largePriceCents: 12000 },
  { name: 'Breakfast Sliders — Philly Steak w/ Pesto Eggs', category: 'Breakfast & Brunch', smallPriceCents: 8500, largePriceCents: 15000 },

  // Desserts
  { name: 'Peach Cobbler Empanada', category: 'Desserts', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Caramel Apple Empanadas', category: 'Desserts', smallPriceCents: 6500, largePriceCents: 12000 },
  { name: 'Mini Pastry Tray', category: 'Desserts', smallPriceCents: 6000, largePriceCents: 11000 },
  { name: 'Cookie & Brownie Tray', category: 'Desserts', smallPriceCents: 6000, largePriceCents: 11000 },
  { name: 'Sweet Potato Pie', category: 'Desserts', smallPriceCents: 2500, largePriceCents: 2500 },
  { name: 'Pound Cake', category: 'Desserts', smallPriceCents: 4000, largePriceCents: 4000 },
];

// --- Meal Prep Menu ---
export const MEAL_PREP_PREFIXE = [
  { name: 'Pepper Steak, Rice & Broccoli', price: 25 },
  { name: 'Lasagna w/ Turkey Italian Sausage & Mixed Green Salad', price: 30 },
  { name: 'Cajun or Jerk Chicken Pasta w/ Broccoli', price: 25 },
  { name: 'Cajun or Jerk Salmon Pasta w/ Asparagus', price: 30 },
  { name: 'Cajun Shrimp, Garlic Butter Noodles & Asparagus', price: 25 },
  { name: 'Philly Steak Pasta w/ Asparagus', price: 30 },
  { name: 'White Spaghetti w/ Turkey Italian Sausage & Roast Vegetables', price: 25 },
  { name: 'Stuffed Salmon Shells w/ Roasted Vegetables', price: 30 },
  { name: 'Turkey Meatballs w/ Garlic Mashed Potatoes & Roasted Vegetables', price: 25 },
  { name: 'Chimichurri Chicken w/ Garlic Parmesan Potatoes & Roasted Vegetables', price: 25 },
  { name: 'Garlic Butter Salmon w/ Asparagus & Mashed Potatoes', price: 30 },
  { name: 'Turkey Meatballs w/ Mashed Potatoes & Asparagus', price: 25 },
  { name: 'Chimichurri Steak Bites w/ Mashed Potatoes & Jalapeño Cream Corn', price: 30 },
  { name: 'Beef Short Ribs w/ Brussel Sprouts, White Cheddar Mac & Cheese', price: 30 },
  { name: 'Stuffed Chicken Breast w/ Roasted Potatoes & Brussel Sprouts', price: 30 },
  { name: 'Stuffed Salmon w/ Mashed Potatoes & Asparagus', price: 30 },
];

export const MEAL_PREP_BUILD_YOUR_OWN = {
  description: '6 different meals will be prepared',
  proteins: {
    pick: 3,
    options: [
      'Salmon (fried, jerk, lemon garlic, teriyaki, garlic & herb)',
      'Lamb Chops (garlic butter, greek, parmesan crusted, jerk, fried)',
      'Beef Short Ribs',
      'Pot Roast',
      'Turkey Meatballs',
      'Stuffed Chicken Breast',
      'Stuffed Salmon',
      'Chicken (fried, jerk, lemon garlic, greek, spicy garlic, garlic & herbs)',
    ],
  },
  vegetables: {
    pick: 2,
    options: [
      'Green Beans', 'Asparagus', 'Roasted Vegetables', 'Broccoli',
      'Greens', 'Cabbage', 'Garlic Sautéed Spinach', 'Jalapeño Cream Corn', 'Brussel Sprouts',
    ],
  },
  sides: {
    pick: 2,
    options: [
      'Mac & Cheese (yellow cheddar or white cheddar)', 'Oven Roasted Potatoes',
      'Garlic Mashed Potatoes', 'Sweet Potatoes', 'Red Beans and Rice',
      'Lemon Garlic Rice', 'Dirty Rice', 'Parmesan Garlic Roasted Potatoes',
    ],
  },
};

export const BUSINESS_MEETING_MENUS = [
  {
    name: 'Pasta Bar',
    items: ['Cajun chicken pasta', 'Jerk salmon pasta', 'Broccoli', 'Caesar Salad', 'Fruit tray', 'Assorted beverages', 'Assorted snacks'],
  },
  {
    name: 'Taco Bar',
    items: ['Jerk chicken taco meat', 'Steak taco meat', 'Ground turkey taco meat', 'Jalapeño cream corn', 'Toppings (shells, sour cream, pico, lettuce, cheese, etc.)', 'Fruit tray', 'Assorted beverages', 'Assorted snacks'],
  },
  {
    name: 'Plated Entrées',
    items: ['Garlic & herbs chicken', 'Teriyaki Salmon', 'Garlic mashed potatoes', 'Asparagus', 'Fruit tray', 'Assorted beverages', 'Assorted snacks'],
  },
  {
    name: 'Bites & Bowls',
    items: ['Garlic butter salmon bites', 'Cajun butter chicken bites', 'White cheddar Mac & cheese', 'Roasted vegetables', 'Fruit tray', 'Assorted beverages', 'Assorted snacks'],
  },
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
    description: 'Fresh pans delivered to your venue, ready to serve. Flat delivery fee covers gas and transport.',
    pricePerPerson: 50,
    minGuests: 1,
    icon: 'truck',
    includes: ['Freshly prepared food', 'Delivery to your venue', '$50 flat delivery fee'],
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
    answer: 'Menu items are priced per half pan or full pan — perfect for feeding groups of any size. Full-service catering with setup and servers is also available. Final pricing depends on your menu selections, pan sizes, and event details. Reach out for a free estimate!',
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
