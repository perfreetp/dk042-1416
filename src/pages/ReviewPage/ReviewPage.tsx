import { useState, useMemo } from 'react';
import {
  ClipboardList,
  Repeat,
  Clock,
  User,
  Calendar,
  ChevronDown,
  ChevronRight,
  Edit3,
  Check,
  X,
  GraduationCap,
  MessageSquare,
  AlertTriangle,
  FileText,
  Plus,
  Layers,
  ListTodo,
  Users,
  Activity,
  AlertCircle,
  Timer,
  CheckCircle2,
} from 'lucide-react';
import { useReviewStore } from '@/store/useReviewStore';
import { getReviewStats } from '@/data/reviews';
import { ReviewTask } from '@/types';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { cn } from '@/lib/utils';

const engineers = ['张伟', '李明', '王芳', '陈强', '刘洋', '赵静'];

export default function ReviewPage() {
  const { tasks } = useReviewStore();
  const stats = getReviewStats(tasks);
  const [activeType, setActiveType] = useState<'all' | 'recurring' | 'timeout'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tracking'>('list');
  const [groupBy, setGroupBy] = useState<'assignee' | 'dueStatus' | 'training'>('dueStatus');

  const filteredTasks = tasks.filter((t) => {
    if (activeType === 'all') return true;
    return t.type === activeType;
  });

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

  const dueStatusLabelMap: Record<string, string> = {
    overdue: '逾期',
    dueSoon: '三天内到期',
    notDue: '未到期',
    completed: '已完成',
  };

  const groupedData = useMemo(() => {
    const groups: Record<string, ReviewTask[]> = {};

    if (groupBy === 'assignee') {
      const assignees = Array.from(new Set(tasks.map((t) => t.assignee || '未分派')));
      assignees.forEach((a) => {
        groups[a] = tasks.filter((t) => (t.assignee || '未分派') === a);
      });
    } else if (groupBy === 'dueStatus') {
      const order = ['overdue', 'dueSoon', 'notDue', 'completed'];
      order.forEach((key) => {
        const items = tasks.filter((t) => getDueStatus(t) === key);
        if (items.length > 0) groups[key] = items;
      });
    } else if (groupBy === 'training') {
      groups['需要培训'] = tasks.filter((t) => t.trainingRequired);
      groups['无需培训'] = tasks.filter((t) => !t.trainingRequired);
    }

    return groups;
  }, [tasks, groupBy]);

  const statusLabelMap: Record<string, string> = {
    pending: '待处理',
    assigned: '已分派',
    in_progress: '进行中',
    completed: '已完成',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">复盘清单</h1>
        <p className="text-sm text-slate-400">每周质量复盘与改进任务跟踪</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={ClipboardList}
          label="待复盘"
          value={stats.pending}
          color="orange"
          sublabel="总数"
          subvalue={stats.total}
        />
        <StatCard
          icon={User}
          label="已分派"
          value={stats.assigned}
          color="blue"
          sublabel="进行中"
          subvalue={stats.inProgress}
        />
        <StatCard
          icon={Repeat}
          label="重复故障"
          value={stats.recurring}
          color="purple"
          sublabel="超时排故"
          subvalue={stats.timeout}
        />
        <StatCard
          icon={GraduationCap}
          label="培训待办"
          value={stats.training}
          color="emerald"
          sublabel="已完成"
          subvalue={stats.completed}
        />
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-800/50 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  viewMode === 'list'
                    ? 'bg-slate-700 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <ListTodo className="w-3.5 h-3.5" />
                列表视图
              </button>
              <button
                onClick={() => setViewMode('tracking')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  viewMode === 'tracking'
                    ? 'bg-slate-700 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                改进跟踪
              </button>
            </div>

            {viewMode === 'list' && (
              <div className="flex bg-slate-800/50 rounded-lg p-0.5">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'recurring', label: '高频重复' },
                  { key: 'timeout', label: '超时排故' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveType(tab.key as typeof activeType)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                      activeType === tab.key
                        ? 'bg-slate-700 text-slate-100 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {viewMode === 'tracking' && (
              <div className="flex bg-slate-800/50 rounded-lg p-0.5">
                {[
                  { key: 'assignee', label: '按工程师', icon: Users },
                  { key: 'dueStatus', label: '按到期', icon: Timer },
                  { key: 'training', label: '按培训', icon: GraduationCap },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setGroupBy(tab.key as typeof groupBy)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                      groupBy === tab.key
                        ? 'bg-slate-700 text-slate-100 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="text-sm text-slate-400">
            共 <span className="text-slate-200 font-medium">{filteredTasks.length}</span> 项
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="divide-y divide-slate-800/50">
            {filteredTasks.map((task) => (
              <ReviewTaskRow
                key={task.id}
                task={task}
                expanded={expandedId === task.id}
                onToggle={() => setExpandedId(expandedId === task.id ? null : task.id)}
              />
            ))}
          </div>
        ) : (
          <TrackingView groupedData={groupedData} groupBy={groupBy} statusLabelMap={statusLabelMap} dueStatusLabelMap={dueStatusLabelMap} />
        )}
      </div>

      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-100 mb-1">本周复盘摘要</h3>
            <p className="text-sm text-slate-400 mb-4">
              系统自动识别出 {stats.recurring} 项高频重复故障和 {stats.timeout} 项超时排故记录，
              建议优先处理重复故障，推动根本原因分析和排故提示优化。
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-slate-300">
                  待处理 <strong className="text-orange-400">{stats.pending}</strong> 项
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-300">
                  培训提醒 <strong className="text-emerald-400">{stats.training}</strong> 项
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg">
                <Check className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">
                  完成率 <strong className="text-blue-400">{Math.round((stats.completed / stats.total) * 100)}%</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackingView({
  groupedData,
  groupBy,
  statusLabelMap,
  dueStatusLabelMap,
}: {
  groupedData: Record<string, ReviewTask[]>;
  groupBy: 'assignee' | 'dueStatus' | 'training';
  statusLabelMap: Record<string, string>;
  dueStatusLabelMap: Record<string, string>;
}) {
  const groupIcons: Record<string, any> = {
    assignee: Users,
    dueStatus: Timer,
    training: GraduationCap,
  };
  const GroupIcon = groupIcons[groupBy] || Layers;

  const getGroupColor = (key: string) => {
    if (groupBy === 'dueStatus') {
      const colors: Record<string, string> = {
        overdue: 'text-red-400 bg-red-500/20',
        dueSoon: 'text-amber-400 bg-amber-500/20',
        notDue: 'text-blue-400 bg-blue-500/20',
        completed: 'text-emerald-400 bg-emerald-500/20',
      };
      return colors[key] || 'text-slate-400 bg-slate-500/20';
    }
    if (groupBy === 'training') {
      return key === '需要培训'
        ? 'text-emerald-400 bg-emerald-500/20'
        : 'text-slate-400 bg-slate-500/20';
    }
    return 'text-blue-400 bg-blue-500/20';
  };

  const getGroupLabel = (key: string) => {
    if (groupBy === 'dueStatus') {
      return dueStatusLabelMap[key] || key;
    }
    return key;
  };

  const getDueBadge = (task: ReviewTask) => {
    if (task.status === 'completed') return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);
    if (diffDays < 0) {
      return <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">逾期{Math.abs(diffDays)}天</span>;
    }
    if (diffDays <= 3) {
      return <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">剩{diffDays}天</span>;
    }
    return null;
  };

  const pendingCount = (tasks: ReviewTask[]) =>
    tasks.filter((t) => t.status !== 'completed').length;

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(groupedData).map(([key, tasks]) => (
          <div
            key={key}
            className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', getGroupColor(key))}>
                <GroupIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-slate-200 truncate">{getGroupLabel(key)}</h3>
                <p className="text-xs text-slate-500">
                  共 {tasks.length} 项 · 待完成 {pendingCount(tasks)} 项
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">暂无任务</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900/80 transition-colors cursor-pointer"
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full flex-shrink-0',
                        task.status === 'completed'
                          ? 'bg-emerald-400'
                          : task.status === 'in_progress'
                          ? 'bg-amber-400'
                          : task.status === 'assigned'
                          ? 'bg-blue-400'
                          : 'bg-slate-500'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 truncate">{task.faultDescription}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-500 font-mono">{task.faultCode}</p>
                        {getDueBadge(task)}
                      </div>
                    </div>
                    {task.trainingRequired && (
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">完成率</span>
                <span className="text-slate-300 font-medium">
                  {tasks.length > 0
                    ? Math.round(((tasks.length - pendingCount(tasks)) / tasks.length) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="mt-1.5 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all"
                  style={{
                    width: `${tasks.length > 0 ? ((tasks.length - pendingCount(tasks)) / tasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  subvalue,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  sublabel: string;
  subvalue: number;
  color: 'orange' | 'blue' | 'purple' | 'emerald';
}) {
  const colorClasses = {
    orange: 'from-orange-500/20 to-orange-600/5 text-orange-400 border-orange-500/20',
    blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-br border rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg',
        colorClasses[color]
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-slate-800/60 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-100 font-mono">{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
      <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
        <span className="text-xs text-slate-500">{sublabel}</span>
        <span className="text-sm font-mono text-slate-300">{subvalue}</span>
      </div>
    </div>
  );
}

function ReviewTaskRow({
  task,
  expanded,
  onToggle,
}: {
  task: ReviewTask;
  expanded: boolean;
  onToggle: () => void;
}) {
  const {
    assignTask,
    updateTaskStatus,
    updateRootCause,
    updateTroubleshootingTip,
    setTrainingRequired,
    updateTrainingStatus,
  } = useReviewStore();

  const [editing, setEditing] = useState<{ cause: boolean; tip: boolean }>({ cause: false, tip: false });
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const statusLabels: Record<ReviewTask['status'], string> = {
    pending: 'pending',
    assigned: 'assigned',
    in_progress: 'in_progress',
    completed: 'completed',
  };

  return (
    <div className={cn('transition-colors', expanded && 'bg-slate-800/30')}>
      <div
        className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex-shrink-0">
          {task.type === 'recurring' ? (
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-purple-400" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-blue-400">{task.faultCode}</span>
            <StatusBadge status={statusLabels[task.status] as any} size="sm" />
            {task.type === 'recurring' ? (
              <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded">
                重复 {task.occurrenceCount} 次
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded">
                平均 {task.avgDowntime}h
              </span>
            )}
          </div>
          <p className="text-sm text-slate-200 truncate">{task.faultDescription}</p>
        </div>

        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500">责任工程师</p>
            <p className="text-sm text-slate-300">{task.assignee || '未分派'}</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-slate-500">截止日期</p>
            <p className="text-sm text-slate-300">{task.dueDate}</p>
          </div>
          {task.trainingRequired && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-lg">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400">
                {task.trainingStatus === 'completed' ? '已培训' : '待培训'}
              </span>
            </div>
          )}
          <ChevronDown
            className={cn(
              'w-5 h-5 text-slate-400 transition-transform flex-shrink-0',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-5 border-t border-slate-800/50">
          <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  原因分析
                </h4>
                {task.status !== 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing({ ...editing, cause: !editing.cause });
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    编辑
                  </button>
                )}
              </div>
              {editing.cause ? (
                <div className="space-y-2">
                  <textarea
                    value={task.rootCause}
                    onChange={(e) => updateRootCause(task.id, e.target.value)}
                    className="w-full h-24 px-3 py-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                    placeholder="请输入根本原因分析..."
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing({ ...editing, cause: false });
                      }}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                    >
                      取消
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing({ ...editing, cause: false });
                      }}
                      className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 bg-slate-800/30 rounded-lg p-3 min-h-[60px]">
                  {task.rootCause || '暂无原因分析'}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  排故提示
                </h4>
                {task.status !== 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing({ ...editing, tip: !editing.tip });
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    修订
                  </button>
                )}
              </div>
              {editing.tip ? (
                <div className="space-y-2">
                  <textarea
                    value={task.troubleshootingTip}
                    onChange={(e) => updateTroubleshootingTip(task.id, e.target.value)}
                    className="w-full h-24 px-3 py-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                    placeholder="请输入排故提示..."
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing({ ...editing, tip: false });
                      }}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                    >
                      取消
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing({ ...editing, tip: false });
                      }}
                      className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 bg-slate-800/30 rounded-lg p-3 min-h-[60px]">
                  {task.troubleshootingTip || '暂无排故提示'}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-800/50 flex flex-wrap items-center gap-4">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 hover:border-slate-600 transition-colors"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>{task.assignee || '分派工程师'}</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              {showAssigneeDropdown && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 overflow-hidden">
                  {engineers.map((eng) => (
                    <button
                      key={eng}
                      onClick={() => {
                        assignTask(task.id, eng);
                        setShowAssigneeDropdown(false);
                      }}
                      className={cn(
                        'w-full px-3 py-2 text-sm text-left transition-colors',
                        task.assignee === eng
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'text-slate-300 hover:bg-slate-700/50'
                      )}
                    >
                      {eng}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setTrainingRequired(task.id, !task.trainingRequired)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border',
                  task.trainingRequired
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                )}
              >
                <GraduationCap className="w-4 h-4" />
                <span>培训提醒</span>
                {task.trainingRequired && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
              {task.status === 'assigned' && (
                <button
                  onClick={() => updateTaskStatus(task.id, 'in_progress')}
                  className="px-3 py-2 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors"
                >
                  开始处理
                </button>
              )}
              {task.status === 'in_progress' && (
                <button
                  onClick={() => updateTaskStatus(task.id, 'completed')}
                  className="px-3 py-2 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors"
                >
                  标记完成
                </button>
              )}
              {task.status === 'pending' && (
                <button
                  onClick={() => {}}
                  className="px-3 py-2 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新建任务
                </button>
              )}
            </div>

            {task.trainingRequired && task.trainingStatus !== 'none' && (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs text-slate-500">培训状态:</span>
                <select
                  value={task.trainingStatus}
                  onChange={(e) =>
                    updateTrainingStatus(task.id, e.target.value as ReviewTask['trainingStatus'])
                  }
                  className="px-2 py-1.5 text-xs bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="pending">待安排</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
