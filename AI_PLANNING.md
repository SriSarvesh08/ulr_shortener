# 🧠 AI Planning Document — Katomaran URL Shortener

## Project Goal

Build a complete, self-hosted URL shortener with:
- User authentication (JWT + bcrypt)
- URL shortening with custom aliases and expiry
- Click analytics with browser/device/IP tracking
- Modern, responsive dashboard with charts and QR codes

---

## Planning Decisions

### 1. Database: PostgreSQL + Prisma ORM

**Why PostgreSQL?**
- Strong relational data model (users → urls → visits)
- ACID compliance for click counting accuracy
- Rich querying capabilities for analytics (GROUP BY, DATE functions)
- Prisma ORM provides type-safe queries, migrations, and schema management

**Schema Design:**
- `User` → owns many `Url` records
- `Url` → has many `Visit` records
- `Visit` → stores IP, user-agent, browser, device, OS, referer, timestamp
- Cascade deletes ensure cleanup when URLs or users are removed

### 2. Authentication: JWT + bcryptjs

**Why JWT?**
- Stateless authentication (no session storage needed)
- Easy to implement with Express middleware
- 7-day token expiry balances security and convenience

**Password Security:**
- bcryptjs with 12 rounds of salting
- Passwords never stored in plaintext
- User data returned without password field

### 3. URL Shortening: nanoid

**Why nanoid?**
- Compact 8-character codes by default
- URL-safe alphabet (A-Za-z0-9_-)
- Cryptographically strong random generation
- Collision-resistant (uniqueness check as fallback)

### 4. Click Tracking: ua-parser-js

**Why ua-parser-js?**
- Accurate browser/device/OS detection from User-Agent strings
- Lightweight, no external API calls
- Covers major browsers and device types

### 5. Frontend: React + Vite + Tailwind CSS

**Why Vite?**
- Fastest dev server with HMR
- Optimized production builds
- Native ES modules support

**Why Tailwind CSS?**
- Rapid UI development with utility classes
- Consistent design system with custom theme
- Small production CSS bundle with purging

### 6. Charts: Recharts

**Why Recharts?**
- React-native charting library (composable components)
- Responsive and customizable
- Lightweight compared to alternatives (Chart.js, D3)

---

## Architecture Principles

1. **Separation of Concerns** — Backend API is independent of frontend
2. **User Isolation** — All URL operations are scoped to the authenticated user
3. **Defensive Validation** — All inputs validated on both client and server
4. **Rate Limiting** — Protects against abuse (100 req/15min for API, 20 for auth)
5. **Error Handling** — Consistent error response format with meaningful messages

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Short code collision | Uniqueness check + regeneration loop |
| Expired URL access | 410 Gone response with clear message |
| SQL injection | Prisma ORM parameterized queries |
| Token theft | 7-day expiry, 401 auto-redirect |
| Rate abuse | express-rate-limit on all routes |
| Data loss on delete | Cascade deletes clean up related records |

---

## Future Enhancements

- [ ] Password reset via email
- [ ] URL grouping/tagging
- [ ] Geo-location tracking (IP → country)
- [ ] Bulk URL import/export
- [ ] Team/organization support
- [ ] Custom domain support
- [ ] Webhook notifications on click milestones
- [ ] API key access for programmatic use
