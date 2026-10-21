// 英文人工内容（English-internet usage, NOT a translation of editorial.mjs）
// ---------------------------------------------------------------------------
// 为什么单独写：中文那 100 条的价值在中文语境（「🙂 对上级用是阴阳怪气第一名」），
// 直译成英文毫无意义。英文有自己的一套网络用法：💀 = "I'm dead"( laughter )，
// 🙃 是 passive-aggressive，💅 是 sassy。必须重写，不能互转。
//
// 字段：
//   mean  —— 一句话含义（必填）
//   use   —— 1~2 条真实使用场景（必填，数组）
//   note  —— 容易误解/踩坑的地方（可选）
//
// 新增页面的方式：在这里加一个 slug 条目即可，构建脚本会自动
//   · 生成 /en/e/<slug>.html
//   · 给对应的中文页加 hreflang
//   · 把页面写进 sitemap-en.xml
// slug 必须和中文站用的一致（即 unicode-emoji-json 的 slug，可在 /e/ 目录名里查）。
// 构建时若 slug 不存在会直接 fail，不会静默丢掉内容。
//
// 当前覆盖：60 条高频表情（脸 / 手势 / 心形 / 符号）。扩容时优先按 GSC
// 里有曝光但排名 8-20 位的 emoji 补，不要盲目铺量。
// ---------------------------------------------------------------------------
export const EDITORIAL_EN = {
  // ---------- faces: smiling ----------
  grinning_face: {
    mean: 'A plain happy face — the default smile, with no subtext either way',
    use: [
      'Friendly acknowledgement when a real sentence would be too much, like "got it 😀"',
      'Warm sign-off in a message to someone you do not know well',
    ],
    note: 'It reads as slightly generic or older-generation. Younger users reach for 😁 or 😄 when they want warmth that still feels current.',
  },
  grinning_squinting_face: {
    mean: 'Big open-mouthed laughter — the text version of "XD"',
    use: [
      'Laughing at a joke in a way that stays wholesome — no mockery implied',
      'Reacting to a friend\'s good news with visible enthusiasm',
    ],
    note: 'Feels a little dated next to 😂 or 💀. Perfectly normal with family and older colleagues; with teenagers it lands as mom-texting energy.',
  },
  beaming_face_with_smiling_eyes: {
    mean: 'Genuinely delighted — a grin so wide the eyes are smiling too',
    use: [
      'Real excitement about something concrete: a job offer, a trip, a delivery',
      'Celebrating someone else\'s win without any edge',
    ],
    note: 'This one is hard to read as sarcastic, which is why it is safe for work chat. If you want plausible deniability, use 🙂 instead.',
  },
  rolling_on_the_floor_laughing: {
    mean: 'Laughing so hard you are literally on the floor — the literal ROFL',
    use: [
      'Reacting to something outrageously funny, stronger than 😆',
      'Laughing at your own terrible joke before anyone else does',
    ],
    note: 'Now widely considered dated. 💀 and 😭 took over this job among younger users; 🤣 survives mostly in group chats with older relatives.',
  },
  face_with_tears_of_joy: {
    mean: 'Laughing so hard you cry — the classic, now slightly dated laugh',
    use: [
      'Laughing at something genuinely funny in a mixed-age group where 💀 might not land',
      'Softening a blunt statement so it does not read as an attack',
    ],
    note: 'Among younger users it now signals mild normie energy — 💀 or 🫠 replaced it. Using it with people over 35 is completely safe; using it with teenagers is not.',
  },
  slightly_smiling_face: {
    mean: 'A polite smile that usually means the opposite of friendly',
    use: [
      'Closing a conversation you do not want to continue',
      'Acknowledging an instruction you disagree with, in front of other people',
    ],
    note: 'Widely read as passive-aggressive in English-speaking internet culture. In a work chat it can read as thinly veiled annoyance — do not aim it at a manager.',
  },
  upside_down_face: {
    mean: 'Sarcastic cheerfulness — "everything is fine" while nothing is fine',
    use: [
      'Reacting to a disaster you cannot change: cancelled flight, rejected application',
      'Answering an obviously unreasonable request with fake brightness',
    ],
    note: 'It is almost never read literally. If you send 🙃 after good news, people will assume something went wrong.',
  },
  winking_face: {
    mean: 'Playful or flirtatious — "you know what I mean"',
    use: [
      'Joking aside a comment to a friend, signalling you are not serious',
      'Light flirting in DMs where both sides already know the tone',
    ],
    note: 'Risky at work. In professional chat it can read as condescending or inappropriate, especially from a manager to a junior.',
  },
  smiling_face_with_heart_eyes: {
    mean: 'You love it — intense appreciation for a thing, not usually a person',
    use: [
      'Reacting to food photos, a great outfit, a new puppy',
      'Saying you adore a song, a show, or someone\'s work',
    ],
    note: 'Aimed at a person it reads as flirty. Aimed at an object it is completely neutral — "😍 that jacket" is just a compliment.',
  },
  smiling_face_with_hearts: {
    mean: 'Soft, sincere affection — the warmest face in the set',
    use: [
      'Replying to a partner or close friend with genuine fondness',
      'Showing appreciation for a small kind gesture',
    ],
    note: 'Less performative than 😍 and less flirty than 😘. This is the one people pick when they actually mean it.',
  },
  face_blowing_a_kiss: {
    mean: 'Sending a kiss — affection, or a breezy goodbye',
    use: [
      'Ending a message to a partner or close friend warmly',
      'Dismissing a teasing comment with "love you, bye 😘"',
    ],
    note: 'In a work context it can be read as condescending, particularly the "😘 bye" version used when someone is being difficult.',
  },
  smiling_face_with_open_hands: {
    mean: 'A hug, but also the "I am just saying this supportively" face',
    use: [
      'Comforting someone after bad news without being heavy about it',
      'Delivering an opinion you know they will not like, wrapped in warmth',
    ],
    note: 'The hands make it read as either an embrace or a shrug. If you are correcting someone, 🤗 can come across as patronising.',
  },

  // ---------- faces: thinking / skeptical ----------
  thinking_face: {
    mean: 'Thinking — in practice, usually doubt rather than curiosity',
    use: [
      'Signalling that a claim sounds off without accusing anyone directly',
      'Buying time before answering a question you need to consider',
    ],
    note: 'It has largely become a sarcasm marker: 🤔 after someone\'s statement means "sure, if you say so". Genuine curiosity is better served by a real question.',
  },
  face_with_raised_eyebrow: {
    mean: 'One eyebrow up — visible skepticism or "are you serious?"',
    use: [
      'Reacting to a claim that does not add up',
      'Responding to a bad excuse without writing a paragraph about it',
    ],
    note: 'Blunter than 🤔. In a group chat it can start an argument because it openly questions the person, not just the statement.',
  },
  neutral_face: {
    mean: 'Flat acknowledgement — no emotion offered, none implied',
    use: [
      'Confirming you read something you have no opinion about',
      'Replying to a message you find mildly irritating but will not address',
    ],
    note: 'The absence of warmth is the message. People read 😐 as disapproval far more often than as genuine neutrality.',
  },
  face_without_mouth: {
    mean: 'Speechless — nothing to say, or saying nothing on purpose',
    use: [
      'Reacting to a message so awkward that commenting would make it worse',
      'Confirming receipt of something you refuse to engage with',
    ],
    note: 'Extremely passive-aggressive in close relationships. It reads as the silent treatment in emoji form.',
  },
  smirking_face: {
    mean: 'Smug — you know something, or you just got away with something',
    use: [
      'Teasing a friend after winning an argument',
      'Making a suggestive joke where the implication is the point',
    ],
    note: 'Default interpretation in DMs is flirty or suggestive. Typed at a colleague it reads as creepy more often than clever.',
  },
  unamused_face: {
    mean: 'Side-eye — unimpressed and letting you know it',
    use: [
      'Reacting to a bad pun or a predictable joke',
      'Answering a message that wasted your time',
    ],
    note: 'Milder than 🙄 but the same family. Fine between friends; in a work chat it visibly cools the room.',
  },
  face_with_rolling_eyes: {
    mean: 'An eye-roll — "obviously" or "here we go again"',
    use: [
      'Reacting to a take so predictable it does not deserve words',
      'Agreeing with a friend about something annoying a third party did',
    ],
    note: 'Effectively an insult. Never use it in professional chat or with someone you have not established a joking tone with.',
  },
  lying_face: {
    mean: 'Pinocchio — "sure you did", calling out a lie',
    use: [
      'Reacting to an obviously fake excuse among friends',
      'Self-mockery after you said you would go to the gym and did not',
    ],
    note: 'Pointed at a real person it is an accusation. The self-directed version ("I\'m fine 🤥") is common and harmless.',
  },

  // ---------- faces: sad / overwhelmed ----------
  relieved_face: {
    mean: 'Exhaling — calm after something stressful is over',
    use: [
      'Reacting to a deadline being extended or a problem resolving itself',
      'Describing a quiet, contented moment: coffee, no notifications',
    ],
    note: 'Also used as serene smugness. "😌" after someone complains about their day can read as "glad I am not you".',
  },
  pensive_face: {
    mean: 'Quiet sadness or regret — the mature version of disappointed',
    use: [
      'Reacting to bad news that does not call for drama',
      'Admitting a mistake without making it about you',
    ],
    note: 'Much softer than 😢. It reads as reflective rather than tearful, which makes it the safer choice for condolences.',
  },
  exploding_head: {
    mean: 'Mind blown — genuinely stunned, in a good or bad way',
    use: [
      'Reacting to a fact that reorganises how you see something',
      'Expressing that a workload or price has become absurd',
    ],
    note: 'Context decides whether it is amazement or a breakdown. Add a word if you need people to know which.',
  },
  partying_face: {
    mean: 'Party — celebration, birthdays, anything worth a toast',
    use: [
      'Wishing someone a happy birthday',
      'Celebrating a launch, a promotion, or the end of a long week',
    ],
    note: 'The hat and horn make it explicitly festive. It cannot express "congratulations, sincerely" as well as 🎉, which is more neutral.',
  },
  smiling_face_with_sunglasses: {
    mean: 'Cool — unbothered, confident, "deal with it"',
    use: [
      'Reacting to solving a problem effortlessly',
      'Playing it cool after something embarrassing happened',
    ],
    note: 'Inherited the "deal with it" glasses meme. Between friends it is swagger; at work it can read as arrogance.',
  },
  confused_face: {
    mean: 'Mildly confused or let down — a small frown, not distress',
    use: [
      'Admitting you did not follow an explanation',
      'Reacting to a mildly disappointing outcome without making a scene',
    ],
    note: 'Frequently read as sulking rather than confusion. If you actually need clarification, ❓ or a question mark works better.',
  },
  pleading_face: {
    mean: 'The "please" face — begging, and also overwhelming tenderness',
    use: [
      'Asking for a favour you know is a bit much',
      'Reacting to something unbearably cute',
    ],
    note: 'The double meaning trips people up: 🥺 after a photo means "my heart", not "I want something". Context, or a word, decides.',
  },
  crying_face: {
    mean: 'Sad — a single tear, sincere and direct',
    use: [
      'Reacting to genuine disappointment or bad news',
      'Showing you are hurt without escalating into an argument',
    ],
    note: 'In flirty or joking contexts it is often performative ("I miss the show 😢"). In serious conversations it is read literally, so use it carefully.',
  },
  loudly_crying_face: {
    mean: 'Sobbing — overwhelmed, which is often a good thing',
    use: [
      'Reacting to something so funny you cannot breathe',
      'Being moved by a film, a reunion, or a message from a friend',
    ],
    note: 'This is the most misread emoji in English. 😭 usually means intense emotion, not grief — "I\'m crying" online means laughing or touched. Never use it for actual condolences.',
  },
  face_screaming_in_fear: {
    mean: 'The Home Alone scream — shock or terror, usually comic',
    use: [
      'Reacting to a sudden surprise: an exam moved up, a price hike',
      'Reacting to horror content or a genuinely disturbing fact',
    ],
    note: 'Reads as exaggerated even when sincere. In English, 😱 is closer to "what?!" than to real fear.',
  },
  enraged_face: {
    mean: 'Red-faced fury — the angriest face in the set',
    use: [
      'Expressing outrage at a public situation, not at the person you are talking to',
      'Mock-raging about a minor inconvenience',
    ],
    note: 'Directed at a real person it is aggressive and hard to walk back. 😠 is the safer choice for ordinary irritation.',
  },
  angry_face: {
    mean: 'Mild anger — annoyed, pouting, still under control',
    use: [
      'Complaining about traffic, weather, or a bad night\'s sleep',
      'Showing you are displeased without starting a fight',
    ],
    note: 'Often used cutely between couples ("😠 you forgot"). Against a stranger it reads as genuine hostility.',
  },

  // ---------- faces: mischievous / weird ----------
  smiling_face_with_horns: {
    mean: 'Mischief — "I am being bad and enjoying it"',
    use: [
      'Admitting to a small, funny wrongdoing',
      'Making a cheeky suggestion you know you should not make',
    ],
    note: 'It is devilish, not evil. Nobody reads it as satanic; it reads as playful troublemaking.',
  },
  skull: {
    mean: 'Laughter — the current way to say "I\'m dead" at something funny',
    use: [
      'Reacting to a message so funny you cannot form words — it replaced 😂 for most people under 25',
      'Self-deprecating reaction to your own bad luck or bad decision',
    ],
    note: 'Never send it to announce an actual death or in condolence messages. It reads as a joke every single time, which makes it uniquely bad in serious contexts.',
  },
  pile_of_poo: {
    mean: 'Crap — something bad, low quality, or a terrible take',
    use: [
      'Reacting to a bad product, bad weather, or a bad decision',
      'Self-deprecating: "my code today 💩"',
    ],
    note: 'Blunt but mild. Sending it at someone\'s work is insulting; sending it at a situation is standard complaining.',
  },
  clown_face: {
    mean: 'Clown — someone is being ridiculous, usually yourself',
    use: [
      'Mocking yourself after an obviously dumb mistake',
      'Calling out a take you think is absurd, or a public figure you have lost respect for',
    ],
    note: 'The "🤡 world" meme made this a political insult at times. Aimed at a person in an argument it escalates fast.',
  },
  ghost: {
    mean: 'A ghost — Halloween, spooky things, or the act of ghosting someone',
    use: [
      'Seasonal posts in October',
      'Joking that you have disappeared from a chat: "sorry, been a 👻"',
    ],
    note: 'As a verb it means cutting off contact without explanation. Joking about ghosting someone says more about you than about them.',
  },
  melting_face: {
    mean: 'Dying inside — overwhelmed, embarrassed, or losing composure',
    use: [
      'Reacting to an awkward moment you cannot recover from',
      'Describing being crushed by heat, workload, or secondhand embarrassment',
    ],
    note: 'The Gen-Z successor to 🙃 for quiet despair. Coming from someone over 35 it reads as a deliberate joke about being old.',
  },
  face_holding_back_tears: {
    mean: 'Touched — the "I am not crying, you are" face',
    use: [
      'Reacting to a genuinely moving message or a proud moment',
      'Being moved by something wholesome: a dog reunion, a kind comment',
    ],
    note: 'Unlike 😭 this one is almost always sincere affection. It is the standard reply to "I\'m proud of you".',
  },

  // ---------- hands ----------
  thumbs_up: {
    mean: 'Approval — but it can read as a conversation-ender',
    use: [
      'Confirming a plan or agreeing to a request',
      'Acknowledging a message you will act on later',
    ],
    note: 'Among younger users, 👍 carries a passive-aggressive edge, roughly "noted, I have nothing more to say". It is the single most common source of emoji miscommunication between generations.',
  },
  thumbs_down: {
    mean: 'Dislike — direct disapproval',
    use: [
      'Rejecting an idea or a suggestion',
      'Reacting to a bad movie, bad food, bad policy',
    ],
    note: 'Barely softened by being an emoji. In a team chat a bare 👎 on someone\'s proposal lands harshly; a sentence explaining why works better.',
  },
  ok_hand: {
    mean: 'Perfect — precise approval, or "chef\'s kiss" quality',
    use: [
      'Confirming agreement cleanly in a chat with friends',
      'Praising food, a joke, or a well-executed plan',
    ],
    note: 'Carries a 2017-era hoax association that made brands and some organisations drop it. Culturally it is harmless; institutionally it can still get flagged.',
  },
  pinched_fingers: {
    mean: 'The Italian hand gesture — "what do you want?" or "exquisite"',
    use: [
      'Praising food or art with a chef\'s-kiss flourish',
      'Jokingly demanding an explanation, Italian-style',
    ],
    note: 'Two readings in one glyph: admiration or exasperation. The tone of the message decides which one people hear.',
  },
  victory_hand: {
    mean: 'Peace — a casual sign-off or a photo pose',
    use: [
      'Ending a message breezily, like "later ✌️"',
      'Celebrating a small win without being loud about it',
    ],
    note: 'Reads as light and youthful rather than triumphant. If you want to signal a real victory, 🎉 or 🙌 does more work.',
  },
  crossed_fingers: {
    mean: 'Hoping — "fingers crossed it works out"',
    use: [
      'Wishing someone luck before an interview or a result',
      'Admitting you are hoping for something you cannot control',
    ],
    note: 'In English it also implies you might be saying something untrue — historically, crossing fingers behind your back cancels a promise. Context keeps these apart.',
  },
  waving_hand: {
    mean: 'Hello or goodbye — a wave, friendly and low-effort',
    use: [
      'Opening or closing a message to someone you like',
      'Waving into a group chat you are about to leave',
    ],
    note: 'A bare 👋 in reply to a long message reads as a dismissal. It is warm only when the conversation is already over.',
  },
  clapping_hands: {
    mean: 'Applause — but just as often, slow sarcastic clapping',
    use: [
      'Congratulating someone on a real achievement',
      'Congratulating someone ironically on an obviously bad decision',
    ],
    note: 'Genuinely ambiguous. The sarcastic reading dominates on X and in group chats; the sincere reading survives in messages to family.',
  },
  raising_hands: {
    mean: 'Hooray — celebrating, or volunteering for something',
    use: [
      'Celebrating a win with visible energy',
      'Volunteering in a group chat: "🙌 me, I\'ll do it"',
    ],
    note: 'Both hands up also reads as surrender or "I give up" in some threads. Again, tone decides.',
  },
  folded_hands: {
    mean: 'Please, thank you, or respectful pleading — not only prayer',
    use: [
      'Asking for a favour: "please 🙏"',
      'Thanking someone for something that genuinely helped',
    ],
    note: 'In English it is primarily gratitude and request, not worship. Sending 🙏 to a religious person in a religious context is fine; sending it as "praying for you" to a non-religious person can feel odd.',
  },
  flexed_biceps: {
    mean: 'Strength — "you got this", or gym talk',
    use: [
      'Encouraging someone before a hard task: "you\'ve got this 💪"',
      'Talking about training, progress, or physical effort',
    ],
    note: 'Also used sincerely as "stay strong" after bad news, which can feel dismissive if the person needed sympathy instead.',
  },
  nail_polish: {
    mean: 'Sassy — "I said what I said", unbothered and a little superior',
    use: [
      'Delivering a read or a piece of gossip with attitude',
      'Reacting to drama you are deliberately staying out of',
    ],
    note: 'Strongly coded as feminine and queer-friendly in English internet culture. From someone outside that context it can read as imitation rather than fluency.',
  },

  // ---------- hearts ----------
  red_heart: {
    mean: 'Love — the plainest, most sincere heart there is',
    use: [
      'Replying to a partner, a parent, or a close friend',
      'Agreeing warmly with a post you actually like',
    ],
    note: 'Unlike most emoji, ❤️ is rarely ironic. Dumping three in a row is normal affection; using it on a stranger\'s post reads as intense.',
  },
  broken_heart: {
    mean: 'Heartbreak — romantic pain, or dramatic disappointment',
    use: [
      'Reacting to a breakup or a rejection',
      'Mock-grieving over a cancelled show or a sold-out item',
    ],
    note: 'The scale is entirely contextual. 💔 about a TV show and 💔 about a divorce are the same glyph, which is why it needs words around it.',
  },
  heart_on_fire: {
    mean: 'Burning passion — intense love or desire',
    use: [
      'Reacting to a partner, or to someone exceptionally attractive',
      'Describing obsession with a hobby, a fandom, or a song',
    ],
    note: 'Much hotter than ❤️. Using it in a professional or family context is a real misfire, not a minor one.',
  },

  // ---------- symbols ----------
  fire: {
    mean: 'Lit — excellent, or literally hot',
    use: [
      'Praising a song, a look, or a take: "that\'s fire 🔥"',
      'Commenting on someone\'s appearance or on spicy food',
    ],
    note: 'In English it is almost never about an actual fire. Using it during a wildfire or a house fire will read as tone-deaf.',
  },
  sparkles: {
    mean: 'Aesthetic shimmer — clean, pretty, or emphasis',
    use: [
      'Framing a product or a photo as polished and appealing',
      'Adding emphasis without adding a claim: "new post ✨"',
    ],
    note: 'The most decorative emoji in the set, and the one most overused by brands. Purely ornamental; it carries no factual meaning.',
  },
  hundred_points: {
    mean: 'One hundred — "exactly", "facts", full agreement',
    use: [
      'Agreeing emphatically with a statement: "💯"',
      'Praising something as flawless',
    ],
    note: 'Strongly associated with AAVE-origin internet slang. It reads as natural in casual chat and as slightly try-hard from corporate accounts.',
  },
  eyes: {
    mean: 'Looking — "I saw that", attention, or judgment',
    use: [
      'Pointing at something without commenting on it',
      'Reacting to gossip or a suspicious message with silent interest',
    ],
    note: 'The meaning is entirely in the silence. 👀 alone can mean curiosity, approval, or "we both know what you did".',
  },
  party_popper: {
    mean: 'Congratulations — confetti, celebration, good news',
    use: [
      'Congratulating someone on a promotion, a launch, or an exam',
      'Announcing something you are pleased about yourself',
    ],
    note: 'Warmer and more neutral than 🥳, which is specifically partying. 🎉 works for both personal and professional good news.',
  },
  peach: {
    mean: 'A butt — or a flirtatious compliment about one',
    use: [
      'Flirting, usually in DMs and usually with some deniability',
      'Complimenting someone\'s physique or a cheeky photo',
    ],
    note: 'In English the innuendo is strong enough that it is not safe at work. The fruit meaning exists but is the minority reading.',
  },
};
