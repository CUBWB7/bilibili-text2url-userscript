# Bilibili使用增强-文本网址转链接（Text to URL）

一个面向 B 站的油猴脚本。

它会把视频简介、评论区、动态正文中的纯文本网址转换成可点击链接，并在新标签页打开；已经是链接的内容不会重复处理，`1.2万`、`3.14`、`v1.2.3` 这类文本也不会被误识别成网址。

此脚本仅供个人学习与交流使用。

## 功能

- 支持视频简介中的纯文本网址
- 支持评论区中的纯文本网址
- 支持动态正文中的纯文本网址
- 支持页面动态加载后的新内容
- 自动跳过已有链接

## 安装

1. 安装 Violentmonkey 或 Tampermonkey
2. 打开 `dist/bilibili-text2url.user.js`
3. 新建脚本并粘贴内容，或直接导入
4. 保存后访问 B 站页面进行测试

## 反馈

- 仓库主页：`https://github.com/CUBWB7/bilibili-text2url-userscript`
- 问题反馈：`https://github.com/CUBWB7/bilibili-text2url-userscript/issues`

## 开发

安装依赖：

```bash
corepack pnpm install
```

运行测试：

```bash
corepack pnpm test
```

构建脚本：

```bash
corepack pnpm build
```

构建完成后，可安装文件位于 `dist/bilibili-text2url.user.js`。
