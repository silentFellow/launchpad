# Launchpad – Assignment 4: Docker Compose

Three-tier app: **React** (built by Vite, served by nginx) → **Express** API → **PostgreSQL**.

## Run

```sh
docker compose up -d --build     # or: docker-compose up -d --build
```

Open http://localhost:8080. Stop with `docker compose down` (add `-v` to wipe the database).

## Layout

| Path | What |
|---|---|
| `compose.yaml` | Services, networks, volume |
| `frontend/Dockerfile` | Multi-stage: node builds the React app, nginx serves it and proxies `/api` to the backend |
| `backend/Dockerfile` | Express API, production deps only, runs as non-root `node` user |
| `db/init.sql` | Schema and seed data, run on first start |

## Constraints

- **Isolated networks:** `frontend-net` (frontend ↔ backend) and `backend-net` (backend ↔ db, `internal: true`, no outside access). The frontend can't reach the database; only the backend sits on both networks.
- **Volumes:** the named volume `db-data` keeps Postgres data across `down`/`up`. `init.sql` is mounted read-only.

The backend waits for the Postgres healthcheck before it starts.
Database credentials default to `launchpad`. Override them with `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB` in the environment.
