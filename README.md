# 🍴 CampusEats — IIMA

A campus food-ordering **PWA** for IIMA. Students discover vendors, browse menus, customize items, and place **pickup** orders. Vendors manage incoming orders, menus, hours, and see feedback through a dedicated portal.

> **MVP scope:** Pickup only · Cash-on-Pickup (COD) with an informational UPI QR page · IIMA-only auth (email OTP + Google) · Dual ratings (student reviews + MVRC committee).

This is a single Next.js app containing **both** the student app and the vendor portal.

---

## ✨ Features

**Student app**
- IIMA email OTP login (`@iima.ac.in` only) + Google sign-in
- Home discovery feed — open-first ordering, **Open now** filter, category rail, and prominent Veg-Only toggle
- Search across vendors **and** dishes (dish results deep-link into the vendor menu)
- Vendor page with dual ratings, **MVRC transparency report**, sticky category nav
- Item customization sheet (sizes, add-ons, notes) with live pricing
- Single-vendor cart (persisted), full bill breakdown, min-order enforcement
- Checkout (COD) → order confirmation → **UPI QR payment page**
- Live order tracking timeline, order history, one-tap reorder
- Star reviews + detailed food feedback (with "flag for MVRC")
- Favourites, profile, in-app toasts

**Vendor portal** (`/vendor`)
- Separate email/password login
- Order queue (New · Active · Ready · Completed) with accept/reject/mark-ready/complete + new-order sound
- Menu management (categories, items, availability toggle, customizations)
- Operating hours + immediate "open now" / temporary-close controls
- Ratings & feedback dashboard, vendor profile/UPI settings

---

## 🧰 Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router) + React 19 + TypeScript |
| Styling | **Tailwind CSS v4** (CSS-based config) |
| Data fetching | TanStack React Query |
| Client state | Zustand (auth, cart, vendor-auth, prefs) — persisted to localStorage |
| Backend | Next.js API routes |
| DB / ORM | **PostgreSQL** via **Prisma 7** and the `pg` driver adapter |
| Auth | JWT · email OTP (mocked) · Google OAuth (domain-restricted) · bcrypt for vendors |
| Money | Stored as **integer paise** throughout |

---

## 🚀 Getting started

### Prerequisites
- **Node.js 20+** (developed on v22)
- npm
- A PostgreSQL database (local or hosted, such as Supabase)

### Setup

```bash
# 1. Go into the repository
cd CampusEats

# 2. Create your environment file and replace DATABASE_URL with your PostgreSQL URL
cp .env.example .env       # Windows (PowerShell): copy .env.example .env

# 3. Install dependencies (also runs `prisma generate`)
npm install

# 4. Set up and seed the database
npm run db:push            # apply the Prisma schema to PostgreSQL
npm run db:seed            # 6 vendors, menus, MVRC reports, test users & orders

# 5. Start the dev server
npm run dev
```

Open **http://localhost:3000**.

> `DATABASE_URL` must be a `postgresql://` URL. For Supabase/Vercel, you can also
> provide `POSTGRES_PRISMA_URL` (pooled runtime connection) and
> `POSTGRES_URL_NON_POOLING` (direct migration connection).

---

## 🔑 Test credentials

**Students** (any of these emails — OTP login):
- `arjun.sharma@iima.ac.in`
- `priya.patel@iima.ac.in`
- `rahul.mehta@iima.ac.in`
- …or any new `@iima.ac.in` address (a fresh account is created)

**Mock OTP code:** `123456` (the OTP is also printed to the dev server console).
The Google button uses a built-in **demo** account in dev.

**Vendors** (portal at **/vendor/login**) — password `vendor123` for all:
- `messcafe@campuseats.in`
- `rollcorner@campuseats.in`
- `chaimaggi@campuseats.in`
- `shakesjuices@campuseats.in`
- `latenightbites@campuseats.in`
- `southexpress@campuseats.in`

---

## 🧭 Try it out

**As a student** (`/`)
1. Log in with an IIMA email → OTP `123456`.
2. Browse the feed, flip the **Veg Only** toggle, tap a category.
3. Open a vendor → add an item (try one with customizations, e.g. *Paneer Tikka Roll*).
4. Open the cart → **Proceed to Checkout** → place the order (COD).
5. View the **UPI payment page** and the **order tracking** timeline.

**As a vendor** (`/vendor/login`)
1. Log in (e.g. `chaimaggi@campuseats.in` / `vendor123`).
2. See the order you just placed in the **New** queue → Accept → Mark Preparing → Ready → Complete.
3. Flip back to the student tab to watch the status update.

> Tip: open the student app and the vendor portal in two windows side-by-side to see
> orders flow across both. "Chai & Maggi Point" and "Late-Night Bites" have late hours,
> so they're usually **open now** for testing.

---

## 📜 Available scripts

Run inside `app/`:

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Drop, re-migrate, and re-seed |
| `npm run db:studio` | Open Prisma Studio to inspect the DB |

---

## 🗂️ Project structure

```
CampusEats/
├─ CampusEats_Student_PRD.md   # Product requirements
├─ TASKS.md                    # 2-agent build breakdown
└─ app/
   ├─ prisma/
   │  ├─ schema.prisma         # Data model
   │  ├─ migrations/
   │  └─ seed.ts               # Demo data
   ├─ src/
   │  ├─ app/
   │  │  ├─ (student)/         # Student app routes (Home, Search, Vendor, Cart, Orders…)
   │  │  ├─ vendor/            # Vendor portal routes
   │  │  ├─ api/               # API route handlers (auth, vendors, orders, vendor portal)
   │  │  └─ login/             # Student auth
   │  ├─ components/           # UI primitives + feature components
   │  ├─ hooks/                # React Query hooks + API fetcher
   │  ├─ stores/               # Zustand stores (auth, cart, prefs, vendor-auth)
   │  ├─ lib/                  # db client, auth, validation (server)
   │  ├─ types/ · utils/       # Shared types & formatting
   │  └─ generated/prisma/     # Prisma client (generated)
   └─ .env.example
```

---

## ⚙️ Environment variables (`app/.env`)

| Var | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file path (`file:./dev.db`) |
| `JWT_SECRET` | Signs auth tokens |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client (mocked in dev) |
| `MOCK_OTP_CODE` | Fixed dev OTP (`123456`) |
| `NODE_ENV` | `development` enables mock auth fallbacks |

---

## 📝 Notes & limitations (MVP)

- **Auth is mocked** for the pilot: OTPs are logged to the console (fixed `123456`), and Google sign-in uses a demo token in dev. Both sit behind interfaces that can swap to real providers (SendGrid/Resend, Google Identity Services).
- **Payments are informational** — COD only; the UPI QR page does not verify payment. Confirmation happens at the counter.
- **Pickup only.** Delivery, online payment gateways, push/SMS notifications, and vendor self-registration are deferred (see PRD §16).
- Vendor images/UPI QR codes reference placeholder paths and fall back to branded gradients in the UI.
- SQLite + a local `dev.db` keeps the MVP zero-setup; swap the Prisma datasource to Postgres for production.
