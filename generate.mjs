// OpenEmoji static site generator
// Input: unicode-emoji-json + cldr-annotations-full (en/zh)
// Output: ./site — fully static, Cloudflare Pages ready
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = new URL('.', import.meta.url).pathname;
const OUT = path.join(ROOT, 'site');
const NM = path.join(ROOT, 'node_modules');

// 部署域名：canonical / og:url / sitemap / robots 全部依赖它。
// 换域名只改这里或构建时 SITE_URL=https://xxx pnpm gen
const SITE_URL = (process.env.SITE_URL || 'https://openemoji.com').replace(/\/+$/, '');
if (!process.env.SITE_URL) console.warn(`⚠ SITE_URL 未显式指定，canonical/sitemap 使用默认 ${SITE_URL} —— 上线前确认这个域名确实指向本站`);

// 站点图标（内联 SVG，无额外请求）
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset=".55" stop-color="#ec4899"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs><rect width="64" height="64" rx="15" fill="url(#g)"/><circle cx="23" cy="26" r="4" fill="#fff"/><circle cx="41" cy="26" r="4" fill="#fff"/><path d="M20 38c4 6 20 6 24 0" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`;


const groupsRaw = require(`${NM}/unicode-emoji-json/data-by-group.json`);
const groupsData = Array.isArray(groupsRaw)
  ? groupsRaw
  : Object.entries(groupsRaw).map(([name, emojis]) => ({ name, emojis }));
const en = require(`${NM}/cldr-annotations-full/annotations/en/annotations.json`).annotations.annotations;
const zh = require(`${NM}/cldr-annotations-full/annotations/zh/annotations.json`).annotations.annotations;
import { SCENES } from './scenes.mjs';
import { TRENDING } from './trending.mjs';
import { KAOMOJI } from './kaomoji.mjs';
import { EDITORIAL } from './editorial.mjs';
import { EDITORIAL_EN } from './editorial-en.mjs';
import { LOCALES, DEFAULT_LOCALE, X_DEFAULT_LOCALE, UI, GROUP_EN, HOME_EN, EMOJI_EN } from './i18n.mjs';

const GROUP_ICONS = {
  'Smileys & Emotion': '😀', 'People & Body': '👋', 'Animals & Nature': '🐼',
  'Food & Drink': '🍔', 'Travel & Places': '✈️', 'Activities': '⚽',
  'Objects': '💡', 'Symbols': '❤️', 'Flags': '🏁',
};
const GROUP_ZH = {
  'Smileys & Emotion': '笑脸与情感', 'People & Body': '人物与身体', 'Animals & Nature': '动物与自然',
  'Food & Drink': '食物与饮料', 'Travel & Places': '旅行与地点', 'Activities': '活动',
  'Objects': '物品', 'Symbols': '符号', 'Flags': '旗帜',
};
// 分类页的人工导语 + meta description（避免「共 N 个」这种空描述）
const GROUP_INTRO = {
  'Smileys & Emotion': {
    desc: '笑脸、哭脸、生气、心虚——聊天里最常用的一大类 emoji，附中文含义与真实用法。',
    lead: '这一组是聊天里出现频率最高的 emoji。同一个表情在不同代际之间的解读可能完全相反：🙂 在年轻人手里是礼貌拒绝，😂 已经算「老派」，💀 才是现在的笑。挑之前先想清楚发给谁。',
  },
  'People & Body': {
    desc: '手势、动作、人物 emoji 的中文含义：👍🙏💪 到底该怎么用，哪些容易冒犯。',
    lead: '手势类 emoji 是最容易出事的：👍 在部分语境里等于「懒得回你」，🙏 既能道谢也能拜托，🖕 则是明确的攻击。同一个动作在不同文化里的含义差别很大，发给不熟的人之前先确认一遍。',
  },
  'Animals & Nature': {
    desc: '动物、植物、天气 emoji 的中文含义与常见用法，含 🐼🌸🌙 等高频表情。',
    lead: '动物和天气 emoji 通常按字面理解就不会出错，例外集中在谐音梗上：🐟 常被用来指「余」，🦆 偶尔代「呀」，🌿 有「草」的双关。用法上没有太多坑，适合当文案的装饰。',
  },
  'Food & Drink': {
    desc: '食物饮料 emoji 的含义与用法：☕🍜🍺 在聊天里代表什么，哪些带双关。',
    lead: '食物 emoji 大部分就是字面意思，但也有几个被网络语境改写：☕ 变成「先歇会儿」，🍑 和 🍆 在熟人之间是荤梗。点外卖、写菜谱时按本义用；发朋友圈时按语境用。',
  },
  'Travel & Places': {
    desc: '交通、地点、天气场景 emoji 的中文含义，含 ✈️🏠🌍 等常用表情与搭配。',
    lead: '旅行类 emoji 信息密度高，适合代替文字：✈️ 是出发，🏖️ 是度假，🌃 是城市夜景。写行程、发游记时把地点 emoji 放在句首，比纯文字更容易被扫读。',
  },
  'Activities': {
    desc: '运动、娱乐、庆祝类 emoji 的含义与用法，含 ⚽🎮🎉 等常用表情。',
    lead: '活动类 emoji 大多用在「宣布」和「庆祝」两种场合：🎉 是通用庆祝，🏆 强调名次，🎮 是游戏语境。数量不多，但辨识度最高，适合当标题的点缀。',
  },
  'Objects': {
    desc: '日常物品 emoji 的中文含义与使用场景：📱💡🔔 等，含职场与生活语境。',
    lead: '物品类 emoji 是清单和通知的最佳配角：📌 标记重点，🔔 提醒，📎 附件。它们的共同特点是含义稳定、不容易被误读，适合放在工作场景里。',
  },
  'Symbols': {
    desc: '符号类 emoji：❤️✅⚠️💯 等的中文含义、强调用法与常见误用。',
    lead: '符号类 emoji 承担了大部分「语气」工作：✅ 表示确认，⚠️ 表示风险，💯 表示判断正确。它们比表情更中性，适合工作沟通；但也正因为中性，用错时显得格外冷。',
  },
  'Flags': {
    desc: '各国国旗 emoji 的完整列表与复制：按国家英文名排列，含地区旗帜。',
    lead: '国旗 emoji 按 ISO 国家代码映射到 Unicode，绝大多数设备和平台都能完整显示。需要注意英格兰、苏格兰、威尔士使用的是「地区旗帜」序列，部分安卓机型会显示成黑白或方框。',
  },
};
// emoji 版本 -> 系统支持起点（用于详情页的兼容性说明）
const VERSION_SUPPORT = {
  '0.6': ['2010', 'iOS 6', 'Android 4.4'], '0.7': ['2010', 'iOS 6', 'Android 4.4'],
  '1.0': ['2015', 'iOS 9.1', 'Android 6.0'], '2.0': ['2015', 'iOS 9.1', 'Android 7.0'],
  '3.0': ['2016', 'iOS 10.2', 'Android 7.1'], '4.0': ['2016', 'iOS 10.2', 'Android 7.1'],
  '5.0': ['2017', 'iOS 11.1', 'Android 8.0'], '11.0': ['2018', 'iOS 12.1', 'Android 9'],
  '12.0': ['2019', 'iOS 13.2', 'Android 10'], '12.1': ['2019', 'iOS 13.3', 'Android 10'],
  '13.0': ['2020', 'iOS 14.2', 'Android 11'], '13.1': ['2020', 'iOS 14.5', 'Android 11'],
  '14.0': ['2021', 'iOS 15.4', 'Android 12L'], '15.0': ['2022', 'iOS 16.4', 'Android 13'],
};

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const CSS = `
:root{
  --bg:#fbfbfd;--card:#ffffff;--ink:#111118;--muted:#6e6e7a;--line:#e8e8ee;
  --a1:#7c3aed;--a2:#ec4899;--a3:#f97316;
  --grad:linear-gradient(120deg,#7c3aed,#ec4899 55%,#f97316);
  --shadow:0 1px 2px rgba(17,17,24,.04),0 8px 24px -12px rgba(17,17,24,.12);
  --shadow-lg:0 20px 50px -20px rgba(124,58,237,.35);
  --radius:18px;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI Variable","Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;background:var(--bg);color:var(--ink);line-height:1.65;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
::selection{background:#ede9fe}
header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.75);backdrop-filter:blur(16px) saturate(1.6);-webkit-backdrop-filter:blur(16px) saturate(1.6);border-bottom:1px solid var(--line)}
.hwrap{max-width:1060px;margin:0 auto;padding:12px 24px;display:flex;align-items:center;gap:16px}
.logo{font-size:20px;font-weight:800;letter-spacing:-.6px;white-space:nowrap;display:flex;align-items:center;gap:8px}
.logo .dot{width:30px;height:30px;border-radius:9px;background:var(--grad);display:grid;place-items:center;font-size:17px;box-shadow:var(--shadow)}
.logo b{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.search-wrap{flex:1;position:relative}
.search{width:100%;padding:10px 16px 10px 42px;font-size:15px;border:1px solid var(--line);border-radius:99px;background:var(--bg);outline:none;transition:all .15s}
.search:focus{border-color:#c4b5fd;background:#fff;box-shadow:0 0 0 4px rgba(124,58,237,.1)}
.search-wrap svg{position:absolute;left:15px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--muted);pointer-events:none}
#results{position:absolute;top:calc(100% + 8px);left:0;right:0;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow-lg);max-height:58vh;overflow:auto;display:none;z-index:60}
#results a.sel{background:#faf5ff;outline:2px solid #ddd6fe}
#results a{display:flex;gap:12px;align-items:center;padding:9px 16px;font-size:14px;border-bottom:1px solid var(--line)}
#results a:last-child{border-bottom:none}
#results a:hover{background:#faf5ff}
#results .e{font-size:22px;flex-shrink:0}
main{max-width:1060px;margin:0 auto;padding:32px 24px 96px}
.crumbs{font-size:13px;color:var(--muted);margin-bottom:14px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.crumbs a:hover{color:var(--a1)}
.crumbs .sep{opacity:.5}
h1{font-size:clamp(26px,4vw,38px);letter-spacing:-1px;line-height:1.15;margin:.2em 0}
h2{font-size:19px;letter-spacing:-.3px;margin:2.2em 0 .8em;display:flex;align-items:center;gap:8px}
h2::after{content:"";flex:1;height:1px;background:var(--line)}
.hero{padding:34px 0 10px}
.hero .kicker{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--a1);background:#f5f3ff;border:1px solid #ddd6fe;border-radius:99px;padding:4px 12px;margin-bottom:14px}
.hero p{font-size:16.5px;color:var(--muted);max-width:640px;margin:.6em 0 0}
.gradtext{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px;margin:16px 0}
.grid a{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 4px 8px;text-align:center;font-size:32px;transition:all .12s ease;position:relative}
.grid a:hover{transform:translateY(-3px) scale(1.06);border-color:#ddd6fe;box-shadow:0 12px 24px -10px rgba(124,58,237,.25);background:#fff;z-index:2}
.grid a small{display:block;font-size:10.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:3px 4px 0}
.cat{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin:18px 0}
.cat a{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;font-size:15.5px;font-weight:600;display:flex;gap:12px;align-items:center;transition:all .15s;box-shadow:var(--shadow)}
.cat a:hover{transform:translateY(-2px);border-color:#ddd6fe;box-shadow:0 14px 30px -12px rgba(124,58,237,.3)}
.cat .n{font-size:26px}
.cat .count{color:var(--muted);font-size:12.5px;font-weight:500;margin-left:auto;background:var(--bg);border-radius:99px;padding:2px 9px}
html[lang="en"] .cat{grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
html[lang="en"] .cat a{font-size:14.5px}
html[lang="en"] .grid{grid-template-columns:repeat(auto-fill,minmax(124px,1fr))}
html[lang="en"] .grid a small{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:10.5px;line-height:1.35;min-height:2.7em}
.detail-grid{display:grid;grid-template-columns:340px 1fr;gap:24px;align-items:start;margin-top:8px}
@media(max-width:760px){.detail-grid{grid-template-columns:1fr}}
.stage{padding:40px 16px 28px;text-align:center;border-radius:var(--radius)}
.stage .big{font-size:104px;line-height:1.15;display:block;filter:drop-shadow(0 14px 22px rgba(17,17,24,.16))}
.stage .cp{margin-top:14px;font-size:12px;color:var(--muted);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.4px}
.btnrow{display:flex;gap:10px;justify-content:center;margin-top:18px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:7px;background:var(--grad);color:#fff;border:none;border-radius:99px;padding:11px 26px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 10px 22px -8px rgba(236,72,153,.55);transition:all .15s}
.btn:hover{transform:translateY(-1px);box-shadow:0 14px 26px -8px rgba(236,72,153,.65)}
.btn.ok{background:linear-gradient(120deg,#059669,#10b981)}
.btn.ghost{background:#fff;color:var(--ink);border:1px solid var(--line);box-shadow:var(--shadow)}
.btn.ghost:hover{border-color:#ddd6fe}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0}
@media(max-width:560px){.meta{grid-template-columns:1fr}}
.meta>div{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 16px;font-size:15px;box-shadow:var(--shadow)}
.meta b{display:block;font-size:11.5px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.8px;margin-bottom:2px}
.kw{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 4px}
.kw span{display:inline-block;background:var(--card);border:1px solid var(--line);border-radius:99px;padding:6px 15px;font-size:13.5px;color:#3f3f46;transition:all .12s}
.kw span:hover{border-color:#c4b5fd;color:var(--a1);background:#faf5ff}
.kw span.zh{background:#faf5ff;border-color:#e9d5ff}
.note{background:linear-gradient(135deg,#faf5ff,#fdf2f8);border:1px solid #f3e8ff;border-radius:var(--radius);padding:18px 22px;color:#52525b;font-size:14.5px;margin:14px 0}
.note b{color:var(--ink);margin-right:6px}
.lead{font-size:17px;color:#3f3f46;margin:.6em 0}
.uses{margin:10px 0 16px;padding-left:22px;color:#3f3f46}
.uses li{margin:6px 0}
.renders{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:14px 0}
.render{text-align:center;padding:18px 10px 14px}
.render .imgwrap{height:64px;display:grid;place-items:center;margin-bottom:8px}
.render img{width:52px;height:52px}
.render .imgwrap.fail{font-size:12px;color:var(--muted);content:""}
.render .imgwrap.fail::after{content:"无此字符";font-size:12px;color:var(--muted)}
.render b{display:block;font-size:13.5px}
.render span{font-size:11.5px;color:var(--muted)}
footer{border-top:1px solid var(--line);background:var(--card);margin-top:48px}
.fwrap{max-width:1060px;margin:0 auto;padding:32px 24px 36px;color:var(--muted);font-size:13px;display:flex;flex-direction:column;gap:14px}
.ftop{display:flex;align-items:center;gap:24px;flex-wrap:wrap}
.fwrap .logo{font-size:15px}
.ftop nav{margin-left:auto;display:flex;gap:18px;flex-wrap:wrap;font-size:13px}
.ftop nav a{color:inherit;text-decoration:none}
.ftop nav a:hover{color:var(--a1)}
.fmeta{display:flex;align-items:center;flex-wrap:wrap;gap:4px 10px;font-size:12.5px;line-height:1.8}
.fmeta a{color:inherit;text-decoration:none;border-bottom:1px solid transparent;transition:color .15s,border-color .15s}
.fmeta a:hover{color:var(--a1);border-bottom-color:currentColor}
.fsep{opacity:.5;user-select:none}
.fcred{font-size:11.5px;line-height:1.8;opacity:.72}
.fcred a{color:inherit;text-decoration:underline;text-underline-offset:2px}
.fcred a:hover{color:var(--a1)}
@media (max-width:560px){
  .ftop{gap:12px}
  .ftop nav{margin-left:0;width:100%;gap:14px}
}
.combo-seq{min-height:64px;border:1px dashed var(--line);border-radius:14px;padding:10px 14px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:30px}
.combo-chip{background:#faf5ff;border:1px solid #e9d5ff;border-radius:10px;padding:2px 8px;display:inline-flex;align-items:center;gap:6px}
.combo-chip b{font-size:13px;color:var(--muted);cursor:pointer;font-weight:400}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;margin:18px 0}
.tcard{display:flex;gap:16px;align-items:center;padding:18px 20px;transition:all .15s}
.tcard:hover{transform:translateY(-2px);border-color:#ddd6fe;box-shadow:0 14px 30px -12px rgba(124,58,237,.3)}
.tcard .tbig{font-size:42px;flex-shrink:0}
.tcard b{font-size:15.5px;display:block;letter-spacing:-.2px}
.tcard p{margin:2px 0 0;font-size:13px;color:var(--muted)}
.article{max-width:720px;margin:0 auto}
.article .abig{font-size:72px;display:block;margin-bottom:6px}
.article p{font-size:16px;color:#3f3f46;margin:1em 0}
.article .sub{color:var(--muted);font-size:15px;border-left:3px solid #ddd6fe;padding-left:14px;margin:1.2em 0}
.kgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin:16px 0}
.kitem{font-size:19px;padding:18px 8px;cursor:pointer;transition:all .12s;color:var(--ink)}
.kitem:hover{transform:translateY(-2px);border-color:#ddd6fe}
.langsw{flex-shrink:0;font-size:13px;font-weight:600;padding:7px 12px;border:1px solid var(--line);border-radius:99px;color:var(--muted);transition:all .15s;white-space:nowrap}
.langsw:hover{color:var(--a1);border-color:#ddd6fe;background:#faf5ff}
`;

fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'assets', 'style.css'), CSS);

const SEARCH_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`;

const BASE = ''; // relative links, deploy anywhere

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// JSON-LD 辅助
const ldJson = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/<\//g, '<\\/')}</script>`;
const crumbsLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, url], i) => ({
    '@type': 'ListItem', position: i + 1, name, ...(url ? { item: SITE_URL + url } : {}),
  })),
});
const clip = (s, max) => (String(s).length > max ? String(s).slice(0, max - 1).trimEnd() + '…' : String(s));

// ---------- i18n 基础设施 ----------
// EN_HAS：已有英文版本的中文侧逻辑路径集合。hreflang 与语言切换器全部由它推导，
// 保证「绝不指向不存在的页面」——指向 404 的 hreflang 会让整组标签失效。
const EN_HAS = new Set();
const zhSidePath = (p, loc) => (loc === 'en' ? (p.replace(/^\/en(?=\/|$)/, '') || '/') : p);
const enSidePath = (zhPath) => (zhPath === '/' ? '/en/' : '/en' + zhPath);
function altFor(zhPath) {
  return EN_HAS.has(zhPath) ? { zh: zhPath, en: enSidePath(zhPath) } : null;
}

function head(title, desc, p = '', o = {}) {
  const loc = o.locale === 'en' ? 'en' : DEFAULT_LOCALE;
  const M = LOCALES[loc], U = UI[loc];
  // 英文站统一用绝对根路径，避免相对深度算错；中文站沿用相对路径，产物可任意挂载
  const R = loc === 'en' ? M.prefix : '';
  const cssHref = loc === 'en' ? '/assets/style.css' : `${p ? p + '/' : ''}assets/style.css`;
  const canon = o.path ? SITE_URL + o.path : '';
  const alt = o.path ? altFor(zhSidePath(o.path, loc)) : null;
  const altTags = alt
    ? ['zh', 'en'].map((k) => `<link rel="alternate" hreflang="${LOCALES[k].code}" href="${SITE_URL}${alt[k]}">`).join('\n')
      + `\n<link rel="alternate" hreflang="x-default" href="${SITE_URL}${alt[X_DEFAULT_LOCALE] || alt.zh}">\n`
    : '';
  // 没有对应语言版本时切换到该语言首页，不留死链
  const switchHref = alt ? (loc === 'zh' ? alt.en : alt.zh) : (loc === 'zh' ? '/en/' : '/');
  const switchLang = loc === 'zh' ? 'en' : 'zh-CN';
  const ld = (o.ld || []).map(ldJson).join('\n');
  return `<!DOCTYPE html>
<html lang="${M.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${o.noindex ? '<meta name="robots" content="noindex,follow">\n' : ''}${canon ? `<link rel="canonical" href="${canon}">\n` : ''}${altTags}<meta property="og:type" content="${o.type || 'website'}">
<meta property="og:site_name" content="OpenEmoji">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
${canon ? `<meta property="og:url" content="${canon}">\n` : ''}<meta property="og:locale" content="${M.ogLocale}">
${alt ? `<meta property="og:locale:alternate" content="${LOCALES[loc === 'zh' ? 'en' : 'zh'].ogLocale}">\n` : ''}<meta name="twitter:card" content="summary_large_image">
<meta property="og:image" content="${SITE_URL}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${loc === 'en' ? 'OpenEmoji — every emoji, explained' : 'OpenEmoji — 每个 emoji 的意思，一查便知'}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/favicon.svg">
<link rel="stylesheet" href="${cssHref}">${ld ? '\n' + ld : ''}
</head>
<body>
<header><div class="hwrap">
  <a class="logo" href="${R}/index.html"><span class="dot">😀</span>Open<b>Emoji</b></a>
  <div class="search-wrap">${SEARCH_ICON}
    <input class="search" id="q" type="search" placeholder="${esc(U.searchPlaceholder)}" autocomplete="off" aria-label="${esc(U.searchAria)}">
    <div id="results"></div>
  </div>
  <a class="langsw" href="${switchHref}" hreflang="${switchLang}" lang="${switchLang}" aria-label="${esc(U.switchAria)}">${M.switchShort}</a>
</div></header>
<main>`;
}

const FOOT = (p = '', loc = DEFAULT_LOCALE) => {
  const M = LOCALES[loc], U = UI[loc];
  const R = loc === 'en' ? M.prefix : p;
  const SR = loc === 'en' ? '/en' : '';
  const jsSrc = loc === 'en' ? '/app.js' : `${p || '.'}/app.js`;
  return `</main>
<footer><div class="fwrap">
  <div class="ftop">
    <a class="logo" href="${R}/index.html"><span class="dot" style="width:24px;height:24px;font-size:13px;border-radius:7px">😀</span>Open<b>Emoji</b></a>
    <nav>${U.nav.map(([t, href]) => `<a href="${R}${href}">${esc(t)}</a>`).join('')}</nav>
  </div>
  <div class="fmeta">
    <span>${esc(U.footerNote)}</span>
  </div>
  <div class="fmeta">
    <span>${loc === 'en' ? 'Contact' : '联系'}</span>
    <a href="mailto:hello@openemoji.com">hello@openemoji.com</a>
    <span class="fsep">·</span>
    <a href="https://github.com/steley/openemoji" target="_blank" rel="noopener">GitHub</a>
  </div>
  <div class="fcred">${loc === 'en'
    ? 'Emoji artwork: <a href="https://openmoji.org/" target="_blank" rel="noopener">OpenMoji</a> (CC BY-SA 4.0) · <a href="https://github.com/jdecked/twemoji" target="_blank" rel="noopener">Twemoji</a> (CC BY 4.0) · <a href="https://github.com/googlefonts/noto-emoji" target="_blank" rel="noopener">Noto Emoji</a> (Apache-2.0)'
    : '图形来源：<a href="https://openmoji.org/" target="_blank" rel="noopener">OpenMoji</a>（CC BY-SA 4.0）· <a href="https://github.com/jdecked/twemoji" target="_blank" rel="noopener">Twemoji</a>（CC BY 4.0）· <a href="https://github.com/googlefonts/noto-emoji" target="_blank" rel="noopener">Noto Emoji</a>（Apache-2.0）'}</div>
</div></footer>
<script src="${jsSrc}"></script>
<script>
const Q=document.getElementById('q'),R=document.getElementById('results');let SEL=-1;
const items=()=>R.querySelectorAll('a[href]');
Q.addEventListener('input',async()=>{
  await emojiSearch.load();
  const v=Q.value.trim().toLowerCase();SEL=-1;
  if(!v){R.style.display='none';return;}
  const hit=emojiSearch.query(v).slice(0,30);
  R.innerHTML=hit.map(e=>'<a href="${SR}/e/'+e.s+'.html"><span class="e">'+e.c+'</span><span>'+e.t+'</span></a>').join('')||'<a><span class="e">🫥</span><span>${esc(U.noResult)}</span></a>';
  R.style.display='block';
});
document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))R.style.display='none';});
Q.addEventListener('keydown',e=>{
  if(e.key==='Escape'){Q.value='';R.style.display='none';Q.blur();return;}
  const list=items();if(!list.length||R.style.display==='none')return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
    e.preventDefault();
    SEL=(SEL+(e.key==='ArrowDown'?1:-1)+list.length)%list.length;
    list.forEach((a,i)=>a.classList.toggle('sel',i===SEL));
    list[SEL].scrollIntoView({block:'nearest'});
  }else if(e.key==='Enter'&&SEL>=0){location.href=list[SEL].getAttribute('href');}
});
</script>
</body></html>`;
};

function copyBtn(emojiCh, shortName, loc = DEFAULT_LOCALE) {
  const T = loc === 'en'
    ? { a: EMOJI_EN.copyEmoji, done: EMOJI_EN.copied, b: EMOJI_EN.copyShort }
    : { a: '📋 复制表情', done: '✅ 已复制', b: '复制' };
  const vars = `let EMOJI=${JSON.stringify(emojiCh)};const SHORTNAME=${JSON.stringify(shortName)};const T=${JSON.stringify(T)};`;
  return `<button class="btn" id="cp">${T.a}</button><button class="btn ghost" id="cp2">${T.b} <code style="font-family:ui-monospace,Menlo,monospace">:${shortName}:</code></button>
<script>
${vars}
function refreshBig(){const b=document.querySelector('.stage .big');if(b)b.textContent=EMOJI;}
const b=document.getElementById('cp');
b.onclick=()=>{navigator.clipboard.writeText(EMOJI).then(()=>{b.textContent=T.done;b.classList.add('ok');setTimeout(()=>{b.textContent=T.a;b.classList.remove('ok')},1500)})};
document.getElementById('cp2').onclick=function(){navigator.clipboard.writeText(':'+SHORTNAME+':').then(()=>{this.textContent=T.done;setTimeout(()=>{this.innerHTML=T.b+' :'+SHORTNAME+':'},1500)})};
</script>`;
}
function skinStrip(has, baseEmoji) {
  if (!has) return '';
  const names = ['🏻', '🏼', '🏽', '🏾', '🏿'];
  return `<div style="display:flex;gap:6px;justify-content:center;margin-top:12px;flex-wrap:wrap">
  <button class="chip" onclick="setSkin('')">${baseEmoji}</button>
  ${names.map((n) => `<button class="chip" onclick="setSkin('${n}')">${baseEmoji}${n}</button>`).join('')}
</div>
<script>
function setSkin(m){EMOJI=${JSON.stringify(baseEmoji)}+m;refreshBig();}
</script>
<style>.chip{font-size:24px;background:#fff;border:1px solid var(--line);border-radius:10px;padding:4px 10px;cursor:pointer;transition:all .12s}.chip:hover{border-color:#c4b5fd;transform:translateY(-2px)}</style>`;
}

// ---------- collect all emojis ----------
const seen = new Set();
const slugCount = {};
const all = [];
const groups = groupsData.map((g) => {
  const items = g.emojis.filter((e) => {
    if (seen.has(e.emoji)) return false;
    seen.add(e.emoji);
    return true;
  }).map((e) => {
    let slug = e.slug || e.name.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'emoji';
    slugCount[slug] = (slugCount[slug] || 0) + 1;
    if (slugCount[slug] > 1) slug = `${slug}_${slugCount[slug]}`;
    // CLDR keys some emoji without the FE0F variation selector (❤️ -> ❤), so fall back to that form
    const bare = e.emoji.replace(/\ufe0f/g, '');
    const enA = en[e.emoji] || en[bare] || {};
    const zhA = zh[e.emoji] || zh[bare] || {};
    const zhName = (zhA.tts || [])[0] || '';
    const zhKw = [...new Set([...(zhA.default || []), zhName].filter(Boolean))];
    // 旗帜/家庭组合在 CLDR 里没有标注：退化为 slug 里的英文词，避免关键词区和 meta description 出现空值
    const enKw = (enA.default && enA.default.length ? enA.default : slug.split('_')).filter(Boolean);
    const item = { ...e, slug, enKw, zhName, zhKw };
    all.push(item);
    return item;
  });
  return { name: g.name, emojis: items };
});

console.log(`total unique emojis: ${all.length}`);

// ---------- scene data validation & reverse map ----------
const byChar = Object.fromEntries(all.map((e) => [e.emoji, e]));
const sceneOfChar = {}; // emoji char -> [sceneSlug]
const validScenes = [];
for (const sc of SCENES) {
  sc.items = [...new Set(sc.emojis)].map((c) => byChar[c]).filter(Boolean);
  if (sc.items.length < 8) console.warn(`  ⚠ scene ${sc.name}: only ${sc.items.length} valid emojis, skipped`);
  else {
    validScenes.push(sc);
    for (const it of sc.items) (sceneOfChar[it.emoji] ||= []).push(sc.slug);
  }
}
console.log(`scenes: ${validScenes.length} valid`);

// ---------- local render assets (copied from node_modules, zero external requests) ----------
const ASSET_SETS = [
  { key: 'twemoji', dir: `${NM}/@discordapp/twemoji/dist/svg`, ext: '.svg' },
  { key: 'openmoji', dir: `${NM}/openmoji/color/svg`, ext: '.svg' },
  { key: 'noto', dir: `${NM}/emoji-datasource-google/img/google/64`, ext: '.png' },
];
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
for (const s of ASSET_SETS) fs.mkdirSync(path.join(OUT, 'assets', s.key), { recursive: true });

const assetUrls = (emoji) => {
  const cpsAll = [...emoji].map((c) => c.codePointAt(0).toString(16));
  const cpsNoF = cpsAll.filter((c) => c !== 'fe0f');
  const candidates = {
    twemoji: [cpsNoF.join('-')],
    openmoji: [cpsAll.join('-').toUpperCase(), cpsNoF.join('-').toUpperCase()],
    noto: [cpsAll.join('-'), cpsNoF.join('-')],
  };
  const out = {};
  for (const s of ASSET_SETS) {
    for (const name of candidates[s.key]) {
      const src = path.join(s.dir, name + s.ext);
      if (fs.existsSync(src)) {
        const dest = path.join(OUT, 'assets', s.key, name + s.ext);
        if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
        out[s.key] = `../assets/${s.key}/${name + s.ext}`;
        break;
      }
    }
  }
  return out;
};

// ---------- search index (kept small: no field repeats another) ----------
const index = all.map((e) => {
  const slugWords = e.slug.replace(/_/g, ' ');
  const k = [...new Set([e.name, slugWords !== e.name ? slugWords : '', ...e.enKw, ...e.zhKw].filter(Boolean))]
    .join(' ').toLowerCase();
  return {
    c: e.emoji, s: e.slug,
    t: `${e.name}${e.zhName ? ' · ' + e.zhName : ''}`,
    k,
  };
});
fs.writeFileSync(path.join(OUT, 'search.json'), JSON.stringify(index));

// ---------- shared fragments ----------
const bySlug = Object.fromEntries(all.map((e) => [e.slug, e]));
const assets = Object.fromEntries(all.map((e) => [e.emoji, assetUrls(e.emoji)]));
const gFileOf = (gName) => gName.toLowerCase().replace(/[^a-z]+/g, '-') + '.html';
// 英文页里的 emoji 链接：有英文版走 /en/e/，没有就回落到中文详情页（不产生 404）
const gridItem = (e, loc = 'zh') => {
  const href = loc === 'en'
    ? (EN_HAS.has(`/e/${e.slug}.html`) ? `/en/e/${e.slug}.html` : `/e/${e.slug}.html`)
    : `${BASE}/e/${e.slug}.html`;
  const label = loc === 'en' ? e.name : (e.zhName || e.name);
  return `<a href="${href}" title="${esc(e.name)}">${e.emoji}<small>${esc(label)}</small></a>`;
};
const gLink = (gName) => `${BASE}/g/${gFileOf(gName)}`;

// ---------- 英文站覆盖范围 ----------
// 只翻译/data 里真有英文人工内容的 emoji（见 editorial-en.mjs），
// 不给 1770 个模板页凭空造英文，避免把薄内容翻倍。
const EN_EMOJI = Object.keys(EDITORIAL_EN).filter((s) => bySlug[s]);
const orphanEn = Object.keys(EDITORIAL_EN).filter((s) => !bySlug[s]);
if (orphanEn.length) console.warn(`  ⚠ editorial-en slugs not found: ${orphanEn.join(', ')}`);
EN_HAS.add('/');
for (const g of groups) EN_HAS.add(`/g/${gFileOf(g.name)}`);
for (const s of EN_EMOJI) EN_HAS.add(`/e/${s}.html`);


// ---------- index page ----------
const newEmojis = all.filter((e) => parseFloat(e.emoji_version) >= 15.1);
const FEATURED = ['red_heart', 'fire', 'skull', 'rolling_on_the_floor_laughing', 'thumbs_up', 'folded_hands', 'loudly_crying_face', 'sparkles', 'melting_face', 'saluting_face', 'shaking_face', 'face_with_tears_of_joy'].filter((s) => bySlug[s]);

let idxHtml = head('OpenEmoji — Emoji 意思大全 · 在线查询与一键复制',
  '免费在线 emoji 词典：查询每个 emoji 的中英文意思、关键词、代码点，一键复制。支持 Emoji 17.0 最新表情。', '', {
    path: '/',
    ld: [{
      '@context': 'https://schema.org', '@type': 'WebSite', name: 'OpenEmoji', url: SITE_URL + '/',
      inLanguage: 'zh-CN', description: `${all.length} 个 emoji 的中英文含义、关键词与代码点，点击即复制。`,
    }, {
      '@context': 'https://schema.org', '@type': 'Organization', name: 'OpenEmoji', url: SITE_URL + '/', logo: SITE_URL + '/favicon.svg',
      email: 'hello@openemoji.com', sameAs: ['https://github.com/steley/openemoji'],
    }],
  });
idxHtml += `<div class="hero">
  <span class="kicker">✨ 已收录 Emoji 17.0 最新表情</span>
  <h1>每个 emoji 的意思，<span class="gradtext">一查便知</span></h1>
  <p>${all.length} 个 emoji 的中英文含义、关键词与代码点，点击即复制。查询在本地完成，不上传任何内容。</p>
</div>
<h2>🔥 热门 emoji</h2>
<div class="grid">${FEATURED.map((s) => gridItem(bySlug[s])).join('')}</div>`;
if (newEmojis.length) {
  idxHtml += `<h2 id="new">🆕 最新 emoji（Emoji 15.1 – 17.0）</h2><div class="grid">${newEmojis.map(gridItem).join('')}</div>`;
}
idxHtml += `<h2>🧩 玩法工具</h2><div class="cat">
<a href="${BASE}/combo.html"><span class="n">🧩</span>Emoji 组合生成器<span class="count">NEW</span></a>
<a href="${BASE}/decorate.html"><span class="n">✍️</span>文案装饰器<span class="count">NEW</span></a>
<a href="${BASE}/preview.html"><span class="n">👁️</span>多平台渲染预览<span class="count">NEW</span></a>
<a href="${BASE}/kaomoji/index.html"><span class="n">(๑•̀ㅂ•́)و✧</span>颜文字大全<span class="count">NEW</span></a>
</div>
<h2 id="trending">📖 梗解读</h2><div class="cards">${TRENDING.slice(0, 6).map((t) => `<a class="card tcard" href="${BASE}/trending/${t.slug}.html"><span class="tbig">${t.emoji}</span><div><b>${esc(t.title)}</b><p>${esc(t.subtitle)}</p></div></a>`).join('')}</div>
<p style="margin-top:2px"><a href="${BASE}/trending/index.html" style="color:var(--a1);font-size:14px;font-weight:600">查看全部 ${TRENDING.length} 篇 →</a></p>
<h2 id="scenes">🎯 按场景找 emoji</h2>
<div class="cat">${validScenes.map((sc) => `<a href="${BASE}/s/${sc.slug}.html"><span class="n">${sc.icon}</span>${esc(sc.name)}<span class="count">${sc.items.length}</span></a>`).join('')}</div>
<p style="color:var(--muted);font-size:14px;margin-top:6px">不知道选哪个？按使用场景挑：阴阳怪气、表白、摸鱼、道歉……每个场景都人工挑好了最顺手的组合。</p>`;
idxHtml += `<h2 id="cats">📂 按分类浏览</h2><div class="cat">${groups.map((g) => `<a href="${gLink(g.name)}"><span class="n">${GROUP_ICONS[g.name]}</span>${GROUP_ZH[g.name]}<span class="count">${g.emojis.length}</span></a>`).join('')}</div>`;
idxHtml += FOOT();
fs.writeFileSync(path.join(OUT, 'index.html'), idxHtml);

// ---------- group pages ----------
fs.mkdirSync(path.join(OUT, 'g'), { recursive: true });
for (const g of groups) {
  const file = g.name.toLowerCase().replace(/[^a-z]+/g, '-') + '.html';
  const intro = GROUP_INTRO[g.name] || { desc: `${GROUP_ZH[g.name]}分类下所有 emoji 的意思与复制，共 ${g.emojis.length} 个。`, lead: '' };
  let html = head(`${GROUP_ZH[g.name]} ${g.name} — Emoji 列表与意思`, intro.desc, '..', {
      path: `/g/${file}`,
      ld: [crumbsLd([['首页', '/'], [GROUP_ZH[g.name], `/g/${file}`]]), {
        '@context': 'https://schema.org', '@type': 'CollectionPage',
        name: `${GROUP_ZH[g.name]} emoji 列表`, url: `${SITE_URL}/g/${file}`,
        description: `${GROUP_ZH[g.name]}分类下共 ${g.emojis.length} 个 emoji 的意思与复制。`,
        mainEntity: {
          '@type': 'ItemList', numberOfItems: g.emojis.length,
          itemListElement: g.emojis.map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/e/${x.slug}.html`, name: x.name })),
        },
      }],
    });
  html += `<div class="crumbs"><a href="${BASE}/index.html">首页</a><span class="sep">/</span>${GROUP_ZH[g.name]}</div>
<h1>${GROUP_ICONS[g.name]} <span class="gradtext">${GROUP_ZH[g.name]}</span></h1>
<p style="color:var(--muted)">${g.name} · ${g.emojis.length} 个表情</p>
${intro.lead ? `<p class="lead">${esc(intro.lead)}</p>` : ''}
<div class="grid">${g.emojis.map(gridItem).join('')}</div>`;
  html += FOOT('..');
  fs.writeFileSync(path.join(OUT, 'g', file), html);
}

// ---------- scene pages ----------
fs.mkdirSync(path.join(OUT, 's'), { recursive: true });
for (const sc of validScenes) {
  let html = head(`${sc.icon} ${sc.name}的 emoji 怎么选？— ${sc.items.length} 个最合适的一键复制 | OpenEmoji`,
    `${sc.name}用什么 emoji？${sc.desc} ${sc.items.map((e) => e.emoji).slice(0, 12).join('')} 等 ${sc.items.length} 个，点击复制。`, '..', {
      path: `/s/${sc.slug}.html`,
      ld: [crumbsLd([['首页', '/'], ['场景', '/index.html#scenes'], [sc.name, `/s/${sc.slug}.html`]]), {
        '@context': 'https://schema.org', '@type': 'CollectionPage',
        name: `${sc.name} emoji 推荐`, url: `${SITE_URL}/s/${sc.slug}.html`, description: sc.desc,
        mainEntity: {
          '@type': 'ItemList', numberOfItems: sc.items.length,
          itemListElement: sc.items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/e/${x.slug}.html`, name: x.name })),
        },
      }],
    });
  html += `<div class="crumbs"><a href="${BASE}/index.html">首页</a><span class="sep">/</span>场景</div>
<div class="hero"><span class="kicker">🎯 场景推荐</span><h1>${sc.icon} <span class="gradtext">${esc(sc.name)}</span></h1><p>${esc(sc.desc)}</p></div>
<div class="grid">${sc.items.map(gridItem).join('')}</div>`;
  // cross links to other scenes
  const others = validScenes.filter((x) => x.slug !== sc.slug);
  html += `<h2>其他场景</h2><div class="cat">${others.slice(0, 8).map((x) => `<a href="${BASE}/s/${x.slug}.html"><span class="n">${x.icon}</span>${esc(x.name)}</a>`).join('')}</div>`;
  html += FOOT('..');
  fs.writeFileSync(path.join(OUT, 's', `${sc.slug}.html`), html);
}

// ---------- tool pages: combo / decorate / preview ----------
const PALETTE = groups.map((g) => ({ name: g.name, zh: GROUP_ZH[g.name], items: g.emojis.slice(0, 14) }));

const toolLd = (path, name, desc) => ({
  '@context': 'https://schema.org', '@type': 'WebApplication',
  name, url: SITE_URL + path, description: desc,
  applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
});

const comboPage = head('Emoji 组合生成器 — 拼出你的表情暗号 | OpenEmoji',
  '选择多个 emoji 拼成组合短句或暗号，一键复制。支持搜索添加、随机组合，所有操作在本地完成。', '', {
    path: '/combo.html',
    ld: [crumbsLd([['首页', '/'], ['Emoji 组合生成器', '/combo.html']]),
      toolLd('/combo.html', 'Emoji 组合生成器', '把多个 emoji 拼成组合短句或暗号，一键复制。')],
  }) + `
<div class="hero"><span class="kicker">🧩 玩法工具</span><h1>Emoji <span class="gradtext">组合生成器</span></h1><p>把几个 emoji 拼成短句或暗号：🔥💀＝笑死，☕🫠＝周一上班。点击下方表情添加，顺序可调。</p></div>
<div class="card" style="padding:18px 20px">
  <div id="seq" class="combo-seq"><span style="color:var(--muted);font-size:14px">从下面选表情，点这里开始组合…</span></div>
  <div class="btnrow" style="justify-content:flex-start">
    <button class="btn" id="ccopy">📋 复制组合</button>
    <button class="btn ghost" id="cundo">↩️ 撤销</button>
    <button class="btn ghost" id="cclear">清空</button>
    <button class="btn ghost" id="crand">🎲 随机来一组</button>
  </div>
</div>
<input class="search" id="eq" type="search" placeholder="搜索要添加的 emoji…" style="margin:18px 0 10px;max-width:420px">
<div id="eqr" class="grid" style="margin:0 0 8px"></div>
${PALETTE.map((p) => `<h2 style="font-size:16px">${esc(p.zh)}</h2><div class="grid" style="margin-top:8px">${p.items.map((e) => `<a href="javascript:void(0)" data-e="${e.emoji}" title="${esc(e.name)}">${e.emoji}</a>`).join('')}</div>`).join('')}
<script src="app.js"></script>
<script>
let SEQ=[];
const seqEl=document.getElementById('seq');
function render(){
  seqEl.innerHTML=SEQ.length?SEQ.map((c,i)=>'<span class="combo-chip">'+c+'<b data-i="'+i+'">×</b></span>').join(''):'<span style="color:var(--muted);font-size:14px">从下面选表情，点这里开始组合…</span>';
}
seqEl.addEventListener('click',e=>{if(e.target.tagName==='B'){SEQ.splice(+e.target.dataset.i,1);render();}});
document.querySelectorAll('[data-e]').forEach(a=>a.onclick=()=>{SEQ.push(a.dataset.e);render();});
document.getElementById('cundo').onclick=()=>{SEQ.pop();render();};
document.getElementById('cclear').onclick=()=>{SEQ=[];render();};
document.getElementById('crand').onclick=()=>{const pool=[...document.querySelectorAll('[data-e]')].map(a=>a.dataset.e);SEQ=Array.from({length:3+Math.floor(Math.random()*3)},()=>pool[Math.floor(Math.random()*pool.length)]);render();};
document.getElementById('ccopy').onclick=function(){if(!SEQ.length)return;navigator.clipboard.writeText(SEQ.join('')).then(()=>{this.textContent='✅ 已复制';this.classList.add('ok');setTimeout(()=>{this.textContent='📋 复制组合';this.classList.remove('ok')},1500)})};
const EQ=document.getElementById('eq'),ER=document.getElementById('eqr');
EQ.addEventListener('input',async()=>{
  await emojiSearch.load();
  const v=EQ.value.trim().toLowerCase();
  if(!v){ER.innerHTML='';return;}
  ER.innerHTML=emojiSearch.query(v).slice(0,18).map(e=>'<a href="javascript:void(0)" data-e="'+e.c+'" title="'+e.t.replace(/"/g,'')+'">'+e.c+'</a>').join('');
});
ER.addEventListener('click',e=>{const a=e.target.closest('[data-e]');if(a){SEQ.push(a.dataset.e);render();}});
</script>` + FOOT();
fs.writeFileSync(path.join(OUT, 'combo.html'), comboPage);

const decoratePage = head('Emoji 文案装饰器 — 一键给文字配上表情 | OpenEmoji',
  '输入一句话，自动为每句推荐合适的 emoji：发朋友圈、小红书、微博文案专用。纯本地运行。', '', {
    path: '/decorate.html',
    ld: [crumbsLd([['首页', '/'], ['Emoji 文案装饰器', '/decorate.html']]),
      toolLd('/decorate.html', 'Emoji 文案装饰器', '输入一段文案，自动按句推荐 emoji 并生成成品。')],
  }) + `
<div class="hero"><span class="kicker">✍️ 玩法工具</span><h1>Emoji <span class="gradtext">文案装饰器</span></h1><p>粘贴你的文案，自动按句子匹配 emoji 候选，点选替换，复制成品。适合朋友圈、小红书、微博。</p></div>
<textarea class="search" id="src" rows="4" style="border-radius:14px;line-height:1.7" placeholder="例如：今天加班到十点，明天还要早起开会…"></textarea>
<div class="btnrow" style="justify-content:flex-start;margin:14px 0"><button class="btn" id="go">✨ 生成推荐</button></div>
<div id="out"></div>
<div class="btnrow" style="justify-content:flex-start;display:none" id="copyrow"><button class="btn" id="dcopy">📋 复制成品</button></div>
<script src="app.js"></script>
<script>
let SEG=[];
const OUT1=document.getElementById('out');
document.getElementById('go').onclick=async()=>{
  await emojiSearch.load();
  const IDX=emojiSearch.idx;
  const text=document.getElementById('src').value;
  SEG=text.split(/([。！？!?\\n，,；;])/).reduce((acc,s,i,a)=>{if(i%2===0){if(s.trim())acc.push({t:s.trim(),e:[]});}return acc;},[]);
  if(!SEG.length){OUT1.innerHTML='<div class="note">先输入一点文字～</div>';return;}
  for(const seg of SEG){
    const tokens=[...seg.t.matchAll(/[\\u4e00-\\u9fff]{2}|[a-zA-Z]{3,}/g)].map(m=>m[0].toLowerCase());
    const scored=IDX.map(e=>{let s=0;for(const tk of tokens)if(e.k.includes(tk))s+=tk.length;return[e,s];}).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0]);
    seg.e=scored.length?scored:[{c:'✨',t:'默认'}, {c:'🌟',t:'备选'}];
  }
  render();
};
function render(){
  OUT1.innerHTML=SEG.map((s,i)=>'<div class="card" style="padding:14px 18px;margin:10px 0"><div style="font-size:16px">'+esc(s.t)+' <span style="font-size:20px">'+s.e[0].c+'</span></div><div class="kw" style="margin:10px 0 0">'+s.e.map((e,j)=>'<span class="j" style="cursor:pointer'+(j===0?';background:#faf5ff;border-color:#e9d5ff':'')+'" data-i="'+i+'" data-j="'+j+'">'+e.c+' '+esc(e.t.slice(0,26))+'</span>').join('')+'</div></div>').join('');
  document.getElementById('copyrow').style.display='flex';
}
OUT1.addEventListener('click',e=>{
  const el=e.target.closest('.j');if(!el)return;
  const i=+el.dataset.i,j=+el.dataset.j;const tmp=SEG[i].e[0];SEG[i].e[0]=SEG[i].e[j];SEG[i].e[j]=tmp;render();
});
document.getElementById('dcopy').onclick=function(){
  const text=SEG.map(s=>s.t+' '+s.e[0].c).join('，');
  navigator.clipboard.writeText(text).then(()=>{this.textContent='✅ 已复制';this.classList.add('ok');setTimeout(()=>{this.textContent='📋 复制成品';this.classList.remove('ok')},1500)});
};
</script>` + FOOT();
fs.writeFileSync(path.join(OUT, 'decorate.html'), decoratePage);

// localize twemoji parser for preview page
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.copyFileSync(`${NM}/@discordapp/twemoji/dist/twemoji.min.js`, path.join(OUT, 'assets', 'twemoji.min.js'));
const OMOJI = {};
for (const e of all) {
  const p = assets[e.emoji] && assets[e.emoji].openmoji;
  if (p) OMOJI[e.emoji] = p.replace('../assets/', 'assets/');
}

const previewPage = head('Emoji 多平台渲染预览 — 发出去别人看到什么样 | OpenEmoji',
  '输入一段文字，预览它在不同系统/设计风格下的 emoji 显示效果：Apple、Windows、Noto、Twemoji。', '', {
    path: '/preview.html',
    ld: [crumbsLd([['首页', '/'], ['多平台渲染预览', '/preview.html']]),
      toolLd('/preview.html', 'Emoji 多平台渲染预览', '预览 emoji 在 Apple、Windows、Noto、Twemoji 下的显示差异。')],
  }) + `
<div class="hero"><span class="kicker">👁️ 预览工具</span><h1>Emoji <span class="gradtext">多平台渲染预览</span></h1><p>同一段文字，不同设备显示的 emoji 可能完全不一样。这里模拟四种主要风格，避免发出意外的表情。</p></div>
<textarea class="search" id="pv" rows="3" style="border-radius:14px;line-height:1.8" placeholder="输入带 emoji 的文字，例如：今晚聚餐🍜🧋 老地方见✌️">今晚聚餐🍜🧋 老地方见✌️</textarea>
<div id="pvout" style="margin-top:16px"></div>
<script src="assets/twemoji.min.js"></script>
<script>
const OMOJI=${JSON.stringify(OMOJI)};
const ROWS=[
  {n:'你的系统（默认）',note:'本机实际显示效果',style:''},
  {n:'Apple 风格',note:'iPhone / Mac（本机为苹果设备时同上）',style:"font-family:'Apple Color Emoji','PingFang SC',sans-serif"},
  {n:'Windows 风格',note:'Segoe UI Emoji（本机为 Windows 时生效）',style:"font-family:'Segoe UI Emoji',sans-serif"},
];
function imgs(map){
  return [...document.getElementById('pv').value].map(ch=>{
    if(!/\\p{Extended_Pictographic}|\\u200d/u.test(ch))return esc(ch);
    return map[ch]?'<img src="'+map[ch]+'" style="height:1.4em;vertical-align:-.3em">':'<span style="font-family:\'Apple Color Emoji\',\'Noto Color Emoji\',sans-serif">'+esc(ch)+'</span>';
  }).join('');
}
function render(){
  const v=document.getElementById('pv').value;
  document.getElementById('pvout').innerHTML=ROWS.map((r,i)=>'<div class="card" style="padding:16px 20px;margin:10px 0"><b style="font-size:12.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px">'+r.n+'</b><div style="font-size:20px;margin-top:4px;line-height:2;'+r.style+'" id="pvr'+i+'">'+esc(v)+'</div><span style="font-size:11.5px;color:var(--muted)">'+r.note+'</span></div>').join('')
    +'<div class="card" style="padding:16px 20px;margin:10px 0"><b style="font-size:12.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px">Twemoji / X 风格</b><div style="font-size:20px;margin-top:4px;line-height:2.4" id="pvtw">'+esc(v)+'</div><span style="font-size:11.5px;color:var(--muted)">Twitter/X 开源设计（内置图片）</span></div>'
    +'<div class="card" style="padding:16px 20px;margin:10px 0"><b style="font-size:12.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px">OpenMoji 风格</b><div style="font-size:20px;margin-top:4px;line-height:2.4" id="pvom">'+esc(v)+'</div><span style="font-size:11.5px;color:var(--muted)">OpenMoji 开源设计（内置图片）</span></div>';
  if(window.twemoji)twemoji.parse(document.getElementById('pvtw'),{base:'assets/',folder:'svg',ext:'.svg'});
  document.getElementById('pvom').innerHTML=imgs(OMOJI);
}
document.getElementById('pv').addEventListener('input',render);
render();
</script>` + FOOT();
fs.writeFileSync(path.join(OUT, 'preview.html'), previewPage);

// ---------- trending (梗解读) ----------
fs.mkdirSync(path.join(OUT, 'trending'), { recursive: true });
{
  let html = head('Emoji 梗解读 — 它现在到底什么意思 | OpenEmoji',
    'emoji 在中文互联网的真实用法：💀 笑死了、🫡 告辞、🤡 小丑竟是我自己……官方释义之外的使用指南。', '..', {
      path: '/trending/',
      ld: [crumbsLd([['首页', '/'], ['梗解读', '/trending/']]), {
        '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Emoji 梗解读',
        url: `${SITE_URL}/trending/`, description: 'emoji 在中文互联网的真实用法。',
        mainEntity: {
          '@type': 'ItemList', numberOfItems: TRENDING.length,
          itemListElement: TRENDING.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/trending/${t.slug}.html`, name: t.title })),
        },
      }],
    });
  html += `<div class="hero"><span class="kicker">📖 持续更新</span><h1>Emoji <span class="gradtext">梗解读</span></h1><p>词典告诉你 emoji 本来是什么意思，这里告诉你大家实际在拿它说什么。</p></div>
<div class="cards">${TRENDING.map((t) => `<a class="card tcard" href="${BASE}/trending/${t.slug}.html"><span class="tbig">${t.emoji}</span><div><b>${esc(t.title)}</b><p>${esc(t.subtitle)}</p></div></a>`).join('')}</div>`;
  html += FOOT('..');
  fs.writeFileSync(path.join(OUT, 'trending', 'index.html'), html);
  for (const t of TRENDING) {
    let html = head(`${t.emoji} ${t.title} | OpenEmoji 梗解读`, `${t.subtitle} — emoji 梗解读：${t.title}`, '..', {
      path: `/trending/${t.slug}.html`,
      type: 'article',
      ld: [crumbsLd([['首页', '/'], ['梗解读', '/trending/'], [t.title, `/trending/${t.slug}.html`]]), {
        '@context': 'https://schema.org', '@type': 'Article',
        headline: t.title, description: t.subtitle,
        url: `${SITE_URL}/trending/${t.slug}.html`, mainEntityOfPage: `${SITE_URL}/trending/${t.slug}.html`,
        inLanguage: 'zh-CN', articleSection: 'emoji 梗解读',
        author: { '@type': 'Organization', name: 'OpenEmoji', url: SITE_URL + '/' },
        publisher: { '@type': 'Organization', name: 'OpenEmoji', logo: { '@type': 'ImageObject', url: SITE_URL + '/favicon.svg' } },
        about: { '@type': 'Thing', name: `${t.emoji} ${t.title}` },
      }],
    });
    html += `<div class="crumbs"><a href="${BASE}/index.html">首页</a><span class="sep">/</span><a href="${BASE}/trending/index.html">梗解读</a><span class="sep">/</span>${t.emoji}</div>
<article class="article">
  <span class="abig">${t.emoji}</span>
  <h1 style="margin-top:8px">${esc(t.title)}</h1>
  <p class="sub">${esc(t.subtitle)}</p>
  ${t.body.map((p) => `<p>${esc(p)}</p>`).join('')}
  ${byChar[t.emoji] ? `<div class="note"><b>查看详情：</b><a href="${BASE}/e/${byChar[t.emoji].slug}.html" style="color:var(--a1)">${t.emoji} ${esc(byChar[t.emoji].name)} 的词典页</a></div>` : ''}
</article>`;
    html += FOOT('..');
    fs.writeFileSync(path.join(OUT, 'trending', `${t.slug}.html`), html);
  }
}

// ---------- kaomoji (颜文字) ----------
fs.mkdirSync(path.join(OUT, 'kaomoji'), { recursive: true });
{
  let html = head('颜文字大全 (๑•̀ㅂ•́)و✧ — 分类复制 | OpenEmoji',
    '颜文字 kaomoji 大全：开心、卖萌、难过、生气、加油、表白等分类，点击即复制。', '..', {
      path: '/kaomoji/',
      ld: [crumbsLd([['首页', '/'], ['颜文字大全', '/kaomoji/']]), {
        '@context': 'https://schema.org', '@type': 'CollectionPage', name: '颜文字大全',
        url: `${SITE_URL}/kaomoji/`, description: '按情绪分类的颜文字（kaomoji）合集，点击即复制。',
        mainEntity: {
          '@type': 'ItemList', numberOfItems: KAOMOJI.length,
          itemListElement: KAOMOJI.map((k, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/kaomoji/${k.slug}.html`, name: `${k.name}颜文字` })),
        },
      }],
    });
  html += `<div class="hero"><span class="kicker">(๑•̀ㅂ•́)و✧</span><h1>颜文字<span class="gradtext">大全</span></h1><p>emoji 之外的另一种可爱。按分类浏览，点击任意颜文字即可复制。</p></div>
<div class="cat">${KAOMOJI.map((k) => `<a href="${BASE}/kaomoji/${k.slug}.html"><span class="n">${esc(k.items[0])}</span>${esc(k.name)}<span class="count">${k.items.length}</span></a>`).join('')}</div>`;
  html += FOOT('..');
  fs.writeFileSync(path.join(OUT, 'kaomoji', 'index.html'), html);
  for (const k of KAOMOJI) {
    let html = head(`${esc(k.name)}颜文字 ${k.items[0]} — 点击复制 | OpenEmoji`, `${k.name}颜文字大全：${k.items.join(' ')} 等 ${k.items.length} 个，一键复制。`, '..', {
      path: `/kaomoji/${k.slug}.html`,
      ld: [crumbsLd([['首页', '/'], ['颜文字大全', '/kaomoji/'], [`${k.name}颜文字`, `/kaomoji/${k.slug}.html`]]), {
        '@context': 'https://schema.org', '@type': 'CollectionPage',
        name: `${k.name}颜文字`, url: `${SITE_URL}/kaomoji/${k.slug}.html`,
        description: `${k.name}颜文字合集，共 ${k.items.length} 个，点击复制。`,
      }],
    });
    html += `<div class="crumbs"><a href="${BASE}/index.html">首页</a><span class="sep">/</span><a href="${BASE}/kaomoji/index.html">颜文字</a><span class="sep">/</span>${esc(k.name)}</div>
<h1><span class="gradtext">${esc(k.name)}</span>颜文字</h1>
<div class="kgrid">${k.items.map((s, i) => `<button class="card kitem" data-k="${esc(s)}">${esc(s)}</button>`).join('')}</div>
<script>document.querySelectorAll('.kitem').forEach(b=>b.onclick=()=>{const old=b.textContent;navigator.clipboard.writeText(b.dataset.k).then(()=>{b.textContent='✅ 已复制';setTimeout(()=>b.textContent=old,1200)})});</script>`;
    html += FOOT('..');
    fs.writeFileSync(path.join(OUT, 'kaomoji', `${k.slug}.html`), html);
  }
}

// ---------- emoji pages ----------
fs.mkdirSync(path.join(OUT, 'e'), { recursive: true });
const cpOf = (ch) => [...ch].map((c) => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ');
// 每个 emoji 的组成结构（ZWJ / 变体选择符 / 国旗序列），对开发者和输入场景都是实际有用的信息
const describeSeq = (ch) => {
  const cps = [...ch].map((c) => c.codePointAt(0));
  const regional = cps.filter((c) => c >= 0x1f1e6 && c <= 0x1f1ff).length;
  if (regional === 2) return '国旗序列（2 个区域指示符）';
  if (cps.includes(0x200d)) return `ZWJ 组合（${cps.length} 个码点，含零宽连接符）`;
  if (cps.includes(0xfe0f)) return `基础字符 + 变体选择符（${cps.length} 个码点）`;
  if (cps.length > 1) return `${cps.length} 个码点组合`;
  return '单一码点';
};
const groupOf = {};
for (const g of groups) for (const e of g.emojis) groupOf[e.slug] = g.name;

let n = 0;
for (const e of all) {
  const gName = groupOf[e.slug];
  // CLDR 缺中文标注时（旗帜 / 组合家庭）不要拿英文名当中文名，否则标题和描述里会出现两遍同样的英文
  const zhTitle = (e.zhName && e.zhName.trim() && e.zhName !== e.name) ? e.zhName : '';
  const cnKw = e.zhKw.slice(0, 4);
  const kw = cnKw.length ? cnKw.join('、') : e.enKw.slice(0, 4).join('、');
  const title = `${e.emoji} ${clip(zhTitle ? `${zhTitle} ${e.name}` : e.name, 34)} 什么意思？含义与复制 | OpenEmoji`;
  const ed = EDITORIAL[e.slug];
  const nameCn = zhTitle || e.name;
  const sup = VERSION_SUPPORT[e.emoji_version];
  const desc = ed
    ? `${e.emoji} ${nameCn}：${ed.mean}。${ed.use[0]}。中文含义、关键词 ${kw}，点击复制。`
    : zhTitle
      ? `${e.emoji} ${zhTitle}（${e.name}）是什么意思？中文含义、常用关键词 ${kw}，一键复制，可用于微信、抖音、小红书、Instagram。`
      : `${e.emoji} ${e.name} 是什么 emoji？关键词 ${kw}、所属分类${GROUP_ZH[gName]}，一键复制，可用于微信、抖音、小红书、Instagram。`;
  const pageUrl = `${SITE_URL}/e/${e.slug}.html`;
  const ld = [crumbsLd([['首页', '/'], [GROUP_ZH[gName], `/g/${gName.toLowerCase().replace(/[^a-z]+/g, '-')}.html`], [nameCn, `/e/${e.slug}.html`]]), {
    '@context': 'https://schema.org', '@type': 'DefinedTerm',
    name: e.name, ...(zhTitle ? { alternateName: zhTitle } : {}),
    description: ed ? `${e.emoji} ${nameCn}：${ed.mean}` : `${e.emoji} ${nameCn}：${kw}`,
    url: pageUrl, inLanguage: 'zh-CN',
    inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'OpenEmoji emoji 词典', url: SITE_URL + '/' },
  }];
  if (ed) ld.push({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: `${nameCn} 是什么意思？`, acceptedAnswer: { '@type': 'Answer', text: `${ed.mean}。` } },
      { '@type': 'Question', name: `${nameCn} 一般在什么场合用？`, acceptedAnswer: { '@type': 'Answer', text: ed.use.join('；') } },
      ...(ed.note ? [{ '@type': 'Question', name: `用 ${nameCn} 要注意什么？`, acceptedAnswer: { '@type': 'Answer', text: ed.note } }] : []),
    ],
  });
  let html = head(title, desc, '..', { path: `/e/${e.slug}.html`, ld });
  html += `<div class="crumbs"><a href="${BASE}/index.html">首页</a><span class="sep">/</span><a href="${gLink(gName)}">${GROUP_ZH[gName]}</a><span class="sep">/</span>${esc(e.name)}</div>
<div class="detail-grid">
  <div>
    <div class="stage card"><span class="big">${e.emoji}</span><span class="cp">${cpOf(e.emoji)}</span>
      <div class="btnrow">${copyBtn(e.emoji, e.slug)}</div>
      ${skinStrip(e.skin_tone_support, e.emoji)}
    </div>
  </div>
  <div>
    <h1 style="margin-top:0">${e.emoji} ${esc(zhTitle || e.name)}${zhTitle ? ` <span style="font-size:.62em;font-weight:600;color:var(--muted)">${esc(e.name)}</span>` : ''}</h1>
    <p style="color:var(--muted);font-size:16px;margin-top:-.4em">${esc(zhTitle ? e.name : GROUP_ZH[gName])}</p>
    <div class="meta">
      <div><b>官方名称 CLDR</b>${esc(e.name)}</div>
      <div><b>中文名称</b>${esc(zhTitle || '暂无官方中文名')}</div>
      <div><b>版本</b>Unicode ${esc(e.unicode_version)} · Emoji ${esc(e.emoji_version)}</div>
      <div><b>肤色变体</b>${e.skin_tone_support ? '支持 👍' : '不支持'}</div>
      <div><b>组成</b>${describeSeq(e.emoji)}</div>
      <div><b>短代码</b>:${e.slug}:</div>
    </div>
    <h2>关键词</h2>
    <div class="kw">${e.zhKw.map((k) => `<span class="zh">${esc(k)}</span>`).join('')}${e.enKw.map((k) => `<span>${esc(k)}</span>`).join('')}</div>
    ${(sceneOfChar[e.emoji] || []).length ? `<h2>常见场景</h2><div class="kw">${(sceneOfChar[e.emoji] || []).map((sSlug) => { const sc = validScenes.find((x) => x.slug === sSlug); return `<span class="zh"><a href="${BASE}/s/${sc.slug}.html" style="color:inherit">${sc.icon} ${esc(sc.name)}</a></span>`; }).join('')}</div>` : ''}
  </div>
</div>
${ed ? `<h2>${esc(nameCn)} 是什么意思、怎么用</h2>
<p class="lead">${esc(ed.mean)}</p>
<ul class="uses">${ed.use.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>
${ed.note ? `<div class="note"><b>容易踩的坑</b>${esc(ed.note)}</div>` : ''}` : ''}
<div class="note"><b>怎么用？</b>点击上方按钮复制 ${e.emoji}，直接粘贴到微信、QQ、抖音、小红书、微博、WhatsApp、Instagram 或任何文本框。emoji 是标准 Unicode 字符，跨平台通用；iOS / Android / Windows 会显示各自的设计风格。</div>
${sup ? `<div class="note"><b>显示兼容性</b>这个 emoji 属于 Emoji ${esc(e.emoji_version)}（${sup[0]} 年加入），${sup[1]} 及以上、${sup[2]} 及以上可正常显示；更老的系统会显示成方框或黑白字符。</div>` : ''}
<h2>不同设计风格对比</h2>
<p style="color:var(--muted);font-size:14px;margin-top:-6px">你的手机上显示的是系统内置设计。以下是开源 emoji 设计集对这个字符的画法（图片已内置在站点里，无外部请求）：</p>
<div class="renders">
  ${[['twemoji', 'Twemoji', 'Twitter/X 风格'], ['openmoji', 'OpenMoji', '开源设计'], ['noto', 'Noto Emoji', 'Google/Android 风格']].map(([k, name, note]) => {
    const src = assets[e.emoji] && assets[e.emoji][k];
    return src
      ? `<div class="render card"><div class="imgwrap"><img src="${src}" alt="${esc(e.name)} ${name}" loading="lazy" onerror="this.parentElement.classList.add('fail');this.remove()"></div><b>${name}</b><span>${note}</span></div>`
      : `<div class="render card"><div class="imgwrap fail"></div><b>${name}</b><span>${note}</span></div>`;
  }).join('')}
  <div class="render card"><div class="imgwrap"><span style="font-size:56px">${e.emoji}</span></div><b>你的系统</b><span>本机当前渲染</span></div>
</div>`;
  const g = groups.find((x) => x.name === gName);
  const i = g.emojis.findIndex((x) => x.slug === e.slug);
  const sib = g.emojis.slice(Math.max(0, i - 12), i + 12).filter((x) => x.slug !== e.slug);
  html += `<h2>同类表情</h2><div class="grid">${sib.map(gridItem).join('')}</div>`;
  html += FOOT('..');
  fs.writeFileSync(path.join(OUT, 'e', `${e.slug}.html`), html);
  n++;
  if (n % 500 === 0) console.log(`  ${n} pages…`);
}

// ---------- English site (/en/) ----------
// 骨架：首页 + 9 个分类页 + editorial-en.mjs 里有内容的 emoji 页。
// 不含英文工具页（combo/decorate/preview）与梗解读——先验证这批能不能排，再扩。
fs.mkdirSync(path.join(OUT, 'en', 'e'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'en', 'g'), { recursive: true });

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// 中文站资源路径是 ../assets/x（相对 /e/ 的深度）；英文页在 /en/e/，改绝对路径最稳
const absAsset = (src) => (src ? src.replace(/^\.\.\//, '/') : src);
const describeSeqEn = (ch) => {
  const cps = [...ch].map((c) => c.codePointAt(0));
  const regional = cps.filter((c) => c >= 0x1f1e6 && c <= 0x1f1ff).length;
  if (regional === 2) return 'Flag sequence (2 regional indicators)';
  if (cps.includes(0x200d)) return `ZWJ sequence (${cps.length} code points, incl. zero-width joiner)`;
  if (cps.includes(0xfe0f)) return `Base char + variation selector (${cps.length} code points)`;
  if (cps.length > 1) return `${cps.length} code points`;
  return 'Single code point';
};

// ----- en home -----
{
  const items = EN_EMOJI.map((s) => bySlug[s]);
  let html = head(HOME_EN.title, HOME_EN.desc, '', {
    path: '/en/', locale: 'en',
    ld: [{
      '@context': 'https://schema.org', '@type': 'WebPage', name: HOME_EN.title, url: SITE_URL + '/en/',
      inLanguage: 'en', description: `${all.length} emoji with English names, keywords, code points and one-click copy.`,
      isPartOf: { '@type': 'WebSite', name: 'OpenEmoji', url: SITE_URL + '/' },
    }],
  });
  html += `<div class="hero">
  <span class="kicker">${esc(HOME_EN.kicker)}</span>
  <h1>${HOME_EN.h1}</h1>
  <p>${esc(HOME_EN.p(all.length))}</p>
</div>`;
  if (items.length) {
    html += `<h2 id="meanings">${esc(HOME_EN.h2Meanings)}</h2><div class="cards">${items.map((e) => `<a class="card tcard" href="/en/e/${e.slug}.html"><span class="tbig">${e.emoji}</span><div><b>${esc(cap(e.name))}</b><p>${esc(EDITORIAL_EN[e.slug].mean)}</p></div></a>`).join('')}</div>`;
  }
  html += `<h2 id="cats">${esc(HOME_EN.h2Cats)}</h2><div class="cat">${groups.map((g) => `<a href="/en/g/${gFileOf(g.name)}"><span class="n">${GROUP_ICONS[g.name]}</span>${esc(g.name)}<span class="count">${g.emojis.length}</span></a>`).join('')}</div>`;
  html += FOOT('', 'en');
  fs.writeFileSync(path.join(OUT, 'en', 'index.html'), html);
}

// ----- en group pages -----
for (const g of groups) {
  const file = gFileOf(g.name);
  const meta = GROUP_EN[g.name];
  let html = head(`${g.name} Emoji — Names, Meanings & Copy | OpenEmoji`, meta.desc, '', {
    path: `/en/g/${file}`, locale: 'en',
    ld: [crumbsLd([['Home', '/en/'], [g.name, `/en/g/${file}`]]), {
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      name: `${g.name} emoji list`, url: `${SITE_URL}/en/g/${file}`,
      description: `${g.emojis.length} ${g.name.toLowerCase()} emoji with names, meanings and copy.`,
      inLanguage: 'en',
      mainEntity: {
        '@type': 'ItemList', numberOfItems: g.emojis.length,
        itemListElement: g.emojis.map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/en/e/${x.slug}.html`, name: x.name })),
      },
    }],
  });
  html += `<div class="crumbs"><a href="/en/index.html">Home</a><span class="sep">/</span>${esc(g.name)}</div>
<h1>${GROUP_ICONS[g.name]} <span class="gradtext">${esc(g.name)}</span></h1>
<p style="color:var(--muted)">${g.emojis.length} emoji</p>
${meta.lead ? `<p class="lead">${esc(meta.lead)}</p>` : ''}
<div class="grid">${g.emojis.map((e) => gridItem(e, 'en')).join('')}</div>`;
  html += FOOT('', 'en');
  fs.writeFileSync(path.join(OUT, 'en', 'g', file), html);
}

// ----- en emoji pages (only slugs with real editorial content) -----
for (const s of EN_EMOJI) {
  const e = bySlug[s];
  const ed = EDITORIAL_EN[s];
  const gName = groupOf[s];
  const name = cap(e.name);
  // Google 按像素截断约 580px≈60 字符，长名称必须降级后缀，否则 SERP 里被腰斩
  const base = `${e.emoji} ${name}`;
  let title = `${base} Emoji — Meaning & Copy | OpenEmoji`;
  if (title.length > 60) title = `${base} — Meaning & Copy | OpenEmoji`;
  if (title.length > 60) title = `${base} Emoji Meaning & Copy`;
  if (title.length > 60) title = `${base} Emoji Meaning`;
  // 描述控制在 ~155 字符内，避免被截断成半句话
  const d0 = `${e.emoji} ${name} emoji meaning: ${ed.mean.replace(/[.\s]+$/, '')}.`;
  const desc = d0.length + 21 <= 155 ? `${d0} Copy it in one click.` : clip(d0, 152);
  const pageUrl = `${SITE_URL}/en/e/${s}.html`;
  const ld = [crumbsLd([['Home', '/en/'], [gName, `/en/g/${gFileOf(gName)}`], [name, `/en/e/${s}.html`]]), {
    '@context': 'https://schema.org', '@type': 'DefinedTerm',
    name: e.name, alternateName: name, description: `${e.emoji} ${name}: ${ed.mean}`,
    url: pageUrl, inLanguage: 'en',
    inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'OpenEmoji emoji dictionary', url: SITE_URL + '/en/' },
  }, {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: EMOJI_EN.faqMeans(name), acceptedAnswer: { '@type': 'Answer', text: `${ed.mean}.` } },
      { '@type': 'Question', name: EMOJI_EN.faqWhen(name), acceptedAnswer: { '@type': 'Answer', text: ed.use.join('; ') } },
      ...(ed.note ? [{ '@type': 'Question', name: EMOJI_EN.faqNote(name), acceptedAnswer: { '@type': 'Answer', text: ed.note } }] : []),
    ],
  }];
  const sup = VERSION_SUPPORT[e.emoji_version];
  const A = assets[e.emoji] || {};
  let html = head(title, desc, '', { path: `/en/e/${s}.html`, locale: 'en', ld });
  html += `<div class="crumbs"><a href="/en/index.html">Home</a><span class="sep">/</span><a href="/en/g/${gFileOf(gName)}">${esc(gName)}</a><span class="sep">/</span>${esc(name)}</div>
<div class="detail-grid">
  <div>
    <div class="stage card"><span class="big">${e.emoji}</span><span class="cp">${cpOf(e.emoji)}</span>
      <div class="btnrow">${copyBtn(e.emoji, e.slug, 'en')}</div>
      ${skinStrip(e.skin_tone_support, e.emoji)}
    </div>
  </div>
  <div>
    <h1 style="margin-top:0">${e.emoji} ${esc(name)}</h1>
    <p style="color:var(--muted);font-size:16px;margin-top:-.4em">${esc(gName)}</p>
    <div class="meta">
      <div><b>${EMOJI_EN.cldr}</b>${esc(e.name)}</div>
      <div><b>${EMOJI_EN.version}</b>Unicode ${esc(e.unicode_version)} · Emoji ${esc(e.emoji_version)}</div>
      <div><b>${EMOJI_EN.skin}</b>${e.skin_tone_support ? EMOJI_EN.skinYes : EMOJI_EN.skinNo}</div>
      <div><b>${EMOJI_EN.composition}</b>${describeSeqEn(e.emoji)}</div>
      <div><b>${EMOJI_EN.shortcode}</b>:${e.slug}:</div>
    </div>
    <h2>${EMOJI_EN.keywords}</h2>
    <div class="kw">${e.enKw.map((k) => `<span>${esc(k)}</span>`).join('')}</div>
  </div>
</div>
<h2>${esc(EMOJI_EN.meaningH2(name))}</h2>
<p class="lead">${esc(ed.mean)}</p>
<ul class="uses">${ed.use.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>
${ed.note ? `<div class="note"><b>Watch out</b> ${esc(ed.note)}</div>` : ''}
<div class="note">${EMOJI_EN.howTo(e.emoji)}</div>
${sup ? `<div class="note">${EMOJI_EN.compat(e.emoji_version, sup)}</div>` : ''}
<h2>${EMOJI_EN.renders}</h2>
<p style="color:var(--muted);font-size:14px;margin-top:-6px">${EMOJI_EN.rendersLead}</p>
<div class="renders">
  ${[['twemoji', 'Twemoji', 'Twitter/X style'], ['openmoji', 'OpenMoji', 'Open source'], ['noto', 'Noto Emoji', 'Google/Android style']].map(([k, n2, note]) => {
    const src = A[k];
    return src
      ? `<div class="render card"><div class="imgwrap"><img src="${absAsset(src)}" alt="${esc(e.name)} ${n2}" loading="lazy" onerror="this.parentElement.classList.add('fail');this.remove()"></div><b>${n2}</b><span>${note}</span></div>`
      : `<div class="render card"><div class="imgwrap fail"></div><b>${n2}</b><span>${note}</span></div>`;
  }).join('')}
  <div class="render card"><div class="imgwrap"><span style="font-size:56px">${e.emoji}</span></div><b>${EMOJI_EN.yourSystem}</b><span>Local rendering</span></div>
</div>`;
  const g = groups.find((x) => x.name === gName);
  const i = g.emojis.findIndex((x) => x.slug === s);
  const sib = g.emojis.slice(Math.max(0, i - 12), i + 12).filter((x) => x.slug !== s);
  html += `<h2>${EMOJI_EN.related}</h2><div class="grid">${sib.map((x) => gridItem(x, 'en')).join('')}</div>`;
  html += FOOT('', 'en');
  fs.writeFileSync(path.join(OUT, 'en', 'e', `${s}.html`), html);
}

// 英文搜索索引：t 字段用纯英文名，避免英文用户搜出来的结果带着中文
fs.writeFileSync(path.join(OUT, 'search-en.json'), JSON.stringify(
  all.map((e) => ({ c: e.emoji, s: e.slug, t: cap(e.name), k: [...new Set([e.name, e.slug.replace(/_/g, ' '), ...e.enKw].filter(Boolean))].join(' ').toLowerCase() })),
));
console.log(`english site: ${EN_EMOJI.length} emoji pages + ${groups.length} groups + home`);

// ---------- robots + sitemap ----------
fs.writeFileSync(path.join(OUT, 'favicon.svg'), FAVICON);
// og:image 由根目录 og.html 用无头 Chrome 渲染成 og.png，构建时复制进产物
if (fs.existsSync(path.join(ROOT, 'og.png'))) fs.copyFileSync(path.join(ROOT, 'og.png'), path.join(OUT, 'og.png'));
const zhUrls = [
  `/`, `/combo.html`, `/decorate.html`, `/preview.html`,
  `/trending/`, ...TRENDING.map((t) => `/trending/${t.slug}.html`),
  `/kaomoji/`, ...KAOMOJI.map((k) => `/kaomoji/${k.slug}.html`),
  ...groups.map((g) => `/g/${gFileOf(g.name)}`),
  ...validScenes.map((sc) => `/s/${sc.slug}.html`),
  ...all.map((e) => `/e/${e.slug}.html`),
];
const enUrls = [
  `/en/`, ...groups.map((g) => `/en/g/${gFileOf(g.name)}`), ...EN_EMOJI.map((s) => `/en/e/${s}.html`),
];
const today = new Date().toISOString().slice(0, 10);
const urlset = (list) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${list.map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(OUT, 'sitemap-zh.xml'), urlset(zhUrls));
fs.writeFileSync(path.join(OUT, 'sitemap-en.xml'), urlset(enUrls));
// 分语言 sitemap + 索引入口。robots 仍指向 /sitemap.xml，已提交过的地址不会失效。
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['sitemap-zh.xml', 'sitemap-en.xml'].map((f) => `  <sitemap><loc>${SITE_URL}/${f}</loc><lastmod>${today}</lastmod></sitemap>`).join('\n')}
</sitemapindex>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
// Cloudflare Pages cache rules: emoji art never changes, css/index short-lived
fs.writeFileSync(path.join(OUT, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
/assets/twemoji/*
  Cache-Control: public, max-age=31536000, immutable
/assets/openmoji/*
  Cache-Control: public, max-age=31536000, immutable
/assets/noto/*
  Cache-Control: public, max-age=31536000, immutable
/assets/twemoji.min.js
  Cache-Control: public, max-age=31536000, immutable
/assets/style.css
  Cache-Control: public, max-age=604800
/favicon.svg
  Cache-Control: public, max-age=604800
/search.json
  Cache-Control: public, max-age=86400
/search-en.json
  Cache-Control: public, max-age=86400
`);

// ---------- 404 ----------
{
  let html = head('页面不存在（404）| OpenEmoji', '你要找的页面不存在，可能是 emoji 链接拼错了。', '', {
    path: '/404.html', noindex: true,
  });
  html += `<div class="hero"><span class="kicker">404</span><h1>这个页面<span class="gradtext">不存在</span></h1>
<p>链接可能拼错了，或者对应的 emoji 还没收录。</p></div>
<div class="cat"><a href="/index.html"><span class="n">🏠</span>回到首页查 emoji</a><a href="/trending/"><span class="n">📖</span>梗解读</a><a href="/kaomoji/"><span class="n">(๑•̀ㅂ•́)</span>颜文字</a></div>`;
  html += FOOT();
  fs.writeFileSync(path.join(OUT, '404.html'), html);
}

// ---------- shared client search helper ----------
// 按 <html lang> 选索引：英文站用纯英文名，中文站带中文名
fs.writeFileSync(path.join(OUT, 'app.js'),
  `window.emojiSearch={idx:null,async load(){if(!this.idx){const p=document.documentElement.lang==='en'?'/search-en.json':'/search.json';const r=await fetch(p);this.idx=await r.json();}return this.idx;},query(v){return this.idx.filter(e=>e.k.indexOf(v)>-1);}};`);

// ---------- smoke checks (fail loudly on data drift) ----------
const problems = [];
for (const g of groups) {
  if (!GROUP_ICONS[g.name]) problems.push(`group missing icon: ${g.name}`);
  if (!GROUP_ZH[g.name]) problems.push(`group missing zh name: ${g.name}`);
}
const eFiles = fs.readdirSync(path.join(OUT, 'e')).filter((f) => f.endsWith('.html'));
if (eFiles.length !== all.length) problems.push(`emoji pages ${eFiles.length} != emojis ${all.length}`);
const slugSet = new Set(all.map((e) => e.slug));
const orphanEditorial = Object.keys(EDITORIAL).filter((s) => !slugSet.has(s));
if (orphanEditorial.length) problems.push(`editorial slugs not found: ${orphanEditorial.join(', ')}`);
console.log(`editorial coverage: ${Object.keys(EDITORIAL).length - orphanEditorial.length}/${all.length} pages (${Math.round((Object.keys(EDITORIAL).length - orphanEditorial.length) / all.length * 1000) / 10}%)`);
if (zhUrls.length !== all.length + TRENDING.length + 1 + KAOMOJI.length + 1 + groups.length + validScenes.length + 4)
  problems.push(`sitemap-zh urls ${zhUrls.length} mismatch`);
if (enUrls.length !== 1 + groups.length + EN_EMOJI.length)
  problems.push(`sitemap-en urls ${enUrls.length} mismatch`);
// broken-link scan across all generated html + SEO 基础项校验
const badRe = /(href|src)="[^"]*(?:undefined|\/e\/|\/s\/|\/g\/)[^"]*undefined[^"]*"/;
let badCount = 0, noCanon = 0, noJsonLd = 0, dupTitle = 0, badScript = 0, longTitle = 0;
let hreBad = 0, hrePages = 0, enNoHre = 0, badLink = 0;
const urlToFile = (href) => {
  const rel = href.replace(SITE_URL, '');
  return path.join(OUT, rel.endsWith('/') ? rel + 'index.html' : rel);
};
const scan = (dir) => { for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
  const p = path.join(dir, f.name);
  if (f.isDirectory()) { if (f.name !== 'assets') scan(p); continue; }
  if (!f.name.endsWith('.html')) continue;
  const html = fs.readFileSync(p, 'utf8');
  if (badRe.test(html) || html.includes('>undefined<')) { badCount++; if (badCount <= 3) console.warn(`  ⚠ broken ref in ${p}`); }
  const is404 = f.name === '404.html';
  if (!is404 && !html.includes('rel="canonical"')) { noCanon++; if (noCanon <= 3) console.warn(`  ⚠ no canonical: ${p}`); }
  if (!is404 && !html.includes('application/ld+json')) { noJsonLd++; if (noJsonLd <= 3) console.warn(`  ⚠ no JSON-LD: ${p}`); }
  const t = (html.match(/<title>(.*?)<\/title>/) || [])[1] || '';
  if (/(\S{20,})\s\1/.test(t)) { dupTitle++; if (dupTitle <= 3) console.warn(`  ⚠ duplicated title: ${p} → ${t}`); }
  if (t.length > 65) { longTitle++; }
  for (const m of html.matchAll(/src="([^"]*app\.js)"/g)) {
    const t2 = m[1].startsWith('/') ? path.join(OUT, m[1]) : path.resolve(path.dirname(p), m[1]);
    if (!fs.existsSync(t2)) { badScript++; if (badScript <= 3) console.warn(`  ⚠ broken script: ${p} → ${m[1]}`); }
  }
  // 站内链接必须落到真实文件：英文页大量链接 /en/e/*，最容易在这里踩到 404
  for (const m of html.matchAll(/href="([^"'#:?]+)"/g)) {
    const h = m[1];
    if (!h || h.startsWith('//') || h.includes('+')) continue;
    const rel2 = h.endsWith('/') ? h + 'index.html' : h;
    const t3 = rel2.startsWith('/') ? path.join(OUT, rel2) : path.resolve(path.dirname(p), rel2);
    if (!fs.existsSync(t3)) { badLink++; if (badLink <= 5) console.warn(`  ⚠ broken link: ${path.relative(OUT, p)} → ${h}`); }
  }
  // hreflang 互指：每条 alternate 都必须指向磁盘上真实存在的页面
  const alts = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)];
  if (alts.length) hrePages++;
  if (p.includes(`${path.sep}en${path.sep}`) && !alts.length) { enNoHre++; if (enNoHre <= 3) console.warn(`  ⚠ en page without hreflang: ${p}`); }
  for (const [, lang, href] of alts) {
    if (!fs.existsSync(urlToFile(href))) { hreBad++; if (hreBad <= 3) console.warn(`  ⚠ hreflang ${lang} → missing: ${href}`); }
  }
} };
scan(OUT);
if (badCount) problems.push(`${badCount} html files contain undefined refs`);
if (noCanon) problems.push(`${noCanon} html files missing canonical`);
if (noJsonLd) problems.push(`${noJsonLd} html files missing JSON-LD`);
if (dupTitle) problems.push(`${dupTitle} html files have duplicated title text`);
if (badScript) problems.push(`${badScript} html files reference a missing app.js`);
if (hreBad) problems.push(`${hreBad} hreflang tags point at non-existent pages`);
if (enNoHre) problems.push(`${enNoHre} english pages missing hreflang`);
if (badLink) problems.push(`${badLink} internal links point at non-existent files`);
console.log(`seo check: ${zhUrls.length} zh urls + ${enUrls.length} en urls, canonical ok, hreflang ${hrePages} pages, titles >65 chars: ${longTitle}`);
const cov = Object.fromEntries(ASSET_SETS.map((s) => [s.key, all.filter((e) => assets[e.emoji] && assets[e.emoji][s.key]).length]));
console.log(`asset coverage: twemoji ${cov.twemoji}/${all.length}, openmoji ${cov.openmoji}/${all.length}, noto ${cov.noto}/${all.length}`);
if (problems.length) { console.error('SMOKE CHECK FAILED:\n  ' + problems.join('\n  ')); process.exitCode = 1; }

console.log(`done: index + ${groups.length} groups + ${validScenes.length} scenes + ${n} emoji pages + en(${enUrls.length}) + sitemap (${zhUrls.length} zh / ${enUrls.length} en) -> ${OUT}`);
