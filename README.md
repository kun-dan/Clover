# Clover

A full-stack manga and manhwa tracking app. Search titles, build your personal library, track your current chapter, and get notified when new chapters drop on AsuraScans or MangaPlus.

![Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/Backend-Next.js%2014-black?style=flat-square&logo=next.js)
![Stack](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql)
![Stack](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat-square&logo=prisma)

---

## Features

- **Catalog search** — Search thousands of manga/manhwa titles powered by the [AniList GraphQL API](https://anilist.gitbook.io/anilist-apiv2-docs/)
- **Personal library** — Track series with status (Reading, Completed, Dropped, Plan to Read) and current chapter
- **Series detail pages** — Cover art, synopsis, genres, latest chapter, and reading source links
- **Reading sources** — Auto-linked from providers where available, plus add your own custom links
- **Chapter updates feed** — Unread notifications when tracked series get new chapters
- **Background job** — Hourly scheduled job checks AsuraScans and MangaPlus for new chapters and fans out notifications to subscribers
- **Authentication** — Email/password and Google OAuth, with JWT access + refresh tokens

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS v3 |
| Backend | Next.js 14 (App Router — API routes only) |
| Database | PostgreSQL 16 |
| ORM | Prisma 5 |
| Auth | JWT (jose), bcryptjs, Google OAuth 2.0 |
| Scraping | Cheerio (AsuraScans), unofficial MangaPlus JSON API |
| Scheduler | node-cron via Next.js instrumentation hook |
| Dev | Docker Compose |

---

## Project Structure

```
clover/
├── clover-api/          # Next.js 14 backend (API routes only)
│   ├── app/api/         # Route handlers
│   ├── lib/             # Auth, DB client, AniList client, helpers
│   ├── providers/       # AsuraScans + MangaPlus scrapers
│   ├── jobs/            # Chapter update job
│   ├── prisma/          # Schema and migrations
│   └── instrumentation.ts  # Starts cron on server boot
│
├── clover-web/          # React + Vite frontend
│   ├── src/pages/       # Landing, Dashboard, Search, SeriesDetail, Updates, Settings
│   ├── src/components/  # UI, layout, series components
│   ├── src/api/         # Axios client + typed API modules
│   ├── src/store/       # Zustand auth store
│   └── nginx.conf       # Production nginx config
│
└── docker-compose.yml   # Postgres + API + Web
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker + Docker Compose (for the database)
- A Google Cloud project with OAuth 2.0 credentials (optional — only needed for Google login)

### 1. Clone and configure

```bash
git clone https://github.com/your-username/clover.git
cd clover

# Root env (Docker Compose)
cp .env.example .env

# Backend env (local dev)
cp clover-api/.env.example clover-api/.env
```

Fill in both `.env` files:

| Variable | Description |
|---|---|
| `JWT_SECRET` | Random string, minimum 32 characters |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console (optional) |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console (optional) |
| `DATABASE_URL` | PostgreSQL connection string |

### 2. Start the database

```bash
docker compose up postgres -d
```

### 3. Run the backend

```bash
cd clover-api
npm install
npx prisma migrate dev --name init   # Creates all tables
npm run dev                           # Starts on http://localhost:8080
```

### 4. Run the frontend

```bash
# In a new terminal
cd clover-web
npm install
npm run dev                           # Starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `localhost:8080`, so no CORS config needed.

---

## Docker (Full Stack)

Runs all three services (postgres, api, web) in Docker:

```bash
cp .env.example .env    # fill in secrets
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Database: localhost:5432

> **First run:** The API container runs Prisma migrations automatically on startup.

---

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register with email + password |
| `POST` | `/api/auth/login` | No | Login, returns JWT pair |
| `POST` | `/api/auth/refresh` | No | Refresh access token |
| `GET` | `/api/auth/google` | No | Start Google OAuth flow |
| `GET` | `/api/auth/google/callback` | No | OAuth callback |
| `GET` | `/api/search?q=&page=` | Yes | Search AniList catalog |
| `GET` | `/api/series/:id` | Yes | Series detail |
| `GET` | `/api/series/:id/sources` | Yes | Reading sources for series |
| `POST` | `/api/series/:id/sources` | Yes | Add custom reading link |
| `DELETE` | `/api/series/:id/sources/:sourceId` | Yes | Remove user source |
| `GET` | `/api/library` | Yes | Your library (`?status=READING`) |
| `POST` | `/api/library` | Yes | Add series to library |
| `PUT` | `/api/library/:seriesId` | Yes | Update status / chapter |
| `DELETE` | `/api/library/:seriesId` | Yes | Remove from library |
| `GET` | `/api/updates` | Yes | Unread chapter updates |
| `PUT` | `/api/updates/:id/read` | Yes | Mark update as read |
| `PUT` | `/api/updates/read-all` | Yes | Mark all as read |
| `GET` | `/api/user/me` | Yes | Current user profile |
| `PUT` | `/api/user/me` | Yes | Update display name |
| `POST` | `/api/admin/trigger-update` | Yes | Manually trigger chapter job |

---

## Chapter Update Job

The scheduled job runs hourly (with a 2-minute delay on startup). For each series in the database that has a `asurascans_slug` or `mangaplus_id`:

1. Scrapes/fetches the latest chapter number from the provider
2. If it's higher than `series.latest_chapter`, inserts a `chapter_update` record
3. Bulk-inserts `user_update` rows for all non-Dropped library subscribers
4. Updates `series.latest_chapter`

**Provider slugs are not populated automatically** — AniList doesn't include them. Set them manually:

```sql
UPDATE series SET asurascans_slug = 'reincarnation-of-the-suicidal-battle-god'
WHERE anilist_id = 132429;
```

Trigger a manual run without waiting for the cron:

```bash
curl -X POST http://localhost:8080/api/admin/trigger-update \
  -H "Authorization: Bearer <your-token>"
```

> **Note:** AsuraScans uses Cloudflare protection. The scraper uses realistic headers but may be blocked. If chapter fetching fails, the job logs a warning and continues — it won't crash.

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost:8080/api/auth/google/callback`
4. Copy the Client ID and Secret into your `.env` files

---

## Database Schema

```
users               — id, email, password_hash, google_id, display_name, avatar_url
series              — id, anilist_id, title, cover_url, genres, latest_chapter, asurascans_slug, mangaplus_id
library_entries     — user_id → series_id, status, current_chapter (UNIQUE per user+series)
chapter_updates     — series_id, chapter_number, source_provider (UNIQUE per series+chapter+provider)
user_updates        — user_id → chapter_update_id, is_read (fan-out from chapter_updates)
reading_sources     — series_id, user_id (nullable for system sources), url, label
```

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## License

MIT
