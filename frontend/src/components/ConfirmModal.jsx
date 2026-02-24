import React, { useState } from "react";

export default function ConfirmModal({ title, message, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3 style={{ fontSize: "1rem" }}>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            {message}
          </p>
          <div className="form-actions">
            <button
              className="btn btn-danger"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Usuwanie..." : "Usuń"}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              Anuluj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
