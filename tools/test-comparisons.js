/* 新增对照实验的端到端检查：cd tools && npm run test:comparisons */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const root = path.resolve(__dirname, '..');
const cases = [
  ['snowshoes', '鞋底越宽，压强越小', ['相对压强 12', '相对压强 3']],
  ['splitarray', '拆分位置变了，总数不变', ['6 + 18 = 24', '15 + 9 = 24']],
  ['inkdiffusion', '温水中颜色扩散较快', ['较小', '较大']],
  ['pollentrip', '蜜蜂能帮助花粉到达柱头', ['没有收到花粉', '花药被带到柱头']],
  ['telescopeLight', '直径两倍，集光量约四倍', ['集光量 1 份', '集光量 4 份']],
  ['soilwater', '这个模型里砂土渗水更快', ['渗入 90', '渗入 24']],
  ['foldpaper', '折叠形状改变了结构的抗弯能力', ['掉下', '托住']],
  ['filterboth', '而且要同时满足，或者满足至少一个', ['选中 2 张', '选中 5 张']],
  ['pixelzoom', '同尺寸下更多像素能描述更细的轮廓', ['16 个像素', '256 个像素']],
  ['portionplan', '少量盛饭、按需添饭能减少剩余', ['剩余 80 克', '剩余 0 克']],
];
async function main() {
  let server, browser;
  try {
    let base = process.env.TEST_BASE_URL;
    if (!base) {
      server = http.createServer((req, res) => {
        const url = new URL(req.url, 'http://local');
        if (!url.pathname.startsWith('/fun-science/')) { res.writeHead(404); return res.end(); }
        const file = path.resolve(root, decodeURIComponent(url.pathname.slice(13)) || 'index.html');
        if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
        fs.readFile(file, (e, b) => {
          if (e) { res.writeHead(404); return res.end(); }
          res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.mp3': 'audio/mpeg' })[path.extname(file)] || 'application/octet-stream');
          res.end(b);
        });
      });
      await new Promise(r => server.listen(0, '127.0.0.1', r));
      base = 'http://127.0.0.1:' + server.address().port + '/fun-science/';
    }
    browser = await chromium.launch(Object.assign({ headless: true }, process.env.TEST_BROWSER_PATH ? { executablePath: process.env.TEST_BROWSER_PATH } : { channel: 'chrome' }));
    const ctx = await browser.newContext({ viewport: { width: 1000, height: 900 } });
    const p = await ctx.newPage(), errors = [], passed = [];
    p.on('pageerror', e => errors.push(e.message));
    await p.goto(base);
    await p.locator('#experimentSearch').waitFor();
    await p.evaluate(() => { localStorage.setItem('fun-science:muted', 'true'); Sci.muted = true; });
    const count = await p.evaluate(() => Sci.lessons.length);
    const duplicate = await p.evaluate(() => Sci.lessons.map(l => l.id).filter((v, i, a) => a.indexOf(v) !== i));
    assert.deepEqual(duplicate, []);
    const shape = await p.evaluate(() => ({
      counts: Sci.subjects.map(s => Sci.lessons.filter(l => l.subject === s.id).length),
      invalid: Sci.lessons.filter(l => l.quiz.length !== 2 || l.quiz.some(q => !Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)).map(l => l.id),
    }));
    assert.deepEqual(shape.invalid, []);
    assert(shape.counts.every(n => n === 16));
    // 离开尚在播放的实验，不能在另一页收到完成记录或奖励。
    await p.evaluate(() => { location.hash = '#/lesson/snowshoes'; });
    await p.locator('.compare-predict button').first().click();
    await p.getByRole('button', { name: '开始实验', exact: true }).click();
    await p.locator('.crumbs a').first().click();
    await p.waitForTimeout(1800);
    assert.equal(await p.evaluate(() => Sci.progress.stars('snowshoes')), 0);
    assert.equal(await p.locator('.compare-records').count(), 0);
    for (const [id, correct, measures] of cases) {
      await p.evaluate(id => { location.hash = '#/lesson/' + id; }, id);
      await p.locator('.compare-records').waitFor();
      const run = p.locator('.controls').getByRole('button', { name: '开始实验', exact: true });
      await run.click(); assert.match(await p.locator('.note').innerText(), /先选一个预测/);
      // 故意预测错，验证能依据证据修正，而不是奖励猜中。
      const predictions = p.locator('.compare-predict button');
      for (let k = 0; k < await predictions.count(); k++) if (await predictions.nth(k).innerText() !== correct) { await predictions.nth(k).click(); break; }
      await p.locator('.compare-answer').getByRole('button', { name: correct, exact: true }).click();
      assert.match(await p.locator('.note').innerText(), /两种条件都试过/);
      assert.equal(await p.locator('.goal.done').count(), 0);
      const conditions = p.locator('.compare-conditions button');
      for (let i = 0; i < 2; i++) {
        await conditions.nth(i).click(); await run.click();
        assert.equal(await conditions.first().isDisabled(), true);
        await p.waitForFunction(() => !document.querySelector('.controls button:disabled') || Array.from(document.querySelectorAll('.controls button')).some(b => b.textContent === '开始实验' && !b.disabled));
        assert((await p.locator('.compare-records tbody td').nth(i).innerText()).includes(measures[i]));
      }
      assert.equal(await predictions.first().isDisabled(), true);
      const answers = p.locator('.compare-answer button');
      for (let k = 0; k < await answers.count(); k++) if (await answers.nth(k).innerText() !== correct) { await answers.nth(k).click(); break; }
      assert.match(await p.locator('.note').innerText(), /不一致/);
      assert.equal(await p.locator('.goal.done').count(), 0);
      await answers.filter({ hasText: correct }).click();
      assert.match(await p.locator('.note').innerText(), /证据修正/);
      assert.equal(await p.locator('.goal.done').count(), 1);
      const stars = await p.evaluate(id => Sci.progress.stars(id), id);
      await answers.filter({ hasText: correct }).click(); assert.equal(await p.evaluate(id => Sci.progress.stars(id), id), stars);
      for (const width of [375, 768]) { await p.setViewportSize({ width, height: 900 }); assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, id + ' overflow'); }
      if (process.env.TEST_SCREENSHOT_DIR && ['snowshoes', 'filterboth'].indexOf(id) >= 0) {
        fs.mkdirSync(process.env.TEST_SCREENSHOT_DIR, { recursive: true });
        await p.locator('canvas.stage').scrollIntoViewIfNeeded();
        await p.screenshot({ path: path.join(process.env.TEST_SCREENSHOT_DIR, id + '.png'), fullPage: true });
      }
      await p.setViewportSize({ width: 1000, height: 900 });
      passed.push(id);
    }
    // 旧浏览器缺少 DOM API 时，仍应能完成同一学习流程。
    const old = await browser.newContext();
    await old.addInitScript(() => { delete Element.prototype.replaceChildren; delete Array.prototype.flat; window.PointerEvent = undefined; });
    const legacy = await old.newPage(); legacy.on('pageerror', e => errors.push(e.message));
    await legacy.goto(base + '#/lesson/snowshoes');
    await legacy.locator('.compare-predict button').first().click();
    for (let i = 0; i < 2; i++) { await legacy.locator('.compare-conditions button').nth(i).click(); await legacy.getByRole('button', { name: '开始实验', exact: true }).click(); await legacy.waitForFunction(() => Array.from(document.querySelectorAll('button')).some(b => b.textContent === '开始实验' && !b.disabled)); }
    await legacy.locator('.compare-answer').getByRole('button', { name: cases[0][1], exact: true }).click();
    assert.equal(await legacy.locator('.goal.done').count(), 1);
    await old.close();
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ lessons: count, completed: passed, legacy: 'passed', errors }, null, 2));
  } finally { if (browser) await browser.close(); if (server) await new Promise(r => server.close(r)); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
