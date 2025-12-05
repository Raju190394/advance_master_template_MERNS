# Quick Start Guide

Get your admin panel up and running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js v18+ (`node --version`)
- ✅ MySQL 8+ running
- ✅ MongoDB 6+ running
- ✅ npm or yarn installed

## Step-by-Step Setup

### 1. Clone or Download

```bash
cd master_template_MERNS
```

### 2. Backend Setup (5 steps)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Edit .env file with your database credentials
# DATABASE_URL="mysql://root:yourpassword@localhost:3306/admin_panel"
# MONGODB_URI="mongodb://localhost:27017/admin_panel_logs"
# JWT_SECRET="your-super-secret-key-at-least-32-characters-long"

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with default users
npx tsx prisma/seed.ts

# Start the backend server
npm run dev
```

✅ Backend should now be running on `http://localhost:5000`

### 3. Frontend Setup (3 steps)

Open a **new terminal** window:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Setup environment (optional - defaults work)
cp .env.example .env

# Start the frontend server
npm run dev
```

✅ Frontend should now be running on `http://localhost:5173`

### 4. Login & Test

1. Open browser: `http://localhost:5173`
2. You'll be redirected to login page
3. Use these credentials:

**Admin Login:**
- Email: `admin@admin.com`
- Password: `Admin@123`

**Super Admin Login:**
- Email: `superadmin@admin.com`
- Password: `SuperAdmin@123`

### 5. Verify Everything Works

After logging in, you should see:
- ✅ Dashboard with stats
- ✅ Sidebar with navigation
- ✅ Users page (click "Users" in sidebar)
- ✅ Create/Edit/Delete users
- ✅ Logout functionality

## Common Issues & Solutions

### Issue: "Port 5000 already in use"

**Solution:** Change the port in `backend/.env`:
```env
PORT=5001
```

### Issue: "Cannot connect to MySQL"

**Solution:** 
1. Ensure MySQL is running: `mysql -u root -p`
2. Check credentials in `backend/.env`
3. Create database manually: `CREATE DATABASE admin_panel;`

### Issue: "Cannot connect to MongoDB"

**Solution:**
1. Ensure MongoDB is running: `mongosh`
2. Check connection string in `backend/.env`
3. MongoDB will auto-create the database

### Issue: "Prisma migration fails"

**Solution:**
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
npx tsx prisma/seed.ts
```

### Issue: "Frontend shows network error"

**Solution:**
1. Ensure backend is running on port 5000
2. Check `frontend/.env` has correct API URL
3. Check browser console for CORS errors

## Next Steps

### Explore the Code

1. **Backend Structure:**
   - `backend/src/routes/` - API endpoints
   - `backend/src/controllers/` - Request handlers
   - `backend/src/services/` - Business logic
   - `backend/prisma/schema.prisma` - Database schema

2. **Frontend Structure:**
   - `frontend/src/pages/` - Page components
   - `frontend/src/components/` - Reusable components
   - `frontend/src/services/` - API calls
   - `frontend/src/context/` - Global state

### Customize

1. **Change Colors:**
   - Edit `frontend/tailwind.config.js`
   - Update primary color palette

2. **Add Logo:**
   - Replace text in `frontend/src/components/layout/Sidebar.tsx`
   - Add logo image

3. **Modify User Fields:**
   - Update `backend/prisma/schema.prisma`
   - Run migration: `npm run prisma:migrate`
   - Update frontend types in `frontend/src/types/user.types.ts`

### Add New Features

Follow the guide in `ARCHITECTURE.md` to add:
- Products module
- Orders module
- Settings page
- Reports/Analytics
- File uploads
- Email notifications

## Production Deployment

### Backend

```bash
cd backend

# Build TypeScript
npm run build

# Set environment to production
# Edit .env: NODE_ENV=production

# Start production server
npm start
```

### Frontend

```bash
cd frontend

# Build for production
npm run build

# The dist/ folder contains static files
# Deploy to: Vercel, Netlify, or any static host
```

## Database Backups

### MySQL Backup
```bash
mysqldump -u root -p admin_panel > backup.sql
```

### MongoDB Backup
```bash
mongodump --db admin_panel_logs --out ./backup
```

## Useful Commands

### Backend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Run migrations
```

### Frontend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

## Getting Help

1. Check `README.md` for detailed documentation
2. Check `ARCHITECTURE.md` for architecture details
3. Check individual README files in `backend/` and `frontend/`
4. Review the code - it's well-commented!

## Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can login with admin credentials
- [ ] Can see dashboard
- [ ] Can view users list
- [ ] Can create a new user
- [ ] Can edit a user
- [ ] Can delete a user
- [ ] Can logout

If all checkboxes are ✅, you're ready to start building!

---

**Happy Coding! 🚀**
