# Outlier Services

> **An internal VAC (Visa Application Centre) service booking and transaction management tool built for VFS operations staff.**

Outlier Services is a full-stack web application that allows VFS operators to select a country & VAC, add ancillary services to a cart, choose a payment mode, and complete a checkout — with all transactions persisted to a cloud database and available for session-based history review.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Run Both Servers](#4-run-both-servers)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [User Flow](#user-flow)
- [Key Design Decisions](#key-design-decisions)
- [Known Limitations & Open Items](#known-limitations--open-items)

---

## Overview

Outlier Services replaces a manual (paper/spreadsheet) VAC service billing process with a real-time web application. Operators can:

- **Browse & select** services specific to a country and VAC centre
- **Build a cart** with quantity controls and live price computation
- **Choose a payment mode** (filtered by the selected country's currency)
- **Check out** — generating a persistent transaction record in MongoDB Atlas
- **View transaction history** for the current session, grouped by checkout batch

---

## Architecture

```
┌─────────────────────────┐          ┌───────────────────────────────┐
│     outlier-frontend    │  REST    │      outlier-backend          │
│  Next.js 16 (App Router)│ ◄──────► │  Express 4 + Mongoose 8       │
│  TypeScript + Tailwind  │  :5000   │  MongoDB Atlas                │
│  :3000                  │          │                               │
└─────────────────────────┘          └───────────────────────────────┘
```

- **Frontend** is a Next.js 16 (App Router) app running on `localhost:3000`.
- **Backend** is a standalone Express REST API running on `localhost:5000`.
- They communicate via `NEXT_PUBLIC_API_URL` on the frontend side and `CORS_ORIGIN` on the backend side.
- **No authentication** — this is an internal operator tool with open session access.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, inline React styles |
| State Management | React Context (`AppContext`) + `useState` |
| Backend Framework | Node.js, Express 4 |
| Database | MongoDB Atlas (cloud-hosted) |
| ODM | Mongoose 8 |
| API Style | REST (JSON) |
| Dev Server | `nodemon` (backend), `next dev` (frontend) |

---

## Project Structure

```
outlier-services/
├── outlier-backend/            # Express + MongoDB REST API
│   ├── config/
│   │   └── db.js               # Mongoose Atlas connection
│   ├── controllers/            # Business logic per resource
│   ├── models/                 # Mongoose schemas
│   │   ├── Region.js
│   │   ├── Currency.js
│   │   ├── Country.js
│   │   ├── VAC.js
│   │   ├── Service.js
│   │   ├── PaymentMode.js
│   │   ├── Transaction.js      # One doc per checkout; embeds Line_Items[]
│   │   └── Counter.js          # Atomic sequence generator for Transaction_ID
│   ├── routes/                 # Express routers
│   ├── seed/
│   │   ├── seed.js             # Idempotent DB seeder
│   │   └── data/               # Master-data JSON files (source of truth)
│   │       ├── countries.json
│   │       ├── currencies.json
│   │       ├── payment-modes.json
│   │       ├── regions.json
│   │       ├── services.json
│   │       └── vacs.json
│   ├── server.js               # App entry point
│   ├── package.json
│   └── .env                    # Not committed — create from example below
│
└── outlier-frontend/           # Next.js frontend
    ├── app/
    │   ├── components/         # Feature components
    │   │   ├── CartSummary.tsx
    │   │   ├── CheckoutModal.tsx
    │   │   ├── CountryVACSelector.tsx
    │   │   ├── NewTransactionPage.tsx
    │   │   ├── PaymentSelector.tsx
    │   │   ├── ServicesList.tsx
    │   │   ├── TransactionHistory.tsx
    │   │   ├── layout/         # AppShell, Header, Sidebar
    │   │   └── ui/             # Reusable UI primitives
    │   ├── (dashboard)/        # New Transaction route
    │   ├── history/            # Transaction History page
    │   ├── services/           # Service Catalogue (Coming Soon)
    │   └── settings/           # Settings (Coming Soon)
    ├── context/
    │   └── AppContext.tsx       # Global state + checkout logic
    ├── lib/
    │   └── api.ts              # Typed API client (fetch wrappers)
    ├── types/
    │   └── index.ts            # TypeScript interfaces for all entities
    └── package.json
```

---

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- A **MongoDB Atlas** account and cluster (free tier works)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd outlier-services
```

### 2. Backend Setup

```bash
cd outlier-backend

# Install dependencies
npm install

# Create your environment file (see Environment Variables section below)
# Copy and fill in your Atlas URI
```

Create `outlier-backend/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/outlier_services?retryWrites=true&w=majority
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

Then seed and start:

```bash
# Seed the database with master data (idempotent — safe to re-run)
npm run seed

# Start the development server (auto-restarts on file changes)
npm run dev
```

The API will be available at **http://localhost:5000**.

### 3. Frontend Setup

```bash
cd outlier-frontend

# Install dependencies
npm install
```

Create `outlier-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Then start the frontend dev server:

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

### 4. Run Both Servers

You need **two terminals** running concurrently:

| Terminal | Directory | Command |
|---|---|---|
| 1 | `outlier-backend/` | `npm run dev` |
| 2 | `outlier-frontend/` | `npm run dev` |

---

## Environment Variables

### Backend (`outlier-backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/outlier_services?retryWrites=true&w=majority` |
| `PORT` | Port for the Express server | `5000` |
| `CORS_ORIGIN` | Allowed frontend origins (comma-separated) | `http://localhost:3000` |

### Frontend (`outlier-frontend/.env.local`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:5000` |

---

## API Reference

### Master Data (GET)

| Endpoint | Query Params | Response |
|---|---|---|
| `GET /api/countries` | — | `[{Country_Code, Country_Name, Region_Code, Currency_Code}]` |
| `GET /api/regions` | — | `[{Region_Code, Region_Name}]` |
| `GET /api/currencies` | — | `[{Currency_Code, Currency_Name, Currency_Symbol, Country_Code}]` |
| `GET /api/vacs` | `?country=IN` (optional) | `[{VAC_Code, VAC_Name, Country_Code}]` |
| `GET /api/services` | `?country=IN` (optional) | `[{Service_Code, Service_Name, Service_Type, Currency_Code, Unit_Price, Country_Code}]` |
| `GET /api/payment-modes` | `?currency=INR` (optional) | `[{Payment_Code, Payment_Name, Currency_Code}]` |

### Transactions

#### `POST /api/transactions`

Creates a new checkout transaction. **Prices are computed server-side** — the client never sends prices.

**Request body:**
```json
{
  "VAC_Code": "IN_DEL",
  "Country_Code": "IN",
  "Payment_Code": "UPI_INR",
  "Currency_Code": "INR",
  "line_items": [
    { "Service_Code": "SVC_XEROX_A4", "Quantity": 2 },
    { "Service_Code": "SVC_PHOTO",    "Quantity": 1 }
  ]
}
```

**Response:** Flat `TransactionRecord[]` array — one object per line item, all sharing `Batch_ID` / `Transaction_ID` / `Grand_Total`.

#### `GET /api/transactions/:id`

Retrieves a transaction by either the numeric `Transaction_ID` (e.g. `1001`) or the `Batch_ID` (e.g. `BATCH-1719999999999-1001`). Returns the same flat `TransactionRecord[]` shape.

---

## User Flow

```
New Transaction
  → Select Country & VAC
  → Add Services to Cart  (qty controls, live totals)
  → Choose Payment Mode
  → Confirm & Checkout
  → Success Modal (receipt with line items + Grand Total)
       → [Print]  or  [New Transaction]

Transaction History
  → View all session checkouts grouped by Batch_ID
```

### Pages

| Route | Description |
|---|---|
| `/` | New Transaction — 3-step checkout flow |
| `/history` | Session transaction history, grouped by batch |
| `/services` | Service catalogue — *Coming Soon* |
| `/settings` | App settings (currency default, session data) — *Coming Soon* |

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **Embedded `Line_Items[]`** | One checkout = one MongoDB document with embedded line items. Avoids extra joins; items are always read together. |
| **Server-side price computation** | `POST /api/transactions` looks up `Unit_Price` from the DB — the client can never tamper with prices. |
| **Atomic `Transaction_ID`** | A dedicated Mongo `Counter` collection with `$inc` ensures race-free sequential IDs across concurrent requests. |
| **`*_Code` fields as primary keys** | Frontend references entities by human-readable codes (e.g. `Country_Code`, `VAC_Code`). ObjectId `*_Ref` fields exist for internal Mongoose joins only. |
| **Session-local history** | `AppContext.transactions` holds only the current session's checkouts. A future list endpoint will enable persistent cross-session history. |
| **React key strategy** | Line items are keyed by `${Batch_ID}-${Service_Code}` (not `Transaction_ID` alone) because `Transaction_ID` is shared across all items in a batch. |

---

## Known Limitations & Open Items

- [ ] **`GET /api/transactions` (list)** — not built. `/history` only shows session checkouts, not prior sessions.
- [ ] **`/services` page** — may still import `services.json` statically; audit needed.
- [ ] **`defaultCurrencyCode`** in Settings — stored in context, but behaviour is display-only and undecided.
- [ ] **VAC-level service filtering** — `Service` schema only has `Country_Code`; no `VAC_Code` filter yet.
- [ ] **`Transaction_Status` flow** — only `Completed` is reachable; `Pending`/`Failed` are schema-supported but unused.
- [ ] **Authentication** — none; operator identity is display-only for now.
- [ ] **Print / PDF export** — `CheckoutModal` uses `window.print()`; no dedicated PDF/export path.
- [ ] **Pagination / date-range filtering** for Transaction History — blocked on the list endpoint above.
