import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Instagram,
  Mail,
  Phone,
  ArrowRight,
  ChevronRight,
  Heart,
  Utensils,
  Truck,
  Cake,
  Layout,
  Zap,
  Coffee,
  Lightbulb,
  Eye,
  MessageCircle,
  Download,
  CreditCard,
  Calendar,
  Check,
  ChevronLeft,
  Minus,
  Plus,
  Clock,
  FileText
} from 'lucide-react';

// --- Platform Mapping ---
const MOCKUP_META: Record<string, { label: string; platform: string; platformColor: string; why: string }> = {
  A: { label: 'Minimal Editorial', platform: 'Squarespace', platformColor: 'bg-zinc-900', why: 'Clean editorial templates are Squarespace\'s strength. This layout maps 1:1 to their best themes.' },
  B: { label: 'Bold & Modern', platform: 'Custom Code', platformColor: 'bg-blue-600', why: 'The massive typography, inverted sections, and asymmetric gallery need full CSS control.' },
  C: { label: 'Warm & Inviting', platform: 'Square Online', platformColor: 'bg-emerald-600', why: 'Card-based, friendly layout. Square adds POS, invoicing, and customer management built in.' },
  D: { label: 'Brutalist Grid', platform: 'WordPress', platformColor: 'bg-indigo-600', why: 'Grid-based structure works well with WordPress page builders like Elementor or Kadence.' },
  E: { label: 'Organic Story', platform: 'Squarespace', platformColor: 'bg-zinc-900', why: 'Organic shapes and editorial flow. Squarespace\'s Brine/Bedford family handles this beautifully.' },
};

// --- Annotation System ---
const ANNOTATIONS: Record<string, { id: string; label: string; category: 'trust' | 'cta' | 'conversion' | 'catering'; note: string }[]> = {
  hero: [
    { id: 'hero-headline', label: 'Emotional Headline', category: 'conversion', note: 'Leads with feeling, not features. "Soulful food" speaks to the experience, not the transaction. Caterers sell memories, not just meals.' },
    { id: 'hero-specificity', label: 'Chicago-Specific', category: 'trust', note: 'Naming the city builds local trust. Customers searching "Chicago catering" find relevance immediately.' },
  ],
  form: [
    { id: 'form-fields', label: 'Catering-Specific Fields', category: 'catering', note: 'Event type, date, and guest count let Nikida qualify leads before the first call. She knows budget range from guest count alone.' },
    { id: 'form-event-types', label: 'Funeral/Repast Option', category: 'catering', note: 'Most catering sites miss this. Repast catering is steady, recurring business in Black communities. Including it signals cultural understanding.' },
    { id: 'form-response-time', label: '"24 Hour" Response Promise', category: 'trust', note: 'Sets expectations and builds confidence. A visitor who knows when they\'ll hear back is more likely to submit.' },
    { id: 'form-position', label: 'Form Above the Fold', category: 'cta', note: 'The #1 goal of a catering site is lead capture. Putting the form high means visitors don\'t have to scroll to convert.' },
  ],
  services: [
    { id: 'services-tiers', label: '3-Tier Service Menu', category: 'catering', note: 'Full-service, drop-off, and custom. Three tiers let customers self-select by budget and need. This is how caterers actually sell.' },
    { id: 'services-pricing', label: 'Starting-At Pricing', category: 'conversion', note: '"Starting at $XX/person" anchors expectations without locking in a number. Reduces sticker shock and pre-qualifies budget.' },
  ],
  about: [
    { id: 'about-story', label: 'Origin Story', category: 'trust', note: 'People buy from people. "What started as cooking for family" makes Nikida relatable and builds emotional connection.' },
    { id: 'about-portrait', label: 'Chef Portrait', category: 'trust', note: 'Showing the person behind the food builds trust. Catering is personal — clients want to know who\'s in their kitchen.' },
    { id: 'about-location', label: 'South Side Chicago', category: 'trust', note: 'Neighborhood specificity builds community trust. Local customers feel seen. It\'s not generic, it\'s theirs.' },
  ],
  gallery: [
    { id: 'gallery-food', label: 'Food Photography', category: 'conversion', note: 'The gallery does more selling than any copy. People eat with their eyes first. Every image should make them hungry.' },
  ],
  dishes: [
    { id: 'dishes-names', label: 'Signature Dish Names', category: 'catering', note: 'Named dishes ("Signature Soul Rolls") create brand identity. Customers remember and request them by name.' },
    { id: 'dishes-descriptions', label: 'Sensory Descriptions', category: 'conversion', note: '"Creamy, buttery grits topped with seasoned shrimp" — sensory language triggers cravings. This is the menu doing the selling.' },
  ],
  footer: [
    { id: 'footer-social', label: 'Instagram Link', category: 'cta', note: 'Instagram is the #1 discovery platform for caterers. Every visitor who follows is a future lead.' },
  ],
};

const CATEGORY_STYLES = {
  trust: { bg: 'bg-amber-500', label: 'Trust Signal' },
  cta: { bg: 'bg-blue-500', label: 'CTA' },
  conversion: { bg: 'bg-emerald-500', label: 'Conversion' },
  catering: { bg: 'bg-purple-500', label: 'Catering-Specific' },
};

// --- Annotation Tooltip Component ---
const Annotation: React.FC<{ annotation: typeof ANNOTATIONS['hero'][0]; showAnnotations: boolean }> = ({ annotation, showAnnotations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const style = CATEGORY_STYLES[annotation.category];

  if (!showAnnotations) return null;

  return (
    <div className="relative inline-block z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${style.bg} text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center space-x-1 whitespace-nowrap`}
      >
        <Lightbulb className="w-3 h-3" />
        <span>{annotation.label}</span>
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-white text-black rounded-xl shadow-2xl border border-zinc-200 p-4 z-[200]">
          <div className="flex items-center justify-between mb-2">
            <span className={`${style.bg} text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full`}>
              {style.label}
            </span>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-black">
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs leading-relaxed text-zinc-700">{annotation.note}</p>
          <div className="absolute bottom-0 left-4 translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-zinc-200"></div>
        </div>
      )}
    </div>
  );
};

// --- Inline Annotation Badge Row ---
const SectionNotes = ({ section, show }: { section: string; show: boolean }) => {
  const items = ANNOTATIONS[section] || [];
  if (!show || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2 py-3 px-4 mx-4 my-2 bg-zinc-900/95 backdrop-blur-sm rounded-xl border border-zinc-700"
    >
      {items.map((a) => (
        <Annotation key={a.id} annotation={a} showAnnotations={show} />
      ))}
    </motion.div>
  );
};

// --- Signature Dishes Data ---
const SIGNATURE_DISHES = [
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
const CATERING_PACKAGES = [
  {
    id: 'full-service',
    name: 'Full-Service Catering',
    description: 'On-site chef, service staff, setup, and cleanup. You just show up.',
    pricePerPerson: 45,
    minGuests: 25,
    icon: <Utensils className="w-5 h-5" />,
    includes: ['Menu planning consultation', 'On-site chef & preparation', 'Professional service staff', 'Full setup & cleanup', 'China, linen & flatware'],
  },
  {
    id: 'drop-off',
    name: 'Drop-Off Catering',
    description: 'Fresh platters and trays delivered to your venue, ready to serve.',
    pricePerPerson: 25,
    minGuests: 10,
    icon: <Truck className="w-5 h-5" />,
    includes: ['Freshly prepared food', 'Disposable serving ware', 'Delivery to your venue', 'Heating & setup instructions'],
  },
  {
    id: 'custom',
    name: 'Custom Menu & Treats',
    description: 'Specialty desserts, holiday treats, and menus built around your vision.',
    pricePerPerson: 35,
    minGuests: 1,
    icon: <Cake className="w-5 h-5" />,
    includes: ['Custom menu design', 'Tasting session', 'Specialty desserts & treats', 'Flexible service options'],
  },
];

const MENU_ADDONS = [
  { id: 'dessert-table', name: 'Dessert Table', price: 150, per: 'flat' as const },
  { id: 'beverage', name: 'Beverage Service', price: 8, per: 'person' as const },
  { id: 'extra-protein', name: 'Extra Protein Option', price: 5, per: 'person' as const },
  { id: 'decor', name: 'Setup & Basic Décor', price: 200, per: 'flat' as const },
  { id: 'servers', name: 'Additional Servers (2hr)', price: 120, per: 'flat' as const },
];

const DEPOSIT_RATE = 0.25;

// --- Booking Flow Hook ---
type BookingStep = 'package' | 'details' | 'quote' | 'deposit' | 'confirmed';

const useBookingFlow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<BookingStep>('package');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [guests, setGuests] = useState(50);
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('12:00');
  const [addons, setAddons] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const pkg = CATERING_PACKAGES.find(p => p.id === selectedPackage);

  const total = (() => {
    let t = pkg ? pkg.pricePerPerson * guests : 0;
    addons.forEach(id => {
      const a = MENU_ADDONS.find(x => x.id === id);
      if (a) t += a.per === 'person' ? a.price * guests : a.price;
    });
    return t;
  })();

  const deposit = Math.round(total * DEPOSIT_RATE);

  const open = () => { setIsOpen(true); setStep('package'); };
  const close = () => setIsOpen(false);
  const toggleAddon = (id: string) => setAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return {
    isOpen, step, selectedPackage, guests, eventType, eventDate, eventTime, addons, notes, pkg, total, deposit,
    setStep, setSelectedPackage, setGuests, setEventType, setEventDate, setEventTime, setNotes, toggleAddon,
    open, close,
  };
};

// --- Download Menu PDF ---
const downloadMenu = () => {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Perfect Perfections Catering — Menu</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;color:#1a1a1a;max-width:700px;margin:0 auto;padding:60px 40px}
h1{font-size:28px;text-align:center;margin-bottom:6px}h2{font-size:13px;text-align:center;letter-spacing:4px;text-transform:uppercase;color:#888;margin-bottom:40px;font-weight:400}
h3{font-size:20px;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #000}.section{margin-bottom:36px}
.item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dotted #ddd}.item-name{font-weight:bold}.item-desc{color:#666;font-size:13px;margin-top:2px}
.pkg{margin-bottom:20px;padding:16px;border:1px solid #eee}.pkg-title{font-weight:bold;font-size:16px;margin-bottom:4px}.pkg-price{color:#666;font-size:14px}
.footer{margin-top:40px;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:20px}
@media print{body{padding:40px 30px}}</style></head><body>
<h1>Perfect Perfections Catering</h1><h2>Menu & Packages</h2>
<div class="section"><h3>Signature Dishes</h3>
${SIGNATURE_DISHES.map(d => `<div class="item"><div><div class="item-name">${d.name}</div><div class="item-desc">${d.description}</div></div></div>`).join('')}
</div>
<div class="section"><h3>Catering Packages</h3>
${CATERING_PACKAGES.map(p => `<div class="pkg"><div class="pkg-title">${p.name}</div><div class="pkg-price">Starting at $${p.pricePerPerson}/person · Min ${p.minGuests} guests</div><div class="item-desc" style="margin-top:8px">${p.includes.join(' · ')}</div></div>`).join('')}
</div>
<div class="section"><h3>Add-Ons</h3>
${MENU_ADDONS.map(a => `<div class="item"><span class="item-name">${a.name}</span><span>$${a.price}${a.per === 'person' ? '/person' : ' flat'}</span></div>`).join('')}
</div>
<div class="footer">Perfect Perfections Catering · Chicago, IL<br>For inquiries and bookings, contact us directly.</div>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'perfect-perfections-menu.html';
  a.click();
  URL.revokeObjectURL(url);
};

// --- Floating Contact Button ---
const FloatingContact = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-8 right-6 z-[101] flex flex-col items-end space-y-3">
      <AnimatePresence>
        {expanded && (
          <>
            <motion.a
              href="tel:+17730000000"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-2 bg-emerald-500 text-white pl-4 pr-5 py-3 rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              <Phone className="w-4 h-4" />
              <span className="text-xs font-bold">Call</span>
            </motion.a>
            <motion.a
              href="sms:+17730000000"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ delay: 0.05 }}
              className="flex items-center space-x-2 bg-blue-500 text-white pl-4 pr-5 py-3 rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-bold">Text</span>
            </motion.a>
            <motion.a
              href="https://instagram.com"
              target="_blank"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="flex items-center space-x-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white pl-4 pr-5 py-3 rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              <Instagram className="w-4 h-4" />
              <span className="text-xs font-bold">DM</span>
            </motion.a>
          </>
        )}
      </AnimatePresence>
      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-black text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all"
      >
        {expanded ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

// --- Booking Flow Modal ---
const BookingModal = ({ flow }: { flow: ReturnType<typeof useBookingFlow> }) => {
  if (!flow.isOpen) return null;

  const stepInfo: Record<BookingStep, { num: number; title: string }> = {
    package: { num: 1, title: 'Choose Your Package' },
    details: { num: 2, title: 'Event Details & Customize' },
    quote: { num: 3, title: 'Your Quote' },
    deposit: { num: 4, title: 'Secure Your Date' },
    confirmed: { num: 5, title: 'Booking Confirmed' },
  };
  const info = stepInfo[flow.step];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && flow.close()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-zinc-100 px-8 py-5 flex justify-between items-center rounded-t-3xl z-10">
          <div className="flex items-center space-x-4">
            {flow.step !== 'package' && flow.step !== 'confirmed' && (
              <button
                onClick={() => {
                  const order: BookingStep[] = ['package', 'details', 'quote', 'deposit', 'confirmed'];
                  const idx = order.indexOf(flow.step);
                  if (idx > 0) flow.setStep(order[idx - 1]);
                }}
                className="p-1 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Step {info.num} of 5</p>
              <h2 className="text-lg font-bold">{info.title}</h2>
            </div>
          </div>
          <button onClick={flow.close} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-8 pt-4">
          <div className="flex space-x-1">
            {['package', 'details', 'quote', 'deposit', 'confirmed'].map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${i < info.num ? 'bg-black' : 'bg-zinc-200'}`} />
            ))}
          </div>
        </div>

        <div className="p-8">
          {/* Step 1: Package Selection */}
          {flow.step === 'package' && (
            <div className="space-y-4">
              {CATERING_PACKAGES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    flow.setSelectedPackage(p.id);
                    flow.setGuests(Math.max(flow.guests, p.minGuests));
                    flow.setStep('details');
                  }}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all hover:border-black hover:shadow-lg ${
                    flow.selectedPackage === p.id ? 'border-black bg-zinc-50' : 'border-zinc-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-zinc-100 rounded-xl">{p.icon}</div>
                      <div>
                        <h3 className="font-bold text-lg">{p.name}</h3>
                        <p className="text-sm text-zinc-500 mt-1">{p.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className="text-xl font-bold">${p.pricePerPerson}</span>
                      <span className="text-xs text-zinc-400 block">/person</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.includes.map((item) => (
                      <span key={item} className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full">{item}</span>
                    ))}
                  </div>
                </button>
              ))}
              <button onClick={downloadMenu} className="w-full flex items-center justify-center space-x-2 py-4 text-sm text-zinc-500 hover:text-black transition-colors">
                <Download className="w-4 h-4" />
                <span>Download Full Menu (PDF)</span>
              </button>
            </div>
          )}

          {/* Step 2: Event Details */}
          {flow.step === 'details' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Event Type</label>
                  <select
                    value={flow.eventType}
                    onChange={(e) => flow.setEventType(e.target.value)}
                    className="w-full border-2 border-zinc-200 rounded-xl p-4 outline-none focus:border-black transition-colors"
                  >
                    <option value="">Select Type</option>
                    {['Wedding', 'Corporate', 'Private Party', 'Birthday', 'Holiday', 'Graduation', 'Funeral/Repast', 'Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Event Date</label>
                  <input
                    type="date"
                    value={flow.eventDate}
                    onChange={(e) => flow.setEventDate(e.target.value)}
                    className="w-full border-2 border-zinc-200 rounded-xl p-4 outline-none focus:border-black transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Start Time</label>
                  <input
                    type="time"
                    value={flow.eventTime}
                    onChange={(e) => flow.setEventTime(e.target.value)}
                    className="w-full border-2 border-zinc-200 rounded-xl p-4 outline-none focus:border-black transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Guests</label>
                  <div className="flex items-center border-2 border-zinc-200 rounded-xl">
                    <button onClick={() => flow.setGuests(Math.max(flow.pkg?.minGuests || 1, flow.guests - 5))} className="p-4 hover:bg-zinc-50 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center text-xl font-bold">{flow.guests}</span>
                    <button onClick={() => flow.setGuests(flow.guests + 5)} className="p-4 hover:bg-zinc-50 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Add-Ons</label>
                {MENU_ADDONS.map((addon) => (
                  <button
                    key={addon.id}
                    onClick={() => flow.toggleAddon(addon.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      flow.addons.includes(addon.id) ? 'border-black bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${flow.addons.includes(addon.id) ? 'border-black bg-black' : 'border-zinc-300'}`}>
                        {flow.addons.includes(addon.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-medium">{addon.name}</span>
                    </div>
                    <span className="text-sm text-zinc-500">+${addon.price}{addon.per === 'person' ? '/person' : ' flat'}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Special Requests</label>
                <textarea
                  value={flow.notes}
                  onChange={(e) => flow.setNotes(e.target.value)}
                  placeholder="Dietary restrictions, allergies, special dishes, theme..."
                  className="w-full border-2 border-zinc-200 rounded-xl p-4 outline-none focus:border-black transition-colors h-24"
                />
              </div>

              <button
                onClick={() => flow.setStep('quote')}
                disabled={!flow.eventType || !flow.eventDate}
                className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                See Your Quote →
              </button>
            </div>
          )}

          {/* Step 3: Quote */}
          {flow.step === 'quote' && flow.pkg && (
            <div className="space-y-8">
              <div className="bg-zinc-50 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
                  <div>
                    <p className="font-bold">{flow.pkg.name}</p>
                    <p className="text-sm text-zinc-500">${flow.pkg.pricePerPerson}/person × {flow.guests} guests</p>
                  </div>
                  <span className="text-xl font-bold">${flow.pkg.pricePerPerson * flow.guests}</span>
                </div>
                {flow.addons.map(id => {
                  const addon = MENU_ADDONS.find(a => a.id === id);
                  if (!addon) return null;
                  const cost = addon.per === 'person' ? addon.price * flow.guests : addon.price;
                  return (
                    <div key={id} className="flex justify-between text-sm">
                      <span className="text-zinc-600">{addon.name}{addon.per === 'person' ? ` ($${addon.price} × ${flow.guests})` : ''}</span>
                      <span className="font-medium">${cost}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between pt-4 border-t border-zinc-200 text-lg font-bold">
                  <span>Total</span>
                  <span>${flow.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-800 font-bold">Deposit to Secure Your Date</p>
                  <p className="text-xs text-emerald-600">25% of total — remainder due 7 days before event</p>
                </div>
                <span className="text-2xl font-bold text-emerald-800">${flow.deposit.toLocaleString()}</span>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-6 space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-zinc-600">
                  <Calendar className="w-4 h-4" />
                  <span>{flow.eventType} · {flow.eventDate} at {flow.eventTime}</span>
                </div>
                <div className="flex items-center space-x-2 text-zinc-600">
                  <Utensils className="w-4 h-4" />
                  <span>{flow.guests} guests · {flow.pkg.name}</span>
                </div>
                {flow.notes && (
                  <div className="flex items-start space-x-2 text-zinc-600">
                    <FileText className="w-4 h-4 mt-0.5" />
                    <span>{flow.notes}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={downloadMenu} className="flex items-center justify-center space-x-2 py-4 border-2 border-zinc-200 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download Quote</span>
                </button>
                <button
                  onClick={() => flow.setStep('deposit')}
                  className="flex items-center justify-center space-x-2 py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Deposit →</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Deposit Payment */}
          {flow.step === 'deposit' && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">${flow.deposit.toLocaleString()}</p>
                <p className="text-sm text-zinc-500">25% deposit to secure {flow.eventDate}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Card Number</label>
                  <input type="text" placeholder="4242 4242 4242 4242" maxLength={19} className="w-full border-2 border-zinc-200 rounded-xl p-4 outline-none focus:border-black transition-colors font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Expiry</label>
                    <input type="text" placeholder="MM/YY" maxLength={5} className="w-full border-2 border-zinc-200 rounded-xl p-4 outline-none focus:border-black transition-colors font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">CVC</label>
                    <input type="text" placeholder="123" maxLength={4} className="w-full border-2 border-zinc-200 rounded-xl p-4 outline-none focus:border-black transition-colors font-mono" />
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 rounded-xl p-4 flex items-center space-x-3 text-sm text-zinc-500">
                <CreditCard className="w-5 h-5 flex-shrink-0" />
                <span>This is a demo. No payment will be processed. In production, this connects to Square for secure payments.</span>
              </div>

              <button
                onClick={() => flow.setStep('confirmed')}
                className="w-full bg-black text-white py-5 rounded-xl font-bold text-lg uppercase tracking-widest hover:bg-zinc-800 transition-colors"
              >
                Complete Deposit · ${flow.deposit.toLocaleString()}
              </button>
            </div>
          )}

          {/* Step 5: Confirmed */}
          {flow.step === 'confirmed' && (
            <div className="text-center space-y-8 py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">You're Booked!</h3>
                <p className="text-zinc-500">Deposit of ${flow.deposit.toLocaleString()} received. Nikida will reach out within 24 hours to finalize your menu.</p>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-6 text-left space-y-3 text-sm max-w-sm mx-auto">
                <div className="flex justify-between"><span className="text-zinc-500">Event</span><span className="font-medium">{flow.eventType}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Date</span><span className="font-medium">{flow.eventDate}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Time</span><span className="font-medium">{flow.eventTime}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Guests</span><span className="font-medium">{flow.guests}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Package</span><span className="font-medium">{flow.pkg?.name}</span></div>
                <div className="flex justify-between border-t border-zinc-200 pt-3"><span className="text-zinc-500">Total</span><span className="font-bold">${flow.total.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Deposit Paid</span><span className="font-bold text-emerald-600">${flow.deposit.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Remaining</span><span className="font-medium">${(flow.total - flow.deposit).toLocaleString()}</span></div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">What Happens Next</p>
                <div className="flex items-center space-x-3 text-sm text-zinc-600 justify-center">
                  <Clock className="w-4 h-4" />
                  <span>Nikida confirms your date within 24 hours</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-zinc-600 justify-center">
                  <Utensils className="w-4 h-4" />
                  <span>Menu tasting scheduled 2 weeks before event</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-zinc-600 justify-center">
                  <CreditCard className="w-4 h-4" />
                  <span>Remaining balance due 7 days before event</span>
                </div>
              </div>

              <button
                onClick={flow.close}
                className="bg-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Mockup A: Minimal Editorial ---
const MockupA = ({ grayscale, showAnnotations, onBook }: { grayscale: string; showAnnotations: boolean; onBook: () => void }) => {
  const { status, submitLead } = useLeadForm();

  return (
    <div className="bg-white text-[#0A0A0A] font-dm-sans min-h-screen">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-[#E5E5E5]">
        <div className="text-xl font-playfair font-bold tracking-[0.2em] uppercase">
          Perfect Perfections
        </div>
        <div className="hidden md:flex space-x-8 text-sm uppercase tracking-widest">
          <a href="#" className="hover:opacity-50 transition-opacity">Services</a>
          <a href="#" className="hover:opacity-50 transition-opacity">About</a>
          <a href="#" className="hover:opacity-50 transition-opacity">Gallery</a>
          <button onClick={onBook} className="font-bold border-b border-black pb-1">Book Now</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080&fit=crop"
          alt="Elegant soul food"
          className={`absolute inset-0 w-full h-full object-cover opacity-80 ${grayscale}`}
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl mb-4">
            <span className="font-playfair italic block">Soulful food,</span>
            <span className="font-playfair font-bold block">perfectly crafted.</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-80 font-light">
            Chicago's premier soul food catering for events, gatherings, and celebrations
          </p>
        </div>
      </section>
      <SectionNotes section="hero" show={showAnnotations} />

      {/* Lead Capture */}
      <section className="py-24 px-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.3em] font-bold">Book Your Event</span>
            <div className="h-px bg-black w-full mt-2"></div>
          </div>
          {status === 'success' ? (
            <div className="bg-zinc-50 p-12 text-center border border-black">
              <h3 className="text-2xl font-playfair mb-2">Thank you, Nikida will be in touch!</h3>
              <p className="opacity-60">Your inquiry has been received.</p>
            </div>
          ) : (
            <form onSubmit={submitLead} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="name" required type="text" placeholder="Name" className="bg-[#F5F5F5] border border-black p-4 outline-none focus:ring-1 ring-black" />
              <input name="email" required type="email" placeholder="Email" className="bg-[#F5F5F5] border border-black p-4 outline-none focus:ring-1 ring-black" />
              <input name="phone" type="tel" placeholder="Phone" className="bg-[#F5F5F5] border border-black p-4 outline-none focus:ring-1 ring-black" />
              <input name="event_date" type="date" className="bg-[#F5F5F5] border border-black p-4 outline-none focus:ring-1 ring-black" />
              <select name="event_type" className="bg-[#F5F5F5] border border-black p-4 outline-none focus:ring-1 ring-black">
                <option value="">Event Type</option>
                <option value="Wedding">Wedding</option>
                <option value="Corporate">Corporate</option>
                <option value="Private Party">Private Party</option>
                <option value="Birthday">Birthday</option>
                <option value="Holiday">Holiday</option>
                <option value="Graduation">Graduation</option>
                <option value="Funeral/Repast">Funeral/Repast</option>
                <option value="Other">Other</option>
              </select>
              <input name="guests" type="number" placeholder="Estimated Guests" className="bg-[#F5F5F5] border border-black p-4 outline-none focus:ring-1 ring-black" />
              <textarea name="message" placeholder="Message/Details" className="bg-[#F5F5F5] border border-black p-4 outline-none focus:ring-1 ring-black md:col-span-2 h-32"></textarea>
              <button 
                disabled={status === 'submitting'}
                className="bg-black text-white py-4 px-8 uppercase tracking-widest font-bold hover:bg-opacity-80 transition-all md:col-span-2 disabled:opacity-50"
              >
                {status === 'submitting' ? 'Sending...' : 'Request a Consultation'}
              </button>
              {status === 'error' && <p className="text-red-500 text-xs text-center md:col-span-2">Something went wrong. Please try again.</p>}
              <p className="text-xs text-center md:col-span-2 opacity-60">We'll respond within 24 hours</p>
            </form>
          )}
        </div>
        <div className="order-1 lg:order-2 aspect-[4/5] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=1000&fit=crop"
            alt="Catering spread"
            className={`w-full h-full object-cover ${grayscale}`}
            referrerPolicy="no-referrer"
          />
        </div>
      </section>
      <SectionNotes section="form" show={showAnnotations} />

      {/* Services */}
      <section className="py-24 px-8 border-t border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-xs uppercase tracking-[0.3em] font-bold">Services</span>
            <div className="h-px bg-[#E5E5E5] w-full mt-2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-dm-sans">Full-Service Catering</h3>
              <p className="text-sm opacity-70 leading-relaxed">
                Complete event catering from menu planning to service and cleanup. Perfect for weddings, corporate events, and large gatherings.
              </p>
              <p className="text-sm font-medium">Starting at $XX per person</p>
            </div>
            <div className="space-y-4 border-l border-[#E5E5E5] pl-12">
              <h3 className="text-xl font-bold font-dm-sans">Drop-Off Catering</h3>
              <p className="text-sm opacity-70 leading-relaxed">
                Freshly prepared platters and trays delivered to your venue, ready to serve. Ideal for office lunches, house parties, and intimate events.
              </p>
              <p className="text-sm font-medium">Starting at $XX per person</p>
            </div>
            <div className="space-y-4 border-l border-[#E5E5E5] pl-12">
              <h3 className="text-xl font-bold font-dm-sans">Custom Menus & Treats</h3>
              <p className="text-sm opacity-70 leading-relaxed">
                Specialty desserts, holiday treats, and custom menus tailored to your event. From family recipes to new creations.
              </p>
              <p className="text-sm font-medium">Pricing varies</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 mt-12 pt-8 border-t border-[#E5E5E5]">
            <button onClick={onBook} className="bg-black text-white py-3 px-8 uppercase tracking-widest text-xs font-bold hover:bg-opacity-80 transition-all">View Packages & Pricing</button>
            <button onClick={downloadMenu} className="flex items-center space-x-2 text-xs uppercase tracking-widest font-bold opacity-60 hover:opacity-100 transition-opacity">
              <Download className="w-3.5 h-3.5" /><span>Download Menu</span>
            </button>
          </div>
        </div>
      </section>
      <SectionNotes section="services" show={showAnnotations} />

      {/* Signature Dishes */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-xs uppercase tracking-[0.3em] font-bold">Signature Dishes</span>
            <div className="h-px bg-black w-full mt-2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {SIGNATURE_DISHES.map((dish, i) => (
              <div key={i} className="space-y-6 group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${grayscale}`}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-playfair font-bold">{dish.name}</h3>
                  <p className="text-sm opacity-70 leading-relaxed">{dish.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SectionNotes section="dishes" show={showAnnotations} />

      {/* About */}
      <section className="py-24 px-8 bg-[#F9F9F9]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-bold">About Nikida</span>
            <p className="mt-8 text-lg leading-relaxed font-light">
              Behind every plate is a story. Nikida brings generations of flavor and soul to every event she touches. What started as cooking for family and friends has grown into Chicago's go-to for soulful, made-from-scratch catering that turns any gathering into something people remember.
            </p>
          </div>
          <div className="aspect-[4/5] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&h=1000&fit=crop"
              alt="Chef Nikida"
              className={`w-full h-full object-cover ${grayscale}`}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>
      <SectionNotes section="about" show={showAnnotations} />

      {/* Gallery */}
      <section className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.3em] font-bold">From Our Kitchen</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=800&fit=crop",
              "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=800&fit=crop",
              "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=800&fit=crop",
              "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=800&fit=crop",
              "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=800&fit=crop",
              "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=800&fit=crop"
            ].map((url, i) => (
              <div key={i} className="aspect-square overflow-hidden group cursor-pointer">
                <img
                  src={url}
                  alt="Soul food gallery"
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${grayscale}`}
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      <SectionNotes section="gallery" show={showAnnotations} />

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-2xl font-playfair font-bold tracking-widest uppercase">Perfect Perfections Catering</h2>
          <div className="flex justify-center space-x-8 text-sm opacity-70">
            <a href="#" className="hover:opacity-100">Phone</a>
            <a href="#" className="hover:opacity-100">Email</a>
            <a href="#" className="hover:opacity-100">Instagram</a>
          </div>
          <p className="text-sm opacity-50">Chicago, Illinois</p>
          <p className="text-xs opacity-30">© 2026</p>
        </div>
      </footer>
      <SectionNotes section="footer" show={showAnnotations} />
    </div>
  );
};

// --- Mockup B: Bold & Modern ---
const MockupB = ({ grayscale, showAnnotations, onBook }: { grayscale: string; showAnnotations: boolean; onBook: () => void }) => {
  const { status, submitLead } = useLeadForm();

  return (
    <div className="bg-[#0A0A0A] text-white font-inter min-h-screen">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-8">
        <div className="text-3xl font-oswald font-bold uppercase tracking-tighter">
          Perfect Perfections
        </div>
        <div className="hidden md:flex space-x-12 text-[11px] font-bold uppercase tracking-[0.2em]">
          <a href="#" className="hover:opacity-50 transition-opacity">Services</a>
          <a href="#" className="hover:opacity-50 transition-opacity">About</a>
          <a href="#" className="hover:opacity-50 transition-opacity">Gallery</a>
          <button onClick={onBook} className="hover:opacity-50 transition-opacity">Book</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center px-8 py-20">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=1080&fit=crop"
            alt="Background"
            className={`w-full h-full object-cover ${grayscale}`}
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-5xl">
          <h1 className="text-[120px] md:text-[180px] leading-[0.85] font-oswald font-bold uppercase mb-8">
            Soul Food<br />Perfected.
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-xl mb-12 opacity-80">
            Catering for Chicago's finest events. From intimate dinners to grand celebrations.
          </p>
          <button onClick={onBook} className="border-2 border-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all group">
            Book Now <span className="inline-block transition-transform group-hover:translate-x-2">→</span>
          </button>
        </div>
      </section>
      <SectionNotes section="hero" show={showAnnotations} />

      {/* Services */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] uppercase tracking-[0.3em] font-bold opacity-50 mb-16 block">What We Do</span>
          <div className="space-y-0">
            {[
              { id: '01', title: 'Full-Service Catering', desc: 'Menu planning, preparation, on-site service, and cleanup. Weddings, corporate, and large-scale events.', price: 'FROM $XX/PERSON' },
              { id: '02', title: 'Drop-Off Catering', desc: 'Platters and trays delivered ready to serve. Office lunches, house parties, intimate events.', price: 'FROM $XX/PERSON' },
              { id: '03', title: 'Custom Menus & Treats', desc: 'Specialty desserts, holiday treats, and bespoke menus built around your vision.', price: 'CUSTOM PRICING' }
            ].map((service) => (
              <div key={service.id} className="group border-t border-white/20 py-16 grid grid-cols-1 md:grid-cols-[100px_1fr_300px] gap-8 items-center hover:bg-white/5 transition-colors px-4">
                <span className="text-4xl font-light opacity-30">{service.id}</span>
                <div className="space-y-4">
                  <h3 className="text-3xl font-oswald font-bold uppercase">{service.title}</h3>
                  <p className="text-lg opacity-60 font-light max-w-xl">{service.desc}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono tracking-widest group-hover:underline cursor-pointer">{service.price} →</span>
                </div>
              </div>
            ))}
            <div className="border-t border-white/20"></div>
          </div>
          <div className="flex items-center space-x-8 mt-16">
            <button onClick={onBook} className="border-2 border-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">View Packages & Pricing</button>
            <button onClick={downloadMenu} className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
              <Download className="w-4 h-4" /><span>Download Menu</span>
            </button>
          </div>
        </div>
      </section>
      <SectionNotes section="services" show={showAnnotations} />

      {/* Signature Dishes */}
      <section className="py-32 px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] uppercase tracking-[0.3em] font-bold opacity-50 mb-16 block">Signature Dishes</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {SIGNATURE_DISHES.map((dish, i) => (
              <div key={i} className="group flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-48 h-48 flex-shrink-0 overflow-hidden border border-white/20">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className={`w-full h-full object-cover group-hover:grayscale-0 transition-all duration-500 ${grayscale}`}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-oswald font-bold uppercase tracking-tight">{dish.name}</h3>
                  <p className="text-sm opacity-60 font-light leading-relaxed">{dish.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SectionNotes section="dishes" show={showAnnotations} />

      {/* Lead Capture (Inverted) */}
      <section className="bg-white text-black py-32 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 items-start">
          <div>
            <h2 className="text-6xl md:text-8xl font-oswald font-bold uppercase mb-16 leading-tight">
              Let's make it<br />happen.
            </h2>
            {status === 'success' ? (
              <div className="py-20 border-t-4 border-black">
                <h3 className="text-4xl font-oswald font-bold uppercase mb-4">Request Sent.</h3>
                <p className="text-xl font-light opacity-60">Nikida will contact you shortly to discuss your event.</p>
              </div>
            ) : (
              <form onSubmit={submitLead} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Your Name</label>
                    <input name="name" required type="text" className="w-full border-b-2 border-black py-4 outline-none text-xl font-light bg-transparent" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Email</label>
                    <input name="email" required type="email" className="w-full border-b-2 border-black py-4 outline-none text-xl font-light bg-transparent" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Phone</label>
                    <input name="phone" type="tel" className="w-full border-b-2 border-black py-4 outline-none text-xl font-light bg-transparent" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Event Date</label>
                    <input name="event_date" type="date" className="w-full border-b-2 border-black py-4 outline-none text-xl font-light bg-transparent" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Event Type</label>
                    <select name="event_type" className="w-full border-b-2 border-black py-4 outline-none text-xl font-light bg-transparent">
                      <option value="">Select Type</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Private Party">Private Party</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Holiday">Holiday</option>
                      <option value="Graduation">Graduation</option>
                      <option value="Funeral/Repast">Funeral/Repast</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Estimated Guests</label>
                    <input name="guests" type="number" className="w-full border-b-2 border-black py-4 outline-none text-xl font-light bg-transparent" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Tell Us About Your Event</label>
                  <textarea name="message" className="w-full border-b-2 border-black py-4 outline-none text-xl font-light bg-transparent h-32"></textarea>
                </div>
                <button 
                  disabled={status === 'submitting'}
                  className="w-full bg-black text-white py-6 text-xl font-oswald font-bold uppercase tracking-[0.2em] hover:bg-opacity-90 transition-all disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Processing...' : 'Send Request'}
                </button>
                {status === 'error' && <p className="text-red-500 font-bold uppercase text-xs">Error sending request. Please try again.</p>}
              </form>
            )}
          </div>
          <div className="hidden lg:block sticky top-32">
            <div className="aspect-[3/4] overflow-hidden border-4 border-black">
              <img
                src="https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=1000&fit=crop"
                className={`w-full h-full object-cover ${grayscale}`}
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest opacity-40 text-center">Quality Catering / Chicago</p>
          </div>
        </div>
      </section>
      <SectionNotes section="form" show={showAnnotations} />

      {/* About */}
      <section className="flex flex-col md:flex-row min-h-screen">
        <div className="w-full md:w-1/2 h-[60vh] md:h-auto">
          <img 
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&h=1000&fit=crop"
            alt="Nikida"
            className={`w-full h-full object-cover ${grayscale}`}
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center p-12 md:p-24 space-y-8">
          <span className="text-[11px] uppercase tracking-[0.3em] font-bold opacity-50">Meet Nikida</span>
          <h2 className="text-5xl md:text-7xl font-oswald font-bold uppercase leading-none">Generations of flavor.</h2>
          <p className="text-xl font-light leading-relaxed opacity-70">
            Every plate tells a story. What started as cooking for family became Chicago's go-to for soulful, unforgettable catering.
          </p>
          <p className="text-sm font-bold uppercase tracking-widest">Based in South East Chicago</p>
        </div>
      </section>
      <SectionNotes section="about" show={showAnnotations} />

      {/* Gallery */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <span className="text-[11px] uppercase tracking-[0.3em] font-bold opacity-50 mb-16 block">The Work</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[300px]">
            <div className="col-span-2 row-span-2 bg-zinc-900">
              <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=800&fit=crop" className={`w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity ${grayscale}`} referrerPolicy="no-referrer" />
            </div>
            <div className="bg-zinc-900">
              <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=800&fit=crop" className={`w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity ${grayscale}`} referrerPolicy="no-referrer" />
            </div>
            <div className="bg-zinc-900">
              <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=800&fit=crop" className={`w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity ${grayscale}`} referrerPolicy="no-referrer" />
            </div>
            <div className="col-span-2 bg-zinc-900">
              <img src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=800&fit=crop" className={`w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity ${grayscale}`} referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>
      <SectionNotes section="gallery" show={showAnnotations} />

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <h2 className="text-6xl md:text-9xl font-oswald font-bold uppercase tracking-tighter opacity-10">Perfect Perfections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm font-bold uppercase tracking-widest opacity-60">
            <div>Instagram / Facebook</div>
            <div>Chicago, IL</div>
            <div>© 2026</div>
          </div>
        </div>
      </footer>
      <SectionNotes section="footer" show={showAnnotations} />
    </div>
  );
};

// --- Mockup C: Warm & Inviting ---
const MockupC = ({ grayscale, showAnnotations, onBook }: { grayscale: string; showAnnotations: boolean; onBook: () => void }) => {
  const { status, submitLead } = useLeadForm();

  return (
    <div className="bg-[#FAFAFA] text-[#1A1A1A] font-dm-sans min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm px-8 py-4 flex justify-between items-center rounded-b-3xl mx-4 mt-2">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-playfair font-medium">Perfect Perfections</h1>
          <span className="font-caveat text-lg text-zinc-400 hidden sm:inline">made with soul</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium">
          <a href="#" className="hover:text-zinc-500 transition-colors">Services</a>
          <a href="#" className="hover:text-zinc-500 transition-colors">About</a>
          <a href="#" className="hover:text-zinc-500 transition-colors">Gallery</a>
          <button onClick={onBook} className="hover:text-zinc-500 transition-colors">Book</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-2">
            <span className="font-caveat text-2xl text-zinc-500">welcome to</span>
            <h2 className="text-6xl md:text-8xl font-playfair leading-tight">Perfect Perfections Catering</h2>
          </div>
          <p className="text-xl text-zinc-600 leading-relaxed max-w-xl">
            Soulful, made-from-scratch dishes for your most memorable moments. Serving Chicago with love, flavor, and a whole lot of heart.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={onBook} className="bg-black text-white px-10 py-4 rounded-full font-medium hover:bg-zinc-800 transition-all shadow-lg">
              Book Your Event
            </button>
            <button onClick={downloadMenu} className="border-2 border-zinc-200 px-10 py-4 rounded-full font-medium hover:bg-zinc-50 transition-all flex items-center space-x-2">
              <Download className="w-4 h-4" /><span>Download Menu</span>
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square rounded-[40px] overflow-hidden rotate-3 shadow-2xl border-8 border-white">
            <img
              src="https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1000&h=1000&fit=crop"
              alt="Plated soul food"
              className={`w-full h-full object-cover ${grayscale}`}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl -rotate-6 border border-zinc-100">
            <Heart className="text-red-400 fill-red-400 w-8 h-8" />
          </div>
        </div>
      </section>
      <SectionNotes section="hero" show={showAnnotations} />

      {/* Services */}
      <section className="py-32 px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-20 space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">what we offer</span>
          <h2 className="font-caveat text-4xl">something for every occasion</h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Utensils />, title: 'Full-Service Catering', desc: 'From menu planning to cleanup — we handle everything so you can enjoy your event.', price: 'Starting at $XX/person' },
            { icon: <Truck />, title: 'Drop-Off Catering', desc: 'Fresh platters and trays delivered to your door, ready to serve and enjoy.', price: 'Starting at $XX/person' },
            { icon: <Cake />, title: 'Custom Treats & Menus', desc: 'Specialty desserts, holiday favorites, and menus designed just for you.', price: 'Custom pricing' }
          ].map((card, i) => (
            <div key={i} className="bg-white p-10 rounded-[40px] shadow-sm border border-zinc-100 hover:shadow-xl transition-all space-y-6 group">
              <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition-colors">
                {card.icon}
              </div>
              <h3 className="text-2xl font-playfair">{card.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{card.desc}</p>
              <div className="pt-4 border-t border-zinc-50 flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-400">{card.price}</span>
                <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-black transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </section>
      <SectionNotes section="services" show={showAnnotations} />

      {/* Signature Dishes */}
      <section className="py-32 px-8 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">our favorites</span>
            <h2 className="font-caveat text-4xl">Signature Dishes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {SIGNATURE_DISHES.map((dish, i) => (
              <div key={i} className="bg-white p-8 rounded-[40px] shadow-sm hover:shadow-xl transition-all space-y-6">
                <div className="aspect-video rounded-3xl overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className={`w-full h-full object-cover ${grayscale}`}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-playfair">{dish.name}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{dish.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SectionNotes section="dishes" show={showAnnotations} />

      {/* About */}
      <section className="py-32 px-8 bg-[#F0F0F0]">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <div className="relative inline-block">
            <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl mx-auto">
              <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&h=1000&fit=crop" alt="Nikida" className={`w-full h-full object-cover ${grayscale}`} referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -right-4 top-0 font-caveat text-2xl rotate-12 text-zinc-500">
              the heart behind the food
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-playfair">Meet Nikida</h2>
            <p className="text-xl text-zinc-600 leading-relaxed">
              What started as Sunday dinners and family cookouts became something bigger. Nikida brings generations of recipes, a whole lot of love, and the belief that good food brings people together. Based in Chicago's South Side, she's been feeding the community one unforgettable plate at a time.
            </p>
          </div>
        </div>
      </section>
      <SectionNotes section="about" show={showAnnotations} />

      {/* Lead Capture */}
      <section className="py-32 px-8">
        <div className="max-w-4xl mx-auto bg-white p-12 md:p-20 rounded-[60px] shadow-2xl border border-zinc-50">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">let's connect</span>
            <h3 className="font-caveat text-3xl text-zinc-500">ready to plan your event?</h3>
            <h2 className="text-5xl font-playfair">Get in Touch</h2>
          </div>
          {status === 'success' ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <Heart className="text-emerald-500 fill-emerald-500 w-10 h-10" />
              </div>
              <h3 className="text-3xl font-playfair">Message Received!</h3>
              <p className="text-zinc-500">Nikida will reach out to you personally very soon.</p>
            </div>
          ) : (
            <form onSubmit={submitLead} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input name="name" required type="text" placeholder="Name" className="w-full bg-zinc-50 border-none rounded-2xl p-5 outline-none focus:ring-2 ring-zinc-200" />
                <input name="email" required type="email" placeholder="Email" className="w-full bg-zinc-50 border-none rounded-2xl p-5 outline-none focus:ring-2 ring-zinc-200" />
                <input name="phone" type="tel" placeholder="Phone" className="w-full bg-zinc-50 border-none rounded-2xl p-5 outline-none focus:ring-2 ring-zinc-200" />
                <input name="event_date" type="date" className="w-full bg-zinc-50 border-none rounded-2xl p-5 outline-none focus:ring-2 ring-zinc-200" />
                <select name="event_type" className="w-full bg-zinc-50 border-none rounded-2xl p-5 outline-none focus:ring-2 ring-zinc-200">
                  <option value="">Event Type</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Private Party">Private Party</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Graduation">Graduation</option>
                  <option value="Funeral/Repast">Funeral/Repast</option>
                  <option value="Other">Other</option>
                </select>
                <input name="guests" type="number" placeholder="Estimated Guests" className="w-full bg-zinc-50 border-none rounded-2xl p-5 outline-none focus:ring-2 ring-zinc-200" />
              </div>
              <textarea name="message" placeholder="Tell Us About Your Event" className="w-full bg-zinc-50 border-none rounded-2xl p-5 outline-none focus:ring-2 ring-zinc-200 h-40"></textarea>
              <button 
                disabled={status === 'submitting'}
                className="w-full bg-black text-white py-6 rounded-2xl text-xl font-medium hover:bg-zinc-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{status === 'submitting' ? 'Sending...' : 'Send Message'}</span>
                <Heart className="w-5 h-5 fill-white" />
              </button>
              {status === 'error' && <p className="text-red-400 text-center text-sm">Oops! Something went wrong. Please try again.</p>}
              <p className="text-center text-sm text-zinc-400">We typically respond within 24 hours</p>
            </form>
          )}
        </div>
      </section>
      <SectionNotes section="form" show={showAnnotations} />

      {/* Gallery */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">from our kitchen</span>
            <h2 className="font-caveat text-4xl">a taste of what we do</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=800&fit=crop",
              "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=800&fit=crop",
              "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=800&fit=crop",
              "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=800&fit=crop",
              "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=800&fit=crop",
              "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=800&fit=crop"
            ].map((url, i) => (
              <div key={i} className="aspect-square rounded-[40px] overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                <img src={url} className={`w-full h-full object-cover ${grayscale}`} referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <SectionNotes section="gallery" show={showAnnotations} />

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-24 px-8 rounded-t-[60px]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-playfair">Perfect Perfections</h2>
          <span className="font-caveat text-2xl text-zinc-500 block">made with soul</span>
          <div className="flex justify-center space-x-8 text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Phone</a>
            <a href="#" className="hover:text-white transition-colors">Email</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
          <p className="text-zinc-500">South Side Chicago</p>
          <div className="pt-12 border-t border-white/5 flex flex-col items-center space-y-4">
            <p className="text-xs text-zinc-600">© 2026 · Made with ♥</p>
          </div>
        </div>
      </footer>
      <SectionNotes section="footer" show={showAnnotations} />
    </div>
  );
};

// --- Mockup D: Brutalist Grid ---
const MockupD = ({ grayscale, showAnnotations, onBook }: { grayscale: string; showAnnotations: boolean; onBook: () => void }) => {
  const { status, submitLead } = useLeadForm();

  return (
    <div className="bg-white text-black font-inter min-h-screen border-[12px] border-black">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-8 border-b-4 border-black">
        <div className="text-4xl font-oswald font-bold uppercase leading-none">
          Perfect<br />Perfections
        </div>
        <div className="flex flex-col items-end space-y-1 font-mono text-[10px] font-bold uppercase">
          <a href="#" className="hover:bg-black hover:text-white px-2">01 Services</a>
          <a href="#" className="hover:bg-black hover:text-white px-2">02 About</a>
          <a href="#" className="hover:bg-black hover:text-white px-2">03 Gallery</a>
          <button onClick={onBook} className="bg-black text-white px-2">04 Book Now</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-b-4 border-black">
        <div className="p-12 flex flex-col justify-center space-y-8 border-r-4 border-black">
          <h1 className="text-8xl md:text-[120px] font-oswald font-bold uppercase leading-[0.8] tracking-tighter">
            Real<br />Soul<br />Food.
          </h1>
          <p className="text-xl font-medium max-w-sm">
            Catering for the community. No shortcuts. Just flavor.
          </p>
          <div className="flex space-x-4">
            <button onClick={onBook} className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:invert transition-all">
              Request Quote
            </button>
          </div>
        </div>
        <div className="bg-zinc-100 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop"
            className={`w-full h-full object-cover hover:grayscale-0 transition-all duration-700 ${grayscale}`}
            referrerPolicy="no-referrer"
          />
        </div>
      </section>
      <SectionNotes section="hero" show={showAnnotations} />

      {/* Services Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-b-4 border-black">
        {[
          { num: '01', title: 'Full Service', desc: 'We bring the kitchen to you. Service, cleanup, and soul.' },
          { num: '02', title: 'Drop Off', desc: 'Hot trays, ready to serve. Perfect for the office or home.' },
          { num: '03', title: 'Custom', desc: 'Special requests. Family recipes. Your vision, our hands.' }
        ].map((s) => (
          <div key={s.num} className="p-12 border-r-4 last:border-r-0 border-black hover:bg-zinc-50 transition-colors group">
            <span className="text-6xl font-oswald font-bold opacity-10 group-hover:opacity-100 transition-opacity">{s.num}</span>
            <h3 className="text-3xl font-oswald font-bold uppercase mt-4 mb-4">{s.title}</h3>
            <p className="text-sm font-medium leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </section>
      <SectionNotes section="services" show={showAnnotations} />

      {/* Food Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 border-b-4 border-black">
        {[
          "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=800&fit=crop"
        ].map((url, i) => (
          <div key={i} className="aspect-square border-r-4 last:border-r-0 border-black overflow-hidden group">
            <img
              src={url}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${grayscale}`}
              referrerPolicy="no-referrer"
            />
          </div>
        ))}
      </section>
      <SectionNotes section="gallery" show={showAnnotations} />

      {/* Signature Dishes */}
      <section className="border-b-4 border-black grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-12 border-r-4 border-black flex flex-col justify-center bg-black text-white">
          <h2 className="text-6xl font-oswald font-bold uppercase leading-none">Signature<br />Dishes</h2>
          <p className="mt-8 font-mono text-xs uppercase tracking-widest opacity-60">Hand-crafted soul food favorites.</p>
        </div>
        {SIGNATURE_DISHES.map((dish, i) => (
          <div key={i} className="p-12 border-r-4 last:border-r-0 border-black hover:bg-zinc-50 transition-colors group">
            <div className="aspect-video mb-8 overflow-hidden border-2 border-black">
              <img
                src={dish.image}
                alt={dish.name}
                className={`w-full h-full object-cover group-hover:grayscale-0 transition-all duration-500 ${grayscale}`}
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-2xl font-oswald font-bold uppercase mb-4">{dish.name}</h3>
            <p className="text-xs font-medium leading-relaxed opacity-70">{dish.description}</p>
          </div>
        ))}
      </section>
      <SectionNotes section="dishes" show={showAnnotations} />

      {/* Form */}
      <section className="p-12 md:p-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-6xl font-oswald font-bold uppercase mb-12">Start the Order</h2>
          {status === 'success' ? (
            <div className="border-4 border-black p-12 bg-black text-white">
              <h3 className="text-4xl font-oswald font-bold uppercase mb-4">RECEIVED.</h3>
              <p className="font-mono text-xs uppercase tracking-widest">We will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={submitLead} className="grid grid-cols-1 md:grid-cols-2 gap-0 border-4 border-black">
              <input name="name" required type="text" placeholder="NAME" className="p-6 border-b-4 md:border-r-4 border-black outline-none font-bold placeholder:text-zinc-300 focus:bg-zinc-50" />
              <input name="email" required type="email" placeholder="EMAIL" className="p-6 border-b-4 border-black outline-none font-bold placeholder:text-zinc-300 focus:bg-zinc-50" />
              <input name="phone" type="tel" placeholder="PHONE" className="p-6 border-b-4 md:border-r-4 border-black outline-none font-bold placeholder:text-zinc-300 focus:bg-zinc-50" />
              <input name="event_date" type="date" placeholder="EVENT DATE" className="p-6 border-b-4 border-black outline-none font-bold placeholder:text-zinc-300 focus:bg-zinc-50" />
              <select name="event_type" className="p-6 border-b-4 md:border-r-4 border-black outline-none font-bold text-zinc-300 focus:bg-zinc-50 focus:text-black">
                <option value="">EVENT TYPE</option>
                <option value="Wedding">WEDDING</option>
                <option value="Corporate">CORPORATE</option>
                <option value="Private Party">PRIVATE PARTY</option>
                <option value="Birthday">BIRTHDAY</option>
                <option value="Holiday">HOLIDAY</option>
                <option value="Graduation">GRADUATION</option>
                <option value="Funeral/Repast">FUNERAL/REPAST</option>
                <option value="Other">OTHER</option>
              </select>
              <input name="guests" type="number" placeholder="ESTIMATED GUESTS" className="p-6 border-b-4 border-black outline-none font-bold placeholder:text-zinc-300 focus:bg-zinc-50" />
              <textarea name="message" placeholder="MESSAGE / DETAILS" className="p-6 border-b-4 border-black outline-none font-bold placeholder:text-zinc-300 focus:bg-zinc-50 md:col-span-2 h-32"></textarea>
              <button
                disabled={status === 'submitting'}
                className="p-6 bg-black text-white font-oswald font-bold uppercase text-2xl hover:bg-zinc-800 transition-colors disabled:opacity-50 md:col-span-2"
              >
                {status === 'submitting' ? 'SENDING...' : 'Submit →'}
              </button>
              {status === 'error' && <p className="p-4 bg-red-500 text-white font-bold uppercase text-xs md:col-span-2">ERROR. RETRY.</p>}
            </form>
          )}
        </div>
        <div className="aspect-square border-4 border-black overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=1000&fit=crop"
            className={`w-full h-full object-cover hover:grayscale-0 transition-all duration-700 ${grayscale}`}
            referrerPolicy="no-referrer"
          />
        </div>
      </section>
      <SectionNotes section="form" show={showAnnotations} />

      <footer className="bg-black text-white p-12 flex flex-col md:flex-row justify-between items-end">
        <div className="text-8xl font-oswald font-bold uppercase leading-[0.8] opacity-20">
          Perfect<br />Perfections
        </div>
        <div className="text-right font-mono text-xs space-y-2">
          <p>CHICAGO / SOUTH SIDE</p>
          <p>© 2026 PP CATERING</p>
        </div>
      </footer>
      <SectionNotes section="footer" show={showAnnotations} />
    </div>
  );
};

// --- Mockup E: Organic Story ---
const MockupE = ({ grayscale, showAnnotations, onBook }: { grayscale: string; showAnnotations: boolean; onBook: () => void }) => {
  const { status, submitLead } = useLeadForm();

  return (
    <div className="bg-[#F5F2ED] text-[#2D2926] font-dm-sans min-h-screen">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-12 py-10">
        <div className="text-3xl font-playfair italic">Perfect Perfections</div>
        <div className="flex space-x-12 text-xs font-bold uppercase tracking-widest opacity-60">
          <a href="#" className="hover:opacity-100">Menu</a>
          <a href="#" className="hover:opacity-100">Our Story</a>
          <button onClick={onBook} className="hover:opacity-100">Contact</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-12 py-12 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="space-y-10">
          <h1 className="text-7xl md:text-9xl font-playfair leading-[0.9] tracking-tight">
            Soul food,<br />made with<br /><span className="italic">purpose.</span>
          </h1>
          <p className="text-xl opacity-80 leading-relaxed max-w-md">
            Nikida brings generations of Chicago flavor to your table. Every dish is a memory, every bite is a story.
          </p>
          <button onClick={onBook} className="bg-[#2D2926] text-white px-12 py-5 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform">
            Book an Event
          </button>
        </div>
        <div className="relative">
          <div className="aspect-[3/4] rounded-full overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080&fit=crop"
              className={`w-full h-full object-cover ${grayscale}`}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full overflow-hidden border-[12px] border-[#F5F2ED] shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&h=1000&fit=crop"
              className={`w-full h-full object-cover ${grayscale}`}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>
      <SectionNotes section="hero" show={showAnnotations} />

      {/* Service Pills */}
      <section className="py-40 px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { title: 'Full Service', img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=800&fit=crop' },
            { title: 'Drop Off', img: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=800&fit=crop' },
            { title: 'Custom Menus', img: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=800&fit=crop' }
          ].map((s, i) => (
            <div key={i} className="space-y-8 text-center">
              <div className="aspect-[4/5] rounded-[100px] overflow-hidden shadow-lg">
                <img
                  src={s.img}
                  className={`w-full h-full object-cover ${grayscale}`}
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-3xl font-playfair italic">{s.title}</h3>
              <p className="text-sm opacity-60 px-8">Hand-crafted menus tailored to your celebration.</p>
            </div>
          ))}
        </div>
      </section>
      <SectionNotes section="services" show={showAnnotations} />

      {/* Signature Dishes */}
      <section className="py-40 px-12 bg-white">
        <div className="max-w-6xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest opacity-40">Signature Dishes</span>
            <h2 className="text-5xl font-playfair italic">From our kitchen to your heart.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
            {SIGNATURE_DISHES.map((dish, i) => (
              <div key={i} className={`flex flex-col ${i % 2 !== 0 ? 'md:translate-y-20' : ''} space-y-8`}>
                <div className="aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className={`w-full h-full object-cover ${grayscale}`}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-4 px-4">
                  <h3 className="text-3xl font-playfair italic">{dish.name}</h3>
                  <p className="text-lg opacity-60 leading-relaxed">{dish.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SectionNotes section="dishes" show={showAnnotations} />

      {/* Lead Capture */}
      <section className="py-40 px-12 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <span className="text-xs font-bold uppercase tracking-widest opacity-40">Let's Connect</span>
            <h2 className="text-5xl font-playfair italic">Ready to plan your next gathering?</h2>
            <p className="text-lg opacity-60 leading-relaxed">
              Whether it's a wedding, corporate event, or a family reunion, we'd love to bring the soul to your table.
            </p>
            <div className="aspect-video rounded-[40px] overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=1000&fit=crop"
                alt="Soul food spread"
                className={`w-full h-full object-cover ${grayscale}`}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          
          <div className="bg-[#F5F2ED] p-12 rounded-[60px]">
            {status === 'success' ? (
              <div className="text-center py-12 space-y-4">
                <Heart className="w-12 h-12 mx-auto text-emerald-500 fill-emerald-500" />
                <h3 className="text-3xl font-playfair italic">We've got you.</h3>
                <p className="opacity-60">Nikida will reach out to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={submitLead} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Name</label>
                  <input name="name" required type="text" className="w-full bg-transparent border-b border-black/10 py-3 outline-none focus:border-black transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Email</label>
                  <input name="email" required type="email" className="w-full bg-transparent border-b border-black/10 py-3 outline-none focus:border-black transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Phone</label>
                  <input name="phone" type="tel" className="w-full bg-transparent border-b border-black/10 py-3 outline-none focus:border-black transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Date</label>
                    <input name="event_date" type="date" className="w-full bg-transparent border-b border-black/10 py-3 outline-none focus:border-black transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Event Type</label>
                    <select name="event_type" className="w-full bg-transparent border-b border-black/10 py-3 outline-none focus:border-black transition-colors">
                      <option value="">Select Type</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Private Party">Private Party</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Holiday">Holiday</option>
                      <option value="Graduation">Graduation</option>
                      <option value="Funeral/Repast">Funeral/Repast</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Guests</label>
                  <input name="guests" type="number" className="w-full bg-transparent border-b border-black/10 py-3 outline-none focus:border-black transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Tell us about your event</label>
                  <textarea name="message" className="w-full bg-transparent border-b border-black/10 py-3 outline-none focus:border-black transition-colors h-24"></textarea>
                </div>
                <button 
                  disabled={status === 'submitting'}
                  className="w-full bg-[#2D2926] text-white py-5 rounded-full font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Sending...' : 'Send Inquiry'}
                </button>
                {status === 'error' && <p className="text-red-500 text-[10px] font-bold uppercase text-center">Error. Please try again.</p>}
              </form>
            )}
          </div>
        </div>
      </section>
      <SectionNotes section="form" show={showAnnotations} />

      {/* Quote */}
      <section className="py-40 bg-white/50 text-center px-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <Heart className="w-12 h-12 mx-auto text-zinc-300" />
          <h2 className="text-4xl md:text-6xl font-playfair italic leading-tight">
            "Food is the ingredient that binds us together. I cook because I love to see people smile."
          </h2>
          <p className="font-bold uppercase tracking-[0.4em] text-xs opacity-40">— Nikida, Founder</p>
        </div>
      </section>
      <SectionNotes section="about" show={showAnnotations} />

      {/* Gallery */}
      <section className="py-40 px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=800&fit=crop"
          ].map((url, i) => (
            <div key={i} className="aspect-square rounded-3xl overflow-hidden">
              <img
                src={url}
                className={`w-full h-full object-cover hover:scale-110 transition-transform duration-700 ${grayscale}`}
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </section>
      <SectionNotes section="gallery" show={showAnnotations} />

      <footer className="py-20 px-12 border-t border-black/5 flex flex-col items-center space-y-12">
        <div className="text-5xl font-playfair italic">Perfect Perfections</div>
        <div className="flex space-x-12 text-xs font-bold uppercase tracking-widest opacity-40">
          <span>Instagram</span>
          <span>Email</span>
          <span>Chicago</span>
        </div>
        <p className="text-[10px] opacity-20 uppercase tracking-widest">© 2026 Perfect Perfections Catering</p>
      </footer>
      <SectionNotes section="footer" show={showAnnotations} />
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [activeMockup, setActiveMockup] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [isGrayscale, setIsGrayscale] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [view, setView] = useState<'site' | 'dashboard'>('site');
  const booking = useBookingFlow();

  const grayscaleFilter = isGrayscale ? 'grayscale' : '';
  const meta = MOCKUP_META[activeMockup];

  if (view === 'dashboard') {
    return <LeadDashboard onBack={() => setView('site')} />;
  }

  return (
    <div className="relative">
      {/* Admin Access (Subtle) */}
      <button
        onClick={() => setView('dashboard')}
        className="fixed top-4 right-4 z-[100] opacity-10 hover:opacity-100 transition-opacity bg-black text-white p-2 rounded-full"
        title="Admin Dashboard"
      >
        <Layout className="w-4 h-4" />
      </button>

      {/* Top Info Bar - Platform & Mockup Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMockup}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-[99] bg-white/95 backdrop-blur-md border-b border-zinc-200 px-6 py-3"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Mockup {activeMockup}</span>
              <span className="text-sm font-medium">{meta.label}</span>
              <span className={`${meta.platformColor} text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full`}>
                {meta.platform}
              </span>
            </div>
            <p className="text-xs text-zinc-500 max-w-md text-right hidden md:block">{meta.why}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mockup Selector UI (Fixed Overlay) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-white/90 backdrop-blur-md border border-zinc-200 p-2 rounded-2xl shadow-2xl flex items-center space-x-2">
        <div className="flex bg-zinc-100 rounded-full p-1 mr-2">
          {(['A', 'B', 'C', 'D', 'E'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMockup(m)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeMockup === m ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-black'}`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-zinc-200"></div>

        <button
          onClick={() => setIsGrayscale(!isGrayscale)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${!isGrayscale ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-white'}`}
        >
          <span>{isGrayscale ? 'Color' : 'B&W'}</span>
        </button>

        <div className="h-6 w-px bg-zinc-200"></div>

        <button
          onClick={() => setShowAnnotations(!showAnnotations)}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${showAnnotations ? 'bg-amber-500 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showAnnotations ? 'Hide Notes' : 'Why It Works'}</span>
        </button>
      </div>

      {/* Annotation Legend */}
      <AnimatePresence>
        {showAnnotations && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-16 right-4 z-[98] bg-white/95 backdrop-blur-md border border-zinc-200 rounded-xl shadow-lg p-4 w-56"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Annotation Key</p>
            <div className="space-y-2">
              {Object.entries(CATEGORY_STYLES).map(([key, style]) => (
                <div key={key} className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${style.bg}`}></div>
                  <span className="text-xs text-zinc-600">{style.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100">
              <p className="text-[10px] text-zinc-400 leading-relaxed">Click any tag on the page to see why that design choice works for a catering business.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mockup Display */}
      <div className="pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMockup + isGrayscale}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeMockup === 'A' && <MockupA grayscale={grayscaleFilter} showAnnotations={showAnnotations} onBook={booking.open} />}
            {activeMockup === 'B' && <MockupB grayscale={grayscaleFilter} showAnnotations={showAnnotations} onBook={booking.open} />}
            {activeMockup === 'C' && <MockupC grayscale={grayscaleFilter} showAnnotations={showAnnotations} onBook={booking.open} />}
            {activeMockup === 'D' && <MockupD grayscale={grayscaleFilter} showAnnotations={showAnnotations} onBook={booking.open} />}
            {activeMockup === 'E' && <MockupE grayscale={grayscaleFilter} showAnnotations={showAnnotations} onBook={booking.open} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Contact FAB */}
      <FloatingContact />

      {/* Booking Flow Modal */}
      <AnimatePresence>
        {booking.isOpen && <BookingModal flow={booking} />}
      </AnimatePresence>

    </div>
  );
}

// --- Lead Dashboard Component ---
const LeadDashboard = ({ onBack }: { onBack: () => void }) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchLeads();
  };

  React.useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 p-8 font-inter">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold">Inquiry Dashboard</h1>
            <p className="text-zinc-500">Manage your catering leads and bookings.</p>
          </div>
          <button 
            onClick={onBack}
            className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest"
          >
            Back to Site
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-3xl border border-zinc-200">
            <p className="text-zinc-400">No leads captured yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-600' : 
                      lead.status === 'contacted' ? 'bg-amber-100 text-amber-600' : 
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {lead.status}
                    </span>
                    <span className="text-xs text-zinc-400">{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{lead.name}</h3>
                    <p className="text-zinc-500">{lead.email} • {lead.phone}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-zinc-400 uppercase text-[10px] font-bold">Event Date</span>
                      {lead.event_date}
                    </div>
                    <div>
                      <span className="block text-zinc-400 uppercase text-[10px] font-bold">Guests</span>
                      {lead.guests}
                    </div>
                    <div>
                      <span className="block text-zinc-400 uppercase text-[10px] font-bold">Type</span>
                      {lead.event_type}
                    </div>
                  </div>
                  {lead.message && (
                    <div className="bg-zinc-50 p-4 rounded-xl text-sm italic text-zinc-600">
                      "{lead.message}"
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center space-y-2">
                  <button 
                    onClick={() => updateStatus(lead.id, 'contacted')}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-zinc-200 rounded-lg hover:bg-zinc-50"
                  >
                    Mark Contacted
                  </button>
                  <button 
                    onClick={() => updateStatus(lead.id, 'booked')}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Mark Booked
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Shared Lead Form Logic ---
const useLeadForm = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const submitLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        setStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return { status, submitLead };
};
