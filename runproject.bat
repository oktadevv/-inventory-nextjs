@echo off
REM RR Store Inventory - klik 2x langsung jalan
cd /d "%~dp0"
title RR Store Inventory

echo Memeriksa node_modules...
if not exist "node_modules" (
  echo Install dependencies dulu...
  call npm install --no-audit --no-fund
)

echo Memeriksa database...
if not exist "prisma\dev.db" (
  call npx prisma db push
  node prisma/seed.mjs
)

echo.
echo Menjalankan di http://localhost:3000
echo Login: admin@rrstore.id / admin123
echo Jangan tutup jendela ini. Tekan CTRL+C untuk berhenti.
echo.
start "" "http://localhost:3000"
call npm run dev
pause
