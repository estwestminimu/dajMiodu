const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const pool = require('../config/database');

// midleware do sprawdzenia bledow walidacji

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// wszystkie marki
// pobieramy wszystkie kolumny z markami przy uzyciu left join wyswietlamy nawet te ktore nie sa dostpene i robimy count dla kazdego
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT b.*, COUNT(c.id) as car_count
       FROM brands b
       LEFT JOIN cars c ON b.id = c.brand_id
       GROUP BY b.id
       ORDER BY b.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// pobieramy marke po id
router.get('/:id',
  //sprawdzamy czy parametr id jest liczba calkowita
  [param('id').isInt()],
validate, async (req, res, next) => {
  try {
    //zapytanie o konrketna marke
    const result = await pool.query('SELECT * FROM brands WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Marka nie znaleziona.' });
    res.json(result.rows[0]);
    // zwracamy znaleziona marke
  } catch (err) {
    next(err);
  }
});

// dodawanie marki samochodu
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Nazwa marki jest wymagana.').isLength({ max: 100 }),
    body('country').optional().trim().isLength({ max: 100 }),
    body('logo_url').optional().isURL().withMessage('Nieprawidłowy URL logo.'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, country, logo_url } = req.body;
      const result = await pool.query(
        'INSERT INTO brands (name, country, logo_url) VALUES ($1, $2, $3) RETURNING *',
        [name, country || null, logo_url || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

//edytuj markę
router.put(
  '/:id',
  [
    param('id').isInt(),
    body('name').trim().notEmpty().withMessage('Nazwa marki jest wymagana.'),
    body('country').optional().trim(),
    body('logo_url').optional().isURL().withMessage('Nieprawidłowy URL logo.'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, country, logo_url } = req.body;
      const result = await pool.query(
        'UPDATE brands SET name=$1, country=$2, logo_url=$3 WHERE id=$4 RETURNING *',
        [name, country || null, logo_url || null, req.params.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Marka nie znaleziona.' });
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// usuń markę
router.delete('/:id', [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM brands WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Marka nie znaleziona.' });
    res.json({ message: 'Marka usunięta.', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
