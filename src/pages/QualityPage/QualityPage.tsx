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
} from 'lucide-react';
import { knowledgeEntries, getLowQualityEntries, getIncompleteEntries, getScatterData } from '@/data/knowledge';
import { KnowledgeEntry } from '@/types';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge/StatusBadge';

const levelColors: Record<string, string> = {
  high: '#10B981',
  medium: '#F59E0B',
  low: '#EF4444',
};

export default function QualityPage() {
  const [activeTab, setActiveTab] = useState<'lowQuality' | 'incomplete'>('lowQuality');
  const [searchQuery, setSearchQuery] = useState('');

  const lowQualityEntries = useMemo(() => getLowQualityEntries(knowledgeEntries), []);
  const incomplete = useMemo(() => getIncompleteEntries(knowledgeEntries), []);
  const scatterData = useMemo(() => getScatterData(knowledgeEntries), []);

  const filteredEntries = useMemo(() => {
    if (!searchQuery) return knowledgeEntries;
    return knowledgeEntries.filter(
      (e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100 font-mono">{incomplete.noFollowUp.length}</p>
              <p className="text-xs text-slate-400">缺少后续跟踪</p>
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
                  <LowQualityCard key={entry.id} entry={entry} />
                ))}
                {lowQualityEntries.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    暂无低质量条目
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {incomplete.noManual.map((entry) => (
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

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">全部知识条目</h2>
            <p className="text-xs text-slate-500 mt-1">共 {filteredEntries.length} 条知识记录</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜索知识条目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/30">
                <th className="text-left text-xs font-medium text-slate-400 px-6 py-3">条目编号</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">标题</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">引用次数</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">成功率</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">手册依据</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">放行结论</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">后续跟踪</th>
                <th className="text-left text-xs font-medium text-slate-400 px-6 py-3">质量等级</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3.5">
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
                    {entry.hasManualReference ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400/70" />
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {entry.hasReleaseConclusion ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400/70" />
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {entry.hasFollowUp ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400/70" />
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge
                      status={entry.level === 'high' ? 'success' : entry.level === 'medium' ? 'warning' : 'danger'}
                      label={entry.level === 'high' ? '高质量' : entry.level === 'medium' ? '中质量' : '低质量'}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LowQualityCard({ entry }: { entry: KnowledgeEntry }) {
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
