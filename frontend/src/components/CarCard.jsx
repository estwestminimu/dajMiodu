import React from "react";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=70&auto=format";

const FUEL_ICONS = {
  benzyna: "",
  diesel: "",
  elektryczny: "",
  hybryda: "",
  lpg: "",
};

export default function CarCard({
  car,
  onEdit,
  onDelete,
  adminMode,
  currentUserId,
}) {
  const navigate = useNavigate();
  const price = Number(car.price).toLocaleString("pl-PL");

  return (
    <div
      className="card"
      style={{ cursor: adminMode ? "default" : "pointer" }}
      onClick={adminMode ? undefined : () => navigate(`/cars/${car.id}`)}
    >
      {/* Image */}
      <div
        style={{
          height: 200,
          overflow: "hidden",
          background: "var(--surface2)",
          position: "relative",
        }}
      >
        <img
          src={car.image_url || PLACEHOLDER}
          alt={`${car.brand_name} ${car.model}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
          }}
          onMouseEnter={(e) =>
            !adminMode && (e.target.style.transform = "scale(1.04)")
          }
          onMouseLeave={(e) =>
            !adminMode && (e.target.style.transform = "scale(1)")
          }
          onError={(e) => {
            e.target.src = PLACEHOLDER;
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
          }}
        >
          <span
            className={`badge badge-${car.status.replace("ę", "e").replace("ó", "o")}`}
            style={{
              background: "rgba(10,10,10,0.8)",
              backdropFilter: "blur(4px)",
            }}
          >
            {car.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 22px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              {car.brand_name}
            </p>
            <h3
              style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}
            >
              {car.model}
            </h3>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                color: "var(--accent)",
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
              }}
            >
              {price} zł
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 14,
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            borderTop: "1px solid var(--border)",
            paddingTop: 14,
          }}
        >
          <span>{car.year}</span>
          <span>·</span>
          <span>{Number(car.mileage).toLocaleString("pl-PL")} km</span>
          <span>·</span>
          <span>
            {FUEL_ICONS[car.fuel_type]} {car.fuel_type}
          </span>
          <span>·</span>
          <span>{car.transmission}</span>
        </div>

        {adminMode && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 14,
              alignItems: "center",
            }}
          >
            {car.owner_id === currentUserId ? (
              <>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => onEdit(car)}
                >
                  Edytuj
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(car)}
                >
                  Usuń
                </button>
              </>
            ) : (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-dim)",
                  fontStyle: "italic",
                }}
              >
                 {car.owner_name || "Inny użytkownik"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
