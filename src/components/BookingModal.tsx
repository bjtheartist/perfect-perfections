import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Utensils,
  Truck,
  Cake,
  Download,
  CreditCard,
  Calendar,
  Check,
  ChevronLeft,
  Minus,
  Plus,
  Clock,
  FileText,
  ExternalLink,
  Loader2,
  User,
  AlertCircle,
} from 'lucide-react';
import { useSquare } from '../lib/square/useSquare';
import { isSquareConfigured } from '../lib/square/config';
import { SquarePaymentForm } from './square/SquarePaymentForm';
import type { CatalogData, IconName } from '../lib/square/types';
import type { BookingStep, BookingMode } from '../hooks/useBookingFlow';
import type { useBookingFlow } from '../hooks/useBookingFlow';
import { downloadMenu } from '../utils/downloadMenu';

const ICON_COMPONENTS: Record<IconName, React.ComponentType<{ className?: string }>> = {
  utensils: Utensils,
  truck: Truck,
  cake: Cake,
};

export const BookingModal = ({
  flow,
  catalog,
  isLive,
}: {
  flow: ReturnType<typeof useBookingFlow>;
  catalog: CatalogData;
  isLive: boolean;
}) => {
  const square = useSquare();
  const squareEnabled = isSquareConfigured() && isLive;
  const activeQuote = flow.squareQuote ?? flow.fallbackQuote;
  const totalAmount = activeQuote ? activeQuote.totalCents / 100 : flow.total;
  const depositAmount = activeQuote ? activeQuote.depositCents / 100 : flow.deposit;
  const isEstimate = flow.mode === 'estimate';

  if (!flow.isOpen) return null;

  const bookStepInfo: Record<BookingStep, { num: number; title: string }> = {
    package: { num: 1, title: 'Choose Your Package' },
    details: { num: 2, title: 'Your Details & Customize' },
    quote: { num: 3, title: 'Your Quote' },
    deposit: { num: 4, title: 'Secure Your Date' },
    confirmed: { num: 5, title: 'Booking Confirmed' },
  };
  const estimateStepInfo: Record<BookingStep, { num: number; title: string }> = {
    package: { num: 1, title: 'Choose Your Package' },
    details: { num: 2, title: 'Event Details' },
    quote: { num: 3, title: 'Your Free Estimate' },
    deposit: { num: 3, title: 'Your Free Estimate' },
    confirmed: { num: 3, title: 'Estimate Sent' },
  };
  const stepInfo = isEstimate ? estimateStepInfo : bookStepInfo;
  const totalSteps = isEstimate ? 3 : 5;
  const info = stepInfo[flow.step];

  // Handle Square quote generation
  const handleGetQuote = async () => {
    if (!squareEnabled) {
      flow.setStep('quote');
      return;
    }
    flow.setSquareLoading(true);
    flow.setSquareError(null);
    try {
      const result = await square.getQuote(flow.buildBookingRequest());
      if (result.success && result.data) {
        flow.setSquareQuote(result.data);
      }
      flow.setStep('quote');
    } catch (err: any) {
      flow.setSquareError(err.message);
    } finally {
      flow.setSquareLoading(false);
    }
  };

  // Handle Square order + invoice creation
  const handlePayDeposit = async () => {
    if (!squareEnabled) {
      flow.setStep('deposit');
      return;
    }
    flow.setSquareLoading(true);
    flow.setSquareError(null);
    try {
      // Create the order in Square
      const orderResult = await square.createOrder(flow.buildBookingRequest());
      if (orderResult.success && orderResult.data) {
        flow.setSquareOrderId(orderResult.data.orderId);

        // Create and send invoice with deposit
        const invoiceResult = await square.createInvoice(
          orderResult.data.orderId,
          flow.customerEmail,
          orderResult.data.depositCents,
        );
        if (invoiceResult.success && invoiceResult.data) {
          flow.setSquareInvoiceId(invoiceResult.data.invoiceId);
          flow.setSquareInvoiceUrl(invoiceResult.data.publicUrl);
        }
      }
      flow.setStep('deposit');
    } catch (err: any) {
      flow.setSquareError(err.message);
    } finally {
      flow.setSquareLoading(false);
    }
  };

  // Handle deposit completion with soft invoice status check
  const handleCompleteDeposit = async () => {
    if (squareEnabled && flow.squareInvoiceId) {
      try {
        const result = await square.checkInvoiceStatus(flow.squareInvoiceId);
        if (result.success && result.data?.status === 'PAID') {
          flow.setStep('confirmed');
          return;
        }
      } catch {
        // Don't block — let them proceed even if check fails
      }
    }
    flow.setStep('confirmed');
  };

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
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Step {info.num} of {totalSteps}</p>
              <h2 className="text-lg font-bold">{info.title}</h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {squareEnabled && (
              <span className="flex items-center space-x-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>Square Live</span>
              </span>
            )}
            <button onClick={flow.close} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-8 pt-4">
          <div className="flex space-x-1">
            {(isEstimate ? ['package', 'details', 'quote'] : ['package', 'details', 'quote', 'deposit', 'confirmed']).map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${i < info.num ? 'bg-black' : 'bg-zinc-200'}`} />
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {flow.squareError && (
          <div className="mx-8 mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Something went wrong</p>
              <p className="text-xs text-red-600 mt-1">{flow.squareError}</p>
            </div>
            <button onClick={() => flow.setSquareError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-8">
          {/* Step 1: Package Selection */}
          {flow.step === 'package' && (
            <div className="space-y-4">
              {catalog.packages.map((p) => {
                const Icon = ICON_COMPONENTS[p.icon] || Utensils;
                const displayPrice = p.pricePerPersonCents / 100;
                return (
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
                        <div className="p-2 bg-zinc-100 rounded-xl"><Icon className="w-5 h-5" /></div>
                        <div>
                          <h3 className="font-bold text-lg">{p.name}</h3>
                          <p className="text-sm text-zinc-500 mt-1">{p.description}</p>
                        </div>
                      </div>
                      {displayPrice > 0 && (
                        <div className="text-right flex-shrink-0 ml-4">
                          <span className="text-xl font-bold">${displayPrice}</span>
                          <span className="text-xs text-zinc-400 block">service fee</span>
                        </div>
                      )}
                      {displayPrice === 0 && (
                        <div className="text-right flex-shrink-0 ml-4">
                          <span className="text-sm font-bold text-zinc-500">Food cost only</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.includes.map((item) => (
                        <span key={item} className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full">{item}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
              <button onClick={() => downloadMenu()} className="w-full flex items-center justify-center space-x-2 py-4 text-sm text-zinc-500 hover:text-black transition-colors">
                <Download className="w-4 h-4" />
                <span>Download Full Menu (PDF)</span>
              </button>
            </div>
          )}

          {/* Step 2: Event Details + Customer Info */}
          {flow.step === 'details' && (
            <div className="space-y-8">
              {/* Customer Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-1">
                  <User className="w-4 h-4 text-zinc-400" />
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Your Information</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={flow.customerName}
                    onChange={(e) => flow.setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full border-2 border-zinc-200 rounded-xl p-4 outline-none focus:border-black transition-colors"
                  />
                  <input
                    type="email"
                    value={flow.customerEmail}
                    onChange={(e) => flow.setCustomerEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full border-2 border-zinc-200 rounded-xl p-4 outline-none focus:border-black transition-colors"
                  />
                  <input
                    type="tel"
                    value={flow.customerPhone}
                    onChange={(e) => flow.setCustomerPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full border-2 border-zinc-200 rounded-xl p-4 outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              {/* Event Details */}
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

              {/* Menu Item Selection */}
              {catalog.menuItems && catalog.menuItems.length > 0 && (() => {
                const filtered = catalog.menuItems.filter(item => !/deposit|balance|gratuity|delivery|extra plate|individual packaging|liquor|mixer|decoration|beverage|juice|water|assorted snack|assorted chip|meal prep|vegetarian.*gluten|wine bar|full service|dropoff|catering for/i.test(item.name));
                const grouped: Record<string, typeof filtered> = {};
                for (const item of filtered) {
                  const cat = item.category || 'Other';
                  if (!grouped[cat]) grouped[cat] = [];
                  grouped[cat].push(item);
                }
                const categoryOrder = ['Entrées', 'Sides', 'Sides & Salads', 'Appetizers', 'Breakfast & Brunch', 'Desserts', 'Other'];
                const sortedCategories = Object.keys(grouped).sort((a, b) => {
                  const ai = categoryOrder.indexOf(a);
                  const bi = categoryOrder.indexOf(b);
                  return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                });
                return (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">What Would You Like Served?</label>
                    <p className="text-xs text-zinc-400">Select your dishes — prices shown as small pan / large pan</p>
                    <div className="max-h-72 overflow-y-auto border-2 border-zinc-100 rounded-xl p-4 space-y-5">
                      {sortedCategories.map((cat) => (
                        <div key={cat}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{cat}</p>
                          <div className="space-y-1.5">
                            {grouped[cat].map((item) => (
                              <div key={item.id} className="space-y-1">
                                <button
                                  onClick={() => flow.toggleMenuItem(item.id)}
                                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left ${
                                    flow.selectedMenuItems.includes(item.id) ? 'border-black bg-zinc-50' : 'border-zinc-100 hover:border-zinc-300'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3 min-w-0">
                                    <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${flow.selectedMenuItems.includes(item.id) ? 'border-black bg-black' : 'border-zinc-300'}`}>
                                      {flow.selectedMenuItems.includes(item.id) && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    <span className="font-medium text-sm truncate">{item.name}</span>
                                  </div>
                                  {item.priceCents > 0 && (
                                    <span className="text-xs text-zinc-400 flex-shrink-0 ml-2">
                                      ${(item.priceCents / 100).toFixed(0)}{item.largePriceCents ? ` / $${(item.largePriceCents / 100).toFixed(0)}` : ''}
                                    </span>
                                  )}
                                </button>
                                {flow.selectedMenuItems.includes(item.id) && item.largePriceCents && item.largePriceCents !== item.priceCents && (
                                  <div className="flex items-center space-x-2 ml-7">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); flow.setMenuItemSize(item.id, 'small'); }}
                                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                        flow.menuItemSizes[item.id] === 'small'
                                          ? 'bg-black text-white'
                                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                                      }`}
                                    >
                                      Small ${(item.priceCents / 100).toFixed(0)}
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); flow.setMenuItemSize(item.id, 'large'); }}
                                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                        flow.menuItemSizes[item.id] === 'large'
                                          ? 'bg-black text-white'
                                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                                      }`}
                                    >
                                      Large ${(item.largePriceCents / 100).toFixed(0)}
                                    </button>
                                    <span className="text-[10px] text-zinc-400 ml-1">
                                      {flow.menuItemSizes[item.id] === 'large' ? 'feeds 35-40' : 'feeds 12-15'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {flow.selectedMenuItems.length > 0 && (
                      <p className="text-xs text-zinc-500">{flow.selectedMenuItems.length} dish{flow.selectedMenuItems.length !== 1 ? 'es' : ''} selected</p>
                    )}
                  </div>
                );
              })()}

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Add-Ons</label>
                {catalog.addons.map((addon) => (
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
                    <span className="text-sm text-zinc-500">
                      +${(addon.priceCents / 100).toFixed(0)} {addon.pricingType === 'flat' ? 'flat' : 'per pan'}
                    </span>
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
                onClick={handleGetQuote}
                disabled={!flow.eventType || !flow.eventDate || !flow.customerName || !flow.customerEmail || flow.squareLoading}
                className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {flow.squareLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /><span>Generating {isEstimate ? 'Estimate' : 'Quote'}...</span></>
                ) : (
                  <span>{isEstimate ? 'See Your Estimate →' : 'See Your Quote →'}</span>
                )}
              </button>
            </div>
          )}

          {/* Step 3: Quote */}
          {flow.step === 'quote' && activeQuote && (
            <div className="space-y-8">
              <div className="bg-zinc-50 rounded-2xl p-6 space-y-4">
                {activeQuote.lineItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <p className="text-zinc-600">{item.name}</p>
                    <span className="font-medium">${(item.totalCents / 100).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm text-zinc-500 pt-2 border-t border-zinc-100">
                  <span>Subtotal</span>
                  <span>${(activeQuote.subtotalCents / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Tax (10.25%)</span>
                  <span>${(activeQuote.taxCents / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-zinc-200 text-lg font-bold">
                  <span>Total</span>
                  <span>${(activeQuote.totalCents / 100).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-800 font-bold">Deposit to Secure Your Date</p>
                  <p className="text-xs text-emerald-600">25% of total — remainder due 7 days before event</p>
                </div>
                <span className="text-2xl font-bold text-emerald-800">
                  ${depositAmount.toLocaleString()}
                </span>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-6 space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-zinc-600">
                  <User className="w-4 h-4" />
                  <span>{flow.customerName} · {flow.customerEmail}</span>
                </div>
                <div className="flex items-center space-x-2 text-zinc-600">
                  <Calendar className="w-4 h-4" />
                  <span>{flow.eventType} · {flow.eventDate} at {flow.eventTime}</span>
                </div>
                <div className="flex items-center space-x-2 text-zinc-600">
                  <Utensils className="w-4 h-4" />
                  <span>{flow.guests} guests · {flow.pkg?.name || 'Catering'}</span>
                </div>
                {flow.selectedMenuItems.length > 0 && (
                  <div className="flex items-start space-x-2 text-zinc-600">
                    <Utensils className="w-4 h-4 mt-0.5" />
                    <span>Menu: {flow.selectedMenuItems
                      .map(id => (catalog.menuItems || []).find(m => m.id === id)?.name)
                      .filter(Boolean)
                      .join(', ')
                    }</span>
                  </div>
                )}
                {flow.notes && (
                  <div className="flex items-start space-x-2 text-zinc-600">
                    <FileText className="w-4 h-4 mt-0.5" />
                    <span>{flow.notes}</span>
                  </div>
                )}
              </div>

              {isEstimate ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 rounded-2xl p-6 text-center space-y-2">
                    <p className="text-sm font-bold text-amber-800">This is a free estimate — no payment required</p>
                    <p className="text-xs text-amber-600">Prices may vary based on final menu selections and event details. Nikida will follow up to finalize your order.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => downloadMenu()} className="flex items-center justify-center space-x-2 py-4 border-2 border-zinc-200 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-colors">
                      <Download className="w-4 h-4" />
                      <span>Download Menu</span>
                    </button>
                    <button
                      onClick={() => { flow.setMode('book'); flow.setStep('details'); }}
                      className="flex items-center justify-center space-x-2 py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Ready to Book →</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => downloadMenu()} className="flex items-center justify-center space-x-2 py-4 border-2 border-zinc-200 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download Quote</span>
                  </button>
                  <button
                    onClick={handlePayDeposit}
                    disabled={flow.squareLoading}
                    className="flex items-center justify-center space-x-2 py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    {flow.squareLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating Order...</span></>
                    ) : (
                      <><CreditCard className="w-4 h-4" /><span>Pay Deposit →</span></>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Deposit Payment */}
          {flow.step === 'deposit' && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">
                  ${depositAmount.toLocaleString()}
                </p>
                <p className="text-sm text-zinc-500">25% deposit to secure {flow.eventDate}</p>
              </div>

              {/* Square Invoice Link — if invoice was created, show link + embedded pay */}
              {flow.squareInvoiceUrl ? (
                <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-900">Invoice Created!</p>
                        <p className="text-sm text-emerald-700">Order #{flow.squareOrderId?.slice(-8)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-emerald-800">
                      An invoice has been sent to <strong>{flow.customerEmail}</strong>.
                    </p>
                  </div>

                  {/* Embedded Square Payment Form for deposit */}
                  {squareEnabled ? (
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Pay deposit now</p>
                      <SquarePaymentForm
                        amountCents={Math.round(depositAmount * 100)}
                        processing={flow.squareLoading}
                        onTokenize={async (token) => {
                          flow.setSquareLoading(true);
                          flow.setSquareError(null);
                          try {
                            const result = await square.processPayment({
                              sourceId: token,
                              amountCents: Math.round(depositAmount * 100),
                              orderId: flow.squareOrderId || '',
                              customerEmail: flow.customerEmail,
                              note: `Deposit for ${flow.eventType} on ${flow.eventDate}`,
                            });
                            if (result.success && result.data) {
                              flow.setSquareReceiptUrl(result.data.receiptUrl || null);
                              flow.setStep('confirmed');
                            } else {
                              flow.setSquareError(result.error || 'Payment failed');
                            }
                          } catch (err: any) {
                            flow.setSquareError(err.message);
                          } finally {
                            flow.setSquareLoading(false);
                          }
                        }}
                        onError={(err) => flow.setSquareError(err)}
                      />
                    </div>
                  ) : (
                    <a
                      href={flow.squareInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors"
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Pay Deposit via Invoice</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={handleCompleteDeposit}
                    className="w-full text-zinc-500 py-3 text-sm hover:text-black transition-colors"
                  >
                    I'll pay later → Continue to Confirmation
                  </button>
                </div>
              ) : (
                /* No invoice yet — show embedded Square payment directly */
                <div className="space-y-6">
                  {squareEnabled ? (
                    <>
                      <SquarePaymentForm
                        amountCents={Math.round(depositAmount * 100)}
                        processing={flow.squareLoading}
                        onTokenize={async (token) => {
                          flow.setSquareLoading(true);
                          flow.setSquareError(null);
                          try {
                            // Create order first if we don't have one
                            let orderId = flow.squareOrderId;
                            if (!orderId) {
                              const orderResult = await square.createOrder(flow.buildBookingRequest());
                              if (orderResult.success && orderResult.data) {
                                orderId = orderResult.data.orderId;
                                flow.setSquareOrderId(orderId);
                              } else {
                                flow.setSquareError(orderResult.error || 'Failed to create order');
                                return;
                              }
                            }

                            const result = await square.processPayment({
                              sourceId: token,
                              amountCents: Math.round(depositAmount * 100),
                              orderId: orderId || '',
                              customerEmail: flow.customerEmail,
                              note: `Deposit for ${flow.eventType} on ${flow.eventDate}`,
                            });
                            if (result.success && result.data) {
                              flow.setSquareReceiptUrl(result.data.receiptUrl || null);
                              flow.setStep('confirmed');
                            } else {
                              flow.setSquareError(result.error || 'Payment failed');
                            }
                          } catch (err: any) {
                            flow.setSquareError(err.message);
                          } finally {
                            flow.setSquareLoading(false);
                          }
                        }}
                        onError={(err) => flow.setSquareError(err)}
                      />
                      <p className="text-xs text-zinc-400 text-center">Secure payment powered by Square</p>
                    </>
                  ) : (
                    <div className="space-y-4 text-center">
                      <div className="bg-amber-50 rounded-2xl p-6 space-y-2">
                        <p className="text-sm font-bold text-amber-800">Payments coming soon</p>
                        <p className="text-xs text-amber-600">Contact Nikida directly to arrange payment for your event.</p>
                      </div>
                      <a href="tel:+17739366416" className="inline-flex items-center space-x-2 text-sm font-medium text-black hover:text-zinc-600 transition-colors">
                        <span>Call (773) 936-6416</span>
                      </a>
                    </div>
                  )}

                  <button
                    onClick={handleCompleteDeposit}
                    className="w-full text-zinc-500 py-3 text-sm hover:text-black transition-colors"
                  >
                    Skip payment → Continue to Confirmation
                  </button>
                </div>
              )}
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
                <p className="text-zinc-500">
                  {flow.squareOrderId
                    ? <>Invoice sent to <strong>{flow.customerEmail}</strong>. Nikida will confirm within 24 hours.</>
                    : <>Deposit of ${depositAmount.toLocaleString()} received. Nikida will reach out within 24 hours to finalize your menu.</>
                  }
                </p>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-6 text-left space-y-3 text-sm max-w-sm mx-auto">
                {flow.squareOrderId && (
                  <div className="flex justify-between"><span className="text-zinc-500">Order ID</span><span className="font-mono font-medium text-xs">#{flow.squareOrderId.slice(-8)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-zinc-500">Client</span><span className="font-medium">{flow.customerName}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Event</span><span className="font-medium">{flow.eventType}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Date</span><span className="font-medium">{flow.eventDate}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Time</span><span className="font-medium">{flow.eventTime}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Guests</span><span className="font-medium">{flow.guests}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Package</span><span className="font-medium">{flow.pkg?.name}</span></div>
                <div className="flex justify-between border-t border-zinc-200 pt-3">
                  <span className="text-zinc-500">Total</span>
                  <span className="font-bold">${totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Deposit Due</span>
                  <span className="font-bold text-emerald-600">${depositAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Square-specific links */}
              {(flow.squareInvoiceUrl || flow.squareReceiptUrl) && (
                <div className="flex justify-center space-x-4">
                  {flow.squareInvoiceUrl && (
                    <a href={flow.squareInvoiceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800">
                      <ExternalLink className="w-4 h-4" />
                      <span>View Invoice</span>
                    </a>
                  )}
                  {flow.squareReceiptUrl && (
                    <a href={flow.squareReceiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800">
                      <ExternalLink className="w-4 h-4" />
                      <span>View Receipt</span>
                    </a>
                  )}
                </div>
              )}

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
