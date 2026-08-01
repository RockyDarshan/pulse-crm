import { PRIORITY_STYLES } from '@/lib/constants';

export default function PriorityBadge({ priority }) {
  if (!priority) {
    return <span className="chip bg-ink/5 text-ink/40">Unscored</span>;
  }
  return (
    <span className={`chip ${PRIORITY_STYLES[priority] || 'bg-ink/5 text-ink/50'}`}>
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor:
            priority === 'Hot' ? '#DC4444' : priority === 'Warm' ? '#D68B1F' : '#3E7CB1',
        }}
      />
      {priority}
    </span>
  );
}
