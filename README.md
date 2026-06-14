# 🚀 LinkIQ URL Shortener with Analytics

A full-stack URL shortener application with user authentication, URL management, click analytics, QR code generation, and a modern responsive dashboard.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![Tech Stack](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-Prisma-blue?logo=postgresql)
![Tech Stack](https://img.shields.io/badge/TailwindCSS-3-blue?logo=tailwindcss)

---

## 📋 Features

- **User Authentication** — Signup/Login with JWT tokens and bcrypt password hashing
- **URL Shortening** — Generate short URLs with unique nanoid codes
- **Custom Aliases** — Create branded, memorable short links
- **Expiry Dates** — Set time-limited URLs for campaigns
- **Click Analytics** — Track clicks, browsers, devices, IPs, and user agents
- **Daily Charts** — Visualize click trends with Recharts area charts
- **QR Codes** — Generate and download QR codes for any short URL
- **Dashboard** — Full CRUD management with search, pagination, and filters
- **Responsive Design** — Beautiful dark theme with glassmorphism UI

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Axios, React Router DOM v6, Recharts, qrcode.react, Lucide Icons |
| **Backend** | Node.js, Express.js, JWT, bcryptjs, nanoid, ua-parser-js, express-rate-limit |
| **Database** | PostgreSQL with Prisma ORM |

---

## 📁 Project Structure

```
katomaran-url-shortener/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js          # Prisma client singleton
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js            # Auth routes (signup/login/me)
│   │   │   ├── url.js             # URL CRUD + analytics routes
│   │   │   └── redirect.js        # Short URL redirect handler
│   │   └── index.js               # Express server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClickChart.jsx     # Recharts area chart
│   │   │   ├── CreateUrlModal.jsx # Create/Edit URL modal
│   │   │   ├── LoadingSpinner.jsx # Loading animation
│   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   ├── ProtectedRoute.jsx # Auth guard
│   │   │   ├── QRCodeModal.jsx    # QR code display/download
│   │   │   ├── StatsCard.jsx      # Statistics display card
│   │   │   └── UrlCard.jsx        # URL list item card
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Authentication context
│   │   ├── lib/
│   │   │   └── axios.js           # Axios instance with interceptors
│   │   ├── pages/
│   │   │   ├── Analytics.jsx      # URL analytics page
│   │   │   ├── Dashboard.jsx      # Main dashboard
│   │   │   ├── Landing.jsx        # Landing/home page
│   │   │   ├── Login.jsx          # Login page
│   │   │   └── Signup.jsx         # Registration page
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── README.md
├── AI_PLANNING.md
└── ARCHITECTURE.md
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** or **yarn**

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. PostgreSQL Setup

```sql
-- Connect to PostgreSQL and create the database
CREATE DATABASE katomaran_url_shortener;
```

### 3. Environment Configuration

```bash
# Copy the example env file
cd backend
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/katomaran_url_shortener?schema=public"
# JWT_SECRET="your-secret-key"
```

### 4. Database Migration

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Run the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 6. Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### URL Management (Protected)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/urls` | Create short URL |
| GET | `/api/urls` | List user's URLs |
| GET | `/api/urls/:id` | Get URL details |
| PUT | `/api/urls/:id` | Update URL |
| DELETE | `/api/urls/:id` | Delete URL |
| GET | `/api/urls/:id/analytics` | Get URL analytics |

### Redirect
| Method | Endpoint | Description |
|---|---|---|
| GET | `/:shortCode` | Redirect & track click |

---

## 🧪 Testing Checklist

- [ ] User signup with form validation
- [ ] User login with JWT token
- [ ] Create short URL with auto-generated code
- [ ] Create short URL with custom alias
- [ ] Create short URL with expiry date
- [ ] Redirect via GET /:shortCode
- [ ] Click tracking (IP, user-agent, browser, device)
- [ ] Analytics page with chart data
- [ ] Copy short URL to clipboard
- [ ] Edit existing URL
- [ ] Delete URL
- [ ] QR code generation & download
- [ ] Expired URL handling (410 Gone)
- [ ] Protected routes redirect to login
- [ ] Responsive design on mobile
- [ ] Search & filter URLs
- [ ] Pagination

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🤔 Assumptions Made

- Users will access the application through a modern web browser.
- The PostgreSQL database is accessible by the backend server.
- Environment supports Node.js and React (e.g. Render, Netlify).
- Basic rate limiting is sufficient for MVP protection.
- The local offline `geoip-lite` database is used for IP geolocation to reduce reliance on external paid APIs.

---

## 🧠 AI Planning & Architecture

- **[AI Planning Document](AI_PLANNING.md)**: Contains the initial prompts, feature breakdown, and step-by-step implementation plan.
- **[Architecture Document](ARCHITECTURE.md)**: Provides an overview of the system architecture, database schema, and component hierarchy.

---

## 🎥 Video Demonstration

Check out the full video demonstration and explanation of the application on YouTube:
**[Watch the Demo Video](https://youtu.be/rXzV19E8V_I)**

---

This project is a part of a hackathon run by https://katomaran.com
