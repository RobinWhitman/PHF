import type {
  Antenna,
  AntennaDishStock,
  AntennaMovement,
  Dish,
  DishSpec,
  HistoryEntry,
  ProductionPlan,
  PurchaseInvoice,
  Sale,
  StockItem,
  StockMovement,
  User,
  WeeklyMenu,
} from "../types";
import { supabase } from "./supabase";

export type PhfAppState = {
  dishes: Dish[];
  menus: WeeklyMenu[];
  specs: DishSpec[];
  productions: ProductionPlan[];
  stockItems: StockItem[];
  stockMovements: StockMovement[];
  antennas: Antenna[];
  antennaStocks: AntennaDishStock[];
  antennaMovements: AntennaMovement[];
  sales: Sale[];
  purchaseInvoices: PurchaseInvoice[];
  historyEntries: HistoryEntry[];
};

export async function loadCloudUsers(fallbackUsers: User[]) {
  if (!supabase) return fallbackUsers;

  const { data, error } = await supabase
    .from("phf_users")
    .select("name, role, pin")
    .eq("active", true)
    .order("id", { ascending: true });

  if (error || !data?.length) return fallbackUsers;

  return data as User[];
}

export async function loadCloudState() {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("phf_app_state")
    .select("payload")
    .eq("id", "main")
    .single();

  if (error || !data?.payload) return null;

  const payload = data.payload as Partial<PhfAppState>;

  const hasRealCatalog =
    Array.isArray(payload.dishes) &&
    payload.dishes.length > 10 &&
    Array.isArray(payload.specs) &&
    payload.specs.length > 10;

  if (!hasRealCatalog) {
    return null;
  }

  return payload;
}

export async function saveCloudState(payload: PhfAppState) {
  if (!supabase) return;

  await supabase.from("phf_app_state").upsert({
    id: "main",
    payload,
    updated_at: new Date().toISOString(),
  });
}