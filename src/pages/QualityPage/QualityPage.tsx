import { useMemo, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ZAxis,
} from 'recharts';
import {
  FileQuestion,
  FileX,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ChevronDown,
  ChevronRight,
  User,
  Edit3,
  Check,
  Eye,
  FileText,
  Filter,
  ArrowRight,
  History,
  TrendingUp,
} from 'lucide-react';
import { useKnowledgeStore } from '@/store/useKnowledgeStore';
import { getLowQualityEntries, getIncompleteEntries, getScatterData } from '@/data/knowledge';
import { KnowledgeEntry, GovernanceRecord } from '@/types';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge/StatusBadge';

const levelColors: Record<string, string> = {
  high: '#10B981',
  medium: '#F59E0B',
  low: '#EF4444',
};

const reviewers = ['张伟', '李明', '王芳', '陈强', '刘洋', '赵静'];

const reviewStatusLabels: Record<KnowledgeEntry['reviewStatus'], string> = {
  none: '未复核',
  pending: '待复核',
  in_progress: '复核中',
  completed: '已完成',
};

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];
  return { mondayStr, todayStr };
}

interface WeeklyStats {
  reviewer: string;
  manual: number;
  release: number;
  followUp: number;
}

export default function QualityPage() {
  const { entries, governanceRecords, markForReview, setReviewStatus, setReviewer, setReviewSuggestion, completeReview } = useKnowledgeStore();
  const [activeTab, setActiveTab] = useState<'lowQuality' | 'incomplete'>('lowQuality');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'none'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingSuggestion, setEditingSuggestion] = useState(false);
  const [tempSuggestion, setTempSuggestion] = useState('');

  const lowQualityEntries = useMemo(() => getLowQualityEntries(entries), [entries]);
  const incomplete = useMemo(() => getIncompleteEntries(entries), [entries]);
  const scatterData = useMemo(() => getScatterData(entries), [entries]);

  const weeklyStats = useMemo<WeeklyStats[]>(() => {
    const { mondayStr, todayStr } = getWeekRange();
    const statsMap = new Map<string, WeeklyStats>();

    governanceRecords.forEach((record) => {
      if (record.changedAt < mondayStr || record.changedAt > todayStr) return;
      if (!record.reviewer) return;

      const fixedItems = record.fromMissingItems.filter((item) => !record.toMissingItems.includes(item));
      const key = record.reviewer;
      if (!statsMap.has(key)) {
        statsMap.set(key, { reviewer: key, manual: 0, release: 0, followUp: 0 });
      }
      const stats = statsMap.get(key)!;
      fixedItems.forEach((item) => {
        if (item === '手册依据') stats.manual++;
        else if (item === '放行结论') stats.release++;
        else if (item === '后续跟踪') stats.followUp++;
      });
    });

    return Array.from(statsMap.values()).sort((a, b) => {
      const totalA = a.manual + a.release + a.followUp;
      const totalB = b.manual + b.release + b.followUp;
      return totalB - totalA;
    });
  }, [governanceRecords]);

  const filteredEntries = useMemo(() => {
    let result = entries;

    if (searchQuery) {
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (reviewFilter !== 'all') {
      result = result.filter((e) => e.reviewStatus === reviewFilter);
    }

    return result;
  }, [entries, searchQuery, reviewFilter]);

  const pendingCount = entries.filter((e) => e.reviewStatus === 'pending' || e.reviewStatus === 'in_progress').length;

  const handleExpand = (entry: KnowledgeEntry) => {
    if (expandedId === entry.id) {
      setExpandedId(null);
      setEditingSuggestion(false);
    } else {
      setExpandedId(entry.id);
      setTempSuggestion(entry.reviewSuggestion);
      setEditingSuggestion(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">案例质量</h1>
        <p className="text-sm text-slate-400">评估知识条目可靠性与案例完整性</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100 font-mono">{lowQualityEntries.length}</p>
              <p className="text-xs text-slate-400">低质量条目</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100 font-mono">{incomplete.noManual.length}</p>
              <p className="text-xs text-slate-400">缺少手册依据</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <FileQuestion className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100 font-mono">{incomplete.noRelease.length}</p>
              <p className="text-xs text-slate-400">缺少放行结论</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100 font-mono">{pendingCount}</p>
              <p className="text-xs text-slate-400">待复核条目</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6">
        <div className="xl:col-span-3 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">引用频次与成功率分布</h2>
              <p className="text-xs text-slate-500 mt-1">点的大小表示知识等级，颜色表示质量水平</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-400">高质量</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-400">中质量</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-400">低质量</span>
              </div>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="引用次数"
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  axisLine={{ stroke: '#475569' }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="成功率"
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  axisLine={{ stroke: '#475569' }}
                  domain={[20, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <ZAxis type="category" dataKey="z" range={[60, 200]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as any;
                      return (
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
                          <p className="text-sm font-medium text-slate-100 mb-2">{data.name}</p>
                          <p className="text-xs text-slate-400">引用次数: {data.x} 次</p>
                          <p className="text-xs text-slate-400">成功率: {data.y}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  x={40}
                  stroke="#F59E0B"
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                />
                <ReferenceLine
                  y={55}
                  stroke="#F59E0B"
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                />
                {['high', 'medium', 'low'].map((level) => (
                  <Scatter
                    key={level}
                    name={level}
                    data={scatterData.filter((d: any) => d.z === level)}
                    fill={levelColors[level]}
                    fillOpacity={0.7}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span>← 低引用</span>
            <span className="text-orange-400">高风险区域（高引用 · 低成功率）</span>
            <span>高引用 →</span>
          </div>
        </div>

        <div className="xl:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('lowQuality')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
                activeTab === 'lowQuality'
                  ? 'text-orange-400'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              低质量条目
              {activeTab === 'lowQuality' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('incomplete')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
                activeTab === 'incomplete'
                  ? 'text-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              不完整案例
              {activeTab === 'incomplete' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            {activeTab === 'lowQuality' ? (
              <div className="space-y-3">
                {lowQualityEntries.map((entry) => (
                  <LowQualityCard
                    key={entry.id}
                    entry={entry}
                    onMarkReview={() => markForReview(entry.id)}
                  />
                ))}
                {lowQualityEntries.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    暂无低质量条目
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {incomplete.noManual.slice(0, 6).map((entry) => (
                  <IncompleteCard
                    key={entry.id}
                    entry={entry}
                    issues={[
                      !entry.hasManualReference && '缺少手册依据',
                      !entry.hasReleaseConclusion && '缺少放行结论',
                      !entry.hasFollowUp && '缺少后续跟踪',
                    ].filter(Boolean) as string[]}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base font-semibold text-slate-100">本周治理成效</h2>
        </div>
        {weeklyStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {weeklyStats.map((stat) => (
              <div
                key={stat.reviewer}
                className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-sm font-medium text-slate-200">{stat.reviewer}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded-md">
                    <BookOpen className="w-3 h-3" />
                    手册依据 <span className="font-mono font-semibold">{stat.manual}</span>
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-400 rounded-md">
                    <FileQuestion className="w-3 h-3" />
                    放行结论 <span className="font-mono font-semibold">{stat.release}</span>
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md">
                    <Eye className="w-3 h-3" />
                    后续跟踪 <span className="font-mono font-semibold">{stat.followUp}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-slate-500">
            本周暂无治理记录
          </div>
        )}
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100">全部知识条目</h2>
            <p className="text-xs text-slate-500 mt-1">共 {filteredEntries.length} 条知识记录</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={reviewFilter}
                onChange={(e) => setReviewFilter(e.target.value as typeof reviewFilter)}
                className="px-3 py-1.5 text-xs bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-blue-500/50"
              >
                <option value="all">全部复核状态</option>
                <option value="pending">待复核</option>
                <option value="in_progress">复核中</option>
                <option value="completed">已完成</option>
                <option value="none">未复核</option>
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="搜索知识条目..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-56 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/30">
                <th className="text-left text-xs font-medium text-slate-400 px-6 py-3 w-12"></th>
                <th className="text-left text-xs font-medium text-slate-400 px-2 py-3">条目编号</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">标题</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">引用次数</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">成功率</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">复核人</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">复核状态</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">质量等级</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredEntries.map((entry) => (
                <KnowledgeRow
                  key={entry.id}
                  entry={entry}
                  expanded={expandedId === entry.id}
                  onToggle={() => handleExpand(entry)}
                  tempSuggestion={tempSuggestion}
                  setTempSuggestion={setTempSuggestion}
                  editingSuggestion={editingSuggestion}
                  setEditingSuggestion={setEditingSuggestion}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KnowledgeRow({
  entry,
  expanded,
  onToggle,
  tempSuggestion,
  setTempSuggestion,
  editingSuggestion,
  setEditingSuggestion,
}: {
  entry: KnowledgeEntry;
  expanded: boolean;
  onToggle: () => void;
  tempSuggestion: string;
  setTempSuggestion: (v: string) => void;
  editingSuggestion: boolean;
  setEditingSuggestion: (v: boolean) => void;
}) {
  const { setReviewStatus, setReviewer, setReviewSuggestion, completeReview, governanceRecords, getEntryRecords } = useKnowledgeStore();
  const [showReviewerDropdown, setShowReviewerDropdown] = useState(false);
  const [fixedItems, setFixedItems] = useState<string[]>([]);
  const [governanceReviewerFilter, setGovernanceReviewerFilter] = useState<string>('all');
  const [governanceMissingFilter, setGovernanceMissingFilter] = useState<string>('all');

  const entryRecords = getEntryRecords(entry.id);

  const uniqueReviewers = useMemo(() => {
    const reviewers = new Set<string>();
    entryRecords.forEach((r) => {
      if (r.reviewer) reviewers.add(r.reviewer);
    });
    return Array.from(reviewers);
  }, [entryRecords]);

  const filteredEntryRecords = useMemo(() => {
    let result = entryRecords;

    if (governanceReviewerFilter !== 'all') {
      result = result.filter((r) => r.reviewer === governanceReviewerFilter);
    }

    if (governanceMissingFilter !== 'all') {
      result = result.filter((r) => {
        const fromSet = new Set(r.fromMissingItems);
        const toSet = new Set(r.toMissingItems);
        const hadItem = fromSet.has(governanceMissingFilter);
        const fixedItem = fromSet.has(governanceMissingFilter) && !toSet.has(governanceMissingFilter);
        return hadItem || fixedItem;
      });
    }

    return result;
  }, [entryRecords, governanceReviewerFilter, governanceMissingFilter]);

  const handleStartEdit = () => {
    setTempSuggestion(entry.reviewSuggestion);
    setEditingSuggestion(true);
  };

  const handleSaveSuggestion = () => {
    setReviewSuggestion(entry.id, tempSuggestion);
    setEditingSuggestion(false);
  };

  const handleCompleteReview = () => {
    completeReview(entry.id, tempSuggestion || entry.reviewSuggestion, fixedItems);
    setEditingSuggestion(false);
    setFixedItems([]);
  };

  return (
    <>
      <tr
        className="hover:bg-slate-800/30 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-6 py-3.5 w-12">
          <ChevronRight
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform',
              expanded && 'rotate-90'
            )}
          />
        </td>
        <td className="px-2 py-3.5">
          <span className="font-mono text-sm text-blue-400">{entry.id}</span>
        </td>
        <td className="px-4 py-3.5">
          <span className="text-sm text-slate-200">{entry.title}</span>
        </td>
        <td className="px-4 py-3.5">
          <span className="text-sm font-mono text-slate-300">{entry.referenceCount}</span>
        </td>
        <td className="px-4 py-3.5">
          <span
            className={cn(
              'text-sm font-mono font-medium',
              entry.successRate >= 75
                ? 'text-emerald-400'
                : entry.successRate >= 50
                ? 'text-amber-400'
                : 'text-red-400'
            )}
          >
            {entry.successRate}%
          </span>
        </td>
        <td className="px-4 py-3.5">
          <span className="text-sm text-slate-300">{entry.reviewer || '-'}</span>
        </td>
        <td className="px-4 py-3.5">
          <StatusBadge
            status={
              entry.reviewStatus === 'completed'
                ? 'success'
                : entry.reviewStatus === 'in_progress'
                ? 'warning'
                : entry.reviewStatus === 'pending'
                ? 'info'
                : 'pending'
            }
            label={reviewStatusLabels[entry.reviewStatus]}
            size="sm"
          />
        </td>
        <td className="px-4 py-3.5">
          <StatusBadge
            status={entry.level === 'high' ? 'success' : entry.level === 'medium' ? 'warning' : 'danger'}
            label={entry.level === 'high' ? '高质量' : entry.level === 'medium' ? '中质量' : '低质量'}
            size="sm"
          />
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-800/20">
          <td colSpan={8} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">ATA 章节</p>
                    <p className="text-sm text-slate-200">{entry.ataChapter}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">手册依据</p>
                    <p className="text-sm flex items-center gap-2">
                      {entry.hasManualReference ? (
                        <><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-slate-300">有</span></>
                      ) : (
                        <><XCircle className="w-4 h-4 text-red-400/70" /><span className="text-slate-400">无</span></>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">最后复核</p>
                    <p className="text-sm text-slate-300">{entry.lastReviewedAt || '未复核'}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      复核人
                    </p>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setShowReviewerDropdown(!showReviewerDropdown)}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        指派
                      </button>
                      {showReviewerDropdown && (
                        <div className="absolute top-full right-0 mt-1 w-32 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10 overflow-hidden">
                          {reviewers.map((r) => (
                            <button
                              key={r}
                              onClick={() => {
                                setReviewer(entry.id, r);
                                if (entry.reviewStatus === 'none') {
                                  setReviewStatus(entry.id, 'pending');
                                }
                                setShowReviewerDropdown(false);
                              }}
                              className={cn(
                                'w-full px-3 py-2 text-xs text-left transition-colors',
                                entry.reviewer === r
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'text-slate-300 hover:bg-slate-600/50'
                              )}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-200 bg-slate-900/50 rounded-lg px-3 py-2">
                    {entry.reviewer || '未指派'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      修订建议
                    </p>
                    {!editingSuggestion ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit();
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        编辑
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSuggestion(false);
                          }}
                          className="text-xs text-slate-400 hover:text-slate-300"
                        >
                          取消
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveSuggestion();
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          保存
                        </button>
                      </div>
                    )}
                  </div>
                  {editingSuggestion ? (
                    <textarea
                      value={tempSuggestion}
                      onChange={(e) => setTempSuggestion(e.target.value)}
                      className="w-full h-24 px-3 py-2 text-sm bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                      placeholder="请输入修订建议..."
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className="text-sm text-slate-300 bg-slate-900/50 rounded-lg px-3 py-2 min-h-[60px]">
                      {entry.reviewSuggestion || '暂无修订建议'}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {entry.reviewStatus !== 'in_progress' && entry.reviewStatus !== 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setReviewStatus(entry.id, 'in_progress');
                      }}
                      className="px-3 py-1.5 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors"
                    >
                      开始复核
                    </button>
                  )}
                  {entry.reviewStatus === 'in_progress' && (
                    <div className="mb-2">
                      {(!entry.hasManualReference || !entry.hasReleaseConclusion || !entry.hasFollowUp) && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {!entry.hasManualReference && (
                            <label
                              className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg cursor-pointer border transition-colors',
                                fixedItems.includes('手册依据')
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500'
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={fixedItems.includes('手册依据')}
                                onChange={() => {
                                  setFixedItems((prev) =>
                                    prev.includes('手册依据')
                                      ? prev.filter((i) => i !== '手册依据')
                                      : [...prev, '手册依据']
                                  );
                                }}
                                className="sr-only"
                              />
                              <Check className={cn('w-3 h-3', fixedItems.includes('手册依据') && 'text-emerald-400')} />
                              补了手册依据
                            </label>
                          )}
                          {!entry.hasReleaseConclusion && (
                            <label
                              className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg cursor-pointer border transition-colors',
                                fixedItems.includes('放行结论')
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500'
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={fixedItems.includes('放行结论')}
                                onChange={() => {
                                  setFixedItems((prev) =>
                                    prev.includes('放行结论')
                                      ? prev.filter((i) => i !== '放行结论')
                                      : [...prev, '放行结论']
                                  );
                                }}
                                className="sr-only"
                              />
                              <Check className={cn('w-3 h-3', fixedItems.includes('放行结论') && 'text-emerald-400')} />
                              补了放行结论
                            </label>
                          )}
                          {!entry.hasFollowUp && (
                            <label
                              className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg cursor-pointer border transition-colors',
                                fixedItems.includes('后续跟踪')
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500'
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={fixedItems.includes('后续跟踪')}
                                onChange={() => {
                                  setFixedItems((prev) =>
                                    prev.includes('后续跟踪')
                                      ? prev.filter((i) => i !== '后续跟踪')
                                      : [...prev, '后续跟踪']
                                  );
                                }}
                                className="sr-only"
                              />
                              <Check className={cn('w-3 h-3', fixedItems.includes('后续跟踪') && 'text-emerald-400')} />
                              补了后续跟踪
                            </label>
                          )}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteReview();
                        }}
                        className="px-3 py-1.5 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        完成复核
                      </button>
                    </div>
                  )}
                  {entry.reviewStatus === 'none' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setReviewStatus(entry.id, 'pending');
                      }}
                      className="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      标记待复核
                    </button>
                  )}
                </div>

                {entryRecords.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" />
                        治理记录
                        <span className="text-slate-600">({filteredEntryRecords.length}/{entryRecords.length})</span>
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Filter className="w-3 h-3 text-slate-500" />
                          <select
                            value={governanceReviewerFilter}
                            onChange={(e) => setGovernanceReviewerFilter(e.target.value)}
                            className="px-2.5 py-1 text-xs bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-blue-500/50"
                          >
                            <option value="all">全部复核人</option>
                            {uniqueReviewers.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={governanceMissingFilter}
                            onChange={(e) => setGovernanceMissingFilter(e.target.value)}
                            className="px-2.5 py-1 text-xs bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-blue-500/50"
                          >
                            <option value="all">全部修补项</option>
                            <option value="手册依据">手册依据</option>
                            <option value="放行结论">放行结论</option>
                            <option value="后续跟踪">后续跟踪</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {filteredEntryRecords.length > 0 ? (
                        filteredEntryRecords.map((record) => (
                        <div
                          key={record.id}
                          className="relative pl-6 pb-3 border-l-2 border-slate-700/50 last:border-l-0 last:pb-0"
                        >
                          <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-blue-500/30 border-2 border-blue-400 -translate-x-[7px]" />
                          <div className="bg-slate-900/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-slate-400">{record.changedAt}</span>
                              <span className="text-xs text-slate-500">·</span>
                              <span className="text-xs text-slate-400">{record.reviewer}</span>
                              <span className="text-xs text-slate-500">·</span>
                              <span className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                                {reviewStatusLabels[record.fromStatus]}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              <span className="text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                                {reviewStatusLabels[record.toStatus]}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-slate-500 mb-1">成功率变化</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono text-red-400">{record.fromSuccessRate}%</span>
                                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                                  <span className="text-sm font-mono text-emerald-400">{record.toSuccessRate}%</span>
                                  {record.toSuccessRate > record.fromSuccessRate && (
                                    <span className="text-xs text-emerald-400 font-mono">+{record.toSuccessRate - record.fromSuccessRate}</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1">引用次数变化</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono text-slate-400">{record.fromReferenceCount}</span>
                                  <ArrowRight className="w-3 h-3 text-slate-500" />
                                  <span className="text-sm font-mono text-slate-300">{record.toReferenceCount}</span>
                                  {record.toReferenceCount > record.fromReferenceCount && (
                                    <span className="text-xs text-emerald-400 font-mono">+{record.toReferenceCount - record.fromReferenceCount}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {record.fromMissingItems.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-slate-500 mb-1">缺失项修补</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {record.fromMissingItems.map((item, i) => {
                                    const fixed = !record.toMissingItems.includes(item);
                                    return (
                                      <div
                                        key={i}
                                        className={cn(
                                          'flex items-center gap-1 text-xs px-1.5 py-0.5 rounded',
                                          fixed
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-red-500/10 text-red-400'
                                        )}
                                      >
                                        <span className={fixed ? 'line-through' : ''}>{item}</span>
                                        {fixed && (
                                          <span className="text-[10px] px-1 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-medium">
                                            ✓ 已修补
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                  {record.toMissingItems.length < record.fromMissingItems.length && (
                                    <span className="text-xs text-emerald-400 self-center">
                                      已修补 {record.fromMissingItems.length - record.toMissingItems.length} 项
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            {record.suggestion && (
                              <div className="mt-2">
                                <p className="text-xs text-slate-500 mb-1">修订建议</p>
                                <p className="text-xs text-slate-300">{record.suggestion}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                      ) : (
                        <div className="text-center py-4 text-xs text-slate-500">
                          暂无符合筛选条件的治理记录
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function LowQualityCard({ entry, onMarkReview }: { entry: KnowledgeEntry; onMarkReview: () => void }) {
  const needsAction = entry.reviewStatus === 'none';

  return (
    <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{entry.title}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-400">
              引用 <span className="text-orange-400 font-mono">{entry.referenceCount}</span> 次
            </span>
            <span className="text-xs text-slate-400">
              成功率 <span className="text-red-400 font-mono">{entry.successRate}%</span>
            </span>
          </div>
          {needsAction ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkReview();
              }}
              className="mt-3 px-2.5 py-1 text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-md hover:bg-orange-500/30 transition-colors w-full"
            >
              + 标记待复核
            </button>
          ) : (
            <div className="mt-3">
              <StatusBadge
                status={
                  entry.reviewStatus === 'completed'
                    ? 'success'
                    : entry.reviewStatus === 'in_progress'
                    ? 'warning'
                    : 'info'
                }
                label={reviewStatusLabels[entry.reviewStatus]}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IncompleteCard({ entry, issues }: { entry: KnowledgeEntry; issues: string[] }) {
  return (
    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl hover:bg-amber-500/10 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <FileX className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{entry.title}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {issues.map((issue, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 text-xs bg-amber-500/10 text-amber-400 rounded"
              >
                {issue}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
