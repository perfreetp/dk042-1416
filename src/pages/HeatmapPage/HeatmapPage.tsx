import { useMemo, useState } from 'react';
import { AlertTriangle, Clock, PlaneTakeoff, Wrench, ChevronRight, Repeat } from 'lucide-react';
import FilterBar from '@/components/FilterBar/FilterBar';
import MetricCard from '@/components/MetricCard/MetricCard';
import HeatmapChart from '@/components/HeatmapChart/HeatmapChart';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { useFilterStore } from '@/store/useFilterStore';
import { faultRecords, getFaultStats, getHeatmapData, getTopFaults } from '@/data/faults';
import { FaultRecord } from '@/types';
import { cn } from '@/lib/utils';

export default function HeatmapPage() {
  const filter = useFilterStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFaults = useMemo(() => {
    return faultRecords.filter((f) => {
      if (filter.aircraftTypes.length > 0 && !filter.aircraftTypes.includes(f.aircraftType)) {
        return false;
      }
      if (filter.bases.length > 0 && !filter.bases.includes(f.base)) {
        return false;
      }
      if (filter.ataChapters.length > 0 && !filter.ataChapters.includes(f.ataChapter)) {
        return false;
      }
      if (filter.seasons.length > 0 && !filter.seasons.includes(f.season)) {
        return false;
      }
      if (filter.faultCode && !f.faultCode.toLowerCase().includes(filter.faultCode.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [filter]);

  const stats = useMemo(() => getFaultStats(filteredFaults), [filteredFaults]);
  const heatmapData = useMemo(() => getHeatmapData(filteredFaults), [filteredFaults]);
  const topFaults = useMemo(() => getTopFaults(filteredFaults), [filteredFaults]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">故障热力</h1>
        <p className="text-sm text-slate-400">多维度分析故障分布与排故耗时</p>
      </div>

      <FilterBar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="故障总次数"
          value={stats.totalCount}
          unit="次"
          icon={AlertTriangle}
          color="orange"
          trend="up"
          trendValue="+12.5%"
        />
        <MetricCard
          label="平均停场时间"
          value={stats.avgDowntime}
          unit="小时"
          icon={Clock}
          color="blue"
          trend="down"
          trendValue="-3.2%"
        />
        <MetricCard
          label="重复故障飞机"
          value={stats.recurringCount}
          unit="架"
          icon={PlaneTakeoff}
          color="purple"
          trend="up"
          trendValue="+2 架"
        />
        <MetricCard
          label="常用处理动作"
          value={stats.topActions.length}
          unit="类"
          icon={Wrench}
          color="green"
          trend="stable"
          trendValue="持平"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">故障热力分布</h2>
              <p className="text-xs text-slate-500 mt-1">ATA 章节 × 月份故障次数</p>
            </div>
          </div>
          <HeatmapChart data={heatmapData} />
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">常用处理动作</h2>
              <p className="text-xs text-slate-500 mt-1">按使用频次排序</p>
            </div>
          </div>
          <div className="space-y-3">
            {stats.topActions.map(([action, count], index) => (
              <div key={action} className="group">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'w-5 h-5 rounded flex items-center justify-center text-xs font-bold',
                        index === 0
                          ? 'bg-orange-500/20 text-orange-400'
                          : index === 1
                          ? 'bg-blue-500/20 text-blue-400'
                          : index === 2
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-700/50 text-slate-400'
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="text-slate-300 group-hover:text-slate-100 transition-colors">
                      {action}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-xs">{count} 次</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${(count / stats.topActions[0][1]) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100">故障详情列表</h2>
          <p className="text-xs text-slate-500 mt-1">按停场时间从高到低排序</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/30">
                <th className="text-left text-xs font-medium text-slate-400 px-6 py-3">故障代码</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">故障描述</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">机型</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">基地</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">停场时间</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">状态</th>
                <th className="text-right text-xs font-medium text-slate-400 px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {topFaults.map((fault) => (
                <FaultRow
                  key={fault.id}
                  fault={fault}
                  expanded={expandedId === fault.id}
                  onToggle={() => setExpandedId(expandedId === fault.id ? null : fault.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FaultRow({
  fault,
  expanded,
  onToggle,
}: {
  fault: FaultRecord;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="hover:bg-slate-800/30 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-6 py-4">
          <span className="font-mono text-sm text-blue-400">{fault.faultCode}</span>
        </td>
        <td className="px-4 py-4">
          <div className="text-sm text-slate-200">{fault.description}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            ATA {fault.ataChapter} {fault.ataChapterName}
          </div>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-slate-300">{fault.aircraftType}</span>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-slate-300">{fault.base}</span>
        </td>
        <td className="px-4 py-4">
          <span
            className={cn(
              'font-mono text-sm font-medium',
              fault.downtimeHours > 24 ? 'text-orange-400' : 'text-slate-300'
            )}
          >
            {fault.downtimeHours}h
          </span>
        </td>
        <td className="px-4 py-4">
          {fault.isRecurring ? (
            <StatusBadge status="warning" label="重复故障" size="sm" />
          ) : (
            <StatusBadge status="info" label="单发" size="sm" />
          )}
        </td>
        <td className="px-6 py-4 text-right">
          <ChevronRight
            className={cn(
              'w-4 h-4 text-slate-400 inline transition-transform',
              expanded && 'rotate-90'
            )}
          />
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-800/20">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">飞机注册号</p>
                <p className="text-sm font-mono text-slate-200">{fault.aircraftReg}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">发生日期</p>
                <p className="text-sm text-slate-200">{fault.date}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">季节</p>
                <p className="text-sm text-slate-200">{fault.season}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">重复发生</p>
                <p className="text-sm text-slate-200 flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5" />
                  {fault.isRecurring ? '是' : '否'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2">处理动作</p>
              <div className="flex flex-wrap gap-2">
                {fault.actions.map((action, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-lg border border-slate-600/50"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
