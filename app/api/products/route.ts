import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(2),
  sku: z.string().optional(),
  categoryId: z.string(),
  supplierId: z.string().optional().nullable(),
  buyPrice: z.coerce.number().min(0).default(0),
  sellPrice: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().int().min(0).default(0),
  minStock: z.coerce.number().int().min(0).default(5),
});

export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const cat = searchParams.get("category") ?? "";
  const status = searchParams.get("status") ?? "";
  const where: any = { isActive: true, deletedAt: null };
  if (q) where.OR = [{ name: { contains: q } }, { sku: { contains: q } }];
  if (cat) where.categoryId = cat;
  const items = await prisma.product.findMany({ where, include: { category: true, supplier: true }, orderBy: { updatedAt: "desc" }, take: 200 });
  const filtered = status === "low" ? items.filter((p) => p.stock <= p.minStock && p.stock > 0)
    : status === "out" ? items.filter((p) => p.stock <= 0)
    : status === "safe" ? items.filter((p) => p.stock > p.minStock) : items;
  return NextResponse.json({ items: filtered });
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (s.role !== "ADMIN") return NextResponse.json({ error: "Hanya ADMIN" }, { status: 403 });
  const body = Schema.parse(await req.json());
  const sku = body.sku?.trim() || `BRG-${Date.now().toString().slice(-6)}`;
  const item = await prisma.product.create({ data: { ...body, sku, supplierId: body.supplierId || null } });
  return NextResponse.json({ ok: true, item });
}
