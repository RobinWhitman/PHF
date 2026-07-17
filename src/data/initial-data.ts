import type { Antenna, User } from "../types";
import { importedDishes, importedSpecs } from "./imported-catalog";

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
  "Factures client",
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

export const initialDishes = importedDishes;
export const initialSpecs = importedSpecs;

export const initialAntennas: Antenna[] = [
  { id: 1, name: "LABO", active: true },
  { id: 2, name: "LXII", active: true },
];