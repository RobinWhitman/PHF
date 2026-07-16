import { useState } from "react";
import type { FormEvent } from "react";
import type { StockItem, StockMovement } from "../types";
import {
  formatDate,
  getStockCategoryLabel,
  getStockCategoryName,
  isLowerOrEqualDecimal,
} from "../utils/calculations";

type StocksViewProps = {
  stockItems: StockItem[];
  stockMovements: StockMovement[];
  onAddStockItem: (item: Omit<StockItem, "id">) => void;
  onDeleteStockItem: (id: number) => void;
  onAddStockMovement: (movement: Omit<StockMovement, "id" | "userName">) => void;
};

export function StocksView({
  stockItems,
  stockMovements,
  onAddStockItem,
  onDeleteStockItem,
  onAddStockMovement,
}: StocksViewProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<StockItem["category"]>("ingredient");
  const [unit, setUnit] = useState("g");
  const [quantity, setQuantity] = useState("");
  const [minQuantity, setMinQuantity] = useState("");

  const [movementStockItemId, setMovementStockItemId] = useState("");
  const [movementType, setMovementType] = useState<"entrée" | "sortie">("entrée");
  const [movementQuantity, setMovementQuantity] = useState("");
  const [movementDate, setMovementDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [movementComment, setMovementComment] = useState("");

  function handleCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !unit.trim()) return;

    onAddStockItem({
      name,
      category,
      unit,
      quantity: quantity.trim() || "0",
      minQuantity: minQuantity.trim() || "0",
    });

    setName("");
    setCategory("ingredient");
    setUnit("g");
    setQuantity("");
    setMinQuantity("");
  }

  function handleCreateMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const stockItemId = Number(movementStockItemId);

    if (!stockItemId || !movementQuantity.trim() || !movementDate) return;

    onAddStockMovement({
      stockItemId,
      type: movementType,
      quantity: movementQuantity,
      date: movementDate,
      comment: movementComment,
    });

    setMovementStockItemId("");
    setMovementType("entrée");
    setMovementQuantity("");
    setMovementDate(new Date().toISOString().slice(0, 10));
    setMovementComment("");
  }

  const lowStockItems = stockItems.filter((item) =>
    isLowerOrEqualDecimal(item.quantity, item.minQuantity)
  );

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Stock</p>
            <h2>Nouvel article</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleCreateItem}>
          <label>
            Nom
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex : poulet, riz, barquette"
            />
          </label>

          <label>
            Catégorie
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as StockItem["category"])}
            >
              <option value="ingredient">Ingrédient</option>
              <option value="consommable">Consommable</option>
              <option value="plat">Plat préparé</option>
            </select>
          </label>

          <label>
            Unité
            <select value={unit} onChange={(event) => setUnit(event.target.value)}>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
              <option value="unité">unité</option>
            </select>
          </label>

          <label>
            Stock actuel
            <input
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Ex : 12.5"
            />
          </label>

          <label>
            Seuil faible
            <input
              inputMode="decimal"
              value={minQuantity}
              onChange={(event) => setMinQuantity(event.target.value)}
              placeholder="Ex : 2"
            />
          </label>

          <button className="primary-action" type="submit">
            Ajouter l'article
          </button>
        </form>

        <div className="panel-heading">
          <div>
            <p className="eyebrow">Mouvement</p>
            <h2>Entrée / sortie</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleCreateMovement}>
          <label>
            Article
            <select
              value={movementStockItemId}
              onChange={(event) => setMovementStockItemId(event.target.value)}
            >
              <option value="">Choisir un article</option>
              {stockItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.quantity} {item.unit}
                </option>
              ))}
            </select>
          </label>

          <label>
            Type
            <select
              value={movementType}
              onChange={(event) =>
                setMovementType(event.target.value as "entrée" | "sortie")
              }
            >
              <option value="entrée">Entrée en stock</option>
              <option value="sortie">Sortie de stock</option>
            </select>
          </label>

          <label>
            Quantité exacte
            <input
              inputMode="decimal"
              value={movementQuantity}
              onChange={(event) => setMovementQuantity(event.target.value)}
              placeholder="Ex : 3.5"
            />
          </label>

          <label>
            Date
            <input
              type="date"
              value={movementDate}
              onChange={(event) => setMovementDate(event.target.value)}
            />
          </label>

          <label>
            Commentaire
            <input
              value={movementComment}
              onChange={(event) => setMovementComment(event.target.value)}
              placeholder="Ex : achat Metro, correction, production"
            />
          </label>

          <button className="primary-action" type="submit">
            Enregistrer le mouvement
          </button>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Stock actuel</p>
            <h2>Articles</h2>
          </div>
          <span className="status-pill">{stockItems.length}</span>
        </div>

        <div className="dish-list">
          {lowStockItems.length > 0 ? (
            <div className="panel">
              <div className="panel-heading">
                <h2>Stocks faibles</h2>
                <span className="status-pill">{lowStockItems.length}</span>
              </div>

              <div className="alert-list">
                {lowStockItems.map((item) => (
                  <p key={item.id}>
                    {item.name} : {item.quantity} {item.unit}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          {stockItems.length === 0 ? (
            <div className="empty-state">
              <strong>Aucun article</strong>
              <p>Ajoute tes ingrédients, consommables ou plats préparés.</p>
            </div>
          ) : (
            stockItems.map((item) => (
              <div className="dish-row" key={item.id}>
                <div className="dish-photo">{getStockCategoryLabel(item.category)}</div>

                <div className="dish-info">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{getStockCategoryName(item.category)}</span>
                  </div>
                  <p>
                    Seuil faible : {item.minQuantity} {item.unit}
                  </p>
                </div>

                <div className="dish-meta">
                  <strong>{item.quantity}</strong>
                  <span>{item.unit}</span>
                </div>

                <div className="dish-actions">
                  <button
                    className="delete-action"
                    onClick={() => onDeleteStockItem(item.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="panel">
            <div className="panel-heading">
              <h2>Historique</h2>
              <span className="status-pill">{stockMovements.length}</span>
            </div>

            <div className="dish-list">
              {stockMovements.length === 0 ? (
                <div className="empty-state">
                  <strong>Aucun mouvement</strong>
                  <p>Les entrées et sorties de stock apparaîtront ici.</p>
                </div>
              ) : (
                stockMovements.map((movement) => {
                  const item = stockItems.find(
                    (stockItem) => stockItem.id === movement.stockItemId
                  );

                  return (
                    <div className="dish-row" key={movement.id}>
                      <div className="dish-photo">
                        {movement.type === "entrée" ? "IN" : "OUT"}
                      </div>

                      <div className="dish-info">
                        <div>
                          <strong>{item?.name || "Article supprimé"}</strong>
                          <span>{movement.type}</span>
                        </div>
                        <p>
                          {formatDate(movement.date)} - {movement.userName}
                        </p>
                        <p>{movement.comment || "Aucun commentaire."}</p>
                      </div>

                      <div className="dish-meta">
                        <strong>
                          {movement.type === "entrée" ? "+" : "-"}
                          {movement.quantity}
                        </strong>
                        <span>{item?.unit || ""}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}