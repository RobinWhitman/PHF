import type { User } from "../types";
import { navItems } from "../data/initial-data";

type AppShellProps = {
  activeModule: string;
  currentUser: User;
  isAdmin: boolean;
  children: React.ReactNode;
  onActiveModuleChange: (module: string) => void;
  onLogout: () => void;
};

export function AppShell({
  activeModule,
  currentUser,
  isAdmin,
  children,
  onActiveModuleChange,
  onLogout,
}: AppShellProps) {
  const visibleMobileItems = navItems.filter(
    (item) => item !== "Paramètres" || isAdmin
  );

  return (
    <main className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <img src="/logo.png?v=3" alt="Pat Healthy Food" />
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
                onClick={() => onActiveModuleChange(item)}
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
          <button onClick={onLogout}>Déconnexion</button>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PHF ERP</p>
            <h1>{activeModule}</h1>
          </div>

          <button
            className="primary-action"
            onClick={() => onActiveModuleChange("Ventes")}
          >
            Nouvelle vente
          </button>
        </header>

        {children}
      </section>

      <nav className="mobile-nav" aria-label="Navigation mobile">
        {visibleMobileItems.map((item) => (
          <button
            className={activeModule === item ? "active" : ""}
            key={item}
            onClick={() => onActiveModuleChange(item)}
          >
            {item}
          </button>
        ))}
      </nav>
    </main>
  );
}