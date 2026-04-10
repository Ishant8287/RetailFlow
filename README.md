# RetailFlow

**Multi-tenant SaaS POS & Inventory Management System for Indian Retailers**

RetailFlow is a production-ready, multi-tenant backend built from scratch — no Firebase, no shortcuts. It handles billing, inventory, credit management, analytics, and AI-powered business insights for multiple isolated retail shops on a single system.

---

## 🌐 Live Demo

🚀 **Frontend (Vercel)** → https://retail-flow-xi.vercel.app/

⚙️ **Backend API (Render)** → https://retailflow.onrender.com

📦 **GitHub** → https://github.com/Ishant8287/RetailFlow

---

## ✨ Features

| Feature                  | Description                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------ |
| ⚡ Fast POS Billing       | Bill customers with split payments (Cash / UPI / Udhaar) and auto-generated invoices |
| 📖 Digital Khata         | Track udhaar, send reminders, set credit limits                                      |
| 📦 Smart Inventory       | Batch tracking, expiry alerts, low stock warnings                                    |
| 📊 Profit Analytics      | Revenue trends, top-selling items, payment breakdown                                 |
| 💸 Expense Tracker       | Track business expenses and calculate net profit                                     |
| 🚚 Supplier Management   | Manage purchases and supplier dues                                                   |
| 👥 Staff Management      | Role-based access (Owner / Manager / Cashier)                                        |
| 🤖 AI Business Insights  | AI-based suggestions using Groq (LLaMA 3.1)                                          |
| 🧾 Professional Invoices | PDF invoices with QR codes & GST details                                             |
| 🔐 Secure Auth           | OTP-based login + JWT + refresh token flow                                           |

---

## ⚡ Technical Highlights

- **Multi-tenant architecture** — complete data isolation per shop using `shopId` scoping across all models
- **Dashboard performance** — aggregation endpoint optimized from ~9s to <150ms using `$facet` pipeline, compound indexes on `shopId + createdAt`, `.lean()` reads, and field projection
- **Atomic transactions** — MongoDB sessions used for sale + inventory + khata updates to prevent data inconsistency
- **RBAC** — Owner / Manager / Cashier roles with middleware-level route protection
- **Security** — JWT auth, bcrypt hashing, rate limiting, Helmet.js, CORS, NoSQL injection prevention
- **Third-party integrations** — ImageKit (media uploads), Resend (OTP emails), Groq AI (LLaMA 3.1 insights)
- **PDF invoice generation** — dynamic invoices with shop branding, QR codes, and GST details

---

## 📸 Screenshots

### 📊 Dashboard
![Dashboard](./screenshots/dashboard.png)

### 📈 Analytics
![Analytics](./screenshots/analytics.png)

### 📦 Inventory
![Inventory](./screenshots/inventory.png)

### 🧾 Invoice
![Invoice](./screenshots/invoice.png)

### 🏠 Landing Page
![Landing](./screenshots/landingPage.png)

### ⚡ POS Billing
![POS](./screenshots/pos.png)

### ⚙️ Settings
![Settings](./screenshots/settings.png)

---

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Recharts
- React Router
- React Hook Form + Zod
- jsPDF + QR Code

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + Refresh Token Auth
- bcrypt
- Groq AI (LLaMA 3.1)
- Resend (OTP emails)
- ImageKit (media uploads)

---

## 📁 Project Structure

```
retailflow/
├── retailflow-backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   └── utils/
│
└── retailflow-frontend/
    ├── components/
    ├── pages/
    ├── api/
    └── assets/
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Ishant8287/RetailFlow
cd retailflow
```

### 2. Backend Setup

```bash
cd retailflow-backend
npm install
```

Create `.env`:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
GROQ_API_KEY=your_key
RESEND_API_KEY=your_key
IMAGEKIT_PUBLIC_KEY=your_key
IMAGEKIT_PRIVATE_KEY=your_key
IMAGEKIT_URL_ENDPOINT=your_endpoint
```

Run:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd retailflow-frontend
npm install
```

Create `.env`:

```
VITE_API_URL=http://localhost:5000/api/v1
```

Run:

```bash
npm run dev
```

---

## 🔑 API Overview

| Method | Endpoint                    | Description                        |
| ------ | --------------------------- | ---------------------------------- |
| POST   | /auth/register              | Register new shop (multi-tenant)   |
| POST   | /auth/login-password        | Login with password                |
| POST   | /auth/send-otp              | Send OTP to registered email       |
| POST   | /auth/verify-otp            | Verify OTP and issue JWT           |
| POST   | /auth/refresh-token         | Refresh access token               |
| GET    | /items                      | Get inventory (shopId scoped)      |
| POST   | /items                      | Add inventory item                 |
| POST   | /sales                      | Create sale (atomic transaction)   |
| GET    | /sales                      | Get sales history                  |
| GET    | /reports/dashboard          | Aggregated dashboard analytics     |
| GET    | /reports/top-items          | Top selling items                  |
| GET    | /khata/:customerId          | Get customer credit ledger         |
| POST   | /expenses                   | Log business expense               |
| GET    | /suppliers                  | Get supplier list                  |
| GET    | /ai/insights                | AI-generated business suggestions  |

---

## 🌐 Deployment

- **Frontend** → Vercel
- **Backend** → Render

---

## 📄 License

MIT License
