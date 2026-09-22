import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import TxForm from "../transactions-in/tx-form";

export default async function TxOutPage() {
  const s = await getSession();
  if (!s) redirect("/login");
  return <TxForm user={s} mode="OUT" title="Barang Keluar (Stock Out)" desc="Sales / Rusak / Servis — otomatis mengurangi stok + validasi" />;
}
