# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start all services (API + MongoDB + ngrok)
docker-compose up --build

# Run locally without Docker (requires a running MongoDB)
npm run dev       # nodemon with hot reload
npm start         # plain node
```

There are no tests and no linter configured.

## Architecture

The entire application lives in a single file: `server.js`. There are no separate route files, controllers, or models directories.

**Request routing order matters:**

1. Admin routes (`/api/*`) are registered first and take priority.
2. `app.all("*")` is the dynamic mock handler — it catches every other request, looks up `{ method, path }` in MongoDB, and returns the stored response. If no match is found it calls `next()`, falling through to Express's default 404.

**Mock uniqueness** is enforced by a `(method, path)` pair. The schema does not define a unique index — the uniqueness check is done manually in the `POST /api/mocks` handler before creating. Query parameters are stripped from paths on create and update to prevent matching inconsistencies.

**Data model** (single Mongoose model `Mock`):
- `method` — HTTP verb (stored/matched uppercase)
- `path` — URL path without query string
- `statusCode` — defaults to 200
- `response` — `Mixed` type, any JSON

**Docker Compose services:**
- `api` — Node 18 app on port 8282; `server.js` is volume-mounted for hot reload without rebuilding the image.
- `mongo` — MongoDB exposed on host port 59213 (container port 27017); data persisted in `mongo_data` volume.
- `ngrok` — tunnels the `api` service to a public HTTPS domain configured via `NGROK_DOMAIN` env var; dashboard at `http://localhost:4040`.

**Environment variables** (see `.env.example`):
- `PORT` — app listen port (default 8282)
- `MONGO_URI` — MongoDB connection string
- `NGROK_AUTHTOKEN` / `NGROK_DOMAIN` — ngrok tunnel config
