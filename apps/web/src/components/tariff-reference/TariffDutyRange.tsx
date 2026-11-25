'use client';


interface TariffDutyRangeProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
  minRate?: number;
  maxRate?: number;
}

export function TariffDutyRange({
  min,
  max,
  onChange,
  minRate = 0,
  maxRate = 30,
}: TariffDutyRangeProps) {
  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(minRate, Math.min(maxRate, Number(e.target.value) || 0));
    onChange(v, max);
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(minRate, Math.min(maxRate, Number(e.target.value) || maxRate));
    onChange(min, v);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <label className="text-[10px] uppercase font-semibold tracking-wider text-text-lo">Min (%)</label>
        <input
          type="number"
          value={min}
          onChange={handleMinInput}
          className="w-16 py-1.5 rounded border border-zinc-700 bg-zinc-900/50 text-xs text-text-hi focus:border-brand focus:outline-none"
        />
        <label className="text-[10px] uppercase font-semibold tracking-wider text-text-lo">Max (%)</label>
        <input
          type="number"
          value={max}
          onChange={handleMaxInput}
          className="w-16 py-1.5 rounded border border-zinc-700 bg-zinc-900/50 text-xs text-text-hi focus:border-brand focus:outline-none"
        />
      </div>
      <div className="relative h-6">
        <input
          type="range"
          min={minRate}
          max={maxRate}
          step={1}
          value={min}
          onChange={(e) => onChange(Number(e.target.value), max)}
          className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand"
        />
        <input
          type="range"
          min={minRate}
          max={maxRate}
          step={1}
          value={max}
          onChange={(e) => onChange(min, Number(e.target.value))}
          className="absolute left-0 w-full h-1.5 bg-transparent rounded-lg appearance-none cursor-pointer accent-brand-accent"
        />
      </div>
      <div className="flex justify-between text-[10px] text-text-lo font-mono">
        <span>{minRate}%</span>
        <span>{Math.round((minRate + maxRate) / 2)}%</span>
        <span>{maxRate}%</span>
      </div>
    </div>
  );
}
