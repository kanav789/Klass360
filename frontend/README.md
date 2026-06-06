# Klass360 Frontend

React + TypeScript + Tailwind CSS admin dashboard for the Klass360 education CRM.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **Icons:** Lucide React
- **UI:** shadcn-style components (Button, Input, Card, Checkbox, Label)

## Getting Started

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (default: `http://localhost:5000/api`) |

### 3. Run the dev server

```bash
npm run dev
```

App runs at `http://localhost:5173`.

> **Backend required:** Start the backend (`npm run dev` in `/backend`) and MongoDB before testing login/signup.

---

## Backend Integration Map

This section documents **what frontend feature connects to which backend API**.

### Authentication

| Frontend Location | Backend API | What It Does |
|-------------------|-------------|--------------|
| `src/pages/auth/SignupPage.tsx` | `POST /api/auth/register` | Creates a new admin account with full name, email, and password |
| `src/pages/auth/LoginPage.tsx` | `POST /api/auth/login` | Signs in admin with email and password; stores JWT token |
| `src/context/AuthContext.tsx` (on app load) | `GET /api/auth/me` | Validates stored token and restores admin session |
| `src/components/layout/TopHeader.tsx` | `POST /api/auth/logout` | Logs out admin and clears stored token |

### Branch Management

| Frontend Location | Backend API | What It Does |
|-------------------|-------------|--------------|
| `src/pages/branches/BranchesPage.tsx` | `GET /api/branches` | Loads all branches into the table on page mount |
| `src/components/branches/BranchFormModal.tsx` (create) | `POST /api/branches` | Creates a new branch with entity name and address |
| `src/components/branches/BranchFormModal.tsx` (edit) | `PUT /api/branches/:id` | Updates an existing branch's name and address |
| `src/components/branches/DeleteBranchModal.tsx` | `DELETE /api/branches/:id` | Permanently deletes a branch after confirmation |
| `src/services/branchService.ts` | `GET /api/branches/:id` | Available for fetching a single branch (used by service layer) |

### API Layer

| File | Role |
|------|------|
| `src/lib/api.ts` | Base HTTP client — attaches JWT, handles errors, manages token storage |
| `src/services/authService.ts` | Auth-specific API calls (register, login, getMe, logout) |
| `src/services/branchService.ts` | Branch CRUD API calls (getAll, getById, create, update, delete) |
| `src/types/auth.ts` | TypeScript interfaces for admin and API responses |
| `src/types/branch.ts` | TypeScript interfaces for branch and API responses |

### Route Protection

| File | Role |
|------|------|
| `src/components/auth/ProtectedRoute.tsx` | Blocks unauthenticated users from dashboard routes; redirects to `/login` |
| `src/components/auth/GuestRoute.tsx` | Blocks authenticated users from `/login` and `/signup`; redirects to `/enquiries` |
| `src/App.tsx` | Wires protected and guest route groups |

### Token Storage

| Behavior | Storage |
|----------|---------|
| "Remember me" checked on login | `localStorage` (`klass360_auth_token`) |
| "Remember me" unchecked | `sessionStorage` (`klass360_auth_token`) |
| Logout | Clears both storages |

---

## Auth Flow

```
App Load
   │
   ▼
AuthProvider checks localStorage / sessionStorage for token
   │
   ├── Token found ──► GET /api/auth/me ──► Session restored
   │                         │
   │                         └── Invalid token ──► Clear storage, redirect to /login
   │
   └── No token ──► User stays on guest routes

Login (/login)
   │
   ▼
POST /api/auth/login
   │
   ├── Success ──► Store token ──► Redirect to /enquiries (or previous page)
   └── Error ──► Show error message on form

Signup (/signup)
   │
   ▼
POST /api/auth/register
   │
   ├── Success ──► Store token ──► Redirect to /enquiries
   └── Error ──► Show error message on form

Logout (header button)
   │
   ▼
POST /api/auth/logout ──► Clear token ──► Redirect to /login
```

---

## Project Structure

```
frontend/src/
├── components/
│   ├── auth/
│   │   ├── AuthSplitLayout.tsx    # Split-screen auth layout
│   │   ├── GuestRoute.tsx         # Redirects logged-in users away from auth pages
│   │   └── ProtectedRoute.tsx     # Guards dashboard routes
│   ├── branches/
│   │   ├── BranchFormModal.tsx    # Create/edit branch modal
│   │   └── DeleteBranchModal.tsx  # Delete confirmation modal
│   ├── brand/
│   │   └── Logo.tsx
│   ├── layout/
│   │   ├── DashboardLayout.tsx    # Sidebar + header + content shell
│   │   ├── Sidebar.tsx            # Left navigation
│   │   └── TopHeader.tsx          # Search, notifications, admin info, logout
│   └── ui/                        # Reusable UI primitives
├── context/
│   └── AuthContext.tsx            # Global auth state and actions
├── lib/
│   └── api.ts                     # HTTP client and token helpers
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx          # Integrated with POST /auth/login
│   │   └── SignupPage.tsx         # Integrated with POST /auth/register
│   ├── branches/
│   │   └── BranchesPage.tsx       # Branch list + CRUD UI
│   └── PlaceholderPage.tsx        # Placeholder for future pages
├── services/
│   ├── authService.ts             # Auth API service
│   └── branchService.ts           # Branch API service
├── types/
│   ├── auth.ts                    # Auth TypeScript types
│   └── branch.ts                  # Branch TypeScript types
├── App.tsx                        # Route definitions
└── main.tsx                       # App entry with AuthProvider
```

---

## Routes

| Route | Access | Page |
|-------|--------|------|
| `/login` | Guest only | Admin login |
| `/signup` | Guest only | Admin registration |
| `/enquiries` | Protected | Default dashboard page |
| `/dashboard` | Protected | Placeholder |
| `/leads` | Protected | Placeholder |
| `/students` | Protected | Placeholder |
| `/branches` | Protected | Branch management (CRUD) |
| `/fees` | Protected | Placeholder |
| `/reports` | Protected | Placeholder |
| `/calendar` | Protected | Placeholder |
| `/settings` | Protected | Placeholder |
| `/support` | Protected | Placeholder |

---

## Design System

| Token | Value |
|-------|-------|
| Primary Lime Green | `#B6E92E` |
| Dark Sidebar | `#042F43` |
| Background | `#F5F7FB` |
| Primary Text | `#0B2F44` |
| Secondary Text | `#64748B` |
| Card Radius | `16px` |
| Font | Inter |

Defined in `src/index.css` via Tailwind `@theme`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
