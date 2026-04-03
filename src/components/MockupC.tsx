import { useEffect, useRef } from 'react';
import {
  Heart,
  Utensils,
  Truck,
  Cake,
  ArrowRight,
  Download,
  ChefHat,
  PartyPopper,
  UtensilsCrossed,
  ClipboardList,
} from 'lucide-react';
import type { CatalogData, IconName } from '../lib/square/types';
import type { ReactElement } from 'react';
import { motion } from 'motion/react';
import { useLeadForm } from '../hooks/useLeadForm';
import { downloadMenu } from '../utils/downloadMenu';
import { trackEvent } from '../lib/analytics';
import { FAQ_ITEMS } from '../data/constants';
import { HandwrittenText } from './HandwrittenText';
import { MenuSection } from './MenuSection';
import { GallerySection } from './GallerySection';
import { HeroSlideshow } from './HeroSlideshow';
import { MealPrepSection } from './MealPrepSection';

const ICON_MAP: Record<IconName, ReactElement> = {
  utensils: <Utensils />,
  truck: <Truck />,
  cake: <Cake />,
};

export const MockupC = ({ onBook, onEstimate, catalog }: { onBook: () => void; onEstimate: () => void; catalog: CatalogData }) => {
  const { status, errorMessage, submitLead } = useLeadForm();
  const trackedSections = useRef(new Set<string>());

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting && !trackedSections.current.has(id)) {
            trackedSections.current.add(id);
            trackEvent('scroll_to_section', { section: id });
          }
        }
      },
      { threshold: 0.3 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const serviceImages = [
    `${import.meta.env.BASE_URL}gallery/charcuterie-board-2.jpg`,
    `${import.meta.env.BASE_URL}gallery/crab-cakes-1.jpg`,
    `${import.meta.env.BASE_URL}gallery/empanadas.jpg`,
    `${import.meta.env.BASE_URL}gallery/shrimp-grits.jpg`,
  ];

  // Derive service cards from catalog packages
  const serviceCards = catalog.packages.map((pkg, i) => ({
    icon: ICON_MAP[pkg.icon] || <Utensils />,
    title: pkg.name,
    desc: pkg.description,
    price: pkg.pricePerPersonCents > 0
      ? `$${(pkg.pricePerPersonCents / 100).toFixed(0)}`
      : 'Custom pricing',
    image: serviceImages[i % serviceImages.length],
  }));

  return (
    <div className="bg-[#FAFAFA] text-[#1A1A1A] font-dm-sans min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm px-8 py-4 flex justify-between items-center rounded-b-3xl mx-4 mt-2">
        <div className="flex items-center space-x-4">
          <span className="text-2xl font-playfair font-medium">Perfect Perfections</span>
          <span className="font-caveat text-lg text-zinc-400 hidden sm:inline">taste and see that the Lord is good</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium">
          <a href="#services" className="hover:text-zinc-500 transition-colors">Services</a>
          <a href="#menu" className="hover:text-zinc-500 transition-colors">Menu</a>
          <a href="#meal-prep" className="hover:text-zinc-500 transition-colors">Meal Prep</a>
          <a href="#about" className="hover:text-zinc-500 transition-colors">About</a>
          <button onClick={onBook} className="hover:text-zinc-500 transition-colors">Book</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <HeroSlideshow />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-4 space-y-6">
          <h1 className="text-5xl md:text-7xl font-playfair leading-tight">
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
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-80 font-light">
            Layers of flavor, perfectly crafted for your events, gatherings, and celebrations
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button onClick={() => { onBook(); trackEvent('cta_click_book', { location: 'hero' }); }} className="bg-white text-black px-10 py-4 rounded-full font-medium hover:bg-zinc-100 transition-all shadow-lg">
              Book Your Event
            </button>
            <button onClick={() => { onEstimate(); trackEvent('cta_click_estimate', { location: 'hero' }); }} className="border-2 border-white/60 text-white px-10 py-4 rounded-full font-medium hover:bg-white/10 transition-all">
              Get Free Estimate
            </button>
            <button onClick={() => { downloadMenu(); trackEvent('menu_download', { location: 'hero' }); }} className="border-2 border-white/60 text-white px-10 py-4 rounded-full font-medium hover:bg-white/10 transition-all flex items-center space-x-2">
              <Download className="w-4 h-4" /><span>Download Menu</span>
            </button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-32 px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-20 space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">what we offer</span>
          <h2 className="font-caveat text-4xl">something for every occasion</h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">From intimate dinners to large-scale events, we bring rich, layered flavors to every table. Talk, eat, savor, be thankful.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <UtensilsCrossed />,
              title: 'Catering Service',
              desc: 'Full-service catering for any occasion — from drop-off platters to complete setup with professional servers, equipment, and breakdown.',
              image: serviceImages[0],
              cta: 'Book Catering',
            },
            {
              icon: <ClipboardList />,
              title: 'Meal Prep',
              desc: 'Weekly meal prep tailored to your taste. Fresh, flavorful dishes portioned and ready to heat — eating well made easy.',
              image: serviceImages[1],
              cta: 'Learn More',
            },
            {
              icon: <PartyPopper />,
              title: 'Events & Pop-Ups',
              desc: 'Weddings, corporate events, birthdays, holiday parties, and community pop-ups. We bring the flavor, you bring the guests.',
              image: serviceImages[2],
              cta: 'Plan Your Event',
            },
            {
              icon: <ChefHat />,
              title: 'Private Chef',
              desc: 'An intimate, personalized dining experience in your home. Perfect for date nights, small gatherings, or treating yourself.',
              image: serviceImages[3],
              cta: 'Book a Chef',
            },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-[40px] shadow-sm border border-zinc-100 hover:shadow-xl transition-all group overflow-hidden">
              <div className="h-40 overflow-hidden">
                <img src={card.image} alt={card.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 space-y-4">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition-colors">
                  {card.icon}
                </div>
                <h3 className="text-xl font-playfair">{card.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{card.desc}</p>
                <div className="pt-4 border-t border-zinc-50">
                  <button onClick={() => { onBook(); trackEvent('cta_click_book', { location: `service_${i}` }); }} className="flex items-center space-x-2 text-sm font-medium text-zinc-600 group-hover:text-black transition-colors">
                    <span>{card.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Menu */}
      <MenuSection menuItems={catalog.menuItems || []} onBook={onBook} onEstimate={onEstimate} />

      {/* Meal Prep */}
      <MealPrepSection onBook={onBook} />

      {/* About */}
      <section id="about" className="py-32 px-8 bg-[#F0F0F0]">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <div className="relative inline-block">
            <div className="w-44 h-44 rounded-full overflow-hidden border-8 border-white shadow-xl mx-auto">
              <img src={`${import.meta.env.BASE_URL}nikida.webp`} alt="Nikida" loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
            </div>
            <div className="absolute -right-4 -top-6 font-caveat text-2xl rotate-12 text-zinc-500">
              the heart behind the food
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-playfair">Meet Nikida Brock</h2>
            <p className="text-xl text-zinc-600 leading-relaxed">
              With 14 years of experience in the food industry — including years as a bakery buyer at Whole Foods Market — Nikida built a strong foundation in customer service, leadership, and an eye for quality. But her true passion — delighting people through food — led her to start Perfect Perfections Catering, combining professional expertise with generations of family recipes. Based on Chicago's South Side, Nikida is on a mission to wow every guest, one unforgettable plate at a time.
            </p>
          </div>

          {/* Instagram Reel */}
          <div
            className="flex justify-center pt-4"
            ref={(el) => {
              if (el && (window as any).instgrm?.Embeds) {
                (window as any).instgrm.Embeds.process(el);
              }
            }}
          >
            <blockquote
              className="instagram-media"
              data-instgrm-captioned
              data-instgrm-permalink="https://www.instagram.com/reel/DVw9CAPisSb/?utm_source=ig_embed"
              data-instgrm-version="14"
              style={{ background: '#FFF', border: 0, borderRadius: '24px', margin: '0 auto', maxWidth: '400px', width: '100%', padding: 0 }}
            >
            </blockquote>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">what people are saying</span>
            <h2 className="font-caveat text-4xl">Thriving Flavors, Serving Others</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">Real words from real clients — peace, joy, hope, and love in every plate.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Michele',
                label: 'Repeat Client',
                quote: 'Your service was awesome. Everyone loved everything again. Put me down for superbowl catering.',
              },
              {
                name: 'Danielle',
                label: 'Client',
                quote: 'My family LOVED the food!!! Thanks again!',
              },
              {
                name: 'Cynthia West',
                label: 'Client',
                quote: "Everyone raved about your food!! It was delicious!!!!!! I'm firing my other caterers going forward. No comparison!!!!",
              },
              {
                name: 'El Valor Event Client',
                label: 'Corporate Event',
                quote: "This food is so good I just don't know how you do it. Thank you for making this happen.",
              },
              {
                name: 'Monique',
                label: 'Repeat Client',
                quote: 'Thank u so much. Everything was really good.',
              },
              {
                name: 'Jade Allen',
                label: 'Client',
                quote: 'Thank you for everything. People still talking about the food. Appreciate you so much. It was beautiful.',
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-zinc-50 rounded-[32px] p-8 space-y-4 relative"
              >
                <div className="font-caveat text-5xl text-zinc-200 leading-none">"</div>
                <p className="text-zinc-700 leading-relaxed italic">{t.quote}</p>
                <div className="pt-4 border-t border-zinc-100">
                  <p className="font-playfair font-medium">{t.name}</p>
                  <p className="text-xs text-zinc-400">{t.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture */}
      <section id="contact" className="py-32 px-8">
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
              {status === 'error' && <p className="text-red-400 text-center text-sm">{errorMessage || 'Oops! Something went wrong. Please try again.'}</p>}
              <p className="text-center text-sm text-zinc-400">We typically respond within 24 hours</p>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">common questions</span>
            <h2 className="font-caveat text-4xl">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group bg-zinc-50 rounded-2xl overflow-hidden">
                <summary className="cursor-pointer px-8 py-5 font-playfair text-lg flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span className="text-zinc-400 group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                </summary>
                <div className="px-8 pb-6 text-zinc-600 leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <GallerySection />

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-24 px-8 rounded-t-[60px]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-playfair">Perfect Perfections</h2>
          <span className="font-caveat text-2xl text-zinc-500 block">made with love</span>
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#menu" className="hover:text-white transition-colors">Menu</a>
            <a href="#meal-prep" className="hover:text-white transition-colors">Meal Prep</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </nav>
          <div className="flex justify-center space-x-8 text-zinc-400">
            <a href="tel:+17739366416" className="hover:text-white transition-colors">(773) 936-6416</a>
            <a href="mailto:perfectperfectionscatering@gmail.com" className="hover:text-white transition-colors">Email</a>
            <a href="https://instagram.com/perfectperfectionscatering" target="_blank" className="hover:text-white transition-colors">Instagram</a>
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
