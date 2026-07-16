import type { FormEvent } from "react";
import type { User } from "../types";
import { users } from "../data/initial-data";

type LoginScreenProps = {
  selectedUser: string;
  pin: string;
  error: string;
  onSelectedUserChange: (value: string) => void;
  onPinChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginScreen({
  selectedUser,
  pin,
  error,
  onSelectedUserChange,
  onPinChange,
  onSubmit,
}: LoginScreenProps) {
  return (
    <main className="login-page">
      <section className="login-card">
        <div>
          <p className="eyebrow">Pat Healthy Food</p>
          <h1>Connexion</h1>
          <p className="login-text">Accès réservé à l’équipe interne.</p>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <label>
            Utilisateur
            <select
              value={selectedUser}
              onChange={(event) => onSelectedUserChange(event.target.value)}
            >
              {users.map((user: User) => (
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
              onChange={(event) => onPinChange(event.target.value)}
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