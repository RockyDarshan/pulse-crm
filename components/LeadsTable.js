'use client';

import PriorityBadge from './PriorityBadge';
import ScoreRing from './ScoreRing';
import StageSelect from './StageSelect';

export default function LeadsTable({ leads, onOpen, onStageChange, loading }) {
  if (loading) {
    return (
      <div className="rounded-xl2 border border-line bg-white p-10 text-center text-sm text-ink/40 shadow-card">
        Loading leads…
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center shadow-card">
        <p className="font-display text-base font-bold text-ink">No leads yet</p>
        <p className="mt-1 text-sm text-ink/50">
          Add your first lead and Pulse will score, prioritise, and draft outreach for it automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl2 border border-line bg-white shadow-card">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-wide text-ink/40">
            <th className="px-4 py-3">Lead</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Stage</th>
            <th className="px-4 py-3">Timeline</th>
            <th className="px-4 py-3">Added</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead._id}
              onClick={() => onOpen(lead)}
              className="cursor-pointer border-b border-line last:border-0 transition hover:bg-brand-50/50"
            >
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{lead.name}</p>
                <p className="text-xs text-ink/40">{lead.email}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-ink/80">{lead.company}</p>
                <p className="text-xs text-ink/40">{lead.role || '—'}</p>
              </td>
              <td className="px-4 py-3">
                <ScoreRing score={lead.ai?.score} size={36} />
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={lead.ai?.priority} />
              </td>
              <td className="px-4 py-3">
                <StageSelect value={lead.stage} onChange={(stage) => onStageChange(lead._id, stage)} />
              </td>
              <td className="px-4 py-3 text-ink/60">{lead.timeline}</td>
              <td className="px-4 py-3 text-ink/40">
                {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
