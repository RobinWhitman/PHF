import type { User } from "../types";
import { metrics } from "../data/initial-data";

type DashboardViewProps = {
  currentUser: User;
  isAdmin: boolean;
};

export function DashboardView({ currentUser, isAdmin }: DashboardViewProps) {
  return (
    <>
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
              <p className="eyebrow">Session</p>
              <h2>Bienvenue {currentUser.name}</h2>
            </div>
            <span className="status-pill">{isAdmin ? "Admin" : "Associé"}</span>
          </div>

          <div className="empty-state">
            <strong>Connexion active</strong>
            <p>
              Les actions importantes seront ensuite enregistrées avec
              utilisateur, date et heure.
            </p>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Droits</h2>
          </div>

          <div className="alert-list">
            <p>Accès ventes, stocks, production et factures</p>
            <p>Paramètres sensibles : {isAdmin ? "autorisés" : "bloqués"}</p>
            <p>Historique utilisateur préparé</p>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Actions rapides</h2>
          </div>

          <div className="action-list">
            <button>Nouvelle vente</button>
            <button>Créer un menu</button>
            <button>Prévoir production</button>
            <button>Ajouter facture</button>
          </div>
        </article>
      </section>
    </>
  );
}