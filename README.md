# Forum API — Automation Testing & Clean Architecture

> Backend untuk Forum (Garuda Game) dengan **Hapi**, **PostgreSQL**, **JWT**, dan **Clean Architecture**.  
> Sudah dilengkapi **unit test + integration test (Jest)** dan **E2E (Newman/Postman)**.

## Fitur
- **Autentikasi**: Registrasi, Login, Refresh Access Token, Logout.
- **Thread**: Tambah thread, Lihat detail thread.
- **Comment**: Tambah comment (auth), Hapus comment (soft delete, auth).
- **Reply (opsional)**: Tambah & hapus reply (soft delete, auth).
- **Clean Architecture**: Entities, Use Case, Repository (interface), Infrastructure (HTTP/DB/Security).
- **Testing**: Unit, Integration, dan E2E (Postman + Newman).

## Prasyarat
- **Node.js LTS v22** (penguji menggunakan v22).
- **PostgreSQL** (disarankan 13+).
- Akses `psql` (CLI) atau GUI lain.
- macOS/Linux/WSL. (Windows juga bisa).

## Konfigurasi Environment

Buat file **`.env`** (development):
```ini
# Server
HOST=127.0.0.1
PORT=4000

# PostgreSQL (development)
PGHOST=localhost
PGPORT=5432
PGUSER=tama
PGPASSWORD=          # opsional, isi jika DB pakai password
PGDATABASE=forumapi

# JWT
ACCESS_TOKEN_KEY=change_me_access
REFRESH_TOKEN_KEY=change_me_refresh
ACCESS_TOKEN_AGE=3000

# Security
BCRYPT_SALT_ROUNDS=10
```

Buat file **`.env.test`** (untuk test & CI):
```ini
# PostgreSQL (test)
PGHOST=localhost
PGPORT=5432
PGUSER=tama
PGPASSWORD=          # opsional
PGDATABASE=forumapi_test

# JWT (wajib untuk HTTP test & createServer)
ACCESS_TOKEN_KEY=test_access_key
REFRESH_TOKEN_KEY=test_refresh_key
ACCESS_TOKEN_AGE=3000
BCRYPT_SALT_ROUNDS=10
```

> **Catatan:** Reviewer menjalankan Node.js **v22**. Pastikan variabel env terisi dan **jangan commit `.env` pribadi**—gunakan **`.env.example`** bila perlu.

## Setup Database

Buat basis data (ganti `tama` sesuai user DB Anda):
```bash
psql -U tama -h localhost -p 5432 -d postgres -c "CREATE DATABASE forumapi OWNER tama;"
psql -U tama -h localhost -p 5432 -d postgres -c "CREATE DATABASE forumapi_test OWNER tama;"
```

## Instalasi & Migrasi

```bash
npm install

# Migrasi untuk development DB
npm run migrate up

# Migrasi untuk test DB (pilih salah satu cara)
PGDATABASE=forumapi_test npm run migrate up
# ATAU
npm run migrate -- --envPath=.env.test up
```

## Menjalankan Server (Dev)

```bash
npm start
# server start at http://127.0.0.1:4000
```

## Menjalankan Test

**Unit & Integration (Jest):**
```bash
TZ=UTC DOTENV_CONFIG_PATH=.env.test npm test
```

**E2E (Postman + Newman):**
1. Pastikan ada file:
   - `postman/collection.json`
   - `postman/env.json` (berisi key `baseUrl` dan `accessToken`. Contoh minimal:)
```json
{
  "id": "forum-api-env",
  "name": "Forum API Env",
  "values": [
    { "key": "baseUrl", "value": "http://127.0.0.1:4000", "enabled": true },
    { "key": "accessToken", "value": "", "enabled": true },
    { "key": "threadId", "value": "", "enabled": true },
    { "key": "commentId", "value": "", "enabled": true }
  ]
}
```
2. Jalankan:
```bash
npm i -D newman start-server-and-test
npm run e2e:postman
```
Script ini akan otomatis **start server**, **menunggu port 4000 up**, lalu menjalankan **Newman**.

## Endpoints (Ringkas)
- **Users**
  - `POST /users` — Register
- **Authentications**
  - `POST /authentications` — Login (get access & refresh token)
  - `PUT /authentications` — Refresh access token
  - `DELETE /authentications` — Logout (delete refresh token)
- **Threads**
  - `POST /threads` — Tambah thread (auth)
  - `GET /threads/{threadId}` — Detail thread (public)
- **Comments**
  - `POST /threads/{threadId}/comments` — Tambah comment (auth)
  - `DELETE /threads/{threadId}/comments/{commentId}` — Hapus (soft delete, auth)
- **Replies (opsional)**
  - `POST /threads/{threadId}/comments/{commentId}/replies` — Tambah reply (auth)
  - `DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}` — Hapus (soft delete, auth)

## Struktur Proyek
```
├─ migrations/
├─ postman/
│  ├─ collection.json
│  └─ env.json
├─ src/
│  ├─ Applications/
│  │  ├─ use_case/
│  ├─ Commons/
│  ├─ Domains/
│  │  ├─ threads/ comments/ replies/ users/ authentications/
│  ├─ Infrastructures/
│  │  ├─ database/postgres/
│  │  ├─ http/
│  │  ├─ repository/
│  │  └─ security/
├─ tests/ (helpers untuk integration test)
└─ package.json
```

## NPM Scripts
```json
{
  "start": "node src/app.js",
  "start:dev": "nodemon src/app.js",
  "test": "TZ=UTC jest --setupFiles dotenv/config -i",
  "e2e:postman": "start-server-and-test \"npm run start\" tcp:localhost:4000 \"newman run postman/collection.json -e postman/env.json --delay-request 50\"",
  "test:watch:change": "jest --watch --setupFiles dotenv/config -i",
  "test:watch": "jest --watchAll --coverage --setupFiles dotenv/config -i",
  "migrate": "node-pg-migrate",
  "migrate:test": "node-pg-migrate -f config/database/test.json"
}
```

## Troubleshooting
- **EADDRINUSE :4000**  
  Port 4000 sedang dipakai. Tutup server lama:
  ```bash
  lsof -nP -iTCP:4000 -sTCP:LISTEN
  kill -9 <PID>
  ```

- **`error: could not load environment postman/env.json`**  
  Pastikan file `postman/env.json` ada dan path sesuai.

- **`permission denied for table ...` saat test**  
  Pastikan **PGUSER** punya hak dan **migrasi test DB** sudah dijalankan (lihat bagian migrasi test). Jalankan Jest dengan env test:
  ```bash
  TZ=UTC DOTENV_CONFIG_PATH=.env.test npm test
  ```

- **`"keys" is required` pada @hapi/jwt saat test**  
  Isi `ACCESS_TOKEN_KEY` & `REFRESH_TOKEN_KEY` di `.env.test`.

- **Perbedaan waktu (Date/ISO) saat test**  
  Jalankan Jest dengan **`TZ=UTC`** seperti di script agar konsisten.

## Submission (Dicoding)
- Hapus `node_modules/` sebelum zip.
- Sertakan: `README.md`, `migrations/`, `src/`, `postman/`, `tests/`, `package.json`, `.env.example`, `.env.test` (boleh berisi dummy key).
- Gunakan **PostgreSQL**, **Node.js 22**, **Hapi/Express** sesuai ketentuan.
- Pastikan semua test **lulus 100%** & E2E **lulus**.

## Lisensi
Untuk keperluan pembelajaran Dicoding. Gunakan sesuai kebutuhan.

---

**Happy hacking & good luck dengan review!** 🚀
