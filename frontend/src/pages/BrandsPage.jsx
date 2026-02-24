import React, { useState, useEffect } from "react";
import { api } from "../hooks/useApi.js";
import ConfirmModal from "../components/ConfirmModal.jsx";

const EMPTY = { name: "", country: "", logo_url: "" };

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteBrand, setDeleteBrand] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await api.getBrands();
      setBrands(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const openAdd = () => {
    setEditBrand(null);
    setForm(EMPTY);
    setFormOpen(true);
  };
  const openEdit = (brand) => {
    setEditBrand(brand);
    setForm({
      name: brand.name,
      country: brand.country || "",
      logo_url: brand.logo_url || "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editBrand) {
        await api.updateBrand(editBrand.id, form);
        showSuccess("Marka zaktualizowana!");
      } else {
        await api.createBrand(form);
        showSuccess("Marka dodana!");
      }
      setFormOpen(false);
      await fetchBrands();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteBrand(deleteBrand.id);
      setDeleteBrand(null);
      await fetchBrands();
      showSuccess("Marka usunięta!");
    } catch (err) {
      setError(err.message);
      setDeleteBrand(null);
    }
  };

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

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
              Marki samochodów
            </h1>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                marginTop: 4,
              }}
            >
              {brands.length} zarejestrowanych marek
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            + Dodaj markę
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">✓ {success}</div>}

        {/* Inline form */}
        {formOpen && (
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--accent)",
              padding: "28px",
              marginBottom: 24,
              animation: "slideUp 0.2s ease",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                marginBottom: 20,
              }}
            >
              {editBrand ? `Edytuj: ${editBrand.name}` : "Nowa marka"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid" style={{ marginBottom: 20 }}>
                <div className="form-group">
                  <label>Nazwa marki *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set("name")}
                    required
                    placeholder="np. BMW"
                  />
                </div>
                <div className="form-group">
                  <label>Kraj pochodzenia</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={set("country")}
                    placeholder="np. Niemcy"
                  />
                </div>
                <div className="form-group">
                  <label>URL Logo</label>
                  <input
                    type="text"
                    value={form.logo_url}
                    onChange={set("logo_url")}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Zapisywanie..."
                    : editBrand
                      ? "Zapisz zmiany"
                      : "Dodaj markę"}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setFormOpen(false)}
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Brands table */}
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
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
                  <th>Marka</th>
                  <th>Kraj</th>
                  <th>Liczba aut</th>
                  <th>Dodano</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {brands.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--text-muted)",
                      }}
                    >
                      Brak marek.{" "}
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={openAdd}
                      >
                        Dodaj pierwszą →
                      </button>
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => (
                    <tr key={brand.id}>
                      <td
                        style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}
                      >
                        #{brand.id}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          {brand.logo_url && (
                            <img
                              src={brand.logo_url}
                              alt={brand.name}
                              style={{
                                width: 24,
                                height: 24,
                                objectFit: "contain",
                              }}
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          )}
                          <strong>{brand.name}</strong>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>
                        {brand.country || "—"}
                      </td>
                      <td>
                        <span
                          style={{
                            color:
                              brand.car_count > 0
                                ? "var(--accent)"
                                : "var(--text-dim)",
                          }}
                        >
                          {brand.car_count}
                        </span>
                      </td>
                      <td
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.82rem",
                        }}
                      >
                        {new Date(brand.created_at).toLocaleDateString("pl-PL")}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => openEdit(brand)}
                          >
                            Edytuj
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteBrand(brand)}
                            disabled={brand.car_count > 0}
                            title={
                              brand.car_count > 0
                                ? "Nie można usunąć marki z samochodami"
                                : ""
                            }
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
      </div>

      {deleteBrand && (
        <ConfirmModal
          title="Usuń markę"
          message={`Czy na pewno chcesz usunąć markę "${deleteBrand.name}"? Tej operacji nie można cofnąć.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteBrand(null)}
        />
      )}
    </div>
  );
}
