import type {
  Dish,
  NeedLine,
  ProductionPlan,
  PurchaseInvoice,
  Sale,
  SpecItem,
} from "../types";

export function toNumber(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export function calculateDishCost(dishId: number, specItems: SpecItem[]): number {
  return specItems
    .filter((item) => item.dishId === dishId)
    .reduce((total, item) => {
      const quantity = toNumber(item.quantity);
      const unitCost = toNumber(item.unitCost);
      return total + quantity * unitCost;
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
  specItems: SpecItem[],
): number {
  return toNumber(quantity) * calculateDishCost(dishId, specItems);
}

export function calculateSaleRevenue(sale: Sale, dishes: Dish[]): number {
  return sale.lines.reduce((total, line) => {
    return total + calculateSaleLineRevenue(line.dishId, line.quantity, dishes);
  }, 0);
}

export function calculateSaleCost(sale: Sale, specItems: SpecItem[]): number {
  return sale.lines.reduce((total, line) => {
    return total + calculateSaleLineCost(line.dishId, line.quantity, specItems);
  }, 0);
}

export function calculateSalesRevenue(sales: Sale[], dishes: Dish[]): number {
  return sales.reduce((total, sale) => {
    return total + calculateSaleRevenue(sale, dishes);
  }, 0);
}

export function calculateSalesCost(sales: Sale[], specItems: SpecItem[]): number {
  return sales.reduce((total, sale) => {
    return total + calculateSaleCost(sale, specItems);
  }, 0);
}

export function calculateSalesProfit(
  sales: Sale[],
  dishes: Dish[],
  specItems: SpecItem[],
): number {
  return calculateSalesRevenue(sales, dishes) - calculateSalesCost(sales, specItems);
}

export function calculatePurchaseTotal(purchaseInvoices: PurchaseInvoice[]): number {
  return purchaseInvoices.reduce((total, invoice) => {
    return total + toNumber(invoice.ttc);
  }, 0);
}

export function calculateProductionNeeds(
  productionPlan: ProductionPlan,
  dishes: Dish[],
  specItems: SpecItem[],
): NeedLine[] {
  return productionPlan.lines.flatMap((line) => {
    const dish = dishes.find((item) => item.id === line.dishId);
    const portions = toNumber(line.portions);

    return specItems
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

export function aggregateNeeds(lines: NeedLine[]): NeedLine[] {
  const grouped = new Map<string, NeedLine>();

  lines.forEach((line) => {
    const key = `${line.type}-${line.name}-${line.unit}`;

    if (!grouped.has(key)) {
      grouped.set(key, { ...line });
      return;
    }

    const existing = grouped.get(key);

    if (existing) {
      existing.quantity += line.quantity;
    }
  });

  return Array.from(grouped.values());
}