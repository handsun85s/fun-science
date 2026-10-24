/* 工程小创客（第三组）：橡皮泥小船 → 纸飞机 → 保温小屋 → 风力发电 → 护蛋行动 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 11. 橡皮泥小船 ================= */
  const HULLS = [['ball', '捏成圆球', 0, 40], ['bowl', '捏成小碗', 5, 90], ['boat', '捏成宽宽的船', 14, 180]];

  Sci.register({
    id: 'clayboat',
    subject: 'engineering',
    level: 1,
    emoji: '⛵',
    title: '橡皮泥小船',
    desc: '一团会沉的橡皮泥，怎样才能浮起来装货？',
    intro: '一团橡皮泥放进水里，扑通一声就沉了。可是把它捏成小船的样子，它就能浮起来，还能装东西！试试把同样多的橡皮泥捏成不同的形状，往船里一枚一枚放硬币，看看哪种形状装得最多。',
    goal: '设计一艘能装 10 枚以上硬币的小船',
    fact: '<p>同样多的橡皮泥，捏成圆球会沉下去；捏成中间空空的船形，就能<b>排开更多的水</b>，得到更大的浮力，于是浮了起来。</p><p>船底越<b>宽</b>、船舷越<b>高</b>，能排开的水越多，就能装下越多的货物。货物太多时，船吃水越来越深，水漫进船里，船就沉了。</p><p>🚢 万吨巨轮是用钢铁造的，也是靠这个道理浮在海上。</p>',
    quiz: [
      { q: '同样多的橡皮泥，什么形状能浮在水上？', options: ['中间空空的船形', '实心的圆球'], answer: 0, explain: '船形能排开更多的水，浮力更大。' },
      { q: '小船里的货物越放越多，船会怎样？', options: ['越沉越深，最后沉没', '浮得越来越高'], answer: 0, explain: '货物越重，船吃水越深。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const WATER = 260;
      let hull = HULLS[0], coins = 0, sunk = false, y = 0, best = 0, t = 0;

      function reset() { coins = 0; sunk = hull[2] === 0; y = 0; if (sunk) { Sci.sfx('plop'); api.note('扑通！实心的圆球直接沉到了水底。'); } else api.note(`${hull[1]}浮起来了！往里放硬币试试。`); }
      function addCoin() {
        if (sunk) { api.note('船已经沉了，点“捞起来重来”。'); return; }
        coins++;
        Sci.sfx('click');
        if (coins > hull[2]) {
          sunk = true;
          Sci.sfx('splash');
          api.note(`水漫进来了，船沉了！${hull[1]}最多能装 ${hull[2]} 枚硬币。`);
          return;
        }
        best = Math.max(best, coins);
        api.note(`装了 ${coins} 枚硬币，船吃水更深了。`);
        if (coins >= 10) { Sci.sfx('star'); api.note(`🎉 宽宽的小船装了 ${coins} 枚硬币还浮着！船底越宽，能装得越多。`); api.goalDone(); }
      }
      api.loop(dt => {
        t += dt;
        const depth = sunk ? 150 : 10 + (coins / Math.max(1, hull[2])) * 34;
        y += (depth - y) * Math.min(1, dt * 3);
        ctx.fillStyle = '#e7f5ff';
        ctx.fillRect(0, 0, 800, 450);
        // 水槽
        ctx.fillStyle = 'rgba(77,171,247,.45)';
        ctx.fillRect(100, WATER, 600, 170);
        ctx.strokeStyle = '#74c0fc';
        ctx.lineWidth = 4;
        ctx.strokeRect(100, 100, 600, 330);
        // 船
        const cx = 400, top = WATER - 40 + y, w = hull[3];
        ctx.fillStyle = '#e64980';
        if (hull[0] === 'ball') D.circle(ctx, cx, Math.min(top + 30, 400), 26, '#e64980');
        else {
          ctx.beginPath();
          ctx.moveTo(cx - w / 2, top);
          ctx.quadraticCurveTo(cx - w / 2 + 10, top + 46, cx, top + 46);
          ctx.quadraticCurveTo(cx + w / 2 - 10, top + 46, cx + w / 2, top);
          ctx.lineTo(cx + w / 2 - 8, top);
          ctx.quadraticCurveTo(cx + w / 2 - 16, top + 38, cx, top + 38);
          ctx.quadraticCurveTo(cx - w / 2 + 16, top + 38, cx - w / 2 + 8, top);
          ctx.closePath();
          ctx.fill();
          for (let i = 0; i < Math.min(coins, hull[2] + 1); i++) D.circle(ctx, cx - w / 2 + 22 + (i % 7) * ((w - 44) / 6 || 0), top + 30 - Math.floor(i / 7) * 8, 7, '#fab005', '#e67700', 1);
        }
        // 水面（画在船前面一点，看起来像泡在水里）
        ctx.fillStyle = 'rgba(77,171,247,.25)';
        ctx.fillRect(100, WATER, 600, 12);
        D.text(ctx, `${hull[1]}：装了 ${coins} 枚硬币`, 400, 50, { size: 20 });
        D.text(ctx, `最多装过 ${best} 枚`, 400, 80, { size: 15, color: '#6f6a85' });
      });
      api.choice(HULLS.map(h => [h[0], h[1]]), hull[0], v => { hull = HULLS.find(h => h[0] === v); reset(); });
      const r2 = api.row();
      api.button('💰 放一枚硬币', addCoin, r2);
      api.button('🔄 捞起来重来', reset, r2);
      reset();
    },
  });

  /* ================= 12. 纸飞机 ================= */
  const WINGS = [['small', '小机翼', 6], ['mid', '中机翼', 10], ['big', '大机翼', 8]];
  const CLIPS = [[0, '不夹回形针', 0.6], [1, '机头夹 1 个', 1.3], [2, '机头夹 2 个', 0.75]];

  Sci.register({
    id: 'paperplane',
    subject: 'engineering',
    level: 2,
    emoji: '✈️',
    title: '纸飞机',
    desc: '机翼、配重和角度，怎样飞得最远？',
    intro: '纸飞机人人都会叠，可是怎样才能飞得又稳又远呢？机翼大小、机头加不加回形针、扔出去的角度，都会影响飞行。像工程师一样做试验：每次改变一个地方，看看记录，找出能飞过 15 米的设计！',
    goal: '设计出能飞过 15 米的纸飞机',
    fact: '<p>纸飞机靠<b>机翼</b>产生向上的托力（升力）。机翼太小，托不住；太大，空气阻力大，飞不远。</p><p>机头太轻，飞机会抬头、失速掉下来；机头太重，又会一头栽下去。在机头夹一个回形针，让<b>重心</b>靠前一点，飞得最稳。扔的角度稍微向上一点点最好。</p><p>🔬 每次只改变一个条件，看看结果有什么不同，这样才能知道是哪个原因起了作用——这叫<b>控制变量</b>。</p>',
    quiz: [
      { q: '纸飞机总是抬头然后掉下来，应该怎么改？', options: ['在机头加一点重量', '把机翼剪小'], answer: 0, explain: '重心靠前，飞机就不容易失速抬头。' },
      { q: '想知道机翼大小对飞行的影响，做实验时应该？', options: ['只改机翼大小，其他都不变', '所有东西一起改'], answer: 0, explain: '每次只改一个条件，才能比较出结果。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const G = 400, PXM = 34, X0 = 50;
      let wing = WINGS[0], clip = CLIPS[0], angle = 20, fly = null, best = 0, done = false;
      const log = [];
      const distance = () => {
        const angF = clamp(1 - Math.abs(angle - 10) / 40, 0.3, 1);
        const stall = clip[0] === 0 && angle > 10 ? 0.75 : 1;
        return Math.round(wing[2] * clip[2] * angF * stall * 1.5 * 10) / 10;
      };
      function throwIt() {
        if (fly) return;
        fly = { k: 0, d: distance(), type: clip[0] === 0 ? 'stall' : clip[0] === 2 ? 'dive' : 'glide' };
        Sci.sfx('whoosh');
      }
      api.loop(dt => {
        if (fly) {
          fly.k += dt / 2.2;
          if (fly.k >= 1) {
            log.unshift({ w: wing[1], c: clip[0], a: angle, d: fly.d });
            if (log.length > 6) log.pop();
            best = Math.max(best, fly.d);
            Sci.sfx(fly.d >= 15 ? 'star' : 'plop');
            api.note(`飞了 ${fly.d} 米。` + (fly.d >= 15 ? '🎉 超过 15 米，设计成功！' : fly.type === 'stall' ? '飞机抬头后掉了下来——机头太轻了。' : fly.type === 'dive' ? '飞机一头栽了下去——机头太重了。' : '再调一调机翼或角度？'));
            if (fly.d >= 15 && !done) { done = true; api.goalDone(); }
            fly = null;
          }
        }
        ctx.fillStyle = '#e7f5ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#b2f2bb';
        ctx.fillRect(0, G, 800, 50);
        for (let m = 0; m <= 20; m += 5) { const x = X0 + m * PXM; ctx.fillStyle = '#2b8a3e'; ctx.fillRect(x - 1, G, 2, 10); D.text(ctx, m + '米', x, G + 24, { size: 13, color: '#2b8a3e' }); }
        ctx.fillStyle = '#e03131';
        ctx.fillRect(X0 + 15 * PXM - 1, G - 40, 3, 40);
        // 飞机
        let x = X0, y = G - 110, rot = -angle * Math.PI / 180;
        if (fly) {
          const k = fly.k, dist = fly.d * PXM;
          x = X0 + dist * k;
          if (fly.type === 'stall') { y = G - 110 - Math.sin(Math.min(k * 2, 1) * Math.PI) * 50 + Math.max(0, k - 0.5) * 220; rot = k < 0.4 ? -0.6 : 0.8; }
          else if (fly.type === 'dive') { y = G - 110 + k * k * 110; rot = 0.5; }
          else { y = G - 110 - Math.sin(k * Math.PI) * 40 + k * 110; rot = -0.1 + k * 0.3; }
          y = Math.min(y, G - 8);
        }
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        const ws = { small: 0.7, mid: 1, big: 1.35 }[wing[0]];
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#868e96';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(30, 0);
        ctx.lineTo(-30, -14 * ws);
        ctx.lineTo(-20, 0);
        ctx.lineTo(-30, 10 * ws);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        for (let i = 0; i < clip[0]; i++) { ctx.strokeStyle = '#495057'; ctx.strokeRect(22 - i * 6, -3, 5, 6); }
        ctx.restore();
        // 记录
        D.rrect(ctx, 520, 20, 265, 210, 14);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ['机翼', '回形针', '角度', '距离'].forEach((s, i) => D.text(ctx, s, 555 + i * 62, 44, { size: 13, color: '#6f6a85' }));
        log.forEach((r, i) => {
          const yy = 70 + i * 25;
          D.text(ctx, r.w.slice(0, 1), 555, yy, { size: 13, weight: 'normal' });
          D.text(ctx, r.c + '个', 617, yy, { size: 13, weight: 'normal' });
          D.text(ctx, r.a + '°', 679, yy, { size: 13, weight: 'normal' });
          D.text(ctx, r.d + '米', 741, yy, { size: 13, color: r.d >= 15 ? '#2b8a3e' : '#c0620a' });
        });
        D.text(ctx, `最远：${best} 米`, 652, 255, { size: 17 });
      });
      api.choice(WINGS.map(w => [w[0], w[1]]), wing[0], v => { wing = WINGS.find(w => w[0] === v); });
      const r2 = api.row();
      api.choice(CLIPS.map(c => [c[0], c[1]]), clip[0], v => { clip = CLIPS.find(c => c[0] === v); }, r2);
      const r3 = api.row();
      api.slider('扔出角度', 0, 40, 5, angle, v => { angle = v; }, v => v + '°', r3);
      api.button('✈️ 扔出去', throwIt, r3);
      api.note('👆 先试一次，看看记录，再一次改一个地方。');
    },
  });

  /* ================= 13. 保温小屋 ================= */
  const WALLS = [['paper', '纸板墙', 1.2], ['wood', '木板墙', 0.7], ['foam', '木板 + 泡沫保温层', 0.25]];
  const WINS = [['big', '大窗户', 0.6], ['small', '小窗户', 0.3], ['double', '双层玻璃窗', 0.15]];
  const ROOFS = [['plain', '普通屋顶', 0.5], ['warm', '屋顶加保温棉', 0.15]];

  Sci.register({
    id: 'warmhouse',
    subject: 'engineering',
    level: 3,
    emoji: '🏠',
    title: '保温小屋',
    desc: '冬天怎样让房子更暖和、更省电？',
    intro: '冬天外面零下 10 度，屋里开着一台暖气，可是热量会从墙壁、窗户和屋顶悄悄溜走！选择墙壁、窗户和屋顶的材料，看看红色的箭头（溜走的热量）有什么变化，让屋里暖和到 20 度以上。',
    goal: '让屋里的温度达到 20°C 以上',
    fact: '<p>热量总是从<b>热的地方往冷的地方跑</b>。冬天，屋里的热量会穿过墙、窗户和屋顶跑到外面去。</p><p>有些材料不容易让热量通过，叫<b>热的不良导体</b>，比如泡沫、棉花、羽绒、空气。墙里加泡沫保温层、屋顶铺保温棉、装双层玻璃（中间夹着空气），都能把热量留在屋里。</p><p>🧊 夏天也一样：好的保温能挡住外面的热，空调省电。北方的房子墙特别厚，就是为了保暖。</p>',
    quiz: [
      { q: '下面哪种材料保温效果最好？', options: ['泡沫', '铁片', '玻璃'], answer: 0, explain: '泡沫里有很多空气，不容易传热。' },
      { q: '双层玻璃窗为什么保温好？', options: ['两层玻璃中间夹着不容易传热的空气', '玻璃变厚变重了'], answer: 0, explain: '空气是热的不良导体。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const OUT = -10, HEAT = 18;
      let wall = WALLS[0], win = WINS[0], roof = ROOFS[0], temp = OUT, t = 0, done = false;
      const loss = () => wall[2] + win[2] + roof[2];
      const target = () => OUT + HEAT / loss();
      api.loop(dt => {
        t += dt;
        temp += (target() - temp) * Math.min(1, dt * 1.5);
        if (temp >= 19.95 && target() >= 20 && !done) { done = true; Sci.sfx('star'); api.note(`🎉 屋里 ${Math.round(target())}°C，暖暖和和！墙、窗、屋顶都做好了保温，热量就跑不掉了。`); api.goalDone(); }
        ctx.fillStyle = '#dbe4ff';
        ctx.fillRect(0, 0, 800, 450);
        for (let i = 0; i < 40; i++) D.circle(ctx, (i * 97 + t * 20) % 800, (i * 53 + t * 40) % 450, 2, '#fff');
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 400, 800, 50);
        const X = 200, Y = 170, W = 300, H = 230;
        // 屋顶
        ctx.fillStyle = roof[0] === 'warm' ? '#e8590c' : '#c92a2a';
        ctx.beginPath();
        ctx.moveTo(X - 30, Y);
        ctx.lineTo(X + W / 2, Y - 100);
        ctx.lineTo(X + W + 30, Y);
        ctx.closePath();
        ctx.fill();
        if (roof[0] === 'warm') { ctx.fillStyle = '#ffe066'; ctx.fillRect(X, Y - 12, W, 12); }
        // 墙
        ctx.fillStyle = { paper: '#e9ecef', wood: '#c08552', foam: '#c08552' }[wall[0]];
        ctx.fillRect(X, Y, W, H);
        if (wall[0] === 'foam') { ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = 10; ctx.strokeRect(X + 5, Y + 5, W - 10, H - 10); }
        // 屋里
        ctx.fillStyle = Sci.rgb(Sci.mixColor([200, 220, 255], [255, 220, 180], clamp((temp + 10) / 35, 0, 1)));
        ctx.fillRect(X + 14, Y + 14, W - 28, H - 14);
        // 窗户
        const ww = win[0] === 'big' ? 110 : 60;
        ctx.fillStyle = '#a5d8ff';
        ctx.fillRect(X + 30, Y + 40, ww, 70);
        ctx.strokeStyle = '#495057';
        ctx.lineWidth = 3;
        ctx.strokeRect(X + 30, Y + 40, ww, 70);
        if (win[0] === 'double') ctx.strokeRect(X + 36, Y + 46, ww - 12, 58);
        D.emoji(ctx, '♨️', X + W - 60, Y + H - 40, 40);
        // 溜走的热量（越粗跑得越多）
        const arrows = [[X + W / 2, Y - 60, X + W / 2, Y - 130, roof[2]], [X + W, Y + 150, X + W + 80, Y + 150, wall[2]], [X, Y + 160, X - 80, Y + 160, wall[2]], [X + 30, Y + 75, X - 70, Y + 60, win[2]]];
        arrows.forEach(([x1, y1, x2, y2, l]) => { if (l > 0) D.arrow(ctx, x1, y1, x2, y2, `rgba(224,49,49,${0.3 + l * 0.5})`, 3 + l * 10, 14 + l * 8); });
        D.text(ctx, '红箭头 = 溜走的热量', 120, 30, { size: 14, color: '#c92a2a' });
        // 温度计
        D.text(ctx, `屋外 ${OUT}°C`, 650, 70, { size: 18, color: '#1c7ed6' });
        D.text(ctx, `屋里 ${Math.round(temp)}°C`, 650, 120, { size: 32, color: temp >= 20 ? '#e8590c' : '#495057' });
        D.text(ctx, temp >= 20 ? '暖和 😊' : temp >= 10 ? '有点凉 🙂' : '好冷 ❄️', 650, 165, { size: 18 });
        D.text(ctx, `热量流失：${loss().toFixed(2)}`, 650, 210, { size: 15, color: '#6f6a85' });
      });
      api.choice(WALLS.map(w => [w[0], w[1]]), wall[0], v => { wall = WALLS.find(w => w[0] === v); });
      const r2 = api.row();
      api.choice(WINS.map(w => [w[0], w[1]]), win[0], v => { win = WINS.find(w => w[0] === v); }, r2);
      const r3 = api.row();
      api.choice(ROOFS.map(r => [r[0], r[1]]), roof[0], v => { roof = ROOFS.find(r => r[0] === v); }, r3);
      api.note('👆 换一换墙、窗户和屋顶，看看屋里的温度怎么变。');
    },
  });

  /* ================= 14. 风力发电 ================= */
  Sci.register({
    id: 'windmill',
    subject: 'engineering',
    level: 4,
    emoji: '🌬️',
    title: '风力发电',
    desc: '叶片几片、斜多少度，发电最多？',
    intro: '草原和海边常常能看到高高的大风车，它们在用风发电！风车发多少电，和风的大小、叶片的数量、叶片倾斜的角度都有关系。调一调这些数值，让风车发出 100 瓦以上的电。小心：风太大时，风车会自动刹车保护自己哦！',
    goal: '让风车发出 100 瓦以上的电',
    fact: '<p>风吹动叶片，叶片带动里面的<b>发电机</b>转动，把风的能量变成电能。风速变成 2 倍，能得到的能量会变成大约 <b>8 倍</b>！</p><p>大多数风力发电机用 <b>3 片</b>叶片：片数太少不够平稳，太多又互相挡风、太重。叶片要<b>斜着</b>迎风，才能被风推着转起来。</p><p>⚠️ 风太大时，风车会把叶片转到不吃风的角度并刹车，免得被吹坏。风能是取之不尽的<b>清洁能源</b>，我国是世界上风力发电最多的国家。</p>',
    quiz: [
      { q: '大多数风力发电机有几片叶片？', options: ['3 片', '10 片', '1 片'], answer: 0, explain: '3 片叶片又平稳又高效。' },
      { q: '风特别大的时候，风车会怎样？', options: ['刹车停下来保护自己', '转得越来越快直到坏掉'], answer: 0, explain: '大风时风车会停机保护。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let wind = 4, blades = 2, pitch = 40, ang = 0, t = 0, done = false;
      const eff = () => ({ 2: 0.9, 3: 1, 6: 0.75 }[blades]) * clamp(1 - Math.abs(pitch - 15) / 30, 0, 1);
      const braking = () => wind >= 9;
      const power = () => (braking() ? 0 : Math.round(0.25 * wind ** 3 * eff()));
      const clouds = [];
      for (let i = 0; i < 5; i++) clouds.push({ x: rand(0, 800), y: rand(30, 150) });
      api.loop(dt => {
        t += dt;
        ang += dt * (braking() ? 0 : power() / 30 + (eff() > 0 ? 0.3 : 0));
        clouds.forEach(c => { c.x += dt * wind * 12; if (c.x > 860) c.x = -60; });
        if (power() >= 100 && !done) { done = true; Sci.sfx('star'); api.note(`🎉 发电 ${power()} 瓦！风速 ${wind} 米/秒、${blades} 片叶片、倾斜 ${pitch}°。`); api.goalDone(); }
        const sky = ctx.createLinearGradient(0, 0, 0, 450);
        sky.addColorStop(0, '#74c0fc');
        sky.addColorStop(1, '#e7f5ff');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 800, 450);
        clouds.forEach(c => { D.circle(ctx, c.x, c.y, 22, 'rgba(255,255,255,.9)'); D.circle(ctx, c.x + 24, c.y + 4, 18, 'rgba(255,255,255,.9)'); });
        ctx.fillStyle = '#8ce99a';
        ctx.fillRect(0, 400, 800, 50);
        // 风的线条
        ctx.strokeStyle = 'rgba(255,255,255,.8)';
        ctx.lineWidth = 2;
        for (let i = 0; i < wind; i++) { const y = 120 + i * 28, x = (t * wind * 60 + i * 140) % 900 - 100; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 50, y); ctx.stroke(); }
        // 风车
        const HX = 330, HY = 160;
        ctx.fillStyle = '#f1f3f5';
        ctx.beginPath();
        ctx.moveTo(HX - 8, HY);
        ctx.lineTo(HX + 8, HY);
        ctx.lineTo(HX + 14, 400);
        ctx.lineTo(HX - 14, 400);
        ctx.fill();
        for (let i = 0; i < blades; i++) {
          const a = ang + i / blades * Math.PI * 2;
          ctx.save();
          ctx.translate(HX, HY);
          ctx.rotate(a);
          ctx.scale(1, 0.4 + 0.6 * Math.cos(pitch * Math.PI / 180));
          ctx.fillStyle = '#fff';
          ctx.strokeStyle = '#adb5bd';
          ctx.beginPath();
          ctx.ellipse(0, -60, 12, 60, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        D.circle(ctx, HX, HY, 10, '#ced4da');
        // 仪表
        D.rrect(ctx, 540, 60, 230, 170, 16);
        ctx.fillStyle = '#fff';
        ctx.fill();
        D.text(ctx, braking() ? '⚠️ 风太大，刹车保护' : `发电 ${power()} 瓦`, 655, 100, { size: 22, color: braking() ? '#c92a2a' : power() >= 100 ? '#2b8a3e' : '#2b2840' });
        ctx.fillStyle = '#e9ecef';
        ctx.fillRect(570, 130, 170, 16);
        ctx.fillStyle = '#40c057';
        ctx.fillRect(570, 130, Math.min(170, power() * 1.2), 16);
        ctx.fillStyle = '#e8590c';
        ctx.fillRect(570 + 120, 124, 2, 28);
        D.text(ctx, '100 瓦', 692, 164, { size: 12, color: '#e8590c' });
        D.text(ctx, `风速 ${wind} 米/秒`, 655, 195, { size: 15, color: '#495057' });
      });
      api.slider('风速', 1, 10, 1, wind, v => { wind = v; }, v => v + ' 米/秒');
      api.choice([[2, '2 片叶片'], [3, '3 片叶片'], [6, '6 片叶片']], blades, v => { blades = v; });
      api.slider('叶片倾斜', 0, 45, 5, pitch, v => { pitch = v; }, v => v + '°');
      api.note('👆 调一调风速、叶片数量和倾斜角度，看看能发多少电。');
    },
  });

  /* ================= 15. 护蛋行动 ================= */
  const CHUTES = [['none', '不用降落伞', 0, 10], ['small', '小降落伞', 2, 6], ['big', '大降落伞', 4, 4]];
  const PADS = [['none', '不加缓冲', 0, 0], ['sponge', '海绵垫', 2, 3], ['straw', '吸管缓冲架', 3, 4]];
  const CAGES = [['none', '不加外壳', 0, 0], ['paper', '纸盒外壳', 1, 1], ['frame', '吸管三角框', 3, 3]];

  Sci.register({
    id: 'eggdrop',
    subject: 'engineering',
    level: 5,
    emoji: '🥚',
    title: '护蛋行动',
    desc: '从三楼扔下一个鸡蛋，怎样让它不摔碎？',
    intro: '工程师的挑战：从三楼扔下一个生鸡蛋，要让它完好无损！你可以给鸡蛋装降落伞、加缓冲垫、做个保护壳，可是每样材料都要花钱，预算只有 6 块钱。设计、测试、改进，找出又便宜又安全的方案！',
    goal: '花不超过 6 块钱，让鸡蛋安全落地',
    fact: '<p>保护鸡蛋有两个思路：</p><p>① <b>让它落得慢一点</b>：降落伞能增大空气阻力，减慢下落速度。</p><p>② <b>让撞击变得温柔</b>：海绵、吸管架这样的缓冲材料，能延长撞击的时间，把冲击力分散开。汽车的安全气囊、快递盒里的气泡膜都是这个道理。</p><p>💰 真正的工程师还要考虑<b>成本</b>：在有限的预算里，找出效果最好的方案。设计 → 测试 → 改进，一次比一次好！</p>',
    quiz: [
      { q: '降落伞为什么能让东西落得更慢？', options: ['增大了空气阻力', '让东西变轻了'], answer: 0, explain: '降落伞张开后，空气阻力大大增加。' },
      { q: '快递盒里塞气泡膜，是为了？', options: ['缓冲撞击，保护物品', '让盒子更重'], answer: 0, explain: '缓冲材料能减小撞击时的冲击力。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const BUDGET = 6, G = 410;
      let ch = CHUTES[0], pad = PADS[0], cage = CAGES[0], drop = null, t = 0, done = false;
      const log = [];
      const cost = () => ch[2] + pad[2] + cage[2];
      const impact = () => Math.max(0, ch[3] - pad[3] - cage[3]);
      function go() {
        if (drop) return;
        drop = { k: 0, dur: 1 + (10 - ch[3]) * 0.25 };
        Sci.sfx('whoosh');
      }
      api.loop(dt => {
        t += dt;
        if (drop && drop.k < 1) {
          drop.k = Math.min(1, drop.k + dt / drop.dur);
          if (drop.k >= 1) {
            const safe = impact() <= 3;
            drop.safe = safe;
            log.unshift({ c: cost(), safe });
            if (log.length > 5) log.pop();
            Sci.sfx(safe ? 'good' : 'bad');
            const over = cost() > BUDGET;
            api.note(safe ? (over ? `鸡蛋没碎！可是花了 ${cost()} 块钱，超出预算了。能不能更省钱？` : `🎉 鸡蛋完好无损，只花了 ${cost()} 块钱！`) : `啪！鸡蛋摔碎了……撞击力 ${impact()}，超过了 3。试试让它落得慢一点，或者加点缓冲。`);
            if (safe && !over && !done) { done = true; Sci.sfx('star'); api.goalDone(); }
            api.timeout(() => { drop = null; }, 1600);
          }
        }
        ctx.fillStyle = '#e7f5ff';
        ctx.fillRect(0, 0, 800, 450);
        // 楼
        ctx.fillStyle = '#ced4da';
        ctx.fillRect(60, 60, 140, G - 60);
        for (let f = 0; f < 3; f++) { ctx.fillStyle = '#a5d8ff'; ctx.fillRect(80, 90 + f * 110, 40, 50); ctx.fillRect(140, 90 + f * 110, 40, 50); }
        ctx.fillStyle = '#8ce99a';
        ctx.fillRect(0, G, 800, 40);
        // 鸡蛋装置
        const x = 300, y = drop ? lerp(80, G - 30, drop.k * drop.k * 0.3 + drop.k * 0.7) : 80;
        if (ch[0] !== 'none') {
          const r = ch[0] === 'big' ? 60 : 38;
          ctx.fillStyle = '#ff8787';
          ctx.beginPath();
          ctx.arc(x, y - 60, r, Math.PI, 0);
          ctx.fill();
          ctx.strokeStyle = '#868e96';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x - r, y - 60);
          ctx.lineTo(x, y - 10);
          ctx.lineTo(x + r, y - 60);
          ctx.stroke();
        }
        if (cage[0] === 'paper') { ctx.strokeStyle = '#c08552'; ctx.lineWidth = 3; ctx.strokeRect(x - 26, y - 22, 52, 52); }
        if (cage[0] === 'frame') { ctx.strokeStyle = '#fab005'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.lineTo(x - 34, y + 30); ctx.lineTo(x + 34, y + 30); ctx.closePath(); ctx.stroke(); }
        if (pad[0] !== 'none') { ctx.fillStyle = pad[0] === 'sponge' ? '#ffe066' : '#d0bfff'; ctx.fillRect(x - 22, y + 18, 44, 12); }
        const broken = drop && drop.k >= 1 && !drop.safe;
        if (broken) {
          ctx.fillStyle = '#fff3bf';
          ctx.beginPath();
          ctx.ellipse(x, G - 6, 40, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          D.circle(ctx, x, G - 8, 9, '#fab005');
        } else {
          ctx.fillStyle = '#fff8e1';
          ctx.beginPath();
          ctx.ellipse(x, y, 16, 21, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#e9d8a6';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        // 信息
        D.rrect(ctx, 470, 30, 310, 230, 14);
        ctx.fillStyle = '#fff';
        ctx.fill();
        D.text(ctx, `花费：${cost()} 元（预算 ${BUDGET} 元）`, 625, 60, { size: 17, color: cost() > BUDGET ? '#c92a2a' : '#2b8a3e' });
        D.text(ctx, `落地速度：${ch[3]}　缓冲：${pad[3] + cage[3]}`, 625, 92, { size: 15 });
        D.text(ctx, `撞击力：${impact()}（3 以下才安全）`, 625, 122, { size: 15, color: impact() <= 3 ? '#2b8a3e' : '#c92a2a' });
        D.text(ctx, '最近的测试', 625, 156, { size: 14, color: '#6f6a85' });
        log.forEach((r, i) => D.text(ctx, `${r.safe ? '✅ 没碎' : '💥 碎了'}　花了 ${r.c} 元`, 625, 180 + i * 18, { size: 13, weight: 'normal' }));
      });
      api.choice(CHUTES.map(c => [c[0], `${c[1]}（${c[2]}元）`]), ch[0], v => { if (!drop) ch = CHUTES.find(c => c[0] === v); });
      const r2 = api.row();
      api.choice(PADS.map(c => [c[0], `${c[1]}（${c[2]}元）`]), pad[0], v => { if (!drop) pad = PADS.find(c => c[0] === v); }, r2);
      const r3 = api.row();
      api.choice(CAGES.map(c => [c[0], `${c[1]}（${c[2]}元）`]), cage[0], v => { if (!drop) cage = CAGES.find(c => c[0] === v); }, r3);
      api.button('🥚 从三楼扔下去', go, r3);
      api.note('👆 先什么都不加，扔一次看看；再选材料，设计你的护蛋装置。');
    },
  });
})();
