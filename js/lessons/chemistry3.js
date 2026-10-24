/* 化学魔术（第三组）：物质的变化 → 表面张力 → 长出糖晶体 → 酸碱中和 → 质量守恒 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 11. 物质的变化 ================= */
  const CHANGES = [
    ['🧊', '冰融化成水', false], ['📄', '纸烧成灰', true], ['🔩', '铁钉生锈', true], ['✂️', '把纸剪碎', false],
    ['🍞', '面包烤焦', true], ['🍬', '糖溶在水里', false], ['🍳', '鸡蛋煎熟', true], ['💧', '水结成冰', false],
    ['🎆', '烟花爆炸', true], ['🎈', '吹大气球', false], ['🥛', '牛奶变酸', true], ['🍫', '巧克力融化', false],
  ];

  Sci.register({
    id: 'changes',
    subject: 'chemistry',
    level: 1,
    emoji: '🔥',
    title: '物质的变化',
    desc: '只是样子变了，还是变出了新东西？',
    intro: '身边的东西每天都在变：冰会融化，纸会烧成灰，面包会烤焦……这些变化可以分成两类：一类只是样子变了，东西还是原来的东西；另一类却变出了全新的东西！把每张卡片拖进正确的盒子里吧。',
    goal: '把 12 张卡片都分对',
    fact: '<p><b>物理变化</b>：只是形状、大小或状态变了，没有产生新的物质。比如冰融化成水，水还是水；纸剪碎了，还是纸。</p><p><b>化学变化</b>：产生了<b>新的物质</b>。比如纸烧成了灰和烟，铁变成了铁锈，鸡蛋煎熟了再也变不回生鸡蛋。化学变化常常伴随着发光、发热、变色、冒气泡或者产生气味。</p>',
    quiz: [
      { q: '下面哪个是化学变化？', options: ['冰融化', '木头燃烧', '把纸折成飞机'], answer: 1, explain: '木头燃烧产生了灰和二氧化碳等新物质。' },
      { q: '水结成冰，是什么变化？', options: ['物理变化', '化学变化'], answer: 0, explain: '冰还是水，只是状态变了。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const cards = Sci.shuffle(CHANGES).map((c, i) => ({ e: c[0], name: c[1], chem: c[2], hx: 70 + (i % 6) * 120, hy: 70 + Math.floor(i / 6) * 90, x: 0, y: 0, put: null }));
      cards.forEach(c => { c.x = c.hx; c.y = c.hy; });
      let drag = null;
      const BOX = [{ chem: false, x: 30, name: '物理变化：只是样子变了' }, { chem: true, x: 410, name: '化学变化：变出了新东西' }];

      api.pointer(st, {
        down(p) {
          const c = cards.slice().reverse().find(c => !c.put && Math.abs(p.x - c.x) < 55 && Math.abs(p.y - c.y) < 38);
          if (c) { drag = { c, ox: c.x - p.x, oy: c.y - p.y }; Sci.sfx('pop'); }
        },
        move(p) { if (drag) { drag.c.x = p.x + drag.ox; drag.c.y = p.y + drag.oy; } },
        up() {
          if (!drag) return;
          const c = drag.c;
          drag = null;
          if (c.y < 260) { c.x = c.hx; c.y = c.hy; return; }
          const box = c.x < 400 ? BOX[0] : BOX[1];
          if (box.chem !== c.chem) {
            Sci.sfx('bad');
            api.note(c.chem ? `${c.e} ${c.name}：变出了新东西，再也变不回去了，是化学变化哦。` : `${c.e} ${c.name}：东西还是原来的东西，只是样子变了，是物理变化哦。`);
            c.x = c.hx;
            c.y = c.hy;
            return;
          }
          const k = cards.filter(o => o.put === box).length;
          c.put = box;
          c.x = box.x + 60 + (k % 3) * 120;
          c.y = 330 + Math.floor(k / 3) * 30;
          Sci.sfx('good');
          const left = cards.filter(o => !o.put).length;
          api.note(`✅ ${c.name}：${c.chem ? '变出了新东西' : '只是样子变了'}。` + (left ? `（还有 ${left} 张）` : ''));
          if (!left) api.timeout(() => { api.note('🎉 全部分对啦！有没有产生新物质，就是区别两种变化的关键。'); api.goalDone(); }, 1200);
        },
      });
      function card(c) {
        const small = !!c.put;
        const w = small ? 110 : 110, h = small ? 26 : 70;
        D.rrect(ctx, c.x - w / 2, c.y - h / 2, w, h, 10);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = small ? (c.chem ? '#9b5cff' : '#3d8bff') : '#dee2e6';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (small) D.text(ctx, c.e + ' ' + c.name, c.x, c.y + 1, { size: 12, maxW: 104 });
        else { D.emoji(ctx, c.e, c.x, c.y - 10, 30); D.text(ctx, c.name, c.x, c.y + 22, { size: 13 }); }
      }
      function render() {
        ctx.fillStyle = '#f8f0fc';
        ctx.fillRect(0, 0, 800, 450);
        BOX.forEach(b => {
          D.rrect(ctx, b.x, 270, 360, 170, 18);
          ctx.fillStyle = b.chem ? '#f3d9fa' : '#d0ebff';
          ctx.fill();
          D.text(ctx, b.name, b.x + 180, 292, { size: 16, color: b.chem ? '#862e9c' : '#1864ab' });
        });
        cards.filter(c => c.put).forEach(card);
        cards.filter(c => !c.put && c !== (drag && drag.c)).forEach(card);
        if (drag) card(drag.c);
      }
      api.loop(render);
      api.note('👆 把上面的卡片拖进下面的两个盒子：只是样子变了，还是变出了新东西？');
    },
  });

  /* ================= 12. 表面张力 ================= */
  Sci.register({
    id: 'surface',
    subject: 'chemistry',
    level: 2,
    emoji: '💧',
    title: '表面张力',
    desc: '一枚硬币上能滴多少滴水？胡椒粉为什么会逃跑？',
    intro: '水的表面好像有一层看不见的“薄膜”，紧紧地绷着，这叫“表面张力”。往一枚硬币上一滴一滴地滴水，猜猜能滴多少滴才会溢出来？换成肥皂水又会怎样？再看看撒满胡椒粉的水面上，滴一滴洗洁精会发生什么！',
    goal: '分别用清水和肥皂水滴满硬币，再做胡椒粉实验',
    fact: '<p>水分子之间会互相吸引，表面的水分子被旁边和下面的水分子拉着，就像一层绷紧的弹性薄膜，这就是<b>表面张力</b>。所以硬币上的水能鼓起一个“小山包”，水黾能站在水面上。</p><p>肥皂和洗洁精会<b>减小</b>表面张力。滴一滴洗洁精，那一处的“薄膜”松了，四周绷紧的水面就把胡椒粉拉向了边缘。</p><p>🧼 正因为肥皂减小了表面张力，肥皂水才能吹出又大又薄的泡泡。</p>',
    quiz: [
      { q: '硬币上能滴更多滴的是？', options: ['清水', '肥皂水'], answer: 0, explain: '清水的表面张力更大，能鼓得更高。' },
      { q: '水黾能站在水面上，靠的是什么？', options: ['表面张力', '它会飞'], answer: 0, explain: '水的表面张力像一层薄膜托住了它。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let mode = 'coin', soap = false, drops = 0, spill = 0, falling = null, peppered = false, t = 0;
      const done = new Set();
      const pepper = [];
      const resetPepper = () => {
        pepper.length = 0;
        for (let i = 0; i < 140; i++) { const a = rand(0, 6.28), r = Math.sqrt(Math.random()) * 170; pepper.push({ x: 400 + Math.cos(a) * r, y: 240 + Math.sin(a) * r * 0.55, vx: 0, vy: 0 }); }
        peppered = false;
      };
      resetPepper();
      const maxDrops = () => (soap ? 12 : 32);

      function drip() {
        if (mode !== 'coin' || falling || spill > 0) return;
        falling = { y: 40 };
      }
      function land() {
        drops++;
        Sci.sfx('plop');
        if (drops > maxDrops()) {
          spill = 1;
          done.add(soap ? 'soap' : 'water');
          Sci.sfx('splash');
          api.note(`哗——溢出来了！${soap ? '肥皂水' : '清水'}一共滴了 ${drops - 1} 滴。` + (soap ? '肥皂让表面张力变小了，水鼓不起来。' : '换成肥皂水试试？'));
          check();
        } else api.note(`第 ${drops} 滴……水面鼓得越来越高了！`);
      }
      function check() {
        if (done.has('water') && done.has('soap') && done.has('pepper')) api.goalDone();
      }
      api.pointer(st, {
        down(p) {
          if (mode === 'coin') drip();
          else if (!peppered && Math.hypot(p.x - 400, (p.y - 240) / 0.55) < 190) {
            peppered = { x: p.x, y: p.y };
            pepper.forEach(q => {
              const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1;
              q.vx = dx / d * 380;
              q.vy = dy / d * 380 * 0.6;
            });
            done.add('pepper');
            Sci.sfx('whoosh');
            api.note('哇！胡椒粉一下子“逃”到了边上！洗洁精让中间的表面张力变小了，四周的水面把胡椒粉拉走了。');
            check();
          }
        },
      });
      function renderCoin() {
        ctx.fillStyle = '#eef6ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#c9a26b';
        ctx.fillRect(0, 380, 800, 70);
        // 滴管
        ctx.fillStyle = soap ? '#d0bfff' : '#a5d8ff';
        ctx.fillRect(388, 0, 24, 40);
        D.circle(ctx, 400, 0, 22, '#ff8787');
        // 硬币
        ctx.fillStyle = '#e8b500';
        ctx.beginPath();
        ctx.ellipse(400, 360, 90, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d4a000';
        ctx.fillRect(310, 360, 180, 14);
        ctx.beginPath();
        ctx.ellipse(400, 374, 90, 22, 0, 0, Math.PI);
        ctx.fill();
        // 水包
        const k = Math.min(drops, maxDrops()) / 32;
        if (drops > 0 && !spill) {
          const hgt = 6 + k * 70;
          ctx.fillStyle = soap ? 'rgba(200,180,255,.7)' : 'rgba(120,190,255,.7)';
          ctx.beginPath();
          ctx.moveTo(318, 360);
          ctx.bezierCurveTo(330, 360 - hgt, 470, 360 - hgt, 482, 360);
          ctx.ellipse(400, 360, 82, 18, 0, 0, Math.PI);
          ctx.fill();
          D.circle(ctx, 370, 360 - hgt * 0.6, 6, 'rgba(255,255,255,.6)');
        }
        if (spill > 0) {
          ctx.fillStyle = soap ? 'rgba(200,180,255,.6)' : 'rgba(120,190,255,.6)';
          ctx.beginPath();
          ctx.ellipse(400, 385, 90 + (1 - spill) * 160, 14, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        if (falling) D.circle(ctx, 400, falling.y, 7, soap ? '#b197fc' : '#4dabf7');
        D.text(ctx, `${soap ? '肥皂水' : '清水'}：已经滴了 ${drops} 滴`, 400, 420, { size: 20, color: '#fff' });
        D.text(ctx, '👆 点一下画面，滴一滴', 790, 22, { size: 14, align: 'right', color: '#6f6a85', weight: 'normal' });
      }
      function renderPepper() {
        ctx.fillStyle = '#f1f3f5';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(400, 240, 210, 125, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(165,216,255,.6)';
        ctx.beginPath();
        ctx.ellipse(400, 240, 195, 112, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ced4da';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(400, 240, 210, 125, 0, 0, Math.PI * 2);
        ctx.stroke();
        pepper.forEach(q => D.circle(ctx, q.x, q.y, 2.2, '#343a40'));
        if (peppered) {
          D.emoji(ctx, '👆', peppered.x + 10, peppered.y + 30, 30);
          D.circle(ctx, peppered.x, peppered.y, 10 + t % 1 * 30, null, 'rgba(150,100,255,.4)', 2);
        }
        D.text(ctx, peppered ? '胡椒粉逃到了边上！' : '👆 用沾了洗洁精的手指点一下水面', 400, 410, { size: 18, color: '#2b2840' });
      }
      api.loop(dt => {
        t += dt;
        if (falling) { falling.y += dt * 500; if (falling.y > 330 - Math.min(drops, maxDrops()) / 32 * 70) { falling = null; land(); } }
        if (spill > 0) spill = Math.max(0, spill - dt * 0.4);
        pepper.forEach(q => {
          q.x += q.vx * dt;
          q.y += q.vy * dt;
          q.vx *= Math.exp(-2.5 * dt);
          q.vy *= Math.exp(-2.5 * dt);
          const ex = (q.x - 400) / 190, ey = (q.y - 240) / 108, e = Math.hypot(ex, ey);
          if (e > 1) { q.x = 400 + ex / e * 190; q.y = 240 + ey / e * 108; q.vx = q.vy = 0; }
        });
        if (mode === 'coin') renderCoin();
        else renderPepper();
        D.text(ctx, `${done.has('water') ? '✅' : '⬜'} 清水　${done.has('soap') ? '✅' : '⬜'} 肥皂水　${done.has('pepper') ? '✅' : '⬜'} 胡椒粉`, 20, 26, { size: 15, align: 'left', color: '#2b2840' });
      });
      api.choice([['coin', '💧 硬币滴水'], ['pepper', '🌶️ 胡椒粉逃跑']], mode, v => {
        mode = v;
        coinRow.hidden = v !== 'coin';
        api.note(v === 'coin' ? '点画面往硬币上滴水，数一数能滴多少滴。' : '水面上撒满了胡椒粉。点一下水面，相当于滴一滴洗洁精。');
      });
      const coinRow = api.row();
      api.choice([[false, '💧 清水'], [true, '🧼 肥皂水']], soap, v => { soap = v; drops = 0; spill = 0; }, coinRow);
      api.button('🧻 擦干硬币', () => { drops = 0; spill = 0; }, coinRow);
      api.button('🔄 重新撒胡椒粉', () => resetPepper());
      api.note('👆 点画面往硬币上滴水，猜猜能滴多少滴才会溢出来？');
    },
  });

  /* ================= 13. 长出糖晶体 ================= */
  Sci.register({
    id: 'crystal',
    subject: 'chemistry',
    level: 3,
    emoji: '💎',
    title: '长出糖晶体',
    desc: '饱和溶液慢慢变凉，长出亮晶晶的冰糖',
    intro: '冰糖是怎么做出来的？往水里加糖，糖会溶解，可是加到一定程度就再也溶不下了，这叫“饱和”。把水加热，又能溶下更多的糖。然后放进一根细线，让糖水慢慢变凉，看看会发生什么！',
    goal: '做出热的饱和糖水，再让它冷却长出晶体',
    fact: '<p>一定量的水里能溶解的糖是有限的，溶不下时就叫<b>饱和溶液</b>。<b>温度越高，能溶解的糖越多</b>。</p><p>热的饱和糖水慢慢冷却，多出来的糖“装不下”了，就会从水里跑出来，一层一层整齐地排列，长成有规则形状的<b>晶体</b>。这个过程叫<b>结晶</b>。</p><p>❄️ 雪花、食盐、钻石、冰糖都是晶体。冷却得越慢，晶体长得越大、越漂亮！</p>',
    quiz: [
      { q: '怎样让水里溶解更多的糖？', options: ['把水加热', '把水放进冰箱'], answer: 0, explain: '温度越高，能溶解的糖越多。' },
      { q: '想得到又大又漂亮的晶体，应该让糖水怎样冷却？', options: ['慢慢冷却', '一下子冰冻'], answer: 0, explain: '冷却得慢，晶体才有时间长大。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const BX = 260, BY = 140, BW = 220, BH = 250;
      let temp = 20, sugar = 0, stringIn = false, grown = 0, cooling = false, t = 0, heat = false;
      const cap = () => Math.floor(4 + (temp - 20) / 60 * 6); // 20°C 能溶 4 勺，80°C 能溶 10 勺
      const dissolved = () => Math.min(sugar, cap());
      const crystals = [];

      function addSugar() {
        if (sugar >= 12) { api.note('糖已经放得够多啦。'); return; }
        sugar++;
        Sci.sfx('pop');
        if (sugar > cap()) api.note(`加了 ${sugar} 勺，有 ${sugar - cap()} 勺怎么搅也溶不掉了——糖水饱和了！${temp < 80 ? '试试加热。' : ''}`);
        else api.note(`加了 ${sugar} 勺，糖都溶解了，看不见了。`);
      }
      function check() {
        if (crystals.length >= 12) api.goalDone();
      }
      api.loop(dt => {
        t += dt;
        if (heat && temp < 80) temp = Math.min(80, temp + dt * 15);
        if (!heat && cooling && temp > 20) {
          const before = cap();
          temp = Math.max(20, temp - dt * 6);
          // 冷却时溶不下的糖在细线上结晶
          if (stringIn && cap() < before && Math.min(sugar, before) > cap()) {
            const extra = Math.min(dissolved(), sugar) - cap();
            for (let i = 0; i < 3; i++) crystals.push({ y: BY + 40 + rand(0, 160), dx: rand(-14, 14), s: rand(6, 12), r: rand(0, 1.5) });
            grown += Math.max(0, extra);
            Sci.sfx('tick');
            check();
          }
          if (temp <= 20) {
            cooling = false;
            api.note(stringIn && crystals.length ? `✨ 糖水凉了，细线上长出了 ${crystals.length} 颗亮晶晶的糖晶体！` : '糖水凉了。下次记得先放进细线哦。');
            if (stringIn && sugar > 4) sugar = 4 + Math.max(0, sugar - 10);
          }
        }
        render();
      });
      function render() {
        ctx.fillStyle = '#f8f0fc';
        ctx.fillRect(0, 0, 800, 450);
        // 加热台
        ctx.fillStyle = '#495057';
        ctx.fillRect(BX - 20, BY + BH, BW + 40, 20);
        if (heat) for (let i = 0; i < 5; i++) D.emoji(ctx, '🔥', BX + 30 + i * 40, BY + BH + 40, 26 + Math.sin(t * 15 + i) * 3);
        // 烧杯和糖水
        const sat = sugar >= cap();
        ctx.fillStyle = `rgba(255,230,180,${0.25 + dissolved() * 0.05})`;
        ctx.fillRect(BX, BY + 40, BW, BH - 40);
        const extra = Math.max(0, sugar - cap());
        for (let i = 0; i < extra * 8; i++) D.circle(ctx, BX + 12 + (i * 23) % (BW - 24), BY + BH - 6 - Math.floor(i / 9) * 5, 3, '#fff', '#dee2e6', 1);
        ctx.strokeStyle = '#8fa3bf';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(BX, BY);
        ctx.lineTo(BX, BY + BH);
        ctx.lineTo(BX + BW, BY + BH);
        ctx.lineTo(BX + BW, BY);
        ctx.stroke();
        // 细线和晶体
        if (stringIn) {
          ctx.fillStyle = '#8d5a3b';
          ctx.fillRect(BX - 30, BY - 10, BW + 60, 8);
          ctx.strokeStyle = '#adb5bd';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(BX + BW / 2, BY - 2);
          ctx.lineTo(BX + BW / 2, BY + 210);
          ctx.stroke();
          crystals.forEach(c => {
            ctx.save();
            ctx.translate(BX + BW / 2 + c.dx, c.y);
            ctx.rotate(c.r);
            ctx.fillStyle = 'rgba(255,255,255,.9)';
            ctx.strokeStyle = '#91a7ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, -c.s);
            ctx.lineTo(c.s * 0.8, 0);
            ctx.lineTo(0, c.s);
            ctx.lineTo(-c.s * 0.8, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          });
        }
        // 温度计
        ctx.fillStyle = '#fff';
        D.rrect(ctx, 560, 80, 30, 280, 15);
        ctx.fill();
        ctx.strokeStyle = '#adb5bd';
        ctx.stroke();
        const th = (temp - 0) / 100 * 250;
        ctx.fillStyle = '#fa5252';
        ctx.fillRect(568, 350 - th, 14, th);
        D.circle(ctx, 575, 362, 16, '#fa5252');
        D.text(ctx, `${Math.round(temp)}°C`, 640, 220, { size: 26, color: '#c92a2a' });
        D.text(ctx, `能溶下 ${cap()} 勺糖`, 680, 260, { size: 16, color: '#2b2840' });
        D.text(ctx, `已加 ${sugar} 勺${sat ? '（饱和了）' : ''}`, 680, 290, { size: 16, color: sat ? '#c0620a' : '#2b2840' });
        D.text(ctx, `晶体：${crystals.length} 颗`, 680, 330, { size: 16, color: '#4263eb' });
      }
      api.button('🥄 加一勺糖', addSugar);
      api.toggle('🔥 加热', false, v => {
        heat = v;
        cooling = !v;
        api.note(v ? '加热中……温度越高，能溶解的糖越多。' : '关火了，糖水开始慢慢变凉。');
      });
      api.toggle('🧵 放进细线', false, v => { stringIn = v; });
      api.button('🔄 重新开始', () => { sugar = 0; temp = 20; crystals.length = 0; heat = false; cooling = false; api.note('换了一杯清水。'); });
      api.note('👆 先一勺一勺加糖，看看能溶解多少。');
    },
  });

  /* ================= 14. 酸碱中和 ================= */
  Sci.register({
    id: 'neutralize',
    subject: 'chemistry',
    level: 4,
    emoji: '⚗️',
    title: '酸碱中和',
    desc: '酸和碱碰到一起，会互相“抵消”',
    intro: '烧杯里是酸性的醋，滴了几滴紫甘蓝汁当“变色侦探”，所以变成了红色。往里面一滴一滴加入碱性的小苏打水，看看颜色和 pH 值怎么变化。你能正好调到不酸也不碱的“中性”吗？',
    goal: '把溶液正好调到中性（pH = 7）',
    fact: '<p><b>pH 值</b>表示溶液的酸碱程度：小于 7 是<b>酸性</b>，等于 7 是<b>中性</b>，大于 7 是<b>碱性</b>。</p><p>酸和碱放在一起会互相抵消，生成盐和水，这叫<b>酸碱中和</b>。紫甘蓝汁在酸里是红色，中性时是紫色，在碱里会变成绿色。</p><p>🐝 生活里的中和：被蚂蚁、蜜蜂蛰了（酸性），涂一点肥皂水（碱性）能减轻疼痛；胃酸太多时吃的胃药，也是用来中和胃酸的。</p>',
    quiz: [
      { q: 'pH 等于 7 的溶液是？', options: ['酸性', '中性', '碱性'], answer: 1, explain: 'pH 小于 7 酸性，等于 7 中性，大于 7 碱性。' },
      { q: '被蚂蚁咬了（蚁酸是酸性），可以涂什么来减轻疼痛？', options: ['肥皂水', '醋'], answer: 0, explain: '肥皂水是碱性的，能中和酸。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const ACID = 20;
      let base = 0, drop = null, t = 0, best = false;
      const net = () => base - ACID;
      const ph = () => {
        const n = net();
        if (n === 0) return 7;
        return clamp(7 + Math.sign(n) * (0.8 + 4.2 * Math.log(1 + Math.abs(n)) / Math.log(21)), 1, 13);
      };
      const colorOf = p => {
        const stops = [[1, [230, 40, 70]], [4, [235, 90, 160]], [7, [140, 70, 200]], [9, [60, 110, 230]], [11, [40, 170, 140]], [13, [200, 210, 50]]];
        for (let i = 1; i < stops.length; i++) if (p <= stops[i][0]) { const [a, ca] = stops[i - 1], [b, cb] = stops[i]; return Sci.mixColor(ca, cb, (p - a) / (b - a)); }
        return stops[stops.length - 1][1];
      };
      function add(kind, n) {
        if (drop) return;
        drop = { kind, n, y: 30 };
      }
      function arrive() {
        if (drop.kind === 'base') base += drop.n;
        else base = Math.max(0, base - drop.n);
        drop = null;
        Sci.sfx('plop');
        const p = ph();
        if (p === 7) {
          Sci.sfx('star');
          api.note('🎉 正好是 pH 7，中性！溶液变成了紫色。酸和碱完全中和了。');
          if (!best) { best = true; api.goalDone(); }
        } else if (p < 7) api.note(`pH ${p.toFixed(1)}，还是酸性（${p < 4 ? '红色' : '粉红色'}）。继续加小苏打水。`);
        else api.note(`pH ${p.toFixed(1)}，变成碱性了（${p > 10 ? '绿色' : '蓝色'}）！加多啦，可以滴一点醋调回来。`);
      }
      api.loop(dt => {
        t += dt;
        if (drop) { drop.y += dt * 400; if (drop.y > 200) arrive(); }
        const p = ph(), c = colorOf(p);
        ctx.fillStyle = '#f8f9ff';
        ctx.fillRect(0, 0, 800, 450);
        // 滴管
        ctx.fillStyle = '#d3f9d8';
        ctx.fillRect(170, 0, 26, 40);
        D.text(ctx, '小苏打水', 240, 20, { size: 13, color: '#2b8a3e' });
        ctx.fillStyle = '#ffe3e3';
        ctx.fillRect(330, 0, 26, 40);
        D.text(ctx, '醋', 380, 20, { size: 13, color: '#c92a2a' });
        if (drop) D.circle(ctx, drop.kind === 'base' ? 183 : 343, drop.y, 6 + Math.min(drop.n, 5), drop.kind === 'base' ? '#8ce99a' : '#ffa8a8');
        // 烧杯
        ctx.fillStyle = Sci.rgb(c, 0.85);
        ctx.fillRect(150, 210, 230, 180);
        ctx.strokeStyle = '#8fa3bf';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(150, 170);
        ctx.lineTo(150, 390);
        ctx.lineTo(380, 390);
        ctx.lineTo(380, 170);
        ctx.stroke();
        // pH 尺
        const X = 470, W = 300, Y = 300;
        for (let i = 0; i < W; i++) { ctx.fillStyle = Sci.rgb(colorOf(1 + i / W * 12)); ctx.fillRect(X + i, Y, 1, 30); }
        for (let v = 1; v <= 13; v += 2) D.text(ctx, String(v), X + (v - 1) / 12 * W, Y + 46, { size: 13, color: '#495057', weight: 'normal' });
        D.text(ctx, '酸性', X + 40, Y - 16, { size: 14, color: '#c92a2a' });
        D.text(ctx, '中性', X + W / 2, Y - 16, { size: 14, color: '#7048e8' });
        D.text(ctx, '碱性', X + W - 40, Y - 16, { size: 14, color: '#2b8a3e' });
        const mx = X + (p - 1) / 12 * W;
        ctx.fillStyle = '#212529';
        ctx.beginPath();
        ctx.moveTo(mx, Y - 2);
        ctx.lineTo(mx - 8, Y - 14);
        ctx.lineTo(mx + 8, Y - 14);
        ctx.fill();
        D.text(ctx, `pH ${p === 7 ? '7' : p.toFixed(1)}`, 620, 160, { size: 46, color: Sci.rgb(c) });
        D.text(ctx, p === 7 ? '中性 ✅' : p < 7 ? '酸性' : '碱性', 620, 215, { size: 22, color: '#2b2840' });
        D.text(ctx, `加了 ${base} 滴小苏打水`, 620, 250, { size: 15, color: '#6f6a85', weight: 'normal' });
      });
      api.button('💧 滴 1 滴小苏打水', () => add('base', 1));
      api.button('💧💧 滴 5 滴小苏打水', () => add('base', 5));
      api.button('🍶 滴 1 滴醋', () => add('acid', 1));
      api.note('👆 往红色的醋里滴小苏打水，试着调到正好中性。');
    },
  });

  /* ================= 15. 质量守恒 ================= */
  Sci.register({
    id: 'conservation',
    subject: 'chemistry',
    level: 5,
    emoji: '⚖️',
    title: '质量守恒',
    desc: '化学反应前后，总质量变了吗？',
    intro: '小苏打和醋反应会冒出好多气泡。反应之后，东西的总质量是变多、变少，还是不变？把锥形瓶放在天平上，先敞开瓶口做一次，再用气球把瓶口封住做一次，比一比天平的读数。',
    goal: '敞口和密封各做一次反应，比较天平读数',
    fact: '<p>化学反应只是原子重新组合，原子既不会凭空出现，也不会凭空消失，所以<b>反应前后物质的总质量不变</b>，这就是<b>质量守恒定律</b>。</p><p>敞开瓶口时，生成的二氧化碳气体跑到了空气里，天平称不到它，读数就变小了；用气球封住瓶口，气体跑不掉，读数就保持不变。</p><p>🔬 两百多年前，法国化学家拉瓦锡用天平做了很多精确的实验，证明了质量守恒，被称为“现代化学之父”。</p>',
    quiz: [
      { q: '在密封的瓶子里做化学反应，反应后总质量会？', options: ['不变', '变大', '变小'], answer: 0, explain: '密封时什么都跑不掉，总质量不变。' },
      { q: '敞口做实验时，天平读数为什么变小了？', options: ['生成的气体跑到空气里了', '物质凭空消失了'], answer: 0, explain: '气体逃走了，天平称不到它。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const START = 200.0, GAS = 2.2;
      let sealed = false, k = 0, running = false, t = 0;
      const done = new Set();
      const reading = () => (sealed ? START : START - GAS * k);

      function react() {
        if (running) return;
        if (k >= 1) { api.note('已经反应完了，点“重新装好”再做一次。'); return; }
        running = true;
        Sci.sfx('whoosh');
        api.note('把小苏打倒进醋里……冒出了好多气泡！');
      }
      function finish() {
        running = false;
        done.add(sealed ? 'sealed' : 'open');
        Sci.sfx('good');
        api.note(sealed ? `密封：反应前 ${START.toFixed(1)} 克，反应后还是 ${reading().toFixed(1)} 克！气体被气球兜住了，总质量不变。` : `敞口：反应前 ${START.toFixed(1)} 克，反应后变成了 ${reading().toFixed(1)} 克。少了的是跑到空气里的二氧化碳！`);
        if (done.size === 2) api.timeout(() => { api.note('🎉 结论：化学反应前后，物质的总质量不变——这就是质量守恒定律。'); api.goalDone(); }, 2200);
      }
      api.loop(dt => {
        t += dt;
        if (running) { k = Math.min(1, k + dt / 3); if (k >= 1) finish(); }
        ctx.fillStyle = '#f8f9ff';
        ctx.fillRect(0, 0, 800, 450);
        // 电子天平
        D.rrect(ctx, 200, 340, 300, 60, 12);
        ctx.fillStyle = '#495057';
        ctx.fill();
        D.rrect(ctx, 290, 352, 120, 36, 6);
        ctx.fillStyle = '#d3f9d8';
        ctx.fill();
        D.text(ctx, reading().toFixed(1) + ' g', 350, 371, { size: 22, color: '#2b8a3e' });
        ctx.fillStyle = '#adb5bd';
        ctx.fillRect(230, 330, 240, 10);
        // 锥形瓶
        const cx = 350;
        ctx.beginPath();
        ctx.moveTo(cx - 20, 170);
        ctx.lineTo(cx - 20, 230);
        ctx.lineTo(cx - 80, 330);
        ctx.lineTo(cx + 80, 330);
        ctx.lineTo(cx + 20, 230);
        ctx.lineTo(cx + 20, 170);
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        ctx.fill();
        ctx.strokeStyle = '#8fa3bf';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,240,200,.85)';
        ctx.beginPath();
        ctx.moveTo(cx - 52, 285);
        ctx.lineTo(cx - 80, 330);
        ctx.lineTo(cx + 80, 330);
        ctx.lineTo(cx + 52, 285);
        ctx.fill();
        if (running) for (let i = 0; i < 14; i++) D.circle(ctx, cx - 60 + (i * 37) % 120, 325 - ((t * 120 + i * 23) % 45), 3, 'rgba(255,255,255,.9)', '#ced4da', 1);
        // 气球或逃走的气体
        if (sealed) {
          const r = 14 + k * 46;
          ctx.fillStyle = '#ff8787';
          ctx.beginPath();
          ctx.ellipse(cx, 170 - r * 0.9, r * 0.85, r, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(cx - 22, 162, 44, 12);
        } else if (running || k > 0) {
          for (let i = 0; i < 6; i++) {
            const y = 160 - ((t * 60 + i * 30) % 140);
            D.text(ctx, 'CO₂', cx + Math.sin(t * 2 + i) * 40 + (160 - y) * 0.4, y, { size: 14, color: '#868e96', alpha: k > 0 && !running ? 0.3 : 0.8 });
          }
        }
        D.text(ctx, sealed ? '🎈 瓶口封上了气球' : '瓶口敞开', 130, 200, { size: 16, color: '#495057' });
        D.text(ctx, `反应前：${START.toFixed(1)} 克`, 640, 120, { size: 18 });
        D.text(ctx, `现在：${reading().toFixed(1)} 克`, 640, 160, { size: 22, color: '#2b8a3e' });
        D.text(ctx, `${done.has('open') ? '✅' : '⬜'} 敞口实验　${done.has('sealed') ? '✅' : '⬜'} 密封实验`, 640, 220, { size: 15 });
      });
      api.choice([[false, '🔓 敞开瓶口'], [true, '🎈 用气球封口']], sealed, v => { if (running) return; sealed = v; k = 0; });
      api.button('⚗️ 开始反应', react);
      api.button('🔄 重新装好', () => { if (!running) { k = 0; api.note('重新装好了，反应前是 200.0 克。'); } });
      api.note('👆 先选“敞开瓶口”，点“开始反应”，看看天平读数怎么变。');
    },
  });
})();
