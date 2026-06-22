import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: LucideIcon;
  color?: 'blue' | 'orange' | 'green' | 'purple';
  comparison?: {
    previousValue: number;
    currentValue: number;
    label: string;
  };
}

const colorClasses = {
  blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
  orange: 'from-orange-500/20 to-orange-600/5 text-orange-400 border-orange-500/20',
  green: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
  purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20',
};

export default function MetricCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  icon: Icon,
  color = 'blue',
  comparison,
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const computedTrend = comparison
    ? comparison.currentValue > comparison.previousValue
      ? 'up' as const
      : comparison.currentValue < comparison.previousValue
      ? 'down' as const
      : 'stable' as const
    : trend;

  const computedTrendValue = comparison
    ? comparison.previousValue > 0
      ? `${comparison.currentValue > comparison.previousValue ? '+' : ''}${((comparison.currentValue - comparison.previousValue) / comparison.previousValue * 100).toFixed(1)}%`
      : '-'
    : trendValue;

  const comparisonLabel = comparison?.label || '较上月';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-br transition-all duration-300',
        'hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5',
        colorClasses[color]
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-100 font-mono">
                {value}
              </span>
              {unit && <span className="text-sm text-slate-500">{unit}</span>}
            </div>
          </div>
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center bg-slate-800/60'
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {(computedTrend && computedTrendValue) && (
          <div className="mt-4 flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                computedTrend === 'up' && 'bg-emerald-500/20 text-emerald-400',
                computedTrend === 'down' && 'bg-red-500/20 text-red-400',
                computedTrend === 'stable' && 'bg-slate-500/20 text-slate-400'
              )}
            >
              <TrendIcon className="w-3 h-3" />
              <span>{computedTrendValue}</span>
            </div>
            <span className="text-xs text-slate-500">{comparisonLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
