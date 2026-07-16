import type { Antenna, Dish, User } from "../types";

export const users: User[] = [
  { name: "Robin", role: "admin", pin: "2323" },
  { name: "Patrice", role: "associe", pin: "1644" },
  { name: "Megane", role: "associe", pin: "2010" },
];

export const navItems = [
  "Dashboard",
  "Plats",
  "Menus",
  "Cahiers",
  "Production",
  "Courses",
  "Stocks",
  "Antennes",
  "Ventes",
  "Factures",
  "TVA",
  "Historique",
  "Paramètres",
];

export const settings = {
  payments: ["Espèces", "Carte bancaire", "Virement", "PayPal"],
  dishCategories: ["Plats", "Desserts", "Boissons"],
  purchaseCategories: ["Ingrédients", "Emballages", "Charges"],
};

export const initialDishes: Dish[] = [
  {
    id: 1,
    name: "Shawarma Bowl",
    price: "12.90",
    category: "Plats",
    vat: "5.5",
    description: "Poulet, riz, crudités et sauce maison.",
    photo: "",
    active: true,
  },
];

export const initialAntennas: Antenna[] = [
  { id: 1, name: "Cuisine principale", active: true },
  { id: 2, name: "Antenne 1", active: true },
  { id: 3, name: "Antenne 2", active: true },
];