import { useState } from "react";
import type { FormEvent } from "react";
import type { PurchaseInvoice } from "../types";
import { settings } from "../data/initial-data";
import { formatDate } from "../utils/calculations";

type PurchaseInvoicesViewProps = {
  invoices: PurchaseInvoice[];
  currentUserName: string;
  onAddInvoice: (invoice: Omit<PurchaseInvoice, "id" | "createdBy">) => void;
  onDeleteInvoice: (id: number) => void;
};

export function PurchaseInvoicesView({
  invoices,
  currentUserName,
  onAddInvoice,
  onDeleteInvoice,
}: PurchaseInvoicesViewProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [supplier, setSupplier] = useState("");
  const [number, setNumber] = useState("");
  const [amountHt, setAmountHt] = useState("");
  const [amountVat, setAmountVat] = useState("");
  const [amountTtc, setAmountTtc] = useState("");
  const [category, setCategory] = useState(settings.purchaseCategories[0]);
  const [comment, setComment] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [invoiceToDelete, setInvoiceToDelete] = useState<PurchaseInvoice | null>(
    null
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!date || !supplier.trim() || !amountTtc.trim()) return;

    onAddInvoice({
      date,
      supplier,
      number,
      amountHt,
      amountVat,
      amountTtc,
      category,
      comment,
      fileUrl,
    });

    setDate(new Date().toISOString().slice(0, 10));
    setSupplier("");
    setNumber("");
    setAmountHt("");
    setAmountVat("");
    setAmountTtc("");
    setCategory(settings.purchaseCategories[0]);
    setComment("");
    setFileUrl("");
  }

  function confirmDelete() {
    if (!invoiceToDelete) return;

    onDeleteInvoice(invoiceToDelete.id);
    setInvoiceToDelete(null);
  }

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Achats</p>
            <h2>Nouvelle facture</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleSubmit}>
          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>

          <label>
            Fournisseur
            <input
              value={supplier}
              onChange={(event) => setSupplier(event.target.value)}
              placeholder="Ex : Metro, Transgourmet..."
            />
          </label>

          <label>
            Numéro
            <input
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              placeholder="Numéro de facture"
            />
          </label>

          <label>
            Montant HT
            <input
              inputMode="decimal"
              value={amountHt}
              onChange={(event) => setAmountHt(event.target.value)}
              placeholder="Ex : 120.50"
            />
          </label>

          <label>
            TVA
            <input
              inputMode="decimal"
              value={amountVat}
              onChange={(event) => setAmountVat(event.target.value)}
              placeholder="Ex : 24.10"
            />
          </label>

          <label>
            Montant TTC
            <input
              inputMode="decimal"
              value={amountTtc}
              onChange={(event) => setAmountTtc(event.target.value)}
              placeholder="Ex : 144.60"
            />
          </label>

          <label>
            Catégorie
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {settings.purchaseCategories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            PDF / photo
            <input
              value={fileUrl}
              onChange={(event) => setFileUrl(event.target.value)}
              placeholder="Lien fichier provisoire"
            />
          </label>

          <label>
            Commentaire
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Optionnel"
            />
          </label>

          <button className="primary-action" type="submit">
            Enregistrer la facture
          </button>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Historique</p>
            <h2>Factures d’achat</h2>
          </div>
          <span className="status-pill">{invoices.length}</span>
        </div>

        <div className="dish-list">
          {invoices.length === 0 ? (
            <div className="empty-state">
              <strong>Aucune facture</strong>
              <p>Les factures d’achat saisies apparaîtront ici.</p>
            </div>
          ) : (
            invoices.map((invoice) => (
              <div className="dish-row" key={invoice.id}>
                <div className="dish-photo">ACH</div>

                <div className="dish-info">
                  <div>
                    <strong>{invoice.supplier}</strong>
                    <span>{invoice.category}</span>
                  </div>
                  <p>
                    {formatDate(invoice.date)}
                    {invoice.number ? ` - Facture ${invoice.number}` : ""}
                  </p>
                  <p>
                    HT {invoice.amountHt || "0"} € | TVA{" "}
                    {invoice.amountVat || "0"} € | TTC {invoice.amountTtc} €
                  </p>
                  <p>
                    Saisie par {invoice.createdBy || currentUserName}
                    {invoice.comment ? ` - ${invoice.comment}` : ""}
                  </p>
                  {invoice.fileUrl ? <p>Fichier : {invoice.fileUrl}</p> : null}
                </div>

                <div className="dish-meta">
                  <strong>{invoice.amountTtc}</strong>
                  <span>€ TTC</span>
                </div>

                <div className="dish-actions">
                  <button
                    className="delete-action"
                    onClick={() => setInvoiceToDelete(invoice)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </article>

      {invoiceToDelete ? (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <p className="eyebrow">Confirmation</p>
            <h2>Supprimer cette facture ?</h2>
            <p>Cette action supprimera la facture d’achat de l’historique.</p>

            <div className="modal-actions">
              <button onClick={() => setInvoiceToDelete(null)}>Annuler</button>
              <button className="delete-action" onClick={confirmDelete}>
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}