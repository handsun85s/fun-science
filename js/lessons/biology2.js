/* 生命奥秘（第二组）：动物住哪里 → 植物的身体 → 食物的旅行 → 显微镜下的细胞 → 遗传的密码 */
(function () {
  'use strict';
  const { clamp, lerp } = Sci;
  const D = Sci.draw;

  /* ================= 6. 动物住哪里 ================= */
  const HOMES = [
    { id: 'ocean', name: '🌊 海洋', bg: '#a5d8ff', deco: '🐚' },
    { id: 'forest', name: '🌳 森林', bg: '#b2f2bb', deco: '🌲' },
    { id: 'desert', name: '🏜️ 沙漠', bg: '#ffe8a3', deco: '🌵' },
    { id: 'polar', name: '🧊 极地', bg: '#e7f5ff', deco: '❄️' },
  ];
  const ANIMALS = [
    ['🐳', '鲸鱼', 'ocean', '鲸鱼的身体像一条流线，用鳍和尾巴游泳，生活在大海里。'],
    ['🐫', '骆驼', 'desert', '骆驼的驼峰里存着脂肪，好几天不喝水也没关系，长长的睫毛能挡住风沙。'],
    ['🐿️', '松鼠', 'forest', '松鼠爪子尖尖的，在树上爬上爬下，最爱吃松果。'],
    ['🐧', '企鹅', 'polar', '企鹅有厚厚的脂肪和密密的羽毛，一点也不怕冷。'],
    ['🐙', '章鱼', 'ocean', '章鱼有 8 条腕足，喜欢躲在海底的石缝里。'],
    ['🦂', '蝎子', 'desert', '蝎子白天躲在沙子下面避暑，晚上才出来找吃的。'],
    ['🐒', '猴子', 'forest', '猴子有灵巧的手和长尾巴，在树林里荡来荡去。'],
    ['🦌', '驯鹿', 'polar', '驯鹿的毛又厚又密，宽宽的蹄子踩在雪地上不会陷下去。'],
  ];

  Sci.register({
    id: 'habitat',
    subject: 'biology',
    level: 1,
    emoji: '🐫',
    title: '动物住哪里',
    desc: '帮小动物们找到自己的家',
    intro: '小动物们迷路啦！海洋、森林、沙漠和冰天雪地的极地，它们各自住在哪里呢？把下面的小动物拖到它的家里。想一想：它的身体有什么特别的地方，适合住在那里？',
    goal: '把 8 只小动物都送回家',
    fact: '<p>每种动物的身体都很<b>适应</b>自己的家：</p><p>🌊 海洋动物有<b>鳍</b>和流线型的身体，游得又快又稳。</p><p>🧊 极地动物有<b>厚厚的脂肪和毛</b>，能抵御寒冷。</p><p>🏜️ 沙漠动物很<b>耐渴</b>，有的白天躲起来，晚上才活动。</p><p>🌳 森林动物很多会<b>爬树</b>，树上有吃的，也能躲避危险。</p><p>如果把它们搬到别的地方，它们就很难活下去，所以我们要保护动物的家园。</p>',
    quiz: [
      { q: '骆驼最适合生活在哪里？', options: ['沙漠', '海洋', '极地'], answer: 0, explain: '骆驼很耐渴，不怕风沙。' },
      { q: '企鹅身上厚厚的脂肪有什么用？', options: ['保暖', '帮它飞得更高'], answer: 0, explain: '厚厚的脂肪像一件棉袄，帮企鹅抵御寒冷。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const ZH = 300, ZW = 200;
      const items = ANIMALS.map((a, i) => ({ e: a[0], name: a[1], home: a[2], tip: a[3], hx: 55 + i * 98, hy: 380, x: 55 + i * 98, y: 380, placed: false }));
      let drag = null;

      api.pointer(st, {
        down(p) {
          const it = items.find(it => !it.placed && Math.hypot(p.x - it.x, p.y - it.y) < 40);
          if (!it) return;
          drag = { it, ox: it.x - p.x, oy: it.y - p.y };
          Sci.sfx('pop');
        },
        move(p) {
          if (!drag) return;
          drag.it.x = p.x + drag.ox;
          drag.it.y = p.y + drag.oy;
        },
        up() {
          if (!drag) return;
          const it = drag.it;
          drag = null;
          if (it.y > ZH) { it.x = it.hx; it.y = it.hy; return; }
          const zone = HOMES[clamp(Math.floor(it.x / ZW), 0, 3)];
          if (zone.id !== it.home) {
            Sci.sfx('bad');
            api.note(`${it.e} ${it.name}不住在${zone.name.split(' ')[1]}哦。想一想，它需要什么样的家？`);
            it.x = it.hx;
            it.y = it.hy;
            return;
          }
          it.placed = true;
          const k = items.filter(o => o.placed && o.home === it.home).length - 1;
          it.x = HOMES.indexOf(zone) * ZW + 60 + k * 80;
          it.y = 190 + k * 40;
          Sci.sfx('good');
          const left = items.filter(o => !o.placed).length;
          api.note(`✅ ${it.e} ${it.tip}` + (left ? `（还有 ${left} 只）` : ''));
          if (!left) api.timeout(() => { api.note('🎉 所有小动物都回到家啦！它们的身体都很适应自己的家。'); api.goalDone(); }, 1500);
        },
      });

      function render() {
        HOMES.forEach((h, i) => {
          ctx.fillStyle = h.bg;
          ctx.fillRect(i * ZW, 0, ZW, ZH);
          for (let k = 0; k < 3; k++) D.emoji(ctx, h.deco, i * ZW + 30 + k * 70, 90 + (k % 2) * 40, 30, 0.45);
          D.text(ctx, h.name, i * ZW + ZW / 2, 32, { size: 22 });
          ctx.fillStyle = 'rgba(255,255,255,.6)';
          ctx.fillRect(i * ZW + ZW - 2, 0, 2, ZH);
        });
        ctx.fillStyle = '#fff8ee';
        ctx.fillRect(0, ZH, 800, 450 - ZH);
        D.text(ctx, '👇 把小动物拖到它的家', 400, ZH + 22, { size: 16, color: '#6f6a85' });
        items.forEach(it => {
          D.emoji(ctx, it.e, it.x, it.y, 52);
          if (!it.placed && it !== (drag && drag.it)) D.text(ctx, it.name, it.x, it.y + 38, { size: 14, color: '#5b4630', weight: 'normal' });
        });
      }
      api.loop(render);
      api.note('👆 按住一只小动物，把它拖到上面它住的地方。');
    },
  });

  /* ================= 7. 植物的身体 ================= */
  const PARTS = {
    root: ['根', '把植物牢牢抓在土里，还从土里吸收水和养分。'],
    stem: ['茎', '像一根根水管，把水和养分运到全身，还撑着植物站直。'],
    leaf: ['叶', '植物的“厨房”，用阳光、水和二氧化碳做养料（光合作用）。'],
    flower: ['花', '漂亮的花吸引蜜蜂来传粉，传粉以后才能结出果实。'],
    fruit: ['果实', '花谢了以后长出来，把种子包在里面保护起来。'],
    seed: ['种子', '种到土里，就能长出一株新的植物！'],
  };

  Sci.register({
    id: 'plantparts',
    subject: 'biology',
    level: 2,
    emoji: '🍅',
    title: '植物的身体',
    desc: '根、茎、叶、花、果实、种子，各有什么本领？',
    intro: '一株番茄从上到下，有好几个“身体部位”，每个部位都有自己的本领。先点一点植物的各个部分，认识它们；再做一个有趣的实验：把白色的花插进彩色的水里，过几个小时会发生什么？',
    goal: '认识植物的 6 个部分，再做完“花喝水”实验',
    fact: '<p>开花的植物一般有六个部分：<b>根、茎、叶、花、果实、种子</b>。</p><p>根吸水，茎运水，叶做养料，花传粉，果实保护种子，种子长成新植物——它们分工合作，植物才能长大、繁殖。</p><p>💧 白花插在彩色的水里，过一会儿花瓣就变色了！这说明水是顺着<b>茎里细细的“管道”</b>（导管）一路运到花瓣上的。</p>',
    quiz: [
      { q: '植物用哪个部分从土里吸水？', options: ['根', '叶', '花'], answer: 0, explain: '根扎在土里，吸收水和养分。' },
      { q: '白花插在红墨水里，花瓣变红了，说明水是从哪里运上去的？', options: ['茎', '花瓣', '空气'], answer: 0, explain: '茎里有运水的导管。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const SX = 300, SOIL = 330;
      let mode = 'parts', hours = 0, dye = 'red', picked = null, dyeDone = false;
      const found = new Set();
      const LEAVES = [[255, 250, -0.5], [345, 262, 0.5], [258, 165, -0.6], [345, 130, 0.4]];
      const FRUIT = [372, 178], FLOWER = [SX, 75], SEED = [530, 315];

      function hitPart(p) {
        if (Math.hypot(p.x - SEED[0], p.y - SEED[1]) < 45) return 'seed';
        if (Math.hypot(p.x - FRUIT[0], p.y - FRUIT[1]) < 28) return 'fruit';
        if (Math.hypot(p.x - FLOWER[0], p.y - FLOWER[1]) < 32) return 'flower';
        if (LEAVES.some(([x, y]) => Math.hypot(p.x - x, p.y - y) < 32)) return 'leaf';
        if (p.y > SOIL + 4 && Math.abs(p.x - SX) < 80 && p.y < 440) return 'root';
        if (Math.abs(p.x - SX) < 16 && p.y > 90 && p.y <= SOIL + 4) return 'stem';
        return null;
      }
      function check() {
        if (found.size === 6 && dyeDone) api.goalDone();
      }
      api.pointer(st, {
        down(p) {
          if (mode !== 'parts') return;
          const k = hitPart(p);
          if (!k) return;
          picked = k;
          const first = !found.has(k);
          found.add(k);
          Sci.sfx(first ? 'good' : 'pop');
          api.note(`${PARTS[k][0]}：${PARTS[k][1]}（认识了 ${found.size}/6）` + (found.size === 6 && !dyeDone ? ' 再去做“花喝水”实验吧！' : ''));
          check();
        },
      });

      function leaf(x, y, a, glow) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.ellipse(0, 0, 34, 15, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#40c057';
        ctx.fill();
        ctx.strokeStyle = glow ? '#ff922b' : '#2b8a3e';
        ctx.lineWidth = glow ? 4 : 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-30, 0);
        ctx.lineTo(30, 0);
        ctx.strokeStyle = '#2b8a3e';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }
      function flower(x, y, petal, glow, s = 1) {
        for (let i = 0; i < 6; i++) {
          const a = i * Math.PI / 3;
          D.circle(ctx, x + Math.cos(a) * 16 * s, y + Math.sin(a) * 16 * s, 13 * s, petal, glow ? '#ff922b' : 'rgba(0,0,0,.15)', glow ? 3 : 1);
        }
        D.circle(ctx, x, y, 9 * s, '#fab005');
      }
      function renderParts() {
        ctx.fillStyle = '#eaf6ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#9c6b3f';
        ctx.fillRect(0, SOIL, 800, 450 - SOIL);
        const g = k => picked === k;
        // 根
        ctx.strokeStyle = g('root') ? '#ff922b' : '#e8d3b0';
        ctx.lineWidth = 4;
        [[-60, 420], [-25, 435], [0, 440], [30, 432], [65, 415], [-40, 380], [45, 385]].forEach(([dx, y]) => {
          ctx.beginPath();
          ctx.moveTo(SX, SOIL);
          ctx.quadraticCurveTo(SX + dx * 0.3, (SOIL + y) / 2, SX + dx, y);
          ctx.stroke();
        });
        // 茎
        ctx.strokeStyle = g('stem') ? '#ff922b' : '#2f9e44';
        ctx.lineWidth = g('stem') ? 14 : 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(SX, SOIL);
        ctx.lineTo(SX, 92);
        ctx.moveTo(SX, 205);
        ctx.quadraticCurveTo(350, 180, FRUIT[0], FRUIT[1] - 24);
        ctx.stroke();
        LEAVES.forEach(([x, y, a]) => leaf(x, y, a, g('leaf')));
        flower(FLOWER[0], FLOWER[1], '#ffe066', g('flower'));
        D.circle(ctx, FRUIT[0], FRUIT[1], 24, '#f03e3e', g('fruit') ? '#7a0000' : null, 4);
        D.text(ctx, '🌿', FRUIT[0], FRUIT[1] - 22, { size: 16 });
        // 切开的番茄，里面有种子
        ctx.beginPath();
        ctx.arc(SEED[0], SEED[1], 36, Math.PI, 0);
        ctx.closePath();
        ctx.fillStyle = '#ff6b6b';
        ctx.fill();
        if (g('seed')) { ctx.strokeStyle = '#ff922b'; ctx.lineWidth = 4; ctx.stroke(); }
        ctx.beginPath();
        ctx.arc(SEED[0], SEED[1], 28, Math.PI, 0);
        ctx.fillStyle = '#ffa8a8';
        ctx.fill();
        for (let i = 0; i < 7; i++) {
          ctx.beginPath();
          ctx.ellipse(SEED[0] - 20 + i * 6.5, SEED[1] - 10 - (i % 2) * 7, 3, 2, 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#fff3bf';
          ctx.fill();
        }
        D.text(ctx, '切开的番茄', SEED[0], SEED[1] + 18, { size: 13, color: '#fff' });
        // 说明牌
        D.rrect(ctx, 600, 30, 185, 230, 14);
        ctx.fillStyle = '#fff';
        ctx.fill();
        Object.keys(PARTS).forEach((k, i) => D.text(ctx, `${found.has(k) ? '✅' : '⬜'} ${PARTS[k][0]}`, 625, 60 + i * 32, { size: 18, align: 'left', color: picked === k ? '#c0620a' : '#2b2840' }));
        D.text(ctx, '👆 点植物的各个部分', 690, 280, { size: 14, color: '#2b2840', weight: 'normal' });
      }
      function renderDye() {
        ctx.fillStyle = '#fff9f0';
        ctx.fillRect(0, 0, 800, 450);
        const col = dye === 'red' ? [230, 50, 70] : [50, 100, 230];
        const up = clamp(hours / 4, 0, 1), petal = clamp((hours - 3.5) / 3, 0, 1);
        const X = 360, TOPY = 110, CUP = 300;
        // 杯子和彩色的水
        ctx.fillStyle = Sci.rgb(col, 0.7);
        ctx.fillRect(X - 50, CUP + 20, 100, 110);
        ctx.strokeStyle = '#8fa3bf';
        ctx.lineWidth = 3;
        ctx.strokeRect(X - 50, CUP - 20, 100, 150);
        // 茎：颜色从下往上爬
        ctx.lineCap = 'butt';
        ctx.strokeStyle = '#69db7c';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(X, CUP + 120);
        ctx.lineTo(X, TOPY + 20);
        ctx.stroke();
        const topY = lerp(CUP + 20, TOPY + 20, up);
        ctx.strokeStyle = Sci.rgb(col, 0.8);
        ctx.lineWidth = 3;
        [-3, 3].forEach(dx => {
          ctx.beginPath();
          ctx.moveTo(X + dx, CUP + 120);
          ctx.lineTo(X + dx, topY);
          ctx.stroke();
        });
        flower(X, TOPY, Sci.rgb(Sci.mixColor([255, 255, 255], Sci.mixColor(col, [255, 255, 255], 0.35), petal)), false, 2);
        D.text(ctx, `⏰ 过了 ${hours} 小时`, 600, 120, { size: 24, color: '#c0620a' });
        D.text(ctx, hours === 0 ? '白色的花插进了彩色的水里' : petal > 0.6 ? '花瓣变色啦！' : up >= 1 ? '颜色快爬到花瓣了……' : '颜色顺着茎往上爬……', 600, 160, { size: 18, maxW: 320 });
        D.text(ctx, '（茎里有细细的“导管”在运水）', 600, 195, { size: 14, color: '#6f6a85', weight: 'normal' });
      }
      api.loop(() => (mode === 'parts' ? renderParts() : renderDye()));
      api.choice([['parts', '🔍 认一认'], ['dye', '💧 花喝水实验']], mode, v => {
        mode = v;
        dyeRow.hidden = v !== 'dye';
        api.note(v === 'parts' ? '点一点植物的各个部分。' : '拖动“时间”滑块，看看几个小时后会怎样。');
      });
      const dyeRow = api.row();
      api.choice([['red', '🔴 红色水'], ['blue', '🔵 蓝色水']], dye, v => { dye = v; }, dyeRow);
      api.slider('时间', 0, 8, 1, 0, v => {
        hours = v;
        if (v >= 6 && !dyeDone) {
          dyeDone = true;
          Sci.sfx('good');
          api.note('🌸 花瓣变色了！水从杯子里出发，顺着茎一直运到了花瓣上。' + (found.size < 6 ? '再去“认一认”认识植物的 6 个部分吧。' : ''));
          check();
        }
      }, v => v + ' 小时', dyeRow);
      dyeRow.hidden = true;
      api.note('👆 点一点植物的各个部分，看看它们有什么本领。');
    },
  });

  /* ================= 8. 食物的旅行 ================= */
  const ORGANS = [
    ['嘴巴', '牙齿把食物嚼碎，唾液让它变得湿湿软软的。馒头嚼久了会变甜，是唾液在帮忙消化淀粉。', '约 1 分钟'],
    ['食道', '食道是一根长长的管子，肌肉一挤一挤，把食物推进胃里。倒立的时候也能咽下去哦！', '几秒钟'],
    ['胃', '胃像一个会动的口袋，用胃液把食物搅拌成糊糊。', '约 2～4 小时'],
    ['小肠', '小肠又细又长，展开有 5～6 米！食物里的营养在这里被吸收进血液，送到全身。', '约 3～5 小时'],
    ['大肠', '大肠吸收剩下的水分，没用的残渣变成大便，排出体外。', '十几个小时'],
  ];
  // 食物经过的路线；stop 表示走到这里会停下来，讲一讲这个器官
  const ROUTE = [
    [400, 92, 0], [400, 130], [402, 200, 1], [420, 228], [455, 240, 2], [440, 268], [400, 290],
    [350, 302], [450, 318], [360, 334], [430, 350, 3], [325, 345], [320, 282], [400, 274], [485, 282], [488, 390, 4], [420, 420], [400, 440],
  ];
  const FOODS = [['bread', '🍞', '面包'], ['apple', '🍎', '苹果'], ['egg', '🥚', '鸡蛋']];

  Sci.register({
    id: 'digest',
    subject: 'biology',
    level: 3,
    emoji: '🍞',
    title: '食物的旅行',
    desc: '吃下去的食物去了哪里？',
    intro: '我们每天吃下去的饭菜，在身体里经历了一场长长的旅行！它们会经过嘴巴、食道、胃、小肠和大肠，每一站都有不同的工作。选一样食物吃下去，跟着它一站一站走完全程吧。',
    goal: '跟着食物走完消化的全部 5 站',
    fact: '<p>食物的旅行路线：<b>嘴巴 → 食道 → 胃 → 小肠 → 大肠</b>，这些器官合起来叫做<b>消化系统</b>。</p><p>嘴巴和胃把食物变成糊糊，营养主要在<b>小肠</b>里被吸收进血液；大肠吸收水分，剩下的残渣排出体外。整个旅程要走一天左右！</p><p>🦷 吃饭时<b>细嚼慢咽</b>，能减轻胃的负担；饭后不要马上剧烈运动哦。</p>',
    quiz: [
      { q: '食物里的营养主要在哪里被吸收进血液？', options: ['胃', '小肠', '大肠'], answer: 1, explain: '小肠又长又弯，是吸收营养的主要地方。' },
      { q: '馒头嚼久了会变甜，是因为？', options: ['唾液把淀粉变成了糖', '馒头里本来放了很多糖'], answer: 0, explain: '唾液能把淀粉分解成有甜味的糖。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let food = FOODS[0], seg = 0, k = 0, moving = false, stop = -1, started = false, t = 0;
      const visited = new Set();
      const sparkles = [];

      function arrive(s) {
        stop = s;
        visited.add(s);
        Sci.sfx('good');
        const [n, d, time] = ORGANS[s];
        api.note(`第 ${s + 1} 站 · ${n}（${time}）：${d}`);
        nextBtn.textContent = s === 4 ? '🚽 排出体外' : '➡️ 继续旅行';
      }
      function go() {
        if (!started) {
          started = true;
          seg = 0;
          k = 0;
          visited.clear();
          arrive(0);
          return;
        }
        if (moving) return;
        if (seg >= ROUTE.length - 1) return;
        moving = true;
        Sci.sfx('whoosh');
      }
      const pos = () => {
        const a = ROUTE[seg], b = ROUTE[Math.min(seg + 1, ROUTE.length - 1)];
        return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
      };

      function render() {
        ctx.fillStyle = '#fff8f0';
        ctx.fillRect(0, 0, 800, 450);
        // 身体
        ctx.fillStyle = '#ffe3c8';
        D.circle(ctx, 400, 70, 52, '#ffe3c8');
        D.rrect(ctx, 290, 140, 220, 300, 60);
        ctx.fill();
        ctx.fillRect(375, 115, 50, 40);
        D.text(ctx, '👀', 400, 55, { size: 26 });
        const hi = s => stop === s;
        // 食道
        ctx.strokeStyle = hi(1) ? '#ff922b' : '#f4a99a';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(400, 100);
        ctx.lineTo(402, 210);
        ctx.stroke();
        // 胃
        ctx.fillStyle = hi(2) ? '#ffa94d' : '#f8b4a6';
        ctx.beginPath();
        ctx.moveTo(400, 215);
        ctx.bezierCurveTo(480, 190, 500, 260, 450, 272);
        ctx.bezierCurveTo(425, 278, 410, 268, 405, 285);
        ctx.lineTo(395, 280);
        ctx.bezierCurveTo(400, 250, 390, 230, 400, 215);
        ctx.fill();
        // 大肠
        ctx.strokeStyle = hi(4) ? '#ff922b' : '#e8a87c';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.moveTo(328, 350);
        ctx.lineTo(320, 282);
        ctx.lineTo(485, 282);
        ctx.lineTo(488, 395);
        ctx.lineTo(420, 420);
        ctx.stroke();
        // 小肠
        ctx.strokeStyle = hi(3) ? '#ff922b' : '#f6c1a8';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(400, 290);
        for (let i = 0; i <= 40; i++) ctx.lineTo(350 + (i % 2 ? 100 : 0) + Math.sin(i) * 6, 300 + i * 1.5);
        ctx.stroke();
        // 口
        D.rrect(ctx, 382, 84, 36, 14, 7);
        ctx.fillStyle = hi(0) ? '#ff922b' : '#e8590c';
        ctx.fill();
        // 营养进入血液
        sparkles.forEach(s => D.text(ctx, '✨', s.x, s.y, { size: 14, alpha: s.a }));
        // 食物
        if (started) {
          const [x, y] = pos();
          const size = [30, 24, 20, 14, 12][Math.max(0, stop)] || 12;
          if (seg < ROUTE.length - 1 || moving) {
            if (stop >= 3) D.circle(ctx, x, y, size / 2 + 1, '#8d5a3b');
            else D.emoji(ctx, food[1], x, y, size);
          }
        }
        // 站点表
        ORGANS.forEach(([n, , time], i) => {
          const y = 60 + i * 66;
          D.rrect(ctx, 560, y - 24, 220, 50, 12);
          ctx.fillStyle = stop === i ? '#fff3bf' : visited.has(i) ? '#ebfbee' : '#fff';
          ctx.fill();
          ctx.strokeStyle = '#e9ecef';
          ctx.lineWidth = 2;
          ctx.stroke();
          D.text(ctx, `${visited.has(i) ? '✅' : i + 1 + '.'} ${n}`, 580, y - 5, { size: 18, align: 'left' });
          D.text(ctx, time, 580, y + 15, { size: 13, align: 'left', color: '#6f6a85', weight: 'normal' });
        });
        D.text(ctx, '消化系统', 120, 60, { size: 22, color: '#c0620a' });
        D.text(ctx, '嘴巴 → 食道 → 胃', 120, 100, { size: 16, color: '#6f6a85' });
        D.text(ctx, '→ 小肠 → 大肠', 120, 126, { size: 16, color: '#6f6a85' });
      }
      api.loop(dt => {
        t += dt;
        if (moving) {
          k += dt * 2.2;
          if (k >= 1) {
            k = 0;
            seg++;
            const s = ROUTE[seg][2];
            if (seg >= ROUTE.length - 1) {
              moving = false;
              stop = -1;
              Sci.sfx('star');
              api.note(`🎉 ${food[2]}完成了它的旅行！营养被身体吸收，残渣排了出去。`);
              nextBtn.textContent = '😋 再吃一样';
              started = false;
              if (visited.size === 5) api.goalDone();
            } else if (s != null) {
              moving = false;
              arrive(s);
            }
          }
        }
        if (stop === 3 && Math.random() < dt * 10) sparkles.push({ x: 360 + Math.random() * 80, y: 330, a: 1 });
        for (let i = sparkles.length - 1; i >= 0; i--) {
          const s = sparkles[i];
          s.y -= dt * 40;
          s.a -= dt * 0.7;
          if (s.a <= 0) sparkles.splice(i, 1);
        }
        render();
      });
      api.choice(FOODS.map(f => [f[0], `${f[1]} ${f[2]}`]), food[0], v => {
        if (started) return;
        food = FOODS.find(f => f[0] === v);
      });
      const nextBtn = api.button('😋 吃下去', go);
      api.note('👆 选一样食物，点“吃下去”，开始旅行！');
    },
  });

  /* ================= 9. 显微镜下的细胞 ================= */
  // 简单的“随机数”：同一个格子每次算出来都一样，细胞就不会乱跳
  const hash = (i, j, s) => {
    const x = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const SAMPLES = [['onion', '🧅 洋葱表皮'], ['cheek', '👄 口腔上皮'], ['leaf', '🍃 叶片']];
  const ZOOMS = [[0.1, '40 倍'], [0.25, '100 倍'], [1, '400 倍']];
  const CELL_PARTS = { wall: '细胞壁', membrane: '细胞膜', nucleus: '细胞核', chloro: '叶绿体' };

  Sci.register({
    id: 'cell',
    subject: 'biology',
    level: 4,
    emoji: '🔬',
    title: '显微镜下的细胞',
    desc: '用显微镜看看生物是由什么组成的',
    intro: '所有的生物——大树、小草、小猫，还有你自己——都是由一个个小小的“细胞”组成的。细胞太小了，要用显微镜才看得见！选一种样本，放大到 400 倍，再调好焦距让画面变清楚，然后点一点细胞的各个部分。',
    goal: '找到细胞壁、细胞膜、细胞核和叶绿体',
    fact: '<p>生物体是由<b>细胞</b>组成的。细胞里有：</p><p><b>细胞核</b>：细胞的“司令部”，里面装着遗传信息。<b>细胞膜</b>：包在细胞外面的薄膜，控制东西进出。</p><p>植物细胞还多了两样东西：<b>细胞壁</b>——硬硬的外壳，让细胞保持形状，所以洋葱细胞像整齐的砖块；<b>叶绿体</b>——绿色的小颗粒，能进行光合作用，所以叶子是绿色的。</p><p>🔍 三百多年前，胡克用自己做的显微镜观察软木片，看到一个个小格子，给它起名叫“细胞”。</p>',
    quiz: [
      { q: '植物细胞有、而动物细胞没有的结构是？', options: ['细胞核', '细胞壁', '细胞膜'], answer: 1, explain: '植物细胞有细胞壁，动物细胞没有。' },
      { q: '叶子是绿色的，是因为细胞里有？', options: ['叶绿体', '细胞核'], answer: 0, explain: '叶绿体是绿色的，能进行光合作用。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const VX = 270, VY = 225, VR = 205, AREA = 1100;
      let sample = 'onion', zi = 0, focus = 20, best = 60, dirty = true, mark = null;
      const found = new Set();
      const cheeks = [];
      for (let i = 0; i < 3000; i++) {
        const x = (hash(i, 1, 9) - 0.5) * AREA * 2, y = (hash(i, 2, 9) - 0.5) * AREA * 2;
        if (cheeks.every(c => Math.hypot(c.x - x, c.y - y) > 118)) cheeks.push({ x, y, r: 48 + hash(i, 3, 9) * 12, nx: (hash(i, 4, 9) - 0.5) * 30, ny: (hash(i, 5, 9) - 0.5) * 30 });
      }
      const blur = () => Math.abs(focus - best) / 7;
      const newBest = () => { best = 30 + Math.round(hash(zi, sample.length, 3) * 50); dirty = true; };
      newBest();

      // 找到点中的是哪个细胞的哪个部分
      function partAt(wx, wy) {
        if (Math.abs(wx) > AREA || Math.abs(wy) > AREA) return null;
        if (sample === 'cheek') {
          const c = cheeks.find(c => Math.hypot(wx - c.x, wy - c.y) < c.r + 3);
          if (!c) return null;
          if (Math.hypot(wx - c.x - c.nx, wy - c.y - c.ny) < 14) return 'nucleus';
          return Math.hypot(wx - c.x, wy - c.y) > c.r - 8 ? 'membrane' : 'cyto';
        }
        const cw = sample === 'onion' ? 150 : 90, ch = sample === 'onion' ? 60 : 70;
        const row = Math.floor(wy / ch), off = sample === 'onion' && row % 2 ? cw / 2 : 0;
        const col = Math.floor((wx - off) / cw);
        const lx = wx - off - col * cw, ly = wy - row * ch;
        const nx = cw * (0.3 + hash(col, row, 1) * 0.4), ny = ch * (0.35 + hash(col, row, 2) * 0.3);
        if (Math.min(lx, ly, cw - lx, ch - ly) < 6) return 'wall';
        if (Math.hypot(lx - nx, ly - ny) < (sample === 'onion' ? 12 : 9)) return 'nucleus';
        if (sample === 'leaf') {
          for (let k = 0; k < 9; k++) {
            const [cx, cy] = chloroPos(col, row, k, cw, ch);
            if (Math.hypot(lx - cx, ly - cy) < 10) return 'chloro';
          }
        }
        return 'cyto';
      }
      function chloroPos(col, row, k, cw, ch) {
        const a = k / 9 * Math.PI * 2 + hash(col, row, 5);
        return [cw / 2 + Math.cos(a) * (cw / 2 - 14), ch / 2 + Math.sin(a) * (ch / 2 - 13)];
      }

      api.pointer(st, {
        down(p) {
          if (Math.hypot(p.x - VX, p.y - VY) > VR) return;
          if (zi < 2) { api.note('放大到 400 倍，才看得清细胞里面的东西哦。'); return; }
          if (blur() > 1.2) { api.note('画面太模糊了，先拖动“调焦”滑块，把细胞调清楚。'); return; }
          const z = ZOOMS[zi][0], wx = (p.x - VX) / z, wy = (p.y - VY) / z;
          const k = partAt(wx, wy);
          mark = { x: p.x, y: p.y, k };
          dirty = true;
          if (!k) return;
          if (k === 'cyto') { api.note('这里是细胞质，细胞里的各种东西都泡在它里面。试试点细胞的边缘或者中间的小圆点。'); return; }
          const first = !found.has(k);
          found.add(k);
          Sci.sfx(first ? 'good' : 'pop');
          const tip = {
            wall: sample === 'leaf' ? '叶片细胞也有硬硬的细胞壁。' : '洋葱细胞外面有一层硬硬的细胞壁，所以排得像砖块一样整齐。',
            membrane: '口腔上皮细胞是动物细胞，没有细胞壁，最外面是一层薄薄的细胞膜，所以形状软软的、圆圆的。',
            nucleus: '这是细胞核，细胞的“司令部”，里面装着遗传信息。',
            chloro: '这些绿色的小颗粒是叶绿体，能用阳光制造养料！',
          }[k];
          api.note(`${CELL_PARTS[k]}！${tip}（找到 ${found.size}/4）`);
          if (found.size === 4) api.goalDone();
        },
      });

      function drawCells(z) {
        const half = VR / z;
        if (sample === 'cheek') {
          cheeks.forEach(c => {
            if (Math.abs(c.x) > half + 70 || Math.abs(c.y) > half + 70) return;
            ctx.beginPath();
            for (let a = 0; a <= 12; a++) {
              const ang = a / 12 * Math.PI * 2, rr = c.r * (0.92 + 0.08 * Math.sin(ang * 3 + c.x));
              ctx.lineTo(c.x + Math.cos(ang) * rr, c.y + Math.sin(ang) * rr);
            }
            ctx.closePath();
            ctx.fillStyle = 'rgba(200,170,230,.45)';
            ctx.fill();
            ctx.strokeStyle = '#9775c9';
            ctx.lineWidth = 1.5 / Math.max(z, 0.3);
            ctx.stroke();
            D.circle(ctx, c.x + c.nx, c.y + c.ny, 11, '#6741d9');
          });
          return;
        }
        const cw = sample === 'onion' ? 150 : 90, ch = sample === 'onion' ? 60 : 70;
        const r0 = Math.floor(-Math.min(half, AREA) / ch) - 1, r1 = Math.ceil(Math.min(half, AREA) / ch);
        for (let row = r0; row <= r1; row++) {
          const off = sample === 'onion' && row % 2 ? cw / 2 : 0;
          const c0 = Math.floor((-Math.min(half, AREA) - off) / cw) - 1, c1 = Math.ceil((Math.min(half, AREA) - off) / cw);
          for (let col = c0; col <= c1; col++) {
            const x = off + col * cw, y = row * ch;
            ctx.fillStyle = sample === 'onion' ? 'rgba(245,225,200,.7)' : 'rgba(200,240,190,.7)';
            ctx.fillRect(x, y, cw, ch);
            ctx.strokeStyle = sample === 'onion' ? '#b08850' : '#5c940d';
            ctx.lineWidth = 6;
            ctx.strokeRect(x + 3, y + 3, cw - 6, ch - 6);
            if (z < 0.2) continue;
            const nx = cw * (0.3 + hash(col, row, 1) * 0.4), ny = ch * (0.35 + hash(col, row, 2) * 0.3);
            D.circle(ctx, x + nx, y + ny, sample === 'onion' ? 11 : 8, sample === 'onion' ? '#9c6b3f' : '#868e96');
            if (sample === 'leaf') for (let k = 0; k < 9; k++) {
              const [cx, cy] = chloroPos(col, row, k, cw, ch);
              ctx.beginPath();
              ctx.ellipse(x + cx, y + cy, 8, 5, k, 0, Math.PI * 2);
              ctx.fillStyle = '#2f9e44';
              ctx.fill();
            }
          }
        }
      }
      function render() {
        ctx.fillStyle = '#212529';
        ctx.fillRect(0, 0, 800, 450);
        ctx.save();
        ctx.beginPath();
        ctx.arc(VX, VY, VR, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#fdfbf4';
        ctx.fillRect(VX - VR, VY - VR, VR * 2, VR * 2);
        const z = ZOOMS[zi][0], b = blur();
        // 没对好焦时，把画面错开画几遍，看起来就是模糊的
        const offs = b < 0.5 ? [[0, 0]] : [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]];
        ctx.globalAlpha = b < 0.5 ? 1 : 0.32;
        offs.forEach(([dx, dy]) => {
          ctx.save();
          ctx.translate(VX + dx * b * 2.2, VY + dy * b * 2.2);
          ctx.scale(z, z);
          drawCells(z);
          ctx.restore();
        });
        ctx.globalAlpha = 1;
        if (mark && mark.k) D.circle(ctx, mark.x, mark.y, 12, null, '#ff3b3b', 3);
        ctx.restore();
        D.circle(ctx, VX, VY, VR, null, '#495057', 10);
        D.text(ctx, SAMPLES.find(s => s[0] === sample)[1] + ' · ' + ZOOMS[zi][1], 640, 40, { size: 20, color: '#fff' });
        D.text(ctx, b < 1.2 ? '✅ 很清楚' : b < 4 ? '有点模糊……' : '好模糊！要调焦', 640, 76, { size: 16, color: b < 1.2 ? '#8ce99a' : '#ffd43b' });
        Object.keys(CELL_PARTS).forEach((k, i) => D.text(ctx, `${found.has(k) ? '✅' : '⬜'} ${CELL_PARTS[k]}`, 560, 140 + i * 36, { size: 18, align: 'left', color: '#fff' }));
        D.text(ctx, '👆 400 倍下点细胞的各个部分', 640, 310, { size: 14, color: '#adb5bd', weight: 'normal' });
      }
      api.loop(() => { if (dirty) { dirty = false; render(); } });
      api.choice(SAMPLES, sample, v => { sample = v; mark = null; newBest(); api.note('换了样本，记得重新调焦哦。'); });
      const row2 = api.row();
      api.choice(ZOOMS.map((zz, i) => [i, '🔍 ' + zz[1]]), zi, v => { zi = v; mark = null; newBest(); }, row2);
      api.slider('调焦', 0, 100, 1, focus, v => { focus = v; dirty = true; }, v => (Math.abs(v - best) < 8 ? '清楚' : '模糊'), row2);
      api.note('👆 先拖动“调焦”滑块让画面变清楚，再放大到 400 倍。');
    },
  });

  /* ================= 10. 遗传的密码 ================= */
  const GENOS = ['PP', 'Pp', 'pp'];
  const purple = g => g.indexOf('P') >= 0;

  Sci.register({
    id: 'genes',
    subject: 'biology',
    level: 5,
    emoji: '🌸',
    title: '遗传的密码',
    desc: '孟德尔的豌豆：为什么孩子像爸爸妈妈？',
    intro: '一百多年前，孟德尔在修道院的花园里种了好多年豌豆，发现了遗传的秘密。豌豆花的颜色由一对“基因”决定：大写的 P 让花变紫色，小写的 p 让花变白色。选两株豌豆当“爸爸妈妈”，种下 100 颗它们的种子，看看会开出什么颜色的花。',
    goal: '先做 PP × pp，再做 Pp × Pp，重现孟德尔的实验',
    fact: '<p>生物的特征（比如花的颜色）由<b>基因</b>决定。每株豌豆有<b>一对</b>花色基因，一个来自“爸爸”，一个来自“妈妈”。</p><p>紫色基因 P 是<b>显性</b>的，只要有一个 P，花就是紫色；白色基因 p 是<b>隐性</b>的，只有两个都是 p（pp），花才是白色。</p><p>所以 PP × pp 的后代全是 Pp，全部开紫花；两株 Pp 再杂交，后代里 PP : Pp : pp ≈ 1 : 2 : 1，紫花和白花大约是 <b>3 : 1</b>——这就是孟德尔发现的规律！</p>',
    quiz: [
      { q: '两株 Pp 的紫花豌豆杂交，后代里白花大约占多少？', options: ['1/4', '1/2', '3/4'], answer: 0, explain: '只有 pp 才开白花，占 1/4。' },
      { q: '两株紫花豌豆的后代里出现了白花，说明这两株紫花？', options: ['都带有白花基因 p', '一定都是 PP'], answer: 0, explain: '白花是 pp，两个 p 分别来自两株亲代，所以它们都是 Pp。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let m = 'PP', f = 'pp', kids = [], shown = 0, t = 0;
      const done = new Set();

      function plant() {
        kids = [];
        for (let i = 0; i < 100; i++) {
          const a = m[Math.random() < 0.5 ? 0 : 1], b = f[Math.random() < 0.5 ? 0 : 1];
          kids.push(a === 'P' || b !== 'P' ? a + b : b + a);
        }
        shown = 0;
        Sci.sfx('whoosh');
      }
      function result() {
        const p = kids.filter(purple).length, w = 100 - p;
        const key = [m, f].sort().join('×');
        done.add(key);
        let msg = `开花啦！紫花 ${p} 株，白花 ${w} 株。`;
        if (key === 'PP×pp') msg += ' 全部是紫花！白花基因 p 藏起来了。';
        if (key === 'Pp×Pp') msg += ` 紫花 : 白花 ≈ ${(p / Math.max(1, w)).toFixed(1)} : 1，接近 3 : 1！`;
        api.note(msg);
        Sci.sfx('good');
        if (done.has('PP×pp') && done.has('Pp×Pp')) api.goalDone();
      }
      function flowerAt(x, y, r, g) {
        const c = purple(g) ? '#9c36b5' : '#f8f9fa';
        for (let i = 0; i < 5; i++) {
          const a = i * Math.PI * 2 / 5;
          D.circle(ctx, x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.55, c, purple(g) ? null : '#ced4da', 1);
        }
        D.circle(ctx, x, y, r * 0.3, '#fab005');
      }
      function render() {
        ctx.fillStyle = '#f4fce3';
        ctx.fillRect(0, 0, 800, 450);
        // 亲代
        flowerAt(80, 70, 26, m);
        D.text(ctx, m, 80, 112, { size: 20 });
        D.text(ctx, '×', 150, 70, { size: 30, color: '#6f6a85' });
        flowerAt(220, 70, 26, f);
        D.text(ctx, f, 220, 112, { size: 20 });
        // 棋盘格（每个亲代给一个基因）
        const GX = 70, GY = 170, C = 70;
        D.text(ctx, '每颗种子：从两边各拿一个基因', 150, 145, { size: 14, color: '#6f6a85', weight: 'normal' });
        for (let i = 0; i < 2; i++) {
          D.text(ctx, f[i], GX + C * 1.5 + i * C, GY - 0 + 6, { size: 20, color: '#c0620a' });
          D.text(ctx, m[i], GX + 22, GY + C * 0.5 + 26 + i * C, { size: 20, color: '#1c7ed6' });
          for (let j = 0; j < 2; j++) {
            const a = m[i], b = f[j], g = a === 'P' || b !== 'P' ? a + b : b + a;
            const x = GX + C + j * C, y = GY + 26 + i * C;
            ctx.fillStyle = '#fff';
            ctx.fillRect(x, y, C - 4, C - 4);
            flowerAt(x + C / 2 - 2, y + 24, 12, g);
            D.text(ctx, g, x + C / 2 - 2, y + 52, { size: 15 });
          }
        }
        // 100 株后代
        const OX = 380, OY = 40, S = 40;
        D.rrect(ctx, OX - 10, OY - 10, S * 10 + 20, S * 10 - 20, 14);
        ctx.fillStyle = '#e9f5d0';
        ctx.fill();
        for (let i = 0; i < shown; i++) flowerAt(OX + 10 + (i % 10) * S, OY + 12 + Math.floor(i / 10) * (S - 4), 12, kids[i]);
        if (!kids.length) D.text(ctx, '点“种下 100 颗种子”', OX + 200, OY + 180, { size: 18, color: '#6f6a85' });
        if (shown === 100) {
          const p = kids.filter(purple).length;
          D.text(ctx, `紫花 ${p} 株　白花 ${100 - p} 株`, OX + 200, 420, { size: 20, color: '#2b2840' });
        }
        D.text(ctx, `${done.has('PP×pp') ? '✅' : '⬜'} PP × pp　${done.has('Pp×Pp') ? '✅' : '⬜'} Pp × Pp`, 150, 420, { size: 16 });
      }
      api.loop(dt => {
        t += dt;
        if (kids.length && shown < 100) {
          shown = Math.min(100, shown + Math.ceil(dt * 120));
          if (shown === 100) result();
        }
        render();
      });
      api.choice(GENOS.map(g => [g, `👨 爸爸 ${g}`]), m, v => { m = v; kids = []; });
      const row2 = api.row();
      api.choice(GENOS.map(g => [g, `👩 妈妈 ${g}`]), f, v => { f = v; kids = []; }, row2);
      const row3 = api.row();
      api.button('🌱 种下 100 颗种子', plant, row3);
      api.note('👆 上面两排选“爸爸”和“妈妈”的基因，先试试 PP × pp，再试试 Pp × Pp。');
    },
  });
})();
