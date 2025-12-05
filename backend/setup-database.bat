@echo off
echo ========================================
echo Database Setup for Admin Panel
echo ========================================
echo.

echo Step 1: Checking MySQL connection...
mysql -u root -e "SELECT 1;" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Cannot connect to MySQL!
    echo Please make sure MySQL is running and you can connect with: mysql -u root -p
    pause
    exit /b 1
)

echo Step 2: Creating database 'master_admin_panel'...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS master_admin_panel;"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database!
    pause
    exit /b 1
)

echo Step 3: Database created successfully!
echo.

echo Step 4: Running Prisma migrations...
call npm run prisma:migrate
if %errorlevel% neq 0 (
    echo ERROR: Prisma migration failed!
    pause
    exit /b 1
)

echo Step 5: Seeding database with default users...
call npx tsx prisma/seed.ts
if %errorlevel% neq 0 (
    echo ERROR: Database seeding failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Database setup complete!
echo ========================================
echo.
echo Default login credentials:
echo.
echo Super Admin:
echo   Email: superadmin@admin.com
echo   Password: SuperAdmin@123
echo.
echo Admin:
echo   Email: admin@admin.com
echo   Password: Admin@123
echo.
echo You can now restart the backend server with: npm run dev
echo.
pause
