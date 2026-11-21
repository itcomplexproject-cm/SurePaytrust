import React, { createContext, useContext, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";

const STORAGE_KEY = "surepay.demo.v1";
const USER_STORAGE_KEY = "surepay_user";
const PREFERENCES_STORAGE_KEY = "surepay.preferences.v1";
const agencies = ["Amour Mezam", "Moghamo", "Musango", "Local Rider"];
const defaultUser = { name: "Emmanuel", phone: "+237 677 123 456", email: "emmanuel@surepay.cm" };
const defaultPreferences = { theme: "light", language: "en", biometricLock: false, smsAlerts: true };

const words = {
  en: {
    home: "Home", deals: "Deals", create: "Create", support: "Support", settings: "Settings",
    dashboard: "Home Dashboard", safeEscrow: "Safe Local Escrow", greeting: "Good day",
    available: "Available balance", inEscrow: "In Escrow", verifiedTrader: "Verified Trader",
    createDeal: "Create escrow deal", trackDelivery: "Track delivery", recentDeals: "Active Escrow Deals",
    viewAllDeals: "View all deals", dealsTitle: "Deals & Escrow Ledger", dealsSubtitle: "Every protected transaction, in one place.",
    totalActive: "Active deals", protectedTotal: "Protected in escrow", completed: "Completed deals",
    searchDeals: "Search item, deal ID, or transport agency", all: "All", fundsLocked: "Funds Locked",
    inTransit: "In Transit", delivered: "Delivered", disputed: "Disputed", openTracker: "Open Live Tracker →",
    emptyDeals: "No deals match your search", emptyDealsHint: "Try another status or search, or create a new escrow.",
    createNewDeal: "+ Create New Escrow Deal", settingsTitle: "Settings", profile: "Demo profile",
    appearance: "Appearance", lightMode: "Light mode", darkMode: "Dark mode", language: "Language",
    security: "Security & notifications", biometric: "Biometric / PIN lock", sms: "SMS escrow alerts",
    resetDemo: "Reset demo data", logout: "Log out", saved: "Settings saved on this device.",
    helpTitle: "Help & Safety Center", helpSubtitle: "Learn how SurePay keeps your demo transactions organized.",
    safetyGuide: "Escrow safety guide", mediation: "Open demo dispute mediation",
    signIn: "Sign in", register: "Create account", fullName: "Full name", phone: "Phone number",
    email: "Email address", password: "Password", continue: "Continue to SurePay",
    oneTap: "One-Tap Demo Login", authNote: "Demo access only. No real account or payment is created.",
    selectTheme: "Choose your preferred appearance.", chooseLanguage: "Choose your language.",
    resetDone: "Demo data has been reset.", logoutNote: "You have been logged out of the demo.",
    topUp: "Top Up", withdraw: "Withdraw", activeDeals: "Active deals", actionRequired: "Action Required",
    trustedHub: "TRUSTED HUB DIRECT", dealsAxis: "Douala - Yaounde Axis", cniStatus: "CNI STATUS",
    completedCount: "COMPLETED", disputesCount: "DISPUTES", levelTwo: "Level 2", noDisputes: "Active",
    allDeals: "All", demoNotice: "SUREPAY DEMO ESCROW", demoNoticeText: "Sample transactions only. This preview does not move real funds or provide a regulated settlement service.",
    inTransitStatus: "In Transit", awaitingInspection: "Awaiting Inspection", active: "Active",
    cniPlaceholder: "CNI STATUS", allActivities: "All activity", lockedProtected: "Funds Locked & Protected",
    noDeals: "No deals yet", createProtected: "Lock buyer funds safely", inspectRelease: "Inspect & Release",
    createNew: "Create a deal"
  },
  fr: {
    home: "Accueil", deals: "Offres", create: "Créer", support: "Aide", settings: "Paramètres",
    dashboard: "Tableau de bord", safeEscrow: "Séquestre local sécurisé", greeting: "Bonjour",
    available: "Solde disponible", inEscrow: "En séquestre", verifiedTrader: "Vendeur vérifié",
    createDeal: "Créer une offre séquestre", trackDelivery: "Suivre la livraison", recentDeals: "Offres actives",
    viewAllDeals: "Voir toutes les offres", dealsTitle: "Offres et registre séquestre", dealsSubtitle: "Toutes vos transactions protégées, au même endroit.",
    totalActive: "Offres actives", protectedTotal: "Montant protégé", completed: "Offres terminées",
    searchDeals: "Rechercher un article, un identifiant ou une agence", all: "Toutes", fundsLocked: "Fonds bloqués",
    inTransit: "En transit", delivered: "Livrée", disputed: "Litige", openTracker: "Ouvrir le suivi →",
    emptyDeals: "Aucune offre correspondante", emptyDealsHint: "Modifiez le filtre ou créez une nouvelle offre séquestre.",
    createNewDeal: "+ Créer une offre séquestre", settingsTitle: "Paramètres", profile: "Profil démo",
    appearance: "Apparence", lightMode: "Mode clair", darkMode: "Mode sombre", language: "Langue",
    security: "Sécurité et notifications", biometric: "Verrouillage biométrique / code PIN", sms: "Alertes séquestre par SMS",
    resetDemo: "Réinitialiser les données démo", logout: "Déconnexion", saved: "Paramètres enregistrés sur cet appareil.",
    helpTitle: "Centre d'aide et de sécurité", helpSubtitle: "Découvrez comment SurePay organise vos transactions démo.",
    safetyGuide: "Guide de sécurité du séquestre", mediation: "Ouvrir la médiation démo",
    signIn: "Se connecter", register: "Créer un compte", fullName: "Nom complet", phone: "Numéro de téléphone",
    email: "Adresse e-mail", password: "Mot de passe", continue: "Continuer avec SurePay",
    oneTap: "Connexion démo en un clic", authNote: "Accès démo uniquement. Aucun compte réel ni paiement n'est créé.",
    selectTheme: "Choisissez votre apparence préférée.", chooseLanguage: "Choisissez votre langue.",
    resetDone: "Les données démo ont été réinitialisées.", logoutNote: "Vous êtes déconnecté de la démo.",
    topUp: "Recharger", withdraw: "Retirer", activeDeals: "Offres actives", actionRequired: "Action requise",
    trustedHub: "RÉSEAU DE CONFIANCE", dealsAxis: "Axe Douala - Yaoundé", cniStatus: "STATUT CNI",
    completedCount: "TERMINÉES", disputesCount: "LITIGES", levelTwo: "Niveau 2", noDisputes: "Actifs",
    allDeals: "Toutes", demoNotice: "SÉQUESTRE DÉMO SUREPAY", demoNoticeText: "Transactions exemples uniquement. Aucun fonds réel n'est transféré et aucun service de règlement réglementé n'est fourni.",
    inTransitStatus: "En transit", awaitingInspection: "En attente d'inspection", active: "Actives",
    cniPlaceholder: "STATUT CNI", allActivities: "Toute l'activité", lockedProtected: "Fonds bloqués et protégés",
    noDeals: "Aucune offre", createProtected: "Bloquer les fonds de l'acheteur", inspectRelease: "Inspecter et libérer",
    createNew: "Créer une offre"
  }
};

const frenchPhrases = {
  "BUY WITH CONFIDENCE": "ACHETEZ EN TOUTE CONFIANCE",
  "Create an escrow deal": "Créer une offre séquestre",
  "Agree on the details. We’ll keep the payment safe until delivery.": "Convenez des détails. Nous protégeons le paiement jusqu'à la livraison.",
  "Deal Details": "Détails de l'offre",
  Payment: "Paiement",
  "Escrow Lock": "Blocage séquestre",
  "Your role": "Votre rôle",
  "I am Buying": "Je suis acheteur",
  "I am Selling": "Je suis vendeur",
  "Item title": "Nom de l'article",
  "Price in XAF": "Prix en XAF",
  "Suggested amounts": "Montants suggérés",
  "Mobile money details": "Détails Mobile Money",
  "Payment method": "Mode de paiement",
  "Mobile number": "Numéro Mobile Money",
  "Delivery route": "Itinéraire de livraison",
  "Origin city": "Ville de départ",
  "Destination city": "Ville d'arrivée",
  "Transport agency": "Agence de transport",
  "Inspection period": "Période d'inspection",
  "Fast handover": "Remise rapide",
  Electronics: "Appareils électroniques",
  "Testing & care": "Essais et précautions",
  "Item price": "Prix de l'article",
  "SurePay protection fee (2%)": "Frais de protection SurePay (2 %)",
  "Total to lock": "Total à bloquer",
  "Lock funds safely": "Bloquer les fonds",
  "LIVE ESCROW TRACKER": "SUIVI DU SÉQUESTRE",
  "Protected in escrow": "Protégé en séquestre",
  "SHIPMENT UPDATES": "SUIVI DE L'EXPÉDITION",
  "Deal timeline": "Étapes de l'offre",
  "Deal created": "Offre créée",
  "Funds locked": "Fonds bloqués",
  "Receipt verified · In transit": "Reçu vérifié · En transit",
  "Agency dispatch": "Expédition par l'agence",
  "Delivery confirmed": "Livraison confirmée",
  "Verify dispatch receipt": "Vérifier le reçu d'expédition",
  "Upload dispatch receipt": "Téléverser le reçu",
  "Confirm delivery": "Confirmer la livraison",
  "Raise Dispute / Flag Issue": "Signaler un litige",
  "DISPUTE & MEDIATION": "LITIGE ET MÉDIATION",
  "Tell us what happened": "Que s'est-il passé ?",
  "ESCROW FROZEN · DEMO": "SÉQUESTRE GELÉ · DÉMO",
  "1 · Select dispute reason": "1 · Motif du litige",
  "2 · Inspection statement": "2 · Description du problème",
  "3 · Requested resolution": "3 · Résolution souhaitée",
  "Open WhatsApp Mediation (Demo)": "Ouvrir la médiation WhatsApp (démo)",
  "Submit Dispute Without WhatsApp": "Envoyer le litige sans WhatsApp",
  "DEMO RESOLUTION CERTIFICATE": "CERTIFICAT DE RÉSOLUTION DÉMO",
  "Dispute Settled": "Litige résolu",
  "Resolution Preview": "Aperçu de la résolution",
  "↓ Download demo receipt": "↓ Télécharger le reçu démo",
  "♧ Copy receipt text (WhatsApp demo)": "♧ Copier le reçu (démo WhatsApp)",
  "UPDATES": "ACTUALITÉS",
  Notifications: "Notifications",
  "Recent demo activity for your escrow deals.": "Activité récente de vos offres séquestres démo.",
  "Ready for a new deal?": "Prêt pour une nouvelle offre ?",
  "Create a protected demo escrow.": "Créer une offre séquestre démo protégée.",
  "Need help with this shipment?": "Besoin d'aide pour cette expédition ?",
  "Email support@surepay.cm": "Écrire à support@surepay.cm",
  "Three-way dispute mediation": "Médiation à trois",
  "Safety guide": "Guide de sécurité"
};

function phraseFor(language, phrase) {
  return language === "fr" ? (frenchPhrases[phrase] || phrase) : phrase;
}

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

function readLocalValue(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`SurePay could not read ${key} from this device.`, error);
    return fallback;
  }
}

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
  const [preferences, setPreferences] = useState(() => {
    const saved = readLocalValue(PREFERENCES_STORAGE_KEY, {}) || {};
    return {
      ...defaultPreferences,
      ...saved,
      theme: saved.theme === "dark" ? "dark" : "light",
      language: saved.language === "fr" ? "fr" : "en"
    };
  });
  const [user, setUserState] = useState(() => {
    const saved = readLocalValue(USER_STORAGE_KEY, null);
    return saved && typeof saved.name === "string" ? saved : null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageWarning(false);
    } catch (error) {
      console.error("SurePay could not save demo data to this device.", error);
      setStorageWarning(true);
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.lang = preferences.language;
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error("SurePay could not save appearance preferences.", error);
    }
  }, [preferences]);

  const updatePreferences = (updates) => setPreferences((current) => ({ ...current, ...updates }));

  const setUser = (nextUser) => {
    setUserState(nextUser);
    try {
      if (nextUser) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
      else localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error("SurePay could not save the demo profile.", error);
    }
  };

  const resetDemoData = () => setState({ ...initialState, deals: sampleDeals, disputes: [] });

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
    storageWarning,
    preferences,
    updatePreferences,
    user,
    setUser,
    resetDemoData
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

function textFor(language, key) {
  return words[language]?.[key] || words.en[key] || key;
}

function statusLabel(status, language) {
  const labels = {
    "Funds Locked": textFor(language, "fundsLocked"),
    "In Transit": textFor(language, "inTransit"),
    Delivered: textFor(language, "delivered"),
    "Dispute Under Review": textFor(language, "disputed"),
    "Awaiting Inspection": textFor(language, "awaitingInspection")
  };
  return labels[status] || status;
}

function lockedBalance(deals) {
  return deals
    .filter((deal) => deal.status !== "Delivered")
    .reduce((total, deal) => total + deal.price, 0);
}

function Header() {
  const { pathname } = useLocation();
  const { preferences, user } = useStore();
  const t = (key) => textFor(preferences.language, key);
  const initials = (user?.name || defaultUser.name).split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <header className="topbar app-topbar">
      <Link className="brand" to="/" aria-label="SurePay home">
        <span className="brand-mark" aria-hidden="true">S</span>
        <span className="brand-copy">
          <strong>SurePay</strong>
          <small>{pathname === "/" ? t("dashboard").toUpperCase() : t("safeEscrow").toUpperCase()}</small>
        </span>
      </Link>
      <div className="topbar-actions">
        <Link className="icon-button help-icon-button" to="/help" aria-label={t("support")}>?</Link>
        <Link className="icon-button notification-button" to="/notifications" aria-label="Notifications">
          <span aria-hidden="true">♧</span>
          <i aria-hidden="true" />
        </Link>
        <Link className="profile-avatar" to="/settings" aria-label={t("settings")}>{initials}</Link>
      </div>
    </header>
  );
}

function BottomNav() {
  const { preferences } = useStore();
  const location = useLocation();
  const t = (key) => textFor(preferences.language, key);
  const onHome = location.pathname === "/";
  const onDeals = location.pathname === "/deals" || location.pathname.startsWith("/tracker/");
  const onCreate = location.pathname === "/create";
  const onSupport = location.pathname === "/help" || location.pathname.startsWith("/dispute/") || location.pathname.startsWith("/resolution/");
  const onSettings = ["/settings", "/profile"].includes(location.pathname);

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <Link to="/" className={`nav-item ${onHome ? "active" : ""}`} aria-current={onHome ? "page" : undefined}>
        <span aria-hidden="true">▦</span>{t("home")}
      </Link>
      <Link to="/deals" className={`nav-item ${onDeals ? "active" : ""}`} aria-current={onDeals ? "page" : undefined}>
        <span aria-hidden="true">♢</span>{t("deals")}
      </Link>
      <Link to="/create" className={`nav-item create-nav-item ${onCreate ? "active" : ""}`} aria-current={onCreate ? "page" : undefined} aria-label={t("create")}>
        <span aria-hidden="true">＋</span>{t("create")}
      </Link>
      <Link to="/help" className={`nav-item ${onSupport ? "active" : ""}`} aria-current={onSupport ? "page" : undefined}>
        <span aria-hidden="true">?</span>{t("support")}
      </Link>
      <Link to="/settings" className={`nav-item ${onSettings ? "active" : ""}`} aria-current={onSettings ? "page" : undefined}>
        <span aria-hidden="true">⚙</span>{t("settings")}
      </Link>
    </nav>
  );
}

function Help() {
  const { state, preferences } = useStore();
  const t = (key) => textFor(preferences.language, key);
  const latestDeal = state.deals.find((deal) => deal.status !== "Delivered");

  return (
    <Shell>
      <main className="page help-page">
        <Link to="/" className="back-link"><span aria-hidden="true">←</span>{t("home")}</Link>
        <div className="page-title">
          <p className="eyebrow">SUREPAY SUPPORT</p>
          <h1>{t("helpTitle")}</h1>
          <p>{t("helpSubtitle")}</p>
        </div>
        <section className="settings-card safety-guide">
          <div className="settings-section-title">
            <span aria-hidden="true">♢</span>
            <div><h2>{t("safetyGuide")}</h2><p>Keep every purchase protected from payment to delivery.</p></div>
          </div>
          <ol>
            <li>Agree on the item, price, route, and inspection period before locking funds.</li>
            <li>Verify the transport agency receipt and tracking details.</li>
            <li>Confirm delivery only after receiving and inspecting the item.</li>
          </ol>
        </section>
        <section className="mediation-card help-mediation">
          <div><strong>Three-way dispute mediation</strong><p>Buyer, seller, and a SurePay mediator can review a demo case together.</p></div>
          {latestDeal ? (
            <Link className="button button-primary full-button" to={`/dispute/${latestDeal.id}#mediation`}>{t("mediation")}</Link>
          ) : (
            <Link className="button button-primary full-button" to="/deals">{t("deals")}</Link>
          )}
        </section>
        <section className="notice-card">
          <strong>Need help with a transaction?</strong>
          <p>Include your SurePay deal ID so our team can help you faster.</p>
          <a className="button button-secondary full-button" href="mailto:support@surepay.cm">support@surepay.cm</a>
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
  const { state, preferences, user } = useStore();
  const navigate = useNavigate();
  const t = (key) => textFor(preferences.language, key);
  const [filter, setFilter] = useState("all");
  const [walletMessage, setWalletMessage] = useState("");
  const displayName = user?.name || defaultUser.name;
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
            <h1>{t("greeting")}, {displayName} <span aria-hidden="true">👋</span></h1>
            <p><span aria-hidden="true">⌖</span> Douala Commerce &amp; Logistics Hub</p>
          </div>
          <span className="verified-pill"><span aria-hidden="true">✿</span> {state.trustScore}% {t("verifiedTrader")}</span>
        </section>

        <section className="home-stats" aria-label={t("verifiedTrader")}>
          <div><span>{t("cniPlaceholder")}</span><strong>♢ {t("levelTwo")}</strong></div>
          <div><span>{t("completedCount")}</span><strong>{state.completedDeals || 48} {t("deals")}</strong></div>
          <div><span>{t("disputesCount")}</span><strong>{(state.disputes || []).filter((dispute) => dispute.status !== "Resolved").length} {t("noDisputes")}</strong></div>
        </section>

        <section className="balance-card home-balance-card" aria-label="Wallet balances">
          <div className="home-balance-heading">
            <span>♙ {t("inEscrow").toUpperCase()} (PROTECTED)</span>
            <strong>{activeDeals.length} {t("activeDeals")}</strong>
          </div>
          <div className="home-balance-amount">{formatXaf(lockedBalance(state.deals))}</div>
          <div className="home-balance-footer">
            <div>
              <span>{t("available").toUpperCase()}</span>
              <strong>{formatXaf(state.availableBalance)}</strong>
            </div>
            <div className="wallet-actions">
              <button type="button" onClick={() => setWalletMessage("Demo only — no mobile-money top-up was made.")}>＋ {t("topUp")}</button>
              <button type="button" onClick={() => setWalletMessage("Demo only — withdrawals are disabled.")}>▣ {t("withdraw")}</button>
            </div>
          </div>
          {walletMessage && <p className="wallet-message" role="status">{walletMessage}</p>}
        </section>

        <section className="quick-actions home-actions" aria-label="Escrow actions">
          <Link className="action-card primary-action" to="/create">
            <span className="action-icon" aria-hidden="true">♢</span>
            <strong>＋ {t("createDeal")}</strong>
            <small>{t("createProtected")}</small>
          </Link>
          <button
            className="action-card"
            type="button"
            disabled={!trackedDeal}
            onClick={() => trackedDeal && navigate(`/tracker/${trackedDeal.id}`)}
          >
            <span className="action-icon delivery-icon" aria-hidden="true">▣</span>
            <strong>{t("trackDelivery")}</strong>
            <small>{trackedDeal ? (preferences.language === "fr" ? "Scannez le bordereau / code SMS" : "Scan waybill / SMS code") : t("noDeals")}</small>
          </button>
        </section>

        <section className="trusted-hub">
          <div className="hub-heading">
            <span>{t("trustedHub")}</span>
            <span>{t("dealsAxis")}</span>
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
              <h2>{t("recentDeals")}</h2>
            </div>
            <Link to="/deals" className="history-link">{t("viewAllDeals")}</Link>
          </div>
          <div className="deal-filters" role="group" aria-label={t("recentDeals")}>
            <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>{t("allDeals")} ({activeDeals.length})</button>
            <button type="button" aria-pressed={filter === "transit"} onClick={() => setFilter("transit")}>{t("inTransitStatus")} ({transitDeals.length})</button>
            <button type="button" aria-pressed={filter === "action"} onClick={() => setFilter("action")}>{t("actionRequired")} ({actionDeals.length})</button>
          </div>
          {visibleDeals.length === 0 ? (
            <div className="empty-state">
              <span aria-hidden="true">◇</span>
              <strong>{t("noDeals")}</strong>
              <p>{filter === "history" ? "Completed demo receipts will appear here." : "Create a protected escrow to get started."}</p>
              <Link className="button button-primary" to="/create">{t("createNew")}</Link>
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
                      {statusLabel(deal.status, preferences.language)}
                    </span>
                    <Link to={`/tracker/${deal.id}`} className="deal-action">
                      {t("inspectRelease")} ›
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <aside className="framework-card">
          <strong>♧ {t("demoNotice")}</strong>
          <p>{t("demoNoticeText")}</p>
          <div><span>▣ Demo ledger</span><b>Cameroon</b></div>
        </aside>
      </main>
    </Shell>
  );
}

function Deals() {
  const { state, preferences } = useStore();
  const t = (key) => textFor(preferences.language, key);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const activeDeals = state.deals.filter((deal) => deal.status !== "Delivered");
  const statuses = [
    { key: "all", label: t("all") },
    { key: "Funds Locked", label: t("fundsLocked") },
    { key: "In Transit", label: t("inTransit") },
    { key: "Delivered", label: t("delivered") },
    { key: "Disputed", label: t("disputed") }
  ];
  const visibleDeals = state.deals.filter((deal) => {
    const matchesStatus = filter === "all" ||
      (filter === "Disputed" && deal.status === "Dispute Under Review") ||
      (filter === "In Transit" && ["In Transit", "Awaiting Inspection"].includes(deal.status)) ||
      deal.status === filter;
    const searchText = `${deal.title} ${deal.id} #${deal.id} ${deal.agency} ${deal.waybill || ""}`.toLowerCase();
    return matchesStatus && searchText.includes(query.trim().toLowerCase());
  });
  const completedDeals = state.completedDeals + state.deals.filter((deal) => deal.status === "Delivered").length;

  return (
    <Shell>
      <main className="page deals-page">
        <div className="page-title">
          <p className="eyebrow">SUREPAY LEDGER</p>
          <h1>{t("dealsTitle")}</h1>
          <p>{t("dealsSubtitle")}</p>
        </div>
        <section className="deals-metrics" aria-label={t("dealsTitle")}>
          <div><span>{t("totalActive")}</span><strong>{activeDeals.length}</strong></div>
          <div><span>{t("protectedTotal")}</span><strong>{formatXaf(lockedBalance(state.deals))}</strong></div>
          <div><span>{t("completed")}</span><strong>{completedDeals}</strong></div>
        </section>
        <label className="deal-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchDeals")}
            aria-label={t("searchDeals")}
          />
        </label>
        <div className="ledger-filters" role="group" aria-label={t("dealsTitle")}>
          {statuses.map((status) => (
            <button
              type="button"
              key={status.key}
              aria-pressed={filter === status.key}
              onClick={() => setFilter(status.key)}
            >
              {status.label}
            </button>
          ))}
        </div>
        {visibleDeals.length ? (
          <div className="ledger-list">
            {visibleDeals.map((deal) => (
              <article className="ledger-card" key={deal.id}>
                <div className="ledger-card-heading">
                  <div>
                    <p className="eyebrow">#{deal.id}</p>
                    <h2>{deal.title}</h2>
                  </div>
                  <strong className="ledger-price">{formatXaf(deal.price)}</strong>
                </div>
                <div className="ledger-route">{deal.origin} <span aria-hidden="true">→</span> {deal.destination}</div>
                <div className="ledger-badges">
                  <span className="agency-badge">▣ {deal.agency}</span>
                  <span className={`ledger-status status-${deal.status.toLowerCase().replaceAll(" ", "-")}`}>
                    {statusLabel(deal.status, preferences.language)}
                  </span>
                </div>
                {deal.receiptVerified && (
                  <span className={`verification-badge ${deal.verificationMode === "demo" ? "demo" : ""}`}>
                    ✓ {deal.verificationMode === "demo" ? "Receipt Verified · Demo" : "Gemini AI Verified"}
                  </span>
                )}
                <Link className="button button-primary full-button ledger-tracker-link" to={`/tracker/${deal.id}`}>
                  {t("openTracker")}
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <section className="ledger-empty">
            <span aria-hidden="true">◇</span>
            <h2>{t("emptyDeals")}</h2>
            <p>{t("emptyDealsHint")}</p>
            <Link to="/create" className="button button-primary full-button">{t("createNewDeal")}</Link>
          </section>
        )}
      </main>
    </Shell>
  );
}

function Settings() {
  const { preferences, updatePreferences, user, setUser, resetDemoData, state } = useStore();
  const navigate = useNavigate();
  const t = (key) => textFor(preferences.language, key);
  const profile = user || defaultUser;
  const [message, setMessage] = useState("");

  const updatePreference = (key, value) => {
    updatePreferences({ [key]: value });
    setMessage(t("saved"));
  };

  const handleReset = () => {
    resetDemoData();
    setMessage(t("resetDone"));
  };

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  return (
    <Shell>
      <main className="page settings-page">
        <div className="page-title">
          <p className="eyebrow">SUREPAY ACCOUNT</p>
          <h1>{t("settingsTitle")}</h1>
          <p>{preferences.language === "fr" ? "Gérez votre profil et vos préférences SurePay." : "Manage your SurePay profile and preferences."}</p>
        </div>
        <section className="settings-profile">
          <div className="settings-avatar">{profile.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</div>
          <div className="settings-profile-copy">
            <strong>{profile.name}</strong>
            <span>{profile.phone || defaultUser.phone}</span>
            <small>{profile.email || defaultUser.email}</small>
          </div>
          <span className="gold-verified">✦ {textFor(preferences.language, "verifiedTrader")} · {state.trustScore}%</span>
        </section>
        <section className="settings-card">
          <div className="settings-section-title">
            <span aria-hidden="true">◐</span>
            <div><h2>{t("appearance")}</h2><p>{t("selectTheme")}</p></div>
          </div>
          <div className="settings-choice-row" role="group" aria-label={t("appearance")}>
            {["light", "dark"].map((theme) => (
              <button
                type="button"
                key={theme}
                aria-pressed={preferences.theme === theme}
                onClick={() => updatePreference("theme", theme)}
              >
                {theme === "light" ? "☀ " + t("lightMode") : "☾ " + t("darkMode")}
              </button>
            ))}
          </div>
        </section>
        <section className="settings-card">
          <div className="settings-section-title">
            <span aria-hidden="true">文</span>
            <div><h2>{t("language")}</h2><p>{t("chooseLanguage")}</p></div>
          </div>
          <div className="settings-choice-row" role="group" aria-label={t("language")}>
            <button type="button" aria-pressed={preferences.language === "en"} onClick={() => updatePreference("language", "en")}>English</button>
            <button type="button" aria-pressed={preferences.language === "fr"} onClick={() => updatePreference("language", "fr")}>Français</button>
          </div>
        </section>
        <section className="settings-card">
          <div className="settings-section-title">
            <span aria-hidden="true">♢</span>
            <div><h2>{t("security")}</h2><p>Demo-only preferences for this device.</p></div>
          </div>
          <label className="settings-toggle">
            <span><strong>{t("biometric")}</strong><small>Use a local demo lock preference.</small></span>
            <input type="checkbox" role="switch" checked={preferences.biometricLock} onChange={(event) => updatePreference("biometricLock", event.target.checked)} />
          </label>
          <label className="settings-toggle">
            <span><strong>{t("sms")}</strong><small>MTN MoMo and Orange Money activity reminders.</small></span>
            <input type="checkbox" role="switch" checked={preferences.smsAlerts} onChange={(event) => updatePreference("smsAlerts", event.target.checked)} />
          </label>
        </section>
        {message && <p className="inline-message" role="status">{message}</p>}
        <section className="settings-actions">
          <button type="button" className="button button-secondary full-button" onClick={handleReset}>{t("resetDemo")}</button>
          <button type="button" className="button button-danger full-button" onClick={handleLogout}>{t("logout")}</button>
        </section>
      </main>
    </Shell>
  );
}

function deriveDisplayName(email) {
  const username = email.split("@")[0] || "Emmanuel";
  const name = username.replace(/[._+-]+/g, " ").trim();
  return name.replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Emmanuel";
}

function Auth() {
  const { pathname } = useLocation();
  const { setUser, preferences } = useStore();
  const navigate = useNavigate();
  const t = (key) => textFor(preferences.language, key);
  const isRegister = pathname === "/register" || pathname === "/signup";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = (nextUser) => {
    setUser(nextUser);
    navigate("/");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    signIn({
      name: name.trim() || deriveDisplayName(email),
      phone: phone.trim() || defaultUser.phone,
      email: email.trim()
    });
  };

  return (
    <Shell>
      <main className="page auth-page">
        <div className="auth-brand-card">
          <span className="auth-brand-mark">S</span>
          <span className="gold-verified">✦ SAFE DEMO ACCESS</span>
          <h1>{isRegister ? t("register") : t("signIn")}</h1>
          <p>{t("authNote")}</p>
        </div>
        <div className="auth-tabs" role="tablist" aria-label="SurePay demo access">
          <Link to="/login" role="tab" aria-selected={!isRegister}>{t("signIn")}</Link>
          <Link to="/register" role="tab" aria-selected={isRegister}>{t("register")}</Link>
        </div>
        <form className="form-card auth-card" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label className="field"><span>{t("fullName")}</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label>
              <label className="field"><span>{t("phone")}</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+237 6XX XXX XXX" autoComplete="tel" required /></label>
            </>
          )}
          <label className="field"><span>{t("email")}</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label className="field"><span>{t("password")}</span><input type="password" minLength="1" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegister ? "new-password" : "current-password"} required /></label>
          <button type="submit" className="button button-primary full-button">{t("continue")}</button>
        </form>
        <button type="button" className="button button-gold full-button" onClick={() => signIn(defaultUser)}>{t("oneTap")}</button>
        <p className="form-footnote auth-note">{t("authNote")}</p>
      </main>
    </Shell>
  );
}

function Notifications() {
  const { state, preferences } = useStore();
  const navigate = useNavigate();
  const t = (key) => textFor(preferences.language, key);
  const tx = (value) => phraseFor(preferences.language, value);
  const latestDeal = state.deals.find((deal) => deal.status !== "Delivered");

  return (
    <Shell>
      <main className="page">
        <Link to="/" className="back-link"><span aria-hidden="true">←</span>{t("home")}</Link>
        <div className="page-title">
          <p className="eyebrow">{tx("UPDATES")}</p>
          <h1>{tx("Notifications")}</h1>
          <p>{tx("Recent demo activity for your escrow deals.")}</p>
        </div>
        <div className="notification-list">
          {latestDeal ? (
            <button type="button" className="notification-card" onClick={() => navigate(`/tracker/${latestDeal.id}`)}>
              <span aria-hidden="true">▣</span>
              <span><strong>{preferences.language === "fr" ? "Mise à jour séquestre" : "Escrow update"}</strong><small>{latestDeal.title} · {statusLabel(latestDeal.status, preferences.language)}</small></span>
              <b>›</b>
            </button>
          ) : (
            <p className="empty-state">You’re all caught up.</p>
          )}
          <Link to="/create" className="notification-card">
            <span aria-hidden="true">＋</span>
            <span><strong>{tx("Ready for a new deal?")}</strong><small>{tx("Create a protected demo escrow.")}</small></span>
            <b>›</b>
          </Link>
        </div>
      </main>
    </Shell>
  );
}

function Dispute() {
  const { id } = useParams();
  const { state, submitDispute, resolveDispute, preferences } = useStore();
  const navigate = useNavigate();
  const tx = (value) => phraseFor(preferences.language, value);
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
        <Link to={`/tracker/${deal.id}`} className="back-link"><span aria-hidden="true">←</span>{preferences.language === "fr" ? "Retour à l'offre" : "Back to deal"}</Link>
        <div className="page-title">
          <p className="eyebrow">{tx("DISPUTE & MEDIATION")}</p>
          <h1>{tx("Tell us what happened")}</h1>
          <p>{preferences.language === "fr" ? "Votre séquestre démo est gelé pendant le signalement. Aucun fonds ne bouge." : "Your demo escrow is frozen while you record the issue. No funds move in this preview."}</p>
        </div>
        <section className="dispute-summary">
          <span className="status-chip">{tx("ESCROW FROZEN · DEMO")}</span>
          <strong>{formatXaf(deal.price)}</strong>
          <p>#{deal.id} · {deal.title}</p>
          <small>{deal.agency} · {deal.origin} to {deal.destination}</small>
        </section>
        <form className="form-card dispute-form" onSubmit={handleSubmit}>
          <fieldset className="field-group">
            <legend>{tx("1 · Select dispute reason")}</legend>
            {["Damaged or wrong item received", "Package missing at agency", "Waybill and item discrepancy", "Seller unresponsive / window breach"].map((item) => (
              <label className="choice-card" key={item}>
                <input type="radio" name="reason" value={item} checked={reason === item} onChange={() => setReason(item)} />
                <span><strong>{item}</strong><small>{item === reason ? "Selected for this demo case." : "Choose this if it best describes the issue."}</small></span>
              </label>
            ))}
          </fieldset>
          <label className="field">
            <span>{tx("2 · Inspection statement")}</span>
            <textarea value={statement} onChange={(event) => setStatement(event.target.value)} rows="4" placeholder="Describe the issue and the condition of the package." required />
          </label>
          <label className="field">
            <span>Attach demo evidence (optional)</span>
            <input type="file" accept="image/*,video/*" multiple onChange={(event) => setEvidence(Array.from(event.target.files || []).map((file) => file.name))} />
          </label>
          {evidence.length > 0 && <p className="file-list" role="status">{evidence.join(", ")}</p>}
          <fieldset className="field-group">
            <legend>{tx("3 · Requested resolution")}</legend>
            {["Full refund", "Partial refund / repair discount", "Return parcel to seller"].map((item) => (
              <label className="choice-card compact" key={item}>
                <input type="radio" name="resolution" value={item} checked={resolution === item} onChange={() => setResolution(item)} />
                <span><strong>{item}</strong></span>
              </label>
            ))}
          </fieldset>
          {error && <p className="form-error" role="alert">{error}</p>}
          <section className="mediation-card" id="mediation">
            <div><strong>24/7 SurePay Mediation Desk</strong><p>{preferences.language === "fr" ? "Simulez une conversation entre l'acheteur, le vendeur et le médiateur." : "Simulate a three-way chat with buyer, seller, and mediator."}</p></div>
            <button type="button" className="button button-primary full-button" onClick={handleMediation}>
              {tx("Open WhatsApp Mediation (Demo)")}
            </button>
            {message && <p className="inline-message" role="status">{message}</p>}
            {caseId && <Link className="button button-secondary full-button" to={`/resolution/${caseId}`}>View demo resolution receipt</Link>}
          </section>
          {!caseId && (
            <button type="submit" className="button button-secondary full-button">{tx("Submit Dispute Without WhatsApp")}</button>
          )}
          <p className="form-footnote">Demo only — no WhatsApp message, refund, or mobile-money payout is sent.</p>
        </form>
      </main>
    </Shell>
  );
}

function Resolution() {
  const { id } = useParams();
  const { state, resolveDispute, preferences } = useStore();
  const tx = (value) => phraseFor(preferences.language, value);
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
        <Link to="/" className="back-link"><span aria-hidden="true">←</span>{preferences.language === "fr" ? "Retour à SurePay" : "Return to SurePay Home"}</Link>
        <section className="certificate-card">
          <span className="certificate-mark" aria-hidden="true">✓</span>
          <span className="certificate-kicker">{tx("DEMO RESOLUTION CERTIFICATE")}</span>
          <h1>{isResolved ? tx("Dispute Settled") : tx("Resolution Preview")}</h1>
          <p>{preferences.language === "fr" ? `Dossier #${caseId} · ${isResolved ? "Règlement simulé" : "Aucun paiement effectué"}` : `Case #${caseId} · ${isResolved ? "Simulated demo settlement" : "No payout has been made"}`}</p>
          <div className="audit-hash"><span>DEMO CASE RECORD</span><strong>{deal.id}</strong></div>
        </section>
        {!isResolved && dispute && (
          <button type="button" className="button button-primary full-button" onClick={() => resolveDispute(dispute.id)}>
            {preferences.language === "fr" ? "Simuler la résolution démo" : "Simulate demo resolution"}
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
          <button type="button" className="button button-primary full-button" onClick={downloadReceipt}>{tx("↓ Download demo receipt")}</button>
          <button type="button" className="button button-primary full-button" onClick={copyReceipt}>{tx("♧ Copy receipt text (WhatsApp demo)")}</button>
          {message && <p className="inline-message" role="status">{message}</p>}
          <Link to="/" className="button button-secondary full-button">⌂ Return to SurePay Home</Link>
        </div>
      </main>
    </Shell>
  );
}

function CreateDeal() {
  const { createDeal, preferences } = useStore();
  const navigate = useNavigate();
  const tx = (value) => phraseFor(preferences.language, value);
  const t = (key) => textFor(preferences.language, key);
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
        <Link to="/" className="back-link"><span aria-hidden="true">←</span>{t("home")}</Link>
        <div className="page-title">
          <p className="eyebrow">{tx("BUY WITH CONFIDENCE")}</p>
          <h1>{tx("Create an escrow deal")}</h1>
          <p>{tx("Agree on the details. We’ll keep the payment safe until delivery.")}</p>
        </div>

        <section className="create-progress" aria-label={tx("Deal Details")}>
          <strong>1 · {tx("Deal Details")}</strong><span>2 · {tx("Payment")}</span><span>3 · {tx("Escrow Lock")}</span>
          <div><i /></div>
        </section>
        <div className="role-switch" role="group" aria-label={tx("Your role")}>
          <button type="button" aria-pressed={userRole === "buying"} onClick={() => setUserRole("buying")}>♙ {tx("I am Buying")}</button>
          <button type="button" aria-pressed={userRole === "selling"} onClick={() => setUserRole("selling")}>▤ {tx("I am Selling")}</button>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <label className="field">
            <span>{tx("Item title")}</span>
            <input name="title" value={form.title} onChange={update} placeholder="e.g. iPhone 13 Pro 128GB" minLength="2" maxLength="90" required />
          </label>

          <label className="field">
            <span>{tx("Price in XAF")}</span>
            <div className="input-with-suffix">
              <input name="price" type="number" inputMode="numeric" min="1" step="1" value={form.price} onChange={update} placeholder="250000" required />
              <span>XAF</span>
            </div>
          </label>
          <div className="price-presets" aria-label={tx("Suggested amounts")}>
            {[50000, 150000, 250000, 500000].map((amount) => (
              <button type="button" onClick={() => choosePrice(amount)} key={amount}>{new Intl.NumberFormat("fr-FR").format(amount)}</button>
            ))}
          </div>

          <fieldset className="field-group">
            <legend>{tx("Mobile money details")}</legend>
            <div className="field-row">
              <label className="field">
                <span>{tx("Payment method")}</span>
                <select name="paymentMethod" value={form.paymentMethod} onChange={update}>
                  <option>MTN MoMo</option>
                  <option>Orange Money</option>
                </select>
              </label>
              <label className="field">
                <span>{tx("Mobile number")}</span>
                <input name="phone" type="tel" inputMode="tel" value={form.phone} onChange={update} placeholder="+237 677 123 456" autoComplete="tel" required />
              </label>
            </div>
          </fieldset>

          <fieldset className="field-group">
            <legend>{tx("Delivery route")}</legend>
            <div className="field-row">
              <label className="field">
                <span>{tx("Origin city")}</span>
                <input name="origin" value={form.origin} onChange={update} placeholder="Bamenda" maxLength="60" required />
              </label>
              <label className="field">
                <span>{tx("Destination city")}</span>
                <input name="destination" value={form.destination} onChange={update} placeholder="Douala" maxLength="60" required />
              </label>
            </div>
            <label className="field">
              <span>{tx("Transport agency")}</span>
              <select name="agency" value={form.agency} onChange={update}>
                {agencies.map((agency) => <option key={agency}>{agency}</option>)}
              </select>
            </label>
            <fieldset className="field-group">
              <legend>{tx("Inspection period")}</legend>
              <div className="inspection-options">
                {[6, 24, 48].map((hours) => (
                  <button type="button" key={hours} aria-pressed={inspectionHours === hours} onClick={() => setInspectionHours(hours)}>
                    <strong>{hours} Hours</strong><small>{tx(hours === 6 ? "Fast handover" : hours === 24 ? "Electronics" : "Testing & care")}</small>
                  </button>
                ))}
              </div>
            </fieldset>
          </fieldset>

          <section className="fee-summary" aria-live="polite">
            <div><span>{tx("Item price")}</span><strong>{formatXaf(price)}</strong></div>
            <div><span>{tx("SurePay protection fee (2%)")}</span><strong>{formatXaf(fee)}</strong></div>
            <div className="summary-total"><span>{tx("Total to lock")}</span><strong>{formatXaf(total)}</strong></div>
            <p>Funds stay in the demo escrow ledger until you confirm delivery.</p>
          </section>

          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary full-button" type="submit" disabled={submitting}>
            {submitting ? (preferences.language === "fr" ? "Blocage en cours…" : "Locking funds…") : `${tx("Lock funds safely")} · ${formatXaf(total)}`}
          </button>
          <p className="form-footnote">Demo wallet only — this prototype does not initiate a real mobile money payment.</p>
        </form>
      </main>
    </Shell>
  );
}

function timelineSteps(deal, language) {
  const tx = (value) => phraseFor(language, value);
  const transit = deal.receiptVerified || deal.status === "Delivered" || deal.status === "Awaiting Inspection";
  const delivered = deal.status === "Delivered";
  return [
    { title: tx("Deal created"), detail: `Deal #${deal.id}`, complete: true },
    { title: tx("Funds locked"), detail: `${formatXaf(deal.price)} held safely in escrow`, complete: true },
    {
      title: deal.status === "Awaiting Inspection"
        ? (language === "fr" ? "Livraison reçue · Inspection" : "Delivery arrived · Inspection")
        : transit
          ? tx("Receipt verified · In transit")
          : tx("Agency dispatch"),
      detail: transit
        ? deal.status === "Awaiting Inspection"
          ? `Shipment from ${deal.agency} arrived at ${deal.destination}.`
          : `${deal.agencyStamp || deal.agency} · Waybill ${deal.waybill || "pending"}`
        : "Upload a dispatch receipt to verify the shipment.",
      complete: transit,
      active: !transit
    },
    {
      title: tx("Delivery confirmed"),
      detail: delivered
        ? (language === "fr" ? "Fonds remis au vendeur dans ce registre démo." : "Funds released to the seller in this demo ledger.")
        : (language === "fr" ? "Confirmez après réception et inspection de l'article." : "Confirm after the item arrives and you have inspected it."),
      complete: delivered,
      active: transit && !delivered
    }
  ];
}

function Tracker() {
  const { id } = useParams();
  const { state, verifyReceipt, confirmDelivery, preferences } = useStore();
  const numericDeal = /^\d+$/.test(id) ? state.deals[Number(id) - 1] : null;
  const deal = state.deals.find((item) => item.id === id) || numericDeal;
  const tx = (value) => phraseFor(preferences.language, value);
  const t = (key) => textFor(preferences.language, key);
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
        <Link to="/" className="back-link"><span aria-hidden="true">←</span>{t("home")}</Link>
        <section className="tracker-heading">
          <div className="tracker-heading-copy">
            <p className="eyebrow">{tx("LIVE ESCROW TRACKER")}</p>
            <h1>{deal.title}</h1>
            <p>{deal.origin} <span aria-hidden="true">→</span> {deal.destination} · {deal.agency}</p>
          </div>
          <span className={`status-chip prominent ${deal.status === "Delivered" ? "status-done" : ""}`}>{statusLabel(deal.status, preferences.language)}</span>
        </section>

        <section className="tracker-summary">
          <div>
            <span className="summary-label">{tx("Protected in escrow")}</span>
            <strong>{formatXaf(deal.price)}</strong>
            <small>2% fee · {formatXaf(deal.fee)}</small>
          </div>
          <div className="summary-id">DEAL ID<strong>#{deal.id}</strong></div>
        </section>

        <section className="timeline-card">
          <div className="section-heading">
            <div><p className="eyebrow">{tx("SHIPMENT UPDATES")}</p><h2>{tx("Deal timeline")}</h2></div>
            <span className="timeline-counter">{preferences.language === "fr" ? "4 étapes" : "4 steps"}</span>
          </div>
          <ol className="timeline">
            {timelineSteps(deal, preferences.language).map((step, index) => (
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
              <div><h2>{tx("Verify dispatch receipt")}</h2><p>{preferences.language === "fr" ? "Prenez une photo ou choisissez l'image du bordereau de l'agence." : "Take a photo or choose an image of the agency waybill."}</p></div>
            </div>
            <label className={`button button-secondary full-button upload-button ${uploading ? "is-disabled" : ""}`}>
              {uploading ? (preferences.language === "fr" ? "Vérification…" : "Checking receipt…") : tx("Upload dispatch receipt")}
              <input type="file" accept="image/*" capture="environment" onChange={onReceiptSelected} disabled={uploading} />
            </label>
            {uploadError && <p className="form-error" role="alert">{uploadError}</p>}
          </section>
        )}

        {receiptMessage && <p className="inline-message" role="status">{receiptMessage}</p>}

        <section className="delivery-card">
          <div className="delivery-title">
            <span className="delivery-check" aria-hidden="true">✓</span>
            <div><h2>{tx("Confirm delivery")}</h2><p>{preferences.language === "fr" ? "Libérez les fonds après avoir reçu et inspecté l'article." : "Release funds only after you’ve received and inspected the item."}</p></div>
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
                <span>{preferences.language === "fr" ? "J'ai reçu l'article et il correspond à notre accord." : "I received the item and it matches our agreement."}</span>
              </label>
              <button
                type="button"
                className="button button-primary full-button"
                disabled={!deal.receiptVerified || !deliveryConfirmed}
                onClick={handleDelivery}
              >
                {tx("Confirm delivery")} · {formatXaf(deal.price)}
              </button>
              {!deal.receiptVerified && <p className="form-footnote">{preferences.language === "fr" ? "Vérifiez le reçu d'expédition avant de confirmer la livraison." : "Verify the agency dispatch receipt before confirming delivery."}</p>}
            </>
          ) : (
            <p className="delivered-note">This deal is complete. Your trust score is now {state.trustScore}%.</p>
          )}
        </section>

        <section className="tracker-dispute-actions">
          <p>{tx("Need help with this shipment?")}</p>
          <Link to={`/dispute/${deal.id}`} className="button button-secondary full-button">{tx("Raise Dispute / Flag Issue")}</Link>
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
        <Route path="/deals" element={<Deals />} />
        <Route path="/create" element={<CreateDeal />} />
        <Route path="/tracker/:id" element={<Tracker />} />
        <Route path="/dispute/:id" element={<Dispute />} />
        <Route path="/resolution/:id" element={<Resolution />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Navigate to="/settings" replace />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/signup" element={<Navigate to="/register" replace />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreProvider>
  );
}

export default App;
