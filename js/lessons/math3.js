/* 数学魔法（第三组）：找规律 → 认识人民币 → 角的大小 → 平均数 → 坐标寻宝 */
(function () {
  'use strict';
  const { clamp } = Sci;
  const D = Sci.draw;
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  /* ================= 11. 找规律 ================= */
  const PAT_SETS = [['🍎', '🍌', '🍇'], ['🐱', '🐶', '🐰'], ['⭐', '🌙', '☀️'], ['🚗', '🚲', '🚀']];
  const PAT_TYPES = ['AB', 'AAB', 'ABB', 'ABC', 'AABB'];

  Sci.register({
    id: 'pattern',
    subject: 'math',
    level: 1,
    emoji: '🧩',
    title: '找规律',
    desc: '下一个会是什么？找到排列的秘密',
    intro: '小动物和水果们排着队，它们的队伍里藏着一个“规律”，会一遍一遍重复出现。仔细看看前面的排法，猜一猜问号的位置应该是谁，在下面点一下正确的那个！后面还有数字的规律哦。',
    goal: '答对 6 道找规律的题',
    fact: '<p><b>规律</b>就是按一定的顺序<b>重复出现</b>。比如 🍎🍌🍎🍌……每两个一组重复；🍎🍎🍌🍎🍎🍌……每三个一组重复。</p><p>数字也有规律：2、4、6、8……每次多 2；1、2、4、8……每次变成 2 倍。</p><p>🌸 生活中到处都有规律：一年四季、一周七天、红绿灯、地砖的花纹、音乐的节奏……找到规律，就能猜到接下来会发生什么！</p>',
    quiz: [
      { q: '🍎🍌🍌🍎🍌🍌🍎…… 下一个是什么？', options: ['🍎', '🍌'], answer: 1, explain: '每 3 个一组：🍎🍌🍌，所以下一个是 🍌。' },
      { q: '3、6、9、12、？', options: ['13', '15', '16'], answer: 1, explain: '每次多 3，12 + 3 = 15。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let q = null, score = 0, n = 0, picked = -1, t = 0;

      function newQ() {
        n++;
        picked = -1;
        if (n % 3 === 0) {
          const kind = rint(0, 2);
          let seq;
          if (kind === 0) { const a = rint(1, 5), d = rint(2, 5); seq = [0, 1, 2, 3, 4].map(i => a + d * i); } else if (kind === 1) { const a = rint(20, 40), d = rint(2, 4); seq = [0, 1, 2, 3, 4].map(i => a - d * i); } else { seq = [1, 2, 4, 8, 16]; }
          const ans = seq.pop();
          const opts = Sci.shuffle([ans, ans + rint(1, 3), ans - rint(1, 3)].map(String));
          q = { items: seq.map(String), opts, ans: String(ans), num: true, tip: kind === 0 ? `每次多 ${seq[1] - seq[0]}` : kind === 1 ? `每次少 ${seq[0] - seq[1]}` : '每次变成 2 倍' };
        } else {
          const set = PAT_SETS[rint(0, PAT_SETS.length - 1)], type = PAT_TYPES[rint(0, PAT_TYPES.length - 1)];
          const unit = type.split('').map(c => set['ABC'.indexOf(c)]);
          const items = [];
          for (let i = 0; i < 7; i++) items.push(unit[i % unit.length]);
          const ans = unit[7 % unit.length];
          const opts = Sci.shuffle(set.slice());
          q = { items, opts, ans, num: false, tip: `每 ${unit.length} 个一组：${unit.join('')}` };
        }
        api.note(`第 ${n} 题：问号的地方应该是什么？在下面的 3 个答案里点一下。`);
      }
      api.pointer(st, {
        down(p) {
          if (!q || picked >= 0 || p.y < 290 || p.y > 410) return;
          const i = Math.floor((p.x - 190) / 140);
          if (i < 0 || i > 2) return;
          picked = i;
          if (q.opts[i] === q.ans) {
            score++;
            Sci.sfx('good');
            api.note(`✅ 对啦！${q.tip}。（答对 ${Math.min(score, 6)}/6）`);
            if (score === 6) api.goalDone();
          } else {
            Sci.sfx('bad');
            api.note(`不对哦，正确答案是 ${q.ans}。${q.tip}。`);
          }
          api.timeout(newQ, 2400);
        },
      });
      function render() {
        ctx.fillStyle = '#f3f0ff';
        ctx.fillRect(0, 0, 800, 450);
        if (!q) return;
        const items = q.items.concat(['?']);
        const w = 740 / items.length;
        items.forEach((s, i) => {
          const x = 30 + w * i + w / 2, y = 150;
          D.rrect(ctx, x - w / 2 + 6, y - 50, w - 12, 100, 16);
          ctx.fillStyle = s === '?' ? '#fff3bf' : '#fff';
          ctx.fill();
          if (s === '?') D.text(ctx, picked >= 0 ? q.ans : '?', x, y + 2, { size: 44, color: '#c0620a' });
          else if (q.num) D.text(ctx, s, x, y + 2, { size: 40, color: '#3d6fd0' });
          else D.emoji(ctx, s, x, y, 52);
        });
        D.text(ctx, '下一个是？', 400, 260, { size: 20, color: '#6f6a85' });
        q.opts.forEach((s, i) => {
          const x = 260 + i * 140, y = 350;
          D.rrect(ctx, x - 55, y - 50, 110, 100, 18);
          ctx.fillStyle = picked === i ? (s === q.ans ? '#d3f9d8' : '#ffe3e3') : '#fff';
          ctx.fill();
          ctx.strokeStyle = '#d0bfff';
          ctx.lineWidth = 3;
          ctx.stroke();
          if (q.num) D.text(ctx, s, x, y + 2, { size: 38, color: '#3d6fd0' });
          else D.emoji(ctx, s, x, y, 50);
        });
        D.text(ctx, `答对 ${Math.min(score, 6)} / 6`, 780, 26, { size: 18, align: 'right', color: '#7048e8' });
      }
      api.loop(dt => { t += dt; render(); });
      newQ();
    },
  });

  /* ================= 12. 认识人民币 ================= */
  const MONEY = [[1000, '10元', '#4c9a6a'], [500, '5元', '#9c36b5'], [100, '1元', '#868e96'], [50, '5角', '#e8b500'], [10, '1角', '#adb5bd']];
  const GOODS = [['✏️', '铅笔', 150], ['🍎', '苹果', 350], ['📒', '本子', 420], ['🍦', '冰淇淋', 280], ['🧃', '果汁', 600], ['🎈', '气球', 90], ['📏', '尺子', 230], ['🍞', '面包', 750]];
  const yuan = f => { const y = Math.floor(f / 100), j = (f % 100) / 10; return (y ? y + '元' : '') + (j ? j + '角' : '') || '0元'; };

  Sci.register({
    id: 'money',
    subject: 'math',
    level: 2,
    emoji: '💴',
    title: '认识人民币',
    desc: '元和角怎么换算？买东西刚好付够钱',
    intro: '我们来开一家小商店！每样东西上都贴着价钱。顾客要买东西时，请你从钱盒里拿出钱，正好凑够价钱就能卖出去。记住：1 元 = 10 角，1 张 5 元 = 5 张 1 元哦！',
    goal: '正好凑够钱，卖出 4 样东西',
    fact: '<p>人民币的单位有<b>元</b>和<b>角</b>（还有更小的“分”）。<b>1 元 = 10 角</b>。</p><p>凑钱的时候，可以先用大面额的钱，再用小面额的钱：比如 3 元 5 角 = 1 张 1 元 × 3 + 1 个 5 角，或者 1 张 5 元找回 1 元 5 角。</p><p>💡 我们国家的钱叫<b>人民币</b>，上面有国徽、盲文和防伪标记。要爱护人民币，不在上面乱写乱画哦！</p>',
    quiz: [
      { q: '1 元等于多少角？', options: ['5 角', '10 角', '100 角'], answer: 1, explain: '1 元 = 10 角。' },
      { q: '买一个 2 元 5 角的面包，付了 5 元，应该找回多少钱？', options: ['2 元 5 角', '3 元 5 角', '2 元'], answer: 0, explain: '5 元 − 2 元 5 角 = 2 元 5 角。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let good = null, tray = [], sold = 0;
      const total = () => tray.reduce((s, m) => s + m, 0);

      function next() {
        good = GOODS[rint(0, GOODS.length - 1)];
        tray = [];
        api.note(`顾客想买${good[1]}，价钱是 ${yuan(good[2])}。请从钱盒里拿钱，凑够这么多。`);
      }
      api.pointer(st, {
        down(p) {
          if (p.y > 330) {
            const i = Math.floor((p.x - 20) / 156);
            if (i < 0 || i > 4) return;
            if (tray.length >= 14) { api.note('拿太多啦，先点“退回一张”。'); return; }
            tray.push(MONEY[i][0]);
            Sci.sfx('click');
            if (total() > good[2]) api.note(`现在是 ${yuan(total())}，比 ${yuan(good[2])} 多了，退回一些吧。`);
          }
        },
      });
      function pay() {
        const s = total();
        if (s === good[2]) {
          sold++;
          Sci.sfx('good');
          api.note(`✅ 正好 ${yuan(s)}！卖出了${good[1]}。（卖出 ${sold}/4）`);
          if (sold === 4) api.goalDone();
          api.timeout(next, 2000);
        } else {
          Sci.sfx('bad');
          api.note(s < good[2] ? `还差 ${yuan(good[2] - s)} 哦。` : `多了 ${yuan(s - good[2])}，退回一些吧。`);
        }
      }
      function note(x, y, m, s) {
        const [v, name, c] = m;
        if (v >= 100) {
          D.rrect(ctx, x - 60 * s, y - 30 * s, 120 * s, 60 * s, 6);
          ctx.fillStyle = c;
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,.2)';
          ctx.lineWidth = 2;
          ctx.stroke();
          D.circle(ctx, x - 30 * s, y, 16 * s, 'rgba(255,255,255,.35)');
          D.text(ctx, name, x + 18 * s, y + 1, { size: 22 * s, color: '#fff' });
        } else {
          D.circle(ctx, x, y, 28 * s, c, 'rgba(0,0,0,.25)', 2);
          D.text(ctx, name, x, y + 1, { size: 17 * s, color: '#fff', stroke: 'rgba(0,0,0,.25)', strokeWidth: 3 });
        }
      }
      function render() {
        ctx.fillStyle = '#fff9db';
        ctx.fillRect(0, 0, 800, 450);
        // 商品和价签
        D.rrect(ctx, 30, 30, 260, 250, 20);
        ctx.fillStyle = '#fff';
        ctx.fill();
        if (good) {
          D.emoji(ctx, good[0], 160, 120, 100);
          D.rrect(ctx, 70, 200, 180, 56, 12);
          ctx.fillStyle = '#ff6b6b';
          ctx.fill();
          D.text(ctx, yuan(good[2]), 160, 229, { size: 28, color: '#fff' });
        }
        // 托盘
        D.rrect(ctx, 320, 30, 450, 250, 20);
        ctx.fillStyle = '#e9f5ff';
        ctx.fill();
        D.text(ctx, `已经拿了：${yuan(total())}`, 545, 60, { size: 22, color: '#1c7ed6' });
        tray.forEach((v, i) => {
          const m = MONEY.find(mm => mm[0] === v);
          note(370 + (i % 5) * 86, 110 + Math.floor(i / 5) * 60, m, 0.6);
        });
        D.text(ctx, `卖出 ${sold}/4`, 545, 262, { size: 15, color: '#6f6a85' });
        // 钱盒
        ctx.fillStyle = '#ffe8cc';
        ctx.fillRect(0, 320, 800, 130);
        MONEY.forEach((m, i) => note(98 + i * 156, 375, m, 1));
        D.text(ctx, '👆 点钱盒里的钱，放进托盘', 400, 435, { size: 14, color: '#8a5a2b', weight: 'normal' });
      }
      api.loop(render);
      api.button('💰 付钱', pay);
      api.button('↩️ 退回一张', () => { tray.pop(); });
      api.button('🧹 全部退回', () => { tray = []; });
      next();
    },
  });

  /* ================= 13. 角的大小 ================= */
  const ANGLE_TASKS = [
    ['画一个直角', a => a === 90, '直角是 90°，像书本的角。'],
    ['画一个锐角（比直角小）', a => a > 0 && a < 90, '比直角小的角叫锐角。'],
    ['画一个钝角（比直角大，比平角小）', a => a > 90 && a < 180, '钝角在 90° 和 180° 之间。'],
    ['画一个平角', a => a === 180, '平角是 180°，两条边成了一条直线。'],
    ['画一个 45° 的角', a => a === 45, '45° 正好是直角的一半。'],
    ['画一个 120° 的角', a => a === 120, '120° 是一个钝角。'],
  ];

  Sci.register({
    id: 'angles',
    subject: 'math',
    level: 3,
    emoji: '📐',
    title: '角的大小',
    desc: '用量角器认识直角、锐角、钝角和平角',
    intro: '剪刀张开、钟表的指针、滑梯和地面之间，都藏着“角”。角的大小和边的长短没有关系，只看两条边张开得有多大。拖动红色的边，看看量角器上的度数，完成 6 个画角的挑战！',
    goal: '完成 6 个画角挑战',
    fact: '<p>角的大小用<b>度（°）</b>来表示。量角器把半个圆平均分成 180 份，每份是 1°。</p><p><b>直角</b> = 90°；<b>锐角</b>小于 90°；<b>钝角</b>大于 90°、小于 180°；<b>平角</b> = 180°；转一整圈是<b>周角</b> = 360°。</p><p>📏 角的大小只和两条边<b>张开的程度</b>有关，和边画得长还是短没有关系。</p>',
    quiz: [
      { q: '比直角大、比平角小的角叫什么角？', options: ['锐角', '钝角', '周角'], answer: 1, explain: '钝角在 90° 到 180° 之间。' },
      { q: '钟面上 3 点整，时针和分针成什么角？', options: ['直角', '平角', '锐角'], answer: 0, explain: '3 点整两根针成 90°，是直角。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const O = [330, 330], L = 230;
      let ang = 30, task = 0, drag = false;
      const done = new Set();
      const kind = a => (a === 90 ? '直角' : a === 180 ? '平角' : a < 90 ? '锐角' : '钝角');

      function setFrom(p) {
        const a = Math.atan2(O[1] - p.y, p.x - O[0]) * 180 / Math.PI;
        ang = clamp(Math.round((a < -90 ? 180 : Math.max(0, a)) / 5) * 5, 5, 180);
      }
      function check() {
        const [txt, ok, tip] = ANGLE_TASKS[task];
        if (ok(ang)) {
          if (!done.has(task)) { done.add(task); Sci.sfx('star'); }
          api.note(`✅ ${ang}°，${tip}` + (done.size < 6 ? ' 去做下一个挑战吧。' : ''));
          if (done.size === 6) api.goalDone();
          else if (task < 5) { task++; choiceCtl.set(task); api.timeout(() => api.note('挑战 ' + (task + 1) + '：' + ANGLE_TASKS[task][0]), 1800); }
        } else api.note(`现在是 ${ang}°，是一个${kind(ang)}。目标：${txt}。`);
      }
      api.pointer(st, {
        down(p) { if (p.y < O[1] + 20) { drag = true; setFrom(p); } },
        move(p, active) { if (active && drag) setFrom(p); },
        up() { if (drag) { drag = false; check(); } },
      });
      function render() {
        ctx.fillStyle = '#f8f9ff';
        ctx.fillRect(0, 0, 800, 450);
        // 量角器
        ctx.beginPath();
        ctx.arc(O[0], O[1], L + 20, Math.PI, 0);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,236,153,.55)';
        ctx.fill();
        ctx.strokeStyle = '#e6b800';
        ctx.lineWidth = 2;
        ctx.stroke();
        for (let d = 0; d <= 180; d += 5) {
          const r = d * Math.PI / 180, len = d % 10 === 0 ? 14 : 7;
          ctx.beginPath();
          ctx.moveTo(O[0] + Math.cos(r) * (L + 20), O[1] - Math.sin(r) * (L + 20));
          ctx.lineTo(O[0] + Math.cos(r) * (L + 20 - len), O[1] - Math.sin(r) * (L + 20 - len));
          ctx.stroke();
          if (d % 30 === 0) D.text(ctx, String(d), O[0] + Math.cos(r) * (L - 10), O[1] - Math.sin(r) * (L - 10), { size: 13, color: '#8a6d00', weight: 'normal' });
        }
        // 角的弧和两条边
        const r = ang * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(O[0], O[1]);
        ctx.arc(O[0], O[1], 60, -r, 0);
        ctx.closePath();
        ctx.fillStyle = 'rgba(76,110,245,.25)';
        ctx.fill();
        if (ang === 90) { ctx.strokeStyle = '#4c6ef5'; ctx.strokeRect(O[0], O[1] - 22, 22, 22); }
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#2b2840';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(O[0], O[1]);
        ctx.lineTo(O[0] + L, O[1]);
        ctx.stroke();
        ctx.strokeStyle = '#e03131';
        ctx.beginPath();
        ctx.moveTo(O[0], O[1]);
        ctx.lineTo(O[0] + Math.cos(r) * L, O[1] - Math.sin(r) * L);
        ctx.stroke();
        D.circle(ctx, O[0] + Math.cos(r) * L, O[1] - Math.sin(r) * L, 14, '#ff6b6b');
        D.circle(ctx, O[0], O[1], 6, '#2b2840');
        D.text(ctx, `${ang}°`, O[0] + Math.cos(r / 2) * 95, O[1] - Math.sin(r / 2) * 95, { size: 22, color: '#364fc7' });
        D.text(ctx, kind(ang), O[0], O[1] + 40, { size: 22, color: '#2b2840' });
        ANGLE_TASKS.forEach(([s], i) => D.text(ctx, `${done.has(i) ? '✅' : i === task ? '👉' : '⬜'} ${s}`, 605, 40 + i * 30, { size: 14, align: 'left', color: i === task ? '#2b2840' : '#868e96', maxW: 190 }));
      }
      api.loop(render);
      const choiceCtl = api.choice(ANGLE_TASKS.map((_, i) => [i, `挑战 ${i + 1}`]), 0, v => { task = v; api.note('挑战 ' + (v + 1) + '：' + ANGLE_TASKS[v][0]); });
      api.note('挑战 1：' + ANGLE_TASKS[0][0] + '。拖动红色的边。');
    },
  });

  /* ================= 14. 平均数 ================= */
  const AVG_SETS = [[6, 2, 5, 1, 6], [3, 7, 2, 8, 5], [9, 1, 4, 6, 5], [2, 8, 8, 3, 4]];

  Sci.register({
    id: 'average',
    subject: 'math',
    level: 4,
    emoji: '📊',
    title: '平均数',
    desc: '移多补少，把高低不平的柱子变一样高',
    intro: '五个小朋友收集了不同数量的积木，有的多、有的少。如果把积木重新分一分，让每个人一样多，每人能分到几块？这个数就叫“平均数”。点一下高柱子顶上的积木，再点矮的柱子，把它移过去，直到所有柱子一样高！',
    goal: '用移多补少的方法，把 3 组柱子变一样高',
    fact: '<p><b>平均数</b>表示一组数据的“平均水平”。求平均数有两种方法：</p><p>① <b>移多补少</b>：把多的移给少的，直到一样多。② <b>先求和再平均分</b>：平均数 =（所有数的和）÷（个数）。比如 6、2、5、1、6，和是 20，20 ÷ 5 = 4。</p><p>📈 平均数会受特别大或特别小的数影响。比如班上同学的平均身高是 140 厘米，并不代表每个人都是 140 厘米哦。</p>',
    quiz: [
      { q: '3、5、7 的平均数是多少？', options: ['5', '6', '15'], answer: 0, explain: '(3 + 5 + 7) ÷ 3 = 15 ÷ 3 = 5。' },
      { q: '小明 4 次测验得了 90、80、100、90 分，平均分是？', options: ['85', '90', '95'], answer: 1, explain: '(90 + 80 + 100 + 90) ÷ 4 = 360 ÷ 4 = 90。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const B = 360, S = 28, X0 = 150, W = 110;
      let set = 0, cols = AVG_SETS[0].slice(), sel = -1, moves = 0, line = false;
      const solved = new Set();
      const avg = () => cols.reduce((a, b) => a + b, 0) / cols.length;

      function load(i) {
        set = i;
        cols = AVG_SETS[i].slice();
        sel = -1;
        moves = 0;
        api.note(`第 ${i + 1} 组：${cols.join('、')}。点高柱子，再点矮柱子，移一块积木过去。`);
      }
      api.pointer(st, {
        down(p) {
          const i = Math.floor((p.x - X0 + W / 2) / W);
          if (i < 0 || i > 4) return;
          if (sel < 0) {
            if (!cols[i]) return;
            sel = i;
            Sci.sfx('pop');
          } else if (i === sel) sel = -1;
          else {
            cols[sel]--;
            cols[i]++;
            sel = -1;
            moves++;
            Sci.sfx('click');
            if (cols.every(c => c === cols[0])) {
              const first = !solved.has(set);
              solved.add(set);
              Sci.sfx(first ? 'star' : 'good');
              api.note(`✅ 一样高啦！每人 ${cols[0]} 块，平均数是 ${cols[0]}。算一算：(${AVG_SETS[set].join(' + ')}) ÷ 5 = ${cols[0]}。` + (solved.size < 3 ? ' 换一组试试。' : ''));
              if (solved.size >= 3) api.goalDone();
            }
          }
        },
      });
      function render() {
        ctx.fillStyle = '#f8f9ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#ced4da';
        ctx.fillRect(80, B, 560, 6);
        const colors = ['#ff922b', '#4c6ef5', '#40c057', '#f06595', '#fab005'];
        cols.forEach((n, i) => {
          const x = X0 + i * W;
          for (let k = 0; k < n; k++) {
            const y = B - (k + 1) * (S + 2);
            D.rrect(ctx, x - S / 2 - 6, y, S + 12, S, 5);
            ctx.fillStyle = colors[i];
            ctx.fill();
            if (sel === i && k === n - 1) { ctx.strokeStyle = '#e03131'; ctx.lineWidth = 4; ctx.stroke(); }
          }
          D.text(ctx, String(n), x, B + 26, { size: 20 });
          D.emoji(ctx, ['👦', '👧', '🧒', '👩', '👨'][i], x, B + 60, 30);
        });
        if (line) {
          const y = B - avg() * (S + 2);
          ctx.save();
          ctx.setLineDash([8, 6]);
          ctx.strokeStyle = '#e03131';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(80, y);
          ctx.lineTo(640, y);
          ctx.stroke();
          ctx.restore();
          D.text(ctx, `平均数 ${avg()}`, 700, y, { size: 16, color: '#e03131' });
        }
        D.text(ctx, `移了 ${moves} 次 · 完成 ${solved.size}/3 组`, 20, 26, { size: 16, align: 'left', color: '#6f6a85' });
      }
      api.loop(render);
      api.choice(AVG_SETS.map((_, i) => [i, `第 ${i + 1} 组`]), 0, load);
      const row2 = api.row();
      api.toggle('➖ 显示平均线', false, v => { line = v; }, row2);
      api.button('🔄 重来', () => load(set), row2);
      load(0);
    },
  });

  /* ================= 15. 坐标寻宝 ================= */
  Sci.register({
    id: 'coords',
    subject: 'math',
    level: 5,
    emoji: '🗺️',
    title: '坐标寻宝',
    desc: '用一对数字，准确说出宝藏的位置',
    intro: '海盗留下了一张藏宝图，可是宝藏的位置是用一对数字写的，比如（3，5）。第一个数表示往右数几格，第二个数表示往上数几格。看懂这对数字，在地图上点出宝藏的位置吧！',
    goal: '找到 6 个宝藏',
    fact: '<p>用一对数字表示位置，叫做<b>数对</b>，也叫<b>坐标</b>。写法是（列，行），比如（3，5）表示第 3 列、第 5 行。</p><p>顺序非常重要：（3，5）和（5，3）是两个不同的地方！一般先说横着数的（x），再说竖着数的（y）。</p><p>🌍 地球上的经纬度、电影院的座位号、棋盘上的位置、手机地图的定位，都用到了坐标的思想。</p>',
    quiz: [
      { q: '（2，6）和（6，2）是同一个位置吗？', options: ['是', '不是'], answer: 1, explain: '数对的顺序不同，位置就不同。' },
      { q: '电影票上写着“5 排 8 号”，这和什么数学知识有关？', options: ['用数对确定位置', '求平均数'], answer: 0, explain: '排和号就是一对确定位置的数。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const OX = 70, OY = 400, C = 45, NX = 10, NY = 8;
      let target = null, found = 0, marks = [], miss = null;

      function next() {
        do target = [rint(1, NX), rint(1, NY)]; while (marks.some(m => m[0] === target[0] && m[1] === target[1]));
        miss = null;
        api.note(`🏴‍☠️ 宝藏在（${target[0]}，${target[1]}）。先往右数 ${target[0]} 格，再往上数 ${target[1]} 格。`);
      }
      api.pointer(st, {
        down(p) {
          const x = Math.round((p.x - OX) / C), y = Math.round((OY - p.y) / C);
          if (x < 0 || x > NX || y < 0 || y > NY) return;
          if (x === target[0] && y === target[1]) {
            found++;
            marks.push(target);
            Sci.sfx('star');
            api.note(`💰 找到啦！（${x}，${y}）` + (found <= 6 ? `（找到 ${found}/6）` : ''));
            if (found === 6) api.goalDone();
            api.timeout(next, 1500);
          } else {
            miss = [x, y];
            Sci.sfx('bad');
            api.note(`这里是（${x}，${y}）。` + (x === target[1] && y === target[0] ? '你把两个数的顺序弄反啦！' : `宝藏在（${target[0]}，${target[1]}）。`));
          }
        },
      });
      function render() {
        ctx.fillStyle = '#f4e6c8';
        ctx.fillRect(0, 0, 800, 450);
        ctx.strokeStyle = 'rgba(120,80,40,.35)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= NX; i++) { ctx.beginPath(); ctx.moveTo(OX + i * C, OY); ctx.lineTo(OX + i * C, OY - NY * C); ctx.stroke(); D.text(ctx, String(i), OX + i * C, OY + 18, { size: 15, color: '#8a5a2b' }); }
        for (let j = 0; j <= NY; j++) { ctx.beginPath(); ctx.moveTo(OX, OY - j * C); ctx.lineTo(OX + NX * C, OY - j * C); ctx.stroke(); D.text(ctx, String(j), OX - 18, OY - j * C, { size: 15, color: '#8a5a2b' }); }
        D.arrow(ctx, OX, OY, OX + NX * C + 30, OY, '#8a5a2b', 3);
        D.arrow(ctx, OX, OY, OX, OY - NY * C - 30, '#8a5a2b', 3);
        D.emoji(ctx, '🌴', OX + 2 * C, OY - 6 * C, 30, 0.5);
        D.emoji(ctx, '⛰️', OX + 8 * C, OY - 2 * C, 34, 0.5);
        marks.forEach(([x, y]) => D.emoji(ctx, '💰', OX + x * C, OY - y * C, 30));
        if (miss) D.text(ctx, '✖', OX + miss[0] * C, OY - miss[1] * C, { size: 24, color: '#e03131' });
        D.rrect(ctx, 560, 30, 225, 110, 16);
        ctx.fillStyle = '#fff8e6';
        ctx.fill();
        D.text(ctx, '藏宝图', 672, 56, { size: 16, color: '#8a5a2b' });
        if (target) D.text(ctx, `（${target[0]}，${target[1]}）`, 672, 100, { size: 34, color: '#c92a2a' });
        D.text(ctx, `找到 ${found} 个宝藏`, 672, 170, { size: 18, color: '#2b2840' });
        D.text(ctx, '先横着数，再竖着数', 672, 200, { size: 14, color: '#8a5a2b', weight: 'normal' });
      }
      api.loop(render);
      next();
    },
  });
})();
