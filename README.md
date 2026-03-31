# RetailFlow 🚀

**Smart Retail & Inventory Management System for Indian Businesses**

RetailFlow is a full-stack SaaS POS and business management platform built for modern Indian retailers. It replaces notebooks, spreadsheets, and manual calculations with a fast, clean, and intelligent system.

---

## ✨ Features

| Feature | Description |
|---|---|
| ⚡ **Fast POS Billing** | Bill customers in seconds with split payments (Cash / UPI / Udhaar) and auto-generated invoices with QR codes |
| 📖 **Digital Khata** | Track udhaar digitally, send WhatsApp payment reminders with UPI links, set per-customer credit limits |
| 📦 **Smart Inventory** | Batch tracking, expiry date alerts, low stock warnings, dead stock detection |
| 📊 **Profit Analytics** | Daily/monthly revenue, profit trends, top-selling items, payment split breakdown |
| 💸 **Expense Tracker** | Log business costs by category to calculate accurate net profit |
| 🚚 **Supplier Management** | Record purchase orders, auto-update stock, track supplier dues |
| 👥 **Staff Management** | Add cashiers/managers with role-based access and custom module permissions |
| 🤖 **AI Business Insights** | Groq-powered LLM analyzes your shop data and gives actionable Hindi-English advice |
| 🧾 **Professional Invoices** | PDF invoices with shop logo, signature, UPI QR code, and GST details |
| 🔐 **Secure Auth** | OTP login (email/phone), password login, JWT sessions, bcrypt-hashed PINs |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS v4
- Recharts (analytics charts)
- React Router v6
- Sonner (toast notifications)
- jsPDF + jspdf-autotable (PDF generation)
- qrcode.react (UPI QR codes)
- React Hook Form + Zod (settings validation)
- ImageKit (logo/signature uploads)

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication
- bcryptjs (password/PIN hashing)
- Groq SDK (LLaMA 3.1 AI insights)
- Resend (transactional email / OTP)
- ImageKit SDK (file uploads)
- Express Rate Limiter + Helmet

---

## 📁 Project Structure

```
retailflow/
├── retailflow-backend/
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middlewares/    # Auth, error handler, rate limiter
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   └── utils/          # Cache, Groq client, reminder cron
│   ├── app.js
│   └── server.js
│
└── retailflow-frontend/
    └── src/
        ├── api/            # Axios instance + API calls
        ├── assets/         # Fonts, images
        ├── components/     # Navbar, Sidebar, Topbar, landing sections
        └── pages/
            ├── auth/       # Login, Signup
            └── dashboard/  # All dashboard modules
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas URI (or local MongoDB)
- Groq API key
- Resend API key
- ImageKit account

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/retailflow.git
cd retailflow
```

### 2. Backend Setup

```bash
cd retailflow-backend
npm install
```

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
GROQ_API_KEY=your_groq_api_key
RESEND_API_KEY=your_resend_api_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd retailflow-frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
```

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🔑 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new shop |
| POST | `/api/v1/auth/login-password` | Login with email + password |
| POST | `/api/v1/auth/send-otp` | Send OTP to email or phone |
| POST | `/api/v1/auth/verify-otp` | Verify OTP and get token |
| POST | `/api/v1/auth/staff-login` | Staff login with phone + PIN |
| GET | `/api/v1/items` | Get all inventory items |
| POST | `/api/v1/items` | Add new item |
| POST | `/api/v1/sales` | Create a sale (atomic transaction) |
| GET | `/api/v1/reports/dashboard` | Dashboard analytics aggregation |
| GET | `/api/v1/customers` | Get all customers |
| PUT | `/api/v1/customers/:id` | Update customer / record payment |
| POST | `/api/v1/suppliers/:id/purchase` | Record purchase + update stock |
| POST | `/api/v1/ai/generate` | AI business insight (Groq) |

---

## 🏗️ Architecture Highlights

- **Atomic Sales Transactions** — MongoDB sessions ensure stock deduction and sale creation are atomic, preventing inconsistency
- **In-Memory Cache** — TTL-based cache layer on items, customers, staff, and sales reduces redundant DB reads
- **Bulk DB Operations** — `Promise.all` for parallel saves, `bulkWrite` for reminder cron updates
- **Role-Based Access Control** — `protect` middleware + `authorize(...roles)` guard all sensitive routes
- **OTP Security** — OTPs are SHA-256 hashed before storage; never stored in plain text

---

## 📱 User Roles

| Role | Access |
|---|---|
| **Owner** | Full access to all modules + settings + staff management |
| **Manager** | POS, Inventory, Khata, Expenses, Suppliers, Reports |
| **Cashier** | POS and Khata only |

---

## 🌐 Deployment

**Backend** — Deploy to Railway, Render, or any Node.js host. Set all environment variables from the `.env` template above.

**Frontend** — Deploy to Vercel or Netlify. Set `VITE_API_URL` to your backend's production URL.

---

## 📄 License

MIT License — feel free to use and modify.

---

## 🙏 Acknowledgements

Built with ❤️ for Indian retailers. Powered by Groq (LLaMA 3.1), MongoDB, and the open-source ecosystem.
