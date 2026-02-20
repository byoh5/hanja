interface ProgressBarProps {
  value: number;
  max: number;
}

export function ProgressBar({ value, max }: ProgressBarProps) {
  const safeMax = Math.max(max, 1);
  const ratio = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm text-slate-600">
        <span>진도</span>
        <span>{Math.round(ratio)}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-brand-500 transition-all" style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}
