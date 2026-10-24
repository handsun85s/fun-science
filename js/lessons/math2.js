/* 数学魔法（第二组）：图形捉迷藏 → 青蛙跳数轴 → 面积与周长 → 掷骰子 → 勾股定理 */
(function () {
  'use strict';
  const { clamp } = Sci;
  const D = Sci.draw;
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  /* ================= 6. 图形捉迷藏 ================= */
  const KINDS = { tri: '三角形', circle: '圆形', rect: '长方形', square: '正方形' };
  // 先列小的，点的时候先检查小的（窗户在墙上面）
  const SHAPES = [
    { k: 'square', x: 258, y: 250, w: 50, h: 50, c: '#bfe3ff' },
    { k: 'square', x: 392, y: 250, w: 50, h: 50, c: '#bfe3ff' },
    { k: 'rect', x: 328, y: 290, w: 44, h: 80, c: '#b5651d' },
    { k: 'square', x: 92, y: 282, w: 40, h: 40, c: '#bfe3ff' },
    { k: 'circle', x: 78, y: 368, r: 18, c: '#333' },
    { k: 'circle', x: 162, y: 368, r: 18, c: '#333' },
    { k: 'rect', x: 588, y: 300, w: 24, h: 70, c: '#8d5a3b' },
    { k: 'tri', p: [[555, 255], [645, 255], [600, 180]], c: '#2f9e44' },
    { k: 'tri', p: [[540, 310], [660, 310], [600, 228]], c: '#37b24d' },
    { k: 'tri', p: [[222, 230], [478, 230], [350, 140]], c: '#e8590c' },
    { k: 'rect', x: 240, y: 230, w: 220, h: 140, c: '#ffd8a8' },
    { k: 'rect', x: 40, y: 320, w: 160, h: 46, c: '#4dabf7' },
    { k: 'circle', x: 690, y: 80, r: 42, c: '#ffd43b' },
    { k: 'circle', x: 130, y: 100, r: 32, c: '#ff6b9a' },
  ];
  const triHit = (p, [a, b, c]) => {
    const s = (u, v, w) => (u[0] - w[0]) * (v[1] - w[1]) - (v[0] - w[0]) * (u[1] - w[1]);
    const d1 = s(p, a, b), d2 = s(p, b, c), d3 = s(p, c, a);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
  const shapeHit = (s, q) => {
    if (s.k === 'circle') return Math.hypot(q.x - s.x, q.y - s.y) < s.r + 4;
    if (s.k === 'tri') return triHit([q.x, q.y], s.p);
    return q.x > s.x - 3 && q.x < s.x + s.w + 3 && q.y > s.y - 3 && q.y < s.y + s.h + 3;
  };

  Sci.register({
    id: 'shapes',
    subject: 'math',
    level: 1,
    emoji: '🔺',
    title: '图形捉迷藏',
    desc: '小房子、小车和大树里，藏着哪些图形？',
    intro: '我们身边到处都藏着图形！这幅画里的房子、小汽车、大树和太阳，都是用三角形、圆形、长方形和正方形拼起来的。先在下面选一种图形，再到画里把它们全都找出来吧！',
    goal: '把画里藏着的 14 个图形全部找出来',
    fact: '<p><b>三角形</b>：有 3 条边、3 个角。</p><p><b>长方形</b>：有 4 条边、4 个直角，对面的两条边一样长。</p><p><b>正方形</b>：4 条边<b>全都一样长</b>，4 个角都是直角。它其实是一种特别的长方形。</p><p><b>圆形</b>：没有边也没有角，圆圆的，能滚来滚去，所以车轮做成圆形。</p>',
    quiz: [
      { q: '有 3 条边、3 个角的图形是？', options: ['三角形', '正方形', '圆形'], answer: 0, explain: '“三角形”就是有三个角的图形。' },
      { q: '下面哪个图形没有角？', options: ['长方形', '圆形', '三角形'], answer: 1, explain: '圆形圆圆的，没有角。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let want = 'tri', t = 0;
      const found = new Set();
      const total = k => SHAPES.filter(s => s.k === k).length;
      const got = k => SHAPES.filter((s, i) => s.k === k && found.has(i)).length;

      api.pointer(st, {
        down(q) {
          const i = SHAPES.findIndex(s => shapeHit(s, q));
          if (i < 0) return;
          const s = SHAPES[i];
          if (found.has(i)) { api.note(`这个${KINDS[s.k]}已经找到啦！`); return; }
          if (s.k !== want) {
            Sci.sfx('bad');
            const more = s.k === 'square' && want === 'rect' ? '它 4 条边一样长，是正方形哦。' : s.k === 'rect' && want === 'square' ? '它的边有长有短，是长方形哦。' : '';
            api.note(`这是一个${KINDS[s.k]}，现在要找的是${KINDS[want]}。${more}`);
            return;
          }
          found.add(i);
          Sci.sfx('pop');
          const left = total(want) - got(want);
          api.note(left ? `找到一个${KINDS[want]}！还有 ${left} 个。` : `🎉 ${KINDS[want]}全找到啦！换一种图形接着找吧。`);
          if (found.size === SHAPES.length) {
            api.timeout(() => { api.note('🏆 14 个图形全部找到了，你是图形小侦探！'); api.goalDone(); }, 900);
          }
        },
      });

      function path(s) {
        ctx.beginPath();
        if (s.k === 'circle') ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        else if (s.k === 'tri') { s.p.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.closePath(); } else ctx.rect(s.x, s.y, s.w, s.h);
      }
      function render() {
        ctx.fillStyle = '#dff1ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#9ed36a';
        ctx.fillRect(0, 370, 800, 80);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(130, 132);
        ctx.quadraticCurveTo(140, 200, 120, 260);
        ctx.stroke();
        // 从大到小画，小的盖在上面
        for (let i = SHAPES.length - 1; i >= 0; i--) {
          const s = SHAPES[i];
          path(s);
          ctx.fillStyle = s.c;
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,.25)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        SHAPES.forEach((s, i) => {
          if (!found.has(i)) return;
          path(s);
          ctx.strokeStyle = '#e03131';
          ctx.lineWidth = 4 + Math.sin(t * 4) * 1;
          ctx.stroke();
        });
        D.rrect(ctx, 390, 14, 250, 76, 14);
        ctx.fillStyle = 'rgba(255,255,255,.88)';
        ctx.fill();
        Object.keys(KINDS).forEach((k, i) =>
          D.text(ctx, `${got(k) === total(k) ? '✅' : k === want ? '👉' : '⬜'} ${KINDS[k]} ${got(k)}/${total(k)}`, 405 + (i % 2) * 120, 38 + Math.floor(i / 2) * 28, { size: 16, align: 'left', color: k === want ? '#c0620a' : '#2b2840' }));
      }
      api.loop(dt => { t += dt; render(); });
      api.choice(Object.keys(KINDS).map(k => [k, { tri: '🔺 ', circle: '⚪ ', rect: '▬ ', square: '⬛ ' }[k] + KINDS[k]]), want, v => {
        want = v;
        api.note(`在画里找一找${KINDS[v]}，点一下它！`);
      });
      api.note('👆 先找三角形：在画里点一点，把三角形都找出来！');
    },
  });

  /* ================= 7. 青蛙跳数轴 ================= */
  Sci.register({
    id: 'numberline',
    subject: 'math',
    level: 2,
    emoji: '🐸',
    title: '青蛙跳数轴',
    desc: '加法往右跳，减法往左跳，跳过 10 也不怕',
    intro: '小青蛙住在一条“数轴”上，每跳一下走一格。做加法时它往右跳，做减法时它往左跳。先算一算青蛙最后会停在哪个数上，在数轴上点一下你的答案，再看青蛙跳过去对不对！',
    goal: '答对 5 道题',
    fact: '<p>数轴上的数从左到右<b>越来越大</b>。加几就往右跳几格，减几就往左跳几格。</p><p><b>凑十法</b>让跳过 10 变简单：8 + 5，先跳 2 格到 10，再跳 3 格，就是 13。13 − 6，先跳 3 格回到 10，再跳 3 格，就是 7。</p>',
    quiz: [
      { q: '9 + 6 = ?', options: ['14', '15', '16'], answer: 1, explain: '9 先跳 1 格到 10，再跳 5 格，是 15。' },
      { q: '青蛙在 12，往左跳 5 格，停在几？', options: ['7', '8', '17'], answer: 0, explain: '12 − 5：先跳 2 格到 10，再跳 3 格，是 7。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const Y = 320, X0 = 40, STEP = 36;
      const nx = n => X0 + n * STEP;
      let prob = null, frog = 0, hopK = 0, hopT = 0, phase = 'ask', guess = null, score = 0, hint = false;

      function newProb() {
        const plus = Math.random() < 0.5;
        let a, b;
        if (plus) { a = rint(4, 9); b = rint(Math.max(2, 11 - a), Math.min(9, 20 - a)); } else { a = rint(11, 18); b = rint(Math.max(2, a - 9), 9); }
        prob = { a, b, plus, ans: plus ? a + b : a - b };
        frog = a;
        hopK = 0;
        phase = 'ask';
        guess = null;
        api.note(`${a} ${plus ? '+' : '−'} ${b} = ？青蛙会停在哪里？在数轴上点一下你的答案。`);
      }
      api.pointer(st, {
        down(p) {
          if (phase !== 'ask' || Math.abs(p.y - Y) > 60) return;
          const n = Math.round((p.x - X0) / STEP);
          if (n < 0 || n > 20) return;
          guess = n;
          phase = 'hop';
          hopT = 0;
          Sci.sfx('click');
        },
      });
      function finish() {
        phase = 'result';
        if (guess === prob.ans) {
          score++;
          Sci.sfx('good');
          api.note(`✅ 对啦！${prob.a} ${prob.plus ? '+' : '−'} ${prob.b} = ${prob.ans}。（答对 ${score}/5）`);
          if (score === 5) api.goalDone();
        } else {
          Sci.sfx('bad');
          api.note(`青蛙停在了 ${prob.ans}，不是 ${guess} 哦。${prob.a} ${prob.plus ? '+' : '−'} ${prob.b} = ${prob.ans}。`);
        }
        api.timeout(newProb, 2600);
      }
      function render() {
        ctx.fillStyle = '#f0fbf2';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#b2e0ff';
        ctx.fillRect(0, Y + 14, 800, 450 - Y);
        // 数轴
        ctx.strokeStyle = '#2b2840';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(20, Y);
        ctx.lineTo(780, Y);
        ctx.stroke();
        for (let n = 0; n <= 20; n++) {
          const x = nx(n);
          D.circle(ctx, x, Y, n === 10 ? 9 : 6, n === 10 ? '#ff922b' : '#2f9e44');
          D.text(ctx, String(n), x, Y + 32, { size: n === 10 ? 20 : 17, color: n === 10 ? '#c0620a' : '#2b2840' });
          if (guess === n) D.text(ctx, '👆', x, Y + 62, { size: 22 });
        }
        if (!prob) return;
        const dir = prob.plus ? 1 : -1;
        // 已经跳过的弧线
        ctx.strokeStyle = '#7048e8';
        ctx.lineWidth = 2;
        for (let k = 0; k < hopK; k++) {
          const x1 = nx(prob.a + dir * k), x2 = nx(prob.a + dir * (k + 1));
          ctx.beginPath();
          ctx.moveTo(x1, Y - 8);
          ctx.quadraticCurveTo((x1 + x2) / 2, Y - 60, x2, Y - 8);
          ctx.stroke();
          D.text(ctx, String(k + 1), (x1 + x2) / 2, Y - 44, { size: 13, color: '#7048e8' });
        }
        // 青蛙
        let fx = nx(frog), fy = Y - 26;
        if (phase === 'hop' && hopK < prob.b) {
          const x1 = nx(prob.a + dir * hopK), x2 = nx(prob.a + dir * (hopK + 1));
          fx = x1 + (x2 - x1) * hopT;
          fy -= Math.sin(hopT * Math.PI) * 50;
        }
        D.emoji(ctx, '🐸', fx, fy, 44);
        const eq = `${prob.a} ${prob.plus ? '+' : '−'} ${prob.b} = ${phase === 'result' ? prob.ans : '？'}`;
        D.text(ctx, eq, 400, 70, { size: 48, color: '#2b2840' });
        if (hint) {
          const toTen = prob.plus ? 10 - prob.a : prob.a - 10;
          const rest = prob.b - toTen;
          const s = prob.plus ? `${prob.a} + ${toTen} + ${rest}：先跳 ${toTen} 格到 10，再跳 ${rest} 格` : `${prob.a} − ${toTen} − ${rest}：先跳 ${toTen} 格回到 10，再跳 ${rest} 格`;
          D.text(ctx, '💡 凑十法：' + s, 400, 130, { size: 18, color: '#7048e8', maxW: 760 });
        }
        D.text(ctx, `答对 ${score} / 5`, 780, 26, { size: 18, align: 'right', color: '#2f9e44' });
      }
      api.loop(dt => {
        if (phase === 'hop') {
          hopT += dt * 2.6;
          if (hopT >= 1) {
            hopT = 0;
            hopK++;
            frog = prob.a + (prob.plus ? 1 : -1) * hopK;
            Sci.sfx('tick');
            if (hopK >= prob.b) finish();
          }
        }
        render();
      });
      api.toggle('💡 凑十法提示', false, v => { hint = v; });
      api.button('⏭️ 换一题', () => { if (phase !== 'hop') newProb(); });
      newProb();
    },
  });

  /* ================= 8. 面积与周长 ================= */
  const AREA_TASKS = [
    '画一个面积是 12 格的长方形',
    '画一个周长是 16 的长方形',
    '面积是 16 格，周长最短的长方形',
    '周长是 20，面积最大的长方形',
  ];

  Sci.register({
    id: 'area',
    subject: 'math',
    level: 3,
    emoji: '📐',
    title: '面积与周长',
    desc: '画长方形，比一比面积和周长',
    intro: '面积是一个图形“占了多大地方”，周长是绕着它“走一圈有多长”。在方格纸上按住拖动，就能画出一个长方形。看看它的面积和周长是多少，再完成 4 个小挑战。有个挑战很考验脑筋哦！',
    goal: '完成 4 个画长方形的挑战',
    fact: '<p><b>面积</b>：图形里面有多少个小方格。长方形的面积 = <b>长 × 宽</b>。</p><p><b>周长</b>：沿着图形的边走一圈的长度。长方形的周长 = <b>（长 + 宽）× 2</b>。</p><p>有趣的规律：面积一样的长方形，<b>越接近正方形，周长越短</b>；周长一样的长方形，<b>正方形的面积最大</b>。所以很多粮仓、帐篷都做得“方方圆圆”的，用同样多的材料，装的东西更多！</p>',
    quiz: [
      { q: '长 5 格、宽 3 格的长方形，面积是多少？', options: ['8 格', '15 格', '16 格'], answer: 1, explain: '面积 = 长 × 宽 = 5 × 3 = 15。' },
      { q: '这个长方形的周长是多少？', options: ['8', '15', '16'], answer: 2, explain: '周长 =（5 + 3）× 2 = 16。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const GX = 46, GY = 70, C = 36, COLS = 12, ROWS = 9;
      let a = null, b = null, task = 0, count = true;
      const done = new Set();
      const cell = p => [clamp(Math.floor((p.x - GX) / C), 0, COLS - 1), clamp(Math.floor((p.y - GY) / C), 0, ROWS - 1)];
      const inGrid = p => p.x > GX - 10 && p.x < GX + COLS * C + 10 && p.y > GY - 10 && p.y < GY + ROWS * C + 10;
      const dims = () => (a && b ? [Math.abs(b[0] - a[0]) + 1, Math.abs(b[1] - a[1]) + 1] : [0, 0]);

      function check() {
        const [w, h] = dims(), A = w * h, P = (w + h) * 2;
        const ok = [A === 12, P === 16, A === 16 && P === 16, P === 20 && A === 25][task];
        if (ok) {
          if (!done.has(task)) { done.add(task); Sci.sfx('star'); }
          api.note(`✅ 挑战 ${task + 1} 完成！长 ${w}、宽 ${h}，面积 ${A}，周长 ${P}。` + (done.size < 4 ? '换下一个挑战吧。' : ''));
          if (done.size === 4) api.goalDone();
        } else if (task === 2 && A === 16) api.note(`面积是 16 了！周长是 ${P}，还能更短吗？试试别的长和宽。`);
        else if (task === 3 && P === 20) api.note(`周长是 20 了！面积是 ${A}，还能更大吗？`);
        else api.note(`长 ${w}、宽 ${h}：面积 ${A}，周长 ${P}。`);
      }
      api.pointer(st, {
        down(p) { if (inGrid(p)) { a = cell(p); b = a; } },
        move(p, active) { if (active && a) b = cell(p); },
        up() { if (a) check(); },
      });

      function render() {
        ctx.fillStyle = '#fbfaff';
        ctx.fillRect(0, 0, 800, 450);
        if (a && b) {
          const x0 = Math.min(a[0], b[0]), y0 = Math.min(a[1], b[1]), [w, h] = dims();
          ctx.fillStyle = 'rgba(61,139,255,.22)';
          ctx.fillRect(GX + x0 * C, GY + y0 * C, w * C, h * C);
          if (count) {
            let k = 0;
            for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) D.text(ctx, String(++k), GX + (x0 + i + 0.5) * C, GY + (y0 + j + 0.5) * C, { size: 13, color: '#3d6fd0', weight: 'normal' });
          }
          ctx.strokeStyle = '#ff7a00';
          ctx.lineWidth = 5;
          ctx.strokeRect(GX + x0 * C, GY + y0 * C, w * C, h * C);
          D.text(ctx, `长 ${w}`, GX + (x0 + w / 2) * C, GY + y0 * C - 14, { size: 15, color: '#c0620a' });
          D.text(ctx, `宽 ${h}`, GX + x0 * C - 22, GY + (y0 + h / 2) * C, { size: 15, color: '#c0620a' });
        }
        ctx.strokeStyle = '#c8c3e0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= COLS; i++) { ctx.beginPath(); ctx.moveTo(GX + i * C, GY); ctx.lineTo(GX + i * C, GY + ROWS * C); ctx.stroke(); }
        for (let j = 0; j <= ROWS; j++) { ctx.beginPath(); ctx.moveTo(GX, GY + j * C); ctx.lineTo(GX + COLS * C, GY + j * C); ctx.stroke(); }
        D.text(ctx, '👆 在方格纸上按住拖动，画一个长方形', GX, 30, { size: 16, align: 'left', color: '#6f6a85' });

        const [w, h] = dims();
        const px = 488;
        D.rrect(ctx, px, 60, 300, 170, 14);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#e4defa';
        ctx.lineWidth = 2;
        ctx.stroke();
        D.text(ctx, `面积 = ${w} × ${h} = ${w * h} 格`, px + 150, 100, { size: 22, color: '#3d6fd0' });
        D.text(ctx, `周长 =（${w} + ${h}）× 2 = ${(w + h) * 2}`, px + 150, 145, { size: 22, color: '#c0620a' });
        D.text(ctx, '面积：里面有几个格子', px + 150, 185, { size: 14, color: '#6f6a85', weight: 'normal' });
        D.text(ctx, '周长：绕着边走一圈', px + 150, 207, { size: 14, color: '#6f6a85', weight: 'normal' });
        AREA_TASKS.forEach((s, i) => D.text(ctx, `${done.has(i) ? '✅' : i === task ? '👉' : '⬜'} ${i + 1}. ${s}`, px, 262 + i * 30, { size: 15, align: 'left', color: i === task ? '#2b2840' : '#8b87a0', maxW: 300 }));
      }
      api.loop(render);
      api.choice(AREA_TASKS.map((_, i) => [i, `挑战 ${i + 1}`]), 0, v => {
        task = v;
        api.note('挑战 ' + (v + 1) + '：' + AREA_TASKS[v]);
      });
      api.toggle('🔢 数格子', true, v => { count = v; });
      api.note('挑战 1：' + AREA_TASKS[0] + '。在方格纸上按住拖动来画。');
    },
  });

  /* ================= 9. 掷骰子的秘密 ================= */
  const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };

  Sci.register({
    id: 'dice',
    subject: 'math',
    level: 4,
    emoji: '🎲',
    title: '掷骰子的秘密',
    desc: '运气里也藏着规律：可能性有多大？',
    intro: '掷一个骰子，1 到 6 哪个数最容易出现？如果掷两个骰子，把点数加起来，哪个和最容易出现呢？先猜一猜，再掷很多很多次，用柱状图看看答案。掷得越多，规律越清楚！',
    goal: '一个骰子掷 60 次以上，两个骰子掷 200 次以上',
    fact: '<p>掷一个骰子，6 个面出现的<b>可能性一样大</b>，都是 <b>1/6</b>。掷的次数少时，结果可能差别很大；掷得越多，每个数出现的次数就越接近一样多。</p><p>掷两个骰子求和就不一样了：和是 7 有 <b>6 种</b>组合（1+6、2+5、3+4、4+3、5+2、6+1），而和是 2 只有 1+1 <b>1 种</b>。一共有 6 × 6 = 36 种组合，所以 7 出现的可能性是 6/36 = 1/6，2 和 12 都只有 1/36。</p><p>📊 研究“可能性有多大”的数学叫做<b>概率</b>，天气预报里的“降水概率 80%”就是它。</p>',
    quiz: [
      { q: '掷一个骰子，掷出 6 的可能性是多少？', options: ['1/6', '1/2', '1/3'], answer: 0, explain: '6 个面一样容易出现，每个是 1/6。' },
      { q: '掷两个骰子把点数相加，最容易出现的和是几？', options: ['2', '7', '12'], answer: 1, explain: '和为 7 的组合最多，有 6 种。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let mode = 'one', faces = [3, 4], spin = 0, theory = false, said = false;
      const counts = { one: new Array(13).fill(0), two: new Array(13).fill(0) };
      const total = m => counts[m].reduce((s, c) => s + c, 0);
      const roll = () => 1 + Math.floor(Math.random() * 6);

      function throwMany(n) {
        for (let i = 0; i < n; i++) {
          const a = roll(), b = roll();
          faces = [a, b];
          counts[mode][mode === 'one' ? a : a + b]++;
        }
        Sci.sfx(n > 1 ? 'whoosh' : 'clack');
        check();
      }
      function check() {
        const one = total('one'), two = total('two');
        if (mode === 'two' && two >= 200 && !said) {
          said = true;
          api.note('📊 看柱状图！中间的 7 最高，两边的 2 和 12 最矮——组合越多，越容易出现。');
        } else if (mode === 'one') api.note(`一个骰子已经掷了 ${one} 次${one >= 60 ? '，6 根柱子差不多高了吧？' : '，继续掷！'}`);
        else if (!said) api.note(`两个骰子已经掷了 ${two} 次，掷到 200 次看看规律。`);
        if (one >= 60 && two >= 200) api.goalDone();
      }
      function die(x, y, n, s) {
        D.rrect(ctx, x - s / 2, y - s / 2, s, s, s * 0.18);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#2b2840';
        ctx.lineWidth = 3;
        ctx.stroke();
        PIPS[n].forEach(([u, v]) => D.circle(ctx, x + u * s * 0.27, y + v * s * 0.27, s * 0.08, n === 1 ? '#e03131' : '#2b2840'));
      }
      function render() {
        ctx.fillStyle = '#f5f8ff';
        ctx.fillRect(0, 0, 800, 450);
        const f = spin > 0 ? [roll(), roll()] : faces;
        const jig = spin > 0 ? Math.sin(spin * 40) * 8 : 0;
        die(80, 90 + jig, f[0], 70);
        if (mode === 'two') {
          die(170, 90 - jig, f[1], 70);
          D.text(ctx, `${f[0]} + ${f[1]} = ${f[0] + f[1]}`, 125, 160, { size: 20 });
        } else D.text(ctx, `掷出 ${f[0]}`, 80, 160, { size: 20 });
        const n = total(mode);
        D.text(ctx, `一共掷了 ${n} 次`, 125, 200, { size: 17, color: '#6f6a85' });
        // 柱状图
        const keys = mode === 'one' ? [1, 2, 3, 4, 5, 6] : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const X = 270, W = 510, BASE = 400, TOP = 50;
        const bw = W / keys.length;
        const maxP = mode === 'one' ? 0.3 : 0.25;
        ctx.strokeStyle = '#2b2840';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(X, TOP);
        ctx.lineTo(X, BASE);
        ctx.lineTo(X + W, BASE);
        ctx.stroke();
        keys.forEach((k, i) => {
          const c = counts[mode][k], p = n ? c / n : 0;
          const h = Math.min(1, p / maxP) * (BASE - TOP);
          const x = X + i * bw + bw * 0.15;
          ctx.fillStyle = mode === 'two' && k === 7 ? '#ff922b' : '#4c8dff';
          ctx.fillRect(x, BASE - h, bw * 0.7, h);
          D.text(ctx, String(k), x + bw * 0.35, BASE + 18, { size: 16 });
          if (n) D.text(ctx, Math.round(p * 100) + '%', x + bw * 0.35, BASE - h - 12, { size: 12, color: '#6f6a85', weight: 'normal' });
          if (theory) {
            const tp = mode === 'one' ? 1 / 6 : (6 - Math.abs(7 - k)) / 36;
            const ty = BASE - tp / maxP * (BASE - TOP);
            ctx.save();
            ctx.setLineDash([4, 3]);
            ctx.strokeStyle = '#e03131';
            ctx.beginPath();
            ctx.moveTo(x - 4, ty);
            ctx.lineTo(x + bw * 0.7 + 4, ty);
            ctx.stroke();
            ctx.restore();
          }
        });
        D.text(ctx, mode === 'one' ? '每个点数出现的次数占百分之几' : '每个“和”出现的次数占百分之几', X + W / 2, 28, { size: 16, color: '#6f6a85' });
        if (theory) D.text(ctx, '红色虚线：理论上的可能性', 125, 240, { size: 14, color: '#e03131', weight: 'normal' });
      }
      api.loop(dt => {
        if (spin > 0) {
          spin -= dt;
          if (spin <= 0) throwMany(1);
        }
        render();
      });
      api.choice([['one', '🎲 一个骰子'], ['two', '🎲🎲 两个骰子相加']], mode, v => {
        mode = v;
        api.note(v === 'one' ? '一个骰子：猜猜哪个点数最容易出现？' : '两个骰子相加：和可能是 2 到 12，猜猜哪个最常见？');
      });
      const row2 = api.row();
      api.button('掷 1 次', () => { if (spin <= 0) spin = 0.5; }, row2);
      api.button('掷 10 次', () => throwMany(10), row2);
      api.button('掷 100 次', () => throwMany(100), row2);
      api.toggle('📏 理论值', false, v => { theory = v; }, row2);
      api.button('🧹 清空', () => { counts[mode].fill(0); said = false; }, row2);
      api.note('👆 先猜一猜，再点“掷 10 次”“掷 100 次”，看看柱状图。');
    },
  });

  /* ================= 10. 勾股定理 ================= */
  Sci.register({
    id: 'pythagoras',
    subject: 'math',
    level: 5,
    emoji: '📏',
    title: '勾股定理',
    desc: '直角三角形三条边之间的神奇关系',
    intro: '两千多年前，中国古人就发现了“勾三股四弦五”：直角三角形的两条短边（勾和股）是 3 和 4，最长的那条边（弦）就正好是 5。在三条边上各画一个正方形，比一比它们的面积，你会发现一个永远成立的秘密！',
    goal: '找出两个三条边都是整数的直角三角形',
    fact: '<p>直角三角形里，两条直角边叫<b>勾</b>和<b>股</b>，最长的斜边叫<b>弦</b>。</p><p><b>勾股定理</b>：勾² + 股² = 弦²。也就是说，两条短边上的正方形面积加起来，正好等于长边上正方形的面积。比如 3² + 4² = 9 + 16 = 25 = 5²。</p><p>📜 中国古书《周髀算经》里就记载了“勾三股四弦五”，所以它叫勾股定理；西方叫它毕达哥拉斯定理。木匠和建筑工人用 3、4、5 的绳子就能拉出一个标准的直角！</p>',
    quiz: [
      { q: '直角三角形的两条直角边是 6 和 8，斜边是多少？', options: ['10', '12', '14'], answer: 0, explain: '6² + 8² = 36 + 64 = 100 = 10²。' },
      { q: '勾股定理适用于哪种三角形？', options: ['直角三角形', '所有三角形'], answer: 0, explain: '只有直角三角形才满足勾² + 股² = 弦²。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const OX = 250, OY = 300, S = 18;
      let a = 2, b = 2, grid = true;
      const found = new Set();

      function check() {
        const c2 = a * a + b * b, c = Math.sqrt(c2);
        if (Number.isInteger(c)) {
          const key = [Math.min(a, b), Math.max(a, b), c].join('-');
          if (!found.has(key)) { found.add(key); Sci.sfx('star'); }
          api.note(`✨ ${a}² + ${b}² = ${a * a} + ${b * b} = ${c2} = ${c}²，三条边都是整数！（找到 ${found.size}/2）`);
          if (found.size >= 2) api.goalDone();
        } else api.note(`${a}² + ${b}² = ${c2}，弦长约 ${c.toFixed(2)}，不是整数。再试试别的边长。`);
      }
      function square(pts, fill, n) {
        ctx.beginPath();
        pts.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.35)';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (!grid || !n) return;
        // 画出每个小格子（沿着正方形两条边的方向，每隔一格画一条线）
        const [p0, p1, , p3] = pts;
        const u = [(p1[0] - p0[0]) / n, (p1[1] - p0[1]) / n], v = [(p3[0] - p0[0]) / n, (p3[1] - p0[1]) / n];
        ctx.strokeStyle = 'rgba(255,255,255,.75)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 1; i < n; i++) {
          ctx.moveTo(p0[0] + u[0] * i, p0[1] + u[1] * i);
          ctx.lineTo(p3[0] + u[0] * i, p3[1] + u[1] * i);
          ctx.moveTo(p0[0] + v[0] * i, p0[1] + v[1] * i);
          ctx.lineTo(p1[0] + v[0] * i, p1[1] + v[1] * i);
        }
        ctx.stroke();
      }
      function render() {
        ctx.fillStyle = '#fbfaff';
        ctx.fillRect(0, 0, 800, 450);
        const A = a * S, B = b * S;
        const O = [OX, OY], P = [OX, OY - B], Q = [OX + A, OY];
        const c = Math.sqrt(a * a + b * b);
        square([O, Q, [OX + A, OY + A], [OX, OY + A]], '#74c0fc', a);
        square([O, P, [OX - B, OY - B], [OX - B, OY]], '#ffa94d', b);
        const ci = Number.isInteger(c) ? c : 0;
        square([P, Q, [Q[0] + B, Q[1] - A], [P[0] + B, P[1] - A]], ci ? '#b197fc' : '#d0bfff', ci);
        // 三角形
        ctx.beginPath();
        ctx.moveTo(O[0], O[1]);
        ctx.lineTo(P[0], P[1]);
        ctx.lineTo(Q[0], Q[1]);
        ctx.closePath();
        ctx.fillStyle = '#fff3bf';
        ctx.fill();
        ctx.strokeStyle = '#2b2840';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeRect(OX, OY - 12, 12, 12);
        D.text(ctx, '勾 ' + a, OX + A / 2, OY + A / 2, { size: 16, color: '#0b4f8a' });
        D.text(ctx, '股 ' + b, OX - B / 2, OY - B / 2, { size: 16, color: '#8a4500' });
        D.text(ctx, '弦', (P[0] + Q[0]) / 2 + B / 2, (P[1] + Q[1]) / 2 - A / 2, { size: 16, color: '#4a2aa0' });
        // 算式
        const x = 600;
        D.rrect(ctx, x - 20, 40, 210, 250, 14);
        ctx.fillStyle = '#fff';
        ctx.fill();
        D.text(ctx, `勾² = ${a}×${a} = ${a * a}`, x, 80, { size: 18, align: 'left', color: '#1c7ed6' });
        D.text(ctx, `股² = ${b}×${b} = ${b * b}`, x, 115, { size: 18, align: 'left', color: '#e8590c' });
        D.text(ctx, `勾² + 股² = ${a * a + b * b}`, x, 160, { size: 18, align: 'left' });
        D.text(ctx, `弦² = ${a * a + b * b}`, x, 195, { size: 18, align: 'left', color: '#7048e8' });
        D.text(ctx, `弦 ${Number.isInteger(c) ? '= ' + c : '≈ ' + c.toFixed(2)}`, x, 235, { size: 22, align: 'left', color: '#7048e8' });
        D.text(ctx, `找到整数组合 ${found.size}/2`, x, 270, { size: 14, align: 'left', color: '#6f6a85', weight: 'normal' });
        [...found].forEach((k, i) => D.text(ctx, '✅ ' + k.split('-').join('、'), x, 320 + i * 28, { size: 16, align: 'left', color: '#2f9e44' }));
      }
      api.loop(render);
      api.slider('勾（横边）', 1, 8, 1, a, v => { a = v; check(); });
      api.slider('股（竖边）', 1, 8, 1, b, v => { b = v; check(); });
      api.toggle('🔲 显示小方格', true, v => { grid = v; });
      api.note('👆 拖动滑块改变两条直角边，看看三个正方形的面积有什么关系。');
    },
  });
})();
