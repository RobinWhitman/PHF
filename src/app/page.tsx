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

const users: User[] = [
  { name: "Robin", role: "admin", pin: "2323" },
  { name: "Patrice", role: "associe", pin: "1644" },
  { name: "Megane", role: "associe", pin: "2010" },
];

const navItems = [
  "Dashboard",
  "Plats",
  "Menus",
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

  useEffect(() => {
    const savedUser = window.localStorage.getItem("phf-user");
    const user = users.find((item) => item.name === savedUser);

    if (user) {
      setCurrentUser(user);
    }

    setIsReady(true);
  }, []);

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
    setDishes((currentDishes) => [
      {
        ...dish,
        id: Date.now(),
      },
      ...currentDishes,
    ]);
  }

  function toggleDish(id: number) {
    setDishes((currentDishes) =>
      currentDishes.map((dish) =>
        dish.id === id ? { ...dish, active: !dish.active } : dish
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
            <p className="eyebrow">Macro Sprint 5</p>
            <h1>{activeModule}</h1>
          </div>

          <button className="primary-action" onClick={() => setActiveModule("Ventes")}>
            Nouvelle vente
          </button>
        </header>

        {activeModule === "Paramètres" && isAdmin ? (
          <SettingsView />
        ) : activeModule === "Plats" ? (
          <DishesView dishes={dishes} onAddDish={addDish} onToggleDish={toggleDish} />
        ) : (
          <DashboardView currentUser={currentUser} isAdmin={isAdmin} />
        )}
      </section>

      <nav className="mobile-nav">
        {["Dashboard", "Plats", "Menus", "Stocks", "Ventes"].map((item) => (
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
  onToggleDish,
}: {
  dishes: Dish[];
  onAddDish: (dish: Omit<Dish, "id">) => void;
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

    if (!name.trim() || !price.trim()) {
      return;
    }

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
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex : Shawarma Bowl"
            />
          </label>

          <label>
            Prix TTC
            <input
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Ex : 12.90"
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
            <input
              value={photo}
              onChange={(event) => setPhoto(event.target.value)}
              placeholder="Lien image provisoire"
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Composition rapide du plat"
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
            <h2>Liste active</h2>
          </div>
          <span className="status-pill">{dishes.length}</span>
        </div>

        <div className="dish-list">
          {dishes.map((dish) => (
            <div className="dish-row" key={dish.id}>
              <div className="dish-photo">
                {dish.photo ? "Photo" : "PHF"}
              </div>

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

              <button
                className={dish.active ? "toggle active" : "toggle"}
                onClick={() => onToggleDish(dish.id)}
              >
                {dish.active ? "Actif" : "Inactif"}
              </button>
            </div>
          ))}
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