# Outlier Services — Decisions Log

> Living document. Update this every time a chat locks in an architectural 
> or implementation decision. Re-upload to the project after every update 
> so all chats stay in sync. Newest entries at the top of each section.

---

## ✅ RESOLVED — Transaction storage shape

**Decision (2026-07-02, API & DB chat): embedded array.**

- One checkout = **ONE `Transaction` Mongo document**, with an **embedded array** `Line_Items[]` (one subdocument per service).
- The old "batch of separate rows sharing a `Batch_ID`" pattern was a frontend-only artifact of session-local state, not a DB design — it is **not** how data is stored in Mongo.
- The API still **returns** a flattened `TransactionRecord[]` (one flat object per line item, all sharing `Batch_ID`/`Grand_Total`/`Transaction_ID`) from both `POST /api/transactions` and `GET /api/transactions/:id`, purely as a response projection — this keeps the shape identical to what the frontend already expected, so `CheckoutModal.tsx` / `TransactionHistory.tsx` needed no prop-shape changes, only a keying fix (see below).
- `Transaction_ID` is **shared across all line items in a batch** (it identifies the checkout event, not the line item) — this is a deliberate consequence of "one checkout = one document." Anything keying UI lists by `Transaction_ID` alone will collide; must key by `${Batch_ID}-${Service_Code}` instead (bug found + fixed 2026-07-02, see Change History).

**`Transaction_ID` generation — resolved:** DB-generated sequence via a Mongo `Counter` collection (atomic `findByIdAndUpdate` + `$inc`), seeded to start at 1001. Not a Mongo `_id` — kept as a separate human-readable numeric field, alongside Mongo's own `_id` on the document. `Batch_ID` is `BATCH-{timestamp}-{transactionId}`, also stored as a field, unique-indexed.

---

## Stack

- Framework: Next.js (App Router), TypeScript
- Styling: Tailwind CSS + inline React styles (no component library)
- State management: React Context (`AppContext`) + `useState` — no Redux/Zustand
- Backend: Separate Node.js + Express server (not Next.js API routes) — **built 2026-07-02**
- Database: MongoDB Atlas (cloud-hosted, no local Mongo) — **schema + seed script built 2026-07-02**
- ORM / ODM: Mongoose
- API style: REST
- Data source: **migrated from static JSON `import` to live API `fetch` calls (2026-07-02)** — static JSON files in `/data/` are no longer imported by components; `services.json`, `vacs.json`, `countries.json`, `currencies.json`, `payment-modes.json` can be deleted from the frontend repo (kept only as seed input on the backend, in `outlier-backend/seed/data/`)
- No authentication — internal tool, open session, operator identity is display-only for now
- Folder structure (frontend): `app/components/`, `app/components/layout/`, `context/`, `lib/` (**new** — API client), `types/`
- Folder structure (backend, new repo `outlier-backend/`): `models/`, `routes/`, `controllers/`, `config/`, `seed/`, `server.js`
- Frontend/backend run as two independent processes in local dev (`localhost:3000` / `localhost:5000`), connected via `NEXT_PUBLIC_API_URL`

---

## Data Model

- All MDM tables represented as typed static JSON files: `regions.json`, `countries.json`, `currencies.json`, `vacs.json`, `services.json`, `payment-modes.json` — **now used only as backend seed input**, not imported at frontend build time
- TypeScript interfaces for all 7 MDM entities live in `types/index.ts` — **unchanged**, reused as-is for both frontend props and API response typing
- Added `CartItem` and `TransactionRecord` as derived/runtime types (not MDM tables) — **unchanged**
- `TransactionRecord` carries denormalized display fields (`VAC_Name`, `Country_Name`, `Service_Name`, `Payment_Name`, `Currency_Symbol`) — avoids re-joining at render time. **Still true** — API's `toTransactionRecords()` projection produces this shape from the embedded Mongo document.
- `Service_Type` is always `VAS` — stored in JSON/DB, displayed as a label, never used for filtering
- Mongoose schemas keep original `*_Code` fields (e.g. `Country_Code`) alongside Mongo `_id`, **plus additive `*_Ref` ObjectId fields** for internal joins/population — frontend still references entities by code exclusively, never by ObjectId
- `Unit_Price` is fixed from master data — never editable by the user/frontend. **Now also enforced server-side**: `POST /api/transactions` looks up `Unit_Price` from the `Service` collection itself and ignores any price sent by the client.
- `Line_Total = Unit_Price × Quantity` — **resolved (see Open Questions): computed server-side**, not trusted from the frontend. `Grand_Total` is likewise computed server-side as the sum of line totals.
- Currency defaults to `INR`; architecture supports switching later — unchanged

---

## Transaction Structure

- `Transaction_Status` always defaults to `Completed` on checkout — no Pending/Failed path in the UI yet. Enforced both frontend and backend (`Transaction_Status` defaults to `'Completed'` in the Mongoose schema).
- `Grand_Total` is denormalized onto every `TransactionRecord` in a batch (redundant but simplifies receipt rendering without a join) — **now computed and stored once on the parent `Transaction` document**, then copied onto each flattened `TransactionRecord` in the API response. Still redundant by design, same tradeoff as before.
- `Transaction_Date` set at checkout time via `new Date().toISOString()` — **now set server-side** at the moment the `Transaction` document is created, not client-side.
- Transactions are **now persisted to MongoDB** — no longer session-local only. `AppContext.transactions` React state still exists and still drives `TransactionHistory.tsx`, but is now populated by `POST /api/transactions` responses rather than local object construction. (Note: this means the frontend's in-memory `transactions` array is still only what's been checked out *this session* — it does not yet fetch prior history from `GET /api/transactions` on load. See Open Questions.)

---

## Filtering Rules

- Services filtered by `Country_Code` — selected country drives which services appear. **Now implemented as `GET /api/services?country=XX`** — same filter, now server-side instead of an in-memory `.filter()`.
- VACs filtered by `Country_Code` — cascades from country selection. **Now `GET /api/vacs?country=XX`.**
- Payment modes filtered by `Currency_Code` of the selected country. **Now `GET /api/payment-modes?currency=XX`.**
- Changing country resets: VAC, cart, payment mode, selected currency (full downstream reset) — unchanged, still handled in `AppContext.handleSetSelectedCountry`
- No Region filter in UI — Region field exists in data model and now has a live `GET /api/regions` endpoint, but is still not exposed as a UI control

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
- **New:** `CountryVACSelector`, `ServicesList`, `PaymentSelector` each now own their own `loading`/`error` local state for their respective API fetches (countries+currencies, VACs, services, payment modes) — no global loading spinner/skeleton system yet, each section handles its own inline "Loading..." text
- **New:** `CartSummary`'s checkout button now shows a `Processing...` label and disables during the in-flight `POST /api/transactions` call (`isCheckingOut` from `AppContext`); API failures surface as an inline error banner in `CartSummary`, not a thrown/unhandled error
- **Bug found + fixed (2026-07-02):** `CheckoutModal.tsx` and `TransactionHistory.tsx` both keyed their line-item `.map()` by `r.Transaction_ID` alone. Since `Transaction_ID` is now shared across all line items in a batch (see Transaction storage shape decision above), multi-item checkouts threw a React "duplicate key" console error. Fixed by keying both lists on `${r.Batch_ID}-${r.Service_Code}` instead. `Transaction_ID` is still displayed in the UI (`ID: {r.Transaction_ID}` / `Txn ID: {r.Transaction_ID}`) — only the React `key` changed, not what's shown to the user.

---

## Currency Architecture

- Default currency: INR — hardcoded as fallback symbol/code when no country is selected
- `defaultCurrencyCode` preference stored in `AppContext` — changeable via Settings page
- `defaultCurrencyCode` is currently display-only groundwork; actual pricing and payment filtering are always driven by the selected country's `Currency_Code`, which takes precedence (⚠️ still unresolved — see Open Questions, unchanged by this session's work)
- Architecture is currency-switchable: symbol and code are derived from context, not hardcoded in components

---

## Responsive / Breakpoints

- 1024px: transaction grid collapses from `1fr 340px` to single column; cart unsticks
- 768px: sidebar auto-closes on load; main content margin removed; header date hidden
- 640px: page header rows stack vertically; services catalogue grid collapses to single column

---

## Pages Delivered (Frontend)

- `/` — New Transaction (Country/VAC → Services → Payment → Checkout) — **now API-backed end to end**
- `/history` — Session-local transaction history, grouped by `Batch_ID` — still session-local only; does not yet call `GET /api/transactions` on load (see Open Questions)
- `/services` — Read-only service catalogue, filterable by country — not yet migrated to the API in this session; still check whether this page independently imports `services.json` and needs the same treatment as `ServicesList.tsx`
- `/settings` — Currency default selector + session data management

---

## API Contract — **confirmed, implemented, and live** (2026-07-02)

| Endpoint | Method | Filters | Notes |
|---|---|---|---|
| `/api/countries` | GET | — | Returns array matching `countries.json` shape exactly |
| `/api/regions` | GET | — | Live, still unused in UI |
| `/api/currencies` | GET | — | **Added** — not in original contract draft, needed since payment-modes/services key off `Currency_Code` |
| `/api/vacs` | GET | `?country=` | |
| `/api/services` | GET | `?country=` | Filter stays at country level — `?vac=` not implemented (see Open Questions, unresolved) |
| `/api/payment-modes` | GET | `?currency=` | |
| `/api/transactions` | POST | — | Body: `{VAC_Code, Country_Code, Payment_Code, Currency_Code, line_items: [{Service_Code, Quantity}]}`. Server computes all prices/totals. Returns flat `TransactionRecord[]`. |
| `/api/transactions/:id` | GET | — | `:id` accepts either numeric `Transaction_ID` or `Batch_ID`. Returns flat `TransactionRecord[]` for that batch. |
| `/api/transactions` | GET | — | **Not yet implemented** — list/pagination endpoint for history page still open, see Open Questions |

- Error response shape — **resolved**: `{ error: string, details?: string }` on all failures (400/404/500)
- Env var naming — **resolved**: `MONGO_URI` (backend), `NEXT_PUBLIC_API_URL` (frontend)

---

## Open / Unresolved Questions

- [x] ~~Transaction storage shape~~ — RESOLVED, embedded array (see banner at top)
- [x] ~~`Transaction_ID` generation~~ — RESOLVED, Mongo `Counter` collection, atomic increment
- [x] ~~Does the backend recompute/validate `Line_Total` and `Grand_Total` server-side?~~ — RESOLVED, yes, always
- [x] ~~Error response shape standard~~ — RESOLVED, `{ error, details? }`
- [x] ~~Env var naming convention~~ — RESOLVED, `MONGO_URI` / `NEXT_PUBLIC_API_URL`
- [ ] **`GET /api/transactions` (list)** — not built. `/history` page still only shows session-local checkouts, not prior sessions. Needed before `/history` is a real feature rather than a session scratchpad.
- [ ] **`/services` page** — unclear if it was migrated off `services.json` static import in this session; audit and confirm.
- [ ] `defaultCurrencyCode` wiring — still just display-only, behavior (a)/(b)/(c) undecided
- [ ] Services catalogue vs. VAC-level services — `Service` schema still has no `VAC_Code`, only `Country_Code`. Undecided.
- [ ] `Transaction_Status` flow — only `Completed` reachable; `Pending`/`Failed` still unused end to end (schema supports it, nothing sets it)
- [ ] Operator identity / auth — still not in schema
- [ ] Print / export receipt — `CheckoutModal` has a `window.print()` button but no dedicated PDF/export; still open whether that's sufficient
- [ ] Pagination or date-range filtering for Transaction History — blocked on the list endpoint above
- [ ] **New from this session:** should `AppContext` fetch existing transaction history from the DB on mount (via the not-yet-built list endpoint), or stay session-only by design for this internal tool? Affects whether `/history` needs a loading state.

---

## Change History

| Date | Chat | Decision Added |
|---|---|---|
| 2026-07-01 | Setup | Initial stack + data model decisions locked |
| 2026-07-01 | Build session (v1–v5) | Full frontend build decisions merged; transaction-shape conflict flagged; new open questions added |
| 2026-07-02 | API & DB chat | Backend built (Express + Mongoose + MongoDB Atlas); transaction-shape conflict **resolved** (embedded array); `Transaction_ID`/`Batch_ID` generation resolved; server-side price computation resolved; API contract implemented and confirmed live; error shape and env var naming resolved |
| 2026-07-02 | Frontend integration chat | Frontend migrated from static JSON imports to live API calls (`lib/api.ts`, `AppContext`, `CountryVACSelector`, `ServicesList`, `PaymentSelector`, `CartSummary`); found + fixed duplicate-React-key bug in `CheckoutModal`/`TransactionHistory` caused by `Transaction_ID` now being shared per batch instead of per line item; `/history` list-endpoint gap and `/services` page migration status flagged as new open questions |