'use client';

import { useState } from 'react';
import PriorityBadge from './PriorityBadge';
import ScoreRing from './ScoreRing';
import StageSelect from './StageSelect';
import {
  COMPANY_SIZE_OPTIONS,
  CURRENT_SOLUTION_OPTIONS,
  TIMELINE_OPTIONS,
} from '@/lib/constants';

export default function LeadDetailDrawer({ lead, onClose, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(lead);
  const [saving, setSaving] = useState(false);
  const [requalifying, setRequalifying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function saveEdits() {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdated(data.lead);
      setEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function changeStage(stage) {
    const res = await fetch(`/api/leads/${lead._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    const data = await res.json();
    if (res.ok) onUpdated(data.lead);
  }

  async function requalify() {
    setRequalifying(true);
    try {
      const res = await fetch(`/api/leads/${lead._id}/requalify`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdated(data.lead);
    } catch (err) {
      alert(err.message);
    } finally {
      setRequalifying(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete lead "${lead.name}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${lead._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      onDeleted(lead._id);
    } catch (err) {
      alert(err.message);
      setDeleting(false);
    }
  }

  function copyMessage() {
    navigator.clipboard.writeText(lead.ai?.followUpMessage || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-pop">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-line bg-white px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">{lead.name}</h2>
            <p className="text-sm text-ink/50">
              {lead.role ? `${lead.role} · ` : ''}
              {lead.company}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          {/* Pipeline stage */}
          <div className="flex items-center justify-between rounded-xl2 border border-line bg-paper px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              Pipeline stage
            </span>
            <StageSelect value={lead.stage} onChange={changeStage} />
          </div>

          {/* AI qualification */}
          <div className="rounded-xl2 border border-line p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-ink">AI qualification</h3>
              <button
                onClick={requalify}
                disabled={requalifying}
                className="btn-ghost text-xs"
              >
                {requalifying ? 'Re-scoring…' : '↻ Re-run AI'}
              </button>
            </div>
            <div className="mb-4 flex items-center gap-4">
              <ScoreRing score={lead.ai?.score} size={56} />
              <div>
                <PriorityBadge priority={lead.ai?.priority} />
                {lead.ai?.model && (
                  <p className="mt-1 text-[11px] text-ink/40">
                    Scored by {lead.ai.model === 'rule-based-fallback' ? 'rule-based fallback' : lead.ai.model}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="field-label mb-1">Reasoning</p>
                <p className="text-ink/80">{lead.ai?.reasoning || '—'}</p>
              </div>
              <div>
                <p className="field-label mb-1">Recommended next action</p>
                <p className="text-ink/80">{lead.ai?.recommendedAction || '—'}</p>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="field-label mb-0">Personalised follow-up message</p>
                  <button onClick={copyMessage} className="text-[11px] font-semibold text-brand-600 hover:underline">
                    {copied ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
                <p className="whitespace-pre-wrap rounded-lg bg-paper p-3 text-ink/80">
                  {lead.ai?.followUpMessage || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Lead details */}
          <div className="rounded-xl2 border border-line p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-ink">Lead details</h3>
              {!editing && (
                <button onClick={() => setEditing(true)} className="btn-ghost text-xs">
                  Edit
                </button>
              )}
            </div>

            {!editing ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Field label="Email" value={lead.email} />
                <Field label="Phone" value={lead.phone || '—'} />
                <Field label="Company size" value={lead.companySize} />
                <Field label="Industry" value={lead.industry || '—'} />
                <Field label="Current solution" value={lead.currentSolution} />
                <Field label="Monthly budget" value={`$${lead.monthlyBudget || 0}`} />
                <Field label="Timeline" value={lead.timeline} />
                <Field label="Notes" value={lead.notes || '—'} full />
              </dl>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <input className="field-input col-span-2" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Name" />
                <input className="field-input" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="Email" />
                <input className="field-input" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="Phone" />
                <input className="field-input" value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Company" />
                <input className="field-input" value={form.role} onChange={(e) => update('role', e.target.value)} placeholder="Role" />
                <select className="field-input" value={form.companySize} onChange={(e) => update('companySize', e.target.value)}>
                  {COMPANY_SIZE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <input className="field-input" value={form.industry} onChange={(e) => update('industry', e.target.value)} placeholder="Industry" />
                <select className="field-input" value={form.currentSolution} onChange={(e) => update('currentSolution', e.target.value)}>
                  {CURRENT_SOLUTION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <input type="number" className="field-input" value={form.monthlyBudget} onChange={(e) => update('monthlyBudget', e.target.value)} placeholder="Monthly budget" />
                <select className="field-input" value={form.timeline} onChange={(e) => update('timeline', e.target.value)}>
                  {TIMELINE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <textarea className="field-input col-span-2 min-h-[70px]" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Notes" />

                <div className="col-span-2 flex justify-end gap-2 pt-1">
                  <button onClick={() => { setEditing(false); setForm(lead); }} className="btn-secondary" disabled={saving}>
                    Cancel
                  </button>
                  <button onClick={saveEdits} className="btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
                <p className="col-span-2 text-[11px] text-ink/40">
                  Tip: after editing, click &quot;Re-run AI&quot; above to refresh the score with the new details.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full rounded-lg border border-hot/20 py-2 text-sm font-semibold text-hot transition hover:bg-hot/5"
          >
            {deleting ? 'Deleting…' : 'Delete lead'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, full }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <dt className="field-label mb-0.5">{label}</dt>
      <dd className="text-ink/80">{value}</dd>
    </div>
  );
}
