@echo off
echo ===================================================
echo      Master Admin Template - Setup Script
echo ===================================================
echo.

echo [1/5] Installing Backend Dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing backend dependencies!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/5] Setting up Database (Prisma Generate & Push)...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo Error generating Prisma client!
    pause
    exit /b %ERRORLEVEL%
)

call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo Error pushing database schema!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/5] Seeding Database...
call npx ts-node prisma/seed.ts
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Database seeding failed or already seeded.
)

cd ..

echo.
echo [4/5] Installing Frontend Dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo ===================================================
echo      Setup Completed Successfully!
echo ===================================================
echo.
echo You can now run the project using:
echo 1. Backend: cd backend ^&^& npm run dev
echo 2. Frontend: cd frontend ^&^& npm run dev
echo.
pause
