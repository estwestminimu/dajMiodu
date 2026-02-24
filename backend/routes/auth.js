const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); //biblioteka do hashowania haseł
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator'); //do weryfikacji danych
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');


//middleware do sprawdzania walidacji
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

//fumkcja do generowania tokeów
const signToken = (user) =>
  //dane pobierane z zmiennych srodowiskowych
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { //klucz i payload
    expiresIn: process.env.JWT_EXPIRES_IN || '7d', //czas waznosci tokenu
  });

// POST register
// hasło minimum 6 znaków, imie i nazwisko nie jest puste, email musi byc porpawny
router.post(
  '/register',
  [
    //walidacja imienia
    body('name').trim().notEmpty().withMessage('Imię jest wymagane.').isLength({ max: 100 }),
    //walidacja pola email
    body('email').isEmail().withMessage('Nieprawidłowy adres email.').normalizeEmail(),
    //walidacja pola haslło
    body('password')
      .isLength({ min: 6 })
      .withMessage('Hasło musi mieć minimum 6 znaków'),
  ],
  validate, //uruchamianie midleware do sprawdzaenia walidacji

  async (req, res, next) => {
    try {
      //pobieranie dane z body
      const { name, email, password } = req.body;
      //sprawdzamy czy uzytkownik z podanym email istnieje 
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Użytkownik z tym emailem już istnieje' });
      }

      //hashujemy hasło
      const password_hash = await bcrypt.hash(password, 12);
      const result = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at',
        [name, email, password_hash]
      );

      const user = result.rows[0];
      const token = signToken(user);

      res.status(201).json({ token, user });
    } catch (err) {
      next(err);
    }
  }
);

// POST login
router.post(
  '/login',
  [
    // walidacja email
    body('email').isEmail().withMessage('Nieprawidłowy adres email.').normalizeEmail(),
    //walidacja hasła
    body('password').notEmpty().withMessage('Hasło jest wymagane.'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // pobieramy uzytkownikow z bazy wraz z hasłami
      const result = await pool.query(
        'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
        [email]
      );

      //jesli nie znaleziono uzytkownika
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Nieprawidłowy email lub hasło.' });
      }

      //porywnyanie podanego hasla z hashem w bazie
      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Nieprawidłowy email lub hasło.' });
      }

      // generacja tokenu JWT
      const token = signToken(user);

      //usuwamy pasword hash z obiektu przed wyslaniem do klienta
      const { password_hash, ...safeUser } = user;

      //zwracamy token i dane uzytkownia
      res.json({ token, user: safeUser });
    } catch (err) {
      next(err);
    }
  }
);

// GET me - dane zalogowanego użytkownika
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
