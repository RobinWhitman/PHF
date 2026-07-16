"use client";

import type { Dish, PurchaseInvoice, Sale, SpecItem } from "../types";
import {
  calculatePurchaseTotal,
  calculateSalesCost,
  calculateSalesProfit,
  calculateSalesRevenue,
  formatCurrency,
} from "../utils/calculations";

type DashboardViewProps = {
  dishes?: Dish[];
  sales?: Sale[];
  specItems?: SpecItem[];
  specs?: SpecItem[];
  purchaseInvoices?: PurchaseInvoice[];
};

export function DashboardView({
  dishes = [],
  sales = [],
  specItems,
  specs,
  purchaseInvoices = [],
}: DashboardViewProps) {
  const recipeItems = specItems || specs || [];

  const revenue = calculateSalesRevenue(sales, dishes);
  const recipeCost = calculateSalesCost(sales, recipeItems);
  const grossProfit = calculateSalesProfit(sales, dishes, recipeItems);
  const purchaseTotal = calculatePurchaseTotal(purchaseInvoices);

  const marginRate = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  return (
    <section className="module-page">
      <div className="module-header">
        <div>
          <p className="eyebrow">Vue générale</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="metrics-grid">
        <article className="metric-card">
          <span>CA encaissé</span>
          <strong>{formatCurrency(revenue)}</strong>
        </article>

        <article className="metric-card">
          <span>Coût recettes</span>
          <strong>{formatCurrency(recipeCost)}</strong>
        </article>

        <article className="metric-card positive">
          <span>Bénéfice brut</span>
          <strong>{formatCurrency(grossProfit)}</strong>
        </article>

        <article className="metric-card">
          <span>Marge brute</span>
          <strong>{marginRate.toFixed(1)} %</strong>
        </article>
      </div>

      <div className="workspace-grid two-columns">
        <div className="panel">
          <h2>Lecture rapide</h2>

          <div className="info-list">
            <div>
              <span>Ventes enregistrées</span>
              <strong>{sales.length}</strong>
            </div>

            <div>
              <span>Plats actifs</span>
              <strong>{dishes.filter((dish) => dish.active).length}</strong>
            </div>

            <div>
              <span>Lignes de cahiers des charges</span>
              <strong>{recipeItems.length}</strong>
            </div>

            <div>
              <span>Factures achat TTC</span>
              <strong>{formatCurrency(purchaseTotal)}</strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>À retenir</h2>

          <p className="muted-text">
            Le bénéfice brut est calculé avec les ventes moins le coût des recettes
            renseignées dans les cahiers des charges. Plus les prix unitaires sont remplis,
            plus le résultat devient fiable.
          </p>
        </div>
      </div>
    </section>
  );
}