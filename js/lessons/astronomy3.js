/* 宇宙探险（第三组）：宇航员的装备 → 陨石坑 → 光速旅行 → 失重的秘密 → 恒星的一生 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 11. 宇航员的装备 ================= */
  const GEAR = [
    ['tank', '氧气背包', '太空里没有空气，不能呼吸！', '氧气背包能一直提供呼吸用的氧气。'],
    ['suit', '宇航服', '太空里有太阳照着的地方超过 100°C，背阴的地方低于零下 100°C！', '宇航服像一个小房间，保持合适的温度和气压。'],
    ['helmet', '头盔面罩', '太空里的阳光特别刺眼，还有看不见的有害射线。', '头盔的金色面罩能挡住强光和射线。'],
    ['gloves', '手套', '要抓住扶手、拧螺丝，手还不能冻着。', '加厚的手套既保暖，指尖又能灵活活动。'],
    ['boots', '靴子', '要在月球坑坑洼洼的土地上走路。', '厚厚的靴子防滑、隔热，能保护双脚。'],
  ];

  Sci.register({
    id: 'astronaut',
    subject: 'astronomy',
    level: 1,
    emoji: '🌌',
    title: '宇航员的装备',
    desc: '太空里没有空气，宇航员要穿戴什么？',
    intro: '宇航员要去太空行走啦！可是太空和地球很不一样：没有空气，忽冷忽热，阳光还特别刺眼。小博士会告诉你太空里的一个个难题，请你从下面选出能解决它的装备，帮宇航员一件一件穿戴好！',
    goal: '帮宇航员穿戴好 5 件装备',
    fact: '<p>太空是一个非常危险的地方：<b>没有空气</b>，不能呼吸，声音也传不过去；<b>温差很大</b>，太阳照着很热，背阴的地方非常冷；还有<b>强烈的阳光和射线</b>。</p><p>所以宇航员出舱时要穿着厚厚的<b>舱外航天服</b>，它就像一艘小小的“飞船”，有氧气、能保温、能通话。我国的“飞天”舱外航天服重 120 多千克，在太空里却轻飘飘的。</p>',
    quiz: [
      { q: '为什么宇航员在太空里要背氧气？', options: ['太空里没有空气', '氧气背包很好看'], answer: 0, explain: '太空里没有可以呼吸的空气。' },
      { q: '在太空里，两个宇航员不用对讲机，能直接听到对方说话吗？', options: ['能', '不能'], answer: 1, explain: '声音需要空气传播，太空里没有空气。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const order = Sci.shuffle(GEAR.map(g => g[0]));
      let qi = 0;
      const worn = new Set();
      const cardX = i => 80 + i * 160;

      function ask() {
        if (qi >= order.length) return;
        const g = GEAR.find(x => x[0] === order[qi]);
        api.note(`🦉 难题：${g[2]} 选哪件装备？`);
      }
      api.pointer(st, {
        down(p) {
          if (p.y < 360 || qi >= order.length) return;
          const i = GEAR.findIndex((g, k) => Math.abs(p.x - cardX(k)) < 70);
          if (i < 0) return;
          const g = GEAR[i];
          if (worn.has(g[0])) { api.note(`${g[1]}已经穿戴好啦。`); return; }
          if (g[0] !== order[qi]) { Sci.sfx('bad'); api.note(`${g[1]}解决不了这个难题哦，再想一想。`); return; }
          worn.add(g[0]);
          qi++;
          Sci.sfx('good');
          api.note(`✅ ${g[1]}：${g[3]}`);
          if (qi < order.length) api.timeout(ask, 2600);
          else api.timeout(() => { api.note('🎉 宇航员全副武装，可以出舱行走啦！'); api.goalDone(); }, 2400);
        },
      });
      function render() {
        ctx.fillStyle = '#0b1033';
        ctx.fillRect(0, 0, 800, 450);
        for (let i = 0; i < 60; i++) D.circle(ctx, (i * 139) % 800, (i * 83) % 340, 1.2, 'rgba(255,255,255,.6)');
        D.circle(ctx, 680, 80, 50, '#1c3d6e');
        ctx.beginPath();
        ctx.arc(680, 80, 50, Math.PI / 2, Math.PI * 1.5);
        ctx.fillStyle = '#4dabf7';
        ctx.fill();
        const X = 300, Y = 190;
        if (worn.has('tank')) { D.rrect(ctx, X - 55, Y - 70, 110, 120, 16); ctx.fillStyle = '#ced4da'; ctx.fill(); }
        // 身体
        ctx.fillStyle = worn.has('suit') ? '#f8f9fa' : '#ffd8a8';
        D.rrect(ctx, X - 45, Y - 60, 90, 120, 26);
        ctx.fill();
        ctx.strokeStyle = worn.has('suit') ? '#adb5bd' : '#e8a87c';
        ctx.lineWidth = 3;
        ctx.stroke();
        if (worn.has('suit')) { ctx.fillStyle = '#e03131'; ctx.fillRect(X - 30, Y - 30, 22, 14); D.rrect(ctx, X - 10, Y - 5, 40, 30, 6); ctx.fillStyle = '#4c6ef5'; ctx.fill(); }
        // 手臂和手
        [-1, 1].forEach(s => {
          ctx.strokeStyle = worn.has('suit') ? '#f8f9fa' : '#ffd8a8';
          ctx.lineWidth = 26;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(X + s * 50, Y - 40);
          ctx.lineTo(X + s * 85, Y + 30);
          ctx.stroke();
          D.circle(ctx, X + s * 88, Y + 40, 15, worn.has('gloves') ? '#495057' : '#ffd8a8');
          // 腿和脚
          ctx.strokeStyle = worn.has('suit') ? '#f8f9fa' : '#4dabf7';
          ctx.lineWidth = 30;
          ctx.beginPath();
          ctx.moveTo(X + s * 22, Y + 60);
          ctx.lineTo(X + s * 26, Y + 130);
          ctx.stroke();
          D.rrect(ctx, X + s * 26 - 22, Y + 128, 44, worn.has('boots') ? 28 : 16, 8);
          ctx.fillStyle = worn.has('boots') ? '#343a40' : '#ffd8a8';
          ctx.fill();
        });
        // 头
        D.circle(ctx, X, Y - 95, 34, '#ffd8a8');
        D.text(ctx, '🙂', X, Y - 93, { size: 40 });
        if (worn.has('helmet')) {
          D.circle(ctx, X, Y - 95, 50, 'rgba(255,255,255,.25)', '#f1f3f5', 6);
          ctx.beginPath();
          ctx.arc(X, Y - 95, 38, -Math.PI * 0.9, -Math.PI * 0.1);
          ctx.lineTo(X, Y - 95);
          ctx.fillStyle = 'rgba(250,176,5,.55)';
          ctx.fill();
        }
        // 装备卡片
        GEAR.forEach((g, i) => {
          const x = cardX(i);
          D.rrect(ctx, x - 68, 365, 136, 70, 14);
          ctx.fillStyle = worn.has(g[0]) ? '#2b8a3e' : '#fff';
          ctx.fill();
          D.text(ctx, (worn.has(g[0]) ? '✅ ' : '') + g[1], x, 400, { size: 18, color: worn.has(g[0]) ? '#fff' : '#2b2840' });
        });
        if (qi < order.length) {
          const g = GEAR.find(x => x[0] === order[qi]);
          D.rrect(ctx, 460, 150, 320, 120, 16);
          ctx.fillStyle = 'rgba(255,255,255,.92)';
          ctx.fill();
          D.text(ctx, '🦉 太空难题', 620, 175, { size: 16, color: '#c0620a' });
          D.wrap(ctx, g[2], 620, 205, 290, 24, { size: 16 });
        }
      }
      api.loop(render);
      ask();
    },
  });

  /* ================= 12. 陨石坑 ================= */
  const ROCKS = [[8, '小石子'], [16, '大石头'], [30, '小山那么大']];

  Sci.register({
    id: 'crater',
    subject: 'astronomy',
    level: 2,
    emoji: '☄️',
    title: '陨石坑',
    desc: '月亮上为什么有那么多“坑”？',
    intro: '用望远镜看月亮，能看到上面有好多圆圆的大坑，这些是“陨石坑”，是太空里的石头撞出来的。你来扔陨石吧！选好陨石的大小，在月面上点一下，看看会撞出多大的坑。然后给它加上像地球一样的大气层，再试试看！',
    goal: '撞出 5 个陨石坑（包括 1 个大坑），再试试有大气层时的情况',
    fact: '<p>太空中有很多大大小小的石块，撞到月球表面，就砸出了圆形的<b>陨石坑</b>。陨石越大、速度越快，砸出的坑越大，坑的周围还会隆起一圈“坑壁”。</p><p>月球<b>没有大气层</b>保护，再小的石头也能直接砸到地面；月球上也没有风和雨，几十亿年前的陨石坑一直保留到了今天。</p><p>🌠 地球有厚厚的大气层，大多数小陨石在空中就和空气摩擦烧掉了，变成了夜空中划过的<b>流星</b>。</p>',
    quiz: [
      { q: '为什么月球上的陨石坑特别多？', options: ['没有大气层保护，坑也不会被风雨抹平', '月球上的人挖的'], answer: 0, explain: '月球没有大气层，也没有风雨。' },
      { q: '流星是怎么来的？', options: ['小陨石在大气层里燃烧发光', '星星掉下来了'], answer: 0, explain: '小陨石和空气摩擦，烧得发光。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let size = 0, air = false, falling = [], craters = [], big = false, burned = false, flash = null, t = 0;

      function check() {
        if (craters.length >= 5 && big && burned) api.goalDone();
      }
      api.pointer(st, {
        down(p) {
          if (p.y < 120 || falling.length > 2) return;
          falling.push({ tx: p.x, ty: p.y, x: p.x - 260, y: -20, k: 0, r: ROCKS[size][0], burn: air && size < 2 });
          Sci.sfx('whoosh');
        },
      });
      function render() {
        ctx.fillStyle = air ? '#5c7cfa' : '#05070f';
        ctx.fillRect(0, 0, 800, 120);
        if (air) { const g = ctx.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, '#1c2a6b'); g.addColorStop(1, '#91a7ff'); ctx.fillStyle = g; ctx.fillRect(0, 0, 800, 120); D.text(ctx, '大气层', 60, 100, { size: 15, color: '#fff' }); }
        ctx.fillStyle = '#adb5bd';
        ctx.fillRect(0, 120, 800, 330);
        for (let i = 0; i < 80; i++) D.circle(ctx, (i * 97) % 800, 130 + (i * 61) % 320, 2 + (i % 3), 'rgba(120,120,130,.35)');
        craters.forEach(c => {
          D.circle(ctx, c.x, c.y, c.r * 1.25, '#c4c9cf');
          ctx.beginPath();
          ctx.ellipse(c.x, c.y, c.r, c.r * 0.8, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#7d848c';
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(c.x + c.r * 0.15, c.y + c.r * 0.12, c.r * 0.8, c.r * 0.6, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#9aa1a9';
          ctx.fill();
        });
        falling.forEach(f => {
          const glow = f.burn ? 1 - f.k : 0.3;
          ctx.strokeStyle = `rgba(255,170,60,${0.3 + glow * 0.6})`;
          ctx.lineWidth = f.r * 0.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(f.x - 40, f.y - 40);
          ctx.lineTo(f.x, f.y);
          ctx.stroke();
          D.circle(ctx, f.x, f.y, f.r * (f.burn ? 1 - f.k * 0.9 : 1) * 0.6, '#6b4f3a');
        });
        if (flash) D.circle(ctx, flash.x, flash.y, flash.r, `rgba(255,240,200,${flash.a})`);
        D.text(ctx, `陨石坑 ${craters.length} 个${big ? '（有大坑了）' : ''}`, 20, 26, { size: 16, align: 'left', color: '#fff' });
        D.text(ctx, '👆 在月面上点一下，扔一颗陨石', 780, 26, { size: 14, align: 'right', color: '#ced4da', weight: 'normal' });
      }
      api.loop(dt => {
        t += dt;
        for (let i = falling.length - 1; i >= 0; i--) {
          const f = falling[i];
          f.k += dt * 1.6;
          f.x = lerp(f.tx - 260, f.tx, f.k);
          f.y = lerp(-20, f.ty, f.k);
          if (f.burn && f.y > 110) {
            falling.splice(i, 1);
            burned = true;
            Sci.sfx('pop');
            api.note('🌠 陨石在大气层里和空气摩擦，烧掉了，变成了一颗流星！地球就是这样被大气层保护着。');
            check();
            continue;
          }
          if (f.k >= 1) {
            falling.splice(i, 1);
            const r = f.r * 2.4;
            craters.push({ x: f.tx, y: f.ty, r });
            flash = { x: f.tx, y: f.ty, r: r * 2, a: 0.9 };
            if (f.r >= 30) big = true;
            Sci.sfx('plop');
            Sci.tone(80, 0.4, { type: 'sawtooth', vol: 0.06, to: 40 });
            api.note(`砰！${ROCKS.find(x => x[0] === f.r)[1]}的陨石撞出了一个${f.r >= 30 ? '超大' : f.r >= 16 ? '中等' : '小'}坑。` + (air && f.r >= 30 ? '太大的陨石，大气层也烧不完！' : ''));
            check();
          }
        }
        if (flash) { flash.a -= dt * 2; flash.r += dt * 60; if (flash.a <= 0) flash = null; }
        render();
      });
      api.choice(ROCKS.map((r, i) => [i, `☄️ ${r[1]}`]), size, v => { size = v; });
      const row2 = api.row();
      api.toggle('🌍 加上大气层（像地球）', false, v => { air = v; api.note(v ? '现在有了大气层，再扔几颗小陨石试试。' : '大气层拿走了，回到月球的样子。'); }, row2);
      api.button('🧹 抹平月面', () => { craters = []; }, row2);
      api.note('👆 选好陨石大小，在月面上点一下。');
    },
  });

  /* ================= 13. 光速旅行 ================= */
  const STOPS = [['水星', 0.39, 3.2], ['金星', 0.72, 6], ['地球', 1, 8.3], ['火星', 1.52, 12.7], ['木星', 5.2, 43], ['土星', 9.5, 79], ['天王星', 19.2, 160], ['海王星', 30, 250]];

  Sci.register({
    id: 'lightspeed',
    subject: 'astronomy',
    level: 3,
    emoji: '💡',
    title: '光速旅行',
    desc: '跑得最快的光，从太阳到地球要多久？',
    intro: '光是宇宙里跑得最快的东西，每秒能跑 30 万千米，一秒钟能绕地球七圈半！可是太阳系实在太大了，就连光也要跑好一会儿。点“出发”，跟着一束阳光从太阳出发，看看它到达每颗行星要花多少时间。',
    goal: '跟着阳光到达地球、木星和海王星',
    fact: '<p><b>光速</b>约为每秒 <b>30 万千米</b>。光从月球到地球只要 1.3 秒，从太阳到地球要 <b>8 分多钟</b>，到海王星要 4 个多小时！</p><p>所以我们看到的太阳，其实是 8 分钟以前的太阳；看到的遥远星星，可能是几百年、几千年前发出的光。</p><p>天文学家用“<b>光年</b>”量更远的距离：1 光年就是光走一年的路程，大约 9.5 万亿千米。离太阳最近的恒星，也有 4.2 光年远。</p>',
    quiz: [
      { q: '阳光从太阳照到地球，大约要多久？', options: ['8 分钟', '8 秒', '8 天'], answer: 0, explain: '大约 8 分 20 秒。' },
      { q: '“光年”是用来表示什么的？', options: ['距离', '时间', '重量'], answer: 0, explain: '光年是光走一年的距离。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const xOf = au => 60 + Math.sqrt(au / 30) * 700;
      let minutes = 0, running = false, fast = false;
      const reached = new Set();
      const fmt = m => (m < 60 ? `${m.toFixed(1)} 分钟` : `${Math.floor(m / 60)} 小时 ${Math.round(m % 60)} 分`);

      function render() {
        ctx.fillStyle = '#05070f';
        ctx.fillRect(0, 0, 800, 450);
        for (let i = 0; i < 70; i++) D.circle(ctx, (i * 131) % 800, (i * 71) % 450, 1, 'rgba(255,255,255,.4)');
        const g = ctx.createRadialGradient(0, 230, 10, 0, 230, 70);
        g.addColorStop(0, '#fff3bf');
        g.addColorStop(1, 'rgba(255,190,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 160, 80, 140);
        D.circle(ctx, 0, 230, 40, '#ffd43b');
        ctx.strokeStyle = 'rgba(255,255,255,.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 230);
        ctx.lineTo(780, 230);
        ctx.stroke();
        // 光跑到哪里了（按“分钟”换算成距离）
        const au = minutes / 8.3;
        const lx = au >= 30 ? xOf(30) : xOf(au);
        if (minutes > 0) {
          ctx.strokeStyle = 'rgba(255,230,120,.8)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(40, 230);
          ctx.lineTo(lx, 230);
          ctx.stroke();
          D.circle(ctx, lx, 230, 8, '#fff9db');
        }
        STOPS.forEach(([n, d, m], i) => {
          const x = xOf(d), up = i % 2 ? -1 : 1;
          D.circle(ctx, x, 230, [5, 7, 7, 6, 16, 14, 10, 10][i], reached.has(n) ? '#69db7c' : '#adb5bd');
          D.text(ctx, n, x, 230 + up * 34, { size: 14, color: '#fff' });
          if (reached.has(n)) D.text(ctx, fmt(m), x, 230 + up * 56, { size: 12, color: '#ffe066', weight: 'normal' });
        });
        D.text(ctx, `⏱️ 光已经跑了 ${fmt(minutes)}`, 400, 60, { size: 24, color: '#ffe066' });
        D.text(ctx, '（距离不是按真实比例画的，越远的地方画得越挤）', 400, 410, { size: 13, color: '#868e96', weight: 'normal' });
        D.text(ctx, `${reached.has('地球') ? '✅' : '⬜'} 地球　${reached.has('木星') ? '✅' : '⬜'} 木星　${reached.has('海王星') ? '✅' : '⬜'} 海王星`, 400, 100, { size: 15, color: '#fff' });
      }
      api.loop(dt => {
        if (running) {
          minutes += dt * (fast ? 40 : 4) * (minutes < 15 ? 1 : 2.5);
          STOPS.forEach(([n, , m]) => {
            if (minutes >= m && !reached.has(n)) {
              reached.add(n);
              Sci.sfx('good');
              api.note(`☀️ 阳光到达${n}啦！用了 ${fmt(m)}。` + (n === '地球' ? '我们看到的太阳，其实是 8 分钟以前的样子！' : ''));
            }
          });
          if (minutes >= 250) {
            running = false;
            minutes = 250;
            if (['地球', '木星', '海王星'].every(n => reached.has(n))) api.goalDone();
          }
        }
        render();
      });
      api.button('☀️ 出发！', () => { if (!running) { if (minutes >= 250) { minutes = 0; reached.clear(); } running = true; } });
      api.toggle('⏩ 快进', false, v => { fast = v; });
      api.button('🔄 重来', () => { minutes = 0; running = false; reached.clear(); });
      api.note('👆 点“出发！”，阳光从太阳出发了。');
    },
  });

  /* ================= 14. 失重的秘密 ================= */
  const LIFT = [
    ['rest', '停着不动', 0, '电梯停着，体重秤显示正常的体重。'],
    ['up', '加速往上', 4, '电梯加速往上时，脚底被压得更紧，体重秤的读数变大了——这叫“超重”。'],
    ['down', '加速往下', -4, '电梯加速往下时，读数变小了——这叫“失重”，肚子里有点空空的感觉。'],
    ['free', '一起往下掉', -9.8, '人和体重秤一起往下掉，体重秤上读数变成了 0！小朋友飘起来了——这就是“完全失重”。'],
  ];

  Sci.register({
    id: 'weightless',
    subject: 'astronomy',
    level: 4,
    emoji: '🛰️',
    title: '失重的秘密',
    desc: '宇航员为什么能在空间站里飘来飘去？',
    intro: '在空间站里，宇航员和水滴都能飘在空中，是因为那里没有引力吗？其实不是！秘密要从电梯说起：站在电梯里的体重秤上，电梯停着、往上加速、往下加速，读数都不一样。试一试，再想想空间站里是怎么回事。',
    goal: '让电梯分别停着、加速往上、加速往下、一起往下掉',
    fact: '<p>体重秤显示的，是我们压在它上面的力。电梯<b>加速往上</b>时读数变大（<b>超重</b>）；<b>加速往下</b>时读数变小（<b>失重</b>）；如果人和秤一起自由下落，读数就变成 0（<b>完全失重</b>）。</p><p>空间站离地面约 400 千米，那里的地球引力其实还有地面的九成！空间站一直在高速绕着地球“往下掉”，可因为飞得足够快，总也掉不到地上。宇航员和空间站一起“掉”，所以就处于<b>完全失重</b>的状态，飘了起来。</p>',
    quiz: [
      { q: '电梯加速往上时，体重秤的读数会？', options: ['变大', '变小', '不变'], answer: 0, explain: '加速往上是超重，读数变大。' },
      { q: '空间站里的宇航员会飘起来，是因为？', options: ['和空间站一起绕地球“下落”，完全失重', '那里一点引力都没有'], answer: 0, explain: '那里还有很强的引力，宇航员和空间站一起在下落。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const MASS = 30;
      let mode = LIFT[0], y = 200, v = 0, float = 0, t = 0, timer = 0;
      const tried = new Set(['rest']);
      const reading = () => Math.max(0, MASS * (9.8 + mode[2]) / 9.8);

      function pick(m) {
        mode = m;
        timer = 0;
        tried.add(m[0]);
        Sci.sfx(m[0] === 'free' ? 'whoosh' : 'click');
        api.note(`${m[1]}：${m[3]}`);
        if (tried.size === 4) api.timeout(() => { api.note('🎉 你发现了失重的秘密！空间站一直在绕着地球“往下掉”，所以宇航员能飘起来。'); api.goalDone(); }, 2600);
      }
      api.loop(dt => {
        t += dt;
        timer += dt;
        // 演示 2.5 秒后电梯慢慢停回中间
        const acc = timer < 2.5 ? -mode[2] * 12 : (200 - y) * 3 - v * 3;
        v += acc * dt;
        y = clamp(y + v * dt, 70, 330);
        if (y <= 70 || y >= 330) v = 0;
        float += ((mode[0] === 'free' && timer < 2.5 ? 1 : 0) - float) * Math.min(1, dt * 4);
        if (timer > 2.5 && mode[0] !== 'rest') { mode = LIFT[0]; }
        // 画面
        ctx.fillStyle = '#e9ecef';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#ced4da';
        ctx.fillRect(170, 0, 260, 450);
        ctx.strokeStyle = '#868e96';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(300, 0);
        ctx.lineTo(300, y - 100);
        ctx.stroke();
        D.rrect(ctx, 190, y - 100, 220, 200, 10);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#495057';
        ctx.stroke();
        // 体重秤和小朋友
        D.rrect(ctx, 250, y + 70, 100, 22, 6);
        ctx.fillStyle = '#495057';
        ctx.fill();
        D.text(ctx, reading().toFixed(0) + ' kg', 300, y + 81, { size: 13, color: '#8ce99a' });
        D.emoji(ctx, mode[0] === 'free' ? '😮' : '🙂', 300, y + 20 - float * 45 + Math.sin(t * 3) * float * 6, 60);
        // 读数大字
        D.text(ctx, `体重秤：${reading().toFixed(0)} 千克`, 620, 120, { size: 26, color: '#2b2840' });
        D.text(ctx, mode[0] === 'up' ? '超重 ⬆' : mode[0] === 'down' ? '失重 ⬇' : mode[0] === 'free' ? '完全失重！' : '正常', 620, 165, { size: 22, color: mode[0] === 'rest' ? '#495057' : '#e8590c' });
        D.text(ctx, `小朋友的质量一直是 ${MASS} 千克`, 620, 205, { size: 14, color: '#6f6a85', weight: 'normal' });
        LIFT.forEach((m, i) => D.text(ctx, `${tried.has(m[0]) ? '✅' : '⬜'} ${m[1]}`, 540, 260 + i * 28, { size: 15, align: 'left' }));
        D.emoji(ctx, '🛰️', 720, 400, 40);
      });
      LIFT.slice(1).forEach(m => api.button({ up: '⬆️ 加速往上', down: '⬇️ 加速往下', free: '🎢 一起往下掉' }[m[0]], () => pick(m)));
      api.note('👆 点下面的按钮让电梯动起来，看看体重秤的读数。');
    },
  });

  /* ================= 15. 恒星的一生 ================= */
  const LIVES = {
    small: { name: '像太阳一样的恒星', stages: [['星云', '一大团气体和尘埃，在引力作用下慢慢收缩', '#9775fa', 60], ['主序星', '中心开始核聚变，稳定地发光约 100 亿年', '#ffd43b', 40], ['红巨星', '燃料快用完了，外层膨胀得巨大无比', '#ff6b6b', 110], ['行星状星云', '外层气体慢慢飘散，像一个美丽的光环', '#63e6be', 90], ['白矮星', '只剩下一个地球大小、非常致密的“余烬”', '#e7f5ff', 14]] },
    big: { name: '比太阳重得多的恒星', stages: [['星云', '一大团气体和尘埃，在引力作用下慢慢收缩', '#9775fa', 60], ['蓝巨星', '又大又亮，燃料烧得飞快，只能活几千万年', '#74c0fc', 60], ['红超巨星', '膨胀成比太阳大几百倍的巨星', '#fa5252', 140], ['超新星爆发', '一场巨大的爆炸，比整个星系还亮', '#fff3bf', 170], ['中子星或黑洞', '剩下的核心塌缩成中子星，最重的变成连光都逃不掉的黑洞', '#212529', 18]] },
  };

  Sci.register({
    id: 'starlife',
    subject: 'astronomy',
    level: 5,
    emoji: '🌟',
    title: '恒星的一生',
    desc: '星星也会出生、长大、变老',
    intro: '天上的恒星也有自己的一生：从一团气体中出生，发光几百万到几百亿年，最后走向终点。恒星的结局取决于它出生时有多重！选一颗像太阳一样的恒星，再选一颗比太阳重得多的恒星，看看它们的一生有什么不同。',
    goal: '看完两种恒星的一生',
    fact: '<p>恒星诞生于巨大的气体尘埃云（<b>星云</b>）。中心温度足够高时，氢开始<b>核聚变</b>变成氦，放出大量光和热，恒星就“点亮”了。</p><p><b>像太阳这样的恒星</b>：发光约 100 亿年，变成<b>红巨星</b>，最后抛掉外层，留下<b>白矮星</b>。太阳现在大约 46 亿岁，正值“中年”。</p><p><b>质量很大的恒星</b>：燃烧得更快，寿命更短，最后发生<b>超新星爆发</b>，留下<b>中子星</b>或<b>黑洞</b>。我们身体里的很多元素，最初都是在恒星里“炼”出来的——我们都是星星的孩子！</p>',
    quiz: [
      { q: '太阳最后会变成什么？', options: ['白矮星', '黑洞', '超新星'], answer: 0, explain: '太阳质量不够大，最后会变成白矮星。' },
      { q: '质量越大的恒星，寿命会怎样？', options: ['越短', '越长'], answer: 0, explain: '大恒星燃料烧得特别快，寿命反而短。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let kind = 'small', stage = -1, k = 0, playing = false, t = 0;
      const watched = new Set();

      function play() {
        if (playing) return;
        stage = 0;
        k = 0;
        playing = true;
        say();
      }
      function say() {
        const s = LIVES[kind].stages[stage];
        api.note(`${stage + 1}. ${s[0]}：${s[1]}。`);
      }
      api.loop(dt => {
        t += dt;
        if (playing) {
          k += dt / 2.8;
          if (k >= 1) {
            k = 0;
            stage++;
            if (stage >= 5) {
              stage = 4;
              playing = false;
              watched.add(kind);
              Sci.sfx('star');
              api.note(kind === 'small' ? '✨ 像太阳一样的恒星，最后安静地变成了白矮星。' : '💥 大质量恒星经历超新星爆发，最后变成了中子星或黑洞！');
              if (watched.size === 2) api.goalDone();
            } else {
              Sci.sfx(stage === 3 && kind === 'big' ? 'whoosh' : 'pop');
              say();
            }
          }
        }
        ctx.fillStyle = '#05070f';
        ctx.fillRect(0, 0, 800, 450);
        for (let i = 0; i < 80; i++) D.circle(ctx, (i * 151) % 800, (i * 67) % 450, 1, 'rgba(255,255,255,.45)');
        const L = LIVES[kind].stages;
        if (stage >= 0) {
          const cur = L[stage], nxt = L[Math.min(4, stage + 1)];
          const e = playing ? Sci.smooth(0.6, 1, k) : 0;
          const r = lerp(cur[3], nxt[3], e), col = cur[2];
          const cx = 300, cy = 220;
          if (cur[0] === '星云') {
            for (let i = 0; i < 40; i++) D.circle(ctx, cx + Math.cos(i * 2.4) * r * (1.2 - k * 0.5) + Math.sin(t + i) * 4, cy + Math.sin(i * 1.7) * r * (0.9 - k * 0.3), 14, 'rgba(151,117,250,.25)');
          } else if (cur[0] === '行星状星云') {
            D.circle(ctx, cx, cy, r * (1 + k * 0.3), null, 'rgba(99,230,190,.6)', 14);
            D.circle(ctx, cx, cy, 10, '#e7f5ff');
          } else if (cur[0] === '超新星爆发') {
            D.circle(ctx, cx, cy, r * (0.6 + k), `rgba(255,243,191,${1 - k * 0.6})`);
            for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; D.arrow(ctx, cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5, cx + Math.cos(a) * r * (0.9 + k), cy + Math.sin(a) * r * (0.9 + k), 'rgba(255,200,80,.7)', 3, 10); }
          } else if (cur[0] === '中子星或黑洞') {
            D.circle(ctx, cx, cy, 40, null, 'rgba(255,160,60,.7)', 6);
            D.circle(ctx, cx, cy, r + 10, '#000');
          } else {
            const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r * 1.5);
            g.addColorStop(0, '#fff');
            g.addColorStop(0.5, col);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
          D.text(ctx, cur[0], cx, 410, { size: 26, color: '#fff' });
        } else D.text(ctx, '点“开始”，看看一颗恒星的一生', 300, 220, { size: 20, color: '#ced4da' });
        // 一生的时间线
        L.forEach((s, i) => {
          const y = 70 + i * 66;
          D.rrect(ctx, 560, y - 24, 220, 50, 12);
          ctx.fillStyle = i === stage ? 'rgba(255,212,59,.3)' : 'rgba(255,255,255,.08)';
          ctx.fill();
          D.text(ctx, `${i + 1}. ${s[0]}`, 575, y, { size: 16, align: 'left', color: i <= stage ? '#fff' : '#868e96' });
        });
        D.text(ctx, LIVES[kind].name, 20, 26, { size: 16, align: 'left', color: '#ffe066' });
        D.text(ctx, `${watched.has('small') ? '✅' : '⬜'} 像太阳的恒星　${watched.has('big') ? '✅' : '⬜'} 大质量恒星`, 20, 52, { size: 14, align: 'left', color: '#fff' });
      });
      api.choice([['small', '☀️ 像太阳一样重'], ['big', '💫 比太阳重 20 倍']], kind, v => { if (playing) return; kind = v; stage = -1; });
      api.button('▶ 开始', play);
      api.note('👆 先选一颗恒星，再点“开始”。');
    },
  });
})();
