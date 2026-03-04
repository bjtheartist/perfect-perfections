import { useState } from 'react';
import type { BookingRequest, Quote as SquareQuote, CatalogData } from '../lib/square/types';
import { DEPOSIT_RATE } from '../data/constants';

export type BookingStep = 'package' | 'details' | 'quote' | 'deposit' | 'confirmed';

export const useBookingFlow = (catalog: CatalogData) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<BookingStep>('package');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [guests, setGuests] = useState(50);
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('12:00');
  const [addons, setAddons] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Customer info (needed for Square)
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Square integration state
  const [squareQuote, setSquareQuote] = useState<SquareQuote | null>(null);
  const [squareOrderId, setSquareOrderId] = useState<string | null>(null);
  const [squareInvoiceId, setSquareInvoiceId] = useState<string | null>(null);
  const [squareInvoiceUrl, setSquareInvoiceUrl] = useState<string | null>(null);
  const [squareReceiptUrl, setSquareReceiptUrl] = useState<string | null>(null);
  const [squareLoading, setSquareLoading] = useState(false);
  const [squareError, setSquareError] = useState<string | null>(null);

  const pkg = catalog.packages.find(p => p.id === selectedPackage);

  const total = (() => {
    let t = pkg ? (pkg.pricePerPersonCents / 100) * guests : 0;
    addons.forEach(id => {
      const a = catalog.addons.find(x => x.id === id);
      if (a) t += a.pricingType === 'per-person' ? (a.priceCents / 100) * guests : a.priceCents / 100;
    });
    return t;
  })();

  const deposit = Math.round(total * DEPOSIT_RATE);

  const open = () => { setIsOpen(true); setStep('package'); setSquareError(null); };
  const close = () => setIsOpen(false);
  const toggleAddon = (id: string) => setAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const buildBookingRequest = (): BookingRequest => ({
    customerName,
    customerEmail,
    customerPhone,
    eventType,
    eventDate,
    eventTime,
    guestCount: guests,
    packageId: selectedPackage || catalog.packages[0]?.id || 'custom',
    addonIds: addons,
    notes,
  });

  return {
    isOpen, step, selectedPackage, guests, eventType, eventDate, eventTime, addons, notes, pkg, total, deposit,
    customerName, customerEmail, customerPhone,
    squareQuote, squareOrderId, squareInvoiceId, squareInvoiceUrl, squareReceiptUrl, squareLoading, squareError,
    setStep, setSelectedPackage, setGuests, setEventType, setEventDate, setEventTime, setNotes, toggleAddon,
    setCustomerName, setCustomerEmail, setCustomerPhone,
    setSquareQuote, setSquareOrderId, setSquareInvoiceId, setSquareInvoiceUrl, setSquareReceiptUrl, setSquareLoading, setSquareError,
    buildBookingRequest,
    open, close,
  };
};
