/* 物理小实验：沉与浮 → 磁铁 → 跷跷板（杠杆） */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 1. 沉还是浮？ ================= */
  const FLOAT_ITEMS = [
    { e: '🪵', name: '木块', float: true, depth: 0.3 },
    { e: '🍎', name: '苹果', float: true, depth: 0.4 },
    { e: '🏐', name: '皮球', float: true, depth: 0.15 },
    { e: '🍃', name: '树叶', float: true, depth: 0.08 },
    { e: '🪨', name: '石头', float: false },
    { e: '🪙', name: '硬币', float: false },
    { e: '🔑', name: '钥匙', float: false },
    { e: '🔩', name: '螺丝钉', float: false },
  ];

  Sci.register({
    id: 'float',
    subject: 'physics',
    level: 1,
    emoji: '🚢',
    title: '沉还是浮？',
    desc: '把东西放进水里，看看谁浮起来、谁沉下去',
    intro: '小朋友，你洗澡的时候有没有发现：有的玩具会浮在水面上，有的却沉到了水底？今天我们来做个实验！把左边篮子里的东西一个一个拖进水缸里——放进去之前，先猜一猜它会浮还是会沉哦。',
    goal: '把篮子里的 8 样东西全都放进水里试一试',
    fact: '<p>同样大小的东西，<b>比水重的会沉下去</b>，<b>比水轻的会浮起来</b>。科学家把“同样大小有多重”叫做<b>密度</b>。</p><p>🤔 想一想：大轮船是用很重的钢铁做的，为什么能浮在海上？因为船的肚子是空的，里面装满了空气，整条船“平均起来”比水还轻呢！</p>',
    quiz: [
      { q: '一根木头筷子放进水里，会怎样？', options: ['浮起来', '沉下去'], answer: 0, explain: '木头比同样大小的水轻，所以会浮起来。' },
      { q: '下面哪样东西放进水里会沉下去？', options: ['塑料泡沫', '铁钉', '乒乓球'], answer: 1, explain: '铁钉又小又重，比同样大小的水重，所以会沉。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const TK = { x: 370, y: 110, w: 400, h: 320 };
      const SURF = 190, BOT = TK.y + TK.h, S = 50;
      const items = FLOAT_ITEMS.map((d, i) => {
        const hx = 105 + (i % 2) * 140, hy = 150 + Math.floor(i / 2) * 76;
        return Object.assign({ i, hx, hy, x: hx, y: hy, vy: 0, state: 'tray', tried: false, settled: 0, reported: false, tw: null }, d);
      });
      const drops = [];
      let drag = null, t = 0;
      const eqY = it => SURF + S * (it.depth - 0.5);
      const slotX = it => TK.x + 36 + it.i * 47;

      function tween(it, tx, ty, dur, next) {
        it.tw = { sx: it.x, sy: it.y, tx, ty, k: 0, dur, next };
        it.state = 'tween';
      }
      function dropIn(it, x, vy) {
        it.x = clamp(x, TK.x + S / 2 + 4, TK.x + TK.w - S / 2 - 4);
        it.state = 'water';
        it.vy = vy || 0;
        it.settled = 0;
        it.reported = false;
      }
      function hit(p) {
        for (let k = items.length - 1; k >= 0; k--) {
          const it = items[k];
          if (it.state !== 'tween' && Math.hypot(p.x - it.x, p.y - it.y) < S * 0.65) return it;
        }
        return null;
      }

      api.pointer(st, {
        down(p) {
          const it = hit(p);
          if (!it) return;
          drag = { it, ox: it.x - p.x, oy: it.y - p.y, sx: p.x, sy: p.y, moved: false, from: it.state };
          it.state = 'drag';
          Sci.sfx('pop');
        },
        move(p) {
          if (!drag) return;
          drag.it.x = p.x + drag.ox;
          drag.it.y = p.y + drag.oy;
          if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > 8) drag.moved = true;
        },
        up() {
          if (!drag) return;
          const { it, moved, from } = drag;
          drag = null;
          if (!moved) {
            // 点一下：篮子里的飞进水缸，水里的回到篮子
            if (from === 'tray') tween(it, slotX(it), TK.y - 30, 0.5, 'water');
            else tween(it, it.hx, it.hy, 0.45, 'tray');
            return;
          }
          const inTank = it.x > TK.x && it.x < TK.x + TK.w && it.y < BOT;
          if (inTank) dropIn(it, it.x, 0);
          else tween(it, it.hx, it.hy, 0.45, 'tray');
        },
      });

      function splash(x, v) {
        Sci.sfx('splash');
        const n = 10, pow = Math.min(1, v / 400);
        for (let k = 0; k < n; k++) drops.push({ x, y: SURF, vx: rand(-130, 130), vy: -rand(120, 300) * pow });
      }
      function report(it) {
        it.reported = true;
        const first = !it.tried;
        it.tried = true;
        Sci.sfx(it.float ? 'pop' : 'plop');
        api.note(`${it.e} ${it.name}${it.float ? '浮在水面上！' : '沉到水底啦！'}`);
        if (first && items.every(x => x.tried)) {
          api.timeout(() => {
            api.note('🎉 全部试完啦！浮起来的有：木块、苹果、皮球、树叶；沉下去的有：石头、硬币、钥匙、螺丝钉。');
            api.goalDone();
          }, 900);
        }
      }
      function physics(it, dt) {
        const prevBottom = it.y + S / 2;
        const touching = prevBottom > SURF;
        let a;
        if (!touching) a = 900;
        else if (it.float) a = -55 * (it.y - eqY(it)) - 6 * it.vy;
        else a = 520 - 4 * it.vy;
        it.vy += a * dt;
        it.y += it.vy * dt;
        if (prevBottom <= SURF && it.y + S / 2 > SURF && it.vy > 120) splash(it.x, it.vy);
        const floor = BOT - S / 2 - 4;
        if (it.y > floor) { it.y = floor; it.vy = 0; }
        const still = it.float ? Math.abs(it.vy) < 10 && Math.abs(it.y - eqY(it)) < 3 : it.y >= floor;
        it.settled = still ? it.settled + dt : 0;
        if (it.settled > 0.4 && !it.reported) report(it);
      }

      function drawItem(it, opts = {}) {
        let y = it.y;
        if (it.state === 'water' && it.float && it.settled > 0.4) y += Math.sin(t * 2 + it.i) * 2;
        D.emoji(ctx, it.e, it.x, y, S * 0.9);
        if (opts.label) {
          D.text(ctx, it.name, it.x, it.y + 36, { size: 15, color: '#6f6a85' });
          if (it.tried) D.text(ctx, it.float ? '浮' : '沉', it.x + 34, it.y - 20, { size: 15, color: it.float ? '#1f7a4d' : '#b45309' });
        }
      }
      function surfacePath() {
        ctx.beginPath();
        for (let x = TK.x; x <= TK.x + TK.w; x += 8) ctx.lineTo(x, SURF + Math.sin(x * 0.04 + t * 3) * 3);
      }

      function render() {
        const bg = ctx.createLinearGradient(0, 0, 0, 450);
        bg.addColorStop(0, '#fdf6e3');
        bg.addColorStop(1, '#f1e2c2');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 800, 450);

        // 篮子
        D.rrect(ctx, 25, 100, 320, 330, 22);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#e8d9b8';
        ctx.lineWidth = 3;
        ctx.stroke();
        D.text(ctx, '🧺 拖一样东西放进水里', 185, 70, { size: 21 });

        // 记录板
        D.text(ctx, '⬆ 浮：', TK.x, 32, { size: 18, align: 'left', color: '#1f7a4d' });
        D.text(ctx, '⬇ 沉：', TK.x, 74, { size: 18, align: 'left', color: '#b45309' });
        items.filter(i => i.tried && i.float).forEach((it, k) => D.emoji(ctx, it.e, TK.x + 82 + k * 36, 32, 26));
        items.filter(i => i.tried && !i.float).forEach((it, k) => D.emoji(ctx, it.e, TK.x + 82 + k * 36, 74, 26));

        // 水缸（先画缸里的东西，再盖一层半透明的水，看起来就像泡在水里）
        D.rrect(ctx, TK.x, TK.y, TK.w, TK.h, 16);
        ctx.fillStyle = 'rgba(225,242,255,0.7)';
        ctx.fill();
        items.forEach(it => { if (it.state === 'water') drawItem(it); });
        ctx.save();
        D.rrect(ctx, TK.x, TK.y, TK.w, TK.h, 16);
        ctx.clip();
        const wg = ctx.createLinearGradient(0, SURF, 0, BOT);
        wg.addColorStop(0, 'rgba(90,180,255,0.42)');
        wg.addColorStop(1, 'rgba(30,110,220,0.58)');
        surfacePath();
        ctx.lineTo(TK.x + TK.w, BOT);
        ctx.lineTo(TK.x, BOT);
        ctx.closePath();
        ctx.fillStyle = wg;
        ctx.fill();
        surfacePath();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        D.rrect(ctx, TK.x, TK.y, TK.w, TK.h, 16);
        ctx.strokeStyle = '#8fb8d8';
        ctx.lineWidth = 5;
        ctx.stroke();

        items.forEach(it => { if (it.state === 'tray') drawItem(it, { label: true }); });
        items.forEach(it => { if (it.state === 'tween' || it.state === 'drag') drawItem(it); });
        ctx.fillStyle = 'rgba(80,170,255,0.85)';
        drops.forEach(d => { ctx.beginPath(); ctx.arc(d.x, d.y, 4, 0, Math.PI * 2); ctx.fill(); });
      }

      api.loop(dt => {
        t += dt;
        for (const it of items) {
          if (it.state === 'tween') {
            const w = it.tw;
            w.k = Math.min(1, w.k + dt / w.dur);
            const e = w.k * w.k * (3 - 2 * w.k);
            it.x = lerp(w.sx, w.tx, e);
            it.y = lerp(w.sy, w.ty, e) - Math.sin(w.k * Math.PI) * 60;
            if (w.k >= 1) {
              it.tw = null;
              if (w.next === 'water') dropIn(it, it.x, 150);
              else { it.state = 'tray'; it.x = it.hx; it.y = it.hy; }
            }
          } else if (it.state === 'water') physics(it, dt);
        }
        for (let k = drops.length - 1; k >= 0; k--) {
          const d = drops[k];
          d.vy += 900 * dt;
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          if (d.y > SURF && d.vy > 0) drops.splice(k, 1);
        }
        render();
      });
      api.button('🧺 全部拿回篮子', () => {
        items.forEach(it => { if (it.state === 'water') tween(it, it.hx, it.hy, 0.5, 'tray'); });
      });
      api.note('👆 拖动（或点一下）篮子里的东西，放进右边的水缸里。');
    },
  });

  /* ================= 2. 磁铁的魔力 ================= */
  const MAG_ITEMS = [
    { e: '📎', name: '回形针', iron: true },
    { e: '🔩', name: '螺丝钉', iron: true },
    { e: '✂️', name: '剪刀', iron: true },
    { e: '⛓️', name: '铁链', iron: true },
    { e: '✏️', name: '铅笔', iron: false },
    { e: '📏', name: '塑料尺', iron: false },
    { e: '📄', name: '纸片', iron: false },
    { e: '🧸', name: '布娃娃', iron: false },
  ];

  Sci.register({
    id: 'magnet',
    subject: 'physics',
    level: 2,
    emoji: '🧲',
    title: '磁铁的魔力',
    desc: '磁铁能吸起什么？两块磁铁碰在一起会怎样？',
    intro: '磁铁好像有魔法，不用碰到就能把东西“拉”过来！可是它什么都能吸吗？拖着磁铁在桌子上方移动，看看哪些东西会被吸起来。然后再试试用两块磁铁碰一碰，会有大发现哦！',
    goal: '用磁铁把 4 样铁做的东西都吸起来',
    fact: '<p>磁铁能吸起<b>铁做的东西</b>（比如回形针、铁钉、剪刀），吸不动塑料、木头、纸和布。</p><p>每块磁铁都有两个“头”，叫做 <b>N 极</b> 和 <b>S 极</b>。两块磁铁靠近时：<b>同极相斥</b>（N 和 N、S 和 S 互相推开），<b>异极相吸</b>（N 和 S 紧紧吸住）。</p><p>🧭 指南针里的小指针也是一块磁铁，所以它总是指着南北方向！</p>',
    quiz: [
      { q: '磁铁能吸起下面哪样东西？', options: ['塑料玩具', '铁钉', '木头积木'], answer: 1, explain: '磁铁只能吸起铁做的东西。' },
      { q: '两块磁铁的 N 极和 N 极靠近，会怎样？', options: ['紧紧吸在一起', '互相推开'], answer: 1, explain: '同极相斥，异极相吸。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const MW = 150, MH = 46, RANGE = 160, TABLE = 380;
      let mode = 'one', t = 0, lastMsg = -9, stuckCount = 0;
      const mag = { x: 400, y: 130, tx: 400, ty: 130 };
      const order = [4, 0, 5, 1, 6, 2, 7, 3];
      const items = order.map((di, k) => Object.assign({ x: 70 + k * 94, y: TABLE, vx: 0, vy: 0, stuck: false, slot: -1, hint: -9, bubble: 0, cool: 0 }, MAG_ITEMS[di]));
      const ever = new Set();
      // 两块磁铁模式
      const mm = { x: 200, y: 250, tx: 200, ty: 250, flip: false };
      const fm = { x: 580, y: 250, home: 580, vx: 0, snapped: false };

      function setTarget(p) {
        if (mode === 'one') { mag.tx = clamp(p.x, MW / 2, 800 - MW / 2); mag.ty = clamp(p.y, 40, 330); }
        else { mm.tx = clamp(p.x, MW / 2, 800 - MW / 2); mm.ty = clamp(p.y, 70, 400); }
      }
      api.pointer(st, {
        down: setTarget,
        move(p, active) { if (active) setTarget(p); },
      });

      function stick(it) {
        it.stuck = true;
        it.slot = stuckCount++;
        Sci.sfx('clack');
        ever.add(it.name);
        api.note(`啪！${it.e} ${it.name}被吸住了——它是铁做的！`);
        if (ever.size === 4) {
          api.timeout(() => {
            api.note('🎉 太棒了！4 样铁做的东西都被你吸起来了。再点上面的“两块磁铁碰一碰”试试吧！');
            api.goalDone();
          }, 700);
        }
      }
      function stepOne(dt) {
        const f = Math.min(1, dt * 14);
        mag.x += (mag.tx - mag.x) * f;
        mag.y += (mag.ty - mag.y) * f;
        for (const it of items) {
          it.bubble = Math.max(0, it.bubble - dt);
          it.cool = Math.max(0, it.cool - dt);
          if (it.stuck) {
            const tx = mag.x - 66 + it.slot * 44, ty = mag.y + MH / 2 + 20 + Math.sin(t * 6 + it.slot) * 1.5;
            it.x += (tx - it.x) * Math.min(1, dt * 20);
            it.y += (ty - it.y) * Math.min(1, dt * 20);
            continue;
          }
          // 离磁铁最近的点
          const cx = clamp(it.x, mag.x - MW / 2, mag.x + MW / 2), cy = clamp(it.y, mag.y - MH / 2, mag.y + MH / 2);
          const dx = cx - it.x, dy = cy - it.y, d = Math.hypot(dx, dy) || 1;
          if (it.iron && d < RANGE && it.cool <= 0) {
            const force = Math.min(5000, 6e6 / (d * d + 900));
            it.vx += dx / d * force * dt;
            it.vy += dy / d * force * dt;
            if (d < 30) stick(it);
          } else if (!it.iron && d < 55 && t - it.hint > 2.5) {
            it.hint = t;
            it.bubble = 1.3;
            api.note(`${it.e} ${it.name}不是铁做的，磁铁吸不动它。`);
          }
          it.vy += 900 * dt;
          it.vx *= Math.exp(-3 * dt);
          it.x += it.vx * dt;
          it.y += it.vy * dt;
          if (it.y > TABLE) { it.y = TABLE; it.vy = 0; it.vx *= 0.8; }
          it.x = clamp(it.x, 30, 770);
        }
      }
      function stepTwo(dt) {
        const f = Math.min(1, dt * 14);
        const maxX = fm.snapped ? 800 - MW * 1.5 : fm.x - MW - 2;
        mm.x += (Math.min(mm.tx, maxX) - mm.x) * f;
        mm.y += (mm.ty - mm.y) * f;
        if (fm.snapped) { fm.x = mm.x + MW; fm.y = mm.y; return; }
        const same = !mm.flip; // 不翻面时：左边磁铁右端是 N，右边磁铁左端也是 N
        const gap = (fm.x - MW / 2) - (mm.x + MW / 2);
        if (Math.abs(mm.y - fm.y) < 60 && gap < 200) {
          const force = 3.5e6 / ((gap + 40) * (gap + 40));
          fm.vx += (same ? force : -force) * dt;
          if (same && force > 300 && t - lastMsg > 2.5) {
            lastMsg = t;
            Sci.sfx('whoosh');
            api.note('咦？推不过去！N 极碰 N 极，两块磁铁互相推开了——这叫“同极相斥”。点“翻个面”再试试！');
          }
          if (!same && gap < 6) {
            fm.snapped = true;
            fm.vx = 0;
            Sci.sfx('clack');
            api.note('啪！S 极和 N 极紧紧吸在一起了——这叫“异极相吸”。');
            return;
          }
        }
        fm.vx += (fm.home - fm.x) * 1.5 * dt;
        fm.vx *= Math.exp(-2.5 * dt);
        fm.x += fm.vx * dt;
        fm.y += (250 - fm.y) * Math.min(1, dt * 4);
        fm.x = clamp(fm.x, mm.x + MW + 2, 800 - MW / 2);
      }

      function drawMagnet(x, y, L, R) {
        const col = p => (p === 'N' ? '#ef4444' : '#3b82f6');
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.25)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        D.rrect(ctx, x - MW / 2, y - MH / 2, MW, MH, 10);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();
        ctx.save();
        D.rrect(ctx, x - MW / 2, y - MH / 2, MW, MH, 10);
        ctx.clip();
        ctx.fillStyle = col(L);
        ctx.fillRect(x - MW / 2, y - MH / 2, MW / 2, MH);
        ctx.fillStyle = col(R);
        ctx.fillRect(x, y - MH / 2, MW / 2, MH);
        ctx.fillStyle = 'rgba(255,255,255,.25)';
        ctx.fillRect(x - MW / 2, y - MH / 2, MW, 8);
        ctx.restore();
        D.text(ctx, L, x - MW / 4, y + 1, { size: 26, color: '#fff' });
        D.text(ctx, R, x + MW / 4, y + 1, { size: 26, color: '#fff' });
      }

      function render() {
        ctx.fillStyle = '#eef4ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#c99a63';
        ctx.fillRect(0, 404, 800, 46);
        ctx.fillStyle = '#b5824b';
        ctx.fillRect(0, 404, 800, 6);
        if (mode === 'one') {
          // 磁力范围（看不见的“磁场”）
          const g = ctx.createRadialGradient(mag.x, mag.y, 20, mag.x, mag.y, RANGE + 40);
          g.addColorStop(0, 'rgba(255,90,90,0.18)');
          g.addColorStop(1, 'rgba(255,90,90,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(mag.x, mag.y, RANGE + 40, 0, Math.PI * 2);
          ctx.fill();
          items.forEach(it => {
            D.emoji(ctx, it.e, it.x, it.y, 40);
            if (!it.stuck && it.y >= TABLE - 1) D.text(ctx, it.name, it.x, it.y + 32, { size: 14, color: '#5b4630', weight: 'normal' });
            if (it.bubble > 0) D.text(ctx, '吸不动～', it.x, it.y - 38, { size: 16, color: '#b45309', stroke: '#fff', alpha: Math.min(1, it.bubble * 2) });
          });
          drawMagnet(mag.x, mag.y, 'S', 'N');
          D.text(ctx, '按住拖动磁铁 🧲', 400, 22, { size: 18, color: '#6f6a85' });
        } else {
          drawMagnet(fm.x, fm.y, 'N', 'S');
          drawMagnet(mm.x, mm.y, mm.flip ? 'N' : 'S', mm.flip ? 'S' : 'N');
          D.text(ctx, '拖动左边的磁铁，去碰右边的磁铁', 400, 30, { size: 20, color: '#6f6a85' });
          D.text(ctx, '红色是 N 极，蓝色是 S 极', 400, 60, { size: 16, color: '#8b87a0', weight: 'normal' });
        }
      }

      api.loop(dt => {
        t += dt;
        if (mode === 'one') stepOne(dt);
        else stepTwo(dt);
        render();
      });

      api.choice([['one', '🧲 一块磁铁：吸一吸'], ['two', '🧲🧲 两块磁铁：碰一碰']], mode, v => {
        mode = v;
        dropBtn.hidden = v !== 'one';
        flipBtn.hidden = v !== 'two';
        if (v === 'two') {
          mm.x = mm.tx = 200; mm.y = mm.ty = 250; mm.flip = false;
          fm.x = fm.home; fm.vx = 0; fm.snapped = false;
          api.note('把左边的磁铁慢慢推向右边的磁铁，看看会发生什么？');
        } else {
          api.note('拖着磁铁去找铁做的东西吧！');
        }
      });
      const row2 = api.row();
      const dropBtn = api.button('👐 把吸住的东西放下', () => {
        items.forEach(it => {
          if (it.stuck) { it.stuck = false; it.vx = rand(-60, 60); it.vy = 0; it.cool = 1.2; }
        });
        stuckCount = 0;
      }, row2);
      const flipBtn = api.button('🔄 把左边的磁铁翻个面', () => {
        mm.flip = !mm.flip;
        if (fm.snapped) { fm.snapped = false; fm.vx = 500; }
        api.note(`翻过来啦！现在左边磁铁的右端是 ${mm.flip ? 'S' : 'N'} 极，再去碰一碰吧。`);
      }, row2);
      flipBtn.hidden = true;
      api.note('👆 按住画面拖动磁铁，靠近桌上的东西，看看谁会被吸起来？');
    },
  });

  /* ================= 3. 跷跷板的秘密（杠杆） ================= */
  Sci.register({
    id: 'seesaw',
    subject: 'physics',
    level: 3,
    emoji: '⚖️',
    title: '跷跷板的秘密',
    desc: '轻的东西也能翘起重的东西吗？',
    intro: '玩跷跷板的时候，小朋友和大人怎样才能玩起来呢？跷跷板的左边已经放好了橙色积木，请你在右边（点那些“+”号）放上蓝色积木，让跷跷板保持水平。小秘密：积木离中间越远，力气就越大哦！',
    goal: '闯过 3 关，让跷跷板平衡',
    fact: '<p>跷跷板是一种<b>杠杆</b>。中间的支点两边，比的不只是谁更重，还要看<b>离支点有多远</b>。</p><p>平衡的秘密是：<b>重量 × 距离</b>，左右两边一样多。比如左边 2 块积木放在第 3 格（2×3=6），右边 3 块放在第 2 格（3×2=6），就平衡啦！</p><p>🔧 剪刀、开瓶器、撬棍都用到了杠杆，所以用一点点力就能干大事。</p>',
    quiz: [
      { q: '小朋友和爸爸玩跷跷板，爸爸比较重，他应该坐在哪里才能平衡？', options: ['离中间近一点', '离中间远一点'], answer: 0, explain: '重的人坐得近一点，轻的人坐得远一点，就能平衡。' },
      { q: '左边第 2 格放了 3 块积木，右边要在第 3 格放几块才平衡？', options: ['1 块', '2 块', '3 块'], answer: 1, explain: '左边 3×2=6，右边 2×3=6，一样多！' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const PX = 400, PY = 300, STEP = 58, BS = 30, MAX = 0.26;
      const LEVELS = [[[2, 2]], [[3, 2]], [[2, 4]], [[4, 3]], [[2, 5], [1, 2]]];
      let lv = 0, right = [0, 0, 0, 0, 0, 0], hist = [], ang = 0, av = 0, showMath = false, solvedNow = false;
      const solved = new Set();

      const leftArr = () => {
        const a = [0, 0, 0, 0, 0, 0];
        LEVELS[lv].forEach(([c, p]) => { a[p] += c; });
        return a;
      };
      const torque = arr => arr.reduce((s, c, p) => s + c * p, 0);
      const terms = arr => arr.map((c, p) => (c ? `${c}×${p}` : '')).filter(Boolean).join(' + ') || '0';

      api.pointer(st, {
        down(p) {
          const dx = p.x - PX, dy = p.y - PY, c = Math.cos(-ang), s = Math.sin(-ang);
          const bx = dx * c - dy * s, by = dx * s + dy * c;
          if (by > 34 || by < -240) return;
          const k = Math.round(bx / STEP);
          if (Math.abs(bx - k * STEP) > 27) return;
          if (k >= 1 && k <= 5) {
            if (right[k] >= 6) { api.note('这一格已经放满啦！'); return; }
            right[k]++;
            hist.push(k);
            Sci.sfx('pop');
          } else if (k <= -1 && k >= -5) {
            api.note('左边是题目哦，请在右边（蓝色那边）的“+”号上放积木。');
            Sci.sfx('bad');
          }
        },
      });

      function onSolved(L) {
        const first = !solved.has(lv);
        solved.add(lv);
        Sci.sfx(first ? 'star' : 'good');
        api.note(`⚖️ 平衡啦！左边 ${terms(leftArr())} = ${L}，右边 ${terms(right)} = ${L}。` + (lv < LEVELS.length - 1 ? '去下一关试试吧！' : ''));
        if (solved.size >= 3) api.goalDone();
      }

      function block(x, y, color, edge) {
        D.rrect(ctx, x - BS / 2, y - BS / 2, BS, BS, 6);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = edge;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      function render(L, R) {
        const sky = ctx.createLinearGradient(0, 0, 0, 450);
        sky.addColorStop(0, '#dff1ff');
        sky.addColorStop(1, '#fff8e8');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#9ed36a';
        ctx.fillRect(0, 430, 800, 20);
        // 支点
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.moveTo(PX, PY + 4);
        ctx.lineTo(PX - 52, 432);
        ctx.lineTo(PX + 52, 432);
        ctx.closePath();
        ctx.fill();

        ctx.save();
        ctx.translate(PX, PY);
        ctx.rotate(ang);
        D.rrect(ctx, -322, -8, 644, 16, 8);
        ctx.fillStyle = '#ffcf6b';
        ctx.fill();
        ctx.strokeStyle = '#d9a23a';
        ctx.lineWidth = 2;
        ctx.stroke();
        const la = leftArr();
        for (let p = 1; p <= 5; p++) {
          D.text(ctx, String(p), -p * STEP, 24, { size: 15, color: '#c0620a' });
          D.text(ctx, String(p), p * STEP, 24, { size: 15, color: '#2563eb' });
          for (let i = 0; i < la[p]; i++) block(-p * STEP, -8 - BS / 2 - i * (BS + 2) - 1, '#ff9f43', '#d9741a');
          for (let i = 0; i < right[p]; i++) block(p * STEP, -8 - BS / 2 - i * (BS + 2) - 1, '#4c8dff', '#2a63c9');
          if (right[p] < 6) {
            const gy = -8 - BS / 2 - right[p] * (BS + 2) - 1;
            ctx.save();
            ctx.setLineDash([4, 4]);
            D.rrect(ctx, p * STEP - BS / 2, gy - BS / 2, BS, BS, 6);
            ctx.strokeStyle = 'rgba(76,141,255,.55)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            D.text(ctx, '+', p * STEP, gy + 1, { size: 22, color: 'rgba(76,141,255,.7)' });
          }
        }
        ctx.restore();
        D.circle(ctx, PX, PY, 7, '#5d4037');

        const balanced = L === R && R > 0;
        D.text(ctx, `第 ${lv + 1} 关`, 70, 32, { size: 20, color: '#6f6a85' });
        D.text(ctx, balanced ? '⚖️ 平衡啦！' : R > L ? '右边重，往下沉 ⬇' : '左边重，往下沉 ⬇', 400, 32, { size: 24, color: balanced ? '#1f9d55' : '#2b2840' });
        if (showMath) {
          D.text(ctx, `左边：${terms(la)} = ${L}`, 200, 70, { size: 19, color: '#c0620a', maxW: 360 });
          D.text(ctx, `右边：${terms(right)} = ${R}`, 600, 70, { size: 19, color: '#2563eb', maxW: 360 });
        }
      }

      api.loop(dt => {
        const L = torque(leftArr()), R = torque(right);
        const target = clamp((R - L) * 0.035, -MAX, MAX);
        av += (target - ang) * 40 * dt;
        av *= Math.exp(-6 * dt);
        ang += av * dt;
        const balanced = L === R && R > 0;
        if (balanced && !solvedNow && Math.abs(ang) < 0.01 && Math.abs(av) < 0.05) { solvedNow = true; onSolved(L); }
        if (!balanced) solvedNow = false;
        render(L, R);
      });

      const pickLevel = v => {
        lv = v;
        right = [0, 0, 0, 0, 0, 0];
        hist = [];
        solvedNow = false;
        api.note(`第 ${lv + 1} 关：左边放好了积木，你能在右边放积木，让跷跷板平衡吗？`);
      };
      api.choice(LEVELS.map((_, i) => [i, `第${i + 1}关`]), 0, pickLevel);
      const row2 = api.row();
      api.button('↩️ 拿走一块', () => { const k = hist.pop(); if (k) right[k]--; }, row2);
      api.button('🧹 全拿走', () => { right = [0, 0, 0, 0, 0, 0]; hist = []; }, row2);
      api.toggle('🔢 显示算式', false, v => { showMath = v; }, row2);
      pickLevel(0);
    },
  });

  /* ================= 4. 电路小能手 ================= */
  const MATERIALS = [
    ['nail', '🔩', '铁钉', true], ['key', '🔑', '铜钥匙', true], ['coin', '🪙', '硬币', true], ['pencil', '✏️', '铅笔芯', true],
    ['ruler', '📏', '塑料尺', false], ['chop', '🥢', '木筷子', false], ['sock', '🧦', '棉袜', false], ['balloon', '🎈', '橡胶气球', false],
  ];

  Sci.register({
    id: 'circuit',
    subject: 'physics',
    level: 4,
    emoji: '💡',
    title: '电路小能手',
    desc: '导体和绝缘体，串联和并联',
    intro: '小灯泡为什么会亮？因为电流从电池出发，沿着导线跑了一整圈又回到电池！只要中间有一处断开，电就过不去。先合上开关，把不同的东西接进电路里，看看哪些能让电通过；再比一比“串联”和“并联”两种接法有什么不同。',
    goal: '测试全部 8 种材料，再分别在串联、并联电路里拧下一个灯泡',
    fact: '<p>电流要走一条<b>完整的闭合回路</b>，灯才会亮。容易让电通过的东西叫<b>导体</b>（金属、铅笔芯里的石墨、盐水）；不容易让电通过的叫<b>绝缘体</b>（塑料、木头、橡胶、棉布）。电线外面包着塑料皮，就是为了安全。</p><p><b>串联</b>：所有用电器排成一条路，一个坏了全都不亮，而且灯会变暗。<b>并联</b>：每个用电器各有一条路，互不影响——家里的电灯都是并联的，所以关掉客厅的灯，卧室的灯照样亮。</p><p>⚠️ 家里插座的电压很高，非常危险！不要用手或金属去碰插座，湿手不要碰电器。</p>',
    quiz: [
      { q: '下面哪个是导体？', options: ['塑料尺', '铁钉', '木筷子'], answer: 1, explain: '金属容易导电，是导体。' },
      { q: '关掉客厅的灯，卧室的灯还亮着，说明家里的电灯是怎么连接的？', options: ['串联', '并联'], answer: 1, explain: '并联电路里每盏灯有自己的路，互不影响。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const L = 120, R = 680, T = 100, B = 350, MY = 225;
      let mode = 'material', sw = false, mat = MATERIALS[0], t = 0, unS = false, unP = false;
      const on = { single: true, s1: true, s2: true, p1: true, p2: true };
      const tested = new Set();
      const LOOP = [[L, B], [L, T], [R, T], [R, B], [L, B]];
      const PAR = {
        mainA: [[L, B], [L, T], [250, T]],
        mainB: [[550, T], [R, T], [R, B], [L, B]],
        brA: [[250, T], [550, T]],
        brB: [[250, T], [250, MY], [550, MY], [550, T]],
      };
      const BULBS = { material: [['single', 400, T]], series: [['s1', 300, T], ['s2', 500, T]], parallel: [['p1', 400, T], ['p2', 400, MY]] };

      function state() {
        if (mode === 'material') {
          const ok = sw && mat[3];
          return { paths: ok ? [LOOP] : [], bright: { single: ok ? 1 : 0 } };
        }
        if (mode === 'series') {
          const ok = sw && on.s1 && on.s2;
          return { paths: ok ? [LOOP] : [], bright: { s1: ok ? 0.55 : 0, s2: ok ? 0.55 : 0 } };
        }
        const a = sw && on.p1, b = sw && on.p2, paths = [];
        if (a || b) paths.push(PAR.mainA, PAR.mainB);
        if (a) paths.push(PAR.brA);
        if (b) paths.push(PAR.brB);
        return { paths, bright: { p1: a ? 1 : 0, p2: b ? 1 : 0 } };
      }
      function checkGoal() {
        if (tested.size === MATERIALS.length && unS && unP) api.goalDone();
      }
      function testMaterial() {
        if (mode !== 'material') return;
        if (!sw) { api.note(`接上了${mat[1]} ${mat[2]}，可是开关还没合上哦。点一下右边的开关！`); return; }
        tested.add(mat[0]);
        api.note(`${mat[1]} ${mat[2]}：${mat[3] ? '灯亮了！电能通过它，它是导体。' : '灯不亮……电过不去，它是绝缘体。'}（已测 ${tested.size}/8）`);
        Sci.sfx(mat[3] ? 'good' : 'bad');
        checkGoal();
      }

      api.pointer(st, {
        down(p) {
          if (Math.abs(p.x - R) < 45 && Math.abs(p.y - MY) < 55) {
            sw = !sw;
            Sci.sfx('clack');
            if (mode === 'material') testMaterial();
            else api.note(sw ? '开关合上了，电路接通！' : '开关断开了，电流停下来了。');
            return;
          }
          for (const [k, x, y] of BULBS[mode]) {
            if (mode === 'material' || Math.hypot(p.x - x, p.y - (y - 28)) > 34) continue;
            on[k] = !on[k];
            Sci.sfx('pop');
            const other = mode === 'series' ? (k === 's1' ? 's2' : 's1') : (k === 'p1' ? 'p2' : 'p1');
            if (!on[k] && on[other]) {
              if (!sw) { api.note('拧下来了。先把开关合上，再试试拧灯泡，效果更明显！'); return; }
              if (mode === 'series') { unS = true; api.note('拧下一个灯泡，另一个也灭了！串联电路只有一条路，断开一处，全都不亮。'); }
              else { unP = true; api.note('拧下一个灯泡，另一个还亮着！并联电路有好几条路，互不影响。'); }
              checkGoal();
            } else if (on[k]) api.note('把灯泡拧回去了。');
            return;
          }
        },
      });

      function wire(pts) {
        ctx.beginPath();
        pts.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.stroke();
      }
      function dots(pts) {
        let total = 0;
        const segs = [];
        for (let i = 1; i < pts.length; i++) {
          const len = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
          segs.push([pts[i - 1], pts[i], total, len]);
          total += len;
        }
        for (let s = (t * 70) % 30; s < total; s += 30) {
          const seg = segs.find(g => s >= g[2] && s <= g[2] + g[3]);
          if (!seg) continue;
          const f = (s - seg[2]) / seg[3];
          D.circle(ctx, lerp(seg[0][0], seg[1][0], f), lerp(seg[0][1], seg[1][1], f), 4, '#ffe14d');
        }
      }
      function bulb(x, y, present, b) {
        ctx.fillStyle = '#f7f9ff';
        ctx.fillRect(x - 14, y - 6, 28, 12);
        D.rrect(ctx, x - 11, y - 14, 22, 18, 3);
        ctx.fillStyle = '#9aa3b5';
        ctx.fill();
        if (!present) {
          D.text(ctx, '已拧下', x, y - 30, { size: 13, color: '#8b87a0' });
          return;
        }
        if (b > 0) D.circle(ctx, x, y - 36, 70, `rgba(255,220,80,${0.35 * b})`);
        D.circle(ctx, x, y - 36, 22, b > 0 ? Sci.rgb(Sci.mixColor([245, 246, 250], [255, 236, 120], b)) : '#eef1f7', '#9aa3b5', 2);
        ctx.strokeStyle = b > 0 ? '#ff9a00' : '#8b87a0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 14);
        ctx.lineTo(x - 6, y - 34);
        for (let k = 0; k < 4; k++) ctx.lineTo(x - 6 + (k + 0.5) * 3, y - 38 + (k % 2) * 6);
        ctx.lineTo(x + 6, y - 34);
        ctx.lineTo(x + 6, y - 14);
        ctx.stroke();
      }
      function render() {
        ctx.fillStyle = '#f7f9ff';
        ctx.fillRect(0, 0, 800, 450);
        const S = state();
        ctx.strokeStyle = '#c77d2e';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        if (mode === 'parallel') Object.values(PAR).forEach(wire);
        else wire(LOOP);
        S.paths.forEach(dots);
        // 电池
        ctx.fillStyle = '#f7f9ff';
        ctx.fillRect(L - 24, MY - 50, 48, 100);
        D.rrect(ctx, L - 18, MY - 38, 36, 80, 6);
        ctx.fillStyle = '#3b7d4f';
        ctx.fill();
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(L - 8, MY - 46, 16, 9);
        D.text(ctx, '+', L, MY - 22, { size: 20, color: '#fff' });
        D.text(ctx, '电池', L - 58, MY, { size: 16 });
        // 开关
        ctx.fillStyle = '#f7f9ff';
        ctx.fillRect(R - 20, MY - 45, 70, 90);
        D.circle(ctx, R, MY - 35, 6, '#555');
        D.circle(ctx, R, MY + 35, 6, '#555');
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(R, MY + 35);
        if (sw) ctx.lineTo(R, MY - 35);
        else ctx.lineTo(R + 38, MY - 22);
        ctx.stroke();
        D.text(ctx, sw ? '开关：合上' : '开关：断开', R + 62, MY + 62, { size: 15, color: sw ? '#1f9d55' : '#c0392b' });
        D.text(ctx, '👆 点开关', R + 50, MY - 62, { size: 13, color: '#8b87a0', weight: 'normal' });
        // 灯泡
        BULBS[mode].forEach(([k, x, y]) => bulb(x, y, mode === 'material' || on[k], S.bright[k] || 0));
        if (mode !== 'material') D.text(ctx, '👆 点灯泡可以拧下 / 拧上', 400, 30, { size: 15, color: '#8b87a0' });
        // 被测试的材料
        if (mode === 'material') {
          ctx.fillStyle = '#f7f9ff';
          ctx.fillRect(338, B - 30, 124, 74);
          D.circle(ctx, 342, B, 7, '#444');
          D.circle(ctx, 458, B, 7, '#444');
          D.emoji(ctx, mat[1], 400, B, 40);
          D.text(ctx, '接进来的：' + mat[2], 400, B + 40, { size: 15 });
          D.text(ctx, `已测试 ${tested.size} / 8`, 400, 30, { size: 16, color: '#8b87a0' });
        }
        D.text(ctx, { material: '导体还是绝缘体？', series: '串联：一条路', parallel: '并联：两条路' }[mode], 400, 420, { size: 20, color: '#c0620a' });
      }
      api.loop(dt => { t += dt; render(); });

      api.choice([['material', '🔍 导体和绝缘体'], ['series', '➖ 串联'], ['parallel', '🔀 并联']], mode, v => {
        mode = v;
        matRow.hidden = v !== 'material';
        api.note({ material: '选一样东西接进电路，再合上开关，看灯亮不亮。', series: '两个灯泡排成一条路。合上开关，再点一个灯泡把它拧下来试试！', parallel: '两个灯泡各走一条路。合上开关，再拧下一个灯泡试试！' }[v]);
      });
      const matRow = api.row();
      api.choice(MATERIALS.map(m => [m[0], `${m[1]} ${m[2]}`]), mat[0], v => {
        mat = MATERIALS.find(m => m[0] === v);
        testMaterial();
      }, matRow);
      api.note('👆 下面选一样东西接进电路，再点右边的开关把电路接通。');
    },
  });

  /* ================= 5. 光的反射与折射 ================= */
  Sci.register({
    id: 'light',
    subject: 'physics',
    level: 5,
    emoji: '🔦',
    title: '光的反射与折射',
    desc: '镜子怎样反射光？光进入水里为什么会拐弯？',
    intro: '光平时沿直线走，可是碰到镜子会被“弹”回来，从空气进入水里还会“拐个弯”。拖动激光笔改变照射的角度，量一量入射角和反射角，再看看光在空气和水之间是怎么拐弯的。最后找一找神奇的“全反射”！',
    goal: '用 3 种不同的角度照镜子，并找到“全反射”',
    fact: '<p><b>光的反射</b>：光照到镜面会反射回来，<b>反射角等于入射角</b>（都是和“法线”的夹角）。潜望镜、汽车后视镜都用到了它。</p><p><b>光的折射</b>：光从空气斜着进入水里，会<b>向法线偏折</b>；从水里斜着射向空气，会<b>远离法线偏折</b>。所以插在水里的筷子看起来“折断”了，池水看起来比实际浅。</p><p><b>全反射</b>：光从水射向空气时，如果角度太斜（超过约 49°），光就一点也出不去，全部被反射回水里。光纤就是靠全反射，把光信号传到很远的地方！</p>',
    quiz: [
      { q: '入射角是 30°，反射角是多少？', options: ['30°', '60°', '90°'], answer: 0, explain: '反射角总是等于入射角。' },
      { q: '筷子插进水里，看起来像“折断”了，这是因为？', options: ['光的折射', '光的反射', '筷子真的弯了'], answer: 0, explain: '光从水进入空气时拐了弯，我们看到的位置就变了。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const N = 1.33, DEG = 180 / Math.PI;
      let mode = 'reflect', th = 0.6, lastTIR = false, sawTIR = false;
      const seen = new Set();
      const hit = () => (mode === 'reflect' ? [400, 360] : [400, 225]);

      function setAngle(p) {
        const [hx, hy] = hit();
        if (mode === 'out') { if (p.y <= hy) return; th = clamp(Math.atan2(hx - p.x, p.y - hy), 0, 1.45); }
        else { if (p.y >= hy) return; th = clamp(Math.atan2(hx - p.x, hy - p.y), 0, 1.45); }
        const deg = Math.round(th * DEG);
        if (mode === 'reflect') seen.add(Math.round(deg / 10));
        if (mode === 'out') {
          const tir = N * Math.sin(th) > 1;
          if (tir && !lastTIR) {
            sawTIR = true;
            Sci.sfx('star');
            api.note(`✨ 全反射！入射角 ${deg}° 太斜了，光一点也出不了水面，全部反射回水里。光纤就是这个原理！`);
          } else if (!tir && lastTIR) api.note('角度变小了，光又能从水面射出去了。');
          lastTIR = tir;
        }
        if (seen.size >= 3 && sawTIR) api.goalDone();
      }
      api.pointer(st, { down: setAngle, move(p, active) { if (active) setAngle(p); } });

      function beam(x1, y1, ang, len, a) {
        const x2 = x1 + Math.cos(ang) * len, y2 = y1 + Math.sin(ang) * len;
        ctx.save();
        ctx.strokeStyle = `rgba(255,40,40,${a})`;
        ctx.shadowColor = 'rgba(255,0,0,.8)';
        ctx.shadowBlur = 12 * a;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        const mx = x1 + Math.cos(ang) * len * 0.55, my = y1 + Math.sin(ang) * len * 0.55;
        D.arrow(ctx, mx - Math.cos(ang) * 8, my - Math.sin(ang) * 8, mx + Math.cos(ang) * 8, my + Math.sin(ang) * 8, `rgba(200,20,20,${a})`, 3, 12);
      }
      function angleMark(x, y, a1, a2, r, text, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, r, Math.min(a1, a2), Math.max(a1, a2));
        ctx.stroke();
        const m = (a1 + a2) / 2;
        D.text(ctx, text, x + Math.cos(m) * (r + 34), y + Math.sin(m) * (r + 34), { size: 15, color, stroke: 'rgba(255,255,255,.85)', strokeWidth: 4 });
      }
      function laser(x, y, ang) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        D.rrect(ctx, -46, -9, 52, 18, 6);
        ctx.fillStyle = '#2b2840';
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(2, -4, 6, 8);
        ctx.restore();
      }

      function render() {
        const [hx, hy] = hit();
        const deg1 = Math.round(th * DEG);
        if (mode === 'reflect') {
          ctx.fillStyle = '#f5f7ff';
          ctx.fillRect(0, 0, 800, 450);
          ctx.fillStyle = '#c9d3e6';
          ctx.fillRect(150, hy, 500, 14);
          ctx.fillStyle = '#e8eef9';
          ctx.fillRect(150, hy - 4, 500, 4);
          ctx.strokeStyle = '#9aa3b5';
          ctx.lineWidth = 2;
          for (let x = 160; x < 650; x += 16) { ctx.beginPath(); ctx.moveTo(x, hy + 14); ctx.lineTo(x - 10, hy + 28); ctx.stroke(); }
          D.text(ctx, '🪞 平面镜', 700, hy + 6, { size: 16 });
        } else {
          ctx.fillStyle = '#f5f9ff';
          ctx.fillRect(0, 0, 800, hy);
          const g = ctx.createLinearGradient(0, hy, 0, 450);
          g.addColorStop(0, '#9fd3f7');
          g.addColorStop(1, '#3f8fd0');
          ctx.fillStyle = g;
          ctx.fillRect(0, hy, 800, 450 - hy);
          D.text(ctx, '空气', 60, hy - 24, { size: 20, color: '#6f6a85' });
          D.text(ctx, '水', 60, hy + 28, { size: 20, color: '#fff' });
        }
        // 法线
        ctx.save();
        ctx.setLineDash([7, 7]);
        ctx.strokeStyle = 'rgba(60,60,90,.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hx, mode === 'reflect' ? 60 : 20);
        ctx.lineTo(hx, mode === 'reflect' ? hy : 430);
        ctx.stroke();
        ctx.restore();
        D.text(ctx, '法线', hx + 26, mode === 'reflect' ? 70 : 34, { size: 14, color: '#6f6a85' });

        const up = -Math.PI / 2, down = Math.PI / 2;
        if (mode === 'reflect') {
          const src = up - th;
          const sx = hx + Math.cos(src) * 290, sy = hy + Math.sin(src) * 290;
          beam(sx, sy, src + Math.PI, 290, 1);
          beam(hx, hy, up + th, 300, 1);
          laser(sx, sy, src + Math.PI);
          angleMark(hx, hy, src, up, 60, `入射角 ${deg1}°`, '#c0392b');
          angleMark(hx, hy, up, up + th, 80, `反射角 ${deg1}°`, '#1f6fd0');
        } else if (mode === 'in') {
          const th2 = Math.asin(Math.sin(th) / N);
          const src = up - th;
          const sx = hx + Math.cos(src) * 200, sy = hy + Math.sin(src) * 200;
          beam(sx, sy, src + Math.PI, 200, 1);
          beam(hx, hy, up + th, 200, 0.22);
          beam(hx, hy, down - th2, 230, 1);
          laser(sx, sy, src + Math.PI);
          angleMark(hx, hy, src, up, 55, `入射角 ${deg1}°`, '#c0392b');
          angleMark(hx, hy, down - th2, down, 60, `折射角 ${Math.round(th2 * DEG)}°`, '#0b3a66');
          D.text(ctx, '光进入水里，向法线靠拢（折射角变小）', 400, 438, { size: 15, color: '#fff' });
        } else {
          const s = N * Math.sin(th);
          const src = down + th;
          const sx = hx + Math.cos(src) * 200, sy = hy + Math.sin(src) * 200;
          beam(sx, sy, src + Math.PI, 200, 1);
          laser(sx, sy, src + Math.PI);
          angleMark(hx, hy, down, src, 55, `入射角 ${deg1}°`, '#0b3a66');
          if (s > 1) {
            beam(hx, hy, down - th, 230, 1);
            D.text(ctx, '全反射！光出不去了', 560, 120, { size: 22, color: '#c0392b' });
          } else {
            const th2 = Math.asin(s);
            beam(hx, hy, up + th2, 250, 1);
            beam(hx, hy, down - th, 200, 0.22);
            angleMark(hx, hy, up, up + th2, 60, `折射角 ${Math.round(th2 * DEG)}°`, '#c0392b');
          }
          D.text(ctx, `临界角约 ${Math.round(Math.asin(1 / N) * DEG)}°：超过它就会全反射`, 400, 438, { size: 15, color: '#fff' });
        }
        D.text(ctx, '👆 拖动画面改变激光的角度', 790, 22, { size: 14, align: 'right', color: '#6f6a85', weight: 'normal' });
      }
      api.loop(render);

      api.choice([['reflect', '🪞 镜子反射'], ['in', '💧 空气 → 水'], ['out', '🐟 水 → 空气']], mode, v => {
        mode = v;
        th = 0.6;
        lastTIR = false;
        api.note({
          reflect: '拖动激光笔，比一比入射角和反射角，你发现了什么？',
          in: '光从空气斜着射进水里，看看它往哪边拐？',
          out: '现在激光笔在水底往上照。把角度调得越来越斜，看看会发生什么？',
        }[v]);
      });
      api.note('👆 在镜子上方拖动，改变激光的角度。');
    },
  });
})();
