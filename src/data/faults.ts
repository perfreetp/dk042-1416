import { FaultRecord, ATA_CHAPTERS, AIRCRAFT_TYPES, BASES, SEASONS } from '@/types';

const faultDescriptions = [
  '左发引气压力低',
  '空调组件温度控制失效',
  '起落架指示异常',
  '导航系统VOR接收故障',
  '液压系统压力波动',
  '燃油量指示不准',
  '防火系统测试不通过',
  '飞控系统舵面响应慢',
  '防冰系统加热失效',
  '灯光系统亮度异常',
  '电源系统跳开关跳闸',
  '水系统泄漏',
];

const commonActions = [
  '更换传感器',
  '重置系统复位',
  '更换控制组件',
  '清洁连接插头',
  '调整校准参数',
  '更换液压油',
  '软件升级',
  '人工放气测试',
  '更换灯泡',
  '检查线路',
];

function generateFaults(): FaultRecord[] {
  const faults: FaultRecord[] = [];
  let id = 1;
  const now = new Date();

  for (let monthsAgo = 0; monthsAgo < 12; monthsAgo++) {
    const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const seasonIdx = Math.floor((month - 1) / 3);
    const season = SEASONS[seasonIdx];

    const count = 12 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      const ataIndex = Math.floor(Math.random() * ATA_CHAPTERS.length);
      const ata = ATA_CHAPTERS[ataIndex];
      const aircraftType = AIRCRAFT_TYPES[Math.floor(Math.random() * AIRCRAFT_TYPES.length)];
      const base = BASES[Math.floor(Math.random() * BASES.length)];
      const desc = faultDescriptions[ataIndex % faultDescriptions.length];
      const day = Math.floor(Math.random() * 28 + 1);
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

      faults.push({
        id: `F${id.toString().padStart(4, '0')}`,
        faultCode: `F${ata.code}-${id % 100}`,
        ataChapter: ata.code,
        ataChapterName: ata.name,
        aircraftType,
        base,
        season,
        description: desc,
        downtimeHours: Math.floor(Math.random() * 48) + 1,
        aircraftReg: `${aircraftType.charAt(0)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        actions: [
          commonActions[Math.floor(Math.random() * commonActions.length)],
          commonActions[Math.floor(Math.random() * commonActions.length)],
        ],
        isRecurring: Math.random() > 0.75,
        date: dateStr,
        month,
      });
      id++;
    }
  }

  return faults;
}

export const faultRecords: FaultRecord[] = generateFaults();

export function getFaultStats(faults: FaultRecord[]) {
  const totalCount = faults.length;
  const avgDowntime = faults.length > 0
    ? faults.reduce((sum, f) => sum + f.downtimeHours, 0) / faults.length
    : 0;
  const recurringAircraft = new Set(faults.filter(f => f.isRecurring).map(f => f.aircraftReg));

  const actionMap = new Map<string, number>();
  faults.forEach(f => {
    f.actions.forEach(a => {
      actionMap.set(a, (actionMap.get(a) || 0) + 1);
    });
  });
  const topActions = Array.from(actionMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    totalCount,
    avgDowntime: avgDowntime.toFixed(1),
    recurringCount: recurringAircraft.size,
    topActions,
  };
}

export function getHeatmapData(faults: FaultRecord[]) {
  const data: Record<string, Record<number, number>> = {};

  ATA_CHAPTERS.forEach(ata => {
    data[ata.code] = {};
    for (let m = 1; m <= 12; m++) {
      data[ata.code][m] = 0;
    }
  });

  faults.forEach(f => {
    if (data[f.ataChapter]) {
      data[f.ataChapter][f.month]++;
    }
  });

  return data;
}

export function getTopFaults(faults: FaultRecord[], limit = 10) {
  return [...faults]
    .sort((a, b) => b.downtimeHours - a.downtimeHours)
    .slice(0, limit);
}
