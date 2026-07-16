import { useState } from "react";
import type { FormEvent } from "react";
import type { Dish, DishSpec, SpecItem } from "../types";

type SpecsViewProps = {
  dishes: Dish[];
  specs: DishSpec[];
  onAddSpecItem: (dishId: number, item: Omit<SpecItem, "id">) => void;
  onDeleteSpecItem: (dishId: number, itemId: number) => void;
};

export function SpecsView({
  dishes,
  specs,
  onAddSpecItem,
  onDeleteSpecItem,
}: SpecsViewProps) {
  const activeDishes = dishes.filter((dish) => dish.active);
  const [selectedDishId, setSelectedDishId] = useState(
    activeDishes[0]?.id.toString() || ""
  );
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g");
  const [type, setType] = useState<"ingredient" | "consommable">("ingredient");

  const dishId = Number(selectedDishId);
  const selectedDish = dishes.find((dish) => dish.id === dishId);
  const selectedSpec = specs.find((spec) => spec.dishId === dishId);
  const items = selectedSpec?.items || [];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!dishId || !name.trim() || !quantity.trim() || !unit.trim()) return;

    onAddSpecItem(dishId, { name, quantity, unit, type });

    setName("");
    setQuantity("");
    setUnit("g");
    setType("ingredient");
  }

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Fiche technique</p>
            <h2>Ajouter un besoin</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleSubmit}>
          <label>
            Plat
            <select
              value={selectedDishId}
              onChange={(event) => setSelectedDishId(event.target.value)}
            >
              {activeDishes.length === 0 ? (
                <option value="">Aucun plat actif</option>
              ) : (
                activeDishes.map((dish) => (
                  <option key={dish.id} value={dish.id}>
                    {dish.name}
                  </option>
                ))
              )}
            </select>
          </label>

          <label>
            Type
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as "ingredient" | "consommable")
              }
            >
              <option value="ingredient">Ingrédient</option>
              <option value="consommable">Emballage / consommable</option>
            </select>
          </label>

          <label>
            Nom
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex : poulet, riz, barquette"
            />
          </label>

          <label>
            Quantité exacte
            <input
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Ex : 150"
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

          <button className="primary-action" type="submit">
            Ajouter à la fiche
          </button>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Cahier des charges</p>
            <h2>{selectedDish?.name || "Aucun plat"}</h2>
          </div>
          <span className="status-pill">{items.length}</span>
        </div>

        <div className="dish-list">
          {items.length === 0 ? (
            <div className="empty-state">
              <strong>Aucune ligne</strong>
              <p>Ajoute les ingrédients et consommables exacts du plat.</p>
            </div>
          ) : (
            items.map((item) => (
              <div className="dish-row" key={item.id}>
                <div className="dish-photo">
                  {item.type === "ingredient" ? "ING" : "CON"}
                </div>

                <div className="dish-info">
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {item.type === "ingredient" ? "Ingrédient" : "Consommable"}
                    </span>
                  </div>
                  <p>
                    Quantité exacte : {item.quantity} {item.unit}
                  </p>
                </div>

                <div className="dish-meta">
                  <strong>{item.quantity}</strong>
                  <span>{item.unit}</span>
                </div>

                <div className="dish-actions">
                  <button
                    className="delete-action"
                    onClick={() => onDeleteSpecItem(dishId, item.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}