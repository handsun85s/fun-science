/* 环境与健康（第三组）：营养午餐 → 保护眼睛 → 病菌怎样传播 → 安全与急救 → 疫苗与群体免疫 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;
  const germ = (ctx, x, y, r, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.lineTo(x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5); ctx.stroke(); }
    D.circle(ctx, x, y, r, color);
  };

  /* ================= 11. 营养午餐 ================= */
  const FOODS = [
    ['🍚', '米饭', 'grain'], ['🍞', '面包', 'grain'], ['🥦', '西兰花', 'veg'], ['🥕', '胡萝卜', 'veg'], ['🍎', '苹果', 'fruit'], ['🍌', '香蕉', 'fruit'],
    ['🍗', '鸡腿', 'protein'], ['🐟', '鱼', 'protein'], ['🥚', '鸡蛋', 'protein'], ['🥛', '牛奶', 'dairy'], ['🍟', '炸薯条', 'junk'], ['🍬', '糖果', 'junk'], ['🥤', '可乐', 'junk'],
  ];
  const GROUPS = { grain: '谷物主食', veg: '蔬菜', fruit: '水果', protein: '肉蛋鱼', dairy: '奶类' };

  Sci.register({
    id: 'lunch',
    subject: 'health',
    level: 1,
    emoji: '🍱',
    title: '营养午餐',
    desc: '搭配一份营养均衡的午餐',
    intro: '我们的身体就像一辆小汽车，需要各种各样的“燃料”才能跑得好。来给自己搭配一份午餐吧！把食物拖进餐盘里，最多能放 5 样。想一想：怎样搭配才能让身体得到各种营养？',
    goal: '搭配出一份营养均衡的午餐（5 类食物都有，不要零食）',
    fact: '<p>身体需要多种营养，所以每天要吃各种各样的食物：</p><p>🍚 <b>谷物主食</b>提供能量；🥦 <b>蔬菜</b>和 🍎 <b>水果</b>提供维生素和膳食纤维；🍗 <b>肉、蛋、鱼</b>帮助长肌肉；🥛 <b>奶类</b>让骨骼和牙齿更结实。</p><p>🍟 炸薯条、糖果、可乐这些零食，油、糖太多，偶尔吃一点可以，不能当饭吃。不挑食、不偏食，才能长得高高壮壮！</p>',
    quiz: [
      { q: '想让骨骼和牙齿更结实，应该多喝什么？', options: ['牛奶', '可乐'], answer: 0, explain: '牛奶里含有丰富的钙。' },
      { q: '下面哪种搭配最营养均衡？', options: ['米饭、青菜、鱼、苹果、牛奶', '薯条、可乐、糖果'], answer: 0, explain: '五大类食物都有，营养才均衡。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const items = FOODS.map((f, i) => ({ e: f[0], name: f[1], g: f[2], hx: 45 + (i % 7) * 105, hy: 50 + Math.floor(i / 7) * 90, x: 0, y: 0, on: false }));
      items.forEach(it => { it.x = it.hx; it.y = it.hy; });
      let drag = null, done = false;
      const plate = () => items.filter(it => it.on);
      function evaluate() {
        const p = plate(), groups = new Set(p.map(it => it.g));
        const junk = p.filter(it => it.g === 'junk').length;
        const miss = Object.keys(GROUPS).filter(g => !groups.has(g)).map(g => GROUPS[g]);
        if (!miss.length && !junk && !done) { done = true; Sci.sfx('star'); api.note('🎉 营养均衡的午餐！五类食物全都有，身体会很开心。'); api.goalDone(); }
        else if (p.length) api.note((junk ? `零食太多啦（${p.filter(it => it.g === 'junk').map(it => it.name).join('、')}）。` : '') + (miss.length ? `还缺：${miss.join('、')}。` : ''));
      }
      api.pointer(st, {
        down(p) { const it = items.find(it => Math.hypot(p.x - it.x, p.y - it.y) < 34); if (it) { drag = { it, ox: it.x - p.x, oy: it.y - p.y }; Sci.sfx('pop'); } },
        move(p) { if (drag) { drag.it.x = p.x + drag.ox; drag.it.y = p.y + drag.oy; } },
        up() {
          if (!drag) return;
          const it = drag.it;
          drag = null;
          const inPlate = Math.hypot((it.x - 400) / 230, (it.y - 330) / 105) < 1;
          if (inPlate && !it.on && plate().length >= 5) { api.note('餐盘最多放 5 样，先拿出来一样吧。'); it.x = it.hx; it.y = it.hy; return; }
          it.on = inPlate;
          if (!inPlate) { it.x = it.hx; it.y = it.hy; }
          else { const k = plate().indexOf(it); it.x = 220 + k * 90; it.y = 330; }
          plate().forEach((o, k) => { o.x = 220 + k * 90; o.y = 330; });
          evaluate();
        },
      });
      api.loop(() => {
        ctx.fillStyle = '#fff9db';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(400, 330, 230, 105, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ced4da';
        ctx.lineWidth = 4;
        ctx.stroke();
        D.text(ctx, '🍽️ 我的午餐（最多 5 样）', 400, 240, { size: 15, color: '#6f6a85' });
        const groups = new Set(plate().map(it => it.g));
        Object.keys(GROUPS).forEach((g, i) => D.text(ctx, `${groups.has(g) ? '✅' : '⬜'} ${GROUPS[g]}`, 60 + i * 150, 220, { size: 14, align: 'left', color: groups.has(g) ? '#2b8a3e' : '#868e96' }));
        items.forEach(it => {
          D.emoji(ctx, it.e, it.x, it.y - 6, 40);
          if (!it.on) D.text(ctx, it.name, it.x, it.y + 28, { size: 13, color: '#495057' });
        });
      });
      api.button('🧹 清空餐盘', () => { items.forEach(it => { it.on = false; it.x = it.hx; it.y = it.hy; }); });
      api.note('👆 把食物拖进下面的餐盘里。');
    },
  });

  /* ================= 12. 保护眼睛 ================= */
  Sci.register({
    id: 'eyes',
    subject: 'health',
    level: 2,
    emoji: '👓',
    title: '保护眼睛',
    desc: '怎样读书、看屏幕，眼睛才不会累？',
    intro: '眼睛是心灵的窗户，可是现在近视的小朋友越来越多。读书写字时，怎样做才能保护眼睛呢？调一调书和眼睛的距离、灯光的亮度、连续用眼的时间，还有坐姿，让眼睛舒舒服服的！',
    goal: '把四项都调到保护眼睛的状态',
    fact: '<p>保护眼睛要记住“<b>三个一</b>”：眼睛离书本<b>一尺</b>（约 33 厘米），胸口离桌子<b>一拳</b>，握笔的手指离笔尖<b>一寸</b>。</p><p>光线要<b>明亮柔和</b>，不要在太暗或太刺眼的地方看书；不要躺着、趴着看书。</p><p>看书或看屏幕 <b>20 分钟</b>，就向 <b>20 英尺（约 6 米）</b>以外的远处看 <b>20 秒</b>，这叫“20-20-20 法则”。每天在户外活动 2 小时，阳光能帮助预防近视！</p>',
    quiz: [
      { q: '读书时，眼睛离书本大约多远最合适？', options: ['一尺（约 33 厘米）', '一个手指那么近'], answer: 0, explain: '眼离书本一尺远。' },
      { q: '看屏幕 20 分钟后应该怎么做？', options: ['看远处 20 秒，让眼睛休息', '继续一直看'], answer: 0, explain: '20-20-20 法则能缓解眼睛疲劳。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let dist = 15, light = 0, time = 60, sit = 'lie', done = false;
      const ok = { dist: () => dist >= 33, light: () => light === 1, time: () => time <= 20, sit: () => sit === 'up' };
      function update() {
        const all = Object.values(ok).every(f => f());
        if (all && !done) { done = true; Sci.sfx('star'); api.note('🎉 四项都做到了！眼睛舒舒服服的。记得多去户外活动哦。'); api.goalDone(); }
      }
      api.loop(() => {
        ctx.fillStyle = light === 0 ? '#495057' : light === 1 ? '#fff9db' : '#ffffff';
        ctx.fillRect(0, 0, 800, 450);
        if (light === 2) { ctx.fillStyle = 'rgba(255,255,200,.6)'; ctx.fillRect(0, 0, 800, 450); }
        // 桌子
        ctx.fillStyle = '#c08552';
        ctx.fillRect(100, 320, 420, 18);
        ctx.fillRect(120, 338, 14, 100);
        ctx.fillRect(486, 338, 14, 100);
        // 台灯
        ctx.fillStyle = '#868e96';
        ctx.fillRect(460, 200, 8, 120);
        ctx.beginPath();
        ctx.moveTo(430, 200);
        ctx.lineTo(500, 200);
        ctx.lineTo(480, 170);
        ctx.lineTo(450, 170);
        ctx.fill();
        if (light) { ctx.fillStyle = light === 1 ? 'rgba(255,230,120,.35)' : 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.moveTo(430, 200); ctx.lineTo(500, 200); ctx.lineTo(540, 320); ctx.lineTo(360, 320); ctx.fill(); }
        // 书
        ctx.fillStyle = '#4dabf7';
        ctx.fillRect(300, 308, 80, 12);
        // 小朋友：距离越近，头越低
        const headX = 340 - 60, headY = sit === 'up' ? 320 - dist * 3.2 : 300;
        ctx.strokeStyle = '#495057';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(headX + 20, headY);
        ctx.lineTo(320, 310);
        ctx.stroke();
        ctx.setLineDash([]);
        D.text(ctx, `${dist} 厘米`, (headX + 340) / 2 - 20, (headY + 310) / 2 - 14, { size: 14, color: ok.dist() ? '#2b8a3e' : '#c92a2a' });
        ctx.fillStyle = '#74c0fc';
        if (sit === 'up') ctx.fillRect(headX - 30, headY + 30, 60, 120);
        else { ctx.save(); ctx.translate(headX, headY + 20); ctx.rotate(-1.1); ctx.fillRect(-30, 0, 60, 120); ctx.restore(); }
        D.circle(ctx, headX, headY, 30, '#ffd8a8');
        D.text(ctx, Object.values(ok).every(f => f()) ? '😊' : '😣', headX, headY + 2, { size: 34 });
        // 检查表
        const rows = [['距离', ok.dist(), '眼睛离书一尺（33 厘米以上）'], ['灯光', ok.light(), '明亮柔和，不暗也不刺眼'], ['时间', ok.time(), '连续看 20 分钟就休息'], ['坐姿', ok.sit(), '坐直，不躺着、不趴着']];
        D.rrect(ctx, 560, 40, 225, 260, 14);
        ctx.fillStyle = 'rgba(255,255,255,.95)';
        ctx.fill();
        rows.forEach(([n, good, tip], i) => {
          D.text(ctx, `${good ? '✅' : '⚠️'} ${n}`, 580, 75 + i * 60, { size: 17, align: 'left', color: good ? '#2b8a3e' : '#c0620a' });
          D.text(ctx, tip, 580, 98 + i * 60, { size: 12, align: 'left', color: '#6f6a85', weight: 'normal' });
        });
        D.text(ctx, `已经连续看了 ${time} 分钟`, 300, 40, { size: 18, color: light === 0 ? '#fff' : '#2b2840' });
      });
      api.slider('眼睛和书的距离', 10, 50, 1, dist, v => { dist = v; update(); }, v => v + ' 厘米');
      api.slider('连续用眼时间', 10, 90, 10, time, v => { time = v; update(); }, v => v + ' 分钟');
      const r2 = api.row();
      api.choice([[0, '🌑 太暗'], [1, '💡 明亮柔和'], [2, '☀️ 太刺眼']], light, v => { light = v; update(); }, r2);
      api.choice([['lie', '🛌 趴着'], ['up', '✅ 坐直']], sit, v => { sit = v; update(); }, r2);
      api.note('👆 调一调下面的四项，保护好眼睛。');
    },
  });

  /* ================= 13. 病菌怎样传播 ================= */
  const MEASURES = [['mask', '😷 戴口罩', 0.4], ['wash', '🧼 勤洗手', 0.5], ['air', '🌬️ 开窗通风', 0.6], ['home', '🏠 生病在家休息', 0.4]];

  Sci.register({
    id: 'germs',
    subject: 'health',
    level: 3,
    emoji: '🤧',
    title: '病菌怎样传播',
    desc: '一个喷嚏，能让多少人感冒？',
    intro: '感冒、流感的病菌会随着喷嚏、飞沫和脏手传给别人。教室里有一位同学感冒了（红色的），看看 10 天以后会有多少同学被传染。再试试戴口罩、勤洗手、开窗通风、生病在家休息，看看能不能保护大家！（这是一个简化的模型）',
    goal: '不做防护试一次，再用防护措施把感冒的人数控制在 4 人以内',
    fact: '<p>感冒、流感等疾病的病菌主要通过<b>飞沫</b>（咳嗽、打喷嚏、说话时喷出的小水滴）和<b>接触</b>（摸了脏东西又摸眼睛、鼻子、嘴）传播。</p><p>保护自己和别人的好办法：<b>勤洗手</b>；咳嗽打喷嚏时用纸巾或手肘<b>捂住口鼻</b>；生病时<b>戴口罩</b>、在家<b>休息</b>；教室常<b>开窗通风</b>；多运动、睡好觉，让身体的免疫力更强。</p>',
    quiz: [
      { q: '打喷嚏时应该怎么做？', options: ['用纸巾或手肘捂住口鼻', '对着别人打'], answer: 0, explain: '捂住口鼻，能减少病菌飞出去。' },
      { q: '下面哪个做法能减少感冒传播？', options: ['勤洗手、开窗通风', '把门窗关得严严实实'], answer: 0, explain: '通风能让病菌浓度降低。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const COLS = 6, ROWS = 4;
      const on = new Set();
      let kids = [], day = 0, sim = null, triedNone = false, done = false, t = 0;
      function reset() {
        kids = [];
        for (let i = 0; i < COLS * ROWS; i++) kids.push({ s: 'ok' });
        kids[Math.floor(COLS * ROWS / 2) + 2].s = 'sick';
        day = 0;
      }
      reset();
      const factor = () => [...on].reduce((p, k) => p * MEASURES.find(m => m[0] === k)[2], 1);
      function run() {
        if (sim) return;
        reset();
        sim = { timer: 0, measures: on.size };
        Sci.sfx('click');
      }
      api.loop(dt => {
        t += dt;
        if (sim) {
          sim.timer -= dt;
          if (sim.timer <= 0) {
            sim.timer = 0.5;
            day++;
            const p = 0.25 * factor();
            const next = kids.map(k => k.s);
            kids.forEach((k, i) => {
              if (k.s !== 'sick') return;
              const x = i % COLS, y = Math.floor(i / COLS);
              [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]].forEach(([dx, dy]) => {
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return;
                const j = ny * COLS + nx;
                if (kids[j].s === 'ok' && Math.random() < p) next[j] = 'sick';
              });
            });
            next.forEach((s, i) => { kids[i].s = s; });
            Sci.sfx('tick');
            if (day >= 10) {
              const n = kids.filter(k => k.s === 'sick').length;
              const m = sim.measures;
              sim = null;
              if (m === 0) { triedNone = true; Sci.sfx('bad'); api.note(`10 天后，有 ${n} 位同学感冒了！病菌传得好快。打开一些防护措施再试试。`); }
              else if (n <= 4) { Sci.sfx('good'); api.note(`10 天后，只有 ${n} 位同学感冒。防护措施真有用！`); if (triedNone && !done) { done = true; Sci.sfx('star'); api.goalDone(); } else if (!triedNone) api.note(`10 天后只有 ${n} 位同学感冒。再把防护全部关掉，比较一下。`); }
              else api.note(m === 4 ? `10 天后有 ${n} 位同学感冒。这次运气不太好，再试一次吧！` : `10 天后有 ${n} 位同学感冒，再多加一些防护措施吧。`);
            }
          }
        }
        ctx.fillStyle = on.has('air') ? '#e7f5ff' : '#f1f3f5';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#2f9e44';
        ctx.fillRect(140, 20, 280, 40);
        D.text(ctx, '黑板', 280, 40, { size: 15, color: '#fff' });
        kids.forEach((k, i) => {
          const x = 90 + (i % COLS) * 80, y = 110 + Math.floor(i / COLS) * 80;
          ctx.fillStyle = '#c08552';
          ctx.fillRect(x - 28, y + 22, 56, 10);
          D.circle(ctx, x, y, 22, k.s === 'sick' ? '#ffc9c9' : '#d3f9d8', k.s === 'sick' ? '#e03131' : '#2f9e44', 3);
          D.text(ctx, k.s === 'sick' ? '🤒' : '🙂', x, y + 1, { size: 22 });
          if (on.has('mask')) { ctx.fillStyle = '#fff'; ctx.fillRect(x - 10, y + 4, 20, 9); }
          if (k.s === 'sick' && sim) germ(ctx, x + 20 + Math.sin(t * 4 + i) * 6, y - 18, 4, 'rgba(224,49,49,.7)');
        });
        const n = kids.filter(k => k.s === 'sick').length;
        D.text(ctx, `第 ${day} 天`, 650, 60, { size: 24, color: '#2b2840' });
        D.text(ctx, `感冒：${n} 人`, 650, 100, { size: 22, color: '#c92a2a' });
        D.text(ctx, `健康：${kids.length - n} 人`, 650, 135, { size: 18, color: '#2b8a3e' });
        D.text(ctx, `传染的机会：${Math.round(25 * factor())}%`, 650, 180, { size: 15, color: '#6f6a85' });
        MEASURES.forEach((m, i) => D.text(ctx, `${on.has(m[0]) ? '✅' : '⬜'} ${m[1]}`, 570, 230 + i * 30, { size: 15, align: 'left' }));
        D.text(ctx, `${triedNone ? '✅' : '⬜'} 不做防护试一次`, 570, 360, { size: 14, align: 'left', color: '#495057' });
      });
      MEASURES.forEach(m => api.toggle(m[1], false, v => { if (v) on.add(m[0]); else on.delete(m[0]); }));
      const r2 = api.row();
      api.button('▶ 过 10 天', run, r2);
      api.note('👆 先不打开防护措施，点“过 10 天”看看。');
    },
  });

  /* ================= 14. 安全与急救 ================= */
  const CASES = [
    ['🔥', '不小心被热水烫到了手', ['马上用流动的冷水冲 15 分钟以上', '赶紧涂上酱油或牙膏', '把起的水泡挑破'], 0, '冷水能带走热量、减轻伤害。酱油、牙膏会让伤口感染。'],
    ['👃', '突然流鼻血了', ['身体稍微前倾，捏住鼻翼两侧', '仰起头，让血流回去', '用纸团使劲往里塞'], 0, '仰头会让血流进喉咙，可能呛到。'],
    ['🏢', '楼里着火了，走廊有烟', ['用湿毛巾捂住口鼻，弯腰低姿从楼梯逃生', '赶快坐电梯下楼', '躲进衣柜里'], 0, '着火时电梯可能断电停住，烟往上飘，所以要低姿前进。'],
    ['🌋', '在教室里遇到地震', ['躲到结实的课桌下，护住头部', '马上从窗户跳下去', '站在窗户边看看'], 0, '就近躲避，等震动停了再有序撤离。'],
    ['🧑', '看到有人突然晕倒了', ['大声呼救，请大人帮忙，拨打 120', '赶紧走开', '给他喂很多水'], 0, '昏迷的人喂水可能呛到，要尽快找大人、打急救电话。'],
    ['🐕', '被小狗咬破了皮', ['用肥皂水和清水冲洗伤口，尽快去医院打疫苗', '贴个创可贴就行了', '不用管它'], 0, '狗咬伤可能感染狂犬病，一定要及时打疫苗。'],
    ['🌊', '看到有小伙伴掉进水里', ['大声呼救，找大人，扔救生圈或竹竿', '自己马上跳下去救', '手拉手下水去拉'], 0, '小朋友不能自己下水救人，那样很危险。'],
  ];

  Sci.register({
    id: 'firstaid',
    subject: 'health',
    level: 4,
    emoji: '🚑',
    title: '安全与急救',
    desc: '遇到危险和意外时，正确的做法是？',
    intro: '生活中难免会遇到意外：烫伤、流鼻血、火灾、地震……这时候冷静下来、用对方法，就能保护自己和别人。每张卡片上都有一个情况，选出最正确的做法吧！',
    goal: '答对 6 个安全问题',
    fact: '<p>记住这些<b>求助电话</b>：<b>110</b> 报警，<b>119</b> 火警，<b>120</b> 急救。打电话时说清楚地点和发生了什么事。</p><p>🔥 烫伤：冷水冲 15 分钟以上。👃 流鼻血：身体前倾，捏住鼻翼。🏢 火灾：湿毛巾捂口鼻，弯腰走楼梯，<b>不坐电梯</b>。🌋 地震：躲在结实的桌子下护住头。🌊 有人落水：大声呼救、找大人、扔救生圈，<b>小朋友不能下水救人</b>。</p><p>遇到危险，最重要的是<b>保护好自己</b>，并及时告诉大人。</p>',
    quiz: [
      { q: '发生火灾时，应该拨打哪个电话？', options: ['119', '110', '120'], answer: 0, explain: '119 是火警电话。' },
      { q: '着火逃生时，可以坐电梯吗？', options: ['不可以，要走楼梯', '可以'], answer: 0, explain: '火灾时电梯可能断电停住，非常危险。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const order = Sci.shuffle(CASES.map((c, i) => i));
      let qi = 0, right = 0, picked = -1, opts = [], t = 0;
      function load() {
        const c = CASES[order[qi % order.length]];
        opts = Sci.shuffle(c[2].map((s, i) => [s, i === c[3]]));
        picked = -1;
      }
      load();
      api.pointer(st, {
        down(p) {
          if (picked >= 0) return;
          const i = Math.floor((p.y - 200) / 70);
          if (i < 0 || i > 2 || p.x < 100 || p.x > 700) return;
          picked = i;
          const c = CASES[order[qi % order.length]];
          if (opts[i][1]) {
            right++;
            Sci.sfx('good');
            api.note(`✅ 正确！${c[4]}（答对 ${Math.min(right, 6)}/6）`);
            if (right === 6) api.goalDone();
          } else { Sci.sfx('bad'); api.note(`这样做不对哦。正确做法是：${c[2][c[3]]}。${c[4]}`); }
          api.timeout(() => { qi++; load(); }, 2800);
        },
      });
      api.loop(dt => {
        t += dt;
        const c = CASES[order[qi % order.length]];
        ctx.fillStyle = '#fff5f5';
        ctx.fillRect(0, 0, 800, 450);
        D.rrect(ctx, 100, 30, 600, 140, 20);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#ffa8a8';
        ctx.lineWidth = 3;
        ctx.stroke();
        D.emoji(ctx, c[0], 170, 100, 60);
        D.text(ctx, '如果……', 230, 70, { size: 16, align: 'left', color: '#c92a2a' });
        D.text(ctx, c[1] + '，怎么办？', 230, 110, { size: 22, align: 'left', maxW: 450 });
        opts.forEach(([s, good], i) => {
          const y = 200 + i * 70;
          D.rrect(ctx, 100, y, 600, 58, 14);
          ctx.fillStyle = picked < 0 ? '#fff' : good ? '#d3f9d8' : picked === i ? '#ffe3e3' : '#fff';
          ctx.fill();
          ctx.strokeStyle = '#dee2e6';
          ctx.lineWidth = 2;
          ctx.stroke();
          D.text(ctx, `${'ABC'[i]}. ${s}`, 125, y + 29, { size: 17, align: 'left', maxW: 560 });
        });
        D.text(ctx, `答对 ${Math.min(right, 6)} / 6`, 780, 22, { size: 15, align: 'right', color: '#c92a2a' });
        D.text(ctx, '求助电话：110 报警　119 火警　120 急救', 400, 430, { size: 15, color: '#495057' });
      });
      api.note('👆 读一读卡片上的情况，选出最正确的做法。');
    },
  });

  /* ================= 15. 疫苗与群体免疫 ================= */
  Sci.register({
    id: 'herd',
    subject: 'health',
    level: 5,
    emoji: '💉',
    title: '疫苗与群体免疫',
    desc: '为什么打疫苗的人多了，大家都更安全？',
    intro: '疫苗能让身体提前认识病菌，学会怎么打败它。可是有些小宝宝太小、有些人身体不好，没法打疫苗。如果周围大部分人都打了疫苗，病菌就很难传开，这些人也能得到保护——这叫“群体免疫”。调一调打疫苗的人数比例，看看传染病会传开多少！（这是一个简化的模型）',
    goal: '找到能让被传染的人少于一成的疫苗接种比例',
    fact: '<p><b>疫苗</b>里是“减弱”或“灭活”的病菌（或者病菌的一小部分），打进身体后，免疫系统会认识它、记住它。以后真的病菌来了，身体就能很快把它消灭。</p><p>当足够多的人有了免疫力，病菌找不到可以传染的人，就传不开了。这样，没法打疫苗的小宝宝和病人也被保护了起来，这叫<b>群体免疫</b>。</p><p>💪 我国的儿童计划免疫，帮助小朋友预防了麻疹、脊髓灰质炎（小儿麻痹）等很多疾病。按时接种疫苗，保护自己，也保护别人。</p>',
    quiz: [
      { q: '疫苗是怎样保护我们的？', options: ['让身体提前认识病菌，学会对付它', '直接把我们变成大力士'], answer: 0, explain: '疫苗训练免疫系统认识病菌。' },
      { q: '“群体免疫”能保护哪些人？', options: ['包括没法打疫苗的小宝宝在内的所有人', '只保护打了疫苗的人'], answer: 0, explain: '病菌传不开，大家都更安全。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const W = 24, H = 14, CS = 20, GX = 20, GY = 60;
      let rate = 20, grid = [], sim = null, lastPct = null, triedLow = false, done = false, t = 0;
      function reset() {
        grid = [];
        for (let i = 0; i < W * H; i++) grid.push(Math.random() * 100 < rate ? 'vax' : 'ok');
        for (let k = 0; k < 3; k++) { const i = Math.floor(Math.random() * W * H); grid[i] = 'sick'; }
      }
      reset();
      function run() {
        if (sim) return;
        reset();
        sim = { timer: 0, steps: 0 };
        Sci.sfx('click');
      }
      api.loop(dt => {
        t += dt;
        if (sim) {
          sim.timer -= dt;
          if (sim.timer <= 0) {
            sim.timer = 0.15;
            sim.steps++;
            const next = grid.slice();
            let spread = false;
            grid.forEach((s, i) => {
              if (s !== 'sick') return;
              const x = i % W, y = Math.floor(i / W);
              [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].forEach(([dx, dy]) => {
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= W || ny >= H) return;
                const j = ny * W + nx;
                if (grid[j] === 'ok' && Math.random() < 0.7) { next[j] = 'sick'; spread = true; }
              });
              next[i] = 'healed';
            });
            grid = next;
            if (!grid.some(s => s === 'sick') || sim.steps > 60) {
              const n = grid.filter(s => s === 'healed' || s === 'sick').length;
              const pct = Math.round(n / grid.length * 100);
              lastPct = pct;
              sim = null;
              if (pct >= 30) triedLow = true;
              if (pct < 10) { Sci.sfx('good'); api.note(`疫苗接种比例 ${rate}%：传染病只传给了 ${pct}% 的人，很快就停下来了！`); if (triedLow && !done) { done = true; Sci.sfx('star'); api.goalDone(); } else if (!triedLow) api.note(`接种比例 ${rate}%：只有 ${pct}% 的人被传染。再把比例调低试试，比较一下。`); }
              else { Sci.sfx('bad'); api.note(`疫苗接种比例 ${rate}%：传染病传给了 ${pct}% 的人！试试提高接种比例。`); }
            }
          }
        }
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 450);
        const COLOR = { ok: '#dee2e6', vax: '#74c0fc', sick: '#fa5252', healed: '#ffc078' };
        grid.forEach((s, i) => {
          const x = GX + (i % W) * CS, y = GY + Math.floor(i / W) * CS;
          D.circle(ctx, x + CS / 2, y + CS / 2, CS / 2 - 2, COLOR[s]);
        });
        [['ok', '没打疫苗'], ['vax', '打了疫苗'], ['sick', '正在生病'], ['healed', '病过了']].forEach(([k, n], i) => {
          D.circle(ctx, 530, 80 + i * 32, 9, COLOR[k]);
          D.text(ctx, n, 548, 80 + i * 32, { size: 15, align: 'left' });
        });
        D.text(ctx, `疫苗接种比例：${rate}%`, 640, 240, { size: 20, color: '#1c7ed6' });
        D.text(ctx, lastPct === null ? '' : `上次被传染的人：${lastPct}%`, 640, 280, { size: 18, color: lastPct !== null && lastPct < 10 ? '#2b8a3e' : '#c92a2a' });
        D.text(ctx, '（简化的模型，只是为了说明道理）', 640, 420, { size: 12, color: '#868e96', weight: 'normal' });
        D.text(ctx, `${triedLow ? '✅' : '⬜'} 看到传染病大面积传开`, 520, 330, { size: 14, align: 'left' });
        D.text(ctx, `${done ? '✅' : '⬜'} 传染少于一成`, 520, 358, { size: 14, align: 'left' });
      });
      api.slider('疫苗接种比例', 0, 95, 5, rate, v => { if (!sim) { rate = v; reset(); } }, v => v + '%');
      api.button('▶ 传染病来了', run);
      api.note('👆 先用很低的接种比例试一次，再慢慢提高。');
    },
  });
})();
