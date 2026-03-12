import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Instagram, Phone, MessageCircle } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

export const FloatingContact = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-8 right-6 z-[101] flex flex-col items-end space-y-3">
      <AnimatePresence>
        {expanded && (
          <>
            <motion.a
              href="tel:+17739366416"
              onClick={() => trackEvent('cta_click_call', { location: 'floating_contact' })}
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
              href="sms:+17739366416"
              onClick={() => trackEvent('cta_click_text', { location: 'floating_contact' })}
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
              href="https://instagram.com/perfectperfectionscatering"
              target="_blank"
              onClick={() => trackEvent('cta_click_instagram', { location: 'floating_contact' })}
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
