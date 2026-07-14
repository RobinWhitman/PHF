const dashboardCards = [
  { label: "CA jour", value: "0,00 €" },
  { label: "Ventes", value: "0" },
  { label: "Production", value: "À préparer" },
  { label: "TVA", value: "0,00 €" },
];

const modules = [
  "Tableau de bord",
  "Menus",
  "Cahiers des charges",
  "Production",
  "Liste de courses",
  "Stocks",
  "Antennes",
  "Ventes",
  "Factures",
  "TVA",
  "Historique",
  "Paramètres",
];

export default function Home() {
  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Logiciel interne</p>
          <h1>Pat Healthy Food ERP</h1>
        </div>

        <div className="status-card">
          <span className="status-dot" />
          <div>
            <p>Application V1</p>
            <strong>Macro Sprint 1</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        {dashboardCards.map((card) => (
          <article className="metric-card" key={card.label}>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="modules-section">
        <div className="section-heading">
          <p className="eyebrow">Modules V1</p>
          <h2>Base de travail</h2>
        </div>

        <div className="modules-grid">
          {modules.map((module) => (
            <div className="module-card" key={module}>
              {module}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}