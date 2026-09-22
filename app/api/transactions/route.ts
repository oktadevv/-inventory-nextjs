import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "";
  const q = searchParams.get("q") ?? "";
  const where: any = {};
  if (type === "IN" || type === "OUT") where.type = type;
  if (q) where.OR = [{ code: { contains: q } }, { refNo: { contains: q } }, { product: { name: { contains: q } } }, { product: { sku: { contains: q } } }];
  const items = await prisma.transaction.findMany({
    where, include: { product: { select: { name: true, sku: true } }, supplier: { select: { company: true } }, createdBy: { select: { name: true } } },
    orderBy: { date: "desc" }, take: 300,
  });
  return NextResponse.json({ items });
}
