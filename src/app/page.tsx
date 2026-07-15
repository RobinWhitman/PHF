"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type User = { name: string; role: "admin" | "associe"; pin: string };

type Dish = {
  id: number;
  name: string;
  price: string;
  category: string;
  vat: string;
  description: string;
  photo: string;
  active: boolean;
};

type WeeklyMenu = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  dishIds: number[];
};

type SpecItem = {
  id: number;
  name: string;
  quantity: string;
  unit: string;
  type: "ingredient" | "consommable";
};

type DishSpec = {
  dishId: number;
  items: SpecItem[];
};

type ProductionLine = {
  dishId: number;
  portions: string;
};

type ProductionPlan = {
  id: number;
  name: string;
  date: string;
  lines: ProductionLine[];
};

type ShoppingNeed = {
  name: string;
  quantity: string;
  unit: string;
  type: "ingredient" | "consommable";
};

type StockItem = {
  id: number;
  name: string;
  category: "ingredient" | "consommable" | "plat";
  unit: string;
  quantity: string;
  minQuantity: string;
};

type StockMovement = {
  id: number;
  stockItemId: number;
  type: "entrée" | "sortie";
  quantity: string;
  date: string;
  userName: string;
  comment: string;
};

const users: User[] = [
  { name: "Robin", role: "admin", pin: "2323" },
  { name: "Patrice", role: "associe", pin: "1644" },
  { name: "Megane", role: "associe", pin: "2010" },
];

const navItems = [
  "Dashboard",
  "Plats",
  "Menus",
  "Cahiers",
  "Production",
  "Courses",
  "Stocks",
  "Ventes",
  "Factures",
  "TVA",
  "Historique",
  "Paramètres",
];

const metrics = [
  { label: "CA jour", value: "0,00 €" },
  { label: "CA semaine", value: "0,00 €" },
  { label: "Ventes", value: "0" },
  { label: "TVA estimée", value: "0,00 €" },
];

const settings = {
  antennes: ["Cuisine principale", "Antenne 1", "Antenne 2"],
  payments: ["Espèces", "Carte bancaire", "Virement"],
  dishCategories: ["Plats", "Desserts", "Boissons"],
  purchaseCategories: ["Ingrédients", "Emballages", "Charges"],
};

const initialDishes: Dish[] = [
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
      <main className="login-page">
        <section className="login-card">
          <div>
            <p className="eyebrow">Pat Healthy Food</p>
            <h1>Connexion</h1>
            <p className="login-text">Accès réservé à l’équipe interne.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label>
              Utilisateur
              <select
                value={selectedUser}
                onChange={(event) => setSelectedUser(event.target.value)}
              >
                {users.map((user) => (
                  <option key={user.name} value={user.name}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Code
              <input
                inputMode="numeric"
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="Code à 4 chiffres"
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <button className="primary-action" type="submit">
              Se connecter
            </button>
          </form>

          <div className="login-help">
            <p>Codes provisoires</p>
            <span>Robin : 2323</span>
            <span>Patrice : 1644</span>
            <span>Megane : 2010</span>
          </div>
        </section>
      </main>
    );
  }

  const isAdmin = currentUser.role === "admin";

  return (
    <main className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <span>PHF</span>
          <div>
            <strong>Pat Healthy Food</strong>
            <p>ERP interne</p>
          </div>
        </div>

        <nav className="desktop-nav">
          {navItems.map((item) => {
            const disabled = item === "Paramètres" && !isAdmin;

            return (
              <button
                className={[
                  "nav-item",
                  activeModule === item ? "active" : "",
                  disabled ? "disabled" : "",
                ].join(" ")}
                disabled={disabled}
                key={item}
                onClick={() => setActiveModule(item)}
              >
                {item}
              </button>
            );
          })}
        </nav>

        <div className="user-card">
          <p>Connecté</p>
          <strong>{currentUser.name}</strong>
          <span>{isAdmin ? "Administrateur" : "Associé"}</span>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Macro Sprint 10</p>
            <h1>{activeModule}</h1>
          </div>

          <button
            className="primary-action"
            onClick={() => setActiveModule("Ventes")}
          >
            Nouvelle vente
          </button>
        </header>

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
      </section>

      <nav className="mobile-nav">
        {["Dashboard", "Courses", "Stocks", "Production", "Ventes"].map((item) => (
          <button
            className={activeModule === item ? "active" : ""}
            key={item}
            onClick={() => setActiveModule(item)}
          >
            {item}
          </button>
        ))}
      </nav>
    </main>
  );
}

function DashboardView({
  currentUser,
  isAdmin,
}: {
  currentUser: User;
  isAdmin: boolean;
}) {
  return (
    <>
      <section className="metrics-grid">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="work-grid">
        <article className="panel large-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Session</p>
              <h2>Bienvenue {currentUser.name}</h2>
            </div>
            <span className="status-pill">{isAdmin ? "Admin" : "Associé"}</span>
          </div>

          <div className="empty-state">
            <strong>Connexion active</strong>
            <p>
              Les actions importantes seront ensuite enregistrées avec
              utilisateur, date et heure.
            </p>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Droits</h2>
          </div>

          <div className="alert-list">
            <p>Accès ventes, stocks, production et factures</p>
            <p>Paramètres sensibles : {isAdmin ? "autorisés" : "bloqués"}</p>
            <p>Historique utilisateur préparé</p>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Actions rapides</h2>
          </div>

          <div className="action-list">
            <button>Nouvelle vente</button>
            <button>Créer un menu</button>
            <button>Prévoir production</button>
            <button>Ajouter facture</button>
          </div>
        </article>
      </section>
    </>
  );
}

function DishesView({
  dishes,
  onAddDish,
  onDeleteDish,
  onToggleDish,
}: {
  dishes: Dish[];
  onAddDish: (dish: Omit<Dish, "id">) => void;
  onDeleteDish: (id: number) => void;
  onToggleDish: (id: number) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(settings.dishCategories[0]);
  const [vat, setVat] = useState("5.5");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !price.trim()) return;

    onAddDish({ name, price, category, vat, description, photo, active: true });

    setName("");
    setPrice("");
    setCategory(settings.dishCategories[0]);
    setVat("5.5");
    setDescription("");
    setPhoto("");
  }

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h2>Nouveau plat</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleSubmit}>
          <label>
            Nom
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>

          <label>
            Prix TTC
            <input
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>

          <label>
            Catégorie
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {settings.dishCategories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            TVA
            <select value={vat} onChange={(event) => setVat(event.target.value)}>
              <option value="5.5">5,5 %</option>
            </select>
          </label>

          <label>
            Photo
            <input value={photo} onChange={(event) => setPhoto(event.target.value)} />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <button className="primary-action" type="submit">
            Ajouter le plat
          </button>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Plats</p>
            <h2>Liste des plats</h2>
          </div>
          <span className="status-pill">{dishes.length}</span>
        </div>

        <div className="dish-list">
          {dishes.map((dish) => (
            <div className="dish-row" key={dish.id}>
              <div className="dish-photo">{dish.photo ? "Photo" : "PHF"}</div>

              <div className="dish-info">
                <div>
                  <strong>{dish.name}</strong>
                  <span>{dish.category}</span>
                </div>
                <p>{dish.description || "Aucune description."}</p>
              </div>

              <div className="dish-meta">
                <strong>{dish.price} €</strong>
                <span>TVA {dish.vat} %</span>
              </div>

              <div className="dish-actions">
                <button
                  className={dish.active ? "toggle active" : "toggle"}
                  onClick={() => onToggleDish(dish.id)}
                >
                  {dish.active ? "Actif" : "Inactif"}
                </button>

                <button className="delete-action" onClick={() => onDeleteDish(dish.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function MenusView({
  dishes,
  menus,
  onAddMenu,
  onDeleteMenu,
}: {
  dishes: Dish[];
  menus: WeeklyMenu[];
  onAddMenu: (menu: Omit<WeeklyMenu, "id">) => void;
  onDeleteMenu: (id: number) => void;
}) {
  const activeDishes = dishes.filter((dish) => dish.active);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDishId, setSelectedDishId] = useState("");
  const [dishIds, setDishIds] = useState<number[]>([]);

  function addDishToMenu() {
    const dishId = Number(selectedDishId);
    if (!dishId || dishIds.includes(dishId)) return;

    setDishIds((current) => [...current, dishId]);
    setSelectedDishId("");
  }

  function removeDishFromMenu(dishId: number) {
    setDishIds((current) => current.filter((id) => id !== dishId));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !startDate || !endDate || dishIds.length === 0) return;

    onAddMenu({ name, startDate, endDate, dishIds });

    setName("");
    setStartDate("");
    setEndDate("");
    setSelectedDishId("");
    setDishIds([]);
  }

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Planification</p>
            <h2>Nouveau menu</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleSubmit}>
          <label>
            Nom du menu
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>

          <label>
            Date de début
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>

          <label>
            Date de fin
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>

          <label>
            Ajouter un plat
            <select
              value={selectedDishId}
              onChange={(event) => setSelectedDishId(event.target.value)}
            >
              <option value="">Choisir un plat actif</option>
              {activeDishes.map((dish) => (
                <option key={dish.id} value={dish.id}>
                  {dish.name}
                </option>
              ))}
            </select>
          </label>

          <button className="primary-action" type="button" onClick={addDishToMenu}>
            Ajouter au menu
          </button>

          <div className="setting-list">
            {dishIds.length === 0 ? (
              <p>Aucun plat sélectionné.</p>
            ) : (
              dishIds.map((dishId) => {
                const dish = dishes.find((item) => item.id === dishId);

                return (
                  <p key={dishId}>
                    {dish?.name || "Plat supprimé"}{" "}
                    <button
                      className="delete-action"
                      type="button"
                      onClick={() => removeDishFromMenu(dishId)}
                    >
                      Retirer
                    </button>
                  </p>
                );
              })
            )}
          </div>

          <button className="primary-action" type="submit">
            Créer le menu
          </button>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Semaines</p>
            <h2>Menus créés</h2>
          </div>
          <span className="status-pill">{menus.length}</span>
        </div>

        <div className="dish-list">
          {menus.length === 0 ? (
            <div className="empty-state">
              <strong>Aucun menu</strong>
              <p>Crée un menu hebdomadaire avec ses dates et ses plats.</p>
            </div>
          ) : (
            menus.map((menu) => (
              <div className="dish-row" key={menu.id}>
                <div className="dish-photo">{isMenuActive(menu) ? "ON" : "OFF"}</div>

                <div className="dish-info">
                  <div>
                    <strong>{menu.name}</strong>
                    <span>{isMenuActive(menu) ? "Actif" : "Inactif"}</span>
                  </div>
                  <p>
                    Du {formatDate(menu.startDate)} au {formatDate(menu.endDate)}
                  </p>
                  <p>{getMenuDishNames(menu, dishes)}</p>
                </div>

                <div className="dish-meta">
                  <strong>{menu.dishIds.length}</strong>
                  <span>plats</span>
                </div>

                <div className="dish-actions">
                  <button className="delete-action" onClick={() => onDeleteMenu(menu.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}

function SpecsView({
  dishes,
  specs,
  onAddSpecItem,
  onDeleteSpecItem,
}: {
  dishes: Dish[];
  specs: DishSpec[];
  onAddSpecItem: (dishId: number, item: Omit<SpecItem, "id">) => void;
  onDeleteSpecItem: (dishId: number, itemId: number) => void;
}) {
  const activeDishes = dishes.filter((dish) => dish.active);
  const [selectedDishId, setSelectedDishId] = useState(
    activeDishes[0]?.id.toString() || ""
  );
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g");
  const [type, setType] = useState<"ingredient" | "consommable">("ingredient");

  const dishId = Number(selectedDishId);
  const selectedDish = dishes.find((dish) => dish.id === dishId);
  const selectedSpec = specs.find((spec) => spec.dishId === dishId);
  const items = selectedSpec?.items || [];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dishId || !name.trim() || !quantity.trim() || !unit.trim()) return;

    onAddSpecItem(dishId, { name, quantity, unit, type });

    setName("");
    setQuantity("");
    setUnit("g");
    setType("ingredient");
  }

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Fiche technique</p>
            <h2>Ajouter un besoin</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleSubmit}>
          <label>
            Plat
            <select
              value={selectedDishId}
              onChange={(event) => setSelectedDishId(event.target.value)}
            >
              {activeDishes.length === 0 ? (
                <option value="">Aucun plat actif</option>
              ) : (
                activeDishes.map((dish) => (
                  <option key={dish.id} value={dish.id}>
                    {dish.name}
                  </option>
                ))
              )}
            </select>
          </label>

          <label>
            Type
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as "ingredient" | "consommable")
              }
            >
              <option value="ingredient">Ingrédient</option>
              <option value="consommable">Emballage / consommable</option>
            </select>
          </label>

          <label>
            Nom
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex : poulet, riz, barquette"
            />
          </label>

          <label>
            Quantité exacte
            <input
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Ex : 150"
            />
          </label>

          <label>
            Unité
            <select value={unit} onChange={(event) => setUnit(event.target.value)}>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
              <option value="unité">unité</option>
            </select>
          </label>

          <button className="primary-action" type="submit">
            Ajouter à la fiche
          </button>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Cahier des charges</p>
            <h2>{selectedDish?.name || "Aucun plat"}</h2>
          </div>
          <span className="status-pill">{items.length}</span>
        </div>

        <div className="dish-list">
          {items.length === 0 ? (
            <div className="empty-state">
              <strong>Aucune ligne</strong>
              <p>Ajoute les ingrédients et consommables exacts du plat.</p>
            </div>
          ) : (
            items.map((item) => (
              <div className="dish-row" key={item.id}>
                <div className="dish-photo">
                  {item.type === "ingredient" ? "ING" : "CON"}
                </div>

                <div className="dish-info">
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {item.type === "ingredient" ? "Ingrédient" : "Consommable"}
                    </span>
                  </div>
                  <p>
                    Quantité exacte : {item.quantity} {item.unit}
                  </p>
                </div>

                <div className="dish-meta">
                  <strong>{item.quantity}</strong>
                  <span>{item.unit}</span>
                </div>

                <div className="dish-actions">
                  <button
                    className="delete-action"
                    onClick={() => onDeleteSpecItem(dishId, item.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}

function ProductionView({
  dishes,
  specs,
  menus,
  productions,
  onAddProduction,
  onDeleteProduction,
}: {
  dishes: Dish[];
  specs: DishSpec[];
  menus: WeeklyMenu[];
  productions: ProductionPlan[];
  onAddProduction: (production: Omit<ProductionPlan, "id">) => void;
  onDeleteProduction: (id: number) => void;
}) {
  const activeDishes = dishes.filter((dish) => dish.active);
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [selectedDishId, setSelectedDishId] = useState("");
  const [portions, setPortions] = useState("");
  const [lines, setLines] = useState<ProductionLine[]>([]);

  function loadMenu() {
    const menu = menus.find((item) => item.id === Number(selectedMenuId));
    if (!menu) return;

    setLines(menu.dishIds.map((dishId) => ({ dishId, portions: "" })));
    setName(menu.name);
  }

  function addLine() {
    const dishId = Number(selectedDishId);
    if (!dishId || !portions.trim()) return;

    setLines((current) => {
      const existingLine = current.find((line) => line.dishId === dishId);

      if (existingLine) {
        return current.map((line) =>
          line.dishId === dishId ? { ...line, portions } : line
        );
      }

      return [{ dishId, portions }, ...current];
    });

    setSelectedDishId("");
    setPortions("");
  }

  function updateLinePortions(dishId: number, value: string) {
    setLines((current) =>
      current.map((line) =>
        line.dishId === dishId ? { ...line, portions: value } : line
      )
    );
  }

  function removeLine(dishId: number) {
    setLines((current) => current.filter((line) => line.dishId !== dishId));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validLines = lines.filter((line) => line.portions.trim());
    if (!name.trim() || !date || validLines.length === 0) return;

    onAddProduction({ name, date, lines: validLines });

    setName("");
    setDate(new Date().toISOString().slice(0, 10));
    setSelectedMenuId("");
    setSelectedDishId("");
    setPortions("");
    setLines([]);
  }

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Prévision</p>
            <h2>Nouvelle production</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleSubmit}>
          <label>
            Nom
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex : Production semaine 29"
            />
          </label>

          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>

          <label>
            Charger depuis un menu
            <select
              value={selectedMenuId}
              onChange={(event) => setSelectedMenuId(event.target.value)}
            >
              <option value="">Choisir un menu</option>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name}
                </option>
              ))}
            </select>
          </label>

          <button className="primary-action" type="button" onClick={loadMenu}>
            Charger le menu
          </button>

          <label>
            Plat
            <select
              value={selectedDishId}
              onChange={(event) => setSelectedDishId(event.target.value)}
            >
              <option value="">Choisir un plat actif</option>
              {activeDishes.map((dish) => (
                <option key={dish.id} value={dish.id}>
                  {dish.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Portions prévues
            <input
              inputMode="decimal"
              value={portions}
              onChange={(event) => setPortions(event.target.value)}
              placeholder="Ex : 60"
            />
          </label>

          <button className="primary-action" type="button" onClick={addLine}>
            Ajouter le plat
          </button>

          <div className="setting-list">
            {lines.length === 0 ? (
              <p>Aucun plat en production.</p>
            ) : (
              lines.map((line) => {
                const dish = dishes.find((item) => item.id === line.dishId);

                return (
                  <p key={line.dishId}>
                    {dish?.name || "Plat supprimé"}{" "}
                    <input
                      inputMode="decimal"
                      value={line.portions}
                      onChange={(event) =>
                        updateLinePortions(line.dishId, event.target.value)
                      }
                      placeholder="Portions"
                    />{" "}
                    <button
                      className="delete-action"
                      type="button"
                      onClick={() => removeLine(line.dishId)}
                    >
                      Retirer
                    </button>
                  </p>
                );
              })
            )}
          </div>

          <button className="primary-action" type="submit">
            Enregistrer la production
          </button>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Productions</p>
            <h2>Prévisions créées</h2>
          </div>
          <span className="status-pill">{productions.length}</span>
        </div>

        <div className="dish-list">
          {productions.length === 0 ? (
            <div className="empty-state">
              <strong>Aucune production</strong>
              <p>Crée une production pour calculer les besoins théoriques.</p>
            </div>
          ) : (
            productions.map((production) => (
              <div className="dish-row" key={production.id}>
                <div className="dish-photo">PROD</div>

                <div className="dish-info">
                  <div>
                    <strong>{production.name}</strong>
                    <span>{formatDate(production.date)}</span>
                  </div>
                  <p>{getProductionDishSummary(production, dishes)}</p>
                  <p>{getProductionNeedsSummary(production, dishes, specs)}</p>
                </div>

                <div className="dish-meta">
                  <strong>{production.lines.length}</strong>
                  <span>plats</span>
                </div>

                <div className="dish-actions">
                  <button
                    className="delete-action"
                    onClick={() => onDeleteProduction(production.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}

function ShoppingListView({
  dishes,
  specs,
  productions,
}: {
  dishes: Dish[];
  specs: DishSpec[];
  productions: ProductionPlan[];
}) {
  const [selectedProductionId, setSelectedProductionId] = useState("");

  const selectedProduction =
    productions.find((production) => production.id === Number(selectedProductionId)) ||
    productions[0];

  const needs = selectedProduction ? getShoppingNeeds(selectedProduction, specs) : [];
  const ingredients = needs.filter((need) => need.type === "ingredient");
  const consumables = needs.filter((need) => need.type === "consommable");

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Calcul théorique</p>
            <h2>Production source</h2>
          </div>
        </div>

        <form className="entity-form">
          <label>
            Production
            <select
              value={selectedProduction?.id || ""}
              onChange={(event) => setSelectedProductionId(event.target.value)}
            >
              {productions.length === 0 ? (
                <option value="">Aucune production</option>
              ) : (
                productions.map((production) => (
                  <option key={production.id} value={production.id}>
                    {production.name}
                  </option>
                ))
              )}
            </select>
          </label>

          <div className="setting-list">
            {selectedProduction ? (
              <>
                <p>Date : {formatDate(selectedProduction.date)}</p>
                <p>{getProductionDishSummary(selectedProduction, dishes)}</p>
                <p>Aucun arrondi appliqué.</p>
              </>
            ) : (
              <p>Crée d’abord une production.</p>
            )}
          </div>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Liste de courses</p>
            <h2>Quantités exactes</h2>
          </div>
          <span className="status-pill">{needs.length}</span>
        </div>

        <div className="dish-list">
          {!selectedProduction ? (
            <div className="empty-state">
              <strong>Aucune production</strong>
              <p>La liste de courses sera calculée depuis une production.</p>
            </div>
          ) : (
            <>
              <ShoppingSection title="Ingrédients" items={ingredients} />
              <ShoppingSection title="Emballages / consommables" items={consumables} />
            </>
          )}
        </div>
      </article>
    </section>
  );
}

function ShoppingSection({
  title,
  items,
}: {
  title: string;
  items: ShoppingNeed[];
}) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        <span className="status-pill">{items.length}</span>
      </div>

      <div className="dish-list">
        {items.length === 0 ? (
          <div className="empty-state">
            <strong>Aucune ligne</strong>
            <p>Rien à calculer pour cette catégorie.</p>
          </div>
        ) : (
          items.map((item) => (
            <div className="dish-row" key={`${item.type}-${item.name}-${item.unit}`}>
              <div className="dish-photo">
                {item.type === "ingredient" ? "ING" : "CON"}
              </div>

              <div className="dish-info">
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.type === "ingredient" ? "Ingrédient" : "Consommable"}
                  </span>
                </div>
                <p>Quantité théorique exacte</p>
              </div>

              <div className="dish-meta">
                <strong>{item.quantity}</strong>
                <span>{item.unit}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StocksView({
  stockItems,
  stockMovements,
  onAddStockItem,
  onDeleteStockItem,
  onAddStockMovement,
}: {
  stockItems: StockItem[];
  stockMovements: StockMovement[];
  onAddStockItem: (item: Omit<StockItem, "id">) => void;
  onDeleteStockItem: (id: number) => void;
  onAddStockMovement: (movement: Omit<StockMovement, "id" | "userName">) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<StockItem["category"]>("ingredient");
  const [unit, setUnit] = useState("g");
  const [quantity, setQuantity] = useState("");
  const [minQuantity, setMinQuantity] = useState("");

  const [movementStockItemId, setMovementStockItemId] = useState("");
  const [movementType, setMovementType] = useState<"entrée" | "sortie">("entrée");
  const [movementQuantity, setMovementQuantity] = useState("");
  const [movementDate, setMovementDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [movementComment, setMovementComment] = useState("");

  function handleCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !unit.trim()) return;

    onAddStockItem({
      name,
      category,
      unit,
      quantity: quantity.trim() || "0",
      minQuantity: minQuantity.trim() || "0",
    });

    setName("");
    setCategory("ingredient");
    setUnit("g");
    setQuantity("");
    setMinQuantity("");
  }

  function handleCreateMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const stockItemId = Number(movementStockItemId);

    if (!stockItemId || !movementQuantity.trim() || !movementDate) return;

    onAddStockMovement({
      stockItemId,
      type: movementType,
      quantity: movementQuantity,
      date: movementDate,
      comment: movementComment,
    });

    setMovementStockItemId("");
    setMovementType("entrée");
    setMovementQuantity("");
    setMovementDate(new Date().toISOString().slice(0, 10));
    setMovementComment("");
  }

  const lowStockItems = stockItems.filter((item) =>
    isLowerOrEqualDecimal(item.quantity, item.minQuantity)
  );

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Stock</p>
            <h2>Nouvel article</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleCreateItem}>
          <label>
            Nom
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex : poulet, riz, barquette"
            />
          </label>

          <label>
            Catégorie
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as StockItem["category"])}
            >
              <option value="ingredient">Ingrédient</option>
              <option value="consommable">Consommable</option>
              <option value="plat">Plat préparé</option>
            </select>
          </label>

          <label>
            Unité
            <select value={unit} onChange={(event) => setUnit(event.target.value)}>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
              <option value="unité">unité</option>
            </select>
          </label>

          <label>
            Stock actuel
            <input
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Ex : 12.5"
            />
          </label>

          <label>
            Seuil faible
            <input
              inputMode="decimal"
              value={minQuantity}
              onChange={(event) => setMinQuantity(event.target.value)}
              placeholder="Ex : 2"
            />
          </label>

          <button className="primary-action" type="submit">
            Ajouter l'article
          </button>
        </form>

        <div className="panel-heading">
          <div>
            <p className="eyebrow">Mouvement</p>
            <h2>Entrée / sortie</h2>
          </div>
        </div>

        <form className="entity-form" onSubmit={handleCreateMovement}>
          <label>
            Article
            <select
              value={movementStockItemId}
              onChange={(event) => setMovementStockItemId(event.target.value)}
            >
              <option value="">Choisir un article</option>
              {stockItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.quantity} {item.unit}
                </option>
              ))}
            </select>
          </label>

          <label>
            Type
            <select
              value={movementType}
              onChange={(event) =>
                setMovementType(event.target.value as "entrée" | "sortie")
              }
            >
              <option value="entrée">Entrée en stock</option>
              <option value="sortie">Sortie de stock</option>
            </select>
          </label>

          <label>
            Quantité exacte
            <input
              inputMode="decimal"
              value={movementQuantity}
              onChange={(event) => setMovementQuantity(event.target.value)}
              placeholder="Ex : 3.5"
            />
          </label>

          <label>
            Date
            <input
              type="date"
              value={movementDate}
              onChange={(event) => setMovementDate(event.target.value)}
            />
          </label>

          <label>
            Commentaire
            <input
              value={movementComment}
              onChange={(event) => setMovementComment(event.target.value)}
              placeholder="Ex : achat Metro, correction, production"
            />
          </label>

          <button className="primary-action" type="submit">
            Enregistrer le mouvement
          </button>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Stock actuel</p>
            <h2>Articles</h2>
          </div>
          <span className="status-pill">{stockItems.length}</span>
        </div>

        <div className="dish-list">
          {lowStockItems.length > 0 ? (
            <div className="panel">
              <div className="panel-heading">
                <h2>Stocks faibles</h2>
                <span className="status-pill">{lowStockItems.length}</span>
              </div>

              <div className="alert-list">
                {lowStockItems.map((item) => (
                  <p key={item.id}>
                    {item.name} : {item.quantity} {item.unit}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          {stockItems.length === 0 ? (
            <div className="empty-state">
              <strong>Aucun article</strong>
              <p>Ajoute tes ingrédients, consommables ou plats préparés.</p>
            </div>
          ) : (
            stockItems.map((item) => (
              <div className="dish-row" key={item.id}>
                <div className="dish-photo">{getStockCategoryLabel(item.category)}</div>

                <div className="dish-info">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{getStockCategoryName(item.category)}</span>
                  </div>
                  <p>
                    Seuil faible : {item.minQuantity} {item.unit}
                  </p>
                </div>

                <div className="dish-meta">
                  <strong>{item.quantity}</strong>
                  <span>{item.unit}</span>
                </div>

                <div className="dish-actions">
                  <button
                    className="delete-action"
                    onClick={() => onDeleteStockItem(item.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="panel">
            <div className="panel-heading">
              <h2>Historique</h2>
              <span className="status-pill">{stockMovements.length}</span>
            </div>

            <div className="dish-list">
              {stockMovements.length === 0 ? (
                <div className="empty-state">
                  <strong>Aucun mouvement</strong>
                  <p>Les entrées et sorties de stock apparaîtront ici.</p>
                </div>
              ) : (
                stockMovements.map((movement) => {
                  const item = stockItems.find(
                    (stockItem) => stockItem.id === movement.stockItemId
                  );

                  return (
                    <div className="dish-row" key={movement.id}>
                      <div className="dish-photo">
                        {movement.type === "entrée" ? "IN" : "OUT"}
                      </div>

                      <div className="dish-info">
                        <div>
                          <strong>{item?.name || "Article supprimé"}</strong>
                          <span>{movement.type}</span>
                        </div>
                        <p>
                          {formatDate(movement.date)} - {movement.userName}
                        </p>
                        <p>{movement.comment || "Aucun commentaire."}</p>
                      </div>

                      <div className="dish-meta">
                        <strong>
                          {movement.type === "entrée" ? "+" : "-"}
                          {movement.quantity}
                        </strong>
                        <span>{item?.unit || ""}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

function SettingsView() {
  return (
    <section className="settings-grid">
      <article className="panel setting-card">
        <p className="eyebrow">Lieux de vente</p>
        <h2>Antennes</h2>
        <div className="setting-list">
          {settings.antennes.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </article>

      <article className="panel setting-card">
        <p className="eyebrow">Encaissement</p>
        <h2>Moyens de paiement</h2>
        <div className="setting-list">
          {settings.payments.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </article>

      <article className="panel setting-card">
        <p className="eyebrow">Organisation</p>
        <h2>Catégories</h2>
        <div className="setting-list">
          {settings.dishCategories.map((item) => (
            <p key={item}>{item}</p>
          ))}
          {settings.purchaseCategories.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </article>

      <article className="panel setting-card">
        <p className="eyebrow">Fiscalité</p>
        <h2>TVA</h2>
        <div className="setting-list">
          <p>TVA ventes : 5,5 %</p>
          <p>TVA achats : saisie manuelle</p>
          <p>Modification réservée à Robin</p>
        </div>
      </article>
    </section>
  );
}

function isMenuActive(menu: WeeklyMenu) {
  const today = new Date().toISOString().slice(0, 10);
  return today >= menu.startDate && today <= menu.endDate;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

function getMenuDishNames(menu: WeeklyMenu, dishes: Dish[]) {
  const names = menu.dishIds
    .map((dishId) => dishes.find((dish) => dish.id === dishId)?.name)
    .filter(Boolean);

  return names.length > 0 ? names.join(", ") : "Aucun plat.";
}

function getProductionDishSummary(production: ProductionPlan, dishes: Dish[]) {
  return production.lines
    .map((line) => {
      const dish = dishes.find((item) => item.id === line.dishId);
      return `${dish?.name || "Plat supprimé"} : ${line.portions} portions`;
    })
    .join(" | ");
}

function getProductionNeedsSummary(
  production: ProductionPlan,
  dishes: Dish[],
  specs: DishSpec[]
) {
  const needs = production.lines.flatMap((line) => {
    const dish = dishes.find((item) => item.id === line.dishId);
    const spec = specs.find((item) => item.dishId === line.dishId);

    if (!dish || !spec) return [];

    return spec.items.map((item) => {
      const total = multiplyDecimalStrings(item.quantity, line.portions);
      return `${item.name} : ${total} ${item.unit}`;
    });
  });

  return needs.length > 0 ? needs.join(" | ") : "Aucun besoin calculable.";
}

function getShoppingNeeds(production: ProductionPlan, specs: DishSpec[]) {
  const totals: Record<string, ShoppingNeed> = {};

  production.lines.forEach((line) => {
    const spec = specs.find((item) => item.dishId === line.dishId);
    if (!spec) return;

    spec.items.forEach((item) => {
      const quantity = multiplyDecimalStrings(item.quantity, line.portions);
      const key = `${item.type}-${normalizeText(item.name)}-${item.unit}`;

      if (!totals[key]) {
        totals[key] = {
          name: item.name,
          quantity,
          unit: item.unit,
          type: item.type,
        };
        return;
      }

      totals[key].quantity = addDecimalStrings(totals[key].quantity, quantity);
    });
  });

  return Object.values(totals).sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function multiplyDecimalStrings(quantity: string, multiplier: string) {
  const cleanQuantity = quantity.replace(",", ".").trim();
  const cleanMultiplier = multiplier.replace(",", ".").trim();

  const quantityDecimals = cleanQuantity.split(".")[1]?.length || 0;
  const multiplierDecimals = cleanMultiplier.split(".")[1]?.length || 0;
  const totalDecimals = quantityDecimals + multiplierDecimals;

  const quantityInteger = Number(cleanQuantity.replace(".", ""));
  const multiplierInteger = Number(cleanMultiplier.replace(".", ""));

  if (Number.isNaN(quantityInteger) || Number.isNaN(multiplierInteger)) {
    return "0";
  }

  const result = (quantityInteger * multiplierInteger).toString();

  if (totalDecimals === 0) return result;

  const paddedResult = result.padStart(totalDecimals + 1, "0");
  const integerPart = paddedResult.slice(0, -totalDecimals);
  const decimalPart = paddedResult.slice(-totalDecimals).replace(/0+$/, "");

  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}

function addDecimalStrings(first: string, second: string) {
  return calculateDecimalStrings(first, second, "add");
}

function subtractDecimalStrings(first: string, second: string) {
  return calculateDecimalStrings(first, second, "subtract");
}

function calculateDecimalStrings(
  first: string,
  second: string,
  operation: "add" | "subtract"
) {
  const cleanFirst = first.replace(",", ".").trim();
  const cleanSecond = second.replace(",", ".").trim();

  const firstDecimals = cleanFirst.split(".")[1]?.length || 0;
  const secondDecimals = cleanSecond.split(".")[1]?.length || 0;
  const totalDecimals = Math.max(firstDecimals, secondDecimals);

  const firstInteger = Number(
    cleanFirst
      .replace(".", "")
      .padEnd(cleanFirst.replace(".", "").length + totalDecimals - firstDecimals, "0")
  );

  const secondInteger = Number(
    cleanSecond
      .replace(".", "")
      .padEnd(cleanSecond.replace(".", "").length + totalDecimals - secondDecimals, "0")
  );

  if (Number.isNaN(firstInteger) || Number.isNaN(secondInteger)) {
    return "0";
  }

  const calculated =
    operation === "add" ? firstInteger + secondInteger : firstInteger - secondInteger;

  const sign = calculated < 0 ? "-" : "";
  const result = Math.abs(calculated).toString();

  if (totalDecimals === 0) return `${sign}${result}`;

  const paddedResult = result.padStart(totalDecimals + 1, "0");
  const integerPart = paddedResult.slice(0, -totalDecimals);
  const decimalPart = paddedResult.slice(-totalDecimals).replace(/0+$/, "");

  return decimalPart ? `${sign}${integerPart}.${decimalPart}` : `${sign}${integerPart}`;
}

function isLowerOrEqualDecimal(first: string, second: string) {
  const difference = subtractDecimalStrings(first, second);
  return Number(difference) <= 0;
}

function getStockCategoryLabel(category: StockItem["category"]) {
  if (category === "ingredient") return "ING";
  if (category === "consommable") return "CON";
  return "PLAT";
}

function getStockCategoryName(category: StockItem["category"]) {
  if (category === "ingredient") return "Ingrédient";
  if (category === "consommable") return "Consommable";
  return "Plat préparé";
}