export default function PlayPage() {
  return (
    <main className="play-page">
      <div className="play-symbols" aria-hidden="true">
        <span>✦</span><span>+</span><span>◇</span><span>↗</span><span>×</span><span>□</span>
      </div>
      <header className="play-header">
        <p className="play-brand">FAIL<span>FIRST</span><sup>↗︎</sup></p>
        <p>FIELD TEST · 001</p>
      </header>
      <section className="play-content">
        <div className="play-copy">
          <p className="play-kicker">SCAN TO START</p>
          <h1>先失败，<br /><em>再开始</em></h1>
          <p>微信扫码<br />进入行动实验</p>
          <small>无需登录 · 打开即玩</small>
        </div>
        <div className="play-qr-wrap">
          <img src="/failfirst-qr-1024.png" alt="FailFirst 微信试玩二维码" />
          <p>FAILFIRST</p>
        </div>
      </section>
      <footer>无标准答案 · 每次冒险都算数</footer>
    </main>
  );
}
