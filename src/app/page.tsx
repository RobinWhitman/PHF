"use client";

import { useEffect, useState } from "react";

type User = {
  name: string;
  role: "admin" | "associe";
  pin: string;
};

const users: User[] = [
  { name: "Robin", role: "admin", pin: "1111" },
  { name: "Associé 1", role: "associe", pin: "2222" },
  { name: "Associé 2", role: "associe", pin: "3333" },
];

const navItems = [
  "Dashboard",
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

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState(users[0].name);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("phf-user");
    const user = users.find((item) => item.name === savedUser);

    if (user) {
      setCurrentUser(user);
    }
  }, []);

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = users.find(
      (item) => item.name === selectedUser && item.pin === pin
    );

    if (!user) {
      setError("Utilisateur ou code incorrect.");
      return;
    }

    localStorage.setItem("phf-user", user.name);
    setCurrentUser(user);
    setPin("");
    setError("");
  }

  function handleLogout() {
    localStorage.removeItem("phf-user");
    setCurrentUser(null);
    setPin("");
    setError("");
  }

  if (!currentUser) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div>
            <p className="eyebrow">Pat Healthy Food</p>
            <h1>Connexion</h1>
            <p className="login-text">
              Accès réservé à l’équipe interne.
            </p>
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
            <span>Robin : 1111</span>
            <span>Associé 1 : 2222</span>
            <span>Associé 2 : 3333</span>
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
          {navItems.map((item, index) => {
            const disabled = item === "Paramètres" && !isAdmin;

            return (
              <button
                className={[
                  "nav-item",
                  index === 0 ? "active" : "",
                  disabled ? "disabled" : "",
                ].join(" ")}
                disabled={disabled}
                key={item}
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
            <p className="eyebrow">Macro Sprint 3</p>
            <h1>Tableau de bord</h1>
          </div>

          <button className="primary-action">Nouvelle vente</button>
        </header>

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
              <span className="status-pill">
                {isAdmin ? "Admin" : "Associé"}
              </span>
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
              <p>
                Paramètres sensibles : {isAdmin ? "autorisés" : "bloqués"}
              </p>
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
      </section>

      <nav className="mobile-nav">
        {["Dashboard", "Menus", "Stocks", "Ventes", "TVA"].map((item, index) => (
          <button className={index === 0 ? "active" : ""} key={item}>
            {item}
          </button>
        ))}
      </nav>
    </main>
  );
}