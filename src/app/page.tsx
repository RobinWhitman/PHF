const navItems = [
  "Dashboard",
  "Menus",
  "Production",
  "Courses",
  "Stocks",
  "Ventes",
  "Factures",
  "TVA",
  "Historique",
  "Paramètres",
];

const metrics = [
  { label: "CA jour", value: "0,00 €" },
  { label: "CA semaine", value: "0,00 €" },
  { label: "Ventes", value: "0" },
  { label: "TVA estimée", value: "0,00 €" },
];

const alerts = [
  "Aucun stock faible",
  "Aucune production en cours",
  "Aucune vente enregistrée aujourd'hui",
];

const quickActions = [
  "Nouvelle vente",
  "Créer un menu",
  "Prévoir production",
  "Ajouter facture",
];

export default function Home() {
  return (
    <main className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <span>PHF</span>
          <div>
            <strong>Pat Healthy Food</strong>
            <p>ERP interne</p>
          </div>
        </div>

        <nav className="desktop-nav">
          {navItems.map((item, index) => (
            <button className={index === 0 ? "nav-item active" : "nav-item"} key={item}>
              {item}
            </button>
          ))}
        </nav>

        <div className="user-card">
          <p>Connecté</p>
          <strong>Robin</strong>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Macro Sprint 2</p>
            <h1>Tableau de bord</h1>
          </div>

          <button className="primary-action">Nouvelle vente</button>
        </header>

        <section className="metrics-grid">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </section>

        <section className="work-grid">
          <article className="panel large-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Aujourd'hui</p>
                <h2>Activité</h2>
              </div>
              <span className="status-pill">Calme</span>
            </div>

            <div className="empty-state">
              <strong>Aucune donnée pour le moment</strong>
              <p>Les prochaines ventes, productions et alertes apparaîtront ici.</p>
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <h2>Actions rapides</h2>
            </div>

            <div className="action-list">
              {quickActions.map((action) => (
                <button key={action}>{action}</button>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <h2>Alertes</h2>
            </div>

            <div className="alert-list">
              {alerts.map((alert) => (
                <p key={alert}>{alert}</p>
              ))}
            </div>
          </article>
        </section>
      </section>

      <nav className="mobile-nav">
        {["Dashboard", "Menus", "Stocks", "Ventes", "TVA"].map((item, index) => (
          <button className={index === 0 ? "active" : ""} key={item}>
            {item}
          </button>
        ))}
      </nav>
    </main>
  );
}