"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { PDFDocument } from "pdf-lib";
import type { Dish, DishSpec, DishSpecItem, ProductionLine, ProductionPlan, WeeklyMenu } from "../types";
import {
  formatDate,
  getProductionDishSummary,
  getProductionNeedsSummary,
  normalizeSpecs,
  toNumber,
} from "../utils/calculations";

type ProductionViewProps = {
  dishes: Dish[];
  specs: DishSpec[];
  menus: WeeklyMenu[];
  productions: ProductionPlan[];
  onAddProduction: (production: Omit<ProductionPlan, "id">) => void;
  onDeleteProduction: (id: number) => void;
};

const productionTemplateUrl = "/FICHE%20PRODUCTION%20REMPLISSABLE.pdf";

const starchKeywords = ["riz", "pates", "semoule", "quinoa", "patate", "pomme de terre"];
const meatKeywords = ["poulet", "boeuf", "dinde", "agneau", "thon", "saumon"];
const sauceKeywords = ["sauce"];

export function ProductionView({
  dishes,
  specs,
  menus,
  productions,
  onAddProduction,
  onDeleteProduction,
}: ProductionViewProps) {
  const activeDishes = dishes.filter((dish) => dish.active);
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [selectedDishId, setSelectedDishId] = useState("");
  const [portions, setPortions] = useState("");
  const [lines, setLines] = useState<ProductionLine[]>([]);

  function loadMenu() {
    const menu = menus.find((item) => item.id === Number(selectedMenuId));
    if (!menu) return;

    setLines(menu.dishIds.map((dishId) => ({ dishId, portions: "" })));
    setName(menu.name);
  }

  function addLine() {
    const dishId = Number(selectedDishId);
    if (!dishId || !portions.trim()) return;

    setLines((current) => {
      const existingLine = current.find((line) => line.dishId === dishId);

      if (existingLine) {
        return current.map((line) =>
          line.dishId === dishId ? { ...line, portions } : line
        );
      }

      return [{ dishId, portions }, ...current];
    });

    setSelectedDishId("");
    setPortions("");
  }

  function updateLinePortions(dishId: number, value: string) {
    setLines((current) =>
      current.map((line) =>
        line.dishId === dishId ? { ...line, portions: value } : line
      )
    );
  }

  function removeLine(dishId: number) {
    setLines((current) => current.filter((line) => line.dishId !== dishId));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validLines = lines.filter((line) => line.portions.trim());
    if (!name.trim() || !date || validLines.length === 0) return;

    onAddProduction({ name, date, lines: validLines });

    setName("");
    setDate(new Date().toISOString().slice(0, 10));
    setSelectedMenuId("");
    setSelectedDishId("");
    setPortions("");
    setLines([]);
  }

  async function generateProductionPdf(production: ProductionPlan) {
    const response = await fetch(productionTemplateUrl);
    const existingPdfBytes = await response.arrayBuffer();

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    safeSetText(form, "date_production", formatDateForPdf(production.date));

    const flatSpecs = normalizeSpecs(specs);

    production.lines.slice(0, 10).forEach((line, index) => {
      const position = index + 1;
      const dish = dishes.find((item) => item.id === line.dishId);
      const dishSpecs = flatSpecs.filter((item) => item.dishId === line.dishId);
      const portionsCount = toNumber(line.portions || line.quantity || "0");

      safeSetText(form, `nom_plat${position}`, dish?.name || "");
      safeSetText(form, `qte_plats${position}`, portionsCount ? `x ${toCleanNumber(portionsCount)}` : "");
      safeSetText(
        form,
        `qte_feculents${position}`,
        formatGramQuantity(calculateIngredientCategoryTotal(dishSpecs, portionsCount, starchKeywords))
      );
      safeSetText(
        form,
        `qte_viande${position}`,
        formatGramQuantity(calculateIngredientCategoryTotal(dishSpecs, portionsCount, meatKeywords))
      );
      safeSetText(form, `sauce${position}`, hasKeyword(dishSpecs, sauceKeywords) ? "Oui" : "Non");
    });

    for (let position = production.lines.length + 1; position <= 10; position += 1) {
      safeSetText(form, `nom_plat${position}`, "");
      safeSetText(form, `qte_plats${position}`, "");
      safeSetText(form, `qte_feculents${position}`, "");
      safeSetText(form, `qte_viande${position}`, "");
      safeSetText(form, `sauce${position}`, "");
    }

    form.flatten();

    const pdfBytes = await pdfDoc.save();
    const pdfArrayBuffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    ) as ArrayBuffer;

    const blob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `fiche-production-${production.date}.pdf`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Prévision</p>
            <h2>Nouvelle production</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleSubmit}>
          <label>
            Nom
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex : Production semaine 29"
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
            Charger depuis un menu
            <select
              value={selectedMenuId}
              onChange={(event) => setSelectedMenuId(event.target.value)}
            >
              <option value="">Choisir un menu</option>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name}
                </option>
              ))}
            </select>
          </label>

          <button className="primary-action" type="button" onClick={loadMenu}>
            Charger le menu
          </button>

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
            Portions prévues
            <input
              inputMode="decimal"
              value={portions}
              onChange={(event) => setPortions(event.target.value)}
              placeholder="Ex : 60"
            />
          </label>

          <button className="primary-action" type="button" onClick={addLine}>
            Ajouter le plat
          </button>

          <div className="setting-list">
            {lines.length === 0 ? (
              <p>Aucun plat en production.</p>
            ) : (
              lines.map((line) => {
                const dish = dishes.find((item) => item.id === line.dishId);

                return (
                  <p key={line.dishId}>
                    {dish?.name || "Plat supprimé"}{" "}
                    <input
                      inputMode="decimal"
                      value={line.portions}
                      onChange={(event) =>
                        updateLinePortions(line.dishId, event.target.value)
                      }
                      placeholder="Portions"
                    />{" "}
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

          <button className="primary-action" type="submit">
            Enregistrer la production
          </button>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Productions</p>
            <h2>Prévisions créées</h2>
          </div>
          <span className="status-pill">{productions.length}</span>
        </div>

        <div className="dish-list">
          {productions.length === 0 ? (
            <div className="empty-state">
              <strong>Aucune production</strong>
              <p>Crée une production pour calculer les besoins théoriques.</p>
            </div>
          ) : (
            productions.map((production) => (
              <div className="dish-row production-row" key={production.id}>
                <div className="dish-photo">PROD</div>

                <div className="dish-info">
                  <div>
                    <strong>{production.name}</strong>
                    <span>{formatDate(production.date)}</span>
                  </div>
                  <p>{getProductionDishSummary(production, dishes)}</p>
                  <p>{getProductionNeedsSummary(production, dishes, specs)}</p>
                </div>

                <div className="dish-meta">
                  <strong>{production.lines.length}</strong>
                  <span>plats</span>
                </div>

                <div className="dish-actions">
                  <button
                    className="primary-action"
                    type="button"
                    onClick={() => generateProductionPdf(production)}
                  >
                    Fiche PDF
                  </button>

                  <button
                    className="delete-action"
                    onClick={() => onDeleteProduction(production.id)}
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

function normalizeKeyword(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .trim();
}

function hasKeyword(items: DishSpecItem[], keywords: string[]) {
  return items.some((item) => {
    const normalizedName = normalizeKeyword(item.name);
    return keywords.some((keyword) => normalizedName.includes(keyword));
  });
}

function calculateIngredientCategoryTotal(
  items: DishSpecItem[],
  portions: number,
  keywords: string[]
) {
  return items.reduce((total, item) => {
    const normalizedName = normalizeKeyword(item.name);
    const matches = keywords.some((keyword) => normalizedName.includes(keyword));

    if (!matches) return total;

    return total + convertToGrams(item.quantity, item.unit) * portions;
  }, 0);
}

function convertToGrams(quantity: string, unit: string) {
  const value = toNumber(quantity);
  const normalizedUnit = normalizeKeyword(unit);

  if (normalizedUnit === "kg") return value * 1000;
  if (normalizedUnit === "g") return value;

  return value;
}

function formatGramQuantity(value: number) {
  if (!value) return "";
  return `${toCleanNumber(value)} g`;
}

function toCleanNumber(value: number) {
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 100) / 100).replace(".", ",");
}

function formatDateForPdf(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function safeSetText(form: ReturnType<PDFDocument["getForm"]>, fieldName: string, value: string) {
  try {
    form.getTextField(fieldName).setText(value);
  } catch {
    // Le modèle actuel n'a pas forcément qte_plats1 : on ignore les champs absents.
  }
}