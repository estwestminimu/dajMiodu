import React, { useState, useEffect, useCallback } from "react";
import { api } from "../hooks/useApi.js";
import CarCard from "../components/CarCard.jsx";

const FUELS = ["benzyna", "diesel", "elektryczny", "hybryda", "lpg"];

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [total, setTotal] = useState(0);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search: "",
    brand_id: "",
    fuel_type: "",
    transmission: "",
    status: "",
    min_price: "",
    max_price: "",
    sort: "created_at",
    order: "DESC",
  });

  const LIMIT = 12;

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { ...filters, page, limit: LIMIT };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const data = await api.getCars(params);
      setCars(data.cars);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);
  useEffect(() => {
    api.getBrands().then(setBrands).catch(console.error);
  }, []);

  const setFilter = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      brand_id: "",
      fuel_type: "",
      transmission: "",
      status: "",
      min_price: "",
      max_price: "",
      sort: "created_at",
      order: "DESC",
    });
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ padding: "48px 0" }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 8,
            }}
          >
            Oferta
          </p>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}>
            Wszystkie samochody
          </h1>
        </div>

        {/* Filters */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "24px",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div className="form-group">
              <label>Szukaj</label>
              <input
                type="text"
                placeholder="Marka, model..."
                value={filters.search}
                onChange={setFilter("search")}
              />
            </div>
            <div className="form-group">
              <label>Marka</label>
              <select value={filters.brand_id} onChange={setFilter("brand_id")}>
                <option value="">Wszystkie</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Paliwo</label>
              <select
                value={filters.fuel_type}
                onChange={setFilter("fuel_type")}
              >
                <option value="">Wszystkie</option>
                {FUELS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Skrzynia</label>
              <select
                value={filters.transmission}
                onChange={setFilter("transmission")}
              >
                <option value="">Wszystkie</option>
                <option value="manualna">Manualna</option>
                <option value="automatyczna">Automatyczna</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={filters.status} onChange={setFilter("status")}>
                <option value="">Wszystkie</option>
                <option value="dostępny">Dostępny</option>
                <option value="zarezerwowany">Zarezerwowany</option>
                <option value="sprzedany">Sprzedany</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cena min (zł)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.min_price}
                onChange={setFilter("min_price")}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Cena max (zł)</label>
              <input
                type="number"
                placeholder="∞"
                value={filters.max_price}
                onChange={setFilter("max_price")}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Sortuj</label>
              <select
                value={`${filters.sort}:${filters.order}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split(":");
                  setFilters((f) => ({ ...f, sort, order }));
                  setPage(1);
                }}
              >
                <option value="created_at:DESC">Najnowsze</option>
                <option value="price:ASC">Cena: rosnąco</option>
                <option value="price:DESC">Cena: malejąco</option>
                <option value="year:DESC">Rok: najnowszy</option>
                <option value="mileage:ASC">Przebieg: najniższy</option>
              </select>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Znaleziono{" "}
              <strong style={{ color: "var(--text)" }}>{total}</strong>{" "}
              samochodów
            </p>
            <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
              Wyczyść filtry
            </button>
          </div>
        </div>

        {/* Grid */}
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : cars.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "var(--text-muted)",
            }}
          >
            <p style={{ fontSize: "1.1rem", marginBottom: 8 }}>Brak wyników</p>
            <p style={{ fontSize: "0.85rem" }}>
              Spróbuj zmienić filtry wyszukiwania.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 1,
              border: "1px solid var(--border)",
            }}
          >
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 40,
            }}
          >
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              ← Poprzednia
            </button>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
              }}
            >
              {page} / {totalPages}
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              Następna →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
