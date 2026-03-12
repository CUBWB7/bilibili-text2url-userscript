# 项目修改记录

## v0.1.0 初版

日期：2026-03-11

### 完成内容

- 初始化项目结构，使用 `TypeScript + pnpm + Vitest + esbuild`
- 实现 B 站纯文本网址转链接的 userscript
- 支持以下区域：
  - 视频简介
  - 评论区
  - 动态正文
- 支持动态加载后的内容再次处理
- 自动跳过已有链接
- 点击后在新标签页打开
- 避免将 `1.2万`、`3.14`、`v1.2.3` 等文本误识别为网址

### 发布整理

- 补充了 userscript 元数据
- 补充了 `LICENSE`
- 调整了 README
- 生成并提交了 `dist/bilibili-text2url.user.js`
- 发布到 GitHub 与 Greasy Fork

## v0.1.1 评论区兼容修复

日期：2026-03-12

### 问题现象

- 某些 B 站视频评论区中的网址没有被转成链接
- 典型场景包括：
  - `https://www.kdocs.cn/...【文件】`
  - `https://pan.baidu.com/... 提取码: xxxx`

### 根因分析

这次问题并不是单一原因，而是两类问题叠加：

1. **URL 后紧跟中文标签时，旧规则会把标签一起吞进网址**
   - 例如 `【文件】`
   - 导致整段网址校验失败，最终不生成链接

2. **B 站新版评论区使用了多层 Web Component 和 Shadow DOM**
   - 评论正文不在普通 DOM 里
   - 一部分文本在 `bili-rich-text` 的 `shadowRoot` 中
   - 还有一些评论是“外层组件的 shadowRoot 里再嵌套 `bili-rich-text`”
   - 旧实现无法跨多层 shadow DOM 找到并监听这些节点

### 本次修复

- 收紧 URL 匹配规则，避免把 `【文件】` 之类中文标签并入链接
- 增加对 `bili-rich-text` 评论组件的处理
- 增加跨多层 shadow DOM 的目标查找能力
- 增加跨多层 shadow DOM 的文本扫描能力
- 增加对这些 shadowRoot 内部异步渲染内容的监听
- 统一脚本生成链接的样式为：
  - 蓝色
  - 无下划线

### 新增验证

- 增加了针对以下场景的自动化测试：
  - URL 后跟中文标签
  - `bili-rich-text` 内部文本扫描
  - 嵌套在外层 shadowRoot 中的评论目标发现
  - 多层 shadow DOM 中的初次扫描
  - 多层 shadow DOM 中的动态内容监听
  - 链接样式统一为无下划线

### 当前状态

- 本地测试通过
- 本地类型检查通过
- 本地构建通过
- 已在真实 B 站评论场景中人工验证通过
