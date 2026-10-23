/* 宇宙探险：白天和黑夜 → 月亮变脸 → 太阳系大家庭 */
(function () {
  'use strict';
  const { clamp, rand } = Sci;
  const D = Sci.draw;
  const TAU = Math.PI * 2;
  const norm = a => ((a % TAU) + TAU) % TAU;
  const STARS = Array.from({ length: 90 }, () => ({ x: rand(0, 800), y: rand(0, 450), r: rand(0.6, 1.8), p: rand(0, TAU) }));
  function starfield(ctx, t, x0 = 0, x1 = 800) {
    ctx.fillStyle = '#0b1030';
    ctx.fillRect(x0, 0, x1 - x0, 450);
    STARS.forEach(s => {
      if (s.x < x0 || s.x > x1) return;
      D.circle(ctx, s.x, s.y, s.r, `rgba(255,255,255,${0.5 + 0.4 * Math.sin(t * 2 + s.p)})`);
    });
  }

  /* ================= 1. 白天和黑夜 ================= */
  Sci.register({
    id: 'daynight',
    subject: 'astronomy',
    level: 1,
    emoji: '🌍',
    title: '白天和黑夜',
    desc: '为什么会有白天和黑夜？',
    intro: '太阳每天早上升起、晚上落下，好像在绕着我们转。其实呀，是我们的地球在不停地转圈圈！这里是从北极上方往下看的地球，上面有一座小房子。让地球转起来，看看小房子什么时候是白天，什么时候是黑夜？你也可以用手指拖着地球转。',
    goal: '让小房子经历一次白天和一次黑夜',
    fact: '<p>地球像一个陀螺，一直在<b>自己转圈</b>，这叫<b>自转</b>。转一圈大约要<b>一天（24 小时）</b>。</p><p>太阳只能照亮地球的一半：<b>朝着太阳的一面是白天</b>，<b>背着太阳的一面是黑夜</b>。地球一转，白天和黑夜就轮流到来。</p><p>地球是<b>自西向东</b>转的，所以我们看到太阳总是从<b>东边升起，西边落下</b>。当我们是白天时，地球另一边的美国小朋友正在睡觉呢！</p>',
    quiz: [
      { q: '为什么会有白天和黑夜？', options: ['地球在不停地自转', '太阳晚上去睡觉了'], answer: 0, explain: '地球自转，朝着太阳的一面是白天，背着的一面是黑夜。' },
      { q: '地球自转一圈大约要多久？', options: ['一天（24 小时）', '一年', '一小时'], answer: 0, explain: '所以每天都有一个白天和一个黑夜。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const EX = 390, EY = 225, ER = 118;
      let rot = 0, spin = true, speed = 1, t = 0, drag = null, goalSent = false;
      const seen = new Set();
      // 随手画几块陆地（极坐标的小团团）
      const LAND = [[0.3, 70, 30], [1.5, 82, 34], [2.4, 55, 26], [3.4, 86, 30], [4.4, 65, 36], [5.4, 88, 24]].map(([a, r, s]) => {
        const cx = Math.cos(a) * r, cy = Math.sin(a) * r;
        return Array.from({ length: 14 }, (_, i) => {
          const b = i / 14 * TAU, rr = s * (0.7 + 0.3 * Math.sin(i * 2.3 + a * 5));
          return [cx + Math.cos(b) * rr, cy + Math.sin(b) * rr];
        });
      });
      const houseAngle = () => norm(rot + Math.PI);
      const hourOf = th => ((12 - (th - Math.PI) / TAU * 24) % 24 + 24) % 24;
      const label = h => (h < 5 ? '半夜 🌙' : h < 7 ? '清晨 🌅' : h < 11 ? '上午 ☀️' : h < 13 ? '中午 ☀️' : h < 17 ? '下午 ☀️' : h < 19 ? '傍晚 🌇' : '晚上 🌙');

      api.pointer(st, {
        down(p) {
          if (Math.hypot(p.x - EX, p.y - EY) < ER + 40) drag = { a0: Math.atan2(p.y - EY, p.x - EX), rot0: rot };
        },
        move(p, active) {
          if (active && drag) rot = drag.rot0 + Math.atan2(p.y - EY, p.x - EX) - drag.a0;
        },
        up() { drag = null; },
      });

      function render() {
        starfield(ctx, t);
        // 太阳和阳光
        const sg = ctx.createRadialGradient(-60, EY, 40, -60, EY, 200);
        sg.addColorStop(0, '#fff6b0');
        sg.addColorStop(0.6, '#ffc93c');
        sg.addColorStop(1, 'rgba(255,170,40,0)');
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, 200, 450);
        D.circle(ctx, -60, EY, 140, '#ffcf3f');
        D.text(ctx, '太阳', 40, EY, { size: 22, color: '#b45309' });
        ctx.save();
        ctx.setLineDash([6, 10]);
        for (let k = -2; k <= 2; k++) D.arrow(ctx, 110, EY + k * 50, EX - ER - 20, EY + k * 50, 'rgba(255,220,120,.6)', 2, 10);
        ctx.restore();
        // 地球
        ctx.save();
        ctx.beginPath();
        ctx.arc(EX, EY, ER, 0, TAU);
        ctx.clip();
        ctx.fillStyle = '#2f7fe0';
        ctx.fillRect(EX - ER, EY - ER, ER * 2, ER * 2);
        ctx.translate(EX, EY);
        ctx.rotate(rot);
        ctx.fillStyle = '#4caf50';
        LAND.forEach(pts => {
          ctx.beginPath();
          pts.forEach(([x, y]) => ctx.lineTo(x, y));
          ctx.closePath();
          ctx.fill();
        });
        D.circle(ctx, 0, 0, 24, '#f2f8ff');
        ctx.restore();
        // 黑夜那一半
        const ng = ctx.createLinearGradient(EX - 12, 0, EX + 26, 0);
        ng.addColorStop(0, 'rgba(5,10,40,0)');
        ng.addColorStop(1, 'rgba(5,10,40,.72)');
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(EX, EY, ER + 1, 0, TAU);
        ctx.fill();
        D.text(ctx, '白天', EX - 60, EY - ER - 22, { size: 17, color: '#ffe08a' });
        D.text(ctx, '黑夜', EX + 60, EY - ER - 22, { size: 17, color: '#9aa7ff' });
        // 小房子
        const th = houseAngle();
        ctx.save();
        ctx.translate(EX + Math.cos(th) * (ER + 12), EY + Math.sin(th) * (ER + 12));
        ctx.rotate(th + Math.PI / 2);
        D.emoji(ctx, '🏠', 0, 0, 30);
        ctx.restore();
        // 自转方向箭头
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,.55)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(EX, EY, ER + 34, 0.25 * Math.PI, 0.75 * Math.PI);
        ctx.stroke();
        ctx.restore();
        const ax = EX + Math.cos(0.25 * Math.PI) * (ER + 34), ay = EY + Math.sin(0.25 * Math.PI) * (ER + 34);
        D.arrow(ctx, ax - 6, ay + 8, ax + 6, ay - 6, 'rgba(255,255,255,.75)', 3, 12);
        D.text(ctx, '地球自己转', EX, EY + ER + 52, { size: 15, color: 'rgba(255,255,255,.8)', weight: 'normal' });

        // 右边：小房子看到的天空
        const e = -Math.cos(th), h = hourOf(th);
        const night = [12, 20, 60], dawn = [255, 150, 100], day = [110, 195, 255];
        const skyC = e < -0.2 ? night : e < 0 ? Sci.mixColor(night, dawn, (e + 0.2) / 0.2) : e < 0.25 ? Sci.mixColor(dawn, day, e / 0.25) : day;
        const PX = 600, PY = 30, PW = 185, PH = 255;
        ctx.save();
        D.rrect(ctx, PX, PY, PW, PH, 18);
        ctx.clip();
        ctx.fillStyle = Sci.rgb(skyC);
        ctx.fillRect(PX, PY, PW, PH);
        if (e < -0.05) {
          STARS.slice(0, 20).forEach((s, i) => D.circle(ctx, PX + (s.x * 7) % PW, PY + (s.y * 3) % (PH - 60), s.r, `rgba(255,255,255,${clamp(-e * 1.5, 0, 0.9)})`));
          D.emoji(ctx, '🌙', PX + PW - 40, PY + 40, 30, clamp(-e * 2, 0, 1));
        }
        if (e > -0.15) D.emoji(ctx, '☀️', PX + 20 + clamp((h - 5) / 14, 0, 1) * (PW - 40), PY + PH - 50 - e * 160, 38);
        ctx.fillStyle = '#5cbf5a';
        ctx.fillRect(PX, PY + PH - 45, PW, 45);
        D.emoji(ctx, '🏠', PX + PW / 2 - 18, PY + PH - 50, 40);
        D.emoji(ctx, '🧒', PX + PW / 2 + 30, PY + PH - 42, 28);
        ctx.restore();
        D.text(ctx, '小房子看到的天空', PX + PW / 2, PY + PH + 20, { size: 15, color: '#c9cbe6', weight: 'normal' });
        D.text(ctx, label(h), PX + PW / 2, PY + PH + 58, { size: 28, color: '#fff' });
        D.text(ctx, `大约 ${Math.floor(h)} 点`, PX + PW / 2, PY + PH + 96, { size: 18, color: '#c9cbe6' });

        if (h >= 9 && h < 15) seen.add('day');
        if (h >= 21 || h < 3) seen.add('night');
        if (seen.size === 2 && !goalSent) {
          goalSent = true;
          api.note('🎉 小房子过完了一个白天和一个黑夜！地球转一圈，就是一天。');
          api.goalDone();
        }
      }

      api.loop(dt => {
        t += dt;
        if (spin && !drag) rot -= speed * 0.6 * dt;
        render();
      });
      const playBtn = api.button('⏸ 停一停', () => {
        spin = !spin;
        playBtn.textContent = spin ? '⏸ 停一停' : '▶ 转起来';
      });
      api.slider('转动速度', 0.2, 3, 0.1, speed, v => { speed = v; }, v => v.toFixed(1) + ' 倍');
      api.note('👀 盯着小房子：它转到有阳光的一边时，天就亮了！');
    },
  });

  /* ================= 2. 月亮变脸 ================= */
  const PHASE_INFO = {
    新月: '月亮走到太阳和地球中间，亮的一面背对着我们，几乎看不见。',
    蛾眉月: '弯弯的月牙儿挂在西边天上，亮的在右边。',
    上弦月: '右边亮了一半，像个半圆。',
    盈凸月: '越来越圆啦！',
    满月: '月亮走到地球的另一边，亮的一面正对着我们，圆圆的！',
    亏凸月: '开始慢慢变小了。',
    下弦月: '左边亮了一半。',
    残月: '左边细细的月牙，快要看不见啦。',
  };
  function lunarDay(d) {
    if (d <= 10) return '初' + Sci.cn(d);
    if (d < 20) return '十' + Sci.cn(d - 10);
    if (d === 20) return '二十';
    if (d < 30) return '廿' + Sci.cn(d - 20);
    return '三十';
  }

  Sci.register({
    id: 'moon',
    subject: 'astronomy',
    level: 2,
    emoji: '🌙',
    title: '月亮变脸',
    desc: '月亮为什么有时圆、有时弯？',
    intro: '月亮一会儿弯弯像小船，一会儿圆圆像玉盘，它真的会变形吗？其实月亮自己不会发光，它是被太阳照亮的。左边是从太空往下看：月亮绕着地球转；右边是我们在地球上看到的月亮。让月亮转起来（也可以用手拖着它走），找一找新月、上弦月、满月和下弦月！',
    goal: '找到新月、上弦月、满月和下弦月',
    fact: '<p>月亮自己<b>不会发光</b>，它像一面镜子，<b>反射太阳的光</b>。太阳总是照亮月亮的一半。</p><p>月亮<b>绕着地球转</b>，转一圈大约<b>一个月</b>。转到不同的位置，我们看到的“亮的那部分”就不一样，这就是<b>月相</b>的变化：新月 → 上弦月 → 满月 → 下弦月 → 新月……</p><p>🥮 中国的农历就是跟着月亮走的：农历初一前后是新月，<b>十五、十六</b>前后是圆圆的满月，所以中秋节（八月十五）能赏圆月！</p>',
    quiz: [
      { q: '月亮自己会发光吗？', options: ['不会，它反射太阳的光', '会，像灯泡一样'], answer: 0, explain: '月亮是被太阳照亮的。' },
      { q: '农历十五左右，我们看到的月亮是？', options: ['圆圆的满月', '弯弯的月牙'], answer: 0, explain: '所以中秋节（八月十五）可以赏圆月。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const EX = 260, EY = 225, OR = 150;
      let phi = Math.PI * 0.75, spin = true, speed = 1, t = 0, dragging = false, lastName = '', goalSent = false;
      const seen = new Set();
      const craters = [[-0.3, -0.35, 0.16], [0.25, 0.1, 0.22], [-0.1, 0.4, 0.12], [0.45, -0.4, 0.1], [-0.5, 0.15, 0.1]];

      function phaseOf(phi) {
        const d = norm(phi - Math.PI);
        const e = d > Math.PI ? TAU - d : d; // 0 = 新月，π = 满月
        const waxing = Math.sin(phi) > 0;
        let name;
        if (e < 0.25) name = '新月';
        else if (e > Math.PI - 0.25) name = '满月';
        else if (Math.abs(e - Math.PI / 2) < 0.25) name = waxing ? '上弦月' : '下弦月';
        else if (e < Math.PI / 2) name = waxing ? '蛾眉月' : '残月';
        else name = waxing ? '盈凸月' : '亏凸月';
        const day = Math.max(1, Math.min(30, Math.round(waxing ? 1 + e / Math.PI * 14 : 15 + (Math.PI - e) / Math.PI * 14.5)));
        return { e, waxing, name, day };
      }
      function drawPhase(cx, cy, r, e, waxing) {
        ctx.save();
        ctx.shadowColor = 'rgba(255,240,180,.6)';
        ctx.shadowBlur = 30 * (1 - Math.cos(e)) / 2;
        D.circle(ctx, cx, cy, r, '#2a2f45');
        ctx.restore();
        const c = Math.cos(e), N = 48;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const yy = -r + 2 * r * i / N, w = Math.sqrt(Math.max(0, r * r - yy * yy));
          ctx.lineTo(cx + (waxing ? w : -w), cy + yy);
        }
        for (let i = N; i >= 0; i--) {
          const yy = -r + 2 * r * i / N, w = Math.sqrt(Math.max(0, r * r - yy * yy));
          ctx.lineTo(cx + (waxing ? c * w : -c * w), cy + yy);
        }
        ctx.closePath();
        ctx.fillStyle = '#fff4c2';
        ctx.fill();
        craters.forEach(([x, y, s]) => D.circle(ctx, cx + x * r, cy + y * r, s * r, 'rgba(120,110,80,.13)'));
      }

      api.pointer(st, {
        down(p) { if (p.x < 520) { dragging = true; phi = Math.atan2(p.y - EY, p.x - EX); } },
        move(p, active) { if (active && dragging) phi = Math.atan2(p.y - EY, p.x - EX); },
        up() { dragging = false; },
      });

      function render() {
        starfield(ctx, t);
        // 左：太空俯视图
        for (let k = -2; k <= 2; k++) D.arrow(ctx, 10, EY + k * 70, 70, EY + k * 70, 'rgba(255,215,90,.75)', 3, 10);
        D.text(ctx, '☀️ 太阳光', 50, 30, { size: 16, color: '#ffd75a' });
        ctx.save();
        ctx.setLineDash([5, 7]);
        D.circle(ctx, EX, EY, OR, null, 'rgba(255,255,255,.25)', 2);
        ctx.restore();
        D.circle(ctx, EX, EY, 34, '#2f7fe0');
        ctx.fillStyle = 'rgba(5,10,40,.6)';
        ctx.beginPath();
        ctx.arc(EX, EY, 34, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        D.text(ctx, '地球', EX, EY + 52, { size: 15, color: '#c9cbe6' });
        const mx = EX + Math.cos(phi) * OR, my = EY + Math.sin(phi) * OR;
        ctx.save();
        ctx.setLineDash([3, 6]);
        ctx.strokeStyle = 'rgba(255,255,255,.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(EX, EY);
        ctx.lineTo(mx, my);
        ctx.stroke();
        ctx.restore();
        D.circle(ctx, mx, my, 20, '#3a3f58');
        ctx.fillStyle = '#fff4c2';
        ctx.beginPath();
        ctx.arc(mx, my, 20, Math.PI / 2, Math.PI * 1.5);
        ctx.fill();
        D.text(ctx, '月亮', mx, my - 32, { size: 14, color: '#fff4c2' });
        D.text(ctx, '从太空往下看', EX, 22, { size: 16, color: '#c9cbe6', weight: 'normal' });
        // 右：在地球上看到的
        ctx.fillStyle = 'rgba(255,255,255,.06)';
        D.rrect(ctx, 530, 14, 256, 422, 20);
        ctx.fill();
        const P = phaseOf(phi);
        D.text(ctx, '我们看到的月亮', 658, 44, { size: 18, color: '#c9cbe6' });
        drawPhase(658, 200, 92, P.e, P.waxing);
        D.text(ctx, P.name, 658, 340, { size: 32, color: '#fff4c2' });
        D.text(ctx, `大约农历 ${lunarDay(P.day)}`, 658, 382, { size: 18, color: '#c9cbe6' });
        D.text(ctx, ['新月', '上弦月', '满月', '下弦月'].map(n => (seen.has(n) ? '✅' : '⬜') + n).join(' '), 658, 418, { size: 13, color: '#c9cbe6', maxW: 240 });
        return P;
      }

      api.loop(dt => {
        t += dt;
        if (spin && !dragging) phi -= speed * 0.35 * dt;
        const P = render();
        if (P.name !== lastName) {
          lastName = P.name;
          api.note(`${P.name}：${PHASE_INFO[P.name]}`);
          if (['新月', '上弦月', '满月', '下弦月'].includes(P.name) && !seen.has(P.name)) {
            seen.add(P.name);
            Sci.sfx('pop');
            if (seen.size === 4 && !goalSent) {
              goalSent = true;
              api.timeout(() => { api.note('🎉 四种月相都找到啦！月亮绕地球转一圈，大约就是一个月。'); api.goalDone(); }, 1200);
            }
          }
        }
      });
      const playBtn = api.button('⏸ 停一停', () => {
        spin = !spin;
        playBtn.textContent = spin ? '⏸ 停一停' : '▶ 转起来';
      });
      api.slider('转动速度', 0.2, 3, 0.1, speed, v => { speed = v; }, v => v.toFixed(1) + ' 倍');
    },
  });

  /* ================= 3. 太阳系大家庭 ================= */
  const PLANETS = [
    { name: '水星', color: '#b8aea4', r: 4, a: 70, period: 0.24, d: 0.38, fact: '水星离太阳最近，跑得最快，88 天就绕太阳一圈。它白天热得能烤熟东西，晚上又冷得结冰。' },
    { name: '金星', color: '#f3c77a', r: 6, a: 96, period: 0.62, d: 0.95, fact: '金星是天空中最亮的星星，早上叫“启明星”，傍晚叫“长庚星”。它被厚厚的云包着，是最热的行星。' },
    { name: '地球', color: '#3d8bff', r: 6.5, a: 124, period: 1, d: 1, fact: '地球是我们的家！它有蓝色的大海和空气，是目前知道的唯一有生命的星球。绕太阳一圈就是一年。' },
    { name: '火星', color: '#e0623a', r: 5, a: 152, period: 1.88, d: 0.53, fact: '火星是红色的，因为地面上有很多像铁锈一样的红土。中国的“祝融号”火星车就在那里探险过！' },
    { name: '木星', color: '#d9a066', r: 15, a: 202, period: 11.86, d: 11.2, fact: '木星是最大的行星，肚子里能装下 1300 多个地球！它身上有一个比地球还大的风暴，叫“大红斑”。' },
    { name: '土星', color: '#e8cf8a', r: 12, a: 256, period: 29.5, d: 9.45, ring: true, fact: '土星戴着漂亮的光环，光环是由无数冰块和石头组成的。土星很轻，如果有一个超级大的浴缸，它能浮在水上！' },
    { name: '天王星', color: '#8fd6e0', r: 9, a: 310, period: 84, d: 4.0, fact: '天王星是一颗蓝绿色的冰巨星，它是“躺着”绕太阳转的，好像在地上打滚。' },
    { name: '海王星', color: '#4466e0', r: 9, a: 360, period: 165, d: 3.88, fact: '海王星离太阳最远，又黑又冷，还刮着太阳系最猛烈的大风。它绕太阳一圈要 165 年！' },
  ];
  const SUN_FACT = '太阳是一颗会发光发热的恒星，是太阳系的大家长。它大得能装下 130 万个地球！八颗行星都绕着它转。';
  // 点行星时会朗读这些话，登记一下，好提前做成朗读音频
  Sci.speechExtras.push(SUN_FACT, ...PLANETS.map(p => p.name + '。' + p.fact));

  Sci.register({
    id: 'solar',
    subject: 'astronomy',
    level: 3,
    emoji: '🪐',
    title: '太阳系大家庭',
    desc: '认识绕着太阳转的八颗行星',
    intro: '太阳有一个大家庭，八颗行星都绕着它转圈圈。它们离太阳从近到远是：水星、金星、地球、火星、木星、土星、天王星、海王星。记住口诀“水金地火木土天海”！点一点每颗行星，听听它的故事，再切换到“比一比大小”，看看谁是大胖子。',
    goal: '点一点，认识全部 8 颗行星',
    fact: '<p>太阳系的八大行星，离太阳从近到远是：<b>水、金、地、火、木、土、天、海</b>。</p><p>离太阳越近的行星跑得越快：水星 88 天就转一圈，地球要一年，海王星要 165 年！</p><p>论大小，<b>木星最大</b>，土星第二；地球在中间，<b>水星最小</b>。可是和太阳比起来，它们都是小不点：太阳的直径是地球的 109 倍！</p>',
    quiz: [
      { q: '太阳系里最大的行星是？', options: ['木星', '地球', '水星'], answer: 0, explain: '木星能装下 1300 多个地球。' },
      { q: '离太阳最近的行星是？', options: ['水星', '海王星', '地球'], answer: 0, explain: '口诀“水金地火木土天海”，水星排第一。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const CX = 400, CY = 225, TILT = 0.42, SIZE_SCALE = 10;
      let view = 'orbit', speed = 1, names = true, t = 0, sel = -2, goalSent = false;
      const clicked = new Set();
      PLANETS.forEach(p => { p.th = rand(0, TAU); });

      function planetBody(p, x, y, r) {
        if (p.ring) {
          ctx.save();
          ctx.strokeStyle = 'rgba(232,207,138,.85)';
          ctx.lineWidth = r * 0.35;
          ctx.beginPath();
          ctx.ellipse(x, y, r * 1.9, r * 0.6, -0.3, Math.PI, TAU);
          ctx.stroke();
          ctx.restore();
        }
        const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.25, p.color);
        g.addColorStop(1, Sci.rgb([20, 20, 40], 0.9));
        D.circle(ctx, x, y, r, g);
        if (p.name === '木星' && r > 8) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, r, 0, TAU);
          ctx.clip();
          ctx.fillStyle = 'rgba(150,90,40,.35)';
          [-0.4, 0, 0.35].forEach(k => ctx.fillRect(x - r, y + k * r - r * 0.07, r * 2, r * 0.14));
          D.circle(ctx, x + r * 0.35, y + r * 0.25, r * 0.13, 'rgba(190,70,40,.8)');
          ctx.restore();
        }
        if (p.ring) {
          ctx.save();
          ctx.strokeStyle = 'rgba(232,207,138,.85)';
          ctx.lineWidth = r * 0.35;
          ctx.beginPath();
          ctx.ellipse(x, y, r * 1.9, r * 0.6, -0.3, 0, Math.PI);
          ctx.stroke();
          ctx.restore();
        }
      }
      function drawSun(x, y, r) {
        const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2);
        g.addColorStop(0, 'rgba(255,230,120,.9)');
        g.addColorStop(0.5, 'rgba(255,170,40,.35)');
        g.addColorStop(1, 'rgba(255,150,30,0)');
        D.circle(ctx, x, y, r * 2, g);
        D.circle(ctx, x, y, r, '#ffcc33');
      }
      function label(p, x, y, r) {
        const on = PLANETS.indexOf(p) === sel;
        if (names || on) D.text(ctx, p.name, x, y + r + 14, { size: on ? 17 : 13, color: on ? '#fff' : '#c9cbe6', weight: on ? 'bold' : 'normal' });
        if (on) D.circle(ctx, x, y, r + 7, null, '#ffd75a', 2);
      }

      function renderOrbit() {
        PLANETS.forEach(p => {
          ctx.beginPath();
          ctx.ellipse(CX, CY, p.a, p.a * TILT, 0, 0, TAU);
          ctx.strokeStyle = PLANETS.indexOf(p) === sel ? 'rgba(255,215,90,.5)' : 'rgba(255,255,255,.14)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          p.sx = CX + Math.cos(p.th) * p.a;
          p.sy = CY + Math.sin(p.th) * p.a * TILT;
          p.sr = p.r;
        });
        const behind = PLANETS.filter(p => p.sy < CY), front = PLANETS.filter(p => p.sy >= CY);
        behind.forEach(p => { planetBody(p, p.sx, p.sy, p.r); label(p, p.sx, p.sy, p.r); });
        drawSun(CX, CY, 28);
        if (sel === -1) D.circle(ctx, CX, CY, 36, null, '#ffd75a', 2);
        front.forEach(p => { planetBody(p, p.sx, p.sy, p.r); label(p, p.sx, p.sy, p.r); });
        D.text(ctx, '口诀：水 金 地 火 木 土 天 海', 400, 432, { size: 16, color: '#c9cbe6' });
      }
      function renderSize() {
        // 太阳太大了，只能露出一小角
        const sunR = 109 * SIZE_SCALE / 2;
        D.circle(ctx, 85 - sunR, CY, sunR, '#ffcc33');
        D.text(ctx, '太阳', 40, CY, { size: 18, color: '#b45309' });
        D.text(ctx, '（只露出一小角！）', 40, CY + 26, { size: 11, color: '#b45309', weight: 'normal' });
        let x = 108;
        PLANETS.forEach(p => {
          const r = Math.max(2, p.d * SIZE_SCALE / 2);
          const w = Math.max(p.ring ? r * 3.8 : r * 2, 46);
          p.sx = x + w / 2;
          p.sy = CY;
          p.sr = Math.max(r, 12);
          planetBody(p, p.sx, p.sy, r);
          const on = PLANETS.indexOf(p) === sel;
          D.text(ctx, p.name, p.sx, CY + 80, { size: on ? 16 : 13, color: on ? '#ffd75a' : '#c9cbe6' });
          x += w + 12;
        });
        D.text(ctx, '按真实大小比一比（地球 = 10 像素宽）', 470, 40, { size: 16, color: '#c9cbe6' });
      }

      api.pointer(st, {
        down(q) {
          let best = -2, bd = 1e9;
          PLANETS.forEach((p, i) => {
            const d = Math.hypot(q.x - p.sx, q.y - p.sy);
            if (d < p.sr + 16 && d < bd) { bd = d; best = i; }
          });
          if (best === -2 && view === 'orbit' && Math.hypot(q.x - CX, q.y - CY) < 40) best = -1;
          if (best === -2) return;
          sel = best;
          Sci.sfx('pop');
          if (best === -1) { api.note('☀️ ' + SUN_FACT); api.say(SUN_FACT, { auto: true }); return; }
          const p = PLANETS[best];
          api.note(`🪐 ${p.name}（离太阳第 ${best + 1} 近）：${p.fact}`);
          api.say(p.name + '。' + p.fact, { auto: true });
          clicked.add(best);
          if (clicked.size === 8 && !goalSent) {
            goalSent = true;
            api.timeout(() => { api.note('🎉 八颗行星你都认识啦！再背一遍口诀：水金地火木土天海！'); api.goalDone(); }, 600);
          }
        },
      });

      api.loop(dt => {
        t += dt;
        if (view === 'orbit') PLANETS.forEach(p => { p.th += dt * speed * TAU / (p.period * 8); });
        starfield(ctx, t);
        if (view === 'orbit') renderOrbit();
        else renderSize();
      });

      api.choice([['orbit', '🌌 绕着太阳转'], ['size', '📏 比一比大小']], view, v => {
        view = v;
        api.note(v === 'size' ? '看！木星和土星是大胖子，地球只是个小不点，太阳更是大得装不下！' : '离太阳越近的行星，跑得越快哦。');
      });
      const row2 = api.row();
      api.slider('转动速度', 0, 4, 0.1, speed, v => { speed = v; }, v => v.toFixed(1) + ' 倍', row2);
      api.toggle('🏷️ 显示名字', names, v => { names = v; }, row2);
      api.note('👆 点一点行星（或者中间的太阳），听听它的故事！地球绕太阳一圈在这里只要 8 秒。');
    },
  });

  /* ================= 4. 四季的秘密 ================= */
  const KEY_DAYS = [[0, '冬至', '12月22日前后', '❄️ 冬天'], [Math.PI / 2, '春分', '3月21日前后', '🌸 春天'], [Math.PI, '夏至', '6月21日前后', '☀️ 夏天'], [Math.PI * 1.5, '秋分', '9月23日前后', '🍂 秋天']];

  Sci.register({
    id: 'seasons',
    subject: 'astronomy',
    level: 4,
    emoji: '🍂',
    title: '四季的秘密',
    desc: '为什么夏天热、冬天冷？',
    intro: '很多人以为：夏天热是因为地球离太阳近。其实不对！秘密在于地球是“歪着身子”绕太阳转的——地轴倾斜了大约 23.5°。让地球绕太阳转起来，看看北京中午的太阳高度和白天的长短是怎么变化的。',
    goal: '找到冬至、春分、夏至、秋分四个位置',
    fact: '<p>地球绕太阳公转一圈是<b>一年</b>。地轴始终<b>倾斜约 23.5°</b>，而且一直指向同一个方向（北极星附近）。</p><p>当北半球<b>倾向太阳</b>时，太阳照得<b>更直</b>，同样多的阳光集中在更小的地面上，又热又亮；白天也更<b>长</b>——这就是夏天。北半球背向太阳时，阳光斜斜地铺开，白天又短，就是冬天。</p><p>🤯 有趣的是：地球离太阳最近的时候在每年 1 月初，那时北京正是冬天！而南半球的季节和我们正好相反，澳大利亚的圣诞节在夏天。</p>',
    quiz: [
      { q: '形成四季的主要原因是？', options: ['地轴倾斜，阳光照射的角度和白天长短在变化', '地球离太阳一会儿近一会儿远'], answer: 0, explain: '地球 1 月离太阳最近，北京却是冬天。' },
      { q: '夏至这一天，北京的白天？', options: ['一年中最长', '一年中最短', '和黑夜一样长'], answer: 0, explain: '夏至白天最长，冬至白天最短，春分秋分昼夜差不多一样长。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const SX = 255, SY = 235, A = 195, B = 80, TILT = 23.5 * Math.PI / 180, LAT = 40;
      let phi = 0.35, spin = true, speed = 1, t = 0, dragging = false, lastKey = '';
      const seen = new Set();
      const pos = p => [SX + Math.cos(p) * A, SY - Math.sin(p) * B];

      api.pointer(st, {
        down(p) { if (p.x < 510) { dragging = true; setPhi(p); } },
        move(p, active) { if (active && dragging) setPhi(p); },
        up() { dragging = false; },
      });
      function setPhi(p) {
        let a = Math.atan2(-(p.y - SY) / B, (p.x - SX) / A);
        if (a < 0) a += Math.PI * 2;
        phi = a;
      }

      function render() {
        starfield(ctx, t, 0, 520);
        // 轨道和太阳
        ctx.beginPath();
        ctx.ellipse(SX, SY, A, B, 0, 0, TAU);
        ctx.strokeStyle = 'rgba(255,255,255,.25)';
        ctx.lineWidth = 2;
        ctx.stroke();
        const g = ctx.createRadialGradient(SX, SY, 10, SX, SY, 80);
        g.addColorStop(0, 'rgba(255,230,120,.9)');
        g.addColorStop(1, 'rgba(255,150,30,0)');
        D.circle(ctx, SX, SY, 80, g);
        D.circle(ctx, SX, SY, 38, '#ffcc33');
        KEY_DAYS.forEach(([a, name, date]) => {
          const [x, y] = pos(a);
          const on = seen.has(name);
          const lx = x + Math.cos(a) * 30, ly = y - Math.sin(a) * 40 + (a === Math.PI * 1.5 ? 18 : 0);
          D.text(ctx, `${on ? '✅' : ''}${name}`, lx, ly, { size: 14, color: on ? '#9ff0b8' : '#c9cbe6' });
          D.text(ctx, date, lx, ly + 16, { size: 11, color: '#8d90b8', weight: 'normal' });
        });
        // 地球
        const [ex, ey] = pos(phi);
        const toSun = Math.atan2(SY - ey, SX - ex);
        D.circle(ctx, ex, ey, 24, '#3d8bff');
        ctx.fillStyle = 'rgba(5,10,40,.7)';
        ctx.beginPath();
        ctx.arc(ex, ey, 24.5, toSun + Math.PI / 2, toSun + Math.PI * 1.5);
        ctx.fill();
        const ax = Math.sin(TILT), ay = -Math.cos(TILT);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ex - ax * 38, ey - ay * 38);
        ctx.lineTo(ex + ax * 38, ey + ay * 38);
        ctx.stroke();
        D.text(ctx, 'N', ex + ax * 48, ey + ay * 48, { size: 13, color: '#fff' });
        D.text(ctx, '地轴倾斜 23.5°，方向始终不变', 255, 432, { size: 13, color: '#c9cbe6', weight: 'normal' });

        // 右侧：北京中午的太阳
        const decl = -23.5 * Math.cos(phi);
        const h = 90 - LAT + decl;
        const day = 2 / 15 * Math.acos(-Math.tan(LAT * Math.PI / 180) * Math.tan(decl * Math.PI / 180)) * 180 / Math.PI;
        const PX = 525;
        ctx.fillStyle = '#e8f4ff';
        ctx.fillRect(PX, 0, 800 - PX, 450);
        ctx.fillStyle = '#7cb85a';
        ctx.fillRect(PX, 330, 800 - PX, 120);
        D.text(ctx, '北京（北纬 40°）正午的太阳', 662, 26, { size: 16 });
        const hr = h * Math.PI / 180, gx = 705;
        const sx = gx - Math.cos(hr) * 190, sy = 330 - Math.sin(hr) * 190;
        const foot = 34 / Math.sin(hr);
        ctx.fillStyle = 'rgba(255,214,60,.35)';
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(gx - foot / 2, 330);
        ctx.lineTo(gx + foot / 2, 330);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffcf33';
        ctx.fillRect(gx - foot / 2, 328, foot, 6);
        D.emoji(ctx, '☀️', sx, sy, 36);
        D.emoji(ctx, '🏠', 580, 316, 30);
        ctx.strokeStyle = '#2b2840';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(gx, 330, 40, Math.PI, Math.PI + hr);
        ctx.stroke();
        D.text(ctx, `${Math.round(h)}°`, gx - 58, 316, { size: 14 });
        const season = KEY_DAYS.reduce((best, k) => {
          const d = Math.abs(Math.atan2(Math.sin(phi - k[0]), Math.cos(phi - k[0])));
          return d < best[0] ? [d, k] : best;
        }, [9, null])[1];
        D.text(ctx, season[3], 662, 366, { size: 26, color: '#fff' });
        D.text(ctx, `正午太阳高度：${Math.round(h)}°`, 662, 398, { size: 16, color: '#fff' });
        D.text(ctx, `白天约 ${day.toFixed(1)} 小时`, 662, 424, { size: 16, color: '#fff' });
        D.text(ctx, h > 60 ? '阳光直，晒得热' : h < 35 ? '阳光斜，铺得开，不太热' : '阳光不直不斜', 662, 300, { size: 13, color: '#4a4560', weight: 'normal' });
      }

      api.loop(dt => {
        t += dt;
        if (spin && !dragging) phi = (phi + dt * 0.35 * speed) % TAU;
        for (const [a, name, date] of KEY_DAYS) {
          const d = Math.abs(Math.atan2(Math.sin(phi - a), Math.cos(phi - a)));
          if (d < 0.07 && lastKey !== name) {
            lastKey = name;
            const info = {
              冬至: '北半球背向太阳，北京中午太阳最低，白天最短。',
              春分: '太阳直射赤道，全球白天黑夜差不多一样长。',
              夏至: '北半球倾向太阳，北京中午太阳最高，白天最长！',
              秋分: '太阳又直射赤道，昼夜差不多一样长。',
            }[name];
            api.note(`📅 ${name}（${date}）：${info}`);
            if (!seen.has(name)) {
              seen.add(name);
              Sci.sfx('pop');
              if (seen.size === 4) api.timeout(() => { api.note('🎉 四个节气都找到啦！你发现了吗：夏至地球离太阳并不更近，是地轴的倾斜带来了四季。'); api.goalDone(); }, 1600);
            }
          }
        }
        render();
      });
      const playBtn = api.button('⏸ 停一停', () => {
        spin = !spin;
        playBtn.textContent = spin ? '⏸ 停一停' : '▶ 转起来';
      });
      api.slider('公转速度', 0.2, 3, 0.1, speed, v => { speed = v; }, v => v.toFixed(1) + ' 倍');
      api.note('地球正在绕太阳公转。注意看右边：北京中午的太阳高度和白天长短在怎么变？也可以拖动地球。');
    },
  });

  /* ================= 5. 引力与卫星 ================= */
  Sci.register({
    id: 'orbit',
    subject: 'astronomy',
    level: 5,
    emoji: '🛰️',
    title: '引力与卫星',
    desc: '牛顿的大炮：怎样让炮弹绕地球飞？',
    intro: '扔出去的球总会掉回地面，因为地球的引力在拉它。可是 300 多年前，科学家牛顿想：如果在超级高的山顶上，用超级快的速度把炮弹水平打出去，会怎样？炮弹越快，落得越远……快到一定程度，它就一直“掉”不到地面，绕着地球转圈——变成了卫星！调好速度，点“发射”试试吧。',
    goal: '让炮弹分别落回地面、绕地球一圈、飞离地球',
    fact: '<p>任何两个物体之间都有互相吸引的力，叫<b>万有引力</b>。月亮和人造卫星一直在被地球的引力往下拉，但它们飞得足够快，往下“掉”的同时又往前飞，地面总是弯走了，所以永远掉不下来——这就是<b>绕地球转圈</b>。</p><p><b>第一宇宙速度 7.9 公里/秒</b>：贴着地面绕地球飞行需要的速度（比声音快 20 多倍！）。<b>第二宇宙速度 11.2 公里/秒</b>：达到这个速度，就能摆脱地球的引力飞向太空。</p><p>🚀 我国的神舟飞船、天宫空间站、北斗卫星，都在利用这个原理绕地球飞行。</p>',
    quiz: [
      { q: '为什么卫星不会掉下来？', options: ['它飞得够快，一边“掉”一边往前绕着地球转', '太空中没有引力'], answer: 0, explain: '空间站上其实还有地球引力，只是一直在“自由下落”。' },
      { q: '想绕地球飞行，至少要多快（第一宇宙速度）？', options: ['约 7.9 公里/秒', '约 340 米/秒', '约 100 公里/时'], answer: 0, explain: '每秒 7.9 公里，大约是声音速度的 23 倍。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const CX = 400, CY = 250, RE = 100, R0 = 120;
      const VC = TAU * R0 / 6, GM = VC * VC * R0, K = VC / 7.9;
      const COLORS = ['#ffd34d', '#4fd1ff', '#ff7ab6', '#7dff9a', '#ffa94d'];
      let v = 6, shots = [], cur = null, zoom = 1, t = 0, fast = false, goalSent = false;
      const results = new Set();

      function fire() {
        cur = { x: CX, y: CY - R0, vx: v * K, vy: 0, trail: [[CX, CY - R0]], ang: 0, prev: -Math.PI / 2, state: 'fly', color: COLORS[shots.length % COLORS.length], v, maxR: R0 };
        shots.push(cur);
        if (shots.length > 5) shots.shift();
        Sci.sfx('whoosh');
        api.note(`🚀 以 ${v.toFixed(1)} 公里/秒 的速度水平发射！`);
      }
      function finish(kind, msg) {
        cur.state = kind;
        results.add(kind);
        Sci.sfx(kind === 'fall' ? 'plop' : 'star');
        api.note(msg);
        if (!goalSent && results.size === 3) {
          goalSent = true;
          api.timeout(() => { api.note('🎉 三种结局你都试出来了：慢了会落地，7.9 公里/秒能绕地球飞，11.2 公里/秒以上能飞离地球！'); api.goalDone(); }, 2200);
        }
      }
      function step(dt) {
        if (!cur || cur.state !== 'fly' && cur.state !== 'orbit') return;
        const n = 12, h = dt / n;
        for (let i = 0; i < n; i++) {
          const dx = cur.x - CX, dy = cur.y - CY, r = Math.hypot(dx, dy);
          const a = -GM / (r * r * r);
          cur.vx += a * dx * h;
          cur.vy += a * dy * h;
          cur.x += cur.vx * h;
          cur.y += cur.vy * h;
          const ang = Math.atan2(cur.y - CY, cur.x - CX);
          let da = ang - cur.prev;
          if (da > Math.PI) da -= TAU;
          if (da < -Math.PI) da += TAU;
          cur.ang += da;
          cur.prev = ang;
          const r2 = Math.hypot(cur.x - CX, cur.y - CY);
          cur.maxR = Math.max(cur.maxR, r2);
          if (r2 < RE) {
            const km = Math.round(Math.abs(cur.ang) * 6371);
            finish('fall', `💥 落回地面了！它飞了大约 ${km.toLocaleString()} 公里。速度再快一点，就能飞得更远。`);
            return;
          }
          const E = (cur.vx * cur.vx + cur.vy * cur.vy) / 2 - GM / r2;
          if (E >= 0 && r2 > R0 * 6) {
            finish('escape', '🌌 它挣脱了地球的引力，飞向太空深处，再也不回来了！（达到第二宇宙速度）');
            return;
          }
          if (cur.state === 'fly' && Math.abs(cur.ang) >= TAU) {
            finish('orbit', '🛰️ 绕地球转了一整圈！它没有掉下来，变成了一颗卫星。');
            cur.state = 'orbit';
          }
          if (cur.state === 'orbit' && Math.abs(cur.ang) >= TAU * 3) { cur.state = 'done'; return; }
        }
        const last = cur.trail[cur.trail.length - 1];
        if (Math.hypot(cur.x - last[0], cur.y - last[1]) > 3) cur.trail.push([cur.x, cur.y]);
        if (cur.trail.length > 4000) cur.trail.shift();
      }

      function render() {
        starfield(ctx, t);
        const target = clamp(200 / (cur ? Math.max(cur.maxR, R0) : R0), 0.12, 1);
        zoom += (target - zoom) * 0.05;
        ctx.save();
        ctx.translate(CX, CY);
        ctx.scale(zoom, zoom);
        ctx.translate(-CX, -CY);
        const atm = ctx.createRadialGradient(CX, CY, RE, CX, CY, RE + 18);
        atm.addColorStop(0, 'rgba(120,190,255,.5)');
        atm.addColorStop(1, 'rgba(120,190,255,0)');
        D.circle(ctx, CX, CY, RE + 18, atm);
        const eg = ctx.createRadialGradient(CX - 30, CY - 30, 10, CX, CY, RE);
        eg.addColorStop(0, '#6fc1ff');
        eg.addColorStop(1, '#1f5fb0');
        D.circle(ctx, CX, CY, RE, eg);
        ctx.fillStyle = 'rgba(90,180,90,.8)';
        [[-30, -20, 34], [35, 25, 28], [-10, 50, 20]].forEach(([dx, dy, r]) => D.circle(ctx, CX + dx, CY + dy, r, 'rgba(90,180,90,.8)'));
        // 超级高山和大炮
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.moveTo(CX - 18, CY - RE + 4);
        ctx.lineTo(CX, CY - R0 + 2);
        ctx.lineTo(CX + 18, CY - RE + 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#444';
        ctx.fillRect(CX - 4, CY - R0 - 4, 14, 6);
        shots.forEach(s => {
          ctx.strokeStyle = s.color;
          ctx.globalAlpha = s === cur ? 1 : 0.45;
          ctx.lineWidth = 2.5 / zoom;
          ctx.beginPath();
          s.trail.forEach(([x, y]) => ctx.lineTo(x, y));
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
          if (s.state !== 'fall') D.circle(ctx, s.x, s.y, 5 / zoom, s.color);
          else D.emoji(ctx, '💥', s.x, s.y, 18 / zoom);
        });
        ctx.restore();
        D.rrect(ctx, 12, 12, 230, 120, 14);
        ctx.fillStyle = 'rgba(255,255,255,.1)';
        ctx.fill();
        D.text(ctx, `发射速度：${v.toFixed(1)} 公里/秒`, 24, 34, { size: 16, color: '#fff', align: 'left' });
        [['fall', '< 7.9：落回地面'], ['orbit', '≈ 7.9～11.2：绕地球转'], ['escape', '≥ 11.2：飞离地球']].forEach(([k, s], i) => {
          D.text(ctx, `${results.has(k) ? '✅' : '⬜'} ${s}`, 24, 64 + i * 24, { size: 14, color: results.has(k) ? '#9ff0b8' : '#c9cbe6', align: 'left', weight: 'normal' });
        });
        if (zoom < 0.9) D.text(ctx, `🔭 视野已缩小到 ${Math.round(zoom * 100)}%`, 788, 438, { size: 13, align: 'right', color: '#c9cbe6', weight: 'normal' });
      }

      api.loop(dt => {
        t += dt;
        step(dt * (fast ? 4 : 1));
        render();
      });
      api.slider('🚀 发射速度', 1, 12, 0.1, v, val => { v = val; }, val => val.toFixed(1) + ' 公里/秒');
      const row = api.row();
      api.button('🚀 发射', fire, row);
      api.toggle('⏩ 快进', false, val => { fast = val; }, row);
      api.button('🧹 清除轨迹', () => { shots = []; cur = null; }, row);
      api.note('先试试 6 公里/秒，再试 7.9 和 11.5，看看炮弹的结局有什么不同？');
    },
  });
})();
