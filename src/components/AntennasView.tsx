import { useState } from "react";
import type { FormEvent } from "react";
import type {
  Antenna,
  AntennaDishStock,
  AntennaMovement,
  Dish,
} from "../types";
import {
  addDecimalStrings,
  formatDate,
  subtractDecimalStrings,
} from "../utils/calculations";

type AntennasViewProps = {
  antennas: Antenna[];
  dishes: Dish[];
  antennaStocks: AntennaDishStock[];
  antennaMovements: AntennaMovement[];
  currentUserName: string;
  onAddAntenna: (name: string) => void;
  onToggleAntenna: (id: number) => void;
  onDeleteAntenna: (id: number) => void;
  onAddAntennaMovement: (
    movement: Omit<AntennaMovement, "id" | "userName">
  ) => void;
};

export function AntennasView({
  antennas,
  dishes,
  antennaStocks,
  antennaMovements,
  currentUserName,
  onAddAntenna,
  onToggleAntenna,
  onDeleteAntenna,
  onAddAntennaMovement,
}: AntennasViewProps) {
  const activeDishes = dishes.filter((dish) => dish.active);
  const activeAntennas = antennas.filter((antenna) => antenna.active);

  const [antennaName, setAntennaName] = useState("");
  const [selectedAntennaId, setSelectedAntennaId] = useState("");
  const [selectedDishId, setSelectedDishId] = useState("");
  const [movementType, setMovementType] = useState<"ajout" | "retrait">("ajout");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [comment, setComment] = useState("");

  function handleCreateAntenna(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!antennaName.trim()) return;

    onAddAntenna(antennaName);
    setAntennaName("");
  }

  function handleCreateMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const antennaId = Number(selectedAntennaId);
    const dishId = Number(selectedDishId);

    if (!antennaId || !dishId || !quantity.trim() || !date) return;

    onAddAntennaMovement({
      antennaId,
      dishId,
      type: movementType,
      quantity,
      date,
      comment,
    });

    setSelectedAntennaId("");
    setSelectedDishId("");
    setMovementType("ajout");
    setQuantity("");
    setDate(new Date().toISOString().slice(0, 10));
    setComment("");
  }

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Lieux de vente</p>
            <h2>Nouvelle antenne</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleCreateAntenna}>
          <label>
            Nom
            <input
              value={antennaName}
              onChange={(event) => setAntennaName(event.target.value)}
              placeholder="Ex : Marché du samedi"
            />
          </label>

          <button className="primary-action" type="submit">
            Ajouter l'antenne
          </button>
        </form>

        <div className="panel-heading">
          <div>
            <p className="eyebrow">Répartition</p>
            <h2>Stock plat par antenne</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleCreateMovement}>
          <label>
            Antenne
            <select
              value={selectedAntennaId}
              onChange={(event) => setSelectedAntennaId(event.target.value)}
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
            Plat
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

          <label>
            Type
            <select
              value={movementType}
              onChange={(event) =>
                setMovementType(event.target.value as "ajout" | "retrait")
              }
            >
              <option value="ajout">Ajout sur antenne</option>
              <option value="retrait">Retrait d'antenne</option>
            </select>
          </label>

          <label>
            Quantité exacte
            <input
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Ex : 12"
            />
          </label>

          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>

          <label>
            Commentaire
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Ex : livraison, retour invendu"
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
            <p className="eyebrow">Antennes</p>
            <h2>Disponibilités</h2>
          </div>
          <span className="status-pill">{antennas.length}</span>
        </div>

        <div className="dish-list">
          {antennas.map((antenna) => {
            const stockLines = antennaStocks.filter(
              (stock) => stock.antennaId === antenna.id
            );

            return (
              <div className="panel" key={antenna.id}>
                <div className="panel-heading">
                  <div>
                    <h2>{antenna.name}</h2>
                    <p className="eyebrow">{antenna.active ? "Active" : "Inactive"}</p>
                  </div>

                  <div className="dish-actions">
                    <button
                      className={antenna.active ? "toggle active" : "toggle"}
                      onClick={() => onToggleAntenna(antenna.id)}
                    >
                      {antenna.active ? "Active" : "Inactive"}
                    </button>
                    <button
                      className="delete-action"
                      onClick={() => onDeleteAntenna(antenna.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="dish-list">
                  {stockLines.length === 0 ? (
                    <div className="empty-state">
                      <strong>Aucun plat</strong>
                      <p>Aucun stock plat enregistré sur cette antenne.</p>
                    </div>
                  ) : (
                    stockLines.map((stock) => {
                      const dish = dishes.find((item) => item.id === stock.dishId);

                      return (
                        <div className="dish-row" key={stock.id}>
                          <div className="dish-photo">PLAT</div>

                          <div className="dish-info">
                            <div>
                              <strong>{dish?.name || "Plat supprimé"}</strong>
                              <span>Disponible</span>
                            </div>
                            <p>Stock actuel sur antenne</p>
                          </div>

                          <div className="dish-meta">
                            <strong>{stock.quantity}</strong>
                            <span>portions</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}

          <div className="panel">
            <div className="panel-heading">
              <h2>Historique antennes</h2>
              <span className="status-pill">{antennaMovements.length}</span>
            </div>

            <div className="dish-list">
              {antennaMovements.length === 0 ? (
                <div className="empty-state">
                  <strong>Aucun mouvement</strong>
                  <p>Les ajouts et retraits de plats apparaîtront ici.</p>
                </div>
              ) : (
                antennaMovements.map((movement) => {
                  const antenna = antennas.find(
                    (item) => item.id === movement.antennaId
                  );
                  const dish = dishes.find((item) => item.id === movement.dishId);

                  return (
                    <div className="dish-row" key={movement.id}>
                      <div className="dish-photo">
                        {movement.type === "ajout" ? "IN" : "OUT"}
                      </div>

                      <div className="dish-info">
                        <div>
                          <strong>{dish?.name || "Plat supprimé"}</strong>
                          <span>{antenna?.name || "Antenne supprimée"}</span>
                        </div>
                        <p>
                          {formatDate(movement.date)} -{" "}
                          {movement.userName || currentUserName}
                        </p>
                        <p>{movement.comment || "Aucun commentaire."}</p>
                      </div>

                      <div className="dish-meta">
                        <strong>
                          {movement.type === "ajout" ? "+" : "-"}
                          {movement.quantity}
                        </strong>
                        <span>portions</span>
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

export function calculateNextAntennaStock(
  currentQuantity: string,
  movementType: "ajout" | "retrait",
  movementQuantity: string
) {
  if (movementType === "ajout") {
    return addDecimalStrings(currentQuantity, movementQuantity);
  }

  return subtractDecimalStrings(currentQuantity, movementQuantity);
}