/* 生命奥秘（第三组）：五种感官 → 昆虫的身体 → 骨骼和肌肉 → 呼吸 → 适者生存 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 11. 五种感官 ================= */
  const ORGANS5 = [['eye', '👀', '眼睛', '看'], ['ear', '👂', '耳朵', '听'], ['nose', '👃', '鼻子', '闻'], ['tongue', '👅', '舌头', '尝'], ['skin', '✋', '皮肤', '摸']];
  const STIMULI = [
    ['🌈', '彩虹', 'eye'], ['🌙', '月亮', 'eye'], ['🎵', '音乐', 'ear'], ['🔔', '铃声', 'ear'], ['🌸', '花香', 'nose'],
    ['☕', '咖啡香', 'nose'], ['🍋', '酸柠檬', 'tongue'], ['🍬', '甜糖果', 'tongue'], ['🧊', '冰凉凉', 'skin'], ['🐱', '毛茸茸', 'skin'],
  ];

  Sci.register({
    id: 'senses',
    subject: 'biology',
    level: 1,
    emoji: '👀',
    title: '五种感官',
    desc: '看、听、闻、尝、摸，我们怎样感知世界',
    intro: '我们用眼睛看，用耳朵听，用鼻子闻，用舌头尝，用皮肤摸，这就是五种感官。右边有好多东西，想一想：要用哪个感官才能感觉到它？把它拖到对应的器官上吧！',
    goal: '把 10 样东西都交给正确的感官',
    fact: '<p>我们有五种主要的感觉：<b>视觉</b>（眼睛）、<b>听觉</b>（耳朵）、<b>嗅觉</b>（鼻子）、<b>味觉</b>（舌头）和<b>触觉</b>（皮肤）。</p><p>感官把外面的信息变成信号，通过神经送到<b>大脑</b>，大脑才告诉我们“这是彩虹”“这是甜的”。</p><p>🛡️ 感官很宝贵：看书要保持距离，不要长时间戴耳机，不要把东西塞进鼻子和耳朵里。很多盲人朋友靠灵敏的听觉和触觉认识世界，盲道和盲文就是为他们准备的。</p>',
    quiz: [
      { q: '闻到饭菜的香味，用的是哪个器官？', options: ['鼻子', '耳朵', '眼睛'], answer: 0, explain: '鼻子负责嗅觉。' },
      { q: '感官收到的信息，最后送到哪里去处理？', options: ['大脑', '肚子', '手指'], answer: 0, explain: '大脑负责处理所有感觉信息。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const items = Sci.shuffle(STIMULI).map((s, i) => ({ e: s[0], name: s[1], to: s[2], hx: 470 + (i % 3) * 110, hy: 60 + Math.floor(i / 3) * 95, x: 0, y: 0, done: false }));
      items.forEach(it => { it.x = it.hx; it.y = it.hy; });
      const oy = i => 55 + i * 82;
      const count = {};
      let drag = null;

      api.pointer(st, {
        down(p) {
          const it = items.find(it => !it.done && Math.hypot(p.x - it.x, p.y - it.y) < 40);
          if (it) { drag = { it, ox: it.x - p.x, oy: it.y - p.y }; Sci.sfx('pop'); }
        },
        move(p) { if (drag) { drag.it.x = p.x + drag.ox; drag.it.y = p.y + drag.oy; } },
        up() {
          if (!drag) return;
          const it = drag.it;
          drag = null;
          const i = ORGANS5.findIndex((o, k) => Math.abs(it.y - oy(k)) < 40 && it.x < 400);
          if (i < 0) { it.x = it.hx; it.y = it.hy; return; }
          const o = ORGANS5[i];
          if (o[0] !== it.to) {
            Sci.sfx('bad');
            const right = ORGANS5.find(q => q[0] === it.to);
            api.note(`${it.e} ${it.name}不能用${o[2]}${o[3]}哦，要用${right[2]}来${right[3]}。`);
            it.x = it.hx;
            it.y = it.hy;
            return;
          }
          it.done = true;
          count[o[0]] = (count[o[0]] || 0) + 1;
          it.x = 210 + count[o[0]] * 58;
          it.y = oy(i);
          Sci.sfx('good');
          const left = items.filter(x => !x.done).length;
          api.note(`✅ 用${o[2]}${o[3]}${it.name}！` + (left ? `（还有 ${left} 样）` : ''));
          if (!left) api.timeout(() => { api.note('🎉 全部完成！五种感官一起帮我们认识这个世界。'); api.goalDone(); }, 1200);
        },
      });
      function render() {
        ctx.fillStyle = '#fff5f5';
        ctx.fillRect(0, 0, 800, 450);
        ORGANS5.forEach((o, i) => {
          D.rrect(ctx, 20, oy(i) - 36, 380, 72, 16);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.strokeStyle = '#ffc9c9';
          ctx.lineWidth = 2;
          ctx.stroke();
          D.emoji(ctx, o[1], 60, oy(i), 40);
          D.text(ctx, `${o[2]}·${o[3]}`, 140, oy(i), { size: 18 });
        });
        D.text(ctx, '👉 拖到左边的感官上', 600, 430, { size: 15, color: '#6f6a85' });
        items.forEach(it => {
          if (it === (drag && drag.it)) return;
          D.emoji(ctx, it.e, it.x, it.y - (it.done ? 0 : 8), it.done ? 34 : 44);
          if (!it.done) D.text(ctx, it.name, it.x, it.y + 28, { size: 14, color: '#495057' });
        });
        if (drag) D.emoji(ctx, drag.it.e, drag.it.x, drag.it.y, 50);
      }
      api.loop(render);
      api.note('👆 把右边的东西拖到能感觉到它的器官上。');
    },
  });

  /* ================= 12. 昆虫的身体 ================= */
  const BUGS = [['🐝', '蜜蜂', true], ['🕷️', '蜘蛛', false], ['🦋', '蝴蝶', true], ['🐌', '蜗牛', false], ['🐞', '瓢虫', true], ['🦂', '蝎子', false], ['🐜', '蚂蚁', true], ['🦀', '螃蟹', false]];

  Sci.register({
    id: 'insect',
    subject: 'biology',
    level: 2,
    emoji: '🐞',
    title: '昆虫的身体',
    desc: '6 条腿、3 节身体，蜘蛛是昆虫吗？',
    intro: '昆虫是地球上种类最多的动物。它们的身体有一个共同的秘密：分成头、胸、腹三部分，胸部长着 6 条腿。先来拼一只昆虫：把 6 条腿装到正确的地方；再判断一下，哪些小动物才是真正的昆虫！',
    goal: '拼好一只昆虫，再把 8 种小动物分对',
    fact: '<p><b>昆虫</b>的身体分为<b>头、胸、腹</b>三部分；头上有一对触角；胸部有<b>3 对足（6 条腿）</b>，大多数还有 2 对翅膀。</p><p>蜜蜂、蝴蝶、蚂蚁、瓢虫、蜻蜓、蝗虫都是昆虫。<b>蜘蛛不是昆虫</b>：它有 8 条腿，身体只分两部分，也没有触角和翅膀。</p><p>🌼 昆虫帮花朵传粉、分解落叶，是大自然里非常重要的小帮手。</p>',
    quiz: [
      { q: '昆虫有几条腿？', options: ['4 条', '6 条', '8 条'], answer: 1, explain: '昆虫有 3 对足，就是 6 条腿。' },
      { q: '蜘蛛是昆虫吗？', options: ['是', '不是'], answer: 1, explain: '蜘蛛有 8 条腿，身体只分两部分，不是昆虫。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let mode = 'build', drag = null, built = false;
      const SEG = [['head', '头', 200, 26], ['thorax', '胸', 260, 30], ['abdomen', '腹', 345, 48]];
      const CY = 210;
      const legs = [];
      for (let i = 0; i < 6; i++) legs.push({ x: 90 + i * 40, y: 400, hx: 90 + i * 40, hy: 400, on: null });
      const bugs = BUGS.map((b, i) => ({ e: b[0], name: b[1], ok: b[2], hx: 80 + i * 90, hy: 395, x: 80 + i * 90, y: 395, put: null }));

      const segAt = p => SEG.find(s => Math.hypot((p.x - s[2]) / (s[3] * 1.3), (p.y - CY) / (s[3] + 20)) < 1);
      api.pointer(st, {
        down(p) {
          const list = mode === 'build' ? legs : bugs;
          const it = list.find(it => (mode === 'build' ? it.on : it.put) === null && Math.hypot(p.x - it.x, p.y - it.y) < 30);
          if (it) drag = { it, ox: it.x - p.x, oy: it.y - p.y };
        },
        move(p) { if (drag) { drag.it.x = p.x + drag.ox; drag.it.y = p.y + drag.oy; } },
        up() {
          if (!drag) return;
          const it = drag.it;
          drag = null;
          if (mode === 'build') {
            const s = segAt(it);
            if (!s) { it.x = it.hx; it.y = it.hy; return; }
            if (s[0] !== 'thorax') {
              Sci.sfx('bad');
              api.note(`昆虫的腿不长在${s[1]}上哦，再找找应该装在哪一节。`);
              it.x = it.hx;
              it.y = it.hy;
              return;
            }
            const k = legs.filter(l => l.on !== null).length;
            it.on = k;
            Sci.sfx('pop');
            api.note(`装好了 ${k + 1} 条腿。`);
            if (k + 1 === 6) {
              built = true;
              Sci.sfx('star');
              api.note('🎉 一只昆虫拼好啦：头、胸、腹三部分，胸部 6 条腿！再去“谁是昆虫”分一分。');
              check();
            }
          } else {
            if (it.y > 320) { it.x = it.hx; it.y = it.hy; return; }
            const yes = it.x < 400;
            if (yes !== it.ok) {
              Sci.sfx('bad');
              api.note(it.ok ? `${it.e} ${it.name}是昆虫哦：身体三部分、6 条腿。` : `${it.e} ${it.name}不是昆虫。${it.name === '蜘蛛' ? '蜘蛛有 8 条腿！' : '数一数它的腿和身体。'}`);
              it.x = it.hx;
              it.y = it.hy;
              return;
            }
            const k = bugs.filter(b => b.put === yes).length;
            it.put = yes;
            it.x = (yes ? 70 : 470) + (k % 4) * 80;
            it.y = 160 + Math.floor(k / 4) * 80;
            Sci.sfx('good');
            api.note(`✅ ${it.name}${it.ok ? '是' : '不是'}昆虫。`);
            check();
          }
        },
      });
      function check() {
        if (built && bugs.every(b => b.put !== null)) api.goalDone();
      }
      function renderBuild() {
        ctx.fillStyle = '#f4fce3';
        ctx.fillRect(0, 0, 800, 450);
        // 触角和翅膀
        ctx.strokeStyle = '#495057';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(190, 190);
        ctx.quadraticCurveTo(160, 130, 140, 120);
        ctx.moveTo(196, 188);
        ctx.quadraticCurveTo(190, 125, 175, 105);
        ctx.stroke();
        ctx.fillStyle = 'rgba(165,216,255,.6)';
        ctx.beginPath();
        ctx.ellipse(300, 150, 80, 30, -0.4, 0, Math.PI * 2);
        ctx.fill();
        // 三节身体
        SEG.forEach(([, n, x, r], i) => {
          ctx.beginPath();
          ctx.ellipse(x, CY, r * 1.3, r + 6, 0, 0, Math.PI * 2);
          ctx.fillStyle = ['#e8590c', '#f08c00', '#f59f00'][i];
          ctx.fill();
          D.text(ctx, n, x, CY + 1, { size: 18, color: '#fff' });
        });
        D.circle(ctx, 186, 200, 5, '#212529');
        // 腿
        legs.forEach(l => {
          ctx.strokeStyle = '#495057';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          if (l.on !== null) {
            const side = l.on % 2 ? 1 : -1, k = Math.floor(l.on / 2);
            const x0 = 240 + k * 20, y0 = CY + side * 24;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 - 20 + k * 20, y0 + side * 40);
            ctx.lineTo(x0 - 40 + k * 30, y0 + side * 70);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(l.x - 14, l.y - 16);
            ctx.lineTo(l.x, l.y);
            ctx.lineTo(l.x + 10, l.y + 18);
            ctx.stroke();
          }
        });
        D.text(ctx, '👇 把 6 条腿拖到身体上正确的那一节', 250, 350, { size: 16, color: '#495057' });
        D.text(ctx, `装好的腿：${legs.filter(l => l.on !== null).length} / 6`, 620, 60, { size: 18 });
        D.text(ctx, '头 · 胸 · 腹', 620, 100, { size: 16, color: '#6f6a85' });
      }
      function renderSort() {
        ctx.fillStyle = '#f4fce3';
        ctx.fillRect(0, 0, 800, 450);
        D.rrect(ctx, 30, 70, 360, 230, 18);
        ctx.fillStyle = '#d3f9d8';
        ctx.fill();
        D.rrect(ctx, 410, 70, 360, 230, 18);
        ctx.fillStyle = '#ffe3e3';
        ctx.fill();
        D.text(ctx, '✅ 是昆虫', 210, 100, { size: 20, color: '#2b8a3e' });
        D.text(ctx, '❌ 不是昆虫', 590, 100, { size: 20, color: '#c92a2a' });
        bugs.forEach(b => {
          D.emoji(ctx, b.e, b.x, b.y, 48);
          D.text(ctx, b.name, b.x, b.y + 34, { size: 13, color: '#495057' });
        });
        D.text(ctx, '👇 把小动物拖到上面的盒子里', 400, 350, { size: 15, color: '#495057' });
      }
      api.loop(() => (mode === 'build' ? renderBuild() : renderSort()));
      api.choice([['build', '🔧 拼一只昆虫'], ['sort', '🔍 谁是昆虫']], mode, v => {
        mode = v;
        api.note(v === 'build' ? '把腿装到正确的那一节身体上。' : '把是昆虫的拖到左边，不是的拖到右边。');
      });
      api.note('👆 昆虫的腿长在哪一节？把腿一条一条拖上去。');
    },
  });

  /* ================= 13. 骨骼和肌肉 ================= */
  Sci.register({
    id: 'bones',
    subject: 'biology',
    level: 3,
    emoji: '💪',
    title: '骨骼和肌肉',
    desc: '手臂是怎么弯起来、伸直的？',
    intro: '举起手臂、弯弯胳膊，你能摸到上臂的肌肉一下子鼓起来。骨头自己不会动，是肌肉拉着骨头运动的！试着收缩前面的“肱二头肌”和后面的“肱三头肌”，看看手臂怎么动，再找到连接骨头的关节。',
    goal: '把哑铃举起来、放下去，再找到肘关节',
    fact: '<p>人体大约有 <b>206 块骨头</b>，它们组成了骨骼，撑起身体、保护内脏。骨头和骨头连接的地方叫<b>关节</b>，比如肘关节、膝关节。</p><p>肌肉只会“拉”，不会“推”，所以总是<b>成对</b>工作：<b>肱二头肌</b>收缩，把前臂拉起来，手臂弯曲；<b>肱三头肌</b>收缩，把前臂拉下去，手臂伸直。</p><p>🥛 多喝牛奶、多晒太阳、坚持运动，骨头和肌肉都会更强壮。背书包要两边背，坐姿要端正，保护好脊柱。</p>',
    quiz: [
      { q: '弯曲手臂时，哪块肌肉在收缩？', options: ['肱二头肌', '肱三头肌'], answer: 0, explain: '肱二头肌收缩，把前臂拉起来。' },
      { q: '骨头和骨头连接、能活动的地方叫什么？', options: ['关节', '肌肉', '皮肤'], answer: 0, explain: '比如肘关节、膝关节。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const SH = [250, 120], EL = [250, 290];
      let ang = 0, target = 0, flexed = false, extended = false, joint = false, t = 0;

      function check() {
        if (flexed && extended && joint) api.goalDone();
      }
      api.pointer(st, {
        down(p) {
          if (Math.hypot(p.x - EL[0], p.y - EL[1]) < 26) {
            joint = true;
            Sci.sfx('good');
            api.note('✅ 这是肘关节！上臂骨和前臂骨在这里连接，像门的合页一样只能朝一个方向弯。');
            check();
          } else if (Math.hypot(p.x - SH[0], p.y - SH[1]) < 26) api.note('这是肩关节，像一个球插在碗里，手臂可以转一大圈。再找找手肘那里的关节。');
        },
      });
      function render() {
        ctx.fillStyle = '#fff4e6';
        ctx.fillRect(0, 0, 800, 450);
        const a = ang * Math.PI / 180;
        const hand = [EL[0] + Math.sin(a) * 170, EL[1] + Math.cos(a) * 170];
        // 手臂的轮廓（皮肤）
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255,216,168,.55)';
        ctx.lineWidth = 86;
        ctx.beginPath();
        ctx.moveTo(SH[0], SH[1]);
        ctx.lineTo(EL[0], EL[1]);
        ctx.stroke();
        ctx.lineWidth = 60;
        ctx.beginPath();
        ctx.moveTo(EL[0], EL[1]);
        ctx.lineTo(hand[0], hand[1]);
        ctx.stroke();
        // 上臂骨和前臂骨（两根）：先画灰色的边，再画白色的骨头
        [['#868e96', 25, 15], ['#fff', 19, 9]].forEach(([c, w1, w2]) => {
          ctx.strokeStyle = c;
          ctx.lineWidth = w1;
          ctx.beginPath();
          ctx.moveTo(SH[0], SH[1]);
          ctx.lineTo(EL[0], EL[1]);
          ctx.stroke();
          ctx.lineWidth = w2;
          [-7, 7].forEach(d => {
            ctx.beginPath();
            ctx.moveTo(EL[0] + Math.cos(a) * d, EL[1] - Math.sin(a) * d);
            ctx.lineTo(hand[0] + Math.cos(a) * d, hand[1] - Math.sin(a) * d);
            ctx.stroke();
          });
        });
        ctx.strokeStyle = '#ced4da';
        ctx.lineWidth = 2;
        D.circle(ctx, SH[0], SH[1], 18, '#f1f3f5', '#adb5bd', 2);
        D.circle(ctx, EL[0], EL[1], 14, '#f1f3f5', joint ? '#2f9e44' : '#adb5bd', joint ? 4 : 2);
        // 肱二头肌（前面）：一头连肩，一头连前臂
        const bInsert = [EL[0] + Math.sin(a) * 40 + 12 * Math.cos(a), EL[1] + Math.cos(a) * 40 - 12 * Math.sin(a)];
        const bulge = 18 + (ang / 140) * 22;
        ctx.fillStyle = '#fa5252';
        ctx.beginPath();
        ctx.moveTo(SH[0] + 14, SH[1] + 10);
        ctx.quadraticCurveTo((SH[0] + bInsert[0]) / 2 + bulge + 10, (SH[1] + bInsert[1]) / 2, bInsert[0], bInsert[1]);
        ctx.quadraticCurveTo((SH[0] + bInsert[0]) / 2 + 10, (SH[1] + bInsert[1]) / 2, SH[0] + 14, SH[1] + 10);
        ctx.fill();
        // 肱三头肌（后面）
        const tBulge = 18 + (1 - ang / 140) * 16;
        ctx.fillStyle = '#e8590c';
        ctx.beginPath();
        ctx.moveTo(SH[0] - 14, SH[1] + 10);
        ctx.quadraticCurveTo(SH[0] - 14 - tBulge, (SH[1] + EL[1]) / 2, EL[0] - 14, EL[1] + 4);
        ctx.quadraticCurveTo(SH[0] - 8, (SH[1] + EL[1]) / 2, SH[0] - 14, SH[1] + 10);
        ctx.fill();
        D.text(ctx, '肱二头肌', SH[0] + 90, (SH[1] + EL[1]) / 2 - 10, { size: 15, color: '#c92a2a' });
        D.text(ctx, '肱三头肌', SH[0] - 95, (SH[1] + EL[1]) / 2, { size: 15, color: '#d9480f' });
        D.emoji(ctx, '🏋️', hand[0], hand[1], 40);
        D.text(ctx, `手臂弯曲 ${Math.round(ang)}°`, 600, 80, { size: 22, color: '#2b2840' });
        D.text(ctx, `${flexed ? '✅' : '⬜'} 举起哑铃　${extended ? '✅' : '⬜'} 放下哑铃　${joint ? '✅' : '⬜'} 找到肘关节`, 600, 130, { size: 14, maxW: 360 });
        D.text(ctx, '👆 也可以点一点手臂上的关节', 600, 400, { size: 14, color: '#6f6a85', weight: 'normal' });
      }
      api.loop(dt => {
        t += dt;
        const was = ang;
        ang += (target - ang) * Math.min(1, dt * 5);
        if (target === 140 && was < 135 && ang >= 135 && !flexed) { flexed = true; Sci.sfx('good'); api.note('✅ 肱二头肌收缩，鼓了起来，把前臂和哑铃拉上来了！'); check(); }
        if (target === 0 && was > 5 && ang <= 5 && flexed && !extended) { extended = true; Sci.sfx('good'); api.note('✅ 肱三头肌收缩，把前臂拉下去，手臂伸直了。肌肉总是成对工作的！'); check(); }
        render();
      });
      api.button('💪 收缩肱二头肌', () => { target = 140; api.note('肱二头肌收缩了……'); });
      api.button('↘️ 收缩肱三头肌', () => { target = 0; api.note('肱三头肌收缩了……'); });
      api.note('👆 点“收缩肱二头肌”，把哑铃举起来。');
    },
  });

  /* ================= 14. 呼吸的秘密 ================= */
  Sci.register({
    id: 'breathing',
    subject: 'biology',
    level: 4,
    emoji: '🌬️',
    title: '呼吸的秘密',
    desc: '肺是怎样把空气吸进来、呼出去的？',
    intro: '我们每天要呼吸两万多次！可是肺自己没有肌肉，它是怎么吸气的呢？这个瓶子模型里，两个气球代表肺，下面的橡皮膜代表“膈肌”。往下拉橡皮膜，再推回去，看看气球会怎样，再观察氧气和二氧化碳的进出。',
    goal: '完成 5 次呼吸，再在“跑完步”时快速呼吸 5 次',
    fact: '<p>吸气时，胸腔底部的<b>膈肌</b>收缩向下，胸腔变大，空气被“吸”进肺里；呼气时，膈肌放松向上，胸腔变小，空气被挤出去。</p><p>肺里有几亿个像小葡萄一样的<b>肺泡</b>，在这里，空气中的<b>氧气</b>进入血液，血液里的<b>二氧化碳</b>排出来。</p><p>🏃 运动时身体需要更多氧气，所以呼吸会变快、变深。经常锻炼，肺活量会变大。远离二手烟，保护我们的肺！</p>',
    quiz: [
      { q: '吸气时，膈肌往哪边动？', options: ['向下', '向上'], answer: 0, explain: '膈肌向下，胸腔变大，空气进来。' },
      { q: '我们呼出的气体里，比吸进去时多了什么？', options: ['二氧化碳', '氧气'], answer: 0, explain: '身体用掉氧气，排出二氧化碳。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const CX = 270, TOP0 = 90;
      let pull = 0, drag = false, breaths = 0, fast = [], run = false, inhaled = false, okRest = false, okRun = false, t = 0;
      const parts = [];

      api.pointer(st, {
        down(p) { if (Math.abs(p.x - CX) < 140 && p.y > 300) drag = true; },
        move(p, active) { if (active && drag) pull = clamp((p.y - 330) / 70, 0, 1); },
        up() { drag = false; },
      });
      function breathe() {
        breaths++;
        Sci.sfx('whoosh');
        for (let i = 0; i < 2; i++) parts.push({ k: 0, o2: false, x: CX + rand(-30, 30) });
        if (run) {
          fast.push(t);
          fast = fast.filter(x => t - x < 8);
          api.note(`跑完步，呼吸要快！8 秒内呼吸了 ${fast.length} 次。`);
          if (fast.length >= 5 && !okRun) { okRun = true; Sci.sfx('star'); api.note('✅ 运动后身体需要更多氧气，所以呼吸变快了！'); }
        } else {
          api.note(`完成 ${breaths} 次呼吸。`);
          if (breaths >= 5 && !okRest) { okRest = true; Sci.sfx('good'); api.note('✅ 完成 5 次呼吸！现在打开“跑完步”，再快速呼吸 5 次。'); }
        }
        if (okRest && okRun) api.goalDone();
      }
      api.loop(dt => {
        t += dt;
        if (pull > 0.8 && !inhaled) { inhaled = true; for (let i = 0; i < 2; i++) parts.push({ k: 0, o2: true, x: CX + rand(-30, 30) }); }
        if (pull < 0.2 && inhaled) { inhaled = false; breathe(); }
        parts.forEach(p => { p.k += dt * 0.8; });
        for (let i = parts.length - 1; i >= 0; i--) if (parts[i].k >= 1) parts.splice(i, 1);
        // 画瓶子模型
        ctx.fillStyle = run ? '#fff0f6' : '#f8f9ff';
        ctx.fillRect(0, 0, 800, 450);
        D.rrect(ctx, CX - 130, TOP0 + 40, 260, 230, 30);
        ctx.fillStyle = 'rgba(220,235,255,.6)';
        ctx.fill();
        ctx.strokeStyle = '#8fa3bf';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fillStyle = '#adb5bd';
        ctx.fillRect(CX - 8, TOP0 - 30, 16, 100);
        ctx.fillRect(CX - 70, TOP0 + 70, 140, 10);
        // 两个肺（气球）
        const s = 0.55 + pull * 0.45;
        [-1, 1].forEach(side => {
          ctx.beginPath();
          ctx.ellipse(CX + side * 62, TOP0 + 150, 50 * s, 70 * s, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#ff8fa3';
          ctx.fill();
          ctx.strokeStyle = '#e64980';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.strokeStyle = '#adb5bd';
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(CX, TOP0 + 75);
          ctx.lineTo(CX + side * 62, TOP0 + 150 - 70 * s);
          ctx.stroke();
        });
        // 膈肌（橡皮膜）
        const my = 330 + pull * 70;
        ctx.fillStyle = '#ffa94d';
        ctx.beginPath();
        ctx.moveTo(CX - 130, 320);
        ctx.quadraticCurveTo(CX, my + 30, CX + 130, 320);
        ctx.lineTo(CX + 130, 326);
        ctx.quadraticCurveTo(CX, my + 36, CX - 130, 326);
        ctx.fill();
        D.circle(ctx, CX, my + 30, 12, '#e8590c');
        D.text(ctx, '膈肌（拉我）', CX + 120, my + 34, { size: 14, color: '#d9480f', align: 'left' });
        // 气体
        parts.forEach(p => {
          const y = p.o2 ? lerp(TOP0 - 40, TOP0 + 130, p.k) : lerp(TOP0 + 130, TOP0 - 40, p.k);
          D.circle(ctx, p.x, y, 7, p.o2 ? '#4dabf7' : '#868e96');
          D.text(ctx, p.o2 ? 'O₂' : 'CO₂', p.x + 18, y, { size: 11, color: p.o2 ? '#1c7ed6' : '#495057', align: 'left' });
        });
        D.text(ctx, pull > 0.5 ? '吸气中 ⬇' : '呼气 ⬆', 600, 80, { size: 26, color: '#c2255c' });
        D.text(ctx, '膈肌向下 → 胸腔变大 → 吸气', 600, 130, { size: 15, color: '#495057' });
        D.text(ctx, '膈肌向上 → 胸腔变小 → 呼气', 600, 158, { size: 15, color: '#495057' });
        D.text(ctx, '🔵 氧气进来　⚫ 二氧化碳出去', 600, 200, { size: 14, color: '#495057', weight: 'normal' });
        D.text(ctx, `${okRest ? '✅' : '⬜'} 呼吸 5 次　${okRun ? '✅' : '⬜'} 跑完步快呼吸`, 600, 250, { size: 15 });
        if (run) D.emoji(ctx, '🏃', 600, 330, 60);
      });
      api.toggle('🏃 跑完步', false, v => { run = v; fast = []; api.note(v ? '刚跑完步，身体急需氧气！在 8 秒内快速呼吸 5 次。' : '安静下来了。'); });
      api.note('👆 按住下面橙色的橡皮膜往下拉，再松回去，就是一次呼吸。');
    },
  });

  /* ================= 15. 适者生存 ================= */
  Sci.register({
    id: 'evolution',
    subject: 'biology',
    level: 5,
    emoji: '🦋',
    title: '适者生存',
    desc: '桦尺蛾的故事：颜色为什么会改变？',
    intro: '英国有一种飞蛾叫“桦尺蛾”，有浅色的也有深色的。工厂多了以后，树干被煤烟熏黑了，奇怪的事情发生了……现在你来扮演饥饿的小鸟：在 6 秒钟内，点击你看到的飞蛾把它吃掉。活下来的飞蛾会生出下一代，看看几代以后，飞蛾的颜色有什么变化！',
    goal: '在黑色树干上进行 3 代，让深色飞蛾占到七成以上',
    fact: '<p>同一种生物里，个体之间会有一些<b>差异</b>（比如颜色深浅），这些特点能遗传给后代。</p><p>在被熏黑的树干上，浅色飞蛾特别显眼，更容易被鸟吃掉；深色飞蛾不容易被发现，活下来生了更多后代。一代一代下来，深色飞蛾越来越多，这就是<b>自然选择</b>——<b>适者生存</b>。</p><p>📖 达尔文提出了自然选择的学说，解释了生物怎样慢慢变化（进化）。后来工厂减少了污染，树干变干净，浅色飞蛾又多了起来！</p>',
    quiz: [
      { q: '在被熏黑的树干上，哪种飞蛾更容易活下来？', options: ['浅色的', '深色的'], answer: 1, explain: '深色飞蛾和黑树干颜色接近，不容易被鸟发现。' },
      { q: '“适者生存”的意思是？', options: ['适应环境的个体更容易活下来、留下后代', '最大的动物才能活下来'], answer: 0, explain: '适应环境的特点会一代代保留下来。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const N = 24;
      let bark = 'dark', moths = [], gen = 1, timer = 0, hunting = false, history = [], done = false;
      const darkRatio = () => moths.filter(m => m.dark).length / Math.max(1, moths.length);

      function spawn(darkShare) {
        moths = [];
        for (let i = 0; i < N; i++) moths.push({ x: rand(40, 530), y: rand(40, 410), a: rand(0, 6.28), dark: Math.random() < darkShare, alive: true });
      }
      function reset() {
        gen = 1;
        history = [];
        spawn(0.1);
        history.push(darkRatio());
        api.note('第 1 代：大部分飞蛾是浅色的。点“开始捕食”，然后点你看到的飞蛾！');
      }
      function startHunt() {
        if (hunting) return;
        hunting = true;
        timer = 6;
        Sci.sfx('whoosh');
      }
      function nextGen() {
        hunting = false;
        const alive = moths.filter(m => m.alive);
        const share = alive.length ? alive.filter(m => m.dark).length / alive.length : 0.5;
        gen++;
        // 活下来的飞蛾生出下一代；偶尔会出现颜色不同的“变异”
        spawn(clamp(share * 0.94 + 0.03, 0.02, 0.98));
        history.push(darkRatio());
        api.note(`第 ${gen} 代出生了：深色飞蛾占 ${Math.round(darkRatio() * 100)}%。` + (gen < 4 ? '继续捕食吧！' : ''));
        if (bark === 'dark' && gen >= 4 && darkRatio() >= 0.7 && !done) {
          done = true;
          Sci.sfx('star');
          api.note(`🎉 经过 3 代，深色飞蛾占了 ${Math.round(darkRatio() * 100)}%！在黑树干上，深色是最好的保护色——适者生存。`);
          api.goalDone();
        }
      }
      api.pointer(st, {
        down(p) {
          if (!hunting) return;
          const m = moths.find(m => m.alive && Math.hypot(p.x - m.x, p.y - m.y) < 22);
          if (m) { m.alive = false; Sci.sfx('pop'); }
        },
      });
      function moth(m) {
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.a);
        ctx.fillStyle = m.dark ? '#3b3a36' : '#ece4d4';
        ctx.beginPath();
        ctx.ellipse(-9, 0, 11, 7, 0.4, 0, Math.PI * 2);
        ctx.ellipse(9, 0, 11, 7, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = m.dark ? '#26251f' : '#cfc4ae';
        ctx.fillRect(-2, -8, 4, 16);
        ctx.restore();
      }
      function render() {
        // 树干
        ctx.fillStyle = bark === 'dark' ? '#3e3d38' : '#e2dccd';
        ctx.fillRect(0, 0, 570, 450);
        ctx.strokeStyle = bark === 'dark' ? '#2f2e2a' : '#c9c1ad';
        ctx.lineWidth = 3;
        for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.moveTo((i * 37) % 570, 0); ctx.bezierCurveTo((i * 53) % 570, 150, (i * 29) % 570, 300, (i * 41) % 570, 450); ctx.stroke(); }
        moths.filter(m => m.alive).forEach(moth);
        if (hunting) D.text(ctx, `🐦 ${timer.toFixed(1)} 秒`, 285, 30, { size: 24, color: '#ffd43b', stroke: 'rgba(0,0,0,.5)', strokeWidth: 4 });
        // 右边的图表
        ctx.fillStyle = '#fff';
        ctx.fillRect(570, 0, 230, 450);
        D.text(ctx, `第 ${gen} 代`, 685, 30, { size: 20 });
        D.text(ctx, '深色飞蛾的比例', 685, 60, { size: 14, color: '#6f6a85' });
        history.forEach((r, i) => {
          const x = 600 + i * 34, h = r * 250;
          ctx.fillStyle = '#495057';
          ctx.fillRect(x, 340 - h, 24, h);
          ctx.fillStyle = '#e9ecef';
          ctx.fillRect(x, 90, 24, 250 - h);
          D.text(ctx, Math.round(r * 100) + '%', x + 12, 355, { size: 11, weight: 'normal' });
          D.text(ctx, String(i + 1), x + 12, 372, { size: 11, color: '#6f6a85', weight: 'normal' });
        });
        D.text(ctx, '代 →', 760, 372, { size: 11, color: '#6f6a85', weight: 'normal' });
        D.text(ctx, bark === 'dark' ? '树干：被煤烟熏黑' : '树干：干干净净', 685, 410, { size: 14, color: '#2b2840' });
      }
      api.loop(dt => {
        if (hunting) {
          timer -= dt;
          if (timer <= 0) nextGen();
        }
        render();
      });
      api.button('🐦 开始捕食（6 秒）', startHunt);
      // 小朋友点不过来时，可以让小鸟自己吃：显眼的飞蛾更容易被吃掉
      api.button('⏩ 小鸟自己吃一代', () => {
        if (hunting) return;
        moths.forEach(m => { if (Math.random() < (m.dark !== (bark === 'dark') ? 0.75 : 0.1)) m.alive = false; });
        Sci.sfx('whoosh');
        hunting = true;
        timer = 0.8;
      });
      api.choice([['dark', '🏭 黑色树干'], ['light', '🌳 浅色树干']], bark, v => { if (hunting) return; bark = v; reset(); });
      api.button('🔄 从头开始', () => { if (!hunting) reset(); });
      reset();
    },
  });
})();
