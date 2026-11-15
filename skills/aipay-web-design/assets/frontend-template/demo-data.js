export const products = [
  { id: 'instant', label: '即时运行', href: '#instant', icon: 'bolt', color: '#217c67', tint: '#d9f0e7', ink: '#163d31',
    values: { trigger: '通过 API 手动提交单次运行', for: '文件转换、网页截图、即时报告', result: '运行编号、实时进度、独立产物链接' } },
  { id: 'schedule', label: '定时任务', href: '#schedule', icon: 'calendar', color: '#345ecb', tint: '#e0eaff', ink: '#203770',
    values: { trigger: '按时区与计划自动运行', for: '日报汇总、定点同步、周期巡检', result: '下一次时间、最近记录、失败提醒' } },
  { id: 'workflow', label: '事件编排', href: '#workflow', icon: 'fork', color: '#a95127', tint: '#fae7da', ink: '#713519',
    values: { trigger: 'Webhook 事件触发有向流程', for: '发布产物校验、协作审批、回执分发', result: '逐步骤状态、失败重试、处理回执' } },
];

export const dimensions = [
  { key: 'trigger', label: '触发方式' },
  { key: 'for', label: '适用场景' },
  { key: 'result', label: '交付结果' },
];

function step(label, title, status, rows, tone = 'ready') {
  return { label, title, status, rows, tone };
}

export const chapters = [
  {
    product: products[0], id: 'instant', demoTitle: '云端控制台 · 即时运行',
    tagline: '发起一项任务，拿到可交付的结果',
    copy: '把零散的一次性任务交给云端。提交文件或参数后，客户端只需记住运行编号，就能查看进度和下载输出。',
    features: [
      { title: '独立运行', text: '每次调用生成新的运行记录，排查时可按编号定位。' },
      { title: '实时状态', text: '区分等待、运行和完成，前端可以据此更新用户提示。' },
      { title: '产物交付', text: '文件附上名称、大小和有效期，方便调用方接收。' },
      { title: '失败重跑', text: '沿用原始输入创建新记录，便于和上一次结果比较。' },
    ],
    details: { href: '#api-example', label: '查看请求示例' },
    steps: [
      step('提交任务', '日报 PDF 转换', '等待执行', [['运行编号', 'run_0842'], ['输入文件', 'daily-report.md'], ['任务规格', '1 核 / 512 MB']]),
      step('查看状态', '日报 PDF 转换', '运行中', [['运行编号', 'run_0842'], ['当前步骤', '渲染 PDF 页面'], ['已用时', '00:00:04']], 'running'),
      step('获取产物', '日报 PDF 转换', '执行完成', [['输出文件', 'daily-report.pdf'], ['文件大小', '186 KB'], ['下载有效期', '24 小时']]),
    ],
  },
  {
    product: products[1], id: 'schedule', demoTitle: '云端控制台 · 定时任务',
    tagline: '到点运行，重复工作自动完成',
    copy: '为汇总、同步、巡检指定时间和时区。控制台列出下一次运行与执行历史，方便核对任务是否如期完成。',
    features: [
      { title: '按时区调度', text: '按团队所在时区设置时间，并提前查看下一次运行。' },
      { title: '执行历史', text: '按时间列出运行结果，补查遗漏的日报或例行检查。' },
      { title: '异常提醒', text: '捕获超时和执行失败，同一问题保留可追踪的记录。' },
      { title: '临时暂停', text: '停止未来调度，保留规则和已完成的历史记录。' },
    ],
    details: { href: '#schedule-example', label: '查看配置示例' },
    steps: [
      step('配置计划', '周一至周五 · 运营日报', '配置完成', [['本地时间', '09:00'], ['时区', 'Asia/Shanghai'], ['触发规则', '0 9 * * 1-5']]),
      step('确认时间', '下一次运行', '等待调度', [['本地时间', '周一 09:00'], ['UTC 时间', '周一 01:00'], ['重叠任务', '跳过新实例']], 'running'),
      step('查看记录', '最近一次执行', '执行完成', [['运行编号', 'run_0796'], ['运行耗时', '12 秒'], ['输出文件', 'daily-metrics.json']]),
    ],
  },
  {
    product: products[2], id: 'workflow', demoTitle: '云端控制台 · 事件编排',
    tagline: '让事件驱动多步骤工作流',
    copy: '接收发布、订单或表单事件，按条件执行不同步骤。每个步骤的输入、状态和结果都有记录，便于追查失败环节。',
    features: [
      { title: '事件校验', text: '保存事件编号并验证签名，避免重复或无法确认来源的输入。' },
      { title: '条件分支', text: '按事件字段决定执行哪条路径，保留判定依据。' },
      { title: '局部重试', text: '针对失败步骤重试，并沿用前置步骤的产物。' },
      { title: '结果回执', text: '回传处理结论和运行编号，让来源系统知道发生了什么。' },
    ],
    details: { href: '#workflow-example', label: '查看事件示例' },
    steps: [
      step('接收事件', '发布产物校验', '事件已接收', [['事件类型', 'release.created'], ['事件编号', 'evt_0183'], ['签名状态', '已验证']]),
      step('运行流程', '发布产物校验', '运行中', [['下载产物', '通过'], ['检查清单', '进行中'], ['写入回执', '等待']], 'running'),
      step('查看回执', '发布产物校验', '流程完成', [['执行分支', '稳定版本'], ['校验项目', '4 / 4 通过'], ['回执状态', '已写入']]),
    ],
  },
];

export const navGroups = chapters.map((chapter, index) => ({
  label: ['Run', 'Schedule', 'Route'][index],
  items: [{
    label: chapter.product.label, href: chapter.product.href, product: chapter.product,
    description: chapter.tagline, links: [chapter.details],
  }],
}));
