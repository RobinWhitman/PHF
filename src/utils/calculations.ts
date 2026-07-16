import type {
  Dish,
  DishSpec,
  ProductionPlan,
  ShoppingNeed,
  StockItem,
  WeeklyMenu,
} from "../types";

export function isMenuActive(menu: WeeklyMenu) {
  const today = new Date().toISOString().slice(0, 10);
  return today >= menu.startDate && today <= menu.endDate;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

export function getMenuDishNames(menu: WeeklyMenu, dishes: Dish[]) {
  const names = menu.dishIds
    .map((dishId: number) => dishes.find((dish) => dish.id === dishId)?.name)
    .filter(Boolean);

  return names.length > 0 ? names.join(", ") : "Aucun plat.";
}

export function getProductionDishSummary(
  production: ProductionPlan,
  dishes: Dish[]
) {
  return production.lines
    .map((line) => {
      const dish = dishes.find((item) => item.id === line.dishId);
      return `${dish?.name || "Plat supprimé"} : ${line.portions} portions`;
    })
    .join(" | ");
}

export function getProductionNeedsSummary(
  production: ProductionPlan,
  dishes: Dish[],
  specs: DishSpec[]
) {
  const needs = production.lines.flatMap((line) => {
    const dish = dishes.find((item) => item.id === line.dishId);
    const spec = specs.find((item) => item.dishId === line.dishId);

    if (!dish || !spec) return [];

    return spec.items.map((item) => {
      const total = multiplyDecimalStrings(item.quantity, line.portions);
      return `${item.name} : ${total} ${item.unit}`;
    });
  });

  return needs.length > 0 ? needs.join(" | ") : "Aucun besoin calculable.";
}

export function getShoppingNeeds(
  production: ProductionPlan,
  specs: DishSpec[]
) {
  const totals: Record<string, ShoppingNeed> = {};

  production.lines.forEach((line) => {
    const spec = specs.find((item) => item.dishId === line.dishId);
    if (!spec) return;

    spec.items.forEach((item) => {
      const quantity = multiplyDecimalStrings(item.quantity, line.portions);
      const key = `${item.type}-${normalizeText(item.name)}-${item.unit}`;

      if (!totals[key]) {
        totals[key] = {
          name: item.name,
          quantity,
          unit: item.unit,
          type: item.type,
        };
        return;
      }

      totals[key].quantity = addDecimalStrings(totals[key].quantity, quantity);
    });
  });

  return Object.values(totals).sort((a, b) => a.name.localeCompare(b.name));
}

export function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function multiplyDecimalStrings(quantity: string, multiplier: string) {
  const cleanQuantity = quantity.replace(",", ".").trim();
  const cleanMultiplier = multiplier.replace(",", ".").trim();

  const quantityDecimals = cleanQuantity.split(".")[1]?.length || 0;
  const multiplierDecimals = cleanMultiplier.split(".")[1]?.length || 0;
  const totalDecimals = quantityDecimals + multiplierDecimals;

  const quantityInteger = Number(cleanQuantity.replace(".", ""));
  const multiplierInteger = Number(cleanMultiplier.replace(".", ""));

  if (Number.isNaN(quantityInteger) || Number.isNaN(multiplierInteger)) {
    return "0";
  }

  const result = (quantityInteger * multiplierInteger).toString();

  if (totalDecimals === 0) return result;

  const paddedResult = result.padStart(totalDecimals + 1, "0");
  const integerPart = paddedResult.slice(0, -totalDecimals);
  const decimalPart = paddedResult.slice(-totalDecimals).replace(/0+$/, "");

  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}

export function addDecimalStrings(first: string, second: string) {
  return calculateDecimalStrings(first, second, "add");
}

export function subtractDecimalStrings(first: string, second: string) {
  return calculateDecimalStrings(first, second, "subtract");
}

export function calculateDecimalStrings(
  first: string,
  second: string,
  operation: "add" | "subtract"
) {
  const cleanFirst = first.replace(",", ".").trim();
  const cleanSecond = second.replace(",", ".").trim();

  const firstDecimals = cleanFirst.split(".")[1]?.length || 0;
  const secondDecimals = cleanSecond.split(".")[1]?.length || 0;
  const totalDecimals = Math.max(firstDecimals, secondDecimals);

  const firstInteger = Number(
    cleanFirst
      .replace(".", "")
      .padEnd(
        cleanFirst.replace(".", "").length + totalDecimals - firstDecimals,
        "0"
      )
  );

  const secondInteger = Number(
    cleanSecond
      .replace(".", "")
      .padEnd(
        cleanSecond.replace(".", "").length + totalDecimals - secondDecimals,
        "0"
      )
  );

  if (Number.isNaN(firstInteger) || Number.isNaN(secondInteger)) {
    return "0";
  }

  const calculated =
    operation === "add"
      ? firstInteger + secondInteger
      : firstInteger - secondInteger;

  const sign = calculated < 0 ? "-" : "";
  const result = Math.abs(calculated).toString();

  if (totalDecimals === 0) return `${sign}${result}`;

  const paddedResult = result.padStart(totalDecimals + 1, "0");
  const integerPart = paddedResult.slice(0, -totalDecimals);
  const decimalPart = paddedResult.slice(-totalDecimals).replace(/0+$/, "");

  return decimalPart
    ? `${sign}${integerPart}.${decimalPart}`
    : `${sign}${integerPart}`;
}

export function isLowerOrEqualDecimal(first: string, second: string) {
  const difference = subtractDecimalStrings(first, second);
  return Number(difference) <= 0;
}

export function getStockCategoryLabel(category: StockItem["category"]) {
  if (category === "ingredient") return "ING";
  if (category === "consommable") return "CON";
  return "PLAT";
}

export function getStockCategoryName(category: StockItem["category"]) {
  if (category === "ingredient") return "Ingrédient";
  if (category === "consommable") return "Consommable";
  return "Plat préparé";
}