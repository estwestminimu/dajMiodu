-- Tabela użytkowników
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Tabela marek samochodów
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  country VARCHAR(100),
  logo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela filtrow samochodow
CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2030),
  price DECIMAL(12, 2) NOT NULL CHECK (price > 0),
  mileage INTEGER NOT NULL DEFAULT 0 CHECK (mileage >= 0),
  fuel_type VARCHAR(50) NOT NULL CHECK (fuel_type IN ('benzyna', 'diesel', 'elektryczny', 'hybryda', 'lpg')),
  transmission VARCHAR(50) NOT NULL CHECK (transmission IN ('manualna', 'automatyczna')),
  color VARCHAR(50),
  description TEXT,
  image_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'dostępny' CHECK (status IN ('dostępny', 'sprzedany', 'zarezerwowany')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- marki samochodów
INSERT INTO brands (name, country) VALUES
  ('BMW', 'Niemcy'),
  ('Mercedes-Benz', 'Niemcy'),
  ('Audi', 'Niemcy'),
  ('Toyota', 'Japonia'),
  ('Volkswagen', 'Niemcy'),
  ('Ford', 'USA'),
  ('Mazda', 'Japonia'),
  ('Volvo', 'Szwecja')
ON CONFLICT (name) DO NOTHING;



-- Kolumna added by bo tylko ten kto dodal moze usunac danych samochod
ALTER TABLE cars ADD COLUMN IF NOT EXISTS added_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
