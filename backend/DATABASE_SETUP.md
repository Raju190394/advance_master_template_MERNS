# Database Setup Instructions

## Issue
The backend cannot connect to MySQL because the database credentials in `.env` are not correct.

## Solution

### Option 1: Update .env with your MySQL credentials

1. Open `backend/.env` file
2. Update the `DATABASE_URL` line with your actual MySQL credentials:

```env
DATABASE_URL="mysql://YOUR_USERNAME:YOUR_PASSWORD@localhost:3306/admin_panel"
```

Replace:
- `YOUR_USERNAME` with your MySQL username (default is usually `root`)
- `YOUR_PASSWORD` with your MySQL password

### Option 2: Create the database manually

If you don't have a password set for MySQL root user:

```env
DATABASE_URL="mysql://root@localhost:3306/admin_panel"
```

Then create the database:
```bash
# Login to MySQL
mysql -u root

# Create database
CREATE DATABASE admin_panel;

# Exit
exit;
```

### Option 3: Use a different database name

If you want to use a different database name:

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/your_database_name"
```

## After updating .env

Run these commands:

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Seed database (creates default users)
npx tsx prisma/seed.ts

# Start server
npm run dev
```

## Verify it works

You should see:
```
✅ MongoDB connected successfully
🚀 Server is running on port 5000
```

## Common Issues

### "Access denied for user"
- Check your MySQL username and password
- Make sure MySQL is running

### "Unknown database"
- Create the database manually (see Option 2 above)

### "Can't connect to MySQL server"
- Make sure MySQL is running
- Check if it's running on port 3306

## Default Users (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@admin.com | SuperAdmin@123 |
| Admin | admin@admin.com | Admin@123 |
| User | user@example.com | User@123 |
