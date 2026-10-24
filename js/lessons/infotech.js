/* 信息科技（第一组）：认识电脑 → 二进制 → 凯撒密码 → 网络数据包 → 人工智能怎样学习 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 1. 认识电脑 ================= */
  const DEVICES = [['⌨️', '键盘', 'in'], ['🖱️', '鼠标', 'in'], ['📷', '摄像头', 'in'], ['🎤', '麦克风', 'in'], ['🖥️', '显示器', 'out'], ['🔊', '音箱', 'out'], ['🖨️', '打印机', 'out'], ['🎧', '耳机', 'out']];

  Sci.register({
    id: 'computer',
    subject: 'infotech',
    level: 1,
    emoji: '💻',
    title: '认识电脑',
    desc: '哪些设备把信息送进电脑，哪些把结果送出来？',
    intro: '电脑由好多部分组成。有的设备负责把我们的信息“送进”电脑，比如用键盘打字；有的设备负责把电脑的结果“送出来”给我们，比如显示器上的画面。把这些设备拖到正确的盒子里吧！',
    goal: '把 8 个设备分到“输入”和“输出”两个盒子里',
    fact: '<p><b>输入设备</b>把信息送进电脑：键盘（打字）、鼠标（点选）、摄像头（拍照）、麦克风（录音）、扫描仪、触摸屏。</p><p><b>输出设备</b>把电脑处理的结果送出来：显示器（画面）、音箱和耳机（声音）、打印机（纸上的字和图）。</p><p>💡 电脑的“大脑”在<b>主机</b>里，叫做 <b>CPU（中央处理器）</b>，每秒能做几十亿次计算；<b>内存</b>是临时的“草稿本”，<b>硬盘</b>是长期保存东西的“仓库”。</p>',
    quiz: [
      { q: '下面哪个是输入设备？', options: ['键盘', '显示器', '音箱'], answer: 0, explain: '键盘把我们打的字送进电脑。' },
      { q: '电脑的“大脑”叫什么？', options: ['CPU（中央处理器）', '鼠标', '打印机'], answer: 0, explain: 'CPU 负责计算和处理信息。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const items = Sci.shuffle(DEVICES).map((d, i) => ({ e: d[0], name: d[1], kind: d[2], hx: 70 + i * 94, hy: 80, x: 70 + i * 94, y: 80, put: null }));
      let drag = null;
      api.pointer(st, {
        down(p) {
          const it = items.find(it => it.put === null && Math.hypot(p.x - it.x, p.y - it.y) < 40);
          if (it) { drag = { it, ox: it.x - p.x, oy: it.y - p.y }; Sci.sfx('pop'); }
        },
        move(p) { if (drag) { drag.it.x = p.x + drag.ox; drag.it.y = p.y + drag.oy; } },
        up() {
          if (!drag) return;
          const it = drag.it;
          drag = null;
          if (it.y < 200) { it.x = it.hx; it.y = it.hy; return; }
          const kind = it.x < 400 ? 'in' : 'out';
          if (kind !== it.kind) {
            Sci.sfx('bad');
            api.note(it.kind === 'in' ? `${it.name}是把信息送进电脑的，是输入设备哦。` : `${it.name}是把电脑的结果送出来的，是输出设备哦。`);
            it.x = it.hx;
            it.y = it.hy;
            return;
          }
          const k = items.filter(o => o.put === kind).length;
          it.put = kind;
          it.x = (kind === 'in' ? 70 : 450) + k * 80;
          it.y = 330;
          Sci.sfx('good');
          const left = items.filter(o => o.put === null).length;
          api.note(`✅ ${it.name}是${kind === 'in' ? '输入' : '输出'}设备。` + (left ? `（还有 ${left} 个）` : ''));
          if (!left) api.timeout(() => { api.note('🎉 全部分对了！输入设备 → 电脑主机处理 → 输出设备。'); api.goalDone(); }, 1200);
        },
      });
      api.loop(() => {
        ctx.fillStyle = '#f1f3f5';
        ctx.fillRect(0, 0, 800, 450);
        D.rrect(ctx, 20, 230, 370, 200, 18);
        ctx.fillStyle = '#d0ebff';
        ctx.fill();
        D.rrect(ctx, 410, 230, 370, 200, 18);
        ctx.fillStyle = '#ffe8cc';
        ctx.fill();
        D.text(ctx, '⬅️ 输入设备：把信息送进电脑', 205, 258, { size: 16, color: '#1864ab' });
        D.text(ctx, '➡️ 输出设备：把结果送出来', 595, 258, { size: 16, color: '#d9480f' });
        D.rrect(ctx, 340, 150, 120, 60, 10);
        ctx.fillStyle = '#495057';
        ctx.fill();
        D.text(ctx, '主机 CPU', 400, 180, { size: 16, color: '#fff' });
        items.forEach(it => {
          D.emoji(ctx, it.e, it.x, it.y, 46);
          D.text(ctx, it.name, it.x, it.y + 36, { size: 14, color: '#495057' });
        });
      });
      api.note('👆 把上面的设备拖到下面的盒子里。');
    },
  });

  /* ================= 2. 二进制 ================= */
  const BIN_TARGETS = [5, 9, 13, 22, 31];

  Sci.register({
    id: 'binary',
    subject: 'infotech',
    level: 2,
    emoji: '0️⃣',
    title: '二进制魔法卡',
    desc: '电脑只认识 0 和 1，怎样表示所有的数？',
    intro: '电脑里只有两种信号：有电和没电，用 1 和 0 表示。只用 0 和 1，怎么表示 5、13、31 这些数呢？下面有 5 张魔法卡，上面的点数分别是 16、8、4、2、1。点卡片可以翻面：翻开的卡片表示 1，盖住的表示 0。翻出目标数字吧！',
    goal: '用二进制卡片翻出 5 个目标数字',
    fact: '<p>我们平时用的是<b>十进制</b>，满十进一。电脑用的是<b>二进制</b>，只有 0 和 1 两个数字，满二进一。</p><p>二进制每一位代表的数是 1、2、4、8、16……每次翻一倍。比如 13 = 8 + 4 + 1，写成二进制就是 <b>01101</b>。5 张卡片能表示 0 到 31 一共 32 个数。</p><p>💾 电脑里的文字、图片、声音、视频，最后都变成了一长串 0 和 1。一个 0 或 1 叫做 1 个<b>比特（bit）</b>，8 个比特叫 1 个<b>字节（byte）</b>。</p>',
    quiz: [
      { q: '二进制里只有哪两个数字？', options: ['0 和 1', '1 和 2', '0 到 9'], answer: 0, explain: '二进制只用 0 和 1。' },
      { q: '卡片 8、4、1 翻开，其他盖住，表示几？', options: ['12', '13', '14'], answer: 1, explain: '8 + 4 + 1 = 13。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const VALS = [16, 8, 4, 2, 1];
      const on = [false, false, false, false, false];
      let ti = 0, t = 0;
      const val = () => VALS.reduce((s, v, i) => s + (on[i] ? v : 0), 0);
      function check() {
        if (ti < BIN_TARGETS.length && val() === BIN_TARGETS[ti]) {
          Sci.sfx('star');
          api.note(`✅ ${BIN_TARGETS[ti]} = ${VALS.filter((v, i) => on[i]).join(' + ')}，二进制写作 ${on.map(o => (o ? 1 : 0)).join('')}。` + (ti < BIN_TARGETS.length - 1 ? '下一个目标！' : ''));
          ti++;
          if (ti === BIN_TARGETS.length) { api.timeout(() => { api.note('🎉 5 个数全翻出来啦！你已经会用二进制了。'); api.goalDone(); }, 1500); }
        }
      }
      api.pointer(st, {
        down(p) {
          const i = Math.floor((p.x - 40) / 148);
          if (i < 0 || i > 4 || p.y < 110 || p.y > 330) return;
          on[i] = !on[i];
          Sci.sfx('click');
          check();
        },
      });
      api.loop(dt => {
        t += dt;
        ctx.fillStyle = '#1e1b3a';
        ctx.fillRect(0, 0, 800, 450);
        VALS.forEach((v, i) => {
          const x = 40 + i * 148, w = 130;
          D.rrect(ctx, x, 120, w, 200, 14);
          ctx.fillStyle = on[i] ? '#fff' : '#5f3dc4';
          ctx.fill();
          if (on[i]) {
            const cols = v >= 8 ? 4 : v >= 4 ? 2 : v;
            for (let k = 0; k < v; k++) D.circle(ctx, x + w / 2 + ((k % cols) - (cols - 1) / 2) * 24, 160 + Math.floor(k / cols) * 24, 8, '#e64980');
            D.text(ctx, String(v), x + w / 2, 300, { size: 20, color: '#495057' });
          } else D.text(ctx, '?', x + w / 2, 220, { size: 50, color: '#9775fa' });
          D.text(ctx, on[i] ? '1' : '0', x + w / 2, 360, { size: 34, color: on[i] ? '#ffd43b' : '#868e96' });
        });
        D.text(ctx, `翻出的数：${val()}`, 220, 60, { size: 28, color: '#fff' });
        D.text(ctx, ti < BIN_TARGETS.length ? `🎯 目标：${BIN_TARGETS[ti]}` : '🎉 全部完成', 580, 60, { size: 28, color: '#ffd43b' });
        D.text(ctx, `二进制：${on.map(o => (o ? 1 : 0)).join('')}`, 400, 420, { size: 20, color: '#b197fc' });
      });
      api.button('🔄 全部盖住', () => { on.fill(false); });
      api.note(`👆 点卡片翻面，翻出目标数字 ${BIN_TARGETS[0]}。`);
    },
  });

  /* ================= 3. 凯撒密码 ================= */
  const SECRETS = [['PANDA', 3, '熊猫'], ['APPLE', 1, '苹果'], ['TIGER', 5, '老虎']];
  const shiftStr = (s, k) => s.replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0) - 65 + k + 26) % 26 + 65));

  Sci.register({
    id: 'caesar',
    subject: 'infotech',
    level: 3,
    emoji: '🔐',
    title: '凯撒密码',
    desc: '把字母挪几位，就能写出一封密信',
    intro: '两千多年前，古罗马的凯撒大帝用一种简单的方法给将军们写密信：把每个字母都往后挪几位，比如挪 3 位，A 就变成 D，B 变成 E。现在截获了 3 封密信，转动下面的密码轮，找到正确的“钥匙”（挪动的位数），把它们破译出来！',
    goal: '破译 3 封密信',
    fact: '<p>把信息变成别人看不懂的样子，叫<b>加密</b>；把它变回来，叫<b>解密</b>。凯撒密码就是把每个字母挪动固定的位数，挪动的位数就是<b>密钥</b>。</p><p>凯撒密码只有 25 种可能的钥匙，一个一个试很快就能破解，所以现在已经不安全了。</p><p>🔒 今天的手机支付、聊天软件，都用非常复杂的加密方法保护我们的信息，就算是超级电脑也要算几百万年才能破解。</p>',
    quiz: [
      { q: '用凯撒密码往后挪 1 位，“CAT”会变成什么？', options: ['DBU', 'BZS', 'CAT'], answer: 0, explain: 'C→D，A→B，T→U。' },
      { q: '把信息变成别人看不懂的样子，叫做？', options: ['加密', '解密', '下载'], answer: 0, explain: '加密能保护信息不被别人看懂。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let si = 0, key = 0, t = 0;
      const cracked = new Set();
      const cipher = () => shiftStr(SECRETS[si][0], SECRETS[si][1]);
      function check() {
        const plain = shiftStr(cipher(), -key);
        if (plain === SECRETS[si][0] && !cracked.has(si)) {
          cracked.add(si);
          Sci.sfx('star');
          api.note(`🔓 破译成功！密钥是 ${key}，密信写的是 ${plain}（${SECRETS[si][2]}）。` + (cracked.size < 3 ? '换下一封密信。' : ''));
          if (cracked.size === 3) api.goalDone();
        }
      }
      api.loop(dt => {
        t += dt;
        ctx.fillStyle = '#fff9db';
        ctx.fillRect(0, 0, 800, 450);
        // 密码轮
        const CX = 200, CY = 240, R1 = 160, R2 = 115;
        D.circle(ctx, CX, CY, R1 + 20, '#ffe066', '#e8b500', 3);
        D.circle(ctx, CX, CY, R2 + 18, '#fff', '#e8b500', 3);
        for (let i = 0; i < 26; i++) {
          const a = i / 26 * Math.PI * 2 - Math.PI / 2;
          D.text(ctx, String.fromCharCode(65 + i), CX + Math.cos(a) * R1, CY + Math.sin(a) * R1, { size: 15, color: '#c92a2a' });
          const b = (i / 26) * Math.PI * 2 - Math.PI / 2;
          D.text(ctx, String.fromCharCode(65 + (i - key + 26) % 26), CX + Math.cos(b) * R2, CY + Math.sin(b) * R2, { size: 15, color: '#1864ab' });
        }
        D.text(ctx, `密钥 ${key}`, CX, CY, { size: 22, color: '#2b2840' });
        D.text(ctx, '外圈：密文　内圈：原文', CX, CY + 205, { size: 13, color: '#6f6a85', weight: 'normal' });
        // 密信
        D.rrect(ctx, 420, 40, 360, 330, 16);
        ctx.fillStyle = '#f8f0d8';
        ctx.fill();
        D.text(ctx, `📜 密信 ${si + 1}`, 600, 72, { size: 18, color: '#8a5a2b' });
        D.text(ctx, cipher(), 600, 140, { size: 44, color: '#c92a2a' });
        D.text(ctx, '⬇ 用密钥解密 ⬇', 600, 200, { size: 15, color: '#6f6a85' });
        const plain = shiftStr(cipher(), -key), ok = plain === SECRETS[si][0];
        D.text(ctx, plain, 600, 260, { size: 44, color: ok ? '#2b8a3e' : '#495057' });
        if (ok) D.text(ctx, `✅ ${SECRETS[si][2]}`, 600, 320, { size: 22, color: '#2b8a3e' });
        D.text(ctx, SECRETS.map((s, i) => (cracked.has(i) ? '🔓' : '🔒') + '密信' + (i + 1)).join('　'), 600, 400, { size: 15 });
      });
      api.choice(SECRETS.map((s, i) => [i, `📜 密信 ${i + 1}`]), 0, v => { si = v; key = 0; keySlider.set(0); });
      const keySlider = api.slider('密钥（挪几位）', 0, 25, 1, 0, v => { key = v; Sci.sfx('tick'); check(); });
      api.note('👆 拖动“密钥”滑块转动密码轮，直到下面变成一个认识的英文单词。');
    },
  });

  /* ================= 4. 网络数据包 ================= */
  const NODES = { A: [60, 225], R1: [230, 110], R2: [230, 340], R3: [400, 225], R4: [570, 110], R5: [570, 340], B: [740, 225] };
  const LINKS = [['A', 'R1'], ['A', 'R2'], ['R1', 'R3'], ['R2', 'R3'], ['R1', 'R4'], ['R2', 'R5'], ['R3', 'R4'], ['R3', 'R5'], ['R4', 'B'], ['R5', 'B']];
  const MSG = ['你好', '呀，', '小朋', '友！'];

  Sci.register({
    id: 'packets',
    subject: 'infotech',
    level: 4,
    emoji: '🌐',
    title: '网络数据包',
    desc: '一条消息是怎样穿过网络传到朋友那里的？',
    intro: '你在电脑上给朋友发一条消息，它会被切成好几个小包，每个包写上编号，各自穿过网络里的路由器，走不同的路到达朋友的电脑，再按编号拼回去。点“发送”看看吧！然后试着点一条连线把它“剪断”，网络还能把消息送到吗？',
    goal: '发送一次消息，再剪断一条线路后成功发送',
    fact: '<p>网上传送的信息会被切成许多小块，叫做<b>数据包</b>。每个包都写着“从哪来、到哪去、第几号”，由一台台<b>路由器</b>像快递分拣站一样转发。</p><p>不同的包可能走不同的路，到达的顺序也可能乱掉，接收方会按编号重新拼好。如果某条线路断了，路由器会自动找别的路，所以互联网非常“结实”。</p><p>🌍 互联网把全世界几十亿台电脑、手机连在一起，海底还铺着很多光缆，把各个大洲连起来。</p>',
    quiz: [
      { q: '网络传消息时，消息会被切成什么？', options: ['数据包', '一个个字母', '纸条'], answer: 0, explain: '消息被切成带编号的数据包。' },
      { q: '一条线路断了，消息还能送到吗？', options: ['能，路由器会找别的路', '永远送不到了'], answer: 0, explain: '网络有很多条路，可以绕过去。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const cut = new Set();
      let packets = [], received = [], sentOnce = false, sentAfterCut = false, t = 0;
      const key = (a, b) => [a, b].sort().join('-');
      const neighbors = n => LINKS.filter(([a, b]) => (a === n || b === n) && !cut.has(key(a, b))).map(([a, b]) => (a === n ? b : a));
      function allPaths(from, to, seen = [from]) {
        if (from === to) return [seen];
        return neighbors(from).filter(n => seen.indexOf(n) < 0).reduce((acc, n) => acc.concat(allPaths(n, to, seen.concat(n))), []);
      }
      function send() {
        if (packets.length) return;
        const paths = allPaths('A', 'B');
        if (!paths.length) { Sci.sfx('bad'); api.note('网络完全断开了，消息送不过去！把剪断的线点一下接回去吧。'); return; }
        const min = Math.min(...paths.map(p => p.length));
        const good = paths.filter(p => p.length <= min + 1);
        received = [];
        packets = MSG.map((m, i) => ({ i, m, path: good[Math.floor(Math.random() * good.length)], seg: 0, k: 0, speed: rand(1.1, 1.8), done: false }));
        Sci.sfx('whoosh');
        api.note(`消息被切成了 ${MSG.length} 个数据包，出发！`);
      }
      api.pointer(st, {
        down(p) {
          const l = LINKS.find(([a, b]) => { const [x1, y1] = NODES[a], [x2, y2] = NODES[b]; return Math.hypot(p.x - (x1 + x2) / 2, p.y - (y1 + y2) / 2) < 26; });
          if (!l || packets.length) return;
          const k = key(...l);
          if (cut.has(k)) { cut.delete(k); api.note('线路接上了。'); } else { cut.add(k); api.note('✂️ 剪断了一条线路！再发送一次，看看数据包会不会绕路。'); }
          Sci.sfx('clack');
        },
      });
      api.loop(dt => {
        t += dt;
        packets.forEach(pk => {
          if (pk.done) return;
          pk.k += dt * pk.speed;
          if (pk.k >= 1) {
            pk.k = 0;
            pk.seg++;
            if (pk.seg >= pk.path.length - 1) { pk.done = true; received.push(pk); Sci.sfx('tick'); }
          }
        });
        if (packets.length && packets.every(p => p.done)) {
          const order = received.map(p => p.i + 1).join('、');
          api.note(`📨 ${MSG.length} 个包都到了！到达顺序是 ${order}，按编号拼好：“${MSG.join('')}”` + (cut.size ? '（绕开了剪断的线路）' : ''));
          Sci.sfx('good');
          sentOnce = true;
          if (cut.size) sentAfterCut = true;
          packets = [];
          if (sentOnce && sentAfterCut) api.goalDone();
        }
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 450);
        LINKS.forEach(([a, b]) => {
          const [x1, y1] = NODES[a], [x2, y2] = NODES[b], c = cut.has(key(a, b));
          ctx.strokeStyle = c ? '#ffa8a8' : '#adb5bd';
          ctx.lineWidth = 5;
          ctx.setLineDash(c ? [8, 8] : []);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.setLineDash([]);
          if (c) D.text(ctx, '✂️', (x1 + x2) / 2, (y1 + y2) / 2, { size: 18 });
        });
        Object.keys(NODES).forEach(n => {
          const [x, y] = NODES[n];
          if (n === 'A' || n === 'B') { D.emoji(ctx, '💻', x, y, 50); D.text(ctx, n === 'A' ? '我' : '朋友', x, y + 40, { size: 15 }); }
          else { D.circle(ctx, x, y, 22, '#4c6ef5'); D.text(ctx, '路由', x, y + 1, { size: 12, color: '#fff' }); }
        });
        packets.forEach(pk => {
          if (pk.done) return;
          const [x1, y1] = NODES[pk.path[pk.seg]], [x2, y2] = NODES[pk.path[pk.seg + 1]];
          const x = lerp(x1, x2, pk.k), y = lerp(y1, y2, pk.k);
          D.rrect(ctx, x - 20, y - 14, 40, 28, 6);
          ctx.fillStyle = '#ffd43b';
          ctx.fill();
          D.text(ctx, String(pk.i + 1), x, y + 1, { size: 15, color: '#5c3d00' });
        });
        D.text(ctx, `收到：${received.map(p => p.i + 1).join(' ')}`, 740, 290, { size: 14, color: '#2b2840' });
        D.text(ctx, '👆 点连线中间可以剪断 / 接上', 400, 430, { size: 14, color: '#6f6a85', weight: 'normal' });
        D.text(ctx, `${sentOnce ? '✅' : '⬜'} 发送一次　${sentAfterCut ? '✅' : '⬜'} 剪断线路后发送`, 400, 30, { size: 15 });
      });
      api.button('📨 发送消息', send);
      api.note('👆 点“发送消息”，看数据包怎么穿过网络。');
    },
  });

  /* ================= 5. 人工智能怎样学习 ================= */
  // 猫：耳朵尖、个子小；狗：耳朵圆、个子大（有一点点重叠）
  const sample = kind => (kind === 'cat' ? [rand(0.42, 0.95), rand(0.05, 0.55)] : [rand(0.05, 0.58), rand(0.4, 0.95)]);

  Sci.register({
    id: 'ai',
    subject: 'infotech',
    level: 5,
    emoji: '🧠',
    title: '人工智能怎样学习',
    desc: '给 AI 看很多例子，它就学会了分辨猫和狗',
    intro: '人工智能（AI）是怎么学会认识猫和狗的？不是靠人一条条教规则，而是给它看大量的例子！这里每个点代表一只动物：横着看耳朵尖不尖，竖着看个子大不大。往里加入猫和狗的例子，AI 会画出它的“判断地图”，再用 20 只新动物考考它，看准确率能不能达到九成！',
    goal: '训练 AI，让它的准确率达到 90% 以上',
    fact: '<p><b>机器学习</b>是人工智能的一种：给电脑看大量带答案的例子（这叫<b>训练数据</b>），它自己从中找出规律，以后遇到没见过的东西也能做出判断。</p><p>例子越多、越准确，AI 就学得越好。如果给它的例子是错的（比如把猫标成狗），它就会学偏，这叫“<b>坏数据</b>”。</p><p>🤖 语音助手听懂你说话、手机相册认出人脸、翻译软件、自动驾驶汽车，背后都是机器学习。不过 AI 也会犯错，我们要学会正确地使用它。</p>',
    quiz: [
      { q: 'AI 是怎样学会分辨猫和狗的？', options: ['看大量带答案的例子', '天生就会'], answer: 0, explain: 'AI 从训练数据里学习规律。' },
      { q: '如果给 AI 的例子很多都标错了，会怎样？', options: ['AI 会学偏，判断出错', '没有任何影响'], answer: 0, explain: '坏数据会让 AI 学错。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const PX = 60, PY = 30, PW = 400, PH = 380;
      let train = [], tests = [], acc = null, bad = false, map = null, best = 0;
      for (let i = 0; i < 20; i++) { const k = i % 2 ? 'cat' : 'dog'; tests.push({ k, p: sample(k) }); }
      function predict(p) {
        if (!train.length) return null;
        const near = train.map(e => ({ e, d: Math.hypot(e.p[0] - p[0], e.p[1] - p[1]) })).sort((a, b) => a.d - b.d).slice(0, 3);
        const cats = near.filter(n => n.e.k === 'cat').length;
        return cats * 2 > near.length ? 'cat' : 'dog';
      }
      function rebuild() {
        map = [];
        for (let i = 0; i < 20; i++) { map.push([]); for (let j = 0; j < 19; j++) map[i].push(predict([(i + 0.5) / 20, (j + 0.5) / 19])); }
      }
      function add(k) {
        const p = sample(k);
        train.push({ k: bad && Math.random() < 0.5 ? (k === 'cat' ? 'dog' : 'cat') : k, p });
        rebuild();
        acc = null;
        Sci.sfx('pop');
      }
      function test() {
        if (!train.length) { api.note('AI 还什么都没学过呢，先给它一些例子。'); return; }
        const right = tests.filter(tt => predict(tt.p) === tt.k).length;
        acc = right / tests.length;
        best = Math.max(best, acc);
        Sci.sfx(acc >= 0.9 ? 'star' : 'good');
        const few = train.length < 8;
        api.note(`考试结果：20 只动物认对了 ${right} 只，准确率 ${Math.round(acc * 100)}%。` + (acc >= 0.9 && few ? '运气不错！不过才 ' + train.length + ' 个例子，太少了，再多教它一些吧。' : acc >= 0.9 ? '🎉 AI 学会啦！' : bad ? '有很多错误的例子，AI 学偏了！关掉“坏数据”，重新训练试试。' : '再多给它一些例子吧！'));
        if (acc >= 0.9 && !few) api.goalDone();
      }
      const toX = v => PX + v * PW, toY = v => PY + PH - v * PH;
      api.loop(() => {
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 450);
        if (map) map.forEach((col, i) => col.forEach((k, j) => { ctx.fillStyle = k === 'cat' ? 'rgba(255,169,77,.22)' : 'rgba(77,171,247,.22)'; ctx.fillRect(PX + i * PW / 20, PY + PH - (j + 1) * PH / 19, PW / 20 + 1, PH / 19 + 1); }));
        ctx.strokeStyle = '#495057';
        ctx.lineWidth = 2;
        ctx.strokeRect(PX, PY, PW, PH);
        D.text(ctx, '耳朵越尖 →', PX + PW - 50, PY + PH + 18, { size: 13, color: '#495057' });
        ctx.save();
        ctx.translate(PX - 22, PY + 60);
        ctx.rotate(-Math.PI / 2);
        D.text(ctx, '个子越大 →', 0, 0, { size: 13, color: '#495057' });
        ctx.restore();
        train.forEach(e => D.emoji(ctx, e.k === 'cat' ? '🐱' : '🐶', toX(e.p[0]), toY(e.p[1]), 26));
        if (acc !== null) tests.forEach(tt => { const ok = predict(tt.p) === tt.k; D.text(ctx, ok ? '○' : '×', toX(tt.p[0]), toY(tt.p[1]), { size: 16, color: ok ? '#2b8a3e' : '#e03131' }); });
        D.rrect(ctx, 500, 30, 280, 250, 16);
        ctx.fillStyle = '#fff';
        ctx.fill();
        D.text(ctx, '🧠 AI 的学习情况', 640, 60, { size: 17 });
        D.text(ctx, `例子：🐱 ${train.filter(e => e.k === 'cat').length} 个　🐶 ${train.filter(e => e.k === 'dog').length} 个`, 640, 100, { size: 16 });
        D.text(ctx, acc === null ? '准确率：还没考试' : `准确率：${Math.round(acc * 100)}%`, 640, 145, { size: 22, color: acc === null ? '#868e96' : acc >= 0.9 ? '#2b8a3e' : '#c0620a' });
        D.text(ctx, `最好成绩：${Math.round(best * 100)}%`, 640, 180, { size: 14, color: '#6f6a85' });
        D.text(ctx, '橙色区域：AI 觉得是猫', 640, 220, { size: 13, color: '#e8590c', weight: 'normal' });
        D.text(ctx, '蓝色区域：AI 觉得是狗', 640, 245, { size: 13, color: '#1c7ed6', weight: 'normal' });
        if (bad) D.text(ctx, '⚠️ 正在混入错误的例子', 640, 310, { size: 15, color: '#e03131' });
      });
      api.button('➕ 🐱 加一个猫的例子', () => add('cat'));
      api.button('➕ 🐶 加一个狗的例子', () => add('dog'));
      const r2 = api.row();
      api.button('📝 考一考 AI', test, r2);
      api.toggle('⚠️ 坏数据', false, v => { bad = v; }, r2);
      api.button('🧹 忘掉所有例子', () => { train = []; map = null; acc = null; }, r2);
      api.note('👆 先加几个猫和狗的例子，再点“考一考 AI”。');
    },
  });
})();
