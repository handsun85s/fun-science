/* 环境与健康（第二组）：七步洗手法 → 节约用水 → 健康的一天 → 水的净化 → 生态平衡 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;
  // 画一个小细菌（绿色的小球带一圈小刺），老平板也能显示
  const germ = (ctx, x, y, r, a) => {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = '#2b8a3e';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r); ctx.lineTo(x + Math.cos(ang) * r * 1.5, y + Math.sin(ang) * r * 1.5); ctx.stroke(); }
    D.circle(ctx, x, y, r, '#69db7c', '#2b8a3e', 2);
    D.circle(ctx, x - r * 0.3, y - r * 0.2, r * 0.18, '#2b8a3e');
    D.circle(ctx, x + r * 0.3, y - r * 0.2, r * 0.18, '#2b8a3e');
    ctx.restore();
  };

  /* ================= 6. 七步洗手法 ================= */
  const WASH = [['内', '掌心对掌心，相互揉搓'], ['外', '手心对手背，交叉揉搓'], ['夹', '掌心相对，十指交叉揉搓'], ['弓', '弯曲手指，在另一只手心里转动揉搓'], ['大', '握住大拇指，转动揉搓'], ['立', '指尖立在另一只手心里揉搓'], ['腕', '握住手腕，转动揉搓']];

  Sci.register({
    id: 'handwash',
    subject: 'health',
    level: 1,
    emoji: '🧼',
    title: '七步洗手法',
    desc: '内、外、夹、弓、大、立、腕',
    intro: '我们的小手每天摸来摸去，沾上了很多看不见的细菌。洗手要用正确的方法才能洗干净！记住口诀“内、外、夹、弓、大、立、腕”，按照顺序点下面的步骤卡片，看看小手上的细菌一点点消失吧！',
    goal: '按正确的顺序完成七步洗手',
    fact: '<p><b>七步洗手法</b>口诀：<b>内、外、夹、弓、大、立、腕</b>。每一步都要揉搓几下，整个过程至少 <b>20 秒</b>，最后用流动的清水冲干净。</p><p>饭前便后、外出回家、摸过动物、咳嗽打喷嚏以后，都要洗手。勤洗手能挡住很多病菌，减少感冒和拉肚子。</p><p>🎵 洗手时唱两遍“祝你生日快乐”，差不多就是 20 秒啦！</p>',
    quiz: [
      { q: '七步洗手法的口诀是？', options: ['内外夹弓大立腕', '上下左右前后'], answer: 0, explain: '内、外、夹、弓、大、立、腕。' },
      { q: '每次洗手至少要搓多久？', options: ['2 秒', '20 秒', '20 分钟'], answer: 1, explain: '至少揉搓 20 秒才能洗干净。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const order = Sci.shuffle(WASH.map((w, i) => i));
      let step = 0, rub = 0, germs = [], t = 0;
      for (let i = 0; i < 28; i++) germs.push({ x: rand(200, 400), y: rand(110, 300), zone: Math.floor(Math.random() * 7), a: 1 });
      api.pointer(st, {
        down(p) {
          if (step >= 7 || p.y < 340) return;
          const k = Math.floor((p.x - 15) / 110);
          if (k < 0 || k > 6) return;
          const i = order[k];
          if (i < step) return;
          if (i !== step) { Sci.sfx('bad'); api.note(`还不到“${WASH[i][0]}”哦。口诀是：内、外、夹、弓、大、立、腕。`); return; }
          step++;
          rub = 1.2;
          Sci.sfx('splash');
          api.note(`${step}. ${WASH[i][0]}：${WASH[i][1]}。`);
          if (step === 7) api.timeout(() => { Sci.sfx('star'); api.note('🎉 七步洗手完成！细菌都被洗掉了，最后用清水冲干净、擦干小手。'); api.goalDone(); }, 1400);
        },
      });
      api.loop(dt => {
        t += dt;
        rub = Math.max(0, rub - dt);
        germs.forEach(g => { if (g.zone < step) g.a = Math.max(0, g.a - dt * 1.5); });
        ctx.fillStyle = '#e7f5ff';
        ctx.fillRect(0, 0, 800, 450);
        // 水龙头和水
        ctx.fillStyle = '#adb5bd';
        ctx.fillRect(270, 20, 100, 24);
        ctx.fillRect(330, 20, 20, 50);
        if (rub > 0 || step > 0) { ctx.fillStyle = 'rgba(116,192,252,.6)'; ctx.fillRect(334, 70, 12, 40); }
        // 两只手
        const sx = rub > 0 ? Math.sin(t * 25) * 8 : 0;
        // 两只手：手掌 + 四根手指 + 大拇指
        const hand = (cx, cy, side) => {
          ctx.fillStyle = '#ffd8a8';
          ctx.strokeStyle = '#e8a87c';
          ctx.lineWidth = 2;
          for (let f = 0; f < 4; f++) { D.rrect(ctx, cx - 42 + f * 22, cy - 120 + Math.abs(f - 1.5) * 10, 18, 70, 9); ctx.fill(); ctx.stroke(); }
          ctx.save();
          ctx.translate(cx + side * 48, cy - 10);
          ctx.rotate(side * 0.7);
          D.rrect(ctx, -10, -40, 20, 52, 10);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
          ctx.beginPath();
          ctx.ellipse(cx, cy, 52, 62, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        };
        hand(240 + sx, 240, -1);
        hand(370 - sx, 240, 1);
        germs.forEach(g => { if (g.a > 0) germ(ctx, g.x + Math.sin(t * 3 + g.x) * 2, g.y, 7, g.a); });
        if (rub > 0) for (let i = 0; i < 6; i++) D.circle(ctx, 250 + Math.random() * 120, 150 + Math.random() * 120, 8 + Math.random() * 8, 'rgba(255,255,255,.8)', '#a5d8ff', 1);
        D.text(ctx, '口诀：内 外 夹 弓 大 立 腕', 620, 60, { size: 20, color: '#1864ab' });
        WASH.forEach((w, i) => D.text(ctx, w[0], 520 + i * 34, 110, { size: 22, color: i < step ? '#2b8a3e' : '#ced4da' }));
        D.text(ctx, `细菌还剩 ${germs.filter(g => g.a > 0.05).length} 个`, 620, 170, { size: 17, color: '#c92a2a' });
        // 步骤卡片
        order.forEach((i, k) => {
          if (i < step) return;
          const x = 70 + k * 110;
          D.rrect(ctx, x - 50, 350, 100, 85, 14);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.strokeStyle = '#74c0fc';
          ctx.lineWidth = 3;
          ctx.stroke();
          D.text(ctx, w0(i), x, 380, { size: 26, color: '#1c7ed6' });
          D.text(ctx, WASH[i][1].slice(0, 6), x, 414, { size: 11, color: '#495057', weight: 'normal' });
        });
      });
      const w0 = i => WASH[i][0];
      api.note('👆 按照“内外夹弓大立腕”的顺序，点下面的卡片。');
    },
  });

  /* ================= 7. 节约用水 ================= */
  const TAPS = [
    ['brush', '😁', '刷牙时水龙头一直开着', 30, 3, '用杯子接水刷牙，每次省下二十多升水。'],
    ['shower', '🚿', '洗澡洗了 20 分钟', 200, 80, '洗澡缩短到 8 分钟，打肥皂时关水。'],
    ['drip', '💧', '水龙头一直在滴水', 50, 0, '修好滴水的龙头，一天能省几十升水。'],
    ['veg', '🥕', '洗菜水直接倒掉', 20, 0, '洗菜水留下来浇花、冲厕所。'],
    ['toilet', '🚽', '冲厕所总用大水', 60, 30, '小便时用小档冲水。'],
  ];

  Sci.register({
    id: 'savewater',
    subject: 'health',
    level: 2,
    emoji: '🚰',
    title: '节约用水',
    desc: '找出家里浪费水的地方',
    intro: '地球上的水虽然多，可是能直接喝的淡水只有很少一点点！这个家每天用掉 360 升水，其中有不少是白白浪费掉的。找一找家里浪费水的地方，点一下改正它，让每天的用水量减少到 200 升以下吧！',
    goal: '把每天的用水量减少到 200 升以下',
    fact: '<p>地球表面大部分被水覆盖，可是其中约 97% 是又咸又苦的海水，能直接利用的淡水还不到 1%！我国人均水资源量也比较少，很多地方缺水。</p><p>节水小妙招：刷牙用杯子接水；洗澡时间短一点；修好滴水的龙头；<b>一水多用</b>，洗菜水浇花、洗衣水拖地；冲厕所分大小档。</p><p>💧 一个滴水的龙头，一个月能浪费好几吨水。节约每一滴水，从身边做起！</p>',
    quiz: [
      { q: '刷牙时怎样做最节水？', options: ['用杯子接水刷牙', '水龙头一直开着'], answer: 0, explain: '用杯子接水，能省下很多水。' },
      { q: '洗菜的水可以怎么再利用？', options: ['用来浇花或冲厕所', '只能倒掉'], answer: 0, explain: '一水多用，节约用水。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const fixed = new Set();
      const used = () => 0 + TAPS.reduce((s, tp) => s + (fixed.has(tp[0]) ? tp[4] : tp[3]), 0);
      const POS = [[130, 140], [380, 130], [630, 140], [200, 320], [520, 320]];
      let done = false, t = 0;
      api.pointer(st, {
        down(p) {
          const i = POS.findIndex(([x, y]) => Math.hypot(p.x - x, p.y - y) < 60);
          if (i < 0) return;
          const tp = TAPS[i];
          if (fixed.has(tp[0])) return;
          fixed.add(tp[0]);
          Sci.sfx('good');
          api.note(`✅ ${tp[5]} 现在每天用水 ${used()} 升。`);
          if (used() < 200 && !done) { done = true; Sci.sfx('star'); api.note(`🎉 每天用水从 360 升减少到了 ${used()} 升！`); api.goalDone(); }
        },
      });
      api.loop(dt => {
        t += dt;
        ctx.fillStyle = '#f1f8ff';
        ctx.fillRect(0, 0, 800, 450);
        TAPS.forEach((tp, i) => {
          const [x, y] = POS[i], ok = fixed.has(tp[0]);
          D.rrect(ctx, x - 110, y - 70, 220, 150, 16);
          ctx.fillStyle = ok ? '#d3f9d8' : '#fff';
          ctx.fill();
          ctx.strokeStyle = ok ? '#40c057' : '#ffa8a8';
          ctx.lineWidth = 3;
          ctx.stroke();
          D.emoji(ctx, tp[1], x, y - 20, 50);
          if (!ok) for (let k = 0; k < 3; k++) D.circle(ctx, x + 40, y - 30 + ((t * 80 + k * 20) % 60), 4, '#4dabf7');
          D.text(ctx, ok ? '✅ 改好了' : tp[2], x, y + 30, { size: 14, color: ok ? '#2b8a3e' : '#c92a2a', maxW: 200 });
          D.text(ctx, `${ok ? tp[4] : tp[3]} 升/天`, x, y + 56, { size: 13, color: '#6f6a85', weight: 'normal' });
        });
        // 水表
        D.rrect(ctx, 640, 270, 140, 110, 14);
        ctx.fillStyle = '#212529';
        ctx.fill();
        D.text(ctx, '💧 每天用水', 710, 295, { size: 14, color: '#fff' });
        D.text(ctx, `${used()} 升`, 710, 335, { size: 28, color: used() < 200 ? '#8ce99a' : '#ffd43b' });
        D.text(ctx, '目标：200 升以下', 710, 365, { size: 12, color: '#adb5bd', weight: 'normal' });
      });
      api.note('👆 点一点浪费水的地方，把它改正。');
    },
  });

  /* ================= 8. 健康的一天 ================= */
  Sci.register({
    id: 'healthyday',
    subject: 'health',
    level: 3,
    emoji: '⏰',
    title: '健康的一天',
    desc: '睡多久、动多久、看多久屏幕最合适？',
    intro: '一天只有 24 小时，上学和写作业要用掉 9 个小时，剩下的时间怎么安排才健康呢？拖动滑块，安排好睡觉、运动和看屏幕的时间，看看小朋友的心情和身体会有什么变化。找出一个三项都健康的安排！',
    goal: '安排出睡眠、运动、屏幕时间都健康的一天',
    fact: '<p>小学生每天最好睡 <b>9～11 个小时</b>。睡觉时身体会分泌“生长激素”，帮助长高，大脑也会整理白天学到的知识。</p><p>每天至少运动 <b>1 小时</b>，跑跑跳跳能让骨骼和心肺更强壮。</p><p>看手机、电脑、电视的屏幕时间每天最好不超过 <b>1～2 小时</b>，看 20 分钟就休息一下眼睛。</p><p>😴 早睡早起，按时吃饭，劳逸结合，身体才会棒棒的！</p>',
    quiz: [
      { q: '小学生每天最好睡多久？', options: ['6 小时', '9～11 小时', '15 小时'], answer: 1, explain: '小学生需要 9～11 小时的睡眠。' },
      { q: '为什么说“睡得好，长得高”？', options: ['睡觉时身体会分泌生长激素', '睡觉时骨头不动'], answer: 0, explain: '夜里熟睡时，生长激素分泌最多。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const SCHOOL = 9;
      let sleep = 7, sport = 0.5, screen = 4, done = false, t = 0;
      const free = () => 24 - SCHOOL - sleep - sport - screen;
      const okSleep = () => sleep >= 9 && sleep <= 11, okSport = () => sport >= 1, okScreen = () => screen <= 2;
      function update() {
        if (free() < 0) { api.note('一天只有 24 小时，时间不够啦！减少一些别的时间。'); return; }
        const all = okSleep() && okSport() && okScreen();
        if (all && !done) { done = true; Sci.sfx('star'); api.note('🎉 这是健康的一天：睡得够、动得够、屏幕看得少！'); api.goalDone(); }
        else if (!all) api.note([okSleep() ? '' : (sleep < 9 ? '睡眠不够。' : '睡得太多了。'), okSport() ? '' : '运动太少了。', okScreen() ? '' : '屏幕时间太长了。'].join(''));
      }
      api.loop(dt => {
        t += dt;
        ctx.fillStyle = '#fff9db';
        ctx.fillRect(0, 0, 800, 450);
        // 一天的时间饼图
        const CX = 220, CY = 230, R = 170;
        const parts = [['上学和作业', SCHOOL, '#74c0fc'], ['睡觉', sleep, '#9775fa'], ['运动', sport, '#69db7c'], ['看屏幕', screen, '#ff8787'], ['吃饭和玩', Math.max(0, free()), '#ffe066']];
        let a = -Math.PI / 2;
        parts.forEach(([n, h, c]) => {
          const b = a + h / 24 * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(CX, CY);
          ctx.arc(CX, CY, R, a, b);
          ctx.closePath();
          ctx.fillStyle = c;
          ctx.fill();
          if (h >= 1) { const m = (a + b) / 2; D.text(ctx, `${n} ${h}时`, CX + Math.cos(m) * R * 0.62, CY + Math.sin(m) * R * 0.62, { size: 13, color: '#2b2840' }); }
          a = b;
        });
        D.circle(ctx, CX, CY, 40, '#fff');
        D.text(ctx, '24 小时', CX, CY, { size: 14 });
        // 小朋友的状态
        const all = okSleep() && okSport() && okScreen() && free() >= 0;
        D.emoji(ctx, all ? '😄' : okSleep() ? '🙂' : '🥱', 600, 110, 90);
        [['睡眠', okSleep(), '9～11 小时'], ['运动', okSport(), '至少 1 小时'], ['屏幕', okScreen(), '最多 2 小时']].forEach(([n, ok, tip], i) => {
          D.text(ctx, `${ok ? '✅' : '⚠️'} ${n}（${tip}）`, 600, 210 + i * 36, { size: 16, color: ok ? '#2b8a3e' : '#c0620a' });
        });
        D.text(ctx, free() >= 0 ? `剩下 ${free()} 小时吃饭和玩` : '⚠️ 时间超过 24 小时了！', 600, 330, { size: 15, color: free() >= 0 ? '#495057' : '#c92a2a' });
      });
      api.slider('😴 睡觉', 6, 12, 0.5, sleep, v => { sleep = v; update(); }, v => v + ' 小时');
      api.slider('⚽ 运动', 0, 3, 0.5, sport, v => { sport = v; update(); }, v => v + ' 小时');
      api.slider('📱 看屏幕', 0, 6, 0.5, screen, v => { screen = v; update(); }, v => v + ' 小时');
      api.note('👆 拖动滑块，安排一天的时间。');
    },
  });

  /* ================= 9. 水的净化 ================= */
  const STEPS = [['settle', '⏳ 沉淀', '加入明矾，让泥沙慢慢沉到水底'], ['filter', '🧻 过滤', '让水穿过沙子和活性炭，挡住小颗粒和异味'], ['clean', '🧪 消毒', '加入消毒剂，杀死看不见的细菌']];

  Sci.register({
    id: 'purify',
    subject: 'health',
    level: 4,
    emoji: '🚿',
    title: '水的净化',
    desc: '浑浊的河水怎样变成干净的自来水？',
    intro: '我们家里的自来水，原本是河里或水库里的水，里面有泥沙、脏东西和看不见的细菌。自来水厂要经过好几道工序才能把它变干净。你来当一回水厂工程师：选择正确的顺序处理这杯浑水，让它变得又清又安全！',
    goal: '按正确的顺序把浑水变成干净的水',
    fact: '<p>自来水厂净化水的主要步骤：</p><p>① <b>沉淀</b>：加入明矾等，让泥沙结成大块沉到水底。② <b>过滤</b>：让水流过沙层和活性炭，挡住小颗粒、去掉颜色和异味。③ <b>消毒</b>：杀死看不见的细菌和病毒。</p><p>顺序很重要：如果不先沉淀就过滤，滤层很快就被泥沙堵住了。</p><p>⚠️ 工厂乱排污水、农田用太多化肥农药，都会污染河流。保护水源，人人有责！野外的生水就算看起来很清，也可能有细菌，不能直接喝。</p>',
    quiz: [
      { q: '自来水净化时，应该先做哪一步？', options: ['沉淀', '消毒', '直接喝'], answer: 0, explain: '先让大颗粒泥沙沉下去。' },
      { q: '野外的小溪水看起来很清，可以直接喝吗？', options: ['不可以，可能有细菌', '可以'], answer: 0, explain: '看起来清的水也可能有看不见的细菌。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let mud = 1, fine = 1, germs = 1, done = [], anim = null, t = 0, clogged = false;
      const order = ['settle', 'filter', 'clean'];
      function act(id) {
        if (anim) return;
        if (done.indexOf(id) >= 0) { api.note('这一步已经做过了。'); return; }
        anim = { id, k: 0 };
        Sci.sfx('click');
      }
      function finish(id) {
        const s = STEPS.find(x => x[0] === id);
        if (id === 'filter' && done.indexOf('settle') < 0) {
          clogged = true;
          Sci.sfx('bad');
          api.note('哎呀！泥沙太多，滤层一下子就被堵住了，水几乎流不过去。应该先沉淀！点“重新来”再试一次。');
          return;
        }
        if (id === 'clean' && fine > 0.2) { Sci.sfx('bad'); api.note('水还浑浑的，消毒剂效果不好。先把水弄清再消毒吧。'); done.push(id); germs = 0.5; return; }
        done.push(id);
        if (id === 'settle') { mud = 0.1; fine = 0.6; }
        if (id === 'filter') { fine = 0; mud = 0; }
        if (id === 'clean') germs = 0;
        Sci.sfx('good');
        api.note(`✅ ${s[1].slice(2)}：${s[2]}。`);
        if (done.join() === order.join()) { Sci.sfx('star'); api.note('🎉 浑水变成了又清又安全的水！沉淀 → 过滤 → 消毒，顺序全对。'); api.goalDone(); }
      }
      api.loop(dt => {
        t += dt;
        if (anim) { anim.k += dt / 1.5; if (anim.k >= 1) { const id = anim.id; anim = null; finish(id); } }
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 450);
        // 水杯
        const X = 140, Y = 100, W = 200, H = 280;
        const murk = Math.max(mud, fine * 0.7);
        ctx.fillStyle = Sci.rgb(Sci.mixColor([170, 215, 255], [150, 110, 60], murk), 0.9);
        ctx.fillRect(X, Y + 30, W, H - 30);
        if (mud < 0.5 && done.indexOf('settle') >= 0) { ctx.fillStyle = '#8d6e4f'; ctx.fillRect(X, Y + H - 26, W, 26); }
        for (let i = 0; i < 18 * germs; i++) germ(ctx, X + 20 + (i * 37) % (W - 40), Y + 60 + (i * 53) % (H - 100), 5, 0.8);
        ctx.strokeStyle = '#868e96';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(X, Y);
        ctx.lineTo(X, Y + H);
        ctx.lineTo(X + W, Y + H);
        ctx.lineTo(X + W, Y);
        ctx.stroke();
        if (anim) D.text(ctx, STEPS.find(s => s[0] === anim.id)[1] + '中……', X + W / 2, Y - 20, { size: 18, color: '#1c7ed6' });
        if (clogged) D.text(ctx, '🚫 滤层堵住了', X + W / 2, Y - 20, { size: 18, color: '#c92a2a' });
        // 仪表
        D.rrect(ctx, 420, 90, 340, 220, 16);
        ctx.fillStyle = '#fff';
        ctx.fill();
        const bar = (label, v, y, good) => {
          D.text(ctx, label, 440, y, { size: 16, align: 'left' });
          ctx.fillStyle = '#e9ecef';
          ctx.fillRect(560, y - 9, 180, 18);
          ctx.fillStyle = v < 0.05 ? '#40c057' : '#fa5252';
          ctx.fillRect(560, y - 9, 180 * v, 18);
          D.text(ctx, v < 0.05 ? good : '', 650, y + 22, { size: 12, color: '#2b8a3e', weight: 'normal' });
        };
        bar('泥沙', mud, 130, '没有泥沙了');
        bar('小颗粒', fine, 185, '清澈透明');
        bar('细菌', germs, 240, '安全可以用了');
        D.text(ctx, '做过的步骤：' + (done.map(id => STEPS.find(s => s[0] === id)[1].slice(2)).join(' → ') || '还没有'), 590, 290, { size: 14, color: '#495057' });
      });
      STEPS.forEach(s => api.button(s[1], () => { if (!clogged) act(s[0]); }));
      api.button('🔄 重新来', () => { mud = 1; fine = 1; germs = 1; done = []; clogged = false; anim = null; api.note('换了一杯新的浑水。'); });
      api.note('👆 想一想顺序，点下面的按钮处理这杯浑水。');
    },
  });

  /* ================= 10. 生态平衡 ================= */
  Sci.register({
    id: 'ecosystem',
    subject: 'health',
    level: 5,
    emoji: '🦊',
    title: '生态平衡',
    desc: '草、兔子和狐狸，少了谁都不行',
    intro: '草原上，兔子吃草，狐狸吃兔子，它们的数量会一起起起伏伏，保持着一种平衡。如果人类把狐狸都打光了，会发生什么？先让草原自己运行 30 年看看，再试试“把狐狸打光”，观察兔子和草的数量怎么变化。',
    goal: '先观察平衡的草原，再观察失去狐狸后的变化',
    fact: '<p>在一个<b>生态系统</b>里，生物之间互相依存：草养活兔子，兔子养活狐狸；狐狸也控制着兔子的数量，让草不会被吃光。它们的数量会此起彼伏，保持<b>生态平衡</b>。</p><p>如果把狐狸都消灭了，兔子会越来越多，把草全吃光，最后兔子自己也会因为没有食物而大量饿死，草原变成荒地。</p><p>🌏 澳大利亚曾经引入兔子却没有天敌，结果兔子泛滥成灾。保护每一种生物，就是保护我们自己的家园。</p>',
    quiz: [
      { q: '草原上的狐狸被打光以后，兔子会？', options: ['先变得很多，后来因为草被吃光而减少', '一直保持不变'], answer: 0, explain: '没有天敌，兔子先暴增，草吃光后又大量死亡。' },
      { q: '生态系统里的生物之间是什么关系？', options: ['互相依存、互相制约', '毫无关系'], answer: 0, explain: '每一种生物都和别的生物紧密相连。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let sim = null, hist = [], noFox = false, seenBalance = false, seenCrash = false, t = 0;
      function run(removeFox) {
        if (sim) return;
        noFox = removeFox;
        sim = { g: 120, r: 30, f: removeFox ? 0 : 8, year: 0, timer: 0 };
        hist = [[sim.g, sim.r, sim.f]];
        Sci.sfx('click');
        api.note(removeFox ? '狐狸被打光了……看看接下来 30 年会怎样。' : '草原开始运行……');
      }
      function step(s) {
        // 简化的捕食模型：草会长回来，兔子吃草繁殖，狐狸吃兔子繁殖
        const g = s.g, r = s.r, f = s.f;
        const g2 = g + 0.27 * g * (1 - g / 150) - 0.0036 * g * r;
        const r2 = r + 0.0056 * g * r - 0.2 * r - 0.043 * r * f;
        const f2 = f + 0.0046 * r * f - 0.117 * f;
        s.g = clamp(g2, 0.5, 200);
        s.r = clamp(r2, 0, 300);
        s.f = clamp(f2, 0, 80);
      }
      api.loop(dt => {
        t += dt;
        if (sim) {
          sim.timer -= dt;
          if (sim.timer <= 0) {
            sim.timer = 0.12;
            for (let k = 0; k < 2; k++) step(sim);
            sim.year++;
            hist.push([sim.g, sim.r, sim.f]);
            if (sim.year >= 30) {
              const s = sim;
              sim = null;
              if (noFox) { seenCrash = true; Sci.sfx('bad'); api.note('没有了狐狸，兔子先是越来越多，把草吃得精光，后来兔子也饿得大量死亡了……'); }
              else { seenBalance = true; Sci.sfx('good'); api.note('30 年里，草、兔子、狐狸的数量此起彼伏，但都活得好好的——这就是生态平衡。'); }
              if (seenBalance && seenCrash) api.goalDone();
            }
          }
        }
        ctx.fillStyle = '#f4fce3';
        ctx.fillRect(0, 0, 800, 450);
        const GX = 60, GY = 40, GW = 480, GH = 300;
        ctx.fillStyle = '#fff';
        ctx.fillRect(GX, GY, GW, GH);
        ctx.strokeStyle = '#495057';
        ctx.lineWidth = 2;
        ctx.strokeRect(GX, GY, GW, GH);
        const series = [[0, '#40c057', '草', 160], [1, '#868e96', '兔子', 160], [2, '#e8590c', '狐狸', 16]];
        series.forEach(([i, c, , max]) => {
          ctx.strokeStyle = c;
          ctx.lineWidth = 3;
          ctx.beginPath();
          hist.forEach((h, k) => (k ? ctx.lineTo : ctx.moveTo).call(ctx, GX + k / 30 * GW, GY + GH - h[i] / max * GH));
          ctx.stroke();
        });
        D.text(ctx, '年 →', GX + GW - 20, GY + GH + 18, { size: 13, color: '#495057' });
        series.forEach(([i, c, n], k) => D.text(ctx, `— ${n}`, GX + 20 + k * 80, GY + GH + 30, { size: 14, align: 'left', color: c }));
        // 草原画面
        const cur = hist[hist.length - 1] || [120, 30, 8];
        D.rrect(ctx, 570, 40, 210, 300, 16);
        ctx.fillStyle = Sci.rgb(Sci.mixColor([210, 180, 120], [120, 200, 90], clamp(cur[0] / 150, 0, 1)));
        ctx.fill();
        for (let k = 0; k < Math.min(12, Math.round(cur[1] / 15)); k++) D.emoji(ctx, '🐇', 600 + (k * 53) % 160, 90 + (k * 37) % 150, 24);
        for (let k = 0; k < Math.min(6, Math.round(cur[2] / 2)); k++) D.emoji(ctx, '🦊', 610 + (k * 61) % 150, 270 + (k % 2) * 30, 26);
        D.text(ctx, `草 ${Math.round(cur[0])}　兔 ${Math.round(cur[1])}　狐 ${Math.round(cur[2])}`, 675, 360, { size: 14 });
        if (sim) D.text(ctx, `第 ${sim.year} 年`, 300, 25, { size: 15, color: '#2b2840' });
        D.text(ctx, `${seenBalance ? '✅' : '⬜'} 平衡的草原　${seenCrash ? '✅' : '⬜'} 没有狐狸的草原`, 300, 410, { size: 15 });
      });
      api.button('▶ 草原运行 30 年', () => run(false));
      api.button('🚫 狐狸都被捕光了，再运行 30 年', () => run(true));
      api.note('👆 先点“草原运行 30 年”。');
    },
  });
})();
