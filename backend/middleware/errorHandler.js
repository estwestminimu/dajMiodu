const errorHandler = (err, req, res, next) => {
  // logujemy błąd
  console.error('Błąd:', err.stack);

  // tłumaczymy kody poesgresql 
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Naruszenie klucza obcego powiązany rekord nie istnieje.' });
  }
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Rekord z takimi danymi już istnieje.' });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Nieprawidłowy format danych.' });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Wewnętrzny błąd serwera.',
  });
};

const notFound = (req, res) => {
  res.status(404).json({ error: `Endpoint ${req.originalUrl} nie istnieje.` });
};

module.exports = { errorHandler, notFound };
