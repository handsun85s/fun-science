/* 提前生成朗读音频
   把网站里所有会朗读的文字（欢迎语、每课讲解、知识点、题目、行星介绍），
   用这台电脑的中文语音合成，再压缩成 mp3，放进网站的 audio/ 文件夹。
   这样网站放到 GitHub Pages 等任何地方，读不了中文的平板也能听到朗读。

   用法（只能在 Windows 上运行）：
     cd tools
     npm install
     node build-audio.js
   改了课程文字后再运行一次就行：没变的句子会跳过，用不到的旧音频会自动删掉。 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { TTS_OK, synthesize, stopWorker } = require('./tts');

// lamejs 1.2.1 的默认入口在 Node 里有个已知 bug（MPEGMode is not defined），改用它自带的打包版
const lamejs = (() => {
  const box = vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('lamejs/lame.all.js'), 'utf8'), box);
  return box.lamejs;
})();

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'audio');
const TMP = path.join(__dirname, 'tts-cache', 'build');

/* 下面两个函数必须和 js/core.js 里的 cleanText、Sci.textKey 完全一样，
   网页才能用同一段文字找到同一个音频文件 */
const cleanText = text => String(text)
  .replace(/<[^>]+>/g, '')
  .replace(/\p{Extended_Pictographic}|️|‍/gu, '')
  .replace(/×/g, '乘')
  .replace(/\s+/g, ' ')
  .trim();
function textKey(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return ('0000000' + h.toString(16)).slice(-8);
}

/* 把课程文件“假装”在网页里加载一遍，收集所有会朗读的文字 */
function collectTexts() {
  const lessons = [];
  const noop = () => {};
  const Sci = {
    register: l => lessons.push(l),
    speechExtras: [],
    subjects: [], levels: {}, ages: {},
    draw: {}, h: noop,
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    smooth: () => 0,
    rand: (a, b) => (a + b) / 2,
    shuffle: a => a.slice(),
    mixColor: () => [0, 0, 0],
    rgb: () => '',
    cn: String,
    isEmoji: () => false,
  };
  const ctx = vm.createContext({ Sci });
  const dir = path.join(ROOT, 'js', 'lessons');
  for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.js')).sort()) {
    vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
  }
  const texts = [];
  const g = fs.readFileSync(path.join(ROOT, 'js', 'core.js'), 'utf8').match(/Sci\.greeting = '([^']+)'/);
  if (g) texts.push(g[1]);
  for (const l of lessons) {
    texts.push(l.intro, l.fact);
    for (const q of l.quiz) texts.push(q.q + '。' + q.options.join('，还是'));
  }
  texts.push(...Sci.speechExtras);
  return { texts, lessonCount: lessons.length };
}

/* 读 wav 里的声音数据（16 位单声道），压成 32kbps 的 mp3 */
function wavToMp3(wavFile) {
  const buf = fs.readFileSync(wavFile);
  let off = 12, data = null, rate = 16000;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4), size = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') rate = buf.readUInt32LE(off + 12);
    if (id === 'data') { data = [off + 8, Math.min(size, buf.length - off - 8)]; break; }
    off += 8 + size + (size % 2);
  }
  if (!data) throw new Error('wav 文件里没有声音数据');
  const n = Math.floor(data[1] / 2), pcm = new Int16Array(n);
  for (let i = 0; i < n; i++) pcm[i] = buf.readInt16LE(data[0] + i * 2);
  const enc = new lamejs.Mp3Encoder(1, rate, 32);
  const parts = [];
  for (let i = 0; i < n; i += 1152) {
    const out = enc.encodeBuffer(pcm.subarray(i, i + 1152));
    if (out.length) parts.push(Buffer.from(out.buffer, out.byteOffset, out.length));
  }
  const end = enc.flush();
  if (end.length) parts.push(Buffer.from(end.buffer, end.byteOffset, end.length));
  return { mp3: Buffer.concat(parts), seconds: n / rate };
}

(async () => {
  if (!TTS_OK) {
    console.log('需要在 Windows 电脑上运行（要用 Windows 自带的中文语音）。');
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(TMP, { recursive: true });
  const { texts, lessonCount } = collectTexts();
  const all = new Map();
  for (const t of texts) {
    const c = cleanText(t);
    if (!c) continue;
    const k = textKey(c);
    if (all.has(k) && all.get(k) !== c) throw new Error('两段不同的文字算出了同一个指纹，请改一下其中一段：' + c.slice(0, 20));
    all.set(k, c);
  }
  console.log(`\n  ${lessonCount} 个课程，一共 ${all.size} 段要朗读的文字。\n`);
  let made = 0, kept = 0, removed = 0, secs = 0;
  for (const [key, text] of all) {
    const mp3 = path.join(OUT, key + '.mp3');
    if (fs.existsSync(mp3)) { kept++; continue; }
    const wav = path.join(TMP, key + '.wav');
    await synthesize(text, wav);
    const r = wavToMp3(wav);
    fs.writeFileSync(mp3, r.mp3);
    fs.rmSync(wav, { force: true });
    made++;
    secs += r.seconds;
    process.stdout.write(`\r  正在生成：${made + kept} / ${all.size}`);
  }
  for (const f of fs.readdirSync(OUT)) {
    if (f.endsWith('.mp3') && !all.has(f.slice(0, -4))) { fs.rmSync(path.join(OUT, f)); removed++; }
  }
  const manifest = {};
  [...all.keys()].sort().forEach(k => { manifest[k] = 1; });
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
  const bytes = fs.readdirSync(OUT).reduce((s, f) => s + fs.statSync(path.join(OUT, f)).size, 0);
  console.log(`\n\n  完成！新生成 ${made} 段（约 ${Math.round(secs / 60)} 分钟），沿用 ${kept} 段，删掉 ${removed} 段旧的。`);
  console.log(`  audio 文件夹一共 ${(bytes / 1024 / 1024).toFixed(1)} MB。\n`);
  stopWorker();
})().catch(err => {
  console.error('\n  出错了：' + err.message);
  stopWorker();
  process.exit(1);
});
