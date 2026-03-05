import {
  Heart,
  Utensils,
  Truck,
  Cake,
  ArrowRight,
  Download,
} from 'lucide-react';
import type { CatalogData, IconName } from '../lib/square/types';
import type { ReactElement } from 'react';
import { motion } from 'motion/react';
import { useLeadForm } from '../hooks/useLeadForm';
import { downloadMenu } from '../utils/downloadMenu';

function HandwrittenText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span className="inline-block relative">
      {/* Hidden text to reserve space */}
      <span className="invisible">{text}</span>
      {/* SVG overlay with handwriting animation */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 600 80"
        preserveAspectRatio="xMidYMid meet"
      >
        <motion.text
          x="300"
          y="60"
          textAnchor="middle"
          className="font-caveat"
          fontSize="80"
          fill="none"
          stroke="white"
          strokeWidth="2"
          initial={{ strokeDasharray: 2000, strokeDashoffset: 2000 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 2, delay, ease: 'easeInOut' }}
        >
          {text}
        </motion.text>
        <motion.text
          x="300"
          y="60"
          textAnchor="middle"
          className="font-caveat"
          fontSize="80"
          fill="white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 1.8, ease: 'easeIn' }}
        >
          {text}
        </motion.text>
      </svg>
    </span>
  );
}

const ICON_MAP: Record<IconName, ReactElement> = {
  utensils: <Utensils />,
  truck: <Truck />,
  cake: <Cake />,
};

export const MockupC = ({ onBook, catalog }: { onBook: () => void; catalog: CatalogData }) => {
  const { status, submitLead } = useLeadForm();

  // Derive service cards from catalog packages
  const serviceCards = catalog.packages.map(pkg => ({
    icon: ICON_MAP[pkg.icon] || <Utensils />,
    title: pkg.name,
    desc: pkg.description,
    price: pkg.pricePerPersonCents > 0
      ? `Starting at $${(pkg.pricePerPersonCents / 100).toFixed(0)}/person`
      : 'Custom pricing',
  }));

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
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1920&h=1080&fit=crop"
          alt="Elegant soul food spread"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-4 space-y-6">
          <h2 className="text-5xl md:text-7xl font-playfair leading-tight">
            <motion.span
              className="italic block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Soulful food,
            </motion.span>
            <span className="block text-6xl md:text-8xl mt-2">
              <HandwrittenText text="Perfectly Crafted." delay={0.6} />
            </span>
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-80 font-light">
            Chicago's premier soul food catering for events, gatherings, and celebrations
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button onClick={onBook} className="bg-white text-black px-10 py-4 rounded-full font-medium hover:bg-zinc-100 transition-all shadow-lg">
              Book Your Event
            </button>
            <button onClick={() => downloadMenu(catalog)} className="border-2 border-white/60 text-white px-10 py-4 rounded-full font-medium hover:bg-white/10 transition-all flex items-center space-x-2">
              <Download className="w-4 h-4" /><span>Download Menu</span>
            </button>
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
          {serviceCards.map((card, i) => (
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
            {catalog.dishes.map((dish) => (
              <div key={dish.id} className="bg-white p-8 rounded-[40px] shadow-sm hover:shadow-xl transition-all space-y-6">
                {dish.imageUrl && (
                  <div className="aspect-video rounded-3xl overflow-hidden">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
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
              <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&h=1000&fit=crop" alt="Nikida" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
            <p className="text-xs text-zinc-600">&copy; 2026 · Made with ♥</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
