/* 对照实验：先预测，再只改变一个条件，最后用观察记录支持结论。
   共用操作流程，各课分别绘制其现象。数值是教学模型，不是真实测量。 */
(function () {
  'use strict';
  const D = Sci.draw;
  const text = (ctx, s, x, y, size, color) => D.text(ctx, s, x, y, { size: size || 20, color: color || '#2b2840' });
  const rect = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
  function register(c) {
    Sci.register({
      id: c.id, subject: c.subject, level: c.level, emoji: c.emoji, title: c.title,
      desc: c.desc, intro: c.intro,
      goal: '先预测，记录两种条件的结果，再选出符合证据的结论',
      fact: '<p>' + c.fact + '</p><p>公平比较：' + c.fixed + '，只改变' + c.variable + '。图中数值是帮助理解的教学模型，不是实测数据。</p>',
      quiz: c.quiz,
      mount(api) {
        const st = api.stage(), ctx = st.ctx;
        let selected = 0, predicted = null, phase = 0, running = false, done = false;
        const records = [false, false];
        const board = Sci.h('div', { class: 'compare-records' });
        const table = Sci.h('table', null,
          Sci.h('caption', null, '观察记录 · ' + c.measure),
          Sci.h('thead', null, Sci.h('tr', null, Sci.h('th', { scope: 'col' }, c.variable), Sci.h('th', { scope: 'col' }, '实验结果'))));
        const cells = c.conditions.map(label => {
          const cell = Sci.h('td', null, '还没实验');
          table.append(Sci.h('tbody', null, Sci.h('tr', null, Sci.h('th', { scope: 'row' }, label), cell)));
          return cell;
        });
        board.append(table);
        api.host.append(board);
        const predictions = api.row();
        predictions.classList.add('compare-predict');
        predictions.append(Sci.h('b', null, '① 先猜一猜：'));
        api.choice(Sci.shuffle([[0, c.conclusions[0]], [1, c.conclusions[1]]]), null, v => {
          predicted = v;
          api.note('预测记好了！现在试试两种条件，看证据是否支持你的想法。');
        }, predictions);
        const settings = api.row();
        settings.classList.add('compare-conditions');
        settings.append(Sci.h('b', null, '② 换条件做对照：'));
        api.choice(c.conditions.map((s, i) => [i, s]), selected, i => { selected = i; phase = records[i] ? 1 : 0; }, settings);
        const run = api.button('开始实验', () => {
          if (predicted === null) { api.note('先选一个预测。猜错没关系，我们用实验来检验。'); return; }
          if (running) return;
          phase = 0; running = true;
          predictions.querySelectorAll('button').forEach(b => { b.disabled = true; });
          settings.querySelectorAll('button').forEach(b => { b.disabled = true; });
          run.disabled = true;
          api.note('观察中：' + c.conditions[selected] + '。' + c.fixed + '。');
        });
        const answers = api.row();
        answers.classList.add('compare-answer');
        answers.append(Sci.h('b', null, '③ 对照记录，选结论：'));
        Sci.shuffle([[0, c.conclusions[0]], [1, c.conclusions[1]]]).forEach(([i, label]) => {
          api.button(label, () => {
            if (!records.every(Boolean)) { api.note('先把两种条件都试过，填满观察记录，再选结论。'); return; }
            if (i !== 0) { api.note('这个结论和记录不一致。看看两行结果，再想一想。'); return; }
            if (!done) { done = true; api.goalDone(); }
            api.note((predicted === 0 ? '预测得到了支持！' : '你用证据修正了预测！') + c.explain);
          }, answers);
        });
        api.note('先猜一猜，再分别试两种条件。最后用记录说明你的发现。');
        api.loop(dt => {
          if (running) {
            phase = Math.min(1, phase + dt / 1.6);
            if (phase === 1) {
              running = false; records[selected] = true;
              cells[selected].textContent = c.results[selected];
              settings.querySelectorAll('button').forEach(b => { b.disabled = false; });
              run.disabled = false;
              api.note(c.conditions[selected] + '：' + c.results[selected] + (records.every(Boolean) ? '。两组记录齐了，现在选择结论。' : '。再换另一种条件比较。'));
            }
          }
          ctx.clearRect(0, 0, 800, 450);
          rect(ctx, 0, 0, 800, 450, '#f5f9ff');
          text(ctx, c.conditions[selected], 400, 32, 25);
          text(ctx, c.fixed, 400, 70, 17, '#59657a');
          c.draw(ctx, selected, phase);
          text(ctx, '只改变：' + c.variable + ' · 教学模型', 400, 424, 16, '#59657a');
        });
      },
    });
  }

  // 后续课件沿用同一套预测、记录和结论流程，避免各科重复实现。
  Sci.registerComparison = register;

  register({
    id: 'snowshoes', subject: 'physics', level: 3, emoji: '👣', title: '雪鞋为什么不容易陷下去',
    desc: '同样重的小熊，换双宽鞋，比较压强和下陷深度',
    intro: '踩在软雪上，小熊会陷下去。穿上宽宽的雪鞋会怎样？保持小熊的重量不变，只换鞋底面积。先预测，再比较同一块软雪上的下陷，看看宽鞋是否更容易托住小熊。',
    variable: '鞋底面积', fixed: '小熊重量和软雪条件相同', conditions: ['窄鞋：1 份面积', '雪鞋：4 份面积'],
    measure: '相对压强与下陷', results: ['相对压强 12，下陷深', '相对压强 3，下陷浅'],
    conclusions: ['鞋底越宽，压强越小', '鞋底越宽，小熊就越轻'],
    explain: '重量没有变，接触面积变为 4 倍，压强降为四分之一。',
    fact: '压强表示单位面积受到的压力。同样的压力分散到更大的面积上，压强就更小。雪鞋和履带都用到了这个道理；具体下陷多少还和雪或泥土的性质有关。',
    quiz: [
      { q: '换宽雪鞋后，小熊的重量变了吗？', options: ['没有变', '变轻了'], answer: 0, explain: '改变的是接触面积，小熊的重量没有变。' },
      { q: '同样的压力，接触面积变为原来的四倍，压强会怎样？', options: ['变为四倍', '变为四分之一'], answer: 1, explain: '压力除以接触面积得到压强，所以面积四倍时压强是原来的四分之一。' },
    ],
    draw(ctx, i, p) {
      rect(ctx, 70, 280, 480, 100, '#d2eaff');
      const depth = p * (i ? 12 : 65), w = i ? 150 : 55;
      rect(ctx, 285 - w / 2, 278, w, depth + 10, '#a2c5dd');
      D.emoji(ctx, '🐻', 285, 210 + depth, 85);
      rect(ctx, 285 - w / 2, 270 + depth, w, 12, '#805b35');
      text(ctx, '重量始终相同', 285, 130, 22);
      text(ctx, '相对压强', 665, 150, 21);
      rect(ctx, 600, 180, (i ? 30 : 120) * p, 36, '#ff8a3d');
      text(ctx, i ? '3' : '12', 660, 255, 32);
    },
  });

  register({
    id: 'splitarray', subject: 'math', level: 3, emoji: '🔢', title: '拆开乘法的秘密',
    desc: '把同一个方阵从不同位置拆开，亲眼验证分配律',
    intro: '一块积木板有三行，每行八块。把每行拆成二加六，或者五加三，积木总数会变吗？先猜，再看积木变成两种颜色。用两组算式证明：拆开计算也能得到同一个总数。',
    variable: '拆分位置', fixed: '都是 3 行，每行 8 块', conditions: ['每行拆成 2 + 6', '每行拆成 5 + 3'],
    measure: '两块面积与总数', results: ['3×2 + 3×6 = 6 + 18 = 24', '3×5 + 3×3 = 15 + 9 = 24'],
    conclusions: ['拆分位置变了，总数不变', '拆成两块，总数就翻倍'],
    explain: '没有增加或拿走积木，3×(a+b) = 3×a + 3×b。',
    fact: '乘法分配律让我们把一个乘法拆成更好算的两个乘法。这里每一行的八块都被分到左右两边，一块也不重复，一块也不遗漏，所以两部分加起来仍然是二十四块。',
    quiz: [
      { q: '3×(2+6) 等于哪一个？', options: ['3×2+3×6', '3×2+6'], answer: 0, explain: '左右两部分都有三行，因此两部分都要乘三。' },
      { q: '把 4×9 看成 4×(10−1)，应该怎样算？', options: ['40−1', '40−4'], answer: 1, explain: '每行少一块，四行一共少四块，所以四十减四等于三十六。' },
    ],
    draw(ctx, i, p) {
      const n = i ? 5 : 2;
      for (let y = 0; y < 3; y++) for (let x = 0; x < 8; x++) rect(ctx, 135 + x * 60 + (x >= n ? p * 25 : 0), 125 + y * 60, 54, 54, x < n ? '#ff9a53' : '#4b99ed');
      text(ctx, '3 × ' + n + '  +  3 × ' + (8 - n) + '  =  24', 400, 355, 28);
    },
  });

  register({
    id: 'inkdiffusion', subject: 'chemistry', level: 2, emoji: '💧', title: '颜色为什么自己散开',
    desc: '不搅拌，比较冷水和温水中的颜色扩散',
    intro: '同样一滴色素落进水里，不搅拌，颜色也会慢慢散开。这次只改变水温，比较相同时间后颜色散开的范围。现实中水流也会带着色素走，这里先用简化的静水模型观察扩散。',
    variable: '水温', fixed: '水量、色素量和观察时间相同，不搅拌', conditions: ['冷水', '温水'],
    measure: '同一时刻的散开范围', results: ['散开范围较小，颜色较集中', '散开范围较大，颜色较分散'],
    conclusions: ['温水中颜色扩散较快', '颜色散开后就消失了'],
    explain: '同量的色素分散到更大范围，并没有消失。',
    fact: '物质的微小粒子在不停运动，扩散会让原本集中的粒子逐渐分散。在其他条件相同时，升温通常会加快液体中的扩散。真实的一杯水还可能有对流，不能把所有颜色流动都当成纯扩散。',
    quiz: [
      { q: '为了公平比较，应该只改变什么？', options: ['水温', '水温和色素量都变'], answer: 0, explain: '只改变水温，保持其他条件相同，才方便判断水温的影响。' },
      { q: '颜色变淡了，色素到哪里去了？', options: ['全部消失', '分散到更多水中'], answer: 1, explain: '色素粒子仍在水中，只是分散得更开。' },
    ],
    draw(ctx, i, p) {
      rect(ctx, 210, 110, 380, 270, '#d6ecff');
      ctx.strokeStyle = '#426789'; ctx.lineWidth = 4; ctx.strokeRect(210, 110, 380, 270);
      const spread = 10 + Math.sqrt(p) * (i ? 125 : 45);
      for (let k = 0; k < 90; k++) {
        const a = k * 2.39996, r = Math.sqrt((k + 1) / 90) * spread;
        D.circle(ctx, 400 + Math.cos(a) * r, 245 + Math.sin(a) * r, 3, '#9b4bd2');
      }
      text(ctx, '色素粒子数相同 · 动画加速', 400, 395, 18);
    },
  });

  register({
    id: 'pollentrip', subject: 'biology', level: 2, emoji: '🌸', title: '花粉的旅行',
    desc: '让蜜蜂把花粉带到另一朵花，观察授粉机会',
    intro: '果园里的两朵花属于同一种依靠昆虫授粉的果树。一只蜜蜂先访问一朵花，再访问另一朵花，会带去什么？比较有蜜蜂和没有蜜蜂的情况，跟着花粉从花药到柱头走一遍。',
    variable: '蜜蜂是否来访', fixed: '同种果树、花的状态相同，无其他传粉者', conditions: ['没有蜜蜂来访', '蜜蜂先后访问两朵花'],
    measure: '第二朵花的柱头是否收到花粉', results: ['柱头没有收到花粉', '花粉从花药被带到柱头'],
    conclusions: ['蜜蜂能帮助花粉到达柱头', '蜜蜂把花瓣变成果实'],
    explain: '这是授粉；随后还需要受精和适宜条件，才可能形成果实和种子。',
    fact: '花药产生花粉，柱头接收花粉。蜜蜂采集花蜜和花粉时，能帮助同种植物传粉。授粉不等于立刻结果；不同植物的传粉方式也不同，有些主要依靠风。',
    quiz: [
      { q: '花粉要被送到哪里？', options: ['柱头', '叶片'], answer: 0, explain: '从花药到柱头的花粉传递叫授粉。' },
      { q: '柱头收到花粉，就一定马上长出果实吗？', options: ['是的', '不是，还需要后续过程和条件'], answer: 1, explain: '授粉后还需要受精，以及适宜的生长条件，才可能形成果实和种子。' },
    ],
    draw(ctx, i, p) {
      [220, 580].forEach(x => { rect(ctx, x - 4, 250, 8, 125, '#42a35a'); D.emoji(ctx, '🌸', x, 220, 95); });
      text(ctx, '花药产生花粉', 220, 130, 20); text(ctx, '柱头接收花粉', 580, 130, 20);
      const x = 220 + Math.max(0, p - 0.2) / 0.8 * 360;
      if (i) { D.emoji(ctx, '🐝', x, 185, 50); for (let k = 0; k < 8; k++) D.circle(ctx, x - 12 + k * 4, 210, 3, '#c58b00'); }
      if (i && p > 0.95) for (let k = 0; k < 10; k++) D.circle(ctx, 565 + k * 3, 220, 3, '#c58b00');
      text(ctx, i && p === 1 ? '收到花粉，后续才可能结出果实' : '观察花粉有没有跨过两朵花', 400, 395, 21);
    },
  });

  register({
    id: 'telescopeLight', subject: 'astronomy', level: 4, emoji: '🔭', title: '望远镜的大眼睛',
    desc: '同样的放大倍数，比较不同口径接到的星光',
    intro: '望远镜不是只看放大倍数。让两台望远镜看同一颗暗星，放大倍数和观察时间都相同，只把镜片直径变为两倍。先猜一猜：接到的星光是两倍，还是四倍？',
    variable: '镜片直径', fixed: '同一颗星、相同放大倍数和观察时间', conditions: ['小口径：直径 1 份', '大口径：直径 2 份'],
    measure: '相对集光量', results: ['镜片面积 1 份，集光量 1 份', '镜片面积 4 份，集光量 4 份'],
    conclusions: ['直径两倍，集光量约四倍', '直径两倍，集光量约两倍'],
    explain: '集光量取决于镜片面积；圆的面积与直径的平方成正比。',
    fact: '在光学效率等其他条件相同时，望远镜接到的光与有效集光面积成正比。直径增为两倍，面积是四倍。图中只比较集光，不把更亮等同于更大的放大倍数，也不模拟空气扰动等影响。',
    quiz: [
      { q: '本实验两台望远镜的放大倍数怎样？', options: ['相同', '大口径一定更大'], answer: 0, explain: '为了比较集光能力，这里保持放大倍数相同。' },
      { q: '其他条件相同，镜片直径三倍，面积约几倍？', options: ['三倍', '九倍'], answer: 1, explain: '圆面积和直径的平方成正比，三的平方是九。' },
    ],
    draw(ctx, i, p) {
      rect(ctx, 60, 105, 680, 285, '#141a37');
      D.circle(ctx, 235, 240, i ? 88 : 44, '#2b3c6f', '#a8c8ff', 4);
      for (let k = 0; k < (i ? 40 : 10) * p; k++) { const a = k * 2.4, r = Math.sqrt((k + 1) / (i ? 40 : 10)) * (i ? 80 : 38); D.circle(ctx, 235 + Math.cos(a) * r, 240 + Math.sin(a) * r, 3, '#fff1a8'); }
      D.circle(ctx, 570, 240, 10, 'rgba(255,245,160,' + (0.15 + p * (i ? 0.85 : 0.22)) + ')');
      text(ctx, '镜片接收到的星光', 235, 360, 20, '#fff'); text(ctx, '同一颗暗星', 570, 360, 20, '#fff');
    },
  });

  register({
    id: 'soilwater', subject: 'geography', level: 3, emoji: '🌧️', title: '雨水去了哪里',
    desc: '相同雨量落在砂土和黏土上，比较渗入与积水',
    intro: '同样一场雨，为什么有些地面容易积水？拿相同厚度的干燥砂土和黏土，各倒入一百毫升水，观察同样长的时间。看看哪些水渗到了下面，哪些暂时留在地面。',
    variable: '土壤种类', fixed: '土层厚度、起始含水情况和倒水量相同', conditions: ['砂土', '黏土'],
    measure: '模拟观察期末的水量（毫升）', results: ['渗入 90，地面留下 10', '渗入 24，地面留下 76'],
    conclusions: ['这个模型里砂土渗水更快', '地面的水少了就一定蒸发了'],
    explain: '在这段观察时间内，砂土中更多水向下渗入。',
    fact: '土壤颗粒和孔隙影响渗水。砂土常有较大的连通孔隙，水较容易通过；黏土细小的孔隙使水流通过较慢。真实渗水还受压实程度、原有含水量等影响，不能只凭土壤名称预测所有地方。',
    quiz: [
      { q: '两种土都应该倒多少水？', options: ['相同的量', '砂土更多一些'], answer: 0, explain: '倒水量必须相同，才是在比较土壤的差别。' },
      { q: '地面水少了，可能是因为什么？', options: ['水变没了', '水渗到了土层下面'], answer: 1, explain: '水向下渗入，不代表水消失或全部蒸发。' },
    ],
    draw(ctx, i, p) {
      rect(ctx, 220, 190, 280, 130, i ? '#b88e72' : '#e4c48e');
      for (let k = 0; k < 45; k++) D.circle(ctx, 230 + k * 37 % 255, 200 + k * 29 % 110, i ? 2 : 5, '#946b41');
      const down = (i ? 24 : 90) * p;
      rect(ctx, 220, 190 - (100 - down) * 0.6, 280, (100 - down) * 0.6, '#83c5f3');
      rect(ctx, 220, 370 - down * 0.4, 280, down * 0.4, '#339ee3');
      text(ctx, '地面留下 ' + Math.round(100 - down) + ' mL', 650, 160, 21);
      text(ctx, '向下渗入 ' + Math.round(down) + ' mL', 650, 330, 21);
    },
  });

  register({
    id: 'foldpaper', subject: 'engineering', level: 2, emoji: '📄', title: '一张纸的承重挑战',
    desc: '同样的纸和跨度，比较平纸与手风琴折纸的承重',
    intro: '同一张纸，不加厚，只改变折叠形状，能托住更多积木吗？把平纸和手风琴形折纸搭在相同跨度上，逐步加上同样的六块积木，观察纸桥是否弯下去。',
    variable: '纸的折叠形状', fixed: '纸张、支撑跨度和积木重量相同', conditions: ['平放的纸', '手风琴形折纸'],
    measure: '放上 6 块积木后的状态', results: ['明显弯折，积木掉下', '仍能托住 6 块积木'],
    conclusions: ['折叠形状改变了结构的抗弯能力', '折叠凭空增加了纸的材料'],
    explain: '材料没有增加，结构变了；现实的承重还取决于折痕和跨度。',
    fact: '手风琴形折叠让纸在高度方向形成有深度的结构，通常比同跨度的平纸更抗弯。结构设计能改善材料的使用效果；具体承重需要实际试验，动画中的六块并不是任何纸都适用的标准。',
    quiz: [
      { q: '实验中增加纸张厚度了吗？', options: ['没有，改变了形状', '增加了一层纸'], answer: 0, explain: '用的是同一张纸，通过折叠改变结构。' },
      { q: '换一张更薄的纸后，能保证也托住六块吗？', options: ['能保证', '不能，需要重新测试'], answer: 1, explain: '纸张和跨度都会影响承重，不能把模型数值当成通用标准。' },
    ],
    draw(ctx, i, p) {
      rect(ctx, 110, 280, 110, 110, '#a3907b'); rect(ctx, 580, 280, 110, 110, '#a3907b');
      const n = Math.floor(6 * p), bend = !i && n > 2 ? (p - 0.33) * 115 : 0;
      ctx.strokeStyle = '#73513a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(165, 275);
      if (i) for (let k = 1; k <= 18; k++) ctx.lineTo(165 + k * 26, 275 + (k % 2 ? -24 : 0));
      else ctx.quadraticCurveTo(400, 275 + bend * 2, 635, 275);
      ctx.stroke();
      for (let k = 0; k < n; k++) rect(ctx, 330 + k % 3 * 48, 240 - Math.floor(k / 3) * 36 + bend, 42, 32, '#4c93de');
      text(ctx, '逐步加载：' + n + ' / 6 块', 400, 120, 24);
    },
  });

  register({
    id: 'filterboth', subject: 'coding', level: 3, emoji: '🤖', title: '同时满足还是满足一个',
    desc: '用“而且”和“或者”筛选同一批图形，解释结果差别',
    intro: '机器人要找红色、圆形的图案。“红色而且圆形”和“红色或者圆形”，找到的会一样吗？保持六张图卡不变，只改变两个条件的连接方式。观察哪些卡片被选中，再解释原因。',
    variable: '条件连接方式', fixed: '六张图卡和两个判断条件相同', conditions: ['红色 而且 圆形', '红色 或者 圆形'],
    measure: '被选中的卡片数', results: ['选中 2 张：必须两个条件都满足', '选中 5 张：满足至少一个条件'],
    conclusions: ['而且要同时满足，或者满足至少一个', '而且和或者永远选中同样的图卡'],
    explain: '“或者”也包含两个条件都满足的卡片，不是只能满足其中一个。',
    fact: '组合条件可以控制程序怎样筛选数据。逻辑与要求两个条件都为真；逻辑或只要至少一个为真。对于本实验，“而且”筛出的卡片都在“或者”的结果里。',
    quiz: [
      { q: '一张红色方卡符合“红色或者圆形”吗？', options: ['符合', '不符合'], answer: 0, explain: '它符合红色这一个条件，就满足逻辑或。' },
      { q: '一张红色圆卡符合“红色或者圆形”吗？', options: ['不符合，因为满足了两个', '符合，满足至少一个就行'], answer: 1, explain: '逻辑或包含两个条件同时满足的情况。' },
    ],
    draw(ctx, i, p) {
      const cards = [[1,1],[1,0],[0,1],[1,1],[0,0],[0,1]];
      cards.forEach(([red, round], k) => {
        const x = 150 + k % 3 * 240, y = 170 + Math.floor(k / 3) * 150;
        const selected = i ? red || round : red && round;
        const color = red ? '#e34343' : '#397ed2';
        if (round) D.circle(ctx, x, y, 35, color); else rect(ctx, x - 35, y - 35, 70, 70, color);
        if (selected && p >= (k + 1) / 6) { ctx.strokeStyle = '#258f47'; ctx.lineWidth = 4; ctx.strokeRect(x - 55, y - 55, 110, 110); }
      });
    },
  });

  register({
    id: 'pixelzoom', subject: 'infotech', level: 2, emoji: '💻', title: '图片放大的方格',
    desc: '同样大的画面，比较粗像素与细像素如何表现轮廓',
    intro: '把小图片放大时，为什么边缘像台阶？我们用两种像素格表示同一个圆，并放到同样大的画框里。先比较四乘四，再比较十六乘十六，看看哪一种更容易描述弯曲的轮廓。',
    variable: '采样格数', fixed: '同一个圆形、同样大的显示画框', conditions: ['4 × 4 个像素', '16 × 16 个像素'],
    measure: '使用的像素数与轮廓', results: ['16 个像素，边缘台阶较大', '256 个像素，边缘台阶较小'],
    conclusions: ['同尺寸下更多像素能描述更细的轮廓', '只放大旧像素就能还原所有细节'],
    explain: '增加真实采样能保留更多细节；把原来的方格拉大不会凭空增加原图信息。',
    fact: '数字图片用像素记录颜色。这里保持画框大小相同，提高对同一个圆的采样密度，轮廓通常更细致。单纯放大已有像素并不能恢复没有记录下来的细节，图片质量也不只由像素数决定。',
    quiz: [
      { q: '16×16 的图像有多少个像素？', options: ['32', '256'], answer: 1, explain: '十六行，每行十六个，一共二百五十六个像素。' },
      { q: '把四乘四的旧像素拉得更大，能自动恢复拍摄时没记录的细节吗？', options: ['能', '不能'], answer: 1, explain: '拉大已有像素没有增加原始采样信息。' },
    ],
    draw(ctx, i, p) {
      const n = i ? 16 : 4, size = 260 / n;
      rect(ctx, 270, 110, 260, 260, '#fff');
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        if ((y * n + x + 1) / (n * n) > p) continue;
        const inside = Math.hypot((x + 0.5) / n - 0.5, (y + 0.5) / n - 0.5) < 0.43;
        rect(ctx, 270 + x * size, 110 + y * size, size - 0.5, size - 0.5, inside ? '#db553b' : '#edf0f5');
      }
      text(ctx, n * n + ' 个像素', 650, 220, 25); text(ctx, '同一显示大小', 650, 260, 18);
    },
  });

  register({
    id: 'portionplan', subject: 'health', level: 2, emoji: '🍚', title: '少量多次不浪费',
    desc: '让同样饥饿的小熊吃饱，比较一次盛多和少量添饭',
    intro: '食堂的小熊这次能吃下一百六十克示意食物。一次盛二百四十克，和先盛一百二十克、不够再添，会留下多少？两次都让小熊吃饱，比较盛饭策略，而不是让谁少吃。',
    variable: '盛饭策略', fixed: '小熊这次的食量相同，吃饱才结束', conditions: ['一次盛 240 克', '先盛 120 克，不够再添'],
    measure: '吃下与剩余的示意食物量', results: ['吃下 160 克，剩余 80 克', '添 40 克后吃下 160 克，剩余 0 克'],
    conclusions: ['少量盛饭、按需添饭能减少剩余', '不浪费就是忍着不吃饱'],
    explain: '两种方式都吃下相同的量，按需添饭减少了不必要的剩余。',
    fact: '光盘行动鼓励按需取餐，不是为了不剩饭而强迫少吃或硬撑。本实验食量只是角色设定，不是给儿童的食量建议。现实中每个人、每次的需要都不同，不够可以继续添。',
    quiz: [
      { q: '少量盛饭后还没吃饱，应该怎么办？', options: ['按需要再添', '为了光盘一直饿着'], answer: 0, explain: '按需添饭既能吃饱，也能减少食物浪费。' },
      { q: '本实验哪一个条件没有改变？', options: ['小熊吃下的量', '剩下的量'], answer: 0, explain: '两次都吃下了一百六十克示意食物，改变的是取餐方法和剩余量。' },
    ],
    draw(ctx, i, p) {
      D.circle(ctx, 320, 245, 115, '#fff', '#9db1c1', 5);
      const served = i ? 120 + 40 * Math.min(1, p * 2) : 240;
      const eaten = 160 * p, left = Math.max(0, served - eaten);
      for (let k = 0; k < Math.ceil(left / 8); k++) D.circle(ctx, 270 + k % 6 * 18, 210 + Math.floor(k / 6) * 18, 6, '#dabf72');
      D.emoji(ctx, '🐻', 620, 200, 85);
      text(ctx, '已吃下 ' + Math.round(eaten) + ' 克', 620, 280, 23);
      text(ctx, '盘中剩余 ' + Math.round(left) + ' 克', 320, 385, 21);
    },
  });
})();
