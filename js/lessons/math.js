/* 数学魔法：对称画板 → 乘法方阵 → 认识钟表 */
(function () {
  'use strict';
  const { clamp, lerp } = Sci;
  const D = Sci.draw;

  /* ================= 1. 对称魔法画板 ================= */
  const BUTTERFLY = [
    [[0, -70], [0, 90]],
    [[0, -70], [-25, -112], [-40, -120]],
    [[-4, -40], [-50, -110], [-120, -125], [-160, -80], [-140, -20], [-70, 5], [-4, 0]],
    [[-4, 15], [-70, 25], [-125, 70], [-110, 125], [-55, 120], [-4, 60]],
    [[-70, -60], [-100, -78], [-112, -50], [-82, -38], [-70, -60]],
  ];

  Sci.register({
    id: 'symmetry',
    subject: 'math',
    level: 1,
    emoji: '🦋',
    title: '对称魔法画板',
    desc: '画一半，另一半自己变出来',
    intro: '蝴蝶的两只翅膀长得一模一样，这就叫“对称”。这块魔法画板有一条神奇的虚线，叫做“对称轴”。你在一边画画，另一边就会自动变出一模一样的图案！快来试试，还可以换成“雪花”模式哦。',
    goal: '用魔法画板画一幅对称的画',
    fact: '<p>沿着一条线对折，两边能<b>完全重合</b>的图形，叫做<b>轴对称图形</b>，那条线叫做<b>对称轴</b>。</p><p>生活里到处都是对称：🦋 蝴蝶、🍁 树叶、❄️ 雪花、人的脸，还有很多汉字，比如“木”“中”“田”。</p><p>雪花更神奇，它有 6 个一模一样的“花瓣”，转一转也能和原来重合！</p>',
    quiz: [
      { q: '下面哪个汉字是左右对称的？', options: ['木', '他', '和'], answer: 0, explain: '“木”沿着中间竖着对折，两边完全一样。' },
      { q: '沿着对称轴对折，两边会怎样？', options: ['完全重合', '一边大一边小'], answer: 0, explain: '对称图形对折后两边能完全重合。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const CX = 400, CY = 225;
      let mode = 'lr', color = 'rainbow', size = 8, hue = 0, drawn = 0, last = null, demo = [], goalSent = false;

      function transforms(x, y) {
        if (mode === 'lr') return [[x, y], [-x, y]];
        if (mode === 'four') return [[x, y], [-x, y], [x, -y], [-x, -y]];
        const out = [];
        for (let k = 0; k < 6; k++) {
          const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a);
          out.push([x * c - y * s, x * s + y * c], [x * c + y * s, x * s - y * c]);
        }
        return out;
      }
      function seg(a, b) {
        ctx.strokeStyle = color === 'rainbow' ? `hsl(${hue % 360},90%,55%)` : color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const A = transforms(a.x - CX, a.y - CY), B = transforms(b.x - CX, b.y - CY);
        ctx.beginPath();
        for (let i = 0; i < A.length; i++) {
          ctx.moveTo(CX + A[i][0], CY + A[i][1]);
          ctx.lineTo(CX + B[i][0], CY + B[i][1]);
        }
        ctx.stroke();
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        hue += d * 0.6;
        drawn += d;
        if (drawn > 1200 && !goalSent) {
          goalSent = true;
          api.note('🎉 哇，好漂亮的对称图案！你看，两边是不是一模一样？');
          api.goalDone();
        }
      }
      function guides() {
        ctx.save();
        ctx.strokeStyle = 'rgba(120,120,160,0.35)';
        ctx.setLineDash([8, 8]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (mode !== 'snow') { ctx.moveTo(CX, 0); ctx.lineTo(CX, 450); }
        if (mode === 'four') { ctx.moveTo(0, CY); ctx.lineTo(800, CY); }
        if (mode === 'snow') {
          for (let k = 0; k < 6; k++) {
            const a = k * Math.PI / 6;
            ctx.moveTo(CX - Math.cos(a) * 500, CY - Math.sin(a) * 500);
            ctx.lineTo(CX + Math.cos(a) * 500, CY + Math.sin(a) * 500);
          }
        }
        ctx.stroke();
        ctx.restore();
        D.text(ctx, '对称轴', CX + 36, 16, { size: 14, color: '#9a98b0', weight: 'normal' });
      }
      function clearBoard() {
        demo = [];
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 800, 450);
        guides();
      }

      api.pointer(st, {
        down(p) { demo = []; last = p; seg(p, { x: p.x + 0.1, y: p.y }); },
        move(p, active) { if (active && last) { seg(last, p); last = p; } },
        up() { last = null; },
      });

      // 示范：只画左半只蝴蝶，右半只由魔法变出来
      function playDemo() {
        modeChoice.set('lr');
        mode = 'lr';
        clearBoard();
        const pts = [];
        BUTTERFLY.forEach(line => {
          for (let i = 0; i < line.length - 1; i++) {
            const [x1, y1] = line[i], [x2, y2] = line[i + 1];
            const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 6));
            for (let k = 0; k < n; k++) {
              pts.push([{ x: CX + x1 + (x2 - x1) * k / n, y: CY + y1 + (y2 - y1) * k / n }, { x: CX + x1 + (x2 - x1) * (k + 1) / n, y: CY + y1 + (y2 - y1) * (k + 1) / n }]);
            }
          }
        });
        demo = pts;
        api.note('看！小博士只画了左边半只蝴蝶，右边那半只是对称魔法变出来的。');
      }
      api.loop(() => {
        for (let k = 0; k < 3 && demo.length; k++) {
          const [a, b] = demo.shift();
          seg(a, b);
        }
      });

      const modeChoice = api.choice([['lr', '🦋 左右对称'], ['four', '🀄 上下左右'], ['snow', '❄️ 雪花']], mode, v => {
        mode = v;
        clearBoard();
        api.note(v === 'lr' ? '在虚线的一边画，另一边会变出一样的！' : v === 'four' ? '现在有两条对称轴，一笔变四笔！' : '雪花模式：一笔变出 12 笔，画出你自己的雪花吧！');
      });
      const row2 = api.row();
      api.choice([['rainbow', '🌈'], ['#ff4d6d', '🔴'], ['#ff9f1c', '🟠'], ['#2ec4b6', '🟢'], ['#3a86ff', '🔵'], ['#8338ec', '🟣'], ['#222', '⚫']], color, v => { color = v; }, row2);
      api.slider('笔的粗细', 2, 24, 1, size, v => { size = v; }, v => v + ' 号', row2);
      const row3 = api.row();
      api.button('🦋 看示范', playDemo, row3);
      api.button('🧽 擦干净', clearBoard, row3);
      // 发布成网页链接后（在框架里）浏览器不允许下载，就不显示这个按钮
      if (window.self === window.top) {
        api.button('💾 保存图画', () => {
          const a = document.createElement('a');
          a.download = '我的对称画.png';
          a.href = st.cv.toDataURL('image/png');
          a.click();
        }, row3);
      }
      clearBoard();
      api.note('✏️ 按住画面，在虚线的一边画画吧！');
    },
  });

  /* ================= 2. 乘法排排坐 ================= */
  function koujue(a, b) {
    const x = Math.min(a, b), y = Math.max(a, b), p = x * y;
    let r;
    if (p < 10) r = '得' + Sci.cn(p);
    else if (p === 10) r = '一十';
    else r = Sci.cn(p);
    return Sci.cn(x) + Sci.cn(y) + r;
  }

  Sci.register({
    id: 'multiply',
    subject: 'math',
    level: 2,
    emoji: '🍎',
    title: '乘法排排坐',
    desc: '把水果排成方阵，看懂乘法的秘密',
    intro: '老师说“3 乘 4”，到底是什么意思呢？我们把苹果排成整整齐齐的方阵就明白啦：3 行，每行 4 个，就是 3 个 4 相加。拖动滑块改变行数和每行的个数，再试试“转一转”，会有神奇的发现！',
    goal: '找出两种不同的排法，让水果正好是 12 个',
    fact: '<p><b>乘法就是求几个相同的数加起来是多少。</b>3 × 4 就是 3 个 4 相加：4 + 4 + 4 = 12。</p><p>把方阵转一转，3 行 4 个就变成了 4 行 3 个，总数一点也没变，所以 <b>3 × 4 = 4 × 3</b>。</p><p>同一个得数可以有好几种排法：12 = 2 × 6 = 3 × 4 = 4 × 3 = 6 × 2。背口诀就是为了算得更快！</p>',
    quiz: [
      { q: '5 行，每行 2 个苹果，一共几个？', options: ['7 个', '10 个', '12 个'], answer: 1, explain: '5 个 2 相加是 10，5 × 2 = 10，口诀“二五一十”。' },
      { q: '3 × 4 和 4 × 3 的得数一样吗？', options: ['一样', '不一样'], answer: 0, explain: '方阵转一转，个数不变，都是 12。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const AREA = { x: 20, y: 25, w: 500, h: 400 };
      let rows = 3, cols = 4, fruit = '🍎', shown = 0, rot = 0, rotating = false, count = -1, countT = 0;
      const found12 = new Set();
      const layout = (r, c) => {
        const cell = Math.min(AREA.w / c, AREA.h / r, 64);
        return { cell, ox: AREA.x + (AREA.w - cell * c) / 2, oy: AREA.y + (AREA.h - cell * r) / 2 };
      };

      function check12() {
        if (rows * cols !== 12) return;
        const key = rows + '×' + cols;
        if (found12.has(key)) return;
        found12.add(key);
        if (found12.size === 1) api.note(`👍 找到了！${rows} × ${cols} = 12。还能怎么排出 12 个呢？`);
        else { api.note(`🎉 又找到一种：${rows} × ${cols} = 12！同一个得数，可以有不同的排法。`); api.goalDone(); }
      }
      function setSize(r, c, keep) {
        rows = r;
        cols = c;
        count = -1;
        if (!keep) shown = 0;
        rowSlider.set(r);
        colSlider.set(c);
        check12();
      }

      function render(dt) {
        ctx.fillStyle = '#f4f8ff';
        ctx.fillRect(0, 0, 800, 450);
        const { cell, ox, oy } = layout(rows, cols);
        const total = rows * cols;
        ctx.save();
        if (rot > 0) {
          const gx = ox + cell * cols / 2, gy = oy + cell * rows / 2;
          ctx.translate(gx, gy);
          ctx.rotate(rot * Math.PI / 2);
          ctx.translate(-gx, -gy);
        }
        // 数数时给每一行加个底色
        for (let r = 0; r < rows; r++) {
          if (count >= r) {
            D.rrect(ctx, ox - 4, oy + r * cell + 2, cell * cols + 8, cell - 4, 12);
            ctx.fillStyle = r === count ? 'rgba(255,200,60,.45)' : 'rgba(255,200,60,.18)';
            ctx.fill();
          }
        }
        for (let i = 0; i < Math.floor(shown) && i < total; i++) {
          const r = Math.floor(i / cols), c = i % cols;
          const k = clamp((shown - i) * 3, 0, 1);
          const pop = k < 1 ? 0.4 + k * 0.8 - Math.max(0, k - 0.75) * 0.8 : 1;
          D.emoji(ctx, fruit, ox + c * cell + cell / 2, oy + r * cell + cell / 2, cell * 0.78 * pop);
        }
        for (let r = 0; r <= count && r < rows; r++) {
          D.text(ctx, String((r + 1) * cols), ox + cell * cols + 22, oy + r * cell + cell / 2, { size: 18, color: '#d97706' });
        }
        ctx.restore();

        // 右边的算式板
        D.rrect(ctx, 545, 25, 235, 400, 20);
        ctx.fillStyle = '#fff';
        ctx.fill();
        const p = rows * cols;
        D.text(ctx, `${rows} 行，每行 ${cols} 个`, 662, 65, { size: 22 });
        D.text(ctx, `就是 ${rows} 个 ${cols} 相加：`, 662, 110, { size: 17, color: '#6f6a85', weight: 'normal' });
        const add = rows <= 6 ? Array(rows).fill(cols).join('+') + ' = ' + p : `${cols}+${cols}+…+${cols} = ${p}`;
        D.text(ctx, add, 662, 148, { size: 24, maxW: 210, color: '#2b2840' });
        D.text(ctx, '写成乘法：', 662, 205, { size: 17, color: '#6f6a85', weight: 'normal' });
        D.text(ctx, `${rows} × ${cols} = ${p}`, 662, 250, { size: 42, color: '#3d8bff', maxW: 215 });
        D.rrect(ctx, 575, 300, 175, 56, 16);
        ctx.fillStyle = '#fff3c4';
        ctx.fill();
        D.text(ctx, '口诀：' + koujue(rows, cols), 662, 328, { size: 22, color: '#9a6400', maxW: 165 });
        D.text(ctx, `已找到 12 的排法：${found12.size} 种`, 662, 392, { size: 15, color: '#8b87a0', weight: 'normal' });
      }

      api.loop(dt => {
        const total = rows * cols;
        if (shown < total) {
          const before = Math.floor(shown);
          shown = Math.min(total, shown + dt * Math.max(10, total / 2));
          if (Math.floor(shown) > before) Sci.tone(380 + Math.floor(shown) * 12, 0.05, { type: 'triangle', vol: 0.05 });
        }
        if (rotating) {
          rot = Math.min(1, rot + dt / 0.7);
          if (rot >= 1) {
            rotating = false;
            rot = 0;
            const r = rows;
            setSize(cols, r, true);
            shown = rows * cols;
            api.note(`转了一下，变成 ${rows} 行，每行 ${cols} 个。${rows} × ${cols} = ${rows * cols}，和原来一样多！`);
          }
        }
        if (count >= 0 && count < rows) {
          countT += dt;
          if (countT > 0.7) {
            countT = 0;
            count++;
            if (count < rows) Sci.tone(440 + count * 60, 0.12, { type: 'triangle' });
            else {
              count = rows - 1;
              const s = Array(rows).fill(cols).join(' + ');
              api.note(`${s} = ${rows * cols}，所以 ${rows} × ${cols} = ${rows * cols}！`);
              Sci.sfx('good');
              count = rows; // 结束，保留所有高亮
            }
          }
        }
        render(dt);
      });

      const rowSlider = api.slider('几行', 1, 9, 1, rows, v => setSize(v, cols), v => v + ' 行');
      const colSlider = api.slider('每行几个', 1, 9, 1, cols, v => setSize(rows, v), v => v + ' 个');
      const row2 = api.row();
      api.choice([['🍎', '🍎'], ['🍓', '🍓'], ['🐟', '🐟'], ['⭐', '⭐'], ['🚗', '🚗']], fruit, v => { fruit = v; }, row2);
      api.button('🔄 转一转', () => {
        if (rotating) return;
        count = -1;
        shown = rows * cols;
        rotating = true;
        Sci.sfx('whoosh');
      }, row2);
      api.button('👆 一行一行数', () => {
        shown = rows * cols;
        count = 0;
        countT = 0;
        Sci.tone(440, 0.12, { type: 'triangle' });
      }, row2);
      api.note('拖动滑块，把水果排成方阵吧！试试看怎样排出 12 个？');
    },
  });

  /* ================= 3. 认识钟表 ================= */
  Sci.register({
    id: 'clock',
    subject: 'math',
    level: 3,
    emoji: '🕒',
    title: '认识钟表',
    desc: '拨一拨分针，学会看时间',
    intro: '钟面上有两根针：又短又粗的是时针，又细又长的红色指针是分针。用手指拖着分针转一转，看看时针会怎么走？然后接受小博士的挑战：把钟拨到指定的时间！',
    goal: '完成 3 个拨钟挑战',
    fact: '<p>钟面上有 12 个数字，把钟面分成 12 个<b>大格</b>，每个大格里有 5 个<b>小格</b>，一圈一共 60 个小格。</p><p><b>分针走 1 小格是 1 分，走一圈是 60 分</b>；分针走一圈，<b>时针正好走 1 大格，就是 1 时</b>。所以 1 时 = 60 分。</p><p>看几时几分：先看时针刚走过几，就是几时；再看分针，从 12 开始数走了多少小格，就是多少分。</p>',
    quiz: [
      { q: '分针指着 6，时针在 3 和 4 中间，是几时几分？', options: ['3时30分', '6时15分', '4时30分'], answer: 0, explain: '时针刚走过 3，是 3 时多；分针指着 6，是 30 分。' },
      { q: '分针走一圈，时针走几个大格？', options: ['1 个', '5 个', '12 个'], answer: 0, explain: '分针走一圈是 60 分，也就是 1 时，时针走 1 大格。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const CX = 230, CY = 228, R = 165;
      const CH = [[3, 0], [9, 0], [6, 30], [2, 30], [8, 15], [10, 45], [4, 5], [11, 50], [7, 20], [1, 35]];
      let total = 12 * 60, dragging = false, showMin = true, ci = 0, justSolved = false;
      const solved = new Set();
      const hm = () => {
        const h = Math.floor(total / 60) % 12;
        return [h === 0 ? 12 : h, total % 60];
      };

      function setFromPointer(p) {
        let a = Math.atan2(p.x - CX, -(p.y - CY));
        if (a < 0) a += Math.PI * 2;
        const m = Math.round(a / (Math.PI * 2) * 60) % 60;
        let diff = m - total % 60;
        if (diff > 30) diff -= 60;
        if (diff < -30) diff += 60;
        if (diff) {
          total = (total + diff + 720) % 720;
          Sci.sfx('tick');
          check();
        }
      }
      function check() {
        const [h, m] = hm();
        const [th, tm] = CH[ci];
        if (h !== th || m !== tm) { justSolved = false; return; }
        if (!justSolved) {
          justSolved = true;
          solved.add(ci);
          Sci.sfx('star');
          api.note(`🎉 对啦！现在是 ${th}时${String(tm).padStart(2, '0')}分。点“下一题”继续挑战吧！`);
          if (solved.size >= 3) api.goalDone();
        }
      }
      api.pointer(st, {
        down(p) {
          if (Math.hypot(p.x - CX, p.y - CY) < R + 25) { dragging = true; setFromPointer(p); }
        },
        move(p, active) { if (active && dragging) setFromPointer(p); },
        up() { dragging = false; },
      });

      function hand(angle, len, width, color) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(CX - Math.sin(angle) * 16, CY + Math.cos(angle) * 16);
        ctx.lineTo(CX + Math.sin(angle) * len, CY - Math.cos(angle) * len);
        ctx.stroke();
        ctx.restore();
      }
      function render() {
        ctx.fillStyle = '#eef5ff';
        ctx.fillRect(0, 0, 800, 450);
        // 钟面
        D.circle(ctx, CX, CY + 5, R + 4, 'rgba(0,0,0,.08)');
        D.circle(ctx, CX, CY, R, '#fff', '#3d8bff', 10);
        for (let i = 0; i < 60; i++) {
          const a = i / 60 * Math.PI * 2, big = i % 5 === 0;
          const r1 = R - (big ? 20 : 11), r2 = R - 6;
          ctx.strokeStyle = big ? '#2b2840' : '#b7b4c7';
          ctx.lineWidth = big ? 4 : 2;
          ctx.beginPath();
          ctx.moveTo(CX + Math.sin(a) * r1, CY - Math.cos(a) * r1);
          ctx.lineTo(CX + Math.sin(a) * r2, CY - Math.cos(a) * r2);
          ctx.stroke();
        }
        for (let n = 1; n <= 12; n++) {
          const a = n / 12 * Math.PI * 2;
          D.text(ctx, String(n), CX + Math.sin(a) * (R - 44), CY - Math.cos(a) * (R - 44) + 2, { size: 30 });
          if (showMin) D.text(ctx, String(n * 5 % 60), CX + Math.sin(a) * (R + 22), CY - Math.cos(a) * (R + 22), { size: 15, color: '#3d8bff' });
        }
        const [h, m] = hm();
        hand(((total / 60) % 12) / 12 * Math.PI * 2, R * 0.5, 12, '#2b2840');
        hand((total % 60) / 60 * Math.PI * 2, R * 0.8, 7, '#ef4444');
        D.circle(ctx, CX, CY, 10, '#ef4444');
        D.circle(ctx, CX, CY, 4, '#fff');

        // 右边：电子钟 + 读法 + 挑战
        D.rrect(ctx, 470, 28, 300, 112, 20);
        ctx.fillStyle = '#2b2840';
        ctx.fill();
        D.text(ctx, `${h}:${String(m).padStart(2, '0')}`, 620, 86, { size: 64, color: '#7dffb0' });
        D.text(ctx, `${h}时${m}分`, 620, 172, { size: 30 });
        const minTip = m % 5 === 0 ? `分针指着 ${m === 0 ? 12 : m / 5}` : `分针走了 ${m} 个小格`;
        const hourTip = m === 0 ? `时针指着 ${h}` : `时针在 ${h} 和 ${h % 12 + 1} 中间`;
        D.text(ctx, '🔴 ' + minTip, 620, 212, { size: 18, color: '#ef4444' });
        D.text(ctx, '⚫ ' + hourTip, 620, 242, { size: 18, color: '#2b2840' });

        D.rrect(ctx, 470, 280, 300, 140, 20);
        ctx.fillStyle = justSolved ? '#e3fbe9' : '#fff3c4';
        ctx.fill();
        const [th, tm] = CH[ci];
        D.text(ctx, `🎯 挑战 第 ${ci + 1} 题`, 620, 312, { size: 18, color: '#9a6400' });
        D.text(ctx, `请拨到 ${th}时${tm ? String(tm).padStart(2, '0') + '分' : '整'}`, 620, 355, { size: 30 });
        D.text(ctx, justSolved ? '✅ 拨对啦！' : `已完成 ${solved.size} 题`, 620, 395, { size: 17, color: justSolved ? '#1f9d55' : '#8b87a0' });
      }
      api.loop(render);

      api.button('⏪ 往回 1 小时', () => { total = (total + 660) % 720; check(); });
      api.button('往前 1 小时 ⏩', () => { total = (total + 60) % 720; check(); });
      api.button('🎯 下一题', () => {
        ci = (ci + 1) % CH.length;
        justSolved = false;
        const [th, tm] = CH[ci];
        api.note(`新挑战：请把钟拨到 ${th}时${tm ? tm + '分' : '整'}。`);
        check();
      });
      api.toggle('显示分钟数', showMin, v => { showMin = v; });
      api.note('👆 按住红色的长分针，拖着它转一圈，看看短短的时针怎么走？');
    },
  });

  /* ================= 4. 分数披萨 ================= */
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const lcm = (a, b) => a / gcd(a, b) * b;

  Sci.register({
    id: 'fraction',
    subject: 'math',
    level: 4,
    emoji: '🍕',
    title: '分数披萨',
    desc: '切披萨、比大小，认识分数和通分',
    intro: '一个披萨平均切成 4 块，吃掉 1 块，就是吃了它的“四分之一”，写作 1/4。下面有两个一样大的披萨，你可以决定每个切成几块，再点一点选出要吃的块数。比一比哪边吃得多？找一找：块数不一样，可是吃得一样多的情况！',
    goal: '找出 3 组“分母不同、大小相等”的分数',
    fact: '<p>把一个整体<b>平均分</b>成几份，表示其中的几份，就是<b>分数</b>。分数线下面的<b>分母</b>表示平均分成几份，上面的<b>分子</b>表示取了几份。</p><p>1/2 = 2/4 = 3/6 = 4/8 ……分子分母同时乘或除以同一个数（0 除外），分数大小不变，这叫<b>分数的基本性质</b>。把分数化到最简就叫<b>约分</b>。</p><p>分母不同的分数怎么比大小？先<b>通分</b>，变成分母相同的分数再比：3/4 = 9/12，2/3 = 8/12，所以 3/4 比 2/3 大。</p>',
    quiz: [
      { q: '1/2 和 2/4 比，哪个大？', options: ['1/2 大', '一样大', '2/4 大'], answer: 1, explain: '分子分母都乘 2，1/2 就变成 2/4，大小不变。' },
      { q: '3/4 和 2/3，哪个大？', options: ['3/4', '2/3'], answer: 0, explain: '通分后 9/12 > 8/12。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const CY = 170, PR = 112;
      const P = [{ x: 200, den: 4, n: 1, sel: [true, false, false, false] }, { x: 600, den: 2, n: 1, sel: [true, false] }];
      const found = new Set();
      let showLcm = false;
      const count = p => p.sel.filter(Boolean).length;

      function setDen(p, d) {
        const k = Math.round(count(p) / p.den * d);
        p.den = d;
        p.sel = Array.from({ length: d }, (_, i) => i < k);
        compare();
      }
      function compare() {
        const [a, b] = P, na = count(a), nb = count(b);
        if (!na || !nb) return;
        if (na * b.den === nb * a.den && a.den !== b.den) {
          const key = [na / gcd(na, a.den), a.den / gcd(na, a.den), Math.min(a.den, b.den), Math.max(a.den, b.den)].join('-');
          if (!found.has(key)) {
            found.add(key);
            Sci.sfx('star');
            api.note(`🎉 ${na}/${a.den} = ${nb}/${b.den}！切法不同，吃的却一样多——它们是相等的分数。（找到 ${found.size} 组）`);
            if (found.size >= 3) api.goalDone();
            return;
          }
        }
        const s = na * b.den > nb * a.den ? '>' : na * b.den < nb * a.den ? '<' : '=';
        api.note(`${na}/${a.den} ${s} ${nb}/${b.den}` + (s === '=' ? '，一样大！' : s === '>' ? '，左边吃得多。' : '，右边吃得多。'));
      }

      api.pointer(st, {
        down(q) {
          for (const p of P) {
            const dx = q.x - p.x, dy = q.y - CY;
            if (Math.hypot(dx, dy) > PR) continue;
            let a = Math.atan2(dy, dx) + Math.PI / 2;
            if (a < 0) a += Math.PI * 2;
            const i = Math.floor(a / (Math.PI * 2 / p.den)) % p.den;
            p.sel[i] = !p.sel[i];
            Sci.sfx('pop');
            compare();
          }
        },
      });

      function pizza(p) {
        const step = Math.PI * 2 / p.den;
        D.circle(ctx, p.x, CY + 4, PR + 14, 'rgba(0,0,0,.08)');
        D.circle(ctx, p.x, CY, PR + 12, '#ffffff', '#e6e1d6', 2);
        for (let i = 0; i < p.den; i++) {
          const a0 = -Math.PI / 2 + i * step, a1 = a0 + step;
          ctx.beginPath();
          ctx.moveTo(p.x, CY);
          ctx.arc(p.x, CY, PR, a0, a1);
          ctx.closePath();
          ctx.fillStyle = p.sel[i] ? '#ff9b54' : '#ffe6a0';
          ctx.fill();
          ctx.strokeStyle = '#c8873a';
          ctx.lineWidth = 3;
          ctx.stroke();
          if (p.sel[i]) {
            const m = (a0 + a1) / 2;
            [0.62, 0.35].forEach(r => D.circle(ctx, p.x + Math.cos(m) * PR * r, CY + Math.sin(m) * PR * r, Math.min(9, 50 / p.den + 3), '#d64545'));
          }
        }
        D.circle(ctx, p.x, CY, PR, null, '#e0a050', 9);
        const n = count(p);
        D.text(ctx, String(n), p.x, 322, { size: 30 });
        ctx.fillStyle = '#2b2840';
        ctx.fillRect(p.x - 24, 339, 48, 3);
        D.text(ctx, String(p.den), p.x, 360, { size: 30 });
        const g = gcd(n, p.den);
        if (n && g > 1) D.text(ctx, `= ${n / g}/${p.den / g}`, p.x + 80, 342, { size: 18, color: '#8b87a0' });
        const bw = 300, cw = bw / p.den;
        for (let i = 0; i < p.den; i++) {
          ctx.fillStyle = i < n ? '#ff9b54' : '#fff';
          ctx.fillRect(p.x - bw / 2 + i * cw, 384, cw, 24);
          ctx.strokeStyle = '#c8873a';
          ctx.lineWidth = 2;
          ctx.strokeRect(p.x - bw / 2 + i * cw, 384, cw, 24);
        }
      }
      api.loop(() => {
        ctx.fillStyle = '#fff8ef';
        ctx.fillRect(0, 0, 800, 450);
        P.forEach(pizza);
        const [a, b] = P, na = count(a), nb = count(b);
        const s = na * b.den > nb * a.den ? '>' : na * b.den < nb * a.den ? '<' : '=';
        D.text(ctx, s, 400, CY, { size: 72, color: s === '=' ? '#1f9d55' : '#3d8bff' });
        if (showLcm) {
          const L = lcm(a.den, b.den);
          const txt = a.den === b.den ? '分母相同，直接比分子' : `通分：${na}/${a.den} = ${na * L / a.den}/${L}，${nb}/${b.den} = ${nb * L / b.den}/${L}`;
          D.text(ctx, txt, 400, 435, { size: 16, color: '#3d8bff' });
        }
        D.text(ctx, '👆 点披萨选块', 400, 24, { size: 15, color: '#8b87a0', weight: 'normal' });
      });

      api.slider('左边切成', 2, 12, 1, P[0].den, v => setDen(P[0], v), v => v + ' 块');
      api.slider('右边切成', 2, 12, 1, P[1].den, v => setDen(P[1], v), v => v + ' 块');
      const row = api.row();
      api.toggle('🔢 显示通分', false, v => { showLcm = v; }, row);
      api.button('🧹 都不选', () => { P.forEach(p => p.sel.fill(false)); }, row);
      api.note('现在左边是 1/4，右边是 1/2。试试把左边选成 2 块，会怎样？');
    },
  });

  /* ================= 5. 圆周率的秘密 ================= */
  Sci.register({
    id: 'pi',
    subject: 'math',
    level: 5,
    emoji: '⭕',
    title: '圆周率的秘密',
    desc: '滚一滚、拼一拼，发现周长和面积公式',
    intro: '不管圆是大是小，它的周长总是直径的 3 倍多一点！这个神奇的“3 倍多一点”就叫圆周率，写作 π。先让轮子滚一圈，量一量周长；再把圆切成许多小块，拼成一个近似的长方形，看看圆的面积公式是怎么来的。',
    goal: '让轮子滚一圈，并把圆切成 16 块以上拼成长方形',
    fact: '<p><b>圆周率 π ≈ 3.14</b>（其实是 3.1415926……永远写不完）。<b>周长 C = πd = 2πr</b>。</p><p>把圆切成很多小扇形，一正一反拼起来，就接近一个<b>长方形</b>：长是周长的一半（πr），宽是半径（r），所以<b>圆的面积 S = πr × r = πr²</b>。切得越细，拼出来越像长方形。</p><p>🇨🇳 1500 多年前，我国数学家<b>祖冲之</b>就算出 π 在 3.1415926 和 3.1415927 之间，领先世界将近一千年！</p>',
    quiz: [
      { q: '一个圆的直径是 10 厘米，它的周长大约是？', options: ['31.4 厘米', '20 厘米', '100 厘米'], answer: 0, explain: 'C = πd ≈ 3.14 × 10 = 31.4 厘米。' },
      { q: '圆的面积公式是？', options: ['S = πr²', 'S = 2πr', 'S = πd'], answer: 0, explain: '拼成的长方形长 πr、宽 r，面积就是 πr²。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const UNIT = 40, GY = 330, X0 = 90;
      let mode = 'roll', d = 2, a = 0, rolling = false, trace = [], rolled = false;
      let n = 8, morph = 0, target = 0, cutDone = false;

      function renderRoll() {
        const r = d * UNIT / 2;
        ctx.fillStyle = '#f4f8ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#c9b48a';
        ctx.fillRect(0, GY, 800, 6);
        // 地上按“直径”的长度做记号
        for (let k = 0; k <= 4; k++) {
          const x = X0 + k * d * UNIT;
          if (x > 790) break;
          ctx.fillStyle = '#6f6a85';
          ctx.fillRect(x - 1, GY, 2, 16);
          if (k) D.text(ctx, `${k} 个直径`, x, GY + 30, { size: 13, color: '#6f6a85', weight: 'normal' });
        }
        const C = Math.PI * d * UNIT;
        if (a > 0) {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(X0, GY - 3, Math.min(a / (Math.PI * 2), 1) * C, 6);
        }
        ctx.strokeStyle = 'rgba(239,68,68,.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        trace.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.stroke();
        const cx = X0 + a * r, cy = GY - r;
        D.circle(ctx, cx, cy, r, '#ffe7a3', '#3d8bff', 5);
        ctx.strokeStyle = '#3d8bff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.sin(a) * r, cy - Math.cos(a) * r);
        ctx.lineTo(cx - Math.sin(a) * r, cy + Math.cos(a) * r);
        ctx.stroke();
        D.circle(ctx, cx - r * Math.sin(a), cy + r * Math.cos(a), 6, '#ef4444');
        D.text(ctx, `直径 d = ${d} 厘米`, 400, 40, { size: 20 });
        if (rolled) {
          D.text(ctx, `周长 = 红线长 ≈ ${(Math.PI * d).toFixed(2)} 厘米`, 400, 80, { size: 20, color: '#ef4444' });
          D.text(ctx, `周长 ÷ 直径 = ${(Math.PI * d).toFixed(2)} ÷ ${d} = 3.14159…  这就是 π！`, 400, 116, { size: 18, color: '#3d8bff' });
        } else D.text(ctx, '红点是轮子上的一个记号，看它滚一圈走多远', 400, 80, { size: 16, color: '#8b87a0', weight: 'normal' });
        D.text(ctx, '（地上 1 格 = 1 厘米 × 40 倍放大）', 790, 440, { size: 12, align: 'right', color: '#aaa', weight: 'normal' });
      }

      function renderArea() {
        ctx.fillStyle = '#f4f8ff';
        ctx.fillRect(0, 0, 800, 450);
        const r = 100, w = Math.PI * 2 / n, cx = 190, cy = 220;
        const RX = 350, RY = 175;
        const e = morph * morph * (3 - 2 * morph);
        for (let i = 0; i < n; i++) {
          const half = i < n / 2, j = half ? 2 * i : 2 * (i - n / 2) + 1;
          const bc = -Math.PI / 2 + (i + 0.5) * w;
          let ax, ay, br;
          if (j % 2 === 0) { ax = RX + (j / 2) * r * w + r * w / 2; ay = RY; br = Math.PI / 2; }
          else { ax = RX + ((j - 1) / 2 + 1) * r * w; ay = RY + r; br = -Math.PI / 2; }
          while (br - bc > Math.PI) br -= Math.PI * 2;
          while (bc - br > Math.PI) br += Math.PI * 2;
          const px = lerp(cx, ax, e), py = lerp(cy, ay, e), b = lerp(bc, br, e);
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.arc(px, py, r, b - w / 2, b + w / 2);
          ctx.closePath();
          ctx.fillStyle = half ? '#7fb2ff' : '#ffb26b';
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        if (morph > 0.98) {
          const W = Math.PI * r;
          D.arrow(ctx, RX + W / 2 - 30, RY - 22, RX, RY - 22, '#3d8bff', 2, 9);
          D.arrow(ctx, RX + W / 2 + 30, RY - 22, RX + W + r * w / 2, RY - 22, '#3d8bff', 2, 9);
          D.text(ctx, '长 ≈ 周长的一半 = πr', RX + W / 2, RY - 22, { size: 16, color: '#3d8bff' });
          D.text(ctx, '宽 = r', RX - 34, RY + r / 2, { size: 16, color: '#c0620a' });
          D.text(ctx, '面积 = 长 × 宽 = πr × r = πr²', 560, 340, { size: 22 });
          D.text(ctx, `切成 ${n} 块：${n < 16 ? '边还是波浪形的，再切细一点试试' : '已经很像长方形啦！'}`, 560, 380, { size: 15, color: '#6f6a85', weight: 'normal' });
        } else {
          D.text(ctx, `把圆平均切成 ${n} 块`, 560, 220, { size: 20, color: '#6f6a85' });
          D.text(ctx, '一半涂蓝色，一半涂橙色', 560, 252, { size: 15, color: '#8b87a0', weight: 'normal' });
        }
      }

      api.loop(dt => {
        if (mode === 'roll') {
          if (rolling) {
            const r = d * UNIT / 2;
            a = Math.min(Math.PI * 2, a + dt * 2.1);
            trace.push([X0 + a * r - r * Math.sin(a), GY - r + r * Math.cos(a)]);
            if (a >= Math.PI * 2) {
              rolling = false;
              rolled = true;
              Sci.sfx('good');
              api.note(`滚了一圈！红线就是周长，比 3 个直径还多一点点：${d} × 3.14 ≈ ${(Math.PI * d).toFixed(2)} 厘米。换个大小再滚一次，比值还是 3.14 吗？`);
              checkGoal();
            }
          }
          renderRoll();
        } else {
          morph += clamp(target - morph, -dt * 0.7, dt * 0.7);
          if (morph >= 1 && n >= 16 && !cutDone) { cutDone = true; checkGoal(); }
          renderArea();
        }
      });
      function checkGoal() {
        if (rolled && cutDone) api.goalDone();
        else if (rolled && !cutDone && mode === 'roll') {
          api.timeout(() => { if (mode === 'roll' && !cutDone) api.note('周长的秘密找到了！再切换到“✂️ 拼面积”看看面积公式。'); }, 3000);
        }
      }

      api.choice([['roll', '🛞 滚周长'], ['area', '✂️ 拼面积']], mode, v => {
        mode = v;
        rollRow.hidden = v !== 'roll';
        areaRow.hidden = v !== 'area';
        api.note(v === 'roll' ? '调好直径，点“滚一圈”。' : '选好切几块，点“切开拼一拼”。');
      });
      const rollRow = api.row();
      api.slider('直径', 1, 4, 0.5, d, v => { d = v; a = 0; trace = []; rolling = false; }, v => v + ' 厘米', rollRow);
      api.button('🛞 滚一圈', () => { a = 0; trace = []; rolling = true; }, rollRow);
      const areaRow = api.row();
      api.slider('切成', 4, 32, 2, n, v => { n = v; }, v => v + ' 块', areaRow);
      api.button('✂️ 切开拼一拼 / 还原', () => { target = target ? 0 : 1; }, areaRow);
      areaRow.hidden = true;
      api.note('调好直径，点“滚一圈”，看看轮子滚一圈走了多远。');
    },
  });
})();
