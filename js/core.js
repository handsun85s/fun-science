/* 趣味科学乐园 —— 核心工具：课程注册、进度、声音、朗读、画图小帮手 */
(function () {
  'use strict';

  /* ---------- 兼容老浏览器（老平板上的 Chrome / Safari 缺少的功能，这里补上） ---------- */
  if (!Element.prototype.replaceChildren) {
    Element.prototype.replaceChildren = function (...nodes) {
      while (this.firstChild) this.removeChild(this.firstChild);
      this.append(...nodes);
    };
  }
  if (!Array.prototype.flat) {
    Array.prototype.flat = function (depth = 1) {
      return this.reduce((acc, v) => acc.concat(Array.isArray(v) && depth > 0 ? v.flat(depth - 1) : v), []);
    };
  }
  // 识别表情符号：新浏览器用 Unicode 属性，老浏览器退回到常见的表情编码范围
  let emojiAll, emojiOne;
  try {
    emojiAll = new RegExp('\\p{Extended_Pictographic}|\\uFE0F|\\u200D', 'gu');
    emojiOne = new RegExp('\\p{Extended_Pictographic}', 'u');
  } catch (e) {
    emojiAll = /[☀-➿]|[\uD83C-\uD83E][\uDC00-\uDFFF]|️|‍/g;
    emojiOne = /[☀-➿]|[\uD83C-\uD83E][\uDC00-\uDFFF]/;
  }

  const FONT = '"PingFang SC","Microsoft YaHei","Hiragino Sans GB","Noto Sans SC",sans-serif';
  const EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';

  const Sci = {
    FONT,
    EMOJI_FONT,
    subjects: [
      { id: 'physics', name: '物理小实验', emoji: '⚡', color: '#ff8a3d', desc: '浮沉、影子、静电、声音、惯性、摩擦力、电磁铁、光、单摆、能量' },
      { id: 'math', name: '数学魔法', emoji: '🔢', color: '#3d8bff', desc: '图形、规律、人民币、乘法、钟表、角、面积、平均数、概率、坐标' },
      { id: 'chemistry', name: '化学魔术', emoji: '🧪', color: '#9b5cff', desc: '物质变化、火山、表面张力、溶解、结晶、生锈、燃烧、酸碱中和、原子、质量守恒' },
      { id: 'biology', name: '生命奥秘', emoji: '🌱', color: '#22a95b', desc: '感官、昆虫、植物、骨骼、消化、呼吸、心脏、细胞、遗传、进化' },
      { id: 'astronomy', name: '宇宙探险', emoji: '🪐', color: '#4655c4', desc: '星座、宇航员、陨石坑、月相、光速、日月食、失重、宜居带、恒星的一生' },
      { id: 'geography', name: '地理探秘', emoji: '🗺️', color: '#0e9384', desc: '地形、七大洲、天气、水土流失、等高线、气候带、城市选址、板块、地震' },
      { id: 'engineering', name: '工程小创客', emoji: '🔧', color: '#8d5a2b', desc: '搭高塔、轮子、造船、桥梁、齿轮、纸飞机、投石器、水车、风车、抗震楼' },
      { id: 'coding', name: '编程小达人', emoji: '🤖', color: '#d6336c', desc: '顺序、找虫子、循环、条件、变量、事件、二分法、排序、函数、递归' },
      { id: 'infotech', name: '信息科技', emoji: '💻', color: '#475569', desc: '认识电脑、像素、网络安全、二进制、电码、加密、数据、网络、传感器、人工智能' },
      { id: 'health', name: '环境与健康', emoji: '♻️', color: '#e03131', desc: '垃圾分类、洗手、营养、牙齿、节水节电、睡眠、病菌、温室效应、急救、生态' },
    ],
    /* 难度等级 & 推荐年龄：二年级到六年级 */
    levels: { 1: '入门', 2: '进阶', 3: '挑战', 4: '高手', 5: '大师' },
    ages: { 1: '7-8岁', 2: '8-9岁', 3: '9-10岁', 4: '10-11岁', 5: '11-12岁' },
    lessons: [],
  };

  /* 每个课程文件调用 Sci.register({...}) 把自己登记进来 */
  Sci.register = function (lesson) {
    Sci.lessons.push(lesson);
  };

  /* ---------- 本地存储（隐私模式下可能不可用，所以都包在 try 里） ---------- */
  const PREFIX = 'fun-science:';
  Sci.store = {
    get(key, def) {
      try {
        const v = localStorage.getItem(PREFIX + key);
        return v == null ? def : JSON.parse(v);
      } catch (e) {
        return def;
      }
    },
    set(key, val) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(val));
      } catch (e) { /* 存不了就算了 */ }
    },
  };

  /* 进度：每课最多 3 颗星 = 完成任务 1 颗 + 每道题第一次就答对 1 颗 */
  Sci.progress = {
    all() { return Sci.store.get('progress', {}); },
    of(id) {
      const p = this.all()[id] || {};
      return { goal: !!p.goal, quiz: p.quiz || {} };
    },
    update(id, fn) {
      const all = this.all();
      const p = this.of(id);
      fn(p);
      all[id] = p;
      Sci.store.set('progress', all);
    },
    stars(id) {
      const p = this.of(id);
      return (p.goal ? 1 : 0) + Object.values(p.quiz).filter(Boolean).length;
    },
    total() {
      return Sci.lessons.reduce((s, l) => s + this.stars(l.id), 0);
    },
  };

  /* ---------- 音效（用 WebAudio 现场合成，不需要音频文件） ---------- */
  let actx = null;
  Sci.muted = Sci.store.get('muted', false);
  function audio() {
    if (!actx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      actx = new C();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  Sci.tone = function (freq, dur = 0.15, opt = {}) {
    if (Sci.muted) return;
    const a = audio();
    if (!a) return;
    const t0 = a.currentTime + (opt.delay || 0);
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = opt.type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (opt.to) o.frequency.exponentialRampToValueAtTime(opt.to, t0 + dur);
    const v = opt.vol == null ? 0.12 : opt.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(a.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  };
  Sci.sfx = function (name) {
    const T = Sci.tone;
    switch (name) {
      case 'pop': T(520, 0.08, { type: 'triangle', to: 900 }); break;
      case 'click': T(760, 0.04, { type: 'square', vol: 0.04 }); break;
      case 'good': [523, 659, 784].forEach((f, i) => T(f, 0.18, { type: 'triangle', delay: i * 0.09 })); break;
      case 'bad': T(240, 0.25, { type: 'sawtooth', vol: 0.05, to: 150 }); break;
      case 'star': [784, 988, 1175, 1568].forEach((f, i) => T(f, 0.22, { type: 'triangle', delay: i * 0.08 })); break;
      case 'splash': T(900, 0.25, { to: 200, vol: 0.1 }); break;
      case 'plop': T(320, 0.12, { to: 120 }); break;
      case 'clack': T(1200, 0.05, { type: 'square', vol: 0.07 }); break;
      case 'whoosh': T(200, 0.3, { to: 600, vol: 0.06 }); break;
      case 'tick': T(1500, 0.02, { type: 'square', vol: 0.025 }); break;
    }
  };

  /* ---------- 第一次点屏幕时“解锁”声音 ----------
     平板浏览器规定：声音必须先在一次点击里响过，之后才放得出来。
     所以孩子第一次点屏幕时，悄悄放一段没有声音的音频。 */
  const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  let player = null; // 播放电脑合成的朗读声音
  const UNLOCK_EVENTS = ['touchend', 'click', 'keydown'];
  function unlockAudio() {
    UNLOCK_EVENTS.forEach(t => window.removeEventListener(t, unlockAudio, true));
    try {
      const a = audio();
      if (a) {
        const s = a.createBufferSource();
        s.buffer = a.createBuffer(1, 1, 22050);
        s.connect(a.destination);
        s.start(0);
      }
    } catch (e) { /* 忽略 */ }
    try {
      if (!player) player = new Audio();
      if (!player.src) {
        player.src = SILENT_WAV;
        const p = player.play();
        if (p && p.catch) p.catch(() => {});
      }
    } catch (e) { /* 忽略 */ }
    try {
      if (Sci.canSpeak) {
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        speechSynthesis.speak(u);
      }
    } catch (e) { /* 忽略 */ }
  }
  UNLOCK_EVENTS.forEach(t => window.addEventListener(t, unlockAudio, true));

  /* ---------- 朗读 ----------
     优先用浏览器自带的中文语音。平板没有中文语音、或者点了没声音时，按顺序找帮手：
       1. 提前做好的朗读音频（audio/ 文件夹，由 tools/build-audio.js 生成，放到哪里都能用）
       2. 家里电脑现场合成（只有用“启动平板访问.bat”打开网站时才有，见 tools/serve.js） */
  Sci.canSpeak = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function';
  Sci.serverTts = false;
  let prebuilt = {};
  if (/^https?:$/.test(location.protocol) && window.fetch) {
    // 有没有提前做好的朗读音频
    fetch('audio/manifest.json', { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : {}))
      .then(m => { prebuilt = m || {}; })
      .catch(() => {});
    // 是不是家里电脑上的小服务器（这时电脑可以帮忙朗读）
    if (!/(claude\.ai|claudeusercontent\.com)$/.test(location.hostname)) {
      fetch('/api/version', { cache: 'no-cache' })
        .then(r => (r.ok ? r.json() : null))
        .then(v => { Sci.serverTts = !!(v && v.app === 'fun-science'); })
        .catch(() => {});
    }
  }
  // 给一段文字算个“指纹”，用来找对应的音频文件（tools/build-audio.js 用的是同一个算法）
  Sci.textKey = function (s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ('0000000' + h.toString(16)).slice(-8);
  };
  const NO_SPEECH_TIP = '这个浏览器暂时不支持朗读 🙈 换用 Chrome、Safari 或电脑浏览器打开就可以啦';
  const SERVER_FAIL_TIP = '电脑没能读出来 🙈 请把电脑上“趣味科学乐园”的黑色窗口关掉，再重新双击“启动平板访问.bat”';
  const FILE_FAIL_TIP = '朗读声音没加载出来 🙈 检查一下网络，再点一次试试';
  let zhVoice = null;
  function pickVoice() {
    try {
      const vs = speechSynthesis.getVoices();
      zhVoice = vs.find(v => /zh[-_]CN/i.test(v.lang) && /Xiaoxiao|Xiaoyi|Tingting|Huihui/i.test(v.name)) ||
        vs.find(v => /zh[-_]CN/i.test(v.lang)) ||
        vs.find(v => /^zh/i.test(v.lang) && !/HK|TW/i.test(v.lang)) || null;
    } catch (e) { /* 忽略 */ }
  }
  if (Sci.canSpeak) {
    pickVoice();
    try { speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) { speechSynthesis.onvoiceschanged = pickVoice; }
  }
  const cleanText = text => String(text)
    .replace(/<[^>]+>/g, '')
    .replace(emojiAll, '')
    .replace(/×/g, '乘')
    .replace(/\s+/g, ' ')
    .trim();
  // 这台设备读不了中文（没有朗读功能、没有中文语音、或者以前点了没出声），就要找帮手
  const needHelp = () => !Sci.canSpeak || !zhVoice || Sci.store.get('ttsSilent', false);
  const hasHelper = text => !!prebuilt[Sci.textKey(text)] || Sci.serverTts;

  function playSrc(src, failTip, manual) {
    try {
      if (!player) player = new Audio();
      player.pause();
      player.onerror = () => { if (manual) Sci.toast(failTip); };
      player.src = src;
      const p = player.play();
      if (p && p.catch) p.catch(() => {});
      return true;
    } catch (e) {
      if (manual) Sci.toast(failTip);
      return false;
    }
  }
  // 请帮手来读：先找提前做好的音频，没有再请电脑现场合成
  function speakHelper(text, manual) {
    try { if (Sci.canSpeak) speechSynthesis.cancel(); } catch (e) { /* 忽略 */ }
    const key = Sci.textKey(text);
    if (prebuilt[key]) return playSrc('audio/' + key + '.mp3', FILE_FAIL_TIP, manual);
    if (Sci.serverTts) return playSrc('/api/tts?text=' + encodeURIComponent(text.slice(0, 500)), SERVER_FAIL_TIP, manual);
    if (manual) Sci.toast(NO_SPEECH_TIP);
    return false;
  }
  function speakBrowser(text, manual) {
    const busy = speechSynthesis.speaking || speechSynthesis.pending;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.92;
    u.pitch = 1.1;
    if (zhVoice) u.voice = zhVoice;
    let started = false, blocked = false;
    u.onstart = () => { started = true; };
    u.onerror = e => {
      // 被打断、或者还没点过页面不许发声，都不算“这台设备读不了”
      if (/not-allowed|interrupted|canceled/.test(e.error)) blocked = true;
    };
    const go = () => {
      try { speechSynthesis.resume(); } catch (e) { /* 安卓 Chrome 有时卡在暂停状态 */ }
      speechSynthesis.speak(u);
    };
    // 安卓 Chrome：取消之后马上读，这句话有时会被吞掉，稍等一下再读
    if (busy) setTimeout(go, 150);
    else go();
    setTimeout(() => {
      if (started || blocked || speechSynthesis.speaking) return;
      // 自带朗读没出声：记住这台设备，以后直接请帮手，并马上补读一次
      Sci.store.set('ttsSilent', true);
      speakHelper(text, manual);
    }, 4000);
  }
  /* auto: true 表示是程序自动朗读，关掉声音时就不读；
     manual: true 表示孩子点了朗读按钮，读不了时要告诉他原因 */
  Sci.speak = function (text, opt = {}) {
    if (opt.auto && Sci.muted) return false;
    const t = cleanText(text);
    if (!t) return false;
    // 先停掉正在播放的帮手朗读；浏览器自带朗读由 speakBrowser 自己停（要处理安卓的小毛病）
    stopPlayer();
    if (!Sci.canSpeak || (needHelp() && hasHelper(t))) return speakHelper(t, opt.manual);
    try {
      speakBrowser(t, opt.manual);
      return true;
    } catch (e) {
      return speakHelper(t, opt.manual);
    }
  };
  function stopPlayer() {
    try { if (player && player.src && player.src !== SILENT_WAV) player.pause(); } catch (e) { /* 忽略 */ }
  }
  Sci.stopSpeak = function () {
    try { if (Sci.canSpeak) speechSynthesis.cancel(); } catch (e) { /* 忽略 */ }
    stopPlayer();
  };
  // 首页欢迎语（放在这里，tools/build-audio.js 也能读到它来生成朗读音频）
  Sci.greeting = '嗨！我是小博士猫头鹰。这里有好多好玩的科学实验，动动手指，就能发现大自然的秘密。每完成一个任务、答对一道题，都能得到一颗星星哦！';
  // 课程以外还会朗读的文字（比如行星介绍），各课程文件自己往里加
  Sci.speechExtras = [];

  /* ---------- DOM 小帮手 ---------- */
  Sci.h = function (tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'style' && typeof v === 'object') {
          for (const s in v) {
            if (s.startsWith('--')) el.style.setProperty(s, v[s]);
            else el.style[s] = v[s];
          }
        } else if (k === 'html') el.innerHTML = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const c of kids.flat(Infinity)) {
      if (c == null || c === false) continue;
      el.append(c.nodeType ? c : String(c));
    }
    return el;
  };

  /* ---------- 庆祝：撒星星 + 提示条 ---------- */
  Sci.celebrate = function (x, y, n = 18) {
    const cx = x == null ? innerWidth / 2 : x;
    const cy = y == null ? innerHeight / 3 : y;
    const pieces = ['⭐', '🎉', '✨', '🌟', '🎈'];
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'confetti';
      s.textContent = pieces[i % pieces.length];
      const a = Math.random() * Math.PI * 2;
      const d = 80 + Math.random() * 180;
      s.style.left = cx + 'px';
      s.style.top = cy + 'px';
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d + 120 + 'px');
      s.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1500);
    }
  };
  Sci.toast = function (text) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    // 字多的提示多停留一会儿，让孩子来得及看
    const sec = text.length > 20 ? 4.5 : 2.2;
    t.style.animationDuration = sec + 's';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), sec * 1000 + 100);
  };

  /* ---------- 数学小工具 ---------- */
  Sci.isEmoji = s => emojiOne.test(s);
  Sci.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  Sci.lerp = (a, b, t) => a + (b - a) * t;
  Sci.smooth = (a, b, x) => {
    const t = Sci.clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  Sci.rand = (a, b) => a + Math.random() * (b - a);
  Sci.shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  Sci.mixColor = (c1, c2, t) => c1.map((v, i) => Math.round(v + (c2[i] - v) * t));
  Sci.rgb = (c, a) => a == null ? `rgb(${c[0]},${c[1]},${c[2]})` : `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  /* 0～99 转成中文数字：12 → 十二，35 → 三十五 */
  const DIGITS = '零一二三四五六七八九';
  Sci.cn = function (n) {
    if (n <= 10) return n === 10 ? '十' : DIGITS[n];
    if (n < 20) return '十' + DIGITS[n % 10];
    const t = Math.floor(n / 10), u = n % 10;
    return DIGITS[t] + '十' + (u ? DIGITS[u] : '');
  };

  /* ---------- 画布小帮手 ---------- */
  const D = {
    emoji(ctx, e, x, y, size, alpha) {
      ctx.save();
      if (alpha != null) ctx.globalAlpha *= alpha;
      ctx.font = `${size}px ${EMOJI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000';
      ctx.fillText(e, x, y);
      ctx.restore();
    },
    text(ctx, s, x, y, o = {}) {
      ctx.save();
      ctx.font = `${o.weight || 'bold'} ${o.size || 20}px ${FONT}`;
      ctx.fillStyle = o.color || '#2b2840';
      ctx.textAlign = o.align || 'center';
      ctx.textBaseline = o.base || 'middle';
      if (o.alpha != null) ctx.globalAlpha *= o.alpha;
      if (o.maxW) {
        const w = ctx.measureText(s).width;
        if (w > o.maxW) ctx.font = `${o.weight || 'bold'} ${Math.floor((o.size || 20) * o.maxW / w)}px ${FONT}`;
      }
      if (o.stroke) {
        ctx.lineWidth = o.strokeWidth || 5;
        ctx.strokeStyle = o.stroke;
        ctx.lineJoin = 'round';
        ctx.strokeText(s, x, y);
      }
      ctx.fillText(s, x, y);
      ctx.restore();
    },
    /* 中文按字换行 */
    wrap(ctx, s, x, y, maxW, lineH, o = {}) {
      ctx.save();
      ctx.font = `${o.weight || 'normal'} ${o.size || 16}px ${FONT}`;
      const lines = [];
      let line = '';
      for (const ch of s) {
        if (ctx.measureText(line + ch).width > maxW && line) {
          lines.push(line);
          line = ch;
        } else line += ch;
      }
      if (line) lines.push(line);
      ctx.restore();
      lines.forEach((ln, i) => D.text(ctx, ln, x, y + i * lineH, Object.assign({ weight: 'normal', size: 16 }, o)));
      return lines.length;
    },
    rrect(ctx, x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    },
    circle(ctx, x, y, r, fill, stroke, lw) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
    },
    arrow(ctx, x1, y1, x2, y2, color, lw = 3, head = 10) {
      const a = Math.atan2(y2 - y1, x2 - x1);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lw;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2 - Math.cos(a) * head * 0.6, y2 - Math.sin(a) * head * 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - Math.cos(a - 0.45) * head, y2 - Math.sin(a - 0.45) * head);
      ctx.lineTo(x2 - Math.cos(a + 0.45) * head, y2 - Math.sin(a + 0.45) * head);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
  };
  Sci.draw = D;

  window.Sci = Sci;
})();
