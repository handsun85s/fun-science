/* 化学魔术（第二组）：小苏打火山 → 铁钉生锈 → 分离混合物 → 反应的快与慢 → 电解水 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 6. 小苏打火山 ================= */
  Sci.register({
    id: 'volcano',
    subject: 'chemistry',
    level: 1,
    emoji: '🌋',
    title: '小苏打火山',
    desc: '小苏打遇到醋，会发生什么？',
    intro: '厨房里有两样神奇的东西：做馒头用的小苏打，和吃饺子蘸的醋。它们碰到一起会怎样呢？先往火山里的瓶子加几勺小苏打，再倒进醋，看火山喷发！也试试倒清水，比一比有什么不同。',
    goal: '用不同多少的小苏打让火山喷发 2 次，再用清水试一次',
    fact: '<p>小苏打和醋碰到一起，会发生<b>化学反应</b>，产生一种看不见的气体——<b>二氧化碳</b>。大量的气泡一下子冒出来，把液体推出瓶口，就像火山喷发一样！</p><p>像这样<b>变出了新的物质</b>（二氧化碳）的变化，叫做<b>化学变化</b>。小苏打放进清水里只是溶解了，没有新物质，就不会冒那么多泡泡。</p><p>小苏打放得越多，产生的气体越多，火山喷得越猛。</p><p>⚠️ 做真实验时请大人帮忙，别让醋溅到眼睛里。</p>',
    quiz: [
      { q: '小苏打和醋放在一起，冒出的气泡是什么气体？', options: ['二氧化碳', '氧气', '水蒸气'], answer: 0, explain: '小苏打和醋反应，生成二氧化碳气体。' },
      { q: '小苏打倒进清水里，会像火山一样喷发吗？', options: ['会', '不会'], answer: 1, explain: '清水不会和小苏打发生这样的反应。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const CX = 400, CY = 190, BASE = 410;
      let soda = 0, red = true, power = 0, timer = 0, liquid = 0, plain = 0, t = 0;
      const foam = [];
      const amounts = new Set();
      let triedWater = false;
      const slopeY = x => {
        const d = Math.abs(x - CX);
        return d < 32 ? CY : CY + (d - 32) * (BASE - CY) / 230;
      };

      function pour(kind) {
        if (timer > 0) return;
        if (kind === 'water') {
          triedWater = true;
          plain = 1;
          Sci.sfx('splash');
          api.note(soda ? '倒进清水：小苏打只是溶解了，一点泡泡也没有冒出来。看来要醋才行！' : '倒进清水：什么也没发生。再加点小苏打试试？');
          soda = 0;
          checkGoal();
          return;
        }
        if (!soda) {
          Sci.sfx('splash');
          api.note('只倒了醋，没有小苏打，什么也没发生。先加几勺小苏打吧！');
          return;
        }
        power = soda;
        timer = 1.5 + soda;
        liquid = 1;
        amounts.add(soda);
        Sci.sfx('whoosh');
        api.note(`哗——火山喷发啦！${soda} 勺小苏打${soda === 3 ? '，喷得好猛！' : soda === 1 ? '，喷得小小的。' : '。'}冒出来的泡泡里是二氧化碳。`);
        soda = 0;
        checkGoal();
      }
      let finished = false;
      function checkGoal() {
        if (finished || amounts.size < 2 || !triedWater) return;
        finished = true;
        api.timeout(() => {
          api.note('🎉 实验完成！小苏打 + 醋 → 二氧化碳气泡。小苏打越多，喷得越猛；换成清水就不会喷发。');
          api.goalDone();
        }, 1800);
      }

      function render() {
        const sky = ctx.createLinearGradient(0, 0, 0, 450);
        sky.addColorStop(0, '#ffe8cc');
        sky.addColorStop(1, '#fff9db');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#c3a37a';
        ctx.fillRect(0, BASE, 800, 40);
        // 火山
        ctx.fillStyle = '#8d5a3b';
        ctx.beginPath();
        ctx.moveTo(CX - 262, BASE);
        ctx.lineTo(CX - 32, CY);
        ctx.lineTo(CX + 32, CY);
        ctx.lineTo(CX + 262, BASE);
        ctx.closePath();
        ctx.fill();
        // 剖开的小窗：里面藏着一个瓶子
        D.rrect(ctx, CX - 46, CY + 40, 92, 170, 12);
        ctx.fillStyle = '#5e3a24';
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.75)';
        ctx.fillRect(CX - 14, CY + 6, 28, 50);
        D.rrect(ctx, CX - 34, CY + 56, 68, 148, 14);
        ctx.fill();
        if (soda) {
          ctx.fillStyle = '#f8f9fa';
          ctx.fillRect(CX - 30, CY + 200 - soda * 14, 60, soda * 14);
          for (let i = 0; i < soda * 10; i++) D.circle(ctx, CX - 26 + (i * 13) % 52, CY + 198 - (i % 3) * 4 - Math.floor(i / 10) * 14, 2, '#dee2e6');
        }
        if (liquid > 0 || plain > 0) {
          const h = 60 * Math.max(liquid, plain);
          ctx.fillStyle = plain > 0 ? 'rgba(160,210,255,.8)' : red ? 'rgba(255,90,90,.75)' : 'rgba(255,240,200,.85)';
          ctx.fillRect(CX - 30, CY + 200 - h, 60, h);
          if (timer > 0) for (let i = 0; i < 8; i++) D.circle(ctx, CX - 24 + (i * 7.3) % 48, CY + 200 - ((t * 120 + i * 37) % h), 3, 'rgba(255,255,255,.8)');
        }
        D.text(ctx, '瓶子', CX, CY + 228, { size: 14, color: '#fff' });
        // 泡沫
        foam.forEach(f => D.circle(ctx, f.x, f.y, f.r, red ? `rgba(255,${100 + f.r * 4},${100 + f.r * 4},${f.a})` : `rgba(250,250,250,${f.a})`, `rgba(0,0,0,${0.12 * f.a})`, 1));
        if (timer > 0) for (let i = 0; i < 3; i++) D.text(ctx, 'CO₂', CX + Math.sin(t * 3 + i * 2) * 60, CY - 40 - ((t * 60 + i * 40) % 120), { size: 15, color: '#495057', alpha: 0.7 });
        D.text(ctx, `🥄 小苏打：${soda} 勺`, 20, 30, { size: 18, align: 'left' });
        D.text(ctx, `喷发过：${[...amounts].sort().map(n => n + '勺').join('、') || '还没有'}`, 20, 60, { size: 15, align: 'left', color: '#6f6a85', weight: 'normal' });
        D.text(ctx, `${triedWater ? '✅' : '⬜'} 用清水试过`, 20, 86, { size: 15, align: 'left', color: '#6f6a85', weight: 'normal' });
      }
      api.loop(dt => {
        t += dt;
        if (timer > 0) {
          timer -= dt;
          liquid = Math.max(0, liquid - dt * 0.15);
          for (let i = 0; i < power * 3; i++) {
            foam.push({ x: CX + rand(-14, 14), y: CY, vx: rand(-70, 70) * (0.6 + power * 0.4), vy: -rand(120, 200) * (0.5 + power * 0.35), r: rand(6, 13), a: 1, stuck: false });
          }
          if (timer <= 0) liquid = 0;
        }
        plain = Math.max(0, plain - dt * 0.3);
        for (let i = foam.length - 1; i >= 0; i--) {
          const f = foam[i];
          if (!f.stuck) {
            f.vy += 500 * dt;
            f.x += f.vx * dt;
            f.y += f.vy * dt;
            if (f.vy > 0 && f.y > slopeY(f.x) - f.r * 0.5) { f.stuck = true; f.y = slopeY(f.x) - f.r * 0.5; }
          } else {
            const dir = f.x < CX ? -1 : 1;
            f.x += dir * 22 * dt;
            f.y = slopeY(f.x) - f.r * 0.5;
            f.a -= dt * 0.25;
          }
          if (f.a <= 0 || f.y > BASE) foam.splice(i, 1);
        }
        if (foam.length > 900) foam.splice(0, foam.length - 900);
        render();
      });
      api.button('🥄 加一勺小苏打', () => {
        if (timer > 0) return;
        if (soda >= 3) { api.note('最多放 3 勺哦。'); return; }
        soda++;
        Sci.sfx('pop');
        api.note(`瓶子里有 ${soda} 勺小苏打了。现在倒醋还是倒清水？`);
      });
      api.button('🍶 倒醋', () => pour('vinegar'));
      api.button('💧 倒清水', () => pour('water'));
      api.toggle('🔴 加红色素', red, v => { red = v; });
      api.note('👆 先点“加一勺小苏打”，再点“倒醋”。');
    },
  });

  /* ================= 7. 铁钉生锈 ================= */
  const TUBES = [
    { id: 'A', name: '只有空气', sub: '（放了干燥剂）', rate: 0, water: 0 },
    { id: 'B', name: '只有水', sub: '（没有空气）', rate: 0.006, water: 1 },
    { id: 'C', name: '水和空气', sub: '', rate: 0.09, water: 0.45 },
    { id: 'D', name: '盐水和空气', sub: '', rate: 0.17, water: 0.45, salt: true },
  ];

  Sci.register({
    id: 'rust',
    subject: 'chemistry',
    level: 2,
    emoji: '🔩',
    title: '铁钉生锈',
    desc: '铁为什么会生锈？怎样才能不生锈？',
    intro: '旧自行车、铁栏杆上常常有红褐色的“铁锈”。铁为什么会生锈呢？我们把 4 根新铁钉放进 4 支试管里：有的只有空气，有的只有水，有的既有水又有空气，还有一支是盐水。让时间一天一天过去，看看哪根铁钉锈得最厉害！',
    goal: '让时间过去 7 天，找出锈得最厉害的铁钉',
    fact: '<p>铁生锈是一种<b>化学变化</b>：铁和空气里的<b>氧气</b>、还有<b>水</b>一起反应，变成了红褐色的铁锈。只有空气、或者只有水，铁钉都很难生锈；水和空气<b>同时都有</b>，才会锈得快。</p><p><b>盐水</b>会让铁锈得更快，所以海边的铁栏杆特别容易生锈，下雪天撒过盐的路面也会让汽车生锈。</p><p>防锈的办法：<b>刷油漆、涂油、镀上一层别的金属</b>，或者保持干燥，把铁和水、空气隔开。</p>',
    quiz: [
      { q: '铁钉放在哪里最不容易生锈？', options: ['潮湿的地方', '干燥的地方', '盐水里'], answer: 1, explain: '没有水，铁就很难生锈。' },
      { q: '自行车链条上油，是为了？', options: ['把铁和水、空气隔开，防止生锈', '让车子变重'], answer: 0, explain: '油把铁和水、空气隔开了。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const XS = [130, 300, 470, 640], TOP = 90, H = 250, W = 70;
      let day = 0, auto = false, acc = 0, asked = false;
      const rust = [0, 0, 0, 0];

      function nextDay() {
        if (day >= 10) { api.note('已经过了 10 天啦。点“重新开始”可以再做一次。'); return; }
        day++;
        TUBES.forEach((tb, i) => { rust[i] = Math.min(1, rust[i] + tb.rate); });
        Sci.sfx('tick');
        if (day >= 7 && !asked) {
          asked = true;
          auto = false;
          autoBtn.set(false);
          api.note('📅 第 7 天了！哪支试管里的铁钉锈得最厉害？点一下那支试管。');
        } else if (day < 7) api.note(`第 ${day} 天……仔细看看铁钉有什么变化。`);
      }
      api.pointer(st, {
        down(p) {
          const i = XS.findIndex(x => Math.abs(p.x - x) < W / 2 + 10 && p.y > TOP - 20 && p.y < TOP + H + 20);
          if (i < 0) return;
          if (day < 7) { api.note(`${TUBES[i].id} 试管：${TUBES[i].name}。先让时间过到第 7 天再来比。`); return; }
          if (i === 3) {
            Sci.sfx('good');
            api.note('✅ 对！盐水 + 空气的铁钉锈得最厉害；只有空气或只有水的，几乎没生锈。');
            api.goalDone();
          } else if (i === 2) api.note('C 也锈了不少，但还有一支比它锈得更厉害哦。');
          else api.note(`${TUBES[i].id} 几乎没生锈——${i === 0 ? '这里没有水' : '这里没有空气'}，铁钉就很难生锈。`);
        },
      });

      function nail(x, y, r, i) {
        const c = Sci.rgb(Sci.mixColor([150, 156, 170], [170, 74, 30], r));
        ctx.fillStyle = c;
        ctx.fillRect(x - 4, y, 8, 170);
        ctx.fillRect(x - 14, y - 6, 28, 8);
        ctx.beginPath();
        ctx.moveTo(x - 4, y + 170);
        ctx.lineTo(x + 4, y + 170);
        ctx.lineTo(x, y + 188);
        ctx.closePath();
        ctx.fill();
        // 锈斑
        for (let k = 0; k < Math.floor(r * 26); k++) {
          const yy = y + 20 + ((k * 53 + i * 17) % 150);
          D.circle(ctx, x + ((k * 7) % 9) - 4, yy, 2.5 + (k % 3), 'rgba(190,80,20,.85)');
        }
      }
      function render() {
        ctx.fillStyle = '#f6f8fb';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#c9b18f';
        ctx.fillRect(40, TOP + H + 6, 680, 14);
        TUBES.forEach((tb, i) => {
          const x = XS[i];
          // 试管里的东西
          ctx.save();
          D.rrect(ctx, x - W / 2, TOP, W, H, 30);
          ctx.clip();
          ctx.fillStyle = '#fff';
          ctx.fillRect(x - W / 2, TOP, W, H);
          if (tb.water) {
            const wy = TOP + 30 + (1 - tb.water) * (H - 30);
            ctx.fillStyle = tb.salt ? 'rgba(160,200,235,.75)' : 'rgba(150,200,255,.7)';
            ctx.fillRect(x - W / 2, wy, W, H);
            if (tb.id === 'B') { ctx.fillStyle = '#ffe066'; ctx.fillRect(x - W / 2, wy - 12, W, 14); }
          }
          if (tb.id === 'A') {
            for (let k = 0; k < 30; k++) D.circle(ctx, x - 28 + (k * 11) % 56, TOP + H - 8 - Math.floor(k / 6) * 7, 4, '#e9ecef', '#adb5bd', 1);
          }
          nail(x, TOP + 30, rust[i], i);
          ctx.restore();
          D.rrect(ctx, x - W / 2, TOP, W, H, 30);
          ctx.strokeStyle = '#8fa3bf';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = tb.id === 'B' || tb.id === 'A' ? '#868e96' : 'rgba(0,0,0,0)';
          ctx.fillRect(x - W / 2 - 4, TOP - 14, W + 8, 18);
          D.text(ctx, tb.id, x, TOP - 30, { size: 22, color: '#2b2840' });
          D.text(ctx, tb.name, x, TOP + H + 40, { size: 16 });
          if (tb.sub) D.text(ctx, tb.sub, x, TOP + H + 62, { size: 13, color: '#6f6a85', weight: 'normal' });
          if (tb.id === 'B') D.text(ctx, '油', x + W / 2 + 14, TOP + 26, { size: 13, color: '#b08900' });
          if (tb.salt) D.text(ctx, '盐', x + W / 2 + 14, TOP + 150, { size: 13, color: '#495057' });
        });
        D.text(ctx, `📅 第 ${day} 天`, 790, 28, { size: 22, align: 'right', color: '#c0620a' });
      }
      api.loop(dt => {
        if (auto) {
          acc += dt;
          if (acc > 0.8) { acc = 0; nextDay(); }
        }
        render();
      });
      api.button('☀️ 过一天', nextDay);
      const autoBtn = api.toggle('⏩ 自动快进', false, v => { auto = v; acc = 0; });
      api.button('🔄 重新开始', () => {
        day = 0;
        rust.fill(0);
        asked = false;
        api.note('换上了 4 根新铁钉，重新开始！');
      });
      api.note('👆 点“过一天”或者“自动快进”，看看铁钉会有什么变化。');
    },
  });

  /* ================= 8. 分离混合物 ================= */
  Sci.register({
    id: 'separate',
    subject: 'chemistry',
    level: 3,
    emoji: '🧲',
    title: '分离混合物',
    desc: '沙子、盐和铁粉混在一起，怎么分开？',
    intro: '糟糕！沙子、盐和铁粉被混在了一个烧杯里。你能把它们一样一样分开吗？你有四样工具：磁铁、清水、过滤用的漏斗和滤纸、还有加热用的酒精灯。想一想它们各自有什么不同，再决定先用哪样工具！',
    goal: '把铁粉、沙子和盐分别取出来',
    fact: '<p>把混在一起的东西分开，要利用它们<b>性质的不同</b>：</p><p>🧲 <b>铁粉能被磁铁吸起来</b>，沙子和盐不能——先用磁铁把铁粉吸走。</p><p>💧 <b>盐能溶解在水里，沙子不能</b>——加水搅拌后，用<b>过滤</b>的方法，沙子留在滤纸上，盐水流下去。</p><p>🔥 把盐水<b>加热蒸发</b>，水变成水蒸气跑掉了，盐就留了下来。海边的盐田就是用太阳把海水晒干，得到海盐的！</p>',
    quiz: [
      { q: '要把沙子和盐分开，第一步应该做什么？', options: ['加水让盐溶解', '直接用磁铁吸'], answer: 0, explain: '盐能溶于水，沙子不能，所以先加水。' },
      { q: '从盐水里得到盐，可以用什么方法？', options: ['过滤', '蒸发', '用磁铁吸'], answer: 1, explain: '盐溶解在水里，过滤不出来，要把水蒸发掉。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const BK = { x: 50, y: 200, w: 180, h: 190 };
      const FN = { x: 400, y: 150 }, DISH = { x: 400, y: 345 };
      let S, anim = null, t = 0;
      let dots = [];

      function reset() {
        S = { iron: 'in', water: false, dissolved: 0, sand: 'in', salt: 'in' };
        anim = null;
        dots = [];
        const add = (k, n, c) => {
          for (let i = 0; i < n; i++) dots.push({ k, c, hx: rand(BK.x + 14, BK.x + BK.w - 14), hy: rand(BK.y + BK.h - 70, BK.y + BK.h - 10) });
        };
        add('sand', 70, '#e0b46a');
        add('salt', 45, '#ffffff');
        add('iron', 35, '#3b3b46');
        dots = Sci.shuffle(dots);
      }
      reset();
      const busy = () => anim && anim.k < 1;
      function act(name, dur, done) {
        anim = { name, k: 0, dur, done };
      }
      function finishAll() {
        if (S.iron === 'out' && S.sand === 'filtered' && S.salt === 'crystal') {
          api.timeout(() => {
            api.note('🎉 全部分开啦！磁铁吸铁粉 → 加水溶解盐 → 过滤出沙子 → 蒸发得到盐。');
            api.goalDone();
          }, 600);
        }
      }
      const tools = {
        magnet() {
          if (S.iron === 'out') return api.note('铁粉已经被吸干净啦。');
          act('magnet', 1.4, () => {
            S.iron = 'out';
            Sci.sfx('clack');
            api.note('🧲 铁粉都被磁铁吸走了！沙子和盐吸不起来。');
            finishAll();
          });
        },
        water() {
          if (S.water) return api.note('已经加过水了，盐都溶解了。');
          act('water', 1.6, () => {
            S.water = true;
            S.dissolved = 1;
            Sci.sfx('splash');
            api.note('💧 加水搅一搅：盐溶解在水里看不见了，沙子沉在杯底。');
          });
        },
        filter() {
          if (!S.water) return api.note('还没加水呢！现在过滤，沙子和盐会一起留在滤纸上，分不开。');
          if (S.sand === 'filtered') return api.note('已经过滤过了，沙子在滤纸上。');
          if (S.iron === 'in') return api.note('等一下！铁粉也会和沙子一起留在滤纸上。先用磁铁把铁粉吸走吧。');
          act('filter', 2, () => {
            S.sand = 'filtered';
            S.salt = 'dish';
            Sci.sfx('good');
            api.note('🧻 过滤成功！沙子留在滤纸上，透明的盐水流进了下面的蒸发皿。');
            finishAll();
          });
        },
        heat() {
          if (S.salt === 'crystal') return api.note('盐已经结晶出来啦。');
          if (S.salt !== 'dish') return api.note(S.water ? '盐水还和沙子混在烧杯里，先过滤，把盐水倒进蒸发皿吧。' : '蒸发皿里还是空的呢。');
          act('heat', 2.4, () => {
            S.salt = 'crystal';
            Sci.sfx('star');
            api.note('🔥 水蒸发跑掉了，白白的盐留在了蒸发皿里！');
            finishAll();
          });
        },
      };

      function beaker(x, y, w, h) {
        ctx.strokeStyle = '#8fa3bf';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w, y);
        ctx.stroke();
      }
      function render() {
        ctx.fillStyle = '#f8f9ff';
        ctx.fillRect(0, 0, 800, 450);
        const a = anim && anim.k < 1 ? anim : null, k = a ? a.k : 1;
        // 烧杯里的水
        let water = S.water ? 1 : 0;
        if (a && a.name === 'water') water = k;
        if (S.sand === 'filtered') water = 0;
        if (a && a.name === 'filter') water = 1 - k;
        if (water > 0) {
          ctx.fillStyle = 'rgba(150,200,255,.55)';
          const h = 150 * water;
          ctx.fillRect(BK.x, BK.y + BK.h - h, BK.w, h);
        }
        // 小颗粒（等漏斗画好再画，过滤后的沙子才能留在滤纸上）
        const mag = { x: 140, y: 150 };
        const drawDots = () => dots.forEach((d, i) => {
          let x = d.hx, y = d.hy, al = 1;
          if (d.k === 'iron') {
            if (S.iron === 'out' && !(a && a.name === 'magnet')) return;
            if (a && a.name === 'magnet') { const e = Sci.smooth(0, 1, k * 1.3 - (i % 10) * 0.03); x = lerp(d.hx, mag.x + (i % 7) * 6 - 18, e); y = lerp(d.hy, mag.y + 30, e); }
          }
          if (d.k === 'salt') {
            if (S.salt !== 'in') return;
            al = 1 - (a && a.name === 'water' ? k : S.dissolved);
            if (al <= 0) return;
          }
          if (d.k === 'sand' && (S.sand === 'filtered' || (a && a.name === 'filter'))) {
            const e = S.sand === 'filtered' ? 1 : Sci.smooth(0, 1, k * 1.4 - (i % 10) * 0.04);
            x = lerp(d.hx, FN.x + ((i * 13) % 34) - 17, e);
            y = lerp(d.hy, FN.y + 12 + ((i * 7) % 14), e);
          }
          if (d.k === 'salt') D.circle(ctx, x, y, 4, `rgba(255,255,255,${al})`, `rgba(120,120,140,${al})`, 1);
          else D.circle(ctx, x, y, d.k === 'iron' ? 3 : 4, d.c);
        });
        // 漏斗和滤纸
        ctx.fillStyle = '#e9ecef';
        ctx.beginPath();
        ctx.moveTo(FN.x - 60, FN.y);
        ctx.lineTo(FN.x + 60, FN.y);
        ctx.lineTo(FN.x + 8, FN.y + 70);
        ctx.lineTo(FN.x + 8, FN.y + 120);
        ctx.lineTo(FN.x - 8, FN.y + 120);
        ctx.lineTo(FN.x - 8, FN.y + 70);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#8fa3bf';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(FN.x - 50, FN.y + 4);
        ctx.lineTo(FN.x + 50, FN.y + 4);
        ctx.lineTo(FN.x, FN.y + 62);
        ctx.closePath();
        ctx.fill();
        D.text(ctx, '漏斗 + 滤纸', FN.x + 110, FN.y + 30, { size: 14, color: '#6f6a85' });
        drawDots();
        beaker(BK.x, BK.y, BK.w, BK.h);
        D.text(ctx, '烧杯', BK.x + BK.w / 2, BK.y + BK.h + 22, { size: 15 });
        if (a && a.name === 'magnet') D.emoji(ctx, '🧲', mag.x, mag.y, 56);
        if (a && a.name === 'water') D.emoji(ctx, '🥄', BK.x + BK.w / 2 + Math.sin(t * 12) * 40, BK.y + 80, 40);
        if (a && a.name === 'filter') for (let i = 0; i < 3; i++) D.circle(ctx, FN.x, FN.y + 130 + ((t * 160 + i * 30) % 80), 4, 'rgba(120,180,255,.9)');
        // 蒸发皿
        let brine = S.salt === 'dish' ? 1 : 0;
        if (a && a.name === 'filter') brine = k;
        if (a && a.name === 'heat') brine = 1 - k;
        ctx.fillStyle = '#dee2e6';
        ctx.beginPath();
        ctx.ellipse(DISH.x, DISH.y, 70, 26, 0, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#8fa3bf';
        ctx.stroke();
        if (brine > 0) {
          ctx.fillStyle = 'rgba(150,200,255,.8)';
          ctx.beginPath();
          ctx.ellipse(DISH.x, DISH.y + 2, 62 * Math.sqrt(brine), 16 * brine + 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        if (S.salt === 'crystal' || (a && a.name === 'heat' && k > 0.5)) {
          for (let i = 0; i < 24; i++) {
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#adb5bd';
            ctx.lineWidth = 1;
            const x = DISH.x - 44 + (i * 17) % 88, y = DISH.y + 2 + (i % 3) * 5;
            ctx.fillRect(x, y, 6, 6);
            ctx.strokeRect(x, y, 6, 6);
          }
        }
        D.text(ctx, '蒸发皿', DISH.x + 100, DISH.y + 6, { size: 14, color: '#6f6a85' });
        if (a && a.name === 'heat') {
          D.emoji(ctx, '🔥', DISH.x, DISH.y + 60, 40 + Math.sin(t * 20) * 3);
          for (let i = 0; i < 3; i++) D.text(ctx, '〰', DISH.x - 30 + i * 30, DISH.y - 30 - ((t * 50 + i * 15) % 50), { size: 20, color: '#adb5bd' });
        }
        // 成果
        const res = [['铁粉', S.iron === 'out', '#3b3b46'], ['沙子', S.sand === 'filtered', '#e0b46a'], ['盐', S.salt === 'crystal', '#ffffff']];
        res.forEach(([name, ok, c], i) => {
          const x = 600 + i * 66, y = 70;
          D.rrect(ctx, x - 26, y, 52, 70, 10);
          ctx.fillStyle = ok ? c : '#f1f3f5';
          ctx.fill();
          ctx.strokeStyle = '#adb5bd';
          ctx.lineWidth = 2;
          ctx.stroke();
          D.text(ctx, name, x, y + 92, { size: 15 });
          D.text(ctx, ok ? '✅' : '⬜', x, y + 118, { size: 18 });
        });
        D.text(ctx, '分出来的东西', 666, 46, { size: 15, color: '#6f6a85' });
      }
      api.loop(dt => {
        t += dt;
        if (anim && anim.k < 1) {
          anim.k = Math.min(1, anim.k + dt / anim.dur);
          if (anim.k >= 1) anim.done();
        }
        render();
      });
      const use = name => () => { if (!busy()) tools[name](); };
      api.button('🧲 用磁铁吸', use('magnet'));
      api.button('💧 加水搅拌', use('water'));
      api.button('🧻 过滤', use('filter'));
      api.button('🔥 加热蒸发', use('heat'));
      const row2 = api.row();
      api.button('🔄 重新混合', () => { reset(); api.note('又混在一起啦，重新试一次！'); }, row2);
      api.note('👆 先想一想：哪样工具能先把一种东西分出来？');
    },
  });

  /* ================= 9. 反应的快与慢 ================= */
  const TEMPS = [[10, '🧊 冷水 10°C', 1], [40, '🌡️ 温水 40°C', 2.2], [70, '♨️ 热水 70°C', 4.5]];
  const FORMS = [['whole', '⚪ 一整片', 1], ['pieces', '🧩 掰成 4 块', 2], ['powder', '✨ 磨成粉', 4.5]];

  Sci.register({
    id: 'rate',
    subject: 'chemistry',
    level: 4,
    emoji: '⏱️',
    title: '反应的快与慢',
    desc: '怎样让化学反应变快？',
    intro: '泡腾片放进水里会“滋滋”地冒泡，这是一种化学反应。怎样才能让它反应得更快呢？用冷水还是热水？整片放进去，还是磨成粉？每次只改变一个条件，用秒表测一测，找出最快的办法！',
    goal: '至少做 4 次实验，找出反应最快的组合',
    fact: '<p>化学反应有快有慢，很多办法都能让反应<b>变快</b>：</p><p>🌡️ <b>温度越高，反应越快</b>：温度高时，小小的分子跑得更快，互相碰撞得更多、更猛。</p><p>✨ <b>颗粒越小，反应越快</b>：把一整片磨成粉，和水接触的面积变大了很多倍。</p><p>🧊 反过来，降低温度能让反应变慢：食物放进冰箱，变质的反应就变慢了，所以能放得更久。</p>',
    quiz: [
      { q: '为什么食物放在冰箱里不容易坏？', options: ['温度低，变质的反应变慢了', '冰箱里没有空气'], answer: 0, explain: '温度低，反应就变慢。' },
      { q: '生火时，把木头劈成小块更容易烧起来，是因为？', options: ['和空气接触的面积更大', '小木块更重'], answer: 0, explain: '颗粒越小，接触面积越大，反应越快。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const CX = 230, TOPY = 130, BOT = 400;
      let temp = 0, form = 0, run = null, t = 0, last = null;
      const results = {};
      const mol = [];
      for (let i = 0; i < 18; i++) mol.push({ x: rand(-50, 50), y: rand(-50, 50), a: rand(0, 6.28) });

      function start() {
        if (run) return;
        const T = 80 / (TEMPS[temp][2] * FORMS[form][2]);
        run = { T, sim: 0, dur: clamp(T / 8, 1.5, 10) };
        Sci.sfx('plop');
        api.note('放进去了！滋滋滋……');
      }
      function finish() {
        const key = temp + ':' + form;
        results[key] = run.T;
        last = run.T;
        Sci.sfx('good');
        api.note(`${TEMPS[temp][1]} + ${FORMS[form][1]}：用了 ${run.T.toFixed(1)} 秒全部反应完。`);
        run = null;
        const n = Object.keys(results).length;
        if (n >= 4 && results['2:2'] != null) api.timeout(() => {
          api.note('🏆 找到了！热水 + 磨成粉最快。温度越高、颗粒越小，反应就越快。');
          api.goalDone();
        }, 1200);
        else if (n >= 4) api.note('已经做了 ' + n + ' 次实验。还有更快的组合吗？');
      }
      function render() {
        ctx.fillStyle = '#f8f9ff';
        ctx.fillRect(0, 0, 800, 450);
        const warm = temp / 2;
        // 烧杯
        ctx.fillStyle = Sci.rgb(Sci.mixColor([190, 225, 255], [255, 205, 190], warm), 0.85);
        ctx.fillRect(CX - 110, TOPY + 40, 220, BOT - TOPY - 40);
        ctx.strokeStyle = '#8fa3bf';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(CX - 110, TOPY);
        ctx.lineTo(CX - 110, BOT);
        ctx.lineTo(CX + 110, BOT);
        ctx.lineTo(CX + 110, TOPY);
        ctx.stroke();
        if (temp === 2) for (let i = 0; i < 3; i++) D.text(ctx, '〰', CX - 50 + i * 50, TOPY + 20 - ((t * 30 + i * 12) % 40), { size: 22, color: '#ced4da' });
        // 泡腾片
        const left = run ? 1 - run.sim / run.T : last != null ? 0 : 1;
        const fid = FORMS[form][0];
        const tab = (x, y, r) => { if (r > 0.5) D.circle(ctx, x, y, r, '#fff3bf', '#e9c46a', 2); };
        if (fid === 'whole') tab(CX, BOT - 18, 30 * Math.sqrt(left));
        else if (fid === 'pieces') [[-50, 0], [-15, -4], [20, 2], [55, -2]].forEach(([dx, dy]) => tab(CX + dx, BOT - 14 + dy, 15 * Math.sqrt(left)));
        else for (let i = 0; i < 40; i++) tab(CX - 90 + (i * 37) % 180, BOT - 6 - (i % 4) * 4, 3.5 * Math.sqrt(left));
        if (run) {
          const rate = run.T < 10 ? 18 : run.T < 25 ? 10 : 5;
          for (let i = 0; i < rate; i++) {
            const x = CX - 95 + ((i * 47 + Math.floor(t * 3) * 13) % 190), y = BOT - ((t * 140 + i * 29) % (BOT - TOPY - 50));
            D.circle(ctx, x, y, 3 + (i % 3), 'rgba(255,255,255,.9)', 'rgba(120,150,190,.6)', 1);
          }
        }
        D.text(ctx, `⏱️ ${(run ? run.sim : last || 0).toFixed(1)} 秒`, CX, 60, { size: 30, color: '#c0620a' });
        D.text(ctx, TEMPS[temp][1] + ' · ' + FORMS[form][1], CX, 98, { size: 16, color: '#6f6a85' });
        // 放大镜：水分子的运动
        const MX = 560, MY = 110;
        D.circle(ctx, MX, MY, 70, '#fff', '#6c757d', 4);
        ctx.save();
        ctx.beginPath();
        ctx.arc(MX, MY, 66, 0, Math.PI * 2);
        ctx.clip();
        mol.forEach(m => D.circle(ctx, MX + m.x, MY + m.y, 5, '#4c8dff'));
        ctx.restore();
        D.text(ctx, '🔍 放大看水分子', MX, MY + 92, { size: 14, color: '#6f6a85' });
        D.text(ctx, temp === 2 ? '跑得好快！' : temp === 1 ? '跑得快一些' : '慢慢地动', MX, MY + 114, { size: 14, color: '#c0620a', weight: 'normal' });
        // 成绩表
        const TX = 440, TY = 260;
        D.text(ctx, '用时（秒）', TX + 30, TY, { size: 13, color: '#6f6a85' });
        ['整片', '4 块', '粉末'].forEach((f, j) => D.text(ctx, f, TX + 130 + j * 85, TY, { size: 14, color: '#6f6a85' }));
        TEMPS.forEach((tp, i) => {
          D.text(ctx, tp[1].split(' ')[1], TX + 30, TY + 34 + i * 34, { size: 14 });
          FORMS.forEach((_, j) => {
            const r = results[i + ':' + j];
            D.rrect(ctx, TX + 95 + j * 85, TY + 20 + i * 34, 70, 28, 6);
            ctx.fillStyle = i === temp && j === form ? '#fff3bf' : '#fff';
            ctx.fill();
            ctx.strokeStyle = '#dee2e6';
            ctx.lineWidth = 1;
            ctx.stroke();
            D.text(ctx, r == null ? '—' : r.toFixed(1), TX + 130 + j * 85, TY + 34 + i * 34, { size: 14, weight: 'normal' });
          });
        });
      }
      api.loop(dt => {
        t += dt;
        const sp = [25, 55, 110][temp];
        mol.forEach(m => {
          m.a += rand(-1, 1) * dt * 4;
          m.x += Math.cos(m.a) * sp * dt;
          m.y += Math.sin(m.a) * sp * dt;
          if (Math.hypot(m.x, m.y) > 60) { m.a += Math.PI; m.x *= 0.95; m.y *= 0.95; }
        });
        if (run) {
          run.sim = Math.min(run.T, run.sim + dt * run.T / run.dur);
          if (run.sim >= run.T) finish();
        }
        render();
      });
      api.choice(TEMPS.map((tp, i) => [i, tp[1]]), temp, v => { if (!run) { temp = v; last = null; } });
      const row2 = api.row();
      api.choice(FORMS.map((f, i) => [i, f[1]]), form, v => { if (!run) { form = v; last = null; } }, row2);
      const row3 = api.row();
      api.button('⬇️ 放进水里', start, row3);
      api.note('👆 选好水的温度和泡腾片的样子，点“放进水里”开始计时。');
    },
  });

  /* ================= 10. 电解水 ================= */
  Sci.register({
    id: 'electrolysis',
    subject: 'chemistry',
    level: 5,
    emoji: '⚗️',
    title: '电解水',
    desc: '用电把水拆开，里面藏着两种气体',
    intro: '水是由什么组成的？科学家想了个办法：给水通上电！两根电极上会冒出气泡，收集起来一看，竟然是两种不同的气体。打开电源收集气体，比一比两边气体的多少，再用火柴和木条检验它们分别是什么。',
    goal: '通电收集气体，并检验出氢气和氧气',
    fact: '<p>给水通电，水会被分解成<b>氢气</b>和<b>氧气</b>：负极产生氢气，正极产生氧气，氢气的体积大约是氧气的 <b>2 倍</b>。这说明水是由<b>氢</b>和<b>氧</b>两种元素组成的。</p><p>从分子来看：2 个水分子（H₂O）被拆开，重新组合成 2 个氢分子（H₂）和 1 个氧分子（O₂），所以氢气是氧气的 2 倍。</p><p>🔥 检验方法：氢气能被点燃，发出“噗”的一声；氧气能让<b>带火星的木条重新燃烧</b>。氢气燃烧后只生成水，是一种很干净的能源。</p><p>💡 纯水几乎不导电，所以实验时会在水里加一点点硫酸钠。</p>',
    quiz: [
      { q: '电解水时，负极和正极产生的气体体积比约是多少？', options: ['1 : 2', '2 : 1', '1 : 1'], answer: 1, explain: '负极是氢气，正极是氧气，氢气是氧气的 2 倍。' },
      { q: '能让带火星的木条重新燃烧的气体是？', options: ['氢气', '氧气'], answer: 1, explain: '氧气能帮助燃烧。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const TL = 170, TR = 330, TT = 70, TB = 330, MAXH = 20;
      let on = false, h2 = 0, o2 = 0, t = 0, fx = null;
      const tested = new Set();
      const bubbles = [];

      function test(which) {
        const v = which === 'h2' ? h2 : o2;
        if (v < 4) { api.note(`${which === 'h2' ? '负极' : '正极'}的气体太少了，先通电多收集一些吧。`); return; }
        fx = { which, k: 0 };
        if (which === 'h2') {
          h2 = 0;
          Sci.sfx('pop');
          api.note('噗！负极的气体被点燃了，发出轻轻的爆鸣声——它是氢气！');
        } else {
          o2 = 0;
          Sci.sfx('whoosh');
          api.note('带火星的木条“呼”地一下烧旺了——正极的气体是氧气！');
        }
        tested.add(which);
        if (tested.size === 2) api.timeout(() => {
          api.note('🎉 水通电后变成了氢气和氧气，体积比约 2 : 1。水是由氢和氧组成的！');
          api.goalDone();
        }, 1500);
      }
      function tube(x, gas, label, color) {
        const lvl = TT + 10 + gas / MAXH * (TB - TT - 70);
        ctx.fillStyle = 'rgba(160,210,255,.75)';
        ctx.fillRect(x - 22, lvl, 44, TB - lvl);
        ctx.fillStyle = 'rgba(255,255,255,.6)';
        ctx.fillRect(x - 22, TT, 44, lvl - TT);
        D.rrect(ctx, x - 24, TT - 8, 48, TB - TT + 8, 10);
        ctx.strokeStyle = '#8fa3bf';
        ctx.lineWidth = 3;
        ctx.stroke();
        for (let m = 0; m <= MAXH; m += 5) {
          const y = TT + 10 + m / MAXH * (TB - TT - 70);
          ctx.fillStyle = '#6c757d';
          ctx.fillRect(x + 14, y, 10, 2);
          D.text(ctx, String(m), x + 38, y + 1, { size: 12, color: '#6c757d', weight: 'normal' });
        }
        D.text(ctx, `${gas.toFixed(1)} 毫升`, x, TT - 26, { size: 16, color });
        D.text(ctx, label, x, TB + 82, { size: 15, color });
        // 电极
        ctx.fillStyle = '#495057';
        ctx.fillRect(x - 5, TB - 50, 10, 60);
      }
      function render() {
        ctx.fillStyle = '#f8f9ff';
        ctx.fillRect(0, 0, 800, 450);
        // 连通的底座
        ctx.fillStyle = 'rgba(160,210,255,.75)';
        ctx.fillRect(TL - 24, TB, TR - TL + 48, 30);
        ctx.strokeStyle = '#8fa3bf';
        ctx.lineWidth = 3;
        ctx.strokeRect(TL - 24, TB, TR - TL + 48, 30);
        tube(TL, h2, '负极（−）', '#1c7ed6');
        tube(TR, o2, '正极（＋）', '#e03131');
        bubbles.forEach(b => D.circle(ctx, b.x, b.y, 3, 'rgba(255,255,255,.95)', 'rgba(100,140,190,.6)', 1));
        // 电池和导线
        ctx.strokeStyle = on ? '#f59f00' : '#868e96';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(TL, TB + 30);
        ctx.lineTo(TL, TB + 55);
        ctx.lineTo(TR, TB + 55);
        ctx.lineTo(TR, TB + 30);
        ctx.stroke();
        D.rrect(ctx, (TL + TR) / 2 - 36, TB + 40, 72, 30, 6);
        ctx.fillStyle = on ? '#2f9e44' : '#495057';
        ctx.fill();
        D.text(ctx, on ? '🔋 通电中' : '🔋 断电', (TL + TR) / 2, TB + 55, { size: 13, color: '#fff' });
        D.text(ctx, h2 > 0.5 && o2 > 0.25 ? `氢气 : 氧气 ≈ ${(h2 / Math.max(0.01, o2)).toFixed(1)} : 1` : '', (TL + TR) / 2, 30, { size: 18, color: '#2b2840' });
        // 检验特效
        if (fx) {
          const x = fx.which === 'h2' ? TL : TR;
          if (fx.which === 'h2') {
            D.emoji(ctx, '🔥', x, TT - 50, 30);
            D.circle(ctx, x, TT - 10, 30 + fx.k * 50, `rgba(255,200,60,${0.6 * (1 - fx.k)})`);
            D.text(ctx, '噗！', x + 50, TT - 50, { size: 26, color: '#e8590c', alpha: 1 - fx.k });
          } else {
            ctx.strokeStyle = '#a0703c';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(x - 4, TT - 50);
            ctx.lineTo(x + 40, TT - 20);
            ctx.stroke();
            D.emoji(ctx, '🔥', x - 6, TT - 56, 26 + fx.k * 20);
          }
        }
        // 分子小动画：2 个水分子 → 2 个氢分子 + 1 个氧分子
        const MX = 470, MY = 120;
        D.rrect(ctx, MX, MY - 80, 310, 200, 16);
        ctx.fillStyle = '#fff';
        ctx.fill();
        D.text(ctx, '🔍 分子里发生了什么？', MX + 155, MY - 56, { size: 15, color: '#6f6a85' });
        const ph = (t * 0.35) % 1, e = Sci.smooth(0.3, 0.7, ph);
        const O = (x, y) => D.circle(ctx, x, y, 14, '#e03131');
        const H = (x, y) => D.circle(ctx, x, y, 9, '#e9ecef', '#868e96', 2);
        [[MX + 60, MY - 10], [MX + 60, MY + 60]].forEach(([x, y], i) => {
          const ox = lerp(x, MX + 240, e), oy = lerp(y, MY + 25 + (i ? 14 : -14), e);
          const hx = lerp(x + 18, MX + 160, e), hy = lerp(y - 12, MY - 10 + i * 70, e);
          const hx2 = lerp(x - 18, MX + 140, e), hy2 = lerp(y - 12, MY - 10 + i * 70, e);
          O(ox, oy);
          H(hx, hy);
          H(hx2, hy2);
        });
        D.text(ctx, e < 0.5 ? '2 个水分子 H₂O' : '2 个氢分子 H₂ ＋ 1 个氧分子 O₂', MX + 155, MY + 105, { size: 14, color: '#2b2840' });
        D.text(ctx, '⚪ 氢原子   🔴 氧原子', MX + 155, MY + 140, { size: 13, color: '#6f6a85', weight: 'normal' });
        D.text(ctx, `${tested.has('h2') ? '✅' : '⬜'} 检验负极气体　${tested.has('o2') ? '✅' : '⬜'} 检验正极气体`, 625, 400, { size: 15 });
      }
      api.loop(dt => {
        t += dt;
        if (on) {
          if (h2 < MAXH) h2 = Math.min(MAXH, h2 + dt * 1.2);
          if (o2 < MAXH / 2) o2 = Math.min(MAXH / 2, o2 + dt * 0.6);
          if (Math.random() < dt * 30) bubbles.push({ x: TL + rand(-8, 8), y: TB - 30, v: rand(80, 140) });
          if (Math.random() < dt * 15) bubbles.push({ x: TR + rand(-8, 8), y: TB - 30, v: rand(80, 140) });
          if (h2 >= MAXH && o2 >= MAXH / 2) {
            on = false;
            powerBtn.set(false);
            api.note('试管里装满气体啦，自动断电。现在来检验它们吧！');
          }
        }
        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];
          b.y -= b.v * dt;
          const gas = b.x < 250 ? h2 : o2;
          if (b.y < TT + 10 + gas / MAXH * (TB - TT - 70)) bubbles.splice(i, 1);
        }
        if (fx) { fx.k += dt / 1.2; if (fx.k >= 1) fx = null; }
        render();
      });
      const powerBtn = api.toggle('⚡ 打开电源', false, v => {
        on = v;
        api.note(v ? '通电了！两根电极上都冒出了气泡，看看哪边冒得多？' : '断电了，气泡停下来了。');
      });
      const row2 = api.row();
      api.button('🔥 点燃的火柴 → 负极气体', () => test('h2'), row2);
      api.button('🪵 带火星的木条 → 正极气体', () => test('o2'), row2);
      api.note('👆 点“打开电源”，开始电解水。');
    },
  });
})();
