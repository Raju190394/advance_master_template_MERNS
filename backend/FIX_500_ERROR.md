# Quick Fix for 500 Error

## Problem
The backend server is running but returning 500 errors because it cannot connect to the MySQL database `master_admin_panel`.

## Solution

### Option 1: Run the automated setup script (EASIEST)

```powershell
cd backend
.\setup-database.ps1
```

This will:
1. Create the database
2. Run migrations
3. Seed default users
4. Show you the login credentials

### Option 2: Manual setup

```powershell
# 1. Create the database
mysql -u root -e "CREATE DATABASE master_admin_panel;"

# 2. Run migrations
cd backend
npm run prisma:migrate

# 3. Seed database
npx tsx prisma/seed.ts

# 4. Restart backend (if needed)
npm run dev
```

### Option 3: If you have a MySQL password

1. Update `backend/.env`:
   ```env
   DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/master_admin_panel"
   ```

2. Then run Option 1 or 2 above

## After Setup

1. The backend server should automatically reconnect
2. Go to http://localhost:5173
3. Login with:
   - Email: `admin@admin.com`
   - Password: `Admin@123`

## Still Getting Errors?

Check the backend terminal for error messages. Common issues:
- MySQL not running
- Wrong password in .env
- Database name mismatch
- Port 3306 not available
