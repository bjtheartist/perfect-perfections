import React, { useState } from 'react';
import type { Lead, LeadStatus } from '../lib/api/leads';

export const LeadDashboard = ({ onBack, adminToken }: { onBack: () => void; adminToken: string }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/leads', {
        headers: { 'x-admin-token': adminToken }
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setLeads([]);
        setError(data?.error || 'Unable to load leads');
        return;
      }
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Unable to load leads');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: LeadStatus) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || 'Unable to update lead');
      return;
    }
    fetchLeads();
  };

  React.useEffect(() => {
    fetchLeads();
  }, [adminToken]);

  return (
    <div className="min-h-screen bg-zinc-50 p-8 font-dm-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold">Inquiry Dashboard</h1>
            <p className="text-zinc-500">Manage your catering leads and bookings.</p>
          </div>
          <button
            onClick={onBack}
            className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest"
          >
            Back to Site
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading leads...</div>
        ) : error ? (
          <div className="bg-white p-10 text-center rounded-3xl border border-red-200 text-red-500">
            {error}
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-3xl border border-zinc-200">
            <p className="text-zinc-400">No leads captured yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-600' :
                      lead.status === 'contacted' ? 'bg-amber-100 text-amber-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {lead.status}
                    </span>
                    <span className="text-xs text-zinc-400">{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{lead.name}</h3>
                    <p className="text-zinc-500">{lead.email} • {lead.phone}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-zinc-400 uppercase text-[10px] font-bold">Event Date</span>
                      {lead.event_date}
                    </div>
                    <div>
                      <span className="block text-zinc-400 uppercase text-[10px] font-bold">Guests</span>
                      {lead.guests}
                    </div>
                    <div>
                      <span className="block text-zinc-400 uppercase text-[10px] font-bold">Type</span>
                      {lead.event_type}
                    </div>
                  </div>
                  {lead.message && (
                    <div className="bg-zinc-50 p-4 rounded-xl text-sm italic text-zinc-600">
                      "{lead.message}"
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center space-y-2">
                  <button
                    onClick={() => updateStatus(lead.id, 'contacted')}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-zinc-200 rounded-lg hover:bg-zinc-50"
                  >
                    Mark Contacted
                  </button>
                  <button
                    onClick={() => updateStatus(lead.id, 'booked')}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Mark Booked
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
