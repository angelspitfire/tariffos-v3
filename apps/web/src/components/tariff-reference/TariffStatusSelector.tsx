'use client';

interface TariffStatusSelectorProps {
  labels: Record<string, string>;
  selected: string[];
  onToggle: (status: string, checked: boolean) => void;
}

export function TariffStatusSelector({
  labels,
  selected,
  onToggle,
}: TariffStatusSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {Object.entries(labels).map(([status, label]) => {
        const checked = selected.includes(status);
        return (
          <label
            key={status}
            className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-zinc-800/50 cursor-pointer group"
          >
            <span className="flex items-center gap-2 text-sm text-text-hi">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onToggle(status, e.target.checked)}
                className="rounded border-zinc-600 bg-zinc-900 text-brand focus:ring-brand"
              />
              {label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
