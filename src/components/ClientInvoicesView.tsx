"use client";

import { useEffect, useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";
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
type InvoicePdfMap = Record<string, string>;

const invoiceTemplateUrl = "/FACTURE%20remplissable.pdf";

export function ClientInvoicesView({
  sales,
  dishes,
  antennas,
  currentUserName,
}: ClientInvoicesViewProps) {
  const [statuses, setStatuses] = useState<InvoiceStatusMap>({});
  const [storedPdfs, setStoredPdfs] = useState<InvoicePdfMap>({});

  useEffect(() => {
    const savedStatuses = window.localStorage.getItem("phf-client-invoice-statuses");
    const savedPdfs = window.localStorage.getItem("phf-client-invoice-pdfs");

    if (savedStatuses) setStatuses(JSON.parse(savedStatuses));
    if (savedPdfs) setStoredPdfs(JSON.parse(savedPdfs));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("phf-client-invoice-statuses", JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    window.localStorage.setItem("phf-client-invoice-pdfs", JSON.stringify(storedPdfs));
  }, [storedPdfs]);

  const invoiceSales = useMemo(() => {
    return sales.filter((sale) => sale.invoiceRequested);
  }, [sales]);

  function getStatus(saleId: number): InvoiceStatus {
    return statuses[String(saleId)] || "À générer";
  }

  function updateStatus(saleId: number, status: InvoiceStatus) {
    setStatuses((current) => ({ ...current, [String(saleId)]: status }));
  }

  function getInvoiceNumber(sale: Sale) {
    return `PHF-${sale.date.replaceAll("-", "")}-${sale.id}`;
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

  function getInvoiceBuckets(sale: Sale) {
    const buckets = {
      qte_repas_8: 0,
      qte_repas_10: 0,
      qte_repas_12: 0,
      qte_desserts: 0,
      qte_collations: 0,
      total_repas_8: 0,
      total_repas_10: 0,
      total_repas_12: 0,
      total_desserts: 0,
      total_collations: 0,
    };

    sale.lines.forEach((line) => {
      const dish = dishes.find((item) => item.id === line.dishId);
      const quantity = toNumber(line.quantity);
      const unitPrice = toNumber(line.unitPrice);
      const total = quantity * unitPrice;
      const category = (dish?.category || "").toLowerCase();

      if (category.includes("dessert")) {
        buckets.qte_desserts += quantity;
        buckets.total_desserts += total;
        return;
      }

      if (category.includes("collation")) {
        buckets.qte_collations += quantity;
        buckets.total_collations += total;
        return;
      }

      if (unitPrice === 8) {
        buckets.qte_repas_8 += quantity;
        buckets.total_repas_8 += total;
        return;
      }

      if (unitPrice === 10) {
        buckets.qte_repas_10 += quantity;
        buckets.total_repas_10 += total;
        return;
      }

      buckets.qte_repas_12 += quantity;
      buckets.total_repas_12 += total;
    });

    return buckets;
  }

  async function generateInvoicePdf(sale: Sale) {
    const response = await fetch(invoiceTemplateUrl);
    const existingPdfBytes = await response.arrayBuffer();

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    const buckets = getInvoiceBuckets(sale);
    const totalTtc = getSaleTotal(sale);
    const totalHt = totalTtc / 1.055;
    const tva = totalTtc - totalHt;

    const fields: Record<string, string> = {
      nom_client: sale.customerName || "Client",
      date_facture: formatDate(sale.date),
      numero_facture: getInvoiceNumber(sale),

      qte_repas_8: formatQuantity(buckets.qte_repas_8),
      qte_repas_10: formatQuantity(buckets.qte_repas_10),
      qte_repas_12: formatQuantity(buckets.qte_repas_12),
      qte_desserts: formatQuantity(buckets.qte_desserts),
      qte_collations: formatQuantity(buckets.qte_collations),

      total_repas_8: formatMoney(buckets.total_repas_8),
      total_repas_10: formatMoney(buckets.total_repas_10),
      total_repas_12: formatMoney(buckets.total_repas_12),
      total_desserts: formatMoney(buckets.total_desserts),
      total_collations: formatMoney(buckets.total_collations),

      total_ht: formatMoney(totalHt),
      tva: formatMoney(tva),
      total_ttc: formatMoney(totalTtc),
    };

    Object.entries(fields).forEach(([name, value]) => {
      form.getTextField(name).setText(value);
    });

    form.flatten();

    const pdfBytes = await pdfDoc.save();
    const pdfArrayBuffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    ) as ArrayBuffer;

    const base64 = arrayBufferToBase64(pdfArrayBuffer);

    setStoredPdfs((current) => ({
      ...current,
      [String(sale.id)]: base64,
    }));

    updateStatus(sale.id, "Générée");
  }

  function openStoredPdf(sale: Sale) {
    const base64 = storedPdfs[String(sale.id)];
    if (!base64) return;

    const url = createPdfUrl(base64);
    window.open(url, "_blank");
  }

  function downloadStoredPdf(sale: Sale) {
    const base64 = storedPdfs[String(sale.id)];
    if (!base64) return;

    const url = createPdfUrl(base64);
    const link = document.createElement("a");
    link.href = url;
    link.download = `facture-${sale.customerName || "client"}-${sale.date}.pdf`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function openEmail(sale: Sale) {
    const subject = encodeURIComponent(`Facture ${getInvoiceNumber(sale)} - Pat Healthy Food`);
    const body = encodeURIComponent(
      [
        `Bonjour ${sale.customerName || ""},`,
        "",
        "Votre facture Pat Healthy Food est prête.",
        "",
        `Numéro : ${getInvoiceNumber(sale)}`,
        `Montant TTC : ${formatCurrency(getSaleTotal(sale))}`,
        "",
        "Bonne journée,",
        "Pat Healthy Food",
        "",
        "Note interne : le PDF doit être joint manuellement pour l’instant.",
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
          Ouvrir le modèle
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
            Connecté : {currentUserName}. Les PDF générés restent dans le navigateur de cet appareil.
          </p>
        </div>

        <div className="panel">
          <div className="panel-title-row">
            <div>
              <h2>Modèle facture PHF</h2>
              <p>PDF remplissable utilisé comme base</p>
            </div>
          </div>

          <div className="invoice-brand-preview">
            <iframe
              src={invoiceTemplateUrl}
              title="Facture remplissable PHF"
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
              <p>Coche “Facture demandée” lors d’une vente pour la faire apparaître ici.</p>
            </div>
          ) : (
            invoiceSales.map((sale) => {
              const antenna = antennas.find((item) => item.id === sale.antennaId);
              const status = getStatus(sale.id);
              const hasPdf = Boolean(storedPdfs[String(sale.id)]);

              return (
                <div className="dish-row invoice-row" key={sale.id}>
                  <div className="dish-photo">FAC</div>

                  <div className="dish-info">
                    <div>
                      <strong>{sale.customerName || "Client non renseigné"}</strong>
                      <span>{formatCurrency(getSaleTotal(sale))}</span>
                    </div>

                    <p>
                      {getInvoiceNumber(sale)} - {formatDate(sale.date)} à {sale.time} -{" "}
                      {antenna?.name || "Antenne supprimée"}
                    </p>
                    <p>Email : {sale.customerEmail || "Non renseigné"}</p>
                    <p>{getSaleSummary(sale)}</p>
                  </div>

                  <div className="dish-meta">
                    <strong>{status}</strong>
                    <span>{hasPdf ? "PDF en app" : "Aucun PDF"}</span>
                  </div>

                  <div className="dish-actions invoice-actions">
                    <button
                      className="primary-action"
                      type="button"
                      onClick={() => generateInvoicePdf(sale)}
                    >
                      Générer PDF
                    </button>

                    <button
                      className="primary-action"
                      type="button"
                      onClick={() => openStoredPdf(sale)}
                      disabled={!hasPdf}
                    >
                      Ouvrir PDF
                    </button>

                    <button
                      className="primary-action"
                      type="button"
                      onClick={() => downloadStoredPdf(sale)}
                      disabled={!hasPdf}
                    >
                      Télécharger
                    </button>

                    <button
                      className="primary-action"
                      type="button"
                      onClick={() => updateStatus(sale.id, "Envoyée")}
                    >
                      Marquer envoyée
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
                      Préparer mail
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

function formatMoney(value: number) {
  if (!Number.isFinite(value) || value === 0) return "0";
  return value.toFixed(2).replace(".", ",");
}

function formatQuantity(value: number) {
  if (!Number.isFinite(value) || value === 0) return "0";
  return String(value);
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function createPdfUrl(base64: string) {
  const buffer = base64ToArrayBuffer(base64);
  const blob = new Blob([buffer], { type: "application/pdf" });

  return URL.createObjectURL(blob);
}