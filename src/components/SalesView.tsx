import { useState } from "react";
import type { FormEvent } from "react";
import type {
  Antenna,
  AntennaDishStock,
  Dish,
  Sale,
  SaleLine,
} from "../types";
import { settings } from "../data/initial-data";
import { formatDate } from "../utils/calculations";

type SalesViewProps = {
  antennas: Antenna[];
  dishes: Dish[];
  antennaStocks: AntennaDishStock[];
  sales: Sale[];
  currentUserName: string;
  onAddSale: (sale: Omit<Sale, "id" | "userName">) => void;
};

export function SalesView({
  antennas,
  dishes,
  antennaStocks,
  sales,
  currentUserName,
  onAddSale,
}: SalesViewProps) {
  const activeAntennas = antennas.filter((antenna) => antenna.active);
  const [selectedAntennaId, setSelectedAntennaId] = useState("");
  const [selectedDishId, setSelectedDishId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(settings.payments[0]);
  const [comment, setComment] = useState("");
  const [lines, setLines] = useState<SaleLine[]>([]);

  const antennaId = Number(selectedAntennaId);
  const availableStocks = antennaStocks.filter(
    (stock) => stock.antennaId === antennaId && Number(stock.quantity) > 0
  );

  function addLine() {
    const dishId = Number(selectedDishId);
    const dish = dishes.find((item) => item.id === dishId);

    if (!dish || !quantity.trim()) return;

    setLines((currentLines) => {
      const existingLine = currentLines.find((line) => line.dishId === dishId);

      if (existingLine) {
        return currentLines.map((line) =>
          line.dishId === dishId ? { ...line, quantity } : line
        );
      }

      return [
        ...currentLines,
        {
          dishId,
          quantity,
          unitPrice: dish.price,
        },
      ];
    });

    setSelectedDishId("");
    setQuantity("");
  }

  function removeLine(dishId: number) {
    setLines((currentLines) =>
      currentLines.filter((line) => line.dishId !== dishId)
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!antennaId || lines.length === 0) return;

    const now = new Date();

    onAddSale({
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      antennaId,
      paymentMethod,
      comment,
      lines,
    });

    setSelectedAntennaId("");
    setSelectedDishId("");
    setQuantity("");
    setPaymentMethod(settings.payments[0]);
    setComment("");
    setLines([]);
  }

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Vente rapide</p>
            <h2>Nouvelle vente</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleSubmit}>
          <label>
            Antenne
            <select
              value={selectedAntennaId}
              onChange={(event) => {
                setSelectedAntennaId(event.target.value);
                setSelectedDishId("");
                setLines([]);
              }}
            >
              <option value="">Choisir une antenne</option>
              {activeAntennas.map((antenna) => (
                <option key={antenna.id} value={antenna.id}>
                  {antenna.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Plat disponible
            <select
              value={selectedDishId}
              onChange={(event) => setSelectedDishId(event.target.value)}
            >
              <option value="">Choisir un plat</option>
              {availableStocks.map((stock) => {
                const dish = dishes.find((item) => item.id === stock.dishId);

                if (!dish) return null;

                return (
                  <option key={stock.id} value={dish.id}>
                    {dish.name} - dispo {stock.quantity}
                  </option>
                );
              })}
            </select>
          </label>

          <label>
            Quantité
            <input
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Ex : 2"
            />
          </label>

          <button className="primary-action" type="button" onClick={addLine}>
            Ajouter à la vente
          </button>

          <div className="setting-list">
            {lines.length === 0 ? (
              <p>Aucun plat sélectionné.</p>
            ) : (
              lines.map((line) => {
                const dish = dishes.find((item) => item.id === line.dishId);

                return (
                  <p key={line.dishId}>
                    {dish?.name || "Plat supprimé"} - {line.quantity} x{" "}
                    {line.unitPrice} €{" "}
                    <button
                      className="delete-action"
                      type="button"
                      onClick={() => removeLine(line.dishId)}
                    >
                      Retirer
                    </button>
                  </p>
                );
              })
            )}
          </div>

          <label>
            Moyen de paiement
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              {settings.payments.map((payment) => (
                <option key={payment}>{payment}</option>
              ))}
            </select>
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
            Enregistrer la vente
          </button>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Historique</p>
            <h2>Ventes enregistrées</h2>
          </div>
          <span className="status-pill">{sales.length}</span>
        </div>

        <div className="dish-list">
          {sales.length === 0 ? (
            <div className="empty-state">
              <strong>Aucune vente</strong>
              <p>Les ventes apparaîtront ici après encaissement.</p>
            </div>
          ) : (
            sales.map((sale) => {
              const antenna = antennas.find((item) => item.id === sale.antennaId);
              const total = getSaleTotal(sale);

              return (
                <div className="dish-row" key={sale.id}>
                  <div className="dish-photo">SALE</div>

                  <div className="dish-info">
                    <div>
                      <strong>{total} €</strong>
                      <span>{sale.paymentMethod}</span>
                    </div>
                    <p>
                      {formatDate(sale.date)} à {sale.time} -{" "}
                      {antenna?.name || "Antenne supprimée"}
                    </p>
                    <p>{getSaleSummary(sale, dishes)}</p>
                    <p>
                      Créé par {sale.userName || currentUserName}
                      {sale.comment ? ` - ${sale.comment}` : ""}
                    </p>
                  </div>

                  <div className="dish-meta">
                    <strong>{sale.lines.length}</strong>
                    <span>lignes</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </article>
    </section>
  );
}

function getSaleSummary(sale: Sale, dishes: Dish[]) {
  return sale.lines
    .map((line) => {
      const dish = dishes.find((item) => item.id === line.dishId);
      return `${dish?.name || "Plat supprimé"} x ${line.quantity}`;
    })
    .join(" | ");
}

function getSaleTotal(sale: Sale) {
  const total = sale.lines.reduce((sum, line) => {
    return sum + Number(line.quantity) * Number(line.unitPrice);
  }, 0);

  return total.toFixed(2);
}