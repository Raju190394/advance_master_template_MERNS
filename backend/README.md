# Admin Panel Backend

Modern, scalable backend for admin panel built with Node.js, TypeScript, Express, Prisma (MySQL), and Mongoose (MongoDB).

## Features

- ✅ **TypeScript** - Type-safe development
- ✅ **Express.js** - Fast, minimalist web framework
- ✅ **Prisma** - Type-safe ORM for MySQL
- ✅ **Mongoose** - MongoDB ODM for activity logs
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-Based Access Control (RBAC)** - User, Admin, Super Admin roles
- ✅ **Zod Validation** - Runtime type validation
- ✅ **Error Handling** - Centralized error management
- ✅ **Activity Logging** - Track user actions in MongoDB
- ✅ **Security** - Helmet, CORS, bcrypt password hashing

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Databases**: 
  - MySQL (via Prisma) - Primary data storage
  - MongoDB (via Mongoose) - Activity logs
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Password Hashing**: bcryptjs

## Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Prisma schema (MySQL)
│   └── seed.ts             # Database seeder
├── src/
│   ├── config/
│   │   ├── db.ts           # Database connections
│   │   └── env.ts          # Environment validation
│   ├── controllers/        # Request handlers
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── middlewares/        # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   └── error.middleware.ts
│   ├── models/             # MongoDB models
│   │   └── activityLog.model.ts
│   ├── routes/             # API routes
│   │   └── v1/
│   │       ├── auth.routes.ts
│   │       ├── user.routes.ts
│   │       └── index.ts
│   ├── services/           # Business logic
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   ├── types/              # TypeScript types
│   │   └── express.ts
│   ├── utils/              # Utilities
│   │   ├── logger.ts
│   │   └── response.ts
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
├── .env.example            # Environment variables template
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- MongoDB (v6 or higher)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database credentials:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/admin_panel"
   MONGODB_URI="mongodb://localhost:27017/admin_panel_logs"
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

3. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

4. **Run database migrations**:
   ```bash
   npm run prisma:migrate
   ```

5. **Seed the database** (creates default users):
   ```bash
   npx tsx prisma/seed.ts
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:5000`

## Default Users

After seeding, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@admin.com | SuperAdmin@123 |
| Admin | admin@admin.com | Admin@123 |
| User | user@example.com | User@123 |

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/login` | Login user | Public |
| GET | `/api/v1/auth/profile` | Get current user | Private |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/users` | Create user | Admin, Super Admin |
| GET | `/api/v1/users` | Get all users (paginated) | Admin, Super Admin |
| GET | `/api/v1/users/:id` | Get user by ID | Admin, Super Admin |
| PUT | `/api/v1/users/:id` | Update user | Admin, Super Admin |
| DELETE | `/api/v1/users/:id` | Delete user (soft) | Super Admin |

## API Examples

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"Admin@123"}'
```

### Get Users (with pagination)
```bash
curl -X GET "http://localhost:5000/api/v1/users?page=1&limit=10&search=admin" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create User
```bash
curl -X POST http://localhost:5000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name":"John Doe",
    "email":"john@example.com",
    "password":"Password@123",
    "role":"user"
  }'
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment | development, production |
| PORT | Server port | 5000 |
| DATABASE_URL | MySQL connection string | mysql://user:pass@localhost:3306/db |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/db |
| JWT_SECRET | JWT secret key (min 32 chars) | your-secret-key |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:5173 |

## Extending the Template

### Adding a New Module (e.g., Products)

1. **Create Prisma Model** (`prisma/schema.prisma`):
   ```prisma
   model Product {
     id        Int      @id @default(autoincrement())
     name      String
     price     Float
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

2. **Create Service** (`src/services/product.service.ts`)
3. **Create Controller** (`src/controllers/product.controller.ts`)
4. **Create Routes** (`src/routes/v1/product.routes.ts`)
5. **Register Routes** in `src/routes/v1/index.ts`

## Best Practices

- ✅ Always use services for business logic
- ✅ Validate input with Zod schemas
- ✅ Use proper HTTP status codes
- ✅ Log important actions to MongoDB
- ✅ Never expose sensitive data (passwords)
- ✅ Use transactions for multi-step operations
- ✅ Implement proper error handling
- ✅ Use environment variables for config

## License

MIT
