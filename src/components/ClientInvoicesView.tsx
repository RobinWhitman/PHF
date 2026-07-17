"use client";

import { useEffect, useMemo, useState } from "react";
import type { Antenna, Dish, Sale } from "../types";
import { formatDate, formatCurrency, toNumber } from "../utils/calculations";

type InvoiceStatus = "À générer" | "Générée" | "Envoyée";

type ClientInvoicesViewProps = {
  sales: Sale[];
  dishes: Dish[];
  antennas: Antenna[];
  currentUserName: string;
};

type InvoiceStatusMap = Record<string, InvoiceStatus>;

const invoiceTemplateUrl = "/FACTURE%20VIERGE.pdf";

export function ClientInvoicesView({
  sales,
  dishes,
  antennas,
  currentUserName,
}: ClientInvoicesViewProps) {
  const [statuses, setStatuses] = useState<InvoiceStatusMap>({});

  useEffect(() => {
    const savedStatuses = window.localStorage.getItem("phf-client-invoice-statuses");

    if (savedStatuses) {
      setStatuses(JSON.parse(savedStatuses));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "phf-client-invoice-statuses",
      JSON.stringify(statuses)
    );
  }, [statuses]);

  const invoiceSales = useMemo(() => {
    return sales.filter((sale) => sale.invoiceRequested);
  }, [sales]);

  function getStatus(saleId: number): InvoiceStatus {
    return statuses[String(saleId)] || "À générer";
  }

  function updateStatus(saleId: number, status: InvoiceStatus) {
    setStatuses((current) => ({
      ...current,
      [String(saleId)]: status,
    }));
  }

  function getSaleTotal(sale: Sale) {
    return sale.lines.reduce((total, line) => {
      return total + toNumber(line.quantity) * toNumber(line.unitPrice);
    }, 0);
  }

  function getSaleSummary(sale: Sale) {
    return sale.lines
      .map((line) => {
        const dish = dishes.find((item) => item.id === line.dishId);
        return `${dish?.name || "Plat supprimé"} x ${line.quantity}`;
      })
      .join(" | ");
  }

  function openEmail(sale: Sale) {
    const subject = encodeURIComponent("Facture Pat Healthy Food");
    const body = encodeURIComponent(
      [
        `Bonjour ${sale.customerName || ""},`,
        "",
        "Veuillez trouver votre facture Pat Healthy Food.",
        "",
        `Montant TTC : ${formatCurrency(getSaleTotal(sale))}`,
        "",
        "Bonne journée,",
        "Pat Healthy Food",
      ].join("\n")
    );

    window.location.href = `mailto:${sale.customerEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <section className="module-page">
      <div className="module-header">
        <div>
          <p className="eyebrow">Facturation</p>
          <h1>Factures client</h1>
        </div>

        <a className="primary-action invoice-link" href={invoiceTemplateUrl} target="_blank">
          Ouvrir le modèle vierge
        </a>
      </div>

      <div className="workspace-grid two-columns">
        <div className="panel">
          <div className="panel-title-row">
            <div>
              <h2>À traiter</h2>
              <p>Ventes avec facture demandée</p>
            </div>
            <strong>{invoiceSales.length}</strong>
          </div>

          <div className="info-list">
            <div>
              <span>À générer</span>
              <strong>
                {invoiceSales.filter((sale) => getStatus(sale.id) === "À générer").length}
              </strong>
            </div>

            <div>
              <span>Générées</span>
              <strong>
                {invoiceSales.filter((sale) => getStatus(sale.id) === "Générée").length}
              </strong>
            </div>

            <div>
              <span>Envoyées</span>
              <strong>
                {invoiceSales.filter((sale) => getStatus(sale.id) === "Envoyée").length}
              </strong>
            </div>
          </div>

          <p className="muted-text invoice-note">
            Connecté : {currentUserName}. Le PDF automatique sera branché sur ce modèle au sprint suivant.
          </p>
        </div>

        <div className="panel">
          <div className="panel-title-row">
            <div>
              <h2>Modèle facture PHF</h2>
              <p>Facture vierge utilisée comme base</p>
            </div>
          </div>

          <div className="invoice-brand-preview">
            <iframe
              src={invoiceTemplateUrl}
              title="Facture vierge PHF"
              style={{
                width: "100%",
                height: "420px",
                border: "0",
                borderRadius: "8px",
                background: "#ffffff",
              }}
            />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title-row">
          <div>
            <h2>Factures à gérer</h2>
            <p>Chaque ligne vient d’une vente avec demande de facture.</p>
          </div>
        </div>

        <div className="dish-list">
          {invoiceSales.length === 0 ? (
            <div className="empty-state">
              <strong>Aucune facture client</strong>
              <p>
                Coche “Facture demandée” lors d’une vente pour la faire apparaître ici.
              </p>
            </div>
          ) : (
            invoiceSales.map((sale) => {
              const antenna = antennas.find((item) => item.id === sale.antennaId);
              const status = getStatus(sale.id);

              return (
                <div className="dish-row invoice-row" key={sale.id}>
                  <div className="dish-photo">FAC</div>

                  <div className="dish-info">
                    <div>
                      <strong>{sale.customerName || "Client non renseigné"}</strong>
                      <span>{formatCurrency(getSaleTotal(sale))}</span>
                    </div>

                    <p>
                      {formatDate(sale.date)} à {sale.time} -{" "}
                      {antenna?.name || "Antenne supprimée"}
                    </p>
                    <p>Email : {sale.customerEmail || "Non renseigné"}</p>
                    <p>{getSaleSummary(sale)}</p>
                  </div>

                  <div className="dish-meta">
                    <strong>{status}</strong>
                    <span>{sale.paymentMethod}</span>
                  </div>

                  <div className="dish-actions invoice-actions">
                    <button
                      className="primary-action"
                      type="button"
                      onClick={() => updateStatus(sale.id, "Générée")}
                    >
                      Générée
                    </button>

                    <button
                      className="primary-action"
                      type="button"
                      onClick={() => updateStatus(sale.id, "Envoyée")}
                    >
                      Envoyée
                    </button>

                    <button
                      className="delete-action"
                      type="button"
                      onClick={() => updateStatus(sale.id, "À générer")}
                    >
                      Réinitialiser
                    </button>

                    <button
                      className="delete-action"
                      type="button"
                      onClick={() => openEmail(sale)}
                      disabled={!sale.customerEmail}
                    >
                      Mail
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}