"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";

export default function HistoryClient({ user }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  async function load() {
    const j = await fetch(`/api/transactions?type=${type}&q=${encodeURIComponent(q)}`).then((r) => r.json());
    setItems(j.items ?? []);
  }
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [type, q]);
  useEffect(() => { load(); }, []);

  return (
    <AppShell user={user}>
      <h1 className="text-xl font-bold">Riwayat & Jurnal Transaksi</h1>
      <p className="text-xs text-slate-500">Audit trail — tidak bisa diubah sembarangan, hanya void via kompensasi oleh ADMIN</p>
      <div className="card p-3 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kode / nota / nama…" className="input !w-64" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="input !w-40">
          <option value="">Semua</option><option value="IN">Masuk</option><option value="OUT">Keluar</option>
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="data w-full min-w-[900px]">
          <thead><tr><th>Tanggal</th><th>Kode</th><th>Barang</th><th>Tipe</th><th>Qty</th><th>Stok</th><th>Ref</th><th>Oleh</th></tr></thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id}>
                <td className="text-xs whitespace-nowrap">{new Date(t.date).toLocaleString("id-ID")}</td>
                <td className="font-mono text-xs">{t.code}</td>
                <td>{t.product?.name}<span className="block text-[11px] font-mono text-slate-500">{t.product?.sku}</span></td>
                <td><span className={cn("badge", t.type === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{t.type} • {t.reason}</span></td>
                <td className="font-bold tabular-nums">{t.type === "IN" ? "+" : "-"}{t.qty}</td>
                <td className="font-mono text-xs tabular-nums">{t.stockBefore}→{t.stockAfter}</td>
                <td className="font-mono text-xs">{t.refNo ?? "-"}</td>
                <td className="text-xs">{t.createdBy?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
