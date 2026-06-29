# CampusEats — Product Requirements Document (MVP)

**Product:** CampusEats — a campus food‑ordering PWA for IIMA  
**Scope:** Student app + Vendor portal (both sides of the marketplace)  
**Audience:** Engineering (intended for Claude Code / AI-assisted build)  
**Status:** Draft v2 — revised per feedback; assumptions in §3  

---

## 1. Overview & Vision

CampusEats lets IIMA students discover food vendors on campus, browse menus, and place orders for **self‑pickup** — without phone calls, screenshots, or guessing what's open at 1 AM. Vendors manage their menus, hours, and incoming orders through a dedicated portal.

The student experience should feel like a polished food‑ordering app, but **scoped to the campus**: fewer vendors, faster ordering, and built around campus realities (late-night cravings, veg/non-veg clarity, MVRC transparency).

The vendor experience should be simple and functional: see incoming orders, accept/reject, mark ready, and manage your menu.

**Design north star:** A hungry student should go from opening the app to a placed order in **under 60 seconds and fewer than 8 taps.**

> **Delivery is deferred to v2.** This MVP is pickup-only.

---

## 2. Goals & Success Metrics

| Goal | Metric (for the MVP / pilot) |
|---|---|
| Make ordering effortless | ≥ 70% of started carts result in a placed order |
| Fast discovery | Home screen usable in < 2s on campus Wi‑Fi |
| Trustworthy status | Live order status visible for 100% of orders |
| Repeat usage | ≥ 40% of users place a 2nd order within 7 days |
| Lean, elegant UX | Order completable in ≤ 8 taps from home |
| Vendor adoption | ≥ 80% of orders accepted within 5 minutes |
| Transparency | MVRC rating & report link visible on 100% of vendor pages |

These are pilot targets, not gating requirements for shipping the MVP.

---

## 3. Assumptions & Decisions to Confirm

These are the calls made so the build can proceed. **Each can be flipped — flag any you disagree with.**

1. **Platform:** **Progressive Web App (PWA)** — mobile-first responsive web app that can be installed to the home screen on both Android and iOS. No app-store submission for MVP; installable via browser "Add to Home Screen". Manifest + service worker included.
2. **Vendors in scope:** A curated set of **campus vendors** (mess café, canteens, food-street stalls, juice/shakes counters, late-night spots). Vendors are **admin-seeded** for the MVP; self-registration is a future enhancement.
3. **Fulfilment:** **Pickup only.** Students order and collect from the vendor. Delivery (including dorm-room delivery) is **deferred to v2.**
4. **Payments:** **Cash on Delivery (COD)** only. A **UPI Payment page** displays the vendor's QR code and UPI ID so students can optionally pay via UPI at pickup. No online payment gateway (Razorpay etc.) in MVP.
5. **Auth:** **IIMA email OTP** (restricted to `@iima.ac.in` addresses) **+ Google Sign-In** (domain-restricted to `iima.ac.in` via `hd` param + server-side validation). Dual login options.
6. **Cart rule:** **Single-vendor cart** (standard for food apps) — starting a new vendor's order clears the cart after a confirmation prompt.
7. **Ratings:** Two rating dimensions per vendor — **User ratings** (aggregated from student reviews) and **MVRC ratings** (set by the Mess & Vendor Review Committee, with a linked detailed report for transparency).
8. **Vendor portal:** Included in MVP scope — vendors can manage orders, menu, and availability through a web portal.

---

## 4. Scope

### In scope (MVP)

**Student app:** Auth & onboarding (email OTP + Google) · Home/discovery · Search & filters (including veg-only toggle) · Vendor page & menu · Item customization · Cart · Checkout (COD + UPI QR page) · Order placement · Order status tracking (pickup flow) · Order history & reorder · Ratings & reviews (user + MVRC) · Food feedback · Profile · Favourites · Basic notifications (in-app).

**Vendor portal:** Vendor auth · Order management (accept/reject/mark ready) · Menu management (CRUD items, categories, toggle availability) · Operating hours management · View ratings & feedback · Basic dashboard (today's orders, revenue).

### Out of scope (MVP)

Delivery & delivery-partner app · Live GPS tracking · Group/split ordering · Scheduled orders · Loyalty/wallet · Online payment gateway (Razorpay) · Chat support · Multi-campus support · Admin dashboard (beyond seeding) · Push/SMS notifications · Vendor self-registration. *(Captured in §16 as future phases.)*

---

## 5. Personas

### Student side
- **The Late-Night Grinder** — orders at odd hours; needs "open now" front and center and fast reorder.
- **The Picky Eater** — strict veg; needs unmistakable veg/non-veg indicators and a prominent veg-only filter.
- **The Group Orderer (lite)** — orders for a few friends; needs easy quantity changes and notes. *(Full split/group ordering is Phase 2.)*
- **The Transparency Seeker** — wants to know MVRC ratings, hygiene reports, and community feedback before choosing a vendor.

### Vendor side
- **The Busy Counter** — needs a simple, glanceable order queue with accept/reject and one-tap "ready for pickup" — not a complex dashboard.
- **The Menu Manager** — needs to update prices, toggle item availability (sold out), and adjust operating hours without calling an admin.

---

## 6. Information Architecture (screen map)

### Student App

```
Splash / Auth (IIMA Email OTP or Google Sign-In)
└── Home (Discovery)
    ├── Search (with Veg-Only toggle)
    ├── Vendor Page
    │   ├── User Rating + MVRC Rating & Report Link
    │   ├── Food Feedback (submit)
    │   └── Item Customization (sheet)
    ├── Cart
    │   └── Checkout (COD + UPI QR page)
    │       └── Order Confirmation
    ├── Orders
    │   ├── Order Tracking (pickup status)
    │   └── Order Detail / Reorder / Review / Feedback
    └── Profile
        ├── Favourites
        └── Logout
```

Primary navigation: a **bottom tab bar** — **Home · Search · Orders · Profile** — with a persistent **Cart** button/badge.

### Vendor Portal

```
Vendor Login (email/password)
└── Dashboard
    ├── Order Queue (incoming / active / completed)
    │   └── Order Detail (accept/reject/mark ready)
    ├── Menu Management
    │   ├── Categories (CRUD, reorder)
    │   └── Items (CRUD, toggle availability)
    ├── Operating Hours
    ├── Ratings & Feedback (view user reviews, MVRC rating, food feedback)
    └── Vendor Profile / Settings
```

Primary navigation: a **sidebar** (desktop) or **bottom tab bar** (mobile) — **Orders · Menu · Feedback · Settings**.

---

## 7. Detailed Feature Specifications — Student App

> Format per feature: **what it is → user stories → acceptance criteria → UI notes → edge cases.**

### 7.1 Onboarding & Authentication

**What:** Frictionless login restricted to IIMA community via email OTP or Google Sign-In.

**User stories**
- As a student, I can log in with my IIMA email and a one-time code.
- As a student, I can sign in with my IIMA Google account in one tap.
- As a first-time user, I add my name after login.

**Acceptance criteria**
- **Email OTP flow:** Enter email → validate it ends with `@iima.ac.in` client-side → "Send OTP" → enter 6-digit code → logged in. Non-IIMA emails are rejected with a clear message ("Only @iima.ac.in email addresses are allowed").
- **Google Sign-In flow:** Tap "Sign in with Google" → Google OAuth with `hd=iima.ac.in` hint → on callback, server verifies the `email` claim ends with `@iima.ac.in` → logged in. Non-IIMA Google accounts are rejected server-side.
- New users are asked for their **name** (required).
- Session persists across reloads (JWT in storage); a "Logout" exists in Profile.
- MVP OTP is mocked (e.g., a fixed/test code or console-logged), behind an interface that can swap to a real email provider (SendGrid, Resend, etc.).

**UI notes:** Clean, single-focus screens. Two prominent login buttons: "Continue with IIMA Email" and "Sign in with Google". Large input fields, auto-advance OTP boxes, clear resend timer.

**Edge cases:** Invalid/expired OTP message; resend throttling; non-IIMA email → clear rejection; Google account from different domain → clear rejection; back navigation preserves entered email.

---

### 7.2 Home / Discovery

**What:** The landing feed of vendors — the "Zomato home."

**User stories**
- As a student, I see vendors that are open now, with cuisine, rating (user + MVRC), so I can pick fast.
- As a student, I can toggle "Veg Only" to see only vegetarian vendors/items.

**Acceptance criteria**
- Shows a list/grid of **vendor cards**, each with: name, image, cuisine tags, **veg/non-veg indicator**, **user avg rating + count**, **MVRC rating badge**, **avg prep time**, price-for-two or "₹ from", and an **Open / Closed** badge.
- **Open vendors appear first**; closed vendors are visually dimmed and show next opening time.
- A **prominent "Veg Only" toggle** (sticky, always visible) filters the feed to show only vendors with veg items (or only the veg items within mixed vendors).
- A **category rail** at top (e.g., "Late Night", "Chai & Snacks", "Rolls & Wraps", "Beverages", "Quick Bites") filters the feed on tap.
- Pull‑to‑refresh; skeleton loaders while loading.
- Tapping a card opens the Vendor Page.

**UI notes:** Mobile-first cards, one accent color, generous spacing, fast perceived load via skeletons. Veg = green dot/border, non-veg = red/brown dot (Indian convention). Veg-only toggle should be unmissable — consider a green pill/switch in the top bar.

**Edge cases:** All vendors closed → friendly empty state with next-open info; no image → branded placeholder; veg-only with no results → helpful message.

---

### 7.3 Search & Filters

**What:** Find a vendor or dish quickly.

**User stories**
- As a student, I can search "Maggi" or "rolls" and find vendors/dishes that match.
- As a veg student, I can filter to only veg options across the app.

**Acceptance criteria**
- Single search bar matches across **vendor names, cuisine tags, and dish names**.
- Results grouped as "Vendors" and "Dishes"; tapping a dish deep-links to that item on its vendor page.
- Filters: **Veg only** (prominent toggle), **Open now**, **Cuisine/category**, **Sort by** (Rating, Prep Time, Price). Filters are combinable and clearable.
- **Veg-only filter** is a first-class, always-visible toggle — not buried in a filter dropdown. Its state should sync with the Home toggle.
- Recent searches shown when the bar is empty (optional, nice-to-have).

**Edge cases:** No results → suggest clearing filters or show popular vendors.

---

### 7.4 Vendor Page & Menu

**What:** A vendor's full menu and info, including dual ratings and transparency reports.

**User stories**
- As a student, I browse a vendor's menu by category and add items to my cart.
- As a student, I see both user ratings and the MVRC rating with a link to the full report.

**Acceptance criteria**
- Header: vendor name, image, **user avg rating + count**, **MVRC rating + "View Report" link**, avg prep time, **open/closed + timings**, area/location, **min order** and packaging fee (if any).
- **MVRC section:** Displays the MVRC-assigned rating (e.g., out of 5 or a grade like A/B/C), date of last assessment, and a clickable link to the **detailed MVRC report** (opens a PDF or a detail page with hygiene scores, inspection notes, etc.).
- Menu organized into **categories** (e.g., Starters, Mains, Beverages); sticky category nav lets users jump.
- Each **item card**: name, price, **veg/non-veg dot**, short description, optional image, and an **Add** button (or stepper if already in cart).
- When **Veg Only** is active, non-veg items are hidden or visually dimmed.
- Items with options open a **customization sheet** (see 7.5); simple items add directly.
- Unavailable/sold-out items are shown disabled with a label.
- A **sticky "View Cart" bar** appears once items are added (item count + total + tap to open cart).
- A **"Leave Feedback"** link to the food feedback form (§7.14).

**Edge cases:** Vendor closed → menu browsable but "Add" disabled with "Opens at HH:MM"; below min order → cart shows how much more is needed.

---

### 7.5 Item Customization

**What:** Choose required/optional modifiers (size, spice, add-ons) before adding to cart.

**User stories**
- As a student, I pick "Large", add cheese, and set "less spicy" before adding.

**Acceptance criteria**
- Customization groups support **single-select (radio)** and **multi-select (checkbox)** with **required/optional** and **min/max** rules.
- Each option can carry a **price delta**; running item price updates live.
- Optional **item note** field (e.g., "no onion").
- Quantity stepper; "Add — ₹X" button reflects total.
- Required groups must be satisfied before adding (validation).

**Edge cases:** Max selections reached → further options disabled with hint; reopening an in-cart item pre-fills prior selections.

---

### 7.6 Cart

**What:** Review and edit the order before checkout. **Single vendor per cart.**

**User stories**
- As a student, I adjust quantities, see the full price breakdown, and proceed to checkout.

**Acceptance criteria**
- Lists items with selected options, per-line quantity steppers, and remove.
- "Add more items" returns to the vendor page.
- **Price breakdown:** item total, packaging fee (if any), **grand total**. No delivery fee (pickup only).
- Optional **promo code** field with validate/apply (simple flat or % code) — *promo engine is optional for MVP*.
- Adding an item from a **different vendor** prompts: "Start a new order? This clears your current cart." Confirm to switch.
- Cart **persists** across reloads/sessions until ordered or cleared.

**Edge cases:** Item becomes unavailable → flagged and auto-removed with notice; below min order → checkout disabled with the shortfall shown.

---

### 7.7 Checkout & Payment

**What:** Confirm order details, choose COD, and optionally view UPI payment details.

**User stories**
- As a student, I review my order, place it for pickup with COD, and optionally pay via UPI using the displayed QR code.

**Acceptance criteria**
- **No address step** — all orders are pickup; vendor location is shown for reference.
- **Special instructions** field for the vendor (e.g., "will pick up in 20 mins").
- **Payment method: COD (Cash on Delivery/Pickup).** This is the only checkout method. 
- **UPI Payment page:** After placing the order (or accessible from order detail), a dedicated page shows:
  - The vendor's **UPI QR code** (scannable image).
  - The vendor's **UPI ID** (copyable text, e.g., `vendorname@upi`).
  - The **order total** prominently displayed.
  - A note: "Scan to pay via any UPI app. Show payment confirmation at pickup."
  - This is **informational only** — the app does not verify UPI payments. Payment confirmation happens at the counter.
- Final order summary (items, fees, total, vendor location, estimated prep time) shown before "Place Order".
- On success → **Order Confirmation** screen with order ID, estimated pickup time, vendor location, and a button to view UPI payment details.

**Edge cases:** Vendor closes mid-checkout → block placement with a clear message; no UPI details configured for vendor → show COD-only with "Pay at counter" message.

---

### 7.8 Order Tracking

**What:** Show order progress as a clear status timeline (pickup flow).

**User stories**
- As a student, I see whether my food is accepted, being prepared, and ready for pickup.

**Acceptance criteria**
- **Status stages (pickup only):**
  - `Placed → Accepted → Preparing → Ready for Pickup → Completed`
  - Terminal states: `Cancelled`, `Rejected`.
- Visual **stepper/timeline** with timestamps and an **estimated ready time**.
- Order details (items, total, payment status) visible.
- **Vendor location/map** shown for pickup directions.
- **Contact vendor** (tap-to-call) available.
- **Cancel order** allowed only before `Preparing` (configurable window).
- **UPI payment details** accessible from this screen (link to the QR/UPI page).
- Status updates poll/refresh automatically (real-time push is a future enhancement).

**Edge cases:** Rejected by vendor → reason shown; long stall in a stage → "taking longer than usual" hint.

---

### 7.9 Order History & Reorder

**What:** Past orders with one-tap reorder.

**Acceptance criteria**
- "Orders" tab lists current and past orders (status, vendor, total, date), newest first.
- Order detail shows the full itemized receipt.
- **Reorder** recreates the same cart (skipping unavailable items, with a notice) and jumps to cart.
- Completed orders show a **Rate** prompt if not yet reviewed.
- Completed orders show a **Food Feedback** prompt if not yet submitted.

---

### 7.10 Ratings & Reviews (User + MVRC)

**What:** Dual rating system — student-submitted reviews and MVRC committee ratings — for full transparency.

**Acceptance criteria**

**User ratings:**
- After `Completed`, the student can give a **1–5 star** rating + optional text review.
- One review per order; editable for a short window (optional).
- Vendor's **average user rating and count** update accordingly and display on Home/Vendor pages.

**MVRC ratings:**
- Each vendor has an **MVRC rating** (1–5 or A–E grade), set by the Mess & Vendor Review Committee.
- MVRC rating is displayed on the vendor card (Home) and vendor page with a distinct badge/label (e.g., "MVRC: A" or "MVRC: 4.2/5").
- Each MVRC rating links to a **detailed report** — a PDF or a structured page containing:
  - Date of last inspection/assessment.
  - Hygiene score.
  - Food quality score.
  - Compliance notes.
  - Any corrective actions required.
- MVRC ratings and reports are managed by an admin (seeded/uploaded); vendors cannot edit them.
- The report link opens in a new tab/view (if PDF) or navigates to a report detail page.

**Edge cases:** Can't review undelivered/cancelled orders; profanity left unfiltered in MVP (note for future moderation); vendor with no MVRC rating yet → show "Pending assessment" badge.

---

### 7.11 Profile

**Acceptance criteria**
- Profile shows name, IIMA email, and quick links to Favourites, Orders, Logout.
- Editable display name.
- No saved addresses section (pickup-only MVP).

---

### 7.12 Favourites

**Acceptance criteria**
- Heart icon on vendor cards/pages toggles favourite.
- "Favourites" list in Profile for quick access. *(Lightweight; can ship in a later sub-phase.)*

---

### 7.13 Notifications (in-app, light)

**Acceptance criteria**
- In-app status banners/toasts on key transitions (Accepted, Ready for Pickup, Completed).
- Push/SMS notifications are a **future enhancement**, behind an interface.

---

### 7.14 Food Feedback

**What:** A dedicated section for students to provide detailed feedback on food quality, hygiene, and suggestions — beyond the star rating.

**User stories**
- As a student, I want to give detailed feedback about food quality after my order.
- As a student, I want to report a hygiene or quality issue to the vendor and MVRC.

**Acceptance criteria**
- **Post-order feedback:** After order completion, students are prompted (optional) to leave food feedback in addition to the star rating.
- **Feedback form fields:**
  - **Food quality** — 1–5 scale (taste, freshness, portion size).
  - **Hygiene** — 1–5 scale.
  - **Value for money** — 1–5 scale.
  - **Specific items feedback** — optional per-item comments (e.g., "the paneer was stale").
  - **Free-text comments / suggestions** — open text field.
  - **Issue flag** — checkbox: "Flag this as a concern for MVRC" (for serious hygiene/quality issues).
- Feedback is visible to the **vendor** (in their portal) and to **MVRC/admins** (especially flagged issues).
- Feedback is **not** publicly displayed on the vendor page (unlike star reviews). It's internal/operational.
- A **general feedback** option is also accessible from the vendor page ("Leave Feedback") for students who want to provide feedback without placing an order.
- Submitted feedback shows a confirmation: "Thank you! Your feedback helps improve campus dining."

**Edge cases:** Duplicate feedback for same order → update existing; vendor with no feedback yet → empty state in vendor portal.

---

## 8. Detailed Feature Specifications — Vendor Portal

### 8.1 Vendor Authentication

**What:** Separate login for vendors using email/password credentials.

**Acceptance criteria**
- Vendors log in with **email + password** (credentials seeded by admin for MVP).
- Vendor accounts are distinct from student accounts.
- Session persists via JWT; logout available in settings.
- Password reset via email (mocked in MVP).

**Edge cases:** Vendor tries to access student app → separate entry points / URLs.

---

### 8.2 Order Management

**What:** The core vendor workflow — view incoming orders, accept/reject, and mark status.

**User stories**
- As a vendor, I see new orders as they come in and can accept or reject them.
- As a vendor, I mark orders as "Preparing" and "Ready for Pickup" so students know when to collect.

**Acceptance criteria**
- **Order queue** with tabs/filters: **New** (pending acceptance), **Active** (accepted/preparing), **Ready**, **Completed**, **Cancelled/Rejected**.
- Each order card shows: order ID, student name, items with customizations/notes, total, time since placed.
- **Actions per status:**
  - New → **Accept** or **Reject** (with reason dropdown: "Too busy", "Item unavailable", "Closing soon", custom).
  - Accepted → **Mark Preparing** (optional, auto-advances on accept if vendor prefers).
  - Preparing → **Mark Ready for Pickup**.
  - Ready → **Mark Completed** (when student collects).
- **Sound/visual alert** for new incoming orders.
- Auto-refresh / poll for new orders.
- Order detail view with full itemization.

**Edge cases:** Order cancelled by student before acceptance → removed from queue with notice; multiple simultaneous new orders → queue sorted by time.

---

### 8.3 Menu Management

**What:** Vendors manage their menu items, categories, availability, and pricing.

**Acceptance criteria**
- **Categories:** Create, edit, delete, reorder menu categories.
- **Items:** Create, edit, delete items with: name, description, price, veg/non-veg flag, image (optional), category assignment.
- **Customization groups:** Add/edit customization groups per item (size, add-ons, spice level) with options and price deltas.
- **Availability toggle:** One-tap toggle to mark an item as **available/unavailable** (sold out) without deleting it.
- **Bulk actions:** Mark all items in a category as unavailable (e.g., "kitchen closing this section").
- Changes reflect immediately on the student app.

**Edge cases:** Deleting an item that's in active orders → soft-delete, item remains in order history; editing price → applies to new orders only, not existing.

---

### 8.4 Operating Hours Management

**What:** Vendors set when they're open/closed.

**Acceptance criteria**
- **Per-day schedule:** Set opening and closing times for each day of the week.
- **Temporary closure:** "Close Now" toggle to immediately mark as closed (override schedule), with an optional reopen time.
- **Holiday/special hours:** Override for specific dates.
- Open/closed status on the student app updates accordingly.

---

### 8.5 Ratings & Feedback Dashboard

**What:** Vendors see their ratings, student reviews, and food feedback.

**Acceptance criteria**
- **Overview:** User avg rating, total review count, MVRC rating (read-only), recent trend.
- **Reviews list:** All student reviews with rating, text, date, and associated order ID. Sorted newest-first.
- **Food feedback list:** All food feedback submissions with quality/hygiene/value scores, comments, and MVRC flags. Sorted newest-first.
- **MVRC report:** View-only display of the latest MVRC report linked to their profile.
- Vendors **cannot** edit or delete reviews/feedback.

---

### 8.6 Vendor Profile & Settings

**Acceptance criteria**
- Edit vendor **name, description, image, area/location, cuisine tags**.
- Update **UPI ID and QR code** (the payment details shown to students).
- Set **minimum order amount** and **packaging fee**.
- View account email; change password.

---

### 8.7 Basic Dashboard

**Acceptance criteria**
- **Today's summary:** Orders received, accepted, completed, rejected/cancelled. Total revenue.
- **Popular items:** Top 5 items by order count (today / this week).
- Lightweight — no complex analytics in MVP.

---

## 9. Data Model (core entities)

> Field lists are indicative; use sensible types/constraints. IDs are UUIDs. Money in paise/integer or decimal — be consistent.

- **User** — id, name, email (unique, must be `@iima.ac.in`), authProvider(email|google), createdAt.
- **Vendor** — id, name, description?, imageUrl?, cuisineTags[], area/location, hasVeg, hasNonVeg, avgRating, ratingCount, mvrcRating?, mvrcReportUrl?, mvrcAssessmentDate?, openHours (per day), pickupAvailable (always true for MVP), minOrder, packagingFee, avgPrepTimeMins, upiId?, upiQrImageUrl?, isTemporarilyClosed.
- **VendorAccount** — id, vendorId→Vendor, email (unique), passwordHash, createdAt.
- **MenuCategory** — id, vendorId→Vendor, name, sortOrder.
- **MenuItem** — id, vendorId, categoryId→MenuCategory, name, description?, price, imageUrl?, isVeg, isAvailable.
- **CustomizationGroup** — id, menuItemId→MenuItem, name, type(single|multi), required, minSelect, maxSelect.
- **CustomizationOption** — id, groupId→CustomizationGroup, name, priceDelta.
- **Order** — id, userId, vendorId, status(enum: placed|accepted|preparing|ready_for_pickup|completed|cancelled|rejected), rejectionReason?, itemTotal, packagingFee, grandTotal, paymentMethod(cod), specialInstructions?, estimatedPrepMins, placedAt, statusTimeline[{status, at}].
- **OrderItem** — id, orderId→Order, menuItemId, nameSnapshot, qty, unitPrice, selectedOptions[{name, priceDelta}], itemNote?.
- **Review** — id, orderId→Order(unique), userId, vendorId, rating(1–5), text?, createdAt.
- **FoodFeedback** — id, orderId→Order?(optional, null for general feedback), userId, vendorId, foodQuality(1–5), hygiene(1–5), valueForMoney(1–5), itemComments?, comments?, isFlaggedForMvrc, createdAt.
- **MVRCReport** — id, vendorId→Vendor, rating, hygieneScore, foodQualityScore, complianceNotes?, correctiveActions?, reportUrl?(PDF link), assessmentDate, createdBy.
- **PromoCode** *(optional)* — id, code(unique), type(flat|percent), value, minOrder?, maxDiscount?, active, expiresAt?.
- **Favourite** — id, userId, vendorId (unique pair).

**Cart:** recommended **client-side** (persisted locally) and **validated server-side at checkout** — keeps the MVP simple while preventing stale prices/availability.

---

## 10. Key API Surface (REST, indicative)

```
Auth (Student)
  POST /auth/request-otp            { email } → validates @iima.ac.in, sends OTP
  POST /auth/verify-otp             { email, code } → token
  POST /auth/google                 { idToken } → validates domain, returns token

Auth (Vendor)
  POST /vendor/auth/login           { email, password } → token
  POST /vendor/auth/change-password { oldPassword, newPassword }

Profile
  GET    /me
  PATCH  /me

Discovery
  GET /vendors?openNow&veg&category&sort&q
  GET /vendors/:id                  (vendor + categories + items + options + MVRC info)
  GET /search?q=                    (vendors + dishes, respects veg filter)

Cart/Orders (Student)
  POST /orders/validate             (server price/availability check)
  POST /orders                      (place order)
  GET  /orders
  GET  /orders/:id
  POST /orders/:id/cancel
  POST /orders/:id/review           { rating, text }
  POST /orders/:id/feedback         { foodQuality, hygiene, valueForMoney, itemComments, comments, flagForMvrc }
  GET  /vendors/:id/upi-details     (QR code URL + UPI ID for payment page)

General Feedback
  POST /vendors/:id/feedback        { foodQuality, hygiene, valueForMoney, comments, flagForMvrc }

Promos (optional)
  GET /promos/validate?code=&subtotal=

Favourites
  GET/POST/DELETE /favourites

MVRC
  GET /vendors/:id/mvrc-reports     (list of MVRC reports for a vendor)
  GET /mvrc-reports/:id             (single report detail)

--- Vendor Portal APIs ---

Vendor Orders
  GET  /vendor/orders?status=&date=
  GET  /vendor/orders/:id
  POST /vendor/orders/:id/accept
  POST /vendor/orders/:id/reject    { reason }
  POST /vendor/orders/:id/preparing
  POST /vendor/orders/:id/ready
  POST /vendor/orders/:id/complete

Vendor Menu
  GET    /vendor/menu                (categories + items)
  POST   /vendor/categories
  PATCH  /vendor/categories/:id
  DELETE /vendor/categories/:id
  POST   /vendor/items
  PATCH  /vendor/items/:id
  DELETE /vendor/items/:id
  PATCH  /vendor/items/:id/availability  { isAvailable }

Vendor Profile
  GET   /vendor/profile
  PATCH /vendor/profile              (name, description, image, UPI details, hours, fees)

Vendor Dashboard
  GET /vendor/dashboard/summary      (today's stats)
  GET /vendor/dashboard/popular-items

Vendor Feedback
  GET /vendor/reviews                (student reviews)
  GET /vendor/feedback               (food feedback submissions)
```

---

## 11. Non-Functional Requirements

- **PWA & Installable:** Manifest with icons, service worker for caching, "Add to Home Screen" prompt. Works great on phones, functional on desktop.
- **Performance:** Home interactive < 2s on campus Wi‑Fi; skeleton loaders; lazy-load images.
- **Reliability:** Graceful handling of closed vendors, sold-out items, and network failures.
- **Security:** Hashed passwords, JWT auth, server-side validation of prices/availability, OTP rate-limit throttling, parameterized DB access. Email domain validated both client-side and server-side.
- **Accessibility:** Legible type sizes, adequate contrast, tap targets ≥ 44px, clear veg/non-veg indicators not relying on color alone (use the dot + label).
- **Resilience:** Cart persists locally; safe retries on network errors.

---

## 12. Suggested Tech Stack

- **Frontend:** React (Vite) or **Next.js**, **TypeScript**, **Tailwind CSS**, React Query for data, a light store (Zustand) for cart. PWA manifest + service worker (e.g., Workbox).
- **Backend:** Next.js API routes **or** Node/Express, TypeScript.
- **DB/ORM:** **PostgreSQL + Prisma** (or SQLite via Prisma for a zero-setup MVP).
- **Auth (Student):** JWT + email OTP (mock provider interface, pluggable to SendGrid/Resend) + Google OAuth 2.0 (domain-restricted).
- **Auth (Vendor):** JWT + email/password (bcrypt).
- **Payments:** None — COD only. UPI details are informational (stored as vendor profile fields, displayed to student).
- **Deploy:** Vercel/Render or any single-host setup.

Keep it a **single repo, single deployable** for the MVP. Vendor portal can be a separate route group (e.g., `/vendor/...`) within the same app.

---

## 13. Seed Data (for a demoable MVP)

Seed ~6 vendors with realistic menus so the app is usable on first run. **Replace placeholder names with the real campus vendors.**

- **Mess Café** (placeholder) — thali, parathas, beverages — veg-heavy, pickup.
- **Roll & Wrap Corner** — rolls/wraps, fries — veg + non-veg.
- **Chai & Maggi Point** — Maggi variants, chai, snacks — late-night, pickup.
- **Shakes & Juices Counter** — shakes, juices, cold coffee — veg.
- **Late-Night Bites** — burgers, sandwiches, momos — open till late.
- **South Express** — dosa/idli/uttapam — veg.

Each: 2–4 categories, 5–10 items, a couple of items with customization groups (size/add-ons), realistic prices, mixed availability, varied open hours so "open now" filtering is demonstrable.

Also seed:
- **1–2 vendor accounts** with login credentials for testing the vendor portal.
- **Sample MVRC reports** (1 per vendor) with hygiene/quality scores and a dummy PDF link.
- **UPI details** for each vendor (dummy UPI IDs and placeholder QR code images).

---

## 14. UX & Design Principles

- **One accent color**, clean neutral surfaces, generous whitespace, friendly rounded cards.
- **Thumb-first:** Primary actions reachable at the bottom; sticky cart and CTA bars.
- **Minimal taps:** Add directly when no options; sheet only when needed.
- **Obvious veg/non-veg** everywhere (dot + label). Veg-only toggle is prominent and persistent.
- **Helpful empty/loading/error states** — never a blank screen.
- **Honest status** — show prep time and current stage clearly.
- **Transparency:** MVRC ratings and report links are never hidden — they build trust.
- Avoid clutter: no feature on a screen that doesn't serve "find food → order → pickup."
- **Vendor portal:** Functional over flashy. Clear order queue, big action buttons, minimal clicks to accept/mark ready.

---

## 15. Build Plan (suggested milestones)

1. **Setup:** Repo, stack, DB schema (including vendor tables), seed script, mock auth (email OTP + Google OAuth stub).
2. **Browse (read-only):** Home/discovery with veg-only toggle, search & filters, vendor page & menu with dual ratings.
3. **Order (student):** Customization sheet, cart, checkout (COD + UPI QR page), order placement + confirmation.
4. **Vendor portal — core:** Vendor login, order queue (accept/reject/mark ready/complete), basic dashboard.
5. **Vendor portal — management:** Menu CRUD, availability toggle, operating hours, profile/UPI settings.
6. **Track & repeat:** Order tracking (pickup timeline), order history, reorder.
7. **Rate & feedback:** User reviews, MVRC rating display + report links, food feedback form.
8. **Polish:** Favourites, notifications (in-app), empty/error states, PWA manifest + service worker, responsiveness, accessibility pass, QA against acceptance criteria.

Ship each milestone as a working slice.

---

## 16. Future Phases (post-MVP)

Delivery & delivery-partner app + live GPS tracking · Online payment gateway (Razorpay/UPI auto-verify) · Group & split ordering · Scheduled/pre-orders · Wallet & loyalty · Push/SMS notifications · Real OTP via SMS/email provider · Promo engine & campaigns · In-app support chat · Full admin dashboard · Analytics dashboard (vendor + admin) · Vendor self-registration · Multi-campus support · Saved addresses (for delivery).

---

## 17. Open Questions (resolved & remaining)

### Resolved in v2
| # | Question | Decision |
|---|----------|----------|
| 1 | Platform | PWA — installable web app |
| 2 | Payments | COD only + UPI QR/details page (informational) |
| 3 | Auth | IIMA email OTP + Google OAuth (domain-restricted) |
| 4 | Delivery | Deferred to v2; pickup only |
| 5 | Vendor app | In scope for MVP as a web portal |
| 6 | Ratings | Dual: user reviews + MVRC committee ratings with report links |

### Remaining
1. **Real vendors** — Can you share the actual vendor + menu list to seed, or should placeholders stand for now?
2. **MVRC reports** — Will MVRC upload reports as PDFs, or should the app host a structured report page? Who maintains these?
3. **UPI details** — Is there a single CampusEats UPI ID, or does each vendor have their own? *(Defaulted to per-vendor.)*
4. **Google Cloud project** — Is there an existing GCP project under IIMA's Workspace for Google OAuth, or do we create a new one?
5. **Vendor credentials** — Who manages vendor account creation? An admin, or should a lightweight admin panel be included?

*Defaults in §3 are used until you say otherwise.*
