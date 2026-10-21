# OpenEmoji

一个静态生成的 emoji 词典站：每个 emoji 有独立页面，讲清楚它**在中文语境里到底什么意思、怎么用、什么时候别用**。附颜文字、组合器、emoji 装饰、场景化标签和英文版。

纯静态输出，零后端、零运行时依赖，`npm run gen` 一条命令产出整站。

## 它解决什么问题

搜索引擎里搜 "🙂 什么意思"，出来的多半是抄来抄去的"微笑"。实际情况是：🙂 在年轻人手里是礼貌的拒绝，😂 已经算老派，💀 才是现在的笑。这个站收录的是**语用信息**——同一表情在不同代际、不同平台、不同文化里的解读差异，以及哪些表情容易冒犯到人。

## 站点内容

| 路径 | 内容 | 页数 |
| --- | --- | --- |
| `/index.html` | 首页：全部 emoji，按 9 大分类分组，客户端搜索 | 1 |
| `/g/<group>.html` | 分类页，带人工导语 | 9 |
| `/e/<name>.html` | 单个 emoji 详情页，含含义、用法、变体、相关表情 | 1870 |
| `/s/<slug>.html` | 场景页：骂人不带脏字、表白、道钱、摸鱼…… | 12 |
| `/kaomoji/` | 颜文字库，按情绪分类 | 10 |
| `/combo.html` | 组合器：拼多字符 emoji 序列 | 1 |
| `/decorate.html` | 装饰器：给文字加 emoji 边框/间隔 | 1 |
| `/preview.html` | 多平台渲染预览 | 1 |
| `/trending/` | 梗解读 | 11 |
| `/en/` | 英文版（独立文案，非机翻） | 70 |

中文 1916 页 + 英文 70 页。其中 100 个中文 emoji 页面和 60 个英文页面有**人工撰写的语用解读**（`editorial.mjs` / `editorial-en.mjs`），其余页面走数据驱动模板——这部分只负责长尾覆盖，不指望排名。

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

构建结束会跑一遍自检，以下任意一项不通过就 `exit 1`：

- 页面缺 canonical / 缺 JSON-LD
- 页面有 `BreadcrumbList` 但没有可见面包屑
- `hreflang` 指向不存在的页面，或英文页缺 `hreflang`
- 站内链接落到不存在的文件、`app.js` 引用失效
- 标题重复文本，或 `editorial*.mjs` 里写了不存在的 slug

## 多语言

中文在根路径，英文在 `/en/`（不用子域名，避免权重拆分）。`hreflang` 由构建脚本推导：只有英文页真实存在时，中文页才输出 `zh-CN / en / x-default` 三件套，绝不指向 404。canonical 各语言自引用。

英文内容写进 `editorial-en.mjs`（按英文互联网语境重写，不是中文条目的翻译）。加一个 slug 会自动产出详情页、更新 hreflang、进 `sitemap-en.xml` 和英文首页列表。

站点地图拆成三个：`sitemap-zh.xml` / `sitemap-en.xml` / `sitemap.xml`（索引）。`robots.txt` 只指向索引文件。

## 部署

`site/` 是纯静态目录，直接丢给任意静态托管即可。Cloudflare Pages 配置：

- Build command: `npm run gen`
- Build output directory: `site`
- 环境变量：`SITE_URL=https://你的域名`

`site/_headers` 已包含缓存策略和安全响应头，`site/404.html` 会被 Pages 自动接管。

上线前确认三件事：

1. 域名已解除停放，根路径返回的是本站首页（不是停放商的跳转页）
2. `curl -s https://你的域名/sitemap.xml | head -3` 返回 `<sitemapindex>`
3. 构建时 `SITE_URL` 用的是真实域名，否则 canonical 全长在错的地方

## 目录结构

```
generate.mjs        生成器主体（模板、路由、自检）
scenes.mjs          场景标签数据（人工整理）
kaomoji.mjs         颜文字数据
trending.mjs        趋势榜单数据
editorial.mjs       中文长尾文案
editorial-en.mjs    英文长尾文案
i18n.mjs            UI 文案 / 分类名 / 页面元信息（zh + en）
og.html             og:image 的源模板（改完用无头 Chrome 重新截 og.png）
og.png              1200×630 分享图，构建时复制进 site/
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
