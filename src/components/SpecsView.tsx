"use client";

import { useMemo, useState } from "react";
import type { Dish, SpecItem } from "../types";
import { calculateDishCost, formatCurrency } from "../utils/calculations";

type SpecsViewProps = {
  dishes: Dish[];
  specItems?: SpecItem[];
  specs?: SpecItem[];
  onAddSpecItem: (item: Omit<SpecItem, "id">) => void;
  onDeleteSpecItem: (id: number) => void;
};

export function SpecsView({
  dishes,
  specItems,
  specs,
  onAddSpecItem,
  onDeleteSpecItem,
}: SpecsViewProps) {
  const items = specItems || specs || [];
  const activeDishes = dishes.filter((dish) => dish.active);

  const [dishId, setDishId] = useState(activeDishes[0]?.id?.toString() || "");
  const [type, setType] = useState<"ingredient" | "consommable">("ingredient");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g");
  const [unitCost, setUnitCost] = useState("");

  const selectedDishId = Number(dishId);

  const selectedDish = useMemo(() => {
    return dishes.find((dish) => dish.id === selectedDishId);
  }, [dishes, selectedDishId]);

  const selectedItems = items.filter((item) => item.dishId === selectedDishId);
  const selectedDishCost = calculateDishCost(selectedDishId, items);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!dishId || !name.trim() || !quantity.trim() || !unit.trim()) return;

    onAddSpecItem({
      dishId: selectedDishId,
      type,
      name: name.trim(),
      quantity: quantity.trim(),
      unit: unit.trim(),
      unitCost: unitCost.trim(),
    });

    setName("");
    setQuantity("");
    setUnitCost("");
  }

  return (
    <section className="module-page">
      <div className="module-header">
        <div>
          <p className="eyebrow">Cahiers des charges</p>
          <h1>Recettes, coûts et consommables</h1>
        </div>

        <div className="summary-pill">
          Coût portion : {formatCurrency(selectedDishCost)}
        </div>
      </div>

      <div className="workspace-grid two-columns">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h2>Ajouter une ligne</h2>

          <label>
            Plat
            <select value={dishId} onChange={(event) => setDishId(event.target.value)}>
              {activeDishes.map((dish) => (
                <option key={dish.id} value={dish.id}>
                  {dish.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Type
            <select
              value={type}
              onChange={(event) => setType(event.target.value as "ingredient" | "consommable")}
            >
              <option value="ingredient">Ingrédient</option>
              <option value="consommable">Consommable</option>
            </select>
          </label>

          <label>
            Nom
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Poulet, riz, boîte..."
            />
          </label>

          <div className="form-row">
            <label>
              Quantité par portion
              <input
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="150"
              />
            </label>

            <label>
              Unité
              <input
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                placeholder="g, ml, unité"
              />
            </label>
          </div>

          <label>
            Prix unitaire achat
            <input
              value={unitCost}
              onChange={(event) => setUnitCost(event.target.value)}
              placeholder="Ex : 0.008 pour 0,008 €/g"
            />
          </label>

          <button className="primary-button" type="submit">
            Ajouter au cahier
          </button>
        </form>

        <div className="panel">
          <div className="panel-title-row">
            <h2>{selectedDish?.name || "Plat"}</h2>
            <span>{selectedItems.length} lignes</span>
          </div>

          <div className="table-wrap readable-table">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Nom</th>
                  <th>Qté</th>
                  <th>Coût unitaire</th>
                  <th>Total portion</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item) => {
                  const total =
                    Number(String(item.quantity).replace(",", ".")) *
                    Number(String(item.unitCost || "0").replace(",", "."));

                  return (
                    <tr key={item.id}>
                      <td>{item.type === "ingredient" ? "Ingrédient" : "Consommable"}</td>
                      <td>{item.name}</td>
                      <td>
                        {item.quantity} {item.unit}
                      </td>
                      <td>{item.unitCost ? formatCurrency(Number(item.unitCost)) : "-"}</td>
                      <td>{formatCurrency(Number.isFinite(total) ? total : 0)}</td>
                      <td>
                        <button
                          className="danger-button small-button"
                          type="button"
                          onClick={() => onDeleteSpecItem(item.id)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {selectedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6}>Aucune ligne pour ce plat.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}