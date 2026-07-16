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

export type Menu = WeeklyMenu;

export type DishSpecItem = {
  id: number;
  dishId: number;
  type: "ingredient" | "consommable";
  name: string;
  quantity: string;
  unit: string;
  unitCost?: string;
};

export type SpecItem = DishSpecItem;

export type DishSpec = {
  dishId: number;
  items: DishSpecItem[];
};

export type ProductionLine = {
  dishId: number;
  portions: string;
  quantity?: string;
};

export type ProductionPlan = {
  id: number;
  name: string;
  date: string;
  menuId: number | null;
  lines: ProductionLine[];
};

export type ShoppingNeed = {
  id: number;
  type: "ingredient" | "consommable";
  name: string;
  quantity: string;
  unit: string;
};

export type NeedLine = {
  dishId: number;
  dishName: string;
  type: "ingredient" | "consommable";
  name: string;
  quantity: number;
  unit: string;
};

export type StockItem = {
  id: number;
  name: string;
  type: "ingredient" | "consommable";
  unit: string;
  quantity: string;
  alertThreshold: string;
};

export type StockMovement = {
  id: number;
  date: string;
  itemId?: number;
  stockItemId?: number;
  type: "Entrée" | "Sortie";
  quantity: string;
  comment: string;
};

export type Antenna = {
  id: number;
  name: string;
  active: boolean;
};

export type AntennaDishStock = {
  id: number;
  antennaId: number;
  dishId: number;
  quantity: string;
};

export type AntennaMovement = {
  id: number;
  date: string;
  antennaId: number;
  dishId: number;
  type: "Ajout" | "Retrait";
  quantity: string;
  comment: string;
};

export type SaleLine = {
  dishId: number;
  quantity: string;
};

export type Sale = {
  id: number;
  date: string;
  antennaId: number;
  payment: string;
  customerName: string;
  invoiceRequested: boolean;
  customerEmail: string;
  comment: string;
  lines: SaleLine[];
};

export type PurchaseInvoice = {
  id: number;
  date: string;
  supplier: string;
  number: string;
  ht: string;
  vat: string;
  ttc: string;
  category: string;
  comment: string;
  fileUrl: string;
};

export type HistoryEntry = {
  id: number;
  date: string;
  time: string;
  userName: string;
  module: string;
  action: string;
  details: string;
};