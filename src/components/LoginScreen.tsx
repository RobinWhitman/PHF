import type { FormEvent } from "react";
import type { User } from "../types";

type LoginScreenProps = {
  users: User[];
  selectedUser: string;
  pin: string;
  error: string;
  onSelectedUserChange: (value: string) => void;
  onPinChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginScreen({
  users,
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
              onChange={(event) => onPinChange(event.target.value)}
              placeholder="Code à 4 chiffres"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-action" type="submit">
            Se connecter
          </button>
        </form>
      </section>
    </main>
  );
}