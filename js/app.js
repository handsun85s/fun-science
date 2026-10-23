/* 趣味科学乐园 —— 页面：首页 / 科目页 / 课程页 */
(function () {
  'use strict';

  const el = Sci.h;
  const app = document.getElementById('app');
  let disposeCurrent = null;

  const subjectById = id => Sci.subjects.find(s => s.id === id);
  const lessonById = id => Sci.lessons.find(l => l.id === id);
  const subjectIndex = id => Sci.subjects.findIndex(s => s.id === id);
  const lessonsOf = sid => Sci.lessons.filter(l => l.subject === sid).sort((a, b) => a.level - b.level);
  /* 由浅入深的整体路线：先把各科的“入门”玩一遍，再“进阶”，最后“挑战” */
  const learningPath = () => Sci.lessons.slice().sort((a, b) => a.level - b.level || subjectIndex(a.subject) - subjectIndex(b.subject));

  /* 称号按拿到的星星占总数的比例来定，以后加课也不用改 */
  const RANKS = [
    [0, '🌱', '科学小苗苗'],
    [0.08, '🔍', '科学小侦探'],
    [0.25, '🧪', '小小实验家'],
    [0.45, '🎓', '科学小博士'],
    [0.7, '🚀', '大科学家'],
    [0.92, '👑', '全能科学家'],
  ];
  const rankOf = n => {
    const ratio = n / Math.max(1, Sci.lessons.length * 3);
    return RANKS.filter(r => ratio >= r[0]).pop();
  };

  function starsEl(n, max = 3) {
    const s = el('span', { class: 'stars', title: `${n} / ${max} 颗星` });
    for (let i = 0; i < max; i++) s.append(el('span', { class: i < n ? 'on' : '' }, '★'));
    return s;
  }
  function levelEl(level) {
    return el('span', { class: 'lvl l' + level }, '⭐'.repeat(level) + ' ' + Sci.levels[level], el('small', null, Sci.ages[level]));
  }
  /* 朗读按钮一直显示；浏览器不支持朗读时，点了会提示原因 */
  function speakBtn(text, label = '🔊 读给我听') {
    return el('button', { class: 'btn small ghost', type: 'button', onclick: () => Sci.speak(text, { manual: true }) }, label);
  }
  function updateTopbar() {
    document.getElementById('starTotal').textContent = '⭐ ' + Sci.progress.total();
    document.getElementById('muteBtn').textContent = Sci.muted ? '🔇' : '🔊';
  }

  /* ---------------- 路由 ----------------
     发布成网页链接后页面跑在受限的框架里，地址栏的 # 不一定能用，
     所以当前页面记在 current 里，点链接时由我们自己切换。 */
  let current = location.hash;
  function go(hash) {
    current = hash;
    try { if (location.hash !== hash) history.pushState(null, '', hash); } catch (e) { /* 框架里不允许也没关系 */ }
    route();
  }
  function route() {
    if (disposeCurrent) { disposeCurrent(); disposeCurrent = null; }
    Sci.stopSpeak();
    const [kind, id] = current.replace(/^#\/?/, '').split('/');
    app.replaceChildren();
    document.body.style.removeProperty('--c');
    if (kind === 'subject' && subjectById(id)) renderSubject(subjectById(id));
    else if (kind === 'lesson' && lessonById(id)) renderLesson(lessonById(id));
    else renderHome();
    updateTopbar();
    window.scrollTo(0, 0);
  }

  /* ---------------- 首页 ---------------- */
  function renderHome() {
    document.title = '趣味科学乐园';
    const total = Sci.progress.total();
    const max = Sci.lessons.length * 3;
    const r = rankOf(total);
    const next = learningPath().find(l => Sci.progress.stars(l.id) < 3);
    const greet = Sci.greeting;

    const hero = el('section', { class: 'hero' },
      el('div', { class: 'hero-owl' }, '🦉'),
      el('div', null,
        el('h1', null, '欢迎来到趣味科学乐园！'),
        el('p', null, greet),
        el('div', { class: 'hero-row' },
          el('span', { class: 'rank' }, `${r[1]} ${r[2]}`, el('span', null, `· ⭐ ${total} / ${max}`)),
          speakBtn(greet))));

    let nextCard;
    if (next) {
      const s = subjectById(next.subject);
      nextCard = el('a', { class: 'next-card', href: '#/lesson/' + next.id, style: { '--c': s.color } },
        el('span', { class: 'e' }, next.emoji),
        el('div', null, el('small', null, `推荐下一课 · ${s.name} · ${Sci.levels[next.level]}`), el('b', null, next.title)),
        el('span', { class: 'go' }, '出发 →'));
    } else {
      nextCard = el('div', { class: 'next-card done' }, '👑 太厉害了！你已经拿到了所有的星星！');
    }

    const grid = el('div', { class: 'subject-grid' }, Sci.subjects.map(s => {
      const ls = lessonsOf(s.id);
      const got = ls.reduce((n, l) => n + Sci.progress.stars(l.id), 0);
      const all = ls.length * 3;
      return el('a', { class: 'subject-card', href: '#/subject/' + s.id, style: { '--c': s.color } },
        el('span', { class: 'bg-emoji' }, s.emoji),
        el('div', { class: 'emoji' }, s.emoji),
        el('h3', null, s.name),
        el('p', null, s.desc),
        el('div', { class: 'bar' }, el('i', { style: { width: (all ? got / all * 100 : 0) + '%' } })),
        el('div', { class: 'bar-label' }, `⭐ ${got} / ${all} · ${ls.length} 个实验`));
    }));

    const routeBox = el('div', { class: 'route' }, Object.keys(Sci.levels).map(Number).map(level =>
      el('div', { class: 'route-row' },
        levelEl(level),
        learningPath().filter(l => l.level === level).map(l =>
          el('a', { class: 'route-chip', href: '#/lesson/' + l.id, style: { '--c': subjectById(l.subject).color } },
            l.emoji + ' ' + l.title, starsEl(Sci.progress.stars(l.id)))))));

    app.append(
      hero,
      nextCard,
      el('h2', { class: 'section-title' }, '🚀 选一个科目开始探险吧'),
      grid,
      el('h2', { class: 'section-title' }, '🗺️ 由浅入深的学习路线'),
      routeBox,
      el('p', { class: 'foot' }, '给家长：适合 7～12 岁（小学二年级到六年级），每一级都标了推荐年龄，可以按孩子的情况跳着玩。建议陪孩子一起玩、一起聊。学习进度只保存在这台设备的浏览器里。'));
  }

  /* ---------------- 科目页 ---------------- */
  function renderSubject(s) {
    document.title = s.name + ' · 趣味科学乐园';
    document.body.style.setProperty('--c', s.color);
    const ls = lessonsOf(s.id);
    app.append(
      el('nav', { class: 'crumbs' }, el('a', { href: '#/' }, '🏠 首页'), ' › ', s.name),
      el('header', { class: 'subject-head' },
        el('span', { class: 'emoji' }, s.emoji),
        el('div', null, el('h1', null, s.name), el('p', null, s.desc + ' · 从上往下，一关比一关难一点哦！'))),
      el('div', { class: 'path' }, ls.map(l =>
        el('a', { class: 'lesson-card', href: '#/lesson/' + l.id },
          el('span', { class: 'num' }, l.emoji),
          el('div', null, levelEl(l.level), el('h3', null, l.title), el('p', null, l.desc)),
          starsEl(Sci.progress.stars(l.id))))));
  }

  /* ---------------- 课程页 ---------------- */
  function renderLesson(l) {
    const s = subjectById(l.subject);
    document.title = l.title + ' · 趣味科学乐园';
    document.body.style.setProperty('--c', s.color);
    const list = lessonsOf(l.subject);
    const idx = list.indexOf(l);

    const headStars = el('span', null, starsEl(Sci.progress.stars(l.id)));
    const refreshStars = () => {
      headStars.replaceChildren(starsEl(Sci.progress.stars(l.id)));
      updateTopbar();
    };

    // 任务
    const goalState = el('span', { class: 'goal-state' });
    const goalBox = el('section', { class: 'goal' }, el('span', null, '🎯'), el('span', null, '任务：' + l.goal), goalState);
    const setGoalUI = done => {
      goalBox.classList.toggle('done', done);
      goalState.textContent = done ? '✅ 完成啦！+1 ⭐' : '还没完成';
    };
    setGoalUI(Sci.progress.of(l.id).goal);

    // 知识点：完成任务后揭晓，也可以先偷看
    const factBody = el('div', { class: 'fact-body', html: l.fact, hidden: true });
    const factSpeak = el('span', { hidden: true }, speakBtn(factBody.textContent));
    const factLock = el('div', { class: 'fact-lock' }, '🔒 先完成上面的任务，答案就会揭晓！',
      el('button', { class: 'btn small ghost', type: 'button', onclick: () => unlockFact() }, '👀 先偷看一下'));
    const unlockFact = () => { factBody.hidden = false; factSpeak.hidden = false; factLock.hidden = true; };
    if (Sci.progress.of(l.id).goal) unlockFact();
    const factBox = el('section', { class: 'fact' }, el('h2', null, '💡 你发现了吗？', factSpeak), factLock, factBody);

    // 实验舞台
    const stageHost = el('div', { class: 'stage-host' });
    const note = el('div', { class: 'note', 'aria-live': 'polite' }, '👆 动手试一试吧！');
    const controls = el('div', { class: 'controls' });
    let goalSent = false;
    const onGoal = () => {
      if (goalSent) return;
      goalSent = true;
      const was = Sci.progress.of(l.id).goal;
      Sci.progress.update(l.id, p => { p.goal = true; });
      setGoalUI(true);
      unlockFact();
      if (!was) {
        Sci.sfx('star');
        Sci.celebrate();
        Sci.toast('🎯 任务完成！获得 1 颗星 ⭐');
      } else {
        Sci.sfx('good');
      }
      refreshStars();
    };
    const api = makeApi(stageHost, controls, note, onGoal);

    // 上一课 / 下一课
    const prev = list[idx - 1], next = list[idx + 1];
    const nav = el('nav', { class: 'lesson-nav' },
      prev ? el('a', { class: 'btn ghost', href: '#/lesson/' + prev.id }, '← ' + prev.title)
        : el('a', { class: 'btn ghost', href: '#/subject/' + s.id }, '← 回到' + s.name),
      next ? el('a', { class: 'btn', href: '#/lesson/' + next.id }, '下一课：' + next.title + ' →')
        : el('a', { class: 'btn', href: '#/' }, '🏠 回首页，换个科目玩 →'));

    app.append(
      el('nav', { class: 'crumbs' }, el('a', { href: '#/' }, '🏠 首页'), ' › ', el('a', { href: '#/subject/' + s.id }, s.name), ' › ', l.title),
      el('header', { class: 'lesson-head' },
        el('span', { class: 'big' }, l.emoji),
        el('div', null, levelEl(l.level), el('h1', null, l.title)),
        headStars),
      el('section', { class: 'owl' },
        el('div', { class: 'owl-face' }, '🦉'),
        el('div', { class: 'bubble' }, el('p', null, l.intro), speakBtn(l.intro))),
      goalBox,
      el('section', { class: 'stage-card' }, stageHost, note, controls),
      factBox,
      quizSection(l, refreshStars),
      nav);

    try {
      l.mount(api);
    } catch (e) {
      console.error(e);
      note.textContent = '哎呀，这个实验出了点小问题，请刷新页面再试试。';
    }
    disposeCurrent = () => api.dispose();
  }

  /* 课程实验可以用的工具箱 */
  function makeApi(stageHost, controls, noteEl, onGoal) {
    const disposers = [];
    const api = {
      host: stageHost,
      /* 创建一块画布，逻辑尺寸固定（默认 800×450），显示时自动缩放 */
      stage(w = 800, h = 450) {
        const cv = el('canvas', { class: 'stage' });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = w * dpr;
        cv.height = h * dpr;
        const ctx = cv.getContext('2d');
        ctx.scale(dpr, dpr);
        stageHost.append(cv);
        return {
          cv, ctx, w, h,
          pos(e) {
            const r = cv.getBoundingClientRect();
            return { x: (e.clientX - r.left) * w / r.width, y: (e.clientY - r.top) * h / r.height };
          },
        };
      },
      /* 鼠标/手指：down(p) move(p, 按着吗) up(p) */
      pointer(st, hd) {
        let active = false;
        if (!window.PointerEvent) {
          // 老 iPad（iOS 12 及更早）没有指针事件，用触摸 + 鼠标事件代替
          const start = p => { active = true; if (hd.down) hd.down(st.pos(p), p); };
          const moveTo = p => { if (hd.move) hd.move(st.pos(p), active, p); };
          const end = p => { if (!active) return; active = false; if (hd.up) hd.up(st.pos(p), p); };
          const opt = { passive: false };
          api.on(st.cv, 'touchstart', e => { e.preventDefault(); start(e.changedTouches[0]); }, opt);
          api.on(st.cv, 'touchmove', e => { e.preventDefault(); moveTo(e.changedTouches[0]); }, opt);
          api.on(st.cv, 'touchend', e => { e.preventDefault(); end(e.changedTouches[0]); }, opt);
          api.on(st.cv, 'touchcancel', e => end(e.changedTouches[0]));
          api.on(st.cv, 'mousedown', e => { e.preventDefault(); start(e); });
          api.on(window, 'mousemove', e => { if (active) moveTo(e); });
          api.on(st.cv, 'mousemove', e => { if (!active) moveTo(e); });
          api.on(window, 'mouseup', end);
          return;
        }
        api.on(st.cv, 'pointerdown', e => {
          active = true;
          try { st.cv.setPointerCapture(e.pointerId); } catch (_) { /* 忽略 */ }
          e.preventDefault();
          if (hd.down) hd.down(st.pos(e), e);
        });
        api.on(st.cv, 'pointermove', e => { if (hd.move) hd.move(st.pos(e), active, e); });
        const up = e => {
          if (!active) return;
          active = false;
          if (hd.up) hd.up(st.pos(e), e);
        };
        api.on(st.cv, 'pointerup', up);
        api.on(st.cv, 'pointercancel', up);
      },
      /* 动画循环：fn(dt 秒, 当前时间 秒) */
      loop(fn) {
        let last = performance.now(), id = 0, alive = true;
        const step = now => {
          if (!alive) return;
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          fn(dt, now / 1000);
          id = requestAnimationFrame(step);
        };
        id = requestAnimationFrame(step);
        disposers.push(() => { alive = false; cancelAnimationFrame(id); });
      },
      on(target, type, fn, opts) {
        target.addEventListener(type, fn, opts);
        disposers.push(() => target.removeEventListener(type, fn, opts));
      },
      timeout(fn, ms) {
        const id = setTimeout(fn, ms);
        disposers.push(() => clearTimeout(id));
        return id;
      },
      /* 控件：都放在实验下方，可以用 row() 分行 */
      row() {
        const r = el('div', { class: 'row' });
        controls.append(r);
        return r;
      },
      button(label, onClick, parent) {
        const b = el('button', { class: 'btn', type: 'button' }, label);
        b.addEventListener('click', () => { Sci.sfx('click'); onClick(b); });
        (parent || api.defaultRow()).append(b);
        return b;
      },
      toggle(label, value, onChange, parent) {
        const b = el('button', { class: 'chip' + (value ? ' on' : ''), type: 'button', 'aria-pressed': String(!!value) }, label);
        const set = v => {
          value = v;
          b.classList.toggle('on', v);
          b.setAttribute('aria-pressed', String(v));
        };
        b.addEventListener('click', () => { set(!value); Sci.sfx('click'); onChange(value); });
        (parent || api.defaultRow()).append(b);
        return { el: b, set };
      },
      /* 单选按钮组：options = [[值, 文字], ...] */
      choice(options, value, onChange, parent) {
        const box = el('div', { class: 'seg', role: 'group' });
        const btns = options.map(([v, label]) => {
          const b = el('button', { class: 'chip' + (v === value ? ' on' : ''), type: 'button' }, label);
          b.addEventListener('click', () => { set(v); Sci.sfx('click'); onChange(v); });
          box.append(b);
          return [v, b];
        });
        const set = v => { value = v; btns.forEach(([bv, b]) => b.classList.toggle('on', bv === v)); };
        (parent || api.defaultRow()).append(box);
        return { el: box, set };
      },
      slider(label, min, max, step, value, onInput, fmt, parent) {
        const show = v => (fmt ? fmt(v) : String(v));
        const out = el('b', null, show(value));
        const input = el('input', { type: 'range', min, max, step, value, 'aria-label': label });
        input.addEventListener('input', () => {
          const v = parseFloat(input.value);
          out.textContent = show(v);
          onInput(v);
        });
        const box = el('label', { class: 'slider' }, el('span', null, label), input, out);
        (parent || api.defaultRow()).append(box);
        return {
          el: box,
          set(v) { input.value = v; out.textContent = show(v); },
          setMax(m) { input.max = m; },
        };
      },
      defaultRow() {
        if (!api._row) api._row = api.row();
        return api._row;
      },
      note(text) {
        noteEl.textContent = text;
        noteEl.classList.remove('flash');
        void noteEl.offsetWidth;
        noteEl.classList.add('flash');
      },
      say: (text, opt) => Sci.speak(text, opt),
      sfx: Sci.sfx,
      goalDone: onGoal,
      dispose() {
        disposers.splice(0).forEach(f => { try { f(); } catch (e) { /* 忽略 */ } });
      },
    };
    return api;
  }

  /* 小考验 */
  function quizSection(l, onStar) {
    const box = el('section', { class: 'quiz' },
      el('h2', null, '🧠 小考验'),
      el('p', { class: 'hint' }, '第一次就答对，每题可以得到一颗星哦！'));
    l.quiz.forEach((q, qi) => {
      let tried = false, solved = false;
      const explain = el('div', { class: 'q-explain', hidden: true });
      const opts = el('div', { class: 'opts' });
      q.options.forEach((o, oi) => {
        const b = el('button', { class: 'opt', type: 'button' }, o);
        b.addEventListener('click', () => {
          if (solved) return;
          if (oi === q.answer) {
            solved = true;
            b.classList.add('right');
            explain.hidden = false;
            explain.classList.remove('try');
            explain.textContent = '✅ 答对啦！' + (q.explain || '');
            const had = Sci.progress.of(l.id).quiz[qi];
            if (!tried && !had) {
              Sci.progress.update(l.id, p => { p.quiz[qi] = true; });
              const r = b.getBoundingClientRect();
              Sci.sfx('star');
              Sci.celebrate(r.left + r.width / 2, r.top, 12);
              Sci.toast('答对了！获得 1 颗星 ⭐');
              onStar();
            } else {
              Sci.sfx('good');
            }
          } else {
            tried = true;
            b.classList.remove('wrong');
            void b.offsetWidth;
            b.classList.add('wrong');
            Sci.sfx('bad');
            explain.hidden = false;
            explain.classList.add('try');
            explain.textContent = '🤔 不对哦，再想一想～';
          }
        });
        opts.append(b);
      });
      const speak = el('button', { class: 'mini-speak', type: 'button', onclick: () => Sci.speak(q.q + '。' + q.options.join('，还是'), { manual: true }) }, '🔊');
      box.append(el('div', { class: 'q' }, el('div', { class: 'q-title' }, `${qi + 1}. ${q.q}`, speak), opts, explain));
    });
    return box;
  }

  /* ---------------- 启动 ---------------- */
  document.getElementById('muteBtn').addEventListener('click', () => {
    Sci.muted = !Sci.muted;
    Sci.store.set('muted', Sci.muted);
    if (Sci.muted) Sci.stopSpeak();
    updateTopbar();
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#/"]');
    if (!a || e.button || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    go(a.getAttribute('href'));
  });
  window.addEventListener('popstate', () => { current = location.hash; route(); });
  window.addEventListener('hashchange', () => {
    if (location.hash !== current) { current = location.hash; route(); }
  });
  route();
})();
