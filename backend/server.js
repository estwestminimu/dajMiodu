//importujemy zmienne środowiskoe
require('dotenv').config();



const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware pozwala łaczyć się z forntemden bo inaczej dostajemy cors
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));


app.use(express.json());

//parsowanie z formularzy
app.use(express.urlencoded({ extended: true }));

// midleware do udostepniania plikow
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logowanie requestów - metoda -scieżka-czas
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Trasy
app.use('/api/auth', require('./routes/auth'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/cars', require('./routes/cars'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Działa', timestamp: new Date() });
});

// 404
app.use(notFound);

// Obsługa błędów
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API: http://localhost:${PORT}`);
  console.log(`Test: http://localhost:${PORT}/api/health`);
});

module.exports = app;
