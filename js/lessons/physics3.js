/* 物理小实验（第三组）：彩虹 → 静电 → 惯性 → 电磁铁 → 过山车与能量 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 11. 彩虹的颜色 ================= */
  const RAINBOW = [['红', '#e03131'], ['橙', '#fd7e14'], ['黄', '#fcc419'], ['绿', '#40c057'], ['蓝', '#1c7ed6'], ['靛', '#3b5bdb'], ['紫', '#9c36b5']];

  Sci.register({
    id: 'rainbow',
    subject: 'physics',
    level: 1,
    emoji: '🌈',
    title: '彩虹的颜色',
    desc: '白白的阳光里，藏着七种颜色',
    intro: '雨后的天空有时会挂起一道彩虹。彩虹的颜色是从哪里来的呢？阳光看起来是白色的，其实里面藏着秘密！把三棱镜拖到白光照过来的地方，看看会发生什么，再把彩虹的七种颜色一个一个找出来。',
    goal: '用三棱镜分出彩虹，并找出全部 7 种颜色',
    fact: '<p>阳光看起来是白色的，其实是由<b>红、橙、黄、绿、蓝、靛、紫</b>七种颜色的光混合成的。</p><p>光穿过三棱镜时会拐弯，不同颜色的光拐弯的程度不一样，紫光拐得最多，红光拐得最少，于是白光就被分成了一条彩色的光带。</p><p>🌦️ 雨后空气里飘着许多小水珠，每颗小水珠都像一个小小的三棱镜，就把阳光分成了彩虹。想看彩虹，要<b>背对着太阳</b>，看太阳对面的天空哦！</p>',
    quiz: [
      { q: '彩虹最外面（最上面）是什么颜色？', options: ['红色', '紫色', '绿色'], answer: 0, explain: '彩虹从外到里是红橙黄绿蓝靛紫。' },
      { q: '想看到彩虹，太阳应该在你的哪里？', options: ['背后', '正前方'], answer: 0, explain: '要背对太阳，看对面的天空。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const BY = 210, PX = 340, PY = 215, S = 70;
      const prism = { x: 140, y: 380 };
      let drag = null, placed = false, ask = [], t = 0;
      const found = new Set();
      const band = i => [120 + i * 32, 120 + (i + 1) * 32];

      function nextAsk() {
        const left = RAINBOW.map((c, i) => i).filter(i => !found.has(i));
        if (!left.length) { api.note('🎉 七种颜色全找到啦：红、橙、黄、绿、蓝、靛、紫！'); api.goalDone(); return; }
        ask = left[Math.floor(Math.random() * left.length)];
        api.note(`🦉 ${RAINBOW[ask][0]}色在哪里？在右边的屏幕上点一下。`);
      }
      api.pointer(st, {
        down(p) {
          if (Math.hypot(p.x - prism.x, p.y - prism.y) < 60) { drag = { ox: prism.x - p.x, oy: prism.y - p.y }; return; }
          if (placed && p.x > 660 && p.x < 760) {
            const i = RAINBOW.findIndex((c, k) => p.y >= band(k)[0] && p.y < band(k)[1]);
            if (i < 0) return;
            if (i === ask) {
              found.add(i);
              Sci.tone(400 + i * 80, 0.2, { type: 'triangle' });
              nextAsk();
            } else {
              Sci.sfx('bad');
              api.note(`这是${RAINBOW[i][0]}色哦，再找找${RAINBOW[ask][0]}色。`);
            }
          }
        },
        move(p) {
          if (!drag) return;
          prism.x = p.x + drag.ox;
          prism.y = p.y + drag.oy;
        },
        up() {
          if (!drag) return;
          drag = null;
          if (Math.hypot(prism.x - PX, prism.y - PY) < 90) {
            prism.x = PX;
            prism.y = PY;
            if (!placed) {
              placed = true;
              Sci.sfx('star');
              api.timeout(nextAsk, 1800);
              api.note('哇！白光穿过三棱镜，变成了一条彩色的光带！');
            }
          } else if (placed) {
            placed = false;
            api.note('三棱镜拿走了，光又变回了白色。');
          }
        },
      });

      function render() {
        ctx.fillStyle = '#1b1e2e';
        ctx.fillRect(0, 0, 800, 450);
        // 手电筒和白光
        D.rrect(ctx, 0, BY - 18, 50, 36, 6);
        ctx.fillStyle = '#868e96';
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        if (placed) {
          ctx.fillRect(50, BY - 5, PX - 30 - 50, 10);
          RAINBOW.forEach(([, c], i) => {
            const [a, b] = band(i);
            ctx.fillStyle = c;
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.moveTo(PX + 20, PY - 2 + i * 0.6);
            ctx.lineTo(700, a);
            ctx.lineTo(700, b);
            ctx.lineTo(PX + 20, PY + 2 + i * 0.6);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
          });
        } else {
          ctx.fillRect(50, BY - 5, 650, 10);
          D.circle(ctx, 704, BY, 16, 'rgba(255,255,255,.8)');
        }
        // 屏幕
        ctx.fillStyle = '#f1f3f5';
        ctx.fillRect(700, 90, 18, 280);
        if (placed) RAINBOW.forEach(([n, c], i) => {
          const [a, b] = band(i);
          ctx.fillStyle = c;
          ctx.fillRect(700, a, 18, b - a);
          if (found.has(i)) D.text(ctx, n, 745, (a + b) / 2, { size: 18, color: c });
        });
        // 三棱镜
        ctx.save();
        ctx.translate(prism.x, prism.y);
        ctx.beginPath();
        ctx.moveTo(0, -S);
        ctx.lineTo(S * 0.9, S * 0.55);
        ctx.lineTo(-S * 0.9, S * 0.55);
        ctx.closePath();
        ctx.fillStyle = 'rgba(200,230,255,.35)';
        ctx.fill();
        ctx.strokeStyle = '#d0ebff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        if (!placed) {
          D.text(ctx, '三棱镜', prism.x, prism.y + 60, { size: 15, color: '#d0ebff' });
          ctx.save();
          ctx.setLineDash([6, 6]);
          ctx.strokeStyle = 'rgba(255,255,255,.3)';
          ctx.beginPath();
          ctx.arc(PX, PY, 80 + Math.sin(t * 4) * 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          D.text(ctx, '👆 把三棱镜拖到这里', PX, PY - 105, { size: 16, color: '#fff' });
        }
        D.text(ctx, `找到的颜色 ${found.size}/7`, 20, 30, { size: 16, align: 'left', color: '#fff' });
      }
      api.loop(dt => { t += dt; render(); });
      api.note('👆 把左下角的三棱镜拖到白光经过的地方。');
    },
  });

  /* ================= 12. 静电魔法 ================= */
  Sci.register({
    id: 'static',
    subject: 'physics',
    level: 2,
    emoji: '🎈',
    title: '静电魔法',
    desc: '气球在头发上蹭一蹭，就能吸起小纸屑',
    intro: '冬天脱毛衣的时候，有时会听到“噼啪”声，还会被电一下，这是静电在捣蛋！拿气球在头发上来回蹭一蹭，气球就带上了静电。然后把气球靠近桌上的小纸屑，看看会发生什么神奇的事。',
    goal: '用带电的气球吸起 10 片小纸屑',
    fact: '<p>两样东西互相摩擦，会让一些看不见的“电荷”从一边跑到另一边，东西就带上了<b>静电</b>。</p><p>气球在头发上摩擦后带了电，能把轻轻的小纸屑<b>吸</b>起来，还能让头发“站”起来。</p><p>⚡ 冬天空气干燥，静电特别多。摸门把手之前，可以先用手掌摸一下墙壁，把静电放掉。天上的闪电，其实就是一次超级巨大的静电放电！</p>',
    quiz: [
      { q: '气球在头发上蹭过以后，为什么能吸起小纸屑？', options: ['气球带上了静电', '气球变黏了'], answer: 0, explain: '摩擦让气球带上了静电。' },
      { q: '什么季节最容易有静电？', options: ['干燥的冬天', '潮湿的夏天'], answer: 0, explain: '空气干燥时，静电不容易跑掉。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const HEAD = { x: 140, y: 230 }, TABLE = 400;
      const ball = { x: 400, y: 150 };
      let charge = 0, drag = null, last = null, t = 0;
      const bits = [];
      for (let i = 0; i < 16; i++) bits.push({ x: 470 + (i % 8) * 38 + rand(-6, 6), y: TABLE - 4, r: rand(0, 6), stuck: false, ox: 0, oy: 0 });
      const picked = () => bits.filter(b => b.stuck).length;

      api.pointer(st, {
        down(p) {
          if (Math.hypot(p.x - ball.x, p.y - ball.y) < 70) { drag = { ox: ball.x - p.x, oy: ball.y - p.y }; last = { x: p.x, y: p.y }; }
        },
        move(p) {
          if (!drag) return;
          ball.x = clamp(p.x + drag.ox, 50, 760);
          ball.y = clamp(p.y + drag.oy, 60, TABLE - 60);
          const moved = Math.hypot(p.x - last.x, p.y - last.y);
          last = { x: p.x, y: p.y };
          if (Math.hypot(ball.x - HEAD.x, ball.y - (HEAD.y - 50)) < 90 && moved > 2) {
            const before = Math.floor(charge / 20);
            charge = Math.min(100, charge + moved * 0.12);
            if (Math.floor(charge / 20) > before) { Sci.tone(1400 + charge * 8, 0.03, { type: 'square', vol: 0.03 }); }
            if (charge >= 100 && before < 5) api.note('⚡ 气球带满了静电！现在把它拿到小纸屑上方试试。');
          }
        },
        up() { drag = null; },
      });

      function render() {
        ctx.fillStyle = '#fff4e6';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#c99a63';
        ctx.fillRect(420, TABLE, 380, 50);
        // 小朋友的头和头发
        const near = Math.hypot(ball.x - HEAD.x, ball.y - (HEAD.y - 60));
        const lift = charge > 20 && near < 220 ? clamp((220 - near) / 120, 0, 1) * charge / 100 : 0;
        ctx.strokeStyle = '#5c3d2e';
        ctx.lineWidth = 3;
        for (let i = 0; i < 22; i++) {
          const a = Math.PI + (i / 21) * Math.PI;
          const bx = HEAD.x + Math.cos(a) * 52, by = HEAD.y - 10 + Math.sin(a) * 52;
          const dx = ball.x - bx, dy = ball.y - by, d = Math.hypot(dx, dy) || 1;
          const len = 26;
          const ex = bx + Math.cos(a) * len * (1 - lift) + dx / d * len * lift, ey = by + Math.sin(a) * len * (1 - lift) * 0.4 + dy / d * len * lift + (1 - lift) * 10;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.quadraticCurveTo((bx + ex) / 2 + Math.sin(t * 3 + i) * 2, (by + ey) / 2, ex, ey);
          ctx.stroke();
        }
        D.circle(ctx, HEAD.x, HEAD.y, 55, '#ffd8a8');
        D.text(ctx, lift > 0.3 ? '😲' : '🙂', HEAD.x, HEAD.y + 5, { size: 44 });
        ctx.fillStyle = '#74c0fc';
        D.rrect(ctx, HEAD.x - 60, HEAD.y + 55, 120, 110, 30);
        ctx.fill();
        // 纸屑（桌上的先画，粘在气球上的等气球画完再画）
        const drawBit = b => {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.r);
          ctx.fillStyle = '#fff';
          ctx.fillRect(-7, -4, 14, 8);
          ctx.strokeStyle = '#adb5bd';
          ctx.lineWidth = 1;
          ctx.strokeRect(-7, -4, 14, 8);
          ctx.restore();
        };
        bits.filter(b => !b.stuck).forEach(drawBit);
        // 气球
        ctx.strokeStyle = '#868e96';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y + 62);
        ctx.quadraticCurveTo(ball.x + 10, ball.y + 90, ball.x, ball.y + 120);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(ball.x, ball.y, 48, 60, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6b6b';
        ctx.fill();
        D.circle(ctx, ball.x - 16, ball.y - 24, 9, 'rgba(255,255,255,.5)');
        bits.filter(b => b.stuck).forEach(drawBit);
        for (let i = 0; i < Math.floor(charge / 10); i++) {
          const a = i / 10 * Math.PI * 2 + t;
          D.text(ctx, '−', ball.x + Math.cos(a) * 30, ball.y + Math.sin(a) * 38, { size: 18, color: '#fff' });
        }
        // 静电表
        D.text(ctx, '静电', 620, 30, { size: 15, color: '#6f6a85' });
        ctx.fillStyle = '#e9ecef';
        ctx.fillRect(650, 22, 130, 16);
        ctx.fillStyle = '#fab005';
        ctx.fillRect(650, 22, 1.3 * charge, 16);
        D.text(ctx, `吸起了 ${picked()} 片纸屑`, 715, 60, { size: 16, color: '#2b2840' });
        D.text(ctx, '👆 拖着气球在头发上来回蹭', 20, 30, { size: 15, align: 'left', color: '#6f6a85', weight: 'normal' });
      }
      api.loop(dt => {
        t += dt;
        bits.forEach(b => {
          if (b.stuck) {
            b.x = ball.x + b.ox;
            b.y = ball.y + b.oy;
            return;
          }
          const d = Math.hypot(ball.x - b.x, ball.y - b.y);
          const reach = 40 + charge * 1.2;
          if (charge > 15 && d < reach) {
            b.x += (ball.x - b.x) * dt * 6;
            b.y += (ball.y + 40 - b.y) * dt * 6;
            if (Math.hypot(ball.x - b.x, ball.y + 40 - b.y) < 30) {
              b.stuck = true;
              const a = rand(0.3, 2.8);
              b.ox = Math.cos(a) * 46;
              b.oy = Math.sin(a) * 56;
              charge = Math.max(0, charge - 4);
              Sci.sfx('pop');
              if (picked() === 10) { api.note('🎉 吸起了 10 片纸屑！带电的气球真有魔力。'); api.goalDone(); }
            }
          } else if (b.y < TABLE - 4) {
            b.y = Math.min(TABLE - 4, b.y + dt * 300);
          }
        });
        render();
      });
      api.button('👐 抖掉纸屑、放掉静电', () => {
        bits.forEach(b => { if (b.stuck) { b.stuck = false; b.y = Math.min(b.y, TABLE - 60); } });
        charge = 0;
      });
      api.note('👆 按住气球，在小朋友的头发上来回蹭一蹭。');
    },
  });

  /* ================= 13. 惯性的秘密 ================= */
  Sci.register({
    id: 'inertia',
    subject: 'physics',
    level: 3,
    emoji: '🍽️',
    title: '惯性的秘密',
    desc: '快速抽桌布，盘子为什么不会掉？',
    intro: '魔术师猛地一抽桌布，桌上的盘子竟然纹丝不动！这不是魔法，而是“惯性”在帮忙。来试试快速抽和慢慢拉有什么不同；再坐上小车来一个急刹车，看看系不系安全带有多大区别。',
    goal: '桌布快抽、慢拉各试一次，小车系、不系安全带各刹车一次',
    fact: '<p>所有物体都有一种“保持原来样子”的本领：静止的东西想继续静止，运动的东西想继续运动，这叫<b>惯性</b>。</p><p>快速抽桌布时，盘子还来不及跟着动，就留在了原地；慢慢拉的时候，桌布有足够的时间把盘子带走。</p><p>🚗 汽车急刹车时，车停了，人却还想往前冲，所以坐车一定要<b>系好安全带</b>。越重、跑得越快的东西，惯性越大，越难停下来。</p>',
    quiz: [
      { q: '公交车突然刹车，站着的乘客会往哪边倒？', options: ['往前倒', '往后倒'], answer: 0, explain: '车停了，人由于惯性还在往前运动。' },
      { q: '坐汽车为什么要系安全带？', options: ['防止急刹车时人往前冲', '让座位更舒服'], answer: 0, explain: '安全带能在急刹车时拉住我们。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let mode = 'cloth', anim = null, belt = false, t = 0;
      const done = new Set();

      function check() {
        if (done.size === 4) api.timeout(() => { api.note('🎉 你已经认识惯性啦！物体总想保持原来的样子。'); api.goalDone(); }, 1500);
      }
      function pull(fast) {
        if (anim) return;
        anim = { kind: fast ? 'fast' : 'slow', k: 0, dur: fast ? 0.35 : 2.2 };
        Sci.sfx('whoosh');
      }
      function brake() {
        if (anim) return;
        anim = { kind: belt ? 'belt' : 'nobelt', k: 0, dur: 3 };
      }
      function finish(a) {
        const msg = {
          fast: '✨ 唰！桌布被抽走了，盘子和杯子还留在桌上——它们由于惯性，还来不及跟着动。',
          slow: '慢慢拉的时候，桌布把盘子一起带走了，掉在了地上！',
          nobelt: '急刹车！车停了，小熊却由于惯性继续往前冲，飞了出去！太危险了。',
          belt: '急刹车！系了安全带的小熊被拉住了，安全！',
        }[a.kind];
        api.note(msg);
        Sci.sfx(a.kind === 'fast' || a.kind === 'belt' ? 'good' : 'bad');
        const first = !done.has(a.kind);
        done.add(a.kind);
        if (first) check();
      }

      function renderCloth() {
        ctx.fillStyle = '#fff8f0';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#d9c3a5';
        ctx.fillRect(0, 400, 800, 50);
        const k = anim ? anim.k : 0, kind = anim && (anim.kind === 'fast' || anim.kind === 'slow') ? anim.kind : null;
        // 桌子
        ctx.fillStyle = '#8d5a3b';
        ctx.fillRect(220, 250, 360, 16);
        ctx.fillRect(240, 266, 16, 134);
        ctx.fillRect(544, 266, 16, 134);
        // 桌布被往右抽
        const clothX = kind ? k * 460 : 0;
        ctx.fillStyle = '#e03131';
        ctx.fillRect(210 + clothX, 242, 380, 10);
        for (let x = 210 + clothX; x < 590 + clothX; x += 20) { ctx.fillStyle = '#fff'; ctx.fillRect(x, 242, 10, 10); }
        // 盘子和杯子
        let dx = 0, dy = 0, rot = 0;
        if (kind === 'slow') {
          dx = k * 460;
          if (210 + dx > 560) { const over = (dx - 300) / 160; dy = clamp(over, 0, 1) * 150; rot = clamp(over, 0, 1) * 1.2; }
        }
        ctx.save();
        ctx.translate(400 + dx, 220 + dy);
        ctx.rotate(rot);
        D.emoji(ctx, '🍽️', -40, 0, 50);
        D.emoji(ctx, '🥛', 40, -4, 46);
        ctx.restore();
        D.emoji(ctx, '✋', 600 + clothX, 250, 44);
      }
      function renderCar() {
        ctx.fillStyle = '#e7f5ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#868e96';
        ctx.fillRect(0, 380, 800, 70);
        ctx.fillStyle = '#fff';
        for (let x = 0; x < 800; x += 80) ctx.fillRect((x - (t * 200 * (anim && anim.k > 0.35 ? 0 : 1)) % 80 + 80) % 880 - 80, 412, 40, 6);
        const k = anim && (anim.kind === 'belt' || anim.kind === 'nobelt') ? anim.k : 0;
        const carX = 300;
        // 车
        D.rrect(ctx, carX - 110, 290, 220, 70, 14);
        ctx.fillStyle = '#ffd43b';
        ctx.fill();
        D.circle(ctx, carX - 65, 365, 24, '#343a40');
        D.circle(ctx, carX + 65, 365, 24, '#343a40');
        ctx.fillStyle = '#495057';
        ctx.fillRect(carX + 60, 230, 10, 60);
        // 小熊
        let bx = carX - 20, by = 262, rot = 0;
        if (anim && anim.kind === 'nobelt' && k > 0.3) {
          const f = clamp((k - 0.3) / 0.5, 0, 1);
          bx += f * 380;
          by += -Math.sin(f * Math.PI) * 120 + f * f * 120;
          rot = f * 6;
        } else if (anim && anim.kind === 'belt' && k > 0.3) {
          bx += Math.sin(clamp((k - 0.3) / 0.2, 0, 1) * Math.PI) * 20;
        }
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(rot);
        D.emoji(ctx, '🧸', 0, 0, 56);
        ctx.restore();
        if (belt && !(anim && anim.kind === 'nobelt')) {
          ctx.strokeStyle = '#212529';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(bx - 22, by - 20);
          ctx.lineTo(bx + 18, by + 22);
          ctx.stroke();
        }
        D.text(ctx, k > 0.3 && k < 0.5 ? '吱——急刹车！' : '', carX, 200, { size: 24, color: '#e03131' });
      }
      api.loop(dt => {
        t += dt;
        if (anim) {
          anim.k = Math.min(1, anim.k + dt / anim.dur);
          if (anim.k >= 1) { const a = anim; anim = null; finish(a); }
        }
        if (mode === 'cloth') renderCloth();
        else renderCar();
        const items = [['fast', '快速抽桌布'], ['slow', '慢慢拉桌布'], ['nobelt', '不系安全带刹车'], ['belt', '系安全带刹车']];
        items.forEach(([k, s], i) => D.text(ctx, (done.has(k) ? '✅ ' : '⬜ ') + s, 20, 26 + i * 24, { size: 15, align: 'left', color: '#2b2840' }));
      });
      api.choice([['cloth', '🍽️ 抽桌布魔术'], ['car', '🚗 小车急刹车']], mode, v => {
        if (anim) return;
        mode = v;
        clothRow.hidden = v !== 'cloth';
        carRow.hidden = v !== 'car';
        api.note(v === 'cloth' ? '试试快速一抽，和慢慢拉，有什么不同？' : '小车开起来了，点“急刹车”，看看小熊会怎样。');
      });
      const clothRow = api.row();
      api.button('⚡ 快速一抽', () => pull(true), clothRow);
      api.button('🐢 慢慢拉', () => pull(false), clothRow);
      const carRow = api.row();
      api.toggle('🔒 系安全带', false, v => { belt = v; }, carRow);
      api.button('🛑 急刹车', brake, carRow);
      carRow.hidden = true;
      api.note('👆 点“快速一抽”，看看盘子会不会掉。');
    },
  });

  /* ================= 14. 电磁铁 ================= */
  Sci.register({
    id: 'electromagnet',
    subject: 'physics',
    level: 4,
    emoji: '🧲',
    title: '电磁铁',
    desc: '通上电就变成磁铁，断了电就没磁性',
    intro: '把导线一圈一圈绕在铁钉上，再接上电池，铁钉就变成了一块磁铁！这就是“电磁铁”。改变线圈的圈数、电池的节数，或者把铁钉抽出来，看看它能吸起多少枚回形针。',
    goal: '让电磁铁吸起 12 枚以上的回形针，再断电看看',
    fact: '<p>电流通过导线时，导线周围会产生<b>磁场</b>。把导线绕成线圈，磁场就集中起来；线圈里再放一根铁芯，磁性会大大增强，这就是<b>电磁铁</b>。</p><p>电磁铁的磁性：<b>线圈圈数越多、电流越大</b>（电池越多），磁性越强；有铁芯比没铁芯强得多。最神奇的是：<b>通电有磁性，断电就消失</b>。</p><p>🏗️ 废品站用巨大的电磁铁吊起废铁，放下时只要断电就行。电铃、电动机、磁悬浮列车里都有电磁铁。</p>',
    quiz: [
      { q: '怎样让电磁铁的磁性变强？', options: ['增加线圈的圈数', '把铁芯抽出来', '断开开关'], answer: 0, explain: '圈数越多、电流越大，磁性越强。' },
      { q: '电磁铁断电以后会怎样？', options: ['磁性基本消失', '磁性变得更强'], answer: 0, explain: '电磁铁通电才有磁性。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const NX = 400, TIP = 250, PILE = 400;
      let turns = 20, cells = 1, core = true, on = false, t = 0, best = 0;
      const clips = [];
      for (let i = 0; i < 24; i++) clips.push({ x: 300 + (i % 12) * 17 + rand(-4, 4), y: PILE - Math.floor(i / 12) * 8, hx: 0, hy: 0, up: false });
      clips.forEach(c => { c.hx = c.x; c.hy = c.y; });
      const power = () => (on ? turns * cells * (core ? 5 : 1) / 30 : 0);
      const lifted = () => Math.min(20, Math.floor(power()));

      function update() {
        const n = lifted();
        clips.forEach((c, i) => { c.up = i < n; });
        if (on) {
          api.note(`吸起了 ${n} 枚回形针！（${turns} 圈线圈，${cells} 节电池，${core ? '有' : '没有'}铁芯）`);
          if (n > best) best = n;
          if (n >= 12 && !done12) { done12 = true; Sci.sfx('star'); api.note(`🧲 吸起了 ${n} 枚！现在点开关断电，看看会怎样？`); }
        } else if (done12 && n === 0) {
          api.note('断电了，回形针全都掉下来了——电磁铁没电就没有磁性。');
          api.goalDone();
        }
      }
      let done12 = false;
      api.pointer(st, {
        down(p) { if (Math.hypot(p.x - 660, p.y - 120) < 60) { on = !on; Sci.sfx('clack'); update(); } },
      });

      function clip(x, y, a) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.strokeStyle = '#868e96';
        ctx.lineWidth = 2;
        D.rrect(ctx, -4, -9, 8, 18, 4);
        ctx.stroke();
        ctx.restore();
      }
      function render() {
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#ced4da';
        ctx.fillRect(250, PILE + 8, 300, 12);
        // 铁钉
        if (core) {
          ctx.fillStyle = '#868e96';
          ctx.fillRect(NX - 6, 60, 12, TIP - 60);
          ctx.fillRect(NX - 18, 52, 36, 10);
          ctx.beginPath();
          ctx.moveTo(NX - 6, TIP);
          ctx.lineTo(NX + 6, TIP);
          ctx.lineTo(NX, TIP + 16);
          ctx.fill();
        }
        // 线圈
        const n = Math.round(turns / 5);
        ctx.strokeStyle = on ? '#e8590c' : '#c77d2e';
        ctx.lineWidth = 3;
        for (let i = 0; i < n; i++) {
          const y = 80 + i * (150 / n);
          ctx.beginPath();
          ctx.ellipse(NX, y, 16, 5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        // 导线、开关和电池
        ctx.beginPath();
        ctx.moveTo(NX + 16, 80);
        ctx.lineTo(620, 80);
        ctx.moveTo(NX + 16, 230);
        ctx.lineTo(700, 230);
        ctx.lineTo(700, 160);
        ctx.stroke();
        // 电池串在下面那根导线上
        for (let i = 0; i < cells; i++) {
          D.rrect(ctx, 470 + i * 64, 216, 58, 28, 6);
          ctx.fillStyle = '#2f9e44';
          ctx.fill();
          ctx.fillStyle = '#c0392b';
          ctx.fillRect(470 + i * 64 + 58, 224, 5, 12);
          D.text(ctx, '电池', 499 + i * 64, 230, { size: 13, color: '#fff' });
        }
        D.circle(ctx, 620, 80, 6, '#495057');
        D.circle(ctx, 700, 160, 6, '#495057');
        ctx.strokeStyle = '#495057';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(620, 80);
        if (on) ctx.lineTo(700, 160);
        else ctx.lineTo(690, 60);
        ctx.stroke();
        D.text(ctx, on ? '开关：合上' : '开关：断开（点一下）', 680, 40, { size: 15, color: on ? '#2f9e44' : '#c0392b' });
        // 磁场
        if (on) for (let r = 1; r <= Math.min(5, Math.ceil(power() / 3)); r++) {
          ctx.strokeStyle = `rgba(255,120,0,${0.4 - r * 0.06})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(NX, 160, 30 + r * 18, 90 + r * 12, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        clips.forEach((c, i) => clip(c.x, c.y, c.up ? Math.sin(t * 5 + i) * 0.2 : 1.57));
        D.text(ctx, `吸起 ${lifted()} 枚`, 140, 120, { size: 26, color: '#c0620a' });
        D.text(ctx, `最多吸起过 ${best} 枚`, 140, 156, { size: 15, color: '#6f6a85', weight: 'normal' });
      }
      api.loop(dt => {
        t += dt;
        clips.forEach((c, i) => {
          const tx = c.up ? NX + ((i % 5) - 2) * 9 : c.hx, ty = c.up ? TIP + 20 + Math.floor(i / 5) * 16 : c.hy;
          c.x += (tx - c.x) * Math.min(1, dt * 8);
          c.y += (ty - c.y) * Math.min(1, dt * (c.up ? 8 : 5));
        });
        render();
      });
      api.slider('线圈圈数', 10, 60, 10, turns, v => { turns = v; update(); }, v => v + ' 圈');
      api.slider('电池', 1, 3, 1, cells, v => { cells = v; update(); }, v => v + ' 节');
      api.toggle('🔩 铁芯', true, v => { core = v; update(); });
      api.note('👆 点右上角的开关接通电路，看看能吸起几枚回形针。');
    },
  });

  /* ================= 15. 过山车与能量 ================= */
  Sci.register({
    id: 'coaster',
    subject: 'physics',
    level: 5,
    emoji: '🎢',
    title: '过山车与能量',
    desc: '起点要多高，过山车才能翻过大圆环？',
    intro: '过山车没有发动机，却能冲上高高的圆环，靠的是什么？靠的是“能量”！小车被拉到高处，就储存了能量；往下冲时，这些能量变成了速度。调整起点的高度，看看小车能不能翻过圆环，同时观察下面的能量条怎么变化。',
    goal: '让小车翻过圆环一次，也让它失败一次',
    fact: '<p>高处的物体具有<b>重力势能</b>，跑动的物体具有<b>动能</b>。过山车往下冲时，势能变成动能，越跑越快；往上爬时，动能又变回势能，越跑越慢。</p><p>如果没有摩擦，能量的总数不会变，这叫<b>能量守恒</b>。但真实的过山车会有摩擦，一部分能量变成了热量，所以终点总是比起点低。</p><p>🎢 想翻过半径为 R 的圆环，起点至少要比底部高出 <b>2.5 个 R</b>，在最高点才有足够的速度贴着轨道转过去。</p>',
    quiz: [
      { q: '过山车从高处往下冲时，什么能量变成了什么能量？', options: ['势能变成动能', '动能变成势能'], answer: 0, explain: '高度降低、速度变快，势能变成了动能。' },
      { q: '为什么过山车的终点总比起点低？', options: ['摩擦把一部分能量变成了热', '小车变轻了'], answer: 0, explain: '摩擦让能量变成了热，机械能变少了。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const G = 380, R = 70, LX = 470, X0 = 60, X1 = 300, GR = 700;
      let h = 200, fric = true, car = null, ok = false, fail = false, t = 0;
      // 摩擦损失的能量（以“高度”计算），走得越远损失越多
      const lossPer = () => (fric ? 0.03 : 0);

      function go() {
        if (car && !car.done) return;
        car = { seg: 0, s: 0, dist: 0, done: false, fall: null, theta: 0 };
        Sci.sfx('whoosh');
      }
      const slopeLen = () => Math.hypot(X1 - X0, h);
      function heightOf(c) {
        if (c.seg === 0) return h * (1 - c.s / slopeLen());
        if (c.seg === 2) return R - R * Math.cos(c.theta);
        return 0;
      }
      function pos(c) {
        if (c.seg === 0) { const f = c.s / slopeLen(); return [lerp(X0, X1, f), lerp(G - h, G, f), Math.atan2(h, X1 - X0)]; }
        if (c.seg === 1) return [X1 + c.s, G, 0];
        if (c.seg === 2) return [LX + Math.sin(c.theta) * R, G - R + Math.cos(c.theta) * R, -c.theta];
        return [LX + c.s, G, 0];
      }
      // 起点轻轻推一下（多给 6 像素高度的能量），小车才会出发
      function v2(c) { return 2 * GR * (h + 6 - heightOf(c) - c.dist * lossPer()); }

      function step(dt) {
        const c = car;
        if (c.fall) {
          c.fall.vy += GR * dt;
          c.fall.x += c.fall.vx * dt;
          c.fall.y += c.fall.vy * dt;
          if (c.fall.y > G) { c.fall.y = G; c.done = true; }
          return;
        }
        const sp2 = v2(c);
        if (sp2 <= 0 && c.seg !== 2) { c.done = true; return; }
        const v = Math.sqrt(Math.max(sp2, 0));
        if (c.seg === 2) {
          // 圆环里：速度不够、贴不住轨道时就会掉下来
          if (c.theta > Math.PI / 2 && sp2 / R < -GR * Math.cos(c.theta)) {
            const [x, y] = pos(c);
            c.fall = { x, y, vx: Math.cos(c.theta) * v, vy: -Math.sin(c.theta) * v };
            return;
          }
          c.theta += v / R * dt;
          c.dist += v * dt;
          if (c.theta >= Math.PI * 2) { c.seg = 3; c.s = 0; }
          return;
        }
        c.s += v * dt;
        c.dist += v * dt;
        if (c.seg === 0 && c.s >= slopeLen()) { c.seg = 1; c.s = 0; }
        else if (c.seg === 1 && c.s >= LX - X1) { c.seg = 2; c.theta = 0; }
        else if (c.seg === 3 && c.s >= 760 - LX) { c.done = true; }
      }
      function result() {
        if (car.fall) {
          fail = true;
          Sci.sfx('bad');
          api.note(`起点 ${(h / R).toFixed(1)} 个 R 高：速度不够，在圆环上贴不住，掉下来了！再升高一点试试。`);
        } else if (car.seg === 3) {
          ok = true;
          Sci.sfx('star');
          api.note(`🎉 翻过去了！起点 ${(h / R).toFixed(1)} 个 R 高。` + (fric ? '有摩擦时，起点要比 2.5 个 R 再高一点。' : ''));
        } else api.note('小车冲不上去，又滑回来了。');
        if (ok && fail) api.goalDone();
      }

      function render() {
        ctx.fillStyle = '#e7f5ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#b2f2bb';
        ctx.fillRect(0, G + 10, 800, 450 - G - 10);
        // 轨道
        ctx.strokeStyle = '#495057';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(X0 - 30, G - h);
        ctx.lineTo(X0, G - h);
        ctx.lineTo(X1, G);
        ctx.lineTo(780, G);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(LX, G - R, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#adb5bd';
        ctx.fillRect(X0 - 34, G - h, 8, h);
        // 2.5R 参考线
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#e8590c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, G - 2.5 * R);
        ctx.lineTo(560, G - 2.5 * R);
        ctx.stroke();
        ctx.restore();
        D.text(ctx, '2.5 R', 590, G - 2.5 * R, { size: 14, color: '#e8590c' });
        // 小车
        let x, y, a;
        if (!car) [x, y, a] = [X0, G - h, Math.atan2(h, X1 - X0)];
        else if (car.fall) [x, y, a] = [car.fall.x, car.fall.y, t * 6];
        else [x, y, a] = pos(car);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        D.rrect(ctx, -18, -24, 36, 20, 6);
        ctx.fillStyle = '#e03131';
        ctx.fill();
        D.circle(ctx, -10, -3, 5, '#212529');
        D.circle(ctx, 10, -3, 5, '#212529');
        ctx.restore();
        // 能量条
        const hh = car && !car.fall ? heightOf(car) : car && car.fall ? clamp(G - car.fall.y, 0, 300) : h;
        const loss = car ? Math.min(h, car.dist * lossPer()) : 0;
        const pe = hh, ke = Math.max(0, h - hh - loss);
        const bars = [['势能', pe, '#4c6ef5'], ['动能', ke, '#fa5252'], ['变成热', loss, '#fab005']];
        D.rrect(ctx, 600, 20, 185, 120, 12);
        ctx.fillStyle = '#fff';
        ctx.fill();
        bars.forEach(([n, v, c], i) => {
          D.text(ctx, n, 615, 45 + i * 34, { size: 14, align: 'left' });
          ctx.fillStyle = '#f1f3f5';
          ctx.fillRect(670, 36 + i * 34, 100, 16);
          ctx.fillStyle = c;
          ctx.fillRect(670, 36 + i * 34, 100 * clamp(v / Math.max(h, 1), 0, 1), 16);
        });
        D.text(ctx, `起点高度：${(h / R).toFixed(1)} 个 R`, 20, 30, { size: 17, align: 'left', color: '#2b2840' });
        D.text(ctx, `${ok ? '✅' : '⬜'} 翻过圆环　${fail ? '✅' : '⬜'} 失败一次`, 20, 58, { size: 15, align: 'left', color: '#2b2840' });
      }
      api.loop(dt => {
        t += dt;
        if (car && !car.done) {
          for (let k = 0; k < 8 && !car.done; k++) step(dt / 8);
          if (car.done) result();
        }
        render();
      });
      api.button('🎢 出发！', go);
      api.slider('起点高度', 100, 300, 5, h, v => { if (!car || car.done) { h = v; car = null; } }, v => (v / R).toFixed(1) + ' R');
      api.toggle('🔥 有摩擦', true, v => { fric = v; });
      api.note('👆 调好起点高度，点“出发！”。先试试低一点的起点。');
    },
  });
})();
