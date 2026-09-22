import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function dayRange(d = new Date()) {
  const s = new Date(d); s.setHours(0, 0, 0, 0);
  const e = new Date(d); e.setHours(23, 59, 59, 999);
  return { s, e };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { s, e } = dayRange();

  const [totalSku, products, inToday, outToday, lowStockList, recent, byCat, last14] = await Promise.all([
    prisma.product.count({ where: { isActive: true, deletedAt: null } }),
    prisma.product.findMany({ where: { isActive: true, deletedAt: null }, select: { stock: true, minStock: true } }),
    prisma.transaction.aggregate({ _sum: { qty: true }, where: { type: "IN", date: { gte: s, lte: e } } }),
    prisma.transaction.aggregate({ _sum: { qty: true }, where: { type: "OUT", date: { gte: s, lte: e } } }),
    prisma.product.findMany({ where: { isActive: true, deletedAt: null }, include: { category: true }, orderBy: { stock: "asc" }, take: 50 }),
    prisma.transaction.findMany({ include: { product: true, createdBy: { select: { name: true } } }, orderBy: { date: "desc" }, take: 8 }),
    prisma.product.groupBy({ by: ["categoryId"], _sum: { stock: true } }),
    prisma.transaction.findMany({ where: { date: { gte: new Date(Date.now() - 13 * 864e5) } }, select: { date: true, qty: true, type: true } }),
  ]);

  const totalStock = products.reduce((a, p) => a + p.stock, 0);
  const lowStock = lowStockList.filter((p) => p.stock <= p.minStock);

  const cats = await prisma.category.findMany();
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c]));
  const donut = byCat.map((b) => ({ name: catMap[b.categoryId]?.name ?? "Lainnya", value: b._sum.stock ?? 0, color: catMap[b.categoryId]?.color ?? "#94A3B8" }));

  const trendMap: Record<string, { date: string; masuk: number; keluar: number }> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    trendMap[k] = { date: k.slice(5), masuk: 0, keluar: 0 };
  }
  for (const t of last14) {
    const k = new Date(t.date).toISOString().slice(0, 10);
    if (trendMap[k]) trendMap[k][t.type === "IN" ? "masuk" : "keluar"] += t.qty;
  }

  return NextResponse.json({
    kpi: {
      totalSku, totalStock,
      inToday: inToday._sum.qty ?? 0,
      outToday: outToday._sum.qty ?? 0,
      lowCount: lowStock.length,
    },
    trend: Object.values(trendMap),
    donut,
    lowStock: lowStock.slice(0, 6),
    recent,
  });
}
