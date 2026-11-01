# 趣味科学乐园：Codex 开发约定

## 产品和沟通
- 用简体中文与用户沟通，说明结果、验证情况和仍需用户在平板上确认的部分。
- 面向 7～12 岁儿童，由浅入深；保留动画、动手任务、知识点、两道小考验和朗读。
- 接手基线为 10 科、150 课，每科 5 级，每级 3 课；增加课程后从注册数据重新统计，不要写死总数。
- 现有科目：physics、math、chemistry、biology、astronomy、geography、engineering、coding、infotech、health。

## 目录和运行
- 本项目是 HTML/CSS/原生 JavaScript 静态站，无前端构建步骤；不要为普通功能改动引入框架。
- `index.html` 按顺序加载经典脚本，`js/core.js` 提供全局 `Sci`，`js/app.js` 负责路由和实验 API。
- `js/lessons/*.js` 调用 `Sci.register` 注册课程；`coding.js` 定义 `Sci.codeGrid`，必须在 coding2/3.js 之前加载。
- 新建课程脚本要同时加入 `index.html`；维护 README 的课程表和说明。
- 本地预览：从仓库根目录运行 `node tools/serve.js`，默认端口 8000。
- 用户用 `启动平板访问.bat` 开启同 Wi-Fi 平板访问；保留现有端口和旧服务替换机制。
- `tools/package.json` 只用于工具依赖；需要生成音频时先在 tools 目录执行 `npm ci`。

## 必须保留的兼容性
- 用户平板浏览器较旧，曾因缺少 replaceChildren 等功能整页空白；新 API 必须有兼容处理。
- 保留 core.js 中的兼容层、index.html 的加载错误提示，以及鼠标/触摸事件回退。
- 不依赖新表情符号表达关键含义；画布上的重要图形优先直接绘制。
- 使用 `mount(api)` 提供的 pointer、loop、on、timeout 等方法，离开课程时清理动画、监听和计时器。
- 星星保存在 localStorage 的 `fun-science:` 下。保留已有课程 id 和存储格式；不要清空真实用户的进度。
- localStorage 按网址与设备隔离；现有项目没有账号和跨设备同步。

## 朗读
- 这台平板的浏览器无法可靠合成中文；必须保留预生成 MP3 回退和首次点击解锁音频。
- 设备中文语音、`audio/manifest.json` 对应的 MP3、局域网 `/api/tts` 共同构成现有朗读方案。
- GitHub Pages 只有静态文件，没有 `/api/tts`，固定朗读必须随站点提供。
- 修改 intro、fact、quiz、欢迎语或额外朗读文本后，在 Windows 上运行 `node tools/build-audio.js`。
- build-audio.js 与 core.js 的文字清理和 textKey 算法必须一致；更新时一起提交 manifest 和对应 MP3。
- 音频生成依赖 Windows System.Speech 中文语音；`tools/tts-cache` 和 tools/node_modules 不上传。

## 验证
- 根据改动范围执行 `node --check`；检查注册 id 不重复、课件在入口中加载、每课两题且答案有效。
- 改动交互时实际操作对应实验，检查目标能完成、反馈正确、切页后动画清理、手机宽度无横向溢出。
- 朗读改动检查文字与 manifest 匹配、音频可加载与播放；不能把下载成功描述为亲耳听到声音。
- 明确区分语法/数据检查、桌面浏览器模拟和真实平板验证；不能沿用旧聊天中“全测通过”的说法作为新测试证据。
- 健康、急救等内容采用可靠来源；简化科学模型应说明适用范围，避免产生误解。

## GitHub 与发布
- 仓库：https://github.com/handsun85s/fun-science
- 在线站点：https://handsun85s.github.io/fun-science/
- 当前发布沿用 main 分支根目录 GitHub Pages；保留 `.nojekyll`，所有资源路径要适应 `/fun-science/` 子路径。
- 先检查 git status，保留用户改动；不强制推送，不改写已发布历史。需要新分支时使用 codex/ 前缀。
- 用户已授权此项目后续更新同步 GitHub；完成相关代码与音频检查后再发布，并确认远端与 Pages 构建状态。
- 认证以本次实际检查为准，不根据 Claude 历史假定已登录。不输出访问令牌，不在文件或聊天里索要密码。
- Claude Artifact 是旧的额外发布渠道；只有具备对应工具并实际发布后，才能声称已更新私密链接。
- 换电脑或聊天时，以本文件、README、Git 历史和实际代码为准；不依赖 Claude 临时目录或外部记忆文件。
