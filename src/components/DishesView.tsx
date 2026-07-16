import { useState } from "react";
import type { FormEvent } from "react";
import type { Dish } from "../types";
import { settings } from "../data/initial-data";

type DishesViewProps = {
  dishes: Dish[];
  onAddDish: (dish: Omit<Dish, "id">) => void;
  onDeleteDish: (id: number) => void;
  onToggleDish: (id: number) => void;
};

export function DishesView({
  dishes,
  onAddDish,
  onDeleteDish,
  onToggleDish,
}: DishesViewProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(settings.dishCategories[0]);
  const [vat, setVat] = useState("5.5");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !price.trim()) return;

    onAddDish({ name, price, category, vat, description, photo, active: true });

    setName("");
    setPrice("");
    setCategory(settings.dishCategories[0]);
    setVat("5.5");
    setDescription("");
    setPhoto("");
  }

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h2>Nouveau plat</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleSubmit}>
          <label>
            Nom
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>

          <label>
            Prix TTC
            <input
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>

          <label>
            Catégorie
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {settings.dishCategories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            TVA
            <select value={vat} onChange={(event) => setVat(event.target.value)}>
              <option value="5.5">5,5 %</option>
            </select>
          </label>

          <label>
            Photo
            <input value={photo} onChange={(event) => setPhoto(event.target.value)} />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <button className="primary-action" type="submit">
            Ajouter le plat
          </button>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Plats</p>
            <h2>Liste des plats</h2>
          </div>
          <span className="status-pill">{dishes.length}</span>
        </div>

        <div className="dish-list">
          {dishes.map((dish) => (
            <div className="dish-row" key={dish.id}>
              <div className="dish-photo">{dish.photo ? "Photo" : "PHF"}</div>

              <div className="dish-info">
                <div>
                  <strong>{dish.name}</strong>
                  <span>{dish.category}</span>
                </div>
                <p>{dish.description || "Aucune description."}</p>
              </div>

              <div className="dish-meta">
                <strong>{dish.price} €</strong>
                <span>TVA {dish.vat} %</span>
              </div>

              <div className="dish-actions">
                <button
                  className={dish.active ? "toggle active" : "toggle"}
                  onClick={() => onToggleDish(dish.id)}
                >
                  {dish.active ? "Actif" : "Inactif"}
                </button>

                <button className="delete-action" onClick={() => onDeleteDish(dish.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}