import { useState, useMemo } from 'react';
import {
  Repeat,
  Clock,
  Eye,
  GraduationCap,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  Timer,
  ArrowRight,
} from 'lucide-react';
import { useReviewStore } from '@/store/useReviewStore';
import { useKnowledgeStore } from '@/store/useKnowledgeStore';
import { ReviewTask, BASES } from '@/types';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { cn } from '@/lib/utils';

const engineers = ['全部', '张伟', '李明', '王芳', '陈强', '刘洋', '赵静'];

export default function WeeklyPage() {
  const { tasks } = useReviewStore();
  const { entries } = useKnowledgeStore();
  const [filterEngineer, setFilterEngineer] = useState('全部');
  const [filterBase, setFilterBase] = useState('全部');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const recurringTasks = useMemo(
    () => tasks.filter((t) => t.type === 'recurring'),
    [tasks]
  );
  const timeoutTasks = useMemo(
    () => tasks.filter((t) => t.type === 'timeout'),
    [tasks]
  );
  const pendingReviewEntries = useMemo(
    () => entries.filter((e) => e.reviewStatus === 'pending' || e.reviewStatus === 'in_progress'),
    [entries]
  );
  const trainingTodos = useMemo(
    () => tasks.filter((t) => t.trainingRequired && t.trainingStatus !== 'completed'),
    [tasks]
  );

  const filteredRecurring = useMemo(() => {
    if (filterEngineer === '全部') return recurringTasks;
    return recurringTasks.filter((t) => t.assignee === filterEngineer);
  }, [recurringTasks, filterEngineer]);

  const filteredTimeout = useMemo(() => {
    if (filterEngineer === '全部') return timeoutTasks;
    return timeoutTasks.filter((t) => t.assignee === filterEngineer);
  }, [timeoutTasks, filterEngineer]);

  const filteredTraining = useMemo(() => {
    if (filterEngineer === '全部') return trainingTodos;
    return trainingTodos.filter((t) => t.assignee === filterEngineer);
  }, [trainingTodos, filterEngineer]);

  const getDueStatus = (task: ReviewTask): string => {
    if (task.status === 'completed') return 'completed';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'dueSoon';
    return 'notDue';
  };

  const overdueCount = tasks.filter((t) => getDueStatus(t) === 'overdue').length;
  const dueSoonCount = tasks.filter((t) => getDueStatus(t) === 'dueSoon').length;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">周会复盘包</h1>
          <p className="text-sm text-slate-400">会前一站式汇总，快速盯住未推进项</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterEngineer}
              onChange={(e) => setFilterEngineer(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-blue-500/50"
            >
              {engineers.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterBase}
              onChange={(e) => setFilterBase(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-blue-500/50"
            >
              <option value="全部">全部基地</option>
              {BASES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100 font-mono">{filteredRecurring.length}</p>
              <p className="text-xs text-slate-400">高频重复故障</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100 font-mono">{filteredTimeout.length}</p>
              <p className="text-xs text-slate-400">超时排故</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100 font-mono">{pendingReviewEntries.length}</p>
              <p className="text-xs text-slate-400">待复核条目</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100 font-mono">{filteredTraining.length}</p>
              <p className="text-xs text-slate-400">培训待办</p>
            </div>
          </div>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">逾期提醒</p>
            <p className="text-xs text-slate-400 mt-0.5">
              当前有 <strong className="text-red-400">{overdueCount}</strong> 项已逾期，
              <strong className="text-amber-400">{dueSoonCount}</strong> 项三天内到期，请重点关注
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <SectionCard
          title="高频重复故障"
          icon={Repeat}
          color="purple"
          count={filteredRecurring.length}
          expanded={expandedSection === 'recurring'}
          onToggle={() => setExpandedSection(expandedSection === 'recurring' ? null : 'recurring')}
        >
          {filteredRecurring.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">暂无数据</p>
          ) : (
            filteredRecurring.map((task) => (
              <WeeklyTaskRow key={task.id} task={task} />
            ))
          )}
        </SectionCard>

        <SectionCard
          title="超时排故"
          icon={Clock}
          color="orange"
          count={filteredTimeout.length}
          expanded={expandedSection === 'timeout'}
          onToggle={() => setExpandedSection(expandedSection === 'timeout' ? null : 'timeout')}
        >
          {filteredTimeout.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">暂无数据</p>
          ) : (
            filteredTimeout.map((task) => (
              <WeeklyTaskRow key={task.id} task={task} />
            ))
          )}
        </SectionCard>

        <SectionCard
          title="待复核知识条目"
          icon={Eye}
          color="blue"
          count={pendingReviewEntries.length}
          expanded={expandedSection === 'review'}
          onToggle={() => setExpandedSection(expandedSection === 'review' ? null : 'review')}
        >
          {pendingReviewEntries.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">暂无数据</p>
          ) : (
            pendingReviewEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900/80 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{entry.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400">ATA {entry.ataChapter}</span>
                    <span className="text-xs text-slate-400">
                      成功率 <span className="text-red-400 font-mono">{entry.successRate}%</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-500">{entry.reviewer}</span>
                  <StatusBadge
                    status={entry.reviewStatus === 'in_progress' ? 'warning' : 'info'}
                    label={entry.reviewStatus === 'in_progress' ? '复核中' : '待复核'}
                    size="sm"
                  />
                </div>
              </div>
            ))
          )}
        </SectionCard>

        <SectionCard
          title="培训待办"
          icon={GraduationCap}
          color="emerald"
          count={filteredTraining.length}
          expanded={expandedSection === 'training'}
          onToggle={() => setExpandedSection(expandedSection === 'training' ? null : 'training')}
        >
          {filteredTraining.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">暂无数据</p>
          ) : (
            filteredTraining.map((task) => (
              <WeeklyTaskRow key={task.id} task={task} showTraining />
            ))
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  color,
  count,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: any;
  color: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    purple: 'text-purple-400 bg-purple-500/20 border-purple-500/20',
    orange: 'text-orange-400 bg-orange-500/20 border-orange-500/20',
    blue: 'text-blue-400 bg-blue-500/20 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/20',
  };
  const colorClass = colorMap[color] || colorMap.blue;
  const textColor = colorClass.split(' ')[0];

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', colorClass.split(' ').slice(1).join(' '))}>
            <Icon className={cn('w-5 h-5', textColor)} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
            <p className="text-xs text-slate-500">{count} 项待处理</p>
          </div>
        </div>
        <ChevronRight
          className={cn(
            'w-5 h-5 text-slate-400 transition-transform',
            expanded && 'rotate-90'
          )}
        />
      </div>
      {expanded && (
        <div className="px-6 pb-5 border-t border-slate-800/50">
          <div className="pt-4 space-y-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function WeeklyTaskRow({ task, showTraining }: { task: ReviewTask; showTraining?: boolean }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          task.type === 'recurring' ? 'bg-purple-500/20' : 'bg-orange-500/20'
        )}
      >
        {task.type === 'recurring' ? (
          <Repeat className="w-4 h-4 text-purple-400" />
        ) : (
          <Clock className="w-4 h-4 text-orange-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate">{task.faultDescription}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs font-mono text-slate-500">{task.faultCode}</span>
          <span className="text-xs text-slate-400">
            {task.assignee || '未分派'}
          </span>
          {task.status !== 'completed' && (
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded',
                diffDays < 0
                  ? 'bg-red-500/20 text-red-400'
                  : diffDays <= 3
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-slate-500/20 text-slate-400'
              )}
            >
              {diffDays < 0 ? `逾期${Math.abs(diffDays)}天` : diffDays === 0 ? '今日到期' : `剩${diffDays}天`}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {showTraining && task.trainingRequired && (
          <StatusBadge
            status={task.trainingStatus === 'completed' ? 'success' : 'warning'}
            label={task.trainingStatus === 'completed' ? '已培训' : '待培训'}
            size="sm"
          />
        )}
        <StatusBadge
          status={
            task.status === 'completed'
              ? 'success'
              : task.status === 'in_progress'
              ? 'warning'
              : task.status === 'assigned'
              ? 'info'
              : 'pending'
          }
          size="sm"
        />
      </div>
    </div>
  );
}
