import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../hooks/useApi.js";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80&auto=format";

const FUEL_ICONS = {
  benzyna: "",
  diesel: "",
  elektryczny: "",
  hybryda: "",
  lpg: "",
};

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getCar(id)
      .then(setCar)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  if (error)
    return (
      <div
        className="container"
        style={{ padding: "80px 24px", textAlign: "center" }}
      >
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-outline" onClick={() => navigate("/cars")}>
          ← Wróć do oferty
        </button>
      </div>
    );
  if (!car) return null;

  const price = Number(car.price).toLocaleString("pl-PL");
  const mileage = Number(car.mileage).toLocaleString("pl-PL");

  const specs = [
    { label: "Marka", value: car.brand_name },
    { label: "Model", value: car.model },
    { label: "Rok produkcji", value: car.year },
    { label: "Przebieg", value: `${mileage} km` },
    { label: "Paliwo", value: `${FUEL_ICONS[car.fuel_type]} ${car.fuel_type}` },
    { label: "Skrzynia biegów", value: car.transmission },
    { label: "Kolor", value: car.color || "—" },
    { label: "Status", value: car.status },
  ];

  return (
    <div style={{ padding: "48px 0" }}>
      <div className="container">
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 32,
            fontSize: "0.82rem",
            color: "var(--text-muted)",
          }}
        >
          <button
            className="btn btn-ghost"
            style={{ padding: "4px 0", fontSize: "0.82rem" }}
            onClick={() => navigate("/")}
          >
            Strona główna
          </button>
          <span>/</span>
          <button
            className="btn btn-ghost"
            style={{ padding: "4px 0", fontSize: "0.82rem" }}
            onClick={() => navigate("/cars")}
          >
            Oferta
          </button>
          <span>/</span>
          <span style={{ color: "var(--text)" }}>
            {car.brand_name} {car.model}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: 40,
            alignItems: "start",
          }}
        >
          {/* Left - image */}
          <div>
            <div
              style={{
                aspectRatio: "16/10",
                overflow: "hidden",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <img
                src={car.image_url || PLACEHOLDER}
                alt={`${car.brand_name} ${car.model}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = PLACEHOLDER;
                }}
              />
            </div>

            {car.description && (
              <div
                style={{
                  marginTop: 24,
                  padding: 24,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <h3
                  style={{
                    marginBottom: 12,
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                  }}
                >
                  Opis
                </h3>
                <p
                  style={{
                    color: "var(--text-muted)",
                    lineHeight: 1.8,
                    fontSize: "0.95rem",
                  }}
                >
                  {car.description}
                </p>
              </div>
            )}
          </div>

          {/* Right - info */}
          <div style={{ position: "sticky", top: 88 }}>
            <div style={{ marginBottom: 4 }}>
              <p
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                }}
              >
                {car.brand_name}
              </p>
            </div>
            <h1
              style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", marginBottom: 8 }}
            >
              {car.model}
            </h1>
            <div style={{ marginBottom: 20 }}>
              <span
                className={`badge badge-${car.status.replace("ę", "e").replace("ó", "o")}`}
              >
                {car.status}
              </span>
            </div>

            <div
              style={{
                fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                fontFamily: "var(--font-display)",
                color: "var(--accent)",
                marginBottom: 28,
              }}
            >
              {price} zł
            </div>

            {/* Specs table */}
            <div
              style={{ border: "1px solid var(--border)", marginBottom: 24 }}
            >
              {specs.map(({ label, value }, i) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderBottom:
                      i < specs.length - 1 ? "1px solid var(--border)" : "none",
                    fontSize: "0.88rem",
                  }}
                >
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontWeight: 400 }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {car.status === "dostępny" && (
                <button
                  className="btn btn-primary"
                  style={{ justifyContent: "center", padding: "14px 24px" }}
                >
                  📞 Zapytaj o samochód
                </button>
              )}
              <button
                className="btn btn-outline"
                style={{ justifyContent: "center" }}
                onClick={() => navigate("/cars")}
              >
                ← Wróć do oferty
              </button>
            </div>

            <p
              style={{
                marginTop: 16,
                fontSize: "0.75rem",
                color: "var(--text-dim)",
                textAlign: "center",
              }}
            >
              Dodano: {new Date(car.created_at).toLocaleDateString("pl-PL")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
