"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import type { CatalogueAsset } from "@/lib/types";

export function LandingPage() {
  const [assets, setAssets] = useState<CatalogueAsset[]>([]);
  const [catalogueReady, setCatalogueReady] = useState(false);

  useEffect(() => {
    fetch("/api/catalogue", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setAssets(Array.isArray(data.assets) ? data.assets.slice(0, 5) : []))
      .catch(() => setAssets([]))
      .finally(() => setCatalogueReady(true));
  }, []);

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
          <div className="asset-ticket asset-ticket--one"><span className="ticket-symbol">01</span><span><strong>Verified token</strong><small>Provider metadata</small></span><b>BSC</b></div>
          <div className="asset-ticket asset-ticket--two"><span className="ticket-symbol ticket-symbol--orange">02</span><span><strong>Verified token</strong><small>Contract checked</small></span><b>BSC</b></div>
          <div className="asset-ticket asset-ticket--three"><span className="ticket-symbol ticket-symbol--ink">03</span><span><strong>Verified token</strong><small>Route unavailable</small></span><b>BSC</b></div>
          <div className="art-caption"><span>01 /</span> A MARKET BUILT AROUND YOUR IDEAS</div>
        </div>
        <div className="landing-hero__foot"><span>DISCOVER WITH CONTEXT</span><span>BNB SMART CHAIN <i /></span><span>SCROLL TO EXPLORE ↓</span></div>
      </section>

      <section className="landing-stock-section" id="stocks">
        <div className="landing-section-head">
          <div><h2>Stocks are here.</h2><p>Published bStocks contracts on BNB Smart Chain, ready to inspect. Quotes and StacksClub trade routes are still being connected.</p></div>
          <Link className="landing-inline-link" href="/app/stocks">Open the live catalogue <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="landing-assets">
          {assets.map((asset, index) => <a className="landing-asset" href={`https://bscscan.com/token/${asset.tokenAddress}`} target="_blank" rel="noreferrer" key={`${asset.provider}:${asset.tokenAddress}`}>
            <span className={`landing-asset__mark landing-asset__mark--${index}`}>{asset.symbol.slice(0, 1)}</span>
            <span className="landing-asset__name"><strong>{asset.name}</strong><small>{asset.symbol} <i /> {asset.provider}</small></span>
            <span className="landing-asset__contract">{asset.tokenAddress.slice(0, 6)}…{asset.tokenAddress.slice(-4)}<small>{asset.contractVerified ? "BSC contract verified" : "BSC contract check pending"}</small></span>
            <span className="landing-asset__arrow" aria-hidden="true">↗</span>
          </a>)}
          {!assets.length && <div className="landing-assets__empty">{catalogueReady ? "Live provider listings will appear when Binance Web3 metadata and BSC contract checks are available." : "Checking the live provider catalogue…"}</div>}
        </div>
        <div className="landing-stock-note"><span className="note-dot" />Listings come from the live Binance Web3 RWA catalogue. Contract checks are reported separately; prices and trade routes are unavailable until verified.</div>
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
