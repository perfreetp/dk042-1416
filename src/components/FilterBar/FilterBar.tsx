import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { useFilterStore } from '@/store/useFilterStore';
import { AIRCRAFT_TYPES, BASES, ATA_CHAPTERS, SEASONS } from '@/types';
import { cn } from '@/lib/utils';

interface SelectOption {
  label: string;
  value: string;
}

function MultiSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggleOption = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm',
          open
            ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
            : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
        )}
      >
        <span className="text-slate-400">{label}</span>
        {value.length > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
            {value.length}
          </span>
        )}
        <ChevronDown className={cn('w-4 h-4 ml-auto transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="max-h-64 overflow-y-auto p-2">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleOption(opt.value)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                  value.includes(opt.value)
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-slate-300 hover:bg-slate-700/50'
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                    value.includes(opt.value)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-slate-600'
                  )}
                >
                  {value.includes(opt.value) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FilterBar() {
  const store = useFilterStore();
  const hasFilters =
    store.aircraftTypes.length > 0 ||
    store.bases.length > 0 ||
    store.ataChapters.length > 0 ||
    store.seasons.length > 0 ||
    store.faultCode.length > 0;

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-300">筛选条件</span>
        {hasFilters && (
          <button
            onClick={store.resetFilters}
            className="ml-auto text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            重置
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="搜索故障代码..."
            value={store.faultCode}
            onChange={(e) => store.setFaultCode(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <MultiSelect
          label="机型"
          options={AIRCRAFT_TYPES.map((t) => ({ label: t, value: t }))}
          value={store.aircraftTypes}
          onChange={store.setAircraftTypes}
        />

        <MultiSelect
          label="基地"
          options={BASES.map((b) => ({ label: b, value: b }))}
          value={store.bases}
          onChange={store.setBases}
        />

        <MultiSelect
          label="ATA章节"
          options={ATA_CHAPTERS.map((a) => ({ label: `${a.code} ${a.name}`, value: a.code }))}
          value={store.ataChapters}
          onChange={store.setAtaChapters}
        />

        <MultiSelect
          label="季节"
          options={SEASONS.map((s) => ({ label: s, value: s }))}
          value={store.seasons}
          onChange={store.setSeasons}
        />
      </div>
    </div>
  );
}
