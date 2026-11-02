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
cases.push(
  ['heatpath','材料不同，传热快慢不同',['较快','较慢']],
  ['aircup','空气占据空间，逸出后水才能补入',['水难以进入','水进入']],
  ['suction','密封和气压差帮助吸盘附着',['帮助压住','容易脱落']],
  ['springlaw','弹性范围内，力两倍时伸长约两倍',['1 格','2 格']],
  ['projectile','这组互余角在理想条件下射程相同',['较低','较高']],
  ['pairing','偶数能两两配完，奇数剩一个',['剩 1 个','没有剩余']],
  ['tenbundle','十个一可以表示成一个十',['共 10','仍是 10']],
  ['decimalzero','小数末尾添零，数值可以不变',['十分之三','十分之三']],
  ['triangleheight','底相同，高两倍则面积两倍',['16 平方格','32 平方格']],
  ['median','极端值会明显影响平均数',['平均数 4','平均数 8']],
  ['clearwater','透明不代表没有溶解的物质',['没有盐晶体','留下盐晶体']],
  ['emulsion','乳化能帮助油滴分散',['聚合成层','分散得更久']],
  ['evaparea','较大的暴露面积通常让蒸发更快',['剩水较多','剩水较少']],
  ['limewater','二氧化碳可与石灰水反应形成沉淀',['不明显浑浊','白色浑浊']],
  ['massfraction','盐不变，加水后质量分数降低',['占 10%','占 5%']],
  ['phototropism','幼苗新生长部分可朝光源弯曲',['向左弯','向右弯']],
  ['seedwings','翼状结构可能帮助随风传播',['移动较近','移动较远']],
  ['transpire','这些条件下较多叶片可蒸腾更多水',['少量水滴','较多水滴']],
  ['yeastgas','糖能给酵母提供可利用的原料',['产气较少','产气较多']],
  ['decomposers','分解者帮助物质循环',['分解很慢','养分回到环境']],
  ['shineReflect','发光与反射外部光不同',['都能看见','另一个变暗']],
  ['twinkle','大气扰动会影响看到的星光',['变化较小','变化较大']],
  ['spinOrbit','自转和公转是两种不同运动',['对应一天','对应一年']],
  ['parallax','同基线下近物视差较大',['夹角较大','夹角较小']],
  ['spaceExpand','相同比例膨胀中远处增加的距离更多',['增加 1 格','增加 3 格']],
  ['riverSlope','水受重力作用沿较低方向流动',['往右侧流','往左侧流']],
  ['wellwater','水位取决于补入和抽出的差额',['水位回升','水位下降']],
  ['rainshadow','山地抬升可造成迎风背风差别',['没有这次','背风较干']],
  ['heatIsland','地表材料和水分会影响升温',['升温较慢','升温较快']],
  ['saltevap','只蒸发水会提高剩余盐度',['3.5%','7%']],
  ['widebase','较宽支撑通常有助于侧向稳定',['可能侧翻','较大倾斜']],
  ['braceFrame','斜撑能限制框架变形',['平行四边形','变形较小']],
  ['parachuteArea','同条件下大伞面可降低稳定下落速度',['相对为 2','相对为 1']],
  ['parallelPipes','保持压差时相同并联支路可增大总流量',['出水 1 份','出水 2 份']],
  ['thermostat','反馈利用测量结果调整加热',['超过目标','目标附近']],
  ['stampOrder','指令顺序可能改变最终结果',['留在终点','留在起点']],
  ['loopBoundary','包含终点会多执行一次',['共 3 次','共 4 次']],
  ['accumulator','要累加就不能每轮擦掉前面的总数',['1、3、6、10','最终为 4']],
  ['binaryPrerequisite','二分查找依赖有序数据',['找到 5','未找到 5']],
  ['greedycoins','局部最大不保证总枚数最少',['3 枚','2 枚']],
  ['rgbLight','光的加色混合与颜料混合不同',['黄色','白色']],
  ['imagebits','像素数相同，记录精细程度也影响大小',['2 字节','16 字节']],
  ['passwordSpace','增加两位使组合数变为一百倍',['100 种','10000 种']],
  ['cache','缓存可减少重复传输',['下载 3 次','复用 2 次']],
  ['testsplit','训练成绩不能替代独立测试成绩',['6 题全对','答对 3 题']],
  ['reusecup','重复使用能减少这里的杯子件数',['5 只杯','1 只杯']],
  ['packageSpace','满足保护需求后可避免过度包装',['空位较少','空位较多']],
  ['dripleak','很小的持续损失也会累积',['4.32 升','0 升']],
  ['pollinatorDiversity','功能相近的多种生物可提供一定缓冲',['缺少传粉服务','部分传粉']],
  ['lifecycle','使用次数会改变这本模型账的比较结果',['耐用品 51 点','耐用品 56 点']],
);
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
    assert(shape.counts.every(n => n === 21));
    // 离开尚在播放的实验，不能在另一页收到完成记录或奖励。
    await p.evaluate(() => { location.hash = '#/lesson/snowshoes'; });
    await p.locator('.compare-predict button').first().click();
    await p.getByRole('button', { name: '开始实验', exact: true }).click();
    await p.locator('.crumbs a').first().click();
    await p.waitForTimeout(1800);
    assert.equal(await p.evaluate(() => Sci.progress.stars('snowshoes')), 0);
    assert.equal(await p.locator('.compare-records').count(), 0);
    const selectedCases = process.env.TEST_CASE_IDS ? cases.filter(row => process.env.TEST_CASE_IDS.split(',').indexOf(row[0]) >= 0) : cases;
    for (const [id, correct, measures] of selectedCases) {
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
        if (process.env.TEST_SCENE_DIR) {
          fs.mkdirSync(process.env.TEST_SCENE_DIR, { recursive: true });
          const pixels = await p.locator('canvas.stage').evaluate(cv => cv.toDataURL('image/png').split(',')[1]);
          fs.writeFileSync(path.join(process.env.TEST_SCENE_DIR, id + '-' + i + '.png'), Buffer.from(pixels, 'base64'));
        }
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
