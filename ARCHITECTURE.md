# 🏗 Architecture Document — Katomaran URL Shortener

## System Overview

```
┌─────────────────┐     HTTP      ┌─────────────────┐     SQL      ┌──────────────┐
│    Frontend      │ ───────────> │    Backend       │ ──────────> │  PostgreSQL   │
│  React + Vite    │ <─────────── │  Express.js      │ <────────── │   Database    │
│  Port: 5173      │   JSON/API   │  Port: 5000      │   Prisma    │  Port: 5432   │
└─────────────────┘              └─────────────────┘              └──────────────┘
       │                                │
       │  Vite Dev Proxy               │  GET /:shortCode
       │  /api → :5000                 │  302 Redirect
       └───────────────────────────────┘
```

---

## Data Flow

### URL Shortening Flow

```
User → [Create URL Form] → POST /api/urls
  → Validate URL format
  → Check custom alias availability (if provided)
  → Generate nanoid short code (if no alias)
  → Store in PostgreSQL via Prisma
  → Return short URL to user
```

### Redirect & Tracking Flow

```
Visitor → GET /:shortCode
  → Find URL in database
  → Check expiry date
  → Parse User-Agent (ua-parser-js)
  → Extract IP address
  → Create Visit record (async)
  → Increment click count (async)
  → 302 Redirect to original URL
```

### Analytics Flow

```
User → GET /api/urls/:id/analytics
  → Verify ownership
  → Aggregate: total clicks, last visit
  → Group by: date (daily chart), browser, device
  → Return structured analytics data
  → Render: StatsCards, AreaChart, Lists
```

---

## Database Schema

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    users      │       │      urls         │       │     visits        │
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (uuid)     │──┐    │ id (uuid)         │──┐    │ id (uuid)         │
│ email         │  │    │ original_url      │  │    │ url_id (fk)       │
│ password      │  │    │ short_code (uniq) │  │    │ ip                │
│ name          │  └──> │ user_id (fk)      │  └──> │ user_agent        │
│ created_at    │       │ custom_alias      │       │ browser           │
│ updated_at    │       │ expires_at        │       │ device            │
└──────────────┘       │ clicks            │       │ os                │
                        │ created_at        │       │ referer           │
                        │ updated_at        │       │ timestamp         │
                        └──────────────────┘       └──────────────────┘
```

### Relationships
- **User** `1:N` **Url** — Each user owns multiple URLs
- **Url** `1:N` **Visit** — Each URL has multiple visit records
- All relationships use **cascade delete**

### Indexes
- `urls.short_code` — UNIQUE index for fast redirect lookups
- `urls.user_id` — For user-specific URL queries
- `visits.url_id` — For analytics aggregation
- `visits.timestamp` — For time-range queries

---

## API Architecture

### Route Structure

```
/api
├── /auth
│   ├── POST /signup      → Create account
│   ├── POST /login       → Get JWT token
│   └── GET  /me          → Get current user [AUTH]
├── /urls                  [ALL AUTH REQUIRED]
│   ├── POST /            → Create short URL
│   ├── GET  /            → List user's URLs
│   ├── GET  /:id         → Get URL details
│   ├── PUT  /:id         → Update URL
│   ├── DELETE /:id       → Delete URL
│   └── GET  /:id/analytics → Get analytics
└── /:shortCode           → Redirect (public)
```

### Middleware Stack

```
Request → CORS → Rate Limiter → JSON Parser → Route Handler
                                    ↓
                        [Auth Routes] → Auth Limiter → Handler
                        [URL Routes]  → JWT Auth Middleware → Handler
                        [Redirect]    → No auth → Handler
```

---

## Frontend Architecture

### Component Tree

```
<App>
├── <Navbar />
├── <Routes>
│   ├── "/" → <Landing />
│   ├── "/login" → <Login />
│   ├── "/signup" → <Signup />
│   ├── "/dashboard" → <ProtectedRoute>
│   │   └── <Dashboard>
│   │       ├── <StatsCard /> × 4
│   │       ├── <UrlCard /> × N
│   │       ├── <CreateUrlModal />
│   │       └── <QRCodeModal />
│   └── "/analytics/:id" → <ProtectedRoute>
│       └── <Analytics>
│           ├── <StatsCard /> × 4
│           ├── <ClickChart />
│           └── Recent Visits List
```

### State Management

- **AuthContext** — Global auth state (user, token, login/logout)
- **Component State** — Local state for forms, modals, and data fetching
- **localStorage** — JWT token and user data persistence

### API Communication

- **Axios Instance** — Base URL `/api`, auto-attaches JWT token
- **Request Interceptor** — Adds `Authorization: Bearer <token>` header
- **Response Interceptor** — Auto-redirects on 401 (token expired)

---

## Security

| Feature | Implementation |
|---|---|
| Password Hashing | bcryptjs with 12 salt rounds |
| Authentication | JWT with 7-day expiry |
| Input Validation | Server-side URL, email, and alias validation |
| SQL Injection | Prisma ORM parameterized queries |
| Rate Limiting | 100 req/15min (API), 20 req/15min (auth) |
| CORS | Restricted to frontend origin |
| XSS Prevention | React's built-in JSX escaping |

---

## Performance

| Optimization | Details |
|---|---|
| Database Indexes | Short code, user ID, timestamps |
| Async Tracking | Visit creation and click increment run in parallel |
| Debounced Search | 300ms debounce on dashboard search |
| Pagination | Server-side with configurable limit |
| Vite Build | Tree-shaking, code splitting, minification |
| Tailwind Purge | Unused CSS removed in production |
