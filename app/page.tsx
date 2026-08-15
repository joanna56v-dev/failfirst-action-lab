"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

type BugId = "wait" | "think" | "collect" | "beginner" | "perfect" | "tomorrow" | "ready";
type Step = "landing" | "world" | "room" | "reveal" | "storyTransition" | "story" | "transition" | "result";

const revealImages: Record<BugId, string> = {
  wait: "/characters/wait-reveal.png",
  think: "/characters/think-reveal.png",
  collect: "/characters/collect-reveal.png",
  beginner: "/characters/beginner-reveal.png",
  perfect: "/characters/perfect-reveal.png",
  tomorrow: "/characters/tomorrow-reveal.png",
  ready: "/characters/ready-reveal.png",
};

const bugs: Record<BugId, { image: string; code: string; name: string; en: string; line: string; strength: string; pattern: string; task: string }> = {
  wait: { image: "/characters/wait.png", code: "DL-01", name: "再等等怪", en: "THE WAIT MONSTER", line: "把等待包装成准备。", strength: "你擅长预判风险，也重视行动质量", pattern: "当安全感成为启动条件，开始会被无限推迟", task: "在条件不完整时，发送 1 份申请" },
  think: { image: "/characters/think.png", code: "OC-02", name: "脑内开会王", en: "THE OVERTHINKING COUNCIL", line: "每一种可能，都要求发言。", strength: "你能同时看见复杂问题的多个侧面", pattern: "分析一旦脱离现实反馈，就只是在封闭系统里循环", task: "停止推演，做一次最小实验" },
  collect: { image: "/characters/collect.png", code: "AR-03", name: "收藏大户", en: "THE BOOKMARK COLLECTOR", line: "持续输入，延迟输出。", strength: "你学习快，也知道去哪里寻找答案", pattern: "更多信息有时只会提高启动门槛", task: "不再添加资料，用现有素材完成一版" },
  beginner: { image: "/characters/beginner.png", code: "TR-04", name: "新手村村长", en: "THE BEGINNER CHIEF", line: "一直训练，从未上线。", strength: "你愿意打磨基本功，也尊重成长过程", pattern: "模拟环境无法替代一次真实交付", task: "让真实的人看见一个尚不成熟的版本" },
  perfect: { image: "/characters/perfect.png", code: "PF-05", name: "完美拖延师", en: "THE PERFECT DELAYER", line: "最后一轮修改，永远不是最后一轮。", strength: "你有判断力、标准和完成细节的耐心", pattern: "作品始终不发布，质量就失去了作用的场域", task: "在 80 分时停止修饰并提交" },
  tomorrow: { image: "/characters/tomorrow.png", code: "TM-06", name: "明天再说侠", en: "TOMORROW HERO", line: "擅长规划一个更理想的明天。", strength: "你仍然相信事情可以改变", pattern: "行动持续被分配给未来，今天只剩下计划", task: "从明天的计划里取回一个两分钟动作" },
  ready: { image: "/characters/ready.png", code: "MV-00", name: "带着不确定出发的人", en: "MOVE BEFORE CERTAINTY", line: "你没有等恐惧消失。", strength: "你能把未知拆成低成本行动", pattern: "一次顺利出发，不代表以后永远不会卡住", task: "24 小时内完成一个真实、可获得反馈的动作" },
};

const discoveries = [
  { icon: "AR/01", image: "/questions/books-question.png", name: "资料库", place: "THE ARCHIVE · 资料过载区", text: "当你觉得自己还没准备好投出第一份申请，你通常会先做什么？", choices: [
    ["再学一门和岗位相关的课程", "多准备一点确实让人安心，但市场还没有机会告诉你真正缺什么。", { collect: 3, beginner: 1 }],
    ["把所有岗位要求再比较一遍", "你很认真地寻找最优解，只是选项越多，出发可能越难。", { think: 3, wait: 1 }],
    ["继续完善简历和作品集", "你在提高质量，也可能在等待一个永远不会自然出现的完成感。", { perfect: 3, wait: 1 }],
    ["先投一份，用真实反馈再决定", "你没有承诺一定成功，只把想象换成了一次现实证据。", {}],
  ]},
  { icon: "TH/02", image: "/questions/door-question.png", name: "临界门", place: "THE THRESHOLD · 临界门", text: "还没完全准备好时，你会打开它吗？", choices: [
    ["等条件更合适再开", "谨慎保护了你，也让这扇门继续保持未知。", { wait: 3, tomorrow: 1 }],
    ["先在这里多练习几次", "练习会增加熟悉感，但真实世界仍在门的另一边。", { beginner: 3, collect: 1 }],
    ["先开一条缝看看", "你没有承诺走到底，只完成了一次低成本探索。", {}],
    ["请别人替我判断现在是否合适", "把判断交出去能降低压力，也可能让开始继续依赖许可。", { wait: 2, think: 1 }],
  ]},
  { icon: "GZ/03", image: "/questions/mirror-question.png", name: "他人视线", place: "THE GAZE · 他人视线", text: "如果别人看到你的失败，你最担心什么？", choices: [
    ["她们会觉得我能力不够", "你很在意作品是否配得上自己的标准。", { perfect: 3, beginner: 1 }],
    ["我会发现自己选错了", "你希望先想清所有后果，再允许自己行动。", { think: 3, wait: 1 }],
    ["会尴尬，但我应该能调整", "失败仍然不舒服，但它不再等于终点。", {}],
    ["我担心这会破坏一直维持的形象", "你不只在保护结果，也在保护别人眼中的那个版本。", { perfect: 2, think: 1 }],
  ]},
  { icon: "NT/04", image: "/questions/backpack-question.png", name: "延期站", place: "NOT TODAY · 延期站", text: "一个重要计划停了很久，你通常会怎样？", choices: [
    ["选个更完整的明天正式开始", "明天看起来总比今天完整，但第一步也因此不断搬家。", { tomorrow: 3, wait: 1 }],
    ["先把计划再完善一点", "你在努力减少失控，只是计划也可能变成一种安全区。", { perfect: 3, think: 1 }],
    ["现在做一个两分钟动作", "旅程没有正式开幕，但你已经离开了原地。", {}],
    ["换一个新计划，也许会更容易开始", "新的计划带来新鲜感，旧的阻力却可能一起迁移。", { tomorrow: 2, beginner: 1 }],
  ]},
] as const;

const events = [
  { title: "静默期", icon: "CASE/01", image: "/questions/silent-question-v2.png", text: "外界没有给你任何答案。", metrics: [["20", "次投递"], ["0", "次回复"]], choices: [
    ["先学一门新技能，再继续投", "你获得了一本更厚的技能书，但森林仍没有传来回声。", "下一次真实反馈被推迟", 0],
    ["把简历再精修一遍", "简历更漂亮了，但你仍不知道沉默究竟来自哪里。", "消耗时间，新增证据为 0", 0],
    ["找从业者看简历，再投 3 份", "你得到一条具体意见。森林没有消失，但出现了路标。", "短暂不适，换来 2 份现实证据", 2],
    ["先停投，重新研究所有岗位要求", "你看见了更多标准，但还不知道哪一条真正拦住了你。", "研究范围扩大，现实证据仍为 0", 0],
  ]},
  { title: "拒绝之后", icon: "CASE/02", image: "/questions/rejection-question-v2.png", text: "第一封回复终于出现，内容不是你期待的那一种。", metrics: [["1", "封回复"], ["1", "次拒绝"]], choices: [
    ["先停几天，等状态恢复", "你照顾了受挫的自己，但暂停日期还没有写下终点。", "行动节奏中断", 0],
    ["反复推演到底哪里出错", "你列出了七种可能，却仍缺少能验证它们的证据。", "能量消耗，结论无法验证", 0],
    ["询问一条反馈，再申请下一份", "拒绝仍然刺痛，但它从判决变成了一条训练记录。", "一次不适，换来 1 份现实证据", 1],
    ["马上大量投递，把这封拒信盖过去", "行动数量上去了，但你还没有处理这次反馈。", "获得速度，也可能复制同一个盲点", 1],
  ]},
  { title: "失误现场", icon: "CASE/03", image: "/questions/interview-question-v2.png", text: "一个熟悉的问题，一次不够漂亮的回答。", metrics: [["1", "个问题"], ["2", "秒沉默"]], choices: [
    ["装作很懂，把答案说复杂", "你遮住了慌乱，也错过了展示真实思考过程的机会。", "可信度与精力下降", 0],
    ["认定没戏，只求尽快结束", "你提前替对方做了决定，尚未发生的失败接管了时间。", "失去后续表达机会", 0],
    ["坦白卡住，梳理后说出思路", "答案并不完美，但你让对方看见了如何面对困难。", "短暂尴尬，换来恢复能力", 1],
    ["请对方换一个问题，之后再补充", "你为自己争取了空间，也保留了回到问题的责任。", "承担一次暴露，保住后续表达空间", 1],
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
        <p>每一次迟迟未开始，都有一套正在运行的保护机制。<br/>用 5 分钟，找到你的行动 Bug。</p>
        <button className="primary" onClick={() => setStep("world")}>进入行动实验 <span>↗</span></button>
      </div>
      <div className="hero-world" aria-label="七只行动怪兽组成的场景群像">
        <div className="hero-paint paint-a"/><div className="hero-paint paint-b"/>
        <img src="/hero-monsters.png" alt="七只行动怪兽在同一个场景里互动" />
        <div className="hero-index"><b>07 / 01</b><span>MEET YOUR ACTION BUGS</span></div>
      </div>
      <p className="footnote">约 5 分钟 · 无标准答案 · 非心理诊断</p>
    </section>}

    {step === "world" && <section className="screen world">
      <header><p className="brand world-brand">FAIL<span>FIRST</span><sup>↗</sup></p><p>选择今天想探索的地方</p></header>
      <h1 tabIndex={-1}>选择一条<br/><em>尚未发生的路径。</em></h1>
      <div className="island-grid">
        <button className="world-island career" onClick={() => setStep("room")}><span className="island-art">01</span><span className="zone-face" aria-hidden="true">●‿●</span><b>OFFER 召唤局</b><small>JOB / CAREER · ACTIVE</small><p>投递、转行、重返市场。先让真实世界给你一次反馈。</p><i>去召唤一个回复 ↗</i></button>
        <button className="world-island life" disabled><span className="island-art">02</span><span className="zone-face" aria-hidden="true">◉⌁◉</span><b>人生偷跑局</b><small>DAILY LIFE · LOCKED</small><p>打破日常惯性，试一次计划很久却始终没有发生的生活。</p><i>支线加载中…</i></button>
        <button className="world-island creator" disabled><span className="island-art">03</span><span className="zone-face" aria-hidden="true">◕×◕</span><b>单干开张局</b><small>OPC / STARTUP · LOCKED</small><p>从商业想法、个人项目，到第一次真正交付与验证。</p><i>营业执照生成中…</i></button>
      </div>
    </section>}

    {step === "room" && <section className="screen room">
      <header><button className="back" onClick={() => setStep("world")}>← 返回群岛</button><p className="map-progress">{discoveries.map((d,i) => <span key={d.name} className={i <= objectIndex ? "active" : ""}>{d.icon}</span>)}</p></header>
      <div className="room-stage"><div className={`question-art question-art-${objectIndex + 1}`}><img src={discoveries[objectIndex].image} alt="" /><span>{discoveries[objectIndex].icon}</span></div><p>{discoveries[objectIndex].place}</p></div>
      <div className="dialogue">
        <p className="kicker">{"< "}你发现了 · {discoveries[objectIndex].name}{" >"}</p>
        <h2 tabIndex={-1}>{discoveries[objectIndex].text}</h2>
        {!feedback ? <div className="choices">{discoveries[objectIndex].choices.map((c, choiceIndex) => <button key={c[0] as string} onClick={() => pickDiscovery(c)}><span className="option-key">{"ABCD"[choiceIndex]}</span><span className="option-label">{c[0] as string}</span><span className="option-arrow">↗</span></button>)}</div>
        : <div className="feedback" aria-live="polite"><p>“{feedback}”</p><button className="primary" onClick={nextDiscovery}>{objectIndex === 3 ? "看看谁出现了" : "继续探索"} →</button></div>}
      </div>
    </section>}

    {step === "reveal" && <section className="screen reveal">
      <p className="kicker">BUG DISCOVERED · 行动 Bug 已出现</p>
      <h1 tabIndex={-1}>抓到了——<br/>原来是保护机制在偷偷拉手刹。</h1>
      <div className={`bug-orbit bug-orbit-${primaryId}`}><div className="reveal-character-wrap"><img src={revealImages[primaryId]} alt={primary.name} /></div><i className="orbit one"/><i className="orbit two"/></div>
      <div className={`bug-copy bug-copy-${primaryId}`}><p>{primary.en}</p><h2>{primary.name}</h2><blockquote>“{primary.line}”</blockquote><small>这不是固定人格，只是你在当前情境中常用的保护方式。</small></div>
      <button className="primary" onClick={() => setStep("storyTransition")}>进入失败模拟 ↗</button>
    </section>}

    {step === "storyTransition" && <section className="screen story-transition" aria-live="polite">
      <div className="portal-grid" aria-hidden="true"><i/><i/><i/><i/></div>
      <p>ENTERING FIELD TEST</p><b>载入失败模拟世界…</b><span>01 / 03</span>
    </section>}

    {step === "story" && <section className="screen story">
      <header><p className="brand small">FAIL<span>FIRST</span></p><p>出发岛 · 冒险 {eventIndex + 1}/3</p></header>
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
        : <div className="feedback story-fb" aria-live="polite"><p>{storyFeedback.text}</p><div><span>想象中的失败</span><b>人生被否定</b></div><div className="real"><span>模拟后的真实成本</span><b>{storyFeedback.cost}</b></div><button className="primary" onClick={nextStory}>{eventIndex === 2 ? "领取失败卡" : "走向下一关"} →</button></div>}
      </article>
    </section>}

    {step === "transition" && <section className="screen card-transition" aria-live="polite">
      <div className="pixel-burst" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i}/>)}</div>
      <div className="game-hud" aria-hidden="true"><span>STAGE 03</span><b>GAME CLEAR</b><span>NO CONTINUE USED</span></div>
      <p className="kicker">FIELD TEST COMPLETE · 03/03</p>
      <h1>失败没有消失。<br/><em>它正在变成反馈。</em></h1>
      <div className="evidence-count"><span>{String(evidence).padStart(2,"0")}</span><small>REALITY EVIDENCE COLLECTED</small></div>
      <p className="transition-note">你的行动卡已经生成</p>
      <button className="primary transition-continue" onClick={() => setStep("result")}>查看我的行动卡 <span>↗</span></button>
    </section>}

    {step === "result" && <section className="screen result">
      <div className="result-copy"><p className="kicker">ACHIEVEMENT UNLOCKED</p><h1 tabIndex={-1}>你没有避开失败。<br/><em>你把它变成了反馈。</em></h1><p>点击卡片，看看这个行动 Bug 一直在怎样保护你。</p></div>
      <button className={`failure-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(v => !v)} aria-label="翻转失败收藏卡">
        <div ref={cardFrontRef} className="card-face front"><small>FAILFIRST · {primary.code}</small><img className="card-character" src={primary.image} alt="" /><p>YOUR ACTION BUG</p><h2>{primary.name}</h2><blockquote>“{primary.line}”</blockquote><div className="card-task"><span>24H FIELD TASK</span><b>{primary.task}</b></div><i>点击翻面 ↻</i></div>
        <div className="card-face back-face"><small>FIELD NOTE · 出发岛</small><h2>这是保护程序。</h2><div><span>曾经提供的保护</span><b>{primary.strength}</b></div><div><span>可能造成的停滞</span><b>{primary.pattern}</b></div><div><span>你获得的现实证据</span><b>{evidence ? `${evidence} 份：失败的成本比想象更具体、更可处理。` : "暂时为 0：大脑仍在用想象填补空白。"}</b></div><i>点击翻回 ↻</i></div>
      </button>
      <div className="result-actions"><button className="primary" onClick={saveCard} disabled={saving}>{saving ? "正在生成图片…" : "保存我的行动卡 ↓"}</button><button className="ghost" onClick={restart}>再探索一次</button></div>
      <p className="disclaimer">这不是心理诊断，也不是固定人格。它只是当前情境中的一种保护性行动模式。</p>
    </section>}
  </main>;
}
