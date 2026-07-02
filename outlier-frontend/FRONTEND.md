## User Flow (End-to-End) — Outlier Services (VFS Internal Tool)

### 0) App Shell / Navigation (Global)

The user lands inside the main application layout, which includes a Header and Sidebar.

The sidebar provides navigation to:

* **New Transaction** (`/`)
* **Transaction History** (`/history`)
* **Services** (`/services`) – Catalog (Coming Soon)
* **Settings** (`/settings`) – Coming Soon

The primary workflow begins from **New Transaction**, where users create a checkout.

---

## A) Create a Transaction (New Transaction Flow)

### Goal

Select a Country and VAC, add services to the cart, choose a payment mode, and complete the checkout.

---

### 1. Country & VAC Step

* The user clicks the **Country** dropdown.
* The user searches for and selects a country.
* Once a country is selected, the application automatically sets the corresponding currency.
* The user then selects a **VAC (Visa Application Centre)** from the VAC dropdown.
* After both Country and VAC are selected, the application displays an information bar containing:

  * VAC Name
  * Country
  * Currency
  * VAC Code

**Blocked State**

* Services remain hidden or disabled until both Country and VAC have been selected.

---

### 2. Services Step

* The application displays the available services for the selected country.
* The user adds services to the cart using the **+** button.
* Quantities can be adjusted using:

  * **− / +** controls on each service row, or
  * The mini stepper inside the Cart Summary.
* Cart totals update dynamically whenever quantities change.

**Notes**

* If a service is not already in the cart, pressing **−** has no effect.
* If a service quantity becomes **0**, that service is automatically removed from the cart.

---

### 3. Payment Step

* The user selects a **Payment Mode** using radio buttons.
* Payment modes are filtered based on the currently selected currency.
* If the cart is empty, payment selection remains disabled.

**Confirm & Checkout is enabled only when:**

* A VAC has been selected.
* The cart contains at least one service.
* A payment mode has been selected.

---

### 4. Confirm & Checkout

* The user clicks **Confirm & Checkout**.
* The application performs an in-memory checkout process by:

  * Generating a unique **Batch_ID** (e.g., `BATCH-...`)
  * Creating one transaction record for each service in the cart
  * Marking each transaction with the status **Completed**
  * Clearing the cart
  * Clearing the selected payment mode
  * Saving the transaction records in session-local state

A **Checkout Success Modal** is displayed containing:

* VAC
* Country
* Payment Mode
* Batch ID
* Service line items
* Grand Total

The user can:

* Click **New Transaction** to close the modal and begin another transaction.
* Click **Print** to print the receipt using `window.print()`.

---

## B) View Transaction History

### Goal

View all completed checkouts created during the current session.

* The user navigates to **Transaction History** (`/history`).
* The application groups stored transactions by **Batch_ID**.
* Each batch displays:

  * VAC Name
  * Country
  * Payment Mode
  * Date and Time
  * Currency
  * Batch Grand Total
  * Status Badge
  * A table containing:

    * Service Name
    * Quantity
    * Unit Price
    * Line Total

If no completed transactions exist, an empty-state message is displayed.

---

## C) Other Navigation Paths

### Services (`/services`)

Displays a **"Coming Soon"** catalog page. No functional workflow is currently implemented.

### Settings (`/settings`)

Displays a **"Coming Soon"** settings page.

---

## Happy Path Summary

**New Transaction → Select Country & VAC → Add Services to Cart → Choose Payment Mode → Confirm & Checkout → Success Modal (Print / New Transaction) → Transaction History**
