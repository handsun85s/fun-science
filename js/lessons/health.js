/* 环境与健康（第一组）：垃圾分类 → 保护牙齿 → 节约用电 → 温室效应 → 碳足迹 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 1. 垃圾分类 ================= */
  const BINS = [['recycle', '可回收物', '#1c7ed6', '♻️'], ['hazard', '有害垃圾', '#e03131', '☠️'], ['kitchen', '厨余垃圾', '#2f9e44', '🍃'], ['other', '其他垃圾', '#495057', '🗑️']];
  const TRASH = [
    ['🍾', '玻璃瓶', 'recycle'], ['📰', '旧报纸', 'recycle'], ['🥫', '易拉罐', 'recycle'],
    ['🔋', '废电池', 'hazard'], ['💊', '过期药品', 'hazard'], ['💡', '废灯管', 'hazard'],
    ['🍌', '香蕉皮', 'kitchen'], ['🍉', '西瓜皮', 'kitchen'], ['🥚', '鸡蛋壳', 'kitchen'],
    ['🧻', '用过的纸巾', 'other'], ['😷', '用过的口罩', 'other'], ['🥢', '一次性筷子', 'other'],
  ];

  Sci.register({
    id: 'trash',
    subject: 'health',
    level: 1,
    emoji: '🗑️',
    title: '垃圾分类',
    desc: '把垃圾放进正确的垃圾桶',
    intro: '每天我们都会扔掉很多垃圾。如果把垃圾分好类，很多东西还能变废为宝！这里有四种垃圾桶：可回收物、有害垃圾、厨余垃圾和其他垃圾。把每样垃圾拖进正确的垃圾桶吧！',
    goal: '把 12 样垃圾都分对',
    fact: '<p>♻️ <b>可回收物</b>：纸张、塑料瓶、玻璃、金属、旧衣服，回收后能做成新东西。</p><p>☠️ <b>有害垃圾</b>：废电池、过期药品、废灯管、杀虫剂，会污染土地和水，要专门处理。</p><p>🍃 <b>厨余垃圾</b>：剩饭剩菜、果皮、菜叶、蛋壳，可以变成肥料。</p><p>🗑️ <b>其他垃圾</b>：用过的纸巾、口罩、一次性筷子、烟头等，不好回收的东西。</p><p>一吨废纸能再造出几百千克好纸，少砍十几棵大树！垃圾分类，从我做起。</p>',
    quiz: [
      { q: '废电池应该扔进哪个垃圾桶？', options: ['有害垃圾', '可回收物', '厨余垃圾'], answer: 0, explain: '电池里的物质会污染环境，是有害垃圾。' },
      { q: '吃剩的香蕉皮属于？', options: ['厨余垃圾', '其他垃圾'], answer: 0, explain: '果皮属于厨余垃圾，可以做成肥料。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const items = Sci.shuffle(TRASH).map((t, i) => ({ e: t[0], name: t[1], bin: t[2], hx: 60 + (i % 6) * 135, hy: 55 + Math.floor(i / 6) * 95, x: 0, y: 0, done: false }));
      items.forEach(it => { it.x = it.hx; it.y = it.hy; });
      const count = {};
      let drag = null;
      api.pointer(st, {
        down(p) { const it = items.find(it => !it.done && Math.hypot(p.x - it.x, p.y - it.y) < 40); if (it) { drag = { it, ox: it.x - p.x, oy: it.y - p.y }; Sci.sfx('pop'); } },
        move(p) { if (drag) { drag.it.x = p.x + drag.ox; drag.it.y = p.y + drag.oy; } },
        up() {
          if (!drag) return;
          const it = drag.it;
          drag = null;
          if (it.y < 260) { it.x = it.hx; it.y = it.hy; return; }
          const b = BINS[clamp(Math.floor(it.x / 200), 0, 3)];
          if (b[0] !== it.bin) {
            Sci.sfx('bad');
            api.note(`${it.e} ${it.name}不是${b[1]}哦，它属于${BINS.find(x => x[0] === it.bin)[1]}。`);
            it.x = it.hx;
            it.y = it.hy;
            return;
          }
          it.done = true;
          count[b[0]] = (count[b[0]] || 0) + 1;
          Sci.sfx('good');
          const left = items.filter(x => !x.done).length;
          api.note(`✅ ${it.name}是${b[1]}。` + (left ? `（还有 ${left} 样）` : ''));
          if (!left) api.timeout(() => { api.note('🎉 垃圾全部分对了！你是环保小卫士。'); api.goalDone(); }, 1200);
        },
      });
      api.loop(() => {
        ctx.fillStyle = '#f4fce3';
        ctx.fillRect(0, 0, 800, 450);
        BINS.forEach(([k, n, c, e], i) => {
          const x = i * 200 + 100;
          D.rrect(ctx, x - 70, 290, 140, 150, 12);
          ctx.fillStyle = c;
          ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,.25)';
          ctx.fillRect(x - 76, 280, 152, 16);
          D.emoji(ctx, e, x, 340, 36);
          D.text(ctx, n, x, 385, { size: 17, color: '#fff' });
          D.text(ctx, `${count[k] || 0} 样`, x, 415, { size: 13, color: '#fff', weight: 'normal' });
        });
        items.filter(it => !it.done).forEach(it => {
          D.emoji(ctx, it.e, it.x, it.y - 6, 42);
          D.text(ctx, it.name, it.x, it.y + 30, { size: 13, color: '#495057' });
        });
      });
      api.note('👆 把上面的垃圾拖进下面正确的垃圾桶。');
    },
  });

  /* ================= 2. 保护牙齿 ================= */
  Sci.register({
    id: 'teeth',
    subject: 'health',
    level: 2,
    emoji: '🦷',
    title: '保护牙齿',
    desc: '牙菌斑是怎么来的？怎样把牙齿刷干净？',
    intro: '吃完东西，牙齿上会留下一层黏黏的“牙菌斑”，里面住着很多细菌，它们吃糖以后会产生酸，慢慢把牙齿腐蚀出小洞——这就是蛀牙！拿起牙刷，在牙齿上来回刷，把黄色的牙菌斑全部刷掉吧。',
    goal: '把所有牙菌斑都刷干净',
    fact: '<p><b>牙菌斑</b>是粘在牙齿表面的细菌和食物残渣。细菌吃了糖会产生<b>酸</b>，酸会慢慢溶解牙齿表面，形成<b>蛀牙</b>。</p><p>保护牙齿的好习惯：<b>早晚刷牙</b>，每次至少 <b>2 分钟</b>；每颗牙的里面、外面、咬合面都要刷到；少吃糖，饭后漱口；每半年看一次牙医。</p><p>🦷 小朋友 6 岁左右开始换牙，乳牙掉了长出的恒牙要用一辈子，一定要好好保护！</p>',
    quiz: [
      { q: '蛀牙是怎么形成的？', options: ['细菌吃糖产生的酸腐蚀牙齿', '牙齿太累了'], answer: 0, explain: '细菌分解糖产生酸，酸会腐蚀牙齿。' },
      { q: '每次刷牙最好刷多久？', options: ['10 秒', '2 分钟', '30 分钟'], answer: 1, explain: '每次至少刷 2 分钟。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const teeth = [];
      for (let i = 0; i < 8; i++) { teeth.push({ x: 160 + i * 60, y: 170, top: true }); teeth.push({ x: 160 + i * 60, y: 290, top: false }); }
      let spots = [], brush = { x: 700, y: 380 }, drag = false, done = false, t = 0, last = null;
      function addPlaque(n) {
        for (let i = 0; i < n; i++) { const th = teeth[Math.floor(Math.random() * teeth.length)]; spots.push({ x: th.x + rand(-14, 14), y: th.y + rand(-16, 16), dirt: 1 }); }
      }
      addPlaque(14);
      api.pointer(st, {
        down(p) { drag = true; brush.x = p.x; brush.y = p.y; last = { x: p.x, y: p.y }; },
        move(p, a) {
          if (!a || !drag) return;
          const moved = Math.hypot(p.x - last.x, p.y - last.y);
          last = { x: p.x, y: p.y };
          brush.x = p.x;
          brush.y = p.y;
          spots.forEach(s => { if (s.dirt > 0 && Math.hypot(s.x - p.x, s.y - p.y) < 40) { s.dirt = Math.max(0, s.dirt - moved * 0.012); if (s.dirt === 0) Sci.sfx('pop'); } });
          if (spots.every(s => s.dirt <= 0) && !done) { done = true; Sci.sfx('star'); api.note('🎉 牙齿刷得亮晶晶！记得早晚刷牙，每次 2 分钟。'); api.goalDone(); }
        },
        up() { drag = false; },
      });
      api.loop(dt => {
        t += dt;
        ctx.fillStyle = '#fff0f6';
        ctx.fillRect(0, 0, 800, 450);
        // 嘴巴
        ctx.fillStyle = '#c2255c';
        D.rrect(ctx, 110, 110, 520, 240, 120);
        ctx.fill();
        ctx.fillStyle = '#f783ac';
        D.rrect(ctx, 130, 120, 480, 40, 20);
        ctx.fill();
        D.rrect(ctx, 130, 300, 480, 40, 20);
        ctx.fill();
        teeth.forEach(th => { D.rrect(ctx, th.x - 26, th.y - 32, 52, 64, 14); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#dee2e6'; ctx.lineWidth = 2; ctx.stroke(); });
        spots.forEach(s => { if (s.dirt > 0) D.circle(ctx, s.x, s.y, 9, `rgba(230,180,40,${0.3 + 0.6 * s.dirt})`); });
        // 牙刷
        ctx.save();
        ctx.translate(brush.x, brush.y);
        ctx.rotate(-0.3 + (drag ? Math.sin(t * 30) * 0.1 : 0));
        ctx.fillStyle = '#4dabf7';
        D.rrect(ctx, 0, -8, 140, 16, 8);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(-36, -16, 40, 12);
        ctx.fillStyle = '#e7f5ff';
        for (let i = 0; i < 6; i++) ctx.fillRect(-34 + i * 6, -26, 4, 12);
        ctx.restore();
        const left = spots.filter(s => s.dirt > 0).length;
        D.text(ctx, left ? `还有 ${left} 块牙菌斑` : '✨ 干干净净！', 400, 40, { size: 22, color: left ? '#c0620a' : '#2b8a3e' });
        D.text(ctx, '👆 按住拖动牙刷，在牙齿上来回刷', 400, 410, { size: 15, color: '#6f6a85', weight: 'normal' });
      });
      api.button('🍬 吃了一颗糖', () => { addPlaque(5); done = false; Sci.sfx('bad'); api.note('吃糖以后牙菌斑变多了！细菌最喜欢糖了。快去刷牙！'); });
      api.note('👆 按住画面拖动牙刷，把黄色的牙菌斑刷掉。');
    },
  });

  /* ================= 3. 节约用电 ================= */
  const APPS = [
    ['tv', '📺', '电视（待机）', 20, 0, 'off', '没人看就关掉电源，待机也会耗电。'],
    ['light1', '💡', '没人的房间开着灯', 60, 0, 'off', '人走灯灭。'],
    ['light2', '💡', '书房的台灯（有人在看书）', 60, 8, 'led', '换成 LED 灯，亮度一样，耗电只有原来的七分之一。'],
    ['ac', '❄️', '空调开到 18°C', 1800, 900, 'eco', '夏天空调调到 26°C，舒服又省电。'],
    ['fridge', '🧊', '冰箱门没关好', 400, 120, 'close', '冰箱要一直开着，但门要关好！'],
    ['pc', '💻', '电脑开着没人用', 150, 0, 'off', '不用的时候关机。'],
    ['charger', '🔌', '充电器一直插着', 5, 0, 'off', '充满电就拔掉充电器。'],
  ];

  Sci.register({
    id: 'savepower',
    subject: 'health',
    level: 3,
    emoji: '🔌',
    title: '节约用电',
    desc: '找出家里浪费电的地方',
    intro: '电是用煤、水、风、阳光等资源发出来的，用得越多，消耗的资源就越多，排放的污染也越多。这个家里有好几处在浪费电！点一点那些浪费电的电器，把它们关掉或者改一改，让家里的用电量减少一半以上。注意：有些电器可不能随便关哦！',
    goal: '把家里的用电量减少一半以上',
    fact: '<p>我国的电大部分来自<b>火力发电</b>，要烧煤，会排放二氧化碳和污染物。节约 1 度电，就能少烧约 300 克煤。</p><p>省电小妙招：<b>人走灯灭</b>；电器不用时<b>关掉电源</b>（待机也耗电）；用 <b>LED 灯</b>；夏天空调开到 <b>26°C</b>；冰箱门随手关好；充满电就拔掉充电器。</p><p>🌍 每年 3 月最后一个星期六的晚上，全世界都会关灯一小时，叫做“地球一小时”。</p>',
    quiz: [
      { q: '夏天空调温度调到多少度比较省电？', options: ['16°C', '26°C', '20°C'], answer: 1, explain: '26°C 舒适又节能。' },
      { q: '电视机待机（没关电源）时，会耗电吗？', options: ['会', '不会'], answer: 0, explain: '待机状态也在悄悄耗电。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const fixed = new Set();
      const START = APPS.reduce((s, a) => s + a[3], 0);
      const power = () => APPS.reduce((s, a) => s + (fixed.has(a[0]) ? a[4] : a[3]), 0);
      const POS = { tv: [130, 150], light1: [330, 110], light2: [530, 110], ac: [690, 110], fridge: [130, 330], pc: [400, 300], charger: [640, 330] };
      let done = false, t = 0;
      api.pointer(st, {
        down(p) {
          const a = APPS.find(ap => Math.hypot(p.x - POS[ap[0]][0], p.y - POS[ap[0]][1]) < 50);
          if (!a) return;
          if (fixed.has(a[0])) { api.note(`${a[2].replace(/（.*）/, '')}已经处理好了。`); return; }
          fixed.add(a[0]);
          Sci.sfx('good');
          api.note(`✅ ${a[6]} 现在用电 ${power()} 瓦。`);
          if (power() <= START / 2 && !done) { done = true; Sci.sfx('star'); api.note(`🎉 用电量从 ${START} 瓦降到了 ${power()} 瓦，减少了一大半！`); api.goalDone(); }
        },
      });
      api.loop(dt => {
        t += dt;
        ctx.fillStyle = '#fff4e6';
        ctx.fillRect(0, 0, 800, 450);
        ctx.strokeStyle = '#d9a066';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, 760, 410);
        ctx.beginPath();
        ctx.moveTo(20, 220);
        ctx.lineTo(780, 220);
        ctx.moveTo(250, 20);
        ctx.lineTo(250, 220);
        ctx.moveTo(450, 20);
        ctx.lineTo(450, 220);
        ctx.stroke();
        D.text(ctx, '客厅', 60, 40, { size: 13, color: '#8a5a2b' });
        D.text(ctx, '空房间', 290, 40, { size: 13, color: '#8a5a2b' });
        D.text(ctx, '书房', 480, 40, { size: 13, color: '#8a5a2b' });
        D.emoji(ctx, '📖', 560, 170, 30);
        D.emoji(ctx, '🧒', 600, 170, 34);
        APPS.forEach(a => {
          const [x, y] = POS[a[0]], ok = fixed.has(a[0]);
          if (!ok && a[3] >= 60) D.circle(ctx, x, y, 40 + Math.sin(t * 5) * 3, 'rgba(250,82,82,.18)');
          D.emoji(ctx, a[1], x, y, 46);
          D.text(ctx, ok ? '✅ ' + a[2].replace(/（.*）|开着灯|开着没人用|一直插着|门没关好|开到 18°C/g, '') : a[2], x, y + 42, { size: 13, color: ok ? '#2b8a3e' : '#c92a2a', maxW: 170 });
          D.text(ctx, `${ok ? a[4] : a[3]} 瓦`, x, y + 60, { size: 12, color: '#6f6a85', weight: 'normal' });
        });
        // 电表
        D.rrect(ctx, 280, 240, 240, 34, 10);
        ctx.fillStyle = '#212529';
        ctx.fill();
        D.text(ctx, `⚡ ${power()} 瓦（原来 ${START} 瓦）`, 400, 257, { size: 15, color: power() <= START / 2 ? '#8ce99a' : '#ffd43b' });
      });
      api.note('👆 点一点家里浪费电的电器。');
    },
  });

  /* ================= 4. 温室效应 ================= */
  Sci.register({
    id: 'greenhouse',
    subject: 'health',
    level: 4,
    emoji: '🌡️',
    title: '温室效应',
    desc: '二氧化碳多了，地球为什么会变暖？',
    intro: '地球外面包着一层大气，像温室的玻璃一样留住热量，让地球保持温暖。可是人类烧煤、开车排放了太多二氧化碳，“玻璃”变厚了，留住的热量太多，地球就越来越热。你来当地球的管理员：调一调煤电厂、汽车和森林的数量，看看 30 年后地球会怎样，让二氧化碳不再增加！',
    goal: '让 30 年后的二氧化碳不比现在多',
    fact: '<p>阳光照到地面，地面变热后会向太空散发热量。大气里的<b>二氧化碳</b>等“温室气体”会挡住一部分热量，让地球保持温暖，这叫<b>温室效应</b>。没有它，地球会冷到零下 18°C！</p><p>可是人类大量烧煤、石油，二氧化碳越来越多，热量散不出去，全球变暖了：冰川融化、海平面上升、极端天气变多。</p><p>🌳 减少排放的办法：多用太阳能、风能等<b>清洁能源</b>，少开车多走路、骑车、坐公交，<b>多种树</b>（树木会吸收二氧化碳）。</p>',
    quiz: [
      { q: '下面哪种气体是主要的温室气体？', options: ['二氧化碳', '氧气', '氮气'], answer: 0, explain: '二氧化碳会留住热量。' },
      { q: '下面哪个做法能减缓全球变暖？', options: ['多种树、多用清洁能源', '多开车、多烧煤'], answer: 0, explain: '减少排放、增加吸收，都能帮地球降温。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const START = 420;
      let coal = 4, cars = 4, forest = 1, sim = null, co2 = START, history = [START], done = false, t = 0;
      const rate = () => 2 * coal + 1.2 * cars - 1.5 * forest;
      const tempOf = c => 15 + (c - 280) / 140;
      function run() {
        if (sim) return;
        co2 = START;
        history = [START];
        sim = { year: 0, timer: 0 };
        Sci.sfx('click');
        api.note('时间开始流逝，一年又一年……');
      }
      api.loop(dt => {
        t += dt;
        if (sim) {
          sim.timer -= dt;
          if (sim.timer <= 0) {
            sim.timer = 0.12;
            sim.year++;
            co2 = Math.max(280, co2 + rate());
            history.push(co2);
            if (sim.year >= 30) {
              sim = null;
              const up = co2 - START;
              if (up <= 0) { Sci.sfx('star'); api.note(`🎉 30 年后二氧化碳是 ${Math.round(co2)}，没有增加！地球温度保持稳定。`); if (!done) { done = true; api.goalDone(); } }
              else { Sci.sfx('bad'); api.note(`30 年后二氧化碳增加到 ${Math.round(co2)}，地球升温了 ${(tempOf(co2) - tempOf(START)).toFixed(1)}°C！减少煤电厂和汽车，多种一些森林试试。`); }
            }
          }
        }
        const temp = tempOf(co2);
        ctx.fillStyle = '#0b1033';
        ctx.fillRect(0, 0, 800, 450);
        // 地球和大气
        const EX = 190, EY = 260;
        const thick = 20 + (co2 - 280) / 6;
        D.circle(ctx, EX, EY, 110 + thick, `rgba(160,170,190,${0.15 + (co2 - 280) / 1200})`);
        D.circle(ctx, EX, EY, 110, '#1c7ed6');
        D.circle(ctx, EX - 30, EY - 20, 40, '#40c057');
        D.circle(ctx, EX + 40, EY + 30, 30, '#40c057');
        // 阳光射进来，热量往外跑，一部分被挡回来
        D.emoji(ctx, '☀️', 40, 50, 50);
        for (let i = 0; i < 3; i++) {
          const k = ((t * 0.6 + i / 3) % 1);
          D.arrow(ctx, 60 + k * 0, 70 + 0, lerp(80, EX - 40, 1), lerp(80, EY - 90, 1), 'rgba(255,212,59,.5)', 3, 10);
          const back = (co2 - 280) / 500;
          const ox = EX + 60 + k * 100, oy = EY - 80 - k * 100;
          if (k < 0.6 || Math.random() > back) D.circle(ctx, ox, oy, 5, k < 0.5 ? 'rgba(255,107,107,.9)' : `rgba(255,107,107,${1 - back})`);
        }
        D.text(ctx, '红点：地球散发的热量', EX, EY + 175, { size: 13, color: '#ffa8a8', weight: 'normal' });
        // 曲线图
        const GX = 380, GY = 60, GW = 390, GH = 200;
        ctx.fillStyle = '#fff';
        ctx.fillRect(GX, GY, GW, GH);
        ctx.strokeStyle = '#e8590c';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        const yOf = c => GY + GH - (c - 280) / (900 - 280) * GH;
        ctx.moveTo(GX, yOf(START));
        ctx.lineTo(GX + GW, yOf(START));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#c92a2a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        history.forEach((c, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, GX + i / 30 * GW, yOf(Math.min(900, c))));
        ctx.stroke();
        D.text(ctx, '二氧化碳（30 年）', GX + GW / 2, GY - 14, { size: 14, color: '#fff' });
        D.text(ctx, `二氧化碳：${Math.round(co2)}`, 580, 300, { size: 20, color: co2 > START ? '#ffa8a8' : '#8ce99a' });
        D.text(ctx, `地球平均温度：${temp.toFixed(1)}°C`, 580, 335, { size: 20, color: '#ffd43b' });
        D.text(ctx, `每年变化：${rate() > 0 ? '+' : ''}${rate().toFixed(1)}`, 580, 370, { size: 16, color: rate() > 0 ? '#ffa8a8' : '#8ce99a' });
        if (sim) D.text(ctx, `第 ${sim.year} 年`, 580, 405, { size: 16, color: '#fff' });
      });
      api.slider('🏭 煤电厂', 0, 5, 1, coal, v => { if (!sim) coal = v; });
      api.slider('🚗 汽车', 0, 5, 1, cars, v => { if (!sim) cars = v; });
      api.slider('🌳 森林', 0, 5, 1, forest, v => { if (!sim) forest = v; });
      api.button('▶ 过 30 年', run);
      api.note('👆 先直接点“过 30 年”，看看会怎样；再调一调三个滑块。');
    },
  });

  /* ================= 5. 碳足迹 ================= */
  const CHOICES = [
    ['go', '上学方式', [['汽车接送', 2.0], ['坐公交', 0.6], ['走路或骑车', 0]]],
    ['lunch', '午餐', [['牛肉饭', 3.0], ['鸡肉饭', 1.0], ['蔬菜蛋饭', 0.5]]],
    ['ac', '空调', [['开一整天', 4.0], ['开半天', 2.0], ['开电扇', 0.3]]],
    ['buy', '买东西', [['买新的塑料玩具', 2.0], ['买二手的', 0.3], ['不买，玩旧的', 0]]],
    ['food', '剩饭', [['吃不完倒掉', 1.0], ['光盘行动，吃干净', 0]]],
  ];

  Sci.register({
    id: 'carbon',
    subject: 'health',
    level: 5,
    emoji: '👣',
    title: '碳足迹',
    desc: '我的一天排放了多少二氧化碳？',
    intro: '我们每天的吃、穿、用、行，都会直接或间接地排放二氧化碳，加起来叫做“碳足迹”。选一选你一天的生活方式，看看碳足迹有多大，需要几棵大树才能把这些二氧化碳吸收掉。试着把一天的碳足迹降到 3 千克以下！',
    goal: '把一天的碳足迹降到 3 千克以下',
    fact: '<p><b>碳足迹</b>是一个人（或一件东西）在生活中直接和间接排放的二氧化碳总量。开车烧汽油、发电烧煤、生产塑料玩具、养牛，都会排放二氧化碳。</p><p>小朋友也能做到<b>低碳生活</b>：走路、骑车或坐公交上学；多吃蔬菜；随手关灯；不浪费粮食（光盘行动）；旧东西循环使用。</p><p>🌳 一棵大树一年大约能吸收 18 千克二氧化碳。我国提出了“<b>碳达峰、碳中和</b>”的目标：让排放的二氧化碳和吸收的一样多。</p>',
    quiz: [
      { q: '下面哪种上学方式碳排放最少？', options: ['走路或骑自行车', '汽车接送'], answer: 0, explain: '走路和骑车几乎不排放二氧化碳。' },
      { q: '“光盘行动”为什么能减少碳排放？', options: ['不浪费粮食，就减少了生产和处理粮食的排放', '盘子变干净了'], answer: 0, explain: '种粮、运输、处理剩饭都会排放二氧化碳。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const pick = { go: 0, lunch: 0, ac: 0, buy: 0, food: 0 };
      let done = false, t = 0;
      const total = () => CHOICES.reduce((s, c) => s + c[2][pick[c[0]]][1], 0);
      function update() {
        const v = total();
        if (v < 3 && !done) { done = true; Sci.sfx('star'); api.note(`🎉 一天的碳足迹只有 ${v.toFixed(1)} 千克！低碳生活，从我做起。`); api.goalDone(); }
        else if (!done) api.note(`现在的碳足迹：${v.toFixed(1)} 千克。还能怎么改？`);
      }
      api.loop(dt => {
        t += dt;
        const v = total();
        ctx.fillStyle = '#f4fce3';
        ctx.fillRect(0, 0, 800, 450);
        // 每一项的柱子
        CHOICES.forEach((c, i) => {
          const y = 50 + i * 62, val = c[2][pick[c[0]]][1];
          D.text(ctx, c[1], 30, y, { size: 16, align: 'left' });
          D.text(ctx, c[2][pick[c[0]]][0], 30, y + 22, { size: 13, align: 'left', color: '#6f6a85', weight: 'normal' });
          ctx.fillStyle = '#e9ecef';
          ctx.fillRect(170, y - 10, 260, 22);
          ctx.fillStyle = val > 1.5 ? '#fa5252' : val > 0.5 ? '#fab005' : '#40c057';
          ctx.fillRect(170, y - 10, val / 4 * 260, 22);
          D.text(ctx, val.toFixed(1) + ' 千克', 445, y + 1, { size: 14, align: 'left' });
        });
        // 脚印和大树
        const s = clamp(v / 12, 0.2, 1);
        D.emoji(ctx, '👣', 640, 140, 60 + s * 80);
        D.text(ctx, `一天的碳足迹：${v.toFixed(1)} 千克`, 640, 260, { size: 20, color: v < 3 ? '#2b8a3e' : '#c92a2a' });
        const trees = Math.ceil(v / 0.05);
        D.text(ctx, `需要 ${trees} 棵大树`, 640, 300, { size: 17, color: '#2b8a3e' });
        D.text(ctx, '吸收一整天才能吸收完', 640, 326, { size: 13, color: '#6f6a85', weight: 'normal' });
        D.text(ctx, '🌳'.repeat(Math.min(8, Math.ceil(trees / 30))), 640, 370, { size: 26 });
        D.text(ctx, '（每棵🌳代表 30 棵树）', 640, 405, { size: 12, color: '#6f6a85', weight: 'normal' });
      });
      CHOICES.forEach(c => {
        const row = api.row();
        row.append(Sci.h('span', { style: { fontWeight: 'bold', marginRight: '6px' } }, c[1] + '：'));
        api.choice(c[2].map((o, i) => [i, o[0]]), 0, v => { pick[c[0]] = v; Sci.sfx('click'); update(); }, row);
      });
      api.note(`👆 现在一天的碳足迹是 ${total().toFixed(1)} 千克。在下面换一换生活方式。`);
    },
  });
})();
