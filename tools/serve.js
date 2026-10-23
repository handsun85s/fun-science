/* 趣味科学乐园 · 局域网服务器
   让同一个 Wi-Fi 下的手机、平板用浏览器打开这个网站。
   用法：双击上一层的“启动平板访问.bat”，或在命令行运行 node tools/serve.js */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { TTS_OK, startWorker, synthesize, stopWorker } = require('./tts');

const ROOT = path.resolve(__dirname, '..');
// 端口固定不变：换端口会让平板上的星星进度“丢失”（浏览器按地址分别保存进度）
const PORT = Number(process.env.PORT) || 8000;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function send(res, code, text) {
  res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

/* ---------- 帮平板朗读 ----------
   有些平板的浏览器没有中文语音，就由这台 Windows 电脑现场合成声音发过去（合成方法见 tts.js）。
   网站里固定的文字大多已经提前做成了音频（audio/ 文件夹），这里主要负责补漏。
   同一句话合成一次后缓存起来。 */
const TTS_DIR = path.join(__dirname, 'tts-cache');

/* 返回合成好的 wav 文件路径（合成过的直接用缓存），一次只合成一句 */
function ttsFile(text) {
  const out = path.join(TTS_DIR, crypto.createHash('sha1').update(text).digest('hex') + '.wav');
  if (fs.existsSync(out)) return Promise.resolve(out);
  return synthesize(text, out).then(() => out);
}

/* 发文件：带上文件大小，并支持“分段读取”（Range）。
   老一些的平板播放器播放声音时，要先知道文件多大、还会一段一段地要，不支持就放不出来。 */
function serveFile(req, res, file, type, cache) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, '没有找到这个页面');
    const headers = { 'Content-Type': type, 'Cache-Control': cache, 'Accept-Ranges': 'bytes' };
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    let start = 0, end = st.size - 1, code = 200;
    if (m && (m[1] || m[2])) {
      if (m[1]) { start = Number(m[1]); if (m[2]) end = Math.min(Number(m[2]), st.size - 1); }
      else start = Math.max(0, st.size - Number(m[2])); // “最后 N 个字节”
      if (start > end || start >= st.size) {
        res.writeHead(416, { 'Content-Range': `bytes */${st.size}` });
        return res.end();
      }
      code = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${st.size}`;
    }
    headers['Content-Length'] = end - start + 1;
    res.writeHead(code, headers);
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file, { start, end }).pipe(res);
  });
}

function handleTts(req, url, res) {
  if (!TTS_OK) return send(res, 501, '这台电脑不能合成语音');
  const text = (url.searchParams.get('text') || '').trim().slice(0, 500);
  if (!text) return send(res, 400, '没有要读的文字');
  ttsFile(text).then(file => serveFile(req, res, file, 'audio/wav', 'public, max-age=86400')).catch(err => {
    console.log('  [朗读] ' + err.message);
    send(res, 500, '合成失败');
  });
}

// 版本号：再次双击启动时，用它判断开着的是不是旧版本
const VERSION = 3;
const isLocal = req => /^(::1|127\.0\.0\.1|::ffff:127\.0\.0\.1)$/.test(req.socket.remoteAddress || '');

const server = http.createServer((req, res) => {
  let p, url;
  try {
    url = new URL(req.url, 'http://local');
    p = decodeURIComponent(url.pathname);
  } catch (e) {
    return send(res, 400, '地址不对');
  }
  if (p === '/api/version') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ app: 'fun-science', version: VERSION }));
  }
  // 新版本启动时请旧版本让位：只接受这台电脑自己发来的请求
  if (p === '/api/quit' && req.method === 'POST' && isLocal(req)) {
    send(res, 200, 'bye');
    console.log('\n   新版本启动了，这个旧窗口可以关掉了。\n');
    server.close();
    stopWorker();
    setTimeout(() => process.exit(0), 200);
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, '只支持浏览');
  if (p === '/api/tts') return handleTts(req, url, res);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  const rel = path.relative(ROOT, file);
  // 只提供网站本身的文件：不能跑出网站目录，也不提供 tools 和隐藏文件
  if (rel.startsWith('..') || path.isAbsolute(rel) || /^tools([\\/]|$)/.test(rel) || rel.split(/[\\/]/).some(s => s.startsWith('.'))) {
    return send(res, 403, '不能访问');
  }
  // no-cache：改了网站内容，平板刷新一下就能看到
  serveFile(req, res, file, TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'no-cache');
});

function lanAddresses() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const a of list || []) {
      if (a.family === 'IPv4' && !a.internal && !a.address.startsWith('169.254.')) out.push(a.address);
    }
  }
  return out;
}

/* 端口被占用：多半是已经开着一个窗口。新版就直接用它；旧版就请它让位，换成这个新版本。 */
function askOld(method, pathname) {
  return new Promise(resolve => {
    const req = http.request({ host: '127.0.0.1', port: PORT, path: pathname, method, timeout: 2000 }, res => {
      let body = '';
      res.on('data', d => { body += d; });
      res.on('end', () => resolve({ code: res.statusCode, body }));
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.end();
  });
}
let retried = false;
server.on('error', async err => {
  if (err.code !== 'EADDRINUSE') {
    console.log('\n  启动失败：' + err.message + '\n');
    process.exitCode = 1;
    return;
  }
  const v = await askOld('GET', '/api/version');
  let info = null;
  try { info = v && v.code === 200 ? JSON.parse(v.body) : null; } catch (e) { info = null; }
  if (info && info.app === 'fun-science' && info.version >= VERSION) {
    console.log('\n   已经开着一个“趣味科学乐园”窗口了，直接用那个就行，这个窗口可以关掉。\n');
    process.exitCode = 1;
    return;
  }
  if (info && info.app === 'fun-science' && !retried) {
    retried = true;
    console.log('\n   发现旧版本还开着，正在换成新版本……');
    await askOld('POST', '/api/quit');
    setTimeout(() => server.listen(PORT, '0.0.0.0'), 800);
    return;
  }
  // 最早的版本还没有 /api/version，会回一个“没有找到这个页面”
  if (v && !info && v.code === 404 && v.body.indexOf('没有找到') >= 0) {
    console.log('\n   ⚠️ 发现一个旧版本的“趣味科学乐园”窗口还开着（它太旧了，没法自动替换）。');
    console.log('      请找到标题是“趣味科学乐园 - 手机平板访问”的黑色窗口，把它关掉，');
    console.log('      然后再双击一次“启动平板访问.bat”。\n');
  } else {
    console.log(`\n   端口 ${PORT} 被别的程序占用了，请关掉占用它的程序后再试。\n`);
  }
  process.exitCode = 1;
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = lanAddresses();
  console.log('');
  console.log('  ===============================================');
  console.log('   🔬 趣味科学乐园 已经启动');
  console.log('  ===============================================');
  console.log('');
  if (ips.length) {
    console.log('   在手机、平板的浏览器地址栏里输入：');
    ips.forEach(ip => console.log(`     👉  http://${ip}:${PORT}`));
    console.log('');
    console.log(`   （备用地址，部分设备可用：http://${os.hostname()}.local:${PORT}）`);
  } else {
    console.log('   没有找到局域网地址，请确认电脑已经连上 Wi-Fi。');
  }
  console.log(`   在这台电脑上打开：http://localhost:${PORT}`);
  console.log('');
  console.log('   注意：手机、平板要和电脑连同一个 Wi-Fi；');
  console.log('         用的时候不要关掉这个窗口，关掉网站就停了。');
  console.log('');
  // 提前把朗读准备好，孩子第一次点“读给我听”不用等
  if (TTS_OK) {
    fs.mkdirSync(TTS_DIR, { recursive: true });
    startWorker()
      .then(() => console.log('   🔊 朗读已准备好：平板读不了中文时，由这台电脑帮忙读。\n'))
      .catch(err => console.log('   ⚠️ 电脑朗读没准备好：' + err.message + '\n'));
  }
});
