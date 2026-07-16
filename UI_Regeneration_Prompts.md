# Branch Management System — UI Regeneration Brief

This document is meant to be pasted into another AI UI-generation tool (v0, Lovable, Figma AI, etc.) to design a fresh UI. It has two independent prompts — **Staff App** (mobile) and **Owner App** (desktop admin) — plus the shared data model both are built on. Nothing about the backend, sync logic, or business logic is changing — only the visual UI. Once you get results back, send them to me and I'll wire the new UI into the existing app.

---

## Shared Data Model (both apps read/write this)

- **Branch**: id, name, location, active staff count. Currently 2 real branches (Seppa, Dirang) — design should support any number of branches, not hard-code 2.
- **Product**: name, unit (e.g. "pcs", "kg"), sale price, cost price, low-stock threshold, optional "pieces per box" (for box+pcs quantity selling), can be branch-specific or shared across all branches.
- **Customer**: name, phone, running balance due, tied to a branch.
- **Sale**: product, customer, qty, price, total, discount (percent or flat), payment mode (cash/UPI/credit/split cash+UPI), bill number (groups multiple line items into one bill), timestamp, which staff created it.
- **Purchase**: product bought from a supplier, qty, cost, total, invoice number, payment mode (paid/credit), note, timestamp.
- **Bill (Udhaar/Credit)**: a customer IOU — amount, amount paid so far, due amount, status (unpaid/paid), independent of but sometimes linked to a Sale.
- **Expense**: category, note, amount, timestamp, branch.
- **Settings**: company name, address, phone, GSTIN, invoice footer text — used on printed bills.
- Money is always shown as rounded ₹ with Indian thousands separators, no decimals. Dates as "DD Mon", times as 12-hour "HH:MM AM/PM". Positive/incoming = green, negative/outgoing/due = red, warnings = amber.
- Every record supports soft-delete (delete moves it to a "Deleted" bucket, restorable by the owner).
- App works offline — entries save locally first and sync to the server when online, so every screen needs a subtle "pending sync" indicator per row/list and a global sync status pill.

---

## PROMPT 1 — Staff App (mobile, used on phones/tablets in-store)

Design a mobile-first Progressive Web App for shop staff to run day-to-day billing at a paint/hardware retail branch. One staff member is logged into one branch at a time. This is used standing at a counter — it needs to be fast, thumb-friendly, and forgiving of spotty internet.

**Global chrome:**
- Sticky top bar: hamburger menu (left), staff name + branch name (center), sync status pill + online/offline toggle (right).
- Fixed bottom tab bar with 5 tabs: Home, Billing, Purchase, Credit Bills (Udhaar), Customers.
- Hamburger slide-in drawer (from left) holds secondary nav not in the tab bar: everything in the tab bar plus Ledger, Stock, Day Book — then a divider, then "Change password" and "Logout" (logout pinned to the bottom, shown in red with a confirm step).
- A dismissible red banner appears below the top bar if sync is failing, explaining data is safe locally.

**Screen 1 — Home / Dashboard**
Daily snapshot for this branch. Big "+ New Bill" button up top. Three stat tiles: Sold Today, Received Today (actual cash collected), Amount Due (red if any customer owes money). Below that, a simple bar chart of sales over the last 7 days.

**Screen 2 — Billing (the most important screen)**
Two-way toggle at the top: "New Bill" / "Previous Bills".

*New Bill:*
1. Customer field — type to search existing customers (autocomplete shows name, phone, any amount they owe) or just type a new walk-in name. Date field next to it, defaults to today.
2. Product search box — type to filter products. **Selecting a product from the results adds it to the bill immediately** — no separate "add" button, no extra click. If you search the same product again, it just increases the quantity.
3. Added Items — a card per item showing name, quantity, rate, per-box conversion note if relevant, line total, a delete icon, and +/− stepper buttons for adjusting Box count and Pcs count separately (many paint products sell by the box, where 1 box = N pieces).
4. Totals block: Subtotal, a Discount row (dropdown: None / 5% / 10% / Custom % / Flat ₹, revealing an input when Custom or Flat is picked), Grand Total. **No GST/tax line anywhere — this business doesn't charge GST on this app.**
5. Payment block: mode selector (Cash / UPI / Cash+UPI split / Credit), a "paid in full now" checkbox, split amount fields when Cash+UPI is chosen, a partial-amount field when not paying in full, and a clear "Due after this bill" callout if anything's left owing.
6. Two buttons at the bottom: "Save Bill" and "Save & Print" (which also opens/prints a formatted paper receipt).

*Previous Bills:* a searchable list of past bills for this branch (search by bill number or customer), each row showing bill #, customer, date, item count, payment mode, total, and a reprint button. This is a read-only history/reprint tool — not for editing.

**Screen 3 — Purchase**
A simple form to log stock received from a supplier: supplier name (autocomplete from past suppliers), product picker (auto-fills known cost price), quantity + cost per unit, optional supplier invoice number, date, a Cash/Credit toggle for whether the supplier's been paid, optional note, and a computed total preview before saving. Below the form, a list of the last 20 purchases with a delete option on each.

**Screen 4 — Credit Bills / Udhaar**
This is different from "Previous Bills" — this screen is for actively managing IOUs. Two stat tiles up top (Total Due, Open Bills count). A list of all credit bills for the branch, each showing customer, date, amount paid so far vs total, due amount, and a status badge. Actions per row: Pay (record a payment against it), Edit, Print, Delete. A "+ New Bill" button opens a quick form (customer, amount, amount paid now, computed due).

**Screen 5 — Customers**
Directory of the branch's customers. List showing name, phone, and balance due (or "Clear" in green if zero). Tapping a customer opens their full ledger/history. Edit and delete actions per row. "+ Add" button for a simple name+phone form.

**Screen 6 — Ledger** (in hamburger menu)
Branch-wide view of who owes what, separate from the per-customer detail view. Toggle between "Outstanding" and "Paid" (settled). Each customer row expands to show their individual unpaid (or paid) bills inline. Quick "Pay" action per customer without leaving the list.

**Screen 7 — Stock** (in hamburger menu)
Read-only inventory list: product name, unit, sale price, and current computed stock quantity, with a visual warning (red/low badge) when stock is at or below that product's low-stock threshold.

**Screen 8 — Day Book** (in hamburger menu)
A single chronological feed mixing all money in (sales) and money out (purchases + expenses) for the branch, with a running In/Out/Net summary at top. "+ Expense" button to log a miscellaneous cost (category, note, amount). Edit/delete per entry.

**Design direction:** Clean, modern, native-app feel — this should not look like a web form. Single accent color (something confident like indigo or blue) for primary actions and active states. Generous tap targets, bottom-sheet style modals for add/edit forms, card-based lists rather than dense tables. Should feel fast and thumb-friendly, like a POS app, not a spreadsheet.

---

## PROMPT 2 — Owner App (desktop, admin dashboard)

Design a desktop-first admin dashboard for the shop owner to oversee both branches remotely — sales, stock, staff, and money — from a laptop or tablet. Data-dense but scannable; this is a "check every morning" business cockpit, not a form-filling app.

**Global chrome:**
- Left sidebar (collapses to an off-canvas drawer on narrow screens): company logo/name, then nav items — Dashboard, one entry per branch (e.g. Seppa Branch, Dirang Branch — support any number of branches generically), Sales/Bill History, Purchases, Ledger, Customers, Stock, Products, Day Book, Reports, Settings.
- Top header: a date-range switcher (Today / This Week / This Month / Custom range picker), and on the right — sync status, a manual refresh button, online/offline indicator, logout, and the owner's avatar.

**Screen 1 — Dashboard**
Head-office overview combining both branches for the selected date range. Four KPI cards up top: Total Sales, Unpaid Bills (with due amount), Purchases+Expenses combined, Active Customers — each with a small up/down trend vs the previous period. A conditional amber "low stock" alert card listing items needing restock across branches. A 14-day sales trend bar chart alongside a payment-method breakdown donut (Cash/UPI/Credit). A card per branch showing its sales this period, active staff, and top-selling items, each linking to that branch's detail page. A searchable recent-transactions table at the bottom mixing sales and purchases from both branches with sync status per row.

**Screen 2 — Branch Detail** (one per branch)
Drill-down for a single branch: sales, purchases, expenses, and unpaid dues as stat tiles, followed by a full day-book style transaction table (date/time, description, party, signed amount) with delete capability per row.

**Screen 3 — Sales / Bill History**
Every completed sale across both branches, grouped into bills. Filter by payment mode (All/Cash/UPI/Credit). Table columns: bill number, item count, date/time, branch, customer, payment mode, which staff member created it, total, and a reprint action. Export to CSV button.

**Screen 4 — Purchases**
Full purchase register across branches. Stat tiles: Total Purchases, On Credit/Owed, Record count. A "top suppliers by spend" chip list. Filterable/searchable table (by branch, supplier, item, bill number): date, branch, supplier, item, qty, total, bill no, payment badge (cash/credit), edit/delete actions. Export to Excel, toggle to view deleted/restorable entries, "+ Add purchase" button.

**Screen 5 — Ledger**
Head-office-wide customer balance view sorted by amount owed, across both branches. Stat tiles: total customers, customers with dues, total outstanding. Searchable table linking to each customer's full ledger.

**Screen 6 — Customers**
Full customer directory across branches. Table with name, phone, branch tag, balance due, and actions (view ledger, edit, delete/restore). Search, export, toggle for viewing deleted customers, add-customer button.

**Screen 7 — Stock / Inventory**
A matrix table: one row per product, one column per branch showing current computed stock (red/low-styled if under threshold), plus a total column. "Adjust" action per row opens a form to correct stock with a reason note (for wastage, recounts, opening stock, etc.) — this is the one place inventory can be manually corrected rather than only computed from sales/purchases.

**Screen 8 — Products**
The master product catalog — owner-only editing of pricing and setup. Table: name, branch assignment (or "All branches"), unit, cost price, sale price, low-stock threshold, edit/delete. Add/edit modal includes an optional "pieces per box" field for products sold by the box. Requires an internet connection to edit (offline edits are blocked with a clear message, since pricing must stay authoritative).

**Screen 9 — Day Book**
Combined chronological money-in/money-out feed across both branches for the selected range, with In/Purchases/Expenses/Net stat tiles, export, and a "+ Add expense" button.

**Screen 10 — Reports**
Pure analytics, no tables — horizontal bar visualizations: top products by revenue, branch-vs-branch contribution split, and sales-by-staff-member ranking, all for the selected date range.

**Screen 11 — Settings**
Company profile form (name, phone, address, GSTIN, invoice footer — used on printed receipts). Personal "change my password" card. Staff management: a card to reset any staff member's password by their login ID, and a staff accounts table (name, login ID, branch, role) with an "+ Add staff" flow to create new staff or owner logins.

**Design direction:** Professional, information-dense, desktop dashboard aesthetic — think a modern SaaS admin panel. Same accent color and semantic color language as the Staff app (so the two feel like one product), but leaning into tables, multi-column stat grids, and side-by-side charts rather than mobile cards. Sidebar + header shell should collapse gracefully on tablet widths. No external charting library assumed — simple bar/donut visuals are fine.

---

## Notes for whoever builds the new UI

- "Previous Bills" (in Staff Billing) and "Credit Bills / Udhaar" are **two different features** — don't merge them. Previous Bills = read-only sales history/reprint. Credit Bills = actively managed customer IOUs with pay/edit actions.
- No GST/tax anywhere in the billing flow — confirmed removed from this business's requirements.
- Design should not hard-code "2 branches" — treat branch count as dynamic even though there happen to be 2 today.
- Every list of records (sales, purchases, customers, products, bills) needs a "pending sync" indicator per row, since the app works offline-first.
