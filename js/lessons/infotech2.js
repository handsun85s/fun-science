/* 信息科技（第二组）：像素画 → 摩尔斯电码 → 数据与图表 → 传感器与自动控制 → 逻辑门 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 6. 像素画 ================= */
  const PALETTE = ['#ffffff', '#fa5252', '#212529', '#fcc419'];
  const PICS = [
    ['爱心', ['00000000', '01100110', '11111111', '11111111', '01111110', '00111100', '00011000', '00000000'].map(r => r.split('').map(c => +c))],
    ['笑脸', ['00333300', '03333330', '33233233', '33333333', '32333323', '33222233', '03333330', '00333300'].map(r => r.split('').map(c => +c))],
  ];

  Sci.register({
    id: 'pixelart',
    subject: 'infotech',
    level: 1,
    emoji: '👾',
    title: '像素画',
    desc: '电脑屏幕上的图片，是由一个个小方块组成的',
    intro: '把手机屏幕放大很多很多倍，你会发现图片是由许多小方块拼起来的，每个小方块叫一个“像素”。选好颜色，在大方格里点一点，照着右边的样子把图画出来吧！画好以后，看看缩小的样子像不像。',
    goal: '照着样子画出爱心和笑脸',
    fact: '<p>电脑和手机屏幕上的图片，都是由成千上万个小方块组成的，每个小方块叫做一个<b>像素</b>。每个像素只有一种颜色，离远一点看，它们就拼成了完整的图片。</p><p>像素越多，图片越清晰。手机拍的照片有几千万个像素！电脑会用数字记住每个像素的颜色，所以图片也是一串数字。</p><p>🎮 早期的电子游戏因为像素很少，画面都是一个个小方块，这种风格叫“像素风”。</p>',
    quiz: [
      { q: '组成电脑图片的小方块叫什么？', options: ['像素', '积木', '原子'], answer: 0, explain: '每个小方块叫一个像素。' },
      { q: '像素越多，图片会怎样？', options: ['越清晰', '越模糊'], answer: 0, explain: '像素越多，细节越丰富。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const N = 8, C = 46, GX = 30, GY = 40;
      let pi = 0, color = 1, grid = [];
      const done = new Set();
      function clear() { grid = Array.from({ length: N }, () => new Array(N).fill(0)); }
      clear();
      function check() {
        const pic = PICS[pi][1];
        if (grid.every((r, y) => r.every((c, x) => c === pic[y][x])) && !done.has(pi)) {
          done.add(pi);
          Sci.sfx('star');
          api.note(`🎉 ${PICS[pi][0]}画好啦！看右下角缩小的样子，是不是很像一张图片？` + (done.size < 2 ? '再画另一个吧。' : ''));
          if (done.size === 2) api.goalDone();
        }
      }
      let painting = false;
      const paint = p => {
        const x = Math.floor((p.x - GX) / C), y = Math.floor((p.y - GY) / C);
        if (x < 0 || y < 0 || x >= N || y >= N) return;
        if (grid[y][x] !== color) { grid[y][x] = color; Sci.sfx('tick'); check(); }
      };
      api.pointer(st, { down(p) { painting = true; paint(p); }, move(p, a) { if (a && painting) paint(p); }, up() { painting = false; } });
      api.loop(() => {
        ctx.fillStyle = '#f1f3f5';
        ctx.fillRect(0, 0, 800, 450);
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          ctx.fillStyle = PALETTE[grid[y][x]];
          ctx.fillRect(GX + x * C, GY + y * C, C, C);
          ctx.strokeStyle = '#dee2e6';
          ctx.lineWidth = 1;
          ctx.strokeRect(GX + x * C, GY + y * C, C, C);
        }
        // 样子
        const pic = PICS[pi][1];
        D.text(ctx, `照着画：${PICS[pi][0]}`, 600, 40, { size: 18 });
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { ctx.fillStyle = PALETTE[pic[y][x]]; ctx.fillRect(520 + x * 20, 60 + y * 20, 20, 20); ctx.strokeStyle = '#e9ecef'; ctx.strokeRect(520 + x * 20, 60 + y * 20, 20, 20); }
        // 缩小以后
        D.text(ctx, '缩小以后的样子：', 560, 260, { size: 14, color: '#6f6a85' });
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { ctx.fillStyle = PALETTE[grid[y][x]]; ctx.fillRect(660 + x * 4, 250 + y * 4, 4, 4); }
        D.text(ctx, `完成 ${done.size}/2`, 600, 330, { size: 16, color: '#2b8a3e' });
      });
      api.choice(PICS.map((p, i) => [i, p[0]]), 0, v => { pi = v; clear(); });
      const r2 = api.row();
      api.choice([[1, '❤️ 红'], [2, '⬛ 黑'], [3, '⭐ 黄'], [0, '⬜ 橡皮擦']], color, v => { color = v; }, r2);
      api.button('🧹 擦干净', clear, r2);
      api.note('👆 选好颜色，在左边的大方格里点一点（也可以按住拖着涂）。');
    },
  });

  /* ================= 7. 摩尔斯电码 ================= */
  const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..' };
  const WORDS = [['HI', ['HI', 'IT', 'OK']], ['CAT', ['CAT', 'DOG', 'SUN']]];

  Sci.register({
    id: 'morse',
    subject: 'infotech',
    level: 2,
    emoji: '📡',
    title: '摩尔斯电码',
    desc: '只用“滴”和“嗒”，就能传送所有字母',
    intro: '很久以前没有手机，人们用电报传消息：只有短的“滴”（·）和长的“嗒”（—）两种信号，组合起来就能表示所有字母，这就是摩尔斯电码。先发一个最有名的求救信号 SOS，再看看小灯一闪一闪，猜猜它在说什么单词！',
    goal: '发出 SOS 求救信号，再破译 2 个单词',
    fact: '<p><b>摩尔斯电码</b>用短信号“滴”和长信号“嗒”的不同组合表示字母：比如 S 是“· · ·”，O 是“— — —”。它可以用电线、灯光、声音甚至敲击来传送。</p><p><b>SOS</b>（· · · — — — · · ·）是国际通用的求救信号，因为它简单好记，又不容易和别的信号弄混。</p><p>💡 把信息变成另一种符号来传送，叫做<b>编码</b>。今天的电脑和手机把一切都编码成 0 和 1，和摩尔斯电码的道理很像。</p>',
    quiz: [
      { q: '摩尔斯电码用哪两种信号？', options: ['短的“滴”和长的“嗒”', '红色和绿色'], answer: 0, explain: '滴（·）和嗒（—）。' },
      { q: '国际通用的求救信号是？', options: ['SOS', 'ABC', 'OK'], answer: 0, explain: 'SOS：· · · — — — · · ·。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let mode = 'send', typed = '', sosOk = false, wi = 0, blink = null, picked = -1, t = 0;
      const decoded = new Set();
      const TARGET = '...---...';
      const choices = WORDS.map(w => Sci.shuffle(w[1]));
      function key(s) {
        if (mode !== 'send') return;
        typed = (typed + s).slice(-12);
        Sci.tone(s === '.' ? 880 : 880, s === '.' ? 0.1 : 0.3, { type: 'sine', vol: 0.1 });
        if (typed.endsWith(TARGET) && !sosOk) {
          sosOk = true;
          Sci.sfx('star');
          api.note('🆘 发出了 SOS！· · · — — — · · ·，这是全世界都认识的求救信号。再去“破译单词”试试。');
          check();
        }
      }
      function check() { if (sosOk && decoded.size >= 2) api.goalDone(); }
      function play() {
        const word = WORDS[wi][0];
        const seq = [];
        word.split('').forEach((ch, i) => { MORSE[ch].split('').forEach(s => seq.push(s)); if (i < word.length - 1) seq.push(' '); });
        blink = { seq, k: 0, timer: 0, on: false };
        picked = -1;
      }
      api.pointer(st, {
        down(p) {
          if (mode !== 'decode' || p.y < 330) return;
          const i = Math.floor((p.x - 130) / 190);
          const opts = choices[wi];
          if (i < 0 || i > 2) return;
          picked = i;
          if (opts[i] === WORDS[wi][0]) {
            decoded.add(wi);
            Sci.sfx('good');
            api.note(`✅ 破译成功！是 ${opts[i]}：` + WORDS[wi][0].split('').map(c => `${c}（${MORSE[c].replace(/\./g, '·').replace(/-/g, '—')}）`).join(' '));
            check();
          } else { Sci.sfx('bad'); api.note('不对哦，再看一遍小灯，对照下面的电码表。'); }
        },
      });
      api.loop(dt => {
        t += dt;
        if (blink) {
          blink.timer -= dt;
          if (blink.timer <= 0) {
            if (blink.on) { blink.on = false; blink.timer = 0.25; blink.k++; }
            else if (blink.k >= blink.seq.length) blink = null;
            else { const s = blink.seq[blink.k]; if (s === ' ') { blink.k++; blink.timer = 0.6; } else { blink.on = true; blink.cur = s; blink.timer = s === '.' ? 0.22 : 0.65; Sci.tone(660, blink.timer, { vol: 0.08 }); } }
          }
        }
        ctx.fillStyle = '#212529';
        ctx.fillRect(0, 0, 800, 450);
        // 电码表
        Object.keys(MORSE).forEach((ch, i) => {
          const x = 30 + (i % 9) * 84, y = 30 + Math.floor(i / 9) * 30;
          D.text(ctx, `${ch} ${MORSE[ch].replace(/\./g, '·').replace(/-/g, '—')}`, x, y, { size: 14, align: 'left', color: '#adb5bd', weight: 'normal' });
        });
        if (mode === 'send') {
          D.text(ctx, '你发出的信号：', 400, 160, { size: 18, color: '#fff' });
          D.text(ctx, typed.replace(/\./g, '·').replace(/-/g, '—').split('').join(' ') || '（还没有）', 400, 210, { size: 36, color: '#ffd43b' });
          D.text(ctx, 'SOS = · · ·　— — —　· · ·', 400, 270, { size: 20, color: '#ff8787' });
          D.text(ctx, sosOk ? '✅ SOS 发送成功' : '目标：发出 SOS', 400, 320, { size: 18, color: sosOk ? '#8ce99a' : '#ced4da' });
        } else {
          D.circle(ctx, 400, 190, 50, blink && blink.on ? '#ffe066' : '#495057', '#868e96', 4);
          if (blink && blink.on) D.circle(ctx, 400, 190, 80, 'rgba(255,224,102,.25)');
          D.text(ctx, blink ? '看小灯……' : '点“播放信号”，看小灯闪', 400, 270, { size: 17, color: '#fff' });
          choices[wi].forEach((w, i) => {
            const x = 210 + i * 190;
            D.rrect(ctx, x - 75, 340, 150, 70, 14);
            ctx.fillStyle = picked === i ? (w === WORDS[wi][0] ? '#2b8a3e' : '#c92a2a') : '#495057';
            ctx.fill();
            D.text(ctx, w, x, 375, { size: 28, color: '#fff' });
          });
          D.text(ctx, WORDS.map((w, i) => (decoded.has(i) ? '✅' : '⬜') + '单词' + (i + 1)).join('　'), 400, 315, { size: 14, color: '#ced4da' });
        }
      });
      api.choice([['send', '📤 发送信号'], ['decode', '📥 破译单词']], mode, v => {
        mode = v;
        sendRow.hidden = v !== 'send';
        decRow.hidden = v !== 'decode';
        api.note(v === 'send' ? '点“滴”和“嗒”按钮，发出 SOS。' : '点“播放信号”，小灯会用摩尔斯电码闪出一个单词。');
      });
      const sendRow = api.row();
      api.button('· 滴', () => key('.'), sendRow);
      api.button('— 嗒', () => key('-'), sendRow);
      api.button('🧹 清除', () => { typed = ''; }, sendRow);
      const decRow = api.row();
      api.choice(WORDS.map((w, i) => [i, `单词 ${i + 1}`]), 0, v => { wi = v; picked = -1; blink = null; }, decRow);
      api.button('▶ 播放信号', play, decRow);
      decRow.hidden = true;
      api.note('👆 点“滴”和“嗒”按钮，发出 SOS：滴滴滴、嗒嗒嗒、滴滴滴。');
    },
  });

  /* ================= 8. 数据与图表 ================= */
  const FRUITS = [['apple', '🍎', '苹果'], ['banana', '🍌', '香蕉'], ['grape', '🍇', '葡萄'], ['melon', '🍉', '西瓜']];

  Sci.register({
    id: 'datachart',
    subject: 'infotech',
    level: 3,
    emoji: '📊',
    title: '数据与图表',
    desc: '调查全班最爱的水果，用图表说话',
    intro: '班里要选一种水果作为秋游的点心，大家最喜欢哪一种呢？我们来做一次调查！每个同学会说出自己最喜欢的水果，请你点对应的按钮记录下来。全部记录完以后，把数据变成柱状图，一眼就能看出答案！',
    goal: '记录 20 个同学的投票，并找出最受欢迎的水果',
    fact: '<p>收集来的信息叫<b>数据</b>。数据一多，光看一个个名字很难看出规律，把它们<b>整理</b>成表格或<b>图表</b>，结论就一目了然了。</p><p><b>柱状图</b>适合比较多少：柱子越高，数量越多。<b>饼图</b>适合看每一部分占整体的多少。</p><p>📈 天气预报的气温曲线、体检的身高记录、班级的成绩统计，都是用图表来展示数据。</p>',
    quiz: [
      { q: '想比较几种水果各有多少人喜欢，用什么图最合适？', options: ['柱状图', '地图'], answer: 0, explain: '柱状图最适合比较数量的多少。' },
      { q: '收集来的信息叫做什么？', options: ['数据', '程序', '密码'], answer: 0, explain: '调查得到的信息就是数据。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let votes = [], k = 0, counts = { apple: 0, banana: 0, grape: 0, melon: 0 }, wrong = 0, chart = false, answered = false, t = 0;
      const plan = { apple: 6, banana: 4, grape: 7, melon: 3 };
      Object.keys(plan).forEach(f => { for (let i = 0; i < plan[f]; i++) votes.push(f); });
      votes = Sci.shuffle(votes);
      const KIDS = ['👦', '👧', '🧒', '👱', '👩', '🧑'];
      function record(f) {
        if (k >= votes.length) return;
        if (f !== votes[k]) { wrong++; Sci.sfx('bad'); api.note(`第 ${k + 1} 位同学说的是“${FRUITS.find(x => x[0] === votes[k])[2]}”哦，再听一次。`); return; }
        counts[f]++;
        k++;
        Sci.sfx('tick');
        if (k === votes.length) { Sci.sfx('good'); api.note('20 个同学都记录好了！点“画成柱状图”看看结果。'); }
        else api.note(`记下了！第 ${k + 1} 位同学：`);
      }
      api.pointer(st, {
        down(p) {
          if (!chart || answered) return;
          const i = Math.floor((p.x - 120) / 150);
          if (i < 0 || i > 3 || p.y < 100) return;
          const top = FRUITS.slice().sort((a, b) => counts[b[0]] - counts[a[0]])[0][0];
          if (FRUITS[i][0] === top) { answered = true; Sci.sfx('star'); api.note(`🎉 对！${FRUITS[i][2]}有 ${counts[top]} 票，最受欢迎。秋游就带${FRUITS[i][2]}吧！`); api.goalDone(); }
          else { Sci.sfx('bad'); api.note('再看看，哪根柱子最高？'); }
        },
      });
      api.loop(dt => {
        t += dt;
        ctx.fillStyle = '#fff9db';
        ctx.fillRect(0, 0, 800, 450);
        if (!chart) {
          if (k < votes.length) {
            const f = FRUITS.find(x => x[0] === votes[k]);
            D.emoji(ctx, KIDS[k % KIDS.length], 160, 200, 90);
            D.rrect(ctx, 220, 110, 230, 70, 18);
            ctx.fillStyle = '#fff';
            ctx.fill();
            D.text(ctx, `我最喜欢${f[2]}！`, 335, 140, { size: 22 });
            D.text(ctx, `第 ${k + 1} / 20 位同学`, 160, 290, { size: 16, color: '#6f6a85' });
          } else D.text(ctx, '✅ 全部记录完了', 250, 200, { size: 24, color: '#2b8a3e' });
          // 记录表（画正字一样的记号）
          D.rrect(ctx, 500, 40, 280, 300, 14);
          ctx.fillStyle = '#fff';
          ctx.fill();
          D.text(ctx, '记录表', 640, 66, { size: 17 });
          FRUITS.forEach(([id, e, n], i) => {
            const y = 110 + i * 60;
            D.emoji(ctx, e, 530, y, 30);
            for (let j = 0; j < counts[id]; j++) {
              const g = Math.floor(j / 5), r = j % 5, x = 565 + g * 46;
              ctx.strokeStyle = '#495057';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              if (r < 4) { ctx.moveTo(x + r * 8, y - 14); ctx.lineTo(x + r * 8, y + 14); } else { ctx.moveTo(x - 4, y + 10); ctx.lineTo(x + 30, y - 10); }
              ctx.stroke();
            }
            D.text(ctx, String(counts[id]), 760, y, { size: 16, color: '#c0620a' });
          });
          D.text(ctx, `记错了 ${wrong} 次`, 640, 320, { size: 13, color: '#6f6a85', weight: 'normal' });
        } else {
          const max = Math.max(...Object.values(counts), 1);
          ctx.strokeStyle = '#495057';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(100, 60);
          ctx.lineTo(100, 380);
          ctx.lineTo(720, 380);
          ctx.stroke();
          FRUITS.forEach(([id, e, n], i) => {
            const x = 140 + i * 150, h = counts[id] / max * 280;
            D.rrect(ctx, x, 380 - h, 100, h, 8);
            ctx.fillStyle = ['#ff6b6b', '#ffd43b', '#9775fa', '#69db7c'][i];
            ctx.fill();
            D.text(ctx, String(counts[id]) + ' 票', x + 50, 365 - h, { size: 18 });
            D.emoji(ctx, e, x + 50, 408, 30);
          });
          D.text(ctx, answered ? '' : '👆 点一下最受欢迎的水果的柱子', 420, 40, { size: 17, color: '#2b2840' });
        }
      });
      FRUITS.forEach(f => api.button(`${f[1]} ${f[2]}`, () => { if (!chart) record(f[0]); }));
      const r2 = api.row();
      api.button('📊 画成柱状图', () => {
        if (k < votes.length) { api.note(`还有 ${votes.length - k} 位同学没记录呢。`); return; }
        chart = true;
        Sci.sfx('whoosh');
        api.note('柱状图画好了！哪种水果最受欢迎？点它的柱子。');
      }, r2);
      api.note('👆 第 1 位同学：听他说了什么，点下面对应的水果按钮。');
    },
  });

  /* ================= 9. 传感器与自动控制 ================= */
  Sci.register({
    id: 'sensor',
    subject: 'infotech',
    level: 4,
    emoji: '🏠',
    title: '智能小屋',
    desc: '传感器感知环境，自动开灯、开风扇',
    intro: '智能家居里藏着许多“电子感官”——传感器：光线传感器能感觉明暗，温度传感器能感觉冷热。给小屋设定规则：光线暗到多少就自动开灯，温度高到多少就自动开风扇。然后让时间过一整天，看看小屋会不会犯错！',
    goal: '设置好规则，让小屋一整天都不犯错',
    fact: '<p><b>传感器</b>是电子设备的“感官”：光线传感器、温度传感器、声音传感器、红外人体传感器……它们把外面的变化变成电信号送给电脑。</p><p>电脑根据规则做出判断（如果光线 &lt; 20，就开灯），再去控制灯、风扇等设备，这就是<b>自动控制</b>：<b>感知 → 判断 → 执行</b>。</p><p>🏙️ 楼道里的声控灯、自动感应门、扫地机器人、自动驾驶汽车，都用到了传感器和自动控制。</p>',
    quiz: [
      { q: '楼道里的声控灯用到了哪种传感器？', options: ['声音传感器', '温度传感器'], answer: 0, explain: '听到声音，灯就亮了。' },
      { q: '自动控制的过程是？', options: ['感知 → 判断 → 执行', '执行 → 感知 → 判断'], answer: 0, explain: '先感知，再判断，最后执行。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let lightTh = 60, tempTh = 22, hour = 6, running = false, mistakes = 0, checks = 0, t = 0, done = false;
      const light = h => Math.round(Math.max(0, Math.sin((h - 6) / 12 * Math.PI)) * 100);
      const temp = h => Math.round(22 + 9 * Math.sin((h - 9) / 12 * Math.PI));
      // 该开还是该关；有点亮、有点热的时候（返回 null）开不开都算对
      const lampShould = h => (light(h) === 0 ? true : light(h) >= 40 ? false : null);
      const fanShould = h => (temp(h) >= 29 ? true : temp(h) <= 25 ? false : null);
      const wrongAt = (should, actual) => should !== null && should !== actual;
      const lampOn = h => light(h) < lightTh, fanOn = h => temp(h) > tempTh;
      function runDay() {
        if (running) return;
        running = true;
        hour = 0;
        mistakes = 0;
        checks = 0;
        Sci.sfx('click');
        api.note('一天开始了，时间快进中……');
      }
      api.loop(dt => {
        t += dt;
        if (running) {
          const before = Math.floor(hour);
          hour += dt * 2.4;
          if (Math.floor(hour) !== before && hour < 24) {
            checks++;
            const h = Math.floor(hour);
            if (wrongAt(lampShould(h), lampOn(h)) || wrongAt(fanShould(h), fanOn(h))) { mistakes++; Sci.sfx('bad'); }
          }
          if (hour >= 24) {
            running = false;
            hour = 24;
            if (!mistakes) { Sci.sfx('star'); api.note('🎉 一整天都没犯错！天黑自动开灯，天热自动开风扇。'); if (!done) { done = true; api.goalDone(); } }
            else api.note(`这一天小屋犯了 ${mistakes} 次错：白天亮着灯、晚上不开灯，或者不热却开风扇……调一调规则再试试。`);
          }
        }
        const h = hour % 24;
        const L = light(h), T = temp(h);
        const sky = Sci.mixColor([25, 30, 70], [140, 200, 255], L / 100);
        ctx.fillStyle = Sci.rgb(sky);
        ctx.fillRect(0, 0, 800, 450);
        // 太阳或月亮
        const a = (h - 6) / 12 * Math.PI;
        if (L > 0) D.emoji(ctx, '☀️', 400 - Math.cos(a) * 340, 360 - Math.sin(a) * 300, 50);
        else D.emoji(ctx, '🌙', 620, 70, 40);
        ctx.fillStyle = '#69db7c';
        ctx.fillRect(0, 380, 800, 70);
        // 小屋
        ctx.fillStyle = '#ffe8cc';
        ctx.fillRect(220, 200, 300, 180);
        ctx.fillStyle = '#c92a2a';
        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.lineTo(370, 110);
        ctx.lineTo(540, 200);
        ctx.fill();
        const lamp = lampOn(h), fan = fanOn(h);
        if (lamp) D.circle(ctx, 300, 240, 60, 'rgba(255,224,102,.45)');
        D.circle(ctx, 300, 230, 16, lamp ? '#ffe066' : '#dee2e6', '#868e96', 2);
        D.text(ctx, '💡 灯', 300, 270, { size: 14 });
        ctx.save();
        ctx.translate(440, 260);
        ctx.rotate(fan ? t * 12 : 0);
        for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.fillStyle = '#74c0fc'; ctx.beginPath(); ctx.ellipse(0, -18, 7, 18, 0, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
        D.text(ctx, '🌀 风扇', 440, 310, { size: 14 });
        // 仪表
        D.rrect(ctx, 570, 120, 215, 200, 14);
        ctx.fillStyle = 'rgba(255,255,255,.93)';
        ctx.fill();
        D.text(ctx, `🕐 ${String(Math.floor(h)).padStart(2, '0')}:00`, 677, 148, { size: 20 });
        D.text(ctx, `光线传感器：${L}`, 677, 185, { size: 15, color: '#e67700' });
        D.text(ctx, `温度传感器：${T}°C`, 677, 212, { size: 15, color: '#e03131' });
        D.text(ctx, `灯：${lamp ? '开' : '关'}　风扇：${fan ? '开' : '关'}`, 677, 245, { size: 15 });
        D.text(ctx, running ? `犯错 ${mistakes} 次` : '', 677, 280, { size: 15, color: '#c92a2a' });
        D.text(ctx, `规则：光线 < ${lightTh} 就开灯；温度 > ${tempTh}°C 就开风扇`, 400, 30, { size: 16, color: '#fff', stroke: 'rgba(0,0,0,.4)', strokeWidth: 4 });
      });
      api.slider('光线低于多少开灯', 0, 100, 5, lightTh, v => { if (!running) lightTh = v; });
      api.slider('温度高于多少开风扇', 18, 34, 1, tempTh, v => { if (!running) tempTh = v; }, v => v + '°C');
      api.button('⏩ 过一整天', runDay);
      api.note('👆 设定好两条规则，点“过一整天”，看看小屋会不会犯错。');
    },
  });

  /* ================= 10. 逻辑门 ================= */
  const GATES = { AND: ['与门', (a, b) => a && b, '两个开关都打开，灯才亮'], OR: ['或门', (a, b) => a || b, '只要有一个开关打开，灯就亮'], NOT: ['非门', a => !a, '输入是开，输出就是关；输入是关，输出就是开'] };

  Sci.register({
    id: 'logic',
    subject: 'infotech',
    level: 5,
    emoji: '🔌',
    title: '逻辑门',
    desc: '电脑最基本的“思考零件”',
    intro: '电脑能做各种复杂的计算，可它最基本的零件却非常简单，叫做“逻辑门”。每个逻辑门根据输入的开关（1 或 0），决定输出的灯亮不亮。拨动开关，试出每种逻辑门的所有情况，把它们的“真值表”填满吧！',
    goal: '填满与门、或门、非门的真值表',
    fact: '<p><b>与门（AND）</b>：两个输入都是 1，输出才是 1，就像串联的两个开关。<b>或门（OR）</b>：只要有一个输入是 1，输出就是 1，就像并联的开关。<b>非门（NOT）</b>：把输入反过来，1 变 0，0 变 1。</p><p>把成千上万个逻辑门组合起来，就能做加法、比较大小、记住数字……手机里的芯片上有几十亿个这样的小开关（晶体管）！</p><p>🚪 生活里的“与”：要同时有钥匙和密码才能开保险箱；“或”：前门和后门哪个开着都能进屋。</p>',
    quiz: [
      { q: '与门的两个输入是 1 和 0，输出是几？', options: ['0', '1'], answer: 0, explain: '与门要两个都是 1，输出才是 1。' },
      { q: '非门输入 1，输出是几？', options: ['0', '1'], answer: 0, explain: '非门把输入反过来。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let g = 'AND', a = false, b = false, t = 0;
      const seen = { AND: new Set(), OR: new Set(), NOT: new Set() };
      const record = () => {
        const k = g === 'NOT' ? String(+a) : `${+a}${+b}`;
        if (!seen[g].has(k)) { seen[g].add(k); Sci.sfx('tick'); }
        const full = s => (s === 'NOT' ? seen[s].size === 2 : seen[s].size === 4);
        if (full(g)) api.note(`✅ ${GATES[g][0]}的真值表填满了：${GATES[g][2]}。`);
        if (['AND', 'OR', 'NOT'].every(full)) api.goalDone();
      };
      api.pointer(st, {
        down(p) {
          if (Math.hypot(p.x - 120, p.y - 160) < 45) { a = !a; record(); Sci.sfx('click'); }
          else if (g !== 'NOT' && Math.hypot(p.x - 120, p.y - 300) < 45) { b = !b; record(); Sci.sfx('click'); }
        },
      });
      api.loop(dt => {
        t += dt;
        const out = g === 'NOT' ? GATES.NOT[1](a) : GATES[g][1](a, b);
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 450);
        const sw = (x, y, on, label) => {
          D.rrect(ctx, x - 40, y - 22, 80, 44, 22);
          ctx.fillStyle = on ? '#40c057' : '#ced4da';
          ctx.fill();
          D.circle(ctx, on ? x + 18 : x - 18, y, 18, '#fff');
          D.text(ctx, `${label} = ${on ? 1 : 0}`, x, y + 42, { size: 16 });
        };
        sw(120, 160, a, '输入 A');
        if (g !== 'NOT') sw(120, 300, b, '输入 B');
        // 导线
        ctx.strokeStyle = '#495057';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(160, 160);
        ctx.lineTo(260, 160);
        ctx.lineTo(260, g === 'NOT' ? 230 : 200);
        ctx.lineTo(300, g === 'NOT' ? 230 : 200);
        if (g !== 'NOT') { ctx.moveTo(160, 300); ctx.lineTo(260, 300); ctx.lineTo(260, 260); ctx.lineTo(300, 260); }
        ctx.moveTo(440, 230);
        ctx.lineTo(520, 230);
        ctx.stroke();
        // 逻辑门
        ctx.fillStyle = '#7048e8';
        ctx.beginPath();
        if (g === 'AND') { ctx.moveTo(300, 170); ctx.lineTo(380, 170); ctx.arc(380, 230, 60, -Math.PI / 2, Math.PI / 2); ctx.lineTo(300, 290); }
        else if (g === 'OR') { ctx.moveTo(300, 170); ctx.quadraticCurveTo(400, 170, 440, 230); ctx.quadraticCurveTo(400, 290, 300, 290); ctx.quadraticCurveTo(340, 230, 300, 170); }
        else { ctx.moveTo(300, 180); ctx.lineTo(420, 230); ctx.lineTo(300, 280); }
        ctx.closePath();
        ctx.fill();
        if (g === 'NOT') D.circle(ctx, 428, 230, 9, '#fff', '#7048e8', 3);
        D.text(ctx, GATES[g][0], 360, 230, { size: 18, color: '#fff' });
        // 灯
        if (out) D.circle(ctx, 560, 230, 55, 'rgba(255,224,102,.45)');
        D.circle(ctx, 560, 230, 30, out ? '#ffe066' : '#e9ecef', '#868e96', 3);
        D.text(ctx, `输出 = ${out ? 1 : 0}`, 560, 290, { size: 16 });
        // 真值表
        const rows = g === 'NOT' ? ['0', '1'] : ['00', '01', '10', '11'];
        D.rrect(ctx, 630, 60, 155, 50 + rows.length * 36, 12);
        ctx.fillStyle = '#fff';
        ctx.fill();
        D.text(ctx, g === 'NOT' ? 'A → 输出' : 'A B → 输出', 707, 82, { size: 14, color: '#6f6a85' });
        rows.forEach((r, i) => {
          const known = seen[g].has(r);
          const o = g === 'NOT' ? GATES.NOT[1](r === '1') : GATES[g][1](r[0] === '1', r[1] === '1');
          D.text(ctx, `${r.split('').join(' ')} → ${known ? (o ? 1 : 0) : '?'}`, 707, 116 + i * 36, { size: 18, color: known ? '#2b2840' : '#adb5bd' });
        });
        D.text(ctx, ['AND', 'OR', 'NOT'].map(k => ((k === 'NOT' ? seen[k].size === 2 : seen[k].size === 4) ? '✅' : '⬜') + GATES[k][0]).join('　'), 400, 400, { size: 16 });
        D.text(ctx, '👆 点开关拨动它', 120, 60, { size: 14, color: '#6f6a85', weight: 'normal' });
      });
      api.choice(Object.keys(GATES).map(k => [k, `${GATES[k][0]}（${k}）`]), g, v => { g = v; a = false; b = false; record(); });
      record();
      api.note('👆 拨动开关，试出所有 4 种组合。');
    },
  });
})();
