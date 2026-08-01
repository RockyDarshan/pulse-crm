'use client';

import { useEffect, useState, useCallback } from 'react';
import LeadsTable from '@/components/LeadsTable';
import StatsBar from '@/components/StatsBar';
import SearchFilterBar from '@/components/SearchFilterBar';
import LeadFormModal from '@/components/LeadFormModal';
import LeadDetailDrawer from '@/components/LeadDetailDrawer';

export default function Home() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('All');
  const [priority, setPriority] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [fetchError, setFetchError] = useState('');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (stage !== 'All') params.set('stage', stage);
      if (priority !== 'All') params.set('priority', priority);
      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load leads');
      setLeads(data.leads);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, stage, priority]);

  useEffect(() => {
    const t = setTimeout(fetchLeads, 250); // debounce search input
    return () => clearTimeout(t);
  }, [fetchLeads]);

  function handleCreated(lead) {
    setShowForm(false);
    setLeads((prev) => [lead, ...prev]);
    setActiveLead(lead);
  }

  function handleUpdated(lead) {
    setLeads((prev) => prev.map((l) => (l._id === lead._id ? lead : l)));
    setActiveLead(lead);
  }

  function handleDeleted(id) {
    setLeads((prev) => prev.filter((l) => l._id !== id));
    setActiveLead(null);
  }

  async function handleStageChange(id, newStage) {
    setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, stage: newStage } : l)));
    await fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    });
  }

  return (
    <main className="min-h-screen bg-paper pb-16">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-display text-base font-bold text-white">
              P
            </div>
            <div>
              <h1 className="font-display text-lg font-bold leading-tight text-ink">Pulse</h1>
              <p className="text-xs leading-tight text-ink/45">AI Lead Qualification CRM</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + New lead
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-5 px-6 py-6">
        <StatsBar leads={leads} />
        <SearchFilterBar
          query={query}
          setQuery={setQuery}
          stage={stage}
          setStage={setStage}
          priority={priority}
          setPriority={setPriority}
        />

        {fetchError && (
          <p className="rounded-lg bg-hot/10 px-3 py-2 text-sm text-hot">{fetchError}</p>
        )}

        <LeadsTable
          leads={leads}
          loading={loading}
          onOpen={setActiveLead}
          onStageChange={handleStageChange}
        />
      </div>

      {showForm && (
        <LeadFormModal onClose={() => setShowForm(false)} onCreated={handleCreated} />
      )}

      {activeLead && (
        <LeadDetailDrawer
          lead={activeLead}
          onClose={() => setActiveLead(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </main>
  );
}
