"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Icon } from "@/components/icons";
import { StatusPill } from "@/components/status-pill";
import type { ClientIntegrationMap } from "@/lib/client-config";
import { referenceAssets } from "@/lib/reference-assets";
import type { View } from "@/lib/types";

const navItems: { id: View; label: string; icon: string }[] = [
  { id: "discover", label: "Discover", icon: "discover" },
  { id: "stocks", label: "Stocks", icon: "stocks" },
  { id: "stacks", label: "Stacks", icon: "stacks" },
  { id: "portfolio", label: "Portfolio", icon: "portfolio" },
  { id: "profile", label: "Profile", icon: "profile" },
];

export function AppShell({ initialView = "discover" }: { initialView?: View }) {
  const [view, setView] = useState<View>(initialView);
  const [showStatus, setShowStatus] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const pageTitle = useMemo(() => navItems.find((item) => item.id === view)?.label ?? "Discover", [view]);

  return (
    <main className="app-frame" data-view={view}>
      <aside className={`sidebar ${mobileNav ? "sidebar--open" : ""}`}>
        <div className="sidebar__top">
          <button className="brand" onClick={() => { setView("discover"); setMobileNav(false); }} aria-label="Go to Discover">
            <BrandMark /><span>StacksClub</span>
          </button>
          <button className="icon-button sidebar__close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><Icon name="close" /></button>
        </div>
        <div className="sidebar__context">
          <span className="context-label">BNB Chain</span>
          <span className="context-status"><span className="status-dot status-dot--orange" />Integrations paused</span>
        </div>
        <nav className="primary-nav" aria-label="Primary navigation">
          <p className="nav-label">Market</p>
          {navItems.slice(0, 3).map((item) => <NavButton key={item.id} item={item} active={view === item.id} onClick={() => { setView(item.id); setMobileNav(false); }} />)}
          <p className="nav-label nav-label--spaced">Your club</p>
          {navItems.slice(3).map((item) => <NavButton key={item.id} item={item} active={view === item.id} onClick={() => { setView(item.id); setMobileNav(false); }} />)}
        </nav>
        <div className="sidebar__bottom">
          <button className="status-card" onClick={() => setShowStatus((current) => !current)} aria-expanded={showStatus}>
            <span className="status-card__icon"><Icon name="shield" size={17} /></span>
            <span><strong>Read-only preview</strong><small>See what is ready</small></span>
            <Icon name={showStatus ? "chevron" : "arrow"} size={15} />
          </button>
          {showStatus && <IntegrationPopover />}
          <div className="sidebar__footer"><span>v0.1 preview</span><span className="footer-separator" /> <span>BSC 56</span></div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Icon name="stacks" /></button>
          <div className="topbar__crumb"><span className="topbar__muted">StacksClub</span><span>/</span><strong>{pageTitle}</strong></div>
          <div className="topbar__actions">
            <button className="network-select" title="Network selection is fixed to BNB Chain in this preview"><span className="network-dot" />BNB Chain <Icon name="chevron" size={14} /></button>
            <button className="connect-button" disabled title="Wallet sign-in is unavailable until Privy and BSC RPC are configured"><Icon name="wallet" size={16} />Connect wallet</button>
          </div>
        </header>
        <div className="content-scroll">
          {view === "discover" && <Discover onNavigate={setView} />}
          {view === "stocks" && <Stocks onNavigate={setView} />}
          {view === "stacks" && <Stacks />}
          {view === "portfolio" && <Portfolio />}
          {view === "profile" && <Profile />}
        </div>
      </section>
    </main>
  );
}

function NavButton({ item, active, onClick }: { item: (typeof navItems)[number]; active: boolean; onClick: () => void }) {
  return <button className={`nav-button ${active ? "nav-button--active" : ""}`} onClick={onClick}><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.id === "portfolio" && <span className="nav-badge">0</span>}</button>;
}

function IntegrationPopover() {
  const [integrations, setIntegrations] = useState<ClientIntegrationMap | null>(null);
  useEffect(() => {
    fetch("/api/status").then((response) => response.ok ? response.json() : Promise.reject()).then((data) => setIntegrations(data.integrations)).catch(() => setIntegrations({}));
  }, []);
  return <div className="integration-popover"><div className="popover-heading"><strong>Integration status</strong><StatusPill tone="orange">{integrations ? "Live check" : "Checking"}</StatusPill></div>
    {integrations ? Object.values(integrations).map((integration) => <div className="integration-row" key={integration.label}><span className={`status-dot ${integration.configured ? "status-dot--green" : "status-dot--orange"}`} /><span>{integration.label}</span><small>{integration.configured ? "Configured" : "Missing key"}</small></div>) : <div className="integration-row"><span>Checking server configuration…</span></div>}
    <div className="integration-row"><span className="status-dot status-dot--orange" /><span>BSC stock trade routes</span><small>Not implemented</small></div>
  </div>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <div className="section-kicker">{eyebrow}</div>}<h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Discover({ onNavigate }: { onNavigate: (view: View) => void }) {
  return <div className="page page--discover">
    <section className="hero-panel">
      <div className="hero-copy"><StatusPill tone="blue">Built for BNB Chain</StatusPill><h1>Make a market<br /><em>of your ideas.</em></h1><p>Discover verified tokenized stocks, follow the people shaping them, and build a Stack that says something about how you see the world.</p><div className="hero-actions"><button className="button button--light" onClick={() => onNavigate("stocks")}>Explore stocks <Icon name="arrow" size={16} /></button><button className="text-button text-button--light" onClick={() => onNavigate("stacks")}>Create a Stack <Icon name="plus" size={16} /></button></div></div>
      <div className="hero-visual" aria-label="StacksClub abstract mark"><div className="orbit orbit--one" /><div className="orbit orbit--two" /><div className="orbit orbit--three" /><div className="hero-token hero-token--center"><BrandMark /></div><span className="hero-label hero-label--top">YOUR<br />THESIS</span><span className="hero-label hero-label--right">02—05<br />ASSETS</span><span className="hero-label hero-label--bottom">ONE<br />POSITION</span></div>
    </section>

    <section className="section-block section-block--first"><div className="section-heading"><div><div className="section-kicker">Your starting point</div><h2>There’s more to discover.</h2></div><button className="text-button" onClick={() => onNavigate("stocks")}>View all stocks <Icon name="arrow" size={15} /></button></div><div className="opportunity-grid"><Opportunity icon="stocks" number="01" title="Browse the market" copy="Compare verified stock tokens by provider, chain status, and route availability." action="Open Stocks" onClick={() => onNavigate("stocks")} /><Opportunity icon="stacks" number="02" title="Find your Stack" copy="Explore immutable recipes made from the assets you believe in." action="Explore Stacks" onClick={() => onNavigate("stacks")} /><Opportunity icon="portfolio" number="03" title="Bring your positions" copy="Connect a wallet to see exact quantities, cost basis, and redemption paths." action="View Portfolio" onClick={() => onNavigate("portfolio")} /></div></section>

    <section className="section-block insight-row"><div className="insight-copy"><div className="section-kicker">A clear view, first</div><h2>Know what you’re<br />signing before you do.</h2><p>Every asset carries its provider, route status, data source, and timestamp. No mystery numbers. No hidden mechanics.</p><button className="text-button" onClick={() => onNavigate("stocks")}>See the catalogue <Icon name="arrow" size={15} /></button></div><div className="preview-sheet"><div className="preview-sheet__top"><span>Asset comparison</span><StatusPill tone="orange">Waiting for data</StatusPill></div><div className="preview-row preview-row--head"><span>Asset</span><span>Provider</span><span>Route</span></div><div className="preview-row"><span className="asset-name"><span className="asset-orb asset-orb--blue">N</span><span>NVDA<small>Tokenized stock</small></span></span><span className="faint-bar" /><span className="route-chip">Not available</span></div><div className="preview-row"><span className="asset-name"><span className="asset-orb asset-orb--ink">A</span><span>AAPL<small>Tokenized stock</small></span></span><span className="faint-bar faint-bar--short" /><span className="route-chip">Not available</span></div><div className="preview-footer"><Icon name="info" size={14} /> Live rows appear when Binance Web3 and BSC RPC are configured.</div></div></section>
  </div>;
}

function Opportunity({ icon, number, title, copy, action, onClick }: { icon: string; number: string; title: string; copy: string; action: string; onClick: () => void }) {
  return <article className="opportunity"><div className="opportunity__top"><span className="opportunity-icon"><Icon name={icon} size={19} /></span><span className="opportunity-number">{number}</span></div><h3>{title}</h3><p>{copy}</p><button className="text-button" onClick={onClick}>{action}<Icon name="arrow" size={14} /></button></article>;
}

function Stocks({ onNavigate }: { onNavigate: (view: View) => void }) {
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("All providers");
  const [quotes, setQuotes] = useState<Record<string, { status: string; underlyingSymbol?: string; quote?: { bidPrice: string; askPrice: string } }> | null>(null);
  const [quotesFetchedAt, setQuotesFetchedAt] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setQuoteError("");
    fetch("/api/quotes", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.status ?? "quote_unavailable");
      return data;
    }).then((data) => {
      if (!active) return;
      setQuotes(data.quotes);
      setQuotesFetchedAt(data.fetchedAt ?? null);
      const values = Object.values(data.quotes) as { status: string }[];
      if (!values.some((quote) => quote.status === "indicative")) setQuoteError(quoteMessage(values[0]?.status ?? data.status));
    }).catch((error: unknown) => {
      if (!active) return;
      setQuotes({});
      const code = error instanceof Error ? error.message : "provider_network_error";
      setQuoteError(quoteMessage(code));
    });
    return () => { active = false; };
  }, [retry]);
  const assets = referenceAssets.filter((asset) => {
    const matchesQuery = `${asset.symbol} ${asset.name}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (provider === "All providers" || provider === asset.provider);
  });
  return <><section className="market-mobile">
    <header className="market-mobile__header"><button className="market-mobile__brand" onClick={() => onNavigate("discover")} aria-label="Go to StacksClub Discover"><BrandMark /><span>STACKSCLUB</span></button><span className="market-mobile__badge"><i />BNB CHAIN · PREVIEW</span></header>
    <div className="market-mobile__summary"><div><strong>{referenceAssets.length}</strong><span>reference stock contracts</span></div><a href="#market-assets">View listings <span aria-hidden="true">↓</span></a></div>
    <div className="market-mobile__tabs" role="group" aria-label="Market sections"><button disabled title="Watchlists will be available when profiles are connected">Watchlist</button><button aria-current="page">Stocks</button><button onClick={() => onNavigate("stacks")}>Stacks</button></div>
    <div className="market-mobile__filters" role="group" aria-label="Filter by provider">{["All providers", "bStocks", "xStocks", "Ondo"].map((item) => <button key={item} className={provider === item ? "is-active" : ""} onClick={() => setProvider(item)}>{item}</button>)}</div>
    <label className="market-mobile__search"><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stocks" /></label>
    <div className="market-mobile__notice"><span><i />{quoteError ? "QUOTE CHECK NEEDS ATTENTION" : quotes ? "UNDERLYING MARKET QUOTES" : "CHECKING LIVE QUOTES"}</span><p>{quoteError || "Quotes are for the underlying US equity, not the token. Contract verification and StacksClub trade routes are not connected."}{quotesFetchedAt && <> Updated {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(quotesFetchedAt))}.</>}{quoteError && <> <button className="market-mobile__retry" onClick={() => { setQuotes(null); setRetry((n) => n + 1); }}>Retry</button></>}</p></div>
    <section className="market-mobile__assets" id="market-assets" aria-label="Stock listings">
      <div className="market-mobile__list-head"><strong>{assets.length ? "Assets" : "No assets found"}</strong><span>{assets.length} SHOWN</span></div>
      {assets.length ? assets.map((asset) => <a className="market-mobile__asset" key={asset.address} href={`https://bscscan.com/token/${asset.address}`} target="_blank" rel="noreferrer">
        <span className={`market-mobile__ticker market-mobile__ticker--${asset.symbol.slice(0, 1).toLowerCase()}`}>{asset.symbol.slice(0, 1)}</span>
        <span className="market-mobile__asset-copy"><strong>{asset.name}</strong><small><b>{asset.symbol}</b><i />{asset.provider}</small></span>
        <span className="market-mobile__asset-status"><strong>{asset.underlyingSymbol && quotes?.[asset.symbol]?.quote ? `Bid $${formatPrice(quotes[asset.symbol].quote!.bidPrice)}` : "—"}</strong><small>{asset.underlyingSymbol && quotes?.[asset.symbol]?.quote ? `Ask $${formatPrice(quotes[asset.symbol].quote!.askPrice)} · underlying` : "quote unavailable"}</small></span>
        <Icon name="chevron" size={15} />
      </a>) : <div className="market-mobile__empty">No listings match this search and provider. Clear filters to see the reference contracts.</div>}
    </section>
    <nav className="market-mobile__nav" aria-label="App navigation">{navItems.filter((item) => item.id !== "profile").map((item) => <button key={item.id} className={item.id === "stocks" ? "is-active" : ""} onClick={() => onNavigate(item.id)}><Icon name={item.icon} size={17} /><span>{item.id === "discover" ? "Markets" : item.id === "portfolio" ? "Wallet" : item.label}</span></button>)}<button onClick={() => onNavigate("profile")}><Icon name="profile" size={17} /><span>Profile</span></button></nav>
  </section>
  <div className="page market-desktop"><PageHeader eyebrow="Reference listings" title="Stocks, with context." description="Search published BNB Chain stock contracts by asset, then inspect each address on the block explorer." action={<button className="button button--blue" disabled title="Buying is unavailable until verified assets and trade routes are configured"><Icon name="plus" size={16} />Buy stock</button>} />
    <div className="notice-banner"><span className="notice-banner__icon"><Icon name="clock" size={17} /></span><span><strong>{quoteError || "Underlying equity quotes only."}</strong> {quoteError ? "Check the provider status and retry. These figures are not token prices; no BSC contract allowlist or executable trade route is connected." : "Where available, Binance quotes are the underlying equity bid/ask, not token prices. BSC contract verification and StacksClub trade routes are not implemented."} {quotesFetchedAt && `Updated ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(quotesFetchedAt))}. `}{quoteError && <button className="market-desktop__retry" onClick={() => { setQuotes(null); setRetry((n) => n + 1); }}>Retry</button>}</span><a href="https://www.bnbchain.org/en/blog/bnb-street-is-open-24-7-access-709-tokenized-stocks-of-the-worlds-largest-companies-on-bnb-chain" target="_blank" rel="noreferrer" className="notice-source">Source ↗</a></div>
    <div className="toolbar"><label className="search-field"><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ticker or company" /></label><div className="segmented-control" role="group" aria-label="Provider filter">{["All providers", "bStocks", "xStocks", "Ondo"].map((item) => <button key={item} className={provider === item ? "is-selected" : ""} onClick={() => setProvider(item)}>{item}</button>)}</div><button className="filter-button"><Icon name="filter" size={16} />Filters <span>0</span></button></div>
    <div className="catalogue-table"><div className="catalogue-table__head catalogue-table__head--stocks"><span>Asset</span><span>Provider</span><span>Underlying bid / ask</span><span>Route status</span><span>Contract</span></div>{assets.length ? assets.map((asset) => <div className="catalogue-row" key={asset.address}><span className="catalogue-row__asset"><i>{asset.symbol.slice(0, 1)}</i><span><strong>{asset.name}</strong><small>{asset.symbol}</small></span></span><span className="provider-tag">{asset.provider}</span><span className="catalogue-unavailable">{asset.underlyingSymbol && quotes?.[asset.symbol]?.quote ? `$${formatPrice(quotes[asset.symbol].quote!.bidPrice)} / $${formatPrice(quotes[asset.symbol].quote!.askPrice)}` : "—"}<small>{asset.underlyingSymbol && quotes?.[asset.symbol]?.quote ? `${asset.underlyingSymbol} underlying · indicative` : asset.underlyingSymbol ? "No underlying quote" : "No public equity quote"}</small></span><span><span className="route-chip">Not implemented</span></span><a className="catalogue-contract" href={`https://bscscan.com/token/${asset.address}`} target="_blank" rel="noreferrer">{asset.address.slice(0, 8)}…{asset.address.slice(-5)} <Icon name="external" size={13} /></a></div>) : <div className="catalogue-empty"><div className="empty-emblem"><Icon name="search" size={22} /></div><h3>No matching listings</h3><p>Try another ticker or company name.</p><button className="text-button" onClick={() => { setQuery(""); setProvider("All providers"); }}>Clear search <Icon name="arrow" size={14} /></button></div>}<div className="table-footnote"><Icon name="shield" size={14} />Reference contracts are not StacksClub allowlist approvals. Quotes below apply to underlying US equities, not token units. No StacksClub trade route is implemented.</div></div>
  </div></>;
}

function formatPrice(price: string) {
  const value = Number(price);
  return Number.isFinite(value) ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) : "—";
}

function quoteMessage(code: string) {
  if (code === "provider_auth_rejected") return "Binance rejected the API key. Check key permissions and IP restrictions.";
  if (code === "provider_rate_limited") return "Binance is rate-limiting quotes. Try again in a moment.";
  if (code === "integration_not_configured") return "Add the Binance API key to enable underlying market quotes.";
  if (code === "provider_invalid_response") return "Binance returned an unreadable quote response. Retry to check again.";
  return "Binance quotes are temporarily unavailable. Retry to check again.";
}

function Stacks() {
  const [composerOpen, setComposerOpen] = useState(false);
  return <div className="page"><PageHeader eyebrow="Creator-made recipes" title="Stacks are a point of view." description="Immutable baskets of verified tokenized stocks, assembled by people who want to share a thesis." action={<button className="button button--blue" onClick={() => setComposerOpen(true)}><Icon name="plus" size={16} />Create a Stack</button>} />
    <section className="stack-intro"><div className="stack-intro__copy"><div className="stack-glyph"><span /><span /><span /></div><h2>Build a basket<br />worth following.</h2><p>Choose 2–5 supported assets, set the recipe, and launch once. Your weights stay fixed; the market moves around them.</p><button className="button button--ink" onClick={() => setComposerOpen(true)}>Start with a blank recipe <Icon name="arrow" size={15} /></button></div><div className="recipe-preview"><div className="recipe-preview__label">Illustrative recipe preview</div><div className="recipe-preview__title">A basket needs a thesis.</div><div className="recipe-slice recipe-slice--large"><span>01</span><strong>Verified asset</strong><small>Provider label · exact address</small></div><div className="recipe-slice recipe-slice--medium"><span>02</span><strong>Verified asset</strong><small>Provider label · exact address</small></div><div className="recipe-slice recipe-slice--small"><span>03</span><strong>Optional asset</strong><small>Provider label · exact address</small></div><div className="recipe-preview__foot"><Icon name="info" size={14} /> Example structure only. No live recipe is being shown.</div></div></section>
    <section className="section-block stacks-empty"><div><div className="section-kicker">The club floor</div><h2>Stacks from the community<br />will live here.</h2><p>Explore by creator, theme, and recent activity once social indexing is connected.</p></div><StatusPill tone="orange">Social index not configured</StatusPill></section>
    {composerOpen && <StackComposer onClose={() => setComposerOpen(false)} />}
  </div>;
}

function StackComposer({ onClose }: { onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="composer-title"><div className="modal__head"><div><div className="section-kicker">New recipe</div><h2 id="composer-title">Create your Stack</h2></div><button className="icon-button" onClick={onClose} aria-label="Close create Stack"><Icon name="close" /></button></div><div className="modal__body"><label className="field-label">Stack name<input placeholder="e.g. The long game" disabled title="Stack creation needs a verified catalogue" /></label><div className="asset-picker"><div><strong>Choose 2–5 assets</strong><small>Only verified BNB Chain assets can be added.</small></div><span className="asset-picker__count">0 / 5</span></div><div className="modal-empty"><Icon name="shield" size={22} /><strong>Waiting for the verified catalogue</strong><p>Connect Binance Web3 market data and BSC RPC to choose assets with real provider addresses.</p></div></div><div className="modal__foot"><button className="button button--quiet" onClick={onClose}>Cancel</button><button className="button button--blue" disabled title="Add 2–5 verified assets first">Launch Stack</button></div></section></div>;
}

function Portfolio() {
  return <div className="page"><PageHeader eyebrow="Your onchain positions" title="A portfolio with receipts." description="Exact quantities, provider labels, and defensible cost basis — pulled from the chain, not guessed from a database." /><div className="portfolio-banner"><div className="portfolio-banner__mark"><Icon name="wallet" size={23} /></div><div><h2>Connect a wallet to see your positions.</h2><p>Wallet sign-in is paused in this preview because Privy and the BSC RPC endpoint are not configured yet.</p></div><button className="button button--ink" disabled title="Wallet sign-in is unavailable until Privy and BSC RPC are configured">Connect wallet</button></div><div className="portfolio-grid"><Metric label="Total value" value="—" note="Indicative mark" /><Metric label="Cost basis" value="—" note="After wallet connection" /><Metric label="Open positions" value="0" note="Verified onchain only" /></div><div className="section-block transaction-empty"><div className="section-heading"><div><div className="section-kicker">Recent activity</div><h2>No transactions yet.</h2></div><button className="text-button" disabled title="There is no wallet activity to export">Export history <Icon name="external" size={14} /></button></div><p>Buy, sell, and redeem receipts will appear here with their transaction hashes and status.</p></div></div>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

function Profile() {
  return <div className="page"><PageHeader eyebrow="Your public edge" title="Make your thesis legible." description="Set up a profile once sign-in is connected, then share the recipes and positions you want the club to see." action={<button className="button button--blue" disabled title="Profile creation is unavailable until Privy and Supabase are configured"><Icon name="profile" size={16} />Create profile</button>} /><div className="profile-layout"><section className="profile-card"><div className="profile-avatar"><Icon name="profile" size={28} /></div><h2>Your profile is waiting.</h2><p>Profiles are tied to a verified sign-in and indexed in Supabase. We do not create placeholder people or follower counts.</p><div className="profile-fields"><div><span>Username</span><strong>Not set</strong></div><div><span>Bio</span><strong>Not set</strong></div><div><span>X profile</span><strong>Not connected</strong></div></div></section><section className="profile-side"><div className="section-kicker">What you’ll get</div><h2>A home for your point of view.</h2><ul className="check-list"><li><Icon name="check" size={16} />Share immutable Stacks</li><li><Icon name="check" size={16} />Follow creators and themes</li><li><Icon name="check" size={16} />Show activity with receipts</li></ul><div className="profile-side__note"><Icon name="shield" size={15} /><span>Verified badges are never shown without actual verification.</span></div></section></div></div>;
}
