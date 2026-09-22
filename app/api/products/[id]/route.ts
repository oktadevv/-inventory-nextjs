import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  // Penyesuaian stok manual dilarang langsung — harus via opname
  const { stock: _ignored, ...safe } = body;
  const item = await prisma.product.update({ where: { id }, data: { ...safe, supplierId: body.supplierId || null } });
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s || s.role !== "ADMIN") return NextResponse.json({ error: "Hanya ADMIN" }, { status: 403 });
  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { isActive: false, deletedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
