# Interactive Product Analytics Dashboard

A full-stack analytics dashboard with a React/Vite frontend and a Node.js/Express backend backed by PostgreSQL.

## Project Structure

```
Interactive Product Analytics Dashboard/
├── backend/                 # Express API
│   ├── config/db.js         # pg Pool + query helper
│   ├── controllers/         # Route logic
│   ├── db/                  # SQL migrations + seed script
│   ├── middleware/          # JWT auth, asyncHandler
│   ├── models/              # Raw SQL query functions
│   ├── routes/              # Express routers
│   ├── index.js             # Server entry point
│   └── .env.example
├── frontend/                # React + Vite SPA
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom hooks
│   │   └── pages/           # Page-level components
│   └── .env.example
└── README.md
```

## Local Setup

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** running locally (or a remote connection string)

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd "Interactive Product Analytics Dashboard"
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Fill in your `.env`:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/analytics_db
JWT_SECRET=your_super_secret_key_here
```

Then install and start:

```bash
npm install
npm run dev          # starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
```

Fill in your `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Then install and start:

```bash
npm install
npm run dev          # starts on http://localhost:5173
```

## Seed the Database

The seed script creates **8 dummy users** (ages 10–72, both genders) and **160 feature-click records** spread over the last 90 days so the dashboard has realistic data from the start.

```bash
cd backend
npm run seed
```

Expected output:

```
Running feature_clicks migration…
Seeding users…
  ✔ 8 users ready
Clearing old feature_clicks…
Inserting 160 feature_click records…
  ✔ 160 clicks inserted
🌱 Seed complete!
```

> **Safe to re-run:** users are upserted via `ON CONFLICT`, and old click data is cleared before re-inserting.

## Health Check

```bash
curl http://localhost:5000/api/health
```

```json
{
  "status": "ok",
  "server": "running",
  "db": "connected",
  "db_time": "2026-..."
}
```

## Tech Stack

| Layer    | Technology                                          |
|----------|-----------------------------------------------------|
| Frontend | React 19, Vite 7, React Router, Recharts, Axios    |
| Backend  | Node.js, Express 4, pg (raw SQL)                    |
| Database | PostgreSQL                                          |
| Auth     | JWT (jsonwebtoken + bcryptjs)                       |
| Cookies  | js-cookie (filter persistence across page refresh)  |

## Architectural Choices

**Raw SQL over an ORM** — I chose the `pg` driver with hand-written SQL instead of an ORM like Prisma or Sequelize. For an analytics-heavy app the queries are almost entirely aggregations (`GROUP BY`, `CASE`, window expressions); an ORM would add abstraction overhead without meaningful productivity gains and would make it harder to fine-tune the exact queries that hit the database. Raw SQL also keeps the dependency tree lean and avoids the build-time code-generation step that Prisma requires.

**MVC-inspired folder structure** — The backend is split into `routes → controllers → models`. Routes declare endpoints and wire up middleware; controllers own request/response logic; models encapsulate every SQL query behind plain async functions. This separation makes it straightforward to swap the data layer (e.g. migrate from PostgreSQL to TimescaleDB) without touching controller logic, and keeps each file small enough to reason about at a glance.

**JWT + localStorage for auth, Cookies for filter state** — Auth tokens live in `localStorage` because they need to be attached as an `Authorization` header on every API call (via an Axios interceptor). Filter preferences, on the other hand, are persisted in a browser cookie via `js-cookie` — this satisfies the requirement that filters survive a full page refresh while keeping the auth and state-persistence concerns clearly separated.

**Recharts for visualization** — Recharts is a React-native charting library built on D3 primitives. It composes naturally with JSX, supports responsive containers out of the box, and provides the `<Cell>` abstraction that makes it easy to highlight the selected bar and dim the rest — which is critical for the bar-click-to-line-chart interaction.

**Axios interceptors** — A single Axios instance (`axiosInstance.js`) centralizes the base URL, `Content-Type` header, and JWT injection. This eliminates boilerplate in every component that calls the API, and gives a single place to handle 401 responses globally.


**Live Demo:** https://vigilityproject.netlify.app

## Scaling to 1 Million Write-Events per Minute

The current architecture — a single Express process performing a synchronous `INSERT` per tracking event — works well at dashboard-scale traffic, but it would buckle immediately under 1 million writes per minute (~16,700 writes/sec). Here is how I would re-architect the write path to handle that throughput while keeping the read path (analytics queries) fast and unchanged.

**1. Decouple ingestion from storage with a message queue.**
The `/track` endpoint would stop writing to PostgreSQL directly. Instead, it would publish each event to a durable, partitioned log — Apache Kafka is the natural choice here because it is designed for exactly this workload: high-throughput, append-only, ordered event streams. The endpoint becomes a near-zero-latency fire-and-forget `producer.send()`, so the API can acknowledge the client in under 5 ms regardless of downstream database pressure. Kafka partitions by `user_id`, guaranteeing per-user ordering while allowing horizontal fan-out across consumer instances.

**2. Batch-insert via consumer workers.**
A pool of Kafka consumer workers would drain each partition and accumulate events into micro-batches (e.g. 5,000 rows or 500 ms, whichever comes first). Each batch is written to the database with a single `COPY` or multi-row `INSERT` statement, which amortizes the per-row overhead by roughly two orders of magnitude compared to individual inserts. If a consumer crashes, Kafka's offset tracking ensures no events are lost — the consumer simply replays from the last committed offset.

**3. Switch the analytics store to a time-series / columnar engine.**
PostgreSQL is a fantastic general-purpose database, but at this write volume the B-tree indexes on `feature`, `clicked_at`, and `user_id` would create severe write amplification. I would move the `feature_clicks` table to **TimescaleDB** (a PostgreSQL extension, so existing SQL queries keep working) or, for even higher compression and scan speed, to **ClickHouse** — a columnar OLAP engine that can ingest millions of rows per second on modest hardware and execute analytical `GROUP BY` queries over billions of rows in sub-second time. The rest of the application (users table, auth) stays on vanilla PostgreSQL.

**4. Horizontally scale the API tier.**
The Express server would be deployed as a stateless container behind a load balancer (e.g. an AWS ALB or Kubernetes Ingress). Because the endpoint is now just a Kafka produce call with no local state, scaling is linear — adding more replicas adds proportional throughput. Health checks and auto-scaling policies (CPU or request-latency based) keep capacity matched to traffic.

**5. Add a caching layer for read queries.**
With millions of events flowing in, re-running full aggregation queries on every dashboard refresh is wasteful. A **Redis** cache (or materialized views refreshed on a schedule) would store pre-computed results for `clicksByFeature`, `clicksOverTime`, etc. Cache entries would be invalidated or refreshed every 30–60 seconds by a background job, giving analysts near-real-time data without hammering the OLAP store.

In summary, the fundamental shift is from a **synchronous, single-writer** model to an **asynchronous, event-driven pipeline**: API → Kafka → Batch Consumer → ClickHouse/TimescaleDB, with Redis caching the read side. Each stage scales independently, failures are isolated, and the system can sustain well beyond 1 million writes per minute without data loss.
