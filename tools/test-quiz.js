/* 小考验的真实浏览器回归测试。隔离浏览器数据，不会操作用户平板的进度。
   cd tools && npm ci && npm run test:quiz
   默认使用已安装的 Chrome；可通过 TEST_BROWSER_PATH 指定 Chromium 路径。
   TEST_BASE_URL 可用于验证部署后的站点（省略时启动临时本地服务器）。 */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.mp3': 'audio/mpeg' };

async function main() {
  let server, browser;
  const errors = [], checks = [];
  try {
    let base = process.env.TEST_BASE_URL;
    if (!base) {
      server = http.createServer((req, res) => {
        const pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname);
        if (!pathname.startsWith('/fun-science/')) { res.writeHead(404); return res.end(); }
        const file = path.resolve(ROOT, pathname.slice('/fun-science/'.length) || 'index.html');
        if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); }
        fs.readFile(file, (err, data) => {
          if (err) { res.writeHead(404); return res.end(); }
          res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
          res.end(data);
        });
      });
      await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      base = 'http://127.0.0.1:' + server.address().port + '/fun-science/';
    }
    const launch = process.env.TEST_BROWSER_PATH ? { executablePath: process.env.TEST_BROWSER_PATH } : { channel: 'chrome' };
    browser = await chromium.launch(Object.assign({ headless: true }, launch));
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base);
    await page.locator('#experimentSearch').waitFor();
    // 只在本测试的隔离浏览器里写入旧版进度，验证迁移不丢星。
    await page.evaluate(() => {
      localStorage.setItem('fun-science:muted', 'true');
      localStorage.setItem('fun-science:progress', JSON.stringify({
        float: { goal: true, quiz: { 1: true } },
        magnet: { goal: true, quiz: { 0: true, 1: true } },
      }));
      location.hash = '#/lesson/float';
    });
    const questions = page.locator('.quiz .q');
    await questions.first().waitFor();
    assert.equal(await questions.nth(1).locator('.opt.right').innerText(), '铁钉');
    assert.equal(await questions.nth(1).locator('.opt:disabled').count(), 3);
    assert.match(await page.locator('.quiz-summary').innerText(), /1 \/ 2/);
    checks.push('旧进度恢复：已有答案、任务和星星保留');

    const before = await page.evaluate(() => Sci.progress.total());
    await questions.first().getByRole('button', { name: '沉下去', exact: true }).click();
    assert.equal(await page.evaluate(() => Sci.progress.total()), before);
    assert.equal(await questions.first().getByRole('button', { name: '沉下去', exact: true }).isDisabled(), true);
    await questions.first().getByRole('button', { name: '看看知识点', exact: true }).click();
    assert.equal(await page.locator('.fact-body').isVisible(), true);
    assert.equal(await page.evaluate(() => Sci.progress.of('float').quiz[0] === true), false);
    await questions.first().getByRole('button', { name: '回看实验', exact: true }).click();
    assert.equal(await page.locator('canvas.stage').isVisible(), true);
    checks.push('答错不扣星、排除已试选项、可回看知识点和实验');

    await page.reload();
    await questions.first().waitFor();
    assert.equal(await questions.first().getByRole('button', { name: '沉下去', exact: true }).isDisabled(), true);
    assert.equal(await questions.first().locator('.quiz-review').isVisible(), true);
    checks.push('刷新后恢复未完成题的尝试记录');

    await questions.first().getByRole('button', { name: '浮起来', exact: true }).click();
    assert.equal(await page.evaluate(() => Sci.progress.total()), before + 1);
    assert.match(await questions.first().locator('.q-explain').innerText(), /想明白了/);
    assert.match(await page.locator('.quiz-summary').innerText(), /两道题都答对/);
    assert.equal(await questions.first().locator('.quiz-review').isVisible(), false);
    assert.equal(await questions.first().locator('.opt:disabled').count(), 2);
    checks.push('纠正后得星、解释原因、完成状态即时更新');

    const missing = await page.evaluate(async () => {
      const manifest = await fetch('audio/manifest.json').then(r => r.json());
      const clean = t => String(t).replace(/<[^>]+>/g, '').replace(/\p{Extended_Pictographic}|️|‍/gu, '').replace(/×/g, '乘').replace(/\s+/g, ' ').trim();
      return Sci.lessons.filter(l => l.quiz.some(q => q.explain && !manifest[Sci.textKey(clean(q.explain))])).map(l => l.id);
    });
    assert.deepEqual(missing, []);
    await page.evaluate(() => {
      Sci.canSpeak = false;
      window.quizAudio = null;
      const realPlay = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () { window.quizAudio = this; return realPlay.call(this); };
    });
    await questions.first().getByRole('button', { name: '听听为什么' }).click();
    await page.waitForFunction(() => window.quizAudio && window.quizAudio.currentTime > 0 && !window.quizAudio.paused, null, { timeout: 10000 });
    assert.match(await page.evaluate(() => window.quizAudio.src), /audio\/[a-f0-9]{8}\.mp3$/);
    checks.push('所有课程解析有音频；禁用设备语音后 MP3 可解码并播放');

    await page.evaluate(() => { window.lastSpoken = null; Sci.speak = (t, opt) => { window.lastSpoken = { text: t, manual: opt.manual }; }; });
    await questions.first().getByRole('button', { name: '听听为什么' }).click();
    const spoken = await page.evaluate(() => window.lastSpoken);
    assert.match(spoken.text, /木头比同样大小的水轻/);
    assert.equal(spoken.manual, true);
    checks.push('解析朗读按钮传入正确的解析文字');

    await page.reload();
    await questions.first().waitFor();
    assert.equal(await page.evaluate(() => Sci.progress.total()), before + 1);
    assert.equal(await questions.first().locator('.opt.right').innerText(), '浮起来');
    assert.equal(await questions.first().locator('.opt:enabled').count(), 0);
    const data = await page.evaluate(() => JSON.parse(localStorage.getItem('fun-science:progress')));
    assert.equal(data.float.goal, true);
    assert.equal(data.magnet.quiz[0], true);
    assert.equal(data.magnet.quiz[1], true);
    checks.push('刷新不重复加星、不丢任务和其他实验的进度');

    // 未答过的题也能直接得星，多次排除错误选项后仍可纠正。
    await page.locator('.crumbs a').first().click();
    await page.locator('#experimentSearch').fill('认识钟表');
    await page.locator('#searchResults a[href="#/lesson/clock"]').click();
    const answers = await page.evaluate(() => Sci.lessons.find(l => l.id === 'clock').quiz.map(q => ({ answer: q.answer, size: q.options.length })));
    for (let i = 0; i < answers.length; i++) {
      const q = questions.nth(i);
      if (i === 1) {
        for (let j = 0; j < answers[i].size; j++) if (j !== answers[i].answer) await q.locator('.opt').nth(j).click();
      }
      await q.locator('.opt').nth(answers[i].answer).click();
    }
    assert.equal(await page.evaluate(() => Sci.progress.stars('clock')), 2);
    for (const width of [320, 375, 768]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'overflow at ' + width);
    }
    checks.push('首次答对和多次纠正均可得星；手机/平板宽度无横向溢出');
    if (process.env.TEST_SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.TEST_SCREENSHOT_DIR, { recursive: true });
      await page.locator('.toast').waitFor({ state: 'detached' });
      await page.locator('.confetti').last().waitFor({ state: 'detached' });
      await page.setViewportSize({ width: 375, height: 900 });
      await page.locator('.quiz').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(process.env.TEST_SCREENSHOT_DIR, 'quiz-mobile.png') });
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.locator('.quiz').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(process.env.TEST_SCREENSHOT_DIR, 'quiz-desktop.png') });
    }

    const old = await browser.newContext();
    await old.addInitScript(() => { delete Element.prototype.replaceChildren; delete Array.prototype.flat; window.PointerEvent = undefined; });
    const legacy = await old.newPage();
    legacy.on('pageerror', e => errors.push(e.message));
    await legacy.goto(base + '#/lesson/float');
    await legacy.locator('.quiz .q').first().getByRole('button', { name: '沉下去', exact: true }).click();
    await legacy.locator('.quiz .q').first().getByRole('button', { name: '浮起来', exact: true }).click();
    assert.equal(await legacy.evaluate(() => Sci.progress.stars('float')), 1);
    await old.close();
    checks.push('兼容缺少新版 DOM API 的浏览器');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ passed: checks, errors }, null, 2));
  } finally {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
