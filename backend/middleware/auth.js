const jwt = require('jsonwebtoken');//biblioteka do autoryzacji
const pool = require('../config/database'); //podpiecie bazy danych


//midleware - jeśli użytkownik nie jest zalogowanyh
// sprawdzamy czy w nagłówku rządania jest bearer jęsli nie to odrzucamy połączenie 
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Brak tokena' });
  }

  //zostawiamy sam token i go analizujemy
  const token = authHeader.split(' ')[1];
  try {
    //weryfikujemy dekodujemy token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //szukamy użytkownika w bazie
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Użytkownik nie istnieje' });
    }
    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token nieprawidłowy lub wygasł' });
  }
};

// NIe blokuje dostępu do ścieżki, ale dodaje dane jesli jakis uzytkownik jest zalogowany
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  // nie istnieje token wiec przepuszcza dane jako gosc
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
  // jesli token istnieje pobieram uzytkownika z bazy
  const token = authHeader.split(' ')[1];
  try {
    // dekodowania i szuaknie uzytkowniak
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length > 0) req.user = result.rows[0];
  // dajemy pusty catch bo moze token byc nie zweryfikowany aplikacja po prostu go zingoruje nie doda obiektu req.user i przepusci zadanie dalej z next
  } catch {}

  next();
};

module.exports = { authenticate, optionalAuth };
