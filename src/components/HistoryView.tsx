import { useState } from "react";
import type { HistoryEntry } from "../types";
import { formatDate } from "../utils/calculations";

type HistoryViewProps = {
  entries: HistoryEntry[];
};

export function HistoryView({ entries }: HistoryViewProps) {
  const modules = ["Tous", ...Array.from(new Set(entries.map((entry) => entry.module)))];
  const users = ["Tous", ...Array.from(new Set(entries.map((entry) => entry.userName)))];

  const [selectedModule, setSelectedModule] = useState("Tous");
  const [selectedUser, setSelectedUser] = useState("Tous");

  const filteredEntries = entries.filter((entry) => {
    const moduleMatches =
      selectedModule === "Tous" || entry.module === selectedModule;
    const userMatches = selectedUser === "Tous" || entry.userName === selectedUser;

    return moduleMatches && userMatches;
  });

  return (
    <section className="dishes-layout">
      <article className="panel dish-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Filtres</p>
            <h2>Historique</h2>
          </div>
        </div>

        <form className="entity-form">
          <label>
            Module
            <select
              value={selectedModule}
              onChange={(event) => setSelectedModule(event.target.value)}
            >
              {modules.map((module) => (
                <option key={module}>{module}</option>
              ))}
            </select>
          </label>

          <label>
            Utilisateur
            <select
              value={selectedUser}
              onChange={(event) => setSelectedUser(event.target.value)}
            >
              {users.map((user) => (
                <option key={user}>{user}</option>
              ))}
            </select>
          </label>

          <div className="setting-list">
            <p>Actions affichées : {filteredEntries.length}</p>
            <p>Actions totales : {entries.length}</p>
          </div>
        </form>
      </article>

      <article className="panel dishes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Journal</p>
            <h2>Actions importantes</h2>
          </div>
          <span className="status-pill">{filteredEntries.length}</span>
        </div>

        <div className="dish-list">
          {filteredEntries.length === 0 ? (
            <div className="empty-state">
              <strong>Aucune action</strong>
              <p>Les actions importantes apparaîtront ici.</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div className="dish-row" key={entry.id}>
                <div className="dish-photo">LOG</div>

                <div className="dish-info">
                  <div>
                    <strong>{entry.action}</strong>
                    <span>{entry.module}</span>
                  </div>
                  <p>
                    {formatDate(entry.date)} à {entry.time} - {entry.userName}
                  </p>
                  <p>{entry.details}</p>
                </div>

                <div className="dish-meta">
                  <strong>{entry.time}</strong>
                  <span>{entry.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}