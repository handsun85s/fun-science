/* 生命奥秘：种子发芽 → 小蝌蚪变青蛙 → 食物链 */
(function () {
  'use strict';
  const { clamp, lerp, rand, smooth } = Sci;
  const D = Sci.draw;
  const el = Sci.h;

  /* ================= 1. 种子发芽需要什么 ================= */
  Sci.register({
    id: 'seed',
    subject: 'biology',
    level: 1,
    emoji: '🌱',
    title: '种子发芽需要什么？',
    desc: '当一回小农夫，让种子发芽开花',
    intro: '一颗小小的种子，怎样才能长成一棵大植物呢？这里有一颗种子埋在土里，你来当小农夫！先选好条件——浇不浇水、有没有空气、暖不暖和、有没有阳光——再点“种下去”，看看会发生什么。',
    goal: '让种子发芽，一直长到开出花来',
    fact: '<p>种子发芽需要三样东西：<b>水分、空气、合适的温度</b>。缺了哪一样，种子都会一直“睡觉”不醒。</p><p>有趣的是，<b>发芽时不需要阳光</b>，种子肚子里自带了“便当”（营养）。可是发芽以后，小苗要靠<b>阳光</b>自己做食物。没有阳光的小苗会长得<b>又黄又细</b>，就像豆芽菜一样！</p>',
    quiz: [
      { q: '种子发芽需要什么？', options: ['水、空气和合适的温度', '只要有泥土就行'], answer: 0, explain: '水分、空气、温度，缺一不可。' },
      { q: '小苗一直放在黑黑的柜子里，会长成什么样？', options: ['又黄又细', '又绿又壮'], answer: 0, explain: '没有阳光，植物没法变绿、长壮。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const GROUND = 250, SX = 400, SY = 340, DAYS = 14, DAY_SEC = 0.9;
      const cond = { water: false, air: true, warm: true, sun: true };
      let day = 0, g = 0, wilt = 0, running = false, t = 0, wetness = 0, reasonShown = false, done = false, pourT = 0;
      const flakes = Array.from({ length: 40 }, () => ({ x: rand(0, 800), y: rand(0, 450), v: rand(30, 70) }));
      const drops = [];
      const germOK = () => cond.water && cond.air && cond.warm;
      const missing = () => {
        const m = [];
        if (!cond.water) m.push('没有水，种子干巴巴的');
        if (!cond.air) m.push('罩子里没有空气，种子喘不过气');
        if (!cond.warm) m.push('太冷了，种子冻得不肯醒');
        return m.join('；');
      };

      function step(dt) {
        wetness += ((cond.water ? 1 : 0) - wetness) * Math.min(1, dt * 1.5);
        pourT = Math.max(0, pourT - dt);
        if (pourT > 0 && Math.random() < 0.6) drops.push({ x: rand(470, 520), y: 130, vy: 200 });
        for (let i = drops.length - 1; i >= 0; i--) {
          drops[i].vy += 600 * dt;
          drops[i].y += drops[i].vy * dt;
          if (drops[i].y > GROUND) drops.splice(i, 1);
        }
        if (!running) return;
        day += dt / DAY_SEC;
        const perDay = dt / DAY_SEC * 0.13;
        if (germOK()) {
          wilt = Math.max(0, wilt - dt);
          g = Math.min(cond.sun ? 1 : 0.85, g + perDay);
        } else if (g > 0.3) {
          wilt = Math.min(1, wilt + dt * 0.5);
        }
        if (!germOK() && g < 0.15 && day > 3 && !reasonShown) {
          reasonShown = true;
          api.note(`第 ${Math.floor(day)} 天了，种子还在睡觉……因为${missing()}。`);
        }
        if (g > 0.3 && !germOK() && wilt > 0.5 && !reasonShown) {
          reasonShown = true;
          api.note(`哎呀，小苗蔫了！因为${missing()}。快帮帮它！`);
        }
        if (g >= 1 && !done) {
          done = true;
          Sci.sfx('star');
          api.note('🌼 开花啦！种子发芽需要水、空气和温暖；小苗长大还需要阳光！');
          api.goalDone();
        }
        if (!cond.sun && g >= 0.84 && !reasonShown) {
          reasonShown = true;
          api.note('小苗长出来了，可是黄黄的、细细的，开不了花……它缺少什么呢？');
        }
        if (day >= DAYS) {
          day = DAYS;
          running = false;
          playBtn.textContent = '▶ 再种一次';
          if (!done) api.note(g < 0.15 ? `14 天过去了，种子没有发芽。原因：${missing() || '条件改来改去，种子来不及长'}。` : '14 天过去了，小苗没能开花。调整条件再试试吧！');
        }
      }

      function leaf(x, y, ang, len, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(len * 0.5, -len * 0.4, len, 0);
        ctx.quadraticCurveTo(len * 0.5, len * 0.4, 0, 0);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      }
      function drawPlant() {
        const green = cond.sun ? [63, 174, 73] : [214, 207, 107];
        const col = Sci.rgb(Sci.mixColor(green, [150, 120, 60], wilt * 0.7));
        // 种子
        const swell = 1 + smooth(0, 0.15, g) * 0.35;
        ctx.save();
        ctx.translate(SX, SY);
        ctx.scale(swell, swell);
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 11, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#9b6a3a';
        ctx.fill();
        if (g > 0.12) {
          ctx.strokeStyle = '#f3e1c2';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-8, -3);
          ctx.lineTo(8, 3);
          ctx.stroke();
        }
        ctx.restore();
        // 根
        if (g > 0.15) {
          const L = (g - 0.15) / 0.85 * 95;
          ctx.strokeStyle = '#f2e3c8';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(SX, SY + 8);
          ctx.quadraticCurveTo(SX + 8, SY + 8 + L * 0.5, SX - 4, SY + 8 + L);
          for (let k = 1; k <= 3; k++) {
            const f = k / 4;
            if (L * f < 15) continue;
            const yy = SY + 8 + L * f;
            ctx.moveTo(SX + 2, yy);
            ctx.lineTo(SX - 22 * f - 8, yy + 14);
            ctx.moveTo(SX + 2, yy);
            ctx.lineTo(SX + 20 * f + 8, yy + 12);
          }
          ctx.stroke();
        }
        // 茎和叶
        if (g > 0.25) {
          const H = (g - 0.25) / 0.75 * (cond.sun ? 205 : 240);
          const sway = Math.sin(t * 1.5) * 4 + wilt * 45;
          const topX = SX + sway, topY = SY - 10 - H;
          ctx.strokeStyle = col;
          ctx.lineWidth = cond.sun ? 6 : 3.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(SX, SY - 8);
          ctx.quadraticCurveTo(SX - 6, SY - 10 - H * 0.5, topX, topY);
          ctx.stroke();
          if (topY < GROUND - 4) {
            const ls = clamp((GROUND - topY) / 60, 0.3, 1) * (cond.sun ? 30 : 18);
            leaf(topX, topY, -2.6 + wilt * 1.2, ls, col);
            leaf(topX, topY, -0.5 - wilt * 1.2, ls, col);
          }
          const pairs = [[0.65, 0.55], [0.8, 0.78]];
          pairs.forEach(([need, at]) => {
            if (g <= need) return;
            const k = smooth(need, need + 0.15, g) * (cond.sun ? 46 : 22);
            const x = lerp(SX, topX, at), y = lerp(SY - 10, topY, at);
            leaf(x, y, Math.PI + 0.4 + wilt, k, col);
            leaf(x, y, -0.4 - wilt, k, col);
          });
          if (g >= 0.99 && cond.sun) D.emoji(ctx, '🌼', topX, topY - 14, 52);
        }
      }

      function render() {
        // 天空
        const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
        if (!cond.sun) { sky.addColorStop(0, '#1d2340'); sky.addColorStop(1, '#3a3f63'); }
        else if (!cond.warm) { sky.addColorStop(0, '#c9d8e8'); sky.addColorStop(1, '#eef3f8'); }
        else { sky.addColorStop(0, '#8fd3ff'); sky.addColorStop(1, '#e6f7ff'); }
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 800, GROUND);
        if (cond.sun) {
          D.circle(ctx, 80, 70, 38, '#ffd23f');
          ctx.strokeStyle = '#ffd23f';
          ctx.lineWidth = 4;
          for (let k = 0; k < 10; k++) {
            const a = k / 10 * Math.PI * 2 + t * 0.3;
            ctx.beginPath();
            ctx.moveTo(80 + Math.cos(a) * 48, 70 + Math.sin(a) * 48);
            ctx.lineTo(80 + Math.cos(a) * 62, 70 + Math.sin(a) * 62);
            ctx.stroke();
          }
        } else {
          D.text(ctx, '🌑 关在黑屋子里，没有阳光', 30, 40, { size: 17, align: 'left', color: '#c9cbe6' });
        }
        // 土
        const soil = Sci.mixColor([201, 164, 108], [107, 68, 35], wetness);
        ctx.fillStyle = Sci.rgb(soil);
        ctx.fillRect(0, GROUND, 800, 450 - GROUND);
        ctx.fillStyle = 'rgba(0,0,0,.08)';
        for (let k = 0; k < 30; k++) D.circle(ctx, (k * 97) % 800, GROUND + 20 + (k * 53) % 180, 4 + (k % 3), 'rgba(0,0,0,.08)');
        if (wetness < 0.4) {
          ctx.strokeStyle = 'rgba(120,85,40,.5)';
          ctx.lineWidth = 2;
          [[200, 300], [600, 320], [300, 410], [540, 400]].forEach(([x, y]) => {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 18, y + 10);
            ctx.lineTo(x + 10, y + 26);
            ctx.stroke();
          });
        }
        if (!cond.warm) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, GROUND - 6, 800, 10);
        }
        ctx.fillStyle = '#5aa947';
        ctx.fillRect(0, GROUND - 2, 800, 4);
        drawPlant();
        drops.forEach(d => { ctx.beginPath(); ctx.ellipse(d.x, d.y, 3, 6, 0, 0, Math.PI * 2); ctx.fillStyle = '#4aa8ff'; ctx.fill(); });
        if (pourT > 0) D.emoji(ctx, '🚿', 500, 110, 50);
        if (!cond.warm) {
          flakes.forEach(f => {
            f.y += f.v * 0.016;
            if (f.y > 450) f.y = -10;
            D.emoji(ctx, '❄️', f.x + Math.sin(t + f.v) * 8, f.y, 14);
          });
        }
        if (!cond.air) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(260, 440);
          ctx.lineTo(260, 120);
          ctx.quadraticCurveTo(260, 40, 400, 40);
          ctx.quadraticCurveTo(540, 40, 540, 120);
          ctx.lineTo(540, 440);
          ctx.fillStyle = 'rgba(200,230,255,.25)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(120,160,200,.9)';
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.restore();
          D.text(ctx, '玻璃罩：里面的空气被抽走了', 400, 70, { size: 16, color: '#3d6a94' });
        }
        // 天数 & 温度
        D.rrect(ctx, 640, 16, 145, 44, 22);
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        ctx.fill();
        D.text(ctx, `📅 第 ${Math.floor(day)} 天`, 712, 38, { size: 18 });
        D.text(ctx, cond.warm ? '🌡️ 20℃ 暖暖的' : '🌡️ 2℃ 好冷', 712, 80, { size: 16, color: cond.sun ? '#2b2840' : '#e6e6f5' });
      }

      api.loop(dt => { t += dt; step(dt); render(); });

      api.toggle('💧 浇水', cond.water, v => { cond.water = v; if (v) pourT = 1.4; reasonShown = false; });
      api.toggle('🌬️ 空气', cond.air, v => { cond.air = v; reasonShown = false; });
      api.toggle('🌡️ 温暖', cond.warm, v => { cond.warm = v; reasonShown = false; });
      api.toggle('☀️ 阳光', cond.sun, v => { cond.sun = v; reasonShown = false; });
      const row2 = api.row();
      const playBtn = api.button('▶ 种下去', () => {
        if (running) { running = false; playBtn.textContent = '▶ 继续'; return; }
        if (day >= DAYS) { day = 0; g = 0; wilt = 0; done = false; }
        running = true;
        reasonShown = false;
        playBtn.textContent = '⏸ 暂停';
        api.note('一天、两天……仔细观察种子的变化！');
      }, row2);
      api.button('🔄 重新种', () => {
        running = false;
        day = g = wilt = 0;
        done = reasonShown = false;
        playBtn.textContent = '▶ 种下去';
        api.note('换了一颗新种子。先选好条件，再点“种下去”。');
      }, row2);
      api.note('点上面的按钮选好条件（亮着的就是“有”），再点“▶ 种下去”。');
    },
  });

  /* ================= 2. 小蝌蚪变青蛙 ================= */
  const FROG_STAGES = [
    ['青蛙卵', '青蛙妈妈把卵产在水里，一团一团的，像透明的果冻，里面黑黑的小点就是宝宝。'],
    ['小蝌蚪', '小蝌蚪出生啦！大大的脑袋，黑灰色的身子，甩着长长的尾巴，在水里快活地游来游去。'],
    ['长出后腿', '过了一些日子，小蝌蚪先长出了两条后腿。'],
    ['长出前腿', '接着又长出了两条前腿，身体慢慢变绿了。'],
    ['尾巴变短', '尾巴越来越短，它开始学着用肺呼吸，准备上岸啦。'],
    ['小青蛙', '尾巴不见了！小蝌蚪变成了小青蛙，跳上荷叶“呱呱”叫，它最爱捉害虫。'],
  ];

  Sci.register({
    id: 'frog',
    subject: 'biology',
    level: 2,
    emoji: '🐸',
    title: '小蝌蚪变青蛙',
    desc: '看看小蝌蚪是怎样一步步长大的',
    intro: '还记得《小蝌蚪找妈妈》的故事吗？小蝌蚪一开始根本不像妈妈：没有腿，还拖着长尾巴。它到底是怎么变成青蛙的？点“下一步”或者拖动滑块，一起看看小蝌蚪的成长日记吧！',
    goal: '陪小蝌蚪一直长成小青蛙',
    fact: '<p>青蛙的一生要经过：<b>卵 → 蝌蚪 → 长出后腿 → 长出前腿 → 尾巴变短 → 青蛙</b>。</p><p>小时候和长大后样子完全不同，这种长大的方式叫做<b>变态发育</b>。蝴蝶也是这样：卵 → 毛毛虫 → 蛹 → 蝴蝶！</p><p>蝌蚪住在水里，用<b>鳃</b>呼吸；青蛙能上岸，主要用<b>肺</b>呼吸，皮肤也能帮忙呼吸。青蛙一年能吃掉上万只害虫，是庄稼的好朋友！</p>',
    quiz: [
      { q: '小蝌蚪先长出什么腿？', options: ['后腿', '前腿'], answer: 0, explain: '先长后腿，再长前腿。' },
      { q: '小蝌蚪住在哪里？', options: ['水里', '树上'], answer: 0, explain: '蝌蚪在水里生活，长成青蛙后才能上岸。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const SURF = 120, PAD = { x: 610, y: 118 };
      let s = 0, target = 0, auto = false, t = 0, lastStage = 0;
      const eggs = Array.from({ length: 18 }, (_, i) => {
        const a = i * 2.4, r = 10 + (i % 6) * 6.5;
        return { x: 230 + Math.cos(a) * r, y: 160 + Math.sin(a) * r * 0.7, rot: rand(0, Math.PI) };
      });
      const bubbles = Array.from({ length: 12 }, () => ({ x: rand(20, 780), y: rand(SURF, 450), v: rand(15, 40) }));

      function critter(x, y, s, sc, flip, alpha) {
        if (alpha <= 0.01) return;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.scale(flip ? -sc : sc, sc);
        const green = smooth(3, 5, s);
        const body = Sci.rgb(Sci.mixColor([60, 56, 48], [92, 184, 92], green));
        const tail = 46 * (1 - smooth(3.6, 4.9, s));
        const hind = smooth(1.6, 2.6, s), front = smooth(2.6, 3.5, s);
        const bw = 18 + 6 * smooth(2, 5, s), bh = 13 + 3 * smooth(3, 5, s);
        if (tail > 1) {
          const N = 12, pts = [];
          for (let i = 0; i <= N; i++) {
            const u = i / N;
            pts.push([-bw * 0.6 - u * tail, Math.sin(t * 10 - u * 4) * 6 * u, (1 - u) * 7 + 1]);
          }
          ctx.beginPath();
          pts.forEach(p => ctx.lineTo(p[0], p[1] - p[2]));
          for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1] + pts[i][2]);
          ctx.closePath();
          ctx.fillStyle = body;
          ctx.fill();
        }
        ctx.strokeStyle = body;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (hind > 0.01) {
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(-bw * 0.4, bh * 0.5);
          ctx.lineTo(-bw * 0.4 - 14 * hind, bh * 0.5 + 12 * hind);
          ctx.lineTo(-bw * 0.4 + 8 * hind, bh * 0.5 + 17 * hind);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.ellipse(0, 0, bw, bh, 0, 0, Math.PI * 2);
        ctx.fillStyle = body;
        ctx.fill();
        if (green > 0.3) {
          ctx.beginPath();
          ctx.ellipse(2, bh * 0.35, bw * 0.7, bh * 0.45, 0, 0, Math.PI);
          ctx.fillStyle = `rgba(230,245,200,${green * 0.8})`;
          ctx.fill();
        }
        if (front > 0.01) {
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(bw * 0.45, bh * 0.5);
          ctx.lineTo(bw * 0.6, bh * 0.5 + 14 * front);
          ctx.stroke();
        }
        const er = 4 + 3 * smooth(3.5, 5, s), ey = -bh * 0.55 - 3 * smooth(3.5, 5, s);
        D.circle(ctx, bw * 0.45, ey, er, '#fff');
        D.circle(ctx, bw * 0.5, ey, er * 0.55, '#111');
        if (s > 4.3) {
          ctx.strokeStyle = '#2d5a2d';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(bw * 0.55, bh * 0.05, bw * 0.35, 0.2, 1.2);
          ctx.stroke();
        }
        ctx.restore();
      }

      function render() {
        const sky = ctx.createLinearGradient(0, 0, 0, SURF);
        sky.addColorStop(0, '#a8e0ff');
        sky.addColorStop(1, '#e8f8ff');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 800, SURF);
        const water = ctx.createLinearGradient(0, SURF, 0, 450);
        water.addColorStop(0, '#5ec3e6');
        water.addColorStop(1, '#1f6f9f');
        ctx.fillStyle = water;
        ctx.fillRect(0, SURF, 800, 450 - SURF);
        ctx.fillStyle = '#d9c38c';
        ctx.fillRect(0, 430, 800, 20);
        // 水草
        ctx.strokeStyle = '#2f8f4e';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        [40, 70, 740, 765, 360].forEach((x, i) => {
          ctx.beginPath();
          ctx.moveTo(x, 440);
          ctx.quadraticCurveTo(x + Math.sin(t + i) * 14, 360, x + Math.sin(t * 1.3 + i) * 8, 290 + i * 8);
          ctx.stroke();
        });
        bubbles.forEach(b => {
          b.y -= b.v * 0.016;
          if (b.y < SURF) b.y = 440;
          D.circle(ctx, b.x + Math.sin(b.y * 0.05) * 4, b.y, 4, null, 'rgba(255,255,255,.6)', 1.5);
        });
        // 荷叶
        ctx.beginPath();
        ctx.ellipse(PAD.x, PAD.y + 8, 78, 18, 0, 0.15, Math.PI * 2 - 0.15);
        ctx.lineTo(PAD.x, PAD.y + 8);
        ctx.closePath();
        ctx.fillStyle = '#3fa34d';
        ctx.fill();
        D.emoji(ctx, '🌸', 715, 112, 30);
        // 卵
        const eggA = 1 - smooth(0.9, 1.3, s);
        if (eggA > 0) {
          eggs.forEach(e => {
            D.circle(ctx, e.x, e.y, 10, `rgba(255,255,255,${0.45 * eggA})`, `rgba(255,255,255,${0.8 * eggA})`, 1.5);
            ctx.save();
            ctx.globalAlpha = eggA;
            ctx.translate(e.x, e.y);
            ctx.rotate(e.rot);
            ctx.beginPath();
            ctx.ellipse(0, 0, 3.5 + 3 * Math.min(1, s), 3.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#1b1b1b';
            ctx.fill();
            ctx.restore();
          });
        }
        // 主角 + 两个兄弟姐妹
        const appear = smooth(0.85, 1.15, s);
        const swim = (ph, cx, cy) => [cx + Math.cos(t * 0.5 + ph) * 130, cy + Math.sin(t * 0.8 + ph) * 40, Math.sin(t * 0.5 + ph) > 0];
        const leave = smooth(4.3, 5, s);
        [[2.1, 300, 250, 1.3], [4.2, 470, 330, 1.2]].forEach(([ph, cx, cy, sc]) => {
          const [x, y, flip] = swim(ph, cx, cy);
          critter(x, y, s, sc, flip, appear * 0.45 * (1 - leave));
        });
        let [x, y, flip] = swim(0, 420, 280);
        const fromEgg = smooth(1, 1.6, s);
        x = lerp(230, x, fromEgg);
        y = lerp(165, y, fromEgg);
        x = lerp(x, PAD.x - 10, leave);
        y = lerp(y, PAD.y - 16, leave);
        if (leave > 0.5) flip = false;
        critter(x, y, s, 2.2, flip, appear);

        const k = Math.round(s);
        D.rrect(ctx, 14, 14, 330, 46, 23);
        ctx.fillStyle = 'rgba(255,255,255,.88)';
        ctx.fill();
        D.text(ctx, `第 ${k + 1} 步：${FROG_STAGES[k][0]}`, 30, 38, { size: 22, align: 'left', color: '#22a95b' });
      }

      api.loop(dt => {
        t += dt;
        if (auto) {
          target = 5;
          s = Math.min(5, s + dt * 0.35);
          if (s >= 5) { auto = false; autoBtn.textContent = '🎬 自动播放'; }
          slider.set(+s.toFixed(2));
        } else if (s !== target) {
          s += clamp(target - s, -dt * 1.2, dt * 1.2);
          slider.set(+s.toFixed(2));
        }
        const k = Math.round(s);
        if (k !== lastStage && Math.abs(s - k) < 0.05) {
          lastStage = k;
          api.note(FROG_STAGES[k][1]);
          Sci.sfx('pop');
          if (k === 5) api.goalDone();
        }
        render();
      });

      api.button('◀ 上一步', () => { auto = false; target = Math.max(0, Math.ceil(s - 0.01) - 1); });
      api.button('下一步 ▶', () => { auto = false; target = Math.min(5, Math.floor(s + 0.01) + 1); });
      const autoBtn = api.button('🎬 自动播放', () => {
        auto = !auto;
        if (auto && s >= 5) s = 0;
        autoBtn.textContent = auto ? '⏸ 暂停' : '🎬 自动播放';
        if (!auto) target = s;
      });
      const slider = api.slider('成长', 0, 5, 0.01, 0, v => { auto = false; s = target = v; }, v => FROG_STAGES[Math.round(v)][0], api.row());
      api.note(FROG_STAGES[0][1]);
    },
  });

  /* ================= 3. 谁吃谁？食物链 ================= */
  const SCENES = [
    { name: '🌾 草原', chain: [['🌿', '草'], ['🐰', '兔子'], ['🦊', '狐狸']], extra: ['🐟', '小鱼', '小鱼住在水里，草原上可没有它哦。'] },
    { name: '🌳 森林', chain: [['🍃', '树叶'], ['🐛', '毛毛虫'], ['🐦', '小鸟'], ['🦅', '老鹰']], extra: ['🐄', '奶牛', '奶牛吃草，可它不在这条森林的链子里。'] },
    { name: '🌊 海洋', chain: [['🌱', '海藻'], ['🦐', '小虾'], ['🐟', '小鱼'], ['🦈', '鲨鱼']], extra: ['🐰', '兔子', '兔子可不会游泳，它住在陆地上。'] },
    { name: '🌾 稻田', chain: [['🌾', '稻子'], ['🦗', '蝗虫'], ['🐸', '青蛙'], ['🐍', '蛇'], ['🦅', '老鹰']], extra: ['🍄', '蘑菇', '蘑菇吃的是枯枝落叶，它不在这条链子里。'] },
  ];

  Sci.register({
    id: 'foodchain',
    subject: 'biology',
    level: 3,
    emoji: '🦊',
    title: '谁吃谁？食物链',
    desc: '把动植物排成一条“食物链”',
    intro: '大自然里，兔子吃草，狐狸吃兔子……像这样“一个吃一个”连起来，就叫做“食物链”。请你按照“谁被谁吃”的顺序，从下面一个一个点选，把食物链接起来。小心，里面藏着一个捣乱的家伙哦！',
    goal: '完成 3 条食物链',
    fact: '<p><b>食物链</b>总是从<b>植物</b>开始的，因为只有植物能靠阳光自己“做饭”。箭头从被吃的指向吃它的，表示能量是这样一路传过去的。</p><p>食物链里少了谁都不行：如果狐狸没有了，兔子会越来越多，把草都吃光；如果草没有了，兔子和狐狸都会饿肚子。</p><p>🌍 所以我们要保护大自然里的每一种生物！</p>',
    quiz: [
      { q: '食物链的开头一般是？', options: ['植物', '老虎'], answer: 0, explain: '植物能靠阳光自己做食物，是食物链的起点。' },
      { q: '如果草原上的狐狸都没有了，兔子会？', options: ['越来越多，把草都吃光', '也跟着消失'], answer: 0, explain: '没有了天敌，兔子会越来越多。' },
    ],
    mount(api) {
      const host = api.host;
      const done = new Set();
      let sc = 0, k = 0, pool = [], removed = -1;
      const tip = el('div', { class: 'fc-tip' });
      const chainBox = el('div', { class: 'fc-chain' });
      const poolBox = el('div', { class: 'fc-pool' });
      host.append(el('div', { class: 'fc' }, tip, chainBox, poolBox, el('div', { class: 'fc-legend' }, '☀️ 阳光 → 植物 → 吃植物的动物 → 吃动物的动物（箭头表示“被谁吃”）')));

      const card = (e, name, onClick, extraCls) => el('button', { class: 'fc-card ' + (extraCls || ''), type: 'button', onclick: onClick }, el('span', { class: 'e' }, e), name);

      function start(i) {
        sc = i;
        k = 0;
        removed = -1;
        const S = SCENES[i];
        pool = Sci.shuffle(S.chain.map((c, j) => ({ e: c[0], name: c[1], idx: j })).concat([{ e: S.extra[0], name: S.extra[1], idx: -1, why: S.extra[2] }]));
        draw();
        api.note('先找一找：谁是这里的植物？点它放到链子的第一格。');
      }
      function draw(justAdded) {
        const S = SCENES[sc];
        const complete = k === S.chain.length;
        chainBox.classList.toggle('done', complete);
        chainBox.replaceChildren();
        tip.textContent = complete ? '✅ 完成！点一点链子里的生物，看看它消失了会怎样？' : `${S.name}：第 ${k + 1} 格放谁？`;
        if (complete) chainBox.append(el('span', { class: 'fc-sun' }, '☀️'), el('span', { class: 'fc-arrow' }, '→'));
        S.chain.forEach((c, j) => {
          if (j > 0) chainBox.append(el('span', { class: 'fc-arrow' }, '→'));
          if (j < k) {
            let badge = null, cls = j === justAdded ? 'in' : '';
            if (removed >= 0) {
              if (j === removed) cls += ' gone';
              else if (j === removed - 1) badge = '📈 变太多';
              else if (j > removed) badge = '😢 饿肚子';
            }
            const b = card(c[0], c[1], () => complete && tapChain(j), cls);
            if (badge) b.append(el('span', { class: 'fc-badge' }, badge));
            chainBox.append(b);
          } else {
            chainBox.append(el('span', { class: 'fc-slot' }, '?'));
          }
        });
        poolBox.replaceChildren(...pool.map(p => {
          const b = card(p.e, p.name, () => pick(p, b));
          return b;
        }));
      }
      function pick(p, btn) {
        const S = SCENES[sc];
        if (p.idx === k) {
          pool = pool.filter(x => x !== p);
          k++;
          Sci.sfx('pop');
          if (k === S.chain.length) {
            pool = [];
            draw(k - 1);
            Sci.sfx('star');
            const names = S.chain.map(c => c[1]).join(' → ');
            api.note(`🎉 食物链连好啦：${names}！能量从阳光出发，一路传了下去。`);
            done.add(sc);
            if (done.size >= 3) api.goalDone();
            else api.timeout(() => api.note(`还可以点链子里的生物做个小实验，或者换个地方继续（已完成 ${done.size} 条）。`), 2600);
          } else {
            draw(k - 1);
            api.note(`对啦！接下来，谁会吃${S.chain[k - 1][1]}？`);
          }
          return;
        }
        btn.classList.remove('wrong');
        void btn.offsetWidth;
        btn.classList.add('wrong');
        Sci.sfx('bad');
        if (p.idx < 0) api.note('🙅 ' + p.why);
        else if (k === 0) api.note(`${p.name}可不是植物哦。食物链要从植物开始，找一找谁是植物？`);
        else api.note(`${p.name}不吃${S.chain[k - 1][1]}哦。想一想，谁会吃${S.chain[k - 1][1]}？`);
      }
      function tapChain(j) {
        const S = SCENES[sc], C = S.chain.map(c => c[1]);
        removed = removed === j ? -1 : j;
        draw();
        Sci.sfx('click');
        if (removed < 0) { api.note('大家都回来了，食物链又恢复了平衡。'); return; }
        if (j === 0) api.note(`如果${C[0]}没有了，${C.slice(1).join('、')}都会饿肚子，整条食物链都会垮掉！植物是食物链的根本。`);
        else if (j === C.length - 1) api.note(`如果${C[j]}没有了，${C[j - 1]}就没有了天敌，会越来越多，可能会把${C[j - 2] || '食物'}都吃光！`);
        else api.note(`如果${C[j]}没有了，${C[j - 1]}会变得太多，${C.slice(j + 1).join('、')}会没东西吃。每一种生物都很重要！`);
      }

      api.choice(SCENES.map((s, i) => [i, s.name]), 0, start);
      start(0);
    },
  });

  /* ================= 4. 心脏与血液循环 ================= */
  // 血液走的“8 字形”路线：心脏 → 肺 → 心脏 → 全身 → 心脏
  const BLOOD_PATH = [[385, 215], [300, 215], [300, 95], [355, 95], [445, 95], [500, 95], [500, 215], [415, 215], [415, 265], [500, 265], [640, 265], [640, 400], [455, 400], [345, 400], [160, 400], [160, 265], [385, 265], [385, 215]];
  const ACTIVITIES = { sleep: ['😴 睡觉', 60, 12], rest: ['🧘 安静坐着', 80, 18], run: ['🏃 跑步', 140, 40] };

  Sci.register({
    id: 'heart',
    subject: 'biology',
    level: 4,
    emoji: '❤️',
    title: '心脏与血液循环',
    desc: '跟着一颗血细胞，在身体里绕一圈',
    intro: '把手放在胸口，感觉到“咚咚”的跳动了吗？那是心脏在工作！心脏像一个永不停歇的水泵，把血液送到全身。点“追踪一个血细胞”，跟着它去肺里装氧气，再把氧气送到全身。再切换成“跑步”，看看心跳有什么变化？',
    goal: '追踪一个血细胞走完一整圈，并试试跑步时的心跳',
    fact: '<p>心脏大约和你的拳头一样大，一分钟跳 60～100 下，一辈子要跳 20 多亿次！</p><p>血液在身体里走两条路：<b>肺循环</b>（心脏 → 肺 → 心脏）让血液放下二氧化碳、装上<b>氧气</b>，变成鲜红色；<b>体循环</b>（心脏 → 全身 → 心脏）把氧气和营养送给全身的细胞，再带走二氧化碳和废物。</p><p>运动时肌肉需要更多氧气，所以<b>心跳和呼吸都会变快</b>。经常运动，心脏会更强壮。（图里用蓝色表示含氧少的血，真实的血是暗红色的。）</p>',
    quiz: [
      { q: '血液在哪里装上氧气？', options: ['肺', '胃', '大脑'], answer: 0, explain: '我们吸进来的氧气在肺里进入血液。' },
      { q: '跑步时，心跳会怎样？', options: ['变快', '变慢', '停下来'], answer: 0, explain: '肌肉需要更多氧气，心脏就跳得更快，把血送得更快。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const segs = [];
      let total = 0;
      for (let i = 1; i < BLOOD_PATH.length; i++) {
        const [a, b] = [BLOOD_PATH[i - 1], BLOOD_PATH[i]];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        segs.push({ a, b, s: total, len });
        total += len;
      }
      const at = s => {
        s = ((s % total) + total) % total;
        const g = segs.find(q => s >= q.s && s <= q.s + q.len) || segs[segs.length - 1];
        const f = (s - g.s) / g.len;
        return [lerp(g.a[0], g.b[0], f), lerp(g.a[1], g.b[1], f)];
      };
      const S_LUNG = segs[3].s + 45, S_BODY = segs[12].s + 55;
      const oxygen = s => {
        s = ((s % total) + total) % total;
        return smooth(S_LUNG - 25, S_LUNG + 25, s) * (1 - smooth(S_BODY - 25, S_BODY + 25, s));
      };
      let act = 'rest', t = 0, beatP = 0, track = false, trackS = 0, trackDist = 0, stage = '', looped = false, ran = false, sound = false;
      const cells = Array.from({ length: 44 }, (_, i) => i * total / 44);

      function checkGoal() { if (looped && ran) api.goalDone(); }
      function render(pulse) {
        ctx.fillStyle = '#fff6f4';
        ctx.fillRect(0, 0, 800, 450);
        // 肺
        [[352, 95], [448, 95]].forEach(([x, y]) => {
          ctx.beginPath();
          ctx.ellipse(x, y, 52, 62 * (1 + Math.sin(t * Math.PI * 2 * ACTIVITIES[act][2] / 60) * 0.06), 0, 0, Math.PI * 2);
          ctx.fillStyle = '#ffc2cf';
          ctx.fill();
        });
        D.text(ctx, '🫁 肺：装上氧气', 400, 20, { size: 16, color: '#c2185b' });
        // 全身
        D.rrect(ctx, 250, 350, 300, 85, 20);
        ctx.fillStyle = '#ffe2b8';
        ctx.fill();
        D.text(ctx, '🧠💪🦵 全身：送去氧气和营养', 400, 372, { size: 16, color: '#9a5b00' });
        // 血管
        ctx.strokeStyle = 'rgba(200,120,120,.25)';
        ctx.lineWidth = 16;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        BLOOD_PATH.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.stroke();
        cells.forEach(s => {
          const [x, y] = at(s);
          D.circle(ctx, x, y, 6, Sci.rgb(Sci.mixColor([70, 100, 220], [230, 30, 50], oxygen(s))));
        });
        // 心脏
        ctx.save();
        ctx.translate(400, 240);
        ctx.scale(pulse, pulse);
        ctx.beginPath();
        ctx.moveTo(0, 62);
        ctx.bezierCurveTo(-90, 10, -70, -60, -22, -52);
        ctx.bezierCurveTo(-8, -50, 0, -38, 0, -30);
        ctx.bezierCurveTo(0, -38, 8, -50, 22, -52);
        ctx.bezierCurveTo(70, -60, 90, 10, 0, 62);
        const hg = ctx.createLinearGradient(-60, 0, 60, 0);
        hg.addColorStop(0, '#7c6fd6');
        hg.addColorStop(0.5, '#c2455f');
        hg.addColorStop(1, '#e8394d');
        ctx.fillStyle = hg;
        ctx.fill();
        ctx.restore();
        D.text(ctx, '心脏', 400, 248, { size: 18, color: '#fff' });
        // 追踪的血细胞
        if (track) {
          const [x, y] = at(trackS);
          D.circle(ctx, x, y, 14, null, '#ffb400', 4);
          D.text(ctx, '我', x, y - 24, { size: 15, color: '#9a6400', stroke: '#fff', strokeWidth: 4 });
        }
        const [, bpm, br] = ACTIVITIES[act];
        D.text(ctx, `❤️ 心跳 ${bpm} 次/分`, 24, 40, { size: 20, align: 'left', color: '#c2185b' });
        D.text(ctx, `🌬️ 呼吸 ${br} 次/分`, 24, 72, { size: 17, align: 'left', color: '#6f6a85' });
        D.text(ctx, '🔴 含氧多的血  🔵 含氧少的血', 790, 40, { size: 14, align: 'right', color: '#6f6a85', weight: 'normal' });
      }

      api.loop(dt => {
        t += dt;
        const [, bpm] = ACTIVITIES[act];
        const prev = beatP;
        beatP = (beatP + dt * bpm / 60) % 1;
        if (sound && !Sci.muted) {
          if (prev < 0.05 && beatP >= 0.05) Sci.tone(65, 0.12, { vol: 0.25 });
          if (prev < 0.25 && beatP >= 0.25) Sci.tone(55, 0.1, { vol: 0.18 });
        }
        const pulse = 1 + 0.1 * Math.exp(-(((beatP - 0.06) / 0.06) ** 2)) + 0.06 * Math.exp(-(((beatP - 0.26) / 0.06) ** 2));
        const v = 130 * bpm / 80 * (0.7 + 0.6 * (pulse - 1) / 0.1);
        for (let i = 0; i < cells.length; i++) cells[i] += v * dt;
        if (track) {
          const before = ((trackS % total) + total) % total;
          trackS += v * dt;
          trackDist += v * dt;
          const now = ((trackS % total) + total) % total;
          const crossed = mark => before < mark && now >= mark;
          if (crossed(S_LUNG)) api.note('🫁 到肺里了！放下二氧化碳，装上新鲜的氧气，我变成了鲜红色！');
          else if (crossed(S_BODY)) api.note('💪 到全身了！把氧气和营养送给细胞，带走二氧化碳，我的颜色变暗了。');
          else if (now < before) {
            if (trackDist > total * 0.95 && !looped) {
              looped = true;
              Sci.sfx('star');
              api.note('❤️ 我绕了一整圈，又回到了心脏！心脏一挤，我又要出发了。' + (ran ? '' : '再切换到“跑步”看看心跳。'));
              checkGoal();
            } else api.note('❤️ 回到心脏啦！心脏一挤，把我送去肺里。');
          }
        }
        render(pulse);
      });

      api.choice(Object.entries(ACTIVITIES).map(([k, a]) => [k, a[0]]), act, v => {
        act = v;
        if (v === 'run') { ran = true; api.note('🏃 跑起来了！肌肉要更多氧气，心跳从 80 加快到 140 次/分，呼吸也变快了。'); checkGoal(); }
        else api.note(v === 'sleep' ? '😴 睡着的时候身体需要的氧气少，心跳变慢了。' : '🧘 安静坐着时，心跳大约 80 次/分。');
      });
      const row = api.row();
      api.button('🔍 追踪一个血细胞', () => {
        track = true;
        trackS = 0;
        trackDist = 0;
        api.note('我是一颗红细胞！现在从心脏出发，先去肺里……');
      }, row);
      api.toggle('🔊 听心跳', false, v => { sound = v; }, row);
      api.note('点“追踪一个血细胞”，跟着它走一圈吧！');
    },
  });

  /* ================= 5. 光合作用 ================= */
  Sci.register({
    id: 'photosynthesis',
    subject: 'biology',
    level: 5,
    emoji: '🌿',
    title: '光合作用',
    desc: '植物怎样用阳光“做饭”？做一次科学探究',
    intro: '植物不用吃饭，它们的食物从哪里来？秘密就在叶子里：叶子能利用阳光，把水和二氧化碳变成养分，同时放出氧气！这里有一盆泡在水里的水草，冒出的小气泡就是氧气。改变台灯的远近，数一数 10 秒冒出多少个气泡，把数据记下来，你就能发现光照和光合作用的关系。',
    goal: '在 3 个不同的距离下记录气泡数据',
    fact: '<p><b>光合作用</b>：绿色植物在<b>叶绿体</b>里利用<b>光能</b>，把<b>二氧化碳和水</b>变成<b>有机物（养分，如淀粉）</b>，并放出<b>氧气</b>。</p><p>二氧化碳 + 水 —(光，叶绿体)→ 有机物 + 氧气</p><p>光越强，光合作用越快，但强到一定程度就不再增加了。水里加一点小苏打，能增加二氧化碳，气泡也会变多。</p><p>🔬 这就是<b>控制变量</b>的实验方法：每次只改变一个条件（距离），其他条件都不变，才能看出这个条件的作用。我们呼吸的氧气，大部分都来自植物和海里的藻类！</p>',
    quiz: [
      { q: '光合作用会放出什么气体？', options: ['氧气', '二氧化碳', '氮气'], answer: 0, explain: '植物吸收二氧化碳，放出氧气。' },
      { q: '台灯离水草越近，冒出的气泡会？', options: ['越多', '越少', '一样多'], answer: 0, explain: '离得越近光越强，光合作用越快。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const WTOP = 175, BX = 320, BW = 200, BOT = 410;
      let dist = 30, lamp = true, soda = false, t = 0, changeT = 0;
      const bubbles = [], times = [], records = new Map();
      const strands = Array.from({ length: 6 }, (_, i) => ({ x: BX + 50 + i * 20, h: rand(150, 200), ph: rand(0, 6) }));
      const I = () => (20 / dist) ** 2;
      // 光越强气泡越多，太强时就不再增加（光饱和）
      const rate = () => (lamp ? 2.6 * Math.min(1, I() * 0.8) * (soda ? 1.5 : 1) : 0);
      const changed = () => { changeT = t; };
      const tip = s => [s.x + Math.sin(t + s.ph) * 10, BOT - s.h];

      function record() {
        const wait = 10 - (t - changeT);
        if (wait > 0) { api.note(`⏳ 再等 ${Math.ceil(wait)} 秒，数满 10 秒才准确！`); return; }
        const n = times.filter(x => x > t - 10).length;
        const key = `${dist}-${lamp}-${soda}`;
        records.set(key, { dist, lamp, soda, n });
        Sci.sfx('good');
        api.note(`📋 记下来了：台灯 ${lamp ? dist + ' 厘米' : '关掉'}${soda ? '＋小苏打' : ''}，10 秒冒出 ${n} 个气泡。`);
        const dists = new Set([...records.values()].filter(r => r.lamp && !r.soda).map(r => r.dist));
        if (dists.size >= 3) {
          api.timeout(() => api.note('🎉 看表格：台灯越近，气泡越多！说明光越强，光合作用越快。你像科学家一样做了一次“控制变量”实验。'), 1500);
          api.goalDone();
        }
      }

      function render() {
        ctx.fillStyle = '#f3fbf2';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#d8c7a8';
        ctx.fillRect(0, BOT + 10, 560, 30);
        // 台灯
        const lx = 280 - (dist - 10) * 4.4, ly = 250;
        if (lamp) {
          const k = Math.min(1, I() * 0.8);
          ctx.beginPath();
          ctx.moveTo(lx + 20, ly - 20);
          ctx.lineTo(BX + 10, WTOP);
          ctx.lineTo(BX + 10, BOT);
          ctx.lineTo(lx + 20, ly + 20);
          ctx.closePath();
          ctx.fillStyle = `rgba(255,230,120,${0.15 + 0.4 * k})`;
          ctx.fill();
        }
        ctx.fillStyle = '#555';
        ctx.fillRect(lx - 30, ly + 20, 8, BOT + 10 - ly - 20);
        ctx.fillRect(lx - 50, BOT + 4, 48, 8);
        D.rrect(ctx, lx - 34, ly - 28, 54, 56, 10);
        ctx.fillStyle = '#ffb02e';
        ctx.fill();
        D.circle(ctx, lx + 20, ly, 14, lamp ? '#fff7c2' : '#cfcfcf');
        D.text(ctx, lamp ? `距离 ${dist} 厘米` : '台灯关了', lx, ly + 52, { size: 14, color: '#4a4560' });
        // 烧杯和水
        ctx.fillStyle = soda ? 'rgba(170,215,255,.6)' : 'rgba(150,205,255,.5)';
        ctx.fillRect(BX, WTOP, BW, BOT - WTOP);
        strands.forEach(s => {
          const [tx, ty] = tip(s);
          ctx.strokeStyle = '#2f9e44';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(s.x, BOT);
          ctx.quadraticCurveTo(s.x - 10, BOT - s.h / 2, tx, ty);
          ctx.stroke();
          for (let k = 0.25; k < 1; k += 0.2) {
            const y = lerp(BOT, ty, k), x = lerp(s.x, tx, k * k);
            ctx.beginPath();
            ctx.ellipse(x - 9, y, 9, 3, -0.5, 0, Math.PI * 2);
            ctx.ellipse(x + 9, y, 9, 3, 0.5, 0, Math.PI * 2);
            ctx.fillStyle = '#40c057';
            ctx.fill();
          }
        });
        bubbles.forEach(b => D.circle(ctx, b.x, b.y, b.r, 'rgba(255,255,255,.75)', 'rgba(80,140,200,.8)', 1.5));
        ctx.strokeStyle = '#8fb3cf';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(BX, 140);
        ctx.lineTo(BX, BOT);
        ctx.lineTo(BX + BW, BOT);
        ctx.lineTo(BX + BW, 140);
        ctx.stroke();
        // 计数器
        const win = Math.min(10, t - changeT);
        const n = times.filter(x => x > t - win).length;
        D.text(ctx, `🫧 最近 ${win.toFixed(0)} 秒：${n} 个气泡`, BX + BW / 2, 120, { size: 17, color: '#1f6f9f' });
        // 右侧：光合作用工厂 + 数据表
        const px = 548;
        D.rrect(ctx, px, 14, 240, 150, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        D.text(ctx, '🍃 叶子里的“食物工厂”', px + 120, 36, { size: 15, color: '#2f9e44' });
        D.text(ctx, '二氧化碳 + 水', px + 120, 66, { size: 15 });
        const on = rate() > 0;
        D.text(ctx, on ? '⬇ ☀️光 + 叶绿体' : '⬇ 没有光，工厂停工', px + 120, 94, { size: 14, color: on ? '#e08a00' : '#999' });
        D.text(ctx, '养分（淀粉）+ 氧气 🫧', px + 120, 122, { size: 15 });
        D.text(ctx, `工厂速度：${'▮'.repeat(Math.round(rate() * 2.5))}`, px + 120, 148, { size: 13, color: '#2f9e44', weight: 'normal' });
        D.rrect(ctx, px, 176, 240, 260, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        D.text(ctx, '📋 实验记录', px + 120, 198, { size: 15 });
        D.text(ctx, '条件', px + 60, 224, { size: 13, color: '#8b87a0' });
        D.text(ctx, '10 秒气泡数', px + 180, 224, { size: 13, color: '#8b87a0' });
        [...records.values()].sort((a, b) => (b.lamp - a.lamp) || a.dist - b.dist || a.soda - b.soda).slice(0, 8).forEach((r, i) => {
          const y = 250 + i * 23;
          D.text(ctx, r.lamp ? `${r.dist} 厘米${r.soda ? '+苏打' : ''}` : '关灯', px + 60, y, { size: 14, weight: 'normal' });
          D.text(ctx, String(r.n), px + 150, y, { size: 14 });
          ctx.fillStyle = '#74c0fc';
          ctx.fillRect(px + 168, y - 6, Math.min(62, r.n * 2.5), 12);
        });
        if (!records.size) D.text(ctx, '还没有记录', px + 120, 300, { size: 14, color: '#bbb', weight: 'normal' });
      }

      api.loop(dt => {
        t += dt;
        if (Math.random() < rate() * dt) {
          const s = strands[Math.floor(Math.random() * strands.length)];
          const [x, y] = tip(s);
          bubbles.push({ x, y, r: rand(3, 5), v: rand(50, 80) });
          times.push(t);
          if (bubbles.length % 3 === 0) Sci.tone(rand(900, 1300), 0.04, { vol: 0.03 });
        }
        while (times.length && times[0] < t - 12) times.shift();
        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];
          b.y -= b.v * dt;
          b.x += Math.sin(b.y * 0.08) * 0.3;
          if (b.y < WTOP) bubbles.splice(i, 1);
        }
        render();
      });

      api.slider('💡 台灯距离', 10, 60, 5, dist, v => { dist = v; changed(); }, v => v + ' 厘米');
      const row = api.row();
      api.button('📋 记录数据', record, row);
      api.toggle('💡 开灯', lamp, v => { lamp = v; changed(); }, row);
      api.toggle('🧂 加小苏打', soda, v => { soda = v; changed(); }, row);
      api.note('调好台灯距离，等 10 秒，再点“记录数据”。至少记下 3 个不同的距离。');
    },
  });
})();
