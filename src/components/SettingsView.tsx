"use client";

import { settings } from "../data/initial-data";

type SettingsViewProps = {
  onResetApp: () => Promise<void>;
};

export function SettingsView({ onResetApp }: SettingsViewProps) {
  async function handleReset() {
    const confirmText = window.prompt(
      "Remise à zéro complète des données de test. Tape RESET pour confirmer.",
    );

    if (confirmText !== "RESET") return;

    const pin = window.prompt("Mot de passe admin requis.");

    if (pin !== "2323") {
      window.alert("Mot de passe admin incorrect.");
      return;
    }

    const finalConfirm = window.confirm(
      "Dernière confirmation : ventes, CA, stocks, productions, factures, historique et données de test seront supprimés sur PC, mobile et Supabase.",
    );

    if (!finalConfirm) return;

    await onResetApp();

    window.alert("Application remise à zéro. Les données propres sont conservées.");
    window.location.reload();
  }

  return (
    <section className="module-page">
      <div className="module-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Paramètres</h1>
        </div>
      </div>

      <div className="workspace-grid two-columns">
        <div className="panel">
          <h2>Modes de paiement</h2>

          <div className="chip-list">
            {settings.payments.map((payment) => (
              <span className="chip" key={payment}>
                {payment}
              </span>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Catégories plats</h2>

          <div className="chip-list">
            {settings.dishCategories.map((category) => (
              <span className="chip" key={category}>
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Catégories achats</h2>

          <div className="chip-list">
            {settings.purchaseCategories.map((category) => (
              <span className="chip" key={category}>
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="panel danger-panel">
          <h2>Remise à zéro des tests</h2>

          <p className="muted-text">
            Supprime les ventes, CA, stocks, productions, factures, mouvements antennes
            et historique sur tous les appareils. Les plats, cahiers des charges,
            comptes et antennes LABO / LXII restent en place.
          </p>

          <button className="danger-button" type="button" onClick={handleReset}>
            Remettre l&apos;appli à zéro
          </button>
        </div>
      </div>
    </section>
  );
}