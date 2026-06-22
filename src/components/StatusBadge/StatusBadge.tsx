import { cn } from '@/lib/utils';

type StatusType =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'warning'
  | 'success'
  | 'danger'
  | 'info';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: { label: '待处理', className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  assigned: { label: '已分派', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  in_progress: { label: '进行中', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  completed: { label: '已完成', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  warning: { label: '警告', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  success: { label: '良好', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  danger: { label: '危险', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  info: { label: '信息', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', {
        'bg-slate-400': status === 'pending',
        'bg-blue-400': status === 'assigned' || status === 'info',
        'bg-amber-400': status === 'in_progress' || status === 'warning',
        'bg-emerald-400': status === 'completed' || status === 'success',
        'bg-red-400': status === 'danger',
      })} />
      {label || config.label}
    </span>
  );
}
