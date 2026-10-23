/* 化学魔术：水的三种样子 → 溶解 → 紫甘蓝变色（酸和碱） */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 1. 水的三种样子 ================= */
  const PHASES = {
    solid: { e: '🧊', name: '冰（固体）', desc: '水分子手拉手排好队，只能在原地抖一抖，所以冰有固定的形状。' },
    liquid: { e: '💧', name: '水（液体）', desc: '水分子松开了手，挤在一起滑来滑去，所以水会流动，没有固定的形状。' },
    gas: { e: '☁️', name: '水蒸气（气体）', desc: '水分子跑得飞快，到处乱飞，所以水蒸气会飘走，还看不见呢！' },
  };
  const CHANGE_MSG = {
    'solid>liquid': '🧊➡💧 冰受热融化成了水！这叫“熔化”。',
    'liquid>gas': '💧➡☁️ 水烧开了，变成水蒸气飞走啦！这叫“汽化”。',
    'gas>liquid': '☁️➡💧 水蒸气冷下来，又变回了水！这叫“液化”。',
    'liquid>solid': '💧➡🧊 水冷到 0℃ 以下结成了冰！这叫“凝固”。',
  };

  Sci.register({
    id: 'water',
    subject: 'chemistry',
    level: 1,
    emoji: '🧊',
    title: '水的三种样子',
    desc: '冰、水、水蒸气，原来是同一个东西',
    intro: '冰块、喝的水、烧水时冒出的水蒸气，看起来完全不一样，其实它们都是水！水是由许许多多看不见的“水分子”组成的。拖动温度滑块，看看这些蓝色小家伙在冷和热的时候都在干什么？',
    goal: '让水分别变成冰、水和水蒸气',
    fact: '<p>水有三种样子：<b>固体的冰</b>、<b>液体的水</b>、<b>气体的水蒸气</b>。它们都是同样的水分子，只是分子“运动的快慢”不一样。</p><p>温度越高，分子动得越快：0℃ 以下水会结冰，到了 100℃ 水会沸腾变成水蒸气。</p><p>🌧️ 天上的云和雨，就是水蒸气飞到高空遇冷，又变成了小水滴。水就这样在大自然里不停地旅行！</p>',
    quiz: [
      { q: '冰块放在太阳下，会变成什么？', options: ['水', '石头', '沙子'], answer: 0, explain: '冰受热会融化成水。' },
      { q: '洗完热水澡，镜子上为什么会有小水珠？', options: ['水蒸气遇到冷镜子变成了小水珠', '镜子自己出汗了'], answer: 0, explain: '热乎乎的水蒸气碰到凉凉的镜子，就变回了小水珠。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const BOX = { x: 40, y: 40, w: 460, h: 350 }, PR = 11, COLS = 9, ROWS = 5, SP = 25;
      let T = 20, Tt = 20, t = 0, phase = 'liquid';
      const seen = new Set(['liquid']);
      const homes = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          homes.push({ x: BOX.x + BOX.w / 2 + (c - (COLS - 1) / 2) * SP + (r % 2 ? SP / 4 : -SP / 4), y: BOX.y + BOX.h - 16 - r * SP * 0.9 });
        }
      }
      const parts = homes.map(() => ({ x: rand(BOX.x + 20, BOX.x + BOX.w - 20), y: rand(BOX.y + 200, BOX.y + BOX.h - 20), vx: rand(-50, 50), vy: rand(-50, 50), hx: 0, hy: 0 }));
      const phaseOf = T => (T < 0 ? 'solid' : T < 100 ? 'liquid' : 'gas');

      // 结冰时，按位置给每个分子分配一个“座位”，免得大家交叉乱跑
      function assignHomes() {
        const ps = parts.slice().sort((a, b) => b.y - a.y);
        for (let r = 0; r < ROWS; r++) {
          const chunk = ps.slice(r * COLS, r * COLS + COLS).sort((a, b) => a.x - b.x);
          chunk.forEach((p, c) => { p.hx = homes[r * COLS + c].x; p.hy = homes[r * COLS + c].y; });
        }
      }

      function step(dt) {
        T += clamp(Tt - T, -60 * dt, 60 * dt);
        const ph = phaseOf(T);
        if (ph !== phase) {
          const msg = CHANGE_MSG[phase + '>' + ph];
          if (ph === 'solid') assignHomes();
          if (msg) api.note(msg);
          phase = ph;
          seen.add(ph);
          Sci.sfx(ph === 'gas' ? 'whoosh' : 'pop');
          if (seen.size === 3) api.goalDone();
        }
        const vt = ph === 'liquid' ? 40 + T * 1.5 : 220 + (T - 100) * 2;
        for (const p of parts) {
          if (ph === 'solid') {
            p.vx += (p.hx - p.x) * 60 * dt;
            p.vy += (p.hy - p.y) * 60 * dt;
            p.vx *= Math.exp(-4 * dt);
            p.vy *= Math.exp(-4 * dt);
            const j = (T + 40) * 0.5;
            p.vx += rand(-j, j);
            p.vy += rand(-j, j);
          } else {
            if (ph === 'liquid') p.vy += 700 * dt;
            // 随机拐个小弯，再把速度调到这个温度该有的快慢
            const a = rand(-0.5, 0.5), c = Math.cos(a), s = Math.sin(a);
            const vx = p.vx * c - p.vy * s, vy = p.vx * s + p.vy * c;
            p.vx = vx;
            p.vy = vy;
            const sp = Math.hypot(p.vx, p.vy) || 1;
            const f = 1 + (vt / sp - 1) * Math.min(1, dt * 3);
            p.vx *= f;
            p.vy *= f;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x < BOX.x + PR) { p.x = BOX.x + PR; p.vx = Math.abs(p.vx); }
          if (p.x > BOX.x + BOX.w - PR) { p.x = BOX.x + BOX.w - PR; p.vx = -Math.abs(p.vx); }
          if (p.y < BOX.y + PR) { p.y = BOX.y + PR; p.vy = Math.abs(p.vy); }
          if (p.y > BOX.y + BOX.h - PR) { p.y = BOX.y + BOX.h - PR; p.vy = -Math.abs(p.vy) * 0.5; }
        }
        if (ph !== 'solid') {
          const min = PR * 2 + 1;
          for (let i = 0; i < parts.length; i++) {
            for (let j = i + 1; j < parts.length; j++) {
              const a = parts[i], b = parts[j];
              const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
              if (d > 0 && d < min) {
                const push = (min - d) / 2, nx = dx / d, ny = dy / d;
                a.x -= nx * push; a.y -= ny * push;
                b.x += nx * push; b.y += ny * push;
              }
            }
          }
        }
      }

      function render() {
        ctx.fillStyle = T < 0 ? '#eaf6ff' : T >= 100 ? '#fff1ea' : '#f4f8ff';
        ctx.fillRect(0, 0, 800, 450);
        // 容器里的背景：冰块 / 水面
        ctx.save();
        D.rrect(ctx, BOX.x, BOX.y, BOX.w, BOX.h, 18);
        ctx.clip();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(BOX.x, BOX.y, BOX.w, BOX.h);
        if (phase === 'solid') {
          D.rrect(ctx, BOX.x + 80, BOX.y + BOX.h - 140, BOX.w - 160, 136, 14);
          ctx.fillStyle = 'rgba(160,215,255,.45)';
          ctx.fill();
        } else if (phase === 'liquid') {
          const top = parts.map(p => p.y).sort((a, b) => a - b)[6] - PR;
          ctx.fillStyle = 'rgba(110,190,255,.28)';
          ctx.fillRect(BOX.x, top, BOX.w, BOX.y + BOX.h - top);
        }
        parts.forEach(p => {
          D.circle(ctx, p.x, p.y, PR, '#3d9bff');
          D.circle(ctx, p.x - 3.5, p.y - 2, 2, '#fff');
          D.circle(ctx, p.x + 3.5, p.y - 2, 2, '#fff');
        });
        ctx.restore();
        D.rrect(ctx, BOX.x, BOX.y, BOX.w, BOX.h, 18);
        ctx.strokeStyle = '#9cc4e4';
        ctx.lineWidth = 5;
        ctx.stroke();
        D.text(ctx, '🔍 放大后的水分子', BOX.x + 12, BOX.y - 18, { size: 16, align: 'left', color: '#6f6a85' });
        // 火 / 霜
        if (T > 40) {
          const n = Math.round((T - 40) / 15) + 1;
          for (let i = 0; i < n; i++) D.emoji(ctx, '🔥', BOX.x + BOX.w / 2 + (i - (n - 1) / 2) * 42, 420 + Math.sin(t * 12 + i) * 2, 32 + Math.sin(t * 9 + i * 2) * 3);
        } else if (T < 0) {
          [[BOX.x + 10, BOX.y + 12], [BOX.x + BOX.w - 12, BOX.y + 14], [BOX.x + 14, BOX.y + BOX.h - 12], [BOX.x + BOX.w - 14, BOX.y + BOX.h - 14]]
            .forEach(([x, y], i) => D.emoji(ctx, '❄️', x, y, 22 + Math.sin(t * 2 + i) * 2));
          D.text(ctx, '冰箱里好冷～', BOX.x + BOX.w / 2, 420, { size: 18, color: '#3d7fc4' });
        }

        // 温度计
        const tx = 592, top = 60, bot = 340;
        const y = v => lerp(bot, top, (v + 30) / 160);
        D.rrect(ctx, tx - 14, top - 14, 28, bot - top + 30, 14);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#c8c3d6';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(tx - 7, y(T), 14, bot + 10 - y(T));
        D.circle(ctx, tx, 368, 26, '#ef4444', '#c8c3d6', 3);
        [[0, '0℃ 结冰'], [100, '100℃ 沸腾']].forEach(([v, s]) => {
          ctx.fillStyle = '#6f6a85';
          ctx.fillRect(tx - 26, y(v) - 1, 12, 3);
          D.text(ctx, s, tx - 30, y(v), { size: 13, align: 'right', color: '#6f6a85', weight: 'normal' });
        });
        D.text(ctx, `${Math.round(T)}℃`, tx, 368, { size: 16, color: '#fff' });
        // 状态说明
        const P = PHASES[phase];
        D.emoji(ctx, P.e, 715, 120, 64);
        D.text(ctx, P.name, 715, 195, { size: 22, maxW: 150 });
        D.wrap(ctx, P.desc, 715, 232, 140, 24, { size: 15, color: '#4a4560' });
      }

      api.loop(dt => { t += dt; step(dt); render(); });

      const slider = api.slider('🌡️ 温度', -30, 130, 1, Tt, v => { Tt = v; }, v => v + '℃');
      const row2 = api.row();
      const set = v => { Tt = v; slider.set(v); };
      api.button('❄️ 放进冰箱', () => set(-20), row2);
      api.button('🏠 放在桌上', () => set(20), row2);
      api.button('🔥 用火烧开', () => set(115), row2);
      api.note('👉 拖动温度滑块，或者点下面的按钮，让水变冷、变热吧！');
    },
  });

  /* ================= 2. 溶解的秘密 ================= */
  const SOLUTES = {
    sugar: { name: '糖', color: '#ffffff', edge: '#b8b6c8', dot: '#ff7aa8', cap: { cold: 150, hot: 330 }, rate: 0.1 },
    salt: { name: '盐', color: '#f4f8ff', edge: '#9aa6bd', dot: '#7a8cff', cap: { cold: 100, hot: 110 }, rate: 0.1 },
    sand: { name: '沙子', color: '#d4a55a', edge: '#9c7333', dot: '#d4a55a', cap: null, rate: 0 },
  };

  Sci.register({
    id: 'dissolve',
    subject: 'chemistry',
    level: 2,
    emoji: '🍬',
    title: '溶解的秘密',
    desc: '糖放进水里为什么不见了？',
    intro: '往水里放一勺糖，搅一搅，糖就不见了，可水却变甜了！糖到底藏到哪里去了？我们来做实验：选一种东西放进水里，比一比冷水和热水，搅拌和不搅拌，谁溶解得更快？还可以打开放大镜看个究竟。',
    goal: '让一勺糖（或盐）全部溶解，再试试沙子',
    fact: '<p>糖和盐放进水里，会分成<b>非常非常小的颗粒</b>，小到眼睛根本看不见，均匀地藏在水里——这就叫<b>溶解</b>。糖并没有消失，所以水是甜的。</p><p>想让它溶解得快：<b>用热水</b>、<b>搅一搅</b>。热水还能溶解更多的糖。</p><p>但水也有“吃饱”的时候：放太多糖，杯底的糖就再也化不掉了。而<b>沙子根本不溶于水</b>，怎么搅都会沉到杯底。</p>',
    quiz: [
      { q: '糖放进水里，过一会儿看不见了，糖去哪儿了？', options: ['消失了，没有了', '变成很小很小的颗粒，藏在水里'], answer: 1, explain: '所以尝一尝，水是甜的！' },
      { q: '怎样让糖溶解得更快？', options: ['用热水，再搅一搅', '用冷水，不要动它'], answer: 0, explain: '热水和搅拌都能让糖溶解得更快。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const CUP = { x: 250, y: 110, w: 300, h: 310 }, WTOP = 150, FLOOR = CUP.y + CUP.h - 10, SPOON = 30;
      let kind = 'sugar', temp = 'cold', grains = [], dissolved = 0, spoons = 0, stirT = 0, t = 0, murk = 0, lens = false;
      let startT = null, doneTime = null, stirredDuring = false, satMsg = false, sandMsg = false, spoonAnim = 0;
      const flags = { dissolved: false, sand: false };
      const mols = Array.from({ length: 80 }, () => ({ a: rand(0, Math.PI * 2), r: Math.sqrt(Math.random()) * 68, s: rand(-1, 1) }));

      function newCup() {
        grains = [];
        dissolved = spoons = 0;
        startT = doneTime = null;
        murk = 0;
        stirredDuring = satMsg = sandMsg = false;
      }
      function addSpoon() {
        spoons++;
        spoonAnim = 0.6;
        for (let i = 0; i < SPOON; i++) {
          grains.push({ x: 400 + rand(-30, 30), y: 72 + rand(-8, 8), vx: rand(-25, 25), vy: rand(0, 40), s: 1, st: 'fall', layer: rand(0, 16) });
        }
        if (startT == null || doneTime != null) { startT = t; doneTime = null; stirredDuring = false; }
        Sci.sfx('plop');
        if (kind === 'sand') {
          flags.sand = true;
          api.note('沙子倒进去了……搅一搅看看，它会不会溶解？');
          checkGoal();
        } else api.note(`放了一勺${SOLUTES[kind].name}！耐心等一等，或者搅一搅。`);
      }
      function checkGoal() {
        if (flags.dissolved && flags.sand) api.goalDone();
      }

      function step(dt) {
        const S = SOLUTES[kind];
        const cap = S.cap ? S.cap[temp] : 0;
        const stirring = stirT > 0;
        stirT = Math.max(0, stirT - dt);
        spoonAnim = Math.max(0, spoonAnim - dt);
        if (stirring) stirredDuring = true;
        for (const g of grains) {
          if (g.st === 'gone') continue;
          if (g.st === 'fall') {
            g.vy += 900 * dt;
            g.x += g.vx * dt;
            g.y += g.vy * dt;
            if (g.y > WTOP) { g.st = 'water'; g.vy *= 0.25; }
            continue;
          }
          if (stirring) {
            const dx = g.x - 400, dy = g.y - 290, r = Math.hypot(dx, dy) || 1;
            g.vx += (-dy / r * 260 - g.vx) * 3 * dt;
            g.vy += (dx / r * 260 - g.vy) * 3 * dt;
          } else {
            g.vx *= Math.exp(-3 * dt);
            g.vy += (70 - g.vy) * 2 * dt;
          }
          g.x += g.vx * dt;
          g.y += g.vy * dt;
          if (g.x < CUP.x + 12) { g.x = CUP.x + 12; g.vx = Math.abs(g.vx); }
          if (g.x > CUP.x + CUP.w - 12) { g.x = CUP.x + CUP.w - 12; g.vx = -Math.abs(g.vx); }
          if (g.y < WTOP + 4) { g.y = WTOP + 4; g.vy = Math.abs(g.vy); }
          g.bottom = false;
          if (g.y > FLOOR - g.layer) { g.y = FLOOR - g.layer; g.vy = 0; g.bottom = true; g.vx *= 0.8; }
          if (cap && dissolved < cap) {
            g.s -= S.rate * (temp === 'hot' ? 3 : 1) * (stirring ? 3.5 : 1) * (g.bottom ? 0.5 : 1) * dt;
            if (g.s <= 0) { g.st = 'gone'; dissolved++; }
          }
        }
        if (kind === 'sand') {
          murk = stirring ? Math.min(0.5, murk + dt * 0.5) : Math.max(0, murk - dt * 0.12);
          if (!stirring && stirredDuring && !sandMsg && grains.length) {
            sandMsg = true;
            api.note('看！沙子又沉到了杯底，怎么搅也不会消失——沙子不溶于水。');
          }
        }
        if (grains.length && cap) {
          const left = grains.filter(g => g.st !== 'gone');
          if (!left.length && doneTime == null) {
            doneTime = t - startT;
            flags.dissolved = true;
            Sci.sfx('good');
            api.note(`✨ ${S.name}全部溶解啦！用了 ${doneTime.toFixed(1)} 秒（${temp === 'hot' ? '热水' : '冷水'}${stirredDuring ? '，搅拌过' : '，没搅拌'}）。` + (flags.sand ? '' : '再试试沙子吧！'));
            checkGoal();
          } else if (left.length && dissolved >= cap && !satMsg && left.every(g => g.bottom)) {
            satMsg = true;
            api.note(`水“吃饱”啦！这杯${temp === 'hot' ? '热水' : '冷水'}再也溶解不了更多的${S.name}了，这叫“饱和”。` + (kind === 'sugar' && temp === 'cold' ? '换热水试试？' : ''));
          }
        }
      }

      function cupPath() {
        const { x, y, w, h } = CUP;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h - 30);
        ctx.quadraticCurveTo(x, y + h, x + 30, y + h);
        ctx.lineTo(x + w - 30, y + h);
        ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - 30);
        ctx.lineTo(x + w, y);
      }
      function render() {
        const S = SOLUTES[kind];
        ctx.fillStyle = '#f7f3ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#e6dcf7';
        ctx.fillRect(0, 425, 800, 25);
        // 热气
        if (temp === 'hot') {
          ctx.strokeStyle = 'rgba(180,170,200,.55)';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            for (let yy = 0; yy < 50; yy += 4) ctx.lineTo(340 + k * 60 + Math.sin(yy * 0.15 + t * 4 + k) * 7, WTOP - 18 - yy);
            ctx.stroke();
          }
        }
        // 水
        ctx.save();
        cupPath();
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = temp === 'hot' ? 'rgba(255,190,170,.45)' : 'rgba(130,195,255,.42)';
        ctx.fillRect(CUP.x, WTOP, CUP.w, CUP.h);
        if (murk > 0.01) { ctx.fillStyle = `rgba(170,130,70,${murk})`; ctx.fillRect(CUP.x, WTOP, CUP.w, CUP.h); }
        grains.forEach(g => {
          if (g.st === 'gone') return;
          const sz = 6 * Math.max(0.15, g.s);
          ctx.fillStyle = S.color;
          ctx.strokeStyle = S.edge;
          ctx.lineWidth = 1;
          ctx.fillRect(g.x - sz / 2, g.y - sz / 2, sz, sz);
          ctx.strokeRect(g.x - sz / 2, g.y - sz / 2, sz, sz);
        });
        ctx.restore();
        ctx.strokeStyle = 'rgba(255,255,255,.9)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(CUP.x + 4, WTOP);
        ctx.lineTo(CUP.x + CUP.w - 4, WTOP);
        ctx.stroke();
        cupPath();
        ctx.strokeStyle = '#a99cc8';
        ctx.lineWidth = 6;
        ctx.stroke();
        // 正在下落的颗粒
        grains.forEach(g => {
          if (g.st !== 'fall') return;
          ctx.fillStyle = S.color;
          ctx.strokeStyle = S.edge;
          ctx.fillRect(g.x - 3, g.y - 3, 6, 6);
          ctx.strokeRect(g.x - 3, g.y - 3, 6, 6);
        });
        if (spoonAnim > 0) D.emoji(ctx, '🥄', 400, 62, 46, Math.min(1, spoonAnim * 3));
        if (stirT > 0) D.emoji(ctx, '🥄', 400 + Math.cos(t * 9) * 80, 200 + Math.sin(t * 9) * 16, 54);

        // 放大镜
        if (lens) {
          const lx = 668, ly = 300, lr = 72;
          D.circle(ctx, lx, ly, lr + 8, '#7c5cff');
          D.circle(ctx, lx, ly, lr, '#e3f1ff');
          const n = S.cap ? Math.min(mols.length, Math.round(dissolved / 4)) : 0;
          mols.forEach((m, i) => {
            m.a += m.s * 0.02;
            const x = lx + Math.cos(m.a + t * m.s) * m.r, y = ly + Math.sin(m.a * 1.3 + t * m.s) * m.r * 0.95;
            D.circle(ctx, x, y, i < n ? 4.5 : 3, i < n ? S.dot : 'rgba(80,160,255,.45)');
          });
          D.text(ctx, '🔍 放大一万倍', lx, ly - lr - 22, { size: 15, color: '#5b45c4' });
          D.text(ctx, S.cap ? `彩色小点是${S.name}` : '沙子不会变成小颗粒', lx, ly + lr + 26, { size: 14, color: '#5b45c4', weight: 'normal' });
        }

        // 记录板
        const total = spoons * SPOON;
        D.text(ctx, `放了 ${spoons} 勺${S.name}`, 30, 40, { size: 20, align: 'left' });
        D.text(ctx, temp === 'hot' ? '♨️ 热水' : '❄️ 冷水', 30, 74, { size: 18, align: 'left', color: '#6f6a85' });
        if (S.cap) {
          D.text(ctx, `溶解了：${total ? Math.round(dissolved / total * 100) : 0}%`, 30, 108, { size: 18, align: 'left', color: '#7c5cff' });
          if (startT != null) {
            const sec = doneTime != null ? doneTime : t - startT;
            D.text(ctx, `⏱ ${sec.toFixed(1)} 秒`, 30, 142, { size: 18, align: 'left', color: '#6f6a85' });
          }
        }
        if (!spoons) D.text(ctx, '👇 点“加一勺”开始实验', 400, 285, { size: 20, color: '#8b87a0' });
      }

      api.loop(dt => { t += dt; step(dt); render(); });

      api.choice([['sugar', '🍬 糖'], ['salt', '🧂 盐'], ['sand', '🏖️ 沙子']], kind, v => { kind = v; newCup(); api.note(`换了一杯新水，准备放${SOLUTES[v].name}。`); });
      api.choice([['cold', '❄️ 冷水'], ['hot', '♨️ 热水']], temp, v => { temp = v; newCup(); api.note(`换了一杯${v === 'hot' ? '热水' : '冷水'}。`); });
      const row2 = api.row();
      api.button('➕ 加一勺', addSpoon, row2);
      api.button('🥄 搅一搅', () => { stirT = 2.5; Sci.sfx('whoosh'); }, row2);
      api.button('🚰 换一杯水', () => { newCup(); api.note('换了一杯干净的水。'); }, row2);
      api.toggle('🔍 放大镜', false, v => { lens = v; }, row2);
      api.note('先选好放什么、用冷水还是热水，再点“加一勺”。');
    },
  });

  /* ================= 3. 紫甘蓝变色魔法（酸和碱） ================= */
  const BOTTLES = [
    { name: '柠檬汁', s: -3, color: '#ffe066', icon: '🍋', x: 90 },
    { name: '白醋', s: -2, color: '#f3f0e2', icon: '醋', x: 245 },
    { name: '清水', s: 0, color: '#d6efff', icon: '💧', x: 400 },
    { name: '小苏打水', s: 2, color: '#ffffff', icon: '苏打', x: 555 },
    { name: '肥皂水', s: 3, color: '#c8f7d0', icon: '🧼', x: 710 },
  ];
  const STOPS = [[1, [214, 32, 72]], [3, [232, 70, 140]], [5, [186, 80, 190]], [7, [128, 72, 196]], [8.5, [70, 96, 214]], [10, [24, 150, 160]], [12, [60, 170, 70]], [13.5, [230, 210, 60]]];
  function colorAt(ph) {
    if (ph <= STOPS[0][0]) return STOPS[0][1].slice();
    for (let i = 1; i < STOPS.length; i++) {
      if (ph <= STOPS[i][0]) {
        const [a, ca] = STOPS[i - 1], [b, cb] = STOPS[i];
        return Sci.mixColor(ca, cb, (ph - a) / (b - a));
      }
    }
    return STOPS[STOPS.length - 1][1].slice();
  }
  function colorName(ph) {
    if (ph < 3) return '红色';
    if (ph < 5) return '粉红色';
    if (ph < 6.3) return '紫红色';
    if (ph < 7.7) return '紫色';
    if (ph < 9) return '蓝色';
    if (ph < 11) return '蓝绿色';
    if (ph < 12.7) return '绿色';
    return '黄绿色';
  }

  Sci.register({
    id: 'cabbage',
    subject: 'chemistry',
    level: 3,
    emoji: '🥬',
    title: '紫甘蓝变色魔法',
    desc: '一杯会变色的汁，帮我们认识酸和碱',
    intro: '紫甘蓝榨出来的汁是紫色的，它可是一位“变色侦探”！往里面滴不同的东西，它会变成红色、蓝色、绿色……点一点上面的瓶子，往烧杯里滴几滴，看看会变成什么颜色？这个实验在家里也能做，记得请爸爸妈妈帮忙哦！',
    goal: '让紫甘蓝汁变成红色，也变成绿色',
    fact: '<p>紫甘蓝汁是一种<b>酸碱指示剂</b>：碰到<b>酸性</b>的东西（柠檬汁、醋）会变<b>红</b>，碰到<b>碱性</b>的东西（小苏打水、肥皂水）会变<b>蓝、变绿</b>，碰到清水还是紫色（<b>中性</b>）。</p><p>酸和碱碰到一起会互相“抵消”，这叫<b>中和</b>。所以变红的汁滴点小苏打水，又能变回紫色！</p><p>🍋 酸的东西尝起来酸酸的，比如柠檬、醋；碱性的东西摸起来滑滑的，比如肥皂。（化学药品可不能随便尝哦！）</p>',
    quiz: [
      { q: '紫甘蓝汁滴进白醋后变成了红色，说明白醋是？', options: ['酸性的', '碱性的'], answer: 0, explain: '紫甘蓝汁遇到酸会变红。' },
      { q: '汁变成了红色，想让它变回紫色，可以加点什么？', options: ['更多柠檬汁', '一点小苏打水'], answer: 1, explain: '小苏打水是碱性的，能和酸中和。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const BK = { x: 300, y: 200, w: 200, h: 170 }, LTOP = BK.y + 40;
      let level = 0, cur = colorAt(7), t = 0, seenAcid = false, seenBase = false;
      const drops = [], ripples = [];
      const tilt = BOTTLES.map(() => 0);
      const pH = () => 7 + 6 * Math.tanh(level / 8);

      function apply(b) {
        const before = level;
        if (b.s === 0) level *= 0.8;
        else level += b.s;
        ripples.push({ r: 4, a: 1 });
        Sci.sfx('plop');
        const p = pH();
        let msg = `滴了${b.name}，紫甘蓝汁变成了${colorName(p)}！`;
        if (b.s !== 0 && Math.sign(before) && Math.sign(before) !== Math.sign(b.s)) msg += '酸和碱碰到一起互相抵消，颜色往回变了——这叫“中和”！';
        else if (p < 6.3) msg += '这说明它是酸性的。';
        else if (p > 7.7) msg += '这说明它是碱性的。';
        else if (b.s === 0) msg += '清水是中性的，颜色只会变淡一点。';
        api.note(msg);
        if (p < 4) seenAcid = true;
        if (p > 10) seenBase = true;
        if (seenAcid && seenBase) api.goalDone();
      }
      api.pointer(st, {
        down(p) {
          BOTTLES.forEach((b, i) => {
            if (Math.abs(p.x - b.x) < 45 && p.y > 20 && p.y < 180) {
              tilt[i] = 1;
              drops.push({ b, k: 0, sx: b.x, sy: 150, tx: 400 + rand(-40, 40) });
              Sci.sfx('pop');
            }
          });
        },
      });

      function render() {
        ctx.fillStyle = '#fbf7ff';
        ctx.fillRect(0, 0, 800, 450);
        // 架子
        ctx.fillStyle = '#d9c7a5';
        ctx.fillRect(20, 152, 760, 10);
        BOTTLES.forEach((b, i) => {
          ctx.save();
          ctx.translate(b.x, 150);
          ctx.rotate(tilt[i] * 0.35 * (b.x < 400 ? 1 : b.x > 400 ? -1 : 0.6));
          D.rrect(ctx, -12, -112, 24, 30, 6);
          ctx.fillStyle = '#e9e4f5';
          ctx.fill();
          D.rrect(ctx, -32, -86, 64, 86, 14);
          ctx.fillStyle = b.color;
          ctx.fill();
          ctx.strokeStyle = '#b9b0d0';
          ctx.lineWidth = 3;
          ctx.stroke();
          if (b.icon.length > 1 && !Sci.isEmoji(b.icon)) D.text(ctx, b.icon, 0, -42, { size: 18, color: '#6b5a2e' });
          else if (Sci.isEmoji(b.icon)) D.emoji(ctx, b.icon, 0, -42, 30);
          else D.text(ctx, b.icon, 0, -42, { size: 24, color: '#6b5a2e' });
          ctx.restore();
          D.text(ctx, b.name, b.x, 180, { size: 16 });
        });
        // 烧杯
        ctx.save();
        D.rrect(ctx, BK.x, BK.y, BK.w, BK.h, 18);
        ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,.6)';
        ctx.fillRect(BK.x, BK.y, BK.w, BK.h);
        ctx.fillStyle = Sci.rgb(cur);
        ctx.fillRect(BK.x, LTOP, BK.w, BK.h);
        ctx.fillStyle = 'rgba(255,255,255,.18)';
        ctx.fillRect(BK.x + 18, LTOP + 10, 16, BK.h - 30);
        ripples.forEach(r => {
          ctx.strokeStyle = `rgba(255,255,255,${r.a})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(400, LTOP + 4, r.r, r.r * 0.25, 0, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.restore();
        D.rrect(ctx, BK.x, BK.y, BK.w, BK.h, 18);
        ctx.strokeStyle = '#a99cc8';
        ctx.lineWidth = 5;
        ctx.stroke();
        D.text(ctx, '紫甘蓝汁', 400, BK.y + 20, { size: 15, color: '#8b87a0' });
        drops.forEach(d => {
          const k = d.k;
          const x = lerp(d.sx, d.tx, k), y = lerp(d.sy, LTOP, k) - Math.sin(k * Math.PI) * 50;
          ctx.beginPath();
          ctx.ellipse(x, y, 6, 8, 0, 0, Math.PI * 2);
          ctx.fillStyle = d.b.color;
          ctx.fill();
          ctx.strokeStyle = '#8c84a8';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
        // 酸碱尺
        const bx = 100, bw = 600, by = 396;
        const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
        for (let p = 1; p <= 13; p += 1) g.addColorStop((p - 1) / 12, Sci.rgb(colorAt(p)));
        D.rrect(ctx, bx, by, bw, 18, 9);
        ctx.fillStyle = g;
        ctx.fill();
        D.text(ctx, '⬅ 酸性', bx + 40, by + 40, { size: 16, color: '#d6204a' });
        D.text(ctx, '中性', 400, by + 40, { size: 16, color: '#8048c4' });
        D.text(ctx, '碱性 ➡', bx + bw - 40, by + 40, { size: 16, color: '#2e9a4a' });
        const mx = bx + (pH() - 1) / 12 * bw;
        ctx.fillStyle = '#2b2840';
        ctx.beginPath();
        ctx.moveTo(mx, by - 2);
        ctx.lineTo(mx - 9, by - 16);
        ctx.lineTo(mx + 9, by - 16);
        ctx.closePath();
        ctx.fill();
        D.text(ctx, '酸碱尺', bx - 50, by + 9, { size: 15, color: '#6f6a85' });
        D.text(ctx, (seenAcid ? '✅' : '⬜') + ' 变红', 640, 240, { size: 17, align: 'left', color: '#d6204a' });
        D.text(ctx, (seenBase ? '✅' : '⬜') + ' 变绿', 640, 272, { size: 17, align: 'left', color: '#2e9a4a' });
      }

      api.loop(dt => {
        t += dt;
        for (let i = drops.length - 1; i >= 0; i--) {
          drops[i].k += dt / 0.55;
          if (drops[i].k >= 1) { apply(drops[i].b); drops.splice(i, 1); }
        }
        for (let i = ripples.length - 1; i >= 0; i--) {
          ripples[i].r += dt * 120;
          ripples[i].a -= dt * 1.2;
          if (ripples[i].a <= 0) ripples.splice(i, 1);
        }
        tilt.forEach((v, i) => { tilt[i] = Math.max(0, v - dt * 3); });
        cur = Sci.mixColor(cur, colorAt(pH()), Math.min(1, dt * 3));
        render();
      });
      api.button('🫗 倒掉，换一杯新的紫甘蓝汁', () => { level = 0; api.note('换了一杯新鲜的紫甘蓝汁，紫色的！'); });
      api.note('👆 点一点上面的瓶子，往烧杯里滴一滴！');
    },
  });

  /* ================= 4. 燃烧的秘密 ================= */
  const JARS = { small: { w: 110, h: 170, vol: 1, name: '小杯子' }, mid: { w: 150, h: 215, vol: 2, name: '中杯子' }, big: { w: 200, h: 260, vol: 3, name: '大杯子' } };
  const PUT_OUT = {
    cover: ['oxygen', '盖上杯子，杯子里的氧气用完了，火就灭了——这是“隔绝氧气”。'],
    water: ['heat', '浇了水，温度一下子降低，火灭了——这是“降低温度”。'],
    blow: ['heat', '一口气把热量吹走了，温度降低，火就灭了——这也是“降低温度”。'],
    cut: ['fuel', '剪掉了灯芯，没有东西可以烧了——这是“移走可燃物”。'],
  };

  Sci.register({
    id: 'fire',
    subject: 'chemistry',
    level: 4,
    emoji: '🕯️',
    title: '燃烧的秘密',
    desc: '燃烧需要什么？怎样灭火最科学？',
    intro: '蜡烛为什么能一直烧？它需要三样东西：能烧的东西、氧气，还有足够高的温度。少了任何一样，火就会熄灭——这就是所有灭火方法的秘密！用杯子盖一盖、浇点水、剪掉灯芯，看看火是怎么灭的。再比一比：大杯子和小杯子，哪个能让蜡烛烧得更久？',
    goal: '用三种不同的原理把蜡烛熄灭（隔绝氧气、降低温度、移走可燃物）',
    fact: '<p>燃烧需要三个条件，叫做<b>燃烧三角</b>：<b>可燃物</b>、<b>氧气</b>、<b>达到着火点的温度</b>。</p><p>所以灭火也有三种办法：<b>隔绝氧气</b>（盖锅盖、用灭火毯、沙土）、<b>降低温度</b>（浇水）、<b>移走可燃物</b>（关掉煤气阀门、开辟隔离带）。</p><p>蜡烛燃烧时，石蜡和氧气反应，生成<b>二氧化碳和水</b>，还放出光和热，这是一种<b>化学变化</b>。</p><p>⚠️ 油锅着火千万不能浇水！油比水轻，会浮在水面上继续燃烧、四处飞溅。应该<b>盖上锅盖</b>、关火。玩火很危险，做实验一定要有大人在场。</p>',
    quiz: [
      { q: '燃烧需要哪三个条件？', options: ['可燃物、氧气、足够高的温度', '水、空气、阳光', '木头、风、火柴盒'], answer: 0, explain: '这就是燃烧三角。' },
      { q: '炒菜时油锅着火了，最好怎么办？', options: ['盖上锅盖，关火', '赶紧往锅里倒水'], answer: 0, explain: '盖锅盖能隔绝氧气；倒水会让油火飞溅，非常危险。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const CX = 300, TABLE = 405, WICK = 292;
      let jarKey = 'small', jarOn = false, jarPos = 0, lit = true, o2 = 21, wick = true, wet = 0, t = 0, coverT = 0;
      const smoke = [], drops = [], results = {};
      const kinds = new Set();

      function putOut(how) {
        if (!lit) return;
        lit = false;
        for (let i = 0; i < 25; i++) smoke.push({ x: CX + rand(-4, 4), y: WICK - 10, vx: rand(-10, 10), vy: -rand(30, 60), life: rand(1.5, 2.5) });
        Sci.sfx('whoosh');
        const [kind, msg] = PUT_OUT[how];
        let extra = '';
        if (how === 'cover') {
          results[jarKey] = coverT;
          extra = `（${JARS[jarKey].name}：烧了 ${coverT.toFixed(1)} 秒）`;
        }
        api.note('💨 ' + msg + extra);
        if (!kinds.has(kind)) {
          kinds.add(kind);
          if (kinds.size === 3) api.timeout(() => { api.note('🎉 三种灭火原理你都用到了：隔绝氧气、降低温度、移走可燃物！'); api.goalDone(); }, 2200);
        }
      }
      function light() {
        if (lit) return api.note('蜡烛已经在烧啦。');
        if (!wick) return api.note('灯芯被剪掉了，没有东西可以烧。点“换一根新蜡烛”。');
        if (wet > 0) return api.note('灯芯湿湿的，温度升不上去，点不着！等它干一会儿。');
        if (jarOn) return api.note('杯子还盖着呢，先把杯子拿开，让新鲜空气进来。');
        lit = true;
        coverT = 0;
        Sci.sfx('pop');
        api.note('🔥 蜡烛点着了！');
      }

      function flame(scale) {
        const fl = 1 + Math.sin(t * 23) * 0.06 + Math.sin(t * 13) * 0.05;
        const h = 46 * scale * fl, w = 15 * scale;
        D.circle(ctx, CX, WICK - h * 0.4, 60 * scale, `rgba(255,190,80,${0.22 * scale})`);
        const g = ctx.createRadialGradient(CX, WICK - h * 0.25, 2, CX, WICK - h * 0.3, h);
        g.addColorStop(0, '#fffbe0');
        g.addColorStop(0.35, '#ffd34d');
        g.addColorStop(1, 'rgba(255,110,20,.85)');
        ctx.beginPath();
        ctx.moveTo(CX, WICK - h);
        ctx.bezierCurveTo(CX + w, WICK - h * 0.45, CX + w, WICK + 2, CX, WICK + 3);
        ctx.bezierCurveTo(CX - w, WICK + 2, CX - w, WICK - h * 0.45, CX, WICK - h);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(CX, WICK - 4, w * 0.35, h * 0.16, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(80,120,255,.55)';
        ctx.fill();
      }
      function render() {
        ctx.fillStyle = lit ? '#2a2540' : '#3a3555';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#8a6a4a';
        ctx.fillRect(0, TABLE, 800, 45);
        // 蜡烛
        D.rrect(ctx, CX - 24, 300, 48, TABLE - 300, 6);
        ctx.fillStyle = '#fbf3df';
        ctx.fill();
        if (wick) {
          ctx.strokeStyle = '#222';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(CX, 300);
          ctx.lineTo(CX, WICK);
          ctx.stroke();
        }
        if (lit) flame(clamp((o2 - 16) / 5, 0.25, 1));
        smoke.forEach(s => D.circle(ctx, s.x, s.y, 8 + (2.5 - s.life) * 6, `rgba(200,200,210,${Math.max(0, s.life * 0.15)})`));
        drops.forEach(d => { ctx.beginPath(); ctx.ellipse(d.x, d.y, 4, 7, 0, 0, Math.PI * 2); ctx.fillStyle = '#6cc0ff'; ctx.fill(); });
        // 杯子（倒扣）
        const J = JARS[jarKey], bottom = TABLE - (1 - jarPos) * 330, top = bottom - J.h;
        ctx.beginPath();
        ctx.moveTo(CX - J.w / 2, bottom);
        ctx.lineTo(CX - J.w / 2, top + 16);
        ctx.quadraticCurveTo(CX - J.w / 2, top, CX - J.w / 2 + 16, top);
        ctx.lineTo(CX + J.w / 2 - 16, top);
        ctx.quadraticCurveTo(CX + J.w / 2, top, CX + J.w / 2, top + 16);
        ctx.lineTo(CX + J.w / 2, bottom);
        ctx.fillStyle = 'rgba(200,230,255,.16)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(190,220,255,.85)';
        ctx.lineWidth = 3;
        ctx.stroke();
        // 右边：氧气表、记录、燃烧三角
        const px = 520;
        D.text(ctx, jarOn ? `${J.name}里的氧气` : '空气里的氧气', px + 130, 34, { size: 17, color: '#fff' });
        D.rrect(ctx, px + 20, 50, 220, 20, 10);
        ctx.fillStyle = 'rgba(255,255,255,.2)';
        ctx.fill();
        D.rrect(ctx, px + 20, 50, 220 * o2 / 21, 20, 10);
        ctx.fillStyle = o2 > 17 ? '#4fd18b' : '#ff7a59';
        ctx.fill();
        const lx = px + 20 + 220 * 16 / 21;
        ctx.fillStyle = '#ffd34d';
        ctx.fillRect(lx - 1, 46, 3, 28);
        D.text(ctx, `${o2.toFixed(1)}%`, px + 130, 88, { size: 15, color: '#fff' });
        D.text(ctx, '黄线：氧气低于约 16%，火就会熄灭', px + 130, 110, { size: 12, color: '#d9d4f0', weight: 'normal' });
        D.text(ctx, '盖上杯子后烧了多久：', px + 20, 146, { size: 15, color: '#fff', align: 'left' });
        Object.entries(JARS).forEach(([k, j], i) => {
          const v = results[k];
          D.text(ctx, `${j.name}：${v != null ? v.toFixed(1) + ' 秒' : '还没试'}`, px + 34, 174 + i * 24, { size: 14, color: v != null ? '#ffe9a8' : '#a9a3c6', align: 'left', weight: 'normal' });
        });
        if (jarOn && lit) D.text(ctx, `⏱ ${coverT.toFixed(1)} 秒`, px + 130, 258, { size: 18, color: '#ffd34d' });
        // 燃烧三角
        const tx = px + 130, ty = 330;
        const fuel = wick, oxy = o2 > 16.2, heat = wet <= 0;
        const V = [[tx, ty - 50, '可燃物', fuel], [tx - 70, ty + 45, '氧气', oxy], [tx + 70, ty + 45, '温度', heat]];
        ctx.beginPath();
        V.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.closePath();
        ctx.strokeStyle = lit ? '#ffb02e' : '#77708f';
        ctx.lineWidth = 4;
        ctx.stroke();
        if (lit) D.emoji(ctx, '🔥', tx, ty + 12, 30);
        V.forEach(([x, y, s, okk]) => {
          D.circle(ctx, x, y, 7, okk ? '#4fd18b' : '#ff5a5f');
          D.text(ctx, s, x, y + (y < ty ? -18 : 20), { size: 14, color: okk ? '#c9f7dc' : '#ffb3b3' });
        });
        D.text(ctx, '燃烧三角', tx, ty + 86, { size: 13, color: '#a9a3c6', weight: 'normal' });
      }

      api.loop(dt => {
        t += dt;
        jarPos += clamp((jarOn ? 1 : 0) - jarPos, -dt * 1.8, dt * 1.8);
        if (jarOn && jarPos > 0.97) {
          if (lit) {
            o2 = Math.max(15.5, o2 - dt * 5 / (JARS[jarKey].vol * 4));
            coverT += dt;
            if (o2 <= 16.05) putOut('cover');
          }
        } else o2 = Math.min(21, o2 + dt * 4);
        wet = Math.max(0, wet - dt);
        for (let i = drops.length - 1; i >= 0; i--) {
          drops[i].y += 420 * dt;
          if (drops[i].y > WICK - 10) { drops.splice(i, 1); if (lit) putOut('water'); wet = 4; }
        }
        for (let i = smoke.length - 1; i >= 0; i--) {
          const s = smoke[i];
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.life -= dt;
          if (s.life <= 0) smoke.splice(i, 1);
        }
        render();
      });

      const jarChoice = api.choice(Object.entries(JARS).map(([k, j]) => [k, '🫙 ' + j.name]), jarKey, v => {
        if (jarOn) { jarChoice.set(jarKey); api.note('先把杯子拿开，再换杯子。'); return; }
        jarKey = v;
      });
      const row = api.row();
      api.button('🫙 盖上 / 拿开杯子', () => {
        jarOn = !jarOn;
        if (jarOn) { coverT = 0; api.note(`盖上了${JARS[jarKey].name}，看看氧气表……`); }
        else api.note('拿开杯子，新鲜空气又进来了。');
      }, row);
      api.button('🔥 点燃', light, row);
      const row2 = api.row();
      api.button('💧 浇水', () => {
        if (jarOn) return api.note('杯子盖着，水浇不进去。');
        for (let i = 0; i < 6; i++) drops.push({ x: CX + rand(-10, 10), y: -i * 30 });
      }, row2);
      api.button('💨 吹一吹', () => {
        if (jarOn) return api.note('杯子盖着，吹不到。');
        if (lit) putOut('blow');
      }, row2);
      api.button('✂️ 剪掉灯芯', () => {
        if (jarOn) return api.note('先把杯子拿开。');
        wick = false;
        if (lit) putOut('cut');
      }, row2);
      api.button('🕯️ 换一根新蜡烛', () => { wick = true; wet = 0; api.note('换了一根新蜡烛，点燃试试。'); }, row2);
      api.note('🔥 蜡烛正在燃烧。试试用不同的办法让它熄灭吧！');
    },
  });

  /* ================= 5. 原子积木 ================= */
  const ELEM = {
    H: { r: 14, c: '#ffffff', edge: '#a9adbb', name: '氢', ink: '#555' },
    O: { r: 20, c: '#ef4444', edge: '#b91c1c', name: '氧', ink: '#fff' },
    C: { r: 20, c: '#3b3b46', edge: '#111', name: '碳', ink: '#fff' },
    N: { r: 19, c: '#3d6df2', edge: '#1d43b8', name: '氮', ink: '#fff' },
  };
  const MOLS = {
    H2O: { name: '水', f: 'H₂O', atoms: ['O', 'H', 'H'], pos: [[0, 0], [-26, 20], [26, 20]], bonds: [[0, 1, 1], [0, 2, 1]] },
    O2: { name: '氧气', f: 'O₂', atoms: ['O', 'O'], pos: [[-19, 0], [19, 0]], bonds: [[0, 1, 2]] },
    CO2: { name: '二氧化碳', f: 'CO₂', atoms: ['C', 'O', 'O'], pos: [[0, 0], [-40, 0], [40, 0]], bonds: [[0, 1, 2], [0, 2, 2]] },
    CH4: { name: '甲烷（天然气）', f: 'CH₄', atoms: ['C', 'H', 'H', 'H', 'H'], pos: [[0, 0], [0, -34], [34, 0], [0, 34], [-34, 0]], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
    NH3: { name: '氨气', f: 'NH₃', atoms: ['N', 'H', 'H', 'H'], pos: [[0, 0], [-28, 20], [28, 20], [0, -33]], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
    H2: { name: '氢气', f: 'H₂', atoms: ['H', 'H'], pos: [[-14, 0], [14, 0]], bonds: [[0, 1, 1]] },
  };
  const REACTIONS = {
    water: { eq: '2H₂ + O₂ → 2H₂O', words: '氢气 + 氧气 → 水', left: [['H2', 120, 160], ['H2', 120, 300], ['O2', 260, 230]], right: [['H2O', 560, 160], ['H2O', 600, 300]] },
    methane: { eq: 'CH₄ + 2O₂ → CO₂ + 2H₂O', words: '天然气燃烧：甲烷 + 氧气 → 二氧化碳 + 水', left: [['CH4', 120, 230], ['O2', 270, 140], ['O2', 270, 320]], right: [['CO2', 600, 120], ['H2O', 540, 260], ['H2O', 680, 330]] },
  };
  const countOf = list => list.reduce((m, e) => { m[e] = (m[e] || 0) + 1; return m; }, {});
  const countStr = m => Object.keys(ELEM).filter(e => m[e]).map(e => `${ELEM[e].name}原子 ${m[e]} 个`).join('，');

  Sci.register({
    id: 'atoms',
    subject: 'chemistry',
    level: 5,
    emoji: '⚛️',
    title: '原子积木',
    desc: '用原子拼分子，看化学反应怎样“重新组合”',
    intro: '世界上所有东西都是由非常非常小的“原子”组成的，小到一根头发丝的粗细就能排下几十万个！原子手拉手连在一起，就成了“分子”。先用原子积木拼出水、氧气、二氧化碳这些分子；再看看化学反应里，原子到底发生了什么。',
    goal: '拼出 3 种不同的分子，再完成一次化学反应',
    fact: '<p>物质由<b>分子</b>组成，分子由<b>原子</b>组成。水分子 H₂O 就是 2 个氢原子和 1 个氧原子连在一起；氧气 O₂ 是 2 个氧原子。目前已经发现了 118 种元素。</p><p><b>化学反应的本质</b>：分子拆开成原子，原子再<b>重新组合</b>成新的分子。在反应里，原子的种类和个数都<b>不会变</b>，所以反应前后物质的总质量也不变，这叫<b>质量守恒定律</b>。</p><p>小练习：数一数 CH₄ + 2O₂ → CO₂ + 2H₂O 两边各有几个碳、氢、氧原子？</p>',
    quiz: [
      { q: '一个水分子（H₂O）由几个原子组成？', options: ['2 个', '3 个', '1 个'], answer: 1, explain: '2 个氢原子加 1 个氧原子，一共 3 个。' },
      { q: '化学反应前后，原子的个数会？', options: ['不变', '变多', '变少'], answer: 0, explain: '原子只是重新组合，个数不变——质量守恒。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const WX = 280, WY = 230, SC = 1.6;
      let mode = 'build', target = 'H2O', atoms = [], assembled = false, reacted = false, rxKey = 'water', rxT = 0, rxPlay = false, goalSent = false;
      const built = new Set();

      const newAtom = (el, x, y) => ({ el, x, y, vx: rand(-40, 40), vy: rand(-40, 40), tx: null, ty: null });
      function checkGoal() {
        if (!goalSent && built.size >= 3 && reacted) { goalSent = true; api.goalDone(); }
      }
      function evaluate() {
        assembled = false;
        atoms.forEach(a => { a.tx = a.ty = null; });
        const M = MOLS[target], need = countOf(M.atoms), have = countOf(atoms.map(a => a.el));
        const extra = Object.keys(have).filter(e => (have[e] || 0) > (need[e] || 0));
        if (extra.length) { api.note(`多了${extra.map(e => ELEM[e].name).join('、')}原子哦！点一下多出来的原子，就能把它拿走。`); return; }
        const missing = Object.keys(need).filter(e => (have[e] || 0) < need[e]);
        if (missing.length) { api.note(`还差：${missing.map(e => `${need[e] - (have[e] || 0)} 个${ELEM[e].name}原子`).join('、')}`); return; }
        assembled = true;
        const used = new Set();
        M.atoms.forEach((el, i) => {
          let best = null, bd = 1e9;
          atoms.forEach(a => {
            if (a.el !== el || used.has(a)) return;
            const d = Math.hypot(a.x - WX, a.y - WY);
            if (d < bd) { bd = d; best = a; }
          });
          used.add(best);
          best.tx = WX + M.pos[i][0] * SC;
          best.ty = WY + M.pos[i][1] * SC;
          best.slot = i;
        });
        Sci.sfx('star');
        const first = !built.has(target);
        built.add(target);
        api.note(`🎉 拼出了一个${M.name}分子 ${M.f}！它由${countStr(need)}组成。` + (first && built.size < 3 ? '换一个目标继续拼吧。' : ''));
        checkGoal();
      }
      function setupReaction() {
        const R = REACTIONS[rxKey];
        atoms = [];
        R.left.forEach(([m, x, y]) => {
          const M = MOLS[m];
          M.atoms.forEach((el, i) => {
            const a = newAtom(el, x + M.pos[i][0] * SC, y + M.pos[i][1] * SC);
            a.sx = a.x; a.sy = a.y;
            atoms.push(a);
          });
        });
        const pool = atoms.slice();
        R.right.forEach(([m, x, y]) => {
          const M = MOLS[m];
          M.atoms.forEach((el, i) => {
            const k = pool.findIndex(a => a.el === el);
            const a = pool.splice(k, 1)[0];
            a.ex = x + M.pos[i][0] * SC;
            a.ey = y + M.pos[i][1] * SC;
          });
        });
        rxT = 0;
        rxPlay = false;
      }

      api.pointer(st, {
        down(p) {
          if (mode !== 'build') return;
          const i = atoms.findIndex(a => Math.hypot(p.x - a.x, p.y - a.y) < ELEM[a.el].r + 6);
          if (i >= 0) { atoms.splice(i, 1); Sci.sfx('pop'); evaluate(); }
        },
      });

      function drawAtom(a, x, y) {
        const E = ELEM[a.el];
        const g = ctx.createRadialGradient(x - E.r * 0.35, y - E.r * 0.35, 2, x, y, E.r);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.3, E.c);
        g.addColorStop(1, E.edge);
        D.circle(ctx, x, y, E.r, g);
        D.text(ctx, a.el, x, y + 1, { size: E.r, color: E.ink });
      }
      function drawBonds(mol, pts) {
        mol.bonds.forEach(([i, j, n]) => {
          const [x1, y1] = pts[i], [x2, y2] = pts[j];
          const ang = Math.atan2(y2 - y1, x2 - x1), ox = -Math.sin(ang) * 4, oy = Math.cos(ang) * 4;
          ctx.strokeStyle = '#9aa0b5';
          ctx.lineWidth = 5;
          for (let k = 0; k < n; k++) {
            const s = n === 1 ? 0 : k ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(x1 + ox * s, y1 + oy * s);
            ctx.lineTo(x2 + ox * s, y2 + oy * s);
            ctx.stroke();
          }
        });
      }

      function renderBuild(dt) {
        ctx.fillStyle = '#f6f3ff';
        ctx.fillRect(0, 0, 800, 450);
        D.rrect(ctx, 12, 12, 530, 426, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        atoms.forEach(a => {
          if (a.tx != null) {
            a.x += (a.tx - a.x) * Math.min(1, dt * 6);
            a.y += (a.ty - a.y) * Math.min(1, dt * 6);
          } else {
            a.vx += rand(-60, 60) * dt;
            a.vy += rand(-60, 60) * dt;
            a.vx = clamp(a.vx, -60, 60);
            a.vy = clamp(a.vy, -60, 60);
            a.x += a.vx * dt;
            a.y += a.vy * dt;
            if (a.x < 40 || a.x > 515) a.vx *= -1;
            if (a.y < 40 || a.y > 410) a.vy *= -1;
            a.x = clamp(a.x, 40, 515);
            a.y = clamp(a.y, 40, 410);
          }
        });
        if (assembled) {
          const M = MOLS[target], pts = [];
          atoms.forEach(a => { pts[a.slot] = [a.x, a.y]; });
          if (pts.every(Boolean)) drawBonds(M, pts);
        }
        atoms.forEach(a => drawAtom(a, a.x, a.y));
        if (!atoms.length) D.text(ctx, '👇 点下面的按钮添加原子', 277, 225, { size: 18, color: '#8b87a0' });
        // 右侧目标卡
        const M = MOLS[target];
        D.text(ctx, '目标分子', 670, 40, { size: 15, color: '#8b87a0' });
        D.text(ctx, M.f, 670, 84, { size: 40, color: '#9b5cff' });
        D.text(ctx, M.name, 670, 124, { size: 18 });
        const pts = M.pos.map(([x, y]) => [670 + x, 200 + y]);
        drawBonds(M, pts);
        M.atoms.forEach((el, i) => drawAtom({ el }, pts[i][0], pts[i][1]));
        const need = countOf(M.atoms);
        Object.keys(need).forEach((e, i) => D.text(ctx, `${ELEM[e].name}（${e}）× ${need[e]}`, 670, 270 + i * 24, { size: 15, color: '#4a4560' }));
        D.text(ctx, `已拼出 ${built.size} 种分子`, 670, 420, { size: 14, color: '#8b87a0', weight: 'normal' });
      }
      function renderReaction(dt) {
        const R = REACTIONS[rxKey];
        if (rxPlay) {
          rxT = Math.min(1, rxT + dt / 2.4);
          if (rxT >= 1 && rxPlay) {
            rxPlay = false;
            reacted = true;
            Sci.sfx('good');
            const c = countOf(atoms.map(a => a.el));
            api.note(`反应完成！反应前：${countStr(c)}；反应后：${countStr(c)}。原子一个也没少，只是换了“搭档”！`);
            checkGoal();
          }
        }
        ctx.fillStyle = '#f6f3ff';
        ctx.fillRect(0, 0, 800, 450);
        D.text(ctx, R.eq, 400, 36, { size: 28, color: '#9b5cff' });
        D.text(ctx, R.words, 400, 70, { size: 16, color: '#6f6a85' });
        D.text(ctx, '反应前', 190, 420, { size: 16, color: '#8b87a0' });
        D.text(ctx, '反应后', 610, 420, { size: 16, color: '#8b87a0' });
        D.text(ctx, '➜', 400, 235, { size: 46, color: rxPlay ? '#ff9a00' : '#c9c2e6' });
        if (rxPlay) D.emoji(ctx, '🔥', 400, 290, 30);
        const e = rxT * rxT * (3 - 2 * rxT);
        const pos = atoms.map(a => {
          const lift = Math.sin(rxT * Math.PI) * 50;
          return [lerp(a.sx, a.ex, e) + Math.sin(rxT * Math.PI * 3 + a.sx) * 12 * Math.sin(rxT * Math.PI), lerp(a.sy, a.ey, e) - lift];
        });
        if (rxT === 0 || rxT === 1) {
          const side = rxT === 0 ? R.left : R.right;
          side.forEach(([m, x, y]) => {
            const M = MOLS[m];
            const pts = M.pos.map(([px, py]) => [x + px * SC, y + py * SC]);
            drawBonds(M, pts);
            D.text(ctx, M.f, x, y + 62, { size: 15, color: '#6f6a85' });
          });
        }
        atoms.forEach((a, i) => drawAtom(a, pos[i][0], pos[i][1]));
      }

      api.loop(dt => (mode === 'build' ? renderBuild(dt) : renderReaction(dt)));

      api.choice([['build', '🧱 拼分子'], ['react', '⚡ 化学反应']], mode, v => {
        mode = v;
        buildRow.hidden = buildRow2.hidden = v !== 'build';
        reactRow.hidden = v !== 'react';
        if (v === 'react') { setupReaction(); api.note('左边是反应前的分子。点“点火反应”，看看原子们怎么换搭档！'); }
        else { atoms = []; assembled = false; api.note('选好目标分子，再添加原子。'); }
      });
      const buildRow = api.row();
      api.choice(Object.entries(MOLS).filter(([k]) => k !== 'H2').map(([k, m]) => [k, `${m.f} ${m.name}`]), target, v => { target = v; evaluate(); }, buildRow);
      const buildRow2 = api.row();
      Object.entries(ELEM).forEach(([e, E]) => api.button(`➕ ${E.name}原子 ${e}`, () => {
        atoms.push(newAtom(e, rand(80, 480), rand(80, 380)));
        Sci.sfx('pop');
        evaluate();
      }, buildRow2));
      api.button('🧹 清空', () => { atoms = []; assembled = false; api.note('清空了，重新开始拼吧。'); }, buildRow2);
      const reactRow = api.row();
      api.choice(Object.entries(REACTIONS).map(([k, r]) => [k, r.eq]), rxKey, v => { rxKey = v; setupReaction(); }, reactRow);
      api.button('🔥 点火反应', () => { if (rxT >= 1) setupReaction(); rxPlay = true; Sci.sfx('whoosh'); }, reactRow);
      api.button('↩️ 重来', setupReaction, reactRow);
      reactRow.hidden = true;
      api.note('目标：拼一个水分子 H₂O。点下面的按钮添加原子吧！');
    },
  });
})();
