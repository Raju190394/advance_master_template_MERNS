# Admin Panel Frontend

Modern, responsive admin panel frontend built with React, TypeScript, Tailwind CSS, and Vite.

## Features

- ✅ **React 18** - Latest React with hooks
- ✅ **TypeScript** - Type-safe development
- ✅ **Tailwind CSS** - Utility-first CSS framework
- ✅ **Vite** - Lightning-fast build tool
- ✅ **React Router** - Client-side routing
- ✅ **Axios** - HTTP client with interceptors
- ✅ **Context API** - State management
- ✅ **Protected Routes** - Role-based access control
- ✅ **Responsive Design** - Mobile-friendly UI
- ✅ **Reusable Components** - Modular component library

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Folder Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       └── Badge.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   └── Login.tsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx
│   │   └── users/
│   │       ├── UserList.tsx
│   │       └── UserForm.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   └── user.types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Backend API running on `http://localhost:5000`

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

Application will run on `http://localhost:5173`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Pages & Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/login` | Login | Public | User login page |
| `/dashboard` | Dashboard | Private | Main dashboard |
| `/users` | UserList | Admin, Super Admin | User management |
| `/settings` | Settings | Private | Settings page |

## Component Library

### UI Components

#### Button
```tsx
<Button variant="primary" size="md" loading={false}>
  Click Me
</Button>
```

Variants: `primary`, `secondary`, `danger`, `success`  
Sizes: `sm`, `md`, `lg`

#### Input
```tsx
<Input
  label="Email"
  type="email"
  error="Invalid email"
  helperText="Enter your email"
/>
```

#### Card
```tsx
<Card padding="md">
  Content here
</Card>
```

#### Modal
```tsx
<Modal isOpen={true} onClose={handleClose} title="Modal Title">
  Content here
</Modal>
```

#### Badge
```tsx
<Badge variant="success">Active</Badge>
```

Variants: `success`, `danger`, `warning`, `info`, `default`

### Layout Components

- **MainLayout**: Combines Sidebar and Header
- **Sidebar**: Collapsible navigation with role-based filtering
- **Header**: Top bar with user info and logout

## Authentication

The app uses JWT-based authentication with the following flow:

1. User logs in via `/login`
2. Token is stored in `localStorage`
3. Token is automatically added to all API requests via Axios interceptor
4. Protected routes check for token and user role
5. Unauthorized users are redirected to `/login`

### Auth Context

```tsx
const { user, login, logout, isAuthenticated, hasRole } = useAuth();
```

## API Integration

All API calls go through the centralized `api.ts` service:

```tsx
import api from './services/api';

// Automatically includes Authorization header
const response = await api.get('/users');
```

### Services

- **auth.service.ts**: Login, logout, profile
- **user.service.ts**: User CRUD operations

## Extending the Template

### Adding a New Page

1. **Create page component** in `src/pages/[module]/[PageName].tsx`
2. **Add route** in `src/App.tsx`:
   ```tsx
   <Route
     path="/products"
     element={
       <ProtectedRoute roles={['admin']}>
         <MainLayout>
           <ProductList />
         </MainLayout>
       </ProtectedRoute>
     }
   />
   ```
3. **Add navigation** in `src/components/layout/Sidebar.tsx`

### Adding a New Service

1. **Create service** in `src/services/[module].service.ts`:
   ```tsx
   import api from './api';
   
   class ProductService {
     async getProducts() {
       const response = await api.get('/products');
       return response.data;
     }
   }
   
   export default new ProductService();
   ```

2. **Create types** in `src/types/[module].types.ts`

## Styling Guide

### Tailwind CSS

The app uses Tailwind CSS with a custom color palette:

```js
colors: {
  primary: {
    50: '#f0f9ff',
    // ... up to 900
  }
}
```

### Custom Classes

- `.custom-scrollbar` - Styled scrollbar

## Best Practices

- ✅ Use TypeScript for all components
- ✅ Create reusable UI components
- ✅ Keep business logic in services
- ✅ Use Context API for global state
- ✅ Implement proper error handling
- ✅ Add loading states to async operations
- ✅ Validate forms before submission
- ✅ Use semantic HTML
- ✅ Follow accessibility guidelines

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
