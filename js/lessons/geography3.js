/* 地理探秘（第三组）：七大洲四大洋 → 水土流失 → 气候带 → 城市选址 → 地震定位 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;
  const inPoly = (x, y, pts) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };

  /* ================= 11. 七大洲四大洋 ================= */
  const LANDS = {
    na: ['北美洲', '#ffc078', [[60, 70], [230, 58], [300, 105], [255, 160], [205, 200], [170, 232], [140, 200], [100, 150], [55, 118]]],
    sa: ['南美洲', '#8ce99a', [[200, 240], [262, 232], [298, 272], [272, 332], [242, 400], [222, 402], [210, 330], [194, 282]]],
    eu: ['欧洲', '#91a7ff', [[382, 78], [462, 70], [470, 118], [432, 140], [390, 136], [368, 110]]],
    af: ['非洲', '#ffd43b', [[378, 168], [462, 160], [502, 200], [492, 270], [452, 340], [422, 342], [400, 272], [368, 220]]],
    as: ['亚洲', '#ff8787', [[472, 62], [700, 58], [742, 118], [692, 182], [642, 222], [582, 212], [522, 182], [480, 140]]],
    oc: ['大洋洲', '#e599f7', [[650, 282], [732, 270], [752, 322], [702, 346], [650, 332]]],
    an: ['南极洲', '#f1f3f5', [[100, 420], [720, 420], [740, 446], [80, 446]]],
  };
  const OCEANS = { pac: '太平洋', atl: '大西洋', ind: '印度洋', arc: '北冰洋' };
  const PLACE_TIPS = {
    na: '北美洲：美国、加拿大都在这里。', sa: '南美洲：有世界上最大的亚马孙热带雨林。', eu: '欧洲：面积很小，但国家很多。',
    af: '非洲：有世界最大的撒哈拉沙漠，还有好多大象和长颈鹿。', as: '亚洲：面积最大、人口最多的大洲，我们中国就在这里！',
    oc: '大洋洲：面积最小的大洲，袋鼠和考拉的家。', an: '南极洲：最冷的大洲，被厚厚的冰盖着，企鹅住在这里。',
    pac: '太平洋：最大、最深的大洋，地图两边都是它。', atl: '大西洋：第二大洋，形状像一个“S”。', ind: '印度洋：在亚洲南边，大部分在热带。', arc: '北冰洋：最小、最冷的大洋，在地球最北边。',
  };

  Sci.register({
    id: 'continents',
    subject: 'geography',
    level: 1,
    emoji: '🌏',
    title: '七大洲四大洋',
    desc: '在世界地图上找到大洲和大洋',
    intro: '地球上的陆地被分成了七大洲，海洋被分成了四大洋。我们中国在哪个洲呢？小博士会问你一个地方，请在世界地图上找到它，点一下！',
    goal: '在地图上找出 7 个大洲和 4 个大洋',
    fact: '<p><b>七大洲</b>：亚洲、非洲、北美洲、南美洲、南极洲、欧洲、大洋洲。其中<b>亚洲最大</b>，大洋洲最小。</p><p><b>四大洋</b>：太平洋、大西洋、印度洋、北冰洋。其中<b>太平洋最大</b>，北冰洋最小。</p><p>🌍 地球表面大约 <b>71%</b> 是海洋，陆地只占 29%，所以从太空看，地球是一颗蓝色的星球。我们中国位于<b>亚洲</b>东部，东边濒临太平洋。</p>',
    quiz: [
      { q: '中国位于哪个大洲？', options: ['亚洲', '欧洲', '非洲'], answer: 0, explain: '中国在亚洲东部。' },
      { q: '世界上最大的大洋是？', options: ['太平洋', '大西洋', '北冰洋'], answer: 0, explain: '太平洋是最大、最深的大洋。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const order = Sci.shuffle(Object.keys(LANDS).concat(Object.keys(OCEANS)));
      let qi = 0, wrong = null;
      const found = {};
      const nameOf = k => (LANDS[k] ? LANDS[k][0] : OCEANS[k]);
      function whatAt(x, y) {
        for (const k in LANDS) if (inPoly(x, y, LANDS[k][2])) return k;
        if (y < 52) return 'arc';
        if (x < 185 || x > 755 || (x > 700 && y > 150)) return 'pac';
        if (x > 300 && x < 375 && y < 410) return 'atl';
        if (x > 505 && x < 650 && y > 225 && y < 410) return 'ind';
        return null;
      }
      function ask() { if (qi < order.length) api.note(`🦉 ${nameOf(order[qi])}在哪里？在地图上点一下。`); }
      api.pointer(st, {
        down(p) {
          if (qi >= order.length) return;
          const k = whatAt(p.x, p.y);
          if (!k) { api.note('这里是海洋，可这片海不太好分哦。点得更靠近大洋的中间试试。'); return; }
          if (k !== order[qi]) {
            Sci.sfx('bad');
            wrong = { x: p.x, y: p.y, k };
            api.note(`这里是${nameOf(k)}。再找找${nameOf(order[qi])}在哪里？`);
            return;
          }
          found[k] = [p.x, p.y];
          wrong = null;
          qi++;
          Sci.sfx('good');
          api.note('✅ ' + PLACE_TIPS[k]);
          if (qi < order.length) api.timeout(ask, 2400);
          else api.timeout(() => { api.note('🎉 七大洲四大洋全找到了！'); api.goalDone(); }, 2400);
        },
      });
      function render() {
        ctx.fillStyle = '#74c0fc';
        ctx.fillRect(0, 0, 800, 450);
        Object.keys(LANDS).forEach(k => {
          const [, c, pts] = LANDS[k];
          ctx.beginPath();
          pts.forEach(([x, y]) => ctx.lineTo(x, y));
          ctx.closePath();
          ctx.fillStyle = found[k] ? c : '#c3e6a8';
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,.2)';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        D.text(ctx, '★', 650, 140, { size: 16, color: '#e03131' });
        Object.keys(found).forEach(k => D.text(ctx, '✅ ' + nameOf(k), found[k][0], found[k][1], { size: 15, color: '#2b2840', stroke: '#fff', strokeWidth: 4 }));
        if (wrong) D.text(ctx, '✖ ' + nameOf(wrong.k), wrong.x, wrong.y, { size: 14, color: '#c92a2a', stroke: '#fff', strokeWidth: 4 });
        if (qi < order.length) D.text(ctx, `🦉 ${nameOf(order[qi])}在哪里？`, 400, 22, { size: 18, color: '#fff', stroke: 'rgba(0,0,0,.35)', strokeWidth: 4 });
        D.text(ctx, `${qi} / 11`, 780, 22, { size: 15, align: 'right', color: '#fff' });
        D.text(ctx, '★ 中国', 668, 140, { size: 12, align: 'left', color: '#c92a2a' });
      }
      api.loop(render);
      ask();
    },
  });

  /* ================= 12. 水土流失 ================= */
  const PLOTS = [['bare', '光秃秃的土坡', 1, '#b08968'], ['grass', '长满青草', 0.3, '#69db7c'], ['tree', '种满树木', 0.1, '#2f9e44']];

  Sci.register({
    id: 'erosion',
    subject: 'geography',
    level: 2,
    emoji: '🌧️',
    title: '水土流失',
    desc: '下大雨时，哪块山坡的泥土冲走得最多？',
    intro: '黄河的水为什么是黄色的？因为它带走了大量的泥沙！我们在三块一样陡的山坡上做实验：一块光秃秃，一块长满青草，一块种满树木。下几场大雨，看看坡下的杯子里接到的泥水有什么不同。',
    goal: '下 3 场雨，找出最能保护泥土的山坡',
    fact: '<p>雨水冲刷地面，把泥土带走，叫做<b>水土流失</b>。光秃秃的山坡水土流失最严重，肥沃的表层土被冲走，土地会越来越贫瘠，河流也会被泥沙堵塞。</p><p>植物的<b>根</b>能牢牢抓住泥土，<b>叶子和落叶</b>能挡住雨滴、减慢水流。所以植树种草是防止水土流失最好的办法。</p><p>🌳 我国的黄土高原曾经水土流失很严重，经过几十年植树造林、退耕还林，现在很多地方都变绿了，黄河里的泥沙也少了很多。</p>',
    quiz: [
      { q: '哪种山坡最容易发生水土流失？', options: ['光秃秃的山坡', '长满树木的山坡'], answer: 0, explain: '没有植物保护，泥土很容易被冲走。' },
      { q: '防止水土流失的好办法是？', options: ['植树种草', '砍掉树木'], answer: 0, explain: '植物的根能固定泥土。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let rains = 0, raining = 0, picked = false, t = 0;
      const mud = [0, 0, 0], soil = [1, 1, 1];
      const drops = [];
      const px = i => 40 + i * 255;

      function rain() {
        if (raining > 0) return;
        if (rains >= 3) { api.note('已经下了 3 场雨啦。现在点一点：哪块山坡保护泥土最好？'); return; }
        raining = 3;
        Sci.sfx('splash');
        api.note('哗啦啦，下大雨了……');
      }
      api.pointer(st, {
        down(p) {
          if (rains < 3 || raining > 0 || picked) return;
          const i = Math.floor((p.x - 40) / 255);
          if (i < 0 || i > 2) return;
          if (i === 2) {
            picked = true;
            Sci.sfx('star');
            api.note('✅ 对！种满树木的山坡几乎没有泥土被冲走，树根和落叶把泥土保护得最好。');
            api.goalDone();
          } else api.note(i === 0 ? '光秃秃的山坡被冲走了好多泥土，杯子里全是泥水！' : '青草也能保护泥土，不过还有比它更好的哦。');
        },
      });
      api.loop(dt => {
        t += dt;
        if (raining > 0) {
          raining -= dt;
          for (let i = 0; i < 6; i++) drops.push({ x: rand(20, 780), y: 0, v: rand(400, 600) });
          PLOTS.forEach((pl, i) => { mud[i] += dt * pl[2] * 0.12; soil[i] = Math.max(0.15, soil[i] - dt * pl[2] * 0.06); });
          if (raining <= 0) {
            rains++;
            api.note(`第 ${rains} 场雨停了。看看三个杯子里的泥水。` + (rains >= 3 ? '现在点一点：哪块山坡保护泥土最好？' : '再下一场？'));
          }
        }
        for (let i = drops.length - 1; i >= 0; i--) { drops[i].y += drops[i].v * dt; if (drops[i].y > 300) drops.splice(i, 1); }
        ctx.fillStyle = raining > 0 ? '#adb5bd' : '#d0ebff';
        ctx.fillRect(0, 0, 800, 450);
        PLOTS.forEach((pl, i) => {
          const x = px(i);
          // 山坡
          ctx.fillStyle = '#8d6e4f';
          ctx.beginPath();
          ctx.moveTo(x, 160);
          ctx.lineTo(x + 220, 300);
          ctx.lineTo(x, 300);
          ctx.closePath();
          ctx.fill();
          // 表层的好土
          ctx.strokeStyle = '#5c3d2e';
          ctx.lineWidth = 18 * soil[i];
          ctx.beginPath();
          ctx.moveTo(x, 160);
          ctx.lineTo(x + 220, 300);
          ctx.stroke();
          if (pl[0] === 'grass') for (let k = 0; k < 18; k++) { const gx = x + k * 12, gy = 160 + k * 12 * 140 / 220; D.text(ctx, '٧', gx, gy - 8, { size: 14, color: '#2f9e44' }); }
          if (pl[0] === 'tree') for (let k = 0; k < 5; k++) D.emoji(ctx, '🌳', x + 15 + k * 42, 160 + (15 + k * 42) * 140 / 220 - 24, 40);
          // 杯子
          ctx.strokeStyle = '#495057';
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 190, 310, 50, 70);
          const h = Math.min(66, 20 + mud[i] * 60);
          if (rains || raining > 0) {
            ctx.fillStyle = Sci.rgb(Sci.mixColor([160, 210, 255], [140, 100, 60], clamp(mud[i] * 2.2, 0, 1)));
            ctx.fillRect(x + 192, 378 - h, 46, h);
          }
          D.text(ctx, pl[1], x + 110, 410, { size: 17 });
          D.text(ctx, `冲走的泥土：${Math.round(mud[i] * 100)}`, x + 110, 434, { size: 13, color: '#6f6a85', weight: 'normal' });
        });
        ctx.strokeStyle = 'rgba(30,80,160,.5)';
        ctx.lineWidth = 2;
        drops.forEach(d => { ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 3, d.y + 12); ctx.stroke(); });
        D.text(ctx, `下了 ${rains} / 3 场雨`, 20, 26, { size: 16, align: 'left', color: '#2b2840' });
      });
      api.button('🌧️ 下一场大雨', rain);
      api.note('👆 点“下一场大雨”，看看三块山坡有什么不同。');
    },
  });

  /* ================= 13. 气候带 ================= */
  const ZONES = [
    ['n-cold', '北寒带', 66.5, 90, '一年里大部分时间冰天雪地，有极昼和极夜。', '🐻', '#d0ebff'],
    ['n-temp', '北温带', 23.5, 66.5, '四季分明，春暖、夏热、秋凉、冬冷。我们中国大部分在这里。', '🐼', '#d3f9d8'],
    ['tropic', '热带', -23.5, 23.5, '太阳几乎直射，一年到头都很热，雨林里动植物特别多。', '🐘', '#ffe8cc'],
    ['s-temp', '南温带', -66.5, -23.5, '也是四季分明，但季节和北半球正好相反。', '🦘', '#d3f9d8'],
    ['s-cold', '南寒带', -90, -66.5, '南极洲在这里，是地球上最冷的地方。', '🐧', '#d0ebff'],
  ];

  Sci.register({
    id: 'climate',
    subject: 'geography',
    level: 3,
    emoji: '🌡️',
    title: '气候带',
    desc: '为什么赤道热、两极冷？',
    intro: '从赤道到南北两极，有的地方热得冒汗，有的地方冷得结冰。为什么会这样？关键在于阳光照射的角度！拖动地球上的小旗子，从北极一直走到南极，看看阳光是怎么照下来的，认识地球上的五个气候带。',
    goal: '把小旗子插到 5 个不同的气候带',
    fact: '<p>地球是个球体，阳光照到<b>赤道附近</b>时几乎是直射的，同样多的阳光集中在一小块地面上，所以很热；越靠近<b>两极</b>，阳光越斜，同样多的阳光铺在一大片地面上，所以很冷。</p><p>按照热量的多少，地球被分成<b>五带</b>：热带、北温带、南温带、北寒带、南寒带。分界线分别是南北回归线（23.5°）和南北极圈（66.5°）。</p><p>🗺️ 我国大部分地区位于北温带，最南边的海南岛和南海诸岛在热带。</p>',
    quiz: [
      { q: '为什么赤道附近特别热？', options: ['阳光几乎直射，热量集中', '那里离太阳特别近'], answer: 0, explain: '直射的阳光热量更集中。' },
      { q: '我国大部分地区位于哪个温度带？', options: ['北温带', '热带', '北寒带'], answer: 0, explain: '我国大部分在北温带，四季分明。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const C = [260, 225], R = 170;
      let lat = 40, drag = false;
      const visited = new Set();
      const zoneOf = l => ZONES.find(z => l >= z[2] && l <= z[3]);

      function setLat(p) {
        lat = clamp(Math.round(Math.asin(clamp((C[1] - p.y) / R, -1, 1)) * 180 / Math.PI), -88, 88);
      }
      function check() {
        const z = zoneOf(lat);
        const first = !visited.has(z[0]);
        visited.add(z[0]);
        if (first) Sci.sfx('good');
        api.note(`${z[5]} ${z[1]}（纬度约 ${Math.abs(lat)}°${lat >= 0 ? '北' : '南'}）：${z[4]}（去过 ${visited.size}/5）`);
        if (visited.size === 5) api.goalDone();
      }
      api.pointer(st, {
        down(p) { if (Math.hypot(p.x - C[0], p.y - C[1]) < R + 30) { drag = true; setLat(p); } },
        move(p, active) { if (active && drag) setLat(p); },
        up() { if (drag) { drag = false; check(); } },
      });
      api.loop(() => {
        ctx.fillStyle = '#0b1033';
        ctx.fillRect(0, 0, 800, 450);
        // 阳光
        ctx.strokeStyle = 'rgba(255,220,100,.35)';
        ctx.lineWidth = 2;
        for (let y = 50; y < 410; y += 22) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(C[0] - Math.sqrt(Math.max(0, R * R - (y - C[1]) ** 2)), y); ctx.stroke(); }
        D.text(ctx, '☀️ 阳光 →', 50, 30, { size: 15, color: '#ffe066' });
        // 地球和五带
        ctx.save();
        ctx.beginPath();
        ctx.arc(C[0], C[1], R, 0, Math.PI * 2);
        ctx.clip();
        ZONES.forEach(z => {
          const y1 = C[1] - Math.sin(z[3] * Math.PI / 180) * R, y2 = C[1] - Math.sin(z[2] * Math.PI / 180) * R;
          ctx.fillStyle = z[6];
          ctx.fillRect(C[0] - R, y1, R * 2, y2 - y1);
        });
        ctx.restore();
        D.circle(ctx, C[0], C[1], R, null, '#fff', 2);
        [[23.5, '北回归线'], [-23.5, '南回归线'], [66.5, '北极圈'], [-66.5, '南极圈'], [0, '赤道']].forEach(([l, n]) => {
          const y = C[1] - Math.sin(l * Math.PI / 180) * R, hw = Math.cos(l * Math.PI / 180) * R;
          ctx.strokeStyle = l === 0 ? '#e03131' : 'rgba(0,0,0,.35)';
          ctx.setLineDash(l === 0 ? [] : [5, 4]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(C[0] - hw, y);
          ctx.lineTo(C[0] + hw, y);
          ctx.stroke();
          ctx.setLineDash([]);
          D.text(ctx, n, C[0] + hw + 8, y, { size: 12, align: 'left', color: '#ced4da', weight: 'normal' });
        });
        ZONES.forEach(z => { const m = (z[2] + z[3]) / 2; D.text(ctx, z[1], C[0] - 40, C[1] - Math.sin(m * Math.PI / 180) * R, { size: 13, color: '#495057' }); });
        // 小旗子
        const fy = C[1] - Math.sin(lat * Math.PI / 180) * R, fx = C[0] - Math.cos(lat * Math.PI / 180) * R;
        D.text(ctx, '🚩', fx - 2, fy - 12, { size: 26 });
        // 右边：阳光照射角度示意
        const z = zoneOf(lat), ang = Math.abs(lat) * Math.PI / 180;
        D.rrect(ctx, 520, 40, 260, 370, 16);
        ctx.fillStyle = z[6];
        ctx.fill();
        D.text(ctx, z[1], 650, 70, { size: 24, color: '#2b2840' });
        D.emoji(ctx, z[5], 650, 125, 50);
        // 一束同样宽的阳光，照到地面上铺开的宽度
        const GY = 330, w = 60 / Math.max(0.15, Math.cos(ang));
        ctx.fillStyle = 'rgba(255,200,40,.6)';
        ctx.beginPath();
        ctx.moveTo(620 - Math.sin(ang) * 120, 180);
        ctx.lineTo(680 - Math.sin(ang) * 120, 180);
        ctx.lineTo(650 + w / 2, GY);
        ctx.lineTo(650 - w / 2, GY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#8d6e4f';
        ctx.fillRect(540, GY, 220, 10);
        D.text(ctx, `同样多的阳光铺开 ${(w / 60).toFixed(1)} 倍宽`, 650, 360, { size: 14, color: '#2b2840' });
        D.text(ctx, Math.abs(lat) < 23.5 ? '几乎直射，很热' : Math.abs(lat) < 66.5 ? '斜着照，冷热适中' : '非常斜，很冷', 650, 385, { size: 14, color: '#c0620a' });
        D.text(ctx, `去过 ${visited.size}/5 个气候带`, 20, 430, { size: 14, align: 'left', color: '#fff' });
      });
      api.note('👆 按住地球上下拖动，把小旗子插到不同的地方。');
    },
  });

  /* ================= 14. 城市选址 ================= */
  Sci.register({
    id: 'citysite',
    subject: 'geography',
    level: 4,
    emoji: '🏙️',
    title: '城市选址',
    desc: '一座城市建在哪里最合适？',
    intro: '你是一位城市规划师，要在这片土地上建一座新城市。城市建在哪里最好呢？要有干净的水，地面要平坦，还要安全、交通方便。在地图上点一个地方，看看它能得多少分，试着找到 85 分以上的好位置！',
    goal: '找到一个 85 分以上的建城位置',
    fact: '<p>古往今来，城市大多建在<b>河流旁边的平原</b>上：取水方便，土地平坦肥沃，还能用船运输货物。</p><p>但也不能离河太近：河边的低洼地容易被<b>洪水</b>淹没。高山上坡陡、交通不便，沙漠里缺水，都不适合建大城市。</p><p>🏙️ 我国的很多大城市，比如武汉、南京、重庆，都在长江边上；上海、广州、天津靠近大海，方便和世界各地做贸易。</p>',
    quiz: [
      { q: '古代城市为什么喜欢建在河边？', options: ['取水和运输方便', '河边风景好看'], answer: 0, explain: '河流提供水源和交通。' },
      { q: '城市建在紧挨着河的低洼地，有什么危险？', options: ['容易被洪水淹没', '太阳太晒'], answer: 0, explain: '低洼的河滩地容易发洪水。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const RIVER = [[60, 0], [120, 90], [250, 150], [330, 230], [420, 280], [560, 300], [680, 340], [800, 360]];
      let pin = null, best = 0;
      const distRiver = (x, y) => {
        let m = 1e9;
        for (let i = 1; i < RIVER.length; i++) {
          const [ax, ay] = RIVER[i - 1], [bx, by] = RIVER[i];
          const dx = bx - ax, dy = by - ay, k = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), 0, 1);
          m = Math.min(m, Math.hypot(x - ax - dx * k, y - ay - dy * k));
        }
        return m;
      };
      const mountain = (x, y) => x > 560 && y < 200 && (x - 560) / 240 + (200 - y) / 200 > 0.35;
      const desert = (x, y) => x < 230 && y > 260;
      const coast = (x, y) => x > 680 && y > 380;

      function score(x, y) {
        const d = distRiver(x, y), parts = [];
        let s = 0;
        const water = d < 18 ? 30 : d < 90 ? 30 : d < 160 ? 15 : 0;
        parts.push(['水源', water, d < 160 ? (d < 90 ? '离河不远，用水方便' : '离河有点远') : '附近没有河，缺水']);
        const flat = mountain(x, y) ? 0 : 25;
        parts.push(['地形', flat, flat ? '地面平坦' : '在山上，坡太陡']);
        const safe = d < 30 ? 0 : 20;
        parts.push(['安全', safe, safe ? '不容易被洪水淹' : '紧挨着河，容易被洪水淹']);
        const land = desert(x, y) ? 0 : 15;
        parts.push(['土地', land, land ? '土地肥沃，能种粮食' : '沙漠，种不了庄稼']);
        const trade = coast(x, y) || (d < 90 && x > 400) ? 10 : d < 90 ? 6 : 0;
        parts.push(['交通', trade, trade >= 10 ? '能用船运货，交通方便' : trade ? '有河可以行船' : '交通不方便']);
        s = parts.reduce((a, p) => a + p[1], 0);
        return { s, parts };
      }
      api.pointer(st, {
        down(p) {
          const r = score(p.x, p.y);
          pin = { x: p.x, y: p.y, r };
          best = Math.max(best, r.s);
          Sci.sfx(r.s >= 85 ? 'star' : r.s >= 60 ? 'good' : 'bad');
          api.note(`这个位置得 ${r.s} 分。` + (r.s >= 85 ? '🎉 太棒了，这是建城的好地方！' : '看看右边的评分，哪一项丢分了？'));
          if (r.s >= 85) api.goalDone();
        },
      });
      api.loop(() => {
        ctx.fillStyle = '#c0eb75';
        ctx.fillRect(0, 0, 800, 450);
        // 沙漠
        ctx.fillStyle = '#ffe8a3';
        ctx.fillRect(0, 260, 230, 190);
        D.emoji(ctx, '🌵', 80, 340, 30);
        D.emoji(ctx, '🌵', 160, 400, 26);
        // 高山
        ctx.fillStyle = '#868e96';
        [[600, 200, 80], [680, 160, 90], [760, 190, 70], [720, 90, 70]].forEach(([x, y, s]) => { ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x, y - s * 1.1); ctx.lineTo(x + s, y); ctx.closePath(); ctx.fill(); });
        // 大海
        ctx.fillStyle = '#4dabf7';
        ctx.beginPath();
        ctx.moveTo(680, 450);
        ctx.quadraticCurveTo(700, 390, 800, 380);
        ctx.lineTo(800, 450);
        ctx.fill();
        // 河流和容易被淹的河滩
        ctx.strokeStyle = 'rgba(77,171,247,.25)';
        ctx.lineWidth = 60;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        RIVER.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.stroke();
        ctx.strokeStyle = '#339af0';
        ctx.lineWidth = 14;
        ctx.beginPath();
        RIVER.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.stroke();
        D.text(ctx, '河滩（易发洪水）', 250, 185, { size: 12, color: '#1864ab', weight: 'normal' });
        if (pin) {
          D.emoji(ctx, '🏙️', pin.x, pin.y - 18, 40);
          D.rrect(ctx, 20, 20, 250, 190, 14);
          ctx.fillStyle = 'rgba(255,255,255,.93)';
          ctx.fill();
          D.text(ctx, `总分：${pin.r.s}`, 145, 44, { size: 20, color: pin.r.s >= 85 ? '#2b8a3e' : '#c0620a' });
          pin.r.parts.forEach(([n, v, why], i) => D.text(ctx, `${n} ${v}分：${why}`, 34, 76 + i * 26, { size: 13, align: 'left', color: '#2b2840', maxW: 230 }));
        } else D.text(ctx, '👆 在地图上点一下，看看在那里建城能得几分', 400, 30, { size: 17, color: '#2b2840' });
        D.text(ctx, `最高 ${best} 分`, 790, 22, { size: 15, align: 'right', color: '#2b2840' });
      });
      api.note('👆 在地图上点一个地方建城市，看看能得几分。');
    },
  });

  /* ================= 15. 地震定位 ================= */
  const STATIONS = [[150, 120], [620, 90], [420, 380]];

  Sci.register({
    id: 'quake',
    subject: 'geography',
    level: 5,
    emoji: '📡',
    title: '地震定位',
    desc: '用三个地震台，找出地震发生在哪里',
    intro: '地震发生时，会同时发出两种波：跑得快的“纵波”和跑得慢的“横波”。地震台离震中越远，两种波到达的时间差就越大。点一点三个地震台，根据时间差画出圆圈，三个圆圈交在一起的地方就是震中！',
    goal: '找出 2 次地震的震中',
    fact: '<p>地震波主要有两种：<b>纵波（P 波）</b>跑得快，让地面上下跳动；<b>横波（S 波）</b>跑得慢，让地面左右摇晃，破坏力更大。</p><p>地震台测出两种波到达的<b>时间差</b>，就能算出自己离震中有多远。一个台站只知道距离，画出一个圆；<b>三个台站的圆交在一点</b>，就找到了震中。</p><p>🛡️ 地震时：在室内要躲到结实的桌子下，护住头部；不要乘电梯，不要跳楼；在户外要远离高楼、电线杆。纵波比横波先到，“预警”就是利用这几秒钟提醒大家躲避。</p>',
    quiz: [
      { q: '至少需要几个地震台，才能确定震中的位置？', options: ['1 个', '2 个', '3 个'], answer: 2, explain: '三个圆交于一点，才能确定位置。' },
      { q: '地震时在教室里，应该怎么做？', options: ['躲到桌子下护住头', '赶紧坐电梯下楼'], answer: 0, explain: '就近躲避、护住头部，千万不要乘电梯。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let epi = null, shown = new Set(), solved = 0, waves = null, t = 0, miss = null;

      function newQuake() {
        epi = [rand(220, 560), rand(150, 320)];
        shown = new Set();
        waves = null;
        miss = null;
        api.note('📡 又发生了一次地震！点三个地震台，看看它们离震中多远。');
      }
      const dist = i => Math.hypot(STATIONS[i][0] - epi[0], STATIONS[i][1] - epi[1]);
      api.pointer(st, {
        down(p) {
          const i = STATIONS.findIndex(s => Math.hypot(p.x - s[0], p.y - s[1]) < 30);
          if (i >= 0) {
            shown.add(i);
            Sci.sfx('click');
            api.note(`${i + 1} 号台：横波比纵波晚到了 ${(dist(i) / 40).toFixed(1)} 秒，离震中约 ${Math.round(dist(i) * 2)} 千米。` + (shown.size === 3 ? '三个圆交在哪里？点那里！' : ''));
            return;
          }
          if (shown.size < 3 || waves) return;
          if (Math.hypot(p.x - epi[0], p.y - epi[1]) < 28) {
            solved++;
            waves = { k: 0 };
            Sci.sfx('star');
            api.note(`🎯 找到震中了！（${solved}/2）看，纵波（蓝）跑得比横波（红）快。`);
            if (solved >= 2) api.goalDone();
            else api.timeout(newQuake, 4500);
          } else {
            miss = [p.x, p.y];
            Sci.sfx('bad');
            api.note('不在这里哦，震中要同时在三个圆上，找三个圆交在一起的那个点。');
          }
        },
      });
      api.loop(dt => {
        t += dt;
        ctx.fillStyle = '#f1e7d0';
        ctx.fillRect(0, 0, 800, 450);
        ctx.strokeStyle = 'rgba(160,120,80,.25)';
        ctx.lineWidth = 1;
        for (let x = 0; x < 800; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 450); ctx.stroke(); }
        for (let y = 0; y < 450; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke(); }
        shown.forEach(i => D.circle(ctx, STATIONS[i][0], STATIONS[i][1], dist(i), null, ['#e8590c', '#1c7ed6', '#2f9e44'][i], 3));
        STATIONS.forEach(([x, y], i) => {
          D.circle(ctx, x, y, 18, shown.has(i) ? '#fff' : '#ffe066', '#495057', 2);
          D.text(ctx, String(i + 1), x, y + 1, { size: 15 });
          D.text(ctx, '📡', x + 26, y - 18, { size: 18 });
        });
        if (miss) D.text(ctx, '✖', miss[0], miss[1], { size: 22, color: '#e03131' });
        if (waves) {
          waves.k += dt;
          D.circle(ctx, epi[0], epi[1], waves.k * 220, null, 'rgba(28,126,214,.7)', 3);
          D.circle(ctx, epi[0], epi[1], waves.k * 130, null, 'rgba(224,49,49,.7)', 4);
          D.text(ctx, '⭐ 震中', epi[0], epi[1], { size: 18, color: '#c92a2a', stroke: '#fff', strokeWidth: 4 });
        }
        D.text(ctx, `找到 ${solved}/2 个震中`, 780, 22, { size: 15, align: 'right', color: '#2b2840' });
        D.text(ctx, '👆 先点三个地震台', 20, 22, { size: 15, align: 'left', color: '#6f6a85', weight: 'normal' });
      });
      newQuake();
    },
  });
})();
