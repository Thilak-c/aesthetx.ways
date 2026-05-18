# AesthetX Ways — Developer Setup Guide

A Next.js 15 e-commerce platform with MongoDB, Razorpay payments, and a full admin dashboard.

---

## Prerequisites

| Tool | Version | Why |
|---|---|---|
| **Node.js** | 18+ | Required by Next.js 15 |
| **npm** | 9+ | Comes with Node |
| **MongoDB** | Atlas (cloud) or local | Primary database |
| **Git** | Any | Version control |

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd aesthetx.ways
npm install
```

---

## 2. Environment Setup

Create a `.env.local` file in the project root. Below is every variable the app needs, grouped by purpose.

### Required Variables

These must be set or the app **will not start**:

```env
# ━━━ DATABASE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MongoDB connection string — get this from MongoDB Atlas or use localhost for dev
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/aesthetx-ways?retryWrites=true&w=majority

# For local development (if you have MongoDB installed):
# MONGODB_URI=mongodb://localhost:27017/aesthetx-ways

# ━━━ AUTH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# JWT signing secret — generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
JWT_SECRET="<your-jwt-secret>"

# ━━━ PAYMENTS (Razorpay) ━━━━━━━━━━━━━━━━━━━━━━━━━━
# Get these from https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID="<your-razorpay-key-id>"
RAZORPAY_KEY_SECRET="<your-razorpay-key-secret>"
NEXT_PUBLIC_RAZORPAY_KEY_ID=<same-as-RAZORPAY_KEY_ID>
```

### Optional Variables

These enable extra features but the app runs without them:

```env
# ━━━ EMAIL (Nodemailer) ━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Used for: order confirmations, OTP emails, admin notifications
# Currently configured for Hostinger SMTP (smtp.hostinger.com:465)
EMAIL_USER=<your-email@yourdomain.com>
EMAIL_PASS=<your-email-password>

# ━━━ PUBLIC URL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ━━━ INTERNAL API ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Used by external services (like a VPS) to call protected endpoints
INTERNAL_API_KEY=<any-strong-random-string>

# ━━━ BACKUP (Convex) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Hourly backup to a Convex instance — only needed in production
BACKUP_CONVEX_URL=<backup-convex-url>
CONVEX_SELF_HOSTED_URL=<convex-url>
CONVEX_SELF_HOSTED_ADMIN_KEY=<convex-admin-key>
NEXT_PUBLIC_CONVEX_URL=<convex-url>

# ━━━ CRON ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Secret for authenticating cron jobs (Vercel Cron)
CRON_SECRET=<optional-cron-secret>
```

> **Note:** The Convex variables are for the backup system only. The primary database is MongoDB. You can ignore all Convex variables for local development.

---

## 3. Database Setup

### Option A: MongoDB Atlas (Recommended)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist your IP (or use `0.0.0.0/0` for dev)
4. Get the connection string and paste it as `MONGODB_URI`
5. The database name should be `aesthetx-ways`

### Option B: Local MongoDB

1. Install MongoDB Community Edition
2. Start the MongoDB service
3. Use `MONGODB_URI=mongodb://localhost:27017/aesthetx-ways`

### First-time setup

Collections and indexes are created automatically by Mongoose when the app first connects. No manual migration needed.

To create the initial super admin account, start the app and visit:
```
POST /api/auth/create-super-admin
Body: { "email": "admin@example.com", "password": "your-password", "name": "Admin" }
```

> **Important:** Only one super admin can be created. This endpoint locks itself after the first call.

---

## 4. Running the App

```bash
# Development (with Turbopack hot reload)
npm run dev

# The app will be available at http://localhost:3000
```

```bash
# Production build
npm run build
npm start
```

---

## 5. Project Structure

```
aesthetx.ways/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages (signin, signup, etc.)
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes (24 endpoints)
│   │   ├── auth/           # Auth endpoints (signin, signup, reset, etc.)
│   │   ├── data/           # Main data API (replaces Convex SDK)
│   │   ├── create-order/   # Razorpay order creation
│   │   ├── verify-payment/ # Payment signature verification
│   │   ├── contact/        # Contact form (MongoDB-backed)
│   │   └── cron/           # Scheduled backup jobs
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout flow
│   ├── product/            # Product detail pages
│   ├── shop/               # Product listing / browse
│   └── orders/             # Order history & tracking
│
├── components/             # Reusable React components
├── hooks/                  # Custom React hooks
│
├── lib/                    # Server-side utilities
│   ├── db.js               # MongoDB connection (singleton)
│   ├── jwt.js              # JWT sign & verify
│   ├── authMiddleware.js   # Auth helpers (getAuthUser, requireAdmin)
│   ├── dataOperations.js   # All database operations (main data layer)
│   ├── convex-compat.js    # Client-side Convex API compatibility layer
│   ├── razorpay-config.js  # Razorpay initialization
│   └── reportsUtils.js     # Report generation utilities
│
├── models/                 # Mongoose schemas (26 models)
│   ├── User.js             # Users with roles (user/admin/super_admin)
│   ├── Product.js          # Products with size/color stock tracking
│   ├── Order.js            # Orders with delivery tracking
│   ├── Cart.js             # Shopping cart items
│   ├── Wishlist.js         # Wishlisted products
│   ├── Review.js           # Product reviews & ratings
│   ├── Collection.js       # Curated product collections
│   ├── ChatSession.js      # Live chat sessions
│   ├── ChatMessage.js      # Chat messages
│   ├── SupportTicket.js    # Support tickets
│   ├── Contact.js          # Contact form submissions
│   ├── Trash.js            # Soft-deleted items (restorable)
│   └── ...                 # + analytics, reports, sessions, etc.
│
├── utils/                  # Client-side utilities
├── data/                   # Static data files
└── public/                 # Static assets (images, fonts)
```

---

## 6. How the Data Layer Works

This project was migrated from Convex to MongoDB. The data layer preserves the Convex API pattern for minimal frontend changes:

```
Frontend Component
    │
    │  useQuery(api.products.getAllProducts, { limit: 10 })
    │  useMutation(api.cart.addToCart)
    ▼
convex-compat.js (client-side compatibility layer)
    │
    │  POST /api/data { table: "products", operation: "getAllProducts", args: { limit: 10 } }
    ▼
/api/data/route.js (API gateway with auth)
    │
    │  executeDataOperation({ table, operation, args, authUser })
    ▼
lib/dataOperations.js (all Mongoose queries)
    │
    ▼
MongoDB (via Mongoose models)
```

**Key points:**
- `convex-compat.js` exports `useQuery`, `useMutation`, and `api` — mimicking the Convex client SDK
- All data flows through `/api/data` which verifies the JWT cookie for non-public operations
- Public operations (product browsing, reviews, etc.) don't require auth
- Write operations and admin actions require a valid session

### Auth Flow

1. User signs in via `/api/auth/signin`
2. Server creates a JWT and sets it as an `httpOnly` cookie named `token`
3. All subsequent `/api/data` calls automatically include the cookie
4. The data route verifies the token and passes the user context to operations
5. Tokens expire after 30 days

---

## 7. User Roles

| Role | Access |
|---|---|
| `user` | Browse, cart, wishlist, orders, reviews, profile |
| `admin` | Everything above + product management, order management, chat, analytics |
| `super_admin` | Everything above + user management, role changes, password resets, system settings |

---

## 8. Key API Endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | No | User registration |
| POST | `/api/auth/signin` | No | User login (sets cookie) |
| POST | `/api/auth/admin-signin` | No | Admin login |
| POST | `/api/auth/create-super-admin` | No | One-time super admin setup |
| POST | `/api/data` | Varies | Main data gateway (see above) |
| POST | `/api/create-order` | Yes | Create Razorpay payment order |
| POST | `/api/verify-payment` | Yes | Verify Razorpay payment signature |
| GET | `/api/auth/me` | Yes | Get current user from cookie |
| POST | `/api/contact` | No | Submit contact form |
| GET | `/api/cron/backup` | Cron | Hourly data backup to Convex |

---

## 9. Deployment (Vercel)

1. Push to your GitHub repo
2. Connect the repo in [vercel.com](https://vercel.com)
3. Add **all required environment variables** in Vercel → Settings → Environment Variables
4. Deploy

The `vercel.json` configures an hourly cron job for database backups:
```json
{
  "crons": [{ "path": "/api/cron/backup", "schedule": "0 * * * *" }]
}
```

### Production Checklist

- [ ] `MONGODB_URI` points to your Atlas cluster (NOT localhost)
- [ ] `JWT_SECRET` is a strong random value
- [ ] `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are set
- [ ] `EMAIL_USER` / `EMAIL_PASS` are set (for order confirmations)
- [ ] `NEXT_PUBLIC_BASE_URL` is set to your production domain
- [ ] `INTERNAL_API_KEY` is set to a strong random value
- [ ] MongoDB Atlas IP whitelist allows Vercel's IPs (or use `0.0.0.0/0`)

---

## 10. Common Issues

### "JWT_SECRET environment variable is required"
You forgot to add `JWT_SECRET` to `.env.local`. Generate one:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### "Razorpay API keys are not configured"
Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `.env.local`.

### MongoDB connection fails
- Check that `MONGODB_URI` is correct
- For Atlas: make sure your IP is whitelisted
- For local: make sure `mongod` is running

### Duplicate key errors on startup
The database has unique indexes on `User.email`, `Product.itemId`, and `Collection.slug`. If you have existing duplicate data, clean it up:
```bash
# Via the API (requires super_admin):
POST /api/data
{ "table": "users", "operation": "cleanupDuplicates", "args": {} }
```

---

## 11. Tech Stack Reference

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router + Turbopack) |
| Database | MongoDB 7+ via Mongoose 9 |
| Auth | JWT (jsonwebtoken) + httpOnly cookies |
| Payments | Razorpay |
| Email | Nodemailer (Hostinger SMTP) |
| UI | React 19, Tailwind CSS 4, Framer Motion, GSAP |
| Charts | Recharts, Chart.js |
| Icons | Lucide, React Icons, Heroicons |
| Hosting | Vercel (frontend) + optional VPS (PM2) |
