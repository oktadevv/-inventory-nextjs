import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const lowCount = await prisma.product.count({
    where: { isActive: true, deletedAt: null },
  });
  // hitung low yang sebenarnya di client via API; kirim count kasar dulu
  const all = await prisma.product.findMany({ where: { isActive: true, deletedAt: null }, select: { stock: true, minStock: true } });
  const low = all.filter((p) => p.stock <= p.minStock).length;
  return <DashboardClient user={session} lowStock={low} />;
}
