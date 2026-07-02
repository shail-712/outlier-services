# Outlier Services — Backend

Express + MongoDB Atlas backend for the Outlier Services VAC booking app.

## Folder structure

```
outlier-backend/
├── config/
│   └── db.js              # Mongoose connection (reads MONGO_URI)
├── models/
│   ├── Region.js
│   ├── Currency.js
│   ├── Country.js
│   ├── VAC.js
│   ├── Service.js
│   ├── PaymentMode.js
│   ├── Transaction.js     # one doc per checkout, embedded Line_Items[]
│   └── Counter.js         # atomic sequence generator for Transaction_ID
├── controllers/
│   ├── countryController.js
│   ├── regionController.js
│   ├── currencyController.js
│   ├── vacController.js
│   ├── serviceController.js
│   ├── paymentModeController.js
│   └── transactionController.js
├── routes/
│   ├── countries.js
│   ├── regions.js
│   ├── currencies.js
│   ├── vacs.js
│   ├── services.js
│   ├── paymentModes.js
│   └── transactions.js
├── seed/
│   ├── seed.js             # loads seed/data/*.json into MongoDB
│   └── data/                # put your master-data JSON files here
│       ├── countries.json
│       ├── currencies.json
│       ├── payment-modes.json
│       ├── regions.json
│       ├── services.json
│       └── vacs.json
├── server.js               # app entry point
├── package.json
├── .env.example
└── .env                     # you create this (gitignored)
```

## 1. Set up MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com.
2. Under **Database Access**, create a user with a password.
3. Under **Network Access**, add your IP (or `0.0.0.0/0` for local dev).
4. Click **Connect → Drivers → Node.js** and copy the connection string.

## 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/outlier_services?retryWrites=true&w=majority
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

`CORS_ORIGIN` can be a comma-separated list if you have multiple frontend origins (e.g. local + staging).

## 3. Install dependencies

```bash
npm install
```

## 4. Seed the database

The `seed/data/` folder is already pre-populated with your existing
`countries.json`, `currencies.json`, `payment-modes.json`, `regions.json`,
`services.json`, and `vacs.json`. Just run:

```bash
npm run seed
```

This clears and reloads Region → Currency → Country → VAC → Service →
Payment Mode in that order (respecting foreign-key dependencies), and wires
up the `*_Ref` ObjectId fields alongside the original `*_Code` fields.

Re-run it any time you update the source JSON — it's idempotent.

## 5. Run the server

```bash
npm run dev     # with nodemon, auto-restarts on changes
# or
npm start
```

Server boots on `http://localhost:5000` (or whatever `PORT` you set).

## API Reference

| Method | Endpoint | Query/Body | Notes |
|---|---|---|---|
| GET | `/api/countries` | — | array of `{Country_Code, Country_Name, Region_Code, Currency_Code}` |
| GET | `/api/regions` | — | array of `{Region_Code, Region_Name}` |
| GET | `/api/currencies` | — | array of `{Currency_Code, Currency_Name, Currency_Symbol, Country_Code}` |
| GET | `/api/vacs?country=IN` | `country` optional | array of `{VAC_Code, VAC_Name, Country_Code}` |
| GET | `/api/services?country=IN` | `country` optional | array of `{Service_Code, Service_Name, Service_Type, Currency_Code, Unit_Price, Country_Code}` |
| GET | `/api/payment-modes?currency=INR` | `currency` optional | array of `{Payment_Code, Payment_Name, Currency_Code}` |
| POST | `/api/transactions` | see below | creates one transaction, multiple line items |
| GET | `/api/transactions/:id` | `:id` = `Transaction_ID` or `Batch_ID` | returns flat `TransactionRecord[]` |

### POST /api/transactions

Request body:

```json
{
  "VAC_Code": "IN_DEL",
  "Country_Code": "IN",
  "Payment_Code": "UPI_INR",
  "Currency_Code": "INR",
  "line_items": [
    { "Service_Code": "SVC_XEROX_A4", "Quantity": 2 },
    { "Service_Code": "SVC_PHOTO", "Quantity": 1 }
  ]
}
```

Notes:
- `Unit_Price` and `Line_Total` are **computed server-side** from the current
  `Service` record — the client never sends prices. This prevents a tampered
  request from checking out at an arbitrary price.
- Response is a flat array of `TransactionRecord` objects (one per line
  item, all sharing `Batch_ID` / `Grand_Total`) — this matches the exact
  shape your `AppContext.checkout()` already returns, so swapping the
  frontend's local state logic for a `fetch('/api/transactions', {method:'POST', ...})`
  call is a drop-in change.
- Internally, all line items are stored in **one MongoDB document**
  (`Transaction.Line_Items[]`), not one document per service — the flat
  array is just the response projection.

### GET /api/transactions/:id

Accepts either the numeric `Transaction_ID` (e.g. `1001`) or the
`Batch_ID` (e.g. `BATCH-1719999999999-1001`). Returns the same flat
`TransactionRecord[]` shape as the POST response.

## Wiring up the Next.js frontend

Your `AppContext.tsx` currently keeps `transactions` in local React state
and computes everything client-side. To swap in this API:

1. Replace the static JSON imports for countries/regions/currencies/vacs/
   services/payment-modes with `fetch` calls to the corresponding GET
   endpoints (shapes match 1:1, so this is just a data-source swap).
2. Replace the body of `checkout()` with a `POST /api/transactions` call,
   passing `VAC_Code`, `Country_Code`, `Payment_Code`, `Currency_Code`, and
   `line_items` derived from `cart`. Use the returned `TransactionRecord[]`
   exactly as you do today with `setTransactions`.
3. `GET /api/transactions/:id` is ready for whenever you build the
   transaction-history / receipt view.

## Design notes / defaults used

- **Embedded line items**: `Transaction.Line_Items` is an array of
  subdocuments inside one `Transaction`, not a separate collection — they're
  always created and read together, so embedding avoids extra joins/queries.
- **Server-computed pricing**: the POST handler looks up `Unit_Price` from
  the `Service` collection itself rather than trusting the client, and
  computes `Line_Total`/`Grand_Total` server-side.
- **Atomic Transaction_ID**: a `Counter` collection replaces the frontend's
  in-memory `let transactionCounter = 1000`, since multiple concurrent
  requests need a race-free increment — Mongo's `findByIdAndUpdate` with
  `$inc` is atomic.
- **Codes are the primary keys the frontend uses**; ObjectId `*_Ref` fields
  are additive, for internal joins/population, not a replacement.
