"use client";

import { useMemo } from "react";
import { initialAntennas, initialDishes, initialSpecs, settings } from "../data/initial-data";
import { isSupabaseConfigured } from "../lib/supabase";

type SettingsViewProps = {
  onResetApp: () => Promise<void>;
};

function getStoredCount(key: string, fallbackCount: number) {
  if (typeof window === "undefined") return fallbackCount;

  try {
    const value = window.localStorage.getItem(key);
    if (!value) return fallbackCount;

    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.length : fallbackCount;
  } catch {
    return fallbackCount;
  }
}

function getStoredAntennas() {
  if (typeof window === "undefined") return initialAntennas;

  try {
    const value = window.localStorage.getItem("phf-antennas");
    if (!value) return initialAntennas;

    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : initialAntennas;
  } catch {
    return initialAntennas;
  }
}

export function SettingsView({ onResetApp }: SettingsViewProps) {
  const cleanStatus = useMemo(() => {
    const dishCount = getStoredCount("phf-dishes", initialDishes.length);
    const specCount = getStoredCount("phf-specs", initialSpecs.length);
    const salesCount = getStoredCount("phf-sales", 0);
    const stockMovementsCount = getStoredCount("phf-stock-movements", 0);
    const antennaMovementsCount = getStoredCount("phf-antenna-movements", 0);
    const purchaseInvoicesCount = getStoredCount("phf-purchase-invoices", 0);
    const antennas = getStoredAntennas();
    const antennaNames = antennas.map((antenna) => antenna.name);

    return {
      dishCount,
      specCount,
      salesCount,
      stockMovementsCount,
      antennaMovementsCount,
      purchaseInvoicesCount,
      hasCatalog: dishCount >= initialDishes.length && specCount >= initialSpecs.length,
      hasCleanAntennas: antennaNames.includes("LABO") && antennaNames.includes("LXII"),
      isClean:
        salesCount === 0 &&
        stockMovementsCount === 0 &&
        antennaMovementsCount === 0 &&
        purchaseInvoicesCount === 0,
    };
  }, []);

  async function handleReset() {
    const confirmText = window.prompt(
      "Remise à zéro complète des données de test. Tape exactement RESET pour confirmer.",
    );

    if (confirmText !== "RESET") return;

    const pin = window.prompt("Mot de passe admin requis.");

    if (pin !== "2323") {
      window.alert("Mot de passe admin incorrect.");
      return;
    }

    const finalConfirm = window.confirm(
      "Dernière confirmation : les ventes, CA, stocks, productions, factures, mouvements et historique seront supprimés sur PC, mobile et Supabase. Les plats et cahiers seront conservés.",
    );

    if (!finalConfirm) return;

    await onResetApp();

    window.alert("Application remise à zéro. Données propres conservées.");
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
          <h2>Cloud</h2>

          <div className="status-grid">
            <div className={isSupabaseConfigured ? "status-card ok" : "status-card danger"}>
              <span>Supabase</span>
              <strong>{isSupabaseConfigured ? "Connecté" : "Non configuré"}</strong>
            </div>

            <div className="status-card ok">
              <span>Synchronisation</span>
              <strong>PC / mobile</strong>
            </div>
          </div>

          <p className="muted-text">
            Les données de travail sont sauvegardées dans Supabase et restent aussi
            en secours dans le navigateur.
          </p>
        </div>

        <div className="panel">
          <h2>Données propres</h2>

          <div className="status-list">
            <div>
              <span>Plats catalogue</span>
              <strong>{cleanStatus.dishCount}</strong>
            </div>

            <div>
              <span>Cahiers des charges</span>
              <strong>{cleanStatus.specCount}</strong>
            </div>

            <div>
              <span>Antennes</span>
              <strong>{cleanStatus.hasCleanAntennas ? "LABO / LXII" : "À vérifier"}</strong>
            </div>

            <div>
              <span>Ventes test</span>
              <strong>{cleanStatus.salesCount}</strong>
            </div>

            <div>
              <span>Mouvements stock</span>
              <strong>{cleanStatus.stockMovementsCount}</strong>
            </div>

            <div>
              <span>Mouvements antennes</span>
              <strong>{cleanStatus.antennaMovementsCount}</strong>
            </div>
          </div>

          <p className="muted-text">
            Statut :{" "}
            <strong>
              {cleanStatus.hasCatalog && cleanStatus.hasCleanAntennas && cleanStatus.isClean
                ? "prêt pour utilisation réelle"
                : "données de test ou éléments à vérifier"}
            </strong>
          </p>
        </div>

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
            Supprime uniquement les données d’activité : ventes, CA, stocks,
            productions, factures, mouvements et historique. Les plats, cahiers,
            comptes et antennes propres sont conservés.
          </p>

          <button className="danger-button" type="button" onClick={handleReset}>
            Remettre l&apos;appli à zéro
          </button>
        </div>
      </div>
    </section>
  );
}