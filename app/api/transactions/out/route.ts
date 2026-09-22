import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const Schema = z.object({
    productId: z.string(),
    qty: z.coerce.number().int().min(1),
    date: z.string().optional(),
    note: z.string().optional().nullable(),
    reason: z.enum(["SALE", "DAMAGED", "SERVICE", "RETURN"]).default("SALE"),
  });
  try {
    const b = Schema.parse(await req.json());
    const date = b.date ? new Date(b.date) : new Date();
    const r = await prisma.$transaction(async (tx) => {
      const p = await tx.product.findUnique({ where: { id: b.productId } });
      if (!p || !p.isActive || p.deletedAt) throw new Error("Barang tidak aktif");
      if (p.stock < b.qty) throw new Error(`Stok tidak cukup. Sisa ${p.stock}`);
      const before = p.stock, after = before - b.qty;
      await tx.product.update({ where: { id: p.id }, data: { stock: after } });
      const trx = await tx.transaction.create({
        data: {
          code: `TRX-OUT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
          type: "OUT", reason: b.reason as any, productId: p.id,
          qty: b.qty, stockBefore: before, stockAfter: after,
          note: b.note || null, date, createdById: s.id,
        },
      });
      return { before, after, trx };
    });
    return NextResponse.json({ ok: true, ...r });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Gagal" }, { status: 400 });
  }
}
