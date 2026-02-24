sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

nano backend/.env

PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dajmiodu
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=dajmiodu_super_tajny_klucz_min32znaki_xyz
JWT_EXPIRES_IN=7d
