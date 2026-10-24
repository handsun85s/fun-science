/* 物理小实验（第二组）：影子 → 声音的高低 → 摩擦力 → 滑轮 → 单摆 */
(function () {
  'use strict';
  const { clamp, lerp } = Sci;
  const D = Sci.draw;

  /* ================= 6. 影子的秘密 ================= */
  Sci.register({
    id: 'shadow',
    subject: 'physics',
    level: 1,
    emoji: '🌳',
    title: '影子的秘密',
    desc: '太阳跑到不同的地方，影子会怎么变？',
    intro: '晴天出门，你身边总跟着一个黑黑的小影子。影子是怎么来的？它会变长、变短，还会换方向吗？用手指拖动天上的太阳，仔细看看小树的影子是怎么变的。',
    goal: '让小树的影子变得很长、很短，并且分别朝左边和右边',
    fact: '<p>光是沿着<b>直线</b>走的。阳光照到小树上被挡住了，小树后面照不到光的地方，就是<b>影子</b>。</p><p>影子总是在<b>光的对面</b>：太阳在东边，影子朝西边；太阳在西边，影子朝东边。太阳越<b>低</b>，影子越<b>长</b>；太阳越<b>高</b>，影子越<b>短</b>。所以早上和傍晚影子长长的，中午影子最短。</p><p>🕰️ 古时候的人用“日晷”看影子的位置，就能知道现在是几点钟呢！</p>',
    quiz: [
      { q: '早上太阳在东边，小树的影子朝哪边？', options: ['东边', '西边'], answer: 1, explain: '影子总是在太阳的对面，太阳在东，影子就朝西。' },
      { q: '一天里什么时候影子最短？', options: ['早上', '中午', '傍晚'], answer: 1, explain: '中午太阳最高，影子最短。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const G = 360, OX = 400, TREE = 160, TOP = G - TREE;
      const sun = { x: 230, y: 110 };
      const got = new Set();
      const TIPS = {
        long: '太阳低低的，影子变得好长！早上和傍晚就是这样。',
        short: '太阳高高地挂在头顶，影子变得很短！中午就是这样。',
        left: '太阳在右边（西边），影子跑到了左边——影子总在太阳的对面。',
        right: '太阳在左边（东边），影子跑到了右边——影子总在太阳的对面。',
      };
      let rays = true;
      // 从太阳经过树顶画一条直线，碰到地面的地方就是影子的尖
      const shadowEnd = () => sun.x + (OX - sun.x) * (G - sun.y) / (TOP - sun.y);

      function check() {
        const end = shadowEnd(), len = Math.abs(end - OX);
        const hits = [];
        if (len > 260) hits.push('long');
        if (len < 40) hits.push('short');
        if (len > 80 && end < OX) hits.push('left');
        if (len > 80 && end > OX) hits.push('right');
        const fresh = hits.filter(k => !got.has(k));
        if (!fresh.length) return;
        fresh.forEach(k => got.add(k));
        Sci.sfx('good');
        api.note(fresh.map(k => TIPS[k]).join(' ') + `（完成 ${got.size}/4）`);
        if (got.size === 4) {
          api.timeout(() => {
            api.note('🎉 全部完成！影子总是在太阳的对面；太阳越低，影子越长。');
            api.goalDone();
          }, 1200);
        }
      }
      const moveSun = p => {
        sun.x = clamp(p.x, 40, 760);
        sun.y = clamp(p.y, 40, TOP - 30);
        check();
      };
      api.pointer(st, {
        down(p) { if (p.y < G) moveSun(p); },
        move(p, active) { if (active) moveSun(p); },
      });

      // 小树：用“高度”来画（v 往上为正），方便直接把它“压扁”到地上变成影子
      function treeShape(fill) {
        ctx.fillStyle = fill;
        ctx.fillRect(-9, 0, 18, 80);
        ctx.beginPath();
        ctx.arc(0, 115, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-30, 95, 28, 0, Math.PI * 2);
        ctx.arc(30, 95, 28, 0, Math.PI * 2);
        ctx.fill();
      }

      function render() {
        const high = Math.sqrt(clamp((TOP - 30 - sun.y) / (TOP - 70), 0, 1));
        const sky = ctx.createLinearGradient(0, 0, 0, G);
        sky.addColorStop(0, Sci.rgb(Sci.mixColor([255, 190, 120], [120, 190, 255], high)));
        sky.addColorStop(1, Sci.rgb(Sci.mixColor([255, 226, 180], [214, 238, 255], high)));
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 800, G);
        ctx.fillStyle = '#8fd16a';
        ctx.fillRect(0, G, 800, 450 - G);
        ctx.fillStyle = '#7cc25a';
        ctx.fillRect(0, G, 800, 6);

        // 影子：把小树“压扁、推斜”贴到地上
        const k = (shadowEnd() - OX) / TREE;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, G - 2, 800, 450 - G + 2);
        ctx.clip();
        ctx.transform(1, 0, k, 0.3, OX, G);
        treeShape('rgba(25,45,25,0.5)');
        ctx.restore();

        // 光线
        if (rays) {
          ctx.save();
          ctx.setLineDash([8, 8]);
          ctx.strokeStyle = 'rgba(255,170,0,0.75)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sun.x, sun.y);
          ctx.lineTo(shadowEnd(), G);
          ctx.stroke();
          ctx.restore();
        }

        // 小树
        ctx.save();
        ctx.transform(1, 0, 0, -1, OX, G);
        ctx.fillStyle = '#8d5a3b';
        ctx.fillRect(-9, 0, 18, 80);
        ctx.fillStyle = '#2f9e44';
        ctx.beginPath();
        ctx.arc(0, 115, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#37b24d';
        ctx.beginPath();
        ctx.arc(-30, 95, 28, 0, Math.PI * 2);
        ctx.arc(30, 95, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 太阳
        D.circle(ctx, sun.x, sun.y, 46, 'rgba(255,220,80,0.3)');
        D.emoji(ctx, '☀️', sun.x, sun.y, 64);

        D.text(ctx, '东', 30, G + 40, { size: 22, color: '#2b6a1f' });
        D.text(ctx, '西', 770, G + 40, { size: 22, color: '#2b6a1f' });
        const len = Math.abs(shadowEnd() - OX);
        D.text(ctx, len > 900 ? '影子长得看不到头啦！' : `影子长 ${(len / 40).toFixed(1)} 米`, 400, 420, { size: 20, color: '#2b4a1f' });
        D.text(ctx, '👆 拖动太阳', 790, 22, { size: 15, align: 'right', color: '#5b5470', weight: 'normal' });
        [['long', '很长'], ['short', '很短'], ['left', '朝左'], ['right', '朝右']].forEach(([key, s], i) =>
          D.text(ctx, (got.has(key) ? '✅ ' : '⬜ ') + '影子' + s, 20, 26 + i * 28, { size: 16, align: 'left', color: '#2b2840' }));
      }
      api.loop(render);
      api.toggle('☀️➖ 显示光线', true, v => { rays = v; });
      api.note('👆 按住太阳拖来拖去，看看影子怎么变。');
    },
  });

  /* ================= 7. 声音的高低 ================= */
  Sci.register({
    id: 'sound',
    subject: 'physics',
    level: 2,
    emoji: '🎸',
    title: '声音的高低',
    desc: '琴弦变长变短、变松变紧，声音会怎样变？',
    intro: '声音是从哪里来的？拨一下琴弦，琴弦就会飞快地抖动，这种抖动叫做“振动”，振动就发出了声音。拖动下面的滑块，改变琴弦的长短和松紧，听听声音的高低有什么不同。最后，试着调出和目标一样高的声音！',
    goal: '把琴弦调到和 3 个目标音一样高',
    fact: '<p>声音是由物体<b>振动</b>产生的。琴弦、鼓面，还有我们喉咙里的声带，都是靠振动发出声音的。</p><p>振动得越<b>快</b>，声音（音调）就越<b>高</b>；振动得越慢，声音越低。琴弦越<b>短</b>、越<b>紧</b>、越<b>细</b>，振动就越快，声音就越高。</p><p>🎻 弹吉他时手指按住琴弦，就是把能振动的那一段变短，所以声音变高啦！</p>',
    quiz: [
      { q: '把吉他的琴弦按得短一些，声音会怎样？', options: ['变高', '变低'], answer: 0, explain: '琴弦越短，振动越快，声音越高。' },
      { q: '声音是怎么产生的？', options: ['物体振动', '物体变热', '物体发光'], answer: 0, explain: '所有的声音都来自振动。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const X0 = 90, Y = 210, TARGETS = [196, 330, 523];
      const TIGHT = ['', '很松', '有点松', '中等', '有点紧', '很紧'];
      let len = 450, tight = 2, amp = 0, phase = 0, lv = 0, t = 0;
      const done = new Set();
      const freq = () => 98 * Math.sqrt(tight) * 600 / len;
      const fy = f => 400 - (Math.log(f / 80) / Math.log(720 / 80)) * 340; // 音高刻度（越往上越高）

      function pluck() {
        const f = freq();
        amp = 38;
        Sci.tone(f, 1.3, { type: 'triangle', vol: 0.16 });
        const r = f / TARGETS[lv];
        if (Math.abs(r - 1) < 0.035) {
          if (!done.has(lv)) {
            done.add(lv);
            Sci.sfx('star');
          }
          api.note(`🎯 一模一样高！琴弦每秒振动约 ${Math.round(f)} 次。` + (done.size < 3 ? `（已完成 ${done.size}/3，换下一个目标试试）` : ''));
          if (done.size === 3) api.goalDone();
        } else {
          api.note((r > 1 ? '比目标音高了一点⬆，试试把琴弦变长，或者放松一点。' : '比目标音低了一点⬇，试试把琴弦变短，或者拧紧一点。') + (Sci.muted ? '（声音关着呢，点右上角 🔊 打开）' : ''));
        }
      }
      api.pointer(st, {
        down(p) { if (p.x > X0 - 10 && p.x < X0 + len + 10 && Math.abs(p.y - Y) < 60) pluck(); },
      });

      function render() {
        ctx.fillStyle = '#fff7ec';
        ctx.fillRect(0, 0, 800, 450);
        // 琴身
        D.rrect(ctx, 40, Y - 70, 680, 140, 30);
        ctx.fillStyle = '#e0a96d';
        ctx.fill();
        ctx.strokeStyle = '#b97a3e';
        ctx.lineWidth = 4;
        ctx.stroke();
        D.circle(ctx, 400, Y, 46, '#7a4a22');
        // 琴弦
        const X1 = X0 + len;
        ctx.strokeStyle = '#e8e8f0';
        ctx.lineWidth = 2 + tight * 0.5;
        ctx.beginPath();
        for (let x = 0; x <= len; x += 4) {
          const y = Y + amp * Math.sin(Math.PI * x / len) * Math.cos(phase);
          if (x === 0) ctx.moveTo(X0 + x, y);
          else ctx.lineTo(X0 + x, y);
        }
        ctx.stroke();
        // 两端的弦枕和琴钮
        ctx.fillStyle = '#3d2a1a';
        ctx.fillRect(X0 - 6, Y - 22, 8, 44);
        ctx.fillRect(X1 - 2, Y - 22, 8, 44);
        ctx.save();
        ctx.translate(X0 - 26, Y);
        ctx.rotate(tight * 0.6);
        ctx.fillStyle = '#c0a060';
        ctx.fillRect(-14, -4, 28, 8);
        ctx.restore();
        D.circle(ctx, X0 - 26, Y, 7, '#8a6a30');
        D.text(ctx, `弦长 ${Math.round(len / 10)} 厘米 · 松紧：${TIGHT[tight]}`, 380, 330, { size: 20 });
        D.text(ctx, `每秒振动约 ${Math.round(freq())} 次`, 380, 365, { size: 17, color: '#6f6a85' });
        D.text(ctx, '👆 点琴弦，拨一下', 380, 110, { size: 16, color: '#8b6a40', weight: 'normal' });

        // 音高尺
        D.rrect(ctx, 730, 50, 40, 360, 20);
        ctx.fillStyle = '#efe7ff';
        ctx.fill();
        D.text(ctx, '高', 750, 34, { size: 16, color: '#6f6a85' });
        D.text(ctx, '低', 750, 432, { size: 16, color: '#6f6a85' });
        const ty = fy(TARGETS[lv]);
        ctx.fillStyle = 'rgba(255,140,0,.35)';
        ctx.fillRect(732, ty - 9, 36, 18);
        D.text(ctx, '🎯', 708, ty, { size: 18 });
        const cy = fy(freq());
        D.circle(ctx, 750, cy, 10, '#3d8bff', '#fff', 3);
        D.text(ctx, `目标 ${lv + 1}${done.has(lv) ? ' ✅' : ''}`, 60, 40, { size: 20, align: 'left', color: '#c0620a' });
      }
      api.loop(dt => {
        t += dt;
        phase += dt * Math.PI * 2 * freq() / 40;
        amp *= Math.exp(-1.6 * dt);
        render();
      });

      api.choice(TARGETS.map((_, i) => [i, `🎯 目标 ${i + 1}`]), 0, v => {
        lv = v;
        api.note('先点“听目标音”，再调琴弦，拨一下比一比。');
      });
      api.button('👂 听目标音', () => Sci.tone(TARGETS[lv], 1.3, { type: 'triangle', vol: 0.16 }));
      api.button('🎸 拨一下', pluck);
      const row2 = api.row();
      api.slider('琴弦长短', 200, 600, 5, len, v => { len = v; }, v => Math.round(v / 10) + ' 厘米', row2);
      api.slider('松紧', 1, 5, 1, tight, v => { tight = v; }, v => TIGHT[v], row2);
      api.note('👆 点“听目标音”听一听，再拖动下面的滑块调琴弦，拨一下比一比。');
    },
  });

  /* ================= 8. 摩擦力赛车 ================= */
  const SURFACES = [
    { id: 'ice', name: '🧊 冰面', mu: 0.25, color: '#d5f0ff', line: '#ffffff' },
    { id: 'wood', name: '🪵 木板', mu: 0.45, color: '#d9a066', line: '#b97a3e' },
    { id: 'carpet', name: '🧶 地毯', mu: 0.9, color: '#c45d5d', line: '#a84444' },
  ];

  Sci.register({
    id: 'friction',
    subject: 'physics',
    level: 3,
    emoji: '🚗',
    title: '摩擦力赛车',
    desc: '小车在冰面、木板、地毯上，谁滑得最远？',
    intro: '小车从斜坡上滑下来，在不同的路面上能滑多远呢？是光滑的冰面远，还是毛茸茸的地毯远？选好路面和斜坡的高度，点“放手”让小车滑下去。记住：比较的时候，斜坡高度要一样才公平哦！',
    goal: '斜坡高度不变，让小车在 3 种路面上各滑一次',
    fact: '<p>两个东西互相接触、滑动时，会产生一种阻碍运动的力，叫做<b>摩擦力</b>。</p><p>表面越<b>粗糙</b>，摩擦力越<b>大</b>，小车停得越快；表面越<b>光滑</b>，摩擦力越小，小车滑得越远。</p><p>摩擦力有好处也有坏处：鞋底和轮胎上的花纹能<b>增大</b>摩擦，让我们不容易滑倒；给车轴加润滑油能<b>减小</b>摩擦，让轮子转得更轻松。</p><p>🔬 做对比实验时，只改变一个条件（路面），其他条件（高度、小车）都不变，这样才公平。</p>',
    quiz: [
      { q: '同样的斜坡，小车在哪种路面上滑得最远？', options: ['冰面', '地毯', '沙地'], answer: 0, explain: '冰面最光滑，摩擦力最小。' },
      { q: '下雪天在路上撒沙子，是为了？', options: ['增大摩擦，防止打滑', '减小摩擦，让车跑得快'], answer: 0, explain: '沙子让路面变粗糙，摩擦力变大。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const G = 360, RX0 = 40, RX1 = 230, GR = 600, PX_M = 100;
      const HEIGHTS = [[50, '低'], [90, '中'], [130, '高']];
      let surf = SURFACES[0], hi = 1, car = null;
      const results = {}; // results['ice:1'] = 滑行距离（像素）
      const rampH = () => HEIGHTS[hi][0];

      function release() {
        const h = rampH(), L = Math.hypot(RX1 - RX0, h);
        car = { phase: 'ramp', s: 0, v: 0, x: RX1, L, h };
        Sci.sfx('whoosh');
        api.note('出发！');
      }
      function finish() {
        const d = car.x - RX1;
        results[surf.id + ':' + hi] = d;
        Sci.sfx('clack');
        const same = SURFACES.filter(s => results[s.id + ':' + hi] != null);
        api.note(`${surf.name}：滑了 ${(d / PX_M).toFixed(1)} 米。` + (same.length < 3 ? `同样的高度，再换别的路面试试（${same.length}/3）。` : ''));
        if (same.length === 3) {
          api.timeout(() => {
            api.note('🏁 比出来啦！同样的高度：冰面滑得最远，木板其次，地毯最近——路面越粗糙，摩擦力越大。');
            api.goalDone();
          }, 900);
        }
      }

      function drawCar(x, y, ang) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        ctx.scale(-1, 1);
        D.emoji(ctx, '🚗', 0, -18, 44);
        ctx.restore();
      }
      function render() {
        ctx.fillStyle = '#eef6ff';
        ctx.fillRect(0, 0, 800, 450);
        const h = rampH();
        // 路面
        ctx.fillStyle = surf.color;
        ctx.fillRect(RX1, G, 800 - RX1, 26);
        ctx.strokeStyle = surf.line;
        ctx.lineWidth = 2;
        for (let x = RX1 + 10; x < 800; x += surf.id === 'carpet' ? 12 : 40) {
          ctx.beginPath();
          if (surf.id === 'carpet') { ctx.arc(x, G + 13, 2.5, 0, Math.PI * 2); ctx.stroke(); } else { ctx.moveTo(x, G + 6); ctx.lineTo(x + 20, G + 6); ctx.stroke(); }
        }
        ctx.fillStyle = '#9aa3b5';
        ctx.fillRect(0, G + 26, 800, 450 - G - 26);
        // 斜坡
        ctx.fillStyle = '#7c8db5';
        ctx.beginPath();
        ctx.moveTo(RX0, G - h);
        ctx.lineTo(RX1, G);
        ctx.lineTo(RX0, G);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(RX0 - 20, G - h, 20, h);
        // 刻度
        for (let m = 0; m <= 5; m++) {
          const x = RX1 + m * PX_M;
          ctx.fillStyle = '#2b2840';
          ctx.fillRect(x - 1, G + 26, 2, 10);
          D.text(ctx, m + '米', x, G + 50, { size: 14, color: '#2b2840', weight: 'normal' });
        }
        // 这个高度下各种路面的成绩
        SURFACES.forEach((s, i) => {
          const d = results[s.id + ':' + hi];
          if (d == null) return;
          const x = RX1 + d;
          ctx.fillStyle = '#2b2840';
          ctx.fillRect(x - 1, G - 50, 2, 50);
          D.text(ctx, s.name.split(' ')[1], x + 4, G - 58 + i * 16, { size: 13, align: 'left', color: '#2b2840' });
        });
        // 小车
        if (!car) drawCar(RX0 + 10, G - h + 10 * h / (RX1 - RX0), Math.atan2(h, RX1 - RX0));
        else if (car.phase === 'ramp') {
          const f = car.s / car.L;
          drawCar(lerp(RX0, RX1, f), lerp(G - h, G, f), Math.atan2(h, RX1 - RX0));
        } else drawCar(car.x, G, 0);
        // 成绩表
        D.rrect(ctx, 470, 20, 310, 130, 14);
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        ctx.fill();
        D.text(ctx, '斜坡', 520, 42, { size: 15, color: '#6f6a85' });
        HEIGHTS.forEach(([, n], j) => D.text(ctx, n, 590 + j * 70, 42, { size: 15, color: j === hi ? '#c0620a' : '#6f6a85' }));
        SURFACES.forEach((s, i) => {
          D.text(ctx, s.name.split(' ')[1], 520, 72 + i * 28, { size: 15 });
          HEIGHTS.forEach((_, j) => {
            const d = results[s.id + ':' + j];
            D.text(ctx, d == null ? '—' : (d / PX_M).toFixed(1) + '米', 590 + j * 70, 72 + i * 28, { size: 15, color: j === hi ? '#2b2840' : '#8b87a0', weight: 'normal' });
          });
        });
      }
      api.loop(dt => {
        if (car && car.phase !== 'stop') {
          for (let k = 0; k < 4; k++) {
            const d = dt / 4;
            if (car.phase === 'ramp') {
              car.v += GR * car.h / car.L * d;
              car.s += car.v * d;
              if (car.s >= car.L) { car.phase = 'flat'; car.x = RX1; }
            } else if (car.phase === 'flat') {
              car.v -= surf.mu * GR * d;
              if (car.v <= 0) { car.v = 0; car.phase = 'stop'; finish(); break; }
              car.x += car.v * d;
            }
          }
        }
        render();
      });
      api.button('🚗 放手！', release);
      api.choice(SURFACES.map(s => [s.id, s.name]), surf.id, v => {
        surf = SURFACES.find(s => s.id === v);
        car = null;
      });
      const row2 = api.row();
      api.choice(HEIGHTS.map(([, n], i) => [i, '斜坡：' + n]), hi, v => {
        hi = v;
        car = null;
        api.note('换了斜坡高度。比较路面的时候，3 次都要用同样的高度哦。');
      }, row2);
      api.note('👆 选一种路面，点“🚗 放手！”，看看小车能滑多远。');
    },
  });

  /* ================= 9. 滑轮省力气 ================= */
  const LOADS = [['bag', '🎒', '书包', 20], ['box', '📦', '箱子', 60], ['barrel', '🛢️', '大油桶', 120]];
  const PULLEYS = [[1, '定滑轮'], [2, '动滑轮'], [4, '滑轮组']];
  const KID = 30; // 小朋友最多能使出“提起 30 千克”那么大的力气

  Sci.register({
    id: 'pulley',
    subject: 'physics',
    level: 4,
    emoji: '🏗️',
    title: '滑轮省力气',
    desc: '用滑轮吊重物，能省多少力气？',
    intro: '工地上的吊车能把很重的钢材吊上高楼，秘密之一就是滑轮。小朋友最多只能使出提起 30 千克东西的力气，可是大油桶有 120 千克！选一种滑轮，按住小手往下拉绳子，看看能不能把东西吊到窗台上。',
    goal: '用滑轮把 120 千克的大油桶吊到窗台上',
    fact: '<p><b>定滑轮</b>固定在上面，不省力，但能<b>改变用力的方向</b>——往下拉，东西往上走。升旗用的就是定滑轮。</p><p><b>动滑轮</b>跟着重物一起动，有 2 段绳子一起吊着重物，只要用<b>一半</b>的力气。</p><p><b>滑轮组</b>把定滑轮和动滑轮组合起来：有几段绳子吊着重物，力气就变成几分之一。但是天下没有白吃的午餐——<b>省了力气，就要多拉绳子</b>：4 段绳子吊着，箱子升高 1 米，绳子要拉 4 米。</p>',
    quiz: [
      { q: '用一个动滑轮吊起 40 千克的东西，大约需要多大的力气？', options: ['40 千克', '20 千克', '80 千克'], answer: 1, explain: '动滑轮有 2 段绳子吊着重物，力气减半。' },
      { q: '滑轮组省了力气，那它省不省拉绳子的距离？', options: ['也省距离', '不省，要多拉绳子'], answer: 1, explain: '省力就要费距离，力气和距离不能同时都省。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const FLOOR = 410, RISE = 160, BX = 300, HX = 470, H0 = 170, PX_M = 40;
      let n = 1, load = LOADS[0], rise = 0, pulled = 0, hand = H0, drag = null, shake = 0, warned = false, t = 0;
      const lifted = new Set();
      const force = () => load[3] / n;
      const boxY = () => FLOOR - 40 - rise;

      function reset() {
        rise = 0;
        pulled = 0;
        warned = false;
      }
      api.pointer(st, {
        down(p) {
          if (Math.hypot(p.x - HX, p.y - hand) < 60) drag = { y: p.y };
        },
        move(p, active) {
          if (!active || !drag) return;
          const dy = p.y - drag.y;
          drag.y = p.y;
          if (dy <= 0) return;
          if (force() > KID) {
            shake = 0.4;
            if (!warned) {
              warned = true;
              Sci.sfx('bad');
              api.note(`拉不动！${load[2]}要 ${force()} 千克的力气，小朋友最多只有 ${KID} 千克。换一种更省力的滑轮试试吧。`);
            }
            return;
          }
          if (rise >= RISE) return;
          hand = clamp(hand + dy, H0, 400);
          const r = Math.min(RISE - rise, dy / n);
          rise += r;
          pulled += r * n;
          if (rise >= RISE) arrive();
        },
        up() { drag = null; },
      });
      function arrive() {
        lifted.add(load[0]);
        Sci.sfx('star');
        api.note(`到窗台啦！${load[2]}升高了 ${(RISE / PX_M).toFixed(0)} 米，绳子一共拉了 ${(pulled / PX_M).toFixed(0)} 米。`);
        if (load[0] === 'barrel') api.timeout(() => {
          api.note(`🎉 120 千克的大油桶吊上去啦！${n} 段绳子一起吊着它，每段只要出 ${force()} 千克的力气。`);
          api.goalDone();
        }, 1200);
      }

      function pulley(x, y, r) {
        D.circle(ctx, x, y, r, '#c9d3e6', '#4a5670', 3);
        D.circle(ctx, x, y, 4, '#4a5670');
      }
      function render() {
        ctx.fillStyle = '#f4f7fb';
        ctx.fillRect(0, 0, 800, 450);
        // 房子和窗台
        ctx.fillStyle = '#ffe2b8';
        ctx.fillRect(40, 60, 160, FLOOR - 60);
        ctx.fillStyle = '#c79055';
        ctx.fillRect(40, FLOOR - 40 - RISE + 30, 225, 10);
        D.text(ctx, '🪟 窗台', 120, FLOOR - 40 - RISE - 20, { size: 18, color: '#8d5a2b' });
        ctx.fillStyle = '#9aa3b5';
        ctx.fillRect(0, FLOOR, 800, 450 - FLOOR);
        // 横梁
        ctx.fillStyle = '#5b6680';
        ctx.fillRect(200, 30, 360, 16);

        // 上面是挂在横梁上的定滑轮；n ≥ 2 时下面还有跟着重物走的动滑轮，中间有 n 段绳子吊着
        const by = boxY(), top = by - 40, my = top - 24, R = 11;
        const xs = [];
        for (let i = 0; i < n; i++) xs.push(BX - (n - 1) * R + i * 2 * R);
        const bottomY = n === 1 ? top : my;
        ctx.strokeStyle = '#8a5a2b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        xs.forEach(x => { ctx.moveTo(x, 70); ctx.lineTo(x, bottomY); });
        const last = xs[n - 1] + 2 * R;
        ctx.moveTo(last - R, 70 - R);
        ctx.lineTo(HX - R, 70 - R);
        ctx.moveTo(HX, 70);
        ctx.lineTo(HX, FLOOR - 6);
        ctx.stroke();
        ctx.fillStyle = '#5b6680';
        const tops = n === 1 ? [xs[0] + R] : xs.filter((_, i) => i % 2 === 1).map(x => x + R);
        tops.concat([HX - R]).forEach(x => { ctx.fillRect(x - 3, 46, 6, 24); pulley(x, 70, R); });
        if (n > 1) {
          ctx.fillRect(xs[0] - 3, 46, 6, 24);
          xs.filter((_, i) => i % 2 === 0).forEach(x => pulley(x + R, my, R));
          ctx.strokeStyle = '#4a5670';
          ctx.beginPath();
          ctx.moveTo(xs[0] + R, my + R + 3);
          ctx.lineTo(xs[n - 2] + R, my + R + 3);
          ctx.moveTo(BX, my + R + 3);
          ctx.lineTo(BX, top);
          ctx.stroke();
        }
        D.text(ctx, `${n} 段绳子吊着`, BX - 100, Math.max(100, (70 + bottomY) / 2), { size: 15, color: '#c0620a' });
        // 重物
        D.emoji(ctx, load[1], BX, by, 70);
        D.text(ctx, `${load[2]} ${load[3]} 千克`, BX, by + 46, { size: 15, color: '#2b2840' });
        // 小手和小朋友
        const sh = shake > 0 ? Math.sin(t * 60) * 5 : 0;
        D.emoji(ctx, '✊', HX + sh, hand + 10, 40);
        D.emoji(ctx, force() > KID ? '😣' : '😊', HX + 90 + sh, 300, 60);
        D.text(ctx, `需要 ${force()} 千克的力气`, HX + 160, 210, { size: 17, color: force() > KID ? '#c0392b' : '#1f9d55' });
        D.text(ctx, `我最多有 ${KID} 千克`, HX + 160, 236, { size: 15, color: '#6f6a85', weight: 'normal' });
        D.text(ctx, `绳子拉了 ${(pulled / PX_M).toFixed(1)} 米 · 升高了 ${(rise / PX_M).toFixed(1)} 米`, 560, 434, { size: 16, color: '#fff' });
        D.text(ctx, '👆 按住小拳头往下拉，松手再拉', 560, 20, { size: 14, color: '#6f6a85', weight: 'normal' });
      }
      api.loop(dt => {
        t += dt;
        shake = Math.max(0, shake - dt);
        if (!drag) hand += (H0 - hand) * Math.min(1, dt * 10);
        render();
      });
      api.choice(PULLEYS.map(([k, name]) => [k, `${name}（${k} 段绳子）`]), n, v => {
        n = v;
        reset();
        api.note(v === 1 ? '定滑轮：不省力，但能把“往下拉”变成“往上吊”。' : v === 2 ? '动滑轮：2 段绳子吊着，力气只要一半。' : '滑轮组：4 段绳子吊着，力气只要四分之一！');
      });
      const row2 = api.row();
      api.choice(LOADS.map(l => [l[0], `${l[1]} ${l[2]} ${l[3]}千克`]), load[0], v => {
        load = LOADS.find(l => l[0] === v);
        reset();
        api.note(`换成了${load[2]}，${load[3]} 千克。`);
      }, row2);
      api.note('👆 按住右边的小拳头往下拉。拉一下、松手，再拉一下，就像真的拉绳子一样。');
    },
  });

  /* ================= 10. 单摆的秘密 ================= */
  const BOBS = [['pp', '🏓', '乒乓球', 26], ['apple', '🍎', '苹果', 36], ['bowl', '🎳', '保龄球', 44]];

  Sci.register({
    id: 'pendulum',
    subject: 'physics',
    level: 5,
    emoji: '🕰️',
    title: '单摆的秘密',
    desc: '摆一个来回要多久？和什么有关？',
    intro: '四百多年前，年轻的伽利略在教堂里看着一盏摇晃的吊灯，发现了一个秘密。我们也来当一回科学家：一根绳子吊着一个摆锤，就是“单摆”。改变绳子的长度、换一个更重的摆锤，看看摆 5 个来回的时间会不会变。',
    goal: '做对比实验：只换摆锤、只改摆长，各比一次',
    fact: '<p>单摆摆一个来回的时间叫<b>周期</b>。实验发现：周期只和<b>摆长</b>有关——摆长越长，摆得越慢；和摆锤<b>轻重无关</b>，摆的角度不太大时，也几乎和角度无关。</p><p>伽利略发现了这个规律，后来人们用它造出了<b>摆钟</b>：摆一下的时间总是一样的，就能用来数时间。摆钟走快了，把摆杆调长一点就好。</p><p>🔬 科学家做实验时每次<b>只改变一个条件</b>，这叫“控制变量”。数 5 个来回再平均，也是为了让测量更准确。</p>',
    quiz: [
      { q: '摆钟走得太快了，应该怎么调？', options: ['把摆变长', '换一个更重的摆锤', '把摆变短'], answer: 0, explain: '摆长越长，摆一个来回的时间越长，钟就走慢了。' },
      { q: '两个单摆一样长，一个挂铁球，一个挂木球，谁摆一个来回更快？', options: ['铁球', '木球', '一样快'], answer: 2, explain: '周期和摆锤的轻重无关。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const PX = 230, PY = 30, SCALE = 150, GRAV = 9.8, SWINGS = 5;
      let L = 1.2, bob = BOBS[1], th = 0.35, om = 0, running = false, time = 0, half = 0, lastSign = 0, dragging = false;
      const results = [];

      function start() {
        if (running) return;
        running = true;
        om = 0;
        time = 0;
        half = 0;
        lastSign = 0;
        api.note('计时开始，数 5 个来回……');
      }
      function stop() {
        running = false;
        const rec = { L, bob, deg: Math.round(Math.abs(th0) * 180 / Math.PI), time };
        results.push(rec);
        if (results.length > 6) results.shift();
        Sci.sfx('good');
        const prev = results[results.length - 2];
        let msg = `摆长 ${L.toFixed(1)} 米，${bob[2]}：5 个来回用了 ${time.toFixed(1)} 秒。`;
        if (prev && Math.abs(prev.L - L) < 0.01 && prev.bob !== bob) msg += ' 只换了摆锤，时间几乎一样！';
        else if (prev && Math.abs(prev.L - L) >= 0.01) msg += prev.L < L ? ' 摆长变长了，摆得变慢了！' : ' 摆长变短了，摆得变快了！';
        api.note(msg);
        th = th0;
        om = 0;
        const sameLDiffBob = results.some(a => results.some(b => Math.abs(a.L - b.L) < 0.01 && a.bob !== b.bob));
        const diffL = results.some(a => results.some(b => Math.abs(a.L - b.L) >= 0.01));
        if (sameLDiffBob && diffL) api.timeout(() => {
          api.note('🎉 你发现了！摆一个来回的时间只和摆长有关，和摆锤轻重无关。');
          api.goalDone();
        }, 1500);
      }
      let th0 = th;
      const bobPos = () => [PX + Math.sin(th) * L * SCALE, PY + Math.cos(th) * L * SCALE];

      api.pointer(st, {
        down(p) {
          const [bx, by] = bobPos();
          if (!running && Math.hypot(p.x - bx, p.y - by) < 50) dragging = true;
        },
        move(p, active) {
          if (!active || !dragging) return;
          th = clamp(Math.atan2(p.x - PX, p.y - PY), -1.05, 1.05);
          th0 = th;
        },
        up() { dragging = false; },
      });

      function render() {
        ctx.fillStyle = '#f7f4ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#5b6680';
        ctx.fillRect(PX - 80, PY - 12, 160, 12);
        // 量角的虚线
        ctx.save();
        ctx.setLineDash([5, 6]);
        ctx.strokeStyle = 'rgba(80,80,120,.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(PX, PY);
        ctx.lineTo(PX, PY + L * SCALE + 30);
        ctx.stroke();
        ctx.restore();
        const [bx, by] = bobPos();
        ctx.strokeStyle = '#4a4560';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(PX, PY);
        ctx.lineTo(bx, by);
        ctx.stroke();
        D.emoji(ctx, bob[1], bx, by, bob[3]);
        if (!running) {
          D.text(ctx, `摆角 ${Math.round(Math.abs(th) * 180 / Math.PI)}°`, PX, 430, { size: 16, color: '#6f6a85' });
          D.text(ctx, '👆 拖动摆锤可以改角度', PX, 404, { size: 14, color: '#8b87a0', weight: 'normal' });
        } else {
          D.text(ctx, `⏱️ ${time.toFixed(1)} 秒 · 第 ${Math.min(SWINGS, Math.floor(half / 2) + 1)} 个来回`, PX, 420, { size: 20, color: '#c0620a' });
        }
        // 记录表
        D.rrect(ctx, 470, 20, 315, 250, 14);
        ctx.fillStyle = '#fff';
        ctx.fill();
        D.text(ctx, '实验记录', 627, 42, { size: 17 });
        ['摆长', '摆锤', '角度', '5个来回'].forEach((s, i) => D.text(ctx, s, 510 + i * 75, 70, { size: 14, color: '#6f6a85' }));
        results.forEach((r, i) => {
          const y = 98 + i * 28;
          D.text(ctx, r.L.toFixed(1) + '米', 510, y, { size: 15, weight: 'normal' });
          D.text(ctx, r.bob[1], 585, y, { size: 18 });
          D.text(ctx, r.deg + '°', 660, y, { size: 15, weight: 'normal' });
          D.text(ctx, r.time.toFixed(1) + '秒', 735, y, { size: 15, color: '#c0620a' });
        });
        if (!results.length) D.text(ctx, '还没有记录', 627, 150, { size: 15, color: '#8b87a0', weight: 'normal' });
      }
      api.loop(dt => {
        if (running) {
          const N = 20, d = dt / N;
          for (let k = 0; k < N && running; k++) {
            om += -GRAV / L * Math.sin(th) * d;
            th += om * d;
            time += d;
            const s = Math.sign(om);
            if (s && lastSign && s !== lastSign) {
              half++;
              if (half >= SWINGS * 2) stop();
            }
            if (s) lastSign = s;
          }
        }
        render();
      });
      api.button('▶ 放手，数 5 个来回', start);
      api.choice(BOBS.map(b => [b[0], `${b[1]} ${b[2]}`]), bob[0], v => {
        if (running) return;
        bob = BOBS.find(b => b[0] === v);
      });
      const row2 = api.row();
      api.slider('摆长', 0.3, 2.4, 0.1, L, v => {
        if (running) { running = false; th = th0; om = 0; }
        L = v;
      }, v => v.toFixed(1) + ' 米', row2);
      api.note('👆 先点“放手”，看看摆 5 个来回要多少秒。再换摆锤、改摆长，比一比。');
    },
  });
})();
