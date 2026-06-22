import { useState, useMemo, useCallback } from 'react';
import {
  Repeat,
  Clock,
  Eye,
  GraduationCap,
  Users,
  MapPin,
  AlertTriangle,
  ChevronRight,
  FileText,
  ArrowRight,
  CheckSquare,
  Square,
  X,
  ClipboardCopy,
  Check,
  ListTodo,
  FileBarChart,
  User,
  Calendar,
  Link,
} from 'lucide-react';
import { useReviewStore } from '@/store/useReviewStore';
import { useKnowledgeStore } from '@/store/useKnowledgeStore';
import { ReviewTask, KnowledgeEntry, BASES } from '@/types';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { cn } from '@/lib/utils';

const engineers = ['全部', '张伟', '李明', '王芳', '陈强', '刘洋', '赵静'];

export default function WeeklyPage() {
  const { tasks } = useReviewStore();
  const { entries } = useKnowledgeStore();
  const [filterEngineer, setFilterEngineer] = useState('全部');
  const [filterBase, setFilterBase] = useState('全部');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'task' | 'knowledge';
    id: string;
  } | null>(null);
  const [followUps, setFollowUps] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('weekly-followups');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [viewMode, setViewMode] = useState<'action' | 'minutes'>('action');
  const [copied, setCopied] = useState(false);

  const toggleFollowUp = useCallback((id: string) => {
    setFollowUps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem('weekly-followups', JSON.stringify([...next]));
      return next;
    });
  }, []);

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

  const applyFilters = useCallback(
    <T extends { assignee?: string }>(items: T[]): T[] => {
      return items.filter((item) => {
        if (filterEngineer !== '全部' && item.assignee !== filterEngineer) return false;
        return true;
      });
    },
    [filterEngineer]
  );

  const filteredRecurring = useMemo(() => applyFilters(recurringTasks), [applyFilters, recurringTasks]);
  const filteredTimeout = useMemo(() => applyFilters(timeoutTasks), [applyFilters, timeoutTasks]);
  const filteredTraining = useMemo(() => applyFilters(trainingTodos), [applyFilters, trainingTodos]);
  const filteredPendingReview = useMemo(() => {
    if (filterEngineer === '全部') return pendingReviewEntries;
    return pendingReviewEntries.filter((e) => e.reviewer === filterEngineer);
  }, [pendingReviewEntries, filterEngineer]);

  const allFilteredTasks = useMemo(
    () => [...filteredRecurring, ...filteredTimeout],
    [filteredRecurring, filteredTimeout]
  );

  const getDueStatus = useCallback((task: ReviewTask): string => {
    if (task.status === 'completed') return 'completed';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'dueSoon';
    return 'notDue';
  }, []);

  const overdueItems = allFilteredTasks.filter((t) => getDueStatus(t) === 'overdue');
  const dueSoonItems = allFilteredTasks.filter((t) => getDueStatus(t) === 'dueSoon');

  const totalActionItems = filteredRecurring.length + filteredTimeout.length + filteredPendingReview.length + filteredTraining.length;
  const followUpCount = [...allFilteredTasks, ...filteredPendingReview].filter(
    (item) => followUps.has(item.id)
  ).length;

  const selectedTask = selectedItem?.type === 'task' ? tasks.find((t) => t.id === selectedItem.id) : null;
  const selectedKnowledge = selectedItem?.type === 'knowledge' ? entries.find((e) => e.id === selectedItem.id) : null;

  const minutesText = useMemo(() => {
    const lines: string[] = [];
    const filterLabel = filterEngineer !== '全部' ? `（${filterEngineer}）` : '';
    const baseLabel = filterBase !== '全部' ? `（${filterBase}基地）` : '';

    lines.push(`=== 周会复盘摘要${filterLabel}${baseLabel} ===`);
    lines.push(`生成日期：${new Date().toISOString().split('T')[0]}`);
    lines.push('');

    if (overdueItems.length > 0) {
      lines.push('【逾期项】');
      overdueItems.forEach((t) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        const diff = Math.floor((today.getTime() - due.getTime()) / 86400000);
        lines.push(`  - ${t.faultCode} ${t.faultDescription} | 负责人：${t.assignee || '未分派'} | 已逾期${diff}天`);
      });
      lines.push('');
    }

    if (dueSoonItems.length > 0) {
      lines.push('【三天内到期】');
      dueSoonItems.forEach((t) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        const diff = Math.floor((due.getTime() - today.getTime()) / 86400000);
        lines.push(`  - ${t.faultCode} ${t.faultDescription} | 负责人：${t.assignee || '未分派'} | 剩余${diff}天`);
      });
      lines.push('');
    }

    if (filteredPendingReview.length > 0) {
      lines.push('【待复核知识条目】');
      filteredPendingReview.forEach((e) => {
        lines.push(`  - ${e.id} ${e.title} | 复核人：${e.reviewer || '未指派'} | 成功率：${e.successRate}%`);
      });
      lines.push('');
    }

    if (filteredTraining.length > 0) {
      lines.push('【培训待办】');
      filteredTraining.forEach((t) => {
        lines.push(`  - ${t.faultCode} ${t.faultDescription} | 负责人：${t.assignee || '未分派'}`);
      });
      lines.push('');
    }

    lines.push('---');
    lines.push(`合计：逾期${overdueItems.length}项 / 即将到期${dueSoonItems.length}项 / 待复核${filteredPendingReview.length}条 / 培训待办${filteredTraining.length}项`);

    return lines.join('\n');
  }, [overdueItems, dueSoonItems, filteredPendingReview, filteredTraining, filterEngineer, filterBase]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(minutesText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = minutesText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">周会复盘包</h1>
          <p className="text-sm text-slate-400">
            会前一站式汇总，快速盯住未推进项
            {totalActionItems > 0 && (
              <span className="ml-2 text-xs text-slate-500">
                共 {totalActionItems} 项{followUpCount > 0 && `，已标记跟进 ${followUpCount} 项`}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('action')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5',
                viewMode === 'action' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <ListTodo className="w-3.5 h-3.5" />
              行动清单
            </button>
            <button
              onClick={() => setViewMode('minutes')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5',
                viewMode === 'minutes' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <FileBarChart className="w-3.5 h-3.5" />
              会议纪要
            </button>
          </div>
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

      {viewMode === 'action' ? (
        <>
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
                  <p className="text-2xl font-bold text-slate-100 font-mono">{filteredPendingReview.length}</p>
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

          {overdueItems.length > 0 && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-300">逾期提醒</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  当前有 <strong className="text-red-400">{overdueItems.length}</strong> 项已逾期，
                  <strong className="text-amber-400">{dueSoonItems.length}</strong> 项三天内到期，请重点关注
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">
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
                    <ActionItemRow
                      key={task.id}
                      task={task}
                      isFollowUp={followUps.has(task.id)}
                      onToggleFollowUp={() => toggleFollowUp(task.id)}
                      onSelect={() => setSelectedItem({ type: 'task', id: task.id })}
                      isSelected={selectedItem?.id === task.id}
                    />
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
                    <ActionItemRow
                      key={task.id}
                      task={task}
                      isFollowUp={followUps.has(task.id)}
                      onToggleFollowUp={() => toggleFollowUp(task.id)}
                      onSelect={() => setSelectedItem({ type: 'task', id: task.id })}
                      isSelected={selectedItem?.id === task.id}
                    />
                  ))
                )}
              </SectionCard>

              <SectionCard
                title="待复核知识条目"
                icon={Eye}
                color="blue"
                count={filteredPendingReview.length}
                expanded={expandedSection === 'review'}
                onToggle={() => setExpandedSection(expandedSection === 'review' ? null : 'review')}
              >
                {filteredPendingReview.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">暂无数据</p>
                ) : (
                  filteredPendingReview.map((entry) => (
                    <KnowledgeActionRow
                      key={entry.id}
                      entry={entry}
                      isFollowUp={followUps.has(entry.id)}
                      onToggleFollowUp={() => toggleFollowUp(entry.id)}
                      onSelect={() => setSelectedItem({ type: 'knowledge', id: entry.id })}
                      isSelected={selectedItem?.id === entry.id}
                    />
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
                    <ActionItemRow
                      key={task.id}
                      task={task}
                      showTraining
                      isFollowUp={followUps.has(task.id)}
                      onToggleFollowUp={() => toggleFollowUp(task.id)}
                      onSelect={() => setSelectedItem({ type: 'task', id: task.id })}
                      isSelected={selectedItem?.id === task.id}
                    />
                  ))
                )}
              </SectionCard>
            </div>

            <div className="xl:col-span-1">
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 sticky top-6">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">事项详情</h3>
                {selectedItem ? (
                  selectedTask ? (
                    <TaskDetailPanel task={selectedTask} getDueStatus={getDueStatus} />
                  ) : selectedKnowledge ? (
                    <KnowledgeDetailPanel entry={selectedKnowledge} />
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-8">请选择一个事项</p>
                  )
                ) : (
                  <p className="text-xs text-slate-500 text-center py-8">点击左侧事项查看详情</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-100">会议纪要</h2>
              <p className="text-xs text-slate-500 mt-1">
                基于当前筛选条件自动生成
                {filterEngineer !== '全部' && ` · 工程师：${filterEngineer}`}
                {filterBase !== '全部' && ` · 基地：${filterBase}`}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className={cn(
                'px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1.5',
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700/50'
              )}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
              {copied ? '已复制' : '复制摘要'}
            </button>
          </div>
          <div className="p-6">
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
              {minutesText}
            </pre>
          </div>
        </div>
      )}
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

function ActionItemRow({
  task,
  showTraining,
  isFollowUp,
  onToggleFollowUp,
  onSelect,
  isSelected,
}: {
  task: ReviewTask;
  showTraining?: boolean;
  isFollowUp: boolean;
  onToggleFollowUp: () => void;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer',
        isSelected ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-slate-900/50 hover:bg-slate-900/80 border border-transparent'
      )}
      onClick={onSelect}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFollowUp();
        }}
        className="flex-shrink-0"
        title={isFollowUp ? '取消跟进标记' : '标记本周跟进'}
      >
        {isFollowUp ? (
          <CheckSquare className="w-4 h-4 text-blue-400" />
        ) : (
          <Square className="w-4 h-4 text-slate-600 hover:text-slate-400" />
        )}
      </button>
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
        <p className={cn('text-sm truncate', isFollowUp ? 'text-blue-200' : 'text-slate-200')}>
          {task.faultDescription}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs font-mono text-slate-500">{task.faultCode}</span>
          <span className="text-xs text-slate-400">{task.assignee || '未分派'}</span>
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

function KnowledgeActionRow({
  entry,
  isFollowUp,
  onToggleFollowUp,
  onSelect,
  isSelected,
}: {
  entry: KnowledgeEntry;
  isFollowUp: boolean;
  onToggleFollowUp: () => void;
  onSelect: () => void;
  isSelected: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer',
        isSelected ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-slate-900/50 hover:bg-slate-900/80 border border-transparent'
      )}
      onClick={onSelect}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFollowUp();
        }}
        className="flex-shrink-0"
        title={isFollowUp ? '取消跟进标记' : '标记本周跟进'}
      >
        {isFollowUp ? (
          <CheckSquare className="w-4 h-4 text-blue-400" />
        ) : (
          <Square className="w-4 h-4 text-slate-600 hover:text-slate-400" />
        )}
      </button>
      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm truncate', isFollowUp ? 'text-blue-200' : 'text-slate-200')}>
          {entry.title}
        </p>
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
  );
}

function TaskDetailPanel({
  task,
  getDueStatus,
}: {
  task: ReviewTask;
  getDueStatus: (task: ReviewTask) => string;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);
  const dueStatus = getDueStatus(task);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {task.type === 'recurring' ? (
          <Repeat className="w-4 h-4 text-purple-400" />
        ) : (
          <Clock className="w-4 h-4 text-orange-400" />
        )}
        <span className="text-xs font-mono text-slate-500">{task.faultCode}</span>
      </div>
      <p className="text-sm text-slate-200">{task.faultDescription}</p>

      <div className="space-y-3 pt-2 border-t border-slate-800">
        <DetailRow icon={User} label="负责人" value={task.assignee || '未分派'} highlight={!task.assignee} />
        <DetailRow
          icon={Calendar}
          label="截止时间"
          value={task.dueDate}
          badge={
            dueStatus === 'overdue'
              ? { text: `逾期${Math.abs(diffDays)}天`, color: 'text-red-400' }
              : dueStatus === 'dueSoon'
              ? { text: `剩${diffDays}天`, color: 'text-amber-400' }
              : dueStatus === 'completed'
              ? { text: '已完成', color: 'text-emerald-400' }
              : undefined
          }
        />
        <DetailRow icon={Link} label="关联故障" value={task.faultCode} />
        <DetailRow
          icon={FileText}
          label="处理状态"
          value={
            task.status === 'completed' ? '已完成' :
            task.status === 'in_progress' ? '进行中' :
            task.status === 'assigned' ? '已分派' : '待分派'
          }
        />
        {task.trainingRequired && (
          <DetailRow
            icon={GraduationCap}
            label="培训状态"
            value={task.trainingStatus === 'completed' ? '已培训' : '待培训'}
            highlight={task.trainingStatus !== 'completed'}
          />
        )}
      </div>

      {task.rootCause && (
        <div className="pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-500 mb-1">原因分析</p>
          <p className="text-xs text-slate-300">{task.rootCause}</p>
        </div>
      )}
      {task.troubleshootingTip && (
        <div>
          <p className="text-xs text-slate-500 mb-1">排故提示</p>
          <p className="text-xs text-slate-300">{task.troubleshootingTip}</p>
        </div>
      )}
      {task.occurrenceCount != null && (
        <div>
          <p className="text-xs text-slate-500 mb-1">发生次数</p>
          <p className="text-sm font-mono text-slate-200">{task.occurrenceCount} 次</p>
        </div>
      )}
      {task.avgDowntime != null && (
        <div>
          <p className="text-xs text-slate-500 mb-1">平均停场</p>
          <p className="text-sm font-mono text-slate-200">{task.avgDowntime} 小时</p>
        </div>
      )}
    </div>
  );
}

function KnowledgeDetailPanel({ entry }: { entry: KnowledgeEntry }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-mono text-slate-500">{entry.id}</span>
      </div>
      <p className="text-sm text-slate-200">{entry.title}</p>

      <div className="space-y-3 pt-2 border-t border-slate-800">
        <DetailRow icon={User} label="复核人" value={entry.reviewer || '未指派'} highlight={!entry.reviewer} />
        <DetailRow
          icon={Calendar}
          label="最后复核"
          value={entry.lastReviewedAt || '未复核'}
        />
        <DetailRow icon={Link} label="ATA 章节" value={entry.ataChapter} />
        <DetailRow
          icon={Eye}
          label="复核状态"
          value={
            entry.reviewStatus === 'completed' ? '已完成' :
            entry.reviewStatus === 'in_progress' ? '复核中' :
            entry.reviewStatus === 'pending' ? '待复核' : '未复核'
          }
          highlight={entry.reviewStatus === 'pending' || entry.reviewStatus === 'none'}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
        <div>
          <p className="text-xs text-slate-500 mb-1">成功率</p>
          <p className={cn('text-sm font-mono', entry.successRate < 55 ? 'text-red-400' : 'text-slate-200')}>
            {entry.successRate}%
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">引用次数</p>
          <p className="text-sm font-mono text-slate-200">{entry.referenceCount}</p>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800">
        <p className="text-xs text-slate-500 mb-2">完整性</p>
        <div className="flex flex-wrap gap-1.5">
          {entry.hasManualReference ? null : (
            <span className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded">缺手册依据</span>
          )}
          {entry.hasReleaseConclusion ? null : (
            <span className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded">缺放行结论</span>
          )}
          {entry.hasFollowUp ? null : (
            <span className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded">缺后续跟踪</span>
          )}
          {entry.hasManualReference && entry.hasReleaseConclusion && entry.hasFollowUp && (
            <span className="text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">完整</span>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  highlight,
  badge,
}: {
  icon: any;
  label: string;
  value: string;
  highlight?: boolean;
  badge?: { text: string; color: string };
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
      <span className="text-xs text-slate-500 w-16 flex-shrink-0">{label}</span>
      <span className={cn('text-xs', highlight ? 'text-amber-400' : 'text-slate-300')}>{value}</span>
      {badge && <span className={cn('text-xs font-mono', badge.color)}>{badge.text}</span>}
    </div>
  );
}
