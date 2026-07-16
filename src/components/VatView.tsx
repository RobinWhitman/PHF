import { useMemo, useState } from "react";
import type { PurchaseInvoice, Sale } from "../types";

type VatViewProps = {
  sales: Sale[];
  purchaseInvoices: PurchaseInvoice[];
};

export function VatView({ sales, purchaseInvoices }: VatViewProps) {
  const [startDate, setStartDate] = useState(getFirstDayOfCurrentMonth());
  const [endDate, setEndDate] = useState(getLastDayOfCurrentMonth());

  const summary = useMemo(() => {
    const filteredSales = sales.filter((sale) =>
      isDateInRange(sale.date, startDate, endDate)
    );

    const filteredInvoices = purchaseInvoices.filter((invoice) =>
      isDateInRange(invoice.date, startDate, endDate)
    );

    const salesTtc = filteredSales.reduce((sum, sale) => {
      return sum + getSaleTotalNumber(sale);
    }, 0);

    const salesHt = salesTtc / 1.055;
    const collectedVat = salesTtc - salesHt;

    const deductibleVat = filteredInvoices.reduce((sum, invoice) => {
      return sum + parseAmount(invoice.amountVat);
    }, 0);

    const vatToDeclare = collectedVat - deductibleVat;

    return {
      salesCount: filteredSales.length,
      invoicesCount: filteredInvoices.length,
      salesTtc,
      salesHt,
      collectedVat,
      deductibleVat,
      vatToDeclare,
    };
  }, [sales, purchaseInvoices, startDate, endDate]);

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Période</p>
            <h2>Déclaration TVA</h2>
          </div>
        </div>

        <form className="entity-form">
          <label>
            Date de début
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>

          <label>
            Date de fin
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>

          <div className="setting-list">
            <p>Ventes incluses : {summary.salesCount}</p>
            <p>Factures d’achat incluses : {summary.invoicesCount}</p>
            <p>TVA ventes fixe : 5,5 %</p>
          </div>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Récapitulatif</p>
            <h2>TVA à déclarer</h2>
          </div>
          <span className="status-pill">{formatMoney(summary.vatToDeclare)}</span>
        </div>

        <div className="dish-list">
          <div className="dish-row">
            <div className="dish-photo">TTC</div>
            <div className="dish-info">
              <div>
                <strong>CA TTC</strong>
                <span>Ventes encaissées</span>
              </div>
              <p>Total TTC sur la période sélectionnée.</p>
            </div>
            <div className="dish-meta">
              <strong>{formatMoney(summary.salesTtc)}</strong>
              <span>€</span>
            </div>
          </div>

          <div className="dish-row">
            <div className="dish-photo">HT</div>
            <div className="dish-info">
              <div>
                <strong>CA HT</strong>
                <span>Base hors taxe</span>
              </div>
              <p>Calculé automatiquement depuis le TTC avec TVA 5,5 %.</p>
            </div>
            <div className="dish-meta">
              <strong>{formatMoney(summary.salesHt)}</strong>
              <span>€</span>
            </div>
          </div>

          <div className="dish-row">
            <div className="dish-photo">COL</div>
            <div className="dish-info">
              <div>
                <strong>TVA collectée</strong>
                <span>Ventes</span>
              </div>
              <p>TVA issue des ventes à 5,5 %.</p>
            </div>
            <div className="dish-meta">
              <strong>{formatMoney(summary.collectedVat)}</strong>
              <span>€</span>
            </div>
          </div>

          <div className="dish-row">
            <div className="dish-photo">DED</div>
            <div className="dish-info">
              <div>
                <strong>TVA déductible</strong>
                <span>Achats</span>
              </div>
              <p>Total des TVA saisies dans les factures d’achat.</p>
            </div>
            <div className="dish-meta">
              <strong>{formatMoney(summary.deductibleVat)}</strong>
              <span>€</span>
            </div>
          </div>

          <div className="dish-row">
            <div className="dish-photo">NET</div>
            <div className="dish-info">
              <div>
                <strong>TVA à déclarer</strong>
                <span>Collectée - déductible</span>
              </div>
              <p>Montant estimé à reporter dans la déclaration.</p>
            </div>
            <div className="dish-meta">
              <strong>{formatMoney(summary.vatToDeclare)}</strong>
              <span>€</span>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

function getSaleTotalNumber(sale: Sale) {
  return sale.lines.reduce((sum, line) => {
    return sum + parseAmount(line.quantity) * parseAmount(line.unitPrice);
  }, 0);
}

function parseAmount(value: string) {
  const amount = Number(value.replace(",", "."));
  return Number.isNaN(amount) ? 0 : amount;
}

function formatMoney(value: number) {
  return value.toFixed(2);
}

function isDateInRange(date: string, startDate: string, endDate: string) {
  return date >= startDate && date <= endDate;
}

function getFirstDayOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}

function getLastDayOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
}