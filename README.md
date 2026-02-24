# DajMiodu - Platforma sprzedaży samochodów
Serwis do wystawiania ogłoszeń motoryzacyjnych.

## Technologie

### Backend
-  **Express.js** 
-  **React** 
-  **PostgreSQL**  
-  **bcryptjs** - hashowanie haseł
-  **jsonwebtoken** -  Generowanie i weryfikacja tokenów JWT
-  **multer** - Obsługa przesyłania plików 
-  **dotenv** - Wczytywanie zmiennych środowiskowych z pliku `.env` |
-  **React Router DOM** - Nawigacja bez przeładowania
-  **Vite** - Bundler 

## Struktura projektu

```
dajmiodu/
├── backend/
│   ├── config/
│   │   ├── database.js       # Baza danych
│   │   └── init.sql          # Schemat bazy
│   ├── middleware/
│   │   └── errorHandler.js   # Obsługa błędów
│   ├── routes/
│   │   ├── cars.js           # Endpointy samochodów
│   │   └── brands.js         # Endpointy marek
│   ├── .env.example
│   ├── package.json
│   └── server.js             # serwer
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx         # Nawigacja + layout
│   │   │   ├── CarCard.jsx        # Karta samochodu
│   │   │   ├── CarFormModal.jsx   # Formularz dodaj/edytuj auto
│   │   │   └── ConfirmModal.jsx   # Potwierdzenie usunięcia
│   │   ├── hooks/
│   │   │   └── useApi.js          # Klient API
│   │   ├── pages/
│   │   │   ├── HomePage.jsx       # Strona główna
│   │   │   ├── CarsPage.jsx       # Lista samochodów + filtry
│   │   │   ├── CarDetailPage.jsx  # Szczegóły samochodu
│   │   │   ├── AdminPage.jsx      # Panel zarządzania autami
│   │   │   └── BrandsPage.jsx     # Zarządzanie markami
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Wymagania

- Node.js >= 18
- PostgreSQL >= 14
- npm

---

## Uruchomienie

### Baza danych PostgreSQL

```bash
# Utwórz bazę danych
psql -U postgres -c "CREATE DATABASE dajmiodu;"

# Załaduj schemat
psql -U postgres -d dajmiodu -f backend/config/init.sql
```

### Backend

```bash
cd backend

# Skopiuj i uzupełnij zmienne środowiskowe
cp .env.example .env

# Zainstaluj zależności
npm install

# Uruchom
npm run dev
```

Backend: **http://localhost:3001**

### Frontend

```bash
cd frontend

# Zainstaluj zależności
npm install

# Uruchom
npm run dev
```

Frontend: **http://localhost:5173**


## API - Endpointy

| Metoda | Endpoint | Opis |
|--------|----------|------|
| GET | `/api/cars` | Lista samochodów (z filtrowaniem i paginacją) |
| GET | `/api/cars/:id` | Szczegóły jednego samochodu |
| POST | `/api/cars` | Dodaj nowy samochód |
| PUT | `/api/cars/:id` | Edytuj samochód |
| PATCH | `/api/cars/:id/status` | Zmień status samochodu |
| DELETE | `/api/cars/:id` | Usuń samochód |
| GET | `/api/brands` | Lista wszystkich marek |
| GET | `/api/brands/:id` | Szczegóły marki |
| POST | `/api/brands` | Dodaj markę |
| PUT | `/api/brands/:id` | Edytuj markę |
| DELETE | `/api/brands/:id` | Usuń markę |
| GET | `/api/health` | Status API |


## Schemat bazy danych
<img width="787" height="523" alt="Image" src="https://github.com/user-attachments/assets/645949a9-b040-4162-b068-139b3ec06147" />


##  Widoki / strony

1. **Strona główna** (`/`) - hero, wyróżnione auta, cechy salonu
2. **Oferta** (`/cars`) - lista z filtrami, paginacja
3. **Szczegóły auta** (`/cars/:id`) - zdjęcie, specyfikacja, opis
4. **Panel zarządzania** (`/admin`) - CRUD samochodów (widok grid/tabela), modale
5. **Zarządzanie markami** (`/admin/brands`) - CRUD marek, tabela inline


## Funkcje

- Pełny CRUD: samochody i marki
- Filtrowanie po: marce, paliwie, skrzyni, statusie, cenie, roku
- Sortowanie i paginacja
- Walidacja danych (backend: express-validator)
- Obsługa błędów (try-catch + middleware)
- Responsywny design (dark theme, Playfair Display + DM Sans)
- Widok grid i tabeli w panelu
- Modale: formularz dodawania/edycji, potwierdzenie usunięcia


## Zmienne środowiskowe

### Backend `.env`
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dajmiodu
DB_USER=postgres
DB_PASSWORD=twoje_haslo
FRONTEND_URL=http://localhost:5173
```

