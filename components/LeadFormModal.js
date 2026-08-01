'use client';

import { useState } from 'react';
import {
  COMPANY_SIZE_OPTIONS,
  CURRENT_SOLUTION_OPTIONS,
  TIMELINE_OPTIONS,
} from '@/lib/constants';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  company: '',
  role: '',
  companySize: '11-50',
  industry: '',
  currentSolution: 'Spreadsheets / manual',
  monthlyBudget: '',
  timeline: 'Just exploring',
  notes: '',
};

export default function LeadFormModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.company.trim()) {
      setError('Name, email, and company are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create lead');
      onCreated(data.lead);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl2 bg-white shadow-pop">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Add a new lead</h2>
            <p className="text-xs text-ink/50">We&apos;ll qualify it with AI the moment you save.</p>
          </div>
          <button onClick={onClose} className="btn-ghost" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Contact name *</label>
              <input
                className="field-input"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Priya Sharma"
              />
            </div>
            <div>
              <label className="field-label">Email *</label>
              <input
                type="email"
                className="field-input"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="priya@acme.com"
              />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input
                className="field-input"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="field-label">Role / title</label>
              <input
                className="field-input"
                value={form.role}
                onChange={(e) => update('role', e.target.value)}
                placeholder="Head of Finance"
              />
            </div>
            <div>
              <label className="field-label">Company *</label>
              <input
                className="field-input"
                value={form.company}
                onChange={(e) => update('company', e.target.value)}
                placeholder="Acme Robotics"
              />
            </div>
            <div>
              <label className="field-label">Industry</label>
              <input
                className="field-input"
                value={form.industry}
                onChange={(e) => update('industry', e.target.value)}
                placeholder="D2C / Retail"
              />
            </div>
            <div>
              <label className="field-label">Company size</label>
              <select
                className="field-input"
                value={form.companySize}
                onChange={(e) => update('companySize', e.target.value)}
              >
                {COMPANY_SIZE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o} employees
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Current solution</label>
              <select
                className="field-input"
                value={form.currentSolution}
                onChange={(e) => update('currentSolution', e.target.value)}
              >
                {CURRENT_SOLUTION_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Monthly budget (USD)</label>
              <input
                type="number"
                min="0"
                className="field-input"
                value={form.monthlyBudget}
                onChange={(e) => update('monthlyBudget', e.target.value)}
                placeholder="1200"
              />
            </div>
            <div>
              <label className="field-label">Buying timeline</label>
              <select
                className="field-input"
                value={form.timeline}
                onChange={(e) => update('timeline', e.target.value)}
              >
                {TIMELINE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Notes / stated pain points</label>
            <textarea
              className="field-input min-h-[80px] resize-y"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="e.g. Currently reconciling 4 corporate cards by hand across 2 entities, wants better visibility before quarter-end."
            />
          </div>

          {error && (
            <p className="rounded-lg bg-hot/10 px-3 py-2 text-sm text-hot">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Qualifying with AI…' : 'Save & qualify lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
