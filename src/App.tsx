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
  Coffee
} from 'lucide-react';

// --- Signature Dishes Data ---
const SIGNATURE_DISHES = [
  {
    name: "Shrimp & Grits",
    description: "Creamy, buttery grits topped with seasoned shrimp and crispy bacon crumbles.",
    imageSeed: "shrimp-grits"
  },
  {
    name: "Bacon-Wrapped Stuffed Chicken",
    description: "Tender chicken breast stuffed with spinach and cheese, wrapped in smoky bacon, served with sautéed mushrooms.",
    imageSeed: "stuffed-chicken"
  },
  {
    name: "Signature Soul Rolls",
    description: "Our famous crispy rolls filled with soul food favorites, served with a creamy dipping sauce.",
    imageSeed: "egg-rolls"
  },
  {
    name: "Southern Pecan Pie",
    description: "A rich, flaky crust filled with sweet, toasted pecans, served alongside chocolate-dipped strawberries.",
    imageSeed: "pecan-pie"
  },
  {
    name: "Gourmet Dipped Treats",
    description: "Decadent chocolate-covered cookies finished with gold dust and festive drizzles.",
    imageSeed: "chocolate-treats"
  }
];

// --- Mockup A: Minimal Editorial ---
const MockupA = ({ grayscale }: { grayscale: string }) => {
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
          <a href="#" className="font-bold border-b border-black pb-1">Book Now</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/soulfood-hero/1920/1080${grayscale}`} 
          alt="Elegant soul food" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
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
                <option value="Holiday">Holiday</option>
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
            src={`https://picsum.photos/seed/soulfood-form-a/800/1000${grayscale}`} 
            alt="Catering spread" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

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
        </div>
      </section>

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
                    src={`https://picsum.photos/seed/${dish.imageSeed}/800/600${grayscale}`} 
                    alt={dish.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
              src="https://picsum.photos/seed/chef1/800/1000?grayscale" 
              alt="Chef Nikida" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.3em] font-bold">From Our Kitchen</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['fried-chicken', 'mac-cheese', 'collards', 'cornbread', 'ribs', 'yams'].map((food, i) => (
              <div key={i} className="aspect-square overflow-hidden group cursor-pointer">
                <img 
                  src={`https://picsum.photos/seed/food-${food}/800/800${grayscale}`} 
                  alt={food} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

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
    </div>
  );
};

// --- Mockup B: Bold & Modern ---
const MockupB = ({ grayscale }: { grayscale: string }) => {
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
          <a href="#" className="hover:opacity-50 transition-opacity">Book</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center px-8 py-20">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src={`https://picsum.photos/seed/bold-soulfood/1920/1080${grayscale}`} 
            alt="Background" 
            className="w-full h-full object-cover"
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
          <button className="border-2 border-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all group">
            Book Now <span className="inline-block transition-transform group-hover:translate-x-2">→</span>
          </button>
        </div>
      </section>

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
        </div>
      </section>

      {/* Signature Dishes */}
      <section className="py-32 px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] uppercase tracking-[0.3em] font-bold opacity-50 mb-16 block">Signature Dishes</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {SIGNATURE_DISHES.map((dish, i) => (
              <div key={i} className="group flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-48 h-48 flex-shrink-0 overflow-hidden border border-white/20">
                  <img 
                    src={`https://picsum.photos/seed/${dish.imageSeed}/400/400${grayscale}`} 
                    alt={dish.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
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
                src={`https://picsum.photos/seed/soulfood-form-b/600/800${grayscale}`} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest opacity-40 text-center">Quality Catering / Chicago</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="flex flex-col md:flex-row min-h-screen">
        <div className="w-full md:w-1/2 h-[60vh] md:h-auto">
          <img 
            src="https://picsum.photos/seed/chef2/1000/1200?grayscale" 
            alt="Nikida" 
            className="w-full h-full object-cover"
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

      {/* Gallery */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <span className="text-[11px] uppercase tracking-[0.3em] font-bold opacity-50 mb-16 block">The Work</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[300px]">
            <div className="col-span-2 row-span-2 bg-zinc-900">
              <img src={`https://picsum.photos/seed/soulfood-b1/1200/1200${grayscale}`} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
            </div>
            <div className="bg-zinc-900">
              <img src={`https://picsum.photos/seed/soulfood-b2/600/600${grayscale}`} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
            </div>
            <div className="bg-zinc-900">
              <img src={`https://picsum.photos/seed/soulfood-b3/600/600${grayscale}`} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
            </div>
            <div className="col-span-2 bg-zinc-900">
              <img src={`https://picsum.photos/seed/soulfood-b4/1200/600${grayscale}`} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>

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
    </div>
  );
};

// --- Mockup C: Warm & Inviting ---
const MockupC = ({ grayscale }: { grayscale: string }) => {
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
          <a href="#" className="hover:text-zinc-500 transition-colors">Book</a>
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
            <button className="bg-black text-white px-10 py-4 rounded-full font-medium hover:bg-zinc-800 transition-all shadow-lg">
              Book Your Event
            </button>
            <button className="border-2 border-zinc-200 px-10 py-4 rounded-full font-medium hover:bg-zinc-50 transition-all">
              View Our Services
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square rounded-[40px] overflow-hidden rotate-3 shadow-2xl border-8 border-white">
            <img 
              src={`https://picsum.photos/seed/soulfood-c1/1000/1000${grayscale}`} 
              alt="Plated soul food" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl -rotate-6 border border-zinc-100">
            <Heart className="text-red-400 fill-red-400 w-8 h-8" />
          </div>
        </div>
      </section>

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
                    src={`https://picsum.photos/seed/${dish.imageSeed}/800/450${grayscale}`} 
                    alt={dish.name} 
                    className="w-full h-full object-cover"
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

      {/* About */}
      <section className="py-32 px-8 bg-[#F0F0F0]">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <div className="relative inline-block">
            <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl mx-auto">
              <img src="https://picsum.photos/seed/chef3/400/400?grayscale" alt="Nikida" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                <select name="event_type" className="w-full bg-zinc-50 border-none rounded-2xl p-5 outline-none focus:ring-2 ring-zinc-200 md:col-span-2">
                  <option value="">Event Type</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Private Party">Private Party</option>
                </select>
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

      {/* Gallery */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">from our kitchen</span>
            <h2 className="font-caveat text-4xl">a taste of what we do</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {['chicken', 'sides', 'dessert', 'platter', 'event', 'service'].map((food, i) => (
              <div key={i} className="aspect-square rounded-[40px] overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                <img src={`https://picsum.photos/seed/soulfood-gallery-${food}/800/800${grayscale}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>
      </section>

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
    </div>
  );
};

// --- Mockup D: Brutalist Grid ---
const MockupD = ({ grayscale }: { grayscale: string }) => {
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
          <a href="#" className="bg-black text-white px-2">04 Book Now</a>
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
            <button className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:invert transition-all">
              Request Quote
            </button>
          </div>
        </div>
        <div className="bg-zinc-100 overflow-hidden">
          <img 
            src={`https://picsum.photos/seed/brutal-food/1000/1000${grayscale}`} 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

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

      {/* Food Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 border-b-4 border-black">
        {['chicken-wings', 'greens-pot', 'mac-bowl', 'rib-rack'].map((food, i) => (
          <div key={i} className="aspect-square border-r-4 last:border-r-0 border-black overflow-hidden group">
            <img 
              src={`https://picsum.photos/seed/brutal-${food}/800/800${grayscale}`} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}
      </section>

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
                src={`https://picsum.photos/seed/${dish.imageSeed}/800/450${grayscale}`} 
                alt={dish.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-2xl font-oswald font-bold uppercase mb-4">{dish.name}</h3>
            <p className="text-xs font-medium leading-relaxed opacity-70">{dish.description}</p>
          </div>
        ))}
      </section>

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
              <input name="name" required type="text" placeholder="NAME" className="p-6 border-b-4 md:border-b-4 md:border-r-4 border-black outline-none font-bold placeholder:text-zinc-300 focus:bg-zinc-50" />
              <input name="email" required type="email" placeholder="EMAIL" className="p-6 border-b-4 border-black outline-none font-bold placeholder:text-zinc-300 focus:bg-zinc-50" />
              <input name="event_type" type="text" placeholder="EVENT TYPE" className="p-6 border-b-4 md:border-b-0 md:border-r-4 border-black outline-none font-bold placeholder:text-zinc-300 focus:bg-zinc-50" />
              <button 
                disabled={status === 'submitting'}
                className="p-6 bg-black text-white font-oswald font-bold uppercase text-2xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {status === 'submitting' ? 'SENDING...' : 'Submit →'}
              </button>
              {status === 'error' && <p className="p-4 bg-red-500 text-white font-bold uppercase text-xs md:col-span-2">ERROR. RETRY.</p>}
            </form>
          )}
        </div>
        <div className="aspect-square border-4 border-black overflow-hidden">
          <img 
            src={`https://picsum.photos/seed/soulfood-form-d/800/800${grayscale}`} 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      <footer className="bg-black text-white p-12 flex flex-col md:flex-row justify-between items-end">
        <div className="text-8xl font-oswald font-bold uppercase leading-[0.8] opacity-20">
          Perfect<br />Perfections
        </div>
        <div className="text-right font-mono text-xs space-y-2">
          <p>CHICAGO / SOUTH SIDE</p>
          <p>© 2026 PP CATERING</p>
        </div>
      </footer>
    </div>
  );
};

// --- Mockup E: Organic Story ---
const MockupE = ({ grayscale }: { grayscale: string }) => {
  const { status, submitLead } = useLeadForm();

  return (
    <div className="bg-[#F5F2ED] text-[#2D2926] font-dm-sans min-h-screen">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-12 py-10">
        <div className="text-3xl font-playfair italic">Perfect Perfections</div>
        <div className="flex space-x-12 text-xs font-bold uppercase tracking-widest opacity-60">
          <a href="#" className="hover:opacity-100">Menu</a>
          <a href="#" className="hover:opacity-100">Our Story</a>
          <a href="#" className="hover:opacity-100">Contact</a>
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
          <button className="bg-[#2D2926] text-white px-12 py-5 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform">
            Book an Event
          </button>
        </div>
        <div className="relative">
          <div className="aspect-[3/4] rounded-full overflow-hidden shadow-2xl">
            <img 
              src={`https://picsum.photos/seed/organic-soul/900/1200${grayscale}`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full overflow-hidden border-[12px] border-[#F5F2ED] shadow-xl">
            <img 
              src={`https://picsum.photos/seed/organic-chef/600/600${grayscale}`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Service Pills */}
      <section className="py-40 px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { title: 'Full Service', img: 'service1' },
            { title: 'Drop Off', img: 'service2' },
            { title: 'Custom Menus', img: 'service3' }
          ].map((s, i) => (
            <div key={i} className="space-y-8 text-center">
              <div className="aspect-[4/5] rounded-[100px] overflow-hidden shadow-lg">
                <img 
                  src={`https://picsum.photos/seed/organic-${s.img}/600/800${grayscale}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-3xl font-playfair italic">{s.title}</h3>
              <p className="text-sm opacity-60 px-8">Hand-crafted menus tailored to your celebration.</p>
            </div>
          ))}
        </div>
      </section>

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
                    src={`https://picsum.photos/seed/${dish.imageSeed}/800/1000${grayscale}`} 
                    alt={dish.name} 
                    className="w-full h-full object-cover"
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
                src={`https://picsum.photos/seed/soulfood-form-e/800/600${grayscale}`} 
                alt="Soul food spread" 
                className="w-full h-full object-cover"
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
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Date</label>
                    <input name="event_date" type="date" className="w-full bg-transparent border-b border-black/10 py-3 outline-none focus:border-black transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Guests</label>
                    <input name="guests" type="number" className="w-full bg-transparent border-b border-black/10 py-3 outline-none focus:border-black transition-colors" />
                  </div>
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

      {/* Gallery */}
      <section className="py-40 px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['plate1', 'plate2', 'plate3', 'plate4', 'plate5', 'plate6', 'plate7', 'plate8'].map((p, i) => (
            <div key={i} className="aspect-square rounded-3xl overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/organic-gallery-${p}/600/600${grayscale}`} 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </section>

      <footer className="py-20 px-12 border-t border-black/5 flex flex-col items-center space-y-12">
        <div className="text-5xl font-playfair italic">Perfect Perfections</div>
        <div className="flex space-x-12 text-xs font-bold uppercase tracking-widest opacity-40">
          <span>Instagram</span>
          <span>Email</span>
          <span>Chicago</span>
        </div>
        <p className="text-[10px] opacity-20 uppercase tracking-widest">© 2026 Perfect Perfections Catering</p>
      </footer>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [activeMockup, setActiveMockup] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [isGrayscale, setIsGrayscale] = useState(true);
  const [view, setView] = useState<'site' | 'dashboard'>('site');

  const grayscaleFilter = isGrayscale ? '?grayscale' : '';

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

      {/* Mockup Selector UI (Fixed Overlay) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-white/90 backdrop-blur-md border border-zinc-200 p-2 rounded-full shadow-2xl flex items-center space-x-2">
        <div className="flex bg-zinc-100 rounded-full p-1 mr-2">
          {['A', 'B', 'C', 'D', 'E'].map((m) => (
            <button 
              key={m}
              onClick={() => setActiveMockup(m as any)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeMockup === m ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-black'}`}
            >
              {m}
            </button>
          ))}
        </div>
        
        <div className="h-6 w-px bg-zinc-200 mx-2"></div>

        <button 
          onClick={() => setIsGrayscale(!isGrayscale)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${!isGrayscale ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-white'}`}
        >
          <span>{isGrayscale ? 'Show Color Food' : 'Back to B&W'}</span>
        </button>
      </div>

      {/* Mockup Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMockup + isGrayscale}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeMockup === 'A' && <MockupA grayscale={grayscaleFilter} />}
          {activeMockup === 'B' && <MockupB grayscale={grayscaleFilter} />}
          {activeMockup === 'C' && <MockupC grayscale={grayscaleFilter} />}
          {activeMockup === 'D' && <MockupD grayscale={grayscaleFilter} />}
          {activeMockup === 'E' && <MockupE grayscale={grayscaleFilter} />}
        </motion.div>
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
