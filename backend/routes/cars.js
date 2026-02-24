const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { body, param, validationResult } = require("express-validator");
const pool = require("../config/database");
const { authenticate } = require("../middleware/auth");
const upload = require("../middleware/upload");

//waliduje dane, usuwa plik jeśli dane są niepoprawne
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

//walidacja do dodawania i edycji samochodu
const carBodyValidation = [
  body("brand_id").isInt({ min: 1 }).withMessage("Nieprawidłowe ID marki."),
  body("model")
    .trim()
    .notEmpty()
    .withMessage("Model jest wymagany.")
    .isLength({ max: 100 }),
  body("year")
    .isInt({ min: 1900, max: 2030 })
    .withMessage("Nieprawidłowy rok."),
  body("price")
    .isFloat({ min: 0.01 })
    .withMessage("Cena musi być większa od 0."),
  body("mileage").isInt({ min: 0 }).withMessage("Przebieg musi być nieujemny."),
  body("fuel_type")
    .isIn(["benzyna", "diesel", "elektryczny", "hybryda", "lpg"])
    .withMessage("Nieprawidłowy typ paliwa."),
  body("transmission")
    .isIn(["manualna", "automatyczna"])
    .withMessage("Nieprawidłowa skrzynia biegów."),
  body("color").optional().trim().isLength({ max: 50 }),
  body("description").optional().trim(),
  body("status")
    .optional()
    .isIn(["dostępny", "sprzedany", "zarezerwowany"])
    .withMessage("Nieprawidłowy status."),
];

// Helper
// -  Pobiera dane auta
//- Dołącza markę (JOIN brands)
//- Dołącza właściciela (LEFT JOIN users)
const CAR_SELECT = `
  SELECT c.*,
    b.name as brand_name, b.country as brand_country,
    u.id as owner_id, u.name as owner_name
  FROM cars c
  JOIN brands b ON c.brand_id = b.id
  LEFT JOIN users u ON c.added_by = u.id
`;

// Middleware: sprawdź czy zalogowany user jest właścicielem auta
const requireOwner = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT added_by FROM cars WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Samochód nie znaleziony." });
    if (result.rows[0].added_by !== req.user.id) {
      return res
        .status(403)
        .json({
          error: "Brak uprawnień. Możesz edytować tylko swoje ogłoszenia.",
        });
    }
    next();
  } catch (err) {
    next(err);
  }
};

//
//  - Lista aut
//  -Obsługa filtrowania
//  - Obsługa sortowania
//  - Obsługa paginacji
router.get("/", async (req, res, next) => {
  try {
    const {
      brand_id,
      fuel_type,
      transmission,
      status,
      min_price,
      max_price,
      min_year,
      max_year,
      search,
      sort = "created_at",
      order = "DESC",
      page = 1,
      limit = 12,
    } = req.query;
    const allowedSort = ["price", "year", "mileage", "created_at"];
    const safeSort = allowedSort.includes(sort) ? sort : "created_at";
    const safeOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Dynamiczne budowanie WHERE
    let where = [],
      params = [],
      idx = 1;
    if (brand_id) {
      where.push(`c.brand_id = $${idx++}`);
      params.push(brand_id);
    }
    if (fuel_type) {
      where.push(`c.fuel_type = $${idx++}`);
      params.push(fuel_type);
    }
    if (transmission) {
      where.push(`c.transmission = $${idx++}`);
      params.push(transmission);
    }
    if (status) {
      where.push(`c.status = $${idx++}`);
      params.push(status);
    }
    if (min_price) {
      where.push(`c.price >= $${idx++}`);
      params.push(min_price);
    }
    if (max_price) {
      where.push(`c.price <= $${idx++}`);
      params.push(max_price);
    }
    if (min_year) {
      where.push(`c.year >= $${idx++}`);
      params.push(min_year);
    }
    if (max_year) {
      where.push(`c.year <= $${idx++}`);
      params.push(max_year);
    }

    // Wyszukiwanie tekstowe (case insensitive)
    if (search) {
      where.push(
        `(LOWER(c.model) LIKE $${idx} OR LOWER(b.name) LIKE $${idx} OR LOWER(c.description) LIKE $${idx})`,
      );
      params.push(`%${search.toLowerCase()}%`);
      idx++;
    }

    if (req.query.added_by) {
      where.push(`c.added_by = $${idx++}`);
      params.push(req.query.added_by);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    //paginacja
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // liczba wszystkich wyników do paginacji
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM cars c JOIN brands b ON c.brand_id = b.id ${whereClause}`,
      params,
    );
    params.push(parseInt(limit), offset);

    // pobieranie danych
    const result = await pool.query(
      `${CAR_SELECT} ${whereClause} ORDER BY c.${safeSort} ${safeOrder} LIMIT $${idx++} OFFSET $${idx++}`,
      params,
    );

    res.json({
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      cars: result.rows,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/cars/:id
router.get("/:id", [param("id").isInt()], validate, async (req, res, next) => {
  try {
    const result = await pool.query(`${CAR_SELECT} WHERE c.id = $1`, [
      req.params.id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Samochód nie znaleziony." });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/cars - dodaj auto, zapisz added_by
router.post(
  "/",
  authenticate,
  upload.single("image"),
  carBodyValidation,
  validate,
  async (req, res, next) => {
    try {
      const {
        brand_id,
        model,
        year,
        price,
        mileage,
        fuel_type,
        transmission,
        color,
        description,
        status,
      } = req.body;
      const image_url = req.file ? `/uploads/${req.file.filename}` : null;
      const result = await pool.query(
        `INSERT INTO cars (brand_id, model, year, price, mileage, fuel_type, transmission, color, description, image_url, status, added_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
        [
          brand_id,
          model,
          year,
          price,
          mileage,
          fuel_type,
          transmission,
          color || null,
          description || null,
          image_url,
          status || "dostępny",
          req.user.id,
        ],
      );
      const car = await pool.query(`${CAR_SELECT} WHERE c.id = $1`, [
        result.rows[0].id,
      ]);
      res.status(201).json(car.rows[0]);
    } catch (err) {
      if (req.file) fs.unlink(req.file.path, () => {});
      next(err);
    }
  },
);

// PUT /api/cars/:id - tylko właściciel
router.put(
  "/:id",
  authenticate,
  requireOwner,
  upload.single("image"),
  [param("id").isInt(), ...carBodyValidation],
  validate,
  async (req, res, next) => {
    try {
      const {
        brand_id,
        model,
        year,
        price,
        mileage,
        fuel_type,
        transmission,
        color,
        description,
        status,
      } = req.body;
      const existing = await pool.query(
        "SELECT image_url FROM cars WHERE id = $1",
        [req.params.id],
      );
      let image_url = existing.rows[0].image_url;
      if (req.file) {
        if (image_url)
          fs.unlink(path.join(__dirname, "..", image_url), () => {});
        image_url = `/uploads/${req.file.filename}`;
      }
      await pool.query(
        `UPDATE cars SET brand_id=$1, model=$2, year=$3, price=$4, mileage=$5, fuel_type=$6,
       transmission=$7, color=$8, description=$9, image_url=$10, status=$11, updated_at=NOW()
       WHERE id=$12`,
        [
          brand_id,
          model,
          year,
          price,
          mileage,
          fuel_type,
          transmission,
          color || null,
          description || null,
          image_url,
          status || "dostępny",
          req.params.id,
        ],
      );
      const car = await pool.query(`${CAR_SELECT} WHERE c.id = $1`, [
        req.params.id,
      ]);
      res.json(car.rows[0]);
    } catch (err) {
      if (req.file) fs.unlink(req.file.path, () => {});
      next(err);
    }
  },
);

// PATCH /api/cars/:id/status - tylko właściciel
router.patch(
  "/:id/status",
  authenticate,
  requireOwner,
  [
    param("id").isInt(),
    body("status").isIn(["dostępny", "sprzedany", "zarezerwowany"]),
  ],
  validate,
  async (req, res, next) => {
    try {
      const result = await pool.query(
        "UPDATE cars SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
        [req.body.status, req.params.id],
      );
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/cars/:id - tylko właściciel
router.delete(
  "/:id",
  authenticate,
  requireOwner,
  [param("id").isInt()],
  validate,
  async (req, res, next) => {
    try {
      const existing = await pool.query(
        "SELECT image_url FROM cars WHERE id = $1",
        [req.params.id],
      );
      if (existing.rows[0].image_url)
        fs.unlink(
          path.join(__dirname, "..", existing.rows[0].image_url),
          () => {},
        );
      await pool.query("DELETE FROM cars WHERE id=$1", [req.params.id]);
      res.json({ message: "Samochód usunięty.", id: req.params.id });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
