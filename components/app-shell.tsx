"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { BrandMark } from "@/components/brand-mark";
import { Icon } from "@/components/icons";
import { StatusPill } from "@/components/status-pill";
import { WalletAuthButton } from "@/components/wallet-auth-button";
import type { ClientIntegrationMap } from "@/lib/client-config";
import type { CatalogueAsset, View } from "@/lib/types";

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
          <span className="context-status"><span className="status-dot status-dot--orange" />Read only preview</span>
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
            <WalletAuthButton />
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
  return <button className={`nav-button ${active ? "nav-button--active" : ""}`} onClick={onClick}><Icon name={item.icon} size={18} /><span>{item.label}</span></button>;
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

    <section className="section-block insight-row"><div className="insight-copy"><div className="section-kicker">A clear view, first</div><h2>Know what you’re<br />signing before you do.</h2><p>Every asset carries its provider, route status, data source, and timestamp. No mystery numbers. No hidden mechanics.</p><button className="text-button" onClick={() => onNavigate("stocks")}>See the catalogue <Icon name="arrow" size={15} /></button></div><div className="preview-sheet"><div className="preview-sheet__top"><span>Asset comparison</span><StatusPill tone="orange">Live catalogue</StatusPill></div><div className="preview-row preview-row--head"><span>Asset</span><span>Provider</span><span>Route</span></div><div className="preview-row"><span className="asset-name"><span className="asset-orb asset-orb--blue">01</span><span>Provider listing<small>Tokenized stock</small></span></span><span className="faint-bar" /><span className="route-chip">Check required</span></div><div className="preview-row"><span className="asset-name"><span className="asset-orb asset-orb--ink">02</span><span>Provider listing<small>Tokenized stock</small></span></span><span className="faint-bar faint-bar--short" /><span className="route-chip">Check required</span></div><div className="preview-footer"><Icon name="info" size={14} /> Listings and route checks load from configured live sources.</div></div></section>
  </div>;
}

function Opportunity({ icon, number, title, copy, action, onClick }: { icon: string; number: string; title: string; copy: string; action: string; onClick: () => void }) {
  return <article className="opportunity"><div className="opportunity__top"><span className="opportunity-icon"><Icon name={icon} size={19} /></span><span className="opportunity-number">{number}</span></div><h3>{title}</h3><p>{copy}</p><button className="text-button" onClick={onClick}>{action}<Icon name="arrow" size={14} /></button></article>;
}

function Stocks({ onNavigate }: { onNavigate: (view: View) => void }) {
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("All providers");
  const [assets, setAssets] = useState<CatalogueAsset[]>([]);
  const [catalogueState, setCatalogueState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [catalogueMessage, setCatalogueMessage] = useState("");
  const [retry, setRetry] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<CatalogueAsset | null>(null);
  useEffect(() => {
    let active = true;
    setCatalogueState("loading");
    fetch("/api/catalogue", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? data.status ?? "catalogue_unavailable");
      return data;
    }).then((data) => {
      if (!active) return;
      setAssets(data.assets ?? []);
      setCatalogueMessage(data.message ?? "Provider metadata is unavailable.");
      setCatalogueState("ready");
    }).catch((error: unknown) => {
      if (!active) return;
      setAssets([]);
      setCatalogueMessage(error instanceof Error ? error.message : "Verified provider metadata is temporarily unavailable.");
      setCatalogueState("unavailable");
    });
    return () => { active = false; };
  }, [retry]);
  const visibleAssets = assets.filter((asset) => {
    const matchesQuery = `${asset.symbol} ${asset.name}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (provider === "All providers" || provider === asset.provider);
  });
  const retryButton = <button className="market-mobile__retry" onClick={() => setRetry((n) => n + 1)}>Retry</button>;
  return <><section className="market-mobile">
    <header className="market-mobile__header"><button className="market-mobile__brand" onClick={() => onNavigate("discover")} aria-label="Go to StacksClub Discover"><BrandMark /><span>STACKSCLUB</span></button><span className="market-mobile__badge"><i />BNB CHAIN · PREVIEW</span></header>
    <div className="market-mobile__summary"><div><strong>{catalogueState === "ready" ? visibleAssets.length : "—"}</strong><span>verified BSC assets</span></div><button className="market-mobile__deposit" onClick={() => onNavigate("portfolio")}><Icon name="plus" size={15} />Deposit</button></div>
    <div className="market-mobile__tabs" role="group" aria-label="Market sections"><button disabled title="Watchlists will be available when profiles are connected">Watchlist</button><button aria-current="page">Stocks</button><button onClick={() => onNavigate("stacks")}>Stacks</button></div>
    <div className="market-mobile__filters" role="group" aria-label="Filter by provider">{["All providers", "bStocks", "Ondo"].map((item) => <button key={item} className={provider === item ? "is-active" : ""} onClick={() => setProvider(item)}>{item}</button>)}</div>
    <label className="market-mobile__search"><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stocks" /></label>
    <div className="market-mobile__notice"><span><i />{catalogueState === "loading" ? "CHECKING VERIFIED CATALOGUE" : catalogueState === "unavailable" ? "CATALOGUE UNAVAILABLE" : "LIVE PROVIDER METADATA"}</span><p>{catalogueMessage || "Token quotes and executable routes appear only after current provider and onchain checks."}{catalogueState === "unavailable" && <> {retryButton}</>}</p></div>
    <section className="market-mobile__assets" id="market-assets" aria-label="Stock listings">
      <div className="market-mobile__list-head"><strong>{visibleAssets.length ? "Assets" : catalogueState === "loading" ? "Loading catalogue" : "No verified assets"}</strong><span>{visibleAssets.length} SHOWN</span></div>
      {visibleAssets.length ? visibleAssets.map((asset) => <button className="market-mobile__asset" key={`${asset.provider}:${asset.tokenAddress}`} onClick={() => setSelectedAsset(asset)}>
        <span className={`market-mobile__ticker market-mobile__ticker--${asset.symbol.slice(0, 1).toLowerCase()}`}>{asset.symbol.slice(0, 1)}</span>
        <span className="market-mobile__asset-copy"><strong>{asset.name}</strong><small><b>{asset.symbol}</b><i />{asset.provider}</small></span>
        <span className="market-mobile__asset-status"><strong>{asset.contractVerified ? "Verified" : "Pending"}</strong><small>{asset.tradeable ? "Route available" : "No executable route"}</small></span>
        <Icon name="chevron" size={15} />
      </button>) : <div className="market-mobile__empty">{catalogueState === "loading" ? "Checking Binance metadata and BSC token contracts…" : catalogueState === "unavailable" ? "The verified catalogue could not be loaded." : "No provider assets match this search. Clear the filters to try again."}{catalogueState !== "loading" && retryButton}</div>}
    </section>
    <nav className="market-mobile__nav" aria-label="App navigation">{navItems.filter((item) => item.id !== "profile").map((item) => <button key={item.id} className={item.id === "stocks" ? "is-active" : ""} onClick={() => onNavigate(item.id)}><Icon name={item.icon} size={17} /><span>{item.id === "discover" ? "Markets" : item.id === "portfolio" ? "Wallet" : item.label}</span></button>)}<button onClick={() => onNavigate("profile")}><Icon name="profile" size={17} /><span>Profile</span></button></nav>
  </section>
  <div className="page market-desktop"><PageHeader eyebrow="Verified provider listings" title="Stocks, with context." description="Provider metadata appears only after onchain bytecode, decimals, and symbol checks. Executable routes remain separately gated." action={<button className="button button--blue" disabled title="Trade routes are disabled until the full fee and wallet-signed execution path is verified"><Icon name="plus" size={16} />Buy stock</button>} />
    <div className="notice-banner"><span className="notice-banner__icon"><Icon name="clock" size={17} /></span><span><strong>{catalogueState === "ready" ? "BSC contract checks completed." : "Verified catalogue pending."}</strong> {catalogueMessage || "Provider data and onchain verification are loading."} Token quotes and trade routes require separate current checks.</span>{catalogueState === "unavailable" && <button className="market-desktop__retry" onClick={() => setRetry((n) => n + 1)}>Retry</button>}</div>
    <div className="toolbar"><label className="search-field"><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ticker or company" /></label><div className="segmented-control" role="group" aria-label="Provider filter">{["All providers", "bStocks", "Ondo"].map((item) => <button key={item} className={provider === item ? "is-selected" : ""} onClick={() => setProvider(item)}>{item}</button>)}</div><button className="filter-button" disabled title="No additional verified filters are available"><Icon name="filter" size={16} />Filters</button></div>
    <div className="catalogue-table"><div className="catalogue-table__head catalogue-table__head--stocks"><span>Asset</span><span>Provider</span><span>Onchain check</span><span>Stack / trade</span><span>Contract</span></div>{visibleAssets.length ? visibleAssets.map((asset) => <div className="catalogue-row" key={`${asset.provider}:${asset.tokenAddress}`}><span className="catalogue-row__asset"><i>{asset.symbol.slice(0, 1)}</i><span><strong>{asset.name}</strong><small>{asset.symbol}</small></span></span><span className="provider-tag">{asset.provider}</span><span className="catalogue-unavailable">{asset.contractVerified ? "Verified" : "Pending"}<small>{asset.decimals} decimals · BSC 56</small></span><span><span className="route-chip">{asset.stackable ? "Stackable" : "Unavailable"}</span></span><button className="catalogue-contract" onClick={() => setSelectedAsset(asset)}>{asset.tokenAddress.slice(0, 8)}…{asset.tokenAddress.slice(-5)} <Icon name="external" size={13} /></button></div>) : <div className="catalogue-empty"><div className="empty-emblem"><Icon name="search" size={22} /></div><h3>{catalogueState === "ready" ? "No verified assets yet" : "Catalogue unavailable"}</h3><p>{catalogueState === "ready" ? "No current provider assets match the selected filters." : "Connect to Binance Web3 and BSC RPC to check the provider catalogue."}</p><button className="text-button" onClick={() => { setQuery(""); setProvider("All providers"); setRetry((n) => n + 1); }}>Retry catalogue <Icon name="arrow" size={14} /></button></div>}<div className="table-footnote"><Icon name="shield" size={14} />Browsing metadata is not an allowlist or a trade route. Route status is shown only after a fresh executable quote is validated.</div></div>
  </div>{selectedAsset && <AssetDetail asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}</>;
}

function AssetDetail({ asset, onClose }: { asset: CatalogueAsset; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal asset-detail" role="dialog" aria-modal="true" aria-labelledby="asset-detail-title">
      <div className="modal__head"><div><div className="section-kicker">{asset.provider} · BNB Chain</div><h2 id="asset-detail-title">{asset.name}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close asset detail"><Icon name="close" /></button></div>
      <div className="modal__body"><div className="asset-detail__ticker"><span>{asset.symbol}</span><StatusPill tone={asset.contractVerified ? "green" : "orange"}>{asset.contractVerified ? "Contract verified" : "Onchain check pending"}</StatusPill></div>
        <div className="asset-detail__facts"><div><span>Underlying</span><strong>{asset.underlyingTicker}</strong></div><div><span>Token decimals</span><strong>{asset.decimals}</strong></div><div><span>Token/share ratio</span><strong>{asset.shareRatio ?? "Not provided"}</strong></div><div><span>Market status</span><strong>{asset.marketStatus ?? "Unavailable"}</strong></div></div>
        <div className="asset-detail__chart"><span>PRICE HISTORY</span><strong>Chart unavailable</strong><small>No verified BSC token candle source is available for this asset.</small></div>
        <div className="asset-detail__contract"><span>Contract address</span><a href={`https://bscscan.com/token/${asset.tokenAddress}`} target="_blank" rel="noreferrer">{asset.tokenAddress} <Icon name="external" size={13} /></a></div>
        <p className="asset-detail__notice">Trading is disabled until a fresh Binance route and its fee, signature, and settlement flow are validated.</p>
      </div>
      <div className="modal__foot"><button className="button button--quiet" onClick={onClose}>Close</button><button className="button button--blue" disabled title="No executable route is enabled">Trade unavailable</button></div>
    </section>
  </div>;
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
  return <div className="page"><PageHeader eyebrow="Your onchain positions" title="A portfolio with receipts." description="Exact quantities, provider labels, and defensible cost basis — pulled from the chain, not guessed from a database." /><div className="portfolio-banner"><div className="portfolio-banner__mark"><Icon name="wallet" size={23} /></div><div><h2>Connect a wallet to see your positions.</h2><p>Position balances and transaction history load only after wallet sign-in and verified BSC reads are available.</p></div><WalletAuthButton className="button button--ink" /></div><div className="portfolio-grid"><Metric label="Total value" value="—" note="Requires current market marks" /><Metric label="Cost basis" value="—" note="After wallet connection" /><Metric label="Open positions" value="—" note="Verified onchain only" /></div><div className="section-block transaction-empty"><div className="section-heading"><div><div className="section-kicker">Recent activity</div><h2>Activity appears after wallet connection.</h2></div><button className="text-button" disabled title="Connect a wallet to load verified activity">Export history <Icon name="external" size={14} /></button></div><p>Buy, sell, and redeem receipts will appear here with their transaction hashes and status.</p></div></div>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

function Profile() {
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) return <ProfileUnavailable />;
  return <AuthenticatedProfile />;
}

function ProfileUnavailable() {
  return <div className="page"><PageHeader eyebrow="Your public edge" title="Make your thesis legible." description="Profiles are saved only for a verified sign-in and appear in the public directory after the social database is configured." /><div className="profile-layout"><section className="profile-card"><div className="profile-avatar"><Icon name="profile" size={28} /></div><h2>Profile setup unavailable.</h2><p>Privy sign-in is not configured. No placeholder account will be created.</p><div className="profile-fields"><div><span>Username</span><strong>Unavailable</strong></div><div><span>Bio</span><strong>Unavailable</strong></div><div><span>X profile</span><strong>Optional</strong></div></div></section><ProfileBenefits /></div></div>;
}

function AuthenticatedProfile() {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [xProfileUrl, setXProfileUrl] = useState("");
  const [status, setStatus] = useState("Sign in to create or update your profile.");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready || !authenticated) return;
    let active = true;
    void (async () => {
      try {
        const token = await getAccessToken();
        if (!token) throw new Error("Your sign-in session is unavailable.");
        const response = await fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Profile lookup failed.");
        if (!active) return;
        if (result.profile) {
          setUsername(result.profile.username ?? "");
          setBio(result.profile.bio ?? "");
          setXProfileUrl(result.profile.x_profile_url ?? "");
          setStatus("Profile loaded from Supabase.");
        } else setStatus("Choose a username to create your profile.");
      } catch (error) {
        if (active) setStatus(error instanceof Error ? error.message : "Profile lookup failed.");
      }
    })();
    return () => { active = false; };
  }, [authenticated, getAccessToken, ready]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("Saving profile…");
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Your sign-in session is unavailable.");
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ username, bio, xProfileUrl }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Profile could not be saved.");
      setUsername(result.profile.username);
      setBio(result.profile.bio ?? "");
      setXProfileUrl(result.profile.x_profile_url ?? "");
      setStatus("Profile saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Profile could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="page"><PageHeader eyebrow="Your public edge" title="Make your thesis legible." description="Set up a profile with a verified sign-in. Your public details appear only after they are saved." />
    <div className="profile-layout"><section className="profile-card"><div className="profile-avatar"><Icon name="profile" size={28} /></div><h2>{authenticated ? "Your profile" : "Your profile is waiting."}</h2>
      {!ready ? <p>Checking sign-in…</p> : !authenticated ? <><p>Sign in to reserve a username and save your public profile.</p><button className="button button--blue" onClick={() => login()}><Icon name="profile" size={16} />Sign in</button></> : <form className="profile-form" onSubmit={saveProfile}>
        <label className="field-label">Username<input required minLength={3} maxLength={24} pattern="[a-zA-Z0-9_]{3,24}" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} /></label>
        <label className="field-label">Short bio<textarea maxLength={160} rows={3} value={bio} onChange={(event) => setBio(event.target.value)} /></label>
        <label className="field-label">X profile URL <span className="field-optional">Optional</span><input type="url" placeholder="https://x.com/username" value={xProfileUrl} onChange={(event) => setXProfileUrl(event.target.value)} /></label>
        <p role="status" className="profile-form__status">{status}</p>
        <button className="button button--blue" type="submit" disabled={busy || !ready}>{busy ? "Saving…" : "Save profile"}</button>
      </form>}
    </section><ProfileBenefits /></div>
  </div>;
}

function ProfileBenefits() {
  return <section className="profile-side"><div className="section-kicker">What you’ll get</div><h2>A home for your point of view.</h2><ul className="check-list"><li><Icon name="check" size={16} />Share immutable Stacks</li><li><Icon name="check" size={16} />Follow creators and themes</li><li><Icon name="check" size={16} />Show activity with receipts</li></ul><div className="profile-side__note"><Icon name="shield" size={15} /><span>Verified badges are never shown without actual verification.</span></div></section>;
}
