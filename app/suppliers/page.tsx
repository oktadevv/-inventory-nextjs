import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SuppliersClient from "./suppliers-client";

export default async function SuppliersPage() {
  const s = await getSession();
  if (!s) redirect("/login");
  return <SuppliersClient user={s} isAdmin={s.role === "ADMIN"} />;
}
