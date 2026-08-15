"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

type BugId = "wait" | "think" | "collect" | "beginner" | "perfect" | "tomorrow" | "ready";
type Step = "landing" | "handbook" | "world" | "room" | "reveal" | "storyTransition" | "story" | "transition" | "result";

const revealImages: Record<BugId, string> = {
  wait: "/characters/wait-reveal.png",
  think: "/characters/think-reveal.png",
  collect: "/characters/collect-reveal.png",
  beginner: "/characters/beginner-reveal.png",
  perfect: "/characters/perfect-reveal.png",
  tomorrow: "/characters/tomorrow-reveal.png",
  ready: "/characters/ready-reveal.png",
};

const bugs: Record<BugId, { image: string; code: string; name: string; en: string; intro: string; skills: readonly string[]; line: string; strength: string; pattern: string; task: string }> = {
  wait: { image: "/characters/wait.png", code: "DL-01", name: "再等等怪", en: "WAIT MONSTER", intro: "它总告诉你：马上就好了。但这个马上，已经过去很多天。", skills: ["准备能力 MAX", "风险意识 MAX", "启动速度 LOW"], line: "把等待包装成准备。", strength: "你很擅长降低风险", pattern: "不要等 100% 准备好，先启动 1%", task: "完成一次不完美开始" },
  think: { image: "/characters/think.png", code: "OC-02", name: "脑内开会王", en: "BRAIN MEETING KING", intro: "它每天讨论未来所有可能。唯一的问题：会议没有结束时间。", skills: ["预测能力 MAX", "分析能力 MAX", "行动速度 LOW"], line: "想象未来太久，忘记创造未来。", strength: "你能同时看见复杂问题的多个侧面", pattern: "会议越完整，现实反馈越晚到场", task: "停止讨论，开始实验" },
  collect: { image: "/characters/collect.png", code: "AR-03", name: "收藏大户", en: "BOOKMARK COLLECTOR", intro: "它有一个装满教程、课程、工具和攻略的巨大仓库，但很少打开使用。", skills: ["搜索能力 MAX", "学习能力 MAX", "输出能力 LOW"], line: "收藏很多答案，却没有提交作业。", strength: "你学习快，也知道去哪里寻找答案", pattern: "输入越多，第一次输出越容易延期", task: "把一个收藏变成作品" },
  beginner: { image: "/characters/beginner.png", code: "TR-04", name: "新手村村长", en: "BEGINNER VILLAGE CHIEF", intro: "它守护新手村很多年。装备越来越强，但是地图一直没换。", skills: ["成长能力 MAX", "耐心 MAX", "冒险能力 LOW"], line: "一直升级，却忘记进入游戏。", strength: "你愿意打磨基本功，也尊重成长过程", pattern: "训练替代了第一次真实交付", task: "进入真实世界第一关" },
  perfect: { image: "/characters/perfect.png", code: "PF-05", name: "完美拖延师", en: "PERFECT DELAYER", intro: "第一版还能优化，第十版还能优化。最终：还没发布。", skills: ["品质控制 MAX", "审美能力 MAX", "发布速度 LOW"], line: "追求满分，错过开始。", strength: "你有判断力、标准和完成细节的耐心", pattern: "没有发布的高分作品，收不到现实反馈", task: "发布一个 80 分作品" },
  tomorrow: { image: "/characters/tomorrow.png", code: "TM-06", name: "明天再说侠", en: "TOMORROW HERO", intro: "它拥有神秘能力：把今天的问题，传送到明天。", skills: ["未来规划 MAX", "时间管理 LOW"], line: "未来计划很多，今天行动很少。", strength: "你仍然相信事情可以改变", pattern: "第一步持续被分配给未来", task: "今天完成第一步" },
  ready: { image: "/characters/ready.png", code: "MV-00", name: "带着不确定出发的人", en: "MOVE BEFORE CERTAINTY", intro: "你没有等所有条件到齐，就先向现实发出了一个信号。", skills: ["低成本试探 MAX", "现实反馈 MAX", "空想时间 LOW"], line: "答案会在路上出现。", strength: "你能把未知拆成低成本行动", pattern: "一次顺利出发，不代表以后永远不会卡住", task: "24 小时内再完成一个真实动作" },
};

const discoveries = [
  { icon: "EV/01", image: "/questions/books-question.png", name: "消失的邀请函", place: "冒险事件 01 · OFFER 召唤局", text: "装备已准备：简历 ✔ 作品集 ✔ 技能 ✔。但发送按钮已经在背包里躺了很久。你准备按下「发送」吗？", choices: [
    ["🔧 继续升级装备｜等我再强化一点", "你打开了新的课程列表。等级提高了，发送按钮还在原地。", { beginner: 2, collect: 1 }],
    ["🗺 打开冒险地图｜先发送几个申请", "你没有承诺一定成功，只让真实世界先掉落一份反馈。", {}],
    ["🎨 装修基地｜再优化一下作品", "第一印象更精致了，冒险仍停在基地门口。", { perfect: 2 }],
    ["🧠 召开战略会议｜分析所有路线", "所有可能都发言了，行动还在等散会。", { think: 2 }],
  ]},
  { icon: "EV/02", image: "/questions/silent-question.png", name: "静默邮箱森林", place: "冒险事件 02 · OFFER 召唤局", text: "20 封信飞出了岛屿，却没有一封回来。森林安静得有点奇怪。你决定下一步？", choices: [
    ["📚 收集更多地图｜搜索通关经验", "地图越叠越厚，你仍不知道哪条路真的能走通。", { collect: 2 }],
    ["🔍 查看掉落信息｜寻找隐藏线索", "你把沉默拆成了可以验证的线索。", {}],
    ["🏰 回到新手村｜继续训练", "训练让装备更稳，但森林还没收到你的新信号。", { beginner: 2 }],
    ["✨ 重做装备外观｜重新设计作品集", "装备更抢眼了，真实反馈仍然缺席。", { perfect: 2 }],
  ]},
  { icon: "EV/03", image: "/questions/mirror-question.png", name: "技能迷宫", place: "冒险事件 03 · OFFER 召唤局", text: "迷宫墙上出现 Figma、AI 工具、数据分析、英语、编程，还有更多未知技能。你怎么走？", choices: [
    ["🎒 全部收入背包｜我要全部学会", "背包越来越满，出口却没有因此更近。", { collect: 2 }],
    ["🧭 选择当前路线｜需要什么学什么", "你只带走了这一关需要的装备，脚步反而更轻。", {}],
    ["📊 制定升级计划｜计算最佳路线", "路线图非常完整，现实地图还没有被打开。", { think: 2 }],
    ["⏳ 等待最佳时机｜准备充分再进副本", "迷宫没有催你，但入口也没有自动靠近。", { wait: 2 }],
  ]},
  { icon: "EV/04", image: "/questions/interview-question.png", name: "面试悬崖", place: "冒险事件 04 · OFFER 召唤局", text: "桥的另一端是一份真实机会。桥牌只写着四个字：可能失败。你决定？", choices: [
    ["🛡 穿上满级装备｜训练到没有漏洞", "装备更完整了，桥另一端仍然未知。", { perfect: 2 }],
    ["🚶 直接过桥｜先看看另一边", "你允许失败发生，也让答案有机会出现。", {}],
    ["🔎 研究桥梁结构｜分析所有风险", "你画出了精密结构图，脚还停在桥头。", { think: 2 }],
    ["🏕 回村升级｜以后更强再来", "村里很安全，这座桥继续保持神秘。", { wait: 2 }],
  ]},
  { icon: "EV/05", image: "/questions/door-question.png", name: "第一扇门", place: "冒险事件 05 · OFFER 召唤局", text: "冒险最后，你来到一扇门前。门后没有保证成功，只有新的地图。你怎么做？", choices: [
    ["🚪 推开门｜答案会在路上出现", "你带着现有装备出发，新的地图开始加载。", {}],
    ["🔐 检查门锁｜确认所有细节", "你排除了一个漏洞，又发现了三个可以继续检查的地方。", { perfect: 1 }],
    ["📖 查询攻略｜看看别人进去后怎样", "你知道了更多人的路线，自己的门还没有打开。", { collect: 1 }],
    ["🕰 等待提示｜也许会有更好机会", "门没有消失，只是被继续预约给了未来。", { wait: 2, tomorrow: 1 }],
  ]},
] as const;

const events = [
  { title: "静默期", icon: "CASE/01", image: "/questions/silent-question-v2.png", text: "外界没有给你答案。你的第一反应：", metrics: [["20", "次投递"], ["0", "次回复"]], choices: [
    ["🔧 回去升级装备｜也许我还不够强", "你获得了一本更厚的技能书，但森林仍没有传来回声。", "经验 +1，现实反馈 +0", 0],
    ["🔍 查看任务反馈｜寻找真实信息", "失败不是判决。你找到了一条可以继续验证的提示。", "一次复盘，换来 2 份现实证据", 2],
    ["🎨 重新装修基地｜直到足够完美", "基地越来越漂亮，但冒险还没有重新开始。", "外观升级，现实反馈 +0", 0],
    ["📚 召集攻略队｜研究所有岗位", "攻略变多了，你的路线仍然没有被验证。", "地图 +10，现实反馈 +0", 0],
  ]},
  { title: "拒绝山谷", icon: "CASE/02", image: "/questions/rejection-question-v2.png", text: "系统提示：感谢参与，我们选择了其他玩家。", metrics: [["1", "封回复"], ["1", "次拒绝"]], choices: [
    ["🚪 退出副本｜这条路可能不适合我", "你离开了山谷，也把尚未验证的路线一起关掉。", "本次不适归零，下一条线索也归零", 0],
    ["🎁 查看掉落物｜这次留下了什么", "拒绝仍然刺痛，但它开始变成一条训练记录。", "一次不适，换来 1 份现实证据", 1],
    ["🧭 寻找下一关｜带着现有装备继续", "你没有否认失败，只是不让它垄断整张地图。", "消耗一点勇气，解锁下一条路线", 1],
    ["📝 保存复盘｜调一件装备再进场", "你只修改了一个可验证变量，没有推倒整套角色。", "一次小调整，换来 1 份现实证据", 1],
  ]},
  { title: "装备空槽区", icon: "CASE/03", image: "/questions/interview-question-v2.png", text: "装备栏还有很多空位，但当前关卡已经开放。", metrics: [["5", "个空槽"], ["1", "套装备"]], choices: [
    ["🎒 继续收集装备｜装满再进入", "你的背包更满了，关卡没有因此自动完成。", "装备 +1，现实反馈 +0", 0],
    ["🚶 带着现有装备出发｜边走边补", "空槽仍在，但你终于知道下一件真正需要什么。", "一次暴露，换来 2 份现实证据", 2],
    ["🔎 研究满级玩家｜复制最佳配置", "你看见了理想装备，却还没测试自己的初始套装。", "参考方案 +10，现实反馈 +0", 0],
    ["🌱 进入低风险支线｜先打一只小怪", "你没有挑战终极 Boss，只先验证了当前战力。", "低成本试错，换来 1 份现实证据", 1],
  ]},
] as const;

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [objectIndex, setObjectIndex] = useState(0);
  const [scores, setScores] = useState<Record<BugId, number>>({ wait: 0, think: 0, collect: 0, beginner: 0, perfect: 0, tomorrow: 0, ready: 0 });
  const [feedback, setFeedback] = useState("");
  const [eventIndex, setEventIndex] = useState(0);
  const [evidence, setEvidence] = useState(0);
  const [storyFeedback, setStoryFeedback] = useState<{ text: string; cost: string } | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [saving, setSaving] = useState(false);
  const cardFrontRef = useRef<HTMLDivElement>(null);

  const primaryId = useMemo(() => {
    const ranked = (Object.entries(scores) as [BugId, number][]).filter(([id]) => id !== "ready").sort((a,b) => b[1]-a[1]);
    return ranked[0][1] === 0 ? "ready" : ranked[0][0];
  }, [scores]);
  const primary = bugs[primaryId];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.querySelector<HTMLElement>("main h1, main h2")?.focus({ preventScroll: true });
  }, [step, objectIndex, eventIndex]);

  useEffect(() => {
    if (step !== "storyTransition") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setStep("story"), reduceMotion ? 100 : 2000);
    return () => window.clearTimeout(timer);
  }, [step]);

  function pickDiscovery(raw: readonly unknown[]) {
    const [, response, delta] = raw as [string, string, Partial<Record<BugId, number>>];
    setScores(old => { const next = { ...old }; Object.entries(delta).forEach(([k,v]) => next[k as BugId] += v ?? 0); return next; });
    setFeedback(response);
  }

  function nextDiscovery() {
    if (objectIndex === discoveries.length - 1) { setFeedback(""); setStep("reveal"); }
    else { setObjectIndex(i => i + 1); setFeedback(""); }
  }

  function pickStory(raw: readonly unknown[]) {
    const [, text, cost, points] = raw as [string, string, string, number];
    setEvidence(e => e + points); setStoryFeedback({ text, cost });
  }

  function nextStory() {
    if (eventIndex === events.length - 1) { setStoryFeedback(null); setStep("transition"); }
    else { setEventIndex(i => i + 1); setStoryFeedback(null); }
  }

  function restart() {
    setStep("landing"); setObjectIndex(0); setEventIndex(0); setScores({ wait:0, think:0, collect:0, beginner:0, perfect:0, tomorrow:0, ready:0 }); setFeedback(""); setEvidence(0); setStoryFeedback(null); setFlipped(false);
  }

  async function saveCard() {
    if (!cardFrontRef.current || saving) return;
    setSaving(true);
    setFlipped(false);
    await new Promise(resolve => setTimeout(resolve, 180));
    try {
      const dataUrl = await toPng(cardFrontRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#ffd35a",
        style: { transform: "none", color: "#17131d", mixBlendMode: "normal" },
      });
      const link = document.createElement("a");
      link.download = `failfirst-${primary.code.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setSaving(false);
    }
  }

  return <main className={`app step-${step}`}>
    <div className="grain game-pattern" aria-hidden="true">
      {["✦", "＋", "×", "◇", "▦", "→", "◫", "◆", "✧", "＋", "□", "↗", "◈", "×", "▤", "✦", "→", "◇", "◩", "＋", "◆", "↘", "×", "▦", "✧", "□", "→", "◈", "＋", "◇", "✦", "◫", "×", "↗", "◆", "▤", "＋", "◇", "→", "✧", "◩", "×", "□", "↘", "◈", "＋", "✦", "▦"].map((symbol, index) => <span key={`${symbol}-${index}`}>{symbol}</span>)}
    </div>
    {step === "landing" && <section className="screen landing">
      <p className="brand">FAIL<span>FIRST</span><sup>↗</sup></p>
      <div className="hero-copy">
        <p className="kicker">AN INTERACTIVE FIELD TEST · 001</p>
        <h1 className="slogan-title" tabIndex={-1}><img src="/branding/slogan-pixel-v4.png" alt="先失败，再开始" /></h1>
        <p>每个人都有一个偷偷阻止自己开始的小 Bug。<br/>找到它，挑战它，然后启动下一步。</p>
        <button className="primary" onClick={() => setStep("world")}>进入行动实验 <span>↗</span></button>
        <button className="handbook-entry" onClick={() => setStep("handbook")}>📖 冒险手册</button>
        <small className="hero-mission-note">预计耗时：5 分钟<br/>解锁你的行动 Bug</small>
      </div>
      <div className="hero-world" aria-label="七只行动怪兽组成的场景群像">
        <div className="hero-paint paint-a"/><div className="hero-paint paint-b"/>
        <img src="/hero-monsters.png" alt="七只行动怪兽在同一个场景里互动" />
        <div className="hero-index"><b>07 / 01</b><span>MEET YOUR ACTION BUGS</span></div>
      </div>
      <p className="footnote">约 5 分钟 · 无标准答案 · 每次冒险都算数</p>
    </section>}

    {step === "handbook" && <section className="screen handbook">
      <header><button className="back" onClick={() => setStep("landing")}>← 返回起点</button><p className="brand small">FAIL<span>FIRST</span><sup>↗</sup></p><p>PLAYER GUIDE · V1.0</p></header>
      <div className="handbook-hero"><p className="kicker">WELCOME, PLAYER 001</p><h1 tabIndex={-1}>冒险手册</h1><p>这里没有标准答案，也没有给你贴标签的裁判。<br/>只有一张地图，帮你看见“为什么还没开始”。</p></div>
      <div className="handbook-grid">
        <article className="manual-card manual-wide pink"><small>CHAPTER 01 · WHAT</small><h2>FailFirst 是什么？</h2><p>一个发现“行动 Bug”的互动冒险游戏。你会探索地图、做出选择、进入安全的失败副本，再把现实反馈带回背包。</p><b>不是测你是谁，而是找到什么正在卡住下一步。</b></article>
        <article className="manual-card yellow"><small>CHAPTER 02 · WHY</small><h2>为什么创建？</h2><p>很多人不是没有目标，而是把准备、分析和等待玩成了无限前置任务。FailFirst 想让第一次行动变小、变具体，也变得没那么孤单。</p></article>
        <article className="manual-card mint"><small>CORE RULE</small><h2>核心理念</h2><p>失败不是判决，是地图更新。Action Bug 也不是敌人——它曾经负责保护你，现在只是需要一次系统升级。</p></article>
        <article className="manual-card manual-wide dark"><small>HOW TO PLAY · 4 STEPS</small><h2>游戏玩法</h2><ol><li><span>01</span>选择一个冒险副本</li><li><span>02</span>完成 5 次冒险选择</li><li><span>03</span>遇见你的 Action Bug</li><li><span>04</span>模拟失败，收藏现实反馈</li></ol></article>
        <article className="manual-card manual-wide violet"><small>CHARACTER INDEX · 06</small><h2>Action Bug 图鉴</h2><div className="bug-index">{(["wait","think","collect","beginner","perfect","tomorrow"] as BugId[]).map(id => <span key={id}><b>{bugs[id].name}</b><small>{bugs[id].line}</small></span>)}</div></article>
        <article className="manual-card pink"><small>OPEN NOW</small><h2>当前开放副本</h2><p><b>OFFER 召唤局</b><br/>为求职、转行和重新出发的玩家准备。人生偷跑局题库已就位，单干开张局仍在加载。</p></article>
        <article className="manual-card yellow"><small>AI ROLE</small><h2>AI 在做什么？</h2><p>当前 Demo 使用本地计分引擎匹配行动模式。完整版中，AI 将负责把玩家情境改写成专属副本、生成低成本下一步，并根据反馈更新任务；它不负责替玩家下结论。</p></article>
        <article className="manual-card mint"><small>FUTURE ROADMAP</small><h2>后续地图</h2><ul><li>解锁人生偷跑局与单干开张局</li><li>生成个人专属冒险事件</li><li>扩建 Failure Museum 收藏墙</li><li>让一次行动反馈开启下一关</li></ul></article>
        <article className="manual-card dark"><small>PROJECT INFO</small><h2>项目档案</h2><p>项目：FailFirst<br/>类型：互动行动冒险 Demo<br/>版本：Hackathon Build 001<br/>状态：OFFER 副本开放中</p></article>
      </div>
      <div className="handbook-cta"><p>手册已读。现在，去给现实发一个信号。</p><button className="primary" onClick={() => setStep("world")}>进入行动实验 ↗</button></div>
    </section>}

    {step === "world" && <section className="screen world">
      <header><p className="brand world-brand">FAIL<span>FIRST</span><sup>↗</sup></p><p>选择今天想探索的地方</p></header>
      <h1 tabIndex={-1}>选择一条<br/><em>尚未发生的路径。</em></h1>
      <div className="island-grid">
        <button className="world-island career" onClick={() => setStep("room")}><span className="island-art">01</span><span className="zone-face" aria-hidden="true">●‿●</span><b>OFFER 召唤局</b><small>职业冒险副本 · ACTIVE</small><p>简历、面试、机会。挑战那个迟迟没有按下的按钮。</p><i>去召唤一个回复 ↗</i></button>
        <button className="world-island life" disabled><span className="island-art">02</span><span className="zone-face" aria-hidden="true">◉⌁◉</span><b>人生偷跑局</b><small>生活冒险副本 · LOCKED</small><p>旅行、改变、尝试。提前体验一次未知。</p><i>题库已就位 · 支线待解锁</i></button>
        <button className="world-island creator" disabled><span className="island-art">03</span><span className="zone-face" aria-hidden="true">◕×◕</span><b>单干开张局</b><small>创造冒险副本 · LOCKED</small><p>从一个想法，到第一次真实验证。</p><i>营业执照生成中…</i></button>
      </div>
    </section>}

    {step === "room" && <section className="screen room">
      <header><button className="back" onClick={() => setStep("world")}>← 返回群岛</button><p className="map-progress">{discoveries.map((d,i) => <span key={d.name} className={i <= objectIndex ? "active" : ""}>{d.icon}</span>)}</p></header>
      <div className="room-stage"><div className={`question-art question-art-${objectIndex + 1}`}><img src={discoveries[objectIndex].image} alt="" /><span>{discoveries[objectIndex].icon}</span></div><p>{discoveries[objectIndex].place}</p></div>
      <div className="dialogue">
        <p className="kicker">{"< "}你发现了 · {discoveries[objectIndex].name}{" >"}</p>
        <h2 tabIndex={-1}>{discoveries[objectIndex].text}</h2>
        {!feedback ? <div className="choices">{discoveries[objectIndex].choices.map((c, choiceIndex) => <button key={c[0] as string} onClick={() => pickDiscovery(c)}><span className="option-key">{"ABCD"[choiceIndex]}</span><span className="option-label">{c[0] as string}</span><span className="option-arrow">↗</span></button>)}</div>
        : <div className="feedback" aria-live="polite"><p>“{feedback}”</p><button className="primary" onClick={nextDiscovery}>{objectIndex === discoveries.length - 1 ? "解锁行动 Bug" : "继续冒险"} →</button></div>}
      </div>
    </section>}

    {step === "reveal" && <section className="screen reveal">
      <p className="kicker">SCAN COMPLETE · 检测完成</p>
      <h1 tabIndex={-1}>发现你的行动 Bug——<br/>这次终于不是网卡了。</h1>
      <div className={`bug-orbit bug-orbit-${primaryId}`}><div className="reveal-character-wrap"><img src={revealImages[primaryId]} alt={primary.name} /></div><i className="orbit one"/><i className="orbit two"/></div>
      <div className={`bug-copy bug-copy-${primaryId}`}><p>{primary.en}</p><h2>{primary.name}</h2><blockquote>“{primary.line}”</blockquote><small>{primary.intro}</small><div className="bug-skills">{primary.skills.map(skill => <span key={skill}>{skill}</span>)}</div></div>
      <button className="primary" onClick={() => setStep("storyTransition")}>进入失败副本 ↗</button>
    </section>}

    {step === "storyTransition" && <section className="screen story-transition" aria-live="polite">
      <div className="portal-grid" aria-hidden="true"><i/><i/><i/><i/></div>
      <p>ENTERING FIELD TEST</p><b>载入失败模拟世界…</b><span>01 / 03</span>
    </section>}

    {step === "story" && <section className="screen story">
      <header><p className="brand small">FAIL<span>FIRST</span></p><p>职业冒险副本 · {eventIndex + 1}/3</p></header>
      <div className="progress-line"><i style={{width:`${(eventIndex+1)/3*100}%`}} /></div>
      <div className={`event-visual event-visual-${eventIndex + 1}`}><img src={events[eventIndex].image} alt="" /><span>{events[eventIndex].icon}</span></div>
      <article className={`event-card event-card-${eventIndex + 1}`}>
        <p className="kicker">EVENT 0{eventIndex+1}</p>
        <div className="event-heading">
          <h2 tabIndex={-1}>{events[eventIndex].title}</h2>
          <p className="event-stats"><span><b>{events[eventIndex].metrics[0][0]}</b> {events[eventIndex].metrics[0][1]}</span><i>/</i><span><b>{events[eventIndex].metrics[1][0]}</b> {events[eventIndex].metrics[1][1]}</span></p>
          <p className="event-summary">{events[eventIndex].text}</p>
        </div>
        {!storyFeedback ? <div className="choices">{events[eventIndex].choices.map((c, choiceIndex) => <button key={c[0] as string} onClick={() => pickStory(c)}><span className="option-key">{"ABCD"[choiceIndex]}</span><span className="option-label">{c[0] as string}</span><span className="option-arrow">→</span></button>)}</div>
        : <div className="feedback story-fb" aria-live="polite"><p>{storyFeedback.text}</p><div><span>脑内 Boss</span><b>这一关会毁掉整张地图</b></div><div className="real"><span>真实掉落</span><b>{storyFeedback.cost}</b></div><button className="primary" onClick={nextStory}>{eventIndex === 2 ? "领取失败收藏" : "走向下一关"} →</button></div>}
      </article>
    </section>}

    {step === "transition" && <section className="screen card-transition" aria-live="polite">
      <div className="pixel-burst" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i}/>)}</div>
      <div className="game-hud" aria-hidden="true"><span>STAGE 03</span><b>GAME CLEAR</b><span>NO CONTINUE USED</span></div>
      <p className="kicker">FIELD TEST COMPLETE · 03/03</p>
      <h1>副本完成！<br/><em>失败正在变成掉落物。</em></h1>
      <div className="evidence-count"><span>{String(evidence).padStart(2,"0")}</span><small>REALITY EVIDENCE COLLECTED</small></div>
      <p className="transition-note">你的失败收藏已经生成</p>
      <button className="primary transition-continue" onClick={() => setStep("result")}>领取失败收藏 <span>↗</span></button>
    </section>}

    {step === "result" && <section className="screen result">
      <div className="result-copy"><p className="kicker">ADVENTURE COMPLETE · ACHIEVEMENT UNLOCKED</p><h1 tabIndex={-1}>冒险完成！</h1><p>你没有消灭行动 Bug，因为它曾经保护过你。<br/>现在，你学会带着它一起前进。</p></div>
      <button className={`failure-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(v => !v)} aria-label="翻转失败收藏卡">
        <div ref={cardFrontRef} className="card-face front"><small>FAILFIRST · 收藏编号 #{primary.code}</small><img className="card-character" src={primary.image} alt="" /><p>我的失败收藏馆 · 发现 Bug</p><h2>{primary.name}</h2><blockquote>“{primary.line}”</blockquote><div className="card-task"><span>下一关任务</span><b>{primary.task}</b></div><i>点击查看掉落 ↻</i></div>
        <div className="card-face back-face"><small>FAILURE MUSEUM · 本次冒险：OFFER 召唤局</small><h2>这是保护程序。</h2><div><span>隐藏技能</span><b>{primary.skills.join(" · ")}</b></div><div><span>升级方向</span><b>{primary.pattern}</b></div><div><span>获得奖励</span><b>现实反馈 × {evidence} · 勇气碎片 × 1</b></div><i>点击翻回 ↻</i></div>
      </button>
      <div className="result-actions"><button className="primary" onClick={saveCard} disabled={saving}>{saving ? "正在生成图片…" : "保存我的失败收藏 ↓"}</button><button className="ghost" onClick={restart}>开启下一次冒险</button></div>
      <p className="disclaimer">这不是固定标签，只是当前副本里触发的一种保护程序。</p>
    </section>}
  </main>;
}
