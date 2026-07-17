"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { AntennasView, calculateNextAntennaStock } from "../components/AntennasView";
import { AppShell } from "../components/AppShell";
import { DashboardView } from "../components/DashboardView";
import { DishesView } from "../components/DishesView";
import { HistoryView } from "../components/HistoryView";
import { LoginScreen } from "../components/LoginScreen";
import { MenusView } from "../components/MenusView";
import { ProductionView } from "../components/ProductionView";
import { PurchaseInvoicesView } from "../components/PurchaseInvoicesView";
import { SalesView } from "../components/SalesView";
import { SettingsView } from "../components/SettingsView";
import { ShoppingListView } from "../components/ShoppingListView";
import { SpecsView } from "../components/SpecsView";
import { StocksView } from "../components/StocksView";
import { VatView } from "../components/VatView";
import { ClientInvoicesView } from "../components/ClientInvoicesView";

import { initialAntennas, initialDishes, users } from "../data/initial-data";
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
  SpecItem,
  StockItem,
  StockMovement,
  User,
  WeeklyMenu,
} from "../types";
import { addDecimalStrings, subtractDecimalStrings } from "../utils/calculations";

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState(users[0].name);
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const [dishes, setDishes] = useState<Dish[]>(initialDishes);
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [specs, setSpecs] = useState<DishSpec[]>([]);
  const [productions, setProductions] = useState<ProductionPlan[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [antennas, setAntennas] = useState<Antenna[]>(initialAntennas);
  const [antennaStocks, setAntennaStocks] = useState<AntennaDishStock[]>([]);
  const [antennaMovements, setAntennaMovements] = useState<AntennaMovement[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const savedUser = window.localStorage.getItem("phf-user");
    const savedDishes = window.localStorage.getItem("phf-dishes");
    const savedMenus = window.localStorage.getItem("phf-menus");
    const savedSpecs = window.localStorage.getItem("phf-specs");
    const savedProductions = window.localStorage.getItem("phf-productions");
    const savedStockItems = window.localStorage.getItem("phf-stock-items");
    const savedStockMovements = window.localStorage.getItem("phf-stock-movements");
    const savedAntennas = window.localStorage.getItem("phf-antennas");
    const savedAntennaStocks = window.localStorage.getItem("phf-antenna-stocks");
    const savedAntennaMovements = window.localStorage.getItem("phf-antenna-movements");
    const savedSales = window.localStorage.getItem("phf-sales");
    const savedPurchaseInvoices = window.localStorage.getItem("phf-purchase-invoices");
    const savedHistoryEntries = window.localStorage.getItem("phf-history");
    const user = users.find((item) => item.name === savedUser);

    if (user) setCurrentUser(user);
    if (savedDishes) setDishes(JSON.parse(savedDishes));
    if (savedMenus) setMenus(JSON.parse(savedMenus));
    if (savedSpecs) setSpecs(JSON.parse(savedSpecs));
    if (savedProductions) setProductions(JSON.parse(savedProductions));
    if (savedStockItems) setStockItems(JSON.parse(savedStockItems));
    if (savedStockMovements) setStockMovements(JSON.parse(savedStockMovements));
    if (savedAntennas) setAntennas(JSON.parse(savedAntennas));
    if (savedAntennaStocks) setAntennaStocks(JSON.parse(savedAntennaStocks));
    if (savedAntennaMovements) setAntennaMovements(JSON.parse(savedAntennaMovements));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedPurchaseInvoices) setPurchaseInvoices(JSON.parse(savedPurchaseInvoices));
    if (savedHistoryEntries) setHistoryEntries(JSON.parse(savedHistoryEntries));

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    window.localStorage.setItem("phf-dishes", JSON.stringify(dishes));
    window.localStorage.setItem("phf-menus", JSON.stringify(menus));
    window.localStorage.setItem("phf-specs", JSON.stringify(specs));
    window.localStorage.setItem("phf-productions", JSON.stringify(productions));
    window.localStorage.setItem("phf-stock-items", JSON.stringify(stockItems));
    window.localStorage.setItem("phf-stock-movements", JSON.stringify(stockMovements));
    window.localStorage.setItem("phf-antennas", JSON.stringify(antennas));
    window.localStorage.setItem("phf-antenna-stocks", JSON.stringify(antennaStocks));
    window.localStorage.setItem("phf-antenna-movements", JSON.stringify(antennaMovements));
    window.localStorage.setItem("phf-sales", JSON.stringify(sales));
    window.localStorage.setItem("phf-purchase-invoices", JSON.stringify(purchaseInvoices));
    window.localStorage.setItem("phf-history", JSON.stringify(historyEntries));
  }, [
    dishes,
    menus,
    specs,
    productions,
    stockItems,
    stockMovements,
    antennas,
    antennaStocks,
    antennaMovements,
    sales,
    purchaseInvoices,
    historyEntries,
    isReady,
  ]);

  function addHistory(module: string, action: string, details: string) {
    const now = new Date();

    const entry: HistoryEntry = {
      id: Date.now() + Math.random(),
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      userName: currentUser?.name || "Utilisateur inconnu",
      module,
      action,
      details,
    };

    setHistoryEntries((current) => [entry, ...current]);
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = users.find(
      (item) => item.name === selectedUser && item.pin === pin
    );

    if (!user) {
      setError("Utilisateur ou code incorrect.");
      return;
    }

    window.localStorage.setItem("phf-user", user.name);
    setCurrentUser(user);
    setActiveModule("Dashboard");
    setPin("");
    setError("");
  }

  function handleLogout() {
    setCurrentUser(null);
    setActiveModule("Dashboard");
    setPin("");
    setError("");
    window.localStorage.removeItem("phf-user");
  }

  function addDish(dish: Omit<Dish, "id">) {
    setDishes((current) => [{ ...dish, id: Date.now() }, ...current]);
    addHistory("Plats", "Création plat", `Plat créé : ${dish.name}`);
  }

  function toggleDish(id: number) {
    const dish = dishes.find((item) => item.id === id);

    setDishes((current) =>
      current.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );

    addHistory("Plats", "Statut plat", `Statut modifié : ${dish?.name || id}`);
  }

  function deleteDish(id: number) {
    const dish = dishes.find((item) => item.id === id);

    setDishes((current) => current.filter((item) => item.id !== id));
    setMenus((current) =>
      current.map((menu) => ({
        ...menu,
        dishIds: menu.dishIds.filter((dishId) => dishId !== id),
      }))
    );
    setSpecs((current) => current.filter((spec) => spec.dishId !== id));
    setProductions((current) =>
      current.map((production) => ({
        ...production,
        lines: production.lines.filter((line) => line.dishId !== id),
      }))
    );
    setAntennaStocks((current) =>
      current.filter((stock) => stock.dishId !== id)
    );
    setAntennaMovements((current) =>
      current.filter((movement) => movement.dishId !== id)
    );

    addHistory("Plats", "Suppression plat", `Plat supprimé : ${dish?.name || id}`);
  }

  function addMenu(menu: Omit<WeeklyMenu, "id">) {
    setMenus((current) => [{ ...menu, id: Date.now() }, ...current]);
    addHistory("Menus", "Création menu", `Menu créé : ${menu.name}`);
  }

  function deleteMenu(id: number) {
    const menu = menus.find((item) => item.id === id);

    setMenus((current) => current.filter((item) => item.id !== id));
    addHistory("Menus", "Suppression menu", `Menu supprimé : ${menu?.name || id}`);
  }

  function addSpecItem(dishId: number, item: Omit<SpecItem, "id">) {
    const dish = dishes.find((dishItem) => dishItem.id === dishId);

    setSpecs((current) => {
      const existingSpec = current.find((spec) => spec.dishId === dishId);
      const newItem = { ...item, id: Date.now() };

      if (!existingSpec) {
        return [{ dishId, items: [newItem] }, ...current];
      }

      return current.map((spec) =>
        spec.dishId === dishId
          ? { ...spec, items: [newItem, ...spec.items] }
          : spec
      );
    });

    addHistory(
      "Cahiers",
      "Ajout ligne fiche",
      `${item.name} ajouté à ${dish?.name || "plat inconnu"}`
    );
  }

  function deleteSpecItem(dishId: number, itemId: number) {
    const spec = specs.find((item) => item.dishId === dishId);
    const specItem = spec?.items.find((item) => item.id === itemId);

    setSpecs((current) =>
      current.map((item) =>
        item.dishId === dishId
          ? { ...item, items: item.items.filter((line) => line.id !== itemId) }
          : item
      )
    );

    addHistory(
      "Cahiers",
      "Suppression ligne fiche",
      `Ligne supprimée : ${specItem?.name || itemId}`
    );
  }

  function addProduction(production: Omit<ProductionPlan, "id">) {
    setProductions((current) => [{ ...production, id: Date.now() }, ...current]);
    addHistory("Production", "Création production", production.name);
  }

  function deleteProduction(id: number) {
    const production = productions.find((item) => item.id === id);

    setProductions((current) =>
      current.filter((item) => item.id !== id)
    );

    addHistory(
      "Production",
      "Suppression production",
      `Production supprimée : ${production?.name || id}`
    );
  }

  function addStockItem(item: Omit<StockItem, "id">) {
    setStockItems((current) => [{ ...item, id: Date.now() }, ...current]);
    addHistory("Stocks", "Création article", `Article créé : ${item.name}`);
  }

  function deleteStockItem(id: number) {
    const item = stockItems.find((stockItem) => stockItem.id === id);

    setStockItems((current) => current.filter((stockItem) => stockItem.id !== id));
    setStockMovements((current) =>
      current.filter((movement) => movement.stockItemId !== id)
    );

    addHistory("Stocks", "Suppression article", `Article supprimé : ${item?.name || id}`);
  }

  function addStockMovement(movement: Omit<StockMovement, "id" | "userName">) {
    const stockItem = stockItems.find((item) => item.id === movement.stockItemId);
    const movementWithUser: StockMovement = {
      ...movement,
      id: Date.now(),
      userName: currentUser?.name || "Utilisateur inconnu",
    };

    setStockMovements((current) => [movementWithUser, ...current]);

    setStockItems((current) =>
      current.map((item) => {
        if (item.id !== movement.stockItemId) return item;

        const nextQuantity =
          movement.type === "entrée"
            ? addDecimalStrings(item.quantity, movement.quantity)
            : subtractDecimalStrings(item.quantity, movement.quantity);

        return { ...item, quantity: nextQuantity };
      })
    );

    addHistory(
      "Stocks",
      movement.type === "entrée" ? "Entrée stock" : "Sortie stock",
      `${stockItem?.name || "Article"} : ${movement.quantity}`
    );
  }

  function addAntenna(name: string) {
    setAntennas((current) => [{ id: Date.now(), name, active: true }, ...current]);
    addHistory("Antennes", "Création antenne", `Antenne créée : ${name}`);
  }

  function toggleAntenna(id: number) {
    const antenna = antennas.find((item) => item.id === id);

    setAntennas((current) =>
      current.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );

    addHistory(
      "Antennes",
      "Statut antenne",
      `Statut modifié : ${antenna?.name || id}`
    );
  }

  function deleteAntenna(id: number) {
    const antenna = antennas.find((item) => item.id === id);

    setAntennas((current) => current.filter((item) => item.id !== id));
    setAntennaStocks((current) =>
      current.filter((stock) => stock.antennaId !== id)
    );
    setAntennaMovements((current) =>
      current.filter((movement) => movement.antennaId !== id)
    );

    addHistory(
      "Antennes",
      "Suppression antenne",
      `Antenne supprimée : ${antenna?.name || id}`
    );
  }

  function addAntennaMovement(
    movement: Omit<AntennaMovement, "id" | "userName">
  ) {
    const dish = dishes.find((item) => item.id === movement.dishId);
    const antenna = antennas.find((item) => item.id === movement.antennaId);

    const movementWithUser: AntennaMovement = {
      ...movement,
      id: Date.now(),
      userName: currentUser?.name || "Utilisateur inconnu",
    };

    setAntennaMovements((current) => [movementWithUser, ...current]);

    setAntennaStocks((current) => {
      const existingStock = current.find(
        (stock) =>
          stock.antennaId === movement.antennaId &&
          stock.dishId === movement.dishId
      );

      if (!existingStock) {
        return [
          {
            id: Date.now() + 1,
            antennaId: movement.antennaId,
            dishId: movement.dishId,
            quantity: calculateNextAntennaStock("0", movement.type, movement.quantity),
          },
          ...current,
        ];
      }

      return current.map((stock) =>
        stock.id === existingStock.id
          ? {
              ...stock,
              quantity: calculateNextAntennaStock(
                stock.quantity,
                movement.type,
                movement.quantity
              ),
            }
          : stock
      );
    });

    addHistory(
      "Antennes",
      movement.type === "ajout" ? "Ajout plat antenne" : "Retrait plat antenne",
      `${dish?.name || "Plat"} - ${antenna?.name || "Antenne"} : ${movement.quantity}`
    );
  }

  function addSale(sale: Omit<Sale, "id" | "userName">) {
    const saleWithUser: Sale = {
      ...sale,
      id: Date.now(),
      userName: currentUser?.name || "Utilisateur inconnu",
    };

    setSales((current) => [saleWithUser, ...current]);

    sale.lines.forEach((line) => {
      addAntennaMovement({
        antennaId: sale.antennaId,
        dishId: line.dishId,
        type: "retrait",
        quantity: line.quantity,
        date: sale.date,
        comment: `Vente ${sale.paymentMethod}`,
      });
    });

    addHistory(
      "Ventes",
      "Création vente",
      `Vente ${sale.paymentMethod} - ${sale.lines.length} ligne(s)`
    );
  }

  function deleteSale(sale: Sale) {
    setSales((current) => current.filter((item) => item.id !== sale.id));

    sale.lines.forEach((line) => {
      addAntennaMovement({
        antennaId: sale.antennaId,
        dishId: line.dishId,
        type: "ajout",
        quantity: line.quantity,
        date: new Date().toISOString().slice(0, 10),
        comment: `Annulation vente ${sale.paymentMethod}`,
      });
    });

    addHistory(
      "Ventes",
      "Suppression vente",
      `Vente supprimée : ${sale.paymentMethod} - ${sale.lines.length} ligne(s)`
    );
  }

  function addPurchaseInvoice(
    invoice: Omit<PurchaseInvoice, "id" | "createdBy">
  ) {
    const invoiceWithUser: PurchaseInvoice = {
      ...invoice,
      id: Date.now(),
      createdBy: currentUser?.name || "Utilisateur inconnu",
    };

    setPurchaseInvoices((current) => [invoiceWithUser, ...current]);

    addHistory(
      "Factures",
      "Création facture achat",
      `${invoice.supplier} - ${invoice.amountTtc} € TTC`
    );
  }

  function deletePurchaseInvoice(id: number) {
    const invoice = purchaseInvoices.find((item) => item.id === id);

    setPurchaseInvoices((current) =>
      current.filter((item) => item.id !== id)
    );

    addHistory(
      "Factures",
      "Suppression facture achat",
      `Facture supprimée : ${invoice?.supplier || id}`
    );
  }

  if (!isReady) {
    return (
      <main className="login-page">
        <section className="login-card">
          <p className="eyebrow">Pat Healthy Food</p>
          <h1>Chargement</h1>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <LoginScreen
        selectedUser={selectedUser}
        pin={pin}
        error={error}
        onSelectedUserChange={setSelectedUser}
        onPinChange={setPin}
        onSubmit={handleLogin}
      />
    );
  }

  const isAdmin = currentUser.role === "admin";

  return (
    <AppShell
      activeModule={activeModule}
      currentUser={currentUser}
      isAdmin={isAdmin}
      onActiveModuleChange={setActiveModule}
      onLogout={handleLogout}
    >
      {activeModule === "Paramètres" && isAdmin ? (
        <SettingsView />
      ) : activeModule === "Plats" ? (
        <DishesView
          dishes={dishes}
          onAddDish={addDish}
          onDeleteDish={deleteDish}
          onToggleDish={toggleDish}
        />
      ) : activeModule === "Menus" ? (
        <MenusView
          dishes={dishes}
          menus={menus}
          onAddMenu={addMenu}
          onDeleteMenu={deleteMenu}
        />
      ) : activeModule === "Cahiers" ? (
        <SpecsView
          dishes={dishes}
          specs={specs}
          onAddSpecItem={addSpecItem}
          onDeleteSpecItem={deleteSpecItem}
        />
      ) : activeModule === "Production" ? (
        <ProductionView
          dishes={dishes}
          specs={specs}
          menus={menus}
          productions={productions}
          onAddProduction={addProduction}
          onDeleteProduction={deleteProduction}
        />
      ) : activeModule === "Courses" ? (
        <ShoppingListView
          dishes={dishes}
          specs={specs}
          productions={productions}
        />
      ) : activeModule === "Stocks" ? (
        <StocksView
          stockItems={stockItems}
          stockMovements={stockMovements}
          onAddStockItem={addStockItem}
          onDeleteStockItem={deleteStockItem}
          onAddStockMovement={addStockMovement}
        />
      ) : activeModule === "Antennes" ? (
        <AntennasView
          antennas={antennas}
          dishes={dishes}
          antennaStocks={antennaStocks}
          antennaMovements={antennaMovements}
          currentUserName={currentUser.name}
          onAddAntenna={addAntenna}
          onToggleAntenna={toggleAntenna}
          onDeleteAntenna={deleteAntenna}
          onAddAntennaMovement={addAntennaMovement}
        />
      ) : activeModule === "Ventes" ? (
        <SalesView
          antennas={antennas}
          dishes={dishes}
          antennaStocks={antennaStocks}
          sales={sales}
          currentUserName={currentUser.name}
          onAddSale={addSale}
          onDeleteSale={deleteSale}
        />
              ) : activeModule === "Factures client" ? (
        <ClientInvoicesView
          sales={sales}
          dishes={dishes}
          antennas={antennas}
          currentUserName={currentUser.name}
        />
      ) : activeModule === "Factures" ? (
        <PurchaseInvoicesView
          invoices={purchaseInvoices}
          currentUserName={currentUser.name}
          onAddInvoice={addPurchaseInvoice}
          onDeleteInvoice={deletePurchaseInvoice}
        />
      ) : activeModule === "TVA" ? (
        <VatView sales={sales} purchaseInvoices={purchaseInvoices} />
      ) : activeModule === "Historique" ? (
        <HistoryView entries={historyEntries} />
      ) : (
        <DashboardView currentUser={currentUser} isAdmin={isAdmin} />
      )}
    </AppShell>
  );
}