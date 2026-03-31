import { useState } from 'react';
import { MEAL_PREP_PREFIXE, MEAL_PREP_BUILD_YOUR_OWN, BUSINESS_MEETING_MENUS } from '../data/constants';

export function MealPrepSection({ onBook }: { onBook: () => void }) {
  const [activeTab, setActiveTab] = useState<'prefixe' | 'custom' | 'business'>('prefixe');

  return (
    <section id="meal-prep" className="py-32 px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">weekly meal prep</span>
          <h2 className="font-caveat text-4xl">Eating Well, Made Easy</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">Fresh, flavorful meals portioned and ready to heat. Minimum 6 meals per order.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {([
            { key: 'prefixe' as const, label: 'Pre-Fixe Menu' },
            { key: 'custom' as const, label: 'Build Your Own' },
            { key: 'business' as const, label: 'Business Meetings' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Pre-Fixe Tab */}
        {activeTab === 'prefixe' && (
          <div className="bg-zinc-50 rounded-[40px] p-8 md:p-12">
            <p className="text-sm text-zinc-500 mb-8">Choose from our chef-curated meals — each one a complete, balanced dish.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {MEAL_PREP_PREFIXE.map((item, i) => (
                <div key={i} className="flex justify-between items-baseline py-3 border-b border-zinc-200/60 last:border-0">
                  <span className="font-playfair text-sm md:text-base flex-1 mr-4">{item.name}</span>
                  <span className="text-sm font-medium text-zinc-500 whitespace-nowrap">${item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Build Your Own Tab */}
        {activeTab === 'custom' && (
          <div className="bg-zinc-50 rounded-[40px] p-8 md:p-12 space-y-10">
            <p className="text-sm text-zinc-500">{MEAL_PREP_BUILD_YOUR_OWN.description} — pick your proteins, vegetables, and sides.</p>

            {([
              { label: 'Protein', pick: MEAL_PREP_BUILD_YOUR_OWN.proteins.pick, options: MEAL_PREP_BUILD_YOUR_OWN.proteins.options },
              { label: 'Vegetable', pick: MEAL_PREP_BUILD_YOUR_OWN.vegetables.pick, options: MEAL_PREP_BUILD_YOUR_OWN.vegetables.options },
              { label: 'Side', pick: MEAL_PREP_BUILD_YOUR_OWN.sides.pick, options: MEAL_PREP_BUILD_YOUR_OWN.sides.options },
            ]).map(({ label, pick, options }) => (
              <div key={label}>
                <div className="flex items-baseline space-x-3 mb-4">
                  <h3 className="font-playfair text-xl">{label}</h3>
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">pick {pick}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-3 bg-white rounded-xl px-4 py-3 border border-zinc-100">
                      <div className="w-2 h-2 rounded-full bg-zinc-300 flex-shrink-0" />
                      <span className="text-sm">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Business Meetings Tab */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            <p className="text-sm text-zinc-500 text-center">Suggested lunch menus for your next corporate event or team meeting.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BUSINESS_MEETING_MENUS.map((menu, i) => (
                <div key={i} className="bg-zinc-50 rounded-[32px] p-8 space-y-4">
                  <h3 className="font-playfair text-xl">{menu.name}</h3>
                  <ul className="space-y-2">
                    {menu.items.map((item, j) => (
                      <li key={j} className="flex items-center space-x-3 text-sm text-zinc-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-50 rounded-[32px] p-8 text-center space-y-2">
                <h3 className="font-playfair text-lg">Individual Cold Lunch Boxes</h3>
                <p className="text-sm text-zinc-500">Packaged and ready to grab</p>
              </div>
              <div className="bg-zinc-50 rounded-[32px] p-8 text-center space-y-2">
                <h3 className="font-playfair text-lg">Individual Hot Lunch Boxes</h3>
                <p className="text-sm text-zinc-500">Warm meals, individually portioned</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA + Additional Services */}
        <div className="mt-12 text-center space-y-6">
          <p className="text-sm text-zinc-500">We also offer event planning, decor & custom dessert tables.</p>
          <button onClick={onBook} className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-zinc-800 transition-all">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}
