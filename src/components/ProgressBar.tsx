interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercent?: boolean;
}

export function ProgressBar({ value, max, label = '진행률', showPercent = true }: ProgressBarProps) {
  const safeMax = Math.max(max, 1);
  const ratio = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
        <span>{label}</span>
        {showPercent && <span>{Math.round(ratio)}%</span>}
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-calm-500 transition-all duration-300" style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}
