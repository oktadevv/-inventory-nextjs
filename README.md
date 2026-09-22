# RR Store Inventory — Sistem Manajemen Inventaris & Stok

Stack: **Next.js 15 + Tailwind + Prisma + SQLite (dev) / PostgreSQL (prod) + Recharts**

## Cara Jalan (Windows)

```powershell
# 1. Install (sekali saja) — pakai npm.cmd karena ExecutionPolicy
& "C:\Program Files\nodejs\npm.cmd" install

# 2. Setup DB + seed demo
& "C:\Program Files\nodejs\npx.cmd" prisma db push
node prisma/seed.mjs

# 3. Jalankan dev
& "C:\Program Files\nodejs\npm.cmd" run dev
# buka http://localhost:3000
```

Login demo:
- ADMIN: `admin@rrstore.id / admin123`
- STAFF: `staff@rrstore.id / staff123`

## Struktur
- `app/page.tsx` + `dashboard-client.tsx` — KPI, tren 14 hari, donut kategori, stok kritis, aktivitas
- `app/products/` — CRUD barang, live search, filter kategori/status, export CSV, soft delete (ADMIN)
- `app/suppliers/` — CRUD supplier
- `app/transactions-in/` — form stock IN (atomic +stok)
- `app/transactions-out/` — form stock OUT (validasi stok, alasan Terjual/Rusak/Servis/Retur)
- `app/transactions/` — jurnal audit trail immutable
- `app/api/` — REST: auth, dashboard, products, suppliers, transactions/in|out
- `prisma/schema.prisma` — users, categories, suppliers, products, transactions
- `lib/auth.ts` — JWT httpOnly cookie + RBAC helper `getSession()`

## Logic Atomik Stok
Semua mutasi stok via `prisma.$transaction`: baca produk → validasi → update stok → insert jurnal (`stockBefore/After`). Stock OUT ditolak jika `stok < qty`. Jurnal tidak pernah di-UPDATE/DELETE.

## Pindah ke PostgreSQL (Prod)
1. Di `prisma/schema.prisma`: `provider = "postgresql"`, kembalikan enum `Role/TxType/TxReason` (lihat komentar di file).
2. `.env`: `DATABASE_URL="postgresql://user:pass@host:5432/rr_inventory"`
3. `px prisma db push` + seed ulang, deploy ke Vercel + Neon/Supabase.
