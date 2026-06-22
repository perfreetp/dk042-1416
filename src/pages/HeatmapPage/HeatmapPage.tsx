import { useMemo, useState } from 'react';
import { AlertTriangle, Clock, PlaneTakeoff, Wrench, ChevronRight, Repeat } from 'lucide-react';
import FilterBar from '@/components/FilterBar/FilterBar';
import MetricCard from '@/components/MetricCard/MetricCard';
import HeatmapChart from '@/components/HeatmapChart/HeatmapChart';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { useFilterStore } from '@/store/useFilterStore';
import { faultRecords, getFaultStats, getHeatmapData, getTopFaults } from '@/data/faults';
import { FaultRecord, ATA_CHAPTERS } from '@/types';
import { cn } from '@/lib/utils';

function filterFaults(faults: FaultRecord[], startDate: string, endDate: string, filter: {
  aircraftTypes: string[];
  bases: string[];
  ataChapters: string[];
  seasons: string[];
  faultCode: string;
}) {
  return faults.filter((f) => {
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
    if (startDate && f.date < startDate) {
      return false;
    }
    if (endDate && f.date > endDate) {
      return false;
    }
    return true;
  });
}

function getPreviousDateRange(startDate: string, endDate: string): { prevStart: string; prevEnd: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 86400000);
  const prevStart = new Date(prevEnd.getTime() - diffMs);
  return {
    prevStart: prevStart.toISOString().split('T')[0],
    prevEnd: prevEnd.toISOString().split('T')[0],
  };
}

export default function HeatmapPage() {
  const filter = useFilterStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFaults = useMemo(() => {
    return filterFaults(faultRecords, filter.startDate, filter.endDate, filter);
  }, [filter]);

  const { prevStart, prevEnd } = useMemo(
    () => getPreviousDateRange(filter.startDate, filter.endDate),
    [filter.startDate, filter.endDate]
  );

  const previousFaults = useMemo(() => {
    return filterFaults(faultRecords, prevStart, prevEnd, filter);
  }, [prevStart, prevEnd, filter.aircraftTypes, filter.bases, filter.ataChapters, filter.seasons, filter.faultCode]);

  const stats = useMemo(() => getFaultStats(filteredFaults), [filteredFaults]);
  const prevStats = useMemo(() => getFaultStats(previousFaults), [previousFaults]);
  const heatmapData = useMemo(() => getHeatmapData(filteredFaults), [filteredFaults]);
  const topFaults = useMemo(() => getTopFaults(filteredFaults), [filteredFaults]);

  const avgDowntimeNum = typeof stats.avgDowntime === 'string' ? parseFloat(stats.avgDowntime) : stats.avgDowntime;
  const prevAvgDowntimeNum = typeof prevStats.avgDowntime === 'string' ? parseFloat(prevStats.avgDowntime) : prevStats.avgDowntime;

  const THRESHOLD = 0.2;

  const getTopContributors = (currentFaults: FaultRecord[], prevFaults: FaultRecord[], key: 'ataChapter' | 'base') => {
    const curMap = new Map<string, number>();
    const prevMap = new Map<string, number>();
    currentFaults.forEach((f) => curMap.set(f[key], (curMap.get(f[key]) || 0) + 1));
    prevFaults.forEach((f) => prevMap.set(f[key], (prevMap.get(f[key]) || 0) + 1));

    const diffs: { label: string; value: string }[] = [];
    curMap.forEach((curCount, k) => {
      const prevCount = prevMap.get(k) || 0;
      const diff = curCount - prevCount;
      if (diff > 0) {
        const name = key === 'ataChapter'
          ? ATA_CHAPTERS.find((c) => c.code === k)?.name || `ATA ${k}`
          : k;
        diffs.push({ label: name, value: `+${diff}次（${prevCount}→${curCount}）` });
      }
    });
    diffs.sort((a, b) => parseInt(b.value) - parseInt(a.value));
    return diffs.slice(0, 3);
  };

  const totalCountAlert = useMemo(() => {
    if (prevStats.totalCount > 0 && (stats.totalCount - prevStats.totalCount) / prevStats.totalCount > THRESHOLD) {
      const pct = (((stats.totalCount - prevStats.totalCount) / prevStats.totalCount) * 100).toFixed(0);
      return {
        message: `故障次数较上周期上升${pct}%，点击查看原因`,
        details: [
          ...getTopContributors(filteredFaults, previousFaults, 'ataChapter'),
          ...getTopContributors(filteredFaults, previousFaults, 'base'),
        ],
      };
    }
    return undefined;
  }, [stats.totalCount, prevStats.totalCount, filteredFaults, previousFaults]);

  const downtimeAlert = useMemo(() => {
    if (prevAvgDowntimeNum > 0 && (avgDowntimeNum - prevAvgDowntimeNum) / prevAvgDowntimeNum > THRESHOLD) {
      const pct = (((avgDowntimeNum - prevAvgDowntimeNum) / prevAvgDowntimeNum) * 100).toFixed(0);
      const curByAta = new Map<string, { total: number; count: number }>();
      const prevByAta = new Map<string, { total: number; count: number }>();
      filteredFaults.forEach((f) => {
        const cur = curByAta.get(f.ataChapter) || { total: 0, count: 0 };
        cur.total += f.downtimeHours;
        cur.count += 1;
        curByAta.set(f.ataChapter, cur);
      });
      previousFaults.forEach((f) => {
        const prev = prevByAta.get(f.ataChapter) || { total: 0, count: 0 };
        prev.total += f.downtimeHours;
        prev.count += 1;
        prevByAta.set(f.ataChapter, prev);
      });
      const details: { label: string; value: string }[] = [];
      curByAta.forEach((cur, k) => {
        const prev = prevByAta.get(k);
        if (prev) {
          const curAvg = cur.total / cur.count;
          const prevAvg = prev.total / prev.count;
          if (curAvg > prevAvg) {
            const name = ATA_CHAPTERS.find((c) => c.code === k)?.name || `ATA ${k}`;
            details.push({ label: name, value: `${prevAvg.toFixed(1)}h→${curAvg.toFixed(1)}h` });
          }
        }
      });
      details.sort((a, b) => {
        const bVal = parseFloat(b.value.split('→')[1]);
        const aVal = parseFloat(a.value.split('→')[1]);
        return bVal - aVal;
      });
      return {
        message: `平均停场时间上升${pct}%，点击查看原因`,
        details: details.slice(0, 3),
      };
    }
    return undefined;
  }, [avgDowntimeNum, prevAvgDowntimeNum, filteredFaults, previousFaults]);

  const recurringAlert = useMemo(() => {
    if (prevStats.recurringCount > 0 && stats.recurringCount > prevStats.recurringCount) {
      const curRegs = new Map<string, number>();
      filteredFaults.filter((f) => f.isRecurring).forEach((f) => curRegs.set(f.aircraftReg, (curRegs.get(f.aircraftReg) || 0) + 1));
      const details: { label: string; value: string }[] = [];
      curRegs.forEach((count, reg) => {
        details.push({ label: reg, value: `${count}次` });
      });
      details.sort((a, b) => parseInt(b.value) - parseInt(a.value));
      if (details.length > 0) {
        return {
          message: `重复故障飞机增加${stats.recurringCount - prevStats.recurringCount}架，点击查看原因`,
          details: details.slice(0, 3),
        };
      }
    }
    return undefined;
  }, [stats.recurringCount, prevStats.recurringCount, filteredFaults]);

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
          comparison={{
            previousValue: prevStats.totalCount,
            currentValue: stats.totalCount,
            label: '较上一周期',
          }}
          anomalyAlert={totalCountAlert}
        />
        <MetricCard
          label="平均停场时间"
          value={avgDowntimeNum.toFixed(1)}
          unit="小时"
          icon={Clock}
          color="blue"
          comparison={{
            previousValue: prevAvgDowntimeNum,
            currentValue: avgDowntimeNum,
            label: '较上一周期',
          }}
          anomalyAlert={downtimeAlert}
        />
        <MetricCard
          label="重复故障飞机"
          value={stats.recurringCount}
          unit="架"
          icon={PlaneTakeoff}
          color="purple"
          comparison={{
            previousValue: prevStats.recurringCount,
            currentValue: stats.recurringCount,
            label: '较上一周期',
          }}
          anomalyAlert={recurringAlert}
        />
        <MetricCard
          label="常用处理动作"
          value={stats.topActions.length}
          unit="类"
          icon={Wrench}
          color="green"
          comparison={{
            previousValue: prevStats.topActions.length,
            currentValue: stats.topActions.length,
            label: '较上一周期',
          }}
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
