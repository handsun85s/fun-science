/* 宇宙探险（第二组）：星座连连看 → 火箭为什么能飞 → 日食和月食 → 去别的星球跳一跳 → 宜居带 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 6. 星座连连看 ================= */
  const CONSTS = [
    { id: 'dipper', name: '北斗七星', stars: [[150, 250], [215, 228], [275, 222], [335, 232], [345, 300], [430, 305], [440, 225]], seq: [0, 1, 2, 3, 4, 5, 6, 3], tip: '北斗七星像一把勺子！把勺口的两颗星连起来，往上延长大约 5 倍，就能找到北极星，它总在北方。' },
    { id: 'orion', name: '猎户座', stars: [[330, 90], [470, 100], [385, 225], [410, 220], [435, 215], [350, 350], [490, 340]], seq: [2, 0, 1, 4, 3, 2, 5, 6, 4], tip: '猎户座像一个猎人，腰带上有三颗星排成一条直线，冬天的夜空里特别好找。' },
    { id: 'cass', name: '仙后座', stars: [[220, 190], [310, 260], [400, 200], [490, 265], [580, 190]], seq: [0, 1, 2, 3, 4], tip: '仙后座的 5 颗亮星排成一个字母“W”，它和北斗七星分别在北极星的两边。' },
  ];

  Sci.register({
    id: 'constellation',
    subject: 'astronomy',
    level: 1,
    emoji: '✨',
    title: '星座连连看',
    desc: '把星星连起来，夜空里就有了图画',
    intro: '很久很久以前，人们抬头看夜空，把亮亮的星星用想象的线连起来，变成了勺子、猎人这样的图画，这就是“星座”。按照数字的顺序点一闪一闪的星星，把三个有名的星座连出来吧！',
    goal: '连好北斗七星、猎户座和仙后座',
    fact: '<p><b>星座</b>是人们把夜空中的星星分成的一个个区域，全天一共有 <b>88 个</b>星座。</p><p>天上的星星其实都是像太阳一样会发光的大火球，只是离我们太远了，看起来才像小小的亮点。</p><p>🧭 <b>北斗七星</b>像一把勺子，勺口两颗星的连线延长约 5 倍，就能找到<b>北极星</b>。北极星几乎一动不动地待在北方，古时候的人晚上迷了路，就靠它辨认方向。</p>',
    quiz: [
      { q: '北斗七星有几颗亮星？', options: ['5 颗', '7 颗', '9 颗'], answer: 1, explain: '“北斗七星”就是七颗星。' },
      { q: '夜晚迷路时，可以靠哪颗星找到北方？', options: ['北极星', '离月亮最近的星'], answer: 0, explain: '北极星总是在北方。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const bg = [];
      for (let i = 0; i < 120; i++) bg.push({ x: rand(0, 800), y: rand(0, 450), r: rand(0.6, 1.8), p: rand(0, 6) });
      let cur = CONSTS[0], step = 0, t = 0;
      const done = new Set();

      api.pointer(st, {
        down(p) {
          if (step >= cur.seq.length) return;
          const want = cur.stars[cur.seq[step]];
          if (Math.hypot(p.x - want[0], p.y - want[1]) < 30) {
            step++;
            Sci.tone(500 + step * 60, 0.15, { type: 'triangle' });
            if (step === cur.seq.length) {
              done.add(cur.id);
              Sci.sfx('star');
              api.note(`🌟 ${cur.name}连好了！${cur.tip}` + (done.size < 3 ? '换一个星座试试。' : ''));
              if (done.size === 3) api.goalDone();
            }
            return;
          }
          if (cur.stars.some(s => Math.hypot(p.x - s[0], p.y - s[1]) < 30)) api.note('不是这颗哦，找一找正在一闪一闪、标着数字的那颗星。');
        },
      });

      function render() {
        const g = ctx.createLinearGradient(0, 0, 0, 450);
        g.addColorStop(0, '#0b1033');
        g.addColorStop(1, '#1d2b64');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 800, 450);
        bg.forEach(s => D.circle(ctx, s.x, s.y, s.r, `rgba(255,255,255,${0.4 + 0.3 * Math.sin(t * 2 + s.p)})`));
        // 已经连好的线
        ctx.strokeStyle = 'rgba(140,200,255,.9)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i < step; i++) {
          const [x, y] = cur.stars[cur.seq[i]];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        cur.stars.forEach(([x, y]) => {
          D.circle(ctx, x, y, 14, 'rgba(255,240,180,.15)');
          D.circle(ctx, x, y, 5, '#fff7d6');
        });
        if (step < cur.seq.length) {
          const [x, y] = cur.stars[cur.seq[step]];
          D.circle(ctx, x, y, 16 + Math.sin(t * 6) * 4, null, '#ffd43b', 3);
          D.text(ctx, String(step + 1), x + 22, y - 20, { size: 18, color: '#ffd43b' });
        } else {
          D.text(ctx, cur.name, 620, 400, { size: 32, color: '#ffd43b' });
          if (cur.id === 'dipper') {
            const [mx, my] = cur.stars[5], [dx, dy] = cur.stars[6];
            const px = dx + (dx - mx) * 2.4, py = dy + (dy - my) * 2.4;
            ctx.save();
            ctx.setLineDash([6, 8]);
            ctx.strokeStyle = 'rgba(255,212,59,.7)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(dx, dy);
            ctx.lineTo(px, py);
            ctx.stroke();
            ctx.restore();
            D.circle(ctx, px, py, 7, '#ffe066');
            D.text(ctx, '北极星（实际要延长约 5 倍）', px + 18, py, { size: 15, align: 'left', color: '#ffe066' });
          }
        }
        CONSTS.forEach((c, i) => D.text(ctx, `${done.has(c.id) ? '✅' : '⬜'} ${c.name}`, 20, 30 + i * 28, { size: 16, align: 'left', color: '#fff' }));
      }
      api.loop(dt => { t += dt; render(); });
      api.choice(CONSTS.map(c => [c.id, c.name]), cur.id, v => {
        cur = CONSTS.find(c => c.id === v);
        step = done.has(v) ? cur.seq.length : 0;
        api.note(done.has(v) ? `${cur.name}已经连好啦。` : `按数字顺序，把${cur.name}连起来！`);
      });
      api.button('🔄 重新连', () => { step = 0; });
      api.note('👆 点那颗一闪一闪、标着“1”的星星，按顺序连下去。');
    },
  });

  /* ================= 7. 火箭为什么能飞 ================= */
  Sci.register({
    id: 'rocket',
    subject: 'astronomy',
    level: 2,
    emoji: '🚀',
    title: '火箭为什么能飞',
    desc: '从气球火箭到真火箭：往后喷，往前飞',
    intro: '吹鼓一个气球，捏住口子再松手，气球会“嗖”地飞出去！火箭飞上太空也是同一个道理。先玩一玩穿在绳子上的气球火箭，看看要吹几口气才能飞到终点；再来发射一枚真正的火箭！',
    goal: '让气球火箭飞到终点，再把火箭送上太空',
    fact: '<p>气球松手后，里面的空气往<b>后</b>喷出去，空气也会反过来把气球往<b>前</b>推，这叫做“<b>力的作用是相互的</b>”。</p><p>火箭也一样：燃料燃烧产生大量的热气，从尾部猛烈地向下喷出，热气就把火箭向上推。所以火箭不需要“踩”着空气，在没有空气的太空里也能加速。</p><p>🚀 火箭要飞到离地面 <b>100 千米</b>以上才算进入太空。为了飞得更高，火箭常常分成几节，燃料用完的那一节会丢掉，让火箭变轻。</p>',
    quiz: [
      { q: '气球里的气往左喷，气球会往哪边跑？', options: ['往左', '往右'], answer: 1, explain: '气往后喷，气球就往前跑。' },
      { q: '火箭在没有空气的太空里还能加速吗？', options: ['能，它自己往后喷气', '不能，没有空气可以推'], answer: 0, explain: '火箭靠自己喷出的气体推动，不需要空气。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const SY = 210, X0 = 90, FLAG = 700;
      let mode = 'balloon', air = 0, b = null, bx = X0, t = 0, okB = false, okR = false;
      let r = null;
      const puffs = [];

      function release() {
        if (mode !== 'balloon' || b) return;
        if (!air) { api.note('气球还是瘪的，先吹几口气吧！'); return; }
        b = { k: 0, from: bx, dist: air * 135, dur: 1.2 + air * 0.25, air };
        Sci.sfx('whoosh');
      }
      function launch() {
        if (r && r.alt < 100) return;
        r = { alt: 0, v: 0, fuel: 1, t: 0, stage: 1, drop: null };
        Sci.sfx('whoosh');
        api.note('3、2、1，点火！燃气向下喷，火箭向上飞！');
      }
      function check() {
        if (okB && okR) api.goalDone();
      }

      function renderBalloon() {
        ctx.fillStyle = '#eef6ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#ced4da';
        ctx.fillRect(40, SY - 120, 12, 320);
        ctx.fillRect(748, SY - 120, 12, 320);
        ctx.strokeStyle = '#868e96';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(52, SY);
        ctx.lineTo(748, SY);
        ctx.stroke();
        D.text(ctx, '🏁', FLAG + 10, SY - 50, { size: 34 });
        ctx.fillStyle = '#e03131';
        ctx.fillRect(FLAG - 1, SY - 30, 2, 60);
        const size = b ? lerp(b.air, 0.4, Math.min(1, b.k * 1.4)) : air;
        const rr = 18 + size * 9;
        puffs.forEach(p => D.circle(ctx, p.x, p.y, p.r, `rgba(160,180,210,${p.a})`));
        // 吸管和气球
        ctx.fillStyle = '#ffd43b';
        ctx.fillRect(bx - 30, SY - 4, 60, 8);
        ctx.beginPath();
        ctx.ellipse(bx + 6, SY + rr * 0.7 + 4, rr * 1.25, rr * 0.8, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6b6b';
        ctx.fill();
        D.circle(ctx, bx + 6 - rr * 1.25, SY + rr * 0.7 + 4, 5, '#c92a2a');
        D.text(ctx, `吹了 ${air} 口气`, 140, 60, { size: 20, color: '#c0620a' });
        D.text(ctx, '气往这边喷 ⬅️　　气球往这边跑 ➡️', 400, 400, { size: 18, color: '#6f6a85' });
      }
      function renderRocket() {
        const alt = r ? r.alt : 0;
        const sky = clamp(alt / 100, 0, 1);
        const g = ctx.createLinearGradient(0, 0, 0, 450);
        g.addColorStop(0, Sci.rgb(Sci.mixColor([110, 180, 255], [5, 8, 30], sky)));
        g.addColorStop(1, Sci.rgb(Sci.mixColor([200, 230, 255], [20, 25, 60], sky)));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 800, 450);
        if (sky > 0.5) for (let i = 0; i < 60; i++) D.circle(ctx, (i * 137) % 800, (i * 89) % 450, 1.2, `rgba(255,255,255,${sky - 0.4})`);
        // 地面随高度往下走
        const gy = 400 + alt * 14;
        if (gy < 470) {
          ctx.fillStyle = '#69db7c';
          ctx.fillRect(0, gy, 800, 450);
          ctx.fillStyle = '#868e96';
          ctx.fillRect(360, gy - 120, 14, 120);
        }
        const ry = r ? clamp(300 - alt * 30, 160, 300) : 300;
        if (r && r.fuel > 0) {
          for (let i = 0; i < 8; i++) D.circle(ctx, 400 + rand(-12, 12), ry + 70 + i * 12 + rand(0, 10), 14 - i, i < 3 ? '#ffd43b' : 'rgba(255,140,40,.7)');
          D.text(ctx, '⬇ 燃气向下喷', 480, ry + 110, { size: 16, color: sky > 0.5 ? '#fff' : '#2b2840', align: 'left' });
        }
        if (r && r.drop) D.emoji(ctx, '🛢️', 400 + r.drop.x, r.drop.y, 34);
        // 火箭（画出来的，老设备也能显示）
        ctx.fillStyle = '#f1f3f5';
        D.rrect(ctx, 384, ry - 50, 32, 110, 10);
        ctx.fill();
        ctx.fillStyle = '#e03131';
        ctx.beginPath();
        ctx.moveTo(384, ry - 44);
        ctx.quadraticCurveTo(400, ry - 100, 416, ry - 44);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(384, ry + 40);
        ctx.lineTo(366, ry + 66);
        ctx.lineTo(384, ry + 60);
        ctx.moveTo(416, ry + 40);
        ctx.lineTo(434, ry + 66);
        ctx.lineTo(416, ry + 60);
        ctx.fill();
        D.circle(ctx, 400, ry - 12, 8, '#4dabf7', '#495057', 2);
        if (r && r.stage === 1) { ctx.fillStyle = '#adb5bd'; ctx.fillRect(386, ry + 22, 28, 38); }
        const c = sky > 0.5 ? '#fff' : '#2b2840';
        D.text(ctx, `高度 ${Math.round(alt)} 千米`, 30, 40, { size: 22, align: 'left', color: c });
        D.text(ctx, alt >= 100 ? '🌌 进入太空啦！' : '太空：100 千米以上', 30, 72, { size: 16, align: 'left', color: c });
        if (r) {
          ctx.fillStyle = 'rgba(255,255,255,.5)';
          ctx.fillRect(30, 90, 160, 14);
          ctx.fillStyle = '#ff922b';
          ctx.fillRect(30, 90, 160 * r.fuel, 14);
          D.text(ctx, '燃料', 200, 97, { size: 13, align: 'left', color: c });
        }
      }
      api.loop(dt => {
        t += dt;
        if (b) {
          b.k = Math.min(1, b.k + dt / b.dur);
          const e = 1 - Math.pow(1 - b.k, 3);
          bx = Math.min(745, b.from + b.dist * e);
          if (b.k < 0.6) for (let i = 0; i < 2; i++) puffs.push({ x: bx - 60, y: SY + 20 + rand(-8, 8), vx: -rand(150, 260), r: rand(4, 8), a: 0.8 });
          if (b.k >= 1) {
            const ok = bx >= FLAG;
            api.note(ok ? `🎉 飞到终点啦！吹了 ${b.air} 口气。气往后喷，气球往前跑！` : `飞了一段就停下了，${b.air} 口气不太够。点“回到起点”，再多吹几口试试。`);
            if (ok && !okB) { okB = true; Sci.sfx('star'); check(); }
            b = null;
            air = 0;
          }
        }
        for (let i = puffs.length - 1; i >= 0; i--) {
          const p = puffs[i];
          p.x += p.vx * dt;
          p.a -= dt * 1.4;
          p.r += dt * 6;
          if (p.a <= 0) puffs.splice(i, 1);
        }
        if (r) {
          r.t += dt;
          if (r.fuel > 0) {
            r.fuel = Math.max(0, r.fuel - dt / 6);
            r.v += dt * 9;
            if (r.stage === 1 && r.fuel < 0.45) {
              r.stage = 2;
              r.drop = { x: 0, y: 330 };
              Sci.sfx('clack');
              api.note('第一节燃料用完了，丢掉它！火箭变轻了，飞得更快。');
            }
            if (r.fuel === 0) api.note(r.alt >= 100 ? '燃料用完啦，火箭已经在太空里了！' : '燃料用完了，火箭继续往上冲……');
          } else r.v = Math.max(4, r.v - dt * 2);
          r.alt += r.v * dt;
          if (r.drop) { r.drop.y += dt * 120; r.drop.x -= dt * 30; }
          if (r.alt >= 100 && !okR) {
            okR = true;
            Sci.sfx('star');
            api.note('🌌 火箭飞到 100 千米以上，进入太空啦！它靠向下喷出燃气，被反推着向上飞。');
            check();
          }
          if (r.alt > 160) r.alt = 160;
        }
        if (mode === 'balloon') renderBalloon();
        else renderRocket();
      });
      api.choice([['balloon', '🎈 气球火箭'], ['rocket', '🚀 发射火箭']], mode, v => {
        mode = v;
        bRow.hidden = v !== 'balloon';
        rRow.hidden = v !== 'rocket';
        api.note(v === 'balloon' ? '吹几口气，再松手，看看气球能不能飞到终点。' : '点“点火发射”，把火箭送上太空！');
      });
      const bRow = api.row();
      api.button('💨 吹一口气', () => {
        if (b) return;
        if (air >= 5) { api.note('再吹就要爆啦！'); return; }
        if (bx > X0) { api.note('先点“回到起点”。'); return; }
        air++;
        Sci.sfx('pop');
      }, bRow);
      api.button('✋ 松手！', release, bRow);
      api.button('↩️ 回到起点', () => { if (!b) { bx = X0; air = 0; } }, bRow);
      const rRow = api.row();
      api.button('🔥 点火发射', launch, rRow);
      rRow.hidden = true;
      api.note('👆 点“吹一口气”把气球吹大，再点“松手”。');
    },
  });

  /* ================= 8. 日食和月食 ================= */
  Sci.register({
    id: 'eclipse',
    subject: 'astronomy',
    level: 3,
    emoji: '🌑',
    title: '日食和月食',
    desc: '太阳、地球、月亮排成一条线的时候',
    intro: '有时候，白天的太阳会突然被“吃掉”一块；有时候，圆圆的月亮会慢慢变成暗红色。这就是日食和月食！拖动月亮，让它绕着地球转，看看月亮走到哪里时会发生日食，走到哪里时会发生月食。左上角的小窗口是“从地球上看到的样子”。',
    goal: '分别让日全食和月全食发生一次',
    fact: '<p><b>日食</b>：月亮走到<b>太阳和地球中间</b>，挡住了太阳光，月亮的影子落在地球上。只会发生在农历初一（新月）前后。</p><p><b>月食</b>：地球走到<b>太阳和月亮中间</b>，月亮钻进了地球的影子里。只会发生在农历十五（满月）前后。月全食时月亮会变成<b>暗红色</b>，因为地球的大气层把一点红光折射到了月亮上。</p><p>为什么不是每个月都有日食和月食？因为月亮的轨道是<b>斜</b>的，大多数时候三个星球不会刚好排成一条直线。</p><p>⚠️ 看日食千万不能直接用眼睛看太阳，要用专门的日食眼镜！</p>',
    quiz: [
      { q: '日食发生时，月亮在哪里？', options: ['太阳和地球中间', '地球的背后'], answer: 0, explain: '月亮挡住了太阳光。' },
      { q: '观看日食时应该怎么做？', options: ['戴专用的日食眼镜', '直接用眼睛盯着看'], answer: 0, explain: '直接看太阳会伤害眼睛。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const E = [560, 250], R = 135;
      let a = 1.8, auto = false, dragging = false;
      const done = new Set();
      const norm = x => Math.atan2(Math.sin(x), Math.cos(x));

      function check() {
        const s = norm(a - Math.PI), l = norm(a);
        if (Math.abs(s) < 0.08 && !done.has('solar')) {
          done.add('solar');
          Sci.sfx('star');
          api.note('🌑 日全食！月亮正好挡在太阳和地球中间，白天一下子变暗了。');
        }
        if (Math.abs(l) < 0.08 && !done.has('lunar')) {
          done.add('lunar');
          Sci.sfx('star');
          api.note('🔴 月全食！月亮钻进了地球的影子里，变成了暗红色。');
        }
        if (done.size === 2) api.goalDone();
      }
      api.pointer(st, {
        down(p) { if (Math.hypot(p.x - E[0], p.y - E[1]) > 50 && p.x > 280) { dragging = true; a = Math.atan2(p.y - E[1], p.x - E[0]); check(); } },
        move(p, active) { if (active && dragging) { a = Math.atan2(p.y - E[1], p.x - E[0]); check(); } },
        up() { dragging = false; },
      });

      function render() {
        ctx.fillStyle = '#0b0f2a';
        ctx.fillRect(0, 0, 800, 450);
        for (let i = 0; i < 50; i++) D.circle(ctx, (i * 151) % 800, (i * 97) % 450, 1, 'rgba(255,255,255,.5)');
        // 太阳和阳光
        const sg = ctx.createRadialGradient(-220, 250, 50, -220, 250, 330);
        sg.addColorStop(0, '#fff3bf');
        sg.addColorStop(0.8, '#ffd43b');
        sg.addColorStop(1, 'rgba(255,212,59,0)');
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, 120, 450);
        D.text(ctx, '☀️ 太阳', 60, 430, { size: 16, color: '#2b2840' });
        ctx.strokeStyle = 'rgba(255,230,120,.12)';
        ctx.lineWidth = 2;
        for (let y = 40; y < 450; y += 40) { ctx.beginPath(); ctx.moveTo(110, y); ctx.lineTo(800, y); ctx.stroke(); }
        // 地球的影子
        ctx.fillStyle = 'rgba(0,0,0,.55)';
        ctx.beginPath();
        ctx.moveTo(E[0], E[1] - 34);
        ctx.lineTo(800, E[1] - 18);
        ctx.lineTo(800, E[1] + 18);
        ctx.lineTo(E[0], E[1] + 34);
        ctx.fill();
        // 月亮轨道
        ctx.strokeStyle = 'rgba(255,255,255,.25)';
        ctx.setLineDash([5, 6]);
        ctx.beginPath();
        ctx.arc(E[0], E[1], R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        // 地球：朝太阳的一半是白天
        D.circle(ctx, E[0], E[1], 34, '#1c3d6e');
        ctx.beginPath();
        ctx.arc(E[0], E[1], 34, Math.PI / 2, Math.PI * 1.5);
        ctx.fillStyle = '#4dabf7';
        ctx.fill();
        D.text(ctx, '地球', E[0], E[1] + 52, { size: 14, color: '#fff' });
        const mx = E[0] + Math.cos(a) * R, my = E[1] + Math.sin(a) * R;
        // 月亮在中间时，它的影子落到地球上
        const s = norm(a - Math.PI);
        if (Math.abs(s) < 0.3) {
          ctx.fillStyle = 'rgba(0,0,0,.6)';
          ctx.beginPath();
          ctx.moveTo(mx, my - 12);
          ctx.lineTo(E[0] - 30, E[1] + (my - E[1]) * 0.25 - 3);
          ctx.lineTo(E[0] - 30, E[1] + (my - E[1]) * 0.25 + 3);
          ctx.lineTo(mx, my + 12);
          ctx.fill();
        }
        const inShadow = Math.abs(norm(a)) < 0.14;
        D.circle(ctx, mx, my, 13, inShadow ? '#a8442a' : '#e9ecef');
        ctx.beginPath();
        ctx.arc(mx, my, 13, -Math.PI / 2, Math.PI / 2);
        ctx.fillStyle = inShadow ? '#6b2a1a' : '#5c636a';
        ctx.fill();
        D.text(ctx, '月亮', mx, my - 24, { size: 14, color: '#fff' });
        D.text(ctx, '👆 拖动月亮绕地球转', 790, 22, { size: 14, align: 'right', color: '#adb5bd', weight: 'normal' });

        // 从地球上看
        const W = { x: 150, y: 20, w: 240, h: 160 };
        D.rrect(ctx, W.x, W.y, W.w, W.h, 14);
        const cx = W.x + W.w / 2, cy = W.y + 80;
        const l = norm(a);
        let label;
        ctx.save();
        D.rrect(ctx, W.x, W.y, W.w, W.h, 14);
        ctx.clip();
        if (Math.abs(s) < 0.45) {
          const off = s / 0.45 * 110, total = Math.abs(off) < 6;
          ctx.fillStyle = total ? '#0b0f2a' : Sci.rgb(Sci.mixColor([80, 160, 240], [20, 30, 70], 1 - Math.abs(off) / 110));
          ctx.fillRect(W.x, W.y, W.w, W.h);
          if (total) D.circle(ctx, cx, cy, 58, 'rgba(255,255,230,.35)');
          D.circle(ctx, cx, cy, 40, '#ffd43b');
          D.circle(ctx, cx + off, cy, 42, '#1a1a2e');
          label = total ? '日全食！' : '日偏食：太阳缺了一块';
        } else if (Math.abs(l) < 0.45) {
          ctx.fillStyle = '#0b0f2a';
          ctx.fillRect(W.x, W.y, W.w, W.h);
          const off = l / 0.45 * 120, f = clamp(1 - Math.abs(off) / 70, 0, 1);
          D.circle(ctx, cx, cy, 40, Sci.rgb(Sci.mixColor([245, 245, 235], [150, 50, 30], f)));
          D.circle(ctx, cx - off, cy, 80, 'rgba(60,10,0,.45)');
          label = Math.abs(off) < 8 ? '月全食！' : '月偏食：月亮进了地球的影子';
        } else {
          ctx.fillStyle = Math.cos(l) < 0 ? '#74c0fc' : '#0b0f2a';
          ctx.fillRect(W.x, W.y, W.w, W.h);
          label = Math.cos(l) < 0 ? '月亮在太阳这边，看不到月亮' : '没有日食，也没有月食';
          D.circle(ctx, cx, cy, 30, Math.cos(l) < 0 ? '#ffd43b' : '#e9ecef');
        }
        ctx.restore();
        D.rrect(ctx, W.x, W.y, W.w, W.h, 14);
        ctx.strokeStyle = '#adb5bd';
        ctx.lineWidth = 3;
        ctx.stroke();
        D.text(ctx, '从地球上看：' + label, cx, W.y + W.h + 18, { size: 15, color: '#fff' });
        D.text(ctx, `${done.has('solar') ? '✅' : '⬜'} 日全食　${done.has('lunar') ? '✅' : '⬜'} 月全食`, cx, W.y + W.h + 44, { size: 15, color: '#ffd43b' });
      }
      api.loop(dt => {
        if (auto && !dragging) { a += dt * 0.35; check(); }
        render();
      });
      api.toggle('🔄 月亮自己转', false, v => { auto = v; });
      api.note('👆 拖动月亮。提示：让太阳、月亮、地球排成一条直线！');
    },
  });

  /* ================= 9. 去别的星球跳一跳 ================= */
  const WORLDS = [
    { id: 'earth', name: '地球', g: 9.8, ground: '#69db7c', sky: '#a5d8ff' },
    { id: 'moon', name: '月球', g: 1.62, ground: '#ced4da', sky: '#0b0f2a' },
    { id: 'mars', name: '火星', g: 3.71, ground: '#e8590c', sky: '#f4a582' },
    { id: 'jupiter', name: '木星', g: 24.8, ground: '#d9a066', sky: '#5c3d2e' },
    { id: 'pluto', name: '冥王星', g: 0.62, ground: '#f1e3d3', sky: '#050510' },
  ];

  Sci.register({
    id: 'weight',
    subject: 'astronomy',
    level: 4,
    emoji: '🌕',
    title: '去别的星球跳一跳',
    desc: '在月球上你会变轻吗？能跳多高？',
    intro: '每个星球都有引力，把东西往它身上拉。星球不同，拉的力气也不一样大！带上体重秤，去月球、火星、木星和冥王星旅行吧。站上去称一称，再用同样的力气跳一跳，看看能跳多高。',
    goal: '在 4 个不同的星球上称体重、跳一跳',
    fact: '<p><b>质量</b>是身体里“物质有多少”，不管去哪个星球都不会变。<b>重力</b>是星球拉你的力气，体重秤上的读数其实量的是重力。</p><p>月球的引力只有地球的大约 <b>1/6</b>，所以在月球上，体重秤的读数变成原来的 1/6，用同样的力气能跳 6 倍高！木星的引力是地球的 2.5 倍，人在那里会觉得自己重得抬不起腿。</p><p>👨‍🚀 宇航员在月球上走路像在蹦蹦跳跳，就是因为月球的引力小。</p>',
    quiz: [
      { q: '在月球上，体重秤的读数大约是地球上的多少？', options: ['1/6', '一样', '6 倍'], answer: 0, explain: '月球引力约是地球的 1/6。' },
      { q: '宇航员从地球到了月球，身体的质量（物质有多少）变了吗？', options: ['变少了', '没变'], answer: 1, explain: '质量不随地点改变，变的是重力。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const G0 = 400, PXM = 48;
      let w = WORLDS[0], mass = 30, jump = null;
      const jumped = new Set();
      const reading = () => mass * w.g / 9.8;
      const height = () => 0.4 * 9.8 / w.g;

      function doJump() {
        if (jump) return;
        const airtime = 2 * Math.sqrt(2 * 9.8 * 0.4) / w.g;
        jump = { k: 0, dur: Math.min(airtime, 4.5), real: airtime };
        Sci.sfx('whoosh');
      }
      function render() {
        ctx.fillStyle = w.sky;
        ctx.fillRect(0, 0, 800, 450);
        if (['moon', 'pluto', 'jupiter'].indexOf(w.id) >= 0) for (let i = 0; i < 40; i++) D.circle(ctx, (i * 173) % 800, (i * 71) % 300, 1.2, 'rgba(255,255,255,.6)');
        if (w.id === 'moon') D.emoji(ctx, '🌍', 720, 250, 60);
        ctx.fillStyle = w.ground;
        ctx.fillRect(0, G0, 800, 450 - G0);
        // 高度尺
        const light = ['moon', 'pluto', 'jupiter'].indexOf(w.id) >= 0;
        const tc = light ? '#fff' : '#2b2840';
        for (let m = 0; m <= 7; m++) {
          const y = G0 - m * PXM;
          ctx.fillStyle = tc;
          ctx.fillRect(60, y, 14, 2);
          D.text(ctx, m + '米', 50, y, { size: 13, align: 'right', color: tc, weight: 'normal' });
        }
        ctx.fillRect(72, G0 - 7 * PXM, 2, 7 * PXM);
        // 跳起来的小朋友
        let y = 0;
        if (jump) y = 4 * height() * jump.k * (1 - jump.k) * PXM;
        D.emoji(ctx, '🧒', 260, G0 - 44 - y, 70);
        if (jump) {
          ctx.save();
          ctx.setLineDash([4, 5]);
          ctx.strokeStyle = tc;
          ctx.beginPath();
          ctx.moveTo(80, G0 - height() * PXM);
          ctx.lineTo(330, G0 - height() * PXM);
          ctx.stroke();
          ctx.restore();
        }
        // 体重秤
        D.rrect(ctx, 480, G0 - 30, 130, 30, 8);
        ctx.fillStyle = '#f1f3f5';
        ctx.fill();
        D.rrect(ctx, 505, G0 - 26, 80, 20, 4);
        ctx.fillStyle = '#212529';
        ctx.fill();
        D.text(ctx, reading().toFixed(1) + ' kg', 545, G0 - 16, { size: 14, color: '#8ce99a' });
        D.emoji(ctx, '👦', 545, G0 - 70, 70);
        D.text(ctx, `${w.name}的引力是地球的 ${(w.g / 9.8).toFixed(2)} 倍`, 560, 60, { size: 20, color: tc });
        D.text(ctx, `体重秤显示 ${reading().toFixed(1)} 千克（质量还是 ${mass} 千克）`, 560, 95, { size: 15, color: tc, weight: 'normal' });
        D.text(ctx, `同样的力气能跳 ${height().toFixed(2)} 米高`, 560, 125, { size: 15, color: tc, weight: 'normal' });
        D.text(ctx, `已经去过：${[...jumped].map(id => WORLDS.find(x => x.id === id).name).join('、') || '还没有'}`, 560, 160, { size: 14, color: tc, weight: 'normal', maxW: 420 });
      }
      api.loop(dt => {
        if (jump) {
          jump.k += dt / jump.dur;
          if (jump.k >= 1) {
            jump = null;
            const first = !jumped.has(w.id);
            jumped.add(w.id);
            Sci.sfx(first ? 'good' : 'plop');
            const real = 2 * Math.sqrt(2 * 9.8 * 0.4) / w.g;
            api.note(`在${w.name}上跳了 ${height().toFixed(2)} 米高，在空中待了 ${real.toFixed(1)} 秒！（去过 ${jumped.size}/4 个星球）`);
            if (jumped.size >= 4) api.goalDone();
          }
        }
        render();
      });
      api.choice(WORLDS.map(x => [x.id, x.name]), w.id, v => {
        if (jump) return;
        w = WORLDS.find(x => x.id === v);
        api.note(`欢迎来到${w.name}！看看体重秤的读数，再跳一跳。`);
      });
      const row2 = api.row();
      api.button('🦘 跳一跳', doJump, row2);
      api.slider('我的质量', 20, 60, 1, mass, v => { mass = v; }, v => v + ' 千克', row2);
      api.note('👆 先在地球上跳一跳，再选别的星球去试试。');
    },
  });

  /* ================= 10. 宜居带 ================= */
  const STARS = [
    { id: 'red', name: '红矮星', L: 0.02, color: '#ff6b4a', r: 26, tip: '红矮星又小又暗，宜居带离它很近很近。' },
    { id: 'sun', name: '太阳', L: 1, color: '#ffd43b', r: 40, tip: '地球正好在太阳的宜居带里，所以有海洋和生命。' },
    { id: 'blue', name: '蓝白巨星', L: 25, color: '#a5d8ff', r: 56, tip: '蓝白巨星特别亮，宜居带离它很远很远。' },
  ];
  const AU_MIN = -1.3, AU_MAX = 1;

  Sci.register({
    id: 'habitable',
    subject: 'astronomy',
    level: 5,
    emoji: '🌍',
    title: '宜居带',
    desc: '行星离恒星多远，才可能有液态水？',
    intro: '为什么地球上有海洋、有生命，而别的行星没有？关键之一是离太阳的距离刚刚好！太近了水会被烤干，太远了水会冻成冰。拖动行星，找到每颗恒星周围那片“刚刚好”的区域，科学家叫它“宜居带”。',
    goal: '为 3 种恒星分别找到宜居带',
    fact: '<p>恒星周围有一圈距离“不太热、也不太冷”的区域，行星在这里，表面才可能有<b>液态的水</b>，这就是<b>宜居带</b>，也叫“金发姑娘区”（就像童话里不烫也不凉、刚刚好的粥）。</p><p>恒星越亮，宜居带离它越<b>远</b>；恒星越暗，宜居带离它越<b>近</b>。太阳系里，地球在宜居带中，金星太靠近太阳，火星稍微远了一点。</p><p>🔭 科学家已经在别的恒星周围发现了五千多颗行星，正在宜居带里仔细寻找“另一个地球”。</p>',
    quiz: [
      { q: '“宜居带”指的是什么区域？', options: ['行星表面可能有液态水的区域', '有很多星星的区域'], answer: 0, explain: '不太热也不太冷，水能保持液态。' },
      { q: '一颗恒星比太阳亮得多，它的宜居带会离它？', options: ['更远', '更近'], answer: 0, explain: '恒星越亮越热，要离得更远才刚刚好。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const X0 = 150, W = 620, Y = 230;
      let star = STARS[1], d = 0.3;
      const found = new Set();
      const xOf = au => X0 + (Math.log(au) / Math.LN10 - AU_MIN) / (AU_MAX - AU_MIN) * W;
      const auOf = x => Math.pow(10, AU_MIN + (x - X0) / W * (AU_MAX - AU_MIN));
      const zone = () => [0.95 * Math.sqrt(star.L), 1.67 * Math.sqrt(star.L)];
      const state = () => { const [a, b] = zone(); return d < a ? 'hot' : d > b ? 'cold' : 'ok'; };
      let last = null;

      function check() {
        const s = state();
        if (s === last) return;
        last = s;
        if (s === 'ok') {
          const first = !found.has(star.id);
          found.add(star.id);
          Sci.sfx(first ? 'star' : 'good');
          api.note(`🌊 刚刚好！行星表面可以有液态水。${star.tip}（找到 ${found.size}/3）`);
          if (found.size === 3) api.goalDone();
        } else api.note(s === 'hot' ? '🔥 太热了！水都被蒸发成水蒸气了。往远处拖一拖。' : '🧊 太冷了！水都结成了冰。往近处拖一拖。');
      }
      api.pointer(st, {
        down(p) { if (p.x > X0 - 10 && p.y > 120 && p.y < 340) { d = auOf(clamp(p.x, X0, X0 + W)); check(); } },
        move(p, active) { if (active && p.x > X0 - 30) { d = auOf(clamp(p.x, X0, X0 + W)); check(); } },
      });

      function render() {
        ctx.fillStyle = '#060a1f';
        ctx.fillRect(0, 0, 800, 450);
        for (let i = 0; i < 60; i++) D.circle(ctx, (i * 131) % 800, (i * 61) % 450, 1, 'rgba(255,255,255,.4)');
        const [a, b] = zone();
        ctx.fillStyle = 'rgba(64,192,87,.28)';
        ctx.fillRect(xOf(a), 110, xOf(b) - xOf(a), 240);
        D.text(ctx, '宜居带', (xOf(a) + xOf(b)) / 2, 128, { size: 15, color: '#8ce99a' });
        // 恒星
        const g = ctx.createRadialGradient(60, Y, 5, 60, Y, star.r * 2);
        g.addColorStop(0, '#fff');
        g.addColorStop(0.4, star.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(60, Y, star.r * 2, 0, Math.PI * 2);
        ctx.fill();
        D.text(ctx, star.name, 60, Y + star.r + 40, { size: 16, color: '#fff' });
        // 距离刻度（每一大格是 10 倍）
        ctx.strokeStyle = 'rgba(255,255,255,.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(X0, 380);
        ctx.lineTo(X0 + W, 380);
        ctx.stroke();
        [0.1, 0.3, 1, 3, 10].forEach(v => {
          const x = xOf(v);
          ctx.fillStyle = 'rgba(255,255,255,.6)';
          ctx.fillRect(x - 1, 375, 2, 10);
          D.text(ctx, v + '', x, 398, { size: 13, color: '#adb5bd', weight: 'normal' });
        });
        D.text(ctx, '离恒星的距离（1 = 地球到太阳的距离）', X0 + W / 2, 425, { size: 13, color: '#adb5bd', weight: 'normal' });
        if (star.id === 'sun') {
          [['水星', 0.39], ['金星', 0.72], ['地球', 1], ['火星', 1.52], ['木星', 5.2]].forEach(([n, v]) => {
            D.circle(ctx, xOf(v), 360, 4, '#ced4da');
            D.text(ctx, n, xOf(v), 345, { size: 12, color: '#ced4da', weight: 'normal' });
          });
        }
        // 行星
        const s = state(), px = xOf(d);
        D.circle(ctx, px, Y, 26, s === 'hot' ? '#e8590c' : s === 'cold' ? '#e7f5ff' : '#1c7ed6');
        if (s === 'ok') {
          D.circle(ctx, px - 8, Y - 6, 9, '#40c057');
          D.circle(ctx, px + 9, Y + 8, 7, '#40c057');
        } else if (s === 'hot') {
          for (let i = 0; i < 3; i++) D.text(ctx, '〰', px - 14 + i * 14, Y - 40, { size: 16, color: '#ffa94d' });
        } else {
          D.circle(ctx, px - 6, Y - 4, 8, '#a5d8ff');
        }
        D.text(ctx, s === 'hot' ? '太热：水被蒸发' : s === 'cold' ? '太冷：水结成冰' : '刚刚好：有液态水', px, Y + 46, { size: 15, color: '#fff' });
        D.text(ctx, '👆 左右拖动行星', 790, 22, { size: 14, align: 'right', color: '#adb5bd', weight: 'normal' });
        STARS.forEach((sr, i) => D.text(ctx, `${found.has(sr.id) ? '✅' : '⬜'} ${sr.name}`, 20, 30 + i * 26, { size: 15, align: 'left', color: '#fff' }));
      }
      api.loop(render);
      api.choice(STARS.map(sr => [sr.id, sr.name]), star.id, v => {
        star = STARS.find(sr => sr.id === v);
        last = null;
        check();
      });
      api.note('👆 左右拖动行星，找到“刚刚好”的地方。');
    },
  });
})();
