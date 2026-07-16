"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { AppShell } from "../components/AppShell";
import { DashboardView } from "../components/DashboardView";
import { DishesView } from "../components/DishesView";
import { LoginScreen } from "../components/LoginScreen";
import { MenusView } from "../components/MenusView";
import { ProductionView } from "../components/ProductionView";
import { SettingsView } from "../components/SettingsView";
import { ShoppingListView } from "../components/ShoppingListView";
import { SpecsView } from "../components/SpecsView";
import { StocksView } from "../components/StocksView";

import { initialDishes, users } from "../data/initial-data";
import type {
  Dish,
  DishSpec,
  ProductionPlan,
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

  useEffect(() => {
    const savedUser = window.localStorage.getItem("phf-user");
    const savedDishes = window.localStorage.getItem("phf-dishes");
    const savedMenus = window.localStorage.getItem("phf-menus");
    const savedSpecs = window.localStorage.getItem("phf-specs");
    const savedProductions = window.localStorage.getItem("phf-productions");
    const savedStockItems = window.localStorage.getItem("phf-stock-items");
    const savedStockMovements = window.localStorage.getItem("phf-stock-movements");
    const user = users.find((item) => item.name === savedUser);

    if (user) setCurrentUser(user);
    if (savedDishes) setDishes(JSON.parse(savedDishes));
    if (savedMenus) setMenus(JSON.parse(savedMenus));
    if (savedSpecs) setSpecs(JSON.parse(savedSpecs));
    if (savedProductions) setProductions(JSON.parse(savedProductions));
    if (savedStockItems) setStockItems(JSON.parse(savedStockItems));
    if (savedStockMovements) setStockMovements(JSON.parse(savedStockMovements));

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
  }, [dishes, menus, specs, productions, stockItems, stockMovements, isReady]);

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
    window.localStorage.removeItem("phf-user");
    setCurrentUser(null);
    setActiveModule("Dashboard");
    setPin("");
    setError("");
  }

  function addDish(dish: Omit<Dish, "id">) {
    setDishes((current) => [{ ...dish, id: Date.now() }, ...current]);
  }

  function toggleDish(id: number) {
    setDishes((current) =>
      current.map((dish) =>
        dish.id === id ? { ...dish, active: !dish.active } : dish
      )
    );
  }

  function deleteDish(id: number) {
    setDishes((current) => current.filter((dish) => dish.id !== id));

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
  }

  function addMenu(menu: Omit<WeeklyMenu, "id">) {
    setMenus((current) => [{ ...menu, id: Date.now() }, ...current]);
  }

  function deleteMenu(id: number) {
    setMenus((current) => current.filter((menu) => menu.id !== id));
  }

  function addSpecItem(dishId: number, item: Omit<SpecItem, "id">) {
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
  }

  function deleteSpecItem(dishId: number, itemId: number) {
    setSpecs((current) =>
      current.map((spec) =>
        spec.dishId === dishId
          ? { ...spec, items: spec.items.filter((item) => item.id !== itemId) }
          : spec
      )
    );
  }

  function addProduction(production: Omit<ProductionPlan, "id">) {
    setProductions((current) => [{ ...production, id: Date.now() }, ...current]);
  }

  function deleteProduction(id: number) {
    setProductions((current) =>
      current.filter((production) => production.id !== id)
    );
  }

  function addStockItem(item: Omit<StockItem, "id">) {
    setStockItems((current) => [{ ...item, id: Date.now() }, ...current]);
  }

  function deleteStockItem(id: number) {
    setStockItems((current) => current.filter((item) => item.id !== id));
    setStockMovements((current) =>
      current.filter((movement) => movement.stockItemId !== id)
    );
  }

  function addStockMovement(movement: Omit<StockMovement, "id" | "userName">) {
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

        return {
          ...item,
          quantity: nextQuantity,
        };
      })
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
      ) : (
        <DashboardView currentUser={currentUser} isAdmin={isAdmin} />
      )}
    </AppShell>
  );
}