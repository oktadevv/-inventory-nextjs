import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.supplier.findMany({ where: { deletedAt: null }, orderBy: { company: "asc" } });
  const cats = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ items, categories: cats });
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.company) return NextResponse.json({ error: "Nama perusahaan wajib" }, { status: 400 });
  const count = await prisma.supplier.count();
  const item = await prisma.supplier.create({
    data: {
      code: b.code?.trim() || `SUP-${String(count + 1).padStart(3, "0")}`,
      company: b.company, picName: b.picName || null,
      whatsapp: b.whatsapp || null, address: b.address || null, note: b.note || null,
    },
  });
  return NextResponse.json({ ok: true, item });
}
