export type User = {
  name: string;
  role: "admin" | "associe";
  pin: string;
};

export type Dish = {
  id: number;
  name: string;
  price: string;
  category: string;
  vat: string;
  description: string;
  photo: string;
  active: boolean;
};

export type WeeklyMenu = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  dishIds: number[];
};

export type SpecItem = {
  id: number;
  name: string;
  quantity: string;
  unit: string;
  type: "ingredient" | "consommable";
};

export type DishSpec = {
  dishId: number;
  items: SpecItem[];
};

export type ProductionLine = {
  dishId: number;
  portions: string;
};

export type ProductionPlan = {
  id: number;
  name: string;
  date: string;
  lines: ProductionLine[];
};

export type ShoppingNeed = {
  name: string;
  quantity: string;
  unit: string;
  type: "ingredient" | "consommable";
};

export type StockItem = {
  id: number;
  name: string;
  category: "ingredient" | "consommable" | "plat";
  unit: string;
  quantity: string;
  minQuantity: string;
};

export type StockMovement = {
  id: number;
  stockItemId: number;
  type: "entrée" | "sortie";
  quantity: string;
  date: string;
  userName: string;
  comment: string;
};