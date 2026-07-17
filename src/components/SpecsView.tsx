"use client";

import { useMemo, useState } from "react";
import type { Dish, DishSpec, DishSpecItem } from "../types";
import {
  calculateDishCost,
  calculateSpecItemCost,
  formatCurrency,
  normalizeSpecs,
} from "../utils/calculations";

type SpecsViewProps = {
  dishes: Dish[];
  specs: DishSpec[];
  onAddSpecItem: (dishId: number, item: Omit<DishSpecItem, "id">) => void;
  onDeleteSpecItem: (dishId: number, itemId: number) => void;
};

export function SpecsView({
  dishes,
  specs,
  onAddSpecItem,
  onDeleteSpecItem,
}: SpecsViewProps) {
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

  const flatSpecs = normalizeSpecs(specs);
  const selectedItems = flatSpecs.filter((item) => item.dishId === selectedDishId);
  const selectedDishCost = calculateDishCost(selectedDishId, specs);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!dishId || !name.trim() || !quantity.trim() || !unit.trim()) return;

    onAddSpecItem(selectedDishId, {
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

          <div className="form-grid">
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
              <select value={unit} onChange={(event) => setUnit(event.target.value)}>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="unité">unité</option>
              </select>
            </label>

            <label>
              Prix achat au kg / litre / unité
              <input
                value={unitCost}
                onChange={(event) => setUnitCost(event.target.value)}
                placeholder="Ex : 7.90 pour 7,90 €/kg"
              />
            </label>
          </div>

          <button className="primary-action" type="submit">
            Ajouter au cahier
          </button>
        </form>

        <div className="panel">
          <div className="panel-title-row">
            <div>
              <h2>{selectedDish?.name || "Plat"}</h2>
              <p>{selectedItems.length} ligne(s)</p>
            </div>
            <strong>{formatCurrency(selectedDishCost)}</strong>
          </div>

          <div className="table-wrap readable-table">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Nom</th>
                  <th>Quantité</th>
                  <th>Prix achat</th>
                  <th>Total portion</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item) => {
                  const total = calculateSpecItemCost(item);

                  return (
                    <tr key={item.id}>
                      <td>{item.type === "ingredient" ? "Ingrédient" : "Consommable"}</td>
                      <td>{item.name}</td>
                      <td>
                        {item.quantity} {item.unit}
                      </td>
                      <td>{item.unitCost ? formatCurrency(Number(item.unitCost.replace(",", "."))) : "-"}</td>
                      <td>{formatCurrency(total)}</td>
                      <td>
                        <button
                          className="delete-action"
                          type="button"
                          onClick={() => onDeleteSpecItem(selectedDishId, item.id)}
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