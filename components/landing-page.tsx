import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { referenceAssets } from "@/lib/reference-assets";

const featured = ["SPCXB", "NVDAB", "TSLAB", "MUB", "CRCLB"];

export function LandingPage() {
  const assets = featured.map((symbol) => referenceAssets.find((asset) => asset.symbol === symbol)!);

  return (
    <main className="landing">
      <header className="landing-nav">
        <Link className="landing-brand" href="/" aria-label="StacksClub home"><BrandMark /><span>StacksClub</span></Link>
        <nav aria-label="Main navigation">
          <a href="#stocks">Stocks</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <Link className="landing-nav__cta" href="/app/stocks">Open the market <span aria-hidden="true">↗</span></Link>
      </header>

      <section className="landing-hero">
        <div className="landing-hero__copy">
          <h1>Bring your<br />stock thesis<br /><em>onchain.</em></h1>
          <p>Explore tokenized stocks on BNB Chain, compare providers, and turn your point of view into a Stack people can follow.</p>
          <div className="landing-hero__actions">
            <Link className="landing-button landing-button--light" href="/app/stocks">Explore stocks <span aria-hidden="true">→</span></Link>
            <a className="landing-text-link" href="#how-it-works">How StacksClub works <span aria-hidden="true">↓</span></a>
          </div>
          <div className="landing-proof"><span className="proof-stamp" aria-hidden="true">↗</span><span>Every listing includes its BNB Chain contract.<br /><strong>Inspect the source before you act.</strong></span></div>
        </div>
        <div className="landing-hero__art" aria-label="A stack of tokenized stock assets">
          <div className="hero-art-orbit hero-art-orbit--a" /><div className="hero-art-orbit hero-art-orbit--b" />
          <div className="thesis-note"><span>THE LONG VIEW</span><strong>Ideas belong<br />in a basket.</strong><div><i /><i /><i /></div><small>2—5 ASSETS · ONE STACK</small></div>
          <div className="asset-ticket asset-ticket--one"><span className="ticket-symbol">NV</span><span><strong>NVDAB</strong><small>NVIDIA · bStocks</small></span><b>BNB</b></div>
          <div className="asset-ticket asset-ticket--two"><span className="ticket-symbol ticket-symbol--orange">T</span><span><strong>TSLAB</strong><small>Tesla · bStocks</small></span><b>BNB</b></div>
          <div className="asset-ticket asset-ticket--three"><span className="ticket-symbol ticket-symbol--ink">S</span><span><strong>SPCXB</strong><small>SpaceX · bStocks</small></span><b>BNB</b></div>
          <div className="art-caption"><span>01 /</span> A MARKET BUILT AROUND YOUR IDEAS</div>
        </div>
        <div className="landing-hero__foot"><span>DISCOVER WITH CONTEXT</span><span>BNB SMART CHAIN <i /></span><span>SCROLL TO EXPLORE ↓</span></div>
      </section>

      <section className="landing-stock-section" id="stocks">
        <div className="landing-section-head">
          <div><h2>Stocks are here.</h2><p>Published bStocks contracts on BNB Smart Chain, ready to inspect. Quotes and StacksClub trade routes are still being connected.</p></div>
          <Link className="landing-inline-link" href="/app/stocks">See all reference listings <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="landing-assets">
          {assets.map((asset, index) => <a className="landing-asset" href={`https://bscscan.com/token/${asset.address}`} target="_blank" rel="noreferrer" key={asset.symbol}>
            <span className={`landing-asset__mark landing-asset__mark--${index}`}>{asset.symbol.slice(0, 1)}</span>
            <span className="landing-asset__name"><strong>{asset.name}</strong><small>{asset.symbol} <i /> bStocks</small></span>
            <span className="landing-asset__contract">{asset.address.slice(0, 6)}…{asset.address.slice(-4)}<small>BNB Chain contract</small></span>
            <span className="landing-asset__arrow" aria-hidden="true">↗</span>
          </a>)}
        </div>
        <div className="landing-stock-note"><span className="note-dot" />Reference contracts published by Trust Wallet and BNB Chain. StacksClub has not yet verified live route availability or price data. <a href="https://trustwallet.com/blog/campaigns/bstocks-trading-competition" target="_blank" rel="noreferrer">bStocks ↗</a><a href="https://www.bnbchain.org/en/blog/bnb-street-is-open-24-7-access-709-tokenized-stocks-of-the-worlds-largest-companies-on-bnb-chain" target="_blank" rel="noreferrer">Provider comparison ↗</a></div>
      </section>

      <section className="landing-how" id="how-it-works">
        <div className="landing-how__title"><h2>A market with<br />room for a point of view.</h2></div>
        <div className="landing-how__steps">
          <article><span>01</span><h3>Explore the assets</h3><p>See which provider issued each token and inspect its BNB Chain contract before you go further.</p></article>
          <article><span>02</span><h3>Compare with context</h3><p>Provider, route, and quote details belong beside an asset. When a detail is unavailable, we say so.</p></article>
          <article><span>03</span><h3>Build a Stack</h3><p>When the catalogue is verified, combine 2–5 assets into an immutable recipe others can explore.</p></article>
        </div>
      </section>
      <footer className="landing-footer"><Link className="landing-brand" href="/"><BrandMark /><span>StacksClub</span></Link><span>Clear context for onchain stock ideas.</span><Link href="/app">Enter preview <span aria-hidden="true">↗</span></Link></footer>
    </main>
  );
}
