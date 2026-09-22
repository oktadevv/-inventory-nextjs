import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ProductsClient from "./products-client";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const s = await getSession();
  if (!s) redirect("/login");
  const sp = await searchParams;
  return <ProductsClient user={s} initialQ={sp.q ?? ""} initialStatus={sp.status ?? ""} isAdmin={s.role === "ADMIN"} />;
}
