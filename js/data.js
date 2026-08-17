/* 小芽 · 示例数据（连贯使用者故事：宝妈林晚晴 + 孩子苗苗·4岁3个月） */
(function () {
  // 模块配置
  const MODULES = {
    routine: { name: '作息', icon: 'routine', color: '#E8B04B', cover: 'routine', desc: '每天的作息节奏' },
    reading: { name: '阅读', icon: 'read', color: '#C98736', cover: 'book', desc: '亲子共读与绘本' },
    study:   { name: '学习任务', icon: 'pencil', color: '#7FA86B', cover: 'study', desc: '启蒙与练习' },
    growth:  { name: '成长记录', icon: 'camera', color: '#C9A24B', cover: 'growth', desc: '值得记住的瞬间' },
    body:    { name: '身高体重', icon: 'ruler', color: '#B98A5E', cover: 'body', desc: '身体成长的刻度' },
    hobby:   { name: '兴趣课', icon: 'palette', color: '#C98A6B', cover: 'hobby', desc: '课余的热爱' },
    family:  { name: '亲子活动', icon: 'hearts', color: '#C76B57', cover: 'family', desc: '一起度过的时光' },
    items:   { name: '物品清单', icon: 'bag', color: '#8A9BB0', cover: 'items', desc: '要准备的东西' }
  };
  const MODULE_KEYS = Object.keys(MODULES);

  const STATUS = {
    done:  { key: 'done',  name: '已完成', color: '#4F8A5B' },
    doing: { key: 'doing', name: '进行中', color: '#C98736' },
    todo:  { key: 'todo',  name: '待办',   color: '#8A9BB0' },
    pause: { key: 'pause', name: '暂停',   color: '#A8967E' }
  };

  // 默认分类（用户可新增）
  const CATEGORIES = ['习惯', '绘本', '认知', '数学', '自理', '自然', '体检', '运动', '艺术', '户外', '手工', '健康', '采购', '睡眠', '周末', '入园'];

  // 提醒设置
  const SETTINGS = {
    remindMorning: true,
    remindEvening: true,
    childName: '苗苗',
    parentName: '林晚晴',
    childBirth: '2022-05-12'
  };

  // 成果卡（阶段目标达成）
  const ACHIEVEMENTS = [
    { id: 'ach-21', title: '连续阅读打卡 21 天', date: '2026-08-10', icon: 'trophy',
      text: '苗苗已经连续 21 天和妈妈一起读绘本啦，这个习惯正在悄悄长成小树。', module: 'reading' }
  ];

  // 成长树初始叶子数：与公式一致 = 亲子活动已完成数(1) + floor(积分(26)/20) = 2
  const TREE_LEAVES = 2;

  // 健康日程（4–6 岁疫苗 / 体检 / 流感节点，苗苗生于 2022-05-12，现 4 岁 3 个月）
  const HEALTH_SCHEDULE = [
    { id: 'h1', name: '入园体检', type: '体检', due: '2026-08-01', done: true, note: '社区医院，身高体重中上水平' },
    { id: 'h2', name: '4 岁脊灰疫苗（第 4 剂）', type: '疫苗', due: '2026-08-20', done: false, note: '带接种本，已预约' },
    { id: 'h3', name: '2026 秋流感疫苗', type: '流感', due: '2026-10-15', done: false, note: '每年一针，入冬前打' },
    { id: 'h4', name: '5 岁常规体检', type: '体检', due: '2027-05-12', done: false, note: '关注身高体重与视力' },
    { id: 'h5', name: '6 岁白破疫苗（加强）', type: '疫苗', due: '2028-05-12', done: false, note: '入学前完成' }
  ];

  // 记录（id / module / title / date / status / tags / note / cover / fields / media / related / activities / reminder）
  const RECORDS = [
    {
      id: 'r01', module: 'reading', title: '《好饿的毛毛虫》共读', date: '2026-08-10', status: 'done',
      tags: ['绘本', '习惯'], note: '苗苗能跟着指认星期和食物，最后还模仿毛毛虫啃苹果，笑得很大声。',
      cover: 'book', fields: { book: '好饿的毛毛虫', author: '艾瑞克·卡尔', pages: 26, minutes: 15, rating: 5 },
      media: [{ type: 'image', cover: 'book', caption: '共读时的绘本封面' }],
      related: [], activities: [{ date: '2026-08-10', text: '完成第 21 天阅读打卡' }],
      reminder: null
    },
    {
      id: 'r02', module: 'reading', title: '《猜猜我有多爱你》睡前共读', date: '2026-08-12', status: 'doing',
      tags: ['绘本', '睡眠'], note: '每天睡前一本，苗苗现在会主动抱出这本书。',
      cover: 'book', fields: { book: '猜猜我有多爱你', author: '山姆·麦克布雷尼', pages: 30, minutes: 12, rating: 0 },
      media: [{ type: 'image', cover: 'book', caption: '今晚翻到的那一页' }], related: [], activities: [],
      reminder: { next: '2026-08-14', text: '今晚睡前记得共读' }
    },
    {
      id: 'r03', module: 'study', title: '认识颜色与形状', date: '2026-08-12', status: 'doing',
      tags: ['认知', '启蒙'], note: '用家里的积木和水果认颜色，已经能分清红黄蓝和圆形方形。',
      cover: 'study', fields: { subject: '认知启蒙', goal: '认识红黄蓝与圆形方形', progress: 60, method: '生活游戏' },
      media: [], related: [], activities: [{ date: '2026-08-12', text: '进度更新到 60%' }], reminder: null
    },
    {
      id: 'r04', module: 'study', title: '数数 1 到 20', date: '2026-07-15', status: 'done',
      tags: ['数学', '启蒙'], note: '从掰手指到能顺口数到 20，用了三周。',
      cover: 'study', fields: { subject: '数学启蒙', goal: '连续数到 20', progress: 100, method: '阶梯练习' },
      media: [], related: [], activities: [{ date: '2026-07-15', text: '顺利数到 20，标记完成' }], reminder: null
    },
    {
      id: 'r05', module: 'growth', title: '第一次自己系鞋带', date: '2026-07-20', status: 'done',
      tags: ['自理', '里程碑'], note: '在小区玩之前自己弯腰系好了鞋带，骄傲地跑来给我看。',
      cover: 'growth', fields: { type: '自理能力', age: '4岁2个月', place: '小区楼下' },
      media: [{ type: 'image', cover: 'growth', caption: '系好鞋带的小脚丫' }], related: [],
      activities: [{ date: '2026-07-20', text: '记录为成长里程碑' }], reminder: null
    },
    {
      id: 'r06', module: 'growth', title: '绿豆发芽观察日记·第3天', date: '2026-08-08', status: 'doing',
      tags: ['自然', '观察'], note: '芽已经冒出两厘米，苗苗每天早起第一件事就是去阳台看它。',
      cover: 'growth', fields: { type: '自然观察', age: '4岁3个月', place: '家里阳台' },
      media: [{ type: 'image', cover: 'growth', caption: '第3天的绿豆芽' }], related: [], activities: [],
      reminder: { next: '2026-08-15', text: '记录绿豆发芽第10天' }
    },
    {
      id: 'r07', module: 'body', title: '4岁入园体检记录', date: '2026-08-01', status: 'done',
      tags: ['体检', '身高体重'], note: '社区医院体检，医生说身高体重都在中上水平。',
      cover: 'body', fields: { height: 105.3, weight: 16.8, bmi: 15.1, place: '社区医院' },
      media: [{ type: 'image', cover: 'body', caption: '体检本上的身高刻度' }], related: [],
      activities: [{ date: '2026-08-01', text: '记录身高 105.3cm / 体重 16.8kg' }], reminder: null
    },
    {
      id: 'r08', module: 'body', title: '居家身高测量', date: '2026-08-11', status: 'doing',
      tags: ['身高体重', '记录'], note: '在门框贴了身高纸，今晚量到又长高了一点。',
      cover: 'body', fields: { height: 105.8, weight: 17.0, place: '家门框' },
      media: [{ type: 'image', cover: 'body', caption: '门框上的新刻度' }], related: ['r07'], activities: [],
      reminder: null
    },
    {
      id: 'r09', module: 'hobby', title: '少儿平衡车课', date: '2026-08-09', status: 'doing',
      tags: ['运动', '周末'], note: '每周六上午一节，苗苗从不敢踩到现在能绕场半圈。',
      cover: 'hobby', fields: { schedule: '每周六 10:00', coach: '王教练', lessonsLeft: 6, place: '乐动运动馆' },
      media: [], related: [], activities: [{ date: '2026-08-09', text: '第 4 节课，能独立滑行' }],
      reminder: { next: '2026-08-15', text: '本周六平衡车课（带护具）' }
    },
    {
      id: 'r10', module: 'hobby', title: '亲子绘画课（第一期结课）', date: '2026-07-28', status: 'done',
      tags: ['艺术', '周末'], note: '八节课画完一本画册，最后一幅是给妈妈的画像。',
      cover: 'hobby', fields: { schedule: '已结课', coach: '陈老师', lessonsLeft: 0, place: '童心美术馆' },
      media: [{ type: 'image', cover: 'childArt', caption: '结课画册里给妈妈的画像' }], related: [],
      activities: [{ date: '2026-07-28', text: '完成第一期绘画课' }], reminder: null
    },
    {
      id: 'r11', module: 'family', title: '周末植物园认植物', date: '2026-08-09', status: 'done',
      tags: ['户外', '自然'], note: '认识了大叶子龟背竹和会害羞的含羞草，苗苗说要把含羞草种回家。',
      cover: 'family', fields: { place: '市植物园', with: '妈妈', mood: '开心', hours: 3 },
      media: [{ type: 'image', cover: 'family', caption: '植物园里牵手的小路' }], related: ['r06'],
      activities: [{ date: '2026-08-09', text: '成长树长出第 3 片新叶' }], reminder: null
    },
    {
      id: 'r12', module: 'family', title: '做手工饼干', date: '2026-08-16', status: 'todo',
      tags: ['手工', '计划'], note: '准备做小熊造型曲奇，需要提前买低筋面粉和模具。',
      cover: 'family', fields: { place: '家里厨房', with: '妈妈', mood: '期待', hours: 2 },
      media: [], related: [], activities: [],
      reminder: { next: '2026-08-16', text: '记得提前准备低筋面粉' }
    },
    {
      id: 'r13', module: 'items', title: '入园物品清单', date: '2026-08-13', status: 'todo',
      tags: ['采购', '入园'], note: '九月入园前要备齐，已买水杯和汗巾，还差几样。',
      cover: 'items', fields: { total: 5, bought: 2, list: [
        { name: '保温水杯', done: true }, { name: '汗巾', done: true },
        { name: '替换衣', done: false }, { name: '姓名贴', done: false }, { name: '小书包', done: false }
      ] },
      media: [], related: [], activities: [], reminder: { next: '2026-08-20', text: '入园物品还差 3 件' }
    },
    {
      id: 'r14', module: 'routine', title: '晚间作息表', date: '2026-08-14', status: 'doing',
      tags: ['习惯', '睡眠'], note: '洗漱—故事—关灯，三步走，最近躺下时间稳定了。',
      cover: 'routine', fields: { time: '20:30', repeat: '每天', steps: ['19:30 洗漱', '20:00 绘本故事', '20:30 关灯'] },
      media: [{ type: 'image', cover: 'sticker', caption: '今日习惯贴纸' }], related: ['r02'], activities: [{ date: '2026-08-14', text: '今日作息进行中' }], reminder: null
    },
    {
      id: 'r15', module: 'growth', title: '4岁视力筛查预约', date: '2026-09-10', status: 'todo',
      tags: ['健康', '提醒'], note: '幼儿园入园要求的视力检查，已在社区医院预约，避免和疫苗节点撞期。',
      cover: 'growth', fields: { type: '健康提醒', age: '4岁3个月', place: '社区医院' },
      media: [], related: [], activities: [],
      reminder: { next: '2026-09-10', text: '明天 4岁视力筛查（带医保卡）' }
    }
  ];

  window.XY_DATA = { MODULES, MODULE_KEYS, STATUS, CATEGORIES, SETTINGS, ACHIEVEMENTS, TREE_LEAVES, HEALTH_SCHEDULE, RECORDS };
})();
