/* 地理探秘（第二组）：认识地形 → 天气预报员 → 等高线 → 海风和陆风 → 岩石的旅行 */
(function () {
  'use strict';
  const { clamp, lerp } = Sci;
  const D = Sci.draw;

  /* ================= 6. 认识地形 ================= */
  const LANDFORMS = {
    mountain: ['高山', '地面高高隆起、山坡很陡的地方。山顶常年很冷，有的还盖着积雪。'],
    plain: ['平原', '又平又宽广的土地，适合种庄稼、建城市。'],
    river: ['河流', '从高处往低处流的水，最后流进大海或湖泊。'],
    lake: ['湖泊', '陆地上被围起来的一大片水。'],
    sea: ['海洋', '地球上最大的水域，海水是咸的。地球表面大约 7 成都是海洋！'],
    island: ['岛屿', '四面都被水围着的一块陆地。'],
  };
  const MOUNTAINS = [[[20, 250], [120, 70], [220, 250]], [[140, 250], [240, 110], [340, 250]], [[-40, 250], [40, 140], [120, 250]]];
  const RIVER = [[235, 200], [280, 255], [360, 295], [460, 318], [560, 330], [640, 342]];
  const coastX = y => 640 + Math.sin(y / 40) * 14;
  const segDist = (p, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const k = clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy), 0, 1);
    return Math.hypot(p[0] - a[0] - dx * k, p[1] - a[1] - dy * k);
  };
  const inTri = (p, [a, b, c]) => {
    const s = (u, v, w) => (u[0] - w[0]) * (v[1] - w[1]) - (v[0] - w[0]) * (u[1] - w[1]);
    const d1 = s(p, a, b), d2 = s(p, b, c), d3 = s(p, c, a);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };

  Sci.register({
    id: 'landform',
    subject: 'geography',
    level: 1,
    emoji: '⛰️',
    title: '认识地形',
    desc: '高山、平原、河流、湖泊、海洋和岛屿',
    intro: '大地的样子千变万化：有高高的山，有平平的原野，还有弯弯的河流和一望无际的大海。小博士会问你“某某在哪里”，请在画里找到它，点一下！',
    goal: '找出画里的 6 种地形',
    fact: '<p><b>高山</b>高高隆起；<b>平原</b>又平又宽；<b>河流</b>从高处流向低处；<b>湖泊</b>是陆地上的一大片水；<b>海洋</b>又大又咸；<b>岛屿</b>四面环水。</p><p>河流常常从高山上发源，流过平原，最后流进大海。人们喜欢住在河边的平原上，因为那里取水方便、土地肥沃，很多古老的城市都建在大河旁边。</p><p>🇨🇳 中国地势西边高、东边低，所以长江、黄河都是从西往东流，最后流进大海。</p>',
    quiz: [
      { q: '四面都被水围着的陆地叫什么？', options: ['岛屿', '平原', '高山'], answer: 0, explain: '岛屿四面环水。' },
      { q: '地面平坦宽广、适合种庄稼的地形是？', options: ['平原', '高山'], answer: 0, explain: '平原又平又宽，适合耕种。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const order = Sci.shuffle(Object.keys(LANDFORMS));
      let qi = 0, t = 0;
      const found = {};

      function what(p) {
        const q = [p.x, p.y];
        if (Math.hypot((p.x - 715) / 46, (p.y - 150) / 28) < 1) return 'island';
        if (p.x > coastX(p.y)) return 'sea';
        if (Math.hypot((p.x - 500) / 66, (p.y - 398) / 30) < 1) return 'lake';
        for (let i = 1; i < RIVER.length; i++) if (segDist(q, RIVER[i - 1], RIVER[i]) < 18) return 'river';
        if (MOUNTAINS.some(tri => inTri(q, tri))) return 'mountain';
        if (p.y > 235) return 'plain';
        return null;
      }
      function ask() {
        if (qi >= order.length) return;
        api.note(`🦉 ${LANDFORMS[order[qi]][0]}在哪里？点一下它！`);
      }
      api.pointer(st, {
        down(p) {
          const k = what(p);
          if (!k || qi >= order.length) return;
          const want = order[qi];
          if (k !== want) {
            Sci.sfx('bad');
            api.note(`这里是${LANDFORMS[k][0]}哦。再找一找${LANDFORMS[want][0]}在哪里？`);
            return;
          }
          found[k] = [p.x, p.y];
          qi++;
          Sci.sfx('good');
          api.note(`✅ ${LANDFORMS[k][0]}：${LANDFORMS[k][1]}`);
          if (qi < order.length) api.timeout(ask, 2600);
          else api.timeout(() => { api.note('🎉 6 种地形全部找到啦！'); api.goalDone(); }, 2600);
        },
      });

      function render() {
        ctx.fillStyle = '#d0ebff';
        ctx.fillRect(0, 0, 800, 450);
        // 平原
        ctx.fillStyle = '#b2f2bb';
        ctx.fillRect(0, 230, 800, 220);
        // 海洋
        ctx.fillStyle = '#4dabf7';
        ctx.beginPath();
        ctx.moveTo(800, 0);
        for (let y = 0; y <= 450; y += 10) ctx.lineTo(coastX(y), y);
        ctx.lineTo(800, 450);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.6)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const y = 40 + i * 70, x = 690 + (i % 2) * 40 + Math.sin(t + i) * 6;
          ctx.beginPath();
          ctx.arc(x, y, 10, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        }
        // 岛屿
        ctx.fillStyle = '#ffe066';
        ctx.beginPath();
        ctx.ellipse(715, 150, 46, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        D.emoji(ctx, '🌴', 720, 132, 30);
        // 高山
        MOUNTAINS.slice().reverse().forEach(tri => {
          ctx.fillStyle = '#868e96';
          ctx.beginPath();
          tri.forEach(([x, y]) => ctx.lineTo(x, y));
          ctx.closePath();
          ctx.fill();
          const [l, top, r] = tri;
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.moveTo(top[0], top[1]);
          ctx.lineTo(lerp(top[0], l[0], 0.28), lerp(top[1], l[1], 0.28));
          ctx.lineTo(lerp(top[0], r[0], 0.28), lerp(top[1], r[1], 0.28));
          ctx.closePath();
          ctx.fill();
        });
        // 湖泊
        ctx.fillStyle = '#74c0fc';
        ctx.beginPath();
        ctx.ellipse(500, 398, 66, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        // 河流
        ctx.strokeStyle = '#4dabf7';
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        RIVER.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.stroke();
        // 农田和房子
        D.emoji(ctx, '🌾', 120, 330, 30);
        D.emoji(ctx, '🌾', 180, 380, 30);
        D.emoji(ctx, '🏠', 320, 405, 34);
        D.emoji(ctx, '🌳', 540, 260, 30);
        Object.keys(found).forEach(k => {
          const [x, y] = found[k];
          D.text(ctx, '✅ ' + LANDFORMS[k][0], x, y - 22, { size: 18, color: '#2b2840', stroke: '#fff', strokeWidth: 5 });
        });
        if (qi < order.length) D.text(ctx, `🦉 ${LANDFORMS[order[qi]][0]}在哪里？`, 20, 30, { size: 22, align: 'left', color: '#2b2840', stroke: '#fff', strokeWidth: 5 });
      }
      api.loop(dt => { t += dt; render(); });
      ask();
    },
  });

  /* ================= 7. 我是天气预报员 ================= */
  const WEATHERS = {
    sunny: ['☀️', '晴'], cloudy: ['⛅', '多云'], overcast: ['☁️', '阴'], rain: ['🌧️', '雨'], snow: ['❄️', '雪'], storm: ['⛈️', '雷阵雨'],
  };

  Sci.register({
    id: 'weather',
    subject: 'geography',
    level: 2,
    emoji: '⛅',
    title: '我是天气预报员',
    desc: '云、气温和风，组合出各种天气',
    intro: '今天你来当天气预报员！天气是由云、气温和风一起决定的。调一调天上的云有多少、气温有多高、风有多大，看看会变出什么天气，再把天气符号报给大家听。一共有 6 种天气等你变出来！',
    goal: '变出 6 种不同的天气',
    fact: '<p><b>天气</b>是某个地方短时间里的阴、晴、冷、热、风、雨等情况，每天都可能不一样。</p><p>天上的云是由许许多多小水滴和小冰晶组成的。云越来越厚，小水滴碰到一起变成大水滴，太重了就掉下来，变成<b>雨</b>；天气很冷的时候，落下来的就是<b>雪</b>。夏天又热、云又厚的时候，容易下<b>雷阵雨</b>。</p><p>天气预报用符号来表示天气：☀️ 晴、⛅ 多云、☁️ 阴、🌧️ 雨、❄️ 雪、⛈️ 雷阵雨。出门前看看天气预报，就知道要不要带伞啦！</p>',
    quiz: [
      { q: '天气预报里的“☁️”表示什么天气？', options: ['阴天', '下雨', '晴天'], answer: 0, explain: '一朵灰灰的云表示阴天。' },
      { q: '下雪通常需要什么条件？', options: ['天上云很厚，而且很冷', '天上一朵云也没有'], answer: 0, explain: '要有厚厚的云，气温还要很低。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let clouds = 0, temp = 20, wind = 0, t = 0, flash = 0;
      const seen = new Set();
      const drops = [];
      const kind = () => (clouds === 0 ? 'sunny' : clouds === 1 ? 'cloudy' : clouds === 2 ? 'overcast' : temp <= 0 ? 'snow' : temp >= 28 ? 'storm' : 'rain');

      function update() {
        const k = kind();
        if (!seen.has(k)) {
          seen.add(k);
          Sci.sfx('good');
          api.note(`${WEATHERS[k][0]} 你变出了“${WEATHERS[k][1]}”！（${seen.size}/6）` + (seen.size === 6 ? '' : ' 再调一调，变出别的天气。'));
          if (seen.size === 6) api.timeout(() => { api.note('🎉 6 种天气全变出来了，你是一名合格的天气预报员！'); api.goalDone(); }, 1500);
        } else api.note(`现在是：${WEATHERS[k][0]} ${WEATHERS[k][1]}，气温 ${temp}°C${wind ? '，' + ['', '有风', '大风'][wind] : ''}。`);
      }
      function cloud(x, y, s, dark) {
        ctx.fillStyle = dark ? '#868e96' : '#f8f9fa';
        [[0, 0, 30], [30, -12, 36], [64, 0, 30], [32, 10, 30]].forEach(([dx, dy, r]) => {
          ctx.beginPath();
          ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      function render() {
        const k = kind();
        const dark = clouds / 3;
        const sky = ctx.createLinearGradient(0, 0, 0, 340);
        sky.addColorStop(0, Sci.rgb(Sci.mixColor([90, 170, 255], [90, 100, 120], dark)));
        sky.addColorStop(1, Sci.rgb(Sci.mixColor([200, 230, 255], [160, 165, 175], dark)));
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 800, 450);
        if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, 800, 450); }
        if (clouds < 2) D.emoji(ctx, '☀️', 120, 80, 80);
        const n = [0, 2, 4, 7][clouds];
        for (let i = 0; i < n; i++) {
          const x = ((i * 120 + t * (10 + wind * 30)) % 900) - 100;
          cloud(x, 60 + (i % 3) * 30, 0.9 + (i % 2) * 0.3, clouds >= 2);
        }
        if (k === 'storm' && Math.sin(t * 1.7) > 0.97) {
          ctx.strokeStyle = '#ffe066';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(500, 90);
          ctx.lineTo(470, 170);
          ctx.lineTo(500, 170);
          ctx.lineTo(460, 270);
          ctx.stroke();
        }
        // 地面：冷的时候盖上雪
        ctx.fillStyle = temp <= 0 ? '#f1f3f5' : '#8ce99a';
        ctx.fillRect(0, 340, 800, 110);
        // 小树被风吹弯
        const bend = wind * 10 + Math.sin(t * 3) * wind * 3;
        [[200, 340], [320, 340], [470, 340]].forEach(([x, y]) => {
          ctx.strokeStyle = '#8d5a3b';
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x, y - 40, x + bend, y - 70);
          ctx.stroke();
          D.circle(ctx, x + bend * 1.2, y - 90, 30, temp <= 0 ? '#e9ecef' : '#2f9e44');
        });
        drops.forEach(d => {
          if (d.snow) D.circle(ctx, d.x, d.y, 3, '#fff');
          else {
            ctx.strokeStyle = 'rgba(200,225,255,.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x - wind * 4, d.y + 12);
            ctx.stroke();
          }
        });
        // 预报卡片
        D.rrect(ctx, 600, 160, 180, 160, 18);
        ctx.fillStyle = 'rgba(255,255,255,.92)';
        ctx.fill();
        D.text(ctx, '今日天气', 690, 185, { size: 15, color: '#6f6a85' });
        D.emoji(ctx, WEATHERS[k][0], 690, 235, 56);
        D.text(ctx, `${WEATHERS[k][1]} ${temp}°C`, 690, 290, { size: 22 });
        if (wind === 2) D.text(ctx, '🌬️ 大风', 690, 312, { size: 13, color: '#c0620a' });
        Object.keys(WEATHERS).forEach((key, i) => D.text(ctx, (seen.has(key) ? '✅' : '⬜') + WEATHERS[key][1], 20 + i * 80, 420, { size: 15, align: 'left', color: '#2b2840' }));
      }
      api.loop(dt => {
        t += dt;
        flash = Math.max(0, flash - dt * 3);
        const k = kind();
        if (k === 'storm' && Math.random() < dt * 0.4) { flash = 0.7; Sci.tone(60, 0.6, { type: 'sawtooth', vol: 0.05, to: 40 }); }
        if (k === 'rain' || k === 'storm' || k === 'snow') {
          for (let i = 0; i < (k === 'snow' ? 2 : 5); i++) drops.push({ x: Math.random() * 820, y: 100, snow: k === 'snow', v: k === 'snow' ? 60 : 420 });
        }
        for (let i = drops.length - 1; i >= 0; i--) {
          const d = drops[i];
          d.y += d.v * dt;
          d.x += (d.snow ? Math.sin(t * 2 + i) * 20 : 0) * dt - wind * 30 * dt;
          if (d.y > 345) drops.splice(i, 1);
        }
        render();
      });
      api.choice([[0, '无云'], [1, '少云'], [2, '多云'], [3, '乌云密布']], clouds, v => { clouds = v; update(); });
      const row2 = api.row();
      api.slider('气温', -10, 35, 1, temp, v => { temp = v; update(); }, v => v + '°C', row2);
      api.choice([[0, '无风'], [1, '有风'], [2, '大风']], wind, v => { wind = v; update(); }, row2);
      update();
    },
  });

  /* ================= 8. 等高线的秘密 ================= */
  Sci.register({
    id: 'contour',
    subject: 'geography',
    level: 3,
    emoji: '🗻',
    title: '等高线的秘密',
    desc: '地图上一圈圈的线，藏着山的高低',
    intro: '地图是平平的，可是山有高有低，地图上怎么画出山的高低呢？想象海水一点点涨起来，每涨 100 米，就沿着水边在地图上画一圈线，这就是“等高线”。拖动水位滑块，把整座山淹没一遍，再看看地图上的线有什么秘密。',
    goal: '画出所有等高线，再找出山坡更陡的那一边',
    fact: '<p><b>等高线</b>是把地面上<b>一样高</b>的点连起来的线。线上的数字表示这里有多少米高。</p><p>等高线越<b>密</b>，说明走一点点路就要升高很多，山坡就越<b>陡</b>；等高线越<b>稀</b>，山坡越<b>缓</b>。一圈一圈越来越小、最里面的那圈就是<b>山顶</b>。</p><p>🧗 爬山的人看等高线地图，就知道哪条路平缓好走，哪里是悬崖要小心。</p>',
    quiz: [
      { q: '等高线画得很密的地方，坡度怎么样？', options: ['很陡', '很平缓'], answer: 0, explain: '线越密，坡越陡。' },
      { q: '等高线旁边写着“500”，表示什么？', options: ['线上每个点都高 500 米', '这座山宽 500 米'], answer: 0, explain: '等高线上每个点的高度都一样。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const P = [610, 235], H = 1000, BASE = 400, ZS = 0.24, PL = 40;
      const R = a => 120 - 65 * Math.cos(a);
      let level = 0, maxLevel = 0, steepFound = false;

      const profileZ = dx => (dx >= 0 ? H * (1 - dx / 55) : H * (1 + dx / 185));
      api.pointer(st, {
        down(p) {
          if (p.x < 420) return;
          if (maxLevel < 900) { api.note('先把水位涨到 900 米以上，把等高线都画出来吧。'); return; }
          if (Math.hypot(p.x - P[0], p.y - P[1]) < 14) { api.note('⛰️ 最里面那一小圈就是山顶，高 900 多米！'); return; }
          if (p.x > P[0] + 10) {
            Sci.sfx('good');
            steepFound = true;
            api.note('✅ 对！东边（右边）的等高线挤在一起，说明山坡很陡。看左边的侧面图也是这样。');
            if (maxLevel >= 900) api.goalDone();
          } else if (p.x < P[0] - 10) {
            Sci.sfx('bad');
            api.note('西边（左边）的等高线隔得比较远，这边的山坡比较平缓哦。');
          }
        },
      });

      function render() {
        ctx.fillStyle = '#fbfaf5';
        ctx.fillRect(0, 0, 800, 450);
        // 左边：侧面图
        D.text(ctx, '侧面看（从南往北看）', 215, 26, { size: 15, color: '#6f6a85' });
        const x0 = PL, px = PL + 185;
        ctx.fillStyle = '#a9e34b';
        ctx.beginPath();
        ctx.moveTo(x0, BASE);
        for (let dx = -185; dx <= 55; dx += 1) ctx.lineTo(px + dx, BASE - profileZ(dx) * ZS);
        ctx.lineTo(px + 55, BASE);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#5c940d';
        ctx.lineWidth = 2;
        ctx.stroke();
        const wy = BASE - level * ZS;
        ctx.fillStyle = 'rgba(77,171,247,.55)';
        ctx.fillRect(10, wy, 380, BASE - wy + 30);
        for (let z = 100; z <= maxLevel && z < H; z += 100) {
          const y = BASE - z * ZS;
          ctx.strokeStyle = 'rgba(160,82,45,.5)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(px - 185 * (1 - z / H), y);
          ctx.lineTo(px + 55 * (1 - z / H), y);
          ctx.stroke();
          ctx.setLineDash([]);
          D.text(ctx, z + '', 22, y, { size: 11, color: '#a0522d', weight: 'normal' });
        }
        D.text(ctx, '西', 20, BASE + 20, { size: 15, color: '#6f6a85' });
        D.text(ctx, '东', 380, BASE + 20, { size: 15, color: '#6f6a85' });
        D.text(ctx, `🌊 水位 ${level} 米`, 215, 58, { size: 18, color: '#1c7ed6' });
        ctx.fillStyle = '#dee2e6';
        ctx.fillRect(405, 0, 3, 450);

        // 右边：从上往下看的地图
        D.text(ctx, '地图（从天上往下看）', 610, 26, { size: 15, color: '#6f6a85' });
        ctx.fillStyle = '#d0ebff';
        ctx.fillRect(420, 50, 370, 380);
        const ring = (z, fill, stroke) => {
          ctx.beginPath();
          for (let i = 0; i <= 72; i++) {
            const a = i / 72 * Math.PI * 2, r = R(a) * (1 - z / H);
            ctx.lineTo(P[0] + Math.cos(a) * r, P[1] + Math.sin(a) * r * 0.9);
          }
          ctx.closePath();
          if (fill) { ctx.fillStyle = fill; ctx.fill(); }
          if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
        };
        ring(0, '#d8f5a2');
        if (level > 0) ring(level, null, '#1c7ed6');
        for (let z = 0; z <= maxLevel && z < H; z += 100) {
          ring(z, null, '#a0522d');
          const r = R(-Math.PI / 2) * (1 - z / H);
          if (z % 200 === 0) D.text(ctx, z + '', P[0], P[1] - r * 0.9 - 2, { size: 11, color: '#a0522d', stroke: '#fff', strokeWidth: 3 });
        }
        if (maxLevel >= 900) D.text(ctx, '▲', P[0], P[1], { size: 14, color: '#a0522d' });
        D.text(ctx, '西', 432, 236, { size: 15, color: '#6f6a85' });
        D.text(ctx, '东', 778, 236, { size: 15, color: '#6f6a85' });
        D.text(ctx, '北 ↑', 610, 64, { size: 13, color: '#6f6a85' });
        D.text(ctx, maxLevel >= 900 ? '👆 点一点：哪边的山坡更陡？' : '拖动水位，画出等高线', 605, 415, { size: 15, color: '#2b2840' });
        D.text(ctx, `${maxLevel >= 900 ? '✅' : '⬜'} 画完等高线　${steepFound ? '✅' : '⬜'} 找到陡坡`, 215, 432, { size: 14 });
      }
      api.loop(render);
      api.slider('水位', 0, 1000, 100, 0, v => {
        level = v;
        if (v > maxLevel) {
          maxLevel = v;
          Sci.sfx('tick');
          if (v >= 900) api.note('等高线都画好啦！看看地图：哪一边的线挤在一起？点一下那一边。');
          else api.note(`水涨到了 ${v} 米，沿着水边画出了 ${v} 米的等高线。`);
        }
      }, v => v + ' 米');
      api.note('👆 拖动“水位”滑块，让水一点点涨起来。');
    },
  });

  /* ================= 9. 海风和陆风 ================= */
  Sci.register({
    id: 'breeze',
    subject: 'geography',
    level: 4,
    emoji: '🌬️',
    title: '海风和陆风',
    desc: '风是怎么形成的？海边的风为什么白天晚上不一样？',
    intro: '在海边玩的时候，你有没有发现：白天风从海上吹来，晚上风却从陆地吹向大海？这是因为陆地和海水“变热、变冷”的快慢不一样。切换白天和夜晚，看看两边的温度和空气是怎么流动的，然后判断风往哪边吹。',
    goal: '判断出白天和夜晚的风向',
    fact: '<p>同样被太阳晒，<b>陆地升温快、降温也快</b>；<b>海水升温慢、降温也慢</b>。</p><p>白天，陆地比海面热，陆地上的热空气变轻往上升，海面上比较凉的空气就流过来补充，形成从海上吹向陆地的<b>海风</b>。晚上正好反过来，陆地凉得快，形成从陆地吹向海上的<b>陆风</b>。</p><p>这说明：<b>冷热不均，空气流动，就形成了风</b>。规模大的“季风”也是这个道理：夏天风从海洋吹向大陆，带来很多雨。</p>',
    quiz: [
      { q: '白天在海边，风通常从哪里吹来？', options: ['从海上吹向陆地', '从陆地吹向海上'], answer: 0, explain: '白天陆地热，空气上升，海上的冷空气流过来。' },
      { q: '风是怎么形成的？', options: ['冷热不均，空气流动形成的', '树叶摇动扇出来的'], answer: 0, explain: '温度不同造成空气流动，就有了风。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const SURF = 340, L = 150, Rr = 650, T = 150, B = 320;
      let day = true, land = 24, sea = 23, t = 0;
      const answered = new Set();
      const parts = [];
      for (let i = 0; i < 40; i++) parts.push(i / 40);
      const per = 2 * (Rr - L) + 2 * (B - T);
      // 沿着一圈走：s 从下边开始，0→1
      function at(s) {
        let d = ((s % 1) + 1) % 1 * per;
        const w = Rr - L, h = B - T;
        if (d < w) return [L + d, B];
        d -= w;
        if (d < h) return [Rr, B - d];
        d -= h;
        if (d < w) return [Rr - d, T];
        d -= w;
        return [L, T + d];
      }
      function answer(toLand) {
        const diff = land - sea;
        if (Math.abs(diff) < 2) { api.note('等一等，两边的温度还差不多，风还不明显。'); return; }
        const right = toLand === diff > 0;
        if (right) {
          answered.add(day ? 'day' : 'night');
          Sci.sfx('good');
          api.note((day ? '✅ 对！白天陆地热，热空气上升，海上的凉空气吹向陆地，这是“海风”。' : '✅ 对！晚上陆地凉得快，空气从陆地吹向大海，这是“陆风”。') +
            (answered.size < 2 ? '再切换到' + (day ? '夜晚' : '白天') + '看看。' : ''));
          if (answered.size === 2) api.goalDone();
        } else {
          Sci.sfx('bad');
          api.note('再仔细看看下面贴着地面的小箭头，空气往哪边跑？');
        }
      }
      function render() {
        const sky = ctx.createLinearGradient(0, 0, 0, SURF);
        sky.addColorStop(0, day ? '#74c0fc' : '#1b1f4a');
        sky.addColorStop(1, day ? '#d0ebff' : '#3b4170');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 800, 450);
        D.emoji(ctx, day ? '☀️' : '🌙', 720, 60, 56);
        // 大海和陆地
        ctx.fillStyle = day ? '#339af0' : '#1c3d6e';
        ctx.fillRect(0, SURF, 400, 110);
        ctx.fillStyle = day ? '#c99a63' : '#6b5137';
        ctx.fillRect(400, SURF - 6, 400, 116);
        D.emoji(ctx, '🏠', 600, SURF - 26, 40);
        D.emoji(ctx, '⛵', 180, SURF - 18, 40);
        D.text(ctx, `🌊 海面 ${sea.toFixed(0)}°C`, 200, 400, { size: 20, color: '#fff' });
        D.text(ctx, `🏖️ 陆地 ${land.toFixed(0)}°C`, 600, 400, { size: 20, color: '#fff' });
        // 空气流动
        const diff = land - sea;
        parts.forEach(s => {
          const [x, y] = at(s), [x2, y2] = at(s + Math.sign(diff || 1) * 0.004);
          const a = Math.min(1, Math.abs(diff) / 4);
          if (a < 0.15) { D.circle(ctx, x, y, 3, 'rgba(255,255,255,.5)'); return; }
          D.arrow(ctx, x, y, x + (x2 - x) * 4, y + (y2 - y) * 4, `rgba(255,255,255,${0.4 + 0.5 * a})`, 2, 8);
        });
        if (Math.abs(diff) >= 2) {
          const hotX = diff > 0 ? 600 : 200, coldX = diff > 0 ? 200 : 600;
          D.text(ctx, '热空气上升 ⬆', hotX, 120, { size: 16, color: '#fff' });
          D.text(ctx, '冷空气下沉 ⬇', coldX, 120, { size: 16, color: '#fff' });
          D.text(ctx, diff > 0 ? '风：海 → 陆' : '风：陆 → 海', 400, SURF - 40, { size: 18, color: '#ffe066', stroke: 'rgba(0,0,0,.4)', strokeWidth: 4 });
        }
        D.text(ctx, `${answered.has('day') ? '✅' : '⬜'} 白天的风　${answered.has('night') ? '✅' : '⬜'} 夜晚的风`, 20, 30, { size: 16, align: 'left', color: '#fff' });
      }
      api.loop(dt => {
        t += dt;
        const tl = day ? 32 : 17, ts = day ? 25 : 22;
        land += (tl - land) * dt * 0.5;
        sea += (ts - sea) * dt * 0.12;
        const sp = clamp((land - sea) / 8, -1, 1) * 0.06;
        for (let i = 0; i < parts.length; i++) parts[i] = (parts[i] + sp * dt + 1) % 1;
        render();
      });
      api.choice([[true, '☀️ 白天'], [false, '🌙 夜晚']], day, v => {
        day = v;
        api.note(v ? '太阳出来了，陆地和海面开始变热，看看谁热得快？' : '天黑了，陆地和海面开始变凉，看看谁凉得快？');
      });
      const row2 = api.row();
      api.button('风吹向陆地 🌊→🏠', () => answer(true), row2);
      api.button('风吹向大海 🏠→🌊', () => answer(false), row2);
      api.note('👆 先看一会儿温度怎么变、空气怎么流，再回答风往哪边吹。');
    },
  });

  /* ================= 10. 岩石的旅行 ================= */
  const ROCKS = {
    magma: { name: '岩浆', ex: '地下很热很热的熔化的岩石', x: 220, y: 340 },
    igneous: { name: '岩浆岩', ex: '比如花岗岩、玄武岩', x: 115, y: 195 },
    sediment: { name: '沉积物', ex: '碎石、沙子和泥', x: 400, y: 75 },
    sedimentary: { name: '沉积岩', ex: '比如砂岩、石灰岩，常常有化石', x: 685, y: 195 },
    metamorphic: { name: '变质岩', ex: '比如大理石、板岩', x: 580, y: 340 },
  };
  const PROCESSES = [
    ['cool', '🧊 冷却凝固', ['magma'], 'igneous', '岩浆冷却、凝固，变成了岩浆岩。'],
    ['weather', '🌧️ 风化侵蚀', ['igneous', 'sedimentary', 'metamorphic'], 'sediment', '风吹、日晒、雨淋、流水冲刷，岩石碎成了沙子和泥，被冲到低处堆起来。'],
    ['compact', '🗜️ 压实胶结', ['sediment'], 'sedimentary', '沉积物一层层堆积，被压得紧紧的，经过很久很久，变成了沉积岩。'],
    ['press', '🔥 高温高压', ['igneous', 'sedimentary'], 'metamorphic', '岩石被埋到地下深处，又热又挤，变成了变质岩。石灰岩就是这样变成大理石的！'],
    ['melt', '🌋 熔化', ['igneous', 'sedimentary', 'metamorphic'], 'magma', '岩石到了地下更深、更热的地方，熔化成了岩浆。'],
  ];

  Sci.register({
    id: 'rockcycle',
    subject: 'geography',
    level: 5,
    emoji: '💎',
    title: '岩石的旅行',
    desc: '岩浆岩、沉积岩、变质岩，岩石也会变身',
    intro: '岩石看起来永远不会变，其实它们一直在慢慢地“旅行”和“变身”，只是每一步都要成千上万年！从地下的岩浆出发，选择不同的变化，让岩石变成三大类岩石，最后再回到岩浆，完成一次岩石的大循环。',
    goal: '让岩石经过全部 5 种状态，变出三大类岩石',
    fact: '<p>岩石分为三大类：</p><p><b>岩浆岩</b>：岩浆冷却凝固形成，比如花岗岩。</p><p><b>沉积岩</b>：碎石、泥沙一层层堆积、压实形成，常常能看到一层一层的纹路，<b>化石</b>大多藏在沉积岩里。</p><p><b>变质岩</b>：原来的岩石在高温高压下“变了质”，比如石灰岩变成大理石。</p><p>三种岩石还能互相转化：风化变成沉积物，熔化又变回岩浆……这叫做<b>岩石循环</b>，已经在地球上进行了几十亿年。</p>',
    quiz: [
      { q: '化石最常在哪种岩石里找到？', options: ['沉积岩', '岩浆岩'], answer: 0, explain: '动植物遗体被泥沙埋起来，跟着沉积岩一起形成。' },
      { q: '大理石是石灰岩经过什么变成的？', options: ['高温高压', '风吹日晒'], answer: 0, explain: '高温高压让石灰岩变成了变质岩——大理石。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let cur = 'magma', move = null, t = 0;
      const visited = new Set(['magma']);
      const ARROWS = [['magma', 'igneous'], ['igneous', 'sediment'], ['sediment', 'sedimentary'], ['sedimentary', 'metamorphic'], ['metamorphic', 'magma']];

      function apply(pr) {
        if (move) return;
        const [, label, from, to, msg] = pr;
        if (from.indexOf(cur) < 0) {
          Sci.sfx('bad');
          api.note(`${ROCKS[cur].name}不能直接“${label.split(' ')[1]}”哦。想一想，${ROCKS[cur].name}能发生什么变化？`);
          return;
        }
        move = { from: cur, to, k: 0, label };
        Sci.sfx('whoosh');
        api.note(`${label.split(' ')[0]} ${msg}`);
      }
      function icon(id, x, y, r) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.clip();
        if (id === 'magma') {
          const g = ctx.createRadialGradient(x, y, 4, x, y, r);
          g.addColorStop(0, '#fff3bf');
          g.addColorStop(0.5, '#ff922b');
          g.addColorStop(1, '#c92a2a');
          ctx.fillStyle = g;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        } else if (id === 'igneous') {
          ctx.fillStyle = '#adb5bd';
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
          for (let i = 0; i < 30; i++) D.circle(ctx, x - r + (i * 23) % (r * 2), y - r + (i * 37) % (r * 2), 3, i % 3 ? '#343a40' : '#faa2c1');
        } else if (id === 'sediment') {
          ctx.fillStyle = '#e9d8a6';
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
          for (let i = 0; i < 18; i++) D.circle(ctx, x - r + (i * 29) % (r * 2), y - r / 3 + (i * 13) % r, 4 + (i % 3) * 2, '#b08968');
        } else if (id === 'sedimentary') {
          ['#ddb892', '#b08968', '#e6ccb2', '#9c6644', '#ddb892'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(x - r, y - r + i * r * 0.4, r * 2, r * 0.4); });
          D.text(ctx, '🐚', x + 8, y + 6, { size: 16 });
        } else {
          ctx.fillStyle = '#f8f9fa';
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
          ctx.strokeStyle = '#868e96';
          ctx.lineWidth = 2;
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(x - r, y - r + i * 18);
            ctx.bezierCurveTo(x - 10, y - r + i * 18 + 20, x + 10, y - r + i * 18 - 10, x + r, y - r + i * 18 + 14);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
      function render() {
        ctx.fillStyle = '#fff9f0';
        ctx.fillRect(0, 0, 800, 450);
        ARROWS.forEach(([a, b]) => {
          const A = ROCKS[a], B = ROCKS[b], ang = Math.atan2(B.y - A.y, B.x - A.x);
          D.arrow(ctx, A.x + Math.cos(ang) * 55, A.y + Math.sin(ang) * 55, B.x - Math.cos(ang) * 55, B.y - Math.sin(ang) * 55, '#ced4da', 4, 14);
        });
        Object.keys(ROCKS).forEach(id => {
          const r = ROCKS[id];
          if (id === cur && !move) D.circle(ctx, r.x, r.y, 52 + Math.sin(t * 4) * 3, 'rgba(255,212,59,.45)');
          icon(id, r.x, r.y, 42);
          D.circle(ctx, r.x, r.y, 42, null, visited.has(id) ? '#2f9e44' : '#adb5bd', 3);
          D.text(ctx, (visited.has(id) ? '✅ ' : '') + r.name, r.x, r.y + 60, { size: 17 });
          D.text(ctx, r.ex, r.x, r.y + 80, { size: 12, color: '#6f6a85', weight: 'normal', maxW: 170 });
        });
        if (move) {
          const A = ROCKS[move.from], B = ROCKS[move.to], e = Sci.smooth(0, 1, move.k);
          const x = lerp(A.x, B.x, e), y = lerp(A.y, B.y, e);
          icon(move.k < 0.5 ? move.from : move.to, x, y, 22);
          D.circle(ctx, x, y, 22, null, '#fab005', 3);
          D.text(ctx, move.label.split(' ')[0], x + 30, y - 24, { size: 22 });
        }
        D.text(ctx, '几百万年', 400, 225, { size: 15, color: '#adb5bd' });
        D.text(ctx, '每一步都要很久很久', 400, 248, { size: 13, color: '#adb5bd', weight: 'normal' });
        D.text(ctx, `现在：${ROCKS[cur].name}`, 790, 24, { size: 16, align: 'right', color: '#c0620a' });
      }
      api.loop(dt => {
        t += dt;
        if (move) {
          move.k += dt / 1.6;
          if (move.k >= 1) {
            cur = move.to;
            move = null;
            const first = !visited.has(cur);
            visited.add(cur);
            Sci.sfx(first ? 'good' : 'pop');
            if (visited.size === 5) api.timeout(() => {
              api.note('🎉 岩石走完了一次大循环！岩浆岩、沉积岩、变质岩都出现过，它们可以一直互相转化。');
              api.goalDone();
            }, 1200);
          }
        }
        render();
      });
      PROCESSES.forEach(pr => api.button(pr[1], () => apply(pr)));
      api.note('👆 岩石现在是地下的岩浆。选一种变化，让它变身吧！');
    },
  });
})();
