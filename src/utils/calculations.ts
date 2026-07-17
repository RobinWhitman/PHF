import type {
  Dish,
  DishSpec,
  DishSpecItem,
  NeedLine,
  ProductionLine,
  ProductionPlan,
  PurchaseInvoice,
  Sale,
  SpecItem,
  WeeklyMenu,
} from "../types";

type AnySpecInput = DishSpec[] | DishSpecItem[] | SpecItem[];

type AnyStockMovement = {
  itemId?: number;
  stockItemId?: number;
  type: string;
  quantity: string;
};

export function toNumber(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export function toDecimalString(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return String(Math.round(value * 1000) / 1000);
}

export function normalizeSpecs(specs: AnySpecInput): DishSpecItem[] {
  return specs.flatMap((spec) => {
    if ("items" in spec) return spec.items;
    return [spec as DishSpecItem];
  });
}

export function addDecimalStrings(first: string, second: string): string {
  return toDecimalString(toNumber(first) + toNumber(second));
}

export function subtractDecimalStrings(first: string, second: string): string {
  return toDecimalString(toNumber(first) - toNumber(second));
}

export function isLowerOrEqualDecimal(first: string, second: string): boolean {
  return toNumber(first) <= toNumber(second);
}

export function formatDate(value: string): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("fr-FR");
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export function calculateSpecItemCost(item: DishSpecItem): number {
  const quantity = toNumber(item.quantity);
  const unitCost = toNumber(item.unitCost);
  const unit = item.unit.toLowerCase();

  if (unit === "g" || unit === "ml") {
    return (quantity / 1000) * unitCost;
  }

  return quantity * unitCost;
}

export function getStockCategoryLabel(category: string): string {
  if (category === "ingredient") return "Ingrédient";
  if (category === "consommable") return "Consommable";
  if (category === "plat") return "Plat préparé";
  return category || "-";
}

export function getStockCategoryName(category: string): string {
  if (category === "ingredient") return "Ingrédients";
  if (category === "consommable") return "Consommables";
  if (category === "plat") return "Plats préparés";
  return category || "-";
}

export function isStockEntry(type: string): boolean {
  return type === "entrée" || type === "Entrée" || type === "ajout" || type === "Ajout";
}

export function isMenuActive(menu: { startDate: string; endDate: string }): boolean {
  const today = new Date();
  const start = new Date(menu.startDate);
  const end = new Date(menu.endDate);

  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return today >= start && today <= end;
}

export function getMenuDishNames(menuOrDishIds: WeeklyMenu | number[], dishes: Dish[]): string {
  const dishIds = Array.isArray(menuOrDishIds) ? menuOrDishIds : menuOrDishIds.dishIds;

  if (!dishIds.length) return "Aucun plat";

  return dishIds
    .map((dishId) => dishes.find((dish) => dish.id === dishId)?.name || "Plat inconnu")
    .join(", ");
}

export function calculateDishCost(dishId: number, specs: AnySpecInput): number {
  return normalizeSpecs(specs)
    .filter((item) => item.dishId === dishId)
    .reduce((total, item) => total + calculateSpecItemCost(item), 0);
}

export function calculateSaleLineRevenue(
  dishId: number,
  quantity: string,
  dishes: Dish[],
  unitPrice?: string,
): number {
  const dish = dishes.find((item) => item.id === dishId);
  return toNumber(quantity) * toNumber(unitPrice || dish?.price);
}

export function calculateSaleLineCost(
  dishId: number,
  quantity: string,
  specs: AnySpecInput,
): number {
  return toNumber(quantity) * calculateDishCost(dishId, specs);
}

export function calculateSaleRevenue(sale: Sale, dishes: Dish[]): number {
  return sale.lines.reduce((total, line) => {
    return total + calculateSaleLineRevenue(line.dishId, line.quantity, dishes, line.unitPrice);
  }, 0);
}

export function calculateSaleCost(sale: Sale, specs: AnySpecInput): number {
  return sale.lines.reduce((total, line) => {
    return total + calculateSaleLineCost(line.dishId, line.quantity, specs);
  }, 0);
}

export function calculateSalesRevenue(sales: Sale[], dishes: Dish[]): number {
  return sales.reduce((total, sale) => total + calculateSaleRevenue(sale, dishes), 0);
}

export function calculateSalesCost(sales: Sale[], specs: AnySpecInput): number {
  return sales.reduce((total, sale) => total + calculateSaleCost(sale, specs), 0);
}

export function calculateSalesProfit(
  sales: Sale[],
  dishes: Dish[],
  specs: AnySpecInput,
): number {
  return calculateSalesRevenue(sales, dishes) - calculateSalesCost(sales, specs);
}

export function calculatePurchaseTotal(purchaseInvoices: PurchaseInvoice[]): number {
  return purchaseInvoices.reduce((total, invoice) => {
    return total + toNumber(invoice.amountTtc || invoice.ttc);
  }, 0);
}

function getProductionLines(productionOrLines: ProductionPlan | ProductionLine[]): ProductionLine[] {
  return Array.isArray(productionOrLines) ? productionOrLines : productionOrLines.lines;
}

export function getProductionDishSummary(
  productionOrLines: ProductionPlan | ProductionLine[],
  dishes: Dish[],
): string {
  const lines = getProductionLines(productionOrLines);

  if (!lines.length) return "Aucun plat";

  return lines
    .map((line) => {
      const dish = dishes.find((item) => item.id === line.dishId);
      const quantity = line.portions || line.quantity || "0";
      return `${dish?.name || "Plat inconnu"} x ${quantity}`;
    })
    .join(", ");
}

export function calculateProductionNeeds(
  productionPlan: ProductionPlan,
  dishes: Dish[],
  specs: AnySpecInput,
): NeedLine[] {
  const flatSpecs = normalizeSpecs(specs);

  return productionPlan.lines.flatMap((line) => {
    const dish = dishes.find((item) => item.id === line.dishId);
    const portions = toNumber(line.portions || line.quantity || "0");

    return flatSpecs
      .filter((item) => item.dishId === line.dishId)
      .map((item) => ({
        dishId: line.dishId,
        dishName: dish?.name || "Plat inconnu",
        type: item.type,
        name: item.name,
        quantity: toNumber(item.quantity) * portions,
        unit: item.unit,
      }));
  });
}

export function getProductionNeedsSummary(
  productionPlan: ProductionPlan,
  _dishes: Dish[],
  specs: AnySpecInput,
): string {
  const needs = getShoppingNeeds(productionPlan, specs);

  if (!needs.length) return "Aucun besoin calculé";

  return needs.map((need) => `${need.name} : ${need.quantity} ${need.unit}`).join(", ");
}

export function getShoppingNeeds(
  productionPlan: ProductionPlan,
  specs: AnySpecInput,
): {
  id: number;
  type: "ingredient" | "consommable";
  name: string;
  quantity: string;
  unit: string;
}[] {
  const flatSpecs = normalizeSpecs(specs);

  const rawNeeds = productionPlan.lines.flatMap((line) => {
    const portions = toNumber(line.portions || line.quantity || "0");

    return flatSpecs
      .filter((item) => item.dishId === line.dishId)
      .map((item) => ({
        type: item.type,
        name: item.name,
        quantity: toNumber(item.quantity) * portions,
        unit: item.unit,
      }));
  });

  const grouped = new Map<
    string,
    { type: "ingredient" | "consommable"; name: string; quantity: number; unit: string }
  >();

  rawNeeds.forEach((need) => {
    const key = `${need.type}-${need.name}-${need.unit}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, { ...need });
      return;
    }

    grouped.set(key, {
      ...existing,
      quantity: existing.quantity + need.quantity,
    });
  });

  return Array.from(grouped.values()).map((need, index) => ({
    id: index + 1,
    type: need.type,
    name: need.name,
    quantity: toDecimalString(need.quantity),
    unit: need.unit,
  }));
}

export function aggregateNeeds(lines: NeedLine[]): NeedLine[] {
  const grouped = new Map<string, NeedLine>();

  lines.forEach((line) => {
    const key = `${line.type}-${line.name}-${line.unit}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, { ...line });
      return;
    }

    grouped.set(key, {
      ...existing,
      quantity: existing.quantity + line.quantity,
    });
  });

  return Array.from(grouped.values());
}

export function getStockQuantity(itemId: number, movements: AnyStockMovement[]): number {
  return movements
    .filter((movement) => (movement.stockItemId ?? movement.itemId) === itemId)
    .reduce((total, movement) => {
      const quantity = toNumber(movement.quantity);
      return isStockEntry(movement.type) ? total + quantity : total - quantity;
    }, 0);
}

export function getAntennaDishQuantity(
  antennaId: number,
  dishId: number,
  movements: { antennaId: number; dishId: number; type: string; quantity: string }[],
): number {
  return movements
    .filter((movement) => movement.antennaId === antennaId && movement.dishId === dishId)
    .reduce((total, movement) => {
      const quantity = toNumber(movement.quantity);
      return isStockEntry(movement.type) ? total + quantity : total - quantity;
    }, 0);
}