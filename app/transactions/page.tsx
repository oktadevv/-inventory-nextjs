import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import HistoryClient from "./history-client";

export default async function TransactionsPage() {
  const s = await getSession();
  if (!s) redirect("/login");
  return <HistoryClient user={s} />;
}
