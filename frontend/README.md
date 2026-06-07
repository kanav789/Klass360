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
| `src/components/branches/BranchFormModal.tsx` (create) | `POST /api/branches` | Creates a branch with name, code, address, city, state, and status |
| `src/components/branches/BranchFormModal.tsx` (edit) | `PUT /api/branches/:id` | Updates branch name, code, address, city, state, and status |
| `src/components/branches/DeleteBranchModal.tsx` | `DELETE /api/branches/:id` | Permanently deletes a branch after confirmation |
| `src/services/branchService.ts` | `GET /api/branches/:id` | Available for fetching a single branch (used by service layer) |

### Course Management

| Frontend Location | Backend API | What It Does |
|-------------------|-------------|--------------|
| `src/pages/courses/CoursesPage.tsx` | `GET /api/courses` | Loads all courses into the table on page mount |
| `src/components/courses/CourseFormModal.tsx` (create) | `POST /api/courses` | Creates a course with name, category, duration, description, branches, and status |
| `src/components/courses/CourseFormModal.tsx` (edit) | `PUT /api/courses/:id` | Updates an existing course |
| `src/pages/courses/CoursesPage.tsx` (activate) | `PATCH /api/courses/:id/activate` | Activates a course |
| `src/pages/courses/CoursesPage.tsx` (deactivate) | `PATCH /api/courses/:id/deactivate` | Deactivates a course |
| `src/components/courses/DeleteCourseModal.tsx` | `DELETE /api/courses/:id` | Permanently deletes a course after confirmation |
| `src/pages/courses/CoursesPage.tsx` | `GET /api/branches` | Loads active branches for course assignment in the form |

### Batch Management

> **Note:** Batch and Section are the same. The sidebar shows **Batches** (`/batches`). Backend supports both `/api/batches` and `/api/sections`.

| Frontend Location | Backend API | What It Does |
|-------------------|-------------|--------------|
| `src/pages/sections/SectionsPage.tsx` | `GET /api/sections` | Loads all batches into the table on page mount |
| `src/components/sections/SectionFormModal.tsx` (create) | `POST /api/sections` | Creates a section with name, course, branch, dates, and status |
| `src/components/sections/SectionFormModal.tsx` (edit) | `PUT /api/sections/:id` | Updates an existing section |
| `src/pages/sections/SectionsPage.tsx` (activate) | `PATCH /api/sections/:id/activate` | Activates a section |
| `src/pages/sections/SectionsPage.tsx` (deactivate) | `PATCH /api/sections/:id/deactivate` | Deactivates a section |
| `src/components/sections/DeleteSectionModal.tsx` | `DELETE /api/sections/:id` | Permanently deletes a section after confirmation |
| `src/pages/sections/SectionsPage.tsx` | `GET /api/courses`, `GET /api/branches` | Loads active courses and branches for section form dropdowns |

### User Management

| Frontend Location | Backend API | What It Does |
|-------------------|-------------|--------------|
| `src/pages/users/UsersPage.tsx` | `GET /api/users` | Loads all institute users into the table on page mount |
| `src/components/users/UserFormModal.tsx` (create) | `POST /api/users` | Creates a user with first name, last name, mobile, email, and role |
| `src/components/users/UserFormModal.tsx` (edit) | `PUT /api/users/:id` | Updates an existing user |
| `src/components/users/DeleteUserModal.tsx` | `DELETE /api/users/:id` | Permanently deletes a user after confirmation |
| `src/services/userService.ts` | `GET /api/users/:id` | Available for fetching a single user (used by service layer) |

### Lead Management

| Frontend Location | Backend API | What It Does |
|-------------------|-------------|--------------|
| `src/pages/leads/LeadsPage.tsx` | `GET /api/leads` | Loads all leads into the table on page mount |
| `src/components/leads/LeadFormModal.tsx` (create) | `POST /api/leads` | Creates a lead with name, phone, WhatsApp, branch, course, source, and assigned user |
| `src/components/leads/LeadFormModal.tsx` (edit) | `PUT /api/leads/:id` | Updates lead (phone number is locked and not sent) |
| `src/components/leads/DeleteLeadModal.tsx` | `DELETE /api/leads/:id` | Permanently deletes a lead after confirmation |
| `src/pages/leads/LeadsPage.tsx` | `GET /api/branches`, `GET /api/courses`, `GET /api/users` | Loads dropdown options for branch, course, and assigned user |

### Enquiry Management

| Frontend Location | Backend API | What It Does |
|-------------------|-------------|--------------|
| `src/pages/enquiries/EnquiriesPage.tsx` | `GET /api/enquiries` | Loads all enquiries into the table on page mount |
| `src/components/enquiries/EnquiryFormModal.tsx` (create) | `POST /api/enquiries` | Creates an enquiry linked to a lead with branch, course, assignee, date, status, and notes |
| `src/components/enquiries/EnquiryFormModal.tsx` (edit) | `PUT /api/enquiries/:id` | Updates an existing enquiry |
| `src/components/enquiries/DeleteEnquiryModal.tsx` | `DELETE /api/enquiries/:id` | Permanently deletes an enquiry after confirmation |
| `src/pages/enquiries/EnquiriesPage.tsx` | `GET /api/leads`, `GET /api/branches`, `GET /api/courses`, `GET /api/users` | Loads dropdown options; selecting a lead auto-fills branch, course, and assignee on create |

### Admission Management

| Frontend Location | Backend API | What It Does |
|-------------------|-------------|--------------|
| `src/pages/admissions/AdmissionsPage.tsx` | `GET /api/admissions` | Loads all admissions into the table on page mount |
| `src/components/admissions/AdmissionFormModal.tsx` (create) | `POST /api/admissions` | Creates admission from enquiry; auto-creates linked student |
| `src/components/admissions/AdmissionFormModal.tsx` (edit) | `PUT /api/admissions/:id` | Updates admission and syncs student details |
| `src/components/admissions/DeleteAdmissionModal.tsx` | `DELETE /api/admissions/:id` | Deletes admission and linked student after confirmation |
| `src/pages/admissions/AdmissionsPage.tsx` | `GET /api/enquiries`, `GET /api/branches`, `GET /api/courses`, `GET /api/sections` | Loads dropdown options; selecting enquiry auto-fills lead, branch, and course |

### Student Directory

| Frontend Location | Backend API | What It Does |
|-------------------|-------------|--------------|
| `src/pages/students/StudentsPage.tsx` | `GET /api/students` | Read-only listing of students created from admissions |

### Institute Settings

| Frontend Location | Backend API | What It Does |
|-------------------|-------------|--------------|
| `src/pages/settings/SettingsPage.tsx` | `GET /api/institutes` | Loads all institutes in the settings table |
| `src/components/institutes/InstituteFormModal.tsx` (create) | `POST /api/institutes` | Creates institute with logo upload via `multipart/form-data` |
| `src/components/institutes/InstituteFormModal.tsx` (edit) | `PUT /api/institutes/:id` | Updates institute and optionally replaces logo |
| `src/components/institutes/DeleteInstituteModal.tsx` | `DELETE /api/institutes/:id` | Deletes institute and logo after confirmation |
| `src/context/InstituteContext.tsx` | `GET /api/institutes/active` | Loads active institute for sidebar branding |
| `src/components/layout/Sidebar.tsx` | — | Displays institute logo and name in sidebar header |

### Fee Management

| Frontend Location | Backend API | What It Does |
|-------------------|-------------|--------------|
| `src/pages/fees/FeesPage.tsx` | `GET /api/fees` | Loads all fee records into the table on page mount |
| `src/components/fees/FeeFormModal.tsx` (create) | `POST /api/fees` | Creates fee record; discount and net fee auto-filled from admission |
| `src/components/fees/FeeFormModal.tsx` (edit) | `PUT /api/fees/:id` | Updates paid amount; pending amount and status recalculated |
| `src/components/fees/DeleteFeeModal.tsx` | `DELETE /api/fees/:id` | Permanently deletes a fee record after confirmation |
| `src/pages/fees/FeesPage.tsx` | `GET /api/admissions` | Loads admissions for the fee form dropdown |

### API Layer

| File | Role |
|------|------|
| `src/lib/api.ts` | Base HTTP client — attaches JWT, handles errors, manages token storage |
| `src/services/authService.ts` | Auth-specific API calls (register, login, getMe, logout) |
| `src/services/branchService.ts` | Branch CRUD API calls (getAll, getById, create, update, delete) |
| `src/services/courseService.ts` | Course CRUD + activate/deactivate API calls |
| `src/services/sectionService.ts` | Section CRUD + activate/deactivate API calls |
| `src/services/userService.ts` | User CRUD API calls |
| `src/services/leadService.ts` | Lead CRUD API calls |
| `src/services/enquiryService.ts` | Enquiry CRUD API calls |
| `src/services/admissionService.ts` | Admission CRUD API calls |
| `src/services/studentService.ts` | Student read-only API calls |
| `src/services/feeService.ts` | Fee CRUD API calls |
| `src/services/instituteService.ts` | Institute CRUD + logo upload API calls |
| `src/types/auth.ts` | TypeScript interfaces for admin and API responses |
| `src/types/branch.ts` | TypeScript interfaces for branch and API responses |
| `src/types/course.ts` | TypeScript interfaces for course and API responses |
| `src/types/section.ts` | TypeScript interfaces for section and API responses |
| `src/types/user.ts` | TypeScript interfaces for user and API responses |
| `src/types/lead.ts` | TypeScript interfaces for lead and API responses |
| `src/types/enquiry.ts` | TypeScript interfaces for enquiry and API responses |
| `src/types/admission.ts` | TypeScript interfaces for admission and API responses |
| `src/types/student.ts` | TypeScript interfaces for student and API responses |
| `src/types/fee.ts` | TypeScript interfaces for fee and API responses |
| `src/types/institute.ts` | TypeScript interfaces for institute and API responses |

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
│   ├── courses/
│   │   ├── CourseFormModal.tsx    # Create/edit course modal
│   │   └── DeleteCourseModal.tsx  # Delete confirmation modal
│   ├── sections/
│   │   ├── SectionFormModal.tsx   # Create/edit section modal
│   │   └── DeleteSectionModal.tsx # Delete confirmation modal
│   ├── users/
│   │   ├── UserFormModal.tsx      # Create/edit user modal
│   │   └── DeleteUserModal.tsx    # Delete confirmation modal
│   ├── leads/
│   │   ├── LeadFormModal.tsx      # Create/edit lead modal
│   │   └── DeleteLeadModal.tsx    # Delete confirmation modal
│   ├── enquiries/
│   │   ├── EnquiryFormModal.tsx   # Create/edit enquiry modal
│   │   └── DeleteEnquiryModal.tsx # Delete confirmation modal
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
│   ├── courses/
│   │   └── CoursesPage.tsx        # Course list + CRUD UI
│   ├── sections/
│   │   └── SectionsPage.tsx       # Section list + CRUD UI
│   ├── users/
│   │   └── UsersPage.tsx          # User list + CRUD UI
│   ├── leads/
│   │   └── LeadsPage.tsx          # Lead list + CRUD UI
│   ├── enquiries/
│   │   └── EnquiriesPage.tsx      # Enquiry list + CRUD UI
│   └── PlaceholderPage.tsx        # Placeholder for future pages
├── services/
│   ├── authService.ts             # Auth API service
│   ├── branchService.ts           # Branch API service
│   ├── courseService.ts           # Course API service
│   ├── sectionService.ts          # Section API service
│   ├── userService.ts             # User API service
│   ├── leadService.ts             # Lead API service
│   └── enquiryService.ts          # Enquiry API service
├── types/
│   ├── auth.ts                    # Auth TypeScript types
│   ├── branch.ts                  # Branch TypeScript types
│   ├── course.ts                  # Course TypeScript types
│   ├── section.ts                 # Section TypeScript types
│   ├── user.ts                    # User TypeScript types
│   ├── lead.ts                    # Lead TypeScript types
│   └── enquiry.ts                 # Enquiry TypeScript types
├── App.tsx                        # Route definitions
└── main.tsx                       # App entry with AuthProvider
```

---

## Routes

| Route | Access | Page |
|-------|--------|------|
| `/login` | Guest only | Admin login |
| `/signup` | Guest only | Admin registration |
| `/enquiries` | Protected | Enquiry management (CRUD) — default landing page |
| `/admissions` | Protected | Admission management (CRUD) |
| `/dashboard` | Protected | Placeholder |
| `/leads` | Protected | Lead management (CRUD) |
| `/students` | Protected | Student directory (read-only listing) |
| `/branches` | Protected | Branch management (CRUD) |
| `/courses` | Protected | Course management (CRUD + activate/deactivate) |
| `/batches` | Protected | Batch management (CRUD + activate/deactivate) |
| `/sections` | Protected | Redirects to `/batches` |
| `/users` | Protected | User management (CRUD) |
| `/fees` | Protected | Fee management (CRUD) |
| `/reports` | Protected | Placeholder |
| `/calendar` | Protected | Placeholder |
| `/settings` | Protected | Institute management (CRUD + logo upload) |
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
