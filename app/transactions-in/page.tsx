import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import TxForm from "./tx-form";

export default async function TxInPage() {
  const s = await getSession();
  if (!s) redirect("/login");
  return <TxForm user={s} mode="IN" title="Barang Masuk (Stock In)" desc="Procurement — otomatis menambah stok (atomic)" />;
}
