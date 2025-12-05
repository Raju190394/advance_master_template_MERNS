# Architecture Documentation

## Overview

This document provides a comprehensive overview of the Master Admin Panel Template architecture, design decisions, and implementation patterns.

## Table of Contents

1. [Backend Architecture](#backend-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [Database Design](#database-design)
5. [API Design](#api-design)
6. [Security Considerations](#security-considerations)
7. [Scalability & Performance](#scalability--performance)
8. [Extension Guide](#extension-guide)

---

## Backend Architecture

### MVC Pattern

The backend follows the **Model-View-Controller (MVC)** pattern with an additional **Service Layer**:

```
Request → Middleware → Controller → Service → Database
                ↓
            Response
```

#### Layers

1. **Routes** (`src/routes/`)
   - Define API endpoints
   - Apply middleware (auth, validation)
   - Map to controllers

2. **Middlewares** (`src/middlewares/`)
   - `auth.middleware.ts`: JWT verification
   - `role.middleware.ts`: RBAC enforcement
   - `error.middleware.ts`: Global error handling

3. **Controllers** (`src/controllers/`)
   - Handle HTTP requests/responses
   - Input validation (Zod)
   - Call service methods
   - Return standardized responses

4. **Services** (`src/services/`)
   - Business logic
   - Database operations
   - Data transformation
   - Activity logging

5. **Models** (`prisma/schema.prisma` + `src/models/`)
   - Prisma models for MySQL
   - Mongoose models for MongoDB

### Folder Structure Rationale

```
src/
├── config/          # Configuration (DB, env)
├── controllers/     # Request handlers
├── middlewares/     # Express middlewares
├── models/          # MongoDB models (Prisma in prisma/)
├── routes/          # API routes (versioned)
│   └── v1/          # Version 1 routes
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Utilities (logger, response)
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

**Why this structure?**
- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Services can be tested independently
- **Maintainability**: Easy to locate and modify code
- **Scalability**: New features follow the same pattern

### Database Strategy

**Hybrid Database Approach:**

1. **MySQL (via Prisma)**
   - Primary data storage
   - Structured data (Users, Products, Orders)
   - ACID compliance
   - Type-safe queries

2. **MongoDB (via Mongoose)**
   - Activity logs
   - Flexible schema data
   - High write throughput
   - Time-series data

**Why both?**
- Demonstrates polyglot persistence
- Use the right tool for the job
- MySQL for relational data, MongoDB for logs

### Error Handling

**Centralized Error Handling:**

```typescript
// Custom error class
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Global error handler
app.use(errorHandler);
```

**Error Types:**
- `AppError`: Application errors (400, 404, etc.)
- `ZodError`: Validation errors
- `PrismaError`: Database errors
- Generic errors: Unexpected errors

### Validation Strategy

**Zod for Runtime Validation:**

```typescript
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'admin', 'super_admin']),
});
```

**Benefits:**
- Type inference
- Runtime validation
- Clear error messages
- Reusable schemas

---

## Frontend Architecture

### Component Hierarchy

```
App (Router + AuthProvider)
├── Public Routes
│   └── Login
└── Protected Routes
    └── MainLayout
        ├── Sidebar
        ├── Header
        └── Page Content
            ├── Dashboard
            ├── UserList
            └── Settings
```

### Folder Structure

```
src/
├── components/
│   ├── auth/           # Auth-related components
│   ├── layout/         # Layout components
│   └── ui/             # Reusable UI components
├── context/            # React Context (Auth)
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript types
└── App.tsx             # Main app component
```

### State Management

**Context API for Global State:**

```typescript
// AuthContext provides:
- user: User | null
- login: (credentials) => Promise<void>
- logout: () => void
- isAuthenticated: boolean
- hasRole: (roles) => boolean
```

**Why Context API?**
- Built-in to React
- Sufficient for this use case
- No additional dependencies
- Easy to understand

**For larger apps, consider:**
- Redux Toolkit
- Zustand
- Jotai

### Component Design

**Reusable UI Components:**

All UI components follow these principles:
1. **Single Responsibility**: One component, one purpose
2. **Composability**: Can be combined
3. **Customizable**: Props for variants, sizes
4. **Accessible**: Semantic HTML, ARIA labels
5. **Type-safe**: Full TypeScript support

**Example:**
```typescript
<Button 
  variant="primary" 
  size="md" 
  loading={isLoading}
  onClick={handleClick}
>
  Submit
</Button>
```

### Routing Strategy

**Protected Routes with RBAC:**

```typescript
<Route path="/users" element={
  <ProtectedRoute roles={['admin', 'super_admin']}>
    <MainLayout>
      <UserList />
    </MainLayout>
  </ProtectedRoute>
} />
```

**Route Protection Levels:**
1. **Public**: Anyone can access (Login)
2. **Private**: Authenticated users only (Dashboard)
3. **Role-based**: Specific roles only (Users page)

---

## Authentication & Authorization

### Authentication Flow

```
1. User submits credentials
2. Backend validates credentials
3. Backend generates JWT token
4. Frontend stores token in localStorage
5. Frontend includes token in all requests
6. Backend verifies token on each request
```

### JWT Structure

```json
{
  "userId": 1,
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Authorization (RBAC)

**Three Roles:**

1. **user**
   - View dashboard
   - View own profile
   - Limited access

2. **admin**
   - All user permissions
   - Manage users (CRUD)
   - View analytics

3. **super_admin**
   - All admin permissions
   - Delete users
   - System settings

**Implementation:**

**Backend:**
```typescript
router.delete('/:id', 
  authenticate, 
  authorize('super_admin'), 
  userController.deleteUser
);
```

**Frontend:**
```typescript
{hasRole(['admin', 'super_admin']) && (
  <Link to="/users">Users</Link>
)}
```

### Security Best Practices

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **Token Expiration**: 7 days default
3. **HTTPS Only**: In production
4. **HttpOnly Cookies**: Consider for tokens (more secure than localStorage)
5. **CSRF Protection**: If using cookies
6. **Rate Limiting**: Prevent brute force attacks

---

## Database Design

### MySQL Schema (Prisma)

```prisma
model User {
  id        Int        @id @default(autoincrement())
  name      String
  email     String     @unique
  password  String
  role      UserRole   @default(user)
  status    UserStatus @default(active)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

enum UserRole {
  user
  admin
  super_admin
}

enum UserStatus {
  active
  inactive
}
```

**Design Decisions:**
- **Enums**: Type-safe roles and statuses
- **Unique Email**: Prevent duplicates
- **Timestamps**: Automatic tracking
- **Soft Delete**: Status field instead of deletion

### MongoDB Schema (Mongoose)

```typescript
{
  userId: Number,
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT',
  resource: String,
  details: Object,
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

**Design Decisions:**
- **Flexible Schema**: Details can vary by action
- **Indexed**: userId and createdAt for fast queries
- **No Updates**: Logs are immutable

---

## API Design

### RESTful Principles

```
GET    /api/v1/users       # List users
POST   /api/v1/users       # Create user
GET    /api/v1/users/:id   # Get user
PUT    /api/v1/users/:id   # Update user
DELETE /api/v1/users/:id   # Delete user
```

### Versioning

**URL Versioning:** `/api/v1/`

**Benefits:**
- Clear version in URL
- Easy to maintain multiple versions
- Gradual migration path

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "errors": {
    "email": ["Invalid email address"]
  }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (no token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate)
- `500`: Internal Server Error

---

## Security Considerations

### Input Validation

1. **Backend**: Zod schemas
2. **Frontend**: HTML5 validation + custom validation
3. **Database**: Prisma type safety

### SQL Injection Prevention

**Prisma uses parameterized queries:**
```typescript
// Safe - Prisma handles escaping
await prisma.user.findMany({
  where: { email: userInput }
});
```

### XSS Prevention

1. **React**: Automatic escaping
2. **Sanitize HTML**: If rendering user HTML
3. **Content Security Policy**: Set headers

### CORS Configuration

```typescript
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
```

**Production**: Whitelist specific domains

### Rate Limiting

**Consider adding:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Scalability & Performance

### Backend Optimization

1. **Database Indexing**
   ```prisma
   @@index([email])
   @@index([createdAt])
   ```

2. **Pagination**
   - Limit results per page
   - Offset-based pagination
   - Consider cursor-based for large datasets

3. **Caching**
   - Redis for session storage
   - Cache frequently accessed data
   - Invalidate on updates

4. **Connection Pooling**
   - Prisma handles this automatically
   - Configure pool size for production

### Frontend Optimization

1. **Code Splitting**
   ```typescript
   const UserList = lazy(() => import('./pages/users/UserList'));
   ```

2. **Memoization**
   ```typescript
   const MemoizedComponent = React.memo(Component);
   ```

3. **Lazy Loading**
   - Images
   - Routes
   - Components

4. **Bundle Optimization**
   - Vite handles tree-shaking
   - Analyze bundle size
   - Remove unused dependencies

---

## Extension Guide

### Adding a New Module

Follow this checklist for consistency:

#### Backend Checklist

- [ ] Add Prisma model (if using MySQL)
- [ ] Add Mongoose model (if using MongoDB)
- [ ] Run migration: `npm run prisma:migrate`
- [ ] Create service (`src/services/[module].service.ts`)
- [ ] Create controller (`src/controllers/[module].controller.ts`)
- [ ] Create routes (`src/routes/v1/[module].routes.ts`)
- [ ] Register routes in `src/routes/v1/index.ts`
- [ ] Add validation schemas (Zod)
- [ ] Add TypeScript types
- [ ] Test endpoints

#### Frontend Checklist

- [ ] Create types (`src/types/[module].types.ts`)
- [ ] Create service (`src/services/[module].service.ts`)
- [ ] Create list page (`src/pages/[module]/[Module]List.tsx`)
- [ ] Create form component (`src/pages/[module]/[Module]Form.tsx`)
- [ ] Add routes in `src/App.tsx`
- [ ] Add navigation in `src/components/layout/Sidebar.tsx`
- [ ] Add protected route if needed
- [ ] Test UI flow

### Best Practices for Extensions

1. **Follow Existing Patterns**: Look at User module as reference
2. **Type Everything**: Use TypeScript throughout
3. **Validate Input**: Both frontend and backend
4. **Handle Errors**: Graceful error handling
5. **Add Loading States**: Better UX
6. **Log Important Actions**: For audit trail
7. **Test Thoroughly**: Manual and automated tests

---

## Conclusion

This architecture provides:
- **Scalability**: Easy to add new features
- **Maintainability**: Clear structure and patterns
- **Security**: Multiple layers of protection
- **Performance**: Optimized for speed
- **Developer Experience**: Type-safe, well-documented

For questions or improvements, refer to the README files in each directory.
