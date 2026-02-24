import React, { useState, useEffect, useRef } from "react";
import { api } from "../hooks/useApi.js";

const EMPTY = {
  brand_id: "",
  model: "",
  year: new Date().getFullYear(),
  price: "",
  mileage: "",
  fuel_type: "benzyna",
  transmission: "manualna",
  color: "",
  description: "",
  status: "dostępny",
};

export default function CarFormModal({ car, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const isEdit = !!car;

  useEffect(() => {
    api.getBrands().then(setBrands).catch(console.error);
    if (car) {
      setForm({
        brand_id: car.brand_id || "",
        model: car.model || "",
        year: car.year || new Date().getFullYear(),
        price: car.price || "",
        mileage: car.mileage || "",
        fuel_type: car.fuel_type || "benzyna",
        transmission: car.transmission || "manualna",
        color: car.color || "",
        description: car.description || "",
        status: car.status || "dostępny",
      });
      if (car.image_url)
        setImagePreview(`http://localhost:3001${car.image_url}`);
    }
  }, [car]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Używamy FormData żeby wysłać plik
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append("image", imageFile);

      if (isEdit) {
        await api.updateCar(car.id, formData);
      } else {
        await api.createCar(formData);
      }
      onSaved();
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
      <div className="modal">
        <div className="modal-header">
          <h2 style={{ fontSize: "1.2rem" }}>
            {isEdit ? "Edytuj samochód" : "Dodaj samochód"}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Upload zdjęcia */}
              <div className="form-group">
                <label>Zdjęcie samochodu</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed var(--border)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                    overflow: "hidden",
                    background: "var(--surface2)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                  }
                >
                  {imagePreview ? (
                    <div style={{ position: "relative" }}>
                      <img
                        src={imagePreview}
                        alt="Podgląd"
                        style={{
                          width: "100%",
                          height: 200,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = 1)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = 0)
                        }
                      >
                        <span style={{ color: "white", fontSize: "0.85rem" }}>
                          Kliknij aby zmienić
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "32px",
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: 8 }}>
                      </div>
                      <p style={{ fontSize: "0.85rem" }}>
                        Kliknij aby wybrać zdjęcie
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-dim)",
                          marginTop: 4,
                        }}
                      >
                        JPG, PNG, WebP max 8MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.avif"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Marka *</label>
                  <select
                    value={form.brand_id}
                    onChange={set("brand_id")}
                    required
                  >
                    <option value="">Wybierz markę</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Model *</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={set("model")}
                    required
                    placeholder="np. M3 Competition"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Rok *</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={set("year")}
                    required
                    min="1900"
                    max="2030"
                  />
                </div>
                <div className="form-group">
                  <label>Cena (zł) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={set("price")}
                    required
                    min="1"
                    step="any"
                    placeholder="149900"
                  />
                </div>
                <div className="form-group">
                  <label>Przebieg (km) *</label>
                  <input
                    type="number"
                    value={form.mileage}
                    onChange={set("mileage")}
                    required
                    min="0"
                    placeholder="45000"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Paliwo *</label>
                  <select
                    value={form.fuel_type}
                    onChange={set("fuel_type")}
                    required
                  >
                    {["benzyna", "diesel", "elektryczny", "hybryda", "lpg"].map(
                      (f) => (
                        <option key={f} value={f}>
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>Skrzynia biegów *</label>
                  <select
                    value={form.transmission}
                    onChange={set("transmission")}
                    required
                  >
                    <option value="manualna">Manualna</option>
                    <option value="automatyczna">Automatyczna</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Kolor</label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={set("color")}
                    placeholder="np. Czarny"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={set("status")}>
                  <option value="dostępny">Dostępny</option>
                  <option value="zarezerwowany">Zarezerwowany</option>
                  <option value="sprzedany">Sprzedany</option>
                </select>
              </div>

              <div className="form-group">
                <label>Opis</label>
                <textarea
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Opis samochodu..."
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Zapisywanie..."
                    : isEdit
                      ? "Zapisz zmiany"
                      : "Dodaj samochód"}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={onClose}
                >
                  Anuluj
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
