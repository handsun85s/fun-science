/* 信息科技（第三组）：网络安全小卫士 → 文件和文件夹 → 图片变数字 → 纠错魔术 → 推荐算法 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 11. 网络安全小卫士 ================= */
  const CASES = [
    ['陌生网友问你家住在哪里，你告诉了他', false, '家庭住址是隐私，不能告诉陌生人。'],
    ['设置密码时，用字母和数字混在一起', true, '这样的密码不容易被猜到。'],
    ['把自己的密码告诉好朋友', false, '密码只能自己知道，好朋友也不要告诉。'],
    ['收到“恭喜中大奖”的链接，马上点开', false, '很可能是骗人的，不要乱点链接。'],
    ['看到让人不舒服的内容，告诉爸爸妈妈', true, '遇到问题及时告诉家长或老师。'],
    ['上网时间到了，就关掉电脑去休息', true, '要控制上网时间，保护眼睛。'],
    ['在网上发布自己的照片和学校名字', false, '个人信息发到网上，坏人可能会利用。'],
    ['下载游戏时，请爸爸妈妈帮忙看看是不是正规的', true, '来路不明的软件可能有病毒。'],
    ['网友约你见面，你一个人偷偷去了', false, '非常危险！一定不能单独见网友。'],
    ['用完公共电脑后，退出自己的账号', true, '这样别人就不能用你的账号了。'],
  ];

  Sci.register({
    id: 'netsafety',
    subject: 'infotech',
    level: 1,
    emoji: '🛡️',
    title: '网络安全小卫士',
    desc: '上网时，哪些做法安全，哪些很危险？',
    intro: '网络就像一个巨大的城市，有很多好玩、有用的东西，但也藏着骗子和陷阱。小卫士们，来判断一下：下面这些做法是安全的，还是危险的？把卡片拖到对应的盾牌里！',
    goal: '把 10 张卡片都分对',
    fact: '<p>上网要记住几件事：</p><p>🔒 <b>保护个人信息</b>：姓名、住址、学校、电话、照片、密码，都不要随便告诉网上的人。</p><p>🚫 <b>不乱点、不乱下载</b>：陌生的链接、“中奖”消息、来路不明的软件，很可能是骗局或病毒。</p><p>👨‍👩‍👧 <b>有事告诉大人</b>：遇到让你害怕或不舒服的事，马上告诉爸爸妈妈或老师。绝对不要单独去见网友。</p><p>⏰ 合理安排上网时间，保护眼睛和身体。</p>',
    quiz: [
      { q: '网上有人问你的家庭住址，你应该？', options: ['不告诉他，并告诉爸爸妈妈', '告诉他'], answer: 0, explain: '个人信息要保密。' },
      { q: '下面哪个密码最安全？', options: ['123456', '自己的生日', 'Tg7k2pX9'], answer: 2, explain: '字母和数字混合、没有规律的密码最安全。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const cards = Sci.shuffle(CASES).map(c => ({ text: c[0], safe: c[1], why: c[2], put: null }));
      let cur = 0, drag = null, pos = { x: 400, y: 120 };
      api.pointer(st, {
        down(p) { if (cur < cards.length && Math.abs(p.x - pos.x) < 190 && Math.abs(p.y - pos.y) < 55) drag = { ox: pos.x - p.x, oy: pos.y - p.y }; },
        move(p) { if (drag) { pos.x = p.x + drag.ox; pos.y = p.y + drag.oy; } },
        up() {
          if (!drag) return;
          drag = null;
          if (pos.y < 250) { pos = { x: 400, y: 120 }; return; }
          const c = cards[cur], safe = pos.x < 400;
          if (safe !== c.safe) { Sci.sfx('bad'); api.note(`再想一想：${c.why}`); pos = { x: 400, y: 120 }; return; }
          c.put = safe;
          cur++;
          pos = { x: 400, y: 120 };
          Sci.sfx('good');
          api.note(`✅ ${c.safe ? '安全' : '危险'}！${c.why}` + (cur < cards.length ? `（还有 ${cards.length - cur} 张）` : ''));
          if (cur === cards.length) api.timeout(() => { api.note('🎉 全部判断正确，你是合格的网络安全小卫士！'); api.goalDone(); }, 1500);
        },
      });
      api.loop(() => {
        ctx.fillStyle = '#e7f5ff';
        ctx.fillRect(0, 0, 800, 450);
        D.rrect(ctx, 20, 260, 370, 175, 18);
        ctx.fillStyle = '#d3f9d8';
        ctx.fill();
        D.text(ctx, '✅ 安全的做法', 205, 290, { size: 20, color: '#2b8a3e' });
        D.rrect(ctx, 410, 260, 370, 175, 18);
        ctx.fillStyle = '#ffe3e3';
        ctx.fill();
        D.text(ctx, '❌ 危险的做法', 595, 290, { size: 20, color: '#c92a2a' });
        const safeN = cards.filter(c => c.put === true).length, badN = cards.filter(c => c.put === false).length;
        D.text(ctx, '🛡️'.repeat(Math.min(safeN, 6)), 205, 360, { size: 26 });
        D.text(ctx, '⚠️'.repeat(Math.min(badN, 6)), 595, 360, { size: 26 });
        D.text(ctx, `${safeN} 张`, 205, 405, { size: 15, color: '#2b8a3e' });
        D.text(ctx, `${badN} 张`, 595, 405, { size: 15, color: '#c92a2a' });
        if (cur < cards.length) {
          D.rrect(ctx, pos.x - 190, pos.y - 50, 380, 100, 16);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.strokeStyle = '#4dabf7';
          ctx.lineWidth = 3;
          ctx.stroke();
          D.wrap(ctx, cards[cur].text, pos.x, pos.y - (cards[cur].text.length > 17 ? 12 : 0), 340, 26, { size: 19, weight: 'bold' });
        }
        D.text(ctx, `第 ${Math.min(cur + 1, cards.length)} / ${cards.length} 张`, 780, 22, { size: 14, align: 'right', color: '#6f6a85' });
      });
      api.note('👆 把卡片拖到左边“安全”或右边“危险”的盾牌里。');
    },
  });

  /* ================= 12. 文件和文件夹 ================= */
  const FILES = [['📷', '海边照片.jpg', 'photo'], ['🎵', '小星星.mp3', 'music'], ['📝', '数学作业.doc', 'work'], ['📷', '生日照片.jpg', 'photo'], ['🎵', '生日歌.mp3', 'music'], ['📝', '日记.doc', 'work'], ['📷', '小猫照片.jpg', 'photo'], ['🎵', '国歌.mp3', 'music'], ['📝', '英语单词.doc', 'work']];
  const FOLDERS = [['photo', '📁 照片', 110], ['music', '📁 音乐', 400], ['work', '📁 作业', 690]];

  Sci.register({
    id: 'folders',
    subject: 'infotech',
    level: 2,
    emoji: '📁',
    title: '文件和文件夹',
    desc: '把乱糟糟的电脑桌面整理干净',
    intro: '电脑桌面上堆满了各种文件，找东西太难啦！就像整理书包要把书本分类一样，电脑里的文件也要放进不同的“文件夹”。看看文件的图标和名字后面的“扩展名”，把它们拖进正确的文件夹吧！',
    goal: '把 9 个文件都放进正确的文件夹',
    fact: '<p>电脑里的每一篇作文、每一张照片、每一首歌，都是一个<b>文件</b>。文件名后面的“.jpg”“.mp3”“.doc”叫<b>扩展名</b>，告诉电脑这是什么类型的文件：jpg 是图片，mp3 是音乐，doc 是文档。</p><p><b>文件夹</b>就像抽屉，可以把同类的文件放在一起，文件夹里还能再放文件夹。文件放在哪里，可以用“路径”来表示，比如 <b>D:\\作业\\数学作业.doc</b>。</p><p>🗂️ 养成分类整理的好习惯，找东西又快又方便。</p>',
    quiz: [
      { q: '“春游.jpg”是什么类型的文件？', options: ['图片', '音乐', '文档'], answer: 0, explain: '.jpg 是图片文件。' },
      { q: '文件夹的作用是？', options: ['把文件分类放好', '让电脑跑得更快'], answer: 0, explain: '文件夹用来分类管理文件。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const files = Sci.shuffle(FILES).map((f, i) => ({ e: f[0], name: f[1], kind: f[2], hx: 60 + (i % 5) * 160, hy: 60 + Math.floor(i / 5) * 100, x: 0, y: 0, put: false }));
      files.forEach(f => { f.x = f.hx; f.y = f.hy; });
      const count = { photo: 0, music: 0, work: 0 };
      let drag = null;
      api.pointer(st, {
        down(p) { const f = files.find(f => !f.put && Math.abs(p.x - f.x) < 60 && Math.abs(p.y - f.y) < 40); if (f) drag = { f, ox: f.x - p.x, oy: f.y - p.y }; },
        move(p) { if (drag) { drag.f.x = p.x + drag.ox; drag.f.y = p.y + drag.oy; } },
        up() {
          if (!drag) return;
          const f = drag.f;
          drag = null;
          const fd = FOLDERS.find(d => Math.abs(f.x - d[2]) < 110 && f.y > 270);
          if (!fd) { f.x = f.hx; f.y = f.hy; return; }
          if (fd[0] !== f.kind) {
            Sci.sfx('bad');
            const ext = f.name.split('.')[1];
            api.note(`看看扩展名“.${ext}”：${ext === 'jpg' ? '它是一张图片' : ext === 'mp3' ? '它是一首音乐' : '它是一篇文档'}。`);
            f.x = f.hx;
            f.y = f.hy;
            return;
          }
          f.put = true;
          count[fd[0]]++;
          Sci.sfx('good');
          const left = files.filter(x => !x.put).length;
          api.note(`✅ “${f.name}”放进了${fd[1].slice(3)}文件夹。` + (left ? `（还有 ${left} 个）` : ''));
          if (!left) api.timeout(() => { api.note('🎉 桌面整理干净啦！找文件就方便多了。'); api.goalDone(); }, 1200);
        },
      });
      api.loop(() => {
        ctx.fillStyle = '#4263eb';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = 'rgba(255,255,255,.12)';
        ctx.fillRect(0, 420, 800, 30);
        FOLDERS.forEach(([k, n, x]) => {
          D.rrect(ctx, x - 100, 290, 200, 110, 14);
          ctx.fillStyle = '#ffd43b';
          ctx.fill();
          D.text(ctx, n.slice(3), x, 330, { size: 20, color: '#5c3d00' });
          D.text(ctx, `${count[k]} 个文件`, x, 365, { size: 14, color: '#5c3d00', weight: 'normal' });
        });
        files.filter(f => !f.put).forEach(f => {
          D.emoji(ctx, f.e, f.x, f.y - 8, 40);
          D.text(ctx, f.name, f.x, f.y + 28, { size: 13, color: '#fff' });
        });
      });
      api.note('👆 把桌面上的文件拖进下面对应的文件夹。');
    },
  });

  /* ================= 13. 图片变数字 ================= */
  // 每一行的编码：“白3 黑2 白3” 表示先 3 个白格，再 2 个黑格，再 3 个白格
  const RLE_PICS = [
    ['小房子', ['w3 b2 w3', 'w2 b4 w2', 'w1 b6 w1', 'b8', 'w1 b6 w1', 'w1 b2 w2 b2 w1', 'w1 b2 w2 b2 w1', 'w1 b6 w1']],
    ['小树', ['w3 b2 w3', 'w2 b4 w2', 'w1 b6 w1', 'b8', 'w2 b4 w2', 'w3 b2 w3', 'w3 b2 w3', 'w2 b4 w2']],
  ];
  const decodeRow = s => s.split(' ').reduce((a, tok) => a.concat(new Array(+tok.slice(1)).fill(tok[0] === 'b' ? 1 : 0)), []);

  Sci.register({
    id: 'rle',
    subject: 'infotech',
    level: 3,
    emoji: '🖼️',
    title: '图片变数字',
    desc: '电脑怎样用一串数字记住一张图片？',
    intro: '电脑记图片时，不是真的“看”到了图片，而是记下了一串数字。左边每一行都有一串密码，比如“白3 黑2 白3”，意思是：先涂 3 个白格，再涂 2 个黑格，再 3 个白格。按照密码把格子涂黑，看看会出现什么图案！',
    goal: '按照编码画出 2 幅图案',
    fact: '<p>把图片变成数字的方法有很多种。这里用的方法叫<b>行程编码</b>：不一个个格子地记，而是记“连续几个格子是同一种颜色”。</p><p>如果图片里有大片相同的颜色，这样记能省下很多数字，让文件变小，这叫<b>压缩</b>。传真机就用过这种方法。</p><p>📸 手机照片用的 JPG 格式更复杂，但道理相似：用更少的数字记住一张图片，节省存储空间，传得更快。</p>',
    quiz: [
      { q: '“白2 黑4 白2”这一行一共有几个格子？', options: ['6 个', '8 个', '4 个'], answer: 1, explain: '2 + 4 + 2 = 8。' },
      { q: '把文件变小、节省空间，叫做？', options: ['压缩', '加密', '删除'], answer: 0, explain: '压缩能用更少的数据表示同样的内容。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const N = 8, C = 42, GX = 330, GY = 50;
      let pi = 0, grid = [];
      const done = new Set();
      const reset = () => { grid = Array.from({ length: N }, () => new Array(N).fill(0)); };
      reset();
      const ok = () => RLE_PICS[pi][1].every((code, y) => decodeRow(code).every((v, x) => v === grid[y][x]));
      let paintVal = 1, painting = false;
      const cell = p => [Math.floor((p.x - GX) / C), Math.floor((p.y - GY) / C)];
      api.pointer(st, {
        down(p) {
          const [x, y] = cell(p);
          if (x < 0 || y < 0 || x >= N || y >= N) return;
          paintVal = grid[y][x] ? 0 : 1;
          painting = true;
          grid[y][x] = paintVal;
          Sci.sfx('tick');
        },
        move(p, a) {
          if (!a || !painting) return;
          const [x, y] = cell(p);
          if (x < 0 || y < 0 || x >= N || y >= N) return;
          grid[y][x] = paintVal;
        },
        up() {
          painting = false;
          if (ok() && !done.has(pi)) {
            done.add(pi);
            Sci.sfx('star');
            api.note(`🎉 画出了${RLE_PICS[pi][0]}！64 个格子，编码只用了 ${RLE_PICS[pi][1].join(' ').split(' ').length} 组数字。` + (done.size < 2 ? '再画另一幅吧。' : ''));
            if (done.size === 2) api.goalDone();
          }
        },
      });
      api.loop(() => {
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 450);
        RLE_PICS[pi][1].forEach((code, y) => {
          const rowOk = decodeRow(code).every((v, x) => v === grid[y][x]);
          D.text(ctx, code.replace(/w/g, '白').replace(/b/g, '黑'), 300, GY + y * C + C / 2, { size: 16, align: 'right', color: rowOk ? '#2b8a3e' : '#495057' });
          if (rowOk) D.text(ctx, '✓', 316, GY + y * C + C / 2, { size: 16, color: '#2b8a3e' });
        });
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          ctx.fillStyle = grid[y][x] ? '#212529' : '#fff';
          ctx.fillRect(GX + x * C, GY + y * C, C, C);
          ctx.strokeStyle = '#ced4da';
          ctx.lineWidth = 1;
          ctx.strokeRect(GX + x * C, GY + y * C, C, C);
        }
        D.text(ctx, `完成 ${done.size}/2`, 720, 60, { size: 16, color: '#2b8a3e' });
        D.text(ctx, '👆 点格子涂黑', 720, 100, { size: 14, color: '#6f6a85', weight: 'normal' });
        D.text(ctx, '再点一次擦掉', 720, 122, { size: 14, color: '#6f6a85', weight: 'normal' });
      });
      api.choice(RLE_PICS.map((p, i) => [i, `图案 ${i + 1}`]), 0, v => { pi = v; reset(); });
      api.button('🧹 擦干净', reset);
      api.note('👆 按照左边每一行的编码，把右边的格子涂黑。');
    },
  });

  /* ================= 14. 纠错魔术 ================= */
  Sci.register({
    id: 'parity',
    subject: 'infotech',
    level: 4,
    emoji: '🎴',
    title: '纠错魔术',
    desc: '一张卡片被偷偷翻了，你能找出来吗？',
    intro: '这是一个电脑里的魔术！方阵里每一行、每一列的黑卡片都是“双数”个。一阵风吹过，偷偷翻了一张卡片……你能找出是哪一张吗？秘诀：数一数每一行、每一列的黑卡片，看看哪一行、哪一列变成了“单数”！',
    goal: '找出 3 次被翻动的卡片',
    fact: '<p>电脑传送数据时，有时一个 0 会意外变成 1。为了发现错误，电脑会额外加上一些“检查用”的数字，让每一行、每一列的 1 都是双数，这叫<b>奇偶校验</b>。</p><p>一旦某一行和某一列变成了单数，交叉的那个位置就是出错的地方，电脑还能自动把它改回来！这就是<b>纠错码</b>。</p><p>💿 光盘有划痕也能播放、二维码脏了一点也能扫出来，都是因为用了纠错码。</p>',
    quiz: [
      { q: '如果某一行、某一列的黑卡片变成了单数，说明？', options: ['它们交叉的那张卡片被翻了', '所有卡片都被翻了'], answer: 0, explain: '单数行和单数列的交叉点就是出错的位置。' },
      { q: '二维码脏了一点还能扫出来，是因为？', options: ['用了纠错码', '手机很聪明会猜'], answer: 0, explain: '纠错码能发现并改正一部分错误。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const N = 6, C = 56, GX = 60, GY = 40;
      let grid = [], flipped = null, found = 0, hint = false, gust = 0, wrong = null, t = 0;
      function deal() {
        grid = Array.from({ length: N }, () => new Array(N).fill(0));
        for (let y = 0; y < N - 1; y++) for (let x = 0; x < N - 1; x++) grid[y][x] = Math.random() < 0.5 ? 1 : 0;
        // 最后一行、最后一列是“校验卡”，让每行每列的黑卡都是双数
        for (let y = 0; y < N - 1; y++) grid[y][N - 1] = grid[y].slice(0, N - 1).reduce((a, b) => a ^ b, 0);
        for (let x = 0; x < N; x++) grid[N - 1][x] = grid.slice(0, N - 1).reduce((a, r) => a ^ r[x], 0);
        flipped = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)];
        gust = 1.2;
        wrong = null;
        api.timeout(() => { grid[flipped[1]][flipped[0]] ^= 1; Sci.sfx('whoosh'); api.note('呼——一阵风吹过，有一张卡片被翻了！是哪一张？'); }, 900);
      }
      const rowCount = y => grid[y].reduce((a, b) => a + b, 0);
      const colCount = x => grid.reduce((a, r) => a + r[x], 0);
      api.pointer(st, {
        down(p) {
          if (gust > 0 || !flipped) return;
          const x = Math.floor((p.x - GX) / C), y = Math.floor((p.y - GY) / C);
          if (x < 0 || y < 0 || x >= N || y >= N) return;
          if (x === flipped[0] && y === flipped[1]) {
            found++;
            grid[y][x] ^= 1;
            flipped = null;
            Sci.sfx('star');
            api.note(`🎉 找到了！第 ${y + 1} 行、第 ${x + 1} 列的黑卡变成了单数，就是这张。（找到 ${found}/3）`);
            if (found >= 3) api.goalDone();
            api.timeout(deal, 2200);
          } else { wrong = [x, y]; Sci.sfx('bad'); api.note('不是这张哦。数一数：哪一行、哪一列的黑卡是单数？'); }
        },
      });
      api.loop(dt => {
        t += dt;
        gust = Math.max(0, gust - dt);
        ctx.fillStyle = '#f3f0ff';
        ctx.fillRect(0, 0, 800, 450);
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const wob = gust > 0 ? Math.sin(t * 30 + x + y) * 3 : 0;
          D.rrect(ctx, GX + x * C + 4 + wob, GY + y * C + 4, C - 8, C - 8, 8);
          ctx.fillStyle = grid[y][x] ? '#212529' : '#fff';
          ctx.fill();
          ctx.strokeStyle = x === N - 1 || y === N - 1 ? '#b197fc' : '#ced4da';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        if (wrong) D.text(ctx, '✖', GX + wrong[0] * C + C / 2, GY + wrong[1] * C + C / 2, { size: 22, color: '#e03131' });
        if (hint) {
          for (let y = 0; y < N; y++) { const n = rowCount(y); D.text(ctx, String(n), GX + N * C + 20, GY + y * C + C / 2, { size: 16, color: n % 2 ? '#e03131' : '#2b8a3e' }); }
          for (let x = 0; x < N; x++) { const n = colCount(x); D.text(ctx, String(n), GX + x * C + C / 2, GY + N * C + 18, { size: 16, color: n % 2 ? '#e03131' : '#2b8a3e' }); }
        }
        if (gust > 0) D.emoji(ctx, '🌬️', 60 + (1.2 - gust) * 400, 200, 60);
        D.text(ctx, '紫色边框 = 校验卡', 600, 60, { size: 15, color: '#7048e8' });
        D.text(ctx, '每行每列的黑卡都应该是双数', 600, 90, { size: 14, color: '#495057', weight: 'normal' });
        D.text(ctx, `找到 ${Math.min(found, 3)} / 3`, 600, 140, { size: 22, color: '#c0620a' });
      });
      api.toggle('🔢 帮我数一数', false, v => { hint = v; });
      deal();
      api.note('一阵风要来了，注意看！');
    },
  });

  /* ================= 15. 推荐算法 ================= */
  const CATS = [['animal', '🐱', '萌宠'], ['sport', '⚽', '运动'], ['game', '🎮', '游戏'], ['science', '🔬', '科学'], ['music', '🎵', '音乐'], ['food', '🍰', '美食']];

  Sci.register({
    id: 'recommend',
    subject: 'infotech',
    level: 5,
    emoji: '📱',
    title: '推荐算法',
    desc: 'App 为什么总给我推同一种视频？',
    intro: '视频 App 会“猜”你喜欢什么：你点了什么样的视频，它就推更多类似的给你。这背后是“推荐算法”。来做个实验：一直点同一类视频，看看推荐列表会变成什么样？然后想办法让推荐重新变得丰富多彩！',
    goal: '先让推荐变成同一类，再让它恢复成 4 类以上',
    fact: '<p><b>推荐算法</b>会记录你看过、点赞过什么，计算你可能喜欢的内容，然后优先推给你。它很方便，能帮我们找到感兴趣的东西。</p><p>但如果只看一种内容，推荐会越来越单一，好像被关在一个“茧”里，看不到别的世界，这叫<b>信息茧房</b>。</p><p>🌈 要主动去看不同领域的内容、多读书、多和别人交流，才能保持开阔的眼界。也要记得：App 推荐给你的，不一定都是真的、对的。</p>',
    quiz: [
      { q: '推荐算法主要根据什么来推荐内容？', options: ['你以前看过、喜欢过的内容', '完全随便推荐'], answer: 0, explain: '它根据你的浏览记录来猜你的喜好。' },
      { q: '怎样避免“信息茧房”？', options: ['主动去了解不同领域的内容', '只看自己喜欢的一种'], answer: 0, explain: '多接触不同的内容，眼界更开阔。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const score = {};
      CATS.forEach(c => { score[c[0]] = 1; });
      let feed = [], bubble = false, done = false, t = 0;
      function makeFeed() {
        const total = Object.values(score).reduce((a, b) => a + b, 0);
        feed = [];
        for (let i = 0; i < 6; i++) {
          let r = Math.random() * total;
          const c = CATS.find(cc => (r -= score[cc[0]]) < 0) || CATS[0];
          feed.push(c);
        }
        const kinds = new Set(feed.map(c => c[0])).size;
        if (kinds === 1 && !bubble) { bubble = true; Sci.sfx('bad'); api.note(`推荐列表全都变成了“${feed[0][2]}”！你被关进了“信息茧房”。试试点“换个口味”去看看别的内容。`); }
        else if (bubble && kinds >= 4 && !done) { done = true; Sci.sfx('star'); api.note(`🎉 推荐又变得丰富多彩了，有 ${kinds} 类内容！主动看看不同的东西，眼界更开阔。`); api.goalDone(); }
      }
      makeFeed();
      api.pointer(st, {
        down(p) {
          const i = feed.findIndex((c, k) => { const x = 40 + (k % 3) * 160, y = 70 + Math.floor(k / 3) * 160; return p.x > x && p.x < x + 140 && p.y > y && p.y < y + 140; });
          if (i < 0) return;
          const c = feed[i];
          score[c[0]] *= 2.2;
          Sci.sfx('pop');
          api.note(`看了一个“${c[2]}”视频，App 记住了：你喜欢${c[2]}。`);
          makeFeed();
        },
      });
      api.loop(dt => {
        t += dt;
        ctx.fillStyle = '#f1f3f5';
        ctx.fillRect(0, 0, 800, 450);
        D.rrect(ctx, 20, 20, 500, 410, 24);
        ctx.fillStyle = '#212529';
        ctx.fill();
        D.text(ctx, '📱 为你推荐', 270, 46, { size: 16, color: '#fff' });
        feed.forEach((c, k) => {
          const x = 40 + (k % 3) * 160, y = 70 + Math.floor(k / 3) * 160;
          D.rrect(ctx, x, y, 140, 140, 14);
          ctx.fillStyle = '#495057';
          ctx.fill();
          D.emoji(ctx, c[1], x + 70, y + 60, 56);
          D.text(ctx, c[2] + '视频', x + 70, y + 118, { size: 15, color: '#fff' });
        });
        // App 心里记的“喜好”
        D.rrect(ctx, 540, 20, 245, 300, 16);
        ctx.fillStyle = '#fff';
        ctx.fill();
        D.text(ctx, 'App 猜你喜欢……', 662, 46, { size: 15, color: '#6f6a85' });
        const total = Object.values(score).reduce((a, b) => a + b, 0);
        CATS.forEach((c, i) => {
          const y = 80 + i * 38, w = score[c[0]] / total * 150;
          D.text(ctx, c[1], 562, y, { size: 20 });
          ctx.fillStyle = '#e9ecef';
          ctx.fillRect(585, y - 9, 150, 18);
          ctx.fillStyle = '#4c6ef5';
          ctx.fillRect(585, y - 9, w, 18);
          D.text(ctx, Math.round(score[c[0]] / total * 100) + '%', 760, y, { size: 12, color: '#495057', weight: 'normal' });
        });
        D.text(ctx, `推荐里有 ${new Set(feed.map(c => c[0])).size} 类内容`, 662, 350, { size: 16, color: '#2b2840' });
        D.text(ctx, `${bubble ? '✅' : '⬜'} 信息茧房　${done ? '✅' : '⬜'} 走出茧房`, 662, 385, { size: 14 });
      });
      api.button('🔄 刷新推荐', makeFeed);
      api.button('🌈 换个口味（主动搜索别的内容）', () => {
        const low = CATS.slice().sort((a, b) => score[a[0]] - score[b[0]]).slice(0, 3);
        low.forEach(c => { score[c[0]] *= 8; });
        const top = CATS.slice().sort((a, b) => score[b[0]] - score[a[0]])[0];
        score[top[0]] /= 2;
        Sci.sfx('whoosh');
        api.note(`你主动搜索了${low.map(c => c[2]).join('、')}的内容。`);
        makeFeed();
      });
      api.note('👆 一直点同一类视频（比如游戏），看看推荐会变成什么样。');
    },
  });
})();
