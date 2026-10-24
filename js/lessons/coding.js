/* 编程小达人（第一组）：按顺序走 → 循环 → 变量 → 排序 → 海龟画图
   这里还有一个“机器人走格子”的小引擎 Sci.codeGrid，coding2.js / coding3.js 也会用到 */
(function () {
  'use strict';
  const { clamp, lerp } = Sci;
  const D = Sci.draw;

  /* ---------------- 机器人走格子 ----------------
     cfg.levels：[{ size:[列,行], start:[x,y], goal:[x,y], walls:[[x,y]...], limit, program, tip }]
     cfg.counts：可以给方块加“重复几次”；cfg.func：有“魔法块 F”（函数）；cfg.fix：程序已经写好，点方块来改（找虫子） */
  const ARROWS = { U: [0, -1, '⬆️', '上'], R: [1, 0, '➡️', '右'], D: [0, 1, '⬇️', '下'], L: [-1, 0, '⬅️', '左'] };
  const ORDER = ['U', 'R', 'D', 'L'];
  Sci.codeGrid = function (api, cfg) {
    const st = api.stage(800, 450), ctx = st.ctx;
    const C = 56, GX = 24, GY = 60, PX = 450;
    let li = 0, lv = null, prog = [], fn = [], editing = 'main', run = null, robot = null, bump = 0, t = 0;
    const solved = new Set();
    const cur = () => (editing === 'fn' ? fn : prog);
    const blocks = () => prog.length + (cfg.func ? fn.length : 0);

    function load(i) {
      li = i;
      lv = cfg.levels[i];
      prog = lv.program ? lv.program.map(b => Object.assign({}, b)) : [];
      fn = [];
      editing = 'main';
      if (editCtl) editCtl.set('main');
      reset();
      api.note(`第 ${i + 1} 关：${lv.tip}`);
    }
    function reset() {
      run = null;
      robot = { x: lv.start[0], y: lv.start[1], px: lv.start[0], py: lv.start[1] };
    }
    const blocked = (x, y) => x < 0 || y < 0 || x >= lv.size[0] || y >= lv.size[1] || lv.walls.some(w => w[0] === x && w[1] === y);
    function flatten() {
      const out = [];
      prog.forEach((b, i) => {
        const list = b.d === 'F' ? fn.map(f => Object.assign({}, f, { src: i, inF: true })) : [Object.assign({ src: i }, b)];
        list.forEach(u => { for (let k = 0; k < (u.n || 1); k++) out.push({ d: u.d, src: i, inF: !!u.inF }); });
      });
      return out;
    }
    function start() {
      if (run) return;
      if (!prog.length) { api.note('程序还是空的，先放几个方块吧！'); return; }
      reset();
      run = { steps: flatten(), k: 0, timer: 0.2, src: -1 };
      Sci.sfx('click');
    }
    function finishRun() {
      const atGoal = robot.x === lv.goal[0] && robot.y === lv.goal[1];
      run = null;
      if (!atGoal) { Sci.sfx('bad'); api.note('程序走完了，可是还没到星星那里。看看哪里需要改一改？'); return; }
      if (lv.limit && blocks() > lv.limit) { Sci.sfx('good'); api.note(`走到啦！不过用了 ${blocks()} 个方块，挑战要求不超过 ${lv.limit} 个。能更简短吗？`); return; }
      const first = !solved.has(li);
      solved.add(li);
      Sci.sfx(first ? 'star' : 'good');
      api.note(`🎉 第 ${li + 1} 关通过！用了 ${blocks()} 个方块。` + (li < cfg.levels.length - 1 ? '马上进入下一关。' : ''));
      if (solved.size >= cfg.need) api.goalDone();
      if (li < cfg.levels.length - 1) api.timeout(() => { levelCtl.set(li + 1); load(li + 1); }, 1800);
    }
    // 程序面板里每个方块的位置（找虫子时要点它）
    const blockRect = (i, inFn) => [PX + 14 + (i % 6) * 54, (inFn ? 318 : 92) + Math.floor(i / 6) * 54, 48, 46];
    api.pointer(st, {
      down(p) {
        if (!cfg.fix || run) return;
        const i = prog.findIndex((b, k) => { const [x, y, w, h] = blockRect(k, false); return p.x > x && p.x < x + w && p.y > y && p.y < y + h; });
        if (i < 0) return;
        prog[i].d = ORDER[(ORDER.indexOf(prog[i].d) + 1) % 4];
        reset();
        Sci.sfx('click');
      },
    });
    function drawBlock(b, x, y, hi) {
      D.rrect(ctx, x, y, 48, 46, 10);
      ctx.fillStyle = b.d === 'F' ? '#7048e8' : hi ? '#ffd43b' : '#4dabf7';
      ctx.fill();
      if (hi) { ctx.strokeStyle = '#e8590c'; ctx.lineWidth = 3; ctx.stroke(); }
      if (b.d === 'F') D.text(ctx, 'F', x + 24, y + 23, { size: 22, color: '#fff' });
      else D.emoji(ctx, ARROWS[b.d][2], x + 24, y + 21, 26);
      if (b.n > 1) D.text(ctx, '×' + b.n, x + 38, y + 38, { size: 13, color: '#c92a2a', stroke: '#fff', strokeWidth: 3 });
    }
    api.loop(dt => {
      t += dt;
      bump = Math.max(0, bump - dt);
      if (run) {
        run.timer -= dt;
        if (run.timer <= 0) {
          if (run.k >= run.steps.length) finishRun();
          else {
            const s = run.steps[run.k++];
            run.src = s.src;
            run.inF = s.inF;
            const [dx, dy] = ARROWS[s.d];
            const nx = robot.x + dx, ny = robot.y + dy;
            if (blocked(nx, ny)) {
              bump = 0.5;
              Sci.sfx('bad');
              api.note(`咚！第 ${s.src + 1} 个方块让机器人往${ARROWS[s.d][3]}走，撞到墙了。改一改程序吧。`);
              run = null;
            } else {
              robot.x = nx;
              robot.y = ny;
              Sci.sfx('tick');
              run.timer = 0.38;
            }
          }
        }
      }
      robot.px += (robot.x - robot.px) * Math.min(1, dt * 12);
      robot.py += (robot.y - robot.py) * Math.min(1, dt * 12);
      // 画格子
      ctx.fillStyle = '#f8f0fc';
      ctx.fillRect(0, 0, 800, 450);
      for (let y = 0; y < lv.size[1]; y++) for (let x = 0; x < lv.size[0]; x++) {
        D.rrect(ctx, GX + x * C + 2, GY + y * C + 2, C - 4, C - 4, 8);
        ctx.fillStyle = (x + y) % 2 ? '#fff' : '#f3f0ff';
        ctx.fill();
      }
      lv.walls.forEach(([x, y]) => { D.rrect(ctx, GX + x * C + 2, GY + y * C + 2, C - 4, C - 4, 8); ctx.fillStyle = '#868e96'; ctx.fill(); });
      D.emoji(ctx, '⭐', GX + lv.goal[0] * C + C / 2, GY + lv.goal[1] * C + C / 2, 36 + Math.sin(t * 4) * 3);
      const shakeX = bump > 0 ? Math.sin(bump * 60) * 5 : 0;
      D.emoji(ctx, '🤖', GX + robot.px * C + C / 2 + shakeX, GY + robot.py * C + C / 2, 40);
      D.text(ctx, `第 ${li + 1} 关` + (lv.limit ? `　最多 ${lv.limit} 个方块` : ''), GX, 32, { size: 17, align: 'left', color: '#7048e8' });
      // 程序面板
      D.rrect(ctx, PX, 20, 340, cfg.func ? 410 : 300, 16);
      ctx.fillStyle = '#fff';
      ctx.fill();
      D.text(ctx, cfg.fix ? '程序（点方块可以修改它）' : editing === 'main' ? '主程序 ✏️' : '主程序', PX + 170, 44, { size: 15, color: '#495057' });
      D.text(ctx, `${blocks()} 个方块`, PX + 320, 44, { size: 13, align: 'right', color: '#868e96', weight: 'normal' });
      prog.forEach((b, i) => { const [x, y] = blockRect(i, false); drawBlock(b, x, y, run && run.src === i); });
      if (!prog.length) D.text(ctx, cfg.fix ? '' : '点下面的按钮放方块', PX + 170, 120, { size: 15, color: '#adb5bd', weight: 'normal' });
      if (cfg.func) {
        D.text(ctx, editing === 'fn' ? '魔法块 F ✏️' : '魔法块 F', PX + 170, 300, { size: 15, color: '#7048e8' });
        fn.forEach((b, i) => { const [x, y] = blockRect(i, true); drawBlock(b, x, y, run && run.inF && run.src >= 0 && prog[run.src] && prog[run.src].d === 'F'); });
      }
      D.text(ctx, `通过 ${solved.size} / ${cfg.levels.length} 关`, 780, 440, { size: 14, align: 'right', color: '#7048e8' });
    });

    // 控件
    const levelCtl = api.choice(cfg.levels.map((_, i) => [i, `第${i + 1}关`]), 0, v => load(v));
    let editCtl = null;
    if (!cfg.fix) {
      const row = api.row();
      ORDER.forEach(d => api.button(ARROWS[d][2], () => {
        if (run) return;
        if (cur().length >= 18) { api.note('方块太多啦！'); return; }
        cur().push({ d, n: 1 });
        Sci.sfx('pop');
      }, row));
      if (cfg.func) api.button('🔮 F', () => { if (!run && editing === 'main') { prog.push({ d: 'F', n: 1 }); Sci.sfx('pop'); } }, row);
      if (cfg.counts) {
        const row2 = api.row();
        [2, 3, 4, 5, 6].forEach(n => api.button('×' + n, () => {
          const list = cur(), b = list[list.length - 1];
          if (!b || run) return;
          if (b.d === 'F') { api.note('魔法块不能乘哦。'); return; }
          b.n = n;
          Sci.sfx('click');
        }, row2));
      }
      if (cfg.func) {
        const row3 = api.row();
        editCtl = api.choice([['main', '✏️ 编辑主程序'], ['fn', '✏️ 编辑魔法块 F']], 'main', v => { editing = v; }, row3);
      }
    }
    const rowRun = api.row();
    api.button('▶ 运行', start, rowRun);
    if (!cfg.fix) {
      api.button('⌫ 删掉最后一个', () => { if (!run) { cur().pop(); reset(); } }, rowRun);
      api.button('🧹 清空', () => { if (!run) { cur().length = 0; reset(); } }, rowRun);
    } else api.button('🔄 恢复原样', () => { if (!run) load(li); }, rowRun);
    load(0);
  };

  /* ================= 1. 按顺序走 ================= */
  Sci.register({
    id: 'sequence',
    subject: 'coding',
    level: 1,
    emoji: '🤖',
    title: '按顺序走',
    desc: '给机器人排好指令，一步一步走到星星',
    intro: '机器人很听话，可是它只会按你给的指令一步一步做，一点也不会多想。用箭头方块告诉它往哪里走：每个方块走一格。排好以后点“运行”，看看它能不能绕过墙壁，走到星星那里！',
    goal: '通过 3 关',
    fact: '<p>给电脑的一条条指令合起来，就叫<b>程序</b>。电脑会严格按照<b>顺序</b>，一条接一条地执行。</p><p>顺序非常重要：先“往右”再“往上”，和先“往上”再“往右”，机器人走的路完全不同。少一步、多一步，或者顺序错了，机器人都到不了目的地。</p><p>💻 写程序的人叫<b>程序员</b>。手机里的游戏、导航、动画片的特效，都是程序员一行一行写出来的。</p>',
    quiz: [
      { q: '电脑执行程序的方式是？', options: ['严格按照顺序一条一条执行', '自己想怎么做就怎么做'], answer: 0, explain: '电脑会按顺序执行每一条指令。' },
      { q: '机器人在左下角，星星在它右边 2 格、上边 1 格，下面哪个程序能走到？', options: ['➡️➡️⬆️', '➡️⬆️⬆️'], answer: 0, explain: '往右 2 格，再往上 1 格。' },
    ],
    mount(api) {
      Sci.codeGrid(api, {
        need: 3,
        levels: [
          { size: [6, 5], start: [0, 2], goal: [4, 2], walls: [], tip: '让机器人走到星星那里。' },
          { size: [6, 5], start: [0, 4], goal: [3, 1], walls: [[1, 3], [2, 3], [1, 2]], tip: '有墙挡着，要绕过去哦。' },
          { size: [6, 5], start: [0, 0], goal: [5, 4], walls: [[1, 0], [1, 1], [1, 2], [3, 2], [3, 3], [3, 4], [5, 1], [5, 2], [2, 4], [3, 0]], tip: '弯弯曲曲的小路，仔细数一数格子。' },
          { size: [6, 5], start: [2, 4], goal: [2, 0], walls: [[1, 2], [2, 2], [3, 2], [0, 1]], tip: '星星就在正上方，可是中间有墙。' },
        ],
      });
    },
  });

  /* ================= 2. 循环 ================= */
  Sci.register({
    id: 'loops',
    subject: 'coding',
    level: 2,
    emoji: '🔁',
    title: '循环',
    desc: '一样的事做很多遍？用“重复”就行',
    intro: '如果机器人要往右走 6 格，难道要放 6 个一样的方块吗？太麻烦啦！放一个箭头，再点“×6”，它就会把这一步重复 6 次。这就是“循环”。每一关都限制了方块的数量，用循环把程序写得又短又好！',
    goal: '在方块数量限制内通过 3 关',
    fact: '<p>让电脑把同一件事<b>重复做很多遍</b>，叫做<b>循环</b>。“往右走 ×6”比放 6 个“往右走”简单多了，也更不容易出错。</p><p>电脑最擅长做重复的事：一秒钟能重复几亿次，从来不嫌累。动画里一闪一闪的星星、游戏里一波一波的怪物，都用到了循环。</p><p>🌍 生活里的“循环”：每天早上刷牙、一年四季周而复始、跳绳一下接一下。</p>',
    quiz: [
      { q: '“重复 3 次：拍手”，一共拍几下手？', options: ['1 下', '3 下', '6 下'], answer: 1, explain: '重复 3 次，就拍 3 下。' },
      { q: '用循环写程序有什么好处？', options: ['程序更短，不容易出错', '让电脑变慢'], answer: 0, explain: '循环能把重复的部分写得很简洁。' },
    ],
    mount(api) {
      Sci.codeGrid(api, {
        need: 3,
        counts: true,
        levels: [
          { size: [7, 5], start: [0, 2], goal: [6, 2], walls: [], limit: 1, tip: '只能用 1 个方块！放一个“➡️”，再点“×6”。' },
          { size: [7, 5], start: [0, 4], goal: [5, 0], walls: [], limit: 2, tip: '只能用 2 个方块。' },
          { size: [7, 5], start: [0, 0], goal: [6, 4], walls: [[4, 0], [4, 1], [4, 2], [4, 3], [1, 1], [1, 2], [1, 3], [1, 4]], limit: 3, tip: '只能用 3 个方块，绕过两道墙。' },
          { size: [7, 5], start: [0, 4], goal: [6, 0], walls: [[1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [4, 2], [5, 2], [6, 2], [4, 1], [5, 1], [6, 1], [0, 0], [1, 0], [2, 0], [1, 1], [2, 1], [0, 1]], limit: 4, tip: '像爬楼梯一样，只能用 4 个方块。' },
        ],
      });
    },
  });

  /* ================= 3. 变量 ================= */
  const VAR_PROGS = [
    { lines: ['分数 = 0', '吃到苹果：分数 = 分数 + 1', '吃到苹果：分数 = 分数 + 1', '吃到苹果：分数 = 分数 + 1'], ask: '分数', opts: [1, 3, 4] },
    { lines: ['金币 = 10', '买糖果：金币 = 金币 − 3', '捡到宝箱：金币 = 金币 + 5', '买气球：金币 = 金币 − 4'], ask: '金币', opts: [8, 12, 4] },
    { lines: ['x = 2', 'x = x × 3', 'x = x + 4'], ask: 'x', opts: [9, 10, 14] },
    { lines: ['次数 = 0', '重复 4 次：', '　　次数 = 次数 + 2'], ask: '次数', opts: [2, 6, 8] },
    { lines: ['a = 5', 'b = 3', 'a = a + b', 'b = a − b'], ask: 'b', opts: [3, 5, 8] },
  ];
  // 一行一行执行，返回每一步之后各个变量的值
  function traceVars(lines) {
    const vars = {}, snaps = [];
    const val = s => s.trim().split(/\s*([+−×])\s*/).reduce((acc, tok, i, arr) => {
      if (i === 0) return isNaN(+tok) ? vars[tok] : +tok;
      if (i % 2 === 1) return acc;
      const op = arr[i - 1], n = isNaN(+tok) ? vars[tok] : +tok;
      return op === '+' ? acc + n : op === '−' ? acc - n : acc * n;
    }, 0);
    let repeat = 1;
    lines.forEach((ln, idx) => {
      const body = ln.replace(/^[^：]*：/, '').trim();
      const m = ln.match(/重复 (\d+) 次/);
      if (m) { repeat = +m[1]; snaps.push({ idx, vars: Object.assign({}, vars) }); return; }
      const [name, expr] = body.split('=');
      for (let k = 0; k < (ln.startsWith('　') ? repeat : 1); k++) {
        vars[name.trim()] = val(expr);
        snaps.push({ idx, vars: Object.assign({}, vars) });
      }
    });
    return snaps;
  }

  Sci.register({
    id: 'variables',
    subject: 'coding',
    level: 3,
    emoji: '📦',
    title: '变量',
    desc: '程序里会变的“小盒子”',
    intro: '游戏里的分数、金币、生命值，在程序里都存放在一个个叫“变量”的小盒子里。程序一行一行地执行，盒子里的数字就会跟着变。先读一读程序，猜一猜最后盒子里是几，再点“一步一步运行”看看你猜得对不对！',
    goal: '猜对 4 个程序的结果',
    fact: '<p><b>变量</b>就像一个贴着名字的小盒子，里面可以放一个数。程序可以随时<b>读取</b>和<b>改变</b>盒子里的数。</p><p>“分数 = 分数 + 1”的意思是：先看看盒子里原来是几，加上 1，再把结果放回盒子里。所以每执行一次，分数就多 1。</p><p>🎮 游戏里的分数、闯关的关卡数、角色的位置，都是用变量记下来的。</p>',
    quiz: [
      { q: '分数 = 5，执行“分数 = 分数 + 2”以后，分数是几？', options: ['2', '5', '7'], answer: 2, explain: '原来是 5，加 2 得 7。' },
      { q: '变量最像下面哪样东西？', options: ['贴着名字、可以换东西的小盒子', '永远不变的石头'], answer: 0, explain: '变量的值可以改变。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let pi = 0, guess = null, step = -1, playing = false, timer = 0, right = 0, t = 0;
      const answered = new Set();
      let snaps = traceVars(VAR_PROGS[0].lines);

      function load(i) {
        pi = i;
        guess = null;
        step = -1;
        playing = false;
        snaps = traceVars(VAR_PROGS[i].lines);
        api.note(`程序 ${i + 1}：读一读，猜猜最后“${VAR_PROGS[i].ask}”是几？在右边选一个答案。`);
      }
      api.pointer(st, {
        down(p) {
          if (guess !== null || p.x < 520) return;
          const i = Math.floor((p.y - 250) / 56);
          const o = VAR_PROGS[pi].opts[i];
          if (i < 0 || i > 2 || o == null) return;
          guess = o;
          Sci.sfx('click');
          api.note(`你猜是 ${o}。点“一步一步运行”，看看对不对！`);
        },
      });
      function play() {
        if (playing) return;
        if (guess === null) { api.note('先在右边猜一个答案哦。'); return; }
        step = -1;
        playing = true;
        timer = 0.3;
      }
      api.loop(dt => {
        t += dt;
        const P = VAR_PROGS[pi];
        if (playing) {
          timer -= dt;
          if (timer <= 0) {
            step++;
            Sci.sfx('tick');
            timer = 0.9;
            if (step >= snaps.length - 1) {
              playing = false;
              const ans = snaps[snaps.length - 1].vars[P.ask];
              if (ans === guess) {
                if (!answered.has(pi)) { answered.add(pi); right++; }
                Sci.sfx('good');
                api.note(`✅ 猜对了！最后“${P.ask}”是 ${ans}。（猜对 ${right}/4）`);
                if (right >= 4) api.goalDone();
              } else {
                Sci.sfx('bad');
                api.note(`最后“${P.ask}”是 ${ans}，不是 ${guess}。看看每一步盒子里的数是怎么变的。`);
              }
            }
          }
        }
        ctx.fillStyle = '#fff0f6';
        ctx.fillRect(0, 0, 800, 450);
        // 程序
        D.rrect(ctx, 20, 20, 470, 410, 16);
        ctx.fillStyle = '#212529';
        ctx.fill();
        D.text(ctx, `程序 ${pi + 1}`, 40, 46, { size: 16, align: 'left', color: '#ffd43b' });
        const curIdx = step >= 0 ? snaps[Math.min(step, snaps.length - 1)].idx : -1;
        P.lines.forEach((ln, i) => {
          if (i === curIdx) { ctx.fillStyle = 'rgba(255,212,59,.25)'; ctx.fillRect(30, 72 + i * 50, 450, 40); }
          D.text(ctx, `${i + 1}  ${ln}`, 44, 92 + i * 50, { size: 19, align: 'left', color: i === curIdx ? '#ffe066' : '#e9ecef', weight: 'normal' });
        });
        // 变量盒子
        const vars = step >= 0 ? snaps[Math.min(step, snaps.length - 1)].vars : {};
        const names = Object.keys(snaps[snaps.length - 1].vars);
        names.forEach((n, i) => {
          const x = 560 + i * 110, y = 60;
          D.rrect(ctx, x - 45, y, 90, 80, 14);
          ctx.fillStyle = '#ffe8cc';
          ctx.fill();
          ctx.strokeStyle = '#e8590c';
          ctx.lineWidth = 3;
          ctx.stroke();
          D.text(ctx, vars[n] == null ? '?' : String(vars[n]), x, y + 42, { size: 30, color: '#d9480f' });
          D.text(ctx, n, x, y + 100, { size: 16 });
        });
        D.text(ctx, `最后“${P.ask}”是几？`, 650, 220, { size: 17 });
        P.opts.forEach((o, i) => {
          const y = 250 + i * 56;
          D.rrect(ctx, 560, y, 180, 46, 12);
          ctx.fillStyle = guess === o ? '#d0bfff' : '#fff';
          ctx.fill();
          ctx.strokeStyle = '#b197fc';
          ctx.lineWidth = 2;
          ctx.stroke();
          D.text(ctx, String(o), 650, y + 23, { size: 22 });
        });
      });
      api.choice(VAR_PROGS.map((_, i) => [i, `程序 ${i + 1}`]), 0, v => load(v));
      api.button('▶ 一步一步运行', play);
      load(0);
    },
  });

  /* ================= 4. 排序 ================= */
  Sci.register({
    id: 'sorting',
    subject: 'coding',
    level: 4,
    emoji: '📶',
    title: '排序',
    desc: '把乱七八糟的柱子从矮到高排好',
    intro: '电脑经常要把东西排好顺序：成绩从高到低、文件按名字排列……可电脑一次只能比较两个数。你来当一回电脑：每次只能交换挨在一起的两根柱子，把它们从矮到高排好。排完以后，再看看电脑用“冒泡排序”是怎么做的！',
    goal: '只交换相邻的柱子，把柱子从矮到高排好',
    fact: '<p>解决问题的一步一步的方法，叫做<b>算法</b>。把东西排好顺序的算法叫<b>排序算法</b>。</p><p><b>冒泡排序</b>：从左到右，两个两个地比较，左边的比右边高，就交换它们。走完一遍，最高的就像气泡一样“冒”到了最右边。重复几遍，就全部排好了。</p><p>⚡ 数据很多时，冒泡排序太慢了。科学家发明了“快速排序”等更聪明的算法，能在一眨眼的工夫给几百万个数排好队。</p>',
    quiz: [
      { q: '冒泡排序每次比较几个数？', options: ['相邻的 2 个', '全部一起'], answer: 0, explain: '每次比较相邻的两个，需要时交换。' },
      { q: '解决问题的一步一步的方法，叫做？', options: ['算法', '变量', '电池'], answer: 0, explain: '算法就是解决问题的步骤。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const N = 8, BW = 60, X0 = 130, B = 380;
      let bars = [], sel = -1, swaps = 0, auto = null, done = false, t = 0, hi = [];
      function shuffle() {
        do bars = Sci.shuffle([1, 2, 3, 4, 5, 6, 7, 8]); while (bars.every((v, i) => !i || bars[i - 1] < v));
        sel = -1;
        swaps = 0;
        auto = null;
        hi = [];
        api.note('点一根柱子，再点它旁边的柱子，交换它们的位置。');
      }
      const sorted = () => bars.every((v, i) => !i || bars[i - 1] < v);
      api.pointer(st, {
        down(p) {
          if (auto) return;
          const i = Math.floor((p.x - X0 + 5) / (BW + 10));
          if (i < 0 || i >= N) return;
          if (sel < 0) { sel = i; Sci.sfx('pop'); return; }
          if (i === sel) { sel = -1; return; }
          if (Math.abs(i - sel) !== 1) { Sci.sfx('bad'); api.note('只能交换挨在一起的两根柱子哦。'); sel = i; return; }
          [bars[i], bars[sel]] = [bars[sel], bars[i]];
          sel = -1;
          swaps++;
          Sci.sfx('click');
          if (sorted()) {
            Sci.sfx('star');
            api.note(`🎉 排好啦！你交换了 ${swaps} 次。点“看电脑怎么排”，看看冒泡排序要交换几次。`);
            if (!done) { done = true; api.goalDone(); }
          }
        },
      });
      function autoSort() {
        if (auto) return;
        if (sorted()) shuffle();
        auto = { i: 0, j: 0, timer: 0.4, cmp: 0, sw: 0 };
        api.note('电脑开始冒泡排序：两个两个比较，左边高就交换。');
      }
      api.loop(dt => {
        t += dt;
        if (auto) {
          auto.timer -= dt;
          if (auto.timer <= 0) {
            auto.timer = 0.35;
            const { i, j } = auto;
            if (i >= N - 1) {
              hi = [];
              api.note(`电脑排好了：比较了 ${auto.cmp} 次，交换了 ${auto.sw} 次。`);
              auto = null;
            } else {
              hi = [j, j + 1];
              auto.cmp++;
              if (bars[j] > bars[j + 1]) { [bars[j], bars[j + 1]] = [bars[j + 1], bars[j]]; auto.sw++; Sci.sfx('click'); } else Sci.sfx('tick');
              auto.j++;
              if (auto.j >= N - 1 - i) { auto.j = 0; auto.i++; }
            }
          }
        }
        ctx.fillStyle = '#f8f9ff';
        ctx.fillRect(0, 0, 800, 450);
        bars.forEach((v, i) => {
          const x = X0 + i * (BW + 10), h = v * 36;
          D.rrect(ctx, x, B - h, BW, h, 8);
          ctx.fillStyle = hi.indexOf(i) >= 0 ? '#ff922b' : sel === i ? '#fab005' : Sci.rgb(Sci.mixColor([116, 192, 252], [76, 110, 245], v / 8));
          ctx.fill();
          D.text(ctx, String(v), x + BW / 2, B + 22, { size: 18 });
        });
        D.text(ctx, auto ? `电脑：比较 ${auto.cmp} 次，交换 ${auto.sw} 次` : `你交换了 ${swaps} 次`, 400, 40, { size: 20, color: '#2b2840' });
        if (sorted() && !auto) D.text(ctx, '✅ 从矮到高排好了', 400, 75, { size: 18, color: '#2b8a3e' });
      });
      api.button('🔀 打乱', shuffle);
      api.button('🤖 看电脑怎么排', autoSort);
      shuffle();
    },
  });

  /* ================= 5. 海龟画图 ================= */
  const TURTLE_GOALS = [['tri', '三角形', 3, 120], ['sq', '正方形', 4, 90], ['hex', '六边形', 6, 60], ['star', '五角星', 5, 144]];

  Sci.register({
    id: 'turtle',
    subject: 'coding',
    level: 5,
    emoji: '🐢',
    title: '海龟画图',
    desc: '用“重复”和“转角”画出各种图形',
    intro: '小海龟背着一支笔，它只听两种指令：“前进几步”和“右转几度”。把这两条指令放进“重复”里，就能画出漂亮的图形！调一调重复的次数和转的角度，画出三角形、正方形、六边形，还有最难的五角星！',
    goal: '画出三角形、正方形、六边形和五角星',
    fact: '<p>画正多边形的秘诀：<b>重复 n 次（前进，右转 360° ÷ n）</b>。海龟转完一整圈（360°），就回到了起点，图形就闭合了。</p><p>三角形每次转 120°，正方形转 90°，六边形转 60°。五角星最特别：每次转 <b>144°</b>，5 次一共转了 720°，也就是两整圈！</p><p>🐢 “海龟画图”来自一种叫 Logo 的儿童编程语言，很多程序员小时候都是从它开始学编程的。</p>',
    quiz: [
      { q: '让海龟画正方形，每次应该右转多少度？', options: ['60°', '90°', '120°'], answer: 1, explain: '360° ÷ 4 = 90°。' },
      { q: '画正六边形，要重复几次？', options: ['4 次', '5 次', '6 次'], answer: 2, explain: '六边形有 6 条边。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let n = 4, len = 100, ang = 60, drawn = 0, drawing = false, t = 0;
      const got = new Set();
      function go() {
        if (drawing) return;
        drawn = 0;
        drawing = true;
        Sci.sfx('click');
      }
      function check() {
        const g = TURTLE_GOALS.find(x => x[2] === n && x[3] === ang);
        if (g) {
          const first = !got.has(g[0]);
          got.add(g[0]);
          Sci.sfx(first ? 'star' : 'good');
          api.note(`✨ 画出了${g[1]}！重复 ${n} 次，每次转 ${ang}°，一共转了 ${n * ang}°。（${got.size}/4）`);
          if (got.size === 4) api.goalDone();
        } else if ((n * ang) % 360 === 0) api.note(`画出了一个闭合的图形！一共转了 ${n * ang}°。`);
        else api.note(`海龟一共转了 ${n * ang}°，不是 360° 的整数倍，图形没有闭合。`);
      }
      api.loop(dt => {
        t += dt;
        if (drawing) {
          drawn += dt * 2.2;
          if (drawn >= n) { drawn = n; drawing = false; check(); }
        }
        ctx.fillStyle = '#f4fce3';
        ctx.fillRect(0, 0, 800, 450);
        // 代码
        D.rrect(ctx, 520, 30, 260, 150, 14);
        ctx.fillStyle = '#212529';
        ctx.fill();
        D.text(ctx, `重复 ${n} 次：`, 540, 66, { size: 19, align: 'left', color: '#ffd43b' });
        D.text(ctx, `前进 ${len} 步`, 572, 104, { size: 19, align: 'left', color: '#8ce99a' });
        D.text(ctx, `右转 ${ang} 度`, 572, 142, { size: 19, align: 'left', color: '#74c0fc' });
        TURTLE_GOALS.forEach((g, i) => D.text(ctx, `${got.has(g[0]) ? '✅' : '⬜'} ${g[1]}`, 540 + (i % 2) * 120, 220 + Math.floor(i / 2) * 32, { size: 16, align: 'left' }));
        // 画线
        let x = 250 - len / 2, y = 100, a = 0;
        ctx.strokeStyle = '#2f9e44';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        const full = Math.floor(drawn), part = drawn - full;
        for (let i = 0; i < Math.ceil(drawn); i++) {
          const L = i < full ? len : len * part;
          x += Math.cos(a) * L;
          y += Math.sin(a) * L;
          ctx.lineTo(x, y);
          if (i < full) a += ang * Math.PI / 180;
        }
        ctx.stroke();
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a + Math.PI / 2);
        D.emoji(ctx, '🐢', 0, 0, 30);
        ctx.restore();
      });
      api.slider('重复次数', 3, 12, 1, n, v => { n = v; drawn = 0; });
      api.slider('前进步数', 40, 180, 10, len, v => { len = v; drawn = 0; });
      api.choice([36, 45, 60, 72, 90, 120, 144].map(a => [a, a + '°']), ang, v => { ang = v; drawn = 0; });
      api.button('🐢 开始画', go);
      api.note('👆 设置好重复次数和转角，点“开始画”。');
    },
  });
})();
