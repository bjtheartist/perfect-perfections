import { motion } from 'motion/react';

const FOOD_GALLERY = [
  { url: 'gallery/charcuterie-board-1.jpg', alt: 'Artisan charcuterie board with grapes, starfruit, and edible flowers' },
  { url: 'gallery/herb-chicken.jpg', alt: 'Herb-crusted sliced chicken with rosemary and parsley' },
  { url: 'gallery/empanadas.jpg', alt: 'Crispy empanadas with chimichurri and edible flowers' },
  { url: 'gallery/catering-salad-spread.jpg', alt: 'Catering spread with fresh salad and crudité platter' },
  { url: 'gallery/shrimp-grits.jpg', alt: 'Shrimp and grits with peppers and fresh herbs' },
  { url: 'gallery/valentines-desserts.jpg', alt: "Valentine's heart box with handmade chocolate desserts" },
  { url: 'gallery/crab-cakes-1.jpg', alt: 'Golden crab cakes with microgreens and pansy garnish' },
  { url: 'gallery/braised-beef-bites.jpg', alt: 'Braised beef bites in golden foil cups' },
  { url: 'gallery/charcuterie-close-1.jpg', alt: 'Close-up of charcuterie with cheese, fruits, and flowers' },
  { url: 'gallery/charcuterie-close-2.jpg', alt: 'Dragon fruit, grapes, and starfruit on wooden board' },
];

const DECOR_GALLERY = [
  { url: 'gallery/decor-wedding.jpg', alt: 'Wedding balloon arch with sunflowers and "Happily Ever After" banner' },
  { url: 'gallery/decor-40th-birthday.jpg', alt: '40th birthday marquee lights with teal and gold balloon garland' },
  { url: 'gallery/decor-baby-shower.jpg', alt: 'Baby shower balloon arch with teddy bears and flower petals' },
  { url: 'gallery/decor-shimmer-wall.jpg', alt: 'Silver shimmer wall backdrop with blue and silver balloons' },
  { url: 'gallery/decor-pooh-shower.jpg', alt: 'Winnie the Pooh baby shower with throne chair and balloon arch' },
  { url: 'gallery/decor-birthday-arch.jpg', alt: 'Pink and gold birthday balloon arch with neon Happy Birthday sign' },
];

export function GallerySection() {
  return (
    <section className="py-32 px-8">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Food Gallery */}
        <div>
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">from our kitchen</span>
            <h2 className="font-caveat text-4xl">a taste of what we do</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {FOOD_GALLERY.map((img, i) => (
              <motion.div
                key={img.url}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="aspect-square rounded-[40px] overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                <img src={`${import.meta.env.BASE_URL}${img.url}`} alt={img.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Event Decor Gallery */}
        <div>
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">event decor & design</span>
            <h2 className="font-caveat text-4xl">we set the scene too</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {DECOR_GALLERY.map((img, i) => (
              <motion.div
                key={img.url}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="aspect-square rounded-[40px] overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                <img src={`${import.meta.env.BASE_URL}${img.url}`} alt={img.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
