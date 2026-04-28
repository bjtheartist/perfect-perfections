import React, { useState } from 'react';
import { Users, ShoppingCart, CreditCard, UserCheck } from 'lucide-react';
import type { Lead, LeadStatus } from '../lib/api/leads';
import type { OrderSummary, TransactionSummary, CustomerSummary } from '../lib/square/types';

type TabKey = 'leads' | 'orders' | 'transactions' | 'customers';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'leads', label: 'Leads', icon: <Users size={16} /> },
  { key: 'orders', label: 'Orders', icon: <ShoppingCart size={16} /> },
  { key: 'transactions', label: 'Transactions', icon: <CreditCard size={16} /> },
  { key: 'customers', label: 'Customers', icon: <UserCheck size={16} /> },
];

function adminFetch(path: string, token: string, opts?: RequestInit) {
  return fetch(path, {
    ...opts,
    headers: { 'x-admin-token': token, ...opts?.headers },
  });
}

function cents(amount: number) {
  return `$${(amount / 100).toFixed(2)}`;
}

function fmtDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}

// ── Badge helper ────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
    zinc: 'bg-zinc-100 text-zinc-600',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${colors[color] || colors.zinc}`}>
      {label}
    </span>
  );
}

function orderBadgeColor(state: string) {
  if (state === 'COMPLETED') return 'emerald';
  if (state === 'CANCELED') return 'red';
  return 'blue';
}

function paymentBadgeColor(status: string) {
  if (status === 'COMPLETED') return 'emerald';
  if (status === 'FAILED') return 'red';
  return 'amber';
}

// ── Leads Tab ───────────────────────────────────────────────
function LeadsTab({ token }: { token: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminFetch('/api/leads', token);
      const data = await res.json().catch(() => null);
      if (!res.ok) { setLeads([]); setError(data?.error || 'Unable to load leads'); return; }
      setLeads(Array.isArray(data) ? data : []);
    } catch { setError('Unable to load leads'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: LeadStatus) => {
    const res = await adminFetch(`/api/leads/${id}`, token, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { const d = await res.json().catch(() => null); setError(d?.error || 'Unable to update lead'); return; }
    fetchLeads();
  };

  React.useEffect(() => { fetchLeads(); }, [token]);

  if (loading) return <div className="text-center py-20">Loading leads...</div>;
  if (error) return <div className="bg-white p-10 text-center rounded-3xl border border-red-200 text-red-500">{error}</div>;
  if (!leads.length) return <div className="bg-white p-20 text-center rounded-3xl border border-zinc-200"><p className="text-zinc-400">No leads captured yet.</p></div>;

  return (
    <div className="grid gap-6">
      {leads.map((lead) => (
        <div key={lead.id} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Badge
                label={lead.status}
                color={lead.status === 'new' ? 'blue' : lead.status === 'contacted' ? 'amber' : 'emerald'}
              />
              <span className="text-xs text-zinc-400">{fmtDate(lead.created_at)}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">{lead.name}</h3>
              <p className="text-zinc-500">{lead.email} • {lead.phone}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="block text-zinc-400 uppercase text-[10px] font-bold">Event Date</span>{lead.event_date}</div>
              <div><span className="block text-zinc-400 uppercase text-[10px] font-bold">Guests</span>{lead.guests}</div>
              <div><span className="block text-zinc-400 uppercase text-[10px] font-bold">Type</span>{lead.event_type}</div>
            </div>
            {lead.message && (
              <div className="bg-zinc-50 p-4 rounded-xl text-sm italic text-zinc-600">"{lead.message}"</div>
            )}
          </div>
          <div className="flex flex-col justify-center space-y-2">
            <button onClick={() => updateStatus(lead.id, 'contacted')} className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-zinc-200 rounded-lg hover:bg-zinc-50">Mark Contacted</button>
            <button onClick={() => updateStatus(lead.id, 'booked')} className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">Mark Booked</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Orders Tab ──────────────────────────────────────────────
function OrdersTab({ token }: { token: string }) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await adminFetch('/api/square/admin?resource=orders', token);
        const json = await res.json();
        if (!json.success) { setError(json.error || 'Unable to load orders'); return; }
        setOrders(json.data || []);
      } catch { setError('Unable to load orders'); }
      finally { setLoading(false); }
    })();
  }, [token]);

  if (loading) return <div className="text-center py-20">Loading orders...</div>;
  if (error) return <div className="bg-white p-10 text-center rounded-3xl border border-red-200 text-red-500">{error}</div>;
  if (!orders.length) return <div className="bg-white p-20 text-center rounded-3xl border border-zinc-200"><p className="text-zinc-400">No orders yet.</p></div>;

  return (
    <div className="grid gap-6">
      {orders.map((o) => (
        <div key={o.id} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge label={o.state} color={orderBadgeColor(o.state)} />
              <span className="text-xs text-zinc-400">{fmtDate(o.createdAt)}</span>
            </div>
            <span className="text-lg font-bold">{cents(o.totalCents)}</span>
          </div>
          <h3 className="text-xl font-bold mb-1">{o.customerName}</h3>
          <p className="text-sm text-zinc-500">{o.referenceId}</p>
          {(o.eventType || o.eventDate || o.guestCount) && (
            <div className="grid grid-cols-3 gap-4 text-sm mt-4">
              {o.eventType && <div><span className="block text-zinc-400 uppercase text-[10px] font-bold">Event</span>{o.eventType}</div>}
              {o.eventDate && <div><span className="block text-zinc-400 uppercase text-[10px] font-bold">Date</span>{o.eventDate}</div>}
              {o.guestCount && <div><span className="block text-zinc-400 uppercase text-[10px] font-bold">Guests</span>{o.guestCount}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Transactions Tab ────────────────────────────────────────
function TransactionsTab({ token }: { token: string }) {
  const [txns, setTxns] = useState<TransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await adminFetch('/api/square/admin?resource=transactions', token);
        const json = await res.json();
        if (!json.success) { setError(json.error || 'Unable to load transactions'); return; }
        setTxns(json.data || []);
      } catch { setError('Unable to load transactions'); }
      finally { setLoading(false); }
    })();
  }, [token]);

  if (loading) return <div className="text-center py-20">Loading transactions...</div>;
  if (error) return <div className="bg-white p-10 text-center rounded-3xl border border-red-200 text-red-500">{error}</div>;
  if (!txns.length) return <div className="bg-white p-20 text-center rounded-3xl border border-zinc-200"><p className="text-zinc-400">No transactions yet.</p></div>;

  return (
    <div className="grid gap-6">
      {txns.map((t) => (
        <div key={t.id} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge label={t.status} color={paymentBadgeColor(t.status)} />
              <span className="text-xs text-zinc-400">{fmtDate(t.createdAt)}</span>
            </div>
            <span className="text-lg font-bold">{cents(t.amountCents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {t.cardBrand && t.last4 ? `${t.cardBrand} ••${t.last4}` : 'Card details unavailable'}
            </p>
            {t.receiptUrl && (
              <a href={t.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                View Receipt
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Customers Tab ───────────────────────────────────────────
function CustomersTab({ token }: { token: string }) {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await adminFetch('/api/square/admin?resource=customers', token);
        const json = await res.json();
        if (!json.success) { setError(json.error || 'Unable to load customers'); return; }
        setCustomers(json.data || []);
      } catch { setError('Unable to load customers'); }
      finally { setLoading(false); }
    })();
  }, [token]);

  if (loading) return <div className="text-center py-20">Loading customers...</div>;
  if (error) return <div className="bg-white p-10 text-center rounded-3xl border border-red-200 text-red-500">{error}</div>;
  if (!customers.length) return <div className="bg-white p-20 text-center rounded-3xl border border-zinc-200"><p className="text-zinc-400">No customers yet.</p></div>;

  return (
    <div className="grid gap-6">
      {customers.map((c) => (
        <div key={c.id} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold">{c.displayName}</h3>
            <span className="text-xs text-zinc-400">Joined {fmtDate(c.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-zinc-500">
            {c.emailAddress && <a href={`mailto:${c.emailAddress}`} className="hover:text-blue-600">{c.emailAddress}</a>}
            {c.phoneNumber && <a href={`tel:${c.phoneNumber}`} className="hover:text-blue-600">{c.phoneNumber}</a>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────
export const AdminDashboard = ({ onBack, onLogout, adminToken }: { onBack: () => void; onLogout: () => void; adminToken: string }) => {
  const [tab, setTab] = useState<TabKey>('leads');

  return (
    <div className="min-h-screen bg-zinc-50 p-8 font-dm-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-zinc-500">Manage leads, orders, payments &amp; customers.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onBack}
              className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest"
            >
              Back to Site
            </button>
            <button
              onClick={onLogout}
              className="border border-zinc-300 text-zinc-600 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-zinc-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex space-x-2 mb-8 bg-white rounded-2xl p-1.5 border border-zinc-200 w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                tab === t.key ? 'bg-black text-white' : 'text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'leads' && <LeadsTab token={adminToken} />}
        {tab === 'orders' && <OrdersTab token={adminToken} />}
        {tab === 'transactions' && <TransactionsTab token={adminToken} />}
        {tab === 'customers' && <CustomersTab token={adminToken} />}
      </div>
    </div>
  );
};
