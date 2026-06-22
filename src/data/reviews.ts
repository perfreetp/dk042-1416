import { ReviewTask } from '@/types';

const engineers = ['张伟', '李明', '王芳', '陈强', '刘洋', '赵静'];

const faultDescs = [
  '左发引气压力低',
  '空调组件温度控制失效',
  '起落架指示异常',
  '导航系统VOR接收故障',
  '液压系统压力波动',
  '燃油量指示不准',
  '防火系统测试不通过',
  '飞控系统舵面响应慢',
];

const rootCauses = [
  '传感器老化漂移',
  '控制单元软件缺陷',
  '线路接触不良',
  '液压油污染',
  '密封件磨损',
  '参数配置错误',
];

const tips = [
  '建议增加传感器定期检测',
  '更新控制软件至最新版本',
  '加强插头清洁与防氧化处理',
  '优化液压油更换周期',
  '增加密封件预防性更换',
];

function generateReviewTasks(): ReviewTask[] {
  const tasks: ReviewTask[] = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const isRecurring = i < 7;
    const statuses: ('pending' | 'assigned' | 'in_progress' | 'completed')[] = ['pending', 'assigned', 'in_progress', 'completed'];
    const status = statuses[i % 4];
    const assignee = status === 'pending' ? '' : engineers[i % engineers.length];

    const daysOffset = [-7, -3, 1, 4, 7, 12, -1, 2, 15, -5, 20, 30];
    const dueDate = new Date(now.getTime() + daysOffset[i] * 86400000);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const createdDate = new Date(now.getTime() - (14 + i) * 86400000);
    const createdDateStr = createdDate.toISOString().split('T')[0];

    tasks.push({
      id: `R${(i + 1).toString().padStart(3, '0')}`,
      faultCode: `F2${i + 1}-${(i + 1) * 3}`,
      faultDescription: faultDescs[i % faultDescs.length],
      type: isRecurring ? 'recurring' : 'timeout',
      status,
      assignee,
      dueDate: dueDateStr,
      rootCause: status === 'completed' ? rootCauses[i % rootCauses.length] : '',
      troubleshootingTip: status === 'completed' ? tips[i % tips.length] : '',
      trainingRequired: i % 3 === 0,
      trainingStatus: i % 3 === 0 ? (status === 'completed' ? 'completed' : 'pending') : 'none',
      createdAt: createdDateStr,
      occurrenceCount: isRecurring ? Math.floor(Math.random() * 8) + 3 : undefined,
      avgDowntime: !isRecurring ? Math.floor(Math.random() * 20) + 15 : undefined,
    });
  }

  return tasks;
}

export const reviewTasks: ReviewTask[] = generateReviewTasks();

export function getReviewStats(tasks: ReviewTask[]) {
  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    assigned: tasks.filter(t => t.status === 'assigned').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    recurring: tasks.filter(t => t.type === 'recurring').length,
    timeout: tasks.filter(t => t.type === 'timeout').length,
    training: tasks.filter(t => t.trainingStatus !== 'none').length,
  };
}

export function getRecurringFaults(tasks: ReviewTask[]) {
  return tasks.filter(t => t.type === 'recurring');
}

export function getTimeoutFaults(tasks: ReviewTask[]) {
  return tasks.filter(t => t.type === 'timeout');
}
