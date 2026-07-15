"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type User = {
  name: string;
  role: "admin" | "associe";
  pin: string;
};

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

  useEffect(() => {
    const savedUser = window.localStorage.getItem("phf-user");
    const savedDishes = window.localStorage.getItem("phf-dishes");
    const savedMenus = window.localStorage.getItem("phf-menus");
    const savedSpecs = window.localStorage.getItem("phf-specs");
    const user = users.find((item) => item.name === savedUser);

    if (user) setCurrentUser(user);
    if (savedDishes) setDishes(JSON.parse(savedDishes));
    if (savedMenus) setMenus(JSON.parse(savedMenus));
    if (savedSpecs) setSpecs(JSON.parse(savedSpecs));

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      window.localStorage.setItem("phf-dishes", JSON.stringify(dishes));
      window.localStorage.setItem("phf-menus", JSON.stringify(menus));
      window.localStorage.setItem("phf-specs", JSON.stringify(specs));
    }
  }, [dishes, menus, specs, isReady]);

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
    setDishes((currentDishes) => [{ ...dish, id: Date.now() }, ...currentDishes]);
  }

  function toggleDish(id: number) {
    setDishes((currentDishes) =>
      currentDishes.map((dish) =>
        dish.id === id ? { ...dish, active: !dish.active } : dish
      )
    );
  }

  function deleteDish(id: number) {
    setDishes((currentDishes) =>
      currentDishes.filter((dish) => dish.id !== id)
    );

    setMenus((currentMenus) =>
      currentMenus.map((menu) => ({
        ...menu,
        dishIds: menu.dishIds.filter((dishId) => dishId !== id),
      }))
    );

    setSpecs((currentSpecs) =>
      currentSpecs.filter((spec) => spec.dishId !== id)
    );
  }

  function addMenu(menu: Omit<WeeklyMenu, "id">) {
    setMenus((currentMenus) => [{ ...menu, id: Date.now() }, ...currentMenus]);
  }

  function deleteMenu(id: number) {
    setMenus((currentMenus) => currentMenus.filter((menu) => menu.id !== id));
  }

  function addSpecItem(dishId: number, item: Omit<SpecItem, "id">) {
    setSpecs((currentSpecs) => {
      const existingSpec = currentSpecs.find((spec) => spec.dishId === dishId);
      const newItem = { ...item, id: Date.now() };

      if (!existingSpec) {
        return [{ dishId, items: [newItem] }, ...currentSpecs];
      }

      return currentSpecs.map((spec) =>
        spec.dishId === dishId
          ? { ...spec, items: [newItem, ...spec.items] }
          : spec
      );
    });
  }

  function deleteSpecItem(dishId: number, itemId: number) {
    setSpecs((currentSpecs) =>
      currentSpecs.map((spec) =>
        spec.dishId === dishId
          ? {
              ...spec,
              items: spec.items.filter((item) => item.id !== itemId),
            }
          : spec
      )
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
            <p className="eyebrow">Macro Sprint 7</p>
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
        ) : (
          <DashboardView currentUser={currentUser} isAdmin={isAdmin} />
        )}
      </section>

      <nav className="mobile-nav">
        {["Dashboard", "Plats", "Menus", "Cahiers", "Ventes"].map((item) => (
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

    onAddDish({
      name,
      price,
      category,
      vat,
      description,
      photo,
      active: true,
    });

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
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
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

    setDishIds((currentIds) => [...currentIds, dishId]);
    setSelectedDishId("");
  }

  function removeDishFromMenu(dishId: number) {
    setDishIds((currentIds) => currentIds.filter((id) => id !== dishId));
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

    onAddSpecItem(dishId, {
      name,
      quantity,
      unit,
      type,
    });

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