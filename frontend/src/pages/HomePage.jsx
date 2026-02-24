import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../hooks/useApi.js";
import CarCard from "../components/CarCard.jsx";

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState([]);
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    api
      .getCars({
        limit: 3,
        status: "dostępny",
        sort: "created_at",
        order: "DESC",
      })
      .then((data) => {
        setFeaturedCars(data.cars);
        setStats({ total: data.total });
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage:
              "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            right: "10%",
            top: "30%",
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="container"
          style={{
            position: "relative",
            zIndex: 1,
            paddingTop: 80,
            paddingBottom: 80,
          }}
        >
          <div style={{ maxWidth: 700 }}>
            <p
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 24,
              }}
            >
              Salon samochodowy premium
            </p>
            <h1 style={{ marginBottom: 24, lineHeight: 1.1 }}>
              Znajdź samochód,
              <br />
              <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
                który daje miodu
              </em>
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "var(--text-muted)",
                maxWidth: 480,
                lineHeight: 1.8,
                marginBottom: 40,
              }}
            >
              Starannie dobrana oferta aut premium. Każdy pojazd sprawdzony, z
              pełną historią serwisową.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/cars")}
              >
                Przeglądaj ofertę
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate("/admin")}
              >
                Panel zarządzania
              </button>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                gap: 40,
                marginTop: 64,
                paddingTop: 32,
                borderTop: "1px solid var(--border)",
              }}
            >
              {[
                { val: "100%", label: "Sprawdzonych aut" },
                { val: stats.total + "+", label: "Dostępnych aut" },
                { val: "100%", label: "Satysfakcji" },
              ].map(({ val, label }) => (
                <div key={label}>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.8rem",
                      color: "var(--accent)",
                    }}
                  >
                    {val}
                  </p>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      letterSpacing: "0.05em",
                      marginTop: 2,
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured cars */}
      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 40,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 8,
                }}
              >
                Wyróżnione
              </p>
              <h2>Najnowsze w ofercie</h2>
            </div>
            <button
              className="btn btn-outline"
              onClick={() => navigate("/cars")}
            >
              Zobacz wszystkie
            </button>
          </div>

          {featuredCars.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "var(--text-muted)",
              }}
            >
              <p>
                Brak dostępnych samochodów.{" "}
                <button
                  className="btn btn-ghost"
                  onClick={() => navigate("/admin")}
                >
                  Dodaj pierwsze auto →
                </button>
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 1,
                border: "1px solid var(--border)",
              }}
            >
              {featuredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why us */}
      <section
        style={{ padding: "60px 0 80px", borderTop: "1px solid var(--border)" }}
      >
        <div className="container">
          <h2 style={{ marginBottom: 40, textAlign: "center" }}>
            Dlaczego DajMiodu?
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 2,
            }}
          >
            {[
              {
                icon: "",
                title: "Każde auto sprawdzone",
                desc: "Dokładna inspekcja techniczna przed wystawieniem oferty.",
              },
              {
                icon: "",
                title: "Pełna historia",
                desc: "Dokumentacja serwisowa i historii właścicieli dla każdego auta.",
              },
              {
                icon: "",
                title: "Uczciwe ceny",
                desc: "Transparentne ceny bez ukrytych opłat i kosztów dodatkowych.",
              },
              {
                icon: "",
                title: "Szybka transakcja",
                desc: "Minimum formalności, maksimum satysfakcji z zakupu.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  padding: "32px 28px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: 16 }}>{icon}</div>
                <h3
                  style={{
                    marginBottom: 8,
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.88rem",
                    lineHeight: 1.7,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
