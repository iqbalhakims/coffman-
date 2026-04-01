# Plan: Multi-Tenancy via Shop Model

## Context
Coffman is being opened to multiple coffee shops. Currently all data is global with no tenant isolation, and subscriptions are per-staff. If 2-3 shops sign up today they'd share all data — a critical problem.

**New onboarding flow:** Owner pays first (no account needed), then completes shop + account setup only after payment is confirmed. This avoids orphaned unpaid accounts.

---

## User Journey

```
Landing Page
    ↓ "Get Started"
/subscribe?plan=ANNUAL
    ↓ Enter email + confirm plan (no account needed)
POST /api/auth/pending-registration
    → Creates PendingRegistration + Xendit invoice
    ↓ Redirect to Xendit
[User pays]
    ↓ Xendit webhook → PendingRegistration.status = PAID
    ↓ Xendit redirects to /setup?token={token}
/setup page: Shop name, Your name, Password
POST /api/auth/complete-registration
    → Validate token is PAID
    → Create Shop + Staff(OWNER) + Subscription(ACTIVE) in one transaction
    → Sign in (set cookie)
    ↓ Redirect to /inventory
```

---

## 1. Prisma Schema — `app/prisma/schema.prisma`

**Add `Shop` model:**
```prisma
model Shop {
  id           String        @id @default(cuid())
  name         String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  staff        Staff[]
  subscription Subscription?
  ingredients  Ingredient[]
  menuItems    MenuItem[]
  sales        Sale[]
}
```

**Add `PendingRegistration` model** (tracks pre-payment sign-ups):
```prisma
enum PendingStatus {
  AWAITING_PAYMENT
  PAID
  COMPLETED
}

model PendingRegistration {
  id               String        @id @default(cuid())
  token            String        @unique
  email            String
  billingCycle     BillingCycle
  status           PendingStatus @default(AWAITING_PAYMENT)
  xenditInvoiceId  String?
  xenditPaymentUrl String?
  createdAt        DateTime      @default(now())
  expiresAt        DateTime
}
```

**Modify existing models (add `shopId`):**
- `Staff` → add `shopId String`, relation to `Shop`, remove `subscription Subscription?`
- `Subscription` → replace `staffId` with `shopId String @unique`, relation to `Shop`
- `Ingredient` → add `shopId String`, relation to `Shop`
- `MenuItem` → add `shopId String`, relation to `Shop`
- `Sale` → add `shopId String`, relation to `Shop`

Tables that don't need shopId (inherit through parent FK):
- `StockLog` → via Ingredient
- `RecipeItem` → via MenuItem
- `SaleItem` → via Sale
- `Attendance` → via Staff
- `LeaveRequest` → via Staff

---

## 2. Auth / Session — extend SessionPayload

**`app/src/lib/auth.ts`**
```typescript
export type SessionPayload = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  shopId: string;  // NEW
};
```

**`app/src/app/api/auth/login/route.ts`**
Include `shopId: staff.shopId` when building the JWT token.

---

## 3. Subscribe Page (updated — no auth required)

**`app/src/app/subscribe/page.tsx`** (update)
- Show a form: Email input + plan selector (monthly/annual)
- On submit: `POST /api/auth/pending-registration`
- On response: redirect to Xendit payment URL

**New API: `app/src/app/api/auth/pending-registration/route.ts`** (`POST`, no auth)
- Body: `{ email, billingCycle }`
- Validate fields; check no existing ACTIVE subscription for that email
- Generate a random `token` (crypto.randomUUID)
- Set `expiresAt = now + 24h`
- Create Xendit invoice:
  - `externalId: coffman-pending-{token}`
  - `payerEmail: email`
  - `successRedirectUrl: /setup?token={token}`
  - `failureRedirectUrl: /?payment=failed`
- Save `PendingRegistration` record
- Return `{ paymentUrl }`

---

## 4. Setup Page (post-payment account creation)

**New page: `app/src/app/setup/page.tsx`**
- Reads `?token` from URL
- Calls `GET /api/auth/pending-registration?token=` to verify token is PAID (show error if expired/not paid)
- Form: Shop Name, Your Name, Password
- On submit: `POST /api/auth/complete-registration`
- On success: redirect to `/inventory`

**New API: `app/src/app/api/auth/complete-registration/route.ts`** (`POST`, no auth)
- Body: `{ token, shopName, name, password }`
- Validate fields
- Find `PendingRegistration` by token; ensure status = `PAID`, not expired, not `COMPLETED`
- In a Prisma transaction:
  1. Create `Shop { name: shopName }`
  2. Create `Staff { name, email, password: bcrypt(password), role: OWNER, shopId: shop.id }`
  3. Create `Subscription { shopId, status: ACTIVE, billingCycle, currentPeriodStart, currentPeriodEnd }`
  4. Update `PendingRegistration.status = COMPLETED`
- Sign JWT token (includes shopId), set cookie
- Return `{ redirect: "/inventory" }`

**New API: `app/src/app/api/auth/pending-registration/route.ts`** (`GET`)
- Query param `?token=`
- Returns `{ status, email, billingCycle }` (for UI to display)
- Returns 404 if token not found or COMPLETED

---

## 5. Xendit Webhook — `app/src/app/api/webhooks/xendit/route.ts`

Update to handle two cases based on `externalId` prefix:

```
if externalId starts with "coffman-pending-":
  → Find PendingRegistration by token (extracted from externalId)
  → If PAID: set status = PAID
  → If EXPIRED: set status = COMPLETED (expired)

else (existing coffman-shop- pattern):
  → Find Subscription by xenditInvoiceId (existing logic)
  → Update status ACTIVE/EXPIRED as before
```

---

## 6. Subscription Routes (shop-scoped, OWNER only)

**`app/src/app/api/subscriptions/route.ts`**
- Only called for subscription renewal (not initial setup — that's done in complete-registration)
- Change lookup: `where: { shopId: session.shopId }`
- Add role guard: only `OWNER` can call this
- `externalId: coffman-shop-{shopId}-{timestamp}`

**`app/src/app/api/subscriptions/status/route.ts`**
- Change lookup: `where: { shopId: session.shopId }`

---

## 7. All Data API Routes — add `shopId` filter

Every route gets `shopId` from `session.shopId` (passed by `withAuth`).

| File | Change |
|------|--------|
| `app/src/app/api/staff/route.ts` | `findMany({ where: { shopId } })`, `create` includes `shopId` |
| `app/src/app/api/staff/[id]/route.ts` | Validate `staff.shopId === session.shopId` on GET/PUT/DELETE |
| `app/src/app/api/ingredients/route.ts` | `findMany({ where: { shopId } })`, `create` includes `shopId` |
| `app/src/app/api/ingredients/[id]/route.ts` | Validate ingredient belongs to shop |
| `app/src/app/api/ingredients/[id]/logs/route.ts` | Scope via ingredient's shopId |
| `app/src/app/api/stock-logs/route.ts` | Validate ingredient belongs to shop before logging |
| `app/src/app/api/menu/route.ts` | `findMany({ where: { shopId } })`, `create` includes `shopId` |
| `app/src/app/api/menu/[id]/route.ts` | Validate menuItem belongs to shop |
| `app/src/app/api/sales/route.ts` | `findMany({ where: { shopId } })`, `create` includes `shopId` |
| `app/src/app/api/sales/[id]/route.ts` | Validate sale belongs to shop |
| `app/src/app/api/reports/route.ts` | All sub-queries get `shopId` filter |

---

## 8. UI Updates

- **`app/src/app/page.tsx`** — "Get Started" button links to `/subscribe?plan=ANNUAL` (already correct)
- **`app/src/app/subscribe/page.tsx`** — replace silent redirect flow with email input form
- **`app/src/components/AppShell.tsx`** — subscription check stays as-is (hits `/api/subscriptions/status`)

---

## 9. Execution Order

1. Schema — update `schema.prisma`, run `prisma migrate reset && prisma migrate dev --name add_shop_model`
2. Auth — update `SessionPayload`, update login route to include `shopId`
3. Subscribe page — update to show email input form
4. New APIs — `pending-registration` (POST + GET), `complete-registration` (POST)
5. New page — `/setup` page
6. Webhook — update to handle `coffman-pending-` prefix
7. Subscription routes — switch to `shopId`
8. Data routes — add `shopId` filter to all 10 routes
9. Final smoke test

---

## 10. Verification

- Visit `/subscribe?plan=ANNUAL` → enter email → redirected to Xendit (test mode)
- Complete Xendit test payment → webhook fires → `PendingRegistration.status = PAID`
- Redirected to `/setup?token=...` → fill in shop name + password → account created
- Lands on `/inventory`, session active, subscription ACTIVE
- Create second shop via same flow → data is fully isolated from first shop
- Owner adds staff from `/staff` → staff log in and see only their shop's data
- Staff (BARISTA) cannot write to ingredients/menu (RBAC still enforced)
