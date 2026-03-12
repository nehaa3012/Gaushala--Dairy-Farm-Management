# 🥛 DudhWala — Milk Management MVP: Complete Agent Guide

> **Stack:** Next.js 16 · TypeScript · Clerk (sync user) · PostgreSQL · Prisma  
> **Goal:** Ship a production-ready milk delivery & farm management app

---

## 📌 TABLE OF CONTENTS

1. [Product Vision](#1-product-vision)
2. [Feature List (All Modules)](#2-feature-list)
3. [Edge Cases](#3-edge-cases)
4. [Database Schema (Prisma)](#4-database-schema)
5. [Project Structure](#5-project-structure)
6. [Tech Stack Details](#6-tech-stack-details)
7. [Step-by-Step Build Order](#7-step-by-step-build-order)
8. [API Routes Reference](#8-api-routes-reference)
9. [UI Pages Reference](#9-ui-pages-reference)
10. [Graphs & Analytics](#10-graphs--analytics)
11. [Clerk Auth — Sync User (No Webhook)](#11-clerk-auth--sync-user-no-webhook)
12. [Environment Variables](#12-environment-variables)
13. [Deployment Checklist](#13-deployment-checklist)

---

## 1. PRODUCT VISION

**DudhWala** is a full-stack milk farm management + delivery tracking SaaS for small dairy farmers and milk delivery businesses. The owner can:

- Add customers and track how many liters they receive each day/month
- Record how much feed (fodder, concentrate, etc.) the cow consumes
- Track all farm expenses (feed, medicine, electricity, labor, etc.)
- See how many total liters were sold and revenue generated
- Visualize everything through charts and dashboards

---

## 2. FEATURE LIST

### 🔐 MODULE 1: Authentication (Clerk)
- Sign Up / Sign In / Sign Out
- Google OAuth + Email/Password
- User profile sync to PostgreSQL (sync, NOT webhook)
- Role: Owner (single tenant MVP)

---

### 👥 MODULE 2: Customer Management
- Add a new customer (name, phone, address, notes)
- Edit customer details
- Deactivate/reactivate customer (soft delete)
- View customer list with search + filter (active/inactive)
- View individual customer profile page

**Edge cases:**
- Duplicate phone numbers → validation error
- Customer with existing deliveries cannot be hard deleted → soft delete only
- Empty delivery months auto-show zero balance

---

### 🥛 MODULE 3: Daily Milk Delivery Tracking
- Record how many liters of milk a customer received per day
- Support for multiple entries per day (morning + evening rounds)
- Edit or delete a delivery entry (within same day only — lock after 24h)
- Monthly view: calendar grid showing liters per day per customer
- Mark a day as "holiday" (no delivery, no charge)
- Partial delivery flag (e.g., only half liter delivered)

**Edge cases:**
- Entering 0 liters = valid (customer skipped that day)
- Negative liters not allowed
- Future dates cannot be entered
- Milk price per liter can differ per customer
- If customer is inactive, deliveries cannot be added

---

### 💵 MODULE 4: Monthly Billing
- Auto-calculate monthly bill per customer: (total liters × price/liter)
- Generate a PDF/printable monthly statement per customer
- Mark bill as paid / unpaid / partially paid
- Track outstanding balance per customer
- Monthly due date reminder flag

**Edge cases:**
- Price changes mid-month → use price valid on delivery date, not current price
- Partial payments: track remaining balance correctly
- If no deliveries in a month, bill = ₹0 but record still created
- Overpayment: carry forward as credit

---

### 🐄 MODULE 5: Cow / Animal Management
- Add cows (name/tag number, breed, age, date added)
- Mark cow as active / dry / sold / deceased
- Track which cow is producing how much milk per day (optional: link delivery to cow)
- Total milk production per cow per day/month

**Edge cases:**
- Cow sold/deceased mid-month → production records still preserved
- A farm may have 0 cows initially (onboarding state)

---

### 🌾 MODULE 6: Feed Management & Feed Graph
- Add daily feed entries per cow:
  - Feed Type (green fodder, dry fodder, concentrate, silage, mineral mix)
  - Quantity (kg)
  - Cost per kg
  - Total cost (auto-calculated)
- Monthly feed summary per cow and across farm
- **Graph: Feed consumed (kg) per day — line chart**
- **Graph: Feed cost breakdown by type — pie/donut chart**
- **Graph: Feed cost vs Milk revenue — bar chart (monthly)**

**Edge cases:**
- Feed entry without a cow (farm-level feed) is valid
- Zero feed on a day = valid (holiday, fasting, sick cow)
- Feed type not in dropdown → allow custom entry

---

### 💰 MODULE 7: Expense Tracking
- Add expense entries:
  - Category: Feed | Medicine/Vet | Labor | Electricity | Maintenance | Transport | Other
  - Amount
  - Date
  - Notes/description
  - Recurring flag (monthly auto-entry)
- Monthly expense total
- **Graph: Expense breakdown by category — donut chart**
- **Graph: Monthly expenses trend — line/bar chart**
- **Graph: Total expenses vs Total revenue — bar chart comparison**

**Edge cases:**
- Recurring expenses: auto-generate next month entry but allow editing
- Expense with no category defaults to "Other"
- Negative expenses (refunds/rebates) allowed with note required

---

### 📊 MODULE 8: Dashboard & Analytics
Main dashboard shows:

#### KPI Cards
- Total liters sold this month
- Total revenue this month
- Total expenses this month
- Net profit this month
- Outstanding dues (sum of all unpaid bills)
- Active customers count
- Active cows count

#### Charts (all time-range filterable: 7d / 30d / 3m / 6m / 1y)

| Chart | Type | Data |
|---|---|---|
| Milk Production vs Sales | Dual-line | Liters produced vs liters delivered |
| Revenue Trend | Area chart | Monthly revenue |
| Expense Breakdown | Donut | By category |
| Feed Cost vs Milk Revenue | Grouped bar | Monthly comparison |
| Cow Feed Consumption | Line | kg/day per cow |
| Customer-wise Consumption | Horizontal bar | Top 10 customers by liters |
| Outstanding Dues | Table + bar | Per customer |

---

### 📋 MODULE 9: Reports
- Monthly report: full farm summary (PDF export)
- Customer statement: per customer per month (PDF)
- Date-range custom report
- CSV export for all data tables

---

### ⚙️ MODULE 10: Settings
- Farm profile (name, address, phone, logo)
- Default milk price per liter (overrideable per customer)
- Currency symbol
- Timezone
- Notification preferences (email summary — optional for MVP v2)

---

## 3. EDGE CASES

### Data Integrity
- All monetary values stored as integers (paise/cents) to avoid float precision bugs
- Liters stored as Decimal(10,2) in Prisma
- Dates stored in UTC, displayed in user's local timezone
- All deletes are soft deletes (deletedAt timestamp)

### Concurrency
- Two tabs editing the same delivery → last write wins (acceptable for MVP)
- No optimistic locking needed for MVP

### Onboarding
- New user lands on onboarding wizard: set up farm → add first cow → add first customer
- Skip onboarding allowed

### Empty States
- No customers yet → CTA to add first customer
- No cows yet → CTA to add first cow
- No data for chart range → empty state illustration, not broken chart

### Validation
- Phone: Indian mobile number format (10 digits, starts with 6–9)
- Liters: 0.25 increments minimum (quarter-liter precision)
- All required fields validated client-side (React Hook Form) + server-side (Zod)

### Security
- All API routes protected by Clerk `auth()` check
- Users can only access their own farm's data (userId filter on all queries)
- Prisma parameterized queries prevent SQL injection

---

## 4. DATABASE SCHEMA

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  clerkId       String    @unique
  email         String    @unique
  name          String?
  farmName      String?
  phone         String?
  address       String?
  currency      String    @default("INR")
  defaultMilkPrice Decimal @default(0) @db.Decimal(10, 2)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  customers     Customer[]
  cows          Cow[]
  expenses      Expense[]
  feedEntries   FeedEntry[]
}

model Customer {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  phone       String?
  address     String?
  notes       String?
  pricePerLiter Decimal @db.Decimal(10, 2)
  isActive    Boolean   @default(true)
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  deliveries  Delivery[]
  bills       Bill[]

  @@index([userId])
}

model Delivery {
  id          String    @id @default(cuid())
  customerId  String
  customer    Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  date        DateTime  @db.Date
  liters      Decimal   @db.Decimal(10, 2)
  session     Session   @default(MORNING)  // MORNING | EVENING
  priceAtTime Decimal   @db.Decimal(10, 2)  // snapshot of price on that day
  isHoliday   Boolean   @default(false)
  notes       String?
  lockedAt    DateTime?  // locked after 24h
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([customerId, date, session])
  @@index([customerId, date])
}

enum Session {
  MORNING
  EVENING
}

model Bill {
  id            String    @id @default(cuid())
  customerId    String
  customer      Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  month         Int       // 1-12
  year          Int
  totalLiters   Decimal   @db.Decimal(10, 2)
  totalAmount   Decimal   @db.Decimal(10, 2)
  paidAmount    Decimal   @db.Decimal(10, 2) @default(0)
  status        BillStatus @default(UNPAID)
  dueDate       DateTime?
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  payments      Payment[]

  @@unique([customerId, month, year])
}

enum BillStatus {
  UNPAID
  PARTIAL
  PAID
}

model Payment {
  id        String   @id @default(cuid())
  billId    String
  bill      Bill     @relation(fields: [billId], references: [id], onDelete: Cascade)
  amount    Decimal  @db.Decimal(10, 2)
  paidAt    DateTime @default(now())
  notes     String?
  createdAt DateTime @default(now())
}

model Cow {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tagNumber   String?
  name        String
  breed       String?
  age         Int?      // in months
  status      CowStatus @default(ACTIVE)
  addedAt     DateTime  @default(now())
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  feedEntries FeedEntry[]

  @@index([userId])
}

enum CowStatus {
  ACTIVE
  DRY
  SOLD
  DECEASED
}

model FeedEntry {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  cowId       String?
  cow         Cow?      @relation(fields: [cowId], references: [id])
  date        DateTime  @db.Date
  feedType    FeedType
  customType  String?   // if feedType = CUSTOM
  quantityKg  Decimal   @db.Decimal(10, 2)
  costPerKg   Decimal   @db.Decimal(10, 2)
  totalCost   Decimal   @db.Decimal(10, 2)  // computed: quantityKg * costPerKg
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId, date])
}

enum FeedType {
  GREEN_FODDER
  DRY_FODDER
  CONCENTRATE
  SILAGE
  MINERAL_MIX
  CUSTOM
}

model Expense {
  id          String          @id @default(cuid())
  userId      String
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    ExpenseCategory
  amount      Decimal         @db.Decimal(10, 2)
  date        DateTime        @db.Date
  notes       String?
  isRecurring Boolean         @default(false)
  deletedAt   DateTime?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([userId, date])
}

enum ExpenseCategory {
  FEED
  MEDICINE
  LABOR
  ELECTRICITY
  MAINTENANCE
  TRANSPORT
  OTHER
}
```

---

## 5. PROJECT STRUCTURE

```
dudhwala/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           ← Sidebar + topbar
│   │   │   ├── page.tsx             ← Dashboard home
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx         ← Customer list
│   │   │   │   ├── [id]/page.tsx    ← Customer detail
│   │   │   │   └── new/page.tsx     ← Add customer
│   │   │   ├── deliveries/
│   │   │   │   ├── page.tsx         ← Daily delivery entry
│   │   │   │   └── [customerId]/page.tsx ← Monthly calendar view
│   │   │   ├── billing/
│   │   │   │   ├── page.tsx         ← All bills
│   │   │   │   └── [customerId]/[month]/[year]/page.tsx
│   │   │   ├── cows/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── feed/
│   │   │   │   └── page.tsx
│   │   │   ├── expenses/
│   │   │   │   └── page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── sync-user/route.ts   ← Clerk sync (called on app load)
│   │   │   ├── customers/
│   │   │   │   ├── route.ts         ← GET list, POST create
│   │   │   │   └── [id]/route.ts    ← GET, PATCH, DELETE
│   │   │   ├── deliveries/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── bills/
│   │   │   │   ├── route.ts
│   │   │   │   ├── generate/route.ts  ← Generate monthly bills
│   │   │   │   └── [id]/route.ts
│   │   │   ├── cows/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── feed/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── expenses/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── analytics/
│   │   │       ├── dashboard/route.ts
│   │   │       ├── feed-chart/route.ts
│   │   │       └── expense-chart/route.ts
│   │   └── layout.tsx               ← Root layout with ClerkProvider
│   ├── components/
│   │   ├── ui/                      ← shadcn/ui components
│   │   ├── charts/
│   │   │   ├── FeedConsumptionChart.tsx
│   │   │   ├── ExpenseBreakdownChart.tsx
│   │   │   ├── RevenueVsExpenseChart.tsx
│   │   │   ├── MilkSalesTrendChart.tsx
│   │   │   └── CustomerConsumptionChart.tsx
│   │   ├── forms/
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── DeliveryForm.tsx
│   │   │   ├── FeedEntryForm.tsx
│   │   │   └── ExpenseForm.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── MobileNav.tsx
│   │   └── shared/
│   │       ├── KPICard.tsx
│   │       ├── DataTable.tsx
│   │       ├── EmptyState.tsx
│   │       └── LoadingSpinner.tsx
│   ├── lib/
│   │   ├── prisma.ts                ← Prisma singleton
│   │   ├── auth.ts                  ← getCurrentUser helper
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useCustomers.ts
│   │   ├── useDeliveries.ts
│   │   └── useAnalytics.ts
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts                ← Clerk route protection
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 6. TECH STACK DETAILS

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Full-stack, server components, API routes |
| Language | TypeScript | Type safety across entire codebase |
| Auth | Clerk | Easy social auth, session management, user sync |
| Database | PostgreSQL | Relational, great for billing/financial data |
| ORM | Prisma | Type-safe DB queries, migrations |
| Styling | Tailwind CSS + shadcn/ui | Fast UI development |
| Charts | Recharts | React-native charts, highly customizable |
| Forms | React Hook Form + Zod | Validation on client and server |
| PDF Export | @react-pdf/renderer or jsPDF | Bill/report PDF generation |
| State | TanStack Query (React Query) | Server state, caching, background sync |
| Hosting | Vercel | Zero-config Next.js deployment |
| DB Hosting | Neon (PostgreSQL) or Supabase | Serverless Postgres, free tier available |

---

## 7. STEP-BY-STEP BUILD ORDER

### ✅ PHASE 0: Project Setup (Day 1)

```bash
# Step 1: Create Next.js project
npx create-next-app@latest dudhwala --typescript --tailwind --eslint --app --src-dir

cd dudhwala

# Step 2: Install all dependencies
npm install @clerk/nextjs prisma @prisma/client
npm install @tanstack/react-query axios zod react-hook-form @hookform/resolvers
npm install recharts
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react date-fns clsx tailwind-merge

# Step 3: Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select dialog table badge

# Step 4: Init Prisma
npx prisma init

# Step 5: Configure .env.local (see Section 12)
```

---

### ✅ PHASE 1: Auth + DB Foundation (Day 1–2)

**Step 1.1 — Configure Clerk**

In `src/app/layout.tsx`:
```tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

**Step 1.2 — Middleware**

`src/middleware.ts`:
```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) auth().protect()
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
```

**Step 1.3 — Auth Pages**

`src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`:
```tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  )
}
```

Same for sign-up.

**Step 1.4 — Prisma Schema**

Paste the full schema from Section 4 into `prisma/schema.prisma`.

```bash
npx prisma migrate dev --name init
npx prisma generate
```

**Step 1.5 — Prisma Singleton**

`src/lib/prisma.ts`:
```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 1.6 — User Sync API (NO WEBHOOK)**

`src/app/api/sync-user/route.ts`:
```ts
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim(),
    },
    create: {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim(),
    },
  })

  return NextResponse.json(user)
}
```

**Step 1.7 — getCurrentUser Helper**

`src/lib/auth.ts`:
```ts
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  const { userId: clerkId } = auth()
  if (!clerkId) return null

  const user = await prisma.user.findUnique({
    where: { clerkId },
  })

  return user
}
```

**Step 1.8 — Sync User on Dashboard Load**

In `src/app/(dashboard)/layout.tsx`, call `/api/sync-user` once on first mount:
```tsx
'use client'
import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/sync-user', { method: 'POST' }).catch(console.error)
    }
  }, [isSignedIn])

  return <div>{children}</div>
}
```

---

### ✅ PHASE 2: Customer Module (Day 2–3)

**Step 2.1 — Customer API Routes**

`src/app/api/customers/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  pricePerLiter: z.number().min(0),
})

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const customers = await prisma.customer.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(customers)
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = customerSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  // Check for duplicate phone
  if (parsed.data.phone) {
    const existing = await prisma.customer.findFirst({
      where: { userId: user.id, phone: parsed.data.phone, deletedAt: null },
    })
    if (existing) return NextResponse.json({ error: 'Phone already exists' }, { status: 409 })
  }

  const customer = await prisma.customer.create({
    data: { ...parsed.data, userId: user.id },
  })

  return NextResponse.json(customer, { status: 201 })
}
```

**Step 2.2 — Customer UI Pages**

- `customers/page.tsx` → table with search, active/inactive toggle
- `customers/new/page.tsx` → CustomerForm component
- `customers/[id]/page.tsx` → Profile: delivery history, current month summary, bill status

---

### ✅ PHASE 3: Delivery Tracking Module (Day 3–4)

**Step 3.1 — Delivery API**

`src/app/api/deliveries/route.ts`:
```ts
const deliverySchema = z.object({
  customerId: z.string(),
  date: z.string().datetime(),
  liters: z.number().min(0).max(100),
  session: z.enum(['MORNING', 'EVENING']),
  isHoliday: z.boolean().optional(),
  notes: z.string().optional(),
})

// POST: Create delivery
// Capture priceAtTime from customer.pricePerLiter at creation time
// Validate: date cannot be in future
// Validate: customer must be active
// Validate: 24h lock on edits (check lockedAt)
```

**Step 3.2 — Daily Delivery Page**

- Top: date picker (defaults to today)
- Below: list of all active customers
- Each row: customer name | morning liters input | evening liters input | save button
- Quick entry: Tab through all inputs, press Enter to save

**Step 3.3 — Monthly Calendar View**

- `deliveries/[customerId]/page.tsx`
- Calendar grid: 31 days
- Each cell: show liters (morning + evening)
- Color: green = delivered, gray = holiday, red = missed

---

### ✅ PHASE 4: Billing Module (Day 4–5)

**Step 4.1 — Bill Generation API**

`src/app/api/bills/generate/route.ts`:
```ts
// For a given month/year, sum all deliveries × priceAtTime
// Create Bill records (upsert)
// Can be triggered: manually by user, or auto on month end
```

**Step 4.2 — Payment Recording**

`PATCH /api/bills/[id]`:
```ts
// Add payment → create Payment record
// Update bill.paidAmount
// Update bill.status (UNPAID → PARTIAL → PAID)
// Handle overpayment: paidAmount > totalAmount → mark as PAID + note credit
```

---

### ✅ PHASE 5: Cow + Feed Module (Day 5–6)

**Step 5.1 — Cow CRUD APIs**

Standard CRUD similar to Customer.  
Status transitions: ACTIVE → DRY / SOLD / DECEASED (irreversible except DRY ↔ ACTIVE).

**Step 5.2 — Feed Entry API**

`src/app/api/feed/route.ts`:
```ts
// POST feed entry
// Auto-calculate totalCost = quantityKg * costPerKg
// Allow cowId = null (farm-level feed)
// Validate feedType; if CUSTOM, require customType
```

**Step 5.3 — Feed Chart Data API**

`src/app/api/analytics/feed-chart/route.ts`:
```ts
// Query: group feed entries by date, sum quantityKg
// Query: group feed entries by feedType, sum totalCost
// Return both datasets in single response
```

---

### ✅ PHASE 6: Expense Module (Day 6)

**Step 6.1 — Expense CRUD**

Standard CRUD. Category defaults to "OTHER".  
Recurring expenses: when `isRecurring=true`, store once. On month start, auto-generate copy.

**Step 6.2 — Expense Analytics API**

`src/app/api/analytics/expense-chart/route.ts`:
```ts
// Group by category → for donut chart
// Group by month → for trend line chart
// Compare total expenses vs total revenue per month
```

---

### ✅ PHASE 7: Dashboard & Charts (Day 7)

**Step 7.1 — Dashboard KPI API**

`src/app/api/analytics/dashboard/route.ts`:
```ts
// All queries use: WHERE userId = currentUser.id
const [
  totalLitersSold,    // SUM(deliveries.liters) this month
  totalRevenue,       // SUM(bills.totalAmount) this month
  totalExpenses,      // SUM(expenses.amount) this month
  outstandingDues,    // SUM(bills.totalAmount - bills.paidAmount) WHERE status != PAID
  activeCustomers,    // COUNT(customers) WHERE isActive = true
  activeCows,         // COUNT(cows) WHERE status = ACTIVE
] = await Promise.all([...])
```

**Step 7.2 — Chart Components**

Using Recharts:

```tsx
// FeedConsumptionChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function FeedConsumptionChart({ data }: { data: FeedChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: 'kg', angle: -90 }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="quantityKg" stroke="#22c55e" name="Feed (kg)" />
        <Line type="monotone" dataKey="totalCost" stroke="#f59e0b" name="Cost (₹)" />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ExpenseBreakdownChart.tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export function ExpenseBreakdownChart({ data }: { data: ExpenseChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={100} label>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => `₹${v}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

// RevenueVsExpenseChart.tsx — Grouped BarChart
// MilkSalesTrendChart.tsx — AreaChart
// CustomerConsumptionChart.tsx — HorizontalBarChart
```

---

### ✅ PHASE 8: Reports + PDF Export (Day 8)

```bash
npm install jspdf jspdf-autotable
```

Generate customer monthly bill PDF client-side:
- Header: farm name, logo, customer info
- Table: date | session | liters | rate | amount
- Footer: total liters, total amount, paid, balance due

---

### ✅ PHASE 9: Settings + Polish (Day 9)

- Settings page: farm name, default price, currency
- Mobile responsive: hamburger nav
- Toast notifications (sonner)
- Loading skeletons
- Error boundaries

---

### ✅ PHASE 10: Deploy (Day 10)

```bash
# Push to GitHub
git init && git add . && git commit -m "initial"
git remote add origin <your-repo-url>
git push -u origin main

# Deploy on Vercel
# 1. Import repo on vercel.com
# 2. Set all environment variables
# 3. Set Build Command: npx prisma generate && next build
# 4. Run migrations on Neon DB
npx prisma migrate deploy
```

---

## 8. API ROUTES REFERENCE

| Method | Route | Description |
|---|---|---|
| POST | /api/sync-user | Sync Clerk user to DB |
| GET | /api/customers | List all customers |
| POST | /api/customers | Create customer |
| GET | /api/customers/[id] | Get single customer |
| PATCH | /api/customers/[id] | Update customer |
| DELETE | /api/customers/[id] | Soft delete customer |
| GET | /api/deliveries | List deliveries (with filters) |
| POST | /api/deliveries | Create delivery entry |
| PATCH | /api/deliveries/[id] | Update delivery (within 24h) |
| DELETE | /api/deliveries/[id] | Delete delivery (within 24h) |
| GET | /api/bills | List bills |
| POST | /api/bills/generate | Generate bills for a month |
| PATCH | /api/bills/[id] | Record payment |
| GET | /api/cows | List cows |
| POST | /api/cows | Add cow |
| PATCH | /api/cows/[id] | Update cow status |
| GET | /api/feed | List feed entries |
| POST | /api/feed | Add feed entry |
| DELETE | /api/feed/[id] | Delete feed entry |
| GET | /api/expenses | List expenses |
| POST | /api/expenses | Add expense |
| PATCH | /api/expenses/[id] | Edit expense |
| DELETE | /api/expenses/[id] | Soft delete expense |
| GET | /api/analytics/dashboard | KPI cards data |
| GET | /api/analytics/feed-chart | Feed chart data |
| GET | /api/analytics/expense-chart | Expense chart data |

---

## 9. UI PAGES REFERENCE

| Route | Page | Key Components |
|---|---|---|
| / | Redirect to /dashboard | — |
| /sign-in | Clerk SignIn | Clerk component |
| /sign-up | Clerk SignUp | Clerk component |
| /dashboard | Main dashboard | KPICards, all charts |
| /customers | Customer list | DataTable, search, filter |
| /customers/new | Add customer | CustomerForm |
| /customers/[id] | Customer detail | DeliveryCalendar, BillSummary |
| /deliveries | Daily delivery entry | QuickDeliveryTable |
| /deliveries/[customerId] | Monthly calendar | CalendarGrid |
| /billing | All bills | BillsTable, StatusFilter |
| /cows | Cow list | CowCard, StatusBadge |
| /cows/[id] | Cow detail | FeedHistory |
| /feed | Feed management | FeedTable, FeedEntryForm |
| /expenses | Expense tracker | ExpenseTable, ExpenseForm |
| /reports | Report generator | DateRangePicker, PDFExport |
| /settings | Farm settings | SettingsForm |

---

## 10. GRAPHS & ANALYTICS

### Graph 1: Cow Feed Consumption (Line Chart)
- **X-axis:** Date (last 30 days by default)
- **Y-axis (left):** Feed consumed (kg/day)
- **Y-axis (right):** Feed cost (₹/day)
- **Lines:** One per feed type (Green Fodder, Concentrate, etc.) + Total
- **Filters:** Per cow / all cows, date range

### Graph 2: Expense Breakdown (Donut Chart)
- **Segments:** Feed | Medicine | Labor | Electricity | Maintenance | Transport | Other
- **Center:** Total expenses for period
- **Tooltip:** Category name + amount + % of total
- **Filters:** Monthly / quarterly / yearly

### Graph 3: Revenue vs Expenses (Grouped Bar Chart)
- **X-axis:** Month (last 6 months)
- **Bars per month:** Revenue (green) | Expenses (red) | Profit (blue)
- **Purpose:** Quick financial health overview

### Graph 4: Total Milk Sold (Area Chart)
- **X-axis:** Date
- **Y-axis:** Liters/day
- **Area fill:** Gradient green
- **Tooltip:** Date + liters + revenue on that day

### Graph 5: Customer-wise Consumption (Horizontal Bar Chart)
- **Y-axis:** Customer names
- **X-axis:** Total liters this month
- **Sorted:** Highest to lowest
- **Purpose:** Identify top customers

### Graph 6: Outstanding Dues (Progress Bar Table)
- **Rows:** Customer | Total bill | Paid | Balance | % paid (progress bar)
- **Color:** Green = fully paid, Yellow = partial, Red = unpaid

---

## 11. CLERK AUTH — SYNC USER (NO WEBHOOK)

This app uses **inline sync** (not webhook) because:
- Simpler setup for MVP (no tunnel/public URL needed)
- Works in both local dev and production

### How it works:
1. User signs in via Clerk
2. Dashboard layout mounts → calls `POST /api/sync-user` once via `useEffect`
3. API route uses `auth()` + `currentUser()` from `@clerk/nextjs/server`
4. `prisma.user.upsert()` creates or updates the user record
5. All subsequent API calls use `getCurrentUser()` helper which looks up by `clerkId`

### Key files:
- `src/app/api/sync-user/route.ts` — upsert logic
- `src/lib/auth.ts` — `getCurrentUser()` helper used in every API route
- `src/app/(dashboard)/layout.tsx` — triggers sync on every authenticated session mount

### Security:
- `auth()` is called first in every protected API route
- If `clerkId` not found in DB (sync hasn't run yet), routes return 401 gracefully
- No personal data stored beyond: email, name, farmName, phone

---

## 12. ENVIRONMENT VARIABLES

```env
# .env.local

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (Neon or Supabase)
DATABASE_URL="postgresql://user:password@host:5432/dudhwala?sslmode=require"
DIRECT_URL="postgresql://user:password@host:5432/dudhwala?sslmode=require"
# (DIRECT_URL needed for Prisma migrations on Neon)
```

`prisma/schema.prisma` datasource:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 13. DEPLOYMENT CHECKLIST

### Pre-deploy
- [ ] All env vars set in Vercel dashboard
- [ ] `npx prisma migrate deploy` run against production DB
- [ ] `npx prisma generate` included in build command
- [ ] Clerk production keys configured
- [ ] Clerk allowed redirect URLs updated to production domain

### Vercel Build Settings
```
Build Command: npx prisma generate && next build
Output Directory: .next
Install Command: npm install
```

### Post-deploy
- [ ] Test sign-up flow end-to-end
- [ ] Test user sync (check DB for new user row)
- [ ] Test create customer + delivery
- [ ] Test bill generation
- [ ] Test all charts load without errors
- [ ] Test on mobile (responsive layout)

---

## 🚀 MVP LAUNCH ORDER SUMMARY

| Day | What to ship |
|---|---|
| Day 1 | Project setup + Clerk auth + DB schema |
| Day 2 | User sync + Sidebar layout |
| Day 3 | Customer module (CRUD + list) |
| Day 4 | Daily delivery tracking |
| Day 5 | Monthly billing + payment recording |
| Day 6 | Cows + Feed tracking |
| Day 7 | Expense tracking |
| Day 8 | Dashboard + all charts |
| Day 9 | Reports + PDF export |
| Day 10 | Polish + mobile + deploy |

---

> **Built with ❤️ for Indian dairy farmers**  
> DudhWala — Track every drop, profit every rupee.