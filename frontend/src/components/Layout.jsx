import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext.jsx";
import AuthModal from "./AuthModal.jsx";

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout, isLoggedIn } = useAuth();
  const [authModal, setAuthModal] = useState(false);

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(10,10,10,0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "baseline",
              gap: 2,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                color: "var(--accent)",
              }}
            >
              Daj
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                color: "var(--text)",
              }}
            >
              Miodu
            </span>
          </button>

          {/* Nav + Auth */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <nav style={{ display: "flex", gap: 2, alignItems: "center" }}>
              {[
                { to: "/", label: "Główna" },
                { to: "/cars", label: "Oferta" },
                ...(isLoggedIn
                  ? [{ to: "/admin", label: "Moje ogłoszenia" }]
                  : []),
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  style={({ isActive }) => ({
                    padding: "6px 14px",
                    fontSize: "0.82rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: isActive ? "var(--accent)" : "var(--text-muted)",
                    borderBottom: isActive
                      ? "1px solid var(--accent)"
                      : "1px solid transparent",
                    transition: "all 0.2s",
                  })}
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <div
              style={{
                width: 1,
                height: 20,
                background: "var(--border)",
                margin: "0 8px",
              }}
            />

            {isLoggedIn ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                >
                  {user?.name}
                </span>
                <button className="btn btn-outline btn-sm" onClick={logout}>
                  Wyloguj
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setAuthModal(true)}
              >
                Zaloguj się
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px 0",
          marginTop: 80,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--accent)",
              }}
            >
              DajMiodu
            </span>
            <span
              style={{
                color: "var(--text-dim)",
                fontSize: "0.82rem",
                marginLeft: 16,
              }}
            >
              Samochody premium
            </span>
          </div>
          <p style={{ color: "var(--text-dim)", fontSize: "0.82rem" }}>
            © {new Date().getFullYear()} DajMiodu. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </footer>

      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
    </div>
  );
}
