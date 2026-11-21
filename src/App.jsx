import { createContext, useContext, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

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
  deals: sampleDeals
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
    ) return parsed;
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

  const value = { state, createDeal, verifyReceipt, confirmDelivery, storageWarning };
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
  return (
    <header className="topbar">
      <Link className="brand" to="/" aria-label="SurePay home">
        <span className="brand-mark" aria-hidden="true">S</span>
        <span className="brand-copy">
          <strong>SurePay</strong>
          <small>Safe Local E-Commerce &amp; Escrow</small>
        </span>
      </Link>
      <a className="help-link" href="mailto:support@surepay.cm">Help</a>
    </header>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <Link to="/" className="nav-item"><span aria-hidden="true">⌂</span>Home</Link>
      <Link to="/create" className="nav-item"><span aria-hidden="true">＋</span>New deal</Link>
      <a href="mailto:support@surepay.cm" className="nav-item"><span aria-hidden="true">?</span>Support</a>
    </nav>
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
  const activeDeals = state.deals.filter((deal) => deal.status !== "Delivered");
  const trackedDeal = activeDeals.find((deal) => deal.status !== "Funds Locked") || activeDeals[0];

  return (
    <Shell>
      <main className="page home-page">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">YOUR ESCROW WALLET</p>
            <h1>Good day, Emmanuel <span aria-hidden="true">👋</span></h1>
          </div>
          <span className="verified-pill"><span aria-hidden="true">✓</span> {state.trustScore}% Verified</span>
        </section>

        <section className="balance-card" aria-label="Wallet balances">
          <div className="balance-top">
            <div>
              <p className="balance-label">In Escrow</p>
              <strong>{formatXaf(lockedBalance(state.deals))}</strong>
            </div>
            <span className="shield-icon" aria-hidden="true">⌑</span>
          </div>
          <div className="balance-divider" />
          <div className="balance-bottom">
            <div>
              <p className="balance-label">Available</p>
              <strong>{formatXaf(state.availableBalance)}</strong>
            </div>
            <span className="secure-label">Funds protected</span>
          </div>
        </section>

        <section className="quick-actions" aria-label="Escrow actions">
          <Link className="action-card primary-action" to="/create">
            <span className="action-icon" aria-hidden="true">＋</span>
            <strong>Create escrow deal</strong>
            <small>Lock funds safely</small>
          </Link>
          <button
            className="action-card"
            type="button"
            disabled={!trackedDeal}
            onClick={() => trackedDeal && navigate(`/tracker/${trackedDeal.id}`)}
          >
            <span className="action-icon delivery-icon" aria-hidden="true">↗</span>
            <strong>Track delivery</strong>
            <small>{trackedDeal ? "View a live shipment" : "Create a deal to get started"}</small>
          </button>
        </section>

        <section className="trust-card">
          <div className="trust-symbol" aria-hidden="true">✓</div>
          <div>
            <strong>{state.trustScore}% Verified Trader</strong>
            <p>Your completed deals build buyer and seller confidence.</p>
          </div>
          <span className="trust-chevron" aria-hidden="true">›</span>
        </section>

        <section className="deals-section" id="deals">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR ACTIVITY</p>
              <h2>Your escrow deals</h2>
            </div>
            <span className="deal-count">{activeDeals.length} active</span>
          </div>
          {state.deals.length === 0 ? (
            <div className="empty-state">
              <span aria-hidden="true">◇</span>
              <strong>No deals yet</strong>
              <p>Create a protected escrow to get started.</p>
              <Link className="button button-primary" to="/create">Create a deal</Link>
            </div>
          ) : (
            <div className="deal-list">
              {state.deals.map((deal) => (
                <Link className="deal-card" to={`/tracker/${deal.id}`} key={deal.id}>
                  <div className="deal-card-top">
                    <span className={`deal-symbol ${deal.status === "Delivered" ? "done" : ""}`} aria-hidden="true">
                      {deal.status === "Delivered" ? "✓" : "◇"}
                    </span>
                    <span className="deal-title-group">
                      <strong>{deal.title}</strong>
                      <small>{deal.origin} <span aria-hidden="true">→</span> {deal.destination}</small>
                    </span>
                    <strong className="deal-price">{formatXaf(deal.price)}</strong>
                  </div>
                  <div className="deal-card-bottom">
                    <span>{deal.agency}</span>
                    <span className={`status-chip ${deal.status === "Delivered" ? "status-done" : ""}`}>{deal.status}</span>
                  </div>
                  <span className="deal-id">#{deal.id}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
        <aside className="notice-card">
          <strong>Safe commerce, close to home.</strong>
          <p>SurePay keeps your payment in escrow while your goods travel between Cameroon’s cities.</p>
        </aside>
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
      agency: form.agency
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreProvider>
  );
}

export default App;
