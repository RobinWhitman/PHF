import type {
  Dish,
  DishSpec,
  DishSpecItem,
  NeedLine,
  ProductionPlan,
  PurchaseInvoice,
  Sale,
  SpecItem,
} from "../types";

type AnySpecInput = DishSpec[] | DishSpecItem[] | SpecItem[];

type LegacyProductionLine = {
  dishId: number;
  portions?: string;
  quantity?: string;
};

type LegacyProductionPlan = {
  id: number;
  name: string;
  date: string;
  menuId?: number | null;
  lines: LegacyProductionLine[];
};

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

  const rounded = Math.round(value * 1000) / 1000;

  return String(rounded);
}

export function normalizeSpecs(specs: AnySpecInput): DishSpecItem[] {
  return specs.flatMap((spec) => {
    if ("items" in spec) {
      return spec.items;
    }

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

export function getStockCategoryLabel(type: string): string {
  if (type === "ingredient") return "Ingrédient";
  if (type === "consommable") return "Consommable";

  return type || "-";
}

export function getStockCategoryName(type: string): string {
  if (type === "ingredient") return "Ingrédients";
  if (type === "consommable") return "Consommables";

  return type || "-";
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

export function getMenuDishNames(dishIds: number[], dishes: Dish[]): string {
  if (!dishIds.length) return "Aucun plat";

  return dishIds
    .map((dishId) => dishes.find((dish) => dish.id === dishId)?.name || "Plat inconnu")
    .join(", ");
}

export function calculateDishCost(dishId: number, specs: AnySpecInput): number {
  return normalizeSpecs(specs)
    .filter((item) => item.dishId === dishId)
    .reduce((total, item) => {
      return total + toNumber(item.quantity) * toNumber(item.unitCost);
    }, 0);
}

export function calculateSaleLineRevenue(
  dishId: number,
  quantity: string,
  dishes: Dish[],
): number {
  const dish = dishes.find((item) => item.id === dishId);

  return toNumber(quantity) * toNumber(dish?.price);
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
    return total + calculateSaleLineRevenue(line.dishId, line.quantity, dishes);
  }, 0);
}

export function calculateSaleCost(sale: Sale, specs: AnySpecInput): number {
  return sale.lines.reduce((total, line) => {
    return total + calculateSaleLineCost(line.dishId, line.quantity, specs);
  }, 0);
}

export function calculateSalesRevenue(sales: Sale[], dishes: Dish[]): number {
  return sales.reduce((total, sale) => {
    return total + calculateSaleRevenue(sale, dishes);
  }, 0);
}

export function calculateSalesCost(sales: Sale[], specs: AnySpecInput): number {
  return sales.reduce((total, sale) => {
    return total + calculateSaleCost(sale, specs);
  }, 0);
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
    return total + toNumber(invoice.ttc);
  }, 0);
}

export function getProductionDishSummary(
  lines: LegacyProductionLine[],
  dishes: Dish[],
): string {
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
  plan: LegacyProductionPlan,
  specs: AnySpecInput,
): string {
  const flatSpecs = normalizeSpecs(specs);

  const needs = plan.lines.flatMap((line) => {
    const portions = toNumber(line.portions || line.quantity || "0");

    return flatSpecs
      .filter((item) => item.dishId === line.dishId)
      .map((item) => ({
        name: item.name,
        quantity: toNumber(item.quantity) * portions,
        unit: item.unit,
        type: item.type,
      }));
  });

  const aggregated = aggregateLegacyNeeds(needs);

  if (!aggregated.length) return "Aucun besoin calculé";

  return aggregated
    .map((need) => `${need.name} : ${toDecimalString(need.quantity)} ${need.unit}`)
    .join(", ");
}

function aggregateLegacyNeeds(
  lines: { name: string; quantity: number; unit: string; type: string }[],
): { name: string; quantity: number; unit: string; type: string }[] {
  const grouped = new Map<string, { name: string; quantity: number; unit: string; type: string }>();

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

export function getShoppingNeeds(
  productionPlan: LegacyProductionPlan,
  specs: AnySpecInput,
): {
  id: number;
  type: "ingredient" | "consommable";
  name: string;
  quantity: string;
  unit: string;
}[] {
  const flatSpecs = normalizeSpecs(specs);

  const needs = productionPlan.lines.flatMap((line) => {
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

  return aggregateLegacyNeeds(needs).map((need, index) => ({
    id: index + 1,
    type: need.type as "ingredient" | "consommable",
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

      if (movement.type === "Entrée" || movement.type === "Ajout") {
        return total + quantity;
      }

      return total - quantity;
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

      if (movement.type === "Ajout") {
        return total + quantity;
      }

      return total - quantity;
    }, 0);
}