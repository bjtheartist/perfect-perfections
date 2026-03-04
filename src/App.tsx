import { AnimatePresence } from 'motion/react';
import { useBookingFlow } from './hooks/useBookingFlow';
import { useCatalog } from './hooks/useCatalog';
import { MockupC } from './components/MockupC';
import { FloatingContact } from './components/FloatingContact';
import { BookingModal } from './components/BookingModal';
import { LeadDashboard } from './components/LeadDashboard';

export default function App() {
  const { catalog, isLive } = useCatalog();
  const booking = useBookingFlow(catalog);
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

  if (isAdmin) {
    return <LeadDashboard onBack={() => { window.location.search = ''; }} />;
  }

  return (
    <div className="relative">
      <MockupC onBook={booking.open} catalog={catalog} />
      <FloatingContact />
      <AnimatePresence>
        {booking.isOpen && <BookingModal flow={booking} catalog={catalog} isLive={isLive} />}
      </AnimatePresence>
    </div>
  );
}
