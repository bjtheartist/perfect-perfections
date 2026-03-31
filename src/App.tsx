import { AnimatePresence } from 'motion/react';
import { lazy, Suspense, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useBookingFlow } from './hooks/useBookingFlow';
import { useCatalog } from './hooks/useCatalog';
import { MockupC } from './components/MockupC';
import { FloatingContact } from './components/FloatingContact';
import { ErrorBoundary } from './components/ErrorBoundary';

const BookingModal = lazy(() => import('./components/BookingModal').then(m => ({ default: m.BookingModal })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminLogin = lazy(() => import('./components/AdminLogin').then(m => ({ default: m.AdminLogin })));

export default function App() {
  const { catalog, isLive } = useCatalog();
  const booking = useBookingFlow(catalog);
  const searchParams = new URLSearchParams(window.location.search);
  const [adminToken, setAdminToken] = useState(() => {
    const token = sessionStorage.getItem('pp_admin_token') || '';
    if (token) {
      const ts = Number(sessionStorage.getItem('pp_admin_token_ts') || '0');
      const EIGHT_HOURS = 8 * 60 * 60 * 1000;
      if (Date.now() - ts > EIGHT_HOURS) {
        sessionStorage.removeItem('pp_admin_token');
        sessionStorage.removeItem('pp_admin_token_ts');
        return '';
      }
    }
    return token;
  });
  const isAdmin = searchParams.get('admin') === 'true';

  if (isAdmin && !adminToken) {
    return (
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-neutral-400">Loading...</div>}>
        <AdminLogin onLogin={setAdminToken} />
      </Suspense>
    );
  }

  if (isAdmin) {
    return (
      <ErrorBoundary fallbackMessage="The admin dashboard encountered an error.">
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-neutral-400">Loading...</div>}>
          <AdminDashboard adminToken={adminToken} onBack={() => { window.location.search = ''; }} onLogout={() => {
            sessionStorage.removeItem('pp_admin_token');
            sessionStorage.removeItem('pp_admin_token_ts');
            setAdminToken('');
          }} />
        </Suspense>
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
            <Suspense fallback={<div className="flex items-center justify-center p-8 text-neutral-400">Loading...</div>}>
              <BookingModal flow={booking} catalog={catalog} isLive={isLive} />
            </Suspense>
          </ErrorBoundary>
        )}
      </AnimatePresence>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
