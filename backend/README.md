# Klass360 Backend

Node.js + Express + MongoDB API for the Klass360 education CRM.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (JSON Web Tokens)
- **Security:** bcryptjs password hashing, express-validator input validation

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Environment variables

Copy the example env file and update values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry (default: `7d`) |
| `CLIENT_URL` | Frontend URL for CORS (default: `http://localhost:5173`) |
| `NODE_ENV` | `development` or `production` |

### 3. Start MongoDB

Ensure MongoDB is running locally, or use a cloud URI in `MONGODB_URI`.

### 4. Run the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`.

---

## API Reference

Base URL: `http://localhost:5000/api`

All responses follow this shape:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Errors:

```json
{
  "success": false,
  "message": "Error description"
}
```

Protected routes require the header:

```
Authorization: Bearer <jwt_token>
```

---

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | No | Verify API is running |

**Response:**

```json
{
  "success": true,
  "message": "Klass360 API is running"
}
```

---

### Admin Authentication

> **Note:** Only `admin` role is supported at this stage. All registered users are created as admins.

#### Register Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Create a new admin account |

**Request body:**

```json
{
  "fullName": "John Doe",
  "email": "admin@klass360.edu",
  "password": "SecurePass1"
}
```

**Validation rules:**
- `fullName` — required, max 100 characters
- `email` — required, valid email format
- `password` — min 8 characters, must include uppercase, lowercase, and a number

**Success response (201):**

```json
{
  "success": true,
  "message": "Admin account created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": "...",
      "fullName": "John Doe",
      "email": "admin@klass360.edu",
      "role": "admin",
      "createdAt": "2026-06-06T..."
    }
  }
}
```

**Used for:** Admin signup on the frontend (`/signup` page).

---

#### Login Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | No | Authenticate admin and receive JWT |

**Request body:**

```json
{
  "email": "admin@klass360.edu",
  "password": "SecurePass1"
}
```

**Success response (200):**

```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": "...",
      "fullName": "John Doe",
      "email": "admin@klass360.edu",
      "role": "admin",
      "lastLoginAt": "2026-06-06T...",
      "createdAt": "2026-06-06T..."
    }
  }
}
```

**Used for:** Admin login on the frontend (`/login` page).

---

#### Get Current Admin Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/auth/me` | Yes | Return the logged-in admin's profile |

**Success response (200):**

```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "...",
      "fullName": "John Doe",
      "email": "admin@klass360.edu",
      "role": "admin",
      "lastLoginAt": "2026-06-06T...",
      "createdAt": "2026-06-06T..."
    }
  }
}
```

**Used for:** Session bootstrap on app load — validates stored JWT and restores admin session.

---

#### Logout Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/logout` | Yes | Server-side logout acknowledgment |

**Success response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Used for:** Logout from the dashboard header. Token is cleared on the client.

---

### Branch Management

> **Auth required:** All branch endpoints require a valid admin JWT token.

#### Create Branch

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/branches` | Yes | Create a new institute branch |

**Request body:**

```json
{
  "name": "Delhi Campus",
  "code": "DEL-01",
  "address": "123 Education Lane, Connaught Place",
  "city": "New Delhi",
  "state": "Delhi",
  "status": "active"
}
```

**Validation rules:**
- `name` — required, max 150 characters, must be unique (case-insensitive)
- `code` — required, max 20 characters, letters/numbers/hyphens only, must be unique (stored uppercase)
- `address` — required, max 500 characters
- `city` — required, max 100 characters
- `state` — required, max 100 characters
- `status` — optional, `active` or `inactive` (defaults to `active`)

**Success response (201):**

```json
{
  "success": true,
  "message": "Branch created successfully",
  "data": {
    "branch": {
      "id": "...",
      "name": "Delhi Campus",
      "code": "DEL-01",
      "address": "123 Education Lane, Connaught Place",
      "city": "New Delhi",
      "state": "Delhi",
      "status": "active",
      "createdBy": "...",
      "createdAt": "2026-06-06T...",
      "updatedAt": "2026-06-06T..."
    }
  }
}
```

**Used for:** "Add Branch" form on the frontend Branches page.

---

#### Get All Branches

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/branches` | Yes | List all branches (newest first) |

**Success response (200):**

```json
{
  "success": true,
  "data": {
    "branches": [
      {
        "id": "...",
        "name": "Delhi Campus",
        "code": "DEL-01",
        "address": "123 Education Lane, Connaught Place",
        "city": "New Delhi",
        "state": "Delhi",
        "status": "active",
        "createdBy": "...",
        "createdAt": "2026-06-06T...",
        "updatedAt": "2026-06-06T..."
      }
    ],
    "count": 1
  }
}
```

**Used for:** Branches table listing on the frontend.

---

#### Get Branch by ID

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/branches/:id` | Yes | Get a single branch by MongoDB ID |

**Success response (200):**

```json
{
  "success": true,
  "data": {
    "branch": {
      "id": "...",
      "name": "Klass360 Delhi Campus",
      "address": "123 Education Lane, Connaught Place, New Delhi, 110001",
      "createdBy": "...",
      "createdAt": "2026-06-06T...",
      "updatedAt": "2026-06-06T..."
    }
  }
}
```

**Used for:** Fetching a single branch for edit operations.

---

#### Update Branch

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT` | `/branches/:id` | Yes | Update branch details |

**Request body:**

```json
{
  "name": "Mumbai Campus",
  "code": "MUM-01",
  "address": "456 Learning Road, Bandra West",
  "city": "Mumbai",
  "state": "Maharashtra",
  "status": "inactive"
}
```

**Success response (200):**

```json
{
  "success": true,
  "message": "Branch updated successfully",
  "data": {
    "branch": {
      "id": "...",
      "name": "Mumbai Campus",
      "code": "MUM-01",
      "address": "456 Learning Road, Bandra West",
      "city": "Mumbai",
      "state": "Maharashtra",
      "status": "inactive",
      "createdBy": "...",
      "createdAt": "2026-06-06T...",
      "updatedAt": "2026-06-06T..."
    }
  }
}
```

**Used for:** Edit branch modal on the frontend.

---

#### Delete Branch

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `DELETE` | `/branches/:id` | Yes | Permanently delete a branch |

**Success response (200):**

```json
{
  "success": true,
  "message": "Branch deleted successfully"
}
```

**Used for:** Delete confirmation modal on the frontend.

---

### Course Management

> **Auth required:** All course endpoints require a valid admin JWT token.

#### Create Course

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/courses` | Yes | Create a new course |

**Request body:**

```json
{
  "name": "B.Tech Computer Science",
  "category": "Engineering",
  "durationInMonths": 48,
  "description": "Undergraduate program in computer science",
  "branchIds": ["branchId1", "branchId2"],
  "isActive": true
}
```

**Validation rules:**
- `name` — required, max 150 characters, must be unique (case-insensitive)
- `category` — required, max 100 characters
- `durationInMonths` — required, integer between 1 and 120
- `description` — optional, max 2000 characters
- `branchIds` — required array, at least one valid branch MongoDB ID
- `isActive` — optional boolean (defaults to `true`)

**Success response (201):**

```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "course": {
      "id": "...",
      "name": "B.Tech Computer Science",
      "category": "Engineering",
      "durationInMonths": 48,
      "description": "Undergraduate program in computer science",
      "branchIds": ["..."],
      "branches": [{ "id": "...", "name": "Delhi Campus", "code": "DEL-01" }],
      "isActive": true,
      "createdAt": "2026-06-06T...",
      "updatedAt": "2026-06-06T..."
    }
  }
}
```

---

#### Get All Courses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/courses` | Yes | List all courses with populated branch references |

---

#### Get Course by ID

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/courses/:id` | Yes | Get a single course by MongoDB ID |

---

#### Update Course

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT` | `/courses/:id` | Yes | Update course details |

**Request body:** Same fields as create.

---

#### Activate Course

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PATCH` | `/courses/:id/activate` | Yes | Set `isActive` to `true` |

---

#### Deactivate Course

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PATCH` | `/courses/:id/deactivate` | Yes | Set `isActive` to `false` |

---

#### Delete Course

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `DELETE` | `/courses/:id` | Yes | Permanently delete a course |

---

### Section Management (Branch Sections)

> **Auth required:** All section endpoints require a valid admin JWT token.

Sections link a **course** to a **branch** with a schedule. The selected branch must be assigned to the selected course.

#### Create Section

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/sections` | Yes | Create a new section |

**Request body:**

```json
{
  "name": "Morning Batch 2026",
  "courseId": "courseMongoId",
  "branchId": "branchMongoId",
  "startDate": "2026-07-01",
  "endDate": "2027-06-30",
  "isActive": true
}
```

**Validation rules:**
- `name` — required, max 150 characters, unique per course + branch combination
- `courseId` — required, valid course MongoDB ID
- `branchId` — required, valid branch MongoDB ID, must be linked to the course
- `startDate` — required, valid ISO date
- `endDate` — required, valid ISO date, must be after `startDate`
- `isActive` — optional boolean (defaults to `true`)

**Success response (201):**

```json
{
  "success": true,
  "message": "Section created successfully",
  "data": {
    "section": {
      "id": "...",
      "name": "Morning Batch 2026",
      "courseId": "...",
      "branchId": "...",
      "course": { "id": "...", "name": "B.Tech CSE", "category": "Engineering" },
      "branch": { "id": "...", "name": "Delhi Campus", "code": "DEL-01" },
      "startDate": "2026-07-01T00:00:00.000Z",
      "endDate": "2027-06-30T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2026-06-06T...",
      "updatedAt": "2026-06-06T..."
    }
  }
}
```

---

#### Get All Sections

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/sections` | Yes | List all sections with populated course and branch |

---

#### Get Section by ID

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/sections/:id` | Yes | Get a single section by MongoDB ID |

---

#### Update Section

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT` | `/sections/:id` | Yes | Update section details |

**Request body:** Same fields as create.

---

#### Activate Section

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PATCH` | `/sections/:id/activate` | Yes | Set `isActive` to `true` |

---

#### Deactivate Section

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PATCH` | `/sections/:id/deactivate` | Yes | Set `isActive` to `false` |

---

#### Delete Section

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `DELETE` | `/sections/:id` | Yes | Permanently delete a section |

---

### User Management

> **Auth required:** All user endpoints require a valid admin JWT token.

> **Note:** This manages institute staff users (CRM users). Portal login accounts are handled separately via the Admin auth module.

#### Create User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/users` | Yes | Create a new institute user |

**Request body:**

```json
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "mobile": "9876543210",
  "email": "rahul@klass360.edu",
  "role": "counselor"
}
```

**Validation rules:**
- `firstName` — required, max 50 characters
- `lastName` — required, max 50 characters
- `mobile` — required, unique, valid 10-digit Indian mobile number
- `email` — required, unique, valid email format
- `role` — required, one of: `admin`, `manager`, `counselor`, `teacher`, `accountant`, `receptionist`

**Success response (201):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "...",
      "firstName": "Rahul",
      "lastName": "Sharma",
      "mobile": "9876543210",
      "email": "rahul@klass360.edu",
      "role": "counselor",
      "createdAt": "2026-06-06T...",
      "updatedAt": "2026-06-06T..."
    }
  }
}
```

---

#### Get All Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users` | Yes | List all institute users (newest first) |

---

#### Get User by ID

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users/:id` | Yes | Get a single user by MongoDB ID |

---

#### Update User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT` | `/users/:id` | Yes | Update user details |

**Request body:** Same fields as create.

---

#### Delete User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `DELETE` | `/users/:id` | Yes | Permanently delete a user |

---

### Lead Management

> **Auth required:** All lead endpoints require a valid admin JWT token.

#### Create Lead

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/leads` | Yes | Create a new lead |

**Request body:**

```json
{
  "name": "Rahul Sharma",
  "number": "9876543210",
  "whatsappNumber": "9876543210",
  "alternateNumber": "",
  "branchId": "branchMongoId",
  "courseId": "courseMongoId",
  "source": "website",
  "assignedTo": "userMongoId"
}
```

**Validation rules:**
- `name` — required, max 100 characters
- `number` — required, unique, valid 10-digit phone (cannot be updated later)
- `whatsappNumber` — required, valid 10-digit number
- `alternateNumber` — optional, valid 10-digit number
- `branchId` — required, valid branch ID
- `courseId` — required, valid course ID linked to the branch
- `source` — required, one of: `referral`, `website`, `walkin`, `offline_campaign`
- `assignedTo` — required, valid user ID

---

#### Get All Leads

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/leads` | Yes | List all leads with populated branch, course, and assigned user |

---

#### Get Lead by ID

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/leads/:id` | Yes | Get a single lead by MongoDB ID |

---

#### Update Lead

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT` | `/leads/:id` | Yes | Update lead details (phone number cannot be changed) |

**Request body:** Same as create, except `number` must not be included.

---

#### Delete Lead

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `DELETE` | `/leads/:id` | Yes | Permanently delete a lead |

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Auth business logic
│   │   ├── branchController.js  # Branch CRUD logic
│   │   ├── courseController.js  # Course CRUD logic
│   │   ├── sectionController.js # Section CRUD logic
│   │   ├── userController.js    # User CRUD logic
│   │   └── leadController.js    # Lead CRUD logic
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication guard
│   │   ├── errorHandler.js    # Global error handler
│   │   └── validate.js        # Request validation middleware
│   ├── models/
│   │   ├── Admin.js           # Admin Mongoose schema
│   │   ├── Branch.js          # Branch Mongoose schema
│   │   ├── Course.js          # Course Mongoose schema
│   │   ├── Section.js         # Section Mongoose schema
│   │   ├── User.js            # User Mongoose schema
│   │   └── Lead.js            # Lead Mongoose schema
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth/* routes
│   │   ├── branchRoutes.js    # /api/branches/* routes
│   │   ├── courseRoutes.js    # /api/courses/* routes
│   │   ├── sectionRoutes.js   # /api/sections/* routes
│   │   ├── userRoutes.js      # /api/users/* routes
│   │   ├── leadRoutes.js      # /api/leads/* routes
│   │   └── index.js           # Route aggregator
│   ├── utils/
│   │   ├── AppError.js        # Custom error class
│   │   ├── asyncHandler.js    # Async route wrapper
│   │   └── jwt.js             # Token sign/verify helpers
│   ├── validators/
│   │   ├── authValidator.js   # Auth validation rules
│   │   ├── branchValidator.js # Branch validation rules
│   │   ├── courseValidator.js # Course validation rules
│   │   ├── sectionValidator.js # Section validation rules
│   │   ├── userValidator.js    # User validation rules
│   │   └── leadValidator.js    # Lead validation rules
│   ├── app.js                 # Express app setup
│   └── server.js              # Entry point
├── .env.example
└── package.json
```

---

## Security Features

| Feature | Implementation |
|---------|----------------|
| Password hashing | bcrypt (12 salt rounds) |
| JWT authentication | Bearer token in `Authorization` header |
| Role enforcement | Only `admin` role allowed |
| Input validation | express-validator on all auth endpoints |
| Account status | `isActive` flag blocks deactivated admins |
| CORS | Restricted to configured `CLIENT_URL` |
| Password rules | Min 8 chars, uppercase + lowercase + number |
| Error handling | Centralized handler, no password leaks in errors |

---

## Common Error Codes

| Status | Meaning |
|--------|---------|
| `400` | Validation failed |
| `401` | Invalid credentials or expired/missing token |
| `403` | Account deactivated or insufficient permissions |
| `404` | Route not found |
| `409` | Email, mobile, phone number, branch name, branch code, course name, or section name already exists |
| `500` | Internal server error |
