import React, { useState } from "react";
import { api } from "../hooks/useApi.js";
import { useAuth } from "../hooks/AuthContext.jsx";

export default function AuthModal({ onClose }) {
  const { login } = useAuth();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data =
        mode === "login"
          ? await api.login({ email: form.email, password: form.password })
          : await api.register({
              name: form.name,
              email: form.email,
              password: form.password,
            });
      login(data.token, data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div style={{ display: "flex", gap: 0 }}>
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                style={{
                  padding: "4px 20px",
                  background: "none",
                  border: "none",
                  borderBottom:
                    mode === m
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
                  color: mode === m ? "var(--accent)" : "var(--text-muted)",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.82rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                }}
              >
                {m === "login" ? "Logowanie" : "Rejestracja"}
              </button>
            ))}
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.6rem",
                color: "var(--accent)",
              }}
            >
              Daj
            </span>
            <span
              style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem" }}
            >
              Miodu
            </span>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.82rem",
                marginTop: 4,
              }}
            >
              {mode === "login"
                ? "Zaloguj się, aby zarządzać ofertą"
                : "Utwórz konto i zacznij sprzedawać"}
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {mode === "register" && (
                <div className="form-group">
                  <label>Imię i nazwisko</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set("name")}
                    required
                    placeholder="Jan Kowalski"
                    autoFocus
                  />
                </div>
              )}
              <div className="form-group">
                <label>Adres email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  required
                  placeholder="jan@example.com"
                  autoFocus={mode === "login"}
                />
              </div>
              <div className="form-group">
                <label>
                  Hasło{" "}
                  {mode === "register" && (
                    <span style={{ color: "var(--text-dim)" }}>
                      (min. 6 znaków)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  required
                  placeholder="••••••••"
                  minLength={mode === "register" ? 6 : undefined}
                />
              </div>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
                style={{ justifyContent: "center", padding: "12px" }}
              >
                {loading
                  ? "Ładowanie..."
                  : mode === "login"
                    ? "Zaloguj się"
                    : "Utwórz konto"}
              </button>
            </div>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: "0.82rem",
              color: "var(--text-muted)",
            }}
          >
            {mode === "login" ? "Nie masz konta?" : "Masz już konto?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent)",
                cursor: "pointer",
                fontSize: "0.82rem",
              }}
            >
              {mode === "login" ? "Zarejestruj się" : "Zaloguj się"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
