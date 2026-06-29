# CampusEats API Reference

> **For Agent B (Frontend)**: All API endpoints return a standardized JSON format:
> Success: `{ "success": true, "data": { ... } }`
> Error: `{ "success": false, "error": { "message": "..." } }`

## 1. Authentication (Student)

- **`POST /api/auth/request-otp`**
  - **Body**: `{ "email": "student@iima.ac.in" }`
  - **Response**: `{ message: "OTP sent" }`

- **`POST /api/auth/verify-otp`**
  - **Body**: `{ "email": "student@iima.ac.in", "code": "123456" }`
  - **Response**: `{ token: "jwt...", user: { id, name, email }, isNewUser: boolean }`

- **`POST /api/auth/google`**
  - **Body**: `{ "idToken": "google_jwt_token" }`
  - **Response**: `{ token: "jwt...", user: { id, name, email }, isNewUser: boolean }`

## 2. Authentication (Vendor)

- **`POST /api/vendor/auth/login`**
  - **Body**: `{ "email": "vendor@campuseats.in", "password": "password" }`
  - **Response**: `{ token: "jwt...", vendor: { id, name, email } }`

- **`POST /api/vendor/auth/change-password`**
  - **Header**: `Authorization: Bearer <vendor_token>`
  - **Body**: `{ "oldPassword": "...", "newPassword": "..." }`

## 3. Discovery & Browse

- **`GET /api/vendors`**
  - **Query Params**: `openNow` (true/false), `veg` (true/false), `category` (string), `sort` (rating, prepTime, price), `q` (search)
  - **Returns**: Array of vendors with `isOpen`, `nextOpenTime`, and `cuisineTags`.

- **`GET /api/vendors/[id]`**
  - **Query Params**: `veg` (true/false)
  - **Returns**: Full vendor profile, `categories` (with items and `customizationGroups`), `latestMvrcReport`, `upi`.

- **`GET /api/search`**
  - **Query Params**: `q` (required), `veg` (true/false)
  - **Returns**: `{ vendors: [...], dishes: [...] }`

- **`GET /api/favourites`**
  - **Header**: `Authorization: Bearer <student_token>`
  - **Returns**: Array of favourite vendors.

- **`POST /api/favourites`**
  - **Body**: `{ "vendorId": "uuid" }`

- **`DELETE /api/favourites?vendorId=uuid`**

## 4. Ordering

- **`POST /api/orders`**
  - **Header**: `Authorization: Bearer <student_token>`
  - **Body**: `{ vendorId, specialInstructions?, items: [{ menuItemId, qty, selectedOptions: [{ name, priceDelta }], itemNote? }] }`
  - **Returns**: Created order with `statusTimeline`.

- **`GET /api/orders`**
  - **Header**: `Authorization: Bearer <student_token>`
  - **Returns**: Array of user's orders (newest first).

- **`GET /api/orders/[id]`**
  - **Returns**: Order detail with items and vendor info.

- **`POST /api/orders/[id]/cancel`**
  - **Returns**: Cancelled order.

## 5. Vendor Portal

All routes require `Authorization: Bearer <vendor_token>`.

- **Dashboard**: `GET /api/vendor/dashboard?type=summary|popular-items`
- **Orders List**: `GET /api/vendor/orders?status=&date=`
- **Order Detail**: `GET /api/vendor/orders/[id]`
- **Order Actions**: `POST /api/vendor/orders/[id]/accept` (also `/reject`, `/preparing`, `/ready`, `/complete`)
- **Profile**: `GET /api/vendor/profile` and `PATCH /api/vendor/profile`
- **Menu Categories**: 
  - `GET /api/vendor/menu`
  - `POST /api/vendor/categories`
  - `PATCH /api/vendor/categories/[id]`
  - `DELETE /api/vendor/categories/[id]`
- **Menu Items**:
  - `POST /api/vendor/items`
  - `PATCH /api/vendor/items/[id]`
  - `DELETE /api/vendor/items/[id]`
  - `PATCH /api/vendor/items/[id]/availability` (body: `{ isAvailable: boolean }`)
- **Feedback**: `GET /api/vendor/reviews` and `GET /api/vendor/feedback`

## 6. Reviews & Feedback

- **`POST /api/orders/[id]/review`**
  - **Body**: `{ rating: 1-5, text?: "" }`

- **`POST /api/orders/[id]/feedback`**
  - **Body**: `{ foodQuality: 1-5, hygiene: 1-5, valueForMoney: 1-5, itemComments?: "", comments?: "", flagForMvrc: boolean }`

- **`POST /api/vendors/[id]/feedback`** (General feedback, no order)
  - **Body**: same as above.

## Notes for Frontend (Agent B):
- Prices are stored in **paise** (integers). Divide by 100 to show Rupees.
- Pass the token in the headers for protected routes: `Authorization: Bearer <token>`
- JSON fields (`cuisineTags`, `openHours`, `statusTimeline`, `selectedOptions`) are parsed and returned as objects automatically by the API responses.
- Test accounts:
  - Student: `arjun.sharma@iima.ac.in` (Mock OTP is `123456`)
  - Vendor: `messcafe@campuseats.in` / `vendor123`
