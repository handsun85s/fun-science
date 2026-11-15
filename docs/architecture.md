# 项目架构

网站用原生 HTML、CSS 和 JavaScript，直接部署到 GitHub Pages。家中有需要时可用 Node.js 提供局域网访问。静态方案与现有平板、免安装访问及当前维护方式相符。

| 模块 | 职责和约束 |
| --- | --- |
| `index.html`、`css/style.css` | 入口和移动端布局。经典脚本按依赖顺序加载，保留启动失败提示和手机窄屏布局。 |
| `js/core.js`、`js/app.js` | 提供课程注册、朗读、进度和路由。课程挂载后的动画、监听和定时器由课程接口管理，切页时清理。 |
| `js/lessons/` | 课程数据、互动逻辑和画布场景。查找课程靠稳定 ID，旧 ID 关联已保存的进度。 |
| `audio/`、`tools/build-audio.js` | 预生成中文 MP3。前端与生成脚本对同一文本执行相同的清理和哈希，用清单找到对应文件。 |
| `tools/serve.js`、`tools/tts.js` | 家庭局域网服务器和 Windows 中文语音补充。默认端口 8000，MP3 支持范围读取。 |

入口加载课程注册数据，用户从首页搜索或科目列表进入实验。任务与答题状态写入浏览器的 `fun-science:` 本地存储。静态站用相对资源路径适配 `/fun-science/`。老平板依赖 DOM 兼容层、鼠标或触摸事件回退与预生成朗读。

运行与发布见 [README](../README.md) 和 [AGENTS.md](../AGENTS.md)。在仓库根目录执行 `node tools/serve.js` 可预览。在 `tools` 安装依赖后运行 `npm run test:quiz` 和 `npm run test:comparisons`。固定朗读文本改动后，在有中文语音的 Windows 环境执行 `node tools/build-audio.js`。
