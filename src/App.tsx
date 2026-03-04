import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { useBookingFlow } from './hooks/useBookingFlow';
import { useCatalog } from './hooks/useCatalog';
import { MockupC } from './components/MockupC';
import { FloatingContact } from './components/FloatingContact';
import { BookingModal } from './components/BookingModal';
import { LeadDashboard } from './components/LeadDashboard';

export default function App() {
  const { catalog, isLive } = useCatalog();
  const booking = useBookingFlow(catalog);
  const searchParams = new URLSearchParams(window.location.search);
  const [adminToken, setAdminToken] = useState(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      sessionStorage.setItem('pp_admin_token', tokenFromUrl);
      searchParams.delete('token');
      const nextSearch = searchParams.toString();
      const nextUrl = nextSearch ? `${window.location.pathname}?${nextSearch}` : window.location.pathname;
      window.history.replaceState(null, '', nextUrl);
      return tokenFromUrl;
    }
    return sessionStorage.getItem('pp_admin_token') || '';
  });
  const isAdmin = searchParams.get('admin') === 'true';

  useEffect(() => {
    if (!isAdmin || adminToken) return;
    const entered = window.prompt('Enter admin token');
    if (entered) {
      sessionStorage.setItem('pp_admin_token', entered);
      setAdminToken(entered);
    }
  }, [isAdmin, adminToken]);

  if (isAdmin) {
    return <LeadDashboard adminToken={adminToken} onBack={() => { window.location.search = ''; }} />;
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
