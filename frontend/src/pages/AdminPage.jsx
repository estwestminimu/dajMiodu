import React, { useState, useEffect, useCallback } from "react";
import { api } from "../hooks/useApi.js";
import { useAuth } from "../hooks/AuthContext.jsx";
import CarFormModal from "../components/CarFormModal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import CarCard from "../components/CarCard.jsx";
import AuthModal from "../components/AuthModal.jsx";

export default function AdminPage() {
  const { isLoggedIn, loading: authLoading, user } = useAuth();
  const [cars, setCars] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  const [formModal, setFormModal] = useState(false);
  const [editCar, setEditCar] = useState(null);
  const [deleteCar, setDeleteCar] = useState(null);
  const [authModal, setAuthModal] = useState(false);

  const fetchCars = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Pobierz tylko auta zalogowanego użytkownika
      const data = await api.getCars({ page, limit: LIMIT, added_by: user.id });
      setCars(data.cars);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, user]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleEdit = (car) => {
    setEditCar(car);
    setFormModal(true);
  };
  const handleAdd = () => {
    setEditCar(null);
    setFormModal(true);
  };
  const handleSaved = async () => {
    setFormModal(false);
    await fetchCars();
    showSuccess("Samochód zapisany!");
  };
  const handleDeleteConfirm = async () => {
    try {
      await api.deleteCar(deleteCar.id);
      setDeleteCar(null);
      await fetchCars();
      showSuccess("Samochód usunięty!");
    } catch (err) {
      setError(err.message);
      setDeleteCar(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  // Guard
  if (!authLoading && !isLoggedIn) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>
            Wymagane logowanie
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              marginBottom: 28,
              fontSize: "0.9rem",
            }}
          >
            Zaloguj się, aby zarządzać swoimi ogłoszeniami.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setAuthModal(true)}
            style={{ padding: "12px 32px" }}
          >
            Zaloguj się
          </button>
          {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "48px 0" }}>
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16,
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
              Panel zarządzania
            </p>
            <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>
              Moje ogłoszenia
            </h1>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                marginTop: 4,
              }}
            >
              {user?.name} · {total} ogłoszeni
              {total === 1 ? "e" : total < 5 ? "a" : "ów"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", border: "1px solid var(--border)" }}>
              {["grid", "table"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "8px 14px",
                    background: view === v ? "var(--surface2)" : "none",
                    border: "none",
                    color: view === v ? "var(--accent)" : "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    transition: "all 0.2s",
                  }}
                >
                  {v === "grid" ? "⊞" : "≡"}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={handleAdd}>
              + Dodaj samochód
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">✓ {success}</div>}

        {/* Content */}
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : cars.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              border: "1px dashed var(--border)",
              color: "var(--text-muted)",
            }}
          >
            <p style={{ fontSize: "1.1rem", marginBottom: 8 }}>
              Nie masz jeszcze żadnych ogłoszeń
            </p>
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              style={{ marginTop: 16 }}
            >
              + Dodaj pierwszy samochód
            </button>
          </div>
        ) : view === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 1,
              border: "1px solid var(--border)",
            }}
          >
            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                adminMode
                currentUserId={user?.id}
                onEdit={handleEdit}
                onDelete={setDeleteCar}
              />
            ))}
          </div>
        ) : (
          <div
            className="table-wrap"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          >
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Marka / Model</th>
                  <th>Rok</th>
                  <th>Cena</th>
                  <th>Przebieg</th>
                  <th>Paliwo</th>
                  <th>Status</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {cars.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--text-muted)",
                      }}
                    >
                      Brak ogłoszeń
                    </td>
                  </tr>
                ) : (
                  cars.map((car) => (
                    <tr key={car.id}>
                      <td
                        style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}
                      >
                        #{car.id}
                      </td>
                      <td>
                        <span
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.8rem",
                          }}
                        >
                          {car.brand_name}{" "}
                        </span>
                        <strong>{car.model}</strong>
                      </td>
                      <td>{car.year}</td>
                      <td style={{ color: "var(--accent)" }}>
                        {Number(car.price).toLocaleString("pl-PL")} zł
                      </td>
                      <td>{Number(car.mileage).toLocaleString("pl-PL")} km</td>
                      <td>{car.fuel_type}</td>
                      <td>
                        <span
                          className={`badge badge-${car.status.replace("ę", "e").replace("ó", "o")}`}
                        >
                          {car.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleEdit(car)}
                          >
                            Edytuj
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteCar(car)}
                          >
                            Usuń
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 32,
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

      {formModal && (
        <CarFormModal
          car={editCar}
          onClose={() => setFormModal(false)}
          onSaved={handleSaved}
        />
      )}
      {deleteCar && (
        <ConfirmModal
          title="Usuń ogłoszenie"
          message={`Czy na pewno chcesz usunąć ${deleteCar.brand_name} ${deleteCar.model}? Tej operacji nie można cofnąć.`}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteCar(null)}
        />
      )}
    </div>
  );
}
