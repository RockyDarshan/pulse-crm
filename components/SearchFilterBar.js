'use client';

import { LEAD_STAGES, PRIORITY_OPTIONS } from '@/lib/constants';

export default function SearchFilterBar({ query, setQuery, stage, setStage, priority, setPriority }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, company, email, or industry…"
          className="field-input pl-9"
        />
      </div>
      <select value={stage} onChange={(e) => setStage(e.target.value)} className="field-input sm:w-44">
        <option value="All">All stages</option>
        {LEAD_STAGES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select value={priority} onChange={(e) => setPriority(e.target.value)} className="field-input sm:w-40">
        <option value="All">All priority</option>
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}
