# Coffman - Coffee Shop Management System

A back-office management system for coffee shop owners and managers — track your staff, inventory, menu, suppliers, and performance all in one place.

---

## Core Features

### 1. Menu Management
- Create and organize menu items by category (drinks, food, add-ons)
- Set item availability and toggle out-of-stock status
- Configure variants and modifiers (size, milk type, sugar level, extra shots)
- Define recipes — map each item to its required ingredients and quantities

### 2. Inventory Management
- Track raw material stock levels (coffee beans, milk, syrups, cups, etc.)
- Set low-stock thresholds and receive alerts
- Log stock-in entries manually or via supplier purchase orders
- View stock usage history and variance reports

### 3. Supplier Management
- Maintain a supplier directory with contact info and product catalog
- Create and track purchase orders (PO) per supplier
- Record deliveries and reconcile against POs
- Track outstanding payments to suppliers

### 4. Staff Management
- Manage staff profiles with roles: Owner, Manager, Barista, Cashier
- Schedule shifts and track attendance (clock-in/out)
- Monitor hours worked and generate payroll summaries
- Role-based access control for the dashboard

### 5. Expense Tracking
- Log operational expenses (utilities, rent, equipment, supplies)
- Categorize expenses and attach receipts
- Monthly expense breakdown and budget comparison

### 6. Sales & Performance Reports
- Daily, weekly, and monthly revenue summaries
- Best-selling items and category performance
- Cost of goods sold (COGS) vs revenue margin analysis
- Staff performance overview (orders handled, shift hours)
- Export reports to CSV or PDF

---

## Suggested Tech Stack

| Layer      | Choice                          |
|------------|---------------------------------|
| Frontend   | Next.js + Tailwind CSS + Shadcn |
| Backend    | Node.js + Express (REST API)    |
| Database   | PostgreSQL                      |
| Auth       | JWT + role-based middleware     |
| Deployment | Railway / Vercel                |

---

## Project Structure

```
coffman/
├── web/                  # Frontend dashboard (Next.js)
│   ├── app/
│   │   ├── dashboard/
│   │   ├── menu/
│   │   ├── inventory/
│   │   ├── suppliers/
│   │   ├── staff/
│   │   ├── expenses/
│   │   └── reports/
│   └── components/
├── server/               # Backend API
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── middleware/
└── docs/                 # ERD, API docs
```

---

## Database Entities

- **User** — staff accounts with roles and access levels
- **MenuItem** — menu products with variants and pricing
- **Recipe** — links menu items to ingredients with quantities
- **Ingredient** — raw materials with current stock levels
- **Supplier** — vendor profiles and product lists
- **PurchaseOrder** — stock orders placed with suppliers
- **Expense** — operational cost records
- **Shift** — staff schedules and attendance logs

---

## Roadmap

- [x] Project scaffolding and DB schema design
- [ ] Auth system with role-based access
- [x] Inventory tracking with low-stock alerts
- [x] Staff scheduling and attendance
- [ ] Menu & recipe management (API done, UI pending)
- [ ] Supplier & purchase order management
- [ ] Expense tracking
- [ ] Reports and analytics dashboard (basic route exists, incomplete)

---

## Getting Started

```bash
git clone https://github.com/yourname/coffman.git
cd coffman

npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

---

> Helping coffee shop owners focus on the coffee, not the chaos.
