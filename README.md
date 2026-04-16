# YouTube Insights Dashboard

A full-stack analytics dashboard that consumes the **YouTube Data API v3**, built as a portfolio project showcasing React, Node.js, TypeScript, and modern tooling best practices.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Fastify](https://img.shields.io/badge/Fastify-4-000000?logo=fastify&logoColor=white&style=flat-square)
![Redis](https://img.shields.io/badge/Redis-cache-DC382D?logo=redis&logoColor=white&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![Vitest](https://img.shields.io/badge/Vitest-tested-6E9F18?logo=vitest&logoColor=white&style=flat-square)

> **Screenshot placeholder** — add a GIF or screenshot here after your first run.

---

## Features

### 1. Channel Analysis
- Search any channel by name, `@handle`, or full YouTube URL
- Displays avatar, subscriber count, total views, video count, and creation date
- Grid of the channel's most recent videos with thumbnails, view counts, and likes
- Bar chart of views across the last 10 videos (Recharts)
- Average engagement rate card (likes ÷ views)

### 2. Video Search
- Full-text search across YouTube
- Filters: sort by **Relevance / Date / Views / Rating** and duration (**Any / Short / Medium / Long**)
- Results grid with thumbnails, channel name, view count, and publish date
- Cursor-based pagination via YouTube's `pageToken`

### 3. Trending
- Region selector (BR, US, UK, JP, IN, DE, KR, MX)
- Ranked grid of the top trending videos with `#N` badge
- Donut chart showing category distribution of trending content

### 4. Channel Comparator
- Add up to 4 channels by name, `@handle`, channel ID, or URL
- Comparison table highlighting the winner per metric
- Side-by-side bar charts for Subscribers, Total Views, and Avg Views/Video

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Axios, React Query |
| Backend | Node.js, TypeScript, Fastify, googleapis SDK |
| Cache | Redis (15 min TTL) with in-memory fallback for dev |
| Validation | Zod (all API routes) |
| Tests | Vitest + Testing Library (frontend & backend) |
| Deploy | Vercel (frontend) · Railway (backend) |

---

## Architecture

```
Browser
  └─► React (Vite · port 5173)
        └─► /api/* proxy → Fastify (port 3001)
                ├─► Redis cache (15 min TTL)
                │     └─► cache hit → return immediately
                └─► YouTube Data API v3 (googleapis)
                      └─► cache miss → fetch + store + return

monorepo/
├── frontend/      React app
├── backend/       Fastify API
└── shared/types/  TypeScript interfaces shared by both
```

---

## Running Locally

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10 (workspaces support)
- Redis ≥ 7 (optional — falls back to in-memory cache automatically)
- A YouTube Data API v3 key (see below)

### 1. Clone & install

```bash
git clone https://github.com/pedrogoulart8/youtube-dashboard.git
cd youtube-dashboard
npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
YOUTUBE_API_KEY=your_key_here
# REDIS_URL=redis://localhost:6379   # uncomment if you have Redis
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### 3. Run

```bash
# Start both frontend and backend in watch mode
npm run dev
```

- Frontend → http://localhost:5173  
- Backend  → http://localhost:3001

### 4. Run tests

```bash
npm test              # both workspaces
npm run test:backend  # backend only
npm run test:frontend # frontend only
```

---

## Getting a YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g. `youtube-insights`)
3. Navigate to **APIs & Services → Library**
4. Search for **"YouTube Data API v3"** and click **Enable**
5. Go to **APIs & Services → Credentials**
6. Click **Create Credentials → API Key**
7. In the restrictions panel: under **API restrictions**, select **YouTube Data API v3**
8. Copy the key into `backend/.env` as `YOUTUBE_API_KEY`

> **Free quota:** 10,000 units/day. A single channel fetch costs ~5 units. Trending costs ~1 unit.

---

## Deploy

### Frontend → Vercel

1. Push this repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Set **Root Directory** to `frontend`
4. Add env var: `VITE_API_URL=https://your-railway-backend.railway.app`
5. Update `frontend/src/services/api.ts` to use `import.meta.env.VITE_API_URL` as `baseURL`
6. Deploy

### Backend → Railway

1. Create a new project at [railway.app](https://railway.app)
2. Add a **Redis** service (Railway provides managed Redis)
3. Add a **Node** service pointing to this repo, with **Root Directory** set to `backend`
4. Set environment variables:
   - `YOUTUBE_API_KEY`
   - `REDIS_URL` (Railway injects this automatically from the Redis service)
   - `CORS_ORIGIN` (your Vercel frontend URL)
   - `NODE_ENV=production`
5. Railway auto-detects the `start` script and deploys

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/channel/:id` | Channel stats + recent videos by channel ID |
| GET | `/api/channel/search?q=` | Search channel by name or handle |
| GET | `/api/videos/search?q=&order=&duration=&pageToken=` | Search videos with filters |
| GET | `/api/trending?regionCode=&categoryId=` | Trending videos by region |
| GET | `/api/channels/compare?ids=id1,id2,id3` | Compare up to 4 channels |

All responses follow:
```json
{ "data": { ... }, "cached": true, "timestamp": "2024-01-15T10:00:00.000Z" }
```

---

## How It Works — Technical Deep Dive

This section explains the key technical decisions and how each layer of the application works.

### Monorepo with npm Workspaces

The project uses a monorepo structure with three packages: `frontend`, `backend`, and `shared`. The `shared/types` package contains all TypeScript interfaces used by both the frontend and backend, meaning a single source of truth for data shapes — no duplication, no drift between layers.

```
shared/types/index.ts  →  ChannelStats, VideoItem, TrendingResult, etc.
     ↑                          ↑
  backend imports          frontend imports
```

Running `npm install` at the root installs all dependencies for all packages at once. Running `npm run dev` starts both servers simultaneously via `concurrently`.

---

### Backend — Fastify + Layered Architecture

The backend is organized in four layers:

```
routes/       → defines URL paths and HTTP methods
controllers/  → handles HTTP request/response, delegates to services
services/     → business logic, calls YouTube API and cache
lib/          → shared utilities (YouTube client, cache client)
```

**Why Fastify instead of Express?**
Fastify has native TypeScript support, built-in schema validation hooks, and is significantly faster under load. Its plugin system (`@fastify/cors`, `@fastify/rate-limit`) is first-class and composable.

**Zod validation** runs in every controller before any logic executes. If a required query param is missing or the wrong type, Fastify returns a 400 immediately — the service layer never receives invalid data.

**Rate limiting** via `@fastify/rate-limit` caps requests at 100/minute per IP, protecting the YouTube API quota from accidental hammering.

**Centralized error handling** catches errors thrown anywhere in the stack and maps them to consistent JSON responses with `statusCode`, `error`, and `code` fields.

---

### Cache Layer — Redis + In-Memory Fallback

Every YouTube API response is cached for **15 minutes** using a cache key built from the route name and query parameters (e.g. `channel-search:fireship`, `trending:BR`).

```
request → check cache → hit? return cached data
                      → miss? call YouTube API → store in cache → return
```

The cache abstraction (`lib/cache.ts`) tries Redis first. If Redis is unavailable (e.g. in local development), it silently falls back to a simple in-memory `Map`. This means the app works identically in both environments.

**Why 15 minutes?** YouTube's free quota is 10,000 units/day. Without caching, a busy demo session could exhaust the quota in minutes. With 15-minute caching, repeated searches for the same channel cost 0 units — the cached response is returned instantly.

---

### YouTube Data API v3 — googleapis SDK

The official `googleapis` Node.js SDK is used instead of raw HTTP calls. It handles OAuth boilerplate, request serialization, and TypeScript types for all API responses.

The three main API resources used in this project:

- **`youtube.channels.list`** — fetches channel metadata (name, subscribers, views, country). Accepts channel IDs, `forHandle` (for `@handles`), or a search term.
- **`youtube.search.list`** — searches videos or channels by keyword. Used both for the Video Search page and internally to resolve channel names to IDs.
- **`youtube.videos.list`** — fetches detailed video data (views, likes, duration) for a list of video IDs. Search results only return snippets, so a second call to `videos.list` enriches them with statistics.

The `compareService` includes a `resolveToChannelId` function that accepts any input format (plain name, `@handle`, channel ID, or URL) and normalizes it to a channel ID before calling the comparison API.

---

### Frontend — React Query + Custom Hooks

Instead of managing loading/error/data state manually with `useEffect` and `useState`, the frontend uses **React Query** (`@tanstack/react-query`).

Each page section has a dedicated custom hook:

```typescript
// hooks/useChannel.ts
export function useChannelSearch(query: string | null) {
  return useQuery({
    queryKey: ['channel', 'search', query],  // cache key
    queryFn: () => fetchChannelBySearch(query!),
    enabled: !!query,  // don't fetch until user types something
  })
}
```

React Query handles:
- **Deduplication** — if two components request the same data simultaneously, only one HTTP call is made
- **Stale-while-revalidate** — returns cached data immediately, refetches in the background
- **Error states** — exposes `isError` and `error` without any try/catch boilerplate
- **Loading states** — exposes `isLoading` to show skeletons

**5-minute client-side stale time** is set globally, meaning data fetched once won't be re-fetched for 5 minutes even if the user navigates away and comes back. Combined with the 15-minute backend cache, this drastically reduces API quota consumption.

---

### Frontend — Component Architecture

All reusable UI is broken into small, single-purpose components:

| Component | Responsibility |
|---|---|
| `Sidebar` | Fixed left navigation with icons (lucide-react) and active state |
| `SearchBar` | Controlled input with form submission, customizable button label |
| `StatCard` | Metric display card with label, value, optional icon and accent color |
| `VideoCard` | Video thumbnail + metadata, supports `rank` badge for Trending |
| `ChartCard` | Wrapper card with title for any Recharts chart |
| `Skeleton` | Animated loading placeholders matching the shape of real content |
| `ErrorMessage` | Accessible `role="alert"` error display with icon |

**Lazy loading** is applied to all thumbnail images via the native `loading="lazy"` attribute, so offscreen images don't block page load.

**Skeleton components** (`StatCardSkeleton`, `VideoCardSkeleton`, `ChannelHeaderSkeleton`) mirror the exact dimensions of the real content, eliminating layout shift when data loads.

---

### Shared TypeScript Types

All data interfaces live in `shared/types/index.ts` and are imported by both the frontend and backend via path aliases (`@shared/types`). This means:

- The backend service that builds a `ChannelStats` object and the frontend component that renders it use **the exact same type**
- If a field is renamed or a new one is added, TypeScript catches the mismatch in both places at compile time
- No code generation, no build step — just a path alias in `tsconfig.json` and `vite.config.ts`

---

### Testing Strategy

**Backend tests** (`src/__tests__/`) mock the `googleapis` SDK using `vi.mock` and test each service in isolation. They verify that:
- The service calls the correct YouTube API methods
- It correctly maps API responses to the shared types
- It handles missing or empty API responses without crashing

**Frontend component tests** (`src/components/__tests__/`) use Testing Library to render components and assert on what the user sees — not on internal state. They verify that a `VideoCard` renders a title, shows a rank badge when given a rank, and lazy-loads the image.

**Frontend hook tests** (`src/hooks/__tests__/`) wrap hooks in a `QueryClientProvider`, mock the `api.ts` service layer, and verify that hooks enable/disable correctly based on their inputs and properly expose success and error states.

---

## Technical Decisions

**Why Fastify instead of Express?**
Fastify has built-in TypeScript support, schema-based validation hooks, and is measurably faster under load. The plugin system (rate-limit, CORS) is first-class.

**Why Redis for caching?**
The YouTube Data API has a strict 10k-unit/day free quota. Caching responses for 15 minutes reduces quota consumption by ~95% for repeated queries, making the app demo-safe. In-memory fallback ensures the app still works in dev without Redis running.

**Why a monorepo with `npm workspaces`?**
The `shared/types` package lets both frontend and backend share the same TypeScript interfaces with zero duplication and zero build step. No symlinks, no publishing — just path aliases.

**Why React Query instead of plain `useEffect`?**
Automatic deduplication, background refetch, stale-while-revalidate caching, and typed error states — all without writing any boilerplate cache logic.

---

## Roadmap

- [ ] OAuth integration to analyze your own channel's private analytics
- [ ] Historical trend charts (compare a channel's growth over time)
- [ ] Export data to CSV / JSON
- [ ] Dark/light mode toggle
- [ ] Subscribe to quota-aware alerts (notify when approaching daily limit)
- [ ] Comment sentiment analysis using the YouTube Comments API
- [ ] Docker Compose file for one-command local setup

---

## License

MIT
