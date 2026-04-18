# RetailFlow

**Multi-tenant SaaS POS & Inventory Management System for Indian Retailers**

RetailFlow is a production-ready, multi-tenant backend system designed to handle real-world retail operations with scalable architecture and optimized performance. It handles billing, inventory, credit management, analytics, and AI-powered business insights for multiple isolated retail shops on a single system.

---

## 🧠 Problem it Solves

Small retail businesses in India often rely on fragmented tools or manual methods to manage inventory, billing, and credit (udhaar).

RetailFlow provides a unified platform to:

* Manage billing, inventory, and credit in one system
* Track real-time business performance
* Handle multiple shops with secure data isolation

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

## 🔄 System Flow

User → POS Billing → Sale API
→ MongoDB Transaction (Sale + Inventory + Khata update)
→ Aggregation Pipeline → Dashboard Response

---

## ⚡ Technical Highlights

* **Multi-tenant architecture** — complete data isolation per shop using `shopId` scoping across all models
* **Dashboard performance** — aggregation endpoint optimized from ~9s to <150ms using `$facet` pipeline, compound indexes on `shopId + createdAt`, `.lean()` reads, and field projection
* **Atomic transactions** — MongoDB sessions used for sale + inventory + khata updates to prevent data inconsistency
* **RBAC** — Owner / Manager / Cashier roles with middleware-level route protection
* **Security** — JWT auth, bcrypt hashing, rate limiting, Helmet.js, CORS, NoSQL injection prevention
* **Third-party integrations** — ImageKit (media uploads), Resend (OTP emails), Groq AI (LLaMA 3.1 insights)
* **PDF invoice generation** — dynamic invoices with shop branding, QR codes, and GST details

---

## ⚔️ Challenges & Learnings

* Designing a multi-tenant architecture with strict data isolation
* Handling atomic updates across sales, inventory, and credit systems
* Optimizing slow aggregation queries (~9s → <150ms)
* Managing async API flows in POS billing system

---

## 🚀 Future Scalability

* Introduce Redis caching for frequently accessed data
* Move analytics to background jobs using queues
* Break system into microservices (Auth, Billing, Analytics)
* Enable horizontal scaling using load balancers

---

## 📸 Screenshots

### 📊 Dashboard

Shows revenue trends and key business insights
![Dashboard](./screenshots/dashboard.png)

### 📈 Analytics

Displays sales performance and top-selling products
![Analytics](./screenshots/analytics.png)

### 📦 Inventory

Track stock levels and manage product inventory
![Inventory](./screenshots/inventory.png)

### 🧾 Invoice

Auto-generated professional invoice with GST and QR code
![Invoice](./screenshots/invoice.png)

### 🏠 Landing Page

Entry point showcasing product overview and features
![Landing](./screenshots/landingPage.png)

### ⚡ POS Billing

Handles real-time billing with split payment support
![POS](./screenshots/pos.png)

### ⚙️ Settings

Manage shop configuration and preferences
![Settings](./screenshots/settings.png)

---

## 🛠️ Tech Stack

### Frontend

* React 18 + Vite
* Tailwind CSS
* Recharts
* React Router
* React Hook Form + Zod
* jsPDF + QR Code

### Backend

* Node.js + Express.js
* MongoDB + Mongoose
* JWT + Refresh Token Auth
* bcrypt
* Groq AI (LLaMA 3.1)
* Resend (OTP emails)
* ImageKit (media uploads)

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

| Method | Endpoint             | Description                      |
| ------ | -------------------- | -------------------------------- |
| POST   | /auth/register       | Register new shop (multi-tenant) |
| POST   | /auth/login-password | Login with password              |
| POST   | /auth/send-otp       | Send OTP                         |
| POST   | /auth/verify-otp     | Verify OTP & issue JWT           |
| POST   | /auth/refresh-token  | Refresh token                    |
| GET    | /items               | Get inventory                    |
| POST   | /items               | Add item                         |
| POST   | /sales               | Create sale (atomic)             |
| GET    | /reports/dashboard   | Dashboard analytics              |
| GET    | /ai/insights         | AI suggestions                   |

---

## 🌐 Deployment

* Frontend → Vercel
* Backend → Render

---

## 📄 License

MIT License
