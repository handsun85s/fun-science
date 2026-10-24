/* 编程小达人（第三组）：找虫子 → 如果……就…… → 魔法块（函数）→ 迷宫算法 → 最短路径 */
(function () {
  'use strict';
  const { clamp, lerp } = Sci;
  const D = Sci.draw;

  /* ================= 11. 找虫子 ================= */
  Sci.register({
    id: 'bugfix',
    subject: 'coding',
    level: 1,
    emoji: '🐛',
    title: '找虫子',
    desc: '程序出错了！找到写错的那一步并改正',
    intro: '程序员把程序里的错误叫做“虫子”（bug），找出并改正错误叫“捉虫”。下面的程序本来是让机器人走到星星的，可是有一步写错了！先点“运行”看看机器人在哪里出了问题，再点那个写错的方块把它改对。',
    goal: '修好 3 个有错误的程序',
    fact: '<p>程序里的错误叫 <b>bug</b>（虫子），找错、改错叫 <b>debug</b>（捉虫）。据说很早以前，一只飞蛾钻进了电脑里，让电脑出了故障，从此人们就把程序错误叫做“虫子”。</p><p>捉虫的好办法：<b>一步一步地看</b>，找到“从哪一步开始和想的不一样”，问题往往就在那里。</p><p>💡 每个程序员每天都在捉虫，出错一点也不可怕，会找错、会改错才是真本领！</p>',
    quiz: [
      { q: '程序员说的“bug”是指什么？', options: ['程序里的错误', '一只真的虫子'], answer: 0, explain: 'bug 就是程序里的错误。' },
      { q: '程序运行结果不对时，好的办法是？', options: ['一步一步检查，找到出错的地方', '把电脑关掉'], answer: 0, explain: '逐步检查，就能找到出错的那一步。' },
    ],
    mount(api) {
      const P = s => s.split('').map(d => ({ d, n: 1 }));
      Sci.codeGrid(api, {
        need: 3,
        fix: true,
        levels: [
          { size: [6, 4], start: [0, 1], goal: [4, 1], walls: [], program: P('RRUR'), tip: '机器人要一直往右走到星星，哪一步写错了？' },
          { size: [5, 4], start: [0, 3], goal: [3, 0], walls: [[1, 2], [1, 3], [2, 2]], program: P('UUURRD'), tip: '先往上走到顶，再往右，最后一步好像不对劲……' },
          { size: [6, 4], start: [0, 0], goal: [4, 3], walls: [[1, 1], [2, 1], [3, 1], [3, 2]], program: P('RRRRDLD'), tip: '机器人撞墙了！找找是哪一步。' },
        ],
      });
    },
  });

  /* ================= 12. 如果……就…… ================= */
  const THINGS = [['🍎', '苹果', ['red', 'fruit', 'round']], ['🍌', '香蕉', ['fruit']], ['⚽', '足球', ['round']], ['🧸', '小熊', []], ['🍓', '草莓', ['red', 'fruit']], ['🎈', '红气球', ['red', 'round']], ['🍊', '橙子', ['fruit', 'round']], ['🚗', '红色小车', ['red']]];
  const CONDS = [['fruit', '是水果'], ['red', '是红色的'], ['round', '是圆的']];
  const SORT_TASKS = [['fruit', '把水果放进左边的果篮 🧺，其他东西放右边'], ['red', '把红色的东西放进左边的红盒子，其他放右边'], ['round', '把圆圆的东西放进左边的球筐，其他放右边']];

  Sci.register({
    id: 'conditions',
    subject: 'coding',
    level: 2,
    emoji: '🔀',
    title: '如果……就……',
    desc: '让机器人自己判断，把东西分到不同的地方',
    intro: '传送带上源源不断地送来各种东西，机器人要把它们分开放。你来给机器人写一条判断规则：“如果 ____，就放左边；否则放右边。”选对条件，点“运行”，看看机器人能不能完成每个分拣任务！',
    goal: '写出正确的判断规则，完成 3 个分拣任务',
    fact: '<p>“<b>如果</b>……<b>就</b>……<b>否则</b>……”叫做<b>条件判断</b>。程序会先检查条件是不是成立，成立就做一件事，不成立就做另一件事。</p><p>有了条件判断，程序就能根据不同的情况做出不同的反应：游戏里“如果碰到敌人，就减一条命”；扫地机器人“如果前面有墙，就转弯”。</p><p>🌂 生活里也常用：如果下雨，就带伞；否则戴帽子。</p>',
    quiz: [
      { q: '“如果下雨，就带伞，否则戴帽子”。今天晴天，应该？', options: ['带伞', '戴帽子'], answer: 1, explain: '条件不成立，就执行“否则”的部分。' },
      { q: '扫地机器人碰到墙会转弯，用到了什么？', options: ['条件判断', '变量'], answer: 0, explain: '如果前面有墙，就转弯。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let task = 0, cond = 'red', run = null, t = 0;
      const done = new Set();
      function start() {
        if (run) return;
        run = { items: Sci.shuffle(THINGS).map((th, i) => ({ th, x: -60 - i * 110, side: 0, y: 200, ok: null })), wrong: 0 };
        Sci.sfx('click');
        api.note(`机器人开始分拣：如果${CONDS.find(c => c[0] === cond)[1]}，就放左边；否则放右边。`);
      }
      api.loop(dt => {
        t += dt;
        if (run) {
          let all = true;
          run.items.forEach(it => {
            if (it.side === 0) {
              it.x += dt * 320;
              if (it.x >= 400) {
                const yes = it.th[2].indexOf(cond) >= 0, should = it.th[2].indexOf(SORT_TASKS[task][0]) >= 0;
                it.side = yes ? -1 : 1;
                it.ok = yes === should;
                if (!it.ok) run.wrong++;
                Sci.sfx(it.ok ? 'tick' : 'bad');
              }
              all = false;
            } else if (it.y < 360) { it.y += dt * 300; it.x += it.side * dt * 160; all = false; }
          });
          if (all) {
            const w = run.wrong;
            run.doneAt = run.doneAt || t;
            if (t - run.doneAt > 0.6) {
              run = null;
              if (!w) {
                const first = !done.has(task);
                done.add(task);
                Sci.sfx(first ? 'star' : 'good');
                api.note(`🎉 全部分对了！规则“如果${CONDS.find(c => c[0] === cond)[1]}”完成了任务。` + (done.size < 3 ? '换下一个任务吧。' : ''));
                if (done.size === 3) api.goalDone();
                else if (task < 2) api.timeout(() => { taskCtl.set(task + 1); task++; }, 1600);
              } else api.note(`有 ${w} 样东西放错了。想一想：这个任务要分的是什么样的东西？`);
            }
          }
        }
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 450);
        // 传送带
        ctx.fillStyle = '#495057';
        ctx.fillRect(0, 225, 420, 20);
        for (let x = (t * 220) % 40 - 40; x < 420; x += 40) { ctx.fillStyle = '#868e96'; ctx.fillRect(x, 228, 20, 14); }
        D.emoji(ctx, '🤖', 440, 180, 56);
        // 两个篮子
        D.rrect(ctx, 150, 370, 220, 70, 14);
        ctx.fillStyle = '#d3f9d8';
        ctx.fill();
        D.text(ctx, '左边：条件成立', 260, 405, { size: 15, color: '#2b8a3e' });
        D.rrect(ctx, 470, 370, 220, 70, 14);
        ctx.fillStyle = '#e9ecef';
        ctx.fill();
        D.text(ctx, '右边：否则', 580, 405, { size: 15, color: '#495057' });
        if (run) run.items.forEach(it => {
          if (it.x < -40) return;
          D.emoji(ctx, it.th[0], it.x, it.y, 44);
          if (it.ok === false && it.y >= 340) D.text(ctx, '✖', it.x + 20, it.y - 20, { size: 18, color: '#e03131' });
        });
        // 规则和任务
        D.rrect(ctx, 20, 20, 760, 120, 14);
        ctx.fillStyle = '#fff';
        ctx.fill();
        D.text(ctx, `📋 任务 ${task + 1}：${SORT_TASKS[task][1]}`, 40, 50, { size: 17, align: 'left', color: '#c0620a', maxW: 720 });
        D.text(ctx, `🤖 规则：如果【${CONDS.find(c => c[0] === cond)[1]}】，就放左边；否则放右边。`, 40, 92, { size: 18, align: 'left', color: '#364fc7' });
        D.text(ctx, SORT_TASKS.map((s, i) => (done.has(i) ? '✅' : '⬜') + '任务' + (i + 1)).join('　'), 40, 124, { size: 14, align: 'left', color: '#6f6a85' });
      });
      const taskCtl = api.choice(SORT_TASKS.map((s, i) => [i, `任务 ${i + 1}`]), 0, v => { if (!run) task = v; });
      const r2 = api.row();
      api.choice(CONDS.map(c => [c[0], '如果' + c[1]]), cond, v => { if (!run) cond = v; }, r2);
      api.button('▶ 运行', start, r2);
      api.note('👆 读一读任务，给机器人选一个判断条件，再点“运行”。');
    },
  });

  /* ================= 13. 魔法块（函数） ================= */
  Sci.register({
    id: 'functions',
    subject: 'coding',
    level: 3,
    emoji: '✨',
    title: '魔法块（函数）',
    desc: '把常用的一串指令打包，起个名字反复用',
    intro: '机器人的路线里，常常有一串动作一遍又一遍地出现。把这串动作装进“魔法块 F”里，以后只要放一个 F，就等于做了这一整串动作！这就是“函数”。每一关都限制了方块总数，先编辑魔法块，再在主程序里用它吧。',
    goal: '用魔法块，在方块数量限制内通过 3 关',
    fact: '<p>把一串经常要用的指令打包起来，起一个名字，需要时喊一声名字就能执行，这就是<b>函数</b>。</p><p>函数让程序更短、更清楚：修改函数里的内容，所有用到它的地方都会跟着改变。程序员会把“画正方形”“跳一下”这样的常用功能做成函数，反复使用。</p><p>🍳 生活中的“函数”：妈妈说“做一份炒鸡蛋”，背后其实是打蛋、开火、倒油、翻炒……一整串步骤。</p>',
    quiz: [
      { q: '编程里的“函数”最像什么？', options: ['打包好的一串指令，叫名字就能用', '一个数字'], answer: 0, explain: '函数把一串指令打包，可以反复调用。' },
      { q: '魔法块 F 里有 3 个方块，主程序放了 4 个 F，机器人一共走几步？', options: ['7 步', '12 步', '3 步'], answer: 1, explain: '3 × 4 = 12。' },
    ],
    mount(api) {
      Sci.codeGrid(api, {
        need: 3,
        func: true,
        levels: [
          { size: [7, 5], start: [0, 4], goal: [6, 1], walls: [[3, 4], [4, 4], [5, 4], [6, 4], [5, 3], [6, 3]], limit: 6, tip: '像爬楼梯：每一级都是“➡️➡️⬆️”。把它装进魔法块 F！' },
          { size: [7, 5], start: [0, 3], goal: [6, 3], walls: [[1, 3], [3, 3], [5, 3]], limit: 7, tip: '跨过 3 个小障碍：每次都是“⬆️➡️➡️⬇️”。' },
          { size: [6, 5], start: [0, 0], goal: [4, 4], walls: [[2, 0], [3, 0], [4, 0], [5, 0], [0, 1], [3, 1], [4, 1], [5, 1], [0, 2], [1, 2], [4, 2], [5, 2], [0, 3], [1, 3], [2, 3], [5, 3], [0, 4], [1, 4], [2, 4], [3, 4]], limit: 6, tip: '斜斜的台阶，找一找重复的部分。' },
        ],
      });
    },
  });

  /* ================= 14. 迷宫算法 ================= */
  const MAZES = [
    ['#########', '#S..#...#', '#.#.#.#.#', '#.#...#.#', '#.#####.#', '#......E#', '#########'],
    ['#########', '#S#.....#', '#.#.###.#', '#...#...#', '###.#.###', '#...#..E#', '#########'],
    ['#########', '#S......#', '###.###.#', '#...#...#', '#.###.#.#', '#.....#E#', '#########'],
  ];
  const RULES = [['right', '✋ 右手扶墙走'], ['left', '🤚 左手扶墙走'], ['straight', '➡️ 一直往前，碰墙就右转']];
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // 上 右 下 左

  Sci.register({
    id: 'maze',
    subject: 'coding',
    level: 4,
    emoji: '🌀',
    title: '迷宫算法',
    desc: '一条规则，走出所有的迷宫',
    intro: '机器人被困在迷宫里了！它看不到整个迷宫，只能看见身边的墙。有没有一条简单的规则，让它不管在哪个迷宫里都能走出来？选一条走迷宫的规则，看看机器人能不能走出 3 个不同的迷宫。',
    goal: '让机器人走出全部 3 个迷宫',
    fact: '<p><b>右手扶墙法</b>：走迷宫时，一直用右手摸着墙往前走。能右转就右转，不能就直走，再不能就左转。对于墙壁都连在一起的迷宫，这个方法一定能走出来！左手扶墙也一样。</p><p>像这样不管遇到什么迷宫，按一套固定的步骤就能解决问题，就是一个好的<b>算法</b>。</p><p>🤖 扫地机器人沿着墙边打扫，用的就是类似的方法。“一直往前，碰墙右转”这条规则就不太可靠，有时会在原地兜圈子。</p>',
    quiz: [
      { q: '用“右手扶墙法”走迷宫，前面和右边都有墙时，应该？', options: ['左转', '后退', '停下来'], answer: 0, explain: '不能右转也不能直走，就向左转。' },
      { q: '一套固定的、能解决一类问题的步骤，叫做？', options: ['算法', '密码', '变量'], answer: 0, explain: '算法就是解决问题的步骤。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const C = 46, GX = 40, GY = 60;
      let mi = 0, rule = 'right', bot = null, run = null, trail = [], t = 0;
      const solved = new Set();
      const grid = () => MAZES[mi];
      const find = ch => { for (let y = 0; y < grid().length; y++) { const x = grid()[y].indexOf(ch); if (x >= 0) return [x, y]; } };
      const open = (x, y) => grid()[y] && grid()[y][x] && grid()[y][x] !== '#';
      function reset() {
        const [x, y] = find('S');
        bot = { x, y, d: 1, px: x, py: y };
        trail = [[x, y]];
        run = null;
      }
      function step() {
        const r = (bot.d + 1) % 4, l = (bot.d + 3) % 4, f = bot.d;
        const can = d => open(bot.x + DIRS[d][0], bot.y + DIRS[d][1]);
        let move = false;
        if (rule === 'right') { if (can(r)) { bot.d = r; move = true; } else if (can(f)) move = true; else bot.d = l; }
        else if (rule === 'left') { if (can(l)) { bot.d = l; move = true; } else if (can(f)) move = true; else bot.d = r; }
        else { if (can(f)) move = true; else bot.d = r; }
        if (move) { bot.x += DIRS[bot.d][0]; bot.y += DIRS[bot.d][1]; trail.push([bot.x, bot.y]); }
      }
      function go() {
        if (run) return;
        reset();
        run = { n: 0, timer: 0 };
        Sci.sfx('click');
      }
      api.loop(dt => {
        t += dt;
        if (run) {
          run.timer -= dt;
          while (run && run.timer <= 0) {
            run.timer += 0.12;
            step();
            run.n++;
            const [ex, ey] = find('E');
            if (bot.x === ex && bot.y === ey) {
              const first = !solved.has(mi);
              solved.add(mi);
              Sci.sfx(first ? 'star' : 'good');
              api.note(`🎉 用“${RULES.find(r => r[0] === rule)[1]}”走出了迷宫 ${mi + 1}！走了 ${trail.length - 1} 步。（走出 ${solved.size}/3 个）`);
              if (solved.size === 3) api.goalDone();
              run = null;
            } else if (run.n > 160) {
              Sci.sfx('bad');
              api.note('机器人在里面兜圈子，走不出去了！这条规则不太可靠，换一条试试。');
              run = null;
            }
          }
        }
        bot.px += (bot.x - bot.px) * Math.min(1, dt * 15);
        bot.py += (bot.y - bot.py) * Math.min(1, dt * 15);
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 450);
        grid().forEach((row, y) => row.split('').forEach((ch, x) => {
          ctx.fillStyle = ch === '#' ? '#495057' : '#fff';
          ctx.fillRect(GX + x * C, GY + y * C, C, C);
        }));
        ctx.fillStyle = 'rgba(255,212,59,.45)';
        trail.forEach(([x, y]) => ctx.fillRect(GX + x * C + 12, GY + y * C + 12, C - 24, C - 24));
        const [ex, ey] = find('E');
        D.emoji(ctx, '🚪', GX + ex * C + C / 2, GY + ey * C + C / 2, 32);
        ctx.save();
        ctx.translate(GX + bot.px * C + C / 2, GY + bot.py * C + C / 2);
        D.emoji(ctx, '🤖', 0, 0, 32);
        const [dx, dy] = DIRS[bot.d];
        D.arrow(ctx, dx * 8, dy * 8, dx * 22, dy * 22, '#e8590c', 3, 9);
        ctx.restore();
        D.text(ctx, `迷宫 ${mi + 1}`, GX, 34, { size: 18, align: 'left', color: '#7048e8' });
        D.rrect(ctx, 480, 60, 300, 210, 14);
        ctx.fillStyle = '#fff';
        ctx.fill();
        D.text(ctx, '机器人的规则', 630, 86, { size: 16, color: '#6f6a85' });
        D.text(ctx, RULES.find(r => r[0] === rule)[1], 630, 122, { size: 19 });
        const lines = rule === 'right' ? ['1. 右边能走 → 右转，走一步', '2. 不然前面能走 → 走一步', '3. 都不能 → 左转'] : rule === 'left' ? ['1. 左边能走 → 左转，走一步', '2. 不然前面能走 → 走一步', '3. 都不能 → 右转'] : ['1. 前面能走 → 走一步', '2. 不能 → 右转'];
        lines.forEach((s, i) => D.text(ctx, s, 500, 160 + i * 28, { size: 14, align: 'left', weight: 'normal' }));
        D.text(ctx, MAZES.map((m, i) => (solved.has(i) ? '✅' : '⬜') + '迷宫' + (i + 1)).join('　'), 630, 300, { size: 15 });
      });
      api.choice(MAZES.map((m, i) => [i, `迷宫 ${i + 1}`]), 0, v => { if (!run) { mi = v; reset(); } });
      const r2 = api.row();
      api.choice(RULES.map(r => [r[0], r[1]]), rule, v => { if (!run) { rule = v; reset(); } }, r2);
      api.button('▶ 出发', go, r2);
      reset();
      api.note('👆 选一个迷宫和一条规则，点“出发”。');
    },
  });

  /* ================= 15. 最短路径 ================= */
  const MAPS = [
    { walls: ['..........', '.####.....', '....#.###.', '.##.#...#.', '..#.###.#.', '..#.....#.', '..........'], s: [0, 0], g: [9, 6] },
    { walls: ['....#.....', '.##.#.###.', '.#..#...#.', '.#.###.#..', '.#.....#.#', '.#####.#..', '.......#..'], s: [0, 6], g: [9, 0] },
    { walls: ['..#.......', '..#.####..', '..#....#..', '..####.#..', '.......#..', '.#####.###', '..........'], s: [0, 0], g: [9, 3] },
  ];

  Sci.register({
    id: 'shortest',
    subject: 'coding',
    level: 5,
    emoji: '📍',
    title: '最短路径',
    desc: '导航软件怎样找到最近的路？',
    intro: '手机导航能一下子找到最近的路线，它是怎么做到的？先你来试试：从起点出发，一格一格点出一条到终点的路，看看要走几步。然后点“看电脑怎么找”，电脑会像水波一样一圈一圈向外探索，找出真正最短的路。你能找到和电脑一样短的路吗？',
    goal: '在 2 张地图上找到最短路径',
    fact: '<p>电脑找最短路的一种方法叫<b>广度优先搜索</b>：从起点出发，先找出走 1 步能到的所有格子，再找走 2 步能到的……像水波一样一圈圈扩散，第一次碰到终点时，就是最短的路。</p><p>真正的导航软件更厉害：它还要考虑每条路的长短、红绿灯和堵车情况，用“迪杰斯特拉算法”等方法，在几百万条道路里瞬间算出最快的路线。</p><p>🗺️ 快递分拣、游戏里角色自动寻路、地铁换乘查询，都用到了最短路径算法。</p>',
    quiz: [
      { q: '广度优先搜索找路的样子像什么？', options: ['像水波一样一圈圈向外扩散', '随便乱走'], answer: 0, explain: '它一层一层地向外探索。' },
      { q: '下面哪个用到了最短路径算法？', options: ['手机导航', '计算器做加法'], answer: 0, explain: '导航要找出最近或最快的路线。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const C = 44, GX = 30, GY = 70, W = 10, H = 7;
      let mi = 0, path = [], dist = null, wave = -1, best = null, t = 0;
      const okMaps = new Set();
      const M = () => MAPS[mi];
      const isWall = (x, y) => x < 0 || y < 0 || x >= W || y >= H || M().walls[y][x] === '#';
      function bfs() {
        const d = Array.from({ length: H }, () => new Array(W).fill(-1));
        const q = [M().s];
        d[M().s[1]][M().s[0]] = 0;
        while (q.length) {
          const [x, y] = q.shift();
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
            const nx = x + dx, ny = y + dy;
            if (!isWall(nx, ny) && d[ny][nx] < 0) { d[ny][nx] = d[y][x] + 1; q.push([nx, ny]); }
          });
        }
        return d;
      }
      function load(i) {
        mi = i;
        path = [M().s.slice()];
        dist = bfs();
        best = dist[M().g[1]][M().g[0]];
        wave = -1;
        api.note('从绿色的起点出发，一格一格点出一条去红色终点的路（只能上下左右走）。');
      }
      api.pointer(st, {
        down(p) {
          const x = Math.floor((p.x - GX) / C), y = Math.floor((p.y - GY) / C);
          if (x < 0 || y < 0 || x >= W || y >= H || isWall(x, y)) return;
          const last = path[path.length - 1];
          const prev = path[path.length - 2];
          if (prev && prev[0] === x && prev[1] === y) { path.pop(); return; }
          if (Math.abs(last[0] - x) + Math.abs(last[1] - y) !== 1) { api.note('要点挨着路线末尾的格子哦（点上一格可以退回）。'); return; }
          if (last[0] === M().g[0] && last[1] === M().g[1]) return;
          path.push([x, y]);
          Sci.sfx('tick');
          if (x === M().g[0] && y === M().g[1]) {
            const n = path.length - 1;
            if (n === best) {
              const first = !okMaps.has(mi);
              okMaps.add(mi);
              Sci.sfx(first ? 'star' : 'good');
              api.note(`🎉 到了！你走了 ${n} 步，正好是最短的路！（完成 ${okMaps.size}/2 张地图）`);
              if (okMaps.size >= 2) api.goalDone();
            } else {
              Sci.sfx('good');
              api.note(`到了！你走了 ${n} 步，不过还有只要 ${best} 步的路。点“看电脑怎么找”，再试一次吧。`);
            }
          }
        },
      });
      api.loop(dt => {
        t += dt;
        if (wave >= 0 && wave < 60) wave += dt * 6;
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 450);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const wall = isWall(x, y), d = dist[y][x];
          ctx.fillStyle = wall ? '#495057' : wave >= 0 && d >= 0 && d <= wave ? Sci.rgb(Sci.mixColor([208, 235, 255], [116, 192, 252], d / Math.max(1, best))) : '#fff';
          ctx.fillRect(GX + x * C + 1, GY + y * C + 1, C - 2, C - 2);
          if (wave >= 0 && !wall && d >= 0 && d <= wave) D.text(ctx, String(d), GX + x * C + C / 2, GY + y * C + C / 2, { size: 13, color: '#1864ab', weight: 'normal' });
        }
        // 电脑找到的最短路（从终点倒着找回去）
        if (wave >= best) {
          let [x, y] = M().g;
          ctx.strokeStyle = 'rgba(224,49,49,.6)';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(GX + x * C + C / 2, GY + y * C + C / 2);
          while (dist[y][x] > 0) {
            const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [x + dx, y + dy]).find(([nx, ny]) => !isWall(nx, ny) && dist[ny][nx] === dist[y][x] - 1);
            [x, y] = n;
            ctx.lineTo(GX + x * C + C / 2, GY + y * C + C / 2);
          }
          ctx.stroke();
        }
        // 小朋友画的路
        ctx.strokeStyle = '#fab005';
        ctx.lineWidth = 8;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        path.forEach(([x, y], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, GX + x * C + C / 2, GY + y * C + C / 2));
        ctx.stroke();
        D.circle(ctx, GX + M().s[0] * C + C / 2, GY + M().s[1] * C + C / 2, 14, '#40c057');
        D.circle(ctx, GX + M().g[0] * C + C / 2, GY + M().g[1] * C + C / 2, 14, '#fa5252');
        D.text(ctx, `你的路线：${path.length - 1} 步`, 640, 120, { size: 20, color: '#e67700' });
        D.text(ctx, wave >= best ? `最短路线：${best} 步` : '最短路线：？', 640, 160, { size: 20, color: '#c92a2a' });
        D.text(ctx, `完成 ${okMaps.size}/2 张地图`, 640, 210, { size: 15, color: '#6f6a85' });
        D.text(ctx, `地图 ${mi + 1}`, GX, 40, { size: 18, align: 'left', color: '#7048e8' });
      });
      api.choice(MAPS.map((m, i) => [i, `地图 ${i + 1}`]), 0, v => load(v));
      const r2 = api.row();
      api.button('🌊 看电脑怎么找', () => { wave = 0; Sci.sfx('whoosh'); }, r2);
      api.button('🧹 重新画路线', () => { path = [M().s.slice()]; }, r2);
      load(0);
    },
  });
})();
