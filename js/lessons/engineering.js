/* 工程小创客（第一组）：搭高塔 → 搭桥 → 斜面 → 水车发电 → 水火箭 */
(function () {
  'use strict';
  const { clamp, lerp, rand } = Sci;
  const D = Sci.draw;

  /* ================= 1. 积木高塔 ================= */
  const BLOCKS = [['wide', '宽积木', 140, 30, '#ff922b'], ['square', '方积木', 70, 70, '#4c6ef5'], ['tall', '长条积木', 30, 110, '#40c057']];

  Sci.register({
    id: 'tower',
    subject: 'engineering',
    level: 1,
    emoji: '🏗️',
    title: '积木高塔',
    desc: '怎样搭得又高又稳，地震也不倒？',
    intro: '我们来当建筑师，用积木搭一座高塔！选一种积木，在塔上方点一下，积木就会落下去。塔要搭得越高越好，还要经得起“地震测试”。想一想：底下用什么积木最稳？积木要不要对齐？',
    goal: '搭一座高过虚线的塔，并通过地震测试',
    fact: '<p>想让高塔又高又稳，有两个秘诀：</p><p>① <b>下宽上窄</b>：底部越宽，越不容易倒，所以宝塔、电视塔、埃菲尔铁塔都是下面大、上面小。</p><p>② <b>重心要居中</b>：每一层都尽量放在下面那层的正中间，整座塔的重量才能稳稳地压在底座上。</p><p>🏯 高楼的地基会挖得很深、做得很宽，就像大树的根一样牢牢抓住大地。</p>',
    quiz: [
      { q: '怎样搭的积木塔最稳？', options: ['下面宽、上面窄', '下面窄、上面宽'], answer: 0, explain: '底部宽，重心低，最稳。' },
      { q: '高楼为什么要打很深的地基？', options: ['让楼房更稳固', '让楼房更好看'], answer: 0, explain: '地基把楼房牢牢固定在大地上。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const GROUND = 420, GOAL_H = 300, CX = 330;
      let kind = BLOCKS[0], stack = [], falling = null, shake = 0, result = null, passed = false;
      const top = () => (stack.length ? stack[stack.length - 1] : null);
      const height = () => stack.reduce((s, b) => s + b.h, 0);

      api.pointer(st, {
        down(p) {
          if (falling || shake > 0 || p.x > 600) return;
          const [, , w, h, c] = kind;
          falling = { x: clamp(p.x, 40, 580), y: 30, w, h, c, vy: 0 };
          result = null;
        },
      });
      function land(b) {
        const t = top();
        const baseY = GROUND - height();
        if (t && Math.abs(b.x - t.x) > t.w / 2) {
          Sci.sfx('bad');
          api.note('哎呀，没放在下面积木的上面，掉下去了！要放稳一点哦。');
          return;
        }
        stack.push({ x: b.x, w: b.w, h: b.h, c: b.c, y: baseY - b.h });
        Sci.sfx('clack');
        api.note(`塔高 ${Math.round(height() / 3)} 厘米。` + (height() >= GOAL_H ? '已经超过虚线啦！点“地震测试”试试。' : ''));
      }
      // 地震时：每一层上面那部分塔的重心，都要落在这一层积木里面（越高晃得越厉害）
      function stable() {
        for (let i = 0; i < stack.length; i++) {
          const above = stack.slice(i + 1);
          if (!above.length) continue;
          const m = above.reduce((s, b) => s + b.w * b.h, 0);
          const com = above.reduce((s, b) => s + b.x * b.w * b.h, 0) / m;
          const hAbove = above.reduce((s, b) => s + b.h, 0);
          const margin = stack[i].w / 2 - hAbove * 0.09;
          if (Math.abs(com - stack[i].x) > margin) return i;
        }
        // 塔太高、底太窄也会倒
        if (stack.length && height() / stack[0].w > 3.6) return 0;
        return -1;
      }
      function quake() {
        if (!stack.length || shake > 0 || falling) return;
        shake = 2.2;
        result = null;
        Sci.sfx('whoosh');
        api.note('地震来了！轰隆隆……');
      }
      api.loop(dt => {
        if (falling) {
          falling.vy += 1500 * dt;
          falling.y += falling.vy * dt;
          const landY = GROUND - height() - falling.h;
          const t = top();
          if (falling.y >= landY) {
            const missed = t && Math.abs(falling.x - t.x) > t.w / 2;
            if (missed) { if (falling.y > GROUND) { falling = null; Sci.sfx('bad'); api.note('哎呀，没放在下面积木的上面，掉下去了！'); } } else { falling.y = landY; land(falling); falling = null; }
          }
        }
        if (shake > 0) {
          shake -= dt;
          if (shake <= 0) {
            const bad = stable();
            if (bad >= 0) {
              result = 'fall';
              Sci.sfx('bad');
              api.note('塔倒了！试试底下用宽积木，每一层都放在正中间。');
              stack = stack.slice(0, bad + 1);
            } else if (height() >= GOAL_H) {
              result = 'ok';
              Sci.sfx('star');
              api.note(`🎉 地震过去了，${Math.round(height() / 3)} 厘米高的塔稳稳地站着！`);
              if (!passed) { passed = true; api.goalDone(); }
            } else {
              result = 'ok';
              Sci.sfx('good');
              api.note('塔没倒！不过还没超过虚线，再搭高一点。');
            }
          }
        }
        const sx = shake > 0 ? Math.sin(shake * 40) * 6 : 0;
        ctx.fillStyle = '#f1f8ff';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#c99a63';
        ctx.fillRect(0, GROUND, 800, 30);
        ctx.save();
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = '#e8590c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, GROUND - GOAL_H);
        ctx.lineTo(600, GROUND - GOAL_H);
        ctx.stroke();
        ctx.restore();
        D.text(ctx, '目标高度', 560, GROUND - GOAL_H - 12, { size: 13, color: '#e8590c' });
        stack.forEach((b, i) => {
          const wob = sx * (1 + i * 0.25);
          D.rrect(ctx, b.x - b.w / 2 + wob, b.y, b.w, b.h, 5);
          ctx.fillStyle = b.c;
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,.2)';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        if (falling) {
          D.rrect(ctx, falling.x - falling.w / 2, falling.y, falling.w, falling.h, 5);
          ctx.fillStyle = falling.c;
          ctx.fill();
        }
        // 右边：选中的积木
        D.rrect(ctx, 620, 30, 165, 200, 14);
        ctx.fillStyle = '#fff';
        ctx.fill();
        D.text(ctx, '手里的积木', 702, 52, { size: 15, color: '#6f6a85' });
        D.rrect(ctx, 702 - kind[2] / 2, 140 - kind[3] / 2, kind[2], kind[3], 5);
        ctx.fillStyle = kind[4];
        ctx.fill();
        D.text(ctx, kind[1], 702, 215, { size: 15 });
        D.text(ctx, `塔高 ${Math.round(height() / 3)} 厘米`, 702, 270, { size: 18 });
        D.text(ctx, result === 'ok' ? '✅ 地震没倒' : result === 'fall' ? '💥 倒了' : '', 702, 305, { size: 16, color: result === 'ok' ? '#2f9e44' : '#c92a2a' });
        D.text(ctx, '👆 在左边点一下，放下积木', 300, 22, { size: 15, color: '#6f6a85', weight: 'normal' });
      });
      api.choice(BLOCKS.map(b => [b[0], b[1]]), kind[0], v => { kind = BLOCKS.find(b => b[0] === v); });
      const row2 = api.row();
      api.button('🌋 地震测试', quake, row2);
      api.button('↩️ 拿掉最上面一块', () => { if (!shake) stack.pop(); }, row2);
      api.button('🧹 推倒重来', () => { if (!shake) { stack = []; result = null; } }, row2);
      api.note('👆 选一种积木，在左边点一下放下去。');
    },
  });

  /* ================= 2. 搭一座桥 ================= */
  const BTYPES = [['beam', '平板桥', 1], ['arch', '拱桥', 2.5], ['truss', '三角桁架桥', 4]];
  const MATS = [['paper', '纸板', 0.5], ['wood', '木头', 2], ['steel', '钢铁', 5]];
  const CARS = [['bike', '🚲', '自行车', 1], ['car', '🚗', '小汽车', 3], ['truck', '🚚', '大卡车', 8]];

  Sci.register({
    id: 'bridge',
    subject: 'engineering',
    level: 2,
    emoji: '🌉',
    title: '搭一座桥',
    desc: '平板桥、拱桥、桁架桥，哪种最结实？',
    intro: '河上要架一座桥！桥的形状和材料都会影响它能承受多重的车。选好桥的样子和材料，再让车开过去试试。挑战：只用木头，能不能让大卡车安全通过？',
    goal: '只用木头造桥，让大卡车安全通过',
    fact: '<p>同样的材料，<b>形状不同，结实程度大不一样</b>：</p><p><b>平板桥</b>最简单，但中间容易被压弯。<b>拱桥</b>把压力顺着弧形传到两岸，赵州桥一千四百多年都没有倒。<b>桁架桥</b>用许多<b>三角形</b>组成，三角形不容易变形，非常稳固。</p><p>🔺 三角形的稳定性在生活中到处都是：自行车车架、屋顶的房梁、输电铁塔、起重机的吊臂……</p>',
    quiz: [
      { q: '桁架桥为什么特别结实？', options: ['用了很多三角形，不容易变形', '因为它颜色鲜艳'], answer: 0, explain: '三角形具有稳定性。' },
      { q: '我国著名的赵州桥是什么桥？', options: ['拱桥', '平板桥', '吊桥'], answer: 0, explain: '赵州桥是一座有一千四百多年历史的石拱桥。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const L = 220, R = 580, DECK = 230;
      let bt = BTYPES[0], mat = MATS[1], car = CARS[0], run = null, broken = false, t = 0, done = false;
      const strength = () => bt[2] * mat[2];

      function drive() {
        if (run) return;
        broken = false;
        run = { x: 40, ok: car[3] <= strength() };
        Sci.sfx('click');
      }
      api.loop(dt => {
        t += dt;
        let sag = 0;
        if (run) {
          run.x += dt * 160;
          const onBridge = run.x > L && run.x < R;
          if (onBridge) sag = Math.sin((run.x - L) / (R - L) * Math.PI) * clamp(car[3] / strength(), 0, 1.2) * 26;
          if (onBridge && !run.ok && run.x > (L + R) / 2) {
            broken = true;
            Sci.sfx('bad');
            api.note(`咔嚓！${mat[1]}${bt[1]}最多能承受 ${strength()} 吨，${car[2]}有 ${car[3]} 吨，桥被压断了！车子赶紧停了下来。`);
            run = null;
          } else if (run.x > 760) {
            Sci.sfx('good');
            api.note(`✅ ${car[2]}安全通过了${mat[1]}${bt[1]}！（这座桥能承受 ${strength()} 吨）`);
            if (car[0] === 'truck' && mat[0] === 'wood' && !done) { done = true; Sci.sfx('star'); api.note('🎉 木头桁架桥让大卡车安全通过了！三角形的力量真大。'); api.goalDone(); }
            run = null;
          }
        }
        ctx.fillStyle = '#e7f5ff';
        ctx.fillRect(0, 0, 800, 450);
        // 河和两岸
        ctx.fillStyle = '#4dabf7';
        ctx.fillRect(L, 330, R - L, 120);
        ctx.fillStyle = '#8d6e4f';
        ctx.fillRect(0, DECK, L, 220);
        ctx.fillRect(R, DECK, 220, 220);
        // 桥
        const col = { paper: '#e9ecef', wood: '#c08552', steel: '#868e96' }[mat[0]];
        ctx.strokeStyle = col;
        ctx.fillStyle = col;
        const deckY = x => DECK + (run && x > L && x < R ? Math.sin((x - L) / (R - L) * Math.PI) * sag : 0);
        if (broken) {
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(L, DECK);
          ctx.lineTo((L + R) / 2 - 10, DECK + 70);
          ctx.moveTo(R, DECK);
          ctx.lineTo((L + R) / 2 + 10, DECK + 70);
          ctx.stroke();
        } else {
          ctx.lineWidth = 12;
          ctx.beginPath();
          for (let x = L; x <= R; x += 10) ctx.lineTo(x, deckY(x));
          ctx.stroke();
          ctx.lineWidth = 6;
          if (bt[0] === 'arch') {
            ctx.beginPath();
            ctx.moveTo(L, 320);
            ctx.quadraticCurveTo((L + R) / 2, DECK - 30, R, 320);
            ctx.stroke();
            for (let x = L + 40; x < R; x += 40) { const k = (x - L) / (R - L), ay = 320 - 4 * k * (1 - k) * (320 - DECK + 15); ctx.beginPath(); ctx.moveTo(x, deckY(x)); ctx.lineTo(x, ay); ctx.stroke(); }
          } else if (bt[0] === 'truss') {
            ctx.beginPath();
            ctx.moveTo(L, deckY(L) - 60);
            ctx.lineTo(R, deckY(R) - 60);
            for (let x = L, i = 0; x < R; x += 60, i++) {
              ctx.moveTo(x, deckY(x));
              ctx.lineTo(x + 30, deckY(x + 30) - 60);
              ctx.lineTo(x + 60, deckY(x + 60));
            }
            ctx.stroke();
          }
        }
        // 车
        if (run) D.emoji(ctx, car[1], run.x, deckY(run.x) - 24, car[0] === 'truck' ? 56 : 44);
        else if (!broken) D.emoji(ctx, car[1], 60, DECK - 24, car[0] === 'truck' ? 56 : 44);
        D.text(ctx, `${mat[1]} ${bt[1]}：能承受 ${strength()} 吨`, 400, 40, { size: 20, color: '#2b2840' });
        D.text(ctx, `${car[2]}：${car[3]} 吨`, 400, 72, { size: 16, color: '#6f6a85' });
      });
      api.choice(BTYPES.map(b => [b[0], b[1]]), bt[0], v => { bt = BTYPES.find(b => b[0] === v); broken = false; });
      const r2 = api.row();
      api.choice(MATS.map(m => [m[0], m[1]]), mat[0], v => { mat = MATS.find(m => m[0] === v); broken = false; }, r2);
      const r3 = api.row();
      api.choice(CARS.map(c => [c[0], `${c[1]} ${c[2]}`]), car[0], v => { car = CARS.find(c => c[0] === v); }, r3);
      api.button('▶ 开过去', drive, r3);
      api.note('👆 选好桥的样子、材料和车子，点“开过去”。');
    },
  });

  /* ================= 3. 斜面的妙用 ================= */
  Sci.register({
    id: 'incline',
    subject: 'engineering',
    level: 3,
    emoji: '🚚',
    title: '斜面的妙用',
    desc: '为什么推上斜坡比直接抬起来省力？',
    intro: '要把一个 100 千克的大箱子装上卡车，直接抬可抬不动！工人们会搭一块木板做成斜面，把箱子推上去。木板越长，斜坡越缓，推起来越轻松。小朋友最多能使出 30 千克的力气，选一块合适的木板，把箱子推上车吧！',
    goal: '把 100 千克的箱子推上卡车',
    fact: '<p><b>斜面</b>是一种简单机械：把重物沿着斜面推上去，比直接竖直抬起来<b>省力</b>。斜面越长、越平缓，越省力；但要走的路程也越长——省了力，就要费距离。</p><p>生活中的斜面：盘山公路弯弯绕绕，就是把陡坡变成了长长的缓坡；楼梯、轮椅坡道、螺丝钉上的螺纹，也都是斜面。</p>',
    quiz: [
      { q: '同样的高度，怎样的斜面推箱子最省力？', options: ['又长又缓的斜面', '又短又陡的斜面'], answer: 0, explain: '斜面越长越缓越省力。' },
      { q: '山路为什么要修成弯弯曲曲的盘山公路？', options: ['坡变缓了，汽车爬坡更省力', '为了让路更好看'], answer: 0, explain: '盘山公路就是加长了的斜面。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      const G = 400, H = 120, TRUCK = 600, W = 100, KID = 30, PX = 60;
      let len = 2, pos = 0, drag = null, warned = false, t = 0, done = false;
      const force = () => Math.round(W * 1 / len);
      const baseX = () => TRUCK - Math.sqrt(Math.max(0, (len * PX * 1.2) ** 2 - H * H));

      api.pointer(st, {
        down(p) { drag = { x: p.x }; warned = false; },
        move(p, active) {
          if (!active || !drag) return;
          const dx = p.x - drag.x;
          drag.x = p.x;
          if (dx <= 0 || done) return;
          if (force() > KID) {
            if (!warned) { warned = true; Sci.sfx('bad'); api.note(`推不动！${len} 米长的木板要用 ${force()} 千克的力气，小朋友只有 ${KID} 千克。换一块更长的木板吧。`); }
            return;
          }
          pos = Math.min(1, pos + dx / (TRUCK - baseX()));
          if (pos >= 1 && !done) {
            done = true;
            Sci.sfx('star');
            api.note(`🎉 箱子装上车啦！用 ${len} 米长的木板，只要 ${force()} 千克的力气，但要推着走 ${len} 米。`);
            api.goalDone();
          }
        },
        up() { drag = null; },
      });
      api.loop(dt => {
        t += dt;
        const bx = baseX();
        ctx.fillStyle = '#fff9f0';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#ced4da';
        ctx.fillRect(0, G, 800, 50);
        // 卡车
        ctx.fillStyle = '#4c6ef5';
        ctx.fillRect(TRUCK, G - H, 180, H - 30);
        ctx.fillStyle = '#364fc7';
        ctx.fillRect(TRUCK + 130, G - H - 60, 50, 60);
        D.circle(ctx, TRUCK + 40, G - 22, 22, '#212529');
        D.circle(ctx, TRUCK + 140, G - 22, 22, '#212529');
        // 斜面木板
        ctx.strokeStyle = '#c08552';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(bx, G);
        ctx.lineTo(TRUCK, G - H);
        ctx.stroke();
        // 箱子
        const x = lerp(bx, TRUCK, pos) + (pos >= 1 ? 40 : 0), y = lerp(G, G - H, pos);
        const ang = pos >= 1 ? 0 : -Math.atan2(H, TRUCK - bx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        D.rrect(ctx, -30, -56, 60, 56, 6);
        ctx.fillStyle = '#e8b500';
        ctx.fill();
        D.text(ctx, '100kg', 0, -28, { size: 13, color: '#5c3d00' });
        ctx.restore();
        if (pos < 1) D.emoji(ctx, force() > KID ? '😣' : '💪', x - 55, y - 40, 40);
        D.text(ctx, `木板长 ${len} 米，高 1 米`, 200, 50, { size: 20 });
        D.text(ctx, `需要的力气：${force()} 千克`, 200, 84, { size: 18, color: force() > KID ? '#c92a2a' : '#2b8a3e' });
        D.text(ctx, `小朋友最多：${KID} 千克`, 200, 112, { size: 15, color: '#6f6a85', weight: 'normal' });
        D.text(ctx, '👆 在画面上按住往右拖，把箱子推上去', 560, 30, { size: 14, color: '#6f6a85', weight: 'normal' });
      });
      api.slider('木板长度', 1.2, 5, 0.2, len, v => { if (!done) { len = Math.round(v * 10) / 10; pos = 0; } }, v => v.toFixed(1) + ' 米');
      api.button('🔄 箱子放回地上', () => { pos = 0; done = false; });
      api.note('👆 先试试短木板，按住画面往右拖，推得动吗？');
    },
  });

  /* ================= 4. 水车发电 ================= */
  Sci.register({
    id: 'waterwheel',
    subject: 'engineering',
    level: 4,
    emoji: '🌊',
    title: '水车发电',
    desc: '流水推动水车，水车带动发电机',
    intro: '古时候人们用水车把河水提上来浇地，现在的水电站用水的力量来发电。调一调水流的大小、水落下的高度和水车的叶片数，让水车转起来，带动发电机，点亮三盏灯泡吧！',
    goal: '点亮全部 3 盏灯泡',
    fact: '<p>高处的水往下流时带着<b>能量</b>，冲击水车的叶片，让水车转动起来；水车带动<b>发电机</b>，就把水的能量变成了<b>电能</b>。</p><p>水落得越高、水量越大，能发出的电越多。所以水电站要修高高的大坝，把水拦在高处。</p><p>⚡ 我国的<b>三峡水电站</b>是世界上最大的水电站之一，一年发的电够几千万个家庭用。水力发电不烧煤，是一种清洁的可再生能源。</p>',
    quiz: [
      { q: '水电站是把什么能变成电能？', options: ['水的能量', '太阳的光', '煤燃烧的热'], answer: 0, explain: '流水推动水轮机，带动发电机发电。' },
      { q: '为什么水电站要修高高的大坝？', options: ['让水从更高处落下，发更多电', '为了挡住鱼'], answer: 0, explain: '落差越大，水的能量越多。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let flow = 2, height = 1, blades = 8, angle = 0, t = 0, done = false;
      const power = () => flow * height * ({ 4: 0.6, 8: 1, 12: 1.1 }[blades]);
      const lit = () => Math.min(3, Math.floor(power() / 4));
      let lastLit = -1;
      api.loop(dt => {
        t += dt;
        angle += dt * power() * 0.6;
        const n = lit();
        if (n !== lastLit) {
          lastLit = n;
          if (n > 0) Sci.tone(500 + n * 120, 0.15, { type: 'triangle' });
          api.note(`发电量：${power().toFixed(1)}，点亮了 ${n} 盏灯泡。` + (n < 3 ? '再调一调，让水车转得更快！' : ''));
          if (n === 3 && !done) { done = true; Sci.sfx('star'); api.note('🎉 三盏灯全亮了！水的能量 → 水车转动 → 发电机发电 → 灯泡发光。'); api.goalDone(); }
        }
        ctx.fillStyle = '#e7f5ff';
        ctx.fillRect(0, 0, 800, 450);
        // 水箱和落水
        const topY = 260 - height * 60;
        ctx.fillStyle = '#868e96';
        ctx.fillRect(40, topY, 140, 330 - topY);
        ctx.fillStyle = '#4dabf7';
        ctx.fillRect(48, topY + 8, 124, 40);
        ctx.fillRect(180, topY + 20, 70, 10 + flow * 3);
        const WX = 300, WY = 300, WR = 80;
        ctx.fillStyle = 'rgba(77,171,247,.75)';
        ctx.fillRect(250, topY + 20, 10 + flow * 4, WY - WR - topY - 10);
        for (let i = 0; i < flow * 3; i++) D.circle(ctx, 255 + rand(0, flow * 4), topY + 20 + ((t * 300 + i * 37) % (WY - WR - topY)), 3, '#d0ebff');
        // 水车
        D.circle(ctx, WX, WY, WR, null, '#8d5a2b', 8);
        for (let i = 0; i < blades; i++) {
          const a = angle + i / blades * Math.PI * 2;
          ctx.strokeStyle = '#a0703c';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(WX, WY);
          ctx.lineTo(WX + Math.cos(a) * (WR + 18), WY + Math.sin(a) * (WR + 18));
          ctx.stroke();
          ctx.fillStyle = '#c08552';
          ctx.save();
          ctx.translate(WX + Math.cos(a) * (WR + 10), WY + Math.sin(a) * (WR + 10));
          ctx.rotate(a);
          ctx.fillRect(-4, -14, 16, 28);
          ctx.restore();
        }
        D.circle(ctx, WX, WY, 12, '#495057');
        ctx.fillStyle = '#74c0fc';
        ctx.fillRect(0, 400, 800, 50);
        // 传动杆和发电机
        ctx.strokeStyle = '#495057';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(WX, WY);
        ctx.lineTo(470, WY);
        ctx.stroke();
        D.rrect(ctx, 470, WY - 40, 90, 80, 12);
        ctx.fillStyle = '#495057';
        ctx.fill();
        D.text(ctx, '发电机', 515, WY, { size: 15, color: '#fff' });
        // 导线和灯泡
        ctx.strokeStyle = '#f59f00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(560, WY - 20);
        ctx.lineTo(600, WY - 20);
        ctx.lineTo(600, 120);
        ctx.lineTo(780, 120);
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
          const x = 640 + i * 55, on = i < n;
          if (on) D.circle(ctx, x, 150, 34, 'rgba(255,220,80,.4)');
          D.circle(ctx, x, 150, 18, on ? '#ffe066' : '#f1f3f5', '#adb5bd', 2);
          ctx.fillStyle = '#868e96';
          ctx.fillRect(x - 7, 120, 14, 12);
        }
        D.text(ctx, `发电量 ${power().toFixed(1)}`, 680, 220, { size: 20, color: '#2b2840' });
        D.text(ctx, `每 4 点电量点亮 1 盏灯`, 680, 250, { size: 14, color: '#6f6a85', weight: 'normal' });
      });
      api.slider('水流大小', 1, 5, 1, flow, v => { flow = v; }, v => ['', '很小', '小', '中', '大', '很大'][v]);
      api.slider('落水高度', 1, 3, 1, height, v => { height = v; }, v => v + ' 层楼');
      api.choice([[4, '4 片叶片'], [8, '8 片叶片'], [12, '12 片叶片']], blades, v => { blades = v; });
      api.note('👆 拖动滑块，让水流更大、落得更高，看看灯泡会不会亮。');
    },
  });

  /* ================= 5. 设计水火箭 ================= */
  Sci.register({
    id: 'waterrocket',
    subject: 'engineering',
    level: 5,
    emoji: '🚀',
    title: '设计水火箭',
    desc: '装多少水、打多少气，才能飞得最高？',
    intro: '工程师设计东西时，要不断地“试一试、改一改”。我们来设计一枚水火箭：塑料瓶里装一些水，再用打气筒打气，松开后，水从瓶口喷出，火箭就飞上了天。装多少水最好？要不要装尾翼？多做几次实验，看看记录表，把它改进到飞过 50 米！',
    goal: '设计出能飞过 50 米高的水火箭',
    fact: '<p>水火箭里的高压空气把水从瓶口猛烈地推出去，水往下喷，火箭往上飞——和真火箭一样，靠的是“<b>力的作用是相互的</b>”。</p><p>水太少，推出去的东西太少，力量不够；水太多，空气的空间小，压力很快就没了，火箭也太重。大约装 <b>三分之一</b>瓶水时飞得最高。<b>尾翼</b>能让火箭飞得直、不乱翻跟头。</p><p>🛠️ 工程师的工作方法：<b>提出想法 → 做出来 → 测试 → 找问题 → 改进</b>，一遍一遍地循环，作品就会越来越好。</p>',
    quiz: [
      { q: '水火箭里大约装多少水，飞得最高？', options: ['一点也不装', '大约三分之一瓶', '装满一瓶'], answer: 1, explain: '水太少推力不够，太多又太重。' },
      { q: '给水火箭装上尾翼有什么用？', options: ['让它飞得稳、飞得直', '让它更重'], answer: 0, explain: '尾翼能保持飞行方向稳定。' },
    ],
    mount(api) {
      const st = api.stage(800, 450), ctx = st.ctx;
      let water = 50, pump = 4, fins = false, fly = null, best = 0, t = 0;
      const log = [];
      const apex = () => {
        const w = water / 100;
        const eff = Math.pow(Math.max(0.04, 4 * w * (1 - w)), 0.7) * (w < 0.05 ? 0.25 : 1);
        return Math.round(10 * pump * eff * (fins ? 1.3 : 0.4));
      };
      function launch() {
        if (fly) return;
        fly = { k: 0, h: apex(), spin: !fins };
        Sci.sfx('whoosh');
      }
      api.loop(dt => {
        t += dt;
        if (fly) {
          fly.k += dt / 2.6;
          if (fly.k >= 1) {
            const h = fly.h;
            log.unshift({ water, pump, fins, h });
            if (log.length > 6) log.pop();
            best = Math.max(best, h);
            Sci.sfx(h >= 50 ? 'star' : 'good');
            api.note(`这次飞了 ${h} 米！` + (h >= 50 ? '🎉 超过 50 米，设计成功！' : !fins ? '火箭在空中乱翻跟头，装上尾翼试试？' : water > 60 ? '水好像装得太多了。' : water < 15 ? '水好像太少了。' : '再改进一下？'));
            if (h >= 50) api.goalDone();
            fly = null;
          }
        }
        const sky = ctx.createLinearGradient(0, 0, 0, 450);
        sky.addColorStop(0, '#74c0fc');
        sky.addColorStop(1, '#e7f5ff');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#8ce99a';
        ctx.fillRect(0, 410, 800, 40);
        // 高度尺（0~120 米）
        for (let m = 0; m <= 120; m += 20) {
          const y = 400 - m * 3;
          ctx.fillStyle = '#495057';
          ctx.fillRect(40, y, 12, 2);
          D.text(ctx, m + '米', 34, y, { size: 12, align: 'right', color: '#495057', weight: 'normal' });
        }
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#e8590c';
        ctx.beginPath();
        ctx.moveTo(52, 400 - 150);
        ctx.lineTo(470, 400 - 150);
        ctx.stroke();
        ctx.restore();
        D.text(ctx, '50 米', 490, 250, { size: 13, color: '#e8590c' });
        // 火箭
        let ry = 380, rot = 0;
        if (fly) {
          const k = fly.k, hgt = fly.h * 4 * k * (1 - k) * 3;
          ry = 380 - hgt;
          rot = fly.spin ? k * 12 : 0;
          if (k < 0.25) for (let i = 0; i < 6; i++) D.circle(ctx, 250 + rand(-8, 8), ry + 40 + i * 10, 5, 'rgba(77,171,247,.7)');
        }
        ctx.save();
        ctx.translate(250, ry);
        ctx.rotate(rot);
        D.rrect(ctx, -16, -40, 32, 76, 12);
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        ctx.fill();
        ctx.strokeStyle = '#adb5bd';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (!fly) { ctx.fillStyle = 'rgba(77,171,247,.7)'; ctx.fillRect(-14, 34 - water / 100 * 70, 28, water / 100 * 70); }
        ctx.fillStyle = '#e03131';
        ctx.beginPath();
        ctx.moveTo(-16, -38);
        ctx.quadraticCurveTo(0, -70, 16, -38);
        ctx.fill();
        if (fins) { ctx.beginPath(); ctx.moveTo(-16, 20); ctx.lineTo(-32, 40); ctx.lineTo(-16, 36); ctx.moveTo(16, 20); ctx.lineTo(32, 40); ctx.lineTo(16, 36); ctx.fill(); }
        ctx.restore();
        // 记录表
        D.rrect(ctx, 530, 20, 255, 230, 14);
        ctx.fillStyle = '#fff';
        ctx.fill();
        D.text(ctx, '试验记录', 657, 42, { size: 16 });
        ['水量', '打气', '尾翼', '高度'].forEach((s, i) => D.text(ctx, s, 565 + i * 62, 68, { size: 13, color: '#6f6a85' }));
        log.forEach((r, i) => {
          const y = 94 + i * 25;
          D.text(ctx, r.water + '%', 565, y, { size: 13, weight: 'normal' });
          D.text(ctx, r.pump + '下', 627, y, { size: 13, weight: 'normal' });
          D.text(ctx, r.fins ? '有' : '无', 689, y, { size: 13, weight: 'normal' });
          D.text(ctx, r.h + '米', 751, y, { size: 13, color: r.h >= 50 ? '#2b8a3e' : '#c0620a' });
        });
        D.text(ctx, `最高纪录：${best} 米`, 657, 280, { size: 18, color: '#2b2840' });
      });
      api.slider('装水', 0, 100, 5, water, v => { if (!fly) water = v; }, v => v + '%');
      api.slider('打气', 1, 8, 1, pump, v => { if (!fly) pump = v; }, v => v + ' 下');
      const row2 = api.row();
      api.toggle('🔻 装尾翼', false, v => { if (!fly) fins = v; }, row2);
      api.button('🚀 发射！', launch, row2);
      api.note('👆 先随便设计一次，点“发射！”，看看能飞多高。');
    },
  });
})();
