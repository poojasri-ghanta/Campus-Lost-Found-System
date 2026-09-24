# 🎓 Campus Lost & Found – Verified Item Recovery Platform

> A production-style, enterprise-grade full-stack **MERN** (MongoDB, Express, React, Node.js) web application designed specifically for university campuses. Unlike basic CRUD demo projects, this platform introduces **Progressive Information Disclosure**, a **Rule-Based Ownership Verification Engine**, **Algorithmic Multi-Factor Item Matching**, **Admin Dispute Adjudication**, and **Two-Party Cryptographic PIN Handovers**.

---

## 🌟 Core Architecture & Key Differentiators

### 1. 🛡️ Progressive Information Disclosure (Zero-Leakage Security)
- **Public Tier (Concealed)**: When a finder reports an item, only high-level sanitized information is visible to the campus registry (Category, general title, public color, general campus zone, date found, public photo).
- **Private Tier (Confidential)**: Sensitive identifying characteristics (exact model/brand, serial numbers, case stickers, hairline scratches, lock screen wallpaper, specific compartment contents, secret marks) are strictly concealed from public API responses.
- **Why it matters**: Prevents malicious claimants from glancing at a listing and claiming someone else's expensive laptop, smartphone, or wallet.

### 2. 🧠 Rule-Based Ownership Verification Engine
- Claimants must prove legitimate ownership by answering dynamic questionnaires formulated around the item's private markers.
- Evaluates submitted answers against concealed private details and computes a weighted confidence score (0–100%):
  - **Category Match**: 25 pts
  - **Campus Location Proximity**: 20 pts
  - **Date Proximity**: 15 pts
  - **Color Match**: 10 pts
  - **Brand / Model Accuracy**: 10 pts
  - **Private Identifier Correlation**: 20 pts
- Categorizes confidence into actionable decision tiers:
  - 🟢 **Strong Match** (`80–100%`)
  - 🟡 **Needs Review** (`60–79%`)
  - 🔴 **Low Confidence** (`< 60%`)

### 3. ⚡ Multi-Factor Algorithmic Matching Engine
- Runs automatic cross-correlation between reported Lost items and Found items.
- Analyzes 6 weighted vectors: Category (25%), Location (20%), Date Proximity (20%), Color (10%), Brand (10%), and Description keyword overlap (15%).
- Provides detailed transparency breakdown explaining *why* the system identified a correlation.

### 4. 🤝 Two-Party Handover Verification Workflow
- Upon claim approval, the system schedules a physical meetup at designated secure campus spots (Main Library Front Desk, Campus Security, Student Union).
- Generates a unique tracking reference (e.g. `LF-2026-48291`) and a **6-digit cryptographic PIN** (e.g. `739214`).
- Physical item handoff requires mutual confirmation and code verification before transitioning status to `RETURNED` and closing the case.

### 5. ⚖️ Multi-Claimant Dispute Resolution Workbench
- If multiple individuals submit conflicting claims on the same high-value item, the platform automatically flags the item as `DISPUTED`.
- Administrators can compare competing claimants side-by-side (timestamps, verified questionnaire answers, evidentiary receipts, match ratings) and authoritatively award ownership.

### 6. 📜 Forensic Audit Trails & Campus Analytics
- Immutable logging of every report, claim submission, review action, dispute resolution, and handover event.
- Visual charts of lost/found distribution by category, campus hotspot heatmaps, and recovery turnaround metrics.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons, React Router v6, Axios, Context API (Auth, Toast, Notifications).
- **Backend**: Node.js, Express.js REST APIs, JSON Web Tokens (JWT), bcryptjs password hashing, Multer file handling, Express Validator.
- **Database**: MongoDB & Mongoose ODM (with automatic in-memory fallback for zero-config local operation).

---

## 📂 Project Structure

```
Lost&Found-system/
├── client/                           # React 18 + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Navbar, Sidebar, Modal, Badge, Button, Pagination...
│   │   │   ├── items/                # ItemCard, SearchBar, FilterPanel, MatchBadge...
│   │   │   ├── claims/               # VerificationModal, ClaimReviewDrawer, DisputeModal...
│   │   │   └── handovers/            # HandoverVerificationCard, HandoverScheduleModal...
│   │   ├── context/                  # AuthContext, ToastContext, NotificationContext
│   │   ├── layouts/                  # MainLayout, AuthLayout
│   │   ├── pages/                    # 16 Complete Application Pages
│   │   │   ├── admin/                # AdminDashboard, Disputes, Users, AuditLogs, Analytics
│   │   │   ├── LandingPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LostItemsPage.jsx / LostItemDetailPage.jsx / ReportLostItemPage.jsx
│   │   │   ├── FoundItemsPage.jsx / FoundItemDetailPage.jsx / ReportFoundItemPage.jsx
│   │   │   ├── MatchesPage.jsx
│   │   │   ├── ClaimsPage.jsx / ClaimDetailPage.jsx
│   │   │   ├── HandoversPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── routes/                   # ProtectedRoute, RoleBasedRoute
│   │   ├── services/                 # Axios API client
│   │   └── utils/                    # Constants, formatters, status tokens
│   ├── package.json
│   └── vite.config.js
│
├── server/                           # Express REST API Backend
│   ├── config/                       # Mongoose db connection & JWT config
│   ├── controllers/                  # Auth, LostItem, FoundItem, Claim, Match, Handover, Admin
│   ├── middleware/                   # Auth, Role Authorization, Validator, ErrorHandler, Upload
│   ├── models/                       # 9 Mongoose Schemas (User, Lost, Found, Claim, Match, Handover...)
│   ├── routes/                       # Express REST API endpoints
│   ├── services/                     # MatchingEngine, VerificationEngine, NotificationService, AuditService
│   ├── seed/                         # Realistic campus dataset seeder
│   ├── app.js                        # Express app setup
│   ├── server.js                     # Bootstrap & auto-seed server
│   └── package.json
│
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18+ or v20+ or v24+)
- npm

### 1. Install Dependencies
```bash
# In the root directory:
npm install --prefix server
npm install --prefix client
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/campus_lost_found
JWT_SECRET=super_secret_jwt_key_campus_recovery_platform_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*(Note: If a local MongoDB daemon is not running, the server automatically boots an in-memory database fallback so you can test immediately with zero extra installation!)*

### 3. Seed Realistic Campus Data
```bash
# Populates realistic users, items, claims, matches, handovers, notifications, and audit logs
npm run seed --prefix server
```

### 4. Start Development Servers
```bash
# Terminal 1 - Start Backend API (Port 5000)
npm run dev --prefix server

# Terminal 2 - Start Frontend React Client (Port 5173)
npm run dev --prefix client
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Pre-Configured Demo Accounts

All accounts use the password: **`Password123!`**

| Name | Role | Email | Purpose / Perspective |
| :--- | :--- | :--- | :--- |
| **Dr. Marcus Vance** | `ADMIN` | `admin@campus.edu` | Campus Ops, Dispute Adjudication, User Governance, Audit Logs |
| **Campus Police Desk** | `ADMIN` | `security.desk@campus.edu` | Department of Public Safety oversight |
| **Alex Rivers** | `STUDENT` | `alex.rivers@campus.edu` | Student with reported lost MacBook Pro & matching alert |
| **Sam Chen** | `FINDER` | `sam.chen@campus.edu` | Finder who recovered Dark Gray Laptop, ID card, and Wallet |
| **Jessica Taylor** | `STUDENT` | `jessica.taylor@campus.edu` | Claimant in active dispute over Sony Headphones & scheduled ID handover |
| **David Miller** | `STUDENT` | `david.miller@campus.edu` | Claimant who submitted 95% Strong Match claim on brown leather wallet |
| **Priya Patel** | `FINDER` | `priya.patel@campus.edu` | Finder who recovered Galaxy smartphone & disputed headphones |

*(You can also use the one-click instant demo profile buttons directly on the login and landing pages!)*

---

## 📡 REST API Documentation

### 🔐 Authentication
- `POST /api/auth/register` — Register student/finder account
- `POST /api/auth/login` — Sign in and retrieve JWT token
- `GET /api/auth/me` — Retrieve current authenticated session
- `PUT /api/auth/profile` — Update user profile details

### 📦 Lost & Found Items
- `GET /api/lost-items` — Browse lost items with search & category filters
- `POST /api/lost-items` — Submit lost item report (triggers auto-matching)
- `GET /api/lost-items/:id` — Inspect lost report and correlated suggestions
- `GET /api/found-items` — Browse found items (sanitized public view)
- `POST /api/found-items` — Register found item with progressive disclosure keys
- `GET /api/found-items/:id` — Get found item details (includes dynamic verification quiz)

### 🧩 Smart Matching
- `GET /api/matches` — Get algorithmic matches for user's lost reports
- `GET /api/matches/:id` — Inspect telemetry factor breakdown
- `POST /api/matches/generate` — Trigger on-demand matching engine scan
- `PUT /api/matches/:id/dismiss` — Dismiss false positive match

### 📝 Ownership Claims & Verification
- `POST /api/claims` — Submit ownership claim with questionnaire answers
- `GET /api/claims/my` — List submitted claims with verification scores
- `GET /api/claims/:id` — Get claim details, answers, and timeline
- `PUT /api/claims/:id/review` — Finder/Admin approves, rejects, or requests more info
- `POST /api/claims/:id/more-info` — Claimant submits requested clarification

### 🤝 Handovers & 6-Digit PIN
- `POST /api/handovers` — Schedule handover meeting and generate 6-digit PIN
- `GET /api/handovers` — List scheduled/completed handovers
- `GET /api/handovers/:id` — Get handover session record
- `PUT /api/handovers/:id/confirm` — Validate 6-digit PIN and mark item as `RETURNED`

### 🛡️ Administrative Console (Role: `ADMIN`)
- `GET /api/admin/dashboard` — Platform KPIs, active cases, and recovery rates
- `GET /api/admin/disputes` — Multi-claimant dispute resolution queue
- `POST /api/admin/disputes/:itemId/resolve` — Authoritatively award item to rightful owner
- `GET /api/admin/users` — User account management and suspensions
- `PUT /api/admin/users/:id` — Update role permissions or suspend user
- `GET /api/admin/audit-logs` — Searchable forensic event trails
- `GET /api/admin/analytics` — Campus category, location, and monthly trend graphs

---

## 🔒 Security & Privacy Practices

1. **Password Encryption**: All passwords salted and hashed using `bcryptjs` (10 rounds).
2. **Role-Based Middleware (`RBAC`)**: Express route guards restrict administrative endpoints to verified `ADMIN` roles.
3. **Data Sanitization**: `passwordHash` is excluded from user models; `privateDetails` are strictly excluded from general Found Item queries via Mongoose projection and `toPublicJSON()` transforms.
4. **Dispute Protection**: Items receiving multiple claims are automatically quarantined into dispute status to prevent unauthorized releases.

---

## 📄 License
MIT License. Built for University Campus Recovery Operations.
