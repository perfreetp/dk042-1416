import { useMemo } from 'react';
import { ATA_CHAPTERS, MONTHS } from '@/types';
import { cn } from '@/lib/utils';

interface HeatmapChartProps {
  data: Record<string, Record<number, number>>;
}

export default function HeatmapChart({ data }: HeatmapChartProps) {
  const maxValue = useMemo(() => {
    let max = 0;
    Object.values(data).forEach((months) => {
      Object.values(months).forEach((v) => {
        if (v > max) max = v;
      });
    });
    return max || 1;
  }, [data]);

  const getColor = (value: number) => {
    if (value === 0) return 'bg-slate-800/30';
    const ratio = value / maxValue;
    if (ratio < 0.25) return 'bg-blue-900/40';
    if (ratio < 0.5) return 'bg-blue-700/50';
    if (ratio < 0.75) return 'bg-orange-600/60';
    return 'bg-orange-500/80';
  };

  const getTextColor = (value: number) => {
    const ratio = value / maxValue;
    return ratio > 0.5 ? 'text-white' : 'text-slate-400';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="flex mb-2">
          <div className="w-28 flex-shrink-0" />
          <div className="flex-1 flex">
            {MONTHS.map((month) => (
              <div
                key={month}
                className="flex-1 text-center text-xs text-slate-500 font-medium"
              >
                {month}
              </div>
            ))}
          </div>
        </div>

        {ATA_CHAPTERS.map((ata) => (
          <div key={ata.code} className="flex items-center mb-1">
            <div className="w-28 flex-shrink-0 text-xs text-slate-400 pr-3 truncate">
              <span className="text-slate-500">ATA {ata.code}</span> {ata.name}
            </div>
            <div className="flex-1 flex gap-1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                const value = data[ata.code]?.[month] || 0;
                return (
                  <div
                    key={month}
                    className={cn(
                      'flex-1 h-7 rounded-md flex items-center justify-center text-xs font-mono transition-all cursor-pointer',
                      'hover:ring-2 hover:ring-blue-400/50 hover:scale-105',
                      getColor(value),
                      getTextColor(value)
                    )}
                    title={`ATA ${ata.code} - ${month}月: ${value}次`}
                  >
                    {value > 0 ? value : ''}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-end gap-2 mt-4 pr-2">
          <span className="text-xs text-slate-500">低</span>
          <div className="flex gap-1">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <div
                key={i}
                className={cn('w-6 h-4 rounded', {
                  'bg-slate-800/30': ratio === 0,
                  'bg-blue-900/40': ratio === 0.25,
                  'bg-blue-700/50': ratio === 0.5,
                  'bg-orange-600/60': ratio === 0.75,
                  'bg-orange-500/80': ratio === 1,
                })}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">高</span>
        </div>
      </div>
    </div>
  );
}
