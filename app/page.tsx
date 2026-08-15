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

type BugStat = { label: string; value: number };
const bugs: Record<BugId, { image: string; code: string; name: string; en: string; intro: string; stats: readonly BugStat[]; rarity: number; hiddenSkill: string; line: string; strength: string; pattern: string; task: string }> = {
  wait: { image: "/characters/wait.png", code: "DL-01", name: "再等等怪", en: "WAIT MONSTER", intro: "它总告诉你：马上就好了。但这个马上，已经过去很多天。", stats: [{label:"装备收集力",value:90},{label:"风险侦查",value:80},{label:"启动速度",value:30},{label:"探索勇气",value:20}], rarity: 4, hiddenSkill: "风险控制大师", line: "把等待包装成准备。", strength: "你很擅长降低风险", pattern: "不要等 100% 准备好，先启动 1%", task: "完成一次不完美开始" },
  think: { image: "/characters/think.png", code: "OC-02", name: "脑内开会王", en: "BRAIN MEETING KING", intro: "它每天讨论未来所有可能。唯一的问题：会议没有结束时间。", stats: [{label:"侦查能力",value:95},{label:"路线预测",value:85},{label:"任务完成度",value:40},{label:"随机应变",value:40}], rarity: 4, hiddenSkill: "全地图预演", line: "想象未来太久，忘记创造未来。", strength: "你能同时看见复杂问题的多个侧面", pattern: "会议越完整，现实反馈越晚到场", task: "关闭会议，开启实验" },
  collect: { image: "/characters/collect.png", code: "AR-03", name: "收藏大户", en: "BOOKMARK COLLECTOR", intro: "它有一个装满教程、课程、工具和攻略的巨大仓库，但很少打开使用。", stats: [{label:"经验获取力",value:95},{label:"地图搜索力",value:90},{label:"作品输出",value:40},{label:"实战经验",value:30}], rarity: 4, hiddenSkill: "无限背包", line: "收藏很多答案，却没有提交作业。", strength: "你学习快，也知道去哪里寻找答案", pattern: "输入越多，第一次输出越容易延期", task: "把一个收藏变成作品" },
  beginner: { image: "/characters/beginner.png", code: "TR-04", name: "新手村村长", en: "BEGINNER VILLAGE CHIEF", intro: "它守护新手村很多年。装备越来越强，但是地图一直没换。", stats: [{label:"成长速度",value:90},{label:"耐久值",value:85},{label:"地图探索",value:30},{label:"挑战勇气",value:35}], rarity: 4, hiddenSkill: "新手村守护结界", line: "一直升级，却忘记进入游戏。", strength: "你愿意打磨基本功，也尊重成长过程", pattern: "训练替代了第一次真实交付", task: "离开新手村，进入真实地图" },
  perfect: { image: "/characters/perfect.png", code: "PF-05", name: "完美拖延师", en: "PERFECT DELAYER", intro: "第一版还能优化，第十版还能优化。最终：还没发布。", stats: [{label:"视觉审美",value:95},{label:"品质控制",value:95},{label:"完成速度",value:35},{label:"发布勇气",value:30}], rarity: 5, hiddenSkill: "像素级校准", line: "追求满分，错过开始。", strength: "你有判断力、标准和完成细节的耐心", pattern: "没有发布的高分作品，收不到现实反馈", task: "发布一个 80 分作品" },
  tomorrow: { image: "/characters/tomorrow.png", code: "TM-06", name: "明天再说侠", en: "TOMORROW HERO", intro: "它拥有神秘能力：把今天的问题，传送到明天。", stats: [{label:"未来规划",value:85},{label:"地图想象",value:90},{label:"今日行动",value:20},{label:"任务完成度",value:30}], rarity: 4, hiddenSkill: "时间传送", line: "未来计划很多，今天行动很少。", strength: "你仍然相信事情可以改变", pattern: "第一步持续被分配给未来", task: "不要预约未来，完成今天第一步" },
  ready: { image: "/characters/ready.png", code: "MV-00", name: "带着不确定出发的人", en: "MOVE BEFORE CERTAINTY", intro: "你没有等所有条件到齐，就先向现实发出了一个信号。", stats: [{label:"启动速度",value:90},{label:"探索勇气",value:85},{label:"反馈获取",value:92},{label:"空想时间",value:15}], rarity: 5, hiddenSkill: "低成本试探", line: "答案会在路上出现。", strength: "你能把未知拆成低成本行动", pattern: "一次顺利出发，不代表以后永远不会卡住", task: "24 小时内再完成一个真实动作" },
};

const discoveries = [
  { icon: "EV/01", image: "/questions/books-question.png", name: "📮 已读不回森林", place: "冒险事件 01 · OFFER 召唤局", description: "20 封信飞出了岛屿。但是……森林里没有任何回复。", question: "面对安静的邮箱，你决定？", choices: [
    ["收集更多装备｜可能我还不够强，再升级一下", "你带回了更多装备，但森林依然没有回声。", { collect: 2, beginner: 1 }],
    ["查看地图反馈｜先看看真实世界需要什么", "你没有继续猜，而是开始寻找真实掉落。", {}],
    ["装修冒险基地｜下一次一定更完美", "基地更漂亮了，森林仍然保持安静。", { perfect: 2 }],
    ["召开战略会议｜先分析所有可能", "所有路线都发言了，下一次出发还在等散会。", { think: 2 }],
  ]},
  { icon: "EV/02", image: "/questions/silent-question.png", name: "📄 简历炼金工坊", place: "冒险事件 02 · OFFER 召唤局", description: "你的简历已经升级到第 37 版。但是……它还躺在背包里。", question: "这份简历下一步？", choices: [
    ["继续强化装备｜还能再优化一点", "第 38 版开始锻造，真实副本仍未开启。", { perfect: 2 }],
    ["发出第一封信｜先进入真实副本", "简历终于离开工坊，地图开始加载。", {}],
    ["查看更多攻略｜看看高手怎么玩", "你收藏了更多配方，但这一版还在工作台上。", { collect: 2 }],
    ["等待最佳状态｜准备好了再开始", "工坊保存了进度，也把出发时间交给了未来。", { wait: 2 }],
  ]},
  { icon: "EV/03", image: "/questions/mirror-question.png", name: "🧾 JD 怪兽来袭", place: "冒险事件 03 · OFFER 召唤局", description: "你打开招聘页面。一只 JD 怪兽出现：最好会这个，也最好会那个。", question: "面对不断增加的要求，你怎么办？", choices: [
    ["收集全部装备｜我要全部学会", "背包越来越满，怪兽还在继续追加词条。", { collect: 2 }],
    ["锁定主线任务｜先解决最重要的", "你绕过支线词条，瞄准了这一关的核心弱点。", {}],
    ["研究通关路线｜找到最佳方案", "攻略写满了一整页，战斗还没有开始。", { think: 2 }],
    ["回到新手村｜等级高一点再挑战", "村里很安全，JD 怪兽仍守在地图入口。", { wait: 2 }],
  ]},
  { icon: "EV/04", image: "/questions/interview-question.png", name: "🎭 面试隐藏关", place: "冒险事件 04 · OFFER 召唤局", description: "面试 Boss 出现。它释放技能：请介绍一下你自己。", question: "你准备如何挑战？", choices: [
    ["直接进入战斗｜先打一局再说", "你没有满血保证，但获得了第一份战斗数据。", {}],
    ["强化防御装备｜准备所有可能问题", "护甲更厚了，隐藏关仍然没有实战记录。", { perfect: 2 }],
    ["查看 Boss 攻略｜研究高手打法", "你记下了更多招式，Boss 仍在等待你的回合。", { collect: 1, think: 1 }],
    ["暂时退出副本｜状态好了再来", "副本被保存，重新进入的日期仍未确定。", { wait: 2 }],
  ]},
  { icon: "EV/05", image: "/questions/door-question.png", name: "🪄 Offer 召唤阵", place: "冒险事件 05 · OFFER 召唤局", description: "所有装备已经准备完成。现在只差：按下发送按钮。", question: "最后一步，你选择？", choices: [
    ["启动冒险｜先开始，答案会出现", "召唤阵亮起，现实世界终于收到你的信号。", {}],
    ["最后检查一次｜确认没有漏洞", "你修好一个细节，又发现了下一个可检查项。", { perfect: 1 }],
    ["打开终极攻略｜再确认一次", "攻略继续展开，召唤阵暂时保持待机。", { collect: 1 }],
    ["保存今日进度｜明天正式开始", "任务保存成功，启动键再次被传送到明天。", { tomorrow: 2 }],
  ]},
] as const;

const events = [
  { title: "拒绝信掉落", icon: "DROP/01", image: "/questions/silent-question-v2.png", text: "Boss 掉落一封邮件。奖励：一次失败经验。面对失败掉落，你会？", metrics: [["1", "封拒信"], ["1", "次经验"]], choices: [
    ["删除存档｜看来我不适合", "这次失败被写成了结局，地图在这里停止更新。", "失败变成终点", 0],
    ["查看掉落说明｜这里有什么信息", "你打开邮件，把判决拆成了可以读取的线索。", "经验碎片 × 1", 1],
    ["修改装备｜调整后继续挑战", "你只调整一件装备，然后保留了下一次进场机会。", "升级机会 × 1", 1],
    ["收藏失败样本｜记录这次经验", "拒绝没有消失，但它第一次成为可携带的收藏。", "失败收藏卡 × 1", 1],
  ]},
  { title: "新人试炼场", icon: "TRIAL/02", image: "/questions/rejection-question-v2.png", text: "新手村已解锁，但第一关并不简单。遇到不会的问题，你怎么办？", metrics: [["1", "个难题"], ["4", "条路线"]], choices: [
    ["呼叫队友｜向经验玩家学习", "你没有交出控制权，只让队友点亮了一段地图。", "团队经验 +1", 1],
    ["开启研究模式｜先补齐知识", "你补上当前关卡需要的知识，没有把整个副本搬回课堂。", "学习经验 +1", 1],
    ["直接挑战｜边做边升级", "你带着空槽进入战斗，并发现下一件真正需要的装备。", "实战经验 +1", 1],
    ["暂停任务｜准备好了再继续", "任务被安全保存，也进入了没有截止日期的等待区。", "任务进入等待状态", 0],
  ]},
  { title: "进度幻境", icon: "MIRROR/03", image: "/questions/interview-question-v2.png", text: "幻境启动。你看见：别人已经通关。面对别人的进度，你选择？", metrics: [["99", "名玩家"], ["1", "张地图"]], choices: [
    ["加速追赶｜我要马上超过她们", "你获得一阵冲刺能量，也暂时忘记了自己的任务坐标。", "竞争能量，方向感 -1", 0],
    ["查看自己的地图｜我的路线不同", "排行榜退到背景，你重新看见了自己的下一格。", "方向感 +1", 1],
    ["无限刷排行榜｜看看别人怎么成功", "信息持续掉落，时间也在同步消耗。", "信息 +10，时间 -10", 0],
    ["继续自己的任务｜专注下一步", "你没有赢过所有人，只完成了当前地图上的一格。", "行动经验 +1", 1],
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
        <div className="hero-actions">
          <button className="primary" onClick={() => setStep("world")}>进入行动实验 <span>↗</span></button>
          <button className="handbook-entry" onClick={() => setStep("handbook")}>📖 冒险手册</button>
        </div>
        <small className="hero-mission-note">预计耗时：5 分钟 · 解锁你的行动 Bug</small>
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
        {objectIndex === 1 && <div className="quest-loadout" aria-label="当前关卡装备栏">
          <div className="loadout-head"><span>PLAYER LOADOUT</span><b>READY 03/03</b></div>
          <div className="loadout-slots">
            <span><i>📄</i><small>SLOT 01</small><b>简历</b><em>READY</em></span>
            <span><i>🖼</i><small>SLOT 02</small><b>作品集</b><em>READY</em></span>
            <span><i>⚡</i><small>SLOT 03</small><b>技能</b><em>READY</em></span>
          </div>
          <p><span>!</span> 第 37 版已就绪，但任务仍未提交</p>
        </div>}
        <p className="quest-description">{discoveries[objectIndex].description}</p>
        <h2 className="quest-prompt" tabIndex={-1}>{discoveries[objectIndex].question}</h2>
        {!feedback ? <div className="choices">{discoveries[objectIndex].choices.map((c, choiceIndex) => <button key={c[0] as string} onClick={() => pickDiscovery(c)}><span className="option-key">{"ABCD"[choiceIndex]}</span><span className="option-label">{c[0] as string}</span><span className="option-arrow">↗</span></button>)}</div>
        : <div className="feedback" aria-live="polite"><p>“{feedback}”</p><button className="primary" onClick={nextDiscovery}>{objectIndex === discoveries.length - 1 ? "解锁行动 Bug" : "继续冒险"} →</button></div>}
      </div>
    </section>}

    {step === "reveal" && <section className="screen reveal">
      <p className="kicker">SCAN COMPLETE · 检测完成</p>
      <h1 className="reveal-title" tabIndex={-1}>角色扫描完成<br/>发现一个隐藏行动 Bug</h1>
      <div className={`bug-orbit bug-orbit-${primaryId}`}><div className="reveal-character-wrap"><img src={revealImages[primaryId]} alt={primary.name} /></div><i className="orbit one"/><i className="orbit two"/></div>
      <div className={`bug-copy bug-copy-${primaryId}`}><p>{primary.en}</p><h2>{primary.name}</h2><blockquote>“{primary.line}”</blockquote><small>{primary.intro}</small><div className="bug-stats" aria-label="角色属性">{primary.stats.slice(0,3).map(stat => <div key={stat.label}><span><b>{stat.label}</b><em>{stat.value}%</em></span><i><u style={{width:`${stat.value}%`}} /></i></div>)}</div></div>
      <button className="primary" onClick={() => setStep("storyTransition")}>进入失败副本 ↗</button>
    </section>}

    {step === "storyTransition" && <section className="screen story-transition" aria-live="polite">
      <div className="portal-grid" aria-hidden="true"><i/><i/><i/><i/></div>
      <p>ENTERING FAILURE SIMULATION</p><b>失败模拟副本已开启</b><span>提前体验：行动之后会发生什么 · 01 / 03</span>
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
      <div className="result-copy"><p className="kicker">🏆 ACTION CHARACTER UNLOCKED</p><h1 tabIndex={-1}>行动角色解锁！</h1><p>你没有消灭行动 Bug，因为它曾经保护过你。<br/>现在，你学会带着它一起前进。</p></div>
      <button className={`failure-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(v => !v)} aria-label="翻转失败收藏卡">
        <div ref={cardFrontRef} className="card-face front"><small>FAILFIRST · 失败收藏卡 #001</small><img className="card-character" src={primary.image} alt="" /><p>经历副本：📨 拒绝信掉落 · {"★".repeat(primary.rarity)}{"☆".repeat(5-primary.rarity)}</p><h2>{primary.name}</h2><blockquote><span>发现行动 Bug</span>“{primary.line}”</blockquote><div className="card-task"><span>下一步任务</span><b>{primary.task}</b></div><i>点击查看属性 ↻</i></div>
        <div className="card-face back-face rpg-back"><small>FAILURE MUSEUM · 失败经验 × {evidence}</small><h2>角色属性</h2><div className="card-stat-list">{primary.stats.map(stat => <div key={stat.label}><span><b>{stat.label}</b><em>{stat.value}%</em></span><i><u style={{width:`${stat.value}%`}} /></i></div>)}</div><div><span>隐藏技能</span><b>{primary.hiddenSkill}</b></div><div><span>升级方向</span><b>{primary.pattern}</b></div><i>点击翻回 ↻</i></div>
      </button>
      <div className="result-actions"><button className="primary" onClick={saveCard} disabled={saving}>{saving ? "正在生成图片…" : "保存我的失败收藏 ↓"}</button><button className="ghost" onClick={restart}>开启下一次冒险</button></div>
      <p className="disclaimer">这不是固定标签，只是当前副本里触发的一种保护程序。</p>
    </section>}
  </main>;
}
