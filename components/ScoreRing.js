export default function ScoreRing({ score, size = 44 }) {
  if (score === null || score === undefined) {
    return (
      <div
        className="flex items-center justify-center rounded-full border-2 border-dashed border-ink/15 text-[10px] font-semibold text-ink/30"
        style={{ width: size, height: size }}
      >
        --
      </div>
    );
  }

  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = score >= 70 ? '#DC4444' : score >= 45 ? '#D68B1F' : '#3E7CB1';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E4E4EE" strokeWidth="4" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-mono text-[11px] font-bold text-ink">{score}</span>
    </div>
  );
}
