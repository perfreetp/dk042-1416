export interface FaultRecord {
  id: string;
  faultCode: string;
  ataChapter: string;
  ataChapterName: string;
  aircraftType: string;
  base: string;
  season: string;
  description: string;
  downtimeHours: number;
  aircraftReg: string;
  actions: string[];
  isRecurring: boolean;
  date: string;
  month: number;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  ataChapter: string;
  referenceCount: number;
  successRate: number;
  hasManualReference: boolean;
  hasReleaseConclusion: boolean;
  hasFollowUp: boolean;
  level: 'high' | 'medium' | 'low';
  reviewStatus: 'none' | 'pending' | 'in_progress' | 'completed';
  reviewer: string;
  reviewSuggestion: string;
  lastReviewedAt: string;
}

export interface ReviewTask {
  id: string;
  faultCode: string;
  faultDescription: string;
  type: 'recurring' | 'timeout';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  assignee: string;
  dueDate: string;
  rootCause: string;
  troubleshootingTip: string;
  trainingRequired: boolean;
  trainingStatus: 'none' | 'pending' | 'completed';
  createdAt: string;
  occurrenceCount?: number;
  avgDowntime?: number;
}

export type TimeRange = 'thisMonth' | 'last3Months' | 'last6Months' | 'custom';

export interface FilterState {
  aircraftTypes: string[];
  bases: string[];
  ataChapters: string[];
  seasons: string[];
  faultCode: string;
  timeRange: TimeRange;
  startDate: string;
  endDate: string;
}

export interface MetricData {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: string;
}

export const AIRCRAFT_TYPES = ['B737', 'B787', 'A320', 'A350'];

export const BASES = ['北京', '上海', '广州', '深圳', '成都'];

export const ATA_CHAPTERS = [
  { code: '21', name: '空调系统' },
  { code: '24', name: '电源系统' },
  { code: '26', name: '防火系统' },
  { code: '27', name: '飞控系统' },
  { code: '28', name: '燃油系统' },
  { code: '29', name: '液压系统' },
  { code: '30', name: '防冰系统' },
  { code: '31', name: '导航系统' },
  { code: '32', name: '起落架' },
  { code: '33', name: '灯光系统' },
  { code: '36', name: '气源系统' },
  { code: '38', name: '水/废物系统' },
];

export const SEASONS = ['春季', '夏季', '秋季', '冬季'];

export const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
