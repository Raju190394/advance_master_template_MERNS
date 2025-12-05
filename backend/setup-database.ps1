# Database Setup Script for PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Setup for Admin Panel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check MySQL connection
Write-Host "Step 1: Checking MySQL connection..." -ForegroundColor Yellow
$mysqlTest = mysql -u root -e "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Cannot connect to MySQL!" -ForegroundColor Red
    Write-Host "Please make sure MySQL is running." -ForegroundColor Red
    Write-Host ""
    Write-Host "If you have a password, update the .env file:" -ForegroundColor Yellow
    Write-Host 'DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/master_admin_panel"' -ForegroundColor Yellow
    pause
    exit 1
}

# Step 2: Create database
Write-Host "Step 2: Creating database 'master_admin_panel'..." -ForegroundColor Yellow
mysql -u root -e "CREATE DATABASE IF NOT EXISTS master_admin_panel;"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create database!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "Step 3: Database created successfully!" -ForegroundColor Green
Write-Host ""

# Step 4: Run migrations
Write-Host "Step 4: Running Prisma migrations..." -ForegroundColor Yellow
npm run prisma:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Prisma migration failed!" -ForegroundColor Red
    pause
    exit 1
}

# Step 5: Seed database
Write-Host "Step 5: Seeding database with default users..." -ForegroundColor Yellow
npx tsx prisma/seed.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Database seeding failed!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SUCCESS! Database setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Default login credentials:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Super Admin:" -ForegroundColor Yellow
Write-Host "  Email: superadmin@admin.com"
Write-Host "  Password: SuperAdmin@123"
Write-Host ""
Write-Host "Admin:" -ForegroundColor Yellow
Write-Host "  Email: admin@admin.com"
Write-Host "  Password: Admin@123"
Write-Host ""
Write-Host "The backend server should now work!" -ForegroundColor Green
Write-Host "If it's not running, start it with: npm run dev" -ForegroundColor Yellow
Write-Host ""
