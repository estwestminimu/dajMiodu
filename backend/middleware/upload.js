const multer = require('multer');
const path = require('path');
const fs = require('fs');

//scieżka do pliku uploads
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
// jeśli nie istnieje to tworzymy folder
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  //ustawienie folderu docelowego
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // pobieranie i normalizacja rozszerzenia pliku
    const ext = path.extname(file.originalname).toLowerCase();
    //generowanie unikalnej nazwy
    const unique = `car_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, unique);
  },
});

// czy plik jest dozwolony
const fileFilter = (req, file, cb) => {
  // formaty
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
  // pobranie rozszerzenia pliku
  const ext = path.extname(file.originalname).toLowerCase();

  // sprawdzdenie czy plik jest dozwolony
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Dozwolone formaty: JPG, PNG, WebP, AVIF'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

module.exports = upload;
