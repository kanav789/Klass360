# Multi-tenant Klass360: Superadmin + Admin-owned Institutes

## Goal
- An admin can own **multiple institutes** (creates them in Settings; ownership = existing `Institute.createdBy → Admin` field).
- Admins see/manage **only their own institutes' data**. A new **superadmin** role sees **all admins, all institutes, and all data**, and can drill into any admin's institute.
- Superadmin is created once via a seed script. Public `/signup` stays open and always creates normal admins (who then create their first institute).

## Key design decisions
1. **Ownership link**: reuse `Institute.createdBy` (already set on create) — an admin's institutes = institutes they created. No new join schema, no data migration for ownership.
2. **True tenant isolation**: add an `instituteId` field (indexed, ref Institute) to Course, Section, User, Lead, Enquiry, Admission, Student, Fee — always **derived server-side** from the canonical parent (branch / lead / enquiry / admission), never trusted from the client. This also fixes the global-unique blockers: `Lead.number`, `User.email`, `User.mobile`, `Course.name` become **per-institute compound unique** indexes.
3. **Superadmin bypasses all tenant filters** and drills into a specific institute using the frontend institute switcher (list endpoints honor `?instituteId=` for superadmin).
4. **Frontend institute switching** mirrors the existing branch-filter pattern: sessionStorage key `klass360_selected_institute`; `BranchFilterContext` already re-fetches branches when the institute changes.

---

## Backend (`backend/src/`)

### 1. Roles & auth
- `models/Admin.js`: role enum → `['admin', 'superadmin']`
- `utils/jwt.js`: token payload `{ id, role: admin.role }`
- `middleware/auth.js`: accept both roles; export new `authorize(...roles)` middleware
- **New** `routes/adminRoutes.js` + `controllers/adminController.js` + `validators/adminValidator.js`, mounted at `/api/admins` with `authenticate + authorize('superadmin')`:
  - `GET /api/admins` — list all admins with institute count, status, last login
  - `PATCH /api/admins/:id` — activate/deactivate an admin

### 2. Tenancy helper — `utils/tenancy.js` (new)
- `getOwnedInstituteIds(admin)` → `null` for superadmin (unrestricted) or array of owned institute ids (from `Institute.find({ createdBy })`).
- Used by every controller for list filtering AND ownership checks on `getById/update/delete` (404 when not owned).

### 3. Models
- Add `instituteId` to: `Course.js`, `Section.js`, `User.js`, `Lead.js`, `Enquiry.js`, `Admission.js`, `Student.js`, `Fee.js`
- Index changes: Lead `{instituteId, number}` unique; User `{instituteId, email}` + `{instituteId, mobile}` unique; Course `{instituteId, name}` unique (old global uniques removed from schemas; a script rebuilds them).

### 4. Controllers
- **institute**: list → owned-only (superadmin: all, optional `?ownerId=` for the Admins page drill-down); `GET /active` → returns requested `?instituteId=` if owned, else admin's most recent owned institute (removes the global "most recently updated" heuristic); create/update/delete unchanged except ownership checks.
- **branch**: create replaces the "active institute" heuristic — body `instituteId` must be owned by the admin.
- **course**: create requires all `branchIds` to belong to one owned institute; `instituteId` derived from them.
- **section / user / lead**: `instituteId` derived from the (owned) branch.
- **enquiry**: derived from the (owned) lead; branch must match the same institute. **admission**: derived from the enquiry; branch/batch must match. **fee**: derived from the admission.
- **All list endpoints**: tenant filter ANDed with the optional `branchId` filter; superadmin may pass `?instituteId=` to drill down. All `getById/update/delete`: ownership check (superadmin bypass).

### 5. Scripts (`backend/scripts/`, new npm scripts)
- `seed.js` → `npm run seed`: upsert the superadmin from `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` (added to `.env.example`).
- `migrate-tenancy.js` → `npm run migrate`: backfill `instituteId` on existing rows from their branch/admission parents, then `Model.syncIndexes()` on all models to drop old global uniques and build the compound ones.

---

## Frontend (`frontend/src/`)

### 6. Types & services
- `types/auth.ts`: `Admin.role: 'admin' | 'superadmin'`
- **New** `services/adminService.ts` + `types/admin.ts`
- `services/instituteService` — list stays, now returns only the admin's own institutes (superadmin: all, with owner name).

### 7. Institute switching
- `context/InstituteContext.tsx` reworked: holds `institutes` list + `activeInstitute` + `selectInstitute(id)` (persisted to sessionStorage). Keeps existing exports (`institute`, `instituteName`, `instituteLogoUrl`) so Sidebar and `BranchFilterContext` keep working unchanged.
- **New** `components/layout/InstituteSwitcher.tsx` placed in the Sidebar branding block: dropdown of the admin's institutes (superadmin sees all institutes, labeled with owner), + "Manage institutes" link to `/settings`.

### 8. Superadmin UI & wiring
- **New** `components/auth/RoleRoute.tsx` (allowed-roles gate, same pattern as `ProtectedRoute`).
- **New** `pages/admins/AdminsPage.tsx` at `/admins` (superadmin only): table of admins (name, email, institutes count, active toggle, last login) and a "View data" action per admin → pick one of their institutes → `selectInstitute` + navigate to `/enquiries`; every existing page then shows that institute's data (superadmin drill-down via `?instituteId=`).
- `App.tsx`: `/admins` route gated to superadmin; `Sidebar.tsx` shows the "Admins" nav item only for superadmin; `TopHeader.tsx` shows a role badge.
- `hooks/useBranchQuery.ts`: also sends `instituteId` (the active institute) on all list calls so superadmin drill-down filters work everywhere.
- `SignupPage.tsx`: after register navigate to `/settings` instead of `/enquiries` (new admins land on institute creation — existing "No institute yet" empty state already covers this).

---

## Implementation order
1. Backend: roles/auth → tenancy helper → models → controllers → admin routes
2. Scripts: `npm run migrate` (backfill + indexes) then `npm run seed` (superadmin)
3. Frontend: types/services → InstituteContext + switcher → RoleRoute + AdminsPage → query wiring + signup redirect

## Verification
- Run `npm run migrate` and `npm run seed` against the dev Atlas DB.
- Manual API checks: admin A can't read admin B's leads/institutes; superadmin can; superadmin `?instituteId=` drill-down works.
- Frontend: `npm run build` (tsc clean); manual pass over login → signup → create institute → switch institute → superadmin Admins page.
- No test suite exists, so verification is manual + build.

## Out of scope (flagging, not fixing now)
- Institute delete still leaves orphaned branches/data (no cascade).
- CORS is wide open (`origin: true` in `app.js`) — should be tightened before production.
- Staff (`User`) logins / role-based module permissions for staff.