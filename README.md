# 🐄 Gaushala Dairy Farm Management System

A modern, full-stack web application designed to digitize and simplify dairy farm operations. Track milk distribution, manage customers, monitor expenses, and gain insights through an intuitive dashboard.

🚀 **Live Demo**: https://gaushala-dairy-farm-management.vercel.app/  
📂 **GitHub Repo**: https://github.com/nehaa3012/Gaushala--Dairy-Farm-Management/

---

## ✨ Features

- **Milk Distribution Tracking** – Record daily milk supply per customer  
- **Customer Management** – Maintain monthly logs and customer records  
- **Expense Tracking** – Monitor feed, electricity, transport, maintenance, and medicine costs  
- **Analytics Dashboard** – Visual insights into milk production and expenses  
- **Authentication System** – Secure login with Clerk  
- **Monthly Summaries** – Get detailed reports of farm activity  
- **Responsive UI** – Clean and fast user experience  

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** – React framework with App Router  
- **React** – UI library  
- **Tailwind CSS + shadcn/ui** – Styling  

### Backend
- **Next.js API Routes** – Serverless APIs  
- **Prisma** – ORM  
- **PostgreSQL** – Database  

### Integrations
- **Clerk** – Authentication  
- **Vercel** – Deployment  

---

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js 18+ installed  
- PostgreSQL database  
- Clerk account for authentication  

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/nehaa3012/Gaushala--Dairy-Farm-Management.git
cd Gaushala--Dairy-Farm-Management
```

2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Environment Variables
Create a .env file:

```bash
# Database
DATABASE_URL=your_postgresql_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_secret_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

5. Run Development Server

```bash
npm run dev
```
Open 👉 http://localhost:3000

## 📁 Project Structure

```bash
gaushala-dairy-farm-management/
├── app/
│   ├── api/                 # Backend API routes
│   ├── dashboard/           # Main dashboard pages
│   └── layout.js
├── components/              # Reusable UI components
├── lib/                     # Utilities and configs
├── prisma/                  # Database schema
├── public/                  # Static assets
└── styles/                  # Global styles
```

## 🎯 Key Features Explained

### 1. Milk Tracking System
Track daily milk supply per customer
Maintain monthly records automatically
Easy editing and updates

### 2. Expense Management
Categorize expenses (feed, electricity, etc.)
Track daily and monthly costs
Get total expense insights

### 3. Dashboard Analytics
Visual representation of:
Milk production
Customer consumption
Expenses vs revenue

### 4. Authentication System
Secure login/signup using Clerk
User-specific data handling
