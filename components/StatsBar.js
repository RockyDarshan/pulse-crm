export default function StatsBar({ leads }) {
  const total = leads.length;
  const hot = leads.filter((l) => l.ai?.priority === 'Hot').length;
  const warm = leads.filter((l) => l.ai?.priority === 'Warm').length;
  const cold = leads.filter((l) => l.ai?.priority === 'Cold').length;
  const avgScore = total
    ? Math.round(leads.reduce((sum, l) => sum + (l.ai?.score || 0), 0) / total)
    : 0;

  const stats = [
    { label: 'Total leads', value: total },
    { label: 'Hot', value: hot, color: 'text-hot' },
    { label: 'Warm', value: warm, color: 'text-warm' },
    { label: 'Cold', value: cold, color: 'text-cold' },
    { label: 'Avg. score', value: avgScore },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl2 border border-line bg-white px-4 py-3 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">{s.label}</p>
          <p className={`font-display text-2xl font-bold ${s.color || 'text-ink'}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
