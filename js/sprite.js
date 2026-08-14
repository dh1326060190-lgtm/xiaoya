/* 小芽 · 原创视觉资产：品牌色板、线性图标、场景插画（全部内联 SVG，无外链） */
(function () {
  const C = {
    apricot: '#C98736', apricotL: '#E3B577', apricotD: '#A86A26',
    paper: '#FBF6EC', cream: '#F3EAD8', card: '#FFFDF8',
    ink: '#3A2E22', inkS: '#7A6A56', inkF: '#A8967E',
    sage: '#7FA86B', leaf: '#4F8A5B', leafL: '#9CC089',
    berry: '#C76B57', sky: '#AFC5D6', sand: '#E7C9A9', rose: '#E2A98C'
  };

  // ---- 线性图标（24x24，stroke=currentColor） ----
  function S(inner, vb, sw) {
    vb = vb || '0 0 24 24';
    sw = sw || 1.7;
    return `<svg class="ic" viewBox="${vb}" width="24" height="24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  }
  const ICON = {
    // 导航
    home: () => S('<path d="M4 11l8-6 8 6"/><path d="M6.5 9.8V19h11V9.8"/><path d="M10 19v-4.5h4V19"/>'),
    book: () => S('<path d="M4 5.5A2 2 0 0 1 6 4h6v15H6a2 2 0 0 0-2 1.6z"/><path d="M20 5.5A2 2 0 0 0 18 4h-6v15h6a2 2 0 0 1 2 1.6z"/>'),
    cal: () => S('<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 9h16M8 3v4M16 3v4"/>'),
    chart: () => S('<path d="M5 19V5M5 19h14M9 19v-6M13 19v-9M17 19v-4"/>'),
    album: () => S('<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="11" r="1.8"/><path d="M4 17l5-4 4 3 3-2.5 4 3.5"/>'),
    me: () => S('<circle cx="12" cy="8.5" r="3.6"/><path d="M5.5 19.5c1-3.4 3.4-5 6.5-5s5.5 1.6 6.5 5"/>'),
    // 模块
    routine: () => S('<circle cx="12" cy="13" r="6.2"/><path d="M12 13V9.5M12 6.8V8.2M12 17.8V19.2M5 13H3.5M20.5 13H19M9.3 4.2 8.4 2.9M15.6 4.2l.9-1.3"/>'),
    read: () => S('<path d="M12 6.5C10.5 5.4 8.6 5 6.5 5.3v13c2.1-.3 4 .1 5.5 1.2 1.5-1.1 3.4-1.5 5.5-1.2v-13C15.4 5 13.5 5.4 12 6.5z"/><path d="M12 6.5V19.7"/>'),
    pencil: () => S('<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>'),
    camera: () => S('<rect x="3.5" y="7" width="17" height="12" rx="2.5"/><circle cx="12" cy="13" r="3.4"/><path d="M9 7l1.4-2h3.2L15 7"/>'),
    ruler: () => S('<rect x="3.5" y="8" width="17" height="8" rx="2" transform="rotate(0 12 12)"/><path d="M7 8v3M10 8v4M13 8v3M16 8v4M19 8v3"/>'),
    palette: () => S('<path d="M12 4.5a7.5 7.5 0 1 0 0 15c1 0 1.6-.8 1.6-1.7 0-.5-.3-.9-.3-1.4 0-.6.5-1.1 1.1-1.1H16a3.4 3.4 0 0 0 3.4-3.4A7.5 7.5 0 0 0 12 4.5z"/><circle cx="8.5" cy="11" r="1"/><circle cx="12" cy="8.5" r="1"/><circle cx="15.5" cy="11" r="1"/>'),
    hearts: () => S('<path d="M12 19.5S4.5 14.3 4.5 9.2A3.7 3.7 0 0 1 12 7a3.7 3.7 0 0 1 7.5 2.2C19.5 14.3 12 19.5 12 19.5z"/>'),
    bag: () => S('<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/><path d="M10.5 12.5l1 1 2-2"/>'),
    // 通用 UI
    search: () => S('<circle cx="11" cy="11" r="6.2"/><path d="M16 16l4 4"/>'),
    filter: () => S('<path d="M4 6h16M7 12h10M10 18h4"/>'),
    sort: () => S('<path d="M8 5v14M8 19l-3-3M8 5l3 3M16 19V5M16 5l-3 3M16 19l3-3"/>'),
    plus: () => S('<path d="M12 5v14M5 12h14"/>'),
    edit: () => S('<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>'),
    trash: () => S('<path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/><path d="M10 10.5v6M14 10.5v6"/>'),
    close: () => S('<path d="M6 6l12 12M18 6L6 18"/>'),
    check: () => S('<path d="M5 12.5l4.5 4.5L19 7"/>'),
    back: () => S('<path d="M15 5l-7 7 7 7"/>'),
    upload: () => S('<path d="M12 16V5M8 9l4-4 4 4"/><path d="M5 19h14"/>'),
    img: () => S('<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="11" r="1.6"/><path d="M4 17l5-4 4 3 3-2.5 4 3.5"/>'),
    more: () => S('<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>'),
    bell: () => S('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
    chevR: () => S('<path d="M9 5l7 7-7 7"/>'),
    chevD: () => S('<path d="M5 9l7 7 7-7"/>'),
    heart: () => S('<path d="M12 19.5S4.5 14.3 4.5 9.2A3.7 3.7 0 0 1 12 7a3.7 3.7 0 0 1 7.5 2.2C19.5 14.3 12 19.5 12 19.5z"/>'),
    leaf: () => S('<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19C9 15 12 12 15 10"/>'),
    star: () => S('<path d="M12 4l2.4 5 5.6.6-4.2 3.8 1.2 5.5L12 16.8 6.9 19l1.2-5.5L3.9 9.6 9.5 9z"/>'),
    trophy: () => S('<path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M9 13.5V17h6v-3.5M8 20h8"/>'),
    share: () => S('<circle cx="6" cy="12" r="2.3"/><circle cx="18" cy="6" r="2.3"/><circle cx="18" cy="18" r="2.3"/><path d="M8 11l8-4M8 13l8 4"/>'),
    download: () => S('<path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 19h14"/>'),
    refresh: () => S('<path d="M19 12a7 7 0 1 1-2-5"/><path d="M19 5v4h-4"/>'),
    warn: () => S('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>'),
    dot: () => S('<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>'),
    clock: () => S('<circle cx="12" cy="12" r="8"/><path d="M12 12V7.5M12 12l3.5 2"/>'),
    sprout: () => S('<path d="M12 20v-7"/><path d="M12 13c0-3.5-2.6-6-6-6 0 3.5 2.6 6 6 6z"/><path d="M12 13c0-3.5 2.6-6 6-6 0 3.5-2.6 6-6 6z"/>'),
    tag: () => S('<path d="M4 4h7l9 9-7 7-9-9z"/><circle cx="8" cy="8" r="1.4"/>'),
    mic: () => S('<rect x="9" y="4" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v3"/>'),
    gear: () => S('<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8"/>'),
    // 新增：成长激励 / 健康 / 计时
    gift: () => S('<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M3 9h18v3H3zM12 9v11"/><path d="M12 9C9 9 8 6 9.5 5S13 6 12 9zM12 9c3 0 4-3 2.5-4S11 6 12 9z"/>'),
    coin: () => S('<circle cx="12" cy="12" r="8.2"/><path d="M12 7.5v9M9.5 9.8c0-1.3 1.1-2 2.5-2s2.5.8 2.5 2-1.1 1.8-2.5 1.8-2.5.8-2.5 2 1.1 2 2.5 2 2.5-.7 2.5-2" fill="none"/>'),
    health: () => S('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 9v6M9 12h6" stroke-width="2.4"/>'),
    syringe: () => S('<path d="M4 20l3-3M7 17l8-8M13 7l4 4M11 5l3-3 4 4-3 3M6 10l4 4"/>'),
    timer: () => S('<circle cx="12" cy="13" r="7"/><path d="M12 13V9.5M12 4v3M9.5 5.5h5"/><path d="M18 18l2 2"/>'),
    fire: () => S('<path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1 .5-2 .5-2 2 1.5 3 4 3 6a6 6 0 1 1-12 0c0-5 4-7 6.5-11z"/>'),
    thermo: () => S('<path d="M12 4a2 2 0 0 1 2 2v8.2a4 4 0 1 1-4 0V6a2 2 0 0 1 2-2z" fill="none"/><circle cx="12" cy="17" r="2.2" fill="currentColor"/>'),
    pill: () => S('<rect x="3.5" y="9" width="17" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="M9 9l6 6" stroke="none"/>')
  };

  // ---- 品牌 Logo：小芽（首字+绘本成长册+家庭学习角） ----
  function logo(size) {
    size = size || 44;
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-label="小芽"><rect width="64" height="64" rx="16" fill="${C.apricot}"/><path d="M32 46V28" stroke="${C.paper}" stroke-width="3.4" stroke-linecap="round"/><path d="M32 31c0-9-6.5-15-15-15 0 9 6.5 15 15 15z" fill="${C.leafL}"/><path d="M32 31c0-9 6.5-15 15-15 0 9-6.5 15-15 15z" fill="${C.paper}"/><circle cx="32" cy="22" r="3.6" fill="${C.apricotL}"/><path d="M14 50h36" stroke="${C.paper}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/></svg>`;
  }
  // ---- 正方形 App 图标 ----
  function appIcon(size) {
    size = size || 96;
    return `<svg viewBox="0 0 512 512" width="${size}" height="${size}" aria-label="小芽图标"><rect width="512" height="512" rx="112" fill="${C.apricot}"/><rect x="56" y="56" width="400" height="400" rx="72" fill="none" stroke="${C.paper}" stroke-width="10" opacity=".55"/><path d="M256 372V210" stroke="${C.paper}" stroke-width="26" stroke-linecap="round"/><path d="M256 246c0-78-56-130-128-130 0 78 56 130 128 130z" fill="${C.leafL}"/><path d="M256 246c0-78 56-130 128-130 0 78-56 130-128 130z" fill="${C.paper}"/><circle cx="256" cy="176" r="26" fill="${C.apricotL}"/><path d="M120 412h272" stroke="${C.paper}" stroke-width="18" stroke-linecap="round" opacity=".8"/></svg>`;
  }

  // ---- 场景插画（封面 / 主视觉 / 空状态） ----
  const C2 = { ...C };
  function art(inner, vb) {
    return `<svg viewBox="${vb || '0 0 200 200'}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${inner}</svg>`;
  }
  const COVERS = {
    book: (title) => art(`
      <rect width="200" height="200" fill="${C.cream}"/>
      <rect x="46" y="28" width="108" height="146" rx="8" fill="${C.paper}" stroke="${C.apricot}" stroke-width="3"/>
      <rect x="46" y="28" width="14" height="146" rx="6" fill="${C.apricot}"/>
      <circle cx="118" cy="86" r="26" fill="${C.leafL}"/><path d="M110 86c0-9 5-15 16-15 0 9-5 15-16 15z" fill="${C.leaf}"/><path d="M126 86c0-9-5-15-16-15 0 9 5 15 16 15z" fill="${C.apricotL}"/>
      <rect x="70" y="128" width="64" height="7" rx="3.5" fill="${C.apricotD}"/>
      <rect x="78" y="142" width="48" height="6" rx="3" fill="${C.inkF}"/>
      <text x="100" y="60" text-anchor="middle" font-size="13" fill="${C.apricotD}" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-weight="700">${title || '绘本'}</text>`, '0 0 200 200'),
    childArt: () => art(`
      <rect width="200" height="200" fill="${C.paper}"/>
      <rect x="22" y="22" width="156" height="156" rx="6" fill="#FFFDF8" stroke="${C.inkF}" stroke-width="2" stroke-dasharray="6 5"/>
      <circle cx="70" cy="66" r="20" fill="${C.apricotL}"/><g stroke="${C.apricot}" stroke-width="3" stroke-linecap="round"><path d="M70 38v-8M44 66h-8M96 66h8M52 48l-6-6M88 48l6-6"/></g>
      <path d="M40 120l24-26 20 18 16-22 18 24v34H44z" fill="${C.leafL}" stroke="${C.leaf}" stroke-width="2"/>
      <rect x="40" y="146" width="120" height="30" rx="4" fill="${C.sand}"/>
      <path d="M48 162q20-14 40 0t40 0" stroke="${C.berry}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="150" cy="150" r="9" fill="${C.rose}"/><circle cx="150" cy="150" r="3.5" fill="${C.paper}"/>`, '0 0 200 200'),
    height: () => art(`
      <rect width="200" height="220" fill="${C.cream}"/>
      <rect x="40" y="14" width="120" height="196" rx="4" fill="${C.paper}" stroke="${C.inkF}" stroke-width="2"/>
      <g stroke="${C.apricot}" stroke-width="2.4">${[40,70,100,130,160,190].map((y,i)=>`<path d="M58 ${y}h14"/><path d="M58 ${y+15}h9" opacity=".5"/><text x="80" y="${y+4}" font-size="9" fill="${C.inkS}" font-family="sans-serif">${90+i*15}</text>`).join('')}</g>
      <circle cx="138" cy="150" r="11" fill="${C.berry}"/><path d="M138 161v34" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/><circle cx="132" cy="200" r="8" fill="${C.ink}"/><circle cx="146" cy="200" r="8" fill="${C.ink}"/>
      <path d="M58 150h80" stroke="${C.leaf}" stroke-width="3" stroke-dasharray="4 4"/>
      <text x="100" y="212" text-anchor="middle" font-size="9" fill="${C.leaf}" font-family="sans-serif" font-weight="700">105.8 cm</text>`, '0 0 200 220'),
    parentChild: () => art(`
      <rect width="200" height="200" fill="${C.sand}"/>
      <circle cx="156" cy="44" r="22" fill="${C.apricotL}"/>
      <path d="M0 168q60-26 200-10v42H0z" fill="${C.leafL}"/>
      <rect x="30" y="60" width="14" height="60" rx="4" fill="${C.leaf}"/><circle cx="37" cy="54" r="20" fill="${C.leaf}"/>
      <g fill="${C.apricotD}"><circle cx="30" cy="120" r="9"/><circle cx="52" cy="128" r="8"/><circle cx="40" cy="140" r="7"/></g>
      <circle cx="92" cy="78" r="16" fill="${C.rose}"/><rect x="80" y="92" width="24" height="44" rx="10" fill="${C.berry}"/>
      <circle cx="138" cy="92" r="20" fill="${C.apricotL}"/><rect x="120" y="110" width="36" height="52" rx="12" fill="${C.apricot}"/>
      <path d="M110 150q14 12 28 0" stroke="${C.paper}" stroke-width="3" fill="none" stroke-linecap="round"/>`, '0 0 200 200'),
    sticker: () => art(`
      <rect width="200" height="200" fill="${C.paper}"/>
      ${[[52,56,'#E3B577','✓'],[118,52,'#9CC089','★'],[150,108,'#E2A98C','♥'],[60,128,'#AFC5D6','☀'],[120,140,'#C98736','✓']].map(([x,y,col,g])=>`<circle cx="${x}" cy="${y}" r="22" fill="${col}"/><text x="${x}" y="${y+7}" text-anchor="middle" font-size="18" fill="#FFFDF8" font-family="sans-serif">${g}</text>`).join('')}
      <text x="100" y="184" text-anchor="middle" font-size="11" fill="${C.apricotD}" font-family="PingFang SC,sans-serif" font-weight="700">习惯贴纸</text>`, '0 0 200 200'),
    tree: (leaves) => {
      leaves = leaves || 0;
      const spots = [[100,70],[78,86],[122,86],[88,60],[112,60],[70,104],[130,104],[100,100],[84,116],[116,116]];
      let lv = '';
      for (let i = 0; i < Math.min(leaves, 10); i++) {
        const [x, y] = spots[i];
        const col = [C.leaf, C.leafL, C.sage][i % 3];
        lv += `<g class="leaf" style="transform-origin:${x}px ${y}px"><circle cx="${x}" cy="${y}" r="9" fill="${col}"/><path d="M${x} ${y}r0" /><circle cx="${x-2}" cy="${y-2}" r="2.5" fill="#FFFDF8" opacity=".5"/></g>`;
      }
      return art(`
        <rect width="200" height="200" fill="${C.cream}"/>
        <path d="M92 150h16l-3 40h-10z" fill="${C.apricotD}"/>
        <path d="M100 150V96" stroke="${C.apricotD}" stroke-width="8" stroke-linecap="round"/>
        ${leaves>0?lv:`<path d="M100 110c0-10-7-16-16-16 0 10 7 16 16 16z" fill="${C.leafL}"/><path d="M100 110c0-10 7-16 16-16 0 10-7 16-16 16z" fill="${C.leaf}"/>`}
        ${leaves===0?`<text x="100" y="184" text-anchor="middle" font-size="11" fill="${C.leaf}" font-family="PingFang SC,sans-serif" font-weight="700">小芽刚种下</text>`:''}
      `, '0 0 200 200');
    },
    routine: () => art(`
      <rect width="200" height="200" fill="${C.cream}"/>
      <circle cx="100" cy="86" r="44" fill="${C.paper}" stroke="${C.apricot}" stroke-width="4"/>
      <path d="M100 86V58M100 86l26 14" stroke="${C.apricotD}" stroke-width="4" stroke-linecap="round"/>
      <g stroke="${C.apricotL}" stroke-width="3" stroke-linecap="round">${Array.from({length:12}).map((_,i)=>{const a=i*30*Math.PI/180;const x1=100+52*Math.cos(a),y1=86+52*Math.sin(a),x2=100+44*Math.cos(a),y2=86+44*Math.sin(a);return `<path d="M${x1} ${y1}L${x2} ${y2}"/>`}).join('')}</g>
      <rect x="46" y="146" width="108" height="12" rx="6" fill="${C.apricotL}"/><rect x="46" y="164" width="76" height="12" rx="6" fill="${C.leafL}"/><rect x="46" y="182" width="92" height="12" rx="6" fill="${C.sand}"/>`, '0 0 200 200'),
    study: () => art(`
      <rect width="200" height="200" fill="${C.paper}"/>
      <rect x="40" y="56" width="120" height="92" rx="10" fill="${C.paper}" stroke="${C.sage}" stroke-width="3"/>
      <text x="100" y="92" text-anchor="middle" font-size="30" fill="${C.sage}" font-family="sans-serif" font-weight="800">123</text>
      <rect x="56" y="108" width="88" height="10" rx="5" fill="${C.apricotL}"/><rect x="56" y="124" width="60" height="10" rx="5" fill="${C.leafL}"/>
      <path d="M138 40l18 18-30 30-18-18z" fill="${C.apricot}" transform="rotate(8 138 58)"/>
      <path d="M120 88l18-18" stroke="${C.apricotD}" stroke-width="3"/>`, '0 0 200 200'),
    growth: () => art(`
      <rect width="200" height="200" fill="${C.cream}"/>
      <path d="M100 158l34-44-34-44-34 44z" fill="${C.apricot}"/>
      <path d="M100 70l34 44H66z" fill="${C.apricotL}"/>
      <circle cx="100" cy="104" r="9" fill="${C.paper}"/>
      <path d="M54 60l6 12 13 1-9 9 3 13-13-7-13 7 3-13-9-9 13-1z" fill="${C.leafL}"/>`, '0 0 200 200'),
    body: () => art(`
      <rect width="200" height="200" fill="${C.cream}"/>
      <rect x="60" y="24" width="16" height="160" rx="6" fill="${C.paper}" stroke="${C.inkF}" stroke-width="2"/>
      <g stroke="${C.apricot}" stroke-width="2.4">${[40,70,100,130,160].map((y,i)=>`<path d="M76 ${y}h10"/><text x="92" y="${y+4}" font-size="9" fill="${C.inkS}" font-family="sans-serif">${i*5+15}</text>`).join('')}</g>
      <circle cx="138" cy="92" r="16" fill="${C.rose}"/><rect x="122" y="106" width="32" height="46" rx="12" fill="${C.berry}"/>
      <path d="M120 152h44" stroke="${C.apricotD}" stroke-width="3" stroke-dasharray="4 4"/>
      <text x="100" y="196" text-anchor="middle" font-size="9" fill="${C.leaf}" font-family="sans-serif" font-weight="700">105.3 / 16.8</text>`, '0 0 200 200'),
    hobby: () => art(`
      <rect width="200" height="200" fill="${C.paper}"/>
      <path d="M100 52a40 40 0 1 0 0 80c6 0 9-5 9-10 0-3-2-5-2-8 0-3 3-6 6-6h6a20 20 0 0 0 20-20A40 40 0 0 0 100 52z" fill="${C.rose}"/>
      <circle cx="78" cy="86" r="6" fill="${C.apricot}"/><circle cx="100" cy="70" r="6" fill="${C.leaf}"/><circle cx="124" cy="86" r="6" fill="${C.sky}"/><circle cx="88" cy="112" r="6" fill="${C.apricotD}"/><circle cx="116" cy="112" r="6" fill="${C.berry}"/>
      <g fill="${C.leaf}"><circle cx="150" cy="150" r="4"/><circle cx="164" cy="142" r="3"/><circle cx="158" cy="132" r="2.5"/></g>`, '0 0 200 200'),
    family: () => art(`
      <rect width="200" height="200" fill="${C.sand}"/>
      <path d="M0 160q70-24 200-8v48H0z" fill="${C.leafL}"/>
      <circle cx="74" cy="92" r="16" fill="${C.rose}"/><rect x="60" y="106" width="28" height="40" rx="11" fill="${C.berry}"/>
      <circle cx="126" cy="86" r="19" fill="${C.apricotL}"/><rect x="106" y="103" width="40" height="46" rx="13" fill="${C.apricot}"/>
      <path d="M96 142q20 16 36 0" stroke="${C.paper}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M150 70c0-10 7-16 16-16 0 10-7 16-16 16z" fill="${C.leaf}"/><path d="M150 70c0-10-7-16-16-16 0 10 7 16 16 16z" fill="${C.leafL}"/>`, '0 0 200 200'),
    items: () => art(`
      <rect width="200" height="200" fill="${C.paper}"/>
      <path d="M64 84h72l-8 84H72z" fill="${C.sky}"/>
      <path d="M84 84V70a16 16 0 0 1 32 0v14" fill="none" stroke="${C.apricotD}" stroke-width="4"/>
      <g stroke="${C.paper}" stroke-width="3" stroke-linecap="round"><path d="M78 108l8 8 14-16"/><path d="M78 134l8 8 14-16"/><path d="M78 160l8 8 14-16"/></g>
      <text x="118" y="150" text-anchor="middle" font-size="20" fill="${C.apricotD}" font-family="sans-serif" font-weight="800">2/5</text>`, '0 0 200 200'),
    homeVisual: () => art(`
      <rect width="400" height="240" fill="${C.cream}"/>
      <path d="M0 200q200-50 400-20v60H0z" fill="${C.leafL}" opacity=".5"/>
      <rect x="36" y="60" width="150" height="120" rx="10" fill="${C.sand}"/>
      <rect x="48" y="74" width="126" height="40" rx="6" fill="${C.paper}"/><text x="111" y="100" text-anchor="middle" font-size="15" fill="${C.apricotD}" font-family="PingFang SC,sans-serif" font-weight="800">苗苗的成长册</text>
      <rect x="48" y="122" width="58" height="48" rx="5" fill="${C.apricotL}"/><rect x="116" y="122" width="58" height="48" rx="5" fill="${C.leafL}"/>
      <circle cx="88" cy="200" r="0" />
      <rect x="220" y="70" width="64" height="110" rx="6" fill="${C.apricotD}"/>
      <path d="M252 80v90" stroke="${C.paper}" stroke-width="3"/><path d="M232 110h40M232 140h40" stroke="${C.paper}" stroke-width="2" opacity=".7"/>
      <rect x="300" y="96" width="70" height="84" rx="8" fill="${C.paper}" stroke="${C.inkF}" stroke-width="2"/>
      <circle cx="335" cy="124" r="13" fill="${C.leafL}"/><path d="M318 168l17-18 14 14 12-16" stroke="${C.berry}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="120" cy="40" r="18" fill="${C.apricotL}"/><g stroke="${C.apricot}" stroke-width="2.5" stroke-linecap="round"><path d="M120 20v-7M100 40h-7M140 40h7"/></g>
      <path d="M250 200c0-12-8-20-18-20 0 12 8 20 18 20z" fill="${C.leaf}"/><path d="M250 200c0-12 8-20 18-20 0 12-8 20-18 20z" fill="${C.leafL}"/>`, '0 0 400 240'),
    empty: () => art(`
      <rect width="200" height="200" fill="${C.cream}"/>
      <path d="M86 150h28l-5 30h-18z" fill="${C.apricotD}"/>
      <path d="M100 150V104" stroke="${C.apricotD}" stroke-width="7" stroke-linecap="round"/>
      <path d="M100 118c0-16-11-26-25-26 0 16 11 26 25 26z" fill="${C.leafL}"/>
      <path d="M100 118c0-16 11-26 25-26 0 16-11 26-25 26z" fill="${C.leaf}"/>
      <circle cx="100" cy="86" r="5" fill="${C.apricotL}"/>
      <path d="M60 184h80" stroke="${C.inkF}" stroke-width="2.5" stroke-dasharray="5 6" stroke-linecap="round"/>`, '0 0 200 200')
  };

  window.XY = { C, ICON, logo, appIcon, COVERS };
})();
