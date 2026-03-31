import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useBookingFlow } from './hooks/useBookingFlow';
import { useCatalog } from './hooks/useCatalog';
import { MockupC } from './components/MockupC';
import { FloatingContact } from './components/FloatingContact';
import { BookingModal } from './components/BookingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const { catalog, isLive } = useCatalog();
  const booking = useBookingFlow(catalog);
  const searchParams = new URLSearchParams(window.location.search);
  const [adminToken, setAdminToken] = useState(() => {
    return sessionStorage.getItem('pp_admin_token') || '';
  });
  const isAdmin = searchParams.get('admin') === 'true';

  if (isAdmin && !adminToken) {
    return <AdminLogin onLogin={setAdminToken} />;
  }

  if (isAdmin) {
    return (
      <ErrorBoundary fallbackMessage="The admin dashboard encountered an error.">
        <AdminDashboard adminToken={adminToken} onBack={() => { window.location.search = ''; }} />
      </ErrorBoundary>
    );
  }

  return (
    <div className="relative">
      <ErrorBoundary fallbackMessage="Something went wrong loading the page.">
        <MockupC onBook={() => booking.open('book')} onEstimate={() => booking.open('estimate')} catalog={catalog} />
      </ErrorBoundary>
      <FloatingContact />
      <AnimatePresence>
        {booking.isOpen && (
          <ErrorBoundary fallbackMessage="Something went wrong with the booking form.">
            <BookingModal flow={booking} catalog={catalog} isLive={isLive} />
          </ErrorBoundary>
        )}
      </AnimatePresence>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
