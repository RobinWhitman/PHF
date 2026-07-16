import { useState } from "react";
import type { Dish, DishSpec, ProductionPlan, ShoppingNeed } from "../types";
import {
  formatDate,
  getProductionDishSummary,
  getShoppingNeeds,
} from "../utils/calculations";

type ShoppingListViewProps = {
  dishes: Dish[];
  specs: DishSpec[];
  productions: ProductionPlan[];
};

export function ShoppingListView({
  dishes,
  specs,
  productions,
}: ShoppingListViewProps) {
  const [selectedProductionId, setSelectedProductionId] = useState("");

  const selectedProduction =
    productions.find((production) => production.id === Number(selectedProductionId)) ||
    productions[0];

  const needs = selectedProduction ? getShoppingNeeds(selectedProduction, specs) : [];
  const ingredients = needs.filter((need) => need.type === "ingredient");
  const consumables = needs.filter((need) => need.type === "consommable");

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Calcul théorique</p>
            <h2>Production source</h2>
          </div>
        </div>

        <form className="entity-form">
          <label>
            Production
            <select
              value={selectedProduction?.id || ""}
              onChange={(event) => setSelectedProductionId(event.target.value)}
            >
              {productions.length === 0 ? (
                <option value="">Aucune production</option>
              ) : (
                productions.map((production) => (
                  <option key={production.id} value={production.id}>
                    {production.name}
                  </option>
                ))
              )}
            </select>
          </label>

          <div className="setting-list">
            {selectedProduction ? (
              <>
                <p>Date : {formatDate(selectedProduction.date)}</p>
                <p>{getProductionDishSummary(selectedProduction, dishes)}</p>
                <p>Aucun arrondi appliqué.</p>
              </>
            ) : (
              <p>Crée d’abord une production.</p>
            )}
          </div>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Liste de courses</p>
            <h2>Quantités exactes</h2>
          </div>
          <span className="status-pill">{needs.length}</span>
        </div>

        <div className="dish-list">
          {!selectedProduction ? (
            <div className="empty-state">
              <strong>Aucune production</strong>
              <p>La liste de courses sera calculée depuis une production.</p>
            </div>
          ) : (
            <>
              <ShoppingSection title="Ingrédients" items={ingredients} />
              <ShoppingSection title="Emballages / consommables" items={consumables} />
            </>
          )}
        </div>
      </article>
    </section>
  );
}

function ShoppingSection({
  title,
  items,
}: {
  title: string;
  items: ShoppingNeed[];
}) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        <span className="status-pill">{items.length}</span>
      </div>

      <div className="dish-list">
        {items.length === 0 ? (
          <div className="empty-state">
            <strong>Aucune ligne</strong>
            <p>Rien à calculer pour cette catégorie.</p>
          </div>
        ) : (
          items.map((item) => (
            <div className="dish-row" key={`${item.type}-${item.name}-${item.unit}`}>
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
                <p>Quantité théorique exacte</p>
              </div>

              <div className="dish-meta">
                <strong>{item.quantity}</strong>
                <span>{item.unit}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}