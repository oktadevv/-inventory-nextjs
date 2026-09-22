import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

async function mutate(type: "IN" | "OUT", body: any, userId: string) {
  const Schema = z.object({
    productId: z.string(),
    supplierId: z.string().optional().nullable(),
    qty: z.coerce.number().int().min(1),
    date: z.string().optional(),
    refNo: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
    reason: z.string().optional(),
  });
  const b = Schema.parse(body);
  const date = b.date ? new Date(b.date) : new Date();

  return prisma.$transaction(async (tx) => {
    const p = await tx.product.findUnique({ where: { id: b.productId } });
    if (!p || !p.isActive || p.deletedAt) throw new Error("Barang tidak aktif / dihapus");
    if (type === "OUT" && p.stock < b.qty) throw new Error(`Stok tidak cukup. Sisa ${p.stock}, diminta ${b.qty}`);
    const before = p.stock;
    const after = type === "IN" ? before + b.qty : before - b.qty;
    await tx.product.update({ where: { id: p.id }, data: { stock: after } });
    const prefix = type === "IN" ? "TRX-IN" : "TRX-OUT";
    const code = `${prefix}-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const trx = await tx.transaction.create({
      data: {
        code, type,
        reason: (b.reason as any) ?? (type === "IN" ? "PURCHASE" : "SALE"),
        productId: p.id, supplierId: type === "IN" ? b.supplierId || p.supplierId || null : null,
        qty: b.qty, stockBefore: before, stockAfter: after,
        note: b.note || null, refNo: b.refNo || null, date, createdById: userId,
      },
    });
    return { before, after, trx };
  });
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const r = await mutate("IN", await req.json(), s.id);
    return NextResponse.json({ ok: true, ...r });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Gagal" }, { status: 400 });
  }
}
