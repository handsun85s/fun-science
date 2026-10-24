/* 编程小达人（第二组）：生活中的步骤 → 跳舞机器人 → 事件 → 二分法猜数 → 分形树（递归） */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 6. 生活中的步骤 ================= */
  const TASKS = [
    ['刷牙', [['🧴', '挤牙膏'], ['😁', '上下刷牙齿'], ['💧', '用清水漱口'], ['🧼', '把牙刷洗干净']]],
    ['种一盆花', [['⛏️', '挖一个小坑'], ['🌰', '放进种子'], ['🤲', '盖上泥土'], ['🚿', '浇一点水']]],
    ['做一杯橙汁', [['🍊', '把橙子洗干净'], ['🔪', '把橙子切开'], ['🍹', '放进榨汁机'], ['🔘', '按下开关']]],
  ];

  Sci.register({
    id: 'steps',
    subject: 'coding',
    level: 1,
    emoji: '📋',
    title: '生活中的步骤',
    desc: '做一件事要先做什么、后做什么？',
    intro: '做任何事情都有先后顺序：先挤牙膏再刷牙，先放种子再盖土。如果顺序乱了，事情就做不成！下面的步骤卡片被打乱了，请按照正确的顺序一张一张点它们，帮小机器人学会做家务吧。',
    goal: '把 3 件事情的步骤都排对',
    fact: '<p>把一件事拆成一个一个的小步骤，再按正确的<b>顺序</b>排好，这就是编程最重要的一种思维——<b>算法思维</b>。</p><p>电脑和机器人一点都不聪明，你必须把每一步都说得清清楚楚、顺序一点不能乱，它们才能把事情做好。</p><p>🍳 菜谱、乐高说明书、导航路线，都是一步一步的“算法”。</p>',
    quiz: [
      { q: '种花时，下面哪一步应该最先做？', options: ['浇水', '挖坑', '盖土'], answer: 1, explain: '先挖坑，才能放种子、盖土、浇水。' },
      { q: '给机器人下指令时，最重要的是？', options: ['每一步都清楚，顺序正确', '说得越快越好'], answer: 0, explain: '机器人会严格按照顺序执行每一步。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let ti = 0, order = [], placed = 0, shake = -1, t = 0;
      const done = new Set();
      function load(i) {
        ti = i;
        order = Sci.shuffle(TASKS[i][1].map((s, k) => k));
        placed = 0;
        api.note(`任务：${TASKS[i][0]}。按顺序点下面的步骤卡片，第一步是什么？`);
      }
      const cardX = k => 110 + k * 190;
      api.pointer(st, {
        down(p) {
          if (p.y < 280 || placed >= 4) return;
          const k = Math.floor((p.x - 15) / 190);
          if (k < 0 || k > 3) return;
          const step = order[k];
          if (step < placed) return;
          if (step !== placed) { shake = k; Sci.sfx('bad'); api.note('这一步还不能做哦，想一想先要做什么？'); api.timeout(() => { shake = -1; }, 400); return; }
          placed++;
          Sci.sfx('pop');
          if (placed === 4) {
            done.add(ti);
            Sci.sfx('star');
            api.note(`🎉 “${TASKS[ti][0]}”的步骤排对啦！` + (done.size < 3 ? '换一件事试试。' : ''));
            if (done.size === 3) api.goalDone();
            else if (ti < 2) api.timeout(() => { taskCtl.set(ti + 1); load(ti + 1); }, 1800);
          } else api.note(`第 ${placed} 步对了！下一步呢？`);
        },
      });
      api.loop(dt => {
        t += dt;
        ctx.fillStyle = '#fff9db';
        ctx.fillRect(0, 0, 800, 450);
        D.text(ctx, `🤖 任务：${TASKS[ti][0]}`, 400, 36, { size: 24, color: '#2b2840' });
        const steps = TASKS[ti][1];
        for (let i = 0; i < 4; i++) {
          const x = cardX(i);
          D.rrect(ctx, x - 80, 70, 160, 150, 16);
          ctx.fillStyle = i < placed ? '#d3f9d8' : 'rgba(255,255,255,.6)';
          ctx.fill();
          ctx.setLineDash(i < placed ? [] : [6, 6]);
          ctx.strokeStyle = '#adb5bd';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.setLineDash([]);
          D.text(ctx, `第 ${i + 1} 步`, x, 92, { size: 15, color: '#6f6a85' });
          if (i < placed) { D.emoji(ctx, steps[i][0], x, 140, 46); D.text(ctx, steps[i][1], x, 196, { size: 16 }); }
          if (i < 3) D.text(ctx, '→', x + 95, 145, { size: 22, color: '#adb5bd' });
        }
        order.forEach((step, k) => {
          if (step < placed) return;
          const x = cardX(k) + (shake === k ? Math.sin(t * 60) * 6 : 0);
          D.rrect(ctx, x - 80, 290, 160, 130, 16);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.strokeStyle = '#ffd43b';
          ctx.lineWidth = 3;
          ctx.stroke();
          D.emoji(ctx, steps[step][0], x, 335, 44);
          D.text(ctx, steps[step][1], x, 390, { size: 16 });
        });
      });
      const taskCtl = api.choice(TASKS.map((tk, i) => [i, tk[0]]), 0, v => load(v));
      load(0);
    },
  });

  /* ================= 7. 跳舞机器人 ================= */
  const MOVES = [['wave', '👋 挥手'], ['leg', '🦵 抬腿'], ['spin', '🔄 转圈'], ['jump', '⬆️ 跳起来'], ['clap', '👏 拍手']];

  Sci.register({
    id: 'dance',
    subject: 'coding',
    level: 2,
    emoji: '💃',
    title: '跳舞机器人',
    desc: '编一段舞蹈，用“重复”让它跳得更长',
    intro: '我们来给机器人编一段舞！先挑几个舞蹈动作排成一小段，再用“重复”让这一小段跳好几遍——就像歌曲的副歌会唱好几遍一样。编一段一共至少 8 个动作的舞蹈，然后点“开始跳舞”！',
    goal: '用“重复”编出至少 8 个动作的舞蹈，并完整地跳一遍',
    fact: '<p>舞蹈、歌曲里常常有一段会<b>重复</b>出现，编程里也一样：把一小段动作放进“重复”里，就不用一遍遍地写了。</p><p>“一小段 3 个动作 × 重复 3 次 = 9 个动作”，写程序的人只要写 3 个动作和 1 个重复，又快又不容易出错。</p><p>🤖 很多机器人表演、灯光秀、动画角色的动作，都是程序员用这样的方法编出来的。</p>',
    quiz: [
      { q: '一段舞有 4 个动作，重复 2 次，一共跳几个动作？', options: ['4 个', '6 个', '8 个'], answer: 2, explain: '4 × 2 = 8。' },
      { q: '编程里使用“重复”，有什么好处？', options: ['程序写得更短', '机器人跳得更慢'], answer: 0, explain: '重复能让程序更简洁。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let seq = [], times = 1, play = null, t = 0, done = false;
      const total = () => seq.length * times;
      function start() {
        if (play) return;
        if (!seq.length) { api.note('先挑几个动作吧！'); return; }
        play = { k: 0, timer: 0 };
        api.note(`开始跳舞！一共 ${total()} 个动作。`);
      }
      function pose() {
        if (!play) return { name: null, k: 0 };
        const i = Math.floor(play.k) % seq.length;
        return { name: seq[i], k: play.k % 1 };
      }
      function robot(x, y, ps) {
        const { name, k } = ps;
        const s = Math.sin(k * Math.PI);
        let dy = 0, rot = 0, armL = 0.3, armR = -0.3, legL = 0, legR = 0;
        if (name === 'wave') armR = -2.6 + Math.sin(k * Math.PI * 4) * 0.4;
        if (name === 'leg') legR = -1.1 * s;
        if (name === 'spin') rot = k * Math.PI * 2;
        if (name === 'jump') { dy = -60 * s; armL = 2.5 * s; armR = -2.5 * s; }
        if (name === 'clap') { armL = 1.3 - Math.abs(Math.sin(k * Math.PI * 3)) * 0.3; armR = -armL; }
        ctx.save();
        ctx.translate(x, y + dy);
        ctx.scale(Math.cos(rot) || 0.01, 1);
        ctx.strokeStyle = '#495057';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        [[-22, armL], [22, armR]].forEach(([sx, a]) => { ctx.beginPath(); ctx.moveTo(sx, -40); ctx.lineTo(sx + Math.sin(a) * -50 * Math.sign(sx), -40 + Math.cos(a) * 50); ctx.stroke(); });
        [[-14, legL], [14, legR]].forEach(([sx, a]) => { ctx.beginPath(); ctx.moveTo(sx, 20); ctx.lineTo(sx - Math.sin(a) * 60, 20 + Math.cos(a) * 60); ctx.stroke(); });
        D.rrect(ctx, -32, -60, 64, 84, 14);
        ctx.fillStyle = '#74c0fc';
        ctx.fill();
        D.rrect(ctx, -26, -112, 52, 46, 12);
        ctx.fillStyle = '#a5d8ff';
        ctx.fill();
        D.circle(ctx, -10, -90, 6, '#212529');
        D.circle(ctx, 10, -90, 6, '#212529');
        ctx.restore();
      }
      api.loop(dt => {
        t += dt;
        if (play) {
          const before = Math.floor(play.k);
          play.k += dt * 1.5;
          if (Math.floor(play.k) !== before) Sci.tone(523 + (Math.floor(play.k) % 4) * 66, 0.12, { type: 'triangle' });
          if (play.k >= total()) {
            const n = total();
            play = null;
            if (n >= 8 && times > 1 && !done) { done = true; Sci.sfx('star'); api.note(`🎉 跳完啦！${seq.length} 个动作 × 重复 ${times} 次 = ${n} 个动作。`); api.goalDone(); }
            else api.note(n < 8 ? `跳了 ${n} 个动作。再加一些动作或者多重复几次，凑够 8 个吧！` : times === 1 ? '跳完了！试试用“重复”，让程序更短。' : `跳完啦，一共 ${n} 个动作！`);
          }
        }
        ctx.fillStyle = '#2b2142';
        ctx.fillRect(0, 0, 800, 450);
        for (let i = 0; i < 6; i++) D.circle(ctx, 80 + i * 130, 40, 18, play ? ['#ff6b6b', '#ffd43b', '#69db7c', '#4dabf7', '#b197fc', '#f783ac'][(i + Math.floor(t * 4)) % 6] : '#495057');
        ctx.fillStyle = '#5f3dc4';
        ctx.fillRect(0, 360, 800, 90);
        robot(250, 280, pose());
        // 程序
        D.rrect(ctx, 460, 90, 320, 250, 16);
        ctx.fillStyle = 'rgba(255,255,255,.95)';
        ctx.fill();
        D.text(ctx, `重复 ${times} 次：`, 480, 120, { size: 18, align: 'left', color: '#7048e8' });
        seq.forEach((m, i) => {
          const y = 150 + i * 30, active = play && Math.floor(play.k) % seq.length === i;
          D.rrect(ctx, 505, y - 12, 220, 26, 8);
          ctx.fillStyle = active ? '#ffd43b' : '#e5dbff';
          ctx.fill();
          D.text(ctx, MOVES.find(mm => mm[0] === m)[1], 520, y + 1, { size: 15, align: 'left' });
        });
        D.text(ctx, `一共 ${total()} 个动作`, 620, 325, { size: 15, color: total() >= 8 ? '#2b8a3e' : '#c0620a' });
      });
      MOVES.forEach(m => api.button(m[1], () => { if (play) return; if (seq.length >= 6) { api.note('一小段最多 6 个动作，用“重复”让它变长吧！'); return; } seq.push(m[0]); Sci.sfx('pop'); }));
      const r2 = api.row();
      api.choice([[1, '不重复'], [2, '重复 2 次'], [3, '重复 3 次'], [4, '重复 4 次']], times, v => { if (!play) times = v; }, r2);
      const r3 = api.row();
      api.button('💃 开始跳舞', start, r3);
      api.button('🧹 清空', () => { if (!play) seq = []; }, r3);
      api.note('👆 点上面的动作按钮，编一小段舞。');
    },
  });

  /* ================= 8. 事件 ================= */
  const EVENTS = [['flag', '🚩 点击小旗子时'], ['cat', '🐱 点击小猫时'], ['touch', '🍎 小猫碰到苹果时']];
  const ACTIONS = [['walk', '走向苹果'], ['hello', '说“你好！”'], ['score', '分数 + 1'], ['jump', '跳一下']];
  const WANT = { flag: 'walk', cat: 'hello', touch: 'score' };

  Sci.register({
    id: 'events',
    subject: 'coding',
    level: 3,
    emoji: '🐱',
    title: '事件',
    desc: '当……发生时，就做……',
    intro: '玩游戏时，你按一下按钮，角色就跳起来；碰到金币，分数就增加。这些都是“事件”：当某件事发生时，就执行一段程序。按照右上角的设计要求，给每个事件选好要做的动作，然后点小旗子和小猫，测试你的小游戏！',
    goal: '按设计要求设置好 3 个事件，并且都触发一次',
    fact: '<p><b>事件</b>就是“当……发生时”。程序会一直等着，事件一发生，就执行事先准备好的那段程序。</p><p>点击鼠标、按下键盘、手指触摸屏幕、角色碰到障碍物、时间到了……都是事件。游戏、手机 App 几乎都是由一个个事件组成的。</p><p>🔔 生活里也有“事件”：<b>当</b>闹钟响了，<b>就</b>起床；<b>当</b>红灯亮了，<b>就</b>停下来。</p>',
    quiz: [
      { q: '“当闹钟响了，就起床”里，哪一部分是事件？', options: ['闹钟响了', '起床'], answer: 0, explain: '“当……时”说的就是事件。' },
      { q: '下面哪个是电脑程序里的事件？', options: ['点击鼠标', '电脑的颜色'], answer: 0, explain: '点击鼠标会触发程序。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const rules = { flag: 'jump', cat: 'jump', touch: 'jump' };
      const fired = new Set();
      let cat = { x: 160, y: 330, jump: 0, walking: false }, apple = { x: 560, here: true }, score = 0, bubble = 0, t = 0;

      function fire(ev) {
        const act = rules[ev];
        if (WANT[ev] === act) fired.add(ev);
        Sci.sfx('click');
        if (act === 'walk') cat.walking = true;
        if (act === 'hello') bubble = 1.8;
        if (act === 'score') { score++; Sci.sfx('good'); }
        if (act === 'jump') cat.jump = 1;
        const ok = Object.keys(WANT).every(k => rules[k] === WANT[k]);
        if (ok && fired.size === 3) { Sci.sfx('star'); api.note('🎉 小游戏完成了！三个事件都按设计要求工作。'); api.goalDone(); }
        else api.note(`${EVENTS.find(e => e[0] === ev)[1]}，小猫${ACTIONS.find(a => a[0] === act)[1]}。` + (WANT[ev] === act ? '✅ 符合设计要求！' : '和设计要求不一样哦，改一改。'));
      }
      api.pointer(st, {
        down(p) { if (Math.hypot(p.x - cat.x, p.y - (cat.y - 30)) < 50) fire('cat'); },
      });
      api.loop(dt => {
        t += dt;
        if (cat.walking) {
          cat.x += dt * 140;
          if (apple.here && cat.x > apple.x - 50) { apple.here = false; cat.walking = false; fire('touch'); api.timeout(() => { apple.here = true; cat.x = 160; }, 2500); }
          if (cat.x > 700) { cat.walking = false; cat.x = 160; }
        }
        cat.jump = Math.max(0, cat.jump - dt * 2);
        bubble = Math.max(0, bubble - dt);
        ctx.fillStyle = '#e7f5ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#8ce99a';
        ctx.fillRect(0, 360, 800, 90);
        if (apple.here) D.emoji(ctx, '🍎', apple.x, 330, 44);
        const jy = Math.sin(cat.jump * Math.PI) * 70;
        D.emoji(ctx, '🐱', cat.x, cat.y - 30 - jy, 70);
        if (bubble > 0) {
          D.rrect(ctx, cat.x + 20, cat.y - 140 - jy, 110, 44, 14);
          ctx.fillStyle = '#fff';
          ctx.fill();
          D.text(ctx, '你好！', cat.x + 75, cat.y - 118 - jy, { size: 18 });
        }
        D.text(ctx, `分数：${score}`, 40, 30, { size: 20, align: 'left', color: '#c0620a' });
        // 设计要求
        D.rrect(ctx, 470, 20, 315, 150, 14);
        ctx.fillStyle = '#fff';
        ctx.fill();
        D.text(ctx, '📋 设计要求', 627, 44, { size: 16, color: '#7048e8' });
        EVENTS.forEach(([k, n], i) => D.text(ctx, `${fired.has(k) ? '✅' : '⬜'} ${n}，${ACTIONS.find(a => a[0] === WANT[k])[1]}`, 485, 76 + i * 30, { size: 14, align: 'left', maxW: 290 }));
        D.text(ctx, '👆 点击小猫，也是一个事件', 160, 420, { size: 13, color: '#2b8a3e', weight: 'normal' });
      });
      EVENTS.forEach(([k, n]) => {
        const row = api.row();
        row.append(Sci.h('span', { style: { fontWeight: 'bold', marginRight: '6px' } }, n + '：'));
        api.choice(ACTIONS.map(a => [a[0], a[1]]), rules[k], v => { rules[k] = v; }, row);
      });
      const r4 = api.row();
      api.button('🚩 点击小旗子', () => fire('flag'), r4);
      api.note('👆 先给每个事件选好动作，再点“点击小旗子”和画面里的小猫来测试。');
    },
  });

  /* ================= 9. 二分法猜数 ================= */
  Sci.register({
    id: 'guessnum',
    subject: 'coding',
    level: 4,
    emoji: '🔢',
    title: '二分法猜数',
    desc: '1 到 100 之间的数，最多 7 次就能猜中',
    intro: '电脑心里想了一个 1 到 100 之间的数，你每猜一次，它会告诉你“大了”还是“小了”。怎样猜得最快？有一个聪明的办法：每次都猜剩下范围的正中间！挑战：7 次以内猜中，成功 2 次。',
    goal: '7 次以内猜中电脑想的数，成功 2 次',
    fact: '<p>每次都猜范围的<b>正中间</b>，不管电脑说大了还是小了，都能一下子排除掉<b>一半</b>的数。这个方法叫<b>二分法</b>。</p><p>100 个数 → 50 → 25 → 13 → 7 → 4 → 2 → 1，最多 7 次就一定能猜中！如果是 100 万个数，也只要 20 次。</p><p>🔍 电脑在排好序的数据里查找东西，常常用二分查找，所以在海量数据里也能飞快地找到答案。查字典时先翻到中间，也是这个道理。</p>',
    quiz: [
      { q: '在 1～100 里猜数，用二分法第一次应该猜几？', options: ['1', '50', '99'], answer: 1, explain: '猜正中间，一次能排除一半。' },
      { q: '二分法每猜一次，能排除大约多少个数？', options: ['一个', '一半', '全部'], answer: 1, explain: '每次排除剩下的一半。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let secret = 0, lo = 1, hi = 100, tries = 0, wins = 0, guess = 50, history = [], over = false, t = 0;
      function newGame() {
        secret = 1 + Math.floor(Math.random() * 100);
        lo = 1;
        hi = 100;
        tries = 0;
        history = [];
        over = false;
        guess = 50;
        slider.set(50);
        api.note('电脑想好了一个 1～100 的数。拖动滑块选一个数，点“猜！”');
      }
      function doGuess() {
        if (over) { newGame(); return; }
        tries++;
        history.push(guess);
        if (guess === secret) {
          over = true;
          if (tries <= 7) { wins++; Sci.sfx('star'); api.note(`🎉 猜中了！就是 ${secret}，用了 ${tries} 次。（成功 ${wins}/2）再点“猜！”开始新的一局。`); if (wins >= 2) api.goalDone(); }
          else { Sci.sfx('good'); api.note(`猜中了，是 ${secret}，不过用了 ${tries} 次。试试每次都猜正中间！`); }
          return;
        }
        Sci.sfx('bad');
        if (guess < secret) lo = Math.max(lo, guess + 1); else hi = Math.min(hi, guess - 1);
        api.note(`${guess} ${guess < secret ? '小了' : '大了'}！现在范围是 ${lo}～${hi}，正中间是 ${Math.floor((lo + hi) / 2)}。（第 ${tries} 次）`);
      }
      api.loop(dt => {
        t += dt;
        ctx.fillStyle = '#f8f9ff';
        ctx.fillRect(0, 0, 800, 450);
        const X0 = 50, W = 700, Y = 200;
        const xOf = n => X0 + (n - 1) / 99 * W;
        ctx.fillStyle = '#e9ecef';
        ctx.fillRect(X0, Y - 20, W, 40);
        ctx.fillStyle = '#b2f2bb';
        ctx.fillRect(xOf(lo) - 3, Y - 20, xOf(hi) - xOf(lo) + 6, 40);
        for (let n = 0; n <= 100; n += 10) D.text(ctx, String(Math.max(1, n)), xOf(Math.max(1, n)), Y + 36, { size: 13, color: '#6f6a85', weight: 'normal' });
        history.forEach((g, i) => { ctx.fillStyle = g === secret ? '#2b8a3e' : '#e03131'; ctx.fillRect(xOf(g) - 1.5, Y - 30, 3, 60); D.text(ctx, String(g), xOf(g), Y - 42 - (i % 2) * 16, { size: 12, color: '#c92a2a' }); });
        ctx.fillStyle = '#4c6ef5';
        ctx.beginPath();
        ctx.moveTo(xOf(guess), Y + 52);
        ctx.lineTo(xOf(guess) - 8, Y + 66);
        ctx.lineTo(xOf(guess) + 8, Y + 66);
        ctx.fill();
        D.text(ctx, over ? `答案：${secret}` : '电脑想的数：？', 400, 70, { size: 30, color: over ? '#2b8a3e' : '#2b2840' });
        D.text(ctx, `可能的范围：${lo} ～ ${hi}（还剩 ${hi - lo + 1} 个数）`, 400, 120, { size: 18, color: '#2b8a3e' });
        D.text(ctx, `你要猜：${guess}`, 400, 310, { size: 26, color: '#4c6ef5' });
        D.text(ctx, `已经猜了 ${tries} 次（目标 7 次以内）　成功 ${Math.min(wins, 2)}/2`, 400, 360, { size: 16, color: '#6f6a85' });
      });
      const slider = api.slider('我猜', 1, 100, 1, 50, v => { guess = v; }, v => String(v));
      api.button('🎯 猜！', doGuess);
      api.button('🎯 猜正中间', () => { if (!over) { guess = Math.floor((lo + hi) / 2); slider.set(guess); doGuess(); } });
      newGame();
    },
  });

  /* ================= 10. 分形树（递归） ================= */
  Sci.register({
    id: 'fractal',
    subject: 'coding',
    level: 5,
    emoji: '🌳',
    title: '分形树',
    desc: '自己调用自己，画出一棵大树',
    intro: '怎样用很短的程序画出一棵枝繁叶茂的大树？秘诀是“递归”：画一棵树 = 画一根树干，再在树干顶端画两棵小一点的树。而“画小一点的树”又用同样的方法……调一调层数、分叉角度和缩小比例，画出属于你的大树吧！',
    goal: '画出一棵 8 层以上的分形树',
    fact: '<p>一个程序在执行时<b>调用它自己</b>，叫做<b>递归</b>。画树的程序可以写成：</p><p>“画树（长度）：画一根线；如果长度还够长，就向左转画树（长度 × 0.7），再向右转画树（长度 × 0.7）。”</p><p>只用几行程序，就能画出成百上千根树枝！每多一层，树枝数量就翻一倍：8 层就有 255 根。🌿 大自然里也到处是“分形”：树枝、闪电、雪花、蕨类植物的叶子、海岸线……局部和整体长得很像。</p>',
    quiz: [
      { q: '程序在执行时调用它自己，叫做？', options: ['递归', '排序', '变量'], answer: 0, explain: '递归就是自己调用自己。' },
      { q: '每根树枝末端分出 2 根小树枝，第 3 层一共有几根小树枝？', options: ['3 根', '4 根', '6 根'], answer: 1, explain: '1 → 2 → 4，第 3 层有 4 根。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let depth = 3, angle = 25, ratio = 0.7, grow = 0, done = false, t = 0;
      function branch(x, y, len, a, d, maxD) {
        if (d > maxD) return;
        const k = clamp(grow - (d - 1), 0, 1);
        if (k <= 0) return;
        const x2 = x + Math.cos(a) * len * k, y2 = y + Math.sin(a) * len * k;
        ctx.strokeStyle = d >= depth - 1 ? '#40c057' : '#8d5a3b';
        ctx.lineWidth = Math.max(1, (depth - d + 1) * 1.6);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        if (k < 1) return;
        branch(x2, y2, len * ratio, a - angle * Math.PI / 180, d + 1, maxD);
        branch(x2, y2, len * ratio, a + angle * Math.PI / 180, d + 1, maxD);
        if (d === maxD && depth >= 5) D.circle(ctx, x2, y2, 2.5, '#ff8787');
      }
      api.loop(dt => {
        t += dt;
        if (grow < depth) {
          grow = Math.min(depth, grow + dt * 3);
          if (grow >= depth && depth >= 8 && !done) { done = true; Sci.sfx('star'); api.note(`🎉 ${depth} 层的分形树画好了，一共 ${2 ** depth - 1} 根树枝！程序却只有短短几行。`); api.goalDone(); }
        }
        ctx.fillStyle = '#f4fce3';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#c0eb75';
        ctx.fillRect(0, 420, 800, 30);
        ctx.lineCap = 'round';
        branch(300, 420, 110, -Math.PI / 2, 1, depth);
        D.rrect(ctx, 560, 30, 225, 200, 14);
        ctx.fillStyle = '#212529';
        ctx.fill();
        const lines = ['画树(长度, 层数):', '  画一根线', '  如果 层数 > 1:', '    左转，画树(长度×' + ratio + ', 层数−1)', '    右转，画树(长度×' + ratio + ', 层数−1)'];
        lines.forEach((s, i) => D.text(ctx, s, 572, 58 + i * 26, { size: 13, align: 'left', color: i ? '#e9ecef' : '#ffd43b', weight: 'normal', maxW: 205 }));
        D.text(ctx, `${depth} 层 · ${2 ** depth - 1} 根树枝`, 672, 260, { size: 17, color: '#2b2840' });
      });
      api.slider('层数', 1, 10, 1, depth, v => { depth = v; grow = 0; });
      api.slider('分叉角度', 10, 60, 5, angle, v => { angle = v; }, v => v + '°');
      api.slider('缩小比例', 0.5, 0.8, 0.05, ratio, v => { ratio = Math.round(v * 100) / 100; }, v => v.toFixed(2));
      api.note('👆 拖动“层数”滑块，看看树是怎么一层一层长出来的。');
    },
  });
})();
