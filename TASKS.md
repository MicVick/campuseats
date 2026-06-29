# CampusEats — 2-Agent Task Breakdown

> **How to use this file:** Give Agent A the "Agent A" section and Agent B the "Agent B" section, along with the full PRD. Agent A starts first to lay the shared foundation (Phase 0), then both agents work in parallel from Phase 1 onward.

---

## Agent Division Strategy

| | Agent A — **Backend & Infrastructure** | Agent B — **Frontend & UI** |
|---|---|---|
| **Owns** | DB schema, API routes, auth logic, business rules, seed data, PWA config | All React pages, components, state management, styling, responsive design |
| **Stack** | Prisma, Express/Next API routes, JWT, bcrypt, TypeScript | React, Zustand, React Query, Tailwind CSS, TypeScript |
| **Scope** | Both student + vendor APIs | Both student app + vendor portal UI |
| **Starts** | Phase 0 (solo) | Phase 1 (after Phase 0 is done) |

> **Conflict avoidance:** Agent A owns all files in `/prisma`, `/src/api` (or `/src/app/api`), `/src/lib`, `/src/middleware`, `/src/services`. Agent B owns all files in `/src/components`, `/src/pages` (or `/src/app/(routes)`), `/src/styles`, `/src/hooks`, `/src/stores`, `/public`. Both reference but don't edit each other's files.

---

## Phase 0 — Project Foundation ⚡ Agent A only

> **Goal:** A running project skeleton with DB, auth, and seed data so Agent B can start building UI immediately.

### A-0.1 Project Scaffolding
- [ ] Initialize Next.js project with TypeScript + Tailwind CSS (or Vite + Express — pick one)
- [ ] Set up folder structure:
  ```
  /prisma         — schema + migrations + seed
  /src/api        — API route handlers
  /src/lib        — shared utilities (auth, db client, validation)
  /src/middleware  — auth middleware, error handling
  /src/services   — business logic layer
  /src/components  — (create empty, Agent B fills)
  /src/pages       — (create empty, Agent B fills)
  /src/stores      — (create empty, Agent B fills)
  /src/hooks       — (create empty, Agent B fills)
  /src/styles      — (create empty, Agent B fills)
  /public          — PWA manifest, icons, static assets
  ```
- [ ] Configure `tsconfig.json`, path aliases (`@/`), ESLint, Prettier
- [ ] Add core dependencies: `prisma`, `@prisma/client`, `bcryptjs`, `jsonwebtoken`, `zod`, `zustand`, `@tanstack/react-query`, `tailwindcss`
- [ ] Create `.env.example` with all required variables (DB_URL, JWT_SECRET, GOOGLE_CLIENT_ID, etc.)

### A-0.2 Database Schema (Prisma)
- [ ] Define all models per PRD §9:
  - `User` (id, name, email unique @iima.ac.in, authProvider enum email|google, createdAt)
  - `Vendor` (id, name, description?, imageUrl?, cuisineTags[], area, hasVeg, hasNonVeg, avgRating, ratingCount, mvrcRating?, mvrcReportUrl?, mvrcAssessmentDate?, openHours JSON, pickupAvailable, minOrder, packagingFee, avgPrepTimeMins, upiId?, upiQrImageUrl?, isTemporarilyClosed)
  - `VendorAccount` (id, vendorId FK→Vendor, email unique, passwordHash, createdAt)
  - `MenuCategory` (id, vendorId FK→Vendor, name, sortOrder)
  - `MenuItem` (id, vendorId, categoryId FK→MenuCategory, name, description?, price, imageUrl?, isVeg, isAvailable)
  - `CustomizationGroup` (id, menuItemId FK→MenuItem, name, type enum single|multi, required, minSelect, maxSelect)
  - `CustomizationOption` (id, groupId FK→CustomizationGroup, name, priceDelta)
  - `Order` (id, userId FK, vendorId FK, status enum placed|accepted|preparing|ready_for_pickup|completed|cancelled|rejected, rejectionReason?, itemTotal, packagingFee, grandTotal, paymentMethod default cod, specialInstructions?, estimatedPrepMins, placedAt, statusTimeline JSON)
  - `OrderItem` (id, orderId FK→Order, menuItemId, nameSnapshot, qty, unitPrice, selectedOptions JSON, itemNote?)
  - `Review` (id, orderId FK→Order unique, userId, vendorId, rating 1-5, text?, createdAt)
  - `FoodFeedback` (id, orderId? FK→Order optional, userId, vendorId, foodQuality 1-5, hygiene 1-5, valueForMoney 1-5, itemComments?, comments?, isFlaggedForMvrc, createdAt)
  - `MVRCReport` (id, vendorId FK→Vendor, rating, hygieneScore, foodQualityScore, complianceNotes?, correctiveActions?, reportUrl?, assessmentDate, createdBy)
  - `PromoCode` (id, code unique, type enum flat|percent, value, minOrder?, maxDiscount?, active, expiresAt?) — optional
  - `Favourite` (id, userId, vendorId, unique constraint on userId+vendorId)
- [ ] Run initial migration
- [ ] Verify schema compiles and DB is created

### A-0.3 Seed Script
- [ ] Create `prisma/seed.ts` with:
  - 6 vendors with realistic names, cuisine tags, varied open hours, mixed veg/non-veg, UPI details (dummy)
  - 2–4 categories per vendor, 5–10 items each, some with customization groups
  - 2 vendor accounts with login credentials (email/password)
  - 1 MVRC report per vendor with scores and a dummy PDF link
  - 2–3 test student users
  - A few sample orders in various statuses for testing
- [ ] Verify seed runs successfully: `npx prisma db seed`

### A-0.4 Auth Infrastructure
- [ ] JWT utility: `generateToken(payload)`, `verifyToken(token)` with expiry
- [ ] Auth middleware: extract JWT from `Authorization` header, attach user to request
- [ ] Vendor auth middleware: separate middleware for vendor JWT tokens
- [ ] Student auth — email OTP:
  - `POST /api/auth/request-otp` — validate `@iima.ac.in`, generate & store 6-digit OTP (mocked: log to console, use fixed code `123456` in dev)
  - `POST /api/auth/verify-otp` — validate OTP, create user if new, return JWT
  - OTP behind a provider interface (can swap to real email later)
- [ ] Student auth — Google OAuth:
  - `POST /api/auth/google` — receive Google `idToken`, verify with Google's library, check email ends with `@iima.ac.in`, create user if new, return JWT
  - Set `hd=iima.ac.in` parameter hint (document for frontend)
- [ ] Vendor auth:
  - `POST /api/vendor/auth/login` — email + password (bcrypt compare), return vendor JWT
  - `POST /api/vendor/auth/change-password` — old + new password

### A-0.5 API Skeleton & Error Handling
- [ ] Set up global error handler middleware (consistent error response format)
- [ ] Set up request validation with Zod (reusable schemas)
- [ ] Create placeholder route files for all API groups (student + vendor) so Agent B knows the URL structure
- [ ] Document all API endpoints in a `API_REFERENCE.md` file with request/response shapes for Agent B

---

## Phase 1 — Discovery & Browse 🔀 Both agents in parallel

### Agent A — Discovery APIs

#### A-1.1 Vendor Discovery APIs
- [ ] `GET /api/vendors` — list vendors with filters:
  - `openNow` — compute from openHours + isTemporarilyClosed
  - `veg` — filter to vendors where hasVeg=true (or items where isVeg=true)
  - `category` — filter by cuisineTag
  - `sort` — by avgRating, avgPrepTimeMins, minOrder
  - `q` — search query (name, cuisineTags partial match)
  - Return: vendor cards with name, image, cuisineTags, avgRating, ratingCount, mvrcRating, avgPrepTimeMins, minOrder, isOpen (computed), nextOpenTime (if closed)
  - Open vendors sorted first

#### A-1.2 Vendor Detail + Menu API
- [ ] `GET /api/vendors/:id` — full vendor profile with:
  - All vendor fields
  - Categories with sorted items (include customization groups + options)
  - MVRC info (rating, assessmentDate, reportUrl)
  - UPI details (upiId, upiQrImageUrl)
  - Computed: isOpen, nextOpenTime
- [ ] Respect `veg` query param to filter items if passed

#### A-1.3 Search API
- [ ] `GET /api/search?q=&veg=` — search across:
  - Vendor names, cuisine tags
  - MenuItem names, descriptions
  - Return results grouped as `{ vendors: [...], dishes: [...] }`
  - Each dish result includes vendorId, vendorName, categoryId for deep-linking

#### A-1.4 MVRC Reports API
- [ ] `GET /api/vendors/:id/mvrc-reports` — list MVRC reports for a vendor (sorted by date)
- [ ] `GET /api/mvrc-reports/:id` — single report detail

#### A-1.5 Favourites API
- [ ] `GET /api/favourites` — list user's favourite vendors
- [ ] `POST /api/favourites` — add vendor to favourites `{ vendorId }`
- [ ] `DELETE /api/favourites/:vendorId` — remove from favourites

---

### Agent B — Student App UI Shell & Discovery Pages

#### B-1.1 Design System & Global Styles
- [ ] Set up Tailwind config: custom colors (accent, surfaces, veg green, non-veg red/brown), font (Inter or similar from Google Fonts), border radius tokens, spacing
- [ ] Create global CSS: reset, typography, animations (fade, slide, skeleton pulse)
- [ ] Design and implement reusable components:
  - `<Button>` — primary, secondary, ghost, icon variants
  - `<Badge>` — open/closed, veg/non-veg, MVRC rating
  - `<Card>` — vendor card, item card
  - `<SkeletonLoader>` — shimmer placeholders for cards, lists
  - `<Toast>` / notification banner
  - `<Modal>` / bottom sheet
  - `<EmptyState>` — friendly illustrations + messages
  - `<StarRating>` — display + input
  - `<VegToggle>` — prominent green pill/switch

#### B-1.2 App Shell & Navigation
- [ ] Bottom tab bar: Home · Search · Orders · Profile — with Cart button/badge
- [ ] Layout component with tab bar and persistent cart badge
- [ ] Route setup for all student pages (stubs for now)
- [ ] Auth context/provider — store JWT, user info, login/logout functions
- [ ] Cart store (Zustand) — items, vendorId, add/remove/update/clear, single-vendor rule with confirm prompt, persist to localStorage
- [ ] React Query client setup with defaults

#### B-1.3 Auth / Login Page
- [ ] Login screen with two options: "Continue with IIMA Email" and "Sign in with Google"
- [ ] Email OTP flow:
  - Email input with `@iima.ac.in` client-side validation
  - "Send OTP" button → call `POST /api/auth/request-otp`
  - OTP entry (6 boxes, auto-advance, auto-submit) → call `POST /api/auth/verify-otp`
  - Resend timer (60s countdown)
  - Error states: invalid email domain, wrong OTP, expired OTP
- [ ] Google Sign-In flow:
  - Google Sign-In button (use Google Identity Services library)
  - On success → send idToken to `POST /api/auth/google`
  - Handle domain rejection gracefully
- [ ] New user name prompt (if first login)
- [ ] Redirect to Home on success; store JWT

#### B-1.4 Home / Discovery Page
- [ ] Vendor card grid/list with: name, image, cuisine tags, veg/non-veg dot, user rating + count, MVRC badge, prep time, price range, open/closed badge
- [ ] **Veg-only toggle** — prominent sticky green pill in top bar; syncs with global veg state
- [ ] Category rail at top — horizontal scrollable pills (Late Night, Chai & Snacks, etc.); filters on tap
- [ ] Open vendors first; closed vendors dimmed with "Opens at HH:MM"
- [ ] Skeleton loaders while fetching
- [ ] Pull-to-refresh
- [ ] Heart icon on cards for favourites (toggle)
- [ ] Empty states: all closed, no veg results, error
- [ ] Tap card → navigate to Vendor Page

#### B-1.5 Search Page
- [ ] Search bar with debounced query
- [ ] Results grouped: "Vendors" section + "Dishes" section
- [ ] Dish results show vendor name; tap deep-links to item on vendor page
- [ ] Filters bar: Veg Only (synced toggle), Open Now, Cuisine/category dropdown, Sort by dropdown
- [ ] Recent searches (localStorage, optional)
- [ ] No results empty state

#### B-1.6 Vendor Page & Menu
- [ ] Header: vendor image (banner), name, user rating + count, MVRC badge + "View Report" link, prep time, open/closed + timings, location, min order, packaging fee
- [ ] MVRC section: rating display, assessment date, "View Full Report" button → opens report page/PDF
- [ ] Menu with sticky category navigation (horizontal tabs that jump to sections)
- [ ] Item cards: name, price, veg/non-veg dot, description, image, Add button (or +/- stepper if in cart)
- [ ] Veg-only filter respects: hide/dim non-veg items
- [ ] Sold-out items: disabled with "Unavailable" label
- [ ] Vendor closed: menu browsable, Add disabled, "Opens at HH:MM" overlay
- [ ] "Leave Feedback" link
- [ ] Sticky "View Cart" bar when cart has items (count + total)

#### B-1.7 MVRC Report Page
- [ ] Structured report view: vendor name, assessment date, overall MVRC rating
- [ ] Score breakdown: hygiene, food quality, compliance
- [ ] Notes and corrective actions
- [ ] Link to PDF if available
- [ ] Back navigation

---

## Phase 2 — Ordering Flow 🔀 Both agents in parallel

### Agent A — Order APIs

#### A-2.1 Cart Validation API
- [ ] `POST /api/orders/validate` — accept cart items, verify:
  - Vendor exists and is open
  - All items exist, are available, prices match
  - Customization selections are valid (required groups filled, min/max respected)
  - Meets minimum order amount
  - Return validated totals or list of issues

#### A-2.2 Order Placement API
- [ ] `POST /api/orders` — create order:
  - Validate cart (reuse validation logic)
  - Create Order + OrderItems with snapshots (name, price, options at time of order)
  - Set status = `placed`, paymentMethod = `cod`
  - Calculate itemTotal + packagingFee = grandTotal
  - Set estimatedPrepMins from vendor's avgPrepTimeMins
  - Initialize statusTimeline with `[{ status: 'placed', at: now }]`
  - Return order with confirmation details

#### A-2.3 Order Status & Tracking APIs
- [ ] `GET /api/orders` — list user's orders (current + past), newest first, with status
- [ ] `GET /api/orders/:id` — full order detail with items, status timeline, vendor info
- [ ] `POST /api/orders/:id/cancel` — cancel order (only if status is `placed` or `accepted`), update timeline

#### A-2.4 UPI Details API
- [ ] `GET /api/vendors/:id/upi-details` — return UPI ID + QR image URL for the vendor (public, used on payment page)

#### A-2.5 Promo Code API (optional)
- [ ] `GET /api/promos/validate?code=&subtotal=` — validate promo code, return discount amount or error

#### A-2.6 Profile API
- [ ] `GET /api/me` — return user profile
- [ ] `PATCH /api/me` — update name

---

### Agent B — Ordering UI

#### B-2.1 Item Customization Sheet
- [ ] Bottom sheet / modal triggered when adding an item with customization groups
- [ ] Single-select groups (radio buttons), multi-select groups (checkboxes)
- [ ] Required group validation (highlight unfilled)
- [ ] Min/max selection enforcement for multi-select
- [ ] Price deltas shown per option; running total updates live
- [ ] Item note text field
- [ ] Quantity stepper
- [ ] "Add — ₹X" button with computed total
- [ ] Re-opening an in-cart item pre-fills previous selections

#### B-2.2 Cart Page
- [ ] List items with: name, selected options, quantity stepper (+/-), per-line total, remove (X)
- [ ] "Add more items" → back to vendor page
- [ ] Price breakdown: item total, packaging fee, grand total
- [ ] Promo code field with apply/validate (optional)
- [ ] Single-vendor enforcement: prompt "Start new order?" if adding from different vendor
- [ ] Cart persists in localStorage via Zustand persist middleware
- [ ] Edge states: item unavailable (flag + remove), below min order (show shortfall, disable checkout)
- [ ] "Proceed to Checkout" button

#### B-2.3 Checkout Page
- [ ] Order summary: items, packaging fee, grand total
- [ ] Vendor location shown for pickup reference
- [ ] Special instructions text field
- [ ] Payment method display: "Cash on Pickup (COD)" — no selection needed
- [ ] "Place Order" button → call `POST /api/orders`
- [ ] Loading state during placement
- [ ] Error handling: vendor closed, items unavailable

#### B-2.4 Order Confirmation Page
- [ ] Success animation / illustration
- [ ] Order ID, estimated pickup time
- [ ] Vendor name + location
- [ ] "View UPI Payment Details" button → UPI page
- [ ] "Track Order" button → order tracking

#### B-2.5 UPI Payment Page
- [ ] Vendor's UPI QR code (large, scannable image)
- [ ] UPI ID in copyable text (tap to copy with feedback)
- [ ] Order total prominently displayed
- [ ] Note: "Scan to pay via any UPI app. Show payment confirmation at pickup."
- [ ] If vendor has no UPI configured → "Pay cash at counter" message
- [ ] Accessible from order confirmation + order tracking

#### B-2.6 Order Tracking Page
- [ ] Visual stepper/timeline: Placed → Accepted → Preparing → Ready for Pickup → Completed
- [ ] Terminal states: Cancelled (by student), Rejected (by vendor with reason)
- [ ] Timestamps on each completed stage
- [ ] Estimated ready time
- [ ] Order details (items, total) collapsible
- [ ] Vendor location / pickup directions
- [ ] "Contact Vendor" tap-to-call button
- [ ] "Cancel Order" button (visible only before `Preparing`)
- [ ] "View UPI Details" link
- [ ] Auto-poll for status updates (every 15–30s)
- [ ] "Taking longer than usual" hint if stalled

#### B-2.7 Orders Tab (History)
- [ ] Tabs or segments: "Active" / "Past"
- [ ] Order cards: vendor name, status badge, items summary, total, date/time
- [ ] Tap → order detail
- [ ] "Reorder" button → recreate cart (skip unavailable with notice)
- [ ] "Rate" prompt on completed unreviewed orders
- [ ] "Leave Feedback" prompt on completed orders without feedback

#### B-2.8 Profile Page
- [ ] Name, IIMA email display
- [ ] Editable name (inline edit or modal)
- [ ] Quick links: Favourites, Orders
- [ ] Logout button (clear JWT + cart)

#### B-2.9 Favourites Page
- [ ] List of favourite vendors (cards, same style as Home)
- [ ] Heart toggle to remove
- [ ] Empty state: "No favourites yet"

---

## Phase 3 — Vendor Portal 🔀 Both agents in parallel

### Agent A — Vendor Portal APIs

#### A-3.1 Vendor Order APIs
- [ ] `GET /api/vendor/orders?status=&date=` — list orders for the authenticated vendor, filterable by status and date
- [ ] `GET /api/vendor/orders/:id` — order detail with items, student name, customizations, notes
- [ ] `POST /api/vendor/orders/:id/accept` — set status to `accepted`, update timeline
- [ ] `POST /api/vendor/orders/:id/reject` — set status to `rejected` with reason, update timeline
- [ ] `POST /api/vendor/orders/:id/preparing` — set status to `preparing`, update timeline
- [ ] `POST /api/vendor/orders/:id/ready` — set status to `ready_for_pickup`, update timeline
- [ ] `POST /api/vendor/orders/:id/complete` — set status to `completed`, update timeline
- [ ] Each status transition validates the current status (can't skip stages, can't go backwards)

#### A-3.2 Menu Management APIs
- [ ] `GET /api/vendor/menu` — all categories + items for the authenticated vendor
- [ ] `POST /api/vendor/categories` — create category `{ name, sortOrder }`
- [ ] `PATCH /api/vendor/categories/:id` — update category name/sortOrder
- [ ] `DELETE /api/vendor/categories/:id` — delete category (fail if items exist, or cascade-soft-delete)
- [ ] `POST /api/vendor/items` — create item `{ name, description, price, isVeg, categoryId, imageUrl? }`
- [ ] `PATCH /api/vendor/items/:id` — update item fields
- [ ] `DELETE /api/vendor/items/:id` — soft-delete item
- [ ] `PATCH /api/vendor/items/:id/availability` — toggle `{ isAvailable }` (quick sold-out toggle)
- [ ] Customization group CRUD under items (nested endpoints or bulk update)

#### A-3.3 Vendor Profile & Hours APIs
- [ ] `GET /api/vendor/profile` — vendor profile for the authenticated vendor
- [ ] `PATCH /api/vendor/profile` — update name, description, image, cuisineTags, area, upiId, upiQrImageUrl, minOrder, packagingFee, avgPrepTimeMins, openHours, isTemporarilyClosed

#### A-3.4 Vendor Dashboard APIs
- [ ] `GET /api/vendor/dashboard/summary` — today's stats: orders received/accepted/completed/rejected, total revenue
- [ ] `GET /api/vendor/dashboard/popular-items` — top 5 items by order count (today or this week)

#### A-3.5 Vendor Feedback APIs
- [ ] `GET /api/vendor/reviews` — all student reviews for this vendor, newest first
- [ ] `GET /api/vendor/feedback` — all food feedback submissions, newest first, including MVRC flags

---

### Agent B — Vendor Portal UI

#### B-3.1 Vendor Portal Shell
- [ ] Separate route group `/vendor/...` with its own layout
- [ ] Sidebar navigation (desktop) / bottom tabs (mobile): Orders · Menu · Feedback · Settings
- [ ] Vendor auth context (separate from student auth)
- [ ] Vendor login page: email + password form, error states
- [ ] Redirect to vendor dashboard on successful login

#### B-3.2 Order Queue Page
- [ ] Tab bar: New · Active · Ready · Completed · Rejected
- [ ] Order cards: order ID (short), student name, items list (with customizations/notes), total, time since placed
- [ ] Actions on cards:
  - New: "Accept" (green) + "Reject" (red, with reason dropdown)
  - Active: "Mark Ready" button
  - Ready: "Mark Completed" button
- [ ] Sound/visual notification for new orders (browser notification permission + audio ping)
- [ ] Auto-refresh (poll every 10–15s)
- [ ] Order detail view (expandable card or side panel)
- [ ] Empty states per tab

#### B-3.3 Menu Management Page
- [ ] Categories list with drag-to-reorder (or up/down arrows), edit/delete
- [ ] "Add Category" button + inline form
- [ ] Items grid/list per category:
  - Item cards: name, price, veg/non-veg, availability badge
  - Quick toggle: Available/Sold Out (one-tap)
  - Edit button → item edit form (name, description, price, isVeg, image, customization groups)
  - Delete button with confirmation
- [ ] "Add Item" button per category → item creation form
- [ ] Customization group management within item edit:
  - Add/edit/remove groups (name, type, required, min/max)
  - Add/edit/remove options per group (name, priceDelta)
- [ ] Bulk action: "Mark all unavailable" per category

#### B-3.4 Operating Hours Page
- [ ] Weekly schedule grid: each day with opening/closing time pickers
- [ ] "Temporarily Close Now" toggle (prominent) with optional reopen time
- [ ] Holiday/special hours override: date picker + hours
- [ ] Save button with confirmation

#### B-3.5 Ratings & Feedback Page
- [ ] Overview section: user avg rating, review count, MVRC rating (read-only badge)
- [ ] Tabs: "Reviews" / "Food Feedback"
- [ ] Reviews tab: list of reviews with star rating, text, date, order ID
- [ ] Feedback tab: list with quality/hygiene/value scores, comments, MVRC flag indicator
- [ ] MVRC report section: latest report display (read-only)
- [ ] Filter by date range, rating

#### B-3.6 Vendor Profile & Settings Page
- [ ] Edit form: vendor name, description, image upload, area/location, cuisine tags
- [ ] UPI settings: UPI ID input, QR code image upload/preview
- [ ] Fees: minimum order amount, packaging fee
- [ ] Account: email (read-only), change password form
- [ ] Prep time setting

#### B-3.7 Vendor Dashboard Page
- [ ] Today's summary cards: orders received, accepted, completed, rejected/cancelled, total revenue
- [ ] Popular items: top 5 list with order count
- [ ] Keep it simple and glanceable

---

## Phase 4 — Ratings, Feedback & Reviews 🔀 Both agents in parallel

### Agent A — Ratings & Feedback APIs

#### A-4.1 Review APIs
- [ ] `POST /api/orders/:id/review` — submit review `{ rating, text }`:
  - Validate order belongs to user and status is `completed`
  - One review per order (unique constraint)
  - Recalculate vendor's avgRating and ratingCount
- [ ] Allow update within a short window (optional: 24h edit window)

#### A-4.2 Food Feedback APIs
- [ ] `POST /api/orders/:id/feedback` — submit post-order feedback:
  - `{ foodQuality, hygiene, valueForMoney, itemComments?, comments?, flagForMvrc }`
  - Validate order belongs to user
  - One feedback per order (update if exists)
- [ ] `POST /api/vendors/:id/feedback` — submit general feedback (no order required):
  - Same fields minus order-specific ones
  - Requires authenticated user

---

### Agent B — Ratings & Feedback UI

#### B-4.1 Review Submission
- [ ] Post-order review modal/page: 1–5 star input + optional text
- [ ] Triggered from order detail / orders list for completed orders
- [ ] Success confirmation toast
- [ ] Review already submitted → show existing review (editable briefly)

#### B-4.2 Food Feedback Form
- [ ] Post-order feedback form (separate from review):
  - Food quality slider/stars (1–5)
  - Hygiene slider/stars (1–5)
  - Value for money slider/stars (1–5)
  - Per-item comments (optional, expandable)
  - Free-text comments
  - "Flag for MVRC" checkbox with explanation text
- [ ] Accessible from: order detail, vendor page ("Leave Feedback")
- [ ] General feedback form (no order context) from vendor page
- [ ] Success confirmation: "Thank you! Your feedback helps improve campus dining."

---

## Phase 5 — Polish & PWA ⚡ Both agents

### Agent A — Backend Polish

#### A-5.1 PWA Configuration
- [ ] Create `manifest.json`: app name, short name, icons (192px, 512px), theme color, background color, display: standalone, start_url
- [ ] Service worker setup (Workbox or manual): cache app shell, cache API responses (vendors list), offline fallback page

#### A-5.2 In-App Notifications Logic
- [ ] Student: trigger notification data on order status changes (Accepted, Ready, Completed)
- [ ] Vendor: new order notification data
- [ ] Endpoint to poll for notifications or status changes efficiently

#### A-5.3 Security & Validation Hardening
- [ ] Rate limiting on OTP requests (max 5 per email per 10 min)
- [ ] Validate all inputs with Zod schemas
- [ ] Prevent price manipulation (server-side price calculation)
- [ ] Ensure vendor can only modify their own data
- [ ] CORS configuration for production

#### A-5.4 Performance
- [ ] Add pagination to orders list, reviews list, feedback list
- [ ] Optimize vendor list query (avoid N+1 for categories/items)
- [ ] Add database indexes on frequently queried fields

---

### Agent B — Frontend Polish

#### B-5.1 In-App Notifications (UI)
- [ ] Toast / banner component for status transitions
- [ ] Show notifications on order tracking when status changes (during polling)
- [ ] Sound notification on vendor portal for new orders

#### B-5.2 Loading, Error & Empty States
- [ ] Skeleton loaders on every data-fetching page
- [ ] Error boundaries with friendly retry messages
- [ ] Empty states with illustrations: no vendors, no orders, no favourites, no search results, all vendors closed
- [ ] Network error fallback page

#### B-5.3 PWA Install Prompt
- [ ] "Add to Home Screen" prompt/banner (deferred, non-intrusive)
- [ ] PWA splash screen configuration
- [ ] Verify installable on Android Chrome + iOS Safari

#### B-5.4 Responsive & Accessibility Pass
- [ ] Test all pages at 320px, 375px, 414px, 768px, 1024px+
- [ ] Vendor portal: sidebar on desktop, bottom tabs on mobile
- [ ] Tap targets ≥ 44px
- [ ] Color contrast check (WCAG AA)
- [ ] Veg/non-veg indicators: dot + text label (not color-only)
- [ ] Keyboard navigation for vendor portal forms

#### B-5.5 Animations & Micro-interactions
- [ ] Page transitions (subtle fade/slide)
- [ ] Add-to-cart animation (item flies to cart badge)
- [ ] Cart badge bounce on count change
- [ ] Order status stepper animation
- [ ] Skeleton shimmer animation
- [ ] Button press feedback (scale down)
- [ ] Toast slide-in/out
- [ ] Heart favourite toggle animation

#### B-5.6 Final QA
- [ ] Walk through every user flow: login → browse → search → add to cart → customize → checkout → track → review → feedback
- [ ] Walk through every vendor flow: login → view orders → accept → mark ready → complete → manage menu → view feedback
- [ ] Verify veg-only toggle works across Home, Search, Vendor Page
- [ ] Verify single-vendor cart rule
- [ ] Verify order status updates reflect on both student and vendor sides
- [ ] Test edge cases: all vendors closed, vendor closes mid-checkout, sold-out items, empty cart, below min order, invalid OTP

---

## Dependency Summary

```
Phase 0 (Agent A solo)
    │
    ├── Phase 1A (Agent A: APIs) ──────┐
    │                                  ├── Phase 2 (both)
    ├── Phase 1B (Agent B: UI shell) ──┘
    │                                  
    │── Phase 3 (both, parallel with Phase 2)
    │
    └── Phase 4 (both, after Phase 2+3 core is done)
         │
         └── Phase 5 (both, polish)
```

> **Key rule:** Agent B can start Phase 1B as soon as Phase 0 is done. Agent B can use mock data / the seed data while waiting for Agent A's APIs. Once APIs are ready, Agent B connects React Query hooks to real endpoints.

---

## File Ownership (to avoid merge conflicts)

| Agent A owns | Agent B owns |
|---|---|
| `/prisma/*` | `/src/components/*` |
| `/src/app/api/*` (or `/src/api/*`) | `/src/app/(student)/*` pages |
| `/src/lib/*` (db, auth, validation) | `/src/app/(vendor)/*` pages |
| `/src/middleware/*` | `/src/stores/*` |
| `/src/services/*` | `/src/hooks/*` |
| `API_REFERENCE.md` | `/src/styles/*` |
| `.env.example` | `/public/*` (icons, manifest, assets) |
| `prisma/seed.ts` | Tailwind config |

**Shared (coordinate edits):** `package.json`, `tsconfig.json`, root layout, environment types.
