# OpenEmoji

一个静态生成的 emoji 词典站：每个 emoji 有独立页面，讲清楚它**在中文语境里到底什么意思、怎么用、什么时候别用**。附颜文字、组合器、emoji 装饰、场景化标签和英文版。

纯静态输出，零后端、零运行时依赖，`npm run gen` 一条命令产出整站。

## 它解决什么问题

搜索引擎里搜 "🙂 什么意思"，出来的多半是抄来抄去的"微笑"。实际情况是：🙂 在年轻人手里是礼貌的拒绝，😂 已经算老派，💀 才是现在的笑。这个站收录的是**语用信息**——同一表情在不同代际、不同平台、不同文化里的解读差异，以及哪些表情容易冒犯到人。

## 站点内容

| 路径 | 内容 |
| --- | --- |
| `/index.html` | 首页：全部 emoji，按 9 大分类分组，客户端搜索 |
| `/g/<group>.html` | 分类页，带人工导语 |
| `/e/<name>.html` | 单个 emoji 详情页（约 3600 个），含含义、用法、变体、相关表情 |
| `/s/<slug>.html` | 场景页：骂人不带脏字、表白、道钱、摸鱼…… |
| `/kaomoji/` | 颜文字库，按情绪分类 |
| `/combo.html` | 组合器：拼多字符 emoji 序列 |
| `/decorate.html` | 装饰器：给文字加 emoji 边框/间隔 |
| `/trending/` | 趋势榜单 |
| `/en/` | 英文版（同一套模板，文案独立） |

## 构建

需要 Node 18+ 和 npm。

```bash
npm install
npm run gen            # 产出到 ./site
```

指定部署域名（canonical / `og:url` / sitemap / robots.txt 全部依赖它）：

```bash
SITE_URL=https://your-domain.example npm run gen
```

不传 `SITE_URL` 时会回落到脚本里的默认值并打印警告——上线前确认它指向你自己的域名。

构建结束会跑一遍自检（内部链接、缺失的 `app.js` 引用、文件数量等），有问题会在终端列出。

## 部署

`site/` 是纯静态目录，直接丢给任意静态托管即可。Cloudflare Pages 配置：

- Build command: `npm run gen`
- Build output directory: `site`
- 环境变量：`SITE_URL=https://你的域名`

`site/_headers` 已包含缓存策略和安全响应头。

## 目录结构

```
generate.mjs        生成器主体（模板、路由、自检）
scenes.mjs          场景标签数据（人工整理）
kaomoji.mjs         颜文字数据
trending.mjs        趋势榜单数据
editorial.mjs       中文长尾文案
editorial-en.mjs    英文长尾文案
i18n.mjs            UI 文案 / 分类名 / 页面元信息（zh + en）
og.html             og:image 的源模板
site/               构建产物，不入库
```

数据来源只有两个 npm 包：`unicode-emoji-json`（名称/分组/关键词）和 `cldr-annotations-full`（Unicode CLDR 的 zh/en 注释）。emoji 图形在构建时从 `openmoji` / `@discordapp/twemoji` / `emoji-datasource-google` 复制进 `site/assets/`。

## 贡献

- 文案、场景标签、颜文字都欢迎补。改 `.mjs` 里的数据即可，不用碰生成器。
- 新增文案请保持和现有风格一致：说人话，讲具体用法，别写"这个表情表示开心"这种废话。
- 提交前跑一次 `npm run gen`，确认自检通过。

## 联系

- 邮箱：hello@openemoji.com
- 仓库：https://github.com/steley/openemoji

## 许可

- 代码：MIT（`LICENSE`）
- 站内图形：OpenMoji（CC BY-SA 4.0）、Twemoji（CC BY 4.0）、Noto Emoji（Apache-2.0）
- 数据：Unicode CLDR（Unicode License v3）、`unicode-emoji-json`（MIT）

**部署生成站时请保留页脚的图形来源署名。** OpenMoji 是 share-alike，细节见 [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md)。

本项目与 Unicode Consortium 无隶属关系。
