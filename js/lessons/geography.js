/* 地理探秘：认识方向 → 水循环 → 比例尺 → 板块运动 → 经纬度与时区 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 1. 认识方向 ================= */
  const PLACES = {
    home: { e: '🏠', name: '家', c: 2, r: 3 },
    school: { e: '🏫', name: '学校', c: 7, r: 1 },
    shop: { e: '🏪', name: '超市', c: 1, r: 0 },
    park: { e: '🎡', name: '游乐园', c: 8, r: 4 },
    hospital: { e: '🏥', name: '医院', c: 5, r: 5 },
    library: { e: '📚', name: '图书馆', c: 4, r: 0 },
  };
  const MISSIONS = ['school', 'shop', 'park', 'hospital', 'library'];
  function dirName(dx, dy) {
    const ew = dx > 0 ? '东' : dx < 0 ? '西' : '';
    const ns = dy < 0 ? '北' : dy > 0 ? '南' : '';
    return ew + ns || '同一个地方';
  }

  Sci.register({
    id: 'direction',
    subject: 'geography',
    level: 1,
    emoji: '🧭',
    title: '认识方向',
    desc: '东南西北，带小狗去找地方',
    intro: '看地图的时候，有一个小秘诀：上北、下南、左西、右东！早上太阳从东边升起。今天请你当小狗的导航员，用“向东、向西、向南、向北”的按钮，带它去地图上的各个地方吧。',
    goal: '带小狗到达 3 个地方',
    fact: '<p>地图上通常是<b>上北、下南、左西、右东</b>。在东和北中间的方向叫<b>东北</b>，同样还有东南、西北、西南，一共 <b>8 个方向</b>。</p><p>在户外怎么找方向？早上面对太阳，<b>前面是东，后面是西，左边是北，右边是南</b>。指南针的红色指针总是指向北方。</p>',
    quiz: [
      { q: '在一般的地图上，右边是什么方向？', options: ['东', '西', '北'], answer: 0, explain: '上北、下南、左西、右东。' },
      { q: '早上面对太阳站好，你的背后是哪个方向？', options: ['西', '东', '南'], answer: 0, explain: '太阳从东边升起，背后就是西。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const COLS = 10, ROWS = 6, CELL = 62, X0 = 24, Y0 = 44;
      const dog = { c: PLACES.home.c, r: PLACES.home.r, x: 0, y: 0 };
      let mi = 0, path = [], done = 0;
      const center = (c, r) => [X0 + c * CELL + CELL / 2, Y0 + r * CELL + CELL / 2];
      [dog.x, dog.y] = center(dog.c, dog.r);

      function routeText() {
        const parts = [];
        path.forEach(d => {
          const last = parts[parts.length - 1];
          if (last && last[0] === d) last[1]++;
          else parts.push([d, 1]);
        });
        return parts.map(([d, n]) => `向${d}走 ${n} 格`).join('，');
      }
      function startMission() {
        path = [];
        const P = PLACES[MISSIONS[mi]];
        api.note(`🎯 任务：带小狗去 ${P.e}${P.name}！用下面的方向按钮（或键盘方向键）。`);
      }
      function move(dir) {
        const d = { 北: [0, -1], 南: [0, 1], 西: [-1, 0], 东: [1, 0] }[dir];
        const nc = dog.c + d[0], nr = dog.r + d[1];
        if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) {
          api.note(`再往${dir}就走出地图啦！`);
          Sci.sfx('bad');
          return;
        }
        dog.c = nc;
        dog.r = nr;
        path.push(dir);
        Sci.sfx('pop');
        const P = PLACES[MISSIONS[mi]];
        if (dog.c === P.c && dog.r === P.r) {
          done++;
          Sci.sfx('star');
          const H = PLACES.home;
          api.note(`🎉 到啦！你的路线：${routeText()}。${P.e}${P.name}在🏠家的${dirName(P.c - H.c, P.r - H.r)}方向。`);
          if (done === 3) api.goalDone();
          mi = (mi + 1) % MISSIONS.length;
          api.timeout(startMission, 3200);
        }
      }

      api.pointer(st, {
        down(p) {
          const c = Math.floor((p.x - X0) / CELL), r = Math.floor((p.y - Y0) / CELL);
          const dc = c - dog.c, dr = r - dog.r;
          if (Math.abs(dc) + Math.abs(dr) !== 1) return;
          move(dc === 1 ? '东' : dc === -1 ? '西' : dr === 1 ? '南' : '北');
        },
      });
      api.on(window, 'keydown', e => {
        const k = { ArrowUp: '北', ArrowDown: '南', ArrowLeft: '西', ArrowRight: '东' }[e.key];
        if (k) { e.preventDefault(); move(k); }
      });

      api.loop(dt => {
        const [tx, ty] = center(dog.c, dog.r);
        dog.x += (tx - dog.x) * Math.min(1, dt * 12);
        dog.y += (ty - dog.y) * Math.min(1, dt * 12);
        ctx.fillStyle = '#e8f6dc';
        ctx.fillRect(0, 0, 800, 450);
        // 小路网格
        for (let c = 0; c < COLS; c++) {
          for (let r = 0; r < ROWS; r++) {
            D.rrect(ctx, X0 + c * CELL + 3, Y0 + r * CELL + 3, CELL - 6, CELL - 6, 10);
            ctx.fillStyle = (c + r) % 2 ? '#f6fbef' : '#eef8e4';
            ctx.fill();
          }
        }
        // 小河
        ctx.strokeStyle = 'rgba(90,170,240,.55)';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(X0 + 3 * CELL + 10, Y0);
        ctx.quadraticCurveTo(X0 + 5.5 * CELL, Y0 + 3 * CELL, X0 + 3.4 * CELL, Y0 + ROWS * CELL);
        ctx.stroke();
        const target = PLACES[MISSIONS[mi]];
        Object.values(PLACES).forEach(P => {
          const [x, y] = center(P.c, P.r);
          if (P === target) D.circle(ctx, x, y, 28 + Math.sin(performance.now() / 200) * 3, 'rgba(255,200,40,.45)');
          D.emoji(ctx, P.e, x, y - 4, 32);
          D.text(ctx, P.name, x, y + 22, { size: 12, color: '#3a5a2a' });
        });
        D.emoji(ctx, '🐕', dog.x, dog.y - 2, 34);
        // 指南针
        const cx = 718, cy = 120;
        D.circle(ctx, cx, cy, 58, '#fff', '#0e9384', 4);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.moveTo(cx, cy - 44); ctx.lineTo(cx - 9, cy); ctx.lineTo(cx + 9, cy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#9aa3b5';
        ctx.beginPath(); ctx.moveTo(cx, cy + 44); ctx.lineTo(cx - 9, cy); ctx.lineTo(cx + 9, cy); ctx.closePath(); ctx.fill();
        D.text(ctx, '北', cx, cy - 74, { size: 20, color: '#ef4444' });
        D.text(ctx, '南', cx, cy + 74, { size: 18 });
        D.text(ctx, '西', cx - 74, cy, { size: 18 });
        D.text(ctx, '东', cx + 74, cy, { size: 18 });
        D.text(ctx, '上北 下南', 718, 232, { size: 15, color: '#0e9384' });
        D.text(ctx, '左西 右东', 718, 254, { size: 15, color: '#0e9384' });
        D.emoji(ctx, '🌅', 742, 330, 34);
        D.text(ctx, '太阳从东边升起', 718, 362, { size: 13, color: '#6f6a85', weight: 'normal' });
        D.text(ctx, `🎯 去${target.name}`, 718, 410, { size: 17, color: '#b45309' });
      });

      const row = api.row();
      api.button('⬆️ 向北', () => move('北'), row);
      api.button('⬇️ 向南', () => move('南'), row);
      api.button('⬅️ 向西', () => move('西'), row);
      api.button('➡️ 向东', () => move('东'), row);
      api.button('🏠 回家', () => { dog.c = PLACES.home.c; dog.r = PLACES.home.r; path = []; }, api.row());
      startMission();
    },
  });

  /* ================= 2. 水循环之旅 ================= */
  const RIVER = [[600, 196], [572, 236], [536, 272], [486, 296], [436, 312], [384, 324]];
  const STAGE_TIPS = {
    sea: '小水滴在大海里游泳，等着太阳来晒它……',
    vapor: '☀️ 太阳把海水晒热，小水滴变成看不见的水蒸气，飞上了天——这叫“蒸发”。',
    cloud: '☁️ 高空很冷，水蒸气又变回小小的水珠，许多水珠聚在一起就成了云——这叫“凝结”。',
    rain: '🌧️ 云被风吹到山上，水珠越聚越大，云托不住就掉下来了——这叫“降水”。',
    river: '🏞️ 雨水落到山上，汇成小溪和河流，一路流回大海——这叫“径流”。还有一些渗到地下变成地下水。',
  };

  Sci.register({
    id: 'watercycle',
    subject: 'geography',
    level: 2,
    emoji: '🌧️',
    title: '水循环之旅',
    desc: '跟着一颗小水滴，从大海到天空再回来',
    intro: '天上的雨是从哪里来的？下到地上的雨又去了哪里？跟着这颗戴着笑脸的小水滴去旅行吧！你可以调节太阳的强弱，还可以让风把云吹到山上。看看小水滴能不能回到大海？',
    goal: '陪小水滴完成一次完整的旅行（大海 → 天空 → 山上 → 大海）',
    fact: '<p>地球上的水一直在旅行：<b>蒸发</b>（海水变成水蒸气升空）→ <b>凝结</b>（水蒸气遇冷变成云）→ <b>降水</b>（下雨、下雪）→ <b>径流</b>（河流把水带回大海），这叫<b>水循环</b>。</p><p>推动水循环的“发动机”是<b>太阳</b>。你今天喝的水，说不定恐龙也喝过呢！</p><p>💧 地球上的水 97% 是海水，能直接用的淡水非常少，所以要节约用水。</p>',
    quiz: [
      { q: '太阳把海水晒热，水变成水蒸气升上天空，这叫？', options: ['蒸发', '降水', '径流'], answer: 0, explain: '蒸发是水循环的第一步。' },
      { q: '推动水循环不停转动的“发动机”是？', options: ['太阳', '月亮', '风车'], answer: 0, explain: '太阳的热量让水蒸发，水循环才能一直进行。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const SEA = 322;
      let sun = 0.6, wind = true, t = 0, cycles = 0;
      let cloud = { x: 190, y: 105, water: 0, alpha: 1 };
      const vapors = [], rains = [], flows = [];
      const hero = { stage: 'sea', x: 200, y: SEA + 22, timer: 0, k: 0 };
      const ground = x => (x < 370 ? 999 : 332 - 190 * Math.exp(-(((x - 640) / 115) ** 2)));

      function setStage(s) {
        hero.stage = s;
        hero.timer = 0;
        api.note(STAGE_TIPS[s]);
        Sci.sfx(s === 'sea' ? 'good' : 'pop');
      }
      function riverPoint(k) {
        const segs = RIVER.length - 1, i = Math.min(segs - 1, Math.floor(k * segs)), f = k * segs - i;
        return [lerp(RIVER[i][0], RIVER[i + 1][0], f), lerp(RIVER[i][1], RIVER[i + 1][1], f)];
      }

      function step(dt) {
        t += dt;
        // 蒸发出的水蒸气
        if (Math.random() < sun * 5 * dt) vapors.push({ x: rand(30, 350), y: SEA, vy: -rand(40, 70) });
        for (let i = vapors.length - 1; i >= 0; i--) {
          const v = vapors[i];
          v.y += v.vy * dt;
          v.x += Math.sin(v.y * 0.05) * 10 * dt;
          if (v.y < cloud.y + 25) { vapors.splice(i, 1); cloud.water += 1; }
        }
        // 云：有风就往山上飘，攒够了水就下雨
        if (cloud.x > 590 && cloud.water > 12) cloud.rain = true;
        const raining = !!cloud.rain;
        if (wind && cloud.x < 640) cloud.x += 28 * dt;
        if (raining) {
          cloud.water -= 9 * dt;
          if (Math.random() < 0.9) rains.push({ x: cloud.x + rand(-55, 55), y: cloud.y + 30 });
          // 雨下完了，海上再长出一朵新云
          if (cloud.water < 2 && hero.stage !== 'cloud') { cloud = { x: 190, y: 105, water: 0, alpha: 0 }; }
        }
        cloud.alpha = Math.min(1, cloud.alpha + dt);
        for (let i = rains.length - 1; i >= 0; i--) {
          const r = rains[i];
          r.y += 320 * dt;
          if (r.y >= ground(r.x)) { rains.splice(i, 1); if (Math.random() < 0.3) flows.push({ k: 0 }); }
        }
        for (let i = flows.length - 1; i >= 0; i--) {
          flows[i].k += dt * 0.3;
          if (flows[i].k >= 1) flows.splice(i, 1);
        }
        // 主角小水滴
        hero.timer += dt;
        if (hero.stage === 'sea') {
          hero.x = 200 + Math.sin(t) * 20;
          hero.y = SEA + 22 + Math.sin(t * 2) * 4;
          if (hero.timer > 2.5 && sun > 0.15) setStage('vapor');
        } else if (hero.stage === 'vapor') {
          const sp = 30 + sun * 60;
          const dx = cloud.x - hero.x, dy = cloud.y - hero.y, d = Math.hypot(dx, dy);
          hero.x += dx / d * sp * dt;
          hero.y += dy / d * sp * dt;
          if (d < 20) setStage('cloud');
        } else if (hero.stage === 'cloud') {
          hero.x = cloud.x;
          hero.y = cloud.y + 8;
          if (raining) setStage('rain');
          else if (!wind && hero.timer > 3 && hero.timer < 3.1) api.note('云停在海上不动了……打开“刮风”，把云吹到山上吧！');
        } else if (hero.stage === 'rain') {
          hero.y += 220 * dt;
          if (hero.y >= ground(hero.x) - 6) { hero.k = 0; setStage('river'); }
        } else if (hero.stage === 'river') {
          hero.k += dt * 0.18;
          [hero.x, hero.y] = riverPoint(Math.min(1, hero.k));
          hero.y -= 6;
          if (hero.k >= 1) {
            cycles++;
            setStage('sea');
            api.note(`🎉 小水滴回到大海啦！它完成了第 ${cycles} 次旅行。这就是水循环！`);
            api.goalDone();
          }
        }
      }

      function drawCloud(x, y, w, a) {
        const g = clamp(1 - w / 40, 0.45, 1);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = `rgb(${Math.round(255 * g)},${Math.round(255 * g)},${Math.round(262 * g > 255 ? 255 : 262 * g)})`;
        const s = 0.8 + Math.min(1, w / 25) * 0.6;
        [[-40, 8, 28], [-12, -8, 36], [22, -2, 32], [48, 10, 24], [5, 14, 30]].forEach(([dx, dy, r]) => {
          ctx.beginPath();
          ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }
      function render() {
        const sky = ctx.createLinearGradient(0, 0, 0, 330);
        sky.addColorStop(0, '#86c8f5');
        sky.addColorStop(1, '#e3f4ff');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 800, 450);
        // 太阳
        const sr = 26 + sun * 22;
        D.circle(ctx, 70, 64, sr + 14, `rgba(255,210,60,${0.15 + sun * 0.25})`);
        D.circle(ctx, 70, 64, sr, '#ffd23f');
        // 山和陆地
        ctx.beginPath();
        ctx.moveTo(370, 450);
        for (let x = 370; x <= 800; x += 6) ctx.lineTo(x, ground(x));
        ctx.lineTo(800, 450);
        ctx.closePath();
        ctx.fillStyle = '#7cb85a';
        ctx.fill();
        ctx.beginPath();
        for (let x = 580; x <= 700; x += 4) ctx.lineTo(x, Math.min(ground(x), 182));
        ctx.closePath();
        ctx.fillStyle = '#fff';
        ctx.fill();
        // 河
        ctx.strokeStyle = '#4aa3ea';
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        RIVER.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.stroke();
        flows.forEach(f => { const [x, y] = riverPoint(f.k); D.circle(ctx, x, y, 3, '#d8f0ff'); });
        // 海
        ctx.beginPath();
        ctx.moveTo(0, 450);
        for (let x = 0; x <= 395; x += 8) ctx.lineTo(x, SEA + Math.sin(x * 0.05 + t * 2) * 3);
        ctx.lineTo(395, 450);
        ctx.closePath();
        const sea = ctx.createLinearGradient(0, SEA, 0, 450);
        sea.addColorStop(0, '#3a9ad9');
        sea.addColorStop(1, '#155a8a');
        ctx.fillStyle = sea;
        ctx.fill();
        vapors.forEach(v => D.circle(ctx, v.x, v.y, 3, 'rgba(255,255,255,.75)'));
        drawCloud(cloud.x, cloud.y, cloud.water, cloud.alpha);
        ctx.strokeStyle = '#3a8fd9';
        ctx.lineWidth = 2;
        rains.forEach(r => { ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - 2, r.y + 9); ctx.stroke(); });
        // 小水滴主角
        const vap = hero.stage === 'vapor';
        D.emoji(ctx, '💧', hero.x, hero.y, 30, vap ? 0.55 : 1);
        if (vap) D.text(ctx, '我变成水蒸气啦', hero.x, hero.y - 26, { size: 13, color: '#4a6a8a', stroke: '#fff', strokeWidth: 4 });
        // 阶段标签
        const L = [['蒸发 ⬆', 150, 240, 'vapor'], ['凝结', cloud.x, 52, 'cloud'], ['降水', 720, 150, 'rain'], ['径流 ⬅', 470, 345, 'river']];
        L.forEach(([s, x, y, k]) => {
          const on = hero.stage === k;
          D.text(ctx, s, x, y, { size: on ? 22 : 16, color: on ? '#0e9384' : 'rgba(40,60,90,.55)', stroke: 'rgba(255,255,255,.8)', strokeWidth: 4 });
        });
        D.text(ctx, `完成旅行：${cycles} 次`, 790, 24, { size: 15, align: 'right', color: '#2b4a6a' });
      }

      api.loop(dt => { step(dt); render(); });
      api.slider('☀️ 阳光', 0, 1, 0.05, sun, v => { sun = v; }, v => (v < 0.2 ? '很弱' : v < 0.6 ? '一般' : '很强'));
      api.toggle('🌬️ 刮风', wind, v => { wind = v; });
      api.note(STAGE_TIPS.sea);
    },
  });

  /* ================= 3. 地图与比例尺 ================= */
  const TOWN = {
    home: { e: '🏠', name: '家', x: 120, y: 320 },
    school: { e: '🏫', name: '学校', x: 280, y: 200 },
    park: { e: '🎡', name: '公园', x: 520, y: 200 },
    library: { e: '📚', name: '图书馆', x: 520, y: 360 },
    station: { e: '🚉', name: '火车站', x: 600, y: 320 },
    hospital: { e: '🏥', name: '医院', x: 680, y: 80 },
  };
  const SCALE_MISSIONS = [['home', 'school'], ['school', 'park'], ['home', 'station'], ['park', 'library'], ['park', 'hospital']];
  const SCALES = [[500, '1 : 50 000（图上 1 厘米 = 500 米）'], [1000, '1 : 100 000（图上 1 厘米 = 1 千米）'], [2000, '1 : 200 000（图上 1 厘米 = 2 千米）']];
  const fmtM = m => (m >= 1000 ? `${+(m / 1000).toFixed(2)} 千米` : `${Math.round(m)} 米`);

  Sci.register({
    id: 'mapscale',
    subject: 'geography',
    level: 3,
    emoji: '📏',
    title: '地图与比例尺',
    desc: '用尺子量地图，算出真实距离',
    intro: '地图是把大地“缩小”画在纸上的。缩小了多少倍？就看比例尺！这张小镇地图上，每一小格是图上的 1 厘米。用手指从一个地方拖到另一个地方，就像用尺子量一样，再用比例尺算出它们真正相距多远。',
    goal: '完成 3 个测量任务',
    fact: '<p><b>比例尺 = 图上距离 ÷ 实际距离</b>。比如 1:100 000 表示图上 1 厘米代表实际 100 000 厘米，也就是 <b>1 千米</b>。</p><p>算实际距离：<b>实际距离 = 图上距离 ÷ 比例尺</b>。图上 5 厘米、比例尺 1:100 000，实际就是 5 千米。</p><p>同一块地方，比例尺越大（比如 1:50 000），画出来的地图越大、越详细；比例尺越小（比如 1:200 000），地图上能装下的范围越大。</p>',
    quiz: [
      { q: '比例尺 1:100 000 表示图上 1 厘米代表实际多远？', options: ['1 千米', '100 米', '10 千米'], answer: 0, explain: '100 000 厘米 = 1 000 米 = 1 千米。' },
      { q: '图上距离 3 厘米，比例尺是“1 厘米代表 2 千米”，实际距离是？', options: ['6 千米', '1.5 千米', '5 千米'], answer: 0, explain: '3 × 2 = 6 千米。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const CM = 40;
      let scale = 1000, mi = 0, A = null, B = null, dragging = false;
      const done = new Set();
      const snap = p => {
        for (const k in TOWN) if (Math.hypot(p.x - TOWN[k].x, p.y - TOWN[k].y) < 28) return { x: TOWN[k].x, y: TOWN[k].y, key: k };
        return { x: p.x, y: p.y, key: null };
      };
      function check() {
        if (!A || !B) return;
        const cm = Math.hypot(B.x - A.x, B.y - A.y) / CM;
        const r = +cm.toFixed(1);
        const [a, b] = SCALE_MISSIONS[mi];
        const hit = (A.key === a && B.key === b) || (A.key === b && B.key === a);
        if (hit) {
          done.add(mi);
          Sci.sfx('star');
          api.note(`✅ 量对了！${TOWN[a].name}到${TOWN[b].name}：图上 ${r} 厘米 × ${fmtM(scale)} = 实际 ${fmtM(r * scale)}。` + (done.size >= 3 ? '' : '点“下一题”继续。'));
          if (done.size >= 3) api.goalDone();
        } else if (A.key && B.key && A.key !== B.key) {
          api.note(`你量的是${TOWN[A.key].name}到${TOWN[B.key].name}：图上 ${r} 厘米，实际 ${fmtM(r * scale)}。任务要量的是${TOWN[a].name}到${TOWN[b].name}哦。`);
        } else {
          api.note(`图上 ${r} 厘米，实际约 ${fmtM(r * scale)}。把两头都拖到地点上，会自动吸住。`);
        }
      }
      api.pointer(st, {
        down(p) { A = snap(p); B = { ...A }; dragging = true; },
        move(p, active) { if (active && dragging) B = snap(p); },
        up() { dragging = false; check(); },
      });

      function render() {
        ctx.fillStyle = '#fbf7ec';
        ctx.fillRect(0, 0, 800, 450);
        ctx.strokeStyle = 'rgba(14,147,132,.12)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= 800; x += CM) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 450); ctx.stroke(); }
        for (let y = 0; y <= 450; y += CM) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke(); }
        // 公园绿地、河流、马路
        D.rrect(ctx, 470, 150, 110, 100, 18);
        ctx.fillStyle = 'rgba(120,200,110,.35)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(80,160,230,.6)';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.moveTo(380, 0);
        ctx.bezierCurveTo(330, 150, 450, 280, 400, 450);
        ctx.stroke();
        ctx.strokeStyle = '#d9cfb8';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        [['home', 'school'], ['school', 'park'], ['park', 'library'], ['library', 'station'], ['park', 'hospital'], ['home', 'library']].forEach(([a, b]) => {
          ctx.beginPath();
          ctx.moveTo(TOWN[a].x, TOWN[a].y);
          ctx.lineTo(TOWN[b].x, TOWN[b].y);
          ctx.stroke();
        });
        const [ma, mb] = SCALE_MISSIONS[mi];
        Object.entries(TOWN).forEach(([k, P]) => {
          if (k === ma || k === mb) D.circle(ctx, P.x, P.y, 26, 'rgba(255,200,40,.5)');
          D.emoji(ctx, P.e, P.x, P.y, 30);
          D.text(ctx, P.name, P.x, P.y + 26, { size: 13, color: '#4a4560', stroke: '#fbf7ec', strokeWidth: 4 });
        });
        // 尺子
        if (A && B && (A.x !== B.x || A.y !== B.y)) {
          const len = Math.hypot(B.x - A.x, B.y - A.y), ang = Math.atan2(B.y - A.y, B.x - A.x);
          ctx.save();
          ctx.translate(A.x, A.y);
          ctx.rotate(ang);
          D.rrect(ctx, 0, -10, len, 20, 4);
          ctx.fillStyle = 'rgba(255,214,90,.85)';
          ctx.fill();
          ctx.strokeStyle = '#b8860b';
          ctx.lineWidth = 1.5;
          for (let d = 0; d <= len; d += CM / 10) {
            const big = Math.abs(d % CM) < 0.01 || Math.abs(d % CM - CM) < 0.01;
            ctx.beginPath();
            ctx.moveTo(d, -10);
            ctx.lineTo(d, big ? 2 : -5);
            ctx.stroke();
          }
          ctx.restore();
          const cm = len / CM;
          D.text(ctx, `图上 ${cm.toFixed(1)} 厘米 → 实际 ${fmtM(+cm.toFixed(1) * scale)}`, (A.x + B.x) / 2, (A.y + B.y) / 2 - 24, { size: 17, color: '#7a4b00', stroke: '#fff', strokeWidth: 5 });
        }
        // 任务和比例尺
        D.rrect(ctx, 12, 12, 300, 54, 14);
        ctx.fillStyle = 'rgba(255,255,255,.92)';
        ctx.fill();
        D.text(ctx, `🎯 量一量：${TOWN[ma].e}${TOWN[ma].name} 到 ${TOWN[mb].e}${TOWN[mb].name}`, 24, 32, { size: 16, align: 'left' });
        D.text(ctx, `已完成 ${done.size} 题${done.has(mi) ? ' · 这题 ✅' : ''}`, 24, 54, { size: 13, align: 'left', color: '#6f6a85', weight: 'normal' });
        const bx = 24, by = 420;
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = i % 2 ? '#fff' : '#2b2840';
          ctx.fillRect(bx + i * CM, by, CM, 8);
        }
        ctx.strokeStyle = '#2b2840';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, CM * 4, 8);
        for (let i = 0; i <= 4; i++) D.text(ctx, i === 0 ? '0' : fmtM(i * scale).replace(' ', ''), bx + i * CM, by - 10, { size: 11, color: '#2b2840' });
        D.text(ctx, '每一小格 = 图上 1 厘米', 790, 438, { size: 12, align: 'right', color: '#0e9384', weight: 'normal' });
      }
      api.loop(render);

      api.choice(SCALES.map(([v, s]) => [v, s]), scale, v => { scale = v; check(); });
      const row = api.row();
      api.button('🎯 下一题', () => { mi = (mi + 1) % SCALE_MISSIONS.length; A = B = null; api.note('新任务出现在地图左上角。'); }, row);
      api.button('🧹 收起尺子', () => { A = B = null; }, row);
      api.note('👆 从一个地点按住，拖到另一个地点松手，就能量出图上距离。');
    },
  });

  /* ================= 4. 板块运动：山脉、裂谷、火山和地震 ================= */
  const PLATE_MODES = {
    collide: { label: '🏔️ 相撞', left: '印度板块', right: '亚欧板块', tip: '两个大陆板块迎面相撞，谁也不让谁，地面被挤得越拱越高……' },
    apart: { label: '🌊 分开', left: '非洲板块', right: '阿拉伯板块', tip: '两个板块往两边拉开，中间裂开一道大口子，岩浆从下面冒上来……' },
    subduct: { label: '🌋 俯冲', left: '太平洋板块（海洋）', right: '大陆板块', tip: '又薄又重的海洋板块钻到了大陆板块下面，岩石熔化成岩浆……' },
  };

  Sci.register({
    id: 'plates',
    subject: 'geography',
    level: 4,
    emoji: '🌋',
    title: '板块运动',
    desc: '高山、大裂谷、火山和地震是怎么来的',
    intro: '地球的外壳不是一整块，而是像碎掉的蛋壳一样，分成了很多块“板块”。它们漂在又热又软的地幔上，每年只移动几厘米，可是过了几百万年，就能造出高山和大海！选一种板块运动方式，点“开始移动”，看看会发生什么。',
    goal: '试过三种板块运动，并经历一次地震',
    fact: '<p>地球表面分成了六大板块和许多小板块。板块<b>相撞</b>会挤出高山（喜马拉雅山就是印度板块撞上亚欧板块形成的，现在还在长高）；板块<b>分开</b>会形成裂谷和新的海洋（东非大裂谷、红海）；海洋板块<b>俯冲</b>到大陆板块下面，会形成海沟和火山（日本、安第斯山脉）。</p><p>板块边界的岩石被慢慢挤压，憋到受不了时突然断裂，就发生了<b>地震</b>。所以地震和火山多分布在板块交界的地方。</p><p>🛡️ 地震时：在室内就近躲到结实的桌子下，护住头部；不要乘电梯；到了室外要远离高楼和电线杆。</p>',
    quiz: [
      { q: '喜马拉雅山是怎么形成的？', options: ['两个板块相互挤压，把地面拱起来', '人们一点点堆起来的', '火山喷发堆出来的'], answer: 0, explain: '印度板块和亚欧板块相撞，把地面挤成了世界最高的山。' },
      { q: '在教室里遇到地震，应该怎么做？', options: ['躲到课桌下，护住头部', '马上坐电梯下楼'], answer: 0, explain: '地震时千万不要乘电梯。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const TOP = 170, BOT = 262;
      let mode = 'collide', moving = false, t = 0, myr = 0, stress = 0, shake = 0, quakes = 0;
      const S = { collide: 0, apart: 0, subduct: 0 }; // 每种模式已经进行了多久
      const tried = new Set();
      const seismo = new Array(95).fill(0);
      const lava = [];
      const gauss = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));

      function quake() {
        quakes++;
        shake = 1.2;
        stress = 0;
        Sci.sfx('bad');
        Sci.tone(70, 0.6, { type: 'sawtooth', vol: 0.08, to: 40 });
        const msg = { collide: '💥 地震！两块大陆挤得太厉害，岩石突然断裂。', apart: '💥 地震！地面裂开时，岩石发生了断裂。', subduct: '💥 地震！还引发了火山喷发！' }[mode];
        api.note(msg + ' 地震多发生在板块交界处。');
        if (mode === 'subduct') {
          const craterY = TOP - 20 - Math.min(120, S.subduct * 16);
          for (let i = 0; i < 40; i++) lava.push({ x: 580, y: craterY, vx: rand(-90, 90), vy: -rand(150, 320), life: 1.6 });
        }
        checkGoal();
      }
      function checkGoal() {
        if (tried.size === 3 && quakes >= 1) api.goalDone();
      }

      function drawMantle() {
        const g = ctx.createLinearGradient(0, BOT, 0, 450);
        g.addColorStop(0, '#f2994a');
        g.addColorStop(1, '#c0392b');
        ctx.fillStyle = g;
        ctx.fillRect(0, 230, 800, 220);
        ctx.strokeStyle = 'rgba(255,240,200,.35)';
        ctx.lineWidth = 3;
        [[220, 360], [580, 360]].forEach(([cx, cy], i) => {
          const dir = i ? 1 : -1;
          for (let k = 0; k < 3; k++) {
            const a0 = t * 0.6 * dir + k * 2.1;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 150, 60, 0, a0, a0 + 1.2);
            ctx.stroke();
          }
        });
        D.text(ctx, '地幔（又热又软，慢慢流动）', 400, 430, { size: 14, color: '#fff3e0' });
      }
      function strata(x0, x1, topF, botF, color) {
        ctx.beginPath();
        for (let x = x0; x <= x1; x += 4) ctx.lineTo(x, topF(x));
        for (let x = x1; x >= x0; x -= 4) ctx.lineTo(x, botF(x));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(70,40,20,.25)';
        ctx.lineWidth = 2;
        for (let k = 1; k <= 3; k++) {
          ctx.beginPath();
          for (let x = x0; x <= x1; x += 4) {
            const a = topF(x), b = botF(x);
            ctx.lineTo(x, a + (b - a) * k / 4);
          }
          ctx.stroke();
        }
      }

      function renderCollide() {
        const h = Math.min(118, S.collide * 22);
        const top = x => TOP - h * gauss(x, 400, 110);
        const bot = x => BOT + h * 0.55 * gauss(x, 400, 120);
        strata(0, 400, top, bot, '#b98a5a');
        strata(400, 800, top, bot, '#a8794c');
        if (h > 90) {
          ctx.beginPath();
          for (let x = 300; x <= 500; x += 4) ctx.lineTo(x, Math.min(top(x), TOP - h + 40));
          ctx.closePath();
          ctx.fillStyle = '#fff';
          ctx.fill();
        }
        if (h > 80) D.text(ctx, '🏔️ 喜马拉雅山（还在长高！）', 400, TOP - h - 22, { size: 17, color: '#3a2a1a', stroke: '#fff', strokeWidth: 4 });
        D.arrow(ctx, 90, 215, 170, 215, '#fff', 5, 16);
        D.arrow(ctx, 710, 215, 630, 215, '#fff', 5, 16);
      }
      function renderApart() {
        const g = Math.min(240, S.apart * 30);
        const L = 400 - g / 2, R = 400 + g / 2;
        if (g > 40) {
          ctx.fillStyle = '#3a9ad9';
          ctx.fillRect(L, TOP, g, 30);
          D.text(ctx, g > 150 ? '🌊 新的海洋诞生了（像红海）' : '海水灌进来了', 400, TOP + 15, { size: 14, color: '#fff' });
        }
        // 新生的洋壳，越靠中间越新
        for (let x = L; x < R; x += 6) {
          const age = Math.abs(x - 400) / Math.max(1, g / 2);
          ctx.fillStyle = Sci.rgb(Sci.mixColor([210, 70, 40], [70, 70, 90], Math.min(1, age * 1.5)));
          ctx.fillRect(x, TOP + (g > 40 ? 30 : 10), 6, BOT - TOP - 20);
        }
        ctx.fillStyle = '#ff7a1a';
        ctx.beginPath();
        ctx.moveTo(400 - 18, BOT + 10);
        ctx.quadraticCurveTo(400, TOP + 40 - Math.sin(t * 3) * 6, 400 + 18, BOT + 10);
        ctx.fill();
        strata(0, L, x => TOP - 18 * gauss(x, L - 30, 40), () => BOT, '#b98a5a');
        strata(R, 800, x => TOP - 18 * gauss(x, R + 30, 40), () => BOT, '#a8794c');
        if (g > 10 && g <= 150) D.text(ctx, '裂谷（像东非大裂谷）', 400, TOP - 40, { size: 15, color: '#3a2a1a', stroke: '#fff', strokeWidth: 4 });
        D.arrow(ctx, 170, 215, 90, 215, '#fff', 5, 16);
        D.arrow(ctx, 630, 215, 710, 215, '#fff', 5, 16);
      }
      function renderSubduct() {
        const off = (S.subduct * 30) % 40;
        // 海水
        ctx.fillStyle = '#3a9ad9';
        ctx.fillRect(0, TOP, 420, 26);
        // 俯冲下去的海洋板块（一条斜着往下的带子）
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, TOP + 26);
        ctx.lineTo(400, TOP + 26);
        ctx.quadraticCurveTo(470, TOP + 40, 760, 450);
        ctx.lineTo(700, 450);
        ctx.quadraticCurveTo(440, TOP + 90, 380, TOP + 72);
        ctx.lineTo(0, TOP + 72);
        ctx.closePath();
        ctx.fillStyle = '#5b6478';
        ctx.fill();
        ctx.clip();
        ctx.strokeStyle = 'rgba(255,255,255,.15)';
        ctx.lineWidth = 8;
        for (let x = -40 + off; x < 900; x += 40) { ctx.beginPath(); ctx.moveTo(x, TOP); ctx.lineTo(x + 30, 450); ctx.stroke(); }
        ctx.restore();
        // 大陆板块和火山
        const v = Math.min(120, S.subduct * 16);
        const top = x => TOP - 20 - v * gauss(x, 580, 55) + (Math.abs(x - 580) < 12 && v > 40 ? 12 : 0);
        strata(420, 800, top, x => Math.max(TOP + 20, Math.min(BOT + 10, TOP + 20 + (x - 420) * 0.6)), '#a8794c');
        // 岩浆通道
        if (v > 20) {
          ctx.strokeStyle = 'rgba(255,90,30,.85)';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(600, 400);
          ctx.quadraticCurveTo(560, 300, 580, top(580) + 10);
          ctx.stroke();
        }
        D.text(ctx, '海沟', 410, TOP + 46, { size: 14, color: '#fff' });
        if (v > 50) D.text(ctx, '🌋 火山', 580, top(580) - 26, { size: 16, color: '#3a2a1a', stroke: '#fff', strokeWidth: 4 });
        D.arrow(ctx, 80, 210, 170, 210, '#fff', 5, 16);
      }

      function render(dt) {
        ctx.save();
        if (shake > 0) ctx.translate(rand(-1, 1) * shake * 9, rand(-1, 1) * shake * 6);
        const sky = ctx.createLinearGradient(0, 0, 0, TOP);
        sky.addColorStop(0, '#9fd6ff');
        sky.addColorStop(1, '#e8f6ff');
        ctx.fillStyle = sky;
        ctx.fillRect(-20, -20, 840, 490);
        drawMantle();
        if (mode === 'collide') renderCollide();
        else if (mode === 'apart') renderApart();
        else renderSubduct();
        lava.forEach(p => D.circle(ctx, p.x, p.y, 4, `rgba(255,${100 + Math.random() * 80},30,${Math.min(1, p.life)})`));
        const M = PLATE_MODES[mode];
        D.text(ctx, M.left, 130, 242, { size: 15, color: '#fff' });
        D.text(ctx, M.right, 670, 242, { size: 15, color: '#fff' });
        ctx.restore();
        // 地震仪
        D.rrect(ctx, 590, 12, 198, 76, 12);
        ctx.fillStyle = 'rgba(255,255,255,.95)';
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        seismo.forEach((v, i) => ctx.lineTo(598 + i * 2, 56 + v));
        ctx.stroke();
        D.text(ctx, `📈 地震仪 · 地震 ${quakes} 次`, 689, 26, { size: 13, color: '#4a4560' });
        D.rrect(ctx, 12, 12, 220, 34, 12);
        ctx.fill();
        D.text(ctx, `⏳ 过去了 ${Math.round(myr)} 百万年`, 122, 30, { size: 15, color: '#4a4560' });
        // 压力条
        D.text(ctx, '岩石受到的压力', 122, 64, { size: 12, color: '#3a5a7a', weight: 'normal' });
        D.rrect(ctx, 32, 74, 180, 10, 5);
        ctx.fillStyle = 'rgba(255,255,255,.8)';
        ctx.fill();
        D.rrect(ctx, 32, 74, 180 * Math.min(1, stress), 10, 5);
        ctx.fillStyle = stress > 0.8 ? '#ef4444' : '#f59e0b';
        ctx.fill();
      }

      api.loop(dt => {
        t += dt;
        if (moving) {
          S[mode] += dt;
          myr += dt * 2;
          stress += dt * rand(0.15, 0.35);
          if (S[mode] > 2 && !tried.has(mode)) { tried.add(mode); checkGoal(); }
          if (stress > 1) quake();
        }
        shake = Math.max(0, shake - dt);
        seismo.shift();
        seismo.push(shake > 0 ? rand(-1, 1) * 18 * shake : rand(-1, 1) * (moving ? 1.5 : 0.5));
        for (let i = lava.length - 1; i >= 0; i--) {
          const p = lava[i];
          p.vy += 400 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
          if (p.life <= 0) lava.splice(i, 1);
        }
        render(dt);
      });

      api.choice(Object.entries(PLATE_MODES).map(([k, m]) => [k, m.label]), mode, v => {
        mode = v;
        stress = 0;
        api.note(PLATE_MODES[v].tip + ' 点“开始移动”看看。');
      });
      const row = api.row();
      const playBtn = api.button('▶ 开始移动', () => {
        moving = !moving;
        playBtn.textContent = moving ? '⏸ 暂停' : '▶ 开始移动';
        if (moving) api.note(PLATE_MODES[mode].tip);
      }, row);
      api.button('🔄 回到最初', () => { S[mode] = 0; stress = 0; lava.length = 0; }, row);
      api.note('先选一种板块运动方式，再点“开始移动”。（动画里一秒钟相当于两百万年！）');
    },
  });

  /* ================= 5. 经纬度与时区 ================= */
  const LANDS = [
    [[71, -156], [70, -128], [68, -100], [73, -85], [64, -65], [52, -56], [47, -60], [44, -66], [41, -70], [35, -76], [30, -81], [25, -80], [30, -85], [29, -95], [22, -97], [19, -96], [21, -87], [16, -88], [15, -84], [9, -79], [8, -83], [16, -95], [20, -105], [23, -110], [31, -114], [32, -117], [40, -124], [48, -125], [55, -131], [60, -146], [58, -153], [61, -166], [66, -166]],
    [[60, -44], [66, -35], [70, -22], [78, -18], [83, -35], [81, -62], [76, -70], [70, -54], [64, -51]],
    [[12, -72], [10, -62], [5, -52], [-1, -48], [-5, -35], [-13, -38], [-23, -42], [-34, -53], [-39, -62], [-46, -67], [-55, -68], [-53, -74], [-42, -73], [-30, -71], [-18, -70], [-14, -76], [-5, -81], [2, -79], [8, -77]],
    [[36, -9], [43, -9], [48, -4], [51, 2], [54, 8], [57, 8], [58, 11], [63, 5], [70, 20], [71, 28], [69, 40], [73, 55], [73, 70], [76, 100], [73, 113], [72, 130], [70, 160], [66, 180], [62, 178], [60, 163], [56, 163], [59, 155], [54, 137], [47, 139], [43, 132], [39, 122], [35, 119], [31, 122], [25, 119], [22, 113], [21, 108], [16, 108], [10, 106], [9, 105], [13, 100], [7, 100], [1, 104], [8, 98], [16, 98], [16, 95], [22, 92], [22, 88], [16, 82], [10, 80], [8, 77], [19, 73], [23, 68], [25, 62], [27, 56], [24, 57], [22, 60], [17, 55], [13, 45], [17, 42], [28, 34], [31, 32], [36, 36], [37, 27], [40, 26], [41, 29], [41, 41], [45, 37], [46, 31], [45, 29], [40, 24], [38, 22], [40, 19], [42, 15], [45, 13], [44, 12], [40, 18], [38, 15], [41, 13], [44, 9], [43, 3], [41, 2], [38, 0], [36, -5]],
    [[35, -6], [37, 10], [33, 11], [31, 20], [31, 32], [22, 37], [12, 43], [11, 51], [2, 46], [-5, 40], [-15, 41], [-25, 35], [-34, 26], [-35, 19], [-29, 16], [-17, 12], [-9, 13], [-1, 9], [4, 9], [5, -5], [5, -9], [10, -15], [15, -17], [21, -17], [28, -13], [33, -8]],
    [[-11, 132], [-12, 137], [-17, 141], [-11, 142], [-19, 147], [-25, 153], [-33, 152], [-38, 148], [-38, 141], [-35, 136], [-32, 133], [-35, 118], [-31, 115], [-22, 114], [-20, 119], [-14, 126]],
    [[-70, -180], [-66, -60], [-72, 0], [-67, 60], [-66, 120], [-70, 180], [-90, 180], [-90, -180]],
    [[31, 130], [35, 135], [41, 141], [45, 142], [43, 145], [36, 141], [34, 136]],
    [[50, -5], [51, 1], [53, 0], [58, -2], [58, -6], [54, -4], [52, -5]],
    [[-12, 49], [-25, 47], [-24, 44], [-16, 44]],
    [[-35, 173], [-41, 176], [-46, 170], [-42, 172]],
    [[-6, 106], [-8, 114], [-8, 106]], [[5, 95], [-5, 104], [-3, 106], [5, 100]], [[1, 109], [7, 117], [-3, 116], [-4, 111]],
  ];
  const CITIES = [
    { name: '北京', lat: 40, lon: 116.4, tz: 8 },
    { name: '伦敦', lat: 51.5, lon: -0.1, tz: 0 },
    { name: '纽约', lat: 40.7, lon: -74, tz: -5 },
    { name: '悉尼', lat: -33.9, lon: 151.2, tz: 10 },
    { name: '开罗', lat: 30, lon: 31.2, tz: 2 },
    { name: '东京', lat: 35.7, lon: 139.7, tz: 9 },
    { name: '里约热内卢', lat: -22.9, lon: -43.2, tz: -3 },
    { name: '莫斯科', lat: 55.8, lon: 37.6, tz: 3 },
  ];
  const HUNT = [0, 1, 2, 3, 4];
  const latStr = v => (Math.abs(v) < 0.5 ? '赤道 0°' : `${v > 0 ? '北纬' : '南纬'} ${Math.abs(Math.round(v))}°`);
  const lonStr = v => (Math.abs(v) < 0.5 ? '0°' : Math.abs(v) > 179.5 ? '180°' : `${v > 0 ? '东经' : '西经'} ${Math.abs(Math.round(v))}°`);
  const hhmm = h => {
    const x = ((h % 24) + 24) % 24;
    return `${Math.floor(x)}:${x % 1 ? '30' : '00'}`;
  };

  Sci.register({
    id: 'latlon',
    subject: 'geography',
    level: 5,
    emoji: '🌐',
    title: '经纬度与时区',
    desc: '用经纬度找城市，算一算时差',
    intro: '地球上那么多地方，怎样准确说出一个地方在哪儿？科学家在地球上画了一张看不见的“格子网”：横着的叫纬线，竖着的叫经线。用经度和纬度，就能给每个地方一个“门牌号”！先玩寻宝游戏，再切换到“时区”，看看北京是白天的时候，纽约是几点？',
    goal: '用经纬度找到 3 座城市，再用时区模式看看世界各地的时间',
    fact: '<p><b>纬线</b>是横着绕地球一圈的线，赤道是 0°，往北是北纬、往南是南纬，最大 90°（南北极）。<b>经线</b>是连接南北极的竖线，经过英国伦敦格林尼治的那条是 0°（本初子午线），往东是东经、往西是西经，最大 180°。</p><p>北京大约在<b>北纬 40°、东经 116°</b>。</p><p>地球 24 小时自转一圈（360°），所以<b>经度每差 15°，时间就差 1 小时</b>。越往东，越早看到日出、时间越早。全世界分成 24 个时区，中国统一用东八区的“北京时间”。</p>',
    quiz: [
      { q: '0° 纬线叫什么？', options: ['赤道', '本初子午线', '北回归线'], answer: 0, explain: '赤道把地球分成南、北两个半球。' },
      { q: '北京晚上 8 点（东八区），伦敦（0 时区）是几点？', options: ['中午 12 点', '凌晨 4 点', '晚上 8 点'], answer: 0, explain: '相差 8 个时区，伦敦比北京晚 8 小时：20 − 8 = 12 点。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const X0 = 40, Y0 = 45, K = 2;
      const toX = lon => X0 + (lon + 180) * K, toY = lat => Y0 + (90 - lat) * K;
      const toLon = x => (x - X0) / K - 180, toLat = y => 90 - (y - Y0) / K;
      let mode = 'hunt', hi = 0, cursor = null, bj = 20, timeTried = new Set(), goalSent = false;
      const found = new Set();

      function checkGoal() {
        if (!goalSent && found.size >= 3 && timeTried.size >= 3) {
          goalSent = true;
          api.goalDone();
        }
      }
      function huntNote() {
        if (mode !== 'hunt') return;
        const c = CITIES[HUNT[hi]];
        api.note(`🎯 寻宝：找到 ${latStr(c.lat)}，${lonStr(c.lon)} 附近的地方，点一下！`);
      }
      api.pointer(st, {
        down(p) {
          if (mode !== 'hunt') return;
          const lat = toLat(p.y), lon = toLon(p.x);
          if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return;
          const c = CITIES[HUNT[hi]];
          if (Math.abs(lat - c.lat) < 7 && Math.abs(lon - c.lon) < 7) {
            found.add(HUNT[hi]);
            Sci.sfx('star');
            api.note(`🎉 找到了！这里是 ${c.name}（${latStr(c.lat)}，${lonStr(c.lon)}）。` + (found.size < 5 ? '下一个宝藏出现了！' : '全部找到啦！'));
            hi = (hi + 1) % HUNT.length;
            if (found.size < 5) api.timeout(huntNote, 2600);
            checkGoal();
            if (found.size >= 3 && timeTried.size < 3) api.timeout(() => api.note('寻宝很棒！现在切换到“🕐 时区”，拖动北京时间看看世界各地。'), 2700);
          } else {
            const hint = [];
            if (c.lat - lat > 6) hint.push('往北（上）');
            if (lat - c.lat > 6) hint.push('往南（下）');
            if (c.lon - lon > 6) hint.push('往东（右）');
            if (lon - c.lon > 6) hint.push('往西（左）');
            Sci.sfx('bad');
            api.note(`你点的是 ${latStr(lat)}，${lonStr(lon)}。再${hint.join('、')}找找！`);
          }
        },
        move(p) { cursor = p; },
      });

      function drawMap() {
        ctx.fillStyle = '#cfe8f7';
        ctx.fillRect(X0, Y0, 360 * K, 180 * K);
        ctx.fillStyle = '#9fd18b';
        ctx.strokeStyle = '#6fa85e';
        ctx.lineWidth = 1;
        LANDS.forEach(poly => {
          ctx.beginPath();
          poly.forEach(([la, lo]) => ctx.lineTo(toX(lo), toY(la)));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
        ctx.lineWidth = 1;
        for (let lon = -180; lon <= 180; lon += 30) {
          ctx.strokeStyle = lon === 0 ? 'rgba(220,60,60,.8)' : 'rgba(40,80,120,.25)';
          ctx.beginPath(); ctx.moveTo(toX(lon), Y0); ctx.lineTo(toX(lon), Y0 + 180 * K); ctx.stroke();
          D.text(ctx, lon === 0 ? '0°' : `${Math.abs(lon)}°${lon > 0 ? 'E' : 'W'}`, toX(lon), Y0 + 180 * K + 12, { size: 10, color: '#4a6070', weight: 'normal' });
        }
        for (let lat = -60; lat <= 60; lat += 30) {
          ctx.strokeStyle = lat === 0 ? 'rgba(220,60,60,.8)' : 'rgba(40,80,120,.25)';
          ctx.beginPath(); ctx.moveTo(X0, toY(lat)); ctx.lineTo(X0 + 360 * K, toY(lat)); ctx.stroke();
          D.text(ctx, lat === 0 ? '0°' : `${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}`, X0 - 4, toY(lat), { size: 10, color: '#4a6070', align: 'right', weight: 'normal' });
        }
        D.text(ctx, '赤道', toX(-170), toY(0) - 9, { size: 12, color: '#c0392b' });
        D.text(ctx, '本初子午线', toX(0) + 4, Y0 + 12, { size: 12, color: '#c0392b', align: 'left' });
      }

      function renderHunt() {
        CITIES.forEach((c, i) => {
          if (!found.has(i)) return;
          D.emoji(ctx, '📍', toX(c.lon), toY(c.lat) - 10, 20);
          D.text(ctx, c.name, toX(c.lon), toY(c.lat) + 10, { size: 12, stroke: '#fff', strokeWidth: 3 });
        });
        if (cursor && cursor.x > X0 && cursor.x < X0 + 360 * K && cursor.y > Y0 && cursor.y < Y0 + 180 * K) {
          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = 'rgba(14,147,132,.9)';
          ctx.beginPath();
          ctx.moveTo(X0, cursor.y); ctx.lineTo(X0 + 360 * K, cursor.y);
          ctx.moveTo(cursor.x, Y0); ctx.lineTo(cursor.x, Y0 + 180 * K);
          ctx.stroke();
          ctx.restore();
          const s = `${latStr(toLat(cursor.y))}，${lonStr(toLon(cursor.x))}`;
          D.text(ctx, s, Math.min(cursor.x + 10, 640), cursor.y - 14, { size: 14, align: 'left', color: '#0b5a50', stroke: '#fff', strokeWidth: 4 });
        }
        const c = CITIES[HUNT[hi]];
        D.text(ctx, `🎯 宝藏位置：${latStr(c.lat)}，${lonStr(c.lon)}　已找到 ${found.size} 个`, 400, 22, { size: 17, color: '#0b5a50' });
      }
      function renderTime() {
        const utc = bj - 8;
        // 黑夜阴影（按春分秋分时的情况粗略画）
        for (let lon = -180; lon < 180; lon += 2) {
          const local = ((utc + lon / 15) % 24 + 24) % 24;
          const night = local < 6 || local >= 18;
          const dusk = !night && (local < 7 || local >= 17);
          if (night || dusk) {
            ctx.fillStyle = night ? 'rgba(10,20,60,.45)' : 'rgba(10,20,60,.2)';
            ctx.fillRect(toX(lon), Y0, 2 * K, 180 * K);
          }
        }
        const sunLon = ((12 - utc) * 15 + 540) % 360 - 180;
        D.emoji(ctx, '☀️', toX(sunLon), toY(0), 28);
        CITIES.forEach(c => {
          const local = bj - 8 + c.tz;
          const x = toX(c.lon), y = toY(c.lat);
          const lh = ((local % 24) + 24) % 24;
          D.circle(ctx, x, y, 4, '#ef4444', '#fff', 2);
          D.text(ctx, `${c.name} ${lh >= 6 && lh < 18 ? '☀️' : '🌙'}${hhmm(local)}`, x, y - 13, { size: 12, stroke: '#fff', strokeWidth: 4 });
        });
        D.text(ctx, `北京时间 ${hhmm(bj)}　·　经度每差 15°，时间差 1 小时`, 400, 22, { size: 17, color: '#0b5a50' });
      }

      api.loop(() => {
        ctx.fillStyle = '#f4fbfa';
        ctx.fillRect(0, 0, 800, 450);
        drawMap();
        if (mode === 'hunt') renderHunt();
        else renderTime();
      });

      api.choice([['hunt', '🔍 经纬度寻宝'], ['time', '🕐 时区']], mode, v => {
        mode = v;
        timeSlider.el.hidden = v !== 'time';
        if (v === 'time') api.note('拖动下面的“北京时间”，看看地球上哪里是白天、哪里是黑夜，各个城市现在几点。');
        else huntNote();
      });
      const timeSlider = api.slider('🕐 北京时间', 0, 23.5, 0.5, bj, v => {
        bj = v;
        timeTried.add(Math.floor(v / 3));
        const ny = CITIES[2], ld = CITIES[1];
        api.note(`北京 ${hhmm(v)} 的时候：伦敦是 ${hhmm(v - 8 + ld.tz)}，纽约是 ${hhmm(v - 8 + ny.tz)}。越往西，时间越晚。`);
        checkGoal();
      }, hhmm, api.row());
      timeSlider.el.hidden = true;
      huntNote();
    },
  });
})();
