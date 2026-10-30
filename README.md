# Sportika Global Sportswear — E-Commerce Platform

## 🏃 Project Overview
Full-stack e-commerce platform for Sportika Global Sportswear with React + Vite frontend and Node.js + Express + PostgreSQL backend.

---

## 📁 Project Structure
```
website/
├── frontend/       # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/    # Navbar, Footer, ProductCard, CartSidebar, MobileMenu
│   │   ├── pages/         # HomePage, ProductsPage, ProductDetailPage, CartPage,
│   │   │                  # CheckoutPage, LoginPage, RegisterPage, OrdersPage,
│   │   │                  # WishlistPage, ProfilePage, AdminDashboard
│   │   ├── store/         # Zustand stores (auth, cart, wishlist, UI)
│   │   ├── types/         # TypeScript interfaces
│   │   └── data/          # Mock data for development
│   └── package.json
│
└── backend/        # Node.js + Express + PostgreSQL
    ├── src/
    │   ├── routes/        # auth, products, orders, payment, admin, users, coupons
    │   ├── middleware/    # auth (JWT), error handling
    │   └── config/        # database.ts, migrate.ts
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials and Razorpay keys
npm install
npm run db:migrate    # Create database tables
npm run dev           # Start API server at http://localhost:5000
```

---

## 🎯 Features

### Customer Features
- 🏠 **Homepage** — Hero banner, flash sale countdown, category cards, featured/new/bestseller products, testimonials
- 🛍️ **Product Catalogue** — Search, filters (category, size, color, price), sorting, pagination
- 📦 **Product Detail** — Image gallery, size/color selector, reviews, size guide
- 🛒 **Cart** — Persistent cart (localStorage), coupon codes, order summary
- ❤️ **Wishlist** — Save products, move to cart
- 🔐 **Auth** — Login/Register with JWT tokens
- 📋 **Orders** — History with tracking timeline, cancel, return request
- 👤 **Profile** — Personal info, addresses, password change, notifications
- 💳 **Checkout** — 3-step: address → payment → review; Razorpay/UPI/COD

### Admin Features
- 📊 **Dashboard** — Revenue, orders, customers, products stats + charts
- 📦 **Products** — Full CRUD with image management
- 📋 **Orders** — Status management, tracking updates
- 👥 **Customers** — View all customers and spending
- 🏷️ **Coupons** — Create/manage discount codes
- ⚙️ **Settings** — Store configuration

---

## 💳 Payment Integration

### Razorpay Setup
1. Create account at https://razorpay.com
2. Get Test API keys from Dashboard > Settings > API Keys
3. Add to `backend/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_your_key
   RAZORPAY_KEY_SECRET=your_secret
   ```
4. For production, use Live keys and configure webhook:
   - URL: `https://yourdomain.com/api/payment/webhook`
   - Events: `payment.captured`, `payment.failed`

### Test Cards (Razorpay)
- Card: `4111 1111 1111 1111` | Expiry: any future | CVV: any
- UPI: `success@razorpay`
- Net Banking: Any

---

## 🗄️ Database Setup

```sql
-- Create database
CREATE DATABASE sportika_db;

-- Then run migrations:
npm run db:migrate
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Customer | any@email.com | 123456 (6+ chars) |
| Admin | admin@sportika.in | admin123 |

---

## 🌐 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Render/VPS)
```bash
npm run build
npm start
# Set environment variables in your hosting platform
```

### Environment Variables Required
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `FRONTEND_URL` | Your frontend URL for CORS |

---

## 📱 Responsive Design
- ✅ Mobile (320px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1200px+)
- ✅ Large Desktop (1400px+)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| State | Zustand (with localStorage persistence) |
| Styling | Vanilla CSS (custom design system) |
| Routing | React Router v6 |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| Auth | JWT (access + refresh tokens) |
| Payments | Razorpay |
| Security | Helmet, CORS, Rate Limiting, bcrypt |

---

*Built with ❤️ for Sportika Global Sportswear*
