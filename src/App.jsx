import React, { createContext, useContext, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";

const STORAGE_KEY = "surepay.demo.v1";
const agencies = ["Amour Mezam", "Moghamo", "Musango", "Local Rider"];

const sampleDeals = [
  {
    id: "SP-2026-BMD",
    title: "iPhone 13 Pro - 128GB",
    price: 380000,
    fee: 7600,
    phone: "+237 677 82 45 10",
    paymentMethod: "MTN MoMo",
    origin: "Bamenda",
    destination: "Douala",
    agency: "Amour Mezam",
    status: "In Transit",
    receiptVerified: true,
    verificationMode: "demo",
    agencyStamp: "Amour Mezam · Bamenda",
    waybill: "AM-BDA-94028-DX",
    createdAt: "2026-10-24T09:15:00.000Z"
  },
  {
    id: "SP-2026-DLA",
    title: "Wholesale Ankara Fabrics",
    price: 125000,
    fee: 2500,
    phone: "+237 690 45 12 33",
    paymentMethod: "Orange Money",
    origin: "Yaounde",
    destination: "Bafoussam",
    agency: "Moghamo",
    status: "Funds Locked",
    receiptVerified: false,
    agencyStamp: "",
    waybill: "",
    createdAt: "2026-10-22T11:30:00.000Z"
  },
  {
    id: "SP-2026-BUE",
    title: "HP EliteBook 840 G6",
    price: 190000,
    fee: 3800,
    phone: "+237 679 00 12 34",
    paymentMethod: "MTN MoMo",
    origin: "Buea",
    destination: "Douala",
    agency: "Musango",
    status: "Awaiting Inspection",
    receiptVerified: true,
    verificationMode: "demo",
    agencyStamp: "Musango · Buea",
    waybill: "MS-BUE-48210",
    createdAt: "2026-10-20T14:00:00.000Z"
  }
];

const initialState = {
  availableBalance: 980000,
  trustScore: 98,
  completedDeals: 48,
  deals: sampleDeals,
  disputes: []
};

const StoreContext = createContext(null);

function readStoredState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;
    const parsed = JSON.parse(saved);
    if (
      typeof parsed.availableBalance === "number" &&
      typeof parsed.trustScore === "number" &&
      Array.isArray(parsed.deals)
    ) {
      return {
        ...initialState,
        ...parsed,
        disputes: Array.isArray(parsed.disputes) ? parsed.disputes : []
      };
    }
    console.error("Saved SurePay demo data was invalid; using the sample ledger.");
  } catch (error) {
    console.error("Saved SurePay demo data could not be read; using the sample ledger.", error);
  }
  return initialState;
}

function StoreProvider({ children }) {
  const [state, setState] = useState(readStoredState);
  const [storageWarning, setStorageWarning] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageWarning(false);
    } catch (error) {
      console.error("SurePay could not save demo data to this device.", error);
      setStorageWarning(true);
    }
  }, [state]);

  const createDeal = (deal) => {
    if (deal.total > state.availableBalance) return { error: "Your available balance is not enough for this deal." };
    const created = {
      ...deal,
      id: `SP-2026-${crypto.randomUUID().slice(0, 4).toUpperCase()}`,
      status: "Funds Locked",
      receiptVerified: false,
      agencyStamp: "",
      waybill: "",
      createdAt: new Date().toISOString()
    };
    setState((current) => ({
      ...current,
      availableBalance: current.availableBalance - created.total,
      deals: [created, ...current.deals]
    }));
    return { deal: created };
  };

  const verifyReceipt = (dealId, receipt) => {
    setState((current) => ({
      ...current,
      deals: current.deals.map((deal) =>
        deal.id === dealId
          ? {
              ...deal,
              status: "In Transit",
              receiptVerified: true,
              agencyStamp: receipt.agencyStamp,
              waybill: receipt.waybillNumber,
              verificationMode: receipt.mode
            }
          : deal
      )
    }));
  };

  const confirmDelivery = (dealId) => {
    setState((current) => {
      const selected = current.deals.find((deal) => deal.id === dealId);
      if (!selected || selected.status === "Delivered") return current;
      if (!selected.receiptVerified) return current;
      return {
        ...current,
        trustScore: Math.min(100, current.trustScore + 1),
        deals: current.deals.map((deal) =>
          deal.id === dealId ? { ...deal, status: "Delivered" } : deal
        )
      };
    });
  };

  const submitDispute = (dealId, details) => {
    const dispute = {
      ...details,
      id: `DSP-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      dealId,
      status: "Under review",
      createdAt: new Date().toISOString()
    };
    setState((current) => ({
      ...current,
      disputes: [dispute, ...(current.disputes || [])],
      deals: current.deals.map((deal) =>
        deal.id === dealId ? { ...deal, status: "Dispute Under Review" } : deal
      )
    }));
    return dispute;
  };

  const resolveDispute = (disputeId) => {
    setState((current) => {
      const selected = (current.disputes || []).find((dispute) => dispute.id === disputeId);
      if (!selected || selected.status === "Resolved") return current;
      return {
        ...current,
        trustScore: Math.min(100, current.trustScore + 1),
        disputes: current.disputes.map((dispute) =>
          dispute.id === disputeId
            ? { ...dispute, status: "Resolved", resolvedAt: new Date().toISOString() }
            : dispute
        ),
        deals: current.deals.map((deal) =>
          deal.id === selected.dealId ? { ...deal, status: "Delivered" } : deal
        )
      };
    });
  };

  const value = {
    state,
    createDeal,
    verifyReceipt,
    confirmDelivery,
    submitDispute,
    resolveDispute,
    storageWarning
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider.");
  return context;
}

function formatXaf(amount) {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} XAF`;
}

function lockedBalance(deals) {
  return deals
    .filter((deal) => deal.status !== "Delivered")
    .reduce((total, deal) => total + deal.price, 0);
}

function Header() {
  const { pathname } = useLocation();

  return (
    <header className="topbar app-topbar">
      <Link className="brand" to="/" aria-label="SurePay home">
        <span className="brand-mark" aria-hidden="true">S</span>
        <span className="brand-copy">
          <strong>SurePay</strong>
          <small>{pathname === "/" ? "HOME DASHBOARD" : "SAFE LOCAL ESCROW"}</small>
        </span>
      </Link>
      <div className="topbar-actions">
        <Link className="icon-button help-icon-button" to="/help" aria-label="Help and Support">?</Link>
        <Link className="icon-button notification-button" to="/notifications" aria-label="Notifications">
          <span aria-hidden="true">♧</span>
          <i aria-hidden="true" />
        </Link>
        <Link className="profile-avatar" to="/profile" aria-label="Login and sign up">EM</Link>
      </div>
    </header>
  );
}

function BottomNav() {
  const { state } = useStore();
  const location = useLocation();
  const activeDeal = state.deals.find((deal) => deal.status !== "Delivered");
  const onHome = location.pathname === "/" && !location.hash;

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <Link to="/" className={`nav-item ${onHome ? "active" : ""}`} aria-current={onHome ? "page" : undefined}>
        <span aria-hidden="true">▦</span>Home
      </Link>
      <Link to="/#deals" className={`nav-item ${location.hash === "#deals" ? "active" : ""}`} aria-current={location.hash === "#deals" ? "page" : undefined}>
        <span aria-hidden="true">♢</span>Deals
      </Link>
      <Link to={activeDeal ? `/tracker/${activeDeal.id}` : "/"} className={`nav-item ${location.pathname.startsWith("/tracker/") ? "active" : ""}`} aria-current={location.pathname.startsWith("/tracker/") ? "page" : undefined}>
        <span aria-hidden="true">⇢</span>Track
      </Link>
      <Link to="/profile" className={`nav-item ${["/profile", "/login", "/signup"].includes(location.pathname) ? "active" : ""}`} aria-current={["/profile", "/login", "/signup"].includes(location.pathname) ? "page" : undefined}>
        <span aria-hidden="true">◉</span>Profile
      </Link>
    </nav>
  );
}

function Help() {
  return (
    <Shell>
      <main className="page">
        <Link to="/" className="back-link"><span aria-hidden="true">←</span>Back to Home</Link>
        <div className="page-title">
          <p className="eyebrow">SUREPAY SUPPORT</p>
          <h1>How can we help?</h1>
          <p>Find help with a protected purchase or contact our support team.</p>
        </div>
        <section className="notice-card">
          <strong>How escrow works</strong>
          <p>Your payment stays protected while the seller ships your item. Confirm delivery after you receive and inspect it.</p>
        </section>
        <section className="notice-card">
          <strong>Need help with a transaction?</strong>
          <p>Include your SurePay deal ID so our team can help you faster.</p>
          <a className="button button-primary full-button" href="mailto:support@surepay.cm">Email support@surepay.cm</a>
        </section>
      </main>
    </Shell>
  );
}

function Shell({ children }) {
  const { storageWarning } = useStore();
  return (
    <div className="app-shell">
      <Header />
      {storageWarning && <p className="storage-warning" role="status">Changes are only saved for this session on this device.</p>}
      {children}
      <footer className="site-footer">
        <span>Protected by SurePay</span>
        <span>Demo wallet · No real funds are moved</span>
      </footer>
      <BottomNav />
    </div>
  );
}

function Home() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [walletMessage, setWalletMessage] = useState("");
  const activeDeals = state.deals.filter((deal) => deal.status !== "Delivered");
  const transitDeals = activeDeals.filter((deal) => ["Funds Locked", "In Transit"].includes(deal.status));
  const actionDeals = activeDeals.filter((deal) => !["Funds Locked", "In Transit"].includes(deal.status));
  const trackedDeal = activeDeals.find((deal) => deal.status !== "Funds Locked") || activeDeals[0];
  const visibleDeals = filter === "history"
    ? state.deals.filter((deal) => deal.status === "Delivered")
    : filter === "transit"
      ? transitDeals
      : filter === "action"
        ? actionDeals
        : activeDeals;

  return (
    <Shell>
      <main className="page home-page">
        <section className="welcome-row">
          <div className="welcome-copy">
            <h1>Bonjour, Emmanuel <span aria-hidden="true">👋</span></h1>
            <p><span aria-hidden="true">⌖</span> Douala Commerce &amp; Logistics Hub</p>
          </div>
          <span className="verified-pill"><span aria-hidden="true">✿</span> {state.trustScore}% Verified</span>
        </section>

        <section className="home-stats" aria-label="Trader summary">
          <div><span>CNI STATUS</span><strong>♢ Level 2</strong></div>
          <div><span>COMPLETED</span><strong>{state.completedDeals || 48} Deals</strong></div>
          <div><span>DISPUTES</span><strong>{(state.disputes || []).filter((dispute) => dispute.status !== "Resolved").length} Active</strong></div>
        </section>

        <section className="balance-card home-balance-card" aria-label="Wallet balances">
          <div className="home-balance-heading">
            <span>♙ IN ESCROW (PROTECTED)</span>
            <strong>{activeDeals.length} Active Deals</strong>
          </div>
          <div className="home-balance-amount">{formatXaf(lockedBalance(state.deals))}</div>
          <div className="home-balance-footer">
            <div>
              <span>AVAILABLE BALANCE</span>
              <strong>{formatXaf(state.availableBalance)}</strong>
            </div>
            <div className="wallet-actions">
              <button type="button" onClick={() => setWalletMessage("Demo only — no mobile-money top-up was made.")}>＋ Top Up</button>
              <button type="button" onClick={() => setWalletMessage("Demo only — withdrawals are disabled.")}>▣ Withdraw</button>
            </div>
          </div>
          {walletMessage && <p className="wallet-message" role="status">{walletMessage}</p>}
        </section>

        <section className="quick-actions home-actions" aria-label="Escrow actions">
          <Link className="action-card primary-action" to="/create">
            <span className="action-icon" aria-hidden="true">♢</span>
            <strong>＋ New Escrow</strong>
            <small>Lock buyer funds safely</small>
          </Link>
          <button
            className="action-card"
            type="button"
            disabled={!trackedDeal}
            onClick={() => trackedDeal && navigate(`/tracker/${trackedDeal.id}`)}
          >
            <span className="action-icon delivery-icon" aria-hidden="true">▣</span>
            <strong>Track delivery</strong>
            <small>{trackedDeal ? "Scan waybill / SMS code" : "Create a deal to get started"}</small>
          </button>
        </section>

        <section className="trusted-hub">
          <div className="hub-heading">
            <span>TRUSTED HUB DIRECT</span>
            <span>Douala - Yaounde Axis</span>
          </div>
          <div className="hub-cards">
            <button type="button" onClick={() => navigate("/create")} className="hub-card" aria-label="Start an escrow with Mama Tcho Fabrics">
              <span className="hub-avatar">MT</span>
              <span><strong>Mama Tcho Fab...</strong><small>✿ 100% CNI</small></span>
            </button>
            <button type="button" onClick={() => navigate("/create")} className="hub-card" aria-label="Start an escrow with Akwa Tech Direct">
              <span className="hub-avatar blue">AT</span>
              <span><strong>Akwa Tech Direct</strong><small>✿ 84 Deals</small></span>
            </button>
          </div>
        </section>

        <section className="deals-section" id="deals">
          <div className="section-heading">
            <div>
              <h2>Active Escrow Deals</h2>
            </div>
            <button type="button" className="history-link" onClick={() => setFilter(filter === "history" ? "all" : "history")}>
              {filter === "history" ? "View Active Deals" : "View History"}
            </button>
          </div>
          <div className="deal-filters" role="group" aria-label="Filter escrow deals">
            <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All ({activeDeals.length})</button>
            <button type="button" aria-pressed={filter === "transit"} onClick={() => setFilter("transit")}>In Transit ({transitDeals.length})</button>
            <button type="button" aria-pressed={filter === "action"} onClick={() => setFilter("action")}>Action Required ({actionDeals.length})</button>
          </div>
          {visibleDeals.length === 0 ? (
            <div className="empty-state">
              <span aria-hidden="true">◇</span>
              <strong>{filter === "history" ? "No completed deals yet" : "No deals yet"}</strong>
              <p>{filter === "history" ? "Completed demo receipts will appear here." : "Create a protected escrow to get started."}</p>
              <Link className="button button-primary" to="/create">Create a deal</Link>
            </div>
          ) : (
            <div className="home-deal-list">
              {visibleDeals.map((deal, index) => (
                <article className="home-deal-card" key={deal.id}>
                  <Link className="home-deal-main" to={`/tracker/${deal.id}`}>
                    <span className={`product-thumb product-thumb-${index % 3}`} aria-hidden="true">{index === 0 ? "▧" : index === 1 ? "▥" : "▤"}</span>
                    <span className="home-deal-title">
                      <strong>{deal.title}</strong>
                      <small>{deal.origin} <b>➜</b> {deal.destination}</small>
                    </span>
                    <strong className="home-deal-price">{new Intl.NumberFormat("fr-FR").format(deal.price)}<small>XAF</small></strong>
                  </Link>
                  <div className="home-deal-agency">
                    <span>▣ {deal.agency}</span>
                    <strong>{deal.waybill ? `◷ ETA: ${deal.status === "In Transit" ? "Today, 4:30 PM" : deal.waybill}` : `#${deal.id}`}</strong>
                  </div>
                  <div className="home-deal-footer">
                    <span className={`deal-state ${deal.status === "In Transit" ? "blue" : deal.status === "Awaiting Inspection" ? "orange" : ""}`}>
                      {deal.status === "Awaiting Inspection" ? "♧ Awaiting Inspection" : deal.status === "Dispute Under Review" ? "Dispute in review" : deal.status === "Delivered" ? "Delivered" : "♙ Funds Locked & Protected"}
                    </span>
                    <Link to={`/tracker/${deal.id}`} className="deal-action">
                      {deal.status === "Awaiting Inspection" ? "Release Code" : deal.status === "Delivered" ? "View Receipt" : "Inspect & Release"} ›
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <aside className="framework-card">
          <strong>♧ SUREPAY DEMO ESCROW</strong>
          <p>Sample transactions only. This preview does not move real funds or provide a regulated settlement service.</p>
          <div><span>▣ Demo ledger</span><b>Cameroon</b></div>
        </aside>
      </main>
    </Shell>
  );
}

function Profile() {
  const { pathname } = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const isSignup = pathname === "/signup";

  const handleSubmit = (event) => {
    event.preventDefault();
    setPassword("");
    setMessage("Demo only: no account was created and no credentials were sent or saved.");
  };

  return (
    <Shell>
      <main className="page">
        <Link to="/" className="back-link"><span aria-hidden="true">←</span>Back to Home</Link>
        <div className="page-title">
          <p className="eyebrow">YOUR SUREPAY PROFILE</p>
          <h1>{isSignup ? "Create your demo profile" : "Welcome back"}</h1>
          <p>Sign up or log in to explore the SurePay demo. No real account is needed.</p>
        </div>
        <div className="auth-tabs" role="tablist" aria-label="Demo profile">
          <Link to="/login" role="tab" aria-selected={!isSignup}>Log in</Link>
          <Link to="/signup" role="tab" aria-selected={isSignup}>Sign up</Link>
        </div>
        <form className="form-card auth-card" onSubmit={handleSubmit}>
          {isSignup && (
            <label className="field">
              <span>Full name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
            </label>
          )}
          <label className="field">
            <span>Email address</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignup ? "new-password" : "current-password"} required />
          </label>
          <button type="submit" className="button button-primary full-button">{isSignup ? "Create demo profile" : "Log in to demo"}</button>
          <p className="form-footnote">Demo mode only — credentials are not sent to a server or stored.</p>
          {message && <p className="inline-message" role="status">{message}</p>}
        </form>
        <Link to="/help" className="support-text-link">Need help? Contact SurePay support</Link>
      </main>
    </Shell>
  );
}

function Notifications() {
  const { state } = useStore();
  const navigate = useNavigate();
  const latestDeal = state.deals.find((deal) => deal.status !== "Delivered");

  return (
    <Shell>
      <main className="page">
        <Link to="/" className="back-link"><span aria-hidden="true">←</span>Back to Home</Link>
        <div className="page-title">
          <p className="eyebrow">UPDATES</p>
          <h1>Notifications</h1>
          <p>Recent demo activity for your escrow deals.</p>
        </div>
        <div className="notification-list">
          {latestDeal ? (
            <button type="button" className="notification-card" onClick={() => navigate(`/tracker/${latestDeal.id}`)}>
              <span aria-hidden="true">▣</span>
              <span><strong>Escrow update</strong><small>{latestDeal.title} · {latestDeal.status}</small></span>
              <b>›</b>
            </button>
          ) : (
            <p className="empty-state">You’re all caught up.</p>
          )}
          <Link to="/create" className="notification-card">
            <span aria-hidden="true">＋</span>
            <span><strong>Ready for a new deal?</strong><small>Create a protected demo escrow.</small></span>
            <b>›</b>
          </Link>
        </div>
      </main>
    </Shell>
  );
}

function Dispute() {
  const { id } = useParams();
  const { state, submitDispute, resolveDispute } = useStore();
  const navigate = useNavigate();
  const deal = state.deals.find((item) => item.id === id);
  const [reason, setReason] = useState("Damaged or wrong item received");
  const [statement, setStatement] = useState("");
  const [resolution, setResolution] = useState("Partial refund / repair discount");
  const [evidence, setEvidence] = useState([]);
  const [caseId, setCaseId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!deal) return <Navigate to="/" replace />;

  const createCase = () => {
    if (!statement.trim()) {
      setError("Describe the issue so the demo mediator has context.");
      return null;
    }
    setError("");
    return submitDispute(deal.id, { reason, statement: statement.trim(), resolution, evidence });
  };

  const handleMediation = () => {
    if (caseId) {
      setMessage(`Demo only: no WhatsApp message was sent. Case #${caseId} is ready for mediation.`);
      return;
    }
    const dispute = createCase();
    if (!dispute) return;
    setCaseId(dispute.id);
    setMessage(`Demo only: WhatsApp was not opened. Case #${dispute.id} was saved for simulated mediation.`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const dispute = caseId
      ? state.disputes.find((item) => item.id === caseId)
      : createCase();
    if (!dispute) return;
    resolveDispute(dispute.id);
    navigate(`/resolution/${dispute.id}`);
  };

  return (
    <Shell>
      <main className="page dispute-page">
        <Link to={`/tracker/${deal.id}`} className="back-link"><span aria-hidden="true">←</span>Back to deal</Link>
        <div className="page-title">
          <p className="eyebrow">DISPUTE &amp; MEDIATION</p>
          <h1>Tell us what happened</h1>
          <p>Your demo escrow is frozen while you record the issue. No funds move in this preview.</p>
        </div>
        <section className="dispute-summary">
          <span className="status-chip">ESCROW FROZEN · DEMO</span>
          <strong>{formatXaf(deal.price)}</strong>
          <p>#{deal.id} · {deal.title}</p>
          <small>{deal.agency} · {deal.origin} to {deal.destination}</small>
        </section>
        <form className="form-card dispute-form" onSubmit={handleSubmit}>
          <fieldset className="field-group">
            <legend>1 · Select dispute reason</legend>
            {["Damaged or wrong item received", "Package missing at agency", "Waybill and item discrepancy", "Seller unresponsive / window breach"].map((item) => (
              <label className="choice-card" key={item}>
                <input type="radio" name="reason" value={item} checked={reason === item} onChange={() => setReason(item)} />
                <span><strong>{item}</strong><small>{item === reason ? "Selected for this demo case." : "Choose this if it best describes the issue."}</small></span>
              </label>
            ))}
          </fieldset>
          <label className="field">
            <span>2 · Inspection statement</span>
            <textarea value={statement} onChange={(event) => setStatement(event.target.value)} rows="4" placeholder="Describe the issue and the condition of the package." required />
          </label>
          <label className="field">
            <span>Attach demo evidence (optional)</span>
            <input type="file" accept="image/*,video/*" multiple onChange={(event) => setEvidence(Array.from(event.target.files || []).map((file) => file.name))} />
          </label>
          {evidence.length > 0 && <p className="file-list" role="status">{evidence.join(", ")}</p>}
          <fieldset className="field-group">
            <legend>3 · Requested resolution</legend>
            {["Full refund", "Partial refund / repair discount", "Return parcel to seller"].map((item) => (
              <label className="choice-card compact" key={item}>
                <input type="radio" name="resolution" value={item} checked={resolution === item} onChange={() => setResolution(item)} />
                <span><strong>{item}</strong></span>
              </label>
            ))}
          </fieldset>
          {error && <p className="form-error" role="alert">{error}</p>}
          <section className="mediation-card" id="mediation">
            <div><strong>24/7 SurePay Mediation Desk</strong><p>Simulate a three-way chat with buyer, seller, and mediator.</p></div>
            <button type="button" className="button button-primary full-button" onClick={handleMediation}>
              Open WhatsApp Mediation (Demo)
            </button>
            {message && <p className="inline-message" role="status">{message}</p>}
            {caseId && <Link className="button button-secondary full-button" to={`/resolution/${caseId}`}>View demo resolution receipt</Link>}
          </section>
          {!caseId && (
            <button type="submit" className="button button-secondary full-button">Submit Dispute Without WhatsApp</button>
          )}
          <p className="form-footnote">Demo only — no WhatsApp message, refund, or mobile-money payout is sent.</p>
        </form>
      </main>
    </Shell>
  );
}

function Resolution() {
  const { id } = useParams();
  const { state, resolveDispute } = useStore();
  const [message, setMessage] = useState("");
  const dispute = (state.disputes || []).find((item) => item.id === id);
  const deal = state.deals.find((item) => item.id === (dispute ? dispute.dealId : id));

  if (!deal) return <Navigate to="/" replace />;

  const buyerRefund = dispute && dispute.resolution === "Full refund"
    ? deal.price
    : dispute && dispute.resolution === "Return parcel to seller"
      ? deal.price
      : Math.min(45000, deal.price);
  const sellerSettlement = deal.price - buyerRefund;
  const isResolved = dispute?.status === "Resolved";
  const caseId = dispute?.id || "DSP-DEMO-4091";
  const receiptText = `SurePay demo settlement receipt\nCase #${caseId}\nDeal #${deal.id}\nBuyer refund: ${formatXaf(buyerRefund)}\nSeller settlement: ${formatXaf(sellerSettlement)}\nNo real payout was made.`;

  const downloadReceipt = () => {
    const url = URL.createObjectURL(new Blob([receiptText], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `surepay-demo-receipt-${caseId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(receiptText);
      setMessage("Demo receipt copied. No WhatsApp message was sent.");
    } catch (error) {
      console.error("SurePay could not copy the demo receipt.", error);
      setMessage("Demo only: copying is unavailable here; no WhatsApp message was sent.");
    }
  };

  return (
    <Shell>
      <main className="page resolution-page">
        <Link to="/" className="back-link"><span aria-hidden="true">←</span>Return to SurePay Home</Link>
        <section className="certificate-card">
          <span className="certificate-mark" aria-hidden="true">✓</span>
          <span className="certificate-kicker">DEMO RESOLUTION CERTIFICATE</span>
          <h1>{isResolved ? "Dispute Settled" : "Resolution Preview"}</h1>
          <p>Case #{caseId} · {isResolved ? "Simulated demo settlement" : "No payout has been made"}</p>
          <div className="audit-hash"><span>DEMO CASE RECORD</span><strong>{deal.id}</strong></div>
        </section>
        {!isResolved && dispute && (
          <button type="button" className="button button-primary full-button" onClick={() => resolveDispute(dispute.id)}>
            Simulate demo resolution
          </button>
        )}
        <section className="payout-card">
          <div className="payout-heading"><span>♙</span><div><small>DEMO ESCROW RELEASE</small><strong>{formatXaf(deal.price)}</strong></div><b>SIMULATED</b></div>
          <div className="payout-split">
            <div><span>Buyer · {deal.phone || "Demo wallet"}</span><strong>{formatXaf(buyerRefund)}</strong><small>Refund / repair allowance</small></div>
            <div><span>Seller · {deal.agency}</span><strong>{formatXaf(sellerSettlement)}</strong><small>Net goods settlement</small></div>
          </div>
          <p className="demo-disclaimer">No MTN MoMo or Orange Money payout occurred. This is a local demo receipt only.</p>
        </section>
        <section className="evidence-card">
          <h2>Case evidence record</h2>
          <p>{deal.title} · {deal.origin} → {deal.destination} · {deal.agency}</p>
          {dispute?.statement && <blockquote>{dispute.statement}</blockquote>}
          {dispute?.evidence?.length > 0 && <small>Evidence names: {dispute.evidence.join(", ")}</small>}
        </section>
        <div className="resolution-actions">
          <button type="button" className="button button-primary full-button" onClick={downloadReceipt}>↓ Download demo receipt</button>
          <button type="button" className="button button-primary full-button" onClick={copyReceipt}>♧ Copy receipt text (WhatsApp demo)</button>
          {message && <p className="inline-message" role="status">{message}</p>}
          <Link to="/" className="button button-secondary full-button">⌂ Return to SurePay Home</Link>
        </div>
      </main>
    </Shell>
  );
}

function CreateDeal() {
  const { createDeal } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    price: "",
    phone: "",
    paymentMethod: "MTN MoMo",
    origin: "",
    destination: "",
    agency: agencies[0]
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState("buying");
  const [inspectionHours, setInspectionHours] = useState(24);
  const price = Number(form.price) || 0;
  const fee = Math.round(price * 0.02);
  const total = price + fee;

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const choosePrice = (value) => setForm((current) => ({ ...current, price: String(value) }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    if (!form.title.trim() || !form.origin.trim() || !form.destination.trim()) {
      setError("Enter the item title, origin city, and destination city.");
      return;
    }
    if (!Number.isSafeInteger(price) || price <= 0) {
      setError("Enter a whole-number price greater than zero.");
      return;
    }
    if (!Number.isSafeInteger(total)) {
      setError("The deal total is too large. Enter a smaller price.");
      return;
    }
    if (!/^(?:\+?237)?6\d{8}$/.test(form.phone.replace(/[\s-]/g, ""))) {
      setError("Enter a valid Cameroon mobile money number, for example +237 677 123 456.");
      return;
    }
    if (form.origin.trim().toLowerCase() === form.destination.trim().toLowerCase()) {
      setError("Choose different origin and destination cities.");
      return;
    }
    setSubmitting(true);
    const result = createDeal({
      title: form.title.trim(),
      price,
      fee,
      total,
      phone: form.phone.trim(),
      paymentMethod: form.paymentMethod,
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      agency: form.agency,
      userRole,
      inspectionHours
    });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate(`/tracker/${result.deal.id}`);
  };

  return (
    <Shell>
      <main className="page">
        <Link to="/" className="back-link"><span aria-hidden="true">←</span> Dashboard</Link>
        <div className="page-title">
          <p className="eyebrow">BUY WITH CONFIDENCE</p>
          <h1>Create an escrow deal</h1>
          <p>Agree on the details. We’ll keep the payment safe until delivery.</p>
        </div>

        <section className="create-progress" aria-label="Deal setup progress">
          <strong>1 · Deal Details</strong><span>2 · Payment</span><span>3 · Escrow Lock</span>
          <div><i /></div>
        </section>
        <div className="role-switch" role="group" aria-label="Your role">
          <button type="button" aria-pressed={userRole === "buying"} onClick={() => setUserRole("buying")}>♙ I am Buying</button>
          <button type="button" aria-pressed={userRole === "selling"} onClick={() => setUserRole("selling")}>▤ I am Selling</button>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <label className="field">
            <span>Item title</span>
            <input name="title" value={form.title} onChange={update} placeholder="e.g. iPhone 13 Pro 128GB" minLength="2" maxLength="90" required />
          </label>

          <label className="field">
            <span>Price in XAF</span>
            <div className="input-with-suffix">
              <input name="price" type="number" inputMode="numeric" min="1" step="1" value={form.price} onChange={update} placeholder="250000" required />
              <span>XAF</span>
            </div>
          </label>
          <div className="price-presets" aria-label="Suggested amounts">
            {[50000, 150000, 250000, 500000].map((amount) => (
              <button type="button" onClick={() => choosePrice(amount)} key={amount}>{new Intl.NumberFormat("fr-FR").format(amount)}</button>
            ))}
          </div>

          <fieldset className="field-group">
            <legend>Mobile money details</legend>
            <div className="field-row">
              <label className="field">
                <span>Payment method</span>
                <select name="paymentMethod" value={form.paymentMethod} onChange={update}>
                  <option>MTN MoMo</option>
                  <option>Orange Money</option>
                </select>
              </label>
              <label className="field">
                <span>Mobile number</span>
                <input name="phone" type="tel" inputMode="tel" value={form.phone} onChange={update} placeholder="+237 677 123 456" autoComplete="tel" required />
              </label>
            </div>
          </fieldset>

          <fieldset className="field-group">
            <legend>Delivery route</legend>
            <div className="field-row">
              <label className="field">
                <span>Origin city</span>
                <input name="origin" value={form.origin} onChange={update} placeholder="Bamenda" maxLength="60" required />
              </label>
              <label className="field">
                <span>Destination city</span>
                <input name="destination" value={form.destination} onChange={update} placeholder="Douala" maxLength="60" required />
              </label>
            </div>
            <label className="field">
              <span>Transport agency</span>
              <select name="agency" value={form.agency} onChange={update}>
                {agencies.map((agency) => <option key={agency}>{agency}</option>)}
              </select>
            </label>
            <fieldset className="field-group">
              <legend>Inspection period</legend>
              <div className="inspection-options">
                {[6, 24, 48].map((hours) => (
                  <button type="button" key={hours} aria-pressed={inspectionHours === hours} onClick={() => setInspectionHours(hours)}>
                    <strong>{hours} Hours</strong><small>{hours === 6 ? "Fast handover" : hours === 24 ? "Electronics" : "Testing &amp; care"}</small>
                  </button>
                ))}
              </div>
            </fieldset>
          </fieldset>

          <section className="fee-summary" aria-live="polite">
            <div><span>Item price</span><strong>{formatXaf(price)}</strong></div>
            <div><span>SurePay protection fee (2%)</span><strong>{formatXaf(fee)}</strong></div>
            <div className="summary-total"><span>Total to lock</span><strong>{formatXaf(total)}</strong></div>
            <p>Funds stay in the demo escrow ledger until you confirm delivery.</p>
          </section>

          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary full-button" type="submit" disabled={submitting}>
            {submitting ? "Locking funds…" : `Lock funds safely · ${formatXaf(total)}`}
          </button>
          <p className="form-footnote">Demo wallet only — this prototype does not initiate a real mobile money payment.</p>
        </form>
      </main>
    </Shell>
  );
}

function timelineSteps(deal) {
  const transit = deal.receiptVerified || deal.status === "Delivered" || deal.status === "Awaiting Inspection";
  const delivered = deal.status === "Delivered";
  return [
    { title: "Deal created", detail: `Deal #${deal.id}`, complete: true },
    { title: "Funds locked", detail: `${formatXaf(deal.price)} held safely in escrow`, complete: true },
    {
      title: deal.status === "Awaiting Inspection"
        ? "Delivery arrived · Inspection"
        : transit
          ? "Receipt verified · In transit"
          : "Agency dispatch",
      detail: transit
        ? deal.status === "Awaiting Inspection"
          ? `Shipment from ${deal.agency} arrived at ${deal.destination}.`
          : `${deal.agencyStamp || deal.agency} · Waybill ${deal.waybill || "pending"}`
        : "Upload a dispatch receipt to verify the shipment.",
      complete: transit,
      active: !transit
    },
    {
      title: "Delivery confirmed",
      detail: delivered ? "Funds released to the seller in this demo ledger." : "Confirm after the item arrives and you have inspected it.",
      complete: delivered,
      active: transit && !delivered
    }
  ];
}

function Tracker() {
  const { id } = useParams();
  const { state, verifyReceipt, confirmDelivery } = useStore();
  const numericDeal = /^\d+$/.test(id) ? state.deals[Number(id) - 1] : null;
  const deal = state.deals.find((item) => item.id === id) || numericDeal;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [receiptMessage, setReceiptMessage] = useState("");

  if (!deal) return <Navigate to="/" replace />;

  const onReceiptSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setUploadError("");
    setReceiptMessage("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Choose an image of the dispatch receipt.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setUploadError("The receipt image must be smaller than 3 MB.");
      return;
    }
    setUploading(true);
    try {
      const imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = () => reject(new Error("The selected receipt image could not be read."));
        reader.readAsDataURL(file);
      });
      const response = await fetch("/api/verify-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, mimeType: file.type })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Receipt verification failed. Please try again.");
      verifyReceipt(deal.id, result);
      setReceiptMessage(
        result.mode === "demo"
          ? "Demo preview: no receipt was analyzed. Add GEMINI_API_KEY to enable real verification."
          : "Receipt analyzed successfully with Gemini."
      );
    } catch (error) {
      console.error("SurePay receipt verification failed.", error);
      setUploadError(error.message || "Receipt verification failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelivery = () => {
    if (!deliveryConfirmed || !deal.receiptVerified) return;
    confirmDelivery(deal.id);
  };

  return (
    <Shell>
      <main className="page tracker-page">
        <Link to="/" className="back-link"><span aria-hidden="true">←</span> Dashboard</Link>
        <section className="tracker-heading">
          <div className="tracker-heading-copy">
            <p className="eyebrow">LIVE ESCROW TRACKER</p>
            <h1>{deal.title}</h1>
            <p>{deal.origin} <span aria-hidden="true">→</span> {deal.destination} · {deal.agency}</p>
          </div>
          <span className={`status-chip prominent ${deal.status === "Delivered" ? "status-done" : ""}`}>{deal.status}</span>
        </section>

        <section className="tracker-summary">
          <div>
            <span className="summary-label">Protected in escrow</span>
            <strong>{formatXaf(deal.price)}</strong>
            <small>2% fee · {formatXaf(deal.fee)}</small>
          </div>
          <div className="summary-id">DEAL ID<strong>#{deal.id}</strong></div>
        </section>

        <section className="timeline-card">
          <div className="section-heading">
            <div><p className="eyebrow">SHIPMENT UPDATES</p><h2>Deal timeline</h2></div>
            <span className="timeline-counter">4 steps</span>
          </div>
          <ol className="timeline">
            {timelineSteps(deal).map((step, index) => (
              <li className={`timeline-step ${step.complete ? "complete" : ""} ${step.active ? "active" : ""}`} key={step.title}>
                <span className="timeline-marker" aria-hidden="true">{step.complete ? "✓" : index + 1}</span>
                <div className="timeline-copy">
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {deal.receiptVerified && (
          <section className="receipt-result" aria-live="polite">
            <div className="receipt-check" aria-hidden="true">✓</div>
            <div>
              <p className="eyebrow">{deal.verificationMode === "demo" ? "DEMO RECEIPT RESULT" : "AI RECEIPT VERIFICATION"}</p>
              <strong>{deal.agencyStamp || deal.agency}</strong>
              <p>Waybill / tracking number: <b>{deal.waybill || "Not detected"}</b></p>
              {deal.verificationMode === "demo" && <small>Preview data only. This image was not analyzed.</small>}
            </div>
          </section>
        )}

        {!deal.receiptVerified && deal.status !== "Delivered" && (
          <section className="upload-card">
            <div className="upload-heading">
              <span className="upload-icon" aria-hidden="true">▧</span>
              <div><h2>Verify dispatch receipt</h2><p>Take a photo or choose an image of the agency waybill.</p></div>
            </div>
            <label className={`button button-secondary full-button upload-button ${uploading ? "is-disabled" : ""}`}>
              {uploading ? "Checking receipt…" : "Upload dispatch receipt"}
              <input type="file" accept="image/*" capture="environment" onChange={onReceiptSelected} disabled={uploading} />
            </label>
            {uploadError && <p className="form-error" role="alert">{uploadError}</p>}
          </section>
        )}

        {receiptMessage && <p className="inline-message" role="status">{receiptMessage}</p>}

        <section className="delivery-card">
          <div className="delivery-title">
            <span className="delivery-check" aria-hidden="true">✓</span>
            <div><h2>Confirm delivery</h2><p>Release funds only after you’ve received and inspected the item.</p></div>
          </div>
          {deal.status !== "Delivered" ? (
            <>
              <label className="confirm-check">
                <input
                  type="checkbox"
                  checked={deliveryConfirmed}
                  disabled={!deal.receiptVerified}
                  onChange={(event) => setDeliveryConfirmed(event.target.checked)}
                />
                <span>I received the item and it matches our agreement.</span>
              </label>
              <button
                type="button"
                className="button button-primary full-button"
                disabled={!deal.receiptVerified || !deliveryConfirmed}
                onClick={handleDelivery}
              >
                Confirm delivery &amp; release {formatXaf(deal.price)}
              </button>
              {!deal.receiptVerified && <p className="form-footnote">Verify the agency dispatch receipt before confirming delivery.</p>}
            </>
          ) : (
            <p className="delivered-note">This deal is complete. Your trust score is now {state.trustScore}%.</p>
          )}
        </section>

        <section className="tracker-dispute-actions">
          <p>Need help with this shipment?</p>
          <Link to={`/dispute/${deal.id}`} className="button button-secondary full-button">Raise Dispute / Flag Issue</Link>
          <Link to={`/dispute/${deal.id}#mediation`} className="mediation-link">24/7 WhatsApp Mediation · Demo only</Link>
        </section>

        <section className="contact-card">
          <span aria-hidden="true">◉</span>
          <p>Questions about this deal? <a href="mailto:support@surepay.cm">Contact SurePay support</a></p>
        </section>
      </main>
    </Shell>
  );
}

function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateDeal />} />
        <Route path="/tracker/:id" element={<Tracker />} />
        <Route path="/dispute/:id" element={<Dispute />} />
        <Route path="/resolution/:id" element={<Resolution />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Profile />} />
        <Route path="/signup" element={<Profile />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreProvider>
  );
}

export default App;
