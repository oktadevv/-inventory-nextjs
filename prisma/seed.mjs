import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin123", 10);
  const staffHash = await bcrypt.hash("staff123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@rrstore.id" },
    update: {},
    create: {
      name: "Admin RR Store",
      username: "admin",
      email: "admin@rrstore.id",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@rrstore.id" },
    update: {},
    create: {
      name: "Staff Gudang",
      username: "staff",
      email: "staff@rrstore.id",
      passwordHash: staffHash,
      role: "STAFF",
    },
  });

  const cats = ["Elektronik", "Aksesoris", "Fashion", "ATK", "Makanan"];
  const colors = ["#2563EB", "#16A34A", "#F59E0B", "#8B5CF6", "#EC4899"];
  for (let i = 0; i < cats.length; i++) {
    await prisma.category.upsert({
      where: { name: cats[i] },
      update: {},
      create: { name: cats[i], color: colors[i] },
    });
  }
  const categories = await prisma.category.findMany();
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c]));

  const suppliersData = [
    { code: "SUP-001", company: "PT Maju Jaya Abadi", picName: "Budi Santoso", whatsapp: "081234567890", address: "Jl. Merdeka No. 10, Bandung" },
    { code: "SUP-002", company: "CV Berkah Elektronik", picName: "Siti Aminah", whatsapp: "081298765432", address: "Jl. Asia Afrika No. 88, Bandung" },
    { code: "SUP-003", company: "Toko Grosir Murah", picName: "Andi Wijaya", whatsapp: "085678123456", address: "Pasar Baru Blok C-12, Bandung" },
  ];
  for (const s of suppliersData) {
    await prisma.supplier.upsert({ where: { code: s.code }, update: {}, create: s });
  }
  const suppliers = await prisma.supplier.findMany();

  const productsData = [
    { sku: "BRG-0001", name: "Mouse Wireless Logitech M331", cat: "Elektronik", buy: 180000, sell: 225000, stock: 48, min: 10, sup: 1 },
    { sku: "BRG-0002", name: "Keyboard Mechanical RGB", cat: "Elektronik", buy: 350000, sell: 450000, stock: 8, min: 10, sup: 1 },
    { sku: "BRG-0003", name: "Kabel USB-C 100W 2M", cat: "Aksesoris", buy: 45000, sell: 75000, stock: 120, min: 20, sup: 2 },
    { sku: "BRG-0004", name: "Kaos Polos Cotton Combed", cat: "Fashion", buy: 35000, sell: 60000, stock: 4, min: 15, sup: 2 },
    { sku: "BRG-0005", name: "Pulpen Gel 0.5 Hitam (Lusin)", cat: "ATK", buy: 18000, sell: 28000, stock: 0, min: 10, sup: 0 },
    { sku: "BRG-0006", name: "Headset Bluetooth Bass", cat: "Elektronik", buy: 150000, sell: 199000, stock: 25, min: 8, sup: 1 },
    { sku: "BRG-0007", name: "Tas Ransel Laptop 15 inch", cat: "Fashion", buy: 180000, sell: 275000, stock: 15, min: 5, sup: 0 },
    { sku: "BRG-0008", name: "Kopi Susu Gula Aren 1L", cat: "Makanan", buy: 20000, sell: 35000, stock: 30, min: 12, sup: 2 },
  ];
  for (const p of productsData) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        categoryId: catByName[p.cat].id,
        supplierId: suppliers[p.sup]?.id,
        buyPrice: p.buy,
        sellPrice: p.sell,
        stock: p.stock,
        minStock: p.min,
      },
    });
  }

  // Contoh transaksi 14 hari terakhir untuk grafik
  const products = await prisma.product.findMany();
  const existing = await prisma.transaction.count();
  if (existing === 0 && products.length > 0) {
    for (let d = 13; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const n = 2 + (d % 3);
      for (let i = 0; i < n; i++) {
        const p = products[(d + i) % products.length];
        const isIn = (d + i) % 2 === 0;
        const qty = 2 + ((d * 3 + i * 7) % 12);
        const before = p.stock;
        const after = isIn ? before + qty : Math.max(0, before - qty);
        await prisma.transaction.create({
          data: {
            code: `TRX-${isIn ? "IN" : "OUT"}-${Date.now()}-${d}-${i}-${p.sku}`,
            type: isIn ? "IN" : "OUT",
            reason: isIn ? "PURCHASE" : "SALE",
            productId: p.id,
            supplierId: isIn ? p.supplierId : null,
            qty,
            stockBefore: before,
            stockAfter: after,
            date,
            refNo: isIn ? `PO-${d}${i}` : `SO-${d}${i}`,
            createdById: d % 2 === 0 ? admin.id : staff.id,
          },
        });
      }
    }
  }

  console.log("Seed OK: admin@rrstore.id / admin123, staff@rrstore.id / staff123");
}

main().finally(() => prisma.$disconnect());
