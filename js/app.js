/* 小芽 · 应用逻辑：路由 / 页面 / CRUD / 筛选 / 联动 / 图表 / 相册 */
(function () {
  const D = window.XY_DATA, XY = window.XY;
  const { MODULES, MODULE_KEYS, STATUS, CATEGORIES, SETTINGS, ACHIEVEMENTS, TREE_LEAVES, HEALTH_SCHEDULE, RECORDS } = D;
  const KEY = 'xiaoya_v1';

  // ---------- 积分 / 奖励 配置 ----------
  const POINTS = { routine: 3, reading: 4, study: 5, growth: 4, body: 3, hobby: 4, family: 6, items: 2 };
  const LEAF_PER_POINTS = 20;
  const REWARDS = [
    { id: 'w1', title: '多去一次公园', cost: 15, icon: 'leaf' },
    { id: 'w2', title: '多玩 30 分钟乐高', cost: 20, icon: 'star' },
    { id: 'w3', title: '选一本新绘本', cost: 25, icon: 'book' },
    { id: 'w4', title: '一份小蛋糕', cost: 30, icon: 'gift' },
    { id: 'w5', title: '周末去动物园', cost: 45, icon: 'hearts' }
  ];
  // WHO 女童 身长/身高 百分位参考（cm）：[月龄, P3, P15, P50, P85, P97]
  const WHO_H = [
    [0,46.1,48.0,49.9,51.8,53.7],[3,55.6,57.7,59.8,62.0,64.1],[6,61.2,63.5,65.7,68.0,70.3],[9,64.9,67.4,69.9,72.4,74.9],
    [12,67.7,70.3,72.9,75.6,78.3],[18,72.8,75.6,78.4,81.2,84.0],[24,76.9,79.9,82.9,85.9,89.0],[36,84.5,87.8,91.1,94.5,97.9],
    [48,91.0,94.6,98.2,101.8,105.5],[60,96.8,100.6,104.4,108.2,112.1],[72,102.2,106.1,110.1,114.1,118.1]
  ];
  // WHO 女童 体重 百分位参考（kg）：[月龄, P3, P15, P50, P85, P97]
  const WHO_W = [
    [0,2.8,3.2,3.7,4.3,4.9],[3,4.5,5.2,6.0,6.9,7.8],[6,5.7,6.5,7.4,8.4,9.5],[9,6.6,7.5,8.5,9.6,10.8],
    [12,7.3,8.3,9.4,10.6,11.9],[18,8.2,9.4,10.6,12.0,13.5],[24,9.0,10.3,11.7,13.2,14.9],[36,10.6,12.1,13.8,15.6,17.6],
    [48,12.0,13.7,15.6,17.7,20.0],[60,13.4,15.3,17.4,19.8,22.4],[72,14.8,16.9,19.2,21.9,24.8]
  ];

  // ---------- 状态 ----------
  let state = null;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { state = JSON.parse(raw); return; }
    } catch (e) {}
    seed();
  }
  function seed() {
    const recs = JSON.parse(JSON.stringify(RECORDS));
    const initialPoints = recs.filter(r => r.status === 'done').reduce((a, r) => a + (POINTS[r.module] || 0), 0);
    state = {
      records: recs,
      categories: JSON.parse(JSON.stringify(CATEGORIES)),
      settings: JSON.parse(JSON.stringify(SETTINGS)),
      achievements: JSON.parse(JSON.stringify(ACHIEVEMENTS)),
      treeLeaves: TREE_LEAVES,
      points: initialPoints,
      pointLog: initialPoints ? [{ date: RECORDS.reduce((a, r) => r.status === 'done' && r.date > a ? r.date : a, '2026-01-01'), text: '初始累计已完成记录', delta: initialPoints }] : [],
      health: JSON.parse(JSON.stringify(HEALTH_SCHEDULE))
    };
    save();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  const ui = { view: 'home', params: {}, wizard: null, filters: { q: '', module: '', status: '', tag: '', sort: 'date' }, calMonth: '2026-08', scope: { type: 'all', from: '', to: '' }, homeScope: 'week', albumCollapsed: {}, healthForm: { open: false, htype: 'temp' }, prev: 'home', modal: null, lightbox: null };

  // ---------- 工具 ----------
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ic = (n) => (XY.ICON[n] ? XY.ICON[n]() : '');
  const cov = (k, p) => (XY.COVERS[k] ? XY.COVERS[k](p) : XY.COVERS.empty());
  const mColor = (m) => (MODULES[m] ? MODULES[m].color : '#C98736');
  const mName = (m) => (MODULES[m] ? MODULES[m].name : m);
  const sColor = (s) => (STATUS[s] ? STATUS[s].color : '#8A9BB0');
  const sName = (s) => (STATUS[s] ? STATUS[s].name : s);

  function todayStr() { const d = new Date(); return fmt(d); }
  function fmt(d) { d = d instanceof Date ? d : new Date(d); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parse(d) { const [y, m, day] = d.split('-').map(Number); return new Date(y, m - 1, day); }
  function weekStart(d) { const x = parse(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); return fmt(x); }
  function addDays(d, n) { const x = parse(d); x.setDate(x.getDate() + n); return fmt(x); }
  function childAge(birth) { const b = parse(birth), t = new Date(); let y = t.getFullYear() - b.getFullYear(); let m = t.getMonth() - b.getMonth(); if (m < 0 || (m === 0 && t.getDate() < b.getDate())) { y--; m += 12; } if (t.getDate() < b.getDate()) m--; if (m < 0) { y--; m += 12; } return ` ${y}岁${m}个月`; }
  function uid() { return 'r' + Date.now().toString(36) + Math.floor(Math.random() * 1e3).toString(36); }

  // ---------- 派生数据 ----------
  function records() { return state.records; }
  function byId(id) { return state.records.find(r => r.id === id); }
  function doneCount() { return state.records.filter(r => r.status === 'done').length; }
  function totalCount() { return state.records.length; }
  function rate() { return totalCount() ? Math.round(doneCount() / totalCount() * 100) : 0; }
  function todayItems() {
    const t = todayStr();
    const arr = state.records.filter(r => r.date === t || (r.reminder && r.reminder.next === t));
    return arr;
  }
  function upcoming() {
    const t = todayStr();
    return state.records.filter(r => r.status !== 'done' && r.reminder && r.reminder.next >= t)
      .sort((a, b) => (a.reminder.next > b.reminder.next ? 1 : -1)).slice(0, 3);
  }
  function recent(n) { return [...state.records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n || 5); }

  // ---------- 路由 ----------
  function navigate(view, params) {
    ui.prev = ui.view; ui.view = view; ui.params = params || {};
    if (view !== 'add' && view !== 'edit') ui.wizard = null;
    if (view === 'library') { /* keep filters */ }
    closeModal(); closeLightbox();
    render();
    const v = document.getElementById('view'); if (v) v.scrollTop = 0;
  }
  function go(hash) { location.hash = hash; }

  function router() {
    const h = location.hash.replace(/^#\/?/, '');
    const [v, arg] = h.split('/');
    if (!v || v === '') { ui.view = 'home'; ui.params = {}; }
    else { ui.view = v; ui.params = arg ? { id: arg } : {}; }
    render();
  }

  // ---------- 渲染骨架 ----------
  const app = document.getElementById('app');
  function render() {
    const v = ui.view;
    let body = '';
    if (v === 'home') body = viewHome();
    else if (v === 'library') body = viewLibrary();
    else if (v === 'detail') body = viewDetail(ui.params.id);
    else if (v === 'add') body = viewWizard();
    else if (v === 'edit') body = viewEdit(ui.params.id);
    else if (v === 'calendar') body = viewCalendar();
    else if (v === 'insights') body = viewInsights();
    else if (v === 'album') body = viewAlbum();
    else if (v === 'settings') body = viewSettings();
    else if (v === 'rewards') body = viewRewards();
    else if (v === 'report') body = viewReport();
    else body = viewHome();

    app.innerHTML = `
      <div class="phone">
        ${topBar(v)}
        <main id="view" class="view">${body}</main>
        ${bottomNav(v)}
        ${fab(v)}
        <div id="toast" class="toast"></div>
        <div id="modalRoot"></div>
        <div id="lightboxRoot"></div>
      </div>`;
    bindScroll();
  }

  function topBar(v) {
    const titles = { home: '', library: '成长册', calendar: '日历', insights: '成长洞察', album: '相册', settings: '我的', detail: '记录详情', add: '新增记录', edit: '编辑记录', report: '阶段报告', rewards: '奖励中心' };
    if (v === 'home') {
      const t = new Date();
      const wd = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][t.getDay()];
      return `<header class="topbar topbar-home">
        <div class="brand">
          <span class="brand-logo">${XY.logo(36)}</span>
          <div class="brand-tx"><b>小芽</b><span>把孩子的每一次长大，温柔记下来</span></div>
        </div>
        <div class="today-chip">${todayStr().slice(5)} · ${wd}</div>
      </header>`;
    }
    const showBack = ['detail', 'add', 'edit', 'report'].includes(v);
    return `<header class="topbar">
      <div class="tb-left">${showBack ? `<button class="iconbtn" data-act="back">${ic('back')}</button>` : ''}<b class="tb-title">${titles[v] || ''}</b></div>
      ${v === 'library' ? `<button class="iconbtn" data-act="focusSearch">${ic('search')}</button>` : ''}
    </header>`;
  }

  function bottomNav(v) {
    const items = [
      { view: 'home', icon: 'home', label: '首页' },
      { view: 'library', icon: 'book', label: '成长册' },
      { view: 'calendar', icon: 'cal', label: '日历' },
      { view: 'insights', icon: 'chart', label: '洞察' },
      { view: 'album', icon: 'album', label: '相册' },
      { view: 'settings', icon: 'me', label: '我的' }
    ];
    return `<nav class="bottomnav">${items.map(it => `<button class="navbtn ${v === it.view ? 'on' : ''}" data-act="nav" data-view="${it.view}">
      <span class="nav-ic">${ic(it.icon)}</span><span>${it.label}</span></button>`).join('')}</nav>`;
  }

  function fab(v) {
    if (['home', 'library', 'calendar'].includes(v)) {
      return `<button class="fab" data-act="add" title="新增记录">${ic('plus')}<span>记录</span></button>`;
    }
    return '';
  }

  // ---------- 首页 ----------
  function viewHome() {
    const t = todayStr();
    const rateV = rate();
    const items = todayItems();
    const prio = upcoming()[0];
    const rec = recent(1)[0];
    const tree = state.treeLeaves;
    const weekDone = weekCompletedCount();
    const hr = homeRecents();
    return `
    <section class="home">
      <div class="hero">
        <div class="hero-art">${cov('homeVisual')}</div>
        <div class="hero-ov">
          <div class="hero-stat">
            <span class="ring" style="--p:${rateV}"><b>${rateV}%</b><i>总完成率</i></span>
          </div>
          <div class="hero-act">
            <span class="hero-act-l">今天最重要</span>
            ${prio ? `<button class="hero-act-b" data-act="detail" data-id="${prio.id}">${esc(prio.title)}<small>${prio.reminder ? '提醒 · ' + prio.reminder.next : ''}</small></button>`
                   : `<div class="hero-act-b no">今天没有待办，陪苗苗玩会儿吧</div>`}
          </div>
        </div>
      </div>

      <div class="seg homescope">
        <button class="${ui.homeScope === 'week' ? 'on' : ''}" data-act="homescope" data-scope="week">本周</button>
        <button class="${ui.homeScope === 'month' ? 'on' : ''}" data-act="homescope" data-scope="month">本月</button>
      </div>
      <div class="grid2">
        <div class="card stat-big click" data-act="insights">
          <span class="stat-cap">${ui.homeScope === 'month' ? '本月共读' : '本周共读'}</span>
          <b class="stat-num">${scopeReadingCount(ui.homeScope)}<small>次</small></b>
          <span class="stat-sub">点点滴滴，都是陪伴</span>
        </div>
        <div class="card stat-trend">
          <span class="stat-cap">${ui.homeScope === 'month' ? '本月完成' : '本周完成'}</span>
          <div class="spark">${sparkline()}</div>
          <span class="stat-sub">${ui.homeScope === 'month' ? '本月已完成 ' + scopeDoneCount('month') + ' 项' : '本周已完成 ' + scopeDoneCount('week') + ' 项'}</span>
        </div>
      </div>

      <div class="sec">
        <div class="sec-h"><b>今日事项</b><span class="sec-more" data-act="nav" data-view="calendar">看日历 ${ic('chevR')}</span></div>
        ${items.length ? `<div class="mini-list">${items.map(r => miniRow(r)).join('')}</div>`
          : `<div class="empty sm">${cov('empty')}<p>今天还没有安排，点“记录”加一条吧</p></div>`}
      </div>

      <div class="sec">
        <div class="sec-h"><b>快捷操作</b></div>
        <div class="quick">
          ${MODULE_KEYS.slice(0, 4).map(m => `<button class="quick-btn" data-act="addMod" data-module="${m}">${ic(MODULES[m].icon)}<span>${MODULES[m].name}</span></button>`).join('')}
          <button class="quick-btn" data-act="add">${ic('plus')}<span>更多</span></button>
        </div>
      </div>

      <div class="sec">
        <div class="sec-h"><b>最近记录</b><span class="sec-more" data-act="nav" data-view="library">全部 ${ic('chevR')}</span></div>
        ${hr.today.length ? `<div class="rec-sub">今天</div><div class="rec-list">${hr.today.map(r => recRow(r)).join('')}</div>` : ''}
        ${hr.earlier.length ? `<div class="rec-sub">更早</div><div class="rec-list">${hr.earlier.map(r => recRow(r)).join('')}</div>` : ''}
        ${!hr.today.length && !hr.earlier.length ? `<div class="empty sm">${cov('empty')}<p>还没有记录，点“记录”加一条吧</p></div>` : ''}
      </div>
      ${hr.future.length ? `<div class="sec">
        <div class="sec-h"><b>即将到来</b><span class="sec-sub">未到日期的计划</span></div>
        <div class="rec-list">${hr.future.map(r => recRow(r)).join('')}</div>
      </div>` : ''}

      <div class="sec">
        <div class="sec-h"><b>健康与疫苗</b><span class="sec-more" data-act="health">全部 ${ic('chevR')}</span></div>
        ${healthUpcoming().length ? `<div class="rec-list">${healthUpcoming().slice(0, 2).map(h => `<button class="mini-row" data-act="health"><span class="dot" style="background:${XY.C.berry}"></span><span class="mini-tx"><b>${esc(h.name)}</b><small>${esc(h.type)} · ${esc(h.due)}</small></span><span class="pill" style="background:${XY.C.berry}1a;color:${XY.C.berry}">待办</span></button>`).join('')}</div>` : `<div class="empty sm">${cov('empty')}<p>近期没有待办的健康节点，棒棒的</p></div>`}
      </div>

      <div class="sec">
        <div class="sec-h"><b>阶段成果</b><span class="sec-more" data-act="report">报告 ${ic('chevR')}</span></div>
        <div class="ach-row">
          ${state.achievements.map(a => `<div class="ach-card" data-act="report">${ic(a.icon)}<b>${esc(a.title)}</b><small>${esc(a.date)}</small></div>`).join('')}
          <div class="tree-card" data-act="insights">${cov('tree', tree)}<span>成长树 · ${tree} 片叶</span></div>
          <div class="tree-card points" data-act="rewards">${ic('coin')}<span>小芽积分 ${state.points || 0}</span><small>去兑换 →</small></div>
        </div>
      </div>
    </section>`;
  }
  function miniRow(r) {
    return `<button class="mini-row" data-act="detail" data-id="${r.id}">
      <span class="dot" style="background:${mColor(r.module)}"></span>
      <span class="mini-tx"><b>${esc(r.title)}</b><small>${mName(r.module)} · ${esc(r.date)}</small></span>
      <span class="pill" style="background:${sColor(r.status)}1a;color:${sColor(r.status)}">${sName(r.status)}</span>
    </button>`;
  }
  function recRow(r) {
    const img = r.coverImage ? `<img src="${r.coverImage}" alt="" onerror="this.parentNode.innerHTML=window.XY.COVERSEMPTY">` : cov(r.cover, r.fields && r.fields.book);
    return `<button class="rec-row" data-act="detail" data-id="${r.id}">
      <span class="rec-thumb">${img}</span>
      <span class="rec-tx"><b>${esc(r.title)}</b><small>${mName(r.module)} · ${esc(r.date)}</small>
      <span class="tags">${r.tags.slice(0, 2).map(t => `<i style="background:${mColor(r.module)}1f;color:${mColor(r.module)}">${esc(t)}</i>`).join('')}</span></span>
      <span class="pill" style="background:${sColor(r.status)}1a;color:${sColor(r.status)}">${sName(r.status)}</span>
    </button>`;
  }
  function weekCompletedCount() {
    const ws = weekStart(todayStr());
    return state.records.filter(r => r.status === 'done' && r.date >= ws).length;
  }
  function readingCount() {
    return state.records.filter(r => r.module === 'reading').length;
  }
  function scopeDoneCount(scope) {
    const t = todayStr();
    if (scope === 'month') { const ms = t.slice(0, 7) + '-01'; return state.records.filter(r => r.status === 'done' && r.date >= ms && r.date <= t).length; }
    const ws = weekStart(t); return state.records.filter(r => r.status === 'done' && r.date >= ws && r.date <= t).length;
  }
  function scopeReadingCount(scope) {
    const t = todayStr();
    if (scope === 'month') { const ms = t.slice(0, 7) + '-01'; return state.records.filter(r => r.module === 'reading' && r.date >= ms && r.date <= t).length; }
    const ws = weekStart(t); return state.records.filter(r => r.module === 'reading' && r.date >= ws && r.date <= t).length;
  }
  function homeRecents() {
    const t = todayStr();
    const pastAll = state.records.filter(r => r.date <= t).sort((a, b) => b.date.localeCompare(a.date));
    const today = pastAll.filter(r => r.date === t).slice(0, 3);
    const earlier = pastAll.filter(r => r.date < t).slice(0, 3);
    const future = state.records.filter(r => r.date > t && r.status !== 'done').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
    return { today, earlier, future };
  }
  function sparkline() {
    const weeks = lastWeeks(6);
    const max = Math.max(1, ...weeks.map(w => w.c));
    const W = 150, H = 46, n = weeks.length;
    const pts = weeks.map((w, i) => { const x = 8 + i * (W - 16) / (n - 1); const y = H - 6 - (w.c / max) * (H - 16); return [x, y]; });
    const line = pts.map(p => p.join(',')).join(' ');
    const bars = weeks.map((w, i) => { const x = 8 + i * (W - 16) / (n - 1); const y = H - 6 - (w.c / max) * (H - 16); return `<circle cx="${x}" cy="${y}" r="2.6" fill="${XY.C.apricot}"/>`; }).join('');
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="46"><polyline points="${line}" fill="none" stroke="${XY.C.apricot}" stroke-width="2.2" stroke-linecap="round"/><polyline points="8,${H - 6} ${line} ${8 + (W - 16)},${H - 6}" fill="${XY.C.apricot}14" stroke="none"/>${bars}</svg>`;
  }
  function lastWeeks(n, src) {
    const arr = src || state.records;
    const res = []; const ws = weekStart(todayStr());
    for (let i = n - 1; i >= 0; i--) {
      const s = addDays(ws, -7 * i); const e = addDays(s, 6);
      const c = arr.filter(r => r.status === 'done' && r.date >= s && r.date <= e).length;
      res.push({ s, e, c });
    }
    return res;
  }

  // ---------- 成长册（列表 + 筛选） ----------
  function viewLibrary() {
    return `
    <section class="library">
      <div class="filterbar" id="filterbar">
        <div class="search"><span>${ic('search')}</span><input id="searchInput" data-act="search" placeholder="搜索记录、标签或备注" value="${esc(ui.filters.q)}"></div>
        <div class="chips" id="modChips">
          <button class="chip ${!ui.filters.module ? 'on' : ''}" data-act="fmod" data-module="">全部</button>
          ${MODULE_KEYS.map(m => `<button class="chip ${ui.filters.module === m ? 'on' : ''}" data-act="fmod" data-module="${m}" style="--c:${mColor(m)}">${ic(MODULES[m].icon)}${MODULES[m].name}</button>`).join('')}
        </div>
        <div class="chips tagchips" id="tagChips">
          <button class="chip ${!ui.filters.tag ? 'on' : ''}" data-act="ftag" data-tag="">全部标签</button>
          ${state.categories.map(c => `<button class="chip ${ui.filters.tag === c ? 'on' : ''}" data-act="ftag" data-tag="${esc(c)}" style="--c:${XY.C.apricot}">${esc(c)}</button>`).join('')}
        </div>
        <div class="filter-row">
          <select data-act="fstatus" class="sel">
            <option value="">状态：全部</option>
            ${Object.values(STATUS).map(s => `<option value="${s.key}" ${ui.filters.status === s.key ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
          <select data-act="fsort" class="sel">
            <option value="date" ${ui.filters.sort === 'date' ? 'selected' : ''}>按日期（新→旧）</option>
            <option value="dateAsc" ${ui.filters.sort === 'dateAsc' ? 'selected' : ''}>按日期（旧→新）</option>
            <option value="title" ${ui.filters.sort === 'title' ? 'selected' : ''}>按标题</option>
            <option value="status" ${ui.filters.sort === 'status' ? 'selected' : ''}>按状态</option>
          </select>
          <button class="sel clearbtn ${ui.filters.tag ? 'on' : ''}" data-act="cleartag">${ui.filters.tag ? '标签：' + esc(ui.filters.tag) + ' ✕' : '标签'}</button>
        </div>
        ${ui.filters.tag ? `<div class="tagline">当前标签：<b style="color:${XY.C.apricotD}">${esc(ui.filters.tag)}</b> <button class="link" data-act="cleartag">清除</button></div>` : ''}
      </div>
      <div id="libList">${libListHTML()}</div>
    </section>`;
  }
  function filtered() {
    let arr = [...state.records];
    const f = ui.filters;
    if (f.q) { const q = f.q.toLowerCase(); arr = arr.filter(r => (r.title + r.note + r.tags.join('') + (r.fields && r.fields.book || '')).toLowerCase().includes(q)); }
    if (f.module) arr = arr.filter(r => r.module === f.module);
    if (f.status) arr = arr.filter(r => r.status === f.status);
    if (f.tag) arr = arr.filter(r => r.tags.includes(f.tag));
    if (f.sort === 'date') arr.sort((a, b) => b.date.localeCompare(a.date));
    else if (f.sort === 'dateAsc') arr.sort((a, b) => a.date.localeCompare(b.date));
    else if (f.sort === 'title') arr.sort((a, b) => a.title.localeCompare(b.title, 'zh'));
    else if (f.sort === 'status') arr.sort((a, b) => a.status.localeCompare(b.status));
    return arr;
  }
  function libListHTML() {
    const arr = filtered();
    if (!arr.length) {
      return `<div class="empty">${cov('empty')}<p>没有符合条件的记录</p><button class="btn primary" data-act="cleartag">${ui.filters.tag || ui.filters.module || ui.filters.status || ui.filters.q ? '清除筛选' : '去新增'}</button>${ui.filters.tag || ui.filters.module || ui.filters.status || ui.filters.q ? '' : '<button class="btn ghost" data-act="add">新增一条</button>'}</div>`;
    }
    return `<div class="lib-cards">${arr.map(r => libCard(r)).join('')}</div>`;
  }
  function libCard(r) {
    const img = r.coverImage ? `<img src="${r.coverImage}" alt="" onerror="this.parentNode.innerHTML=window.XY.COVERSEMPTY">` : cov(r.cover, r.fields && r.fields.book);
    const kv = cardKV(r);
    return `<article class="lib-card" data-act="detail" data-id="${r.id}">
      <div class="lib-cover">${img}<span class="lib-mod" style="background:${mColor(r.module)}">${ic(MODULES[r.module].icon)}${mName(r.module)}</span></div>
      <div class="lib-body">
        <b class="lib-title">${esc(r.title)}</b>
        <div class="lib-meta"><span class="pill" style="background:${sColor(r.status)}1a;color:${sColor(r.status)}">${sName(r.status)}</span><span class="lib-date">${esc(r.date)}</span></div>
        ${kv ? `<div class="lib-kv">${kv}</div>` : ''}
        <div class="tags">${r.tags.map(t => `<i style="background:${mColor(r.module)}1f;color:${mColor(r.module)}" data-act="ftag" data-tag="${esc(t)}">${esc(t)}</i>`).join('')}</div>
      </div>
    </article>`;
  }
  function cardKV(r) {
    const f = r.fields || {};
    if (r.module === 'body') return `<span>身高 <b>${f.height}</b> cm</span><span>体重 <b>${f.weight}</b> kg</span>`;
    if (r.module === 'study') return `<span>进度 <b>${f.progress}%</b></span><span>${esc(f.subject || '')}</span>`;
    if (r.module === 'hobby') return `<span>${esc(f.schedule || '')}</span><span>剩余 <b>${f.lessonsLeft}</b> 节</span>`;
    if (r.module === 'items') return `<span>已购 <b>${f.bought}/${f.total}</b></span>`;
    if (r.module === 'reading') return `<span>${esc(f.book || '')}</span><span>${f.pages} 页</span>`;
    if (r.module === 'routine') return `<span>${esc(f.time || '')}</span><span>${esc(f.repeat || '')}</span>`;
    if (r.module === 'family') return `<span>${esc(f.place || '')}</span><span>${esc(f.with || '')}</span>`;
    if (r.module === 'growth') {
      if (f.htype === 'temp') return `<span>体温 ${esc(f.temp || '')}℃</span><span>${esc(f.symptom || '症状未填')}</span>`;
      if (f.htype === 'med') return `<span>${esc(f.medicine || '')}</span><span>${[f.dose, f.freq].filter(Boolean).map(esc).join(' ')}</span>`;
      if (f.htype === 'visit') return `<span>${esc(f.hospital || '')}</span><span>${[f.dept, f.diag].filter(Boolean).map(esc).join(' ')}</span>`;
      return `<span>${esc(f.type || '')}</span><span>${esc(f.age || '')}</span>`;
    }
    return '';
  }

  // ---------- 详情 ----------
  function viewDetail(id) {
    const r = byId(id); if (!r) return viewLibrary();
    const img = r.coverImage ? `<img class="detail-cover-img" src="${r.coverImage}" alt="" onerror="this.parentNode.innerHTML=window.XY.COVERSEMPTY">` : cov(r.cover, r.fields && r.fields.book);
    const related = (r.related || []).map(byId).filter(Boolean);
    const media = r.media || [];
    return `
    <section class="detail">
      <div class="detail-cover">${img}
        <span class="lib-mod" style="background:${mColor(r.module)}">${ic(MODULES[r.module].icon)}${mName(r.module)}</span>
        ${r.reminder ? `<button class="remind-flag" data-act="noop">${ic('bell')} ${esc(r.reminder.next)} · ${esc(r.reminder.text)}</button>` : ''}
      </div>
      <div class="detail-head">
        <h2>${esc(r.title)}</h2>
        <div class="lib-meta"><span class="pill" style="background:${sColor(r.status)}1a;color:${sColor(r.status)}">${sName(r.status)}</span><span class="lib-date">${esc(r.date)}</span></div>
        <div class="tags">${r.tags.map(t => `<i style="background:${mColor(r.module)}1f;color:${mColor(r.module)}" data-act="ftag" data-tag="${esc(t)}">${esc(t)}</i>`).join('')}</div>
      </div>

      <div class="fields">
        ${fieldRows(r).map(fr => `<div class="frow"><span>${esc(fr.k)}</span><b>${fr.v}</b></div>`).join('')}
        ${r.note ? `<div class="frow note"><span>备注</span><b>${esc(r.note)}</b></div>` : ''}
      </div>

      ${r.module === 'body' ? `<div class="sec"><div class="sec-h"><b>成长曲线</b><span class="sec-sub">WHO 百分位</span></div>${growthChart('height')}${r.fields && r.fields.weight ? growthChart('weight') : ''}</div>` : ''}

      ${media.length ? `<div class="sec"><div class="sec-h"><b>媒体</b></div><div class="media-grid">${media.map((m, i) => `<button class="media-th" data-act="media" data-id="${r.id}" data-idx="${i}">${m.type === 'image' ? (m.data ? `<img src="${m.data}" alt="">` : cov(m.cover || r.cover, r.fields && r.fields.book)) : ic('img')}</button>`).join('')}</div></div>` : ''}

      ${related.length ? `<div class="sec"><div class="sec-h"><b>关联记录</b></div>${related.map(rr => `<button class="mini-row" data-act="detail" data-id="${rr.id}"><span class="dot" style="background:${mColor(rr.module)}"></span><span class="mini-tx"><b>${esc(rr.title)}</b><small>${mName(rr.module)}</small></span></button>`).join('')}</div>` : ''}

      ${r.activities && r.activities.length ? `<div class="sec"><div class="sec-h"><b>活动记录</b></div><div class="timeline">${r.activities.slice().reverse().map(a => `<div class="tl"><span class="tl-dot"></span><div><b>${esc(a.date)}</b><p>${esc(a.text)}</p></div></div>`).join('')}</div></div>` : ''}

      <div class="detail-actions">
        <button class="btn ${r.status === 'done' ? 'ghost' : 'primary'}" data-act="toggle" data-id="${r.id}">${r.status === 'done' ? ic('refresh') + ' 标记为进行中' : ic('check') + ' 完成'}</button>
        ${(r.module === 'study' || r.module === 'reading') ? `<button class="btn ghost" data-act="timer" data-id="${r.id}">${ic('timer')} 开始专注</button>` : ''}
        <div class="row2">
          <button class="btn ghost" data-act="edit" data-id="${r.id}">${ic('edit')} 编辑</button>
          <button class="btn danger" data-act="del" data-id="${r.id}">${ic('trash')} 删除</button>
        </div>
      </div>
    </section>`;
  }
  function fieldRows(r) {
    const f = r.fields || {}; const out = [];
    const map = {
      reading: [['书名', f.book], ['作者', f.author], ['页数', f.pages ? f.pages + ' 页' : ''], ['共读时长', f.minutes ? f.minutes + ' 分钟' : '']],
      study: [['科目', f.subject], ['目标', f.goal], ['进度', f.progress != null ? f.progress + '%' : ''], ['方式', f.method]],
      growth: [['类型', f.type], ['年龄', f.age], ['地点', f.place]],
      body: [['身高', f.height ? f.height + ' cm' : ''], ['体重', f.weight ? f.weight + ' kg' : ''], ['BMI', f.bmi], ['地点', f.place]],
      hobby: [['排课', f.schedule], ['老师', f.coach], ['剩余课时', f.lessonsLeft != null ? f.lessonsLeft + ' 节' : ''], ['地点', f.place]],
      family: [['地点', f.place], ['同行', f.with], ['心情', f.mood], ['时长', f.hours ? f.hours + ' 小时' : '']],
      routine: [['时间', f.time], ['频率', f.repeat], ['步骤', f.steps ? f.steps.join(' → ') : '']],
      items: [['进度', f.total ? `已购 ${f.bought}/${f.total}` : ''], ['清单', f.list ? f.list.map(x => (x.done ? '✔' : '○') + x.name).join('、') : '']]
    };
    (map[r.module] || []).forEach(([k, v]) => { if (v) out.push({ k, v: esc(v) }); });
    return out;
  }

  // ---------- 新增向导（三步） ----------
  function viewWizard() {
    if (!ui.wizard) ui.wizard = { step: 1, module: '', title: '', date: todayStr(), status: 'doing', tags: [], note: '', fields: {}, media: [], cover: '' };
    const w = ui.wizard;
    if (w.step === 1) {
      return `<section class="wizard">
        <div class="ws-step"><span class="on">1</span><i></i><span>2</span><i></i><span>3</span></div>
        <h3>选一个记录类型</h3>
        <p class="ws-tip">想记点什么？先选一个场景</p>
        <div class="mod-grid">${MODULE_KEYS.map(m => `<button class="mod-pick ${w.module === m ? 'on' : ''}" data-act="wpick" data-module="${m}" style="--c:${mColor(m)}">${ic(MODULES[m].icon)}<b>${MODULES[m].name}</b><small>${MODULES[m].desc}</small></button>`).join('')}</div>
        <div class="wizard-foot"><button class="btn ghost" data-act="wcancel">取消</button></div>
      </section>`;
    }
    if (w.step === 2) {
      const fm = moduleForm(w.module, w);
      return `<section class="wizard">
        <div class="ws-step"><span class="ok">✓</span><i></i><span class="on">2</span><i></i><span>3</span></div>
        <h3>${MODULES[w.module].name} · 填写核心信息</h3>
        <div class="form">
          <label class="fld"><span>标题</span><input data-bind="title" value="${esc(w.title)}" placeholder="例如：周末植物园认植物"></label>
          <label class="fld"><span>日期</span><input type="date" data-bind="date" value="${esc(w.date)}"></label>
          <label class="fld"><span>状态</span><select data-bind="status"><option value="doing" ${w.status==='doing'?'selected':''}>进行中</option><option value="todo" ${w.status==='todo'?'selected':''}>待办</option><option value="done" ${w.status==='done'?'selected':''}>已完成</option><option value="pause" ${w.status==='pause'?'selected':''}>暂停</option></select></label>
          <div class="fld"><span>标签（可多选）</span><div class="tagpick" id="tagpick">${state.categories.map(c => `<button type="button" class="${w.tags.includes(c)?'on':''}" data-act="wtag" data-tag="${esc(c)}" style="--c:${mColor(w.module)}">${c}</button>`).join('')}</div></div>
          ${fm}
          <label class="fld"><span>备注</span><textarea data-bind="note" placeholder="记一句当时的样子…">${esc(w.note)}</textarea></label>
        </div>
        <div class="wizard-foot">
          <button class="btn ghost" data-act="wstep" data-step="1">上一步</button>
          <button class="btn primary" data-act="wstep" data-step="3">下一步</button>
        </div>
      </section>`;
    }
    // step 3
    return `<section class="wizard">
      <div class="ws-step"><span class="ok">✓</span><i></i><span class="ok">✓</span><i></i><span class="on">3</span></div>
      <h3>上传媒体并确认</h3>
      <div class="uploader">
        <label class="upload-box">
          <input type="file" accept="image/*" data-act="upload" multiple hidden>
          ${ic('upload')}<span>添加照片</span><small>孩子作品 / 阅读封面 / 亲子瞬间</small>
        </label>
        <div class="up-list" id="upList">${w.media.map((m, i) => `<div class="up-item">${m.data ? `<img src="${m.data}">` : cov(m.cover || w.cover)}<button data-act="updel" data-idx="${i}">${ic('close')}</button></div>`).join('')}</div>
      </div>
      <div class="confirm-card">
        <b>${esc(w.title || '未命名记录')}</b>
        <span>${mName(w.module)} · ${esc(w.date)} · ${sName(w.status)}</span>
        <div class="tags">${w.tags.map(t => `<i style="background:${mColor(w.module)}1f;color:${mColor(w.module)}">${esc(t)}</i>`).join('')}</div>
      </div>
      <div class="wizard-foot">
        <button class="btn ghost" data-act="wstep" data-step="2">上一步</button>
        <button class="btn primary" data-act="wconfirm">保存记录</button>
      </div>
    </section>`;
  }
  const NUM_SPEC = {
    pages: { min: 0, max: 2000, unit: '页' }, minutes: { min: 0, max: 600, unit: '分钟' },
    progress: { min: 0, max: 100, unit: '%' }, height: { min: 30, max: 250, unit: 'cm' },
    weight: { min: 2, max: 200, unit: 'kg' }, lessonsLeft: { min: 0, max: 200, unit: '节' },
    hours: { min: 0, max: 72, unit: '小时' }, total: { min: 0, max: 500, unit: '件' }, bought: { min: 0, max: 500, unit: '件' }
  };
  function moduleForm(module, w) {
    const f = w.fields || {}; const set = (k, v) => { w.fields[k] = v; };
    const bind = (k) => `data-fbind="${k}"`;
    const inp = (k, label, ph, val) => {
      const spec = NUM_SPEC[k];
      const attrs = spec ? `type="number" inputmode="decimal" step="0.1" data-fnum="1" data-min="${spec.min}" data-max="${spec.max}"` : '';
      return `<label class="fld"><span>${label}</span><input ${bind(k)} ${attrs} value="${esc(val == null ? '' : val)}" placeholder="${ph || ''}"><span class="ferr" data-ferr="${k}"></span></label>`;
    };
    if (module === 'reading') return inp('book', '书名', '好饿的毛毛虫') + inp('author', '作者', '艾瑞克·卡尔') + inp('pages', '页数', '26') + inp('minutes', '共读时长(分钟)', '15');
    if (module === 'study') return inp('subject', '科目', '认知启蒙') + inp('goal', '目标', '认识颜色与形状') + inp('progress', '进度(%)', '0') + inp('method', '方式', '生活游戏');
    if (module === 'growth') return inp('type', '类型', '自理能力') + inp('age', '年龄', '4岁3个月') + inp('place', '地点', '家里') + `<div class="fld"><span>里程碑模板（点一下填入）</span><div class="tagpick">${MILESTONES.map(m => `<button type="button" data-act="msTpl" data-title="${esc(m)}">${esc(m)}</button>`).join('')}</div></div>`;
    if (module === 'body') return inp('height', '身高(cm)', '105.3') + inp('weight', '体重(kg)', '16.8') + inp('place', '地点', '社区医院');
    if (module === 'hobby') return inp('schedule', '排课', '每周六 10:00') + inp('coach', '老师', '王教练') + inp('lessonsLeft', '剩余课时', '6') + inp('place', '地点', '运动馆');
    if (module === 'family') return inp('place', '地点', '植物园') + inp('with', '同行', '妈妈') + inp('mood', '心情', '开心') + inp('hours', '时长(小时)', '3');
    if (module === 'routine') return inp('time', '时间', '20:30') + inp('repeat', '频率', '每天') + inp('steps', '步骤(用、分隔)', '洗漱、故事、关灯');
    if (module === 'items') return inp('total', '物品总数', '5') + inp('bought', '已购数', '0') + inp('list', '清单(用、分隔)', '水杯、汗巾、替换衣');
    return '';
  }

  // ---------- 编辑（复用向导结构） ----------
  function viewEdit(id) {
    const r = byId(id); if (!r) return viewLibrary();
    ui.wizard = { step: 2, id, module: r.module, title: r.title, date: r.date, status: r.status, tags: [...r.tags], note: r.note || '', fields: JSON.parse(JSON.stringify(r.fields || {})), media: (r.media || []).map(m => ({ ...m })), cover: r.cover, edit: true };
    const w = ui.wizard;
    const fm = moduleForm(w.module, w);
    return `<section class="wizard">
      <h3>${MODULES[w.module].name} · 编辑</h3>
      <div class="form">
        <label class="fld"><span>标题</span><input data-bind="title" value="${esc(w.title)}"></label>
        <label class="fld"><span>日期</span><input type="date" data-bind="date" value="${esc(w.date)}"></label>
        <label class="fld"><span>状态</span><select data-bind="status">${Object.values(STATUS).map(s => `<option value="${s.key}" ${w.status===s.key?'selected':''}>${s.name}</option>`).join('')}</select></label>
        <div class="fld"><span>标签（可多选）</span><div class="tagpick">${state.categories.map(c => `<button type="button" class="${w.tags.includes(c)?'on':''}" data-act="wtag" data-tag="${esc(c)}" style="--c:${mColor(w.module)}">${c}</button>`).join('')}</div></div>
        ${fm}
        <label class="fld"><span>备注</span><textarea data-bind="note">${esc(w.note)}</textarea></label>
      </div>
      <div class="uploader">
        <label class="upload-box"><input type="file" accept="image/*" data-act="upload" multiple hidden>${ic('upload')}<span>管理照片</span></label>
        <div class="up-list">${w.media.map((m, i) => `<div class="up-item">${m.data ? `<img src="${m.data}">` : cov(m.cover || w.cover)}<button data-act="updel" data-idx="${i}">${ic('close')}</button></div>`).join('')}</div>
      </div>
      <div class="wizard-foot">
        <button class="btn ghost" data-act="wcancel">取消</button>
        <button class="btn primary" data-act="wconfirm">保存修改</button>
      </div>
    </section>`;
  }

  // ---------- 日历 ----------
  function shiftMonth(ym, delta) {
    let [y, m] = ym.split('-').map(Number); m += delta; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; }
    return y + '-' + String(m).padStart(2, '0');
  }
  function viewCalendar() {
    const [y, mo] = ui.calMonth.split('-').map(Number);
    const first = new Date(y, mo - 1, 1), startDay = (first.getDay() + 6) % 7;
    const daysIn = new Date(y, mo, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysIn; d++) cells.push(d);
    const byDate = {};
    state.records.forEach(r => { (byDate[r.date] = byDate[r.date] || []).push(r); });
    const today = todayStr();
    const monthStr = ui.calMonth;
    return `<section class="cal">
      <div class="cal-head">
        <button class="cal-nav" data-act="calPrev" aria-label="上个月">‹</button>
        <b>${y} 年 ${mo} 月</b>
        <button class="cal-nav" data-act="calNext" aria-label="下个月">›</button>
        <button class="cal-today" data-act="calToday">回到本月</button>
      </div>
      <div class="cal-grid cal-week"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div>
      <div class="cal-grid">${cells.map(d => {
        if (d == null) return `<span class="cal-cell empty"></span>`;
        const ds = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const recs = byDate[ds] || [];
        const isToday = ds === today;
        const colors = recs.map(r => mColor(r.module));
        return `<button class="cal-cell ${isToday ? 'today' : ''} ${recs.length ? 'has' : ''}" data-act="day" data-date="${ds}">
          <b>${d}</b>${recs.length ? `<span class="cal-dots">${recs.slice(0, 3).map((r, i) => `<i style="background:${colors[i]}"></i>`).join('')}</span>` : ''}</button>`;
      }).join('')}</div>
      <div class="cal-legend">${MODULE_KEYS.slice(0, 6).map(m => `<span><i style="background:${mColor(m)}"></i>${MODULES[m].name}</span>`).join('')}</div>
      <div class="sec"><div class="sec-h"><b>今日与临近</b></div>${todayItems().concat(upcoming()).slice(0, 4).map(r => miniRow(r)).join('') || '<div class="empty sm">暂无安排</div>'}</div>
      ${heatmap()}
    </section>`;
  }

  // ---------- 洞察 ----------
  function scopeRecords() {
    let arr = [...state.records]; const s = ui.scope;
    if (s.type === 'week') { const ws = weekStart(todayStr()); arr = arr.filter(r => r.date >= ws); }
    else if (s.type === 'month') { const t = todayStr(); arr = arr.filter(r => r.date.slice(0, 7) === t.slice(0, 7)); }
    else if (s.type === 'custom') { const f = s.from || '0000-01-01', to = s.to || '9999-12-31'; arr = arr.filter(r => r.date >= f && r.date <= to); }
    return arr;
  }
  function viewInsights() {
    const sc = scopeRecords();
    const weeks = lastWeeks(6, sc);
    const scTotal = sc.length, scDone = sc.filter(r => r.status === 'done').length, scRate = scTotal ? Math.round(scDone / scTotal * 100) : 0;
    const scopeLabel = { all: '全部记录', week: '本周', month: '本月', custom: (ui.scope.from + ' ~ ' + ui.scope.to) }[ui.scope.type];
    const rec = sc.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    const max = Math.max(1, ...weeks.map(w => w.c));
    const W = 300, H = 120, n = weeks.length, pad = 24;
    const x = i => pad + i * (W - pad * 2) / (n - 1);
    const y = c => H - 18 - (c / max) * (H - 40);
    const bars = weeks.map((w, i) => `<rect x="${x(i) - 12}" y="${y(w.c)}" width="24" height="${H - 18 - y(w.c)}" rx="5" fill="${XY.C.apricot}" opacity="${0.55 + 0.45 * i / (n - 1)}"/><text x="${x(i)}" y="${y(w.c) - 5}" text-anchor="middle" font-size="10" fill="${XY.C.apricotD}">${w.c}</text><text x="${x(i)}" y="${H - 4}" text-anchor="middle" font-size="9" fill="${XY.C.inkS}">${w.s.slice(5)}</text>`).join('');
    // donut（随范围联动）
    const counts = MODULE_KEYS.map(m => ({ m, c: sc.filter(r => r.module === m).length }));
    const total = counts.reduce((a, b) => a + b.c, 0) || 1;
    let ang = -Math.PI / 2; const R = 52, cx = 70, cy = 70;
    const arcs = counts.map(({ m, c }) => { const a2 = ang + c / total * Math.PI * 2; const large = (a2 - ang) > Math.PI ? 1 : 0; const x1 = cx + R * Math.cos(ang), y1 = cy + R * Math.sin(ang), x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2); ang = a2; if (c === 0) return ''; return `<path d="M${cx} ${cy} L${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} Z" fill="${mColor(m)}"/>`; }).join('');
    const donut = `<svg viewBox="0 0 140 140" width="140" height="140"><circle cx="70" cy="70" r="${R}" fill="none" stroke="${XY.C.cream}" stroke-width="22"/>${arcs}<text x="70" y="66" text-anchor="middle" font-size="20" font-weight="800" fill="${XY.C.ink}">${total}</text><text x="70" y="82" text-anchor="middle" font-size="9" fill="${XY.C.inkS}">条记录</text></svg>`;
    const legend = counts.map(({ m, c }) => `<span><i style="background:${mColor(m)}"></i>${MODULES[m].name} <b>${c}</b></span>`).join('');
    const sug = suggestions();
    return `<section class="insights">
      ${weeklyDigest()}
      <div class="seg">
        <button class="${ui.scope.type === 'all' ? 'on' : ''}" data-act="scope" data-type="all">全部</button>
        <button class="${ui.scope.type === 'week' ? 'on' : ''}" data-act="scope" data-type="week">本周</button>
        <button class="${ui.scope.type === 'month' ? 'on' : ''}" data-act="scope" data-type="month">本月</button>
        <button class="${ui.scope.type === 'custom' ? 'on' : ''}" data-act="scope" data-type="custom">自定义</button>
      </div>
      ${ui.scope.type === 'custom' ? `<div class="filter-row custom-range"><input type="date" class="sel" data-act="scopeFrom" value="${ui.scope.from}"><span class="rangeto">至</span><input type="date" class="sel" data-act="scopeTo" value="${ui.scope.to}"><button class="sel clearbtn" data-act="scopeApply">查看</button></div>` : ''}
      <div class="card big-stat"><span class="stat-cap">完成率 · ${esc(scopeLabel)}</span><b class="stat-num">${scRate}<small>%</small></b><span class="stat-sub">${scDone} / ${scTotal} 条已完成</span></div>

      <div class="card">
        <div class="card-h"><b>完成趋势（近 6 周）</b></div>
        <svg viewBox="0 0 ${W} ${H}" width="100%" height="120">${bars}</svg>
        <p class="src">数据来源：${esc(scopeLabel)}已完成记录，共 ${scDone} 条（截至 ${todayStr()}）</p>
      </div>

      <div class="card">
        <div class="card-h"><b>分类占比</b></div>
        <div class="donut-row">${donut}<div class="legend">${legend}</div></div>
        <p class="src">数据来源：${esc(scopeLabel)}共 ${total} 条记录按模块统计</p>
      </div>

      <div class="card">
        <div class="card-h"><b>近期变化</b></div>
        <div class="timeline">${rec.map(r => `<div class="tl"><span class="tl-dot" style="background:${mColor(r.module)}"></span><div><b>${esc(r.date)} · ${esc(r.title)}</b><p>${sName(r.status)} · ${mName(r.module)}</p></div></div>`).join('')}</div>
      </div>

      <div class="card suggest">
        <div class="card-h"><b>给你的小建议</b></div>
        ${sug.map(s => `<div class="sug"><span>${ic('leaf')}</span><p>${esc(s)}</p></div>`).join('')}
      </div>

      <div class="card">
        <div class="card-h"><b>生长曲线（身高）</b><span class="sec-more" data-act="nav" data-view="library">记录 ${ic('chevR')}</span></div>
        ${growthChart('height')}
      </div>
    </section>`;
  }
  function suggestions() {
    const out = [];
    const items = state.records.find(r => r.module === 'items');
    if (items && items.fields.total - items.fields.bought > 0) out.push(`入园物品还差 ${items.fields.total - items.fields.bought} 件，这周挑个时间补齐吧。`);
    const famMonth = state.records.filter(r => r.module === 'family' && r.status === 'done' && r.date >= todayStr().slice(0, 7) + '-01').length;
    if (famMonth < 2) out.push('这个月亲子活动还不算多，周末安排一次户外，成长树会更茂盛。');
    const readDoing = state.records.find(r => r.module === 'reading' && r.status === 'doing');
    if (readDoing) out.push(`今晚继续《${readDoing.fields.book}》睡前共读，把 21 天打卡稳稳接上。`);
    const todayR = state.records.find(r => r.reminder && r.reminder.next === todayStr());
    if (todayR) out.push(`今天有提醒：${todayR.reminder.text}`);
    if (!out.length) out.push('最近记录很丰富，保持节奏就好。');
    return out;
  }

  // ---------- 相册 ----------
  function viewAlbum() {
    const items = [];
    state.records.forEach(r => {
      (r.media || []).forEach((m, i) => { if (m.type === 'image') items.push({ rec: r, m, i }); });
    });
    // 没有上传媒体的记录用插画封面补一些“主题图”
    state.records.forEach(r => {
      if (!r.media || !r.media.length) items.push({ rec: r, m: { cover: r.cover, caption: r.title }, i: -1, ill: true });
    });
    items.sort((a, b) => b.rec.date.localeCompare(a.rec.date));
    const groups = {};
    items.forEach(it => { const ym = it.rec.date.slice(0, 7); (groups[ym] = groups[ym] || []).push(it); });
    const months = Object.keys(groups).sort().reverse();
    const grid = (arr) => `<div class="album-grid">${arr.map((it) => {
      const thumb = it.m.data ? `<img src="${it.m.data}" alt="">` : cov(it.m.cover || it.rec.cover, it.rec.fields && it.rec.fields.book);
      return `<button class="album-th" data-act="media" data-id="${it.rec.id}" data-idx="${it.i}" data-ill="${it.ill ? 1 : 0}">${thumb}<span class="album-cap">${esc(it.m.caption || it.rec.title)}</span></button>`;
    }).join('')}</div>`;
    return `<section class="album">
      <div class="sec"><div class="sec-h"><b>成长相册</b><span class="sec-more">${items.length} 张</span></div>
      ${months.map(ym => {
        const [yy, mm] = ym.split('-'); const label = yy + '年' + (+mm) + '月';
        const collapsed = ui.albumCollapsed && ui.albumCollapsed[ym];
        return `<div class="alb-month">
          <button class="alb-month-h" data-act="albumbtn" data-month="${ym}">${ic(collapsed ? 'chevR' : 'chevD')}<b>${label}</b><span>${groups[ym].length} 张</span></button>
          ${collapsed ? '' : grid(groups[ym])}
        </div>`;
      }).join('')}
      ${!items.length ? `<div class="empty">${cov('empty')}<p>还没有照片，去记录里上传吧</p></div>` : ''}
      </div>
    </section>`;
  }

  // ---------- 设置 ----------
  function viewSettings() {
    const s = state.settings;
    return `<section class="settings">
      <div class="card profile">
        <div class="profile-ic">${XY.appIcon(56)}</div>
        <div><b>${esc(s.parentName)} 的家</b><small>孩子：${esc(s.childName)} · ${childAge(s.childBirth)}</small>
        <small>生日 ${esc(s.childBirth)}</small></div>
      </div>

      <div class="card">
        <div class="card-h"><b>提醒设置</b></div>
        <label class="switch-row">${ic('bell')}<span>早晨成长提醒</span><input type="checkbox" data-act="remind" data-key="remindMorning" ${s.remindMorning ? 'checked' : ''}><span class="sw"></span></label>
        <label class="switch-row">${ic('bell')}<span>晚间共读提醒</span><input type="checkbox" data-act="remind" data-key="remindEvening" ${s.remindEvening ? 'checked' : ''}><span class="sw"></span></label>
      </div>

      <div class="card">
        <div class="card-h"><b>我的分类</b><span class="sec-more link" data-act="addcat">+ 新增</span></div>
        <div class="tagpick" id="catpick">${state.categories.map(c => `<button class="cat-chip" data-act="delcat" data-cat="${esc(c)}">${esc(c)} ${ic('close')}</button>`).join('')}</div>
        <p class="src">新增分类后，筛选、统计图例与新增表单会同步出现。</p>
      </div>

      <div class="card">
        <div class="card-h"><b>成长激励</b></div>
        <button class="line-btn" data-act="rewards">${ic('coin')} 奖励中心 · 小芽积分（${state.points || 0}）</button>
        <p class="src">完成记录会积累小芽积分，攒够就能兑换苗苗的小心愿。</p>
      </div>

      <div class="card">
        <div class="card-h"><b>数据</b></div>
        <button class="line-btn" data-act="export">${ic('download')} 导出全部数据（JSON）</button>
        <button class="line-btn" data-act="import">${ic('upload')} 从备份文件恢复数据（JSON）</button>
        <button class="line-btn" data-act="report">${ic('trophy')} 查看阶段报告</button>
        <button class="line-btn danger" data-act="reset">${ic('refresh')} 恢复示例数据</button>
        <input type="file" id="importFile" accept="application/json,.json" style="display:none">
        <p class="src">数据保存在本机浏览器（localStorage），不会上传。换设备/清缓存前请先「导出全部数据」备份；导出的 JSON 也可放进本地 git 仓库（双击 git-sync.bat）长期保存。</p>
      </div>

      <div class="card gh">
        <div class="card-h"><b>GitHub 同步</b><span class="sec-more link" data-act="ghClear">清除凭据</span></div>
        <p class="src warn">⚠️ 此功能会把 Personal Access Token 保存在本机浏览器。仅在私人设备上使用，公用设备请勿填写；用完可在 GitHub 撤销该令牌。</p>
        <div class="fld"><span>仓库地址</span><input class="inp" data-act="ghRepo" placeholder="https://github.com/owner/repo.git" value="${esc(ghConfig().repo || '')}"></div>
        <div class="fld"><span>访问令牌 PAT</span><input class="inp" type="password" data-act="ghToken" placeholder="ghp_..." value="${esc(ghConfig().token || '')}"></div>
        <div class="row2">
          <button class="btn ghost" data-act="ghSave">保存配置</button>
          <button class="btn primary" data-act="ghPush">${ic('github')} 推送到 GitHub</button>
        </div>
        <p class="src err" id="ghStatus"></p>
      </div>

      <div class="card about">
        <div class="brand-center">${XY.logo(40)}<b>小芽</b></div>
        <p>把孩子的每一次长大，温柔记下来。</p>
        <small>v1.0 · 个人工作台</small>
      </div>
    </section>`;
  }

  function viewReport() {
    const a = state.achievements;
    const leaves = state.treeLeaves;
    const totalDone = doneCount();
    return `<section class="report">
      <div class="report-hero">${cov('tree', leaves)}<div><b>苗苗的成长阶段报告</b><small>截至 ${todayStr()}</small></div></div>
      <div class="grid2">
        <div class="card stat-big"><span class="stat-cap">已完成</span><b class="stat-num">${totalDone}<small>条</small></b></div>
        <div class="card stat-big"><span class="stat-cap">成长树</span><b class="stat-num">${leaves}<small>叶</small></b></div>
      </div>
      <div class="card"><div class="card-h"><b>阶段成果</b></div>
        ${a.length ? a.map(x => `<div class="ach-line">${ic(x.icon)}<div><b>${esc(x.title)}</b><p>${esc(x.text)}</p><small>${esc(x.date)}</small></div></div>`).join('') : '<p class="src">继续完成亲子活动，就能解锁第一张成果卡。</p>'}
      </div>
      <div class="card"><div class="card-h"><b>怎么获得更多叶子</b></div>
        <p class="src">每完成一项「亲子活动」，成长树就会长出一片新叶，并生成一张鼓励卡。已完成 ${state.records.filter(r=>r.module==='family'&&r.status==='done').length} 项亲子活动。</p>
      </div>
      <button class="btn ghost" data-act="nav" data-view="home">回到首页</button>
    </section>`;
  }

  // ---------- 奖励中心（积分闭环） ----------
  function viewRewards() {
    const bal = state.points || 0;
    const log = (state.pointLog || []).slice(0, 12);
    return `<section class="rewards">
      <div class="reward-hero">
        <div class="reward-tree">${cov('tree', state.treeLeaves)}</div>
        <div class="reward-bal">
          <span class="stat-cap">小芽积分</span>
          <b class="stat-num">${bal}<small>分</small></b>
          <span class="stat-sub">完成记录就会积累，攒够去兑换苗苗的小心愿</span>
        </div>
      </div>
      <div class="card leaf-prog">
        <div class="card-h"><b>成长树进度</b></div>
        ${leafProgressHtml()}
      </div>
      <div class="card">
        <div class="card-h"><b>心愿兑换</b><span class="sec-more">苗苗的努力看得见</span></div>
        <div class="reward-list">
          ${REWARDS.map(w => {
            const can = bal >= w.cost;
            return `<div class="reward-item ${can ? '' : 'no'}">
              <span class="reward-ic" style="background:${XY.C.apricot}1f;color:${XY.C.apricotD}">${ic(w.icon)}</span>
              <div class="reward-tx"><b>${esc(w.title)}</b><small>需要 ${w.cost} 分</small></div>
              <button class="btn ${can ? 'primary' : 'ghost'}" data-act="redeem" data-id="${w.id}" ${can ? '' : 'disabled'}>${can ? '兑换' : '还差' + (w.cost - bal)}</button>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-h"><b>积分流水</b></div>
        ${log.length ? `<div class="pt-log">${log.map(l => `<div class="pt-row"><span class="dot" style="background:${l.delta >= 0 ? XY.C.leaf : XY.C.berry}"></span><div class="pt-tx"><b>${esc(l.text)}</b><small>${esc(l.date)}</small></div><b class="pt-d ${l.delta >= 0 ? 'plus' : 'minus'}">${l.delta >= 0 ? '+' : ''}${l.delta}</b></div>`).join('')}</div>` : '<p class="src">完成记录后这里会显示积分变化。</p>'}
      </div>
      <button class="btn ghost" data-act="nav" data-view="home">回到首页</button>
    </section>`;
  }
  function awardPoints(r) {
    const v = POINTS[r.module] || 0; if (!v) return;
    state.points = (state.points || 0) + v;
    state.pointLog = state.pointLog || [];
    state.pointLog.unshift({ date: todayStr(), text: '完成：' + r.title, delta: v });
    if (state.pointLog.length > 60) state.pointLog.length = 60;
    save();
  }
  function leafProgressHtml() {
    const pts = state.points || 0;
    const into = pts % LEAF_PER_POINTS;
    const rem = into === 0 ? LEAF_PER_POINTS : LEAF_PER_POINTS - into;
    const pct = Math.round(into / LEAF_PER_POINTS * 100);
    return `<div class="leaf-row"><span>🌿 已有 ${state.treeLeaves} 片叶</span><span>每 ${LEAF_PER_POINTS} 分长一片</span></div>
      <div class="leaf-bar"><i style="width:${pct}%"></i></div>
      <p class="src">再完成记录攒 ${rem} 分，成长树就会长出一片新叶～</p>`;
  }
  function redeemReward(id) {
    const w = REWARDS.find(x => x.id === id); if (!w) return;
    const bal = state.points || 0;
    if (bal < w.cost) { toast('积分还不够，先去完成几项记录吧', 'warn'); return; }
    state.points = bal - w.cost;
    state.pointLog = state.pointLog || [];
    state.pointLog.unshift({ date: todayStr(), text: '兑换心愿：' + w.title, delta: -w.cost });
    save();
    toast('兑换成功！记得兑现对苗苗的承诺 🎁');
    render();
  }

  // ---------- 成长曲线（WHO 百分位） ----------
  function childMonthsAt(dateStr) {
    const b = parse(state.settings.childBirth), d = parse(dateStr);
    let m = (d.getFullYear() - b.getFullYear()) * 12 + (d.getMonth() - b.getMonth());
    m += (d.getDate() - b.getDate()) / 30.4375;
    return Math.max(0, +m.toFixed(1));
  }
  function pctAt(table, ageMonths) {
    // 返回该月龄的 [P3,P15,P50,P85,P97]（线性插值）
    const t = table;
    if (ageMonths <= t[0][0]) return t[0].slice(1);
    if (ageMonths >= t[t.length - 1][0]) return t[t.length - 1].slice(1);
    for (let i = 0; i < t.length - 1; i++) {
      if (ageMonths >= t[i][0] && ageMonths <= t[i + 1][0]) {
        const f = (ageMonths - t[i][0]) / (t[i + 1][0] - t[i][0]);
        return [1, 2, 3, 4, 5].map(k => +(t[i][k] + (t[i + 1][k] - t[i][k]) * f).toFixed(2));
      }
    }
    return t[t.length - 1].slice(1);
  }
  function childPercentile(table, ageMonths, value) {
    const p = pctAt(table, ageMonths);
    if (value <= p[0]) return { pct: 3, label: '低于 P3' };
    if (value >= p[4]) return { pct: 97, label: '高于 P97' };
    // 在 P3..P97 之间按段线性估百分位
    const seg = value <= p[1] ? [p[0], p[1], 3, 15] : value <= p[2] ? [p[1], p[2], 15, 50] : value <= p[3] ? [p[2], p[3], 50, 85] : [p[3], p[4], 85, 97];
    const [lo, hi, plo, phi] = seg;
    const pct = lo === hi ? phi : Math.round(plo + (value - lo) / (hi - lo) * (phi - plo));
    return { pct, label: '约 P' + pct };
  }
  function growthChart(metric) {
    const table = metric === 'height' ? WHO_H : WHO_W;
    const unit = metric === 'height' ? 'cm' : 'kg';
    const pts = state.records.filter(r => r.module === 'body' && r.fields && r.fields[metric]).map(r => ({ age: childMonthsAt(r.date), v: r.fields[metric], date: r.date }));
    const W = 320, H = 170, padL = 30, padR = 12, padT = 12, padB = 24;
    const ageMax = 72, vMax = metric === 'height' ? 125 : 26, vMin = metric === 'height' ? 40 : 2;
    const X = a => padL + a / ageMax * (W - padL - padR);
    const Y = v => H - padB - (v - vMin) / (vMax - vMin) * (H - padT - padB);
    const colors = ['#E7D3B0', '#D9C19A', XY.C.apricot, '#D9C19A', '#E7D3B0'];
    const curves = table.map((row, ri) => {
      const path = row.slice(1).map((val, ki) => {
        const x = X(row[0]), y = Y(val);
        return (ki === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
      }).join(' ');
      const idx = ri === 0 ? 0 : ri === table.length - 1 ? 4 : (ri < table.length / 2 ? 1 : 3);
      return `<path d="${path}" fill="none" stroke="${colors[idx]}" stroke-width="${idx === 2 ? 2.4 : 1.4}" ${idx === 2 ? 'stroke-dasharray="5 4"' : ''} opacity=".9"/>`;
    }).join('');
    const dots = pts.map(p => `<circle cx="${X(p.age).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="4.5" fill="${XY.C.berry}" stroke="#fff" stroke-width="1.6"><title>${p.date} · ${p.v}${unit}（${childMonthsAt(p.date).toFixed(0)}个月）</title></circle>`).join('');
    const last = pts.length ? pts[pts.length - 1] : null;
    const pc = last ? childPercentile(table, last.age, last.v) : null;
    const ygrid = metric === 'height' ? [50, 75, 100, 125] : [5, 10, 15, 20, 25];
    const grid = ygrid.map(v => `<line x1="${padL}" y1="${Y(v)}" x2="${W - padR}" y2="${Y(v)}" stroke="${XY.C.cream}" stroke-width="1"/><text x="${padL - 4}" y="${Y(v) + 3}" text-anchor="end" font-size="8" fill="${XY.C.inkS}">${v}</text>`).join('');
    const xlab = [0, 12, 24, 36, 48, 60, 72].map(a => `<text x="${X(a)}" y="${H - 8}" text-anchor="middle" font-size="8" fill="${XY.C.inkS}">${a}</text>`).join('');
    return `<div class="gchart">
      <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}">${grid}${curves}${dots}
        <text x="${W - padR}" y="11" text-anchor="end" font-size="9" fill="${XY.C.apricotD}">${metric === 'height' ? '身高 cm' : '体重 kg'}</text>${xlab}</svg>
      <p class="src">参考 WHO 女童${metric === 'height' ? '身长/身高' : '体重'}百分位曲线（示意）；当前最新 ${last ? last.v + unit + '，' + pc.label : '暂无数据'}。数据来源：身高体重记录 ${pts.length} 条。</p>
    </div>`;
  }

  // ---------- 健康日程（疫苗/体检） ----------
  function healthUpcoming() {
    const t = todayStr();
    return (state.health || []).filter(h => !h.done && h.due >= t).sort((a, b) => a.due.localeCompare(b.due));
  }
  function healthRecords() { return state.records.filter(r => r.module === 'growth' && r.tags && r.tags.includes('健康')); }
  function healthIconOf(r) { const t = (r.fields && r.fields.htype) || 'visit'; return t === 'temp' ? 'thermo' : t === 'med' ? 'pill' : 'health'; }
  function healthSubOf(r) {
    const f = r.fields || {};
    if (f.htype === 'temp') return f.symptom ? esc(f.symptom) : '体温记录';
    if (f.htype === 'med') return [f.dose, f.freq].filter(Boolean).map(esc).join(' · ');
    return [f.dept, f.diag].filter(Boolean).map(esc).join(' · ');
  }
  const HEALTH_TYPES = [
    { k: 'temp', label: '体温', ic: 'thermo' },
    { k: 'med', label: '用药', ic: 'pill' },
    { k: 'visit', label: '就医', ic: 'health' }
  ];
  function openHealth() {
    const t = todayStr();
    const items = (state.health || []).slice().sort((a, b) => a.due.localeCompare(b.due));
    const hrs = healthRecords().slice().sort((a, b) => b.date.localeCompare(a.date));
    const f = ui.healthForm;
    const formFields = {
      temp: `<input class="h-in" data-hfield="temp" type="number" inputmode="decimal" step="0.1" min="35" max="42" placeholder="体温 ℃，如 38.2"><input class="h-in" data-hfield="symptom" placeholder="症状，如发烧咳嗽"><input class="h-in" type="date" data-hfield="date" value="${t}">`,
      med: `<input class="h-in" data-hfield="medicine" placeholder="药名，如美林"><input class="h-in" data-hfield="dose" placeholder="剂量，如 5ml"><input class="h-in" data-hfield="freq" placeholder="频次，如每8小时"><input class="h-in" type="date" data-hfield="date" value="${t}">`,
      visit: `<input class="h-in" data-hfield="hospital" placeholder="医院，如市妇幼"><input class="h-in" data-hfield="dept" placeholder="科室，如儿科"><input class="h-in" data-hfield="diag" placeholder="诊断/医嘱"><input class="h-in" type="date" data-hfield="date" value="${t}">`
    };
    openModal(`<div class="health-modal">
      <b>健康与疫苗</b>
      <p class="src">苗苗 4 岁 +，疫苗节点来自国家免疫规划与入园要求，仅供参考，请以社区医院通知为准。</p>
      <div class="health-list">${items.map(h => `<div class="health-row ${h.done ? 'done' : ''}">
        <span class="health-ic" style="background:${h.done ? XY.C.leaf + '22' : XY.C.berry + '22'};color:${h.done ? XY.C.leaf : XY.C.berry}">${ic(h.type === '疫苗' ? 'syringe' : 'health')}</span>
        <div class="health-tx"><b>${esc(h.name)}</b><small>${h.type} · ${esc(h.due)}${h.done ? ' · 已完成' : (h.due < t ? ' · 已逾期' : '')}</small></div>
        ${h.done ? '' : `<button class="btn tiny" data-act="hmark" data-id="${h.id}">记录</button>`}
      </div>`).join('')}</div>

      <div class="health-card">
        <div class="health-card-h"><b>健康小档案</b><span class="sec-sub">${hrs.length} 条记录</span></div>
        ${hrs.length ? `<div class="health-sub">${hrs.map(r => `<div class="hrec"><span class="hrec-ic">${ic(healthIconOf(r))}</span><div class="hrec-tx"><b>${esc(r.title)}</b><small>${esc(r.date)} · ${healthSubOf(r)}</small></div></div>`).join('')}</div>` : '<p class="src">还没有健康记录，生病或体检时记一笔吧。</p>'}
        ${f.open ? `<div class="hform">
          <div class="htype-row">${HEALTH_TYPES.map(h => `<button class="chip ${f.htype === h.k ? 'on' : ''}" data-act="hType" data-htype="${h.k}" style="--c:${XY.C.leaf}">${ic(h.ic)}${h.label}</button>`).join('')}</div>
          ${formFields[f.htype]}
          <div class="row2"><button class="btn ghost" data-act="hCancel">取消</button><button class="btn primary" data-act="hSave" data-htype="${f.htype}">保存记录</button></div>
        </div>` : `<button class="btn ghost full" data-act="hOpen">+ 记一笔健康记录</button>`}
      </div>
      <button class="btn primary" data-act="closeModal">关闭</button>
    </div>`);
  }
  function saveHealthRecord(htype, fd) {
    const t = HEALTH_TYPES.find(x => x.k === htype) || HEALTH_TYPES[0];
    let title = t.label;
    if (htype === 'temp') { if (!fd.temp) { toast('填一下体温吧', 'warn'); return; } title = '体温 ' + fd.temp + '℃'; }
    if (htype === 'med') { if (!fd.medicine) { toast('填一下药名吧', 'warn'); return; } title = '用药 ' + fd.medicine; }
    if (htype === 'visit') { if (!fd.hospital) { toast('填一下医院吧', 'warn'); return; } title = '就医 ' + fd.hospital; }
    const date = fd.date || todayStr();
    const rec = { id: uid(), module: 'growth', title, date, status: 'done', tags: ['健康', t.label], cover: MODULES.growth.cover, fields: Object.assign({ htype }, fd), media: [], related: [], activities: [{ date, text: '新建健康记录' }], reminder: null };
    state.records.unshift(rec);
    awardPoints(rec); recalcTree();
    ui.healthForm = { open: false, htype: 'temp' };
    save(); closeModal();
    toast('已记入健康小档案 🩺');
    openHealth();
  }
  function markHealth(id) {
    const h = (state.health || []).find(x => x.id === id); if (!h) return;
    h.done = true; save(); closeModal(); toast('已记录：' + h.name);
    render();
  }

  // ---------- 本周成长小结（本地生成，不接外部AI） ----------
  function weekContStreak() {
    const t = todayStr(); let n = 0;
    for (let i = 0; i < 7; i++) {
      const ds = addDays(t, -i);
      const done = state.records.some(r => r.date === ds && r.status === 'done');
      if (done) n++; else if (i > 0) break; else break;
    }
    return n;
  }
  function weeklyDigest() {
    const ws = weekStart(todayStr());
    const wk = state.records.filter(r => r.date >= ws && r.date <= todayStr());
    const done = wk.filter(r => r.status === 'done');
    const reading = wk.filter(r => r.module === 'reading' && r.status === 'done').length;
    const growthN = wk.filter(r => r.module === 'growth').length;
    const bodyN = wk.filter(r => r.module === 'body').length;
    const familyN = wk.filter(r => r.module === 'family' && r.status === 'done').length;
    const ptsWk = (state.pointLog || []).filter(l => l.date >= ws && l.delta > 0).reduce((a, l) => a + l.delta, 0);
    const streak = weekContStreak();
    let body;
    if (done.length === 0) body = '这周还没记录完成的事，今天就从一件小事开始吧——陪苗苗读一本绘本，成长树就会记得。';
    else body = `苗苗这周完成了 <b>${done.length}</b> 件事${familyN ? `，其中亲子活动 <b>${familyN}</b> 次` : ''}${reading ? `、亲子共读 <b>${reading}</b> 次` : ''}${growthN ? `，留下了 <b>${growthN}</b> 条成长记录` : ''}${bodyN ? `、量了 <b>${bodyN}</b> 次身高体重` : ''}。你为她攒下 <b>${ptsWk}</b> 分小芽积分，已经连续坚持 <b>${streak}</b> 天啦，真棒。`;
    return `<div class="card weekly-digest">
      <div class="wd-h"><span class="wd-ic">${ic('leaf')}</span><b>本周成长小结</b><span class="sec-sub">来自你的记录</span></div>
      <p class="wd-tx">${body}</p>
      <div class="wd-stats">${[
        ['完成', done.length + ' 项'], ['共读', reading + ' 次'], ['积分', ptsWk + ' 分'], ['连续', streak + ' 天']
      ].map(([k, v]) => `<span><b>${v}</b>${k}</span>`).join('')}</div>
    </div>`;
  }
  // ---------- 打卡热力图（近 12 周） ----------
  function heatmap() {
    const t = todayStr();
    const cells = [];
    for (let i = 83; i >= 0; i--) {
      const ds = addDays(t, -i);
      const c = state.records.filter(r => r.date === ds && r.status === 'done').length;
      cells.push({ ds, c });
    }
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const square = (cell, last) => {
      const col = cell.c === 0 ? XY.C.cream : cell.c === 1 ? XY.C.apricotL : cell.c === 2 ? XY.C.apricot : XY.C.apricotD;
      return `<button class="hm ${last ? 'today' : ''}" style="background:${col}" data-act="day" data-date="${cell.ds}" title="${cell.ds} · 完成 ${cell.c} 项"></button>`;
    };
    let html = '';
    weeks.forEach(wk => { html += `<div class="hm-week">${wk.map((c, i) => square(c, c.ds === t)).join('')}</div>`; });
    return `<section class="heat-sec">
      <div class="sec-h"><b>坚持热力图</b><span class="sec-sub">近 12 周 · 颜色越深完成越多</span></div>
      <div class="heat-scroll">${html}</div>
      <div class="hm-legend"><span>少</span>${[0,1,2,3].map(n => `<i style="background:${n===0?XY.C.cream:n===1?XY.C.apricotL:n===2?XY.C.apricot:XY.C.apricotD}"></i>`).join('')}<span>多</span></div>
    </section>`;
  }

  // ---------- 番茄钟（专注计时） ----------
  const timer = { id: null, total: 0, left: 0, running: false };
  function openTimer(rec) {
    ui.timerRec = rec;
    timer.total = 15 * 60; timer.left = timer.total; timer.running = false;
    openModal(`<div class="timer-modal">
      <b>${ic('timer')} 专注计时</b>
      <p class="src">${esc(rec.title)} · 完成后会记一笔专注</p>
      <div class="timer-disp" id="timerDisp">15:00</div>
      <div class="timer-presets">
        ${[15,20,25,30].map(m => `<button class="chip" data-act="tset" data-min="${m}">${m} 分</button>`).join('')}
      </div>
      <div class="row2">
        <button class="btn primary" data-act="tstart" id="tStart">开始</button>
        <button class="btn ghost" data-act="treset">重置</button>
      </div>
      <button class="btn ghost" data-act="closeModal">关闭</button>
    </div>`);
  }
  function tStart() {
    if (timer.running) { timer.running = false; const b = document.getElementById('tStart'); if (b) b.textContent = '继续'; return; }
    timer.running = true; const b = document.getElementById('tStart'); if (b) b.textContent = '暂停';
    timer.id = setInterval(() => {
      timer.left--;
      const el = document.getElementById('timerDisp'); if (el) el.textContent = fmtTimer(timer.left);
      if (timer.left <= 0) {
        clearInterval(timer.id); timer.running = false; timer.id = null;
        toast('专注完成，苗苗真棒 🌟');
        const r = ui.timerRec; if (r && r.activities) { r.activities.push({ date: todayStr(), text: '专注计时完成 ' + Math.round(timer.total / 60) + ' 分钟' }); save(); }
        closeModal();
      }
    }, 1000);
  }
  function fmtTimer(s) { const m = Math.floor(s / 60), ss = s % 60; return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0'); }
  function tSet(min) { timer.total = min * 60; timer.left = timer.total; timer.running = false; const d = document.getElementById('timerDisp'); if (d) d.textContent = fmtTimer(timer.left); const b = document.getElementById('tStart'); if (b) b.textContent = '开始'; }
  function tReset() { tSet(timer.total / 60); }

  // ---------- 里程碑模板 ----------
  const MILESTONES = ['第一次自己吃饭', '第一次跳绳', '认第一个字', '第一次骑自行车', '交到好朋友', '第一次独自睡觉'];
  function msTemplate(title) {
    if (!ui.wizard) return;
    ui.wizard.title = title;
    ui.wizard.fields = ui.wizard.fields || {};
    ui.wizard.fields.type = '里程碑';
    ui.wizard.fields.age = childAge(state.settings.childBirth);
    if (!ui.wizard.tags.includes('里程碑')) ui.wizard.tags.push('里程碑');
    render();
  }

  // ---------- 弹层 / 提示 ----------
  function toast(msg, kind) {
    const t = document.getElementById('toast'); if (!t) return;
    t.className = 'toast show ' + (kind || ''); t.textContent = msg;
    clearTimeout(t._t); t._t = setTimeout(() => { t.className = 'toast'; }, 2200);
  }
  function openModal(html) { const r = document.getElementById('modalRoot'); if (!r) return; r.innerHTML = `<div class="mask" data-act="modalMask"></div><div class="modal">${html}</div>`; }
  function closeModal() { const r = document.getElementById('modalRoot'); if (r) r.innerHTML = ''; }
  function openLightbox(rec, idx, ill) {
    const m = ill ? { cover: rec.cover } : rec.media[idx];
    const body = m.data ? `<img src="${m.data}" alt="">` : cov(m.cover || rec.cover, rec.fields && rec.fields.book);
    openModal(`<div class="lb">
      <div class="lb-img">${body}</div>
      <div class="lb-info"><b>${esc(rec.title)}</b><small>${m.caption ? esc(m.caption) : m.book ? esc(m.book) : rec.date}</small></div>
      <div class="lb-actions">
        <button class="btn ghost" data-act="lbdetail" data-id="${rec.id}">查看记录</button>
        ${!ill && m.data ? `<button class="btn primary" data-act="setcover" data-id="${rec.id}" data-idx="${idx}">设为封面</button>` : ''}
        <button class="btn ghost" data-act="closeModal">关闭</button>
      </div>
    </div>`);
  }
  function closeLightbox() {}

  // ---------- 事件委托 ----------
  function onClick(e) {
    const t = e.target.closest('[data-act]'); if (!t) return;
    const act = t.dataset.act; const id = t.dataset.id;
    switch (act) {
      case 'nav': navigate(t.dataset.view); break;
      case 'back': navigate(ui.prev || 'home'); break;
      case 'detail': navigate('detail/' + id); break;
      case 'add': ui.wizard = null; navigate('add'); break;
      case 'addMod': ui.wizard = { step: 2, module: t.dataset.module, title: '', date: todayStr(), status: 'doing', tags: [], note: '', fields: {}, media: [], cover: MODULES[t.dataset.module].cover }; navigate('add'); break;
      case 'edit': ui.wizard = null; navigate('edit/' + id); break;
      case 'toggle': toggleStatus(id); break;
      case 'del': confirmDelete(id); break;
      case 'ftag': ui.filters.tag = t.dataset.tag; navigate('library'); break;
      case 'cleartag': ui.filters.tag = ''; ui.filters.module = ''; ui.filters.status = ''; ui.filters.q = ''; if (ui.view === 'library') { render(); } else navigate('library'); break;
      case 'fmod': ui.filters.module = t.dataset.module; render(); break;
      case 'focusSearch': { const i = document.getElementById('searchInput'); if (i) i.focus(); break; }
      case 'day': openDay(t.dataset.date); break;
      case 'calPrev': ui.calMonth = shiftMonth(ui.calMonth, -1); render(); break;
      case 'calNext': ui.calMonth = shiftMonth(ui.calMonth, 1); render(); break;
      case 'calToday': ui.calMonth = todayStr().slice(0, 7); render(); break;
      case 'scope': ui.scope.type = t.dataset.type; if (t.dataset.type === 'custom') { if (!ui.scope.from || !ui.scope.to) { const ds = state.records.map(r => r.date).sort(); ui.scope.from = ds[0] || todayStr(); ui.scope.to = ds[ds.length - 1] || todayStr(); } } render(); break;
      case 'scopeApply': render(); break;
      case 'homescope': ui.homeScope = t.dataset.scope; render(); break;
      case 'albumbtn': ui.albumCollapsed = ui.albumCollapsed || {}; ui.albumCollapsed[t.dataset.month] = !ui.albumCollapsed[t.dataset.month]; render(); break;
      case 'media': openLightbox(byId(t.dataset.id), +t.dataset.idx, t.dataset.ill === '1'); break;
      case 'lbdetail': { closeModal(); navigate('detail/' + t.dataset.id); break; }
      case 'setcover': setCover(t.dataset.id, +t.dataset.idx); break;
      case 'closeModal': closeModal(); break;
      case 'modalMask': closeModal(); break;
      case 'confirmDel': doDelete(t.dataset.id); break;
      case 'cancelDel': closeModal(); break;
      case 'wpick': ui.wizard.module = t.dataset.module; ui.wizard.cover = MODULES[t.dataset.module].cover; ui.wizard.step = 2; render(); break;
      case 'wstep': { const step = +t.dataset.step; if (step === 3 && !validateWizardNums()) { toast('有数字填得不对，检查一下标红的格子', 'warn'); break; } ui.wizard.step = step; render(); break; }
      case 'wtag': { const tg = t.dataset.tag; const i = ui.wizard.tags.indexOf(tg); if (i >= 0) ui.wizard.tags.splice(i, 1); else ui.wizard.tags.push(tg); render(); break; }
      case 'wconfirm': saveRecord(); break;
      case 'wcancel': ui.wizard = null; navigate(ui.prev && ui.prev !== 'add' && ui.prev !== 'edit' ? ui.prev : 'home'); break;
      case 'updel': ui.wizard.media.splice(+t.dataset.idx, 1); render(); break;
      case 'upload': handleUpload(t); break;
      case 'remind': { state.settings[t.dataset.key] = t.checked; save(); toast('提醒已更新'); break; }
      case 'addcat': addCategory(); break;
      case 'delcat': delCategory(t.dataset.cat); break;
      case 'export': exportData(); break;
      case 'import': {
        const inp = document.getElementById('importFile');
        if (inp) {
          inp.value = '';
          inp.onchange = () => {
            const f = inp.files && inp.files[0];
            if (!f) return;
            const rd = new FileReader();
            rd.onload = () => importData(rd.result);
            rd.readAsText(f);
          };
          inp.click();
        }
        break;
      }
      case 'reset': confirmReset(); break;
      case 'report': navigate('report'); break;
      case 'ghSave': { const r = document.querySelector('[data-act="ghRepo"]'), tk = document.querySelector('[data-act="ghToken"]'); localStorage.setItem('xiaoya_gh', JSON.stringify({ repo: (r ? r.value : '').trim(), token: (tk ? tk.value : '').trim() })); toast('GitHub 配置已保存'); break; }
      case 'ghClear': { localStorage.removeItem('xiaoya_gh'); toast('已清除 GitHub 凭据'); render(); break; }
      case 'ghPush': { const r = document.querySelector('[data-act="ghRepo"]'), tk = document.querySelector('[data-act="ghToken"]'); let repo = (r ? r.value : '').trim(), token = (tk ? tk.value : '').trim(); if (!repo || !token) { const c = ghConfig(); repo = repo || c.repo || ''; token = token || c.token || ''; } pushToGitHub(repo, token); break; }
      case 'rewards': navigate('rewards'); break;
      case 'redeem': redeemReward(t.dataset.id); break;
      case 'health': openHealth(); break;
      case 'hmark': markHealth(t.dataset.id); break;
      case 'addHealth':
      case 'hOpen': ui.healthForm = { open: true, htype: ui.healthForm.htype || 'temp' }; openHealth(); break;
      case 'hType': ui.healthForm.htype = t.dataset.htype; openHealth(); break;
      case 'hCancel': ui.healthForm = { open: false, htype: ui.healthForm.htype }; openHealth(); break;
      case 'hSave': {
        const htype = t.dataset.htype; const fd = {};
        document.querySelectorAll('[data-hfield]').forEach(el => { if (el.value) fd[el.dataset.hfield] = el.value; });
        saveHealthRecord(htype, fd); break;
      }
      case 'timer': { const r = byId(id); if (r) openTimer(r); break; }
      case 'tset': tSet(+t.dataset.min); break;
      case 'tstart': tStart(); break;
      case 'treset': tReset(); break;
      case 'msTpl': msTemplate(t.dataset.title); break;
      case 'noop': break;
    }
  }
  function onInput(e) {
    const t = e.target; if (t.dataset && t.dataset.act === 'search') { ui.filters.q = t.value; const l = document.getElementById('libList'); if (l) l.innerHTML = libListHTML(); }
  }
  function onChange(e) {
    const t = e.target;
    if (t.dataset && t.dataset.act === 'fstatus') { ui.filters.status = t.value; render(); }
    if (t.dataset && t.dataset.act === 'fsort') { ui.filters.sort = t.value; render(); }
    if (t.dataset && t.dataset.act === 'scopeFrom') { ui.scope.from = t.value; }
    if (t.dataset && t.dataset.act === 'scopeTo') { ui.scope.to = t.value; }
  }
  function onKeyup(e) { if (e.key === 'Escape') { closeModal(); } }

  // bind inputs in wizard / edit
  function bindInputs() {
    document.querySelectorAll('[data-bind]').forEach(el => {
      const k = el.dataset.bind;
      const ev = el.tagName === 'SELECT' || el.type === 'date' ? 'change' : 'input';
      el.addEventListener(ev, () => { if (ui.wizard) ui.wizard[k] = el.value; });
    });
    document.querySelectorAll('[data-fbind]').forEach(el => {
      const k = el.dataset.fbind;
      const ev = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(ev, () => { if (ui.wizard) ui.wizard.fields[k] = el.value; if (el.dataset.fnum) validateNum(el); });
      if (el.dataset.fnum) el.addEventListener('blur', () => fixNum(el));
    });
  }
  function fixNum(el) {
    const k = el.dataset.fbind; const spec = NUM_SPEC[k]; if (!spec) return;
    const v = (el.value || '').trim();
    if (v === '') { el.classList.remove('bad'); return; }
    let n = Number(v);
    if (!isFinite(n)) { el.value = ''; if (ui.wizard) ui.wizard.fields[k] = ''; el.classList.remove('bad'); return; }
    if (n > spec.max) n = spec.max;
    if (n < spec.min) n = spec.min;
    el.value = n; if (ui.wizard) ui.wizard.fields[k] = String(n); el.classList.remove('bad');
  }
  function validateNum(el) {
    const k = el.dataset.fbind; const spec = NUM_SPEC[k]; if (!spec) return true;
    const v = (el.value || '').trim();
    const errEl = el.parentNode ? el.parentNode.querySelector('[data-ferr="' + k + '"]') : null;
    if (v === '') { if (errEl) errEl.textContent = ''; el.classList.remove('bad'); return true; }
    const n = Number(v);
    if (!isFinite(n)) { if (errEl) errEl.textContent = '请填数字'; el.classList.add('bad'); return false; }
    if (n < spec.min || n > spec.max) { if (errEl) errEl.textContent = '请填 ' + spec.min + '–' + spec.max + ' ' + spec.unit; el.classList.add('bad'); return false; }
    if (errEl) errEl.textContent = ''; el.classList.remove('bad'); return true;
  }
  function validateWizardNums() {
    let ok = true; const bad = [];
    if (!ui.wizard || !ui.wizard.fields) return true;
    Object.keys(NUM_SPEC).forEach(k => {
      const raw = ui.wizard.fields[k];
      const v = (raw == null ? '' : String(raw)).trim();
      if (v === '') return;
      const spec = NUM_SPEC[k]; const n = Number(v);
      if (!isFinite(n) || n < spec.min || n > spec.max) { ok = false; bad.push(k); }
    });
    return ok;
  }

  // ---------- 操作 ----------
  function toggleStatus(id) {
    const r = byId(id); if (!r) return;
    const wasDone = r.status === 'done';
    const order = ['todo', 'doing', 'done', 'pause'];
    let ni = order.indexOf(r.status) + 1; if (ni >= order.length) ni = 0;
    r.status = order[ni];
    const now = todayStr();
    if (!r.activities) r.activities = [];
    if (r.status === 'done') {
      r.activities.push({ date: now, text: '标记为已完成' });
      if (!wasDone) { awardPoints(r); if (r.module === 'family') growTree(r); else { const g = recalcTree(); if (g > 0) toast('小芽攒够 ' + LEAF_PER_POINTS + ' 分，成长树又长出 ' + g + ' 片叶 🌿'); } }
    } else {
      r.activities.push({ date: now, text: '状态改为：' + sName(r.status) });
    }
    save(); navigate('detail/' + id);
    if (r.status === 'done') toast(r.module === 'family' ? '完成啦！成长树长出新叶 🌿' : '已完成，进度已更新');
    else toast('状态已更新');
  }
  function familyDoneCount() { return state.records.filter(r => r.module === 'family' && r.status === 'done').length; }
  function recalcTree() {
    const target = familyDoneCount() + Math.floor((state.points || 0) / LEAF_PER_POINTS);
    if (target > state.treeLeaves) {
      const grown = target - state.treeLeaves;
      state.treeLeaves = Math.min(30, target);
      save();
      return grown;
    }
    return 0;
  }
  function growTree(r) {
    const before = state.treeLeaves;
    const grown = recalcTree();
    const gained = state.treeLeaves - before;
    const a = { id: 'ach-' + uid(), title: '完成亲子活动：' + r.title, date: todayStr(), icon: 'hearts', text: '你和苗苗一起完成了「' + r.title + '」，成长树' + (gained > 0 ? '又长出了 ' + gained + ' 片新叶' : '越来越茂盛') + '，继续加油呀。', module: 'family' };
    state.achievements.unshift(a);
    save();
    setTimeout(() => openModal(`<div class="encourage">
      <div class="enc-tree">${cov('tree', state.treeLeaves)}</div>
      <b>🌿 鼓励卡</b>
      <p>${esc(a.text)}</p>
      <button class="btn primary" data-act="closeModal">收下这份鼓励</button>
    </div>`), 350);
  }
  function confirmDelete(id) {
    const r = byId(id); if (!r) return;
    const rel = (r.related || []).map(byId).filter(Boolean);
    openModal(`<div class="confirm">
      <b>确定删除这条记录吗？</b>
      <p>「${esc(r.title)}」删除后将从成长册、日历与统计中移除${rel.length ? '，并解除与 ' + rel.length + ' 条关联记录的绑定' : ''}。</p>
      ${rel.length ? `<div class="rel-list">${rel.map(x => `<span>${ic(MODULES[x.module].icon)} ${esc(x.title)}</span>`).join('')}</div>` : ''}
      <div class="row2">
        <button class="btn ghost" data-act="cancelDel">再想想</button>
        <button class="btn danger" data-act="confirmDel" data-id="${id}">确认删除</button>
      </div>
    </div>`);
  }
  function doDelete(id) {
    const i = state.records.findIndex(r => r.id === id); if (i < 0) { closeModal(); return; }
    state.records.splice(i, 1);
    // 清理关联引用
    state.records.forEach(r => { if (r.related) r.related = r.related.filter(x => x !== id); });
    save(); closeModal();
    toast('已删除，记录总数已更新');
    navigate(ui.prev === 'detail' ? 'library' : (ui.prev || 'library'));
  }
  function saveRecord() {
    const w = ui.wizard; if (!w) { toast('表单数据丢失，请重试'); return; }
    if (!w.title || !w.title.trim()) { toast('给记录起个标题吧'); return; }
    if (!validateWizardNums()) { toast('有数字填得不对，回到上一步检查一下', 'warn'); return; }
    const fields = parseFields(w.module, w.fields);
    if (w.edit && w.id) {
      const r = byId(w.id);
      Object.assign(r, { title: w.title, date: w.date, status: w.status, tags: [...w.tags], note: w.note, fields, media: w.media, cover: w.cover || r.cover });
      if (!r.activities) r.activities = [];
      r.activities.push({ date: todayStr(), text: '编辑了记录' });
      toast('保存成功，详情与统计已同步');
    } else {
      const r = { id: uid(), module: w.module, title: w.title.trim(), date: w.date, status: w.status, tags: [...w.tags], note: w.note, cover: w.cover || MODULES[w.module].cover, fields, media: w.media, related: [], activities: [{ date: todayStr(), text: '新建记录' }], reminder: w.reminder || null };
      state.records.unshift(r);
      if (r.status === 'done') awardPoints(r);
      toast('已添加，成长册总数 +1');
    }
    save(); ui.wizard = null;
    navigate(w.edit && w.id ? 'detail/' + w.id : 'library');
  }
  function parseFields(module, f) {
    f = f || {}; const out = {};
    const num = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    if (module === 'reading') { out.book = f.book; out.author = f.author; out.pages = num(f.pages); out.minutes = num(f.minutes); }
    else if (module === 'study') { out.subject = f.subject; out.goal = f.goal; out.progress = num(f.progress); out.method = f.method; }
    else if (module === 'growth') { out.type = f.type; out.age = f.age; out.place = f.place; }
    else if (module === 'body') { out.height = num(f.height); out.weight = num(f.weight); out.place = f.place; if (out.height && out.weight) out.bmi = +(out.weight / ((out.height / 100) * (out.height / 100))).toFixed(1); }
    else if (module === 'hobby') { out.schedule = f.schedule; out.coach = f.coach; out.lessonsLeft = num(f.lessonsLeft); out.place = f.place; }
    else if (module === 'family') { out.place = f.place; out.with = f.with; out.mood = f.mood; out.hours = num(f.hours); }
    else if (module === 'routine') { out.time = f.time; out.repeat = f.repeat; out.steps = (f.steps || '').split('、').map(s => s.trim()).filter(Boolean); }
    else if (module === 'items') { out.total = num(f.total); out.bought = num(f.bought); out.list = (f.list || '').split('、').map(s => ({ name: s.trim(), done: false })).filter(x => x.name); }
    return out;
  }
  function handleUpload(input) {
    const files = input.files; if (!files || !files.length) return;
    const w = ui.wizard; if (!w) return;
    let pending = files.length;
    Array.from(files).forEach(file => {
      const rd = new FileReader();
      rd.onload = () => { w.media.push({ type: 'image', data: rd.result, caption: file.name.replace(/\.[^.]+$/, '') }); if (--pending === 0) { render(); toast('已添加 ' + files.length + ' 张照片'); } };
      rd.onerror = () => { if (--pending === 0) render(); toast('有照片读取失败，重试一下', 'warn'); };
      rd.readAsDataURL(file);
    });
  }
  function setCover(id, idx) {
    const r = byId(id); if (!r) return; const m = r.media[idx]; if (!m || !m.data) { closeModal(); return; }
    r.coverImage = m.data; save(); closeModal(); toast('封面已更新'); navigate('detail/' + id);
  }
  function openDay(dateStr) {
    const recs = state.records.filter(r => r.date === dateStr);
    openModal(`<div class="daymodal">
      <b>${dateStr} 的记录</b>
      ${recs.length ? recs.map(r => `<button class="mini-row" data-act="detail" data-id="${r.id}"><span class="dot" style="background:${mColor(r.module)}"></span><span class="mini-tx"><b>${esc(r.title)}</b><small>${mName(r.module)} · ${sName(r.status)}</small></span></button>`).join('') : '<p class="src">这一天还没有记录。</p>'}
      <button class="btn primary" data-act="addOnDay" data-date="${dateStr}">在这一天加一条</button>
      <button class="btn ghost" data-act="closeModal">关闭</button>
    </div>`);
    // bind the addOnDay button
    const b = document.querySelector('[data-act="addOnDay"]'); if (b) b.addEventListener('click', () => { closeModal(); ui.wizard = { step: 2, module: 'growth', title: '', date: dateStr, status: 'doing', tags: [], note: '', fields: {}, media: [], cover: MODULES.growth.cover }; navigate('add'); });
  }
  function addCategory() {
    const name = prompt('新分类名称（例如：英语、游泳）：'); if (!name) return; const n = name.trim();
    if (!n) return; if (state.categories.includes(n)) { toast('分类已存在'); return; }
    state.categories.push(n); save(); render(); toast('已新增分类「' + n + '」');
  }
  function delCategory(c) {
    if (!confirm('删除分类「' + c + '」？已有记录上的该标签会保留，只是不再作为可选项。')) return;
    state.categories = state.categories.filter(x => x !== c); save(); render(); toast('已删除分类');
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'xiaoya-backup-' + todayStr() + '.json'; a.click();
    toast('已导出备份文件');
  }
  function importData(text) {
    try {
      const d = JSON.parse(text);
      if (!d || typeof d !== 'object' || !Array.isArray(d.records)) throw new Error('文件格式不正确');
      state = d;
      if (typeof state.points !== 'number') state.points = 0;
      if (!Array.isArray(state.pointLog)) state.pointLog = [];
      if (typeof state.treeLeaves !== 'number') state.treeLeaves = 0;
      if (!Array.isArray(state.achievements)) state.achievements = [];
      if (!Array.isArray(state.health)) state.health = [];
      if (!Array.isArray(state.categories)) state.categories = [];
      if (!state.settings) state.settings = {};
      save();
      closeModal();
      navigate('home');
      toast('已从备份恢复数据');
    } catch (e) {
      toast('导入失败：' + (e && e.message ? e.message : e));
    }
  }
  function ghConfig() { try { return JSON.parse(localStorage.getItem('xiaoya_gh') || '{}') || {}; } catch (e) { return {}; } }
  function b64utf8(str) { return btoa(unescape(encodeURIComponent(str))); }
  function ghSetStatus(msg) { const el = document.getElementById('ghStatus'); if (el) { el.textContent = msg || ''; } }
  async function pushToGitHub(repo, token) {
    if (!repo || !token) { ghSetStatus('请先填写仓库地址和访问令牌（或先「保存配置」）'); toast('缺少仓库地址或令牌', 'warn'); return; }
    let m = repo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').replace(/^git@github\.com:/, '');
    const mm = m.match(/^([^\/\s]+)\/([^\/\s]+)$/);
    if (!mm) { ghSetStatus('仓库地址格式不对，应为 https://github.com/owner/repo.git'); return; }
    const owner = mm[1], name = mm[2];
    ghSetStatus('正在连接 GitHub…');
    const api = 'https://api.github.com';
    const head = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };
    let branch = 'master';
    try {
      const ri = await fetch(api + '/repos/' + owner + '/' + name, { headers: head });
      if (ri.status === 401) { ghSetStatus('令牌无效或无权限（401），请检查 PAT 与 repo 权限'); return; }
      if (!ri.ok) { ghSetStatus('仓库读取失败（' + ri.status + '），确认仓库地址与可见性'); return; }
      const rj = await ri.json(); branch = (rj.default_branch) || 'master';
    } catch (err) { ghSetStatus('网络错误：' + (err && err.message ? err.message : err)); return; }
    const files = ['index.html', 'css/styles.css', 'js/app.js', 'js/data.js', 'js/sprite.js'];
    for (let i = 0; i < files.length; i++) {
      const path = files[i];
      ghSetStatus('推送中（' + (i + 1) + '/' + files.length + '）：' + path);
      let content;
      try { const r = await fetch('./' + path, { cache: 'no-store' }); if (!r.ok) { ghSetStatus('读取本地文件失败：' + path + '（' + r.status + '）'); return; } content = await r.text(); }
      catch (err) { ghSetStatus('读取本地文件失败：' + path); return; }
      let sha = null;
      try { const g = await fetch(api + '/repos/' + owner + '/' + name + '/contents/' + encodeURIComponent(path) + '?ref=' + branch, { headers: head }); if (g.status === 200) { const gj = await g.json(); sha = gj.sha; } }
      catch (e) {}
      const body = { message: 'sync: 部署同步 ' + new Date().toISOString().slice(0, 16).replace('T', ' '), content: b64utf8(content), branch: branch };
      if (sha) body.sha = sha;
      try {
        const pu = await fetch(api + '/repos/' + owner + '/' + name + '/contents/' + encodeURIComponent(path), { method: 'PUT', headers: head, body: JSON.stringify(body) });
        if (!pu.ok) { let em = ''; try { em = (await pu.json()).message || ''; } catch (e) {} ghSetStatus('推送失败 ' + path + '：' + pu.status + ' ' + em); return; }
      } catch (err) { ghSetStatus('推送异常 ' + path + '：' + (err && err.message ? err.message : err)); return; }
    }
    ghSetStatus('✅ 已成功推送到 GitHub（' + branch + ' 分支，' + files.length + ' 个文件）');
    toast('已推送到 GitHub');
  }

  function confirmReset() {
    openModal(`<div class="confirm">
      <b>恢复示例数据？</b>
      <p>这会覆盖你当前所有的记录、分类与设置，回到初始示例状态。此操作可在导出备份后谨慎进行。</p>
      <div class="row2"><button class="btn ghost" data-act="cancelDel">取消</button><button class="btn danger" data-act="doReset">确认恢复</button></div>
    </div>`);
    const b = document.querySelector('[data-act="doReset"]'); if (b) b.addEventListener('click', () => { seed(); closeModal(); navigate('home'); toast('已恢复示例数据'); });
  }

  // ---------- 滚动（回到顶部） ----------
  function bindScroll() {
    const v = document.getElementById('view'); const fab = document.querySelector('.fab');
    if (!v) return;
    v.addEventListener('scroll', () => {
      if (fab) fab.style.opacity = v.scrollTop > 240 ? '1' : '0.92';
    });
  }

  // ---------- 启动 ----------
  function bootErr(msg) {
    try {
      var el = document.getElementById('bootErr');
      var ld = document.getElementById('bootLoading');
      if (ld) ld.style.display = 'none';
      if (el) { el.style.display = 'block'; el.textContent = '页面初始化失败：' + msg + '\n请尝试下拉刷新或在浏览器中切换至极速模式 / 标准模式后重新打开。'; }
    } catch (e) {}
  }
  function init() {
    try {
      if (!window.XY) throw new Error('视觉资源未加载');
      if (!window.XY_DATA) throw new Error('示例数据未加载');
      window.XY.COVERSEMPTY = cov('empty');
      load();
      app.addEventListener('click', onClick);
      app.addEventListener('input', onInput);
      app.addEventListener('change', onChange);
      document.addEventListener('keyup', onKeyup);
      window.addEventListener('hashchange', router);
      if (!location.hash) location.hash = '#/home';
      router();
      // 重新绑定向导/编辑输入（render 后）
      const obs = new MutationObserver(() => { bindInputs(); });
      obs.observe(app, { childList: true, subtree: true });
    } catch (e) {
      bootErr(e && e.message ? e.message : String(e));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
