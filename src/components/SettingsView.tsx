import { settings } from "../data/initial-data";

export function SettingsView() {
  return (
    <section className="settings-grid">
      <article className="panel setting-card">
        <p className="eyebrow">Lieux de vente</p>
        <h2>Antennes</h2>
        <div className="setting-list">
          {settings.antennes.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </article>

      <article className="panel setting-card">
        <p className="eyebrow">Encaissement</p>
        <h2>Moyens de paiement</h2>
        <div className="setting-list">
          {settings.payments.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </article>

      <article className="panel setting-card">
        <p className="eyebrow">Organisation</p>
        <h2>Catégories</h2>
        <div className="setting-list">
          {settings.dishCategories.map((item) => (
            <p key={item}>{item}</p>
          ))}
          {settings.purchaseCategories.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </article>

      <article className="panel setting-card">
        <p className="eyebrow">Fiscalité</p>
        <h2>TVA</h2>
        <div className="setting-list">
          <p>TVA ventes : 5,5 %</p>
          <p>TVA achats : saisie manuelle</p>
          <p>Modification réservée à Robin</p>
        </div>
      </article>
    </section>
  );
}