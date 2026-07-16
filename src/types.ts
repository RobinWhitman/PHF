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
  antennaId: number;
  dishId: number;
  type: "ajout" | "retrait";
  quantity: string;
  date: string;
  userName: string;
  comment: string;
};

export type SaleLine = {
  dishId: number;
  quantity: string;
  unitPrice: string;
};

export type Sale = {
  id: number;
  date: string;
  time: string;
  userName: string;
  antennaId: number;
  paymentMethod: string;
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
  amountHt: string;
  amountVat: string;
  amountTtc: string;
  category: string;
  comment: string;
  fileUrl: string;
  createdBy: string;
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