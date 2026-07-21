"use client";

import { useMemo, useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Antenna, Dish, DishSpec, PurchaseInvoice, Sale, User } from "../types";
import {
  calculatePurchaseTotal,
  calculateSaleRevenue,
  calculateSalesCost,
  calculateSalesProfit,
  calculateSalesRevenue,
  formatCurrency,
} from "../utils/calculations";

type DashboardViewProps = {
  currentUser?: User;
  isAdmin?: boolean;
  dishes?: Dish[];
  antennas?: Antenna[];
  sales?: Sale[];
  specs?: DishSpec[];
  purchaseInvoices?: PurchaseInvoice[];
};

function getCurrentWeekStart() {
  const date = new Date();
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

function addDays(value: string, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function cleanPdfText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[€]/g, "EUR")
    .replace(/[’]/g, "'")
    .replace(/[–—]/g, "-");
}

function formatPdfMoney(value: number) {
  return `${value.toFixed(2).replace(".", ",")} EUR`;
}

function groupByText<T>(
  items: T[],
  getKey: (item: T) => string,
  getValue: (item: T) => number,
) {
  const grouped = new Map<string, number>();

  items.forEach((item) => {
    const key = getKey(item) || "Non renseigne";
    grouped.set(key, (grouped.get(key) || 0) + getValue(item));
  });

  return Array.from(grouped.entries()).sort((first, second) =>
    first[0].localeCompare(second[0]),
  );
}

export function DashboardView({
  currentUser,
  isAdmin = false,
  dishes = [],
  antennas = [],
  sales = [],
  specs = [],
  purchaseInvoices = [],
}: DashboardViewProps) {
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const weekEnd = addDays(weekStart, 6);

  const revenue = calculateSalesRevenue(sales, dishes);
  const recipeCost = calculateSalesCost(sales, specs);
  const grossProfit = calculateSalesProfit(sales, dishes, specs);
  const purchaseTotal = calculatePurchaseTotal(purchaseInvoices);
  const marginRate = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  const weeklySales = useMemo(() => {
    return sales.filter((sale) => sale.date >= weekStart && sale.date <= weekEnd);
  }, [sales, weekStart, weekEnd]);

  const weeklyRevenue = calculateSalesRevenue(weeklySales, dishes);
  const weeklyCost = calculateSalesCost(weeklySales, specs);
  const weeklyProfit = weeklyRevenue - weeklyCost;

  async function downloadWeeklyPdf() {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;

    function write(text: string, size = 10, bold = false) {
      if (y < 50) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
      }

      page.drawText(cleanPdfText(text), {
        x: 42,
        y,
        size,
        font: bold ? boldFont : regularFont,
        color: rgb(0.06, 0.08, 0.05),
      });

      y -= size + 8;
    }

    write("PAT HEALTHY FOOD - RECAP HEBDOMADAIRE", 18, true);
    write(`Semaine du ${weekStart} au ${weekEnd}`, 12);
    write(`Genere par : ${currentUser?.name || "Utilisateur"}`, 10);
    y -= 10;

    write("SYNTHESE", 13, true);
    write(`CA total : ${formatPdfMoney(weeklyRevenue)}`);
    write(`Cout recettes : ${formatPdfMoney(weeklyCost)}`);
    write(`Benefice brut : ${formatPdfMoney(weeklyProfit)}`);
    write(`Nombre de ventes : ${weeklySales.length}`);
    write(`Factures demandees : ${weeklySales.filter((sale) => sale.invoiceRequested).length}`);
    y -= 8;

    write("DETAIL PAR JOUR", 13, true);
    groupByText(
      weeklySales,
      (sale) => sale.date,
      (sale) => calculateSaleRevenue(sale, dishes),
    ).forEach(([date, amount]) => {
      write(`${date} : ${formatPdfMoney(amount)}`);
    });
    y -= 8;

    write("DETAIL PAR MOYEN DE PAIEMENT", 13, true);
    groupByText(
      weeklySales,
      (sale) => sale.paymentMethod || sale.payment,
      (sale) => calculateSaleRevenue(sale, dishes),
    ).forEach(([payment, amount]) => {
      write(`${payment} : ${formatPdfMoney(amount)}`);
    });
    y -= 8;

    write("DETAIL PAR ANTENNE", 13, true);
    groupByText(
      weeklySales,
      (sale) =>
        antennas.find((antenna) => antenna.id === sale.antennaId)?.name ||
        `Antenne ${sale.antennaId}`,
      (sale) => calculateSaleRevenue(sale, dishes),
    ).forEach(([antenna, amount]) => {
      write(`${antenna} : ${formatPdfMoney(amount)}`);
    });
    y -= 8;

    write("DETAIL PAR PLAT", 13, true);
    const dishTotals = new Map<number, { quantity: number; amount: number }>();

    weeklySales.forEach((sale) => {
      sale.lines.forEach((line) => {
        const current = dishTotals.get(line.dishId) || { quantity: 0, amount: 0 };
        dishTotals.set(line.dishId, {
          quantity: current.quantity + Number(line.quantity.replace(",", ".") || 0),
          amount:
            current.amount +
            calculateSaleRevenue(
              { ...sale, lines: [line] },
              dishes,
            ),
        });
      });
    });

    Array.from(dishTotals.entries()).forEach(([dishId, total]) => {
      const dishName = dishes.find((dish) => dish.id === dishId)?.name || "Plat inconnu";
      write(`${dishName} : x ${total.quantity} - ${formatPdfMoney(total.amount)}`);
    });

    const pdfBytes = await pdfDoc.save();
    const bytes = new Uint8Array(pdfBytes);
    const blob = new Blob([bytes.buffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `recap-phf-${weekStart}-${weekEnd}.pdf`;
    link.click();

    URL.revokeObjectURL(url);
  }

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
          <h2>Récap hebdomadaire</h2>

          <div className="form-grid compact-form">
            <label>
              Début semaine
              <input
                type="date"
                value={weekStart}
                onChange={(event) => setWeekStart(event.target.value)}
              />
            </label>

            <label>
              Fin semaine
              <input type="date" value={weekEnd} disabled />
            </label>
          </div>

          <div className="info-list">
            <div>
              <span>CA semaine</span>
              <strong>{formatCurrency(weeklyRevenue)}</strong>
            </div>

            <div>
              <span>Bénéfice semaine</span>
              <strong>{formatCurrency(weeklyProfit)}</strong>
            </div>

            <div>
              <span>Ventes semaine</span>
              <strong>{weeklySales.length}</strong>
            </div>
          </div>

          <button className="primary-action" type="button" onClick={downloadWeeklyPdf}>
            Télécharger récap semaine PDF
          </button>
        </div>

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