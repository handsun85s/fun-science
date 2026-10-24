/* 工程小创客（第二组）：轮子的发明 → 齿轮 → 投石器 → 液压机械臂 → 抗震大楼 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 6. 轮子的发明 ================= */
  const MOVERS = [['drag', '直接拖', 100, '石头和地面直接摩擦，太费力了！'], ['logs', '下面垫圆木', 30, '圆木滚动起来，摩擦小了很多。'], ['wheel', '装上轮子', 10, '轮子和轴转动，最省力！']];

  Sci.register({
    id: 'wheel',
    subject: 'engineering',
    level: 1,
    emoji: '🛒',
    title: '轮子的发明',
    desc: '把大石头运走，怎样最省力？',
    intro: '很久很久以前，人们要把大石头运去盖房子，可是石头太重了！聪明的古人想了好多办法。小朋友最多能使出 40 份力气，试试直接拖、在下面垫圆木、装上轮子，哪种办法能把石头运到小旗那里？',
    goal: '用两种不同的办法把石头运到小旗那里',
    fact: '<p>东西在地面上<b>滑动</b>时，摩擦力很大；如果让它<b>滚动</b>，摩擦力就小多了。</p><p>古人先在重物下面垫圆木，让它滚着走；后来发明了<b>轮子和轴</b>，车子就出现了。轮子是人类最伟大的发明之一，自行车、汽车、火车、行李箱……到处都离不开它。</p><p>⚙️ 机器里的<b>滚珠轴承</b>也是用滚动代替滑动，让轮子转得又轻又快。</p>',
    quiz: [
      { q: '为什么推装了轮子的箱子更省力？', options: ['滚动的摩擦比滑动小', '轮子让箱子变轻了'], answer: 0, explain: '滚动摩擦比滑动摩擦小得多。' },
      { q: '行李箱下面装轮子，是利用了什么？', options: ['用滚动代替滑动', '让箱子更好看'], answer: 0, explain: '滚动能大大减小摩擦。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const G = 360, FLAG = 640, KID = 40;
      let m = MOVERS[0], x = 120, drag = null, warned = false, t = 0;
      const okSet = new Set();

      api.pointer(st, {
        down(p) { drag = { x: p.x }; warned = false; },
        move(p, active) {
          if (!active || !drag) return;
          const dx = p.x - drag.x;
          drag.x = p.x;
          if (dx <= 0) return;
          if (m[2] > KID) {
            if (!warned) { warned = true; Sci.sfx('bad'); api.note(`拉不动！${m[1]}要用 ${m[2]} 份力气，小朋友只有 ${KID} 份。${m[3]}`); }
            return;
          }
          x = Math.min(FLAG, x + dx * (m[0] === 'wheel' ? 1 : 0.55));
          if (x >= FLAG && !okSet.has(m[0])) {
            okSet.add(m[0]);
            Sci.sfx('star');
            api.note(`✅ 用“${m[1]}”把石头运到啦！只要 ${m[2]} 份力气。${m[3]}`);
            if (okSet.size >= 2) api.goalDone();
          }
        },
        up() { drag = null; },
      });
      api.loop(dt => {
        t += dt;
        ctx.fillStyle = '#fff4e6';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#d9b48f';
        ctx.fillRect(0, G + 30, 800, 60);
        D.emoji(ctx, '🚩', FLAG + 60, G - 30, 40);
        // 圆木或轮子
        if (m[0] === 'logs') for (let i = 0; i < 3; i++) { const lx = x - 40 + i * 40; D.circle(ctx, lx, G + 18, 12, '#a0703c', '#7a5230', 2); }
        if (m[0] === 'wheel') {
          ctx.fillStyle = '#8d5a3b';
          ctx.fillRect(x - 70, G + 4, 140, 12);
          [-45, 45].forEach(o => {
            D.circle(ctx, x + o, G + 18, 14, '#495057');
            ctx.strokeStyle = '#ced4da';
            ctx.lineWidth = 2;
            const a = x / 14;
            ctx.beginPath();
            ctx.moveTo(x + o + Math.cos(a) * 12, G + 18 + Math.sin(a) * 12);
            ctx.lineTo(x + o - Math.cos(a) * 12, G + 18 - Math.sin(a) * 12);
            ctx.stroke();
          });
        }
        // 大石头
        const lift = m[0] === 'drag' ? 30 : 6;
        ctx.fillStyle = '#868e96';
        ctx.beginPath();
        ctx.moveTo(x - 60, G + lift);
        ctx.lineTo(x - 50, G - 70 + lift);
        ctx.lineTo(x + 40, G - 80 + lift);
        ctx.lineTo(x + 62, G + lift);
        ctx.closePath();
        ctx.fill();
        // 绳子和小朋友
        ctx.strokeStyle = '#8d5a3b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 55, G - 30);
        ctx.lineTo(x + 120, G - 40);
        ctx.stroke();
        D.emoji(ctx, m[2] > KID ? '😣' : '💪', x + 140, G - 40, 44);
        D.text(ctx, `${m[1]}：要 ${m[2]} 份力气（我有 ${KID} 份）`, 400, 50, { size: 20, color: m[2] > KID ? '#c92a2a' : '#2b8a3e' });
        D.text(ctx, MOVERS.map(mm => (okSet.has(mm[0]) ? '✅' : '⬜') + mm[1]).join('　'), 400, 90, { size: 15 });
        D.text(ctx, '👆 按住画面往右拖，拉动石头', 400, 430, { size: 14, color: '#6f6a85', weight: 'normal' });
      });
      api.choice(MOVERS.map(mm => [mm[0], mm[1]]), m[0], v => { m = MOVERS.find(mm => mm[0] === v); x = 120; });
      api.note('👆 先试试直接拖：按住画面往右拖。');
    },
  });

  /* ================= 7. 齿轮转转转 ================= */
  Sci.register({
    id: 'gears',
    subject: 'engineering',
    level: 2,
    emoji: '⚙️',
    title: '齿轮转转转',
    desc: '大齿轮带小齿轮，转得更快还是更慢？',
    intro: '钟表、自行车、玩具小车里都藏着齿轮。两个齿轮咬在一起，一个转，另一个也跟着转——可是方向和快慢会变哦！左边的红齿轮是“主动轮”，换一换齿轮的大小，再试试在中间加一个齿轮，完成挑战。',
    goal: '让右边的齿轮转得比红齿轮快，而且转的方向相同',
    fact: '<p>两个齿轮咬合在一起时，<b>转动方向相反</b>：一个顺时针，另一个就逆时针。在中间加一个“惰轮”，最后一个齿轮的方向就又和第一个相同了。</p><p>齿轮转得快慢看<b>齿数</b>：大齿轮带动小齿轮，小齿轮转得<b>更快</b>；小齿轮带动大齿轮，大齿轮转得更慢，但<b>力气更大</b>。</p><p>🚲 骑自行车时，前面的大齿轮带动后轮上的小齿轮，所以脚蹬一圈，后轮能转好几圈！</p>',
    quiz: [
      { q: '两个咬合的齿轮，转动方向是？', options: ['相反', '相同'], answer: 0, explain: '直接咬合的两个齿轮转向相反。' },
      { q: '36 齿的大齿轮带动 12 齿的小齿轮，大齿轮转 1 圈，小齿轮转几圈？', options: ['3 圈', '1 圈', '12 圈'], answer: 0, explain: '36 ÷ 12 = 3。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const SIZES = [12, 24, 36];
      let a = 24, b = 24, idler = false, ang = 0, t = 0, done = false;
      const R = n => n * 3;
      function gear(x, y, n, rot, color) {
        const r = R(n), tooth = 9;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.beginPath();
        // 每个齿：从齿根斜着升到齿顶，再降回齿根
        const w = Math.PI / n;
        for (let i = 0; i < n; i++) {
          const c = (i / n) * Math.PI * 2;
          [[r, c - w * 0.55], [r + tooth, c - w * 0.3], [r + tooth, c + w * 0.3], [r, c + w * 0.55], [r, c + w]].forEach(([rr, aa]) => ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr));
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        D.circle(ctx, 0, 0, 8, '#fff');
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        ctx.fillRect(-3, -r + 6, 6, r - 14);
        ctx.restore();
      }
      function evaluate() {
        const ratio = a / b, same = idler;
        const fast = ratio > 1;
        api.note(`红齿轮转 1 圈，最后的齿轮转 ${ratio % 1 ? ratio.toFixed(1) : ratio} 圈，方向${same ? '相同' : '相反'}。` + (fast && same ? '' : fast ? '转得快了，可方向是反的。' : same ? '方向对了，可转得不够快。' : ''));
        if (fast && same && !done) { done = true; Sci.sfx('star'); api.note(`🎉 挑战成功！${a} 齿带 ${b} 齿，转得快 ${ratio} 倍；中间加了惰轮，方向相同。`); api.goalDone(); }
      }
      api.loop(dt => {
        t += dt;
        ang += dt * 1.2;
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 450);
        const y = 230, x1 = 170;
        const n2 = 16; // 惰轮
        let x2 = x1 + R(a) + R(b) + 9;
        let xi = 0;
        if (idler) { xi = x1 + R(a) + R(n2) + 9; x2 = xi + R(n2) + R(b) + 9; }
        // 计算每个齿轮的转角（齿要对得上，所以加半个齿的错位）
        gear(x1, y, a, ang, '#fa5252');
        if (idler) gear(xi, y, n2, -ang * a / n2 + Math.PI / n2, '#adb5bd');
        const rotB = idler ? ang * a / b : -ang * a / b + Math.PI / b;
        gear(x2, y, b, rotB, '#4c6ef5');
        // 旋转方向箭头
        const arrow = (x, r, cw) => {
          ctx.strokeStyle = '#2b2840';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, r + 22, -2.4, -0.8);
          ctx.stroke();
          const e = cw ? -0.8 : -2.4, ex = x + Math.cos(e) * (r + 22), ey = y + Math.sin(e) * (r + 22);
          D.arrow(ctx, ex + (cw ? -6 : 6), ey - 4, ex, ey, '#2b2840', 3, 12);
        };
        arrow(x1, R(a), true);
        arrow(x2, R(b), idler);
        D.text(ctx, `${a} 齿（主动轮）`, x1, y + R(a) + 36, { size: 15, color: '#c92a2a' });
        D.text(ctx, `${b} 齿`, x2, y + R(b) + 36, { size: 15, color: '#364fc7' });
        if (idler) D.text(ctx, '惰轮', xi, y + R(n2) + 36, { size: 14, color: '#495057' });
        D.text(ctx, `转速：红 1 圈 → 蓝 ${(a / b) % 1 ? (a / b).toFixed(1) : a / b} 圈`, 400, 40, { size: 20 });
        D.text(ctx, `方向：${idler ? '相同' : '相反'}`, 400, 72, { size: 18, color: idler ? '#2b8a3e' : '#c0620a' });
      });
      api.choice(SIZES.map(n => [n, `🔴 红 ${n} 齿`]), a, v => { a = v; evaluate(); });
      const r2 = api.row();
      api.choice(SIZES.map(n => [n, `🔵 蓝 ${n} 齿`]), b, v => { b = v; evaluate(); }, r2);
      api.toggle('⚙️ 中间加惰轮', false, v => { idler = v; evaluate(); });
      api.note('👆 换一换齿轮的大小，看看蓝齿轮转得快还是慢，方向一样吗？');
    },
  });

  /* ================= 8. 投石器 ================= */
  Sci.register({
    id: 'catapult',
    subject: 'engineering',
    level: 3,
    emoji: '🏰',
    title: '投石器',
    desc: '调好力量和角度，命中远处的城堡',
    intro: '古代的投石器能把大石头扔得很远很远！它的威力和瞄准，取决于拉动的“力量”和放出去的“角度”。调整这两个数值，按“发射”，看石头飞出的弧线，命中远处的城堡三次吧！城堡的位置会变哦。',
    goal: '命中城堡 3 次',
    fact: '<p>投石器利用了<b>杠杆</b>和<b>弹力</b>：把长长的投臂拉下去储存能量，松开后投臂猛地弹起，把石头抛出去。</p><p>石头飞出去后走的是一条<b>抛物线</b>：先上升，再下落。力量越大，飞得越远；角度也很重要——不考虑空气阻力的话，<b>45°</b> 时扔得最远，比 45° 大或小相同角度时，落点一样远。</p><p>🏀 投篮、扔沙包、喷泉的水柱，走的都是抛物线。</p>',
    quiz: [
      { q: '在不考虑空气阻力时，以多大的角度抛出，能扔得最远？', options: ['30°', '45°', '80°'], answer: 1, explain: '45° 时射程最远。' },
      { q: '扔出去的石头在空中走的路线是什么形状？', options: ['抛物线（弧线）', '一条直线'], answer: 0, explain: '石头先上升后下落，走出一条弧线。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const G = 390, X0 = 90, GR = 400;
      let power = 6, angle = 45, shot = null, target = 520, hits = 0, trail = [];
      const newTarget = () => { target = Math.round(rand(360, 700)); };
      function fire() {
        if (shot) return;
        const v = power * 52, a = angle * Math.PI / 180;
        shot = { x: X0, y: G - 50, vx: Math.cos(a) * v, vy: -Math.sin(a) * v };
        trail = [];
        Sci.sfx('whoosh');
      }
      api.loop(dt => {
        if (shot) {
          for (let k = 0; k < 4; k++) {
            const d = dt / 4;
            shot.vy += GR * d;
            shot.x += shot.vx * d;
            shot.y += shot.vy * d;
            if (k === 0) trail.push([shot.x, shot.y]);
            if (shot.y >= G) {
              const hit = Math.abs(shot.x - target) < 40;
              if (hit) {
                hits++;
                Sci.sfx('star');
                api.note(`💥 命中城堡！（${hits}/3）` + (hits < 3 ? '城堡换地方了，再瞄准一次！' : ''));
                if (hits === 3) api.goalDone();
                api.timeout(newTarget, 1200);
              } else {
                Sci.sfx('plop');
                api.note(shot.x < target ? '扔近了！加大力量，或者把角度调得更接近 45°。' : '扔远了！减小一点力量，或者调一调角度。');
              }
              shot = null;
              break;
            }
          }
        }
        ctx.fillStyle = '#e7f5ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#8ce99a';
        ctx.fillRect(0, G, 800, 60);
        // 弧线
        ctx.strokeStyle = 'rgba(80,80,80,.35)';
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
        ctx.setLineDash([]);
        // 投石器
        ctx.fillStyle = '#8d5a3b';
        ctx.fillRect(X0 - 40, G - 20, 80, 20);
        ctx.fillRect(X0 - 6, G - 60, 12, 40);
        const a = shot ? -angle * Math.PI / 180 : 0.6;
        ctx.save();
        ctx.translate(X0, G - 55);
        ctx.rotate(-Math.PI + (shot ? Math.PI - angle * Math.PI / 180 : 0.4));
        ctx.fillStyle = '#a0703c';
        ctx.fillRect(0, -5, 70, 10);
        ctx.restore();
        // 城堡
        D.emoji(ctx, '🏰', target, G - 30, 64);
        if (shot) D.circle(ctx, shot.x, shot.y, 9, '#495057');
        D.text(ctx, `力量 ${power}　角度 ${angle}°`, 400, 40, { size: 20 });
        D.text(ctx, `命中 ${hits} / 3`, 780, 26, { size: 18, align: 'right', color: '#c0620a' });
      });
      api.slider('力量', 1, 10, 0.5, power, v => { power = v; });
      api.slider('角度', 15, 75, 5, angle, v => { angle = v; }, v => v + '°');
      api.button('🎯 发射！', fire);
      api.note('👆 调好力量和角度，点“发射！”。');
    },
  });

  /* ================= 9. 液压机械臂 ================= */
  const SYR = [[1, '细针筒'], [2, '中针筒'], [4, '粗针筒'], [6, '超粗针筒']];

  Sci.register({
    id: 'hydraulic',
    subject: 'engineering',
    level: 4,
    emoji: '🚜',
    title: '液压机械臂',
    desc: '两个针筒用水管连起来，能举起重物',
    intro: '挖掘机的大铁臂力气大得惊人，秘密就在“液压”！两个针筒用装满水的管子连在一起，推一个，另一个就会被顶起来。小朋友的手最多能推 15 份力气，可是箱子有 60 份重。选一对合适的针筒，把箱子举到高处吧！',
    goal: '用液压举起 60 份重的箱子',
    fact: '<p>液体很难被压缩，推一个针筒时，压力会通过水<b>原封不动地传到</b>另一个针筒里，这叫<b>帕斯卡原理</b>。</p><p>推“细针筒”，顶起“粗针筒”：粗针筒的面积是细针筒的几倍，得到的力气就放大几倍！但是要推好长一段，粗针筒才升高一点点——又是“省力费距离”。</p><p>🚜 挖掘机、汽车刹车、理发店的升降椅、千斤顶，都用到了液压。</p>',
    quiz: [
      { q: '推细针筒、顶起粗针筒，力气会怎样？', options: ['变大', '变小', '不变'], answer: 0, explain: '面积大几倍，力就放大几倍。' },
      { q: '挖掘机的铁臂靠什么来产生巨大的力气？', options: ['液压', '弹簧'], answer: 0, explain: '挖掘机用液压缸推动铁臂。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const KID = 15, LOAD = 60, PUSH_MAX = 280;
      let small = SYR[0], big = SYR[2], push = 0, drag = null, warned = false, done = false;
      const force = () => LOAD * small[0] / big[0];
      const lift = () => push * small[0] / big[0];

      api.pointer(st, {
        down(p) { if (p.x < 330) { drag = { y: p.y }; warned = false; } },
        move(p, active) {
          if (!active || !drag) return;
          const dy = p.y - drag.y;
          drag.y = p.y;
          if (dy <= 0) return;
          if (force() > KID) {
            if (!warned) { warned = true; Sci.sfx('bad'); api.note(`推不动！要举起箱子需要 ${force().toFixed(0)} 份力气，小手只有 ${KID} 份。换一对针筒试试。`); }
            return;
          }
          push = Math.min(PUSH_MAX, push + dy);
          if (lift() >= 30 && !done) {
            done = true;
            Sci.sfx('star');
            api.note(`🎉 箱子被举起来了！只用了 ${force().toFixed(0)} 份力气，力气放大了 ${big[0] / small[0]} 倍。可是推了 ${Math.round(push / 10)} 格，箱子才升高 ${Math.round(lift() / 10)} 格。`);
            api.goalDone();
          }
        },
        up() { drag = null; },
      });
      api.loop(() => {
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 450);
        const w1 = 18 + small[0] * 10, w2 = 18 + big[0] * 10;
        const X1 = 200, X2 = 560, BOT = 400;
        // 两个针筒和水管
        ctx.fillStyle = 'rgba(116,192,252,.7)';
        ctx.fillRect(X1 - w1 / 2, 120 + push * 0.9, w1, BOT - 120 - push * 0.9);
        ctx.fillRect(X2 - w2 / 2, 300 - lift(), w2, BOT - 300 + lift());
        ctx.fillRect(X1, BOT - 14, X2 - X1, 14);
        ctx.strokeStyle = '#868e96';
        ctx.lineWidth = 3;
        ctx.strokeRect(X1 - w1 / 2, 100, w1, BOT - 100);
        ctx.strokeRect(X2 - w2 / 2, 200, w2, BOT - 200);
        // 活塞
        ctx.fillStyle = '#495057';
        ctx.fillRect(X1 - w1 / 2, 112 + push * 0.9, w1, 10);
        ctx.fillRect(X1 - 4, 40 + push * 0.9, 8, 72);
        ctx.fillRect(X2 - w2 / 2, 290 - lift(), w2, 10);
        ctx.fillRect(X2 - 4, 230 - lift(), 8, 60);
        D.emoji(ctx, '✋', X1, 30 + push * 0.9, 40);
        // 箱子
        D.rrect(ctx, X2 - 50, 170 - lift(), 100, 60, 8);
        ctx.fillStyle = '#e8b500';
        ctx.fill();
        D.text(ctx, `${LOAD} 份重`, X2, 200 - lift(), { size: 16, color: '#5c3d00' });
        D.text(ctx, small[1], X1, BOT + 22, { size: 15 });
        D.text(ctx, big[1], X2, BOT + 22, { size: 15 });
        D.text(ctx, `需要的力气：${force().toFixed(0)} 份（小手最多 ${KID} 份）`, 400, 30, { size: 17, color: force() > KID ? '#c92a2a' : '#2b8a3e' });
        D.text(ctx, `力气放大 ${(big[0] / small[0]).toFixed(1)} 倍`, 400, 58, { size: 15, color: '#6f6a85' });
        D.text(ctx, '👆 在左边按住往下拖，推动针筒', 700, 430, { size: 13, color: '#6f6a85', weight: 'normal' });
      });
      api.choice(SYR.map((s, i) => [i, '推：' + s[1]]), 0, v => { small = SYR[v]; push = 0; done = false; });
      const r2 = api.row();
      api.choice(SYR.map((s, i) => [i, '顶：' + s[1]]), 2, v => { big = SYR[v]; push = 0; done = false; }, r2);
      api.note('👆 在左边按住往下拖，推动针筒，看看右边的箱子能不能被举起来。');
    },
  });

  /* ================= 10. 抗震大楼 ================= */
  const MEASURES = [['brace', '加斜撑', 1.5, '斜撑组成三角形，让楼房不容易变形'], ['iso', '基础隔震垫', 1.2, '橡胶垫像弹簧一样，把地面的晃动挡在楼下'], ['damper', '顶部阻尼器', 0.8, '楼顶的大铁球往反方向摆，抵消楼的晃动']];

  Sci.register({
    id: 'quakeproof',
    subject: 'engineering',
    level: 5,
    emoji: '🏢',
    title: '抗震大楼',
    desc: '用工程的办法，让高楼在地震里屹立不倒',
    intro: '地震来了，怎样让高楼不倒塌？工程师有好几种办法：加斜撑、装隔震垫、在楼顶挂一个巨大的阻尼器。选择你的抗震方案，调好地震的强度，按“开始地震”测试一下。挑战：让大楼挺过 8 级的大地震！',
    goal: '让大楼挺过 8 级地震',
    fact: '<p>地震让地面左右晃动，楼房跟着摇摆，摆得太厉害就会开裂、倒塌。工程师的抗震办法：</p><p>🔺 <b>斜撑</b>：用三角形加固墙体，楼不容易变形。⬛ <b>隔震垫</b>：在楼和地基之间装上厚厚的橡胶垫，把晃动“隔”开。⚖️ <b>阻尼器</b>：台北 101 大楼的顶上挂着一个 660 吨的大钢球，楼往左摆，它往右摆，帮大楼稳住。</p><p>我国的建筑都要按照抗震标准来设计，学校和医院的要求更高，这样地震来了才更安全。</p>',
    quiz: [
      { q: '楼房里加斜撑，是利用了什么图形的稳定性？', options: ['三角形', '正方形', '圆形'], answer: 0, explain: '三角形不容易变形。' },
      { q: '隔震垫装在楼房的哪里？', options: ['楼和地基之间', '楼顶上'], answer: 0, explain: '隔震垫把地面的晃动隔开，不让它全部传到楼上。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const G = 400, FLOORS = 7, FH = 42, BW = 130, BX = 300;
      let mag = 6, on = new Set(), quake = 0, result = null, t = 0, crack = 0;
      const amp = () => (mag * mag) * 0.9 / (1 + [...on].reduce((s, k) => s + MEASURES.find(m => m[0] === k)[2], 0));
      const LIMIT = 30;

      function start() {
        if (quake > 0) return;
        quake = 3;
        result = null;
        crack = 0;
        Sci.sfx('whoosh');
        api.note(`${mag} 级地震来了！轰隆隆……`);
      }
      api.loop(dt => {
        t += dt;
        let sway = 0, ground = 0;
        if (quake > 0) {
          quake -= dt;
          ground = Math.sin(t * 18) * mag * 1.4;
          sway = Math.sin(t * 6) * amp();
          if (amp() > LIMIT) crack = Math.min(1, crack + dt * 0.6);
          if (quake <= 0) {
            if (amp() > LIMIT) {
              result = 'fail';
              Sci.sfx('bad');
              api.note(`大楼摇晃得太厉害，开裂了！晃动幅度 ${Math.round(amp())}，超过了安全线 ${LIMIT}。再加一些抗震措施吧。`);
            } else {
              result = 'ok';
              Sci.sfx(mag >= 8 ? 'star' : 'good');
              api.note(`✅ ${mag} 级地震过去了，大楼安然无恙！（晃动幅度 ${Math.round(amp())}，安全线 ${LIMIT}）`);
              if (mag >= 8) api.goalDone();
            }
          }
        }
        ctx.fillStyle = '#f1f3f5';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#a0703c';
        ctx.fillRect(0, G + 20, 800, 30);
        ctx.save();
        ctx.translate(ground, 0);
        ctx.fillStyle = '#868e96';
        ctx.fillRect(BX - BW / 2 - 20, G, BW + 40, 20);
        if (on.has('iso')) for (let i = 0; i < 4; i++) { ctx.fillStyle = '#343a40'; ctx.fillRect(BX - BW / 2 + 8 + i * 34, G - 10, 22, 10); }
        ctx.restore();
        // 楼房：越往上晃得越多
        const base = G - (on.has('iso') ? 10 : 0);
        for (let i = 0; i < FLOORS; i++) {
          const k0 = i / FLOORS, k1 = (i + 1) / FLOORS;
          const x0 = BX + ground * (on.has('iso') ? 0.3 : 1) + sway * k0 * k0, x1 = BX + ground * (on.has('iso') ? 0.3 : 1) + sway * k1 * k1;
          const y0 = base - i * FH, y1 = base - (i + 1) * FH;
          ctx.fillStyle = result === 'fail' && i > 3 ? '#ffc9c9' : '#dee2e6';
          ctx.beginPath();
          ctx.moveTo(x0 - BW / 2, y0);
          ctx.lineTo(x1 - BW / 2, y1);
          ctx.lineTo(x1 + BW / 2, y1);
          ctx.lineTo(x0 + BW / 2, y0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#495057';
          ctx.lineWidth = 3;
          ctx.stroke();
          if (on.has('brace')) {
            ctx.strokeStyle = '#e8590c';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x0 - BW / 2, y0);
            ctx.lineTo(x1 + BW / 2, y1);
            ctx.moveTo(x0 + BW / 2, y0);
            ctx.lineTo(x1 - BW / 2, y1);
            ctx.stroke();
          } else {
            ctx.fillStyle = '#74c0fc';
            ctx.fillRect((x0 + x1) / 2 - 40, y1 + 10, 24, 20);
            ctx.fillRect((x0 + x1) / 2 + 16, y1 + 10, 24, 20);
          }
          if (crack > 0.3 && i % 2) {
            ctx.strokeStyle = '#c92a2a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo((x0 + x1) / 2 - 20, y1 + 6);
            ctx.lineTo((x0 + x1) / 2, y1 + 20);
            ctx.lineTo((x0 + x1) / 2 - 10, y0 - 4);
            ctx.stroke();
          }
        }
        if (on.has('damper')) {
          const topX = BX + ground + sway, topY = base - FLOORS * FH;
          ctx.strokeStyle = '#495057';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(topX, topY + 4);
          ctx.lineTo(topX - sway * 0.6, topY + 34);
          ctx.stroke();
          D.circle(ctx, topX - sway * 0.6, topY + 34, 12, '#fab005');
        }
        // 右边的信息
        D.text(ctx, `地震强度：${mag} 级`, 620, 60, { size: 22 });
        D.text(ctx, `预计晃动幅度：${Math.round(amp())}`, 620, 100, { size: 17, color: amp() > LIMIT ? '#c92a2a' : '#2b8a3e' });
        D.text(ctx, `安全线：${LIMIT}`, 620, 128, { size: 15, color: '#6f6a85' });
        MEASURES.forEach((m, i) => D.text(ctx, `${on.has(m[0]) ? '✅' : '⬜'} ${m[1]}`, 540, 180 + i * 30, { size: 16, align: 'left' }));
        if (result) D.text(ctx, result === 'ok' ? '🏢 安然无恙' : '💥 开裂了', 620, 300, { size: 22, color: result === 'ok' ? '#2b8a3e' : '#c92a2a' });
      });
      MEASURES.forEach(m => api.toggle(m[1], false, v => { if (v) on.add(m[0]); else on.delete(m[0]); result = null; api.note(`${m[1]}：${m[3]}。`); }));
      const r2 = api.row();
      api.slider('地震强度', 5, 9, 1, mag, v => { mag = v; result = null; }, v => v + ' 级', r2);
      api.button('🌋 开始地震', start, r2);
      api.note('👆 先不加任何措施，试试 6 级地震；再选择抗震方案，挑战 8 级。');
    },
  });
})();
