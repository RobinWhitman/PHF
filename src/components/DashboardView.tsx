"use client";

import type { Dish, DishSpec, PurchaseInvoice, Sale, User } from "../types";
import {
  calculatePurchaseTotal,
  calculateSalesCost,
  calculateSalesProfit,
  calculateSalesRevenue,
  formatCurrency,
} from "../utils/calculations";

type DashboardViewProps = {
  currentUser?: User;
  isAdmin?: boolean;
  dishes?: Dish[];
  sales?: Sale[];
  specs?: DishSpec[];
  purchaseInvoices?: PurchaseInvoice[];
};

export function DashboardView({
  currentUser,
  isAdmin = false,
  dishes = [],
  sales = [],
  specs = [],
  purchaseInvoices = [],
}: DashboardViewProps) {
  const revenue = calculateSalesRevenue(sales, dishes);
  const recipeCost = calculateSalesCost(sales, specs);
  const grossProfit = calculateSalesProfit(sales, dishes, specs);
  const purchaseTotal = calculatePurchaseTotal(purchaseInvoices);

  const marginRate = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  return (
    <section className="module-page">
      <div className="module-header">
        <div>
          <p className="eyebrow">Vue générale</p>
          <h1>Dashboard</h1>
        </div>

        <div className="summary-pill">
          {currentUser?.name || "Utilisateur"} {isAdmin ? "Admin" : ""}
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
              <span>Cahiers des charges</span>
              <strong>{specs.length}</strong>
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
            renseignées dans les cahiers des charges.
          </p>
        </div>
      </div>
    </section>
  );
}