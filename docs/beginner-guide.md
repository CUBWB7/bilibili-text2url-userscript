# 项目实现说明（面向初学者）

这份文档专门写给刚接触编程、刚开始读前端脚本项目的人。目标不是让你一次看懂所有代码，而是让你知道：

- 这个项目是做什么的
- 它大致怎么工作
- 遇到问题时该从哪里开始看
- 你以后想继续改功能时，应该先动哪几部分

---

## 1. 这个项目是做什么的

这是一个 B 站 userscript（油猴脚本）。

它会在 B 站页面里找到“本来只是普通文字的网址”，把它变成可点击的链接。例如：

- `https://example.com`
- `www.example.com`
- `pan.baidu.com/...`

这样用户不用手动复制网址再粘贴打开。

---

## 2. 这个项目解决了什么难点

表面上看，这个需求像是“用正则把网址找出来，再包一层 `<a>` 标签”。  
但实际上有几个难点：

1. **不能误判**
   - 例如 `1.2万`
   - 或 `v1.2.3`
   - 这些看起来有点，但并不是网址

2. **不能破坏原页面**
   - 已经是链接的内容不能再包一次
   - 不能直接重写整块 HTML

3. **B 站很多内容是动态加载的**
   - 页面打开后，评论是后来才渲染出来的
   - 展开简介、加载新评论，也会继续插入 DOM

4. **B 站评论区用了 Shadow DOM**
   - 有些评论文字不在普通 DOM 里
   - 必须进入组件内部才能读到真实文本

---

## 3. 项目的整体结构

你可以把这个项目理解成 5 层：

1. **入口层**
   - 脚本启动
   - 判断当前是不是支持的 B 站页面

2. **目标查找层**
   - 找到简介、评论、动态正文这些可处理区域

3. **文本扫描层**
   - 在目标区域里找到真正的文本节点
   - 跳过已有链接、按钮、输入框等不该碰的区域

4. **URL 识别层**
   - 判断一段文本里哪些部分是真网址
   - 过滤误判

5. **DOM 替换层**
   - 把匹配到的网址替换成真正的 `<a>`

---

## 4. 关键文件说明

### 4.1 入口文件

文件：`src/userscript/main.ts`

它负责：

- 脚本启动
- 注入链接样式
- 找到当前页面可处理的区域
- 初次扫描页面
- 启动 `MutationObserver` 处理后续动态内容

你可以把它理解成“总调度器”。

---

### 4.2 B 站目标区域

文件：

- `src/site/bilibili/selectors.ts`
- `src/site/bilibili/targets.ts`
- `src/site/bilibili/page-type.ts`

它们负责：

- 判断当前是不是 B 站视频页/动态页
- 维护“哪些选择器对应简介、评论、动态正文”
- 在普通 DOM 和 shadow DOM 中找出这些目标节点

如果以后 B 站改版了，最先要看的通常就是这几份文件。

---

### 4.3 文本扫描

文件：

- `src/core/dom/collect-text-nodes.ts`
- `src/core/dom/shadow-roots.ts`
- `src/core/dom/processed-markers.ts`

它们负责：

- 遍历目标区域中的文本节点
- 跳过已有链接
- 处理多层 shadow DOM
- 避免重复处理已经生成过的链接

这部分是“能不能找到评论真实文字”的关键。

---

### 4.4 URL 识别

文件：

- `src/core/url/find-url-candidates.ts`
- `src/core/url/normalize-url.ts`
- `src/core/url/validate-url-candidate.ts`
- `src/core/url/trim-trailing-punctuation.ts`

它们负责：

- 找出疑似网址片段
- 去掉尾部不属于网址的标点
- 把不带协议头的地址补成 `https://`
- 拒绝小数、版本号、纯数字点号这类误判

如果以后某类网址没识别到，或者误判了，大概率是这里需要改。

---

### 4.5 DOM 替换

文件：`src/core/dom/linkify-text-node.ts`

它负责把一个普通文本节点拆成：

- 前半段普通文本
- 中间的链接 `<a>`
- 后半段普通文本

这样可以只改网址那一小段，而不是重写整块评论 HTML。

---

### 4.6 动态监听

文件：

- `src/core/watch/start-observer.ts`
- `src/core/watch/mutation-batcher.ts`

它们负责：

- 监听页面后续新增的内容
- 包括评论区后加载出来的内容
- 包括 shadow DOM 内部后来才出现的文字

这是保证“刚打开页面没有、滚动后才出现的评论也能被处理”的关键。

---

### 4.7 样式

文件：`src/styles/generated-link.ts`

这里定义脚本生成链接的样式。  
目前统一为：

- 蓝色
- 无下划线

如果以后你想改颜色、悬停效果、是否显示下划线，就改这个文件。

---

## 5. 脚本实际运行流程

你可以把它想成下面这个顺序：

1. 浏览器打开 B 站页面
2. userscript 启动
3. `main.ts` 判断当前页面是否支持
4. 找到简介 / 评论 / 动态正文这些目标区域
5. 进入这些区域，收集文本节点
6. 对每个文本节点做 URL 识别
7. 把识别出的 URL 替换成 `<a>`
8. 启动监听器，等待后续页面动态插入的新内容
9. 如果新内容出现，再重复 4 到 7

---

## 6. 为什么评论区这次会出问题

你这次遇到的问题非常典型，也很有学习价值。

最开始我们以为：

- 是评论区选择器没命中
- 或者是 URL 正则不够准确

后来通过你提供的开发者工具信息，确认真实情况是：

- 评论正文在 `bili-rich-text` 组件里
- 文字在它的 `shadowRoot` 中
- 外面还有一层更大的组件，也用了 `shadowRoot`

这说明真实网页经常不是“普通 HTML”，而是多层组件嵌套。  
所以脚本如果只会扫 `document.querySelectorAll(...)`，就容易漏掉这种内容。

这也是为什么这次修复重点不是“再改一个正则”，而是补齐：

- 多层 shadow DOM 查找
- 多层 shadow DOM 监听

---

## 7. 测试是怎么帮我们定位问题的

这个项目用了 `Vitest`。

测试文件在 `tests/unit/` 下，主要分几类：

- `url/`
  - 测 URL 识别是否正确
- `dom/`
  - 测文本节点收集和链接替换
- `site/bilibili/`
  - 测 B 站目标节点查找
- `userscript/`
  - 测脚本启动和动态监听
- `styles/`
  - 测样式配置

这次修复时，我们就是先写了失败测试：

- URL 后有 `【文件】`
- `bili-rich-text` 在 shadowRoot 里
- `bili-rich-text` 在外层 shadowRoot 里面
- 评论内容是后来动态渲染进去的

有了这些测试，修起来就不容易偏。

---

## 8. 本地开发时常用命令

安装依赖：

```bash
corepack pnpm install
```

运行测试：

```bash
corepack pnpm test
```

类型检查：

```bash
corepack pnpm typecheck
```

构建 userscript：

```bash
corepack pnpm build
```

最终脚本文件在：

`dist/bilibili-text2url.user.js`

---

## 9. 如果你以后想继续改功能，建议从哪里下手

### 想支持更多 B 站区域

先看：

- `src/site/bilibili/selectors.ts`
- `src/site/bilibili/targets.ts`

### 想提高网址识别准确率

先看：

- `src/core/url/find-url-candidates.ts`
- `src/core/url/validate-url-candidate.ts`

### 想改链接样式

先看：

- `src/styles/generated-link.ts`

### 想处理“页面打开后才出现的新内容”

先看：

- `src/core/watch/start-observer.ts`
- `src/core/watch/mutation-batcher.ts`

---

## 10. 给初学者的建议

读这个项目时，不要一上来就从头到尾读全部代码。

更推荐这个顺序：

1. `src/userscript/main.ts`
2. `src/site/bilibili/selectors.ts`
3. `src/site/bilibili/targets.ts`
4. `src/core/url/find-url-candidates.ts`
5. `src/core/dom/linkify-text-node.ts`
6. `src/core/watch/start-observer.ts`
7. 对应的测试文件

这样你会先理解“流程”，再理解“细节”。

如果你想继续维护这个项目，一个很好的习惯是：

- 先找到“问题属于哪一层”
- 再写一个能复现问题的小测试
- 然后只改那一层的代码

这比看到问题就直接改正则、改选择器，稳定得多。
