import { useState } from "react";
import type { FormEvent } from "react";
import type { Dish, WeeklyMenu } from "../types";
import {
  formatDate,
  getMenuDishNames,
  isMenuActive,
} from "../utils/calculations";

type MenusViewProps = {
  dishes: Dish[];
  menus: WeeklyMenu[];
  onAddMenu: (menu: Omit<WeeklyMenu, "id">) => void;
  onDeleteMenu: (id: number) => void;
};

export function MenusView({
  dishes,
  menus,
  onAddMenu,
  onDeleteMenu,
}: MenusViewProps) {
  const activeDishes = dishes.filter((dish) => dish.active);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDishId, setSelectedDishId] = useState("");
  const [dishIds, setDishIds] = useState<number[]>([]);

  function addDishToMenu() {
    const dishId = Number(selectedDishId);

    if (!dishId || dishIds.includes(dishId)) return;

    setDishIds((current) => [...current, dishId]);
    setSelectedDishId("");
  }

  function removeDishFromMenu(dishId: number) {
    setDishIds((current) => current.filter((id) => id !== dishId));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !startDate || !endDate || dishIds.length === 0) return;

    onAddMenu({ name, startDate, endDate, dishIds });

    setName("");
    setStartDate("");
    setEndDate("");
    setSelectedDishId("");
    setDishIds([]);
  }

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Planification</p>
            <h2>Nouveau menu</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleSubmit}>
          <label>
            Nom du menu
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>

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

          <label>
            Ajouter un plat
            <select
              value={selectedDishId}
              onChange={(event) => setSelectedDishId(event.target.value)}
            >
              <option value="">Choisir un plat actif</option>
              {activeDishes.map((dish) => (
                <option key={dish.id} value={dish.id}>
                  {dish.name}
                </option>
              ))}
            </select>
          </label>

          <button className="primary-action" type="button" onClick={addDishToMenu}>
            Ajouter au menu
          </button>

          <div className="setting-list">
            {dishIds.length === 0 ? (
              <p>Aucun plat sélectionné.</p>
            ) : (
              dishIds.map((dishId) => {
                const dish = dishes.find((item) => item.id === dishId);

                return (
                  <p key={dishId}>
                    {dish?.name || "Plat supprimé"}{" "}
                    <button
                      className="delete-action"
                      type="button"
                      onClick={() => removeDishFromMenu(dishId)}
                    >
                      Retirer
                    </button>
                  </p>
                );
              })
            )}
          </div>

          <button className="primary-action" type="submit">
            Créer le menu
          </button>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Semaines</p>
            <h2>Menus créés</h2>
          </div>
          <span className="status-pill">{menus.length}</span>
        </div>

        <div className="dish-list">
          {menus.length === 0 ? (
            <div className="empty-state">
              <strong>Aucun menu</strong>
              <p>Crée un menu hebdomadaire avec ses dates et ses plats.</p>
            </div>
          ) : (
            menus.map((menu) => (
              <div className="dish-row" key={menu.id}>
                <div className="dish-photo">{isMenuActive(menu) ? "ON" : "OFF"}</div>

                <div className="dish-info">
                  <div>
                    <strong>{menu.name}</strong>
                    <span>{isMenuActive(menu) ? "Actif" : "Inactif"}</span>
                  </div>
                  <p>
                    Du {formatDate(menu.startDate)} au {formatDate(menu.endDate)}
                  </p>
                  <p>{getMenuDishNames(menu, dishes)}</p>
                </div>

                <div className="dish-meta">
                  <strong>{menu.dishIds.length}</strong>
                  <span>plats</span>
                </div>

                <div className="dish-actions">
                  <button className="delete-action" onClick={() => onDeleteMenu(menu.id)}>
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