import { useState } from 'react';
import type { BookingRequest, Quote as SquareQuote, CatalogData } from '../lib/square/types';
import { buildQuoteFromCatalog } from '../lib/quote';

export type BookingStep = 'package' | 'details' | 'quote' | 'deposit' | 'confirmed';
export type BookingMode = 'book' | 'estimate';

export const useBookingFlow = (catalog: CatalogData) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<BookingMode>('book');
  const [step, setStep] = useState<BookingStep>('package');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [guests, setGuests] = useState(50);
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('12:00');
  const [addons, setAddons] = useState<string[]>([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
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
    menuItemIds: selectedMenuItems,
    notes,
  });

  const fallbackQuote = buildQuoteFromCatalog(buildBookingRequest(), catalog);
  const total = fallbackQuote.totalCents / 100;
  const deposit = fallbackQuote.depositCents / 100;

  const open = (bookingMode: BookingMode = 'book') => { setIsOpen(true); setMode(bookingMode); setStep('package'); setSquareError(null); };
  const close = () => setIsOpen(false);
  const toggleAddon = (id: string) => setAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleMenuItem = (id: string) => setSelectedMenuItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return {
    isOpen, mode, step, selectedPackage, guests, eventType, eventDate, eventTime, addons, notes, pkg, total, deposit,
    customerName, customerEmail, customerPhone,
    squareQuote, fallbackQuote, squareOrderId, squareInvoiceId, squareInvoiceUrl, squareReceiptUrl, squareLoading, squareError,
    selectedMenuItems, setMode, setStep, setSelectedPackage, setGuests, setEventType, setEventDate, setEventTime, setNotes, toggleAddon, toggleMenuItem,
    setCustomerName, setCustomerEmail, setCustomerPhone,
    setSquareQuote, setSquareOrderId, setSquareInvoiceId, setSquareInvoiceUrl, setSquareReceiptUrl, setSquareLoading, setSquareError,
    buildBookingRequest,
    open, close,
  };
};
