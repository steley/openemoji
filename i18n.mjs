// 多语言配置：语言元数据 + 各语言 UI 文案
// 中文站占用根路径，英文站占用 /en/ 子目录（共享域名权重，不用子域名）
export const LOCALES = {
  zh: { code: 'zh-CN', htmlLang: 'zh-CN', ogLocale: 'zh_CN', prefix: '', path: '/', label: '中文', switchTo: 'English', switchShort: 'EN' },
  en: { code: 'en', htmlLang: 'en', ogLocale: 'en_US', prefix: '/en', path: '/en/', label: 'English', switchTo: '中文', switchShort: '中' },
};
export const DEFAULT_LOCALE = 'zh';
// x-default 指向的语言：全球访客默认进英文
export const X_DEFAULT_LOCALE = 'en';

export const UI = {
  zh: {
    home: '首页',
    searchPlaceholder: '搜索 emoji：开心 / heart / 庆祝…',
    searchAria: '搜索 emoji',
    noResult: '没有找到，换个词试试',
    switchAria: '切换语言 / Switch language',
    footerNote: '免费 emoji 词典 · 数据来自 Unicode CLDR (CC BY 4.0) · 与 Unicode Consortium 无隶属关系',
    nav: [['首页', '/index.html'], ['组合', '/combo.html'], ['梗解读', '/trending/'], ['场景', '/index.html#scenes'], ['颜文字', '/kaomoji/'], ['分类', '/index.html#cats']],
  },
  en: {
    home: 'Home',
    searchPlaceholder: 'Search emoji: skull, heart, party…',
    searchAria: 'Search emoji',
    noResult: 'No match — try another word',
    switchAria: 'Switch language / 切换语言',
    footerNote: 'Free emoji dictionary · Data from Unicode CLDR (CC BY 4.0) · Not affiliated with the Unicode Consortium',
    nav: [['Home', '/index.html'], ['Meanings', '/index.html#meanings'], ['Categories', '/index.html#cats']],
  },
};

// 英文分类页人工导语（9 个，不是机翻，按英文互联网的实际用法写）
export const GROUP_EN = {
  'Smileys & Emotion': {
    title: 'Smileys & Emotion',
    desc: 'Every smiley and emotion emoji with its English name, meaning and copy button — including the ones that read as passive-aggressive.',
    lead: 'The most-used group, and the most misread one. 🙂 is not a smile any more, it is a polite refusal. 😂 now reads as slightly dated; 💀 is what people actually use to laugh. Read the room before you pick one.',
  },
  'People & Body': {
    title: 'People & Body',
    desc: 'Hand gestures, body language and people emoji: what 👍 🙏 💪 really signal, and which ones land as rude.',
    lead: 'Gestures are where emoji go wrong across cultures. 👍 can read as "fine, whatever" in a work chat, 🙏 is both thank-you and please, and 🖕 is unambiguous. Check who you are sending to.',
  },
  'Animals & Nature': {
    title: 'Animals & Nature',
    desc: 'Animal, plant and weather emoji with English names, meanings and one-click copy.',
    lead: 'Animals and weather are the safest group — they mean what they look like. The exceptions are puns: 🐍 for a snake in the grass, 🦄 for something unrealistically good, 🌶️ for spicy takes.',
  },
  'Food & Drink': {
    title: 'Food & Drink',
    desc: 'Food and drink emoji: ☕ 🍜 🍺 and what they mean beyond the literal.',
    lead: 'Mostly literal, with a few that internet slang has rewritten: ☕ became "let me get my tea" for drama, 🍑 and 🍆 are suggestive between friends. Use the literal meaning in menus and recipes.',
  },
  'Travel & Places': {
    title: 'Travel & Places',
    desc: 'Transport, places and scenery emoji: ✈️ 🏖️ 🌃 with English names and copy.',
    lead: 'Travel emoji carry a lot of information per character, which makes them good substitutes for words: ✈️ is departure, 🏖️ is holiday mode, 🌃 is a city at night. Put them at the start of a line for skimmable itineraries.',
  },
  'Activities': {
    title: 'Activities',
    desc: 'Sports, games and celebration emoji: ⚽ 🎮 🎉 and when to use each.',
    lead: 'Two jobs: announcing and celebrating. 🎉 is the generic one, 🏆 emphasises placing first, 🎮 sets a gaming context. Small group, highest recognisability — good for headings.',
  },
  'Objects': {
    title: 'Objects',
    desc: 'Everyday object emoji: 📱 💡 🔔 with meanings and workplace context.',
    lead: 'Objects are the supporting cast of lists and notifications: 📌 pins the point, 🔔 is a reminder, 📎 is an attachment. Their meanings are stable, which makes them unusually safe in work contexts.',
  },
  'Symbols': {
    title: 'Symbols',
    desc: 'Symbol emoji: ❤️ ✅ ⚠️ 💯 — meaning, emphasis and the ways they get misused.',
    lead: 'Symbols carry most of the tone in a message: ✅ confirms, ⚠️ warns, 💯 endorses. They are more neutral than faces, which is why they work at work — and why getting one wrong feels colder than getting a face wrong.',
  },
  'Flags': {
    title: 'Flags',
    desc: 'All country and region flag emoji, listed by country name, with one-click copy.',
    lead: 'Flag emoji map ISO country codes onto Unicode regional indicator pairs. England, Scotland and Wales use tag sequences instead, which some Android builds render as letters rather than a flag.',
  },
};

// 英文站首页文案
export const HOME_EN = {
  title: 'OpenEmoji — Emoji Meanings, Names & One-Click Copy',
  desc: 'Free emoji dictionary: English names, meanings, keywords and code points for every emoji, with one-click copy. Includes Emoji 17.0.',
  kicker: '✨ Emoji 17.0 included',
  h1: 'Every emoji, <span class="gradtext">explained</span>',
  p: (n) => `${n} emoji with names, keywords and code points. Click to copy. Search runs entirely in your browser — nothing is uploaded.`,
  h2Meanings: '📖 What it actually means',
  h2Tools: '🧩 Tools',
  h2Cats: '📂 Browse by category',
  h2New: '🆕 Newest emoji (Emoji 15.1 – 17.0)',
  copyNote: 'Click the button above to copy',
};

// 英文详情页固定文案
export const EMOJI_EN = {
  cldr: 'CLDR name',
  version: 'Version',
  skin: 'Skin tones',
  skinYes: 'Supported',
  skinNo: 'Not supported',
  composition: 'Composition',
  shortcode: 'Shortcode',
  keywords: 'Keywords',
  howTo: (ch) => `<b>How to use it</b> Click the copy button above to grab ${ch}, then paste it into iMessage, WhatsApp, Slack, Instagram, X or any text field. Emoji are standard Unicode characters, so they work everywhere — iOS, Android and Windows each draw them in their own style.`,
  compat: (ver, sup) => `<b>Display support</b> This emoji was added in Emoji ${ver} (${sup[0]}). It renders on ${sup[1]} and later, and on ${sup[2]} and later — older systems show a box or a black-and-white glyph.`,
  renders: 'Design comparison',
  rendersLead: 'Your phone shows its built-in artwork. Below is how open-source emoji sets draw the same character (images are bundled with the site, no external requests):',
  yourSystem: 'Your system',
  related: 'Related emoji',
  copyEmoji: '📋 Copy emoji',
  copyShort: 'Copy',
  copied: '✅ Copied',
  meaningH2: (name) => `What ${name} means and when to use it`,
  faqMeans: (name) => `What does the ${name} emoji mean?`,
  faqWhen: (name) => `When do people use ${name}?`,
  faqNote: (name) => `Anything to watch out for with ${name}?`,
};
