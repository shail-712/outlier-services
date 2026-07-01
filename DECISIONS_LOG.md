# Outlier Services — Decisions Log

> Living document. Update this every time a chat locks in an architectural 
> or implementation decision. Re-upload to the project after every update 
> so all chats stay in sync. Newest entries at the top of each section.

---

## 🚨 UNRESOLVED CONFLICT — resolve before DB schema is finalized

**Transaction storage shape** — two different decisions exist in the log history:

- Earlier decision: one checkout = **ONE Transaction document** with an **embedded array** of line items
- Build session (v1–v5): one checkout = **one `Batch_ID`** + **N separate `TransactionRecord` rows** (one doc per line item, grouped by shared `Batch_ID`)

**Action needed:** Pick one before the API/DB chat writes the Mongoose schema.
- Embedded array → simpler writes/reads, one document = one receipt, natural fit for MongoDB
- Batch of rows → matches what the frontend already generates, less frontend rework, but is a more relational pattern in a document DB

Also decide: does `Transaction_ID` become a Mongo `_id`, or stay as a separate durable field (UUID or DB-generated sequence)? Current frontend uses a session-scoped auto-increment, which won't survive a real DB.

---

## Stack

- Framework: Next.js (App Router), TypeScript
- Styling: Tailwind CSS + inline React styles (no component library)
- State management: React Context (`AppContext`) + `useState` — no Redux/Zustand
- Backend: Separate Node.js + Express server (not Next.js API routes)
- Database: MongoDB Atlas (cloud-hosted, no local Mongo)
- ORM / ODM: Mongoose
- API style: REST
- Data source (current, pre-migration): Static JSON files in `/data/`, loaded at build time via `import`
- No authentication — internal tool, open session, operator identity is display-only for now
- Folder structure: `app/components/`, `app/components/layout/`, `context/`, `data/`, `types/`

---

## Data Model

- All MDM tables represented as typed static JSON files: `regions.json`, `countries.json`, `currencies.json`, `vacs.json`, `services.json`, `payment-modes.json`
- TypeScript interfaces for all 7 MDM entities live in `types/index.ts`
- Added `CartItem` and `TransactionRecord` as derived/runtime types (not MDM tables)
- `TransactionRecord` carries denormalized display fields (`VAC_Name`, `Country_Name`, `Service_Name`, `Payment_Name`, `Currency_Symbol`) — avoids re-joining at render time
- `Service_Type` is always `VAS` — stored in JSON/DB, displayed as a label, never used for filtering
- Mongoose schemas will keep original `*_Code` fields (e.g. `Country_Code`) alongside Mongo `_id`, since frontend references entities by code, not ObjectId
- `Unit_Price` is fixed from master data — never editable by the user/frontend
- `Line_Total = Unit_Price × Quantity` — computed on the frontend (⚠️ open question: does backend also validate/recompute this — see Open Questions)
- Currency defaults to `INR`; architecture must support switching later

---

## Transaction Structure

⚠️ See unresolved conflict above — the two options below are NOT both true, pick one.

- `Transaction_Status` always defaults to `Completed` on checkout — no Pending/Failed path in the UI yet
- `Grand_Total` is denormalized onto every `TransactionRecord` in a batch (redundant but simplifies receipt rendering without a join) — re-evaluate once DB is introduced
- `Transaction_Date` set at checkout time via `new Date().toISOString()`
- Transactions are currently session-local only (React state) — no DB persistence yet; this is what's being replaced now

---

## Filtering Rules

- Services filtered by `Country_Code` — selected country drives which services appear (⚠️ see Open Questions — may need to become VAC-level)
- VACs filtered by `Country_Code` — cascades from country selection
- Payment modes filtered by `Currency_Code` of the selected country
- Changing country resets: VAC, cart, payment mode, selected currency (full downstream reset)
- No Region filter in UI — Region field exists in data model but is not exposed as a UI control

---

## UI / Component Architecture

- `AppShell` owns sidebar open/close state; auto-collapses sidebar on screens ≤768px
- Sidebar uses `position: fixed`, toggled via width (0px / 220px) — no unmount on close
- Mobile: sidebar opens as overlay with a backdrop tap-to-close; main content never offsets on mobile
- Step indicator on New Transaction page is live — derives active step from context state, not manual control
- Cart summary is sticky on desktop (≥1024px); drops to static full-width stacked layout on tablet/mobile
- Services table wrapped in `overflowX: auto` / `minWidth: 480px` for mobile horizontal scroll
- All inline `background` shorthand replaced with `backgroundColor` wherever `backgroundImage`, `backgroundPosition`, or `backgroundRepeat` appear in the same style object — avoids React rerender warnings
- `CheckoutModal` renders as a fixed overlay sibling inside `CartSummary`'s fragment return — no portal

---

## Currency Architecture

- Default currency: INR — hardcoded as fallback symbol/code when no country is selected
- `defaultCurrencyCode` preference stored in `AppContext` — changeable via Settings page
- `defaultCurrencyCode` is currently display-only groundwork; actual pricing and payment filtering are always driven by the selected country's `Currency_Code`, which takes precedence (⚠️ see Open Questions — behavior needs a real decision)
- Architecture is currency-switchable: symbol and code are derived from context, not hardcoded in components

---

## Responsive / Breakpoints

- 1024px: transaction grid collapses from `1fr 340px` to single column; cart unsticks
- 768px: sidebar auto-closes on load; main content margin removed; header date hidden
- 640px: page header rows stack vertically; services catalogue grid collapses to single column

---

## Pages Delivered (Frontend)

- `/` — New Transaction (Country/VAC → Services → Payment → Checkout)
- `/history` — Session-local transaction history, grouped by `Batch_ID` — **now in scope** (supersedes earlier "out of scope for now" note)
- `/services` — Read-only service catalogue, filterable by country
- `/settings` — Currency default selector + session data management

---

## API Contract
*(To be filled in / confirmed once API & Database chat finalizes route shapes)*

| Endpoint | Method | Filters | Notes |
|---|---|---|---|
| `/api/countries` | GET | — | |
| `/api/regions` | GET | — | Unused in UI currently |
| `/api/vacs` | GET | `?country=` | |
| `/api/services` | GET | `?country=` | ⚠️ may need `?vac=` — see Open Questions |
| `/api/payment-modes` | GET | `?currency=` | |
| `/api/transactions` | POST | — | Shape depends on unresolved conflict above |
| `/api/transactions/:id` | GET | — | For history page |
| `/api/transactions` | GET | — | For history page (list) — pagination/filtering TBD |

---

## Open / Unresolved Questions

- [ ] **Transaction storage shape** — embedded array vs. batch-of-rows (see conflict banner above) — BLOCKS DB schema
- [ ] **`Transaction_ID` generation** — session-scoped auto-increment won't survive persistence; needs UUID or DB sequence
- [ ] Does the backend recompute/validate `Line_Total` and `Grand_Total` server-side, or trust the frontend?
- [ ] **`defaultCurrencyCode` wiring** — should the Settings currency preference: (a) convert displayed prices, (b) restrict country list to matching currency, or (c) something else? Currently display-only.
- [ ] **Services catalogue vs. VAC-level services** — master prompt originally said "services are per VAC," but current schema/JSON has no `VAC_Code` on `Services`, only `Country_Code`. Decide: add `VAC_Code` FK, or keep at country level as-is?
- [ ] **`Transaction_Status` flow** — only `Completed` is reachable today. Is `Pending`/`Failed` needed once a real payment step exists?
- [ ] **Operator identity** — no auth now. If login is added later, need `Operator_ID`/`Operator_Name` on transactions — not in current schema.
- [ ] **Print / export receipt** — no print or PDF export in `CheckoutModal` yet. In scope?
- [ ] Pagination or date-range filtering needed for Transaction History page?
- [ ] Env var naming convention for Mongo URI (e.g. `MONGODB_URI`)?
- [ ] Error response shape standard (e.g. `{ error: string }` vs `{ message, code }`)?

---

## Change History

| Date | Chat | Decision Added |
|---|---|---|
| 2026-07-01 | Setup | Initial stack + data model decisions locked |
| 2026-07-01 | Build session (v1–v5) | Full frontend build decisions merged; transaction-shape conflict flagged; new open questions added |
