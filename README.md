# Master Admin Panel Template (MERN Stack)

A production-ready, reusable admin panel boilerplate with modern architecture, clean code, and industry best practices.

## 🚀 Features

### Backend (Node.js + TypeScript + Express)
- ✅ **TypeScript** - Type-safe backend development
- ✅ **Express.js** - Fast, minimalist web framework
- ✅ **Prisma (MySQL)** - Type-safe ORM for primary data
- ✅ **Mongoose (MongoDB)** - ODM for activity logs
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **RBAC** - Role-based access control (user, admin, super_admin)
- ✅ **Zod Validation** - Runtime type validation
- ✅ **Error Handling** - Centralized error management
- ✅ **Activity Logging** - Track user actions in MongoDB
- ✅ **Security** - Helmet, CORS, bcrypt

### Frontend (React + TypeScript + Tailwind)
- ✅ **React 18** - Latest React with hooks
- ✅ **TypeScript** - Type-safe frontend development
- ✅ **Tailwind CSS** - Utility-first CSS framework
- ✅ **Vite** - Lightning-fast build tool
- ✅ **React Router** - Client-side routing with protected routes
- ✅ **Axios** - HTTP client with interceptors
- ✅ **Context API** - State management
- ✅ **Responsive Design** - Mobile-friendly UI
- ✅ **Reusable Components** - Modular component library

## 📁 Project Structure

```
master_template_MERNS/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   └── env.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── models/
│   │   │   └── activityLog.model.ts
│   │   ├── routes/
│   │   │   └── v1/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── user.service.ts
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   ├── layout/
    │   │   └── ui/
    │   ├── context/
    │   ├── pages/
    │   │   ├── auth/
    │   │   ├── dashboard/
    │   │   └── users/
    │   ├── services/
    │   ├── types/
    │   └── App.tsx
    └── package.json
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend Runtime** | Node.js |
| **Backend Language** | TypeScript |
| **Backend Framework** | Express.js |
| **Primary Database** | MySQL (via Prisma) |
| **Secondary Database** | MongoDB (via Mongoose) |
| **Authentication** | JWT |
| **Validation** | Zod |
| **Frontend Framework** | React 18 |
| **Frontend Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Build Tool** | Vite |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios |

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

#### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Backend runs on `http://localhost:5000`

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🔐 Default Credentials

After seeding, login with:

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | superadmin@admin.com | SuperAdmin@123 |
| **Admin** | admin@admin.com | Admin@123 |
| **User** | user@example.com | User@123 |

Super Admin:
  Email: superadmin@admin.com
  Password: SuperAdmin@123

Admin:
  Email: admin@admin.com
  Password: Admin@123

User:
  Email: user@example.com
  Password: User@123
## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/login` | Login user | Public |
| GET | `/api/v1/auth/profile` | Get current user | Private |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/users` | Create user | Admin, Super Admin |
| GET | `/api/v1/users` | Get all users | Admin, Super Admin |
| GET | `/api/v1/users/:id` | Get user by ID | Admin, Super Admin |
| PUT | `/api/v1/users/:id` | Update user | Admin, Super Admin |
| DELETE | `/api/v1/users/:id` | Delete user | Super Admin |

## 🎨 Frontend Pages

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/login` | Login | Public | User login |
| `/dashboard` | Dashboard | Private | Main dashboard |
| `/users` | UserList | Admin+ | User management |
| `/settings` | Settings | Private | Settings |

## 🔧 Extending the Template

### Adding a New Module (e.g., Products)

#### Backend

1. **Add Prisma Model** (`prisma/schema.prisma`):
```prisma
model Product {
  id        Int      @id @default(autoincrement())
  name      String
  price     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. **Create Service** (`src/services/product.service.ts`):
```typescript
import { prisma } from '../config/db';

class ProductService {
  async getProducts() {
    return await prisma.product.findMany();
  }
  // ... other CRUD methods
}

export default new ProductService();
```

3. **Create Controller** (`src/controllers/product.controller.ts`):
```typescript
import productService from '../services/product.service';

class ProductController {
  async getProducts(req, res, next) {
    try {
      const products = await productService.getProducts();
      res.json(successResponse('Products retrieved', products));
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
```

4. **Create Routes** (`src/routes/v1/product.routes.ts`):
```typescript
import { Router } from 'express';
import productController from '../../controllers/product.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
router.get('/', authenticate, productController.getProducts);

export default router;
```

5. **Register Routes** (`src/routes/v1/index.ts`):
```typescript
import productRoutes from './product.routes';
router.use('/products', productRoutes);
```

#### Frontend

1. **Create Types** (`src/types/product.types.ts`):
```typescript
export interface Product {
  id: number;
  name: string;
  price: number;
}
```

2. **Create Service** (`src/services/product.service.ts`):
```typescript
import api from './api';

class ProductService {
  async getProducts() {
    const response = await api.get('/products');
    return response.data;
  }
}

export default new ProductService();
```

3. **Create Page** (`src/pages/products/ProductList.tsx`):
```typescript
import { useState, useEffect } from 'react';
import productService from '../../services/product.service';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    productService.getProducts().then(setProducts);
  }, []);
  
  return <div>{/* Render products */}</div>;
};
```

4. **Add Route** (`src/App.tsx`):
```typescript
<Route path="/products" element={
  <ProtectedRoute>
    <MainLayout><ProductList /></MainLayout>
  </ProtectedRoute>
} />
```

5. **Add Navigation** (`src/components/layout/Sidebar.tsx`):
```typescript
{
  name: 'Products',
  path: '/products',
  icon: <Package className="w-5 h-5" />,
}
```

## 📖 Best Practices

### Backend
- ✅ Use services for business logic
- ✅ Validate all inputs with Zod
- ✅ Use proper HTTP status codes
- ✅ Log important actions
- ✅ Never expose sensitive data
- ✅ Use transactions for multi-step operations
- ✅ Implement proper error handling

### Frontend
- ✅ Use TypeScript for type safety
- ✅ Create reusable components
- ✅ Keep business logic in services
- ✅ Implement loading states
- ✅ Validate forms before submission
- ✅ Handle errors gracefully
- ✅ Use semantic HTML

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token generation and verification
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Input Validation**: Zod schemas
- **SQL Injection Protection**: Prisma parameterized queries
- **XSS Protection**: React's built-in escaping

## 📊 Database Architecture

### MySQL (Prisma)
- **Users**: Core user data with authentication
- Supports enums for roles and status
- Automatic timestamps

### MongoDB (Mongoose)
- **Activity Logs**: User action tracking
- Flexible schema for various log types
- Indexed for performance

## 🎯 Key Architectural Decisions

1. **MVC Pattern**: Clear separation of concerns
2. **Service Layer**: Business logic isolated from controllers
3. **Middleware Chain**: Authentication → Authorization → Controller
4. **Versioned API**: `/api/v1/` for future compatibility
5. **Centralized Error Handling**: Consistent error responses
6. **Type Safety**: TypeScript throughout the stack
7. **Component Library**: Reusable UI components
8. **Protected Routes**: Role-based access control

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mysql://user:pass@localhost:3306/admin_panel
MONGODB_URI=mongodb://localhost:27017/admin_panel_logs
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 🚀 Production Deployment

### Backend
```bash
npm run build
npm start
```

### Frontend
```bash
npm run build
# Serve the dist/ folder with nginx or similar
```

## 📄 License

MIT

## 🤝 Contributing

This is a template project. Feel free to fork and customize for your needs!

---

**Built with ❤️ for developers who value clean architecture and best practices.**
