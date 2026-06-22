import { KnowledgeEntry, ATA_CHAPTERS } from '@/types';

const knowledgeTitles = [
  '引气系统压力低故障排故指南',
  '空调组件温度控制系统常见问题',
  '起落架位置传感器校准方法',
  'VOR导航系统接收故障分析',
  '液压系统压力波动排查流程',
  '燃油量指示系统校准',
  '防火系统测试故障排除',
  '飞控舵面响应慢处理方法',
  '防冰系统加热元件检测',
  '灯光系统亮度控制故障',
  '电源系统跳开关跳闸分析',
  '水系统泄漏点定位方法',
  '发动机振动监测数据分析',
  'APU启动故障排故程序',
  '雷达系统故障诊断手册',
  '通信系统噪音干扰排查',
];

const reviewers = ['张伟', '李明', '王芳', '陈强', '刘洋', '赵静'];

function generateKnowledge(): KnowledgeEntry[] {
  const entries: KnowledgeEntry[] = [];

  for (let i = 0; i < 16; i++) {
    const refCount = Math.floor(Math.random() * 80) + 10;
    const successRate = Math.floor(Math.random() * 60) + 30;
    const hasManual = Math.random() > 0.25;
    const hasRelease = Math.random() > 0.3;
    const hasFollow = Math.random() > 0.4;

    let level: 'high' | 'medium' | 'low';
    if (successRate >= 75 && hasManual) {
      level = 'high';
    } else if (successRate >= 50) {
      level = 'medium';
    } else {
      level = 'low';
    }

    const needsReview = refCount > 40 && successRate < 55;
    const reviewStatuses: KnowledgeEntry['reviewStatus'][] = ['none', 'pending', 'in_progress', 'completed'];
    const reviewStatus = needsReview
      ? reviewStatuses[Math.floor(Math.random() * 3) + 1]
      : reviewStatuses[Math.floor(Math.random() * 4)];

    const hasReviewer = reviewStatus !== 'none';

    entries.push({
      id: `K${(i + 1).toString().padStart(3, '0')}`,
      title: knowledgeTitles[i % knowledgeTitles.length],
      ataChapter: ATA_CHAPTERS[i % ATA_CHAPTERS.length].code,
      referenceCount: refCount,
      successRate,
      hasManualReference: hasManual,
      hasReleaseConclusion: hasRelease,
      hasFollowUp: hasFollow,
      level,
      reviewStatus,
      reviewer: hasReviewer ? reviewers[i % reviewers.length] : '',
      reviewSuggestion: reviewStatus === 'completed' ? '建议补充手册依据，优化排故步骤顺序。' : '',
      lastReviewedAt: reviewStatus === 'completed' ? '2025-06-15' : '',
    });
  }

  return entries;
}

export const knowledgeEntries: KnowledgeEntry[] = generateKnowledge();

export function getLowQualityEntries(entries: KnowledgeEntry[]) {
  return entries.filter(e => e.referenceCount > 40 && e.successRate < 55)
    .sort((a, b) => b.referenceCount - a.referenceCount);
}

export function getIncompleteEntries(entries: KnowledgeEntry[]) {
  return {
    noManual: entries.filter(e => !e.hasManualReference),
    noRelease: entries.filter(e => !e.hasReleaseConclusion),
    noFollowUp: entries.filter(e => !e.hasFollowUp),
  };
}

export function getScatterData(entries: KnowledgeEntry[]) {
  return entries.map(e => ({
    x: e.referenceCount,
    y: e.successRate,
    z: e.level,
    name: e.title,
    id: e.id,
  }));
}
