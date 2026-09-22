"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

export default function TxForm({ user, mode, title, desc }: { user: any; mode: "IN" | "OUT"; title: string; desc: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [f, setF] = useState({ productId: "", supplierId: "", qty: 1, date: new Date().toISOString().slice(0, 10), refNo: "", reason: mode === "IN" ? "PURCHASE" : "SALE", note: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((j) => {
      setProducts(j.items ?? []);
      if (j.items?.[0]) setF((x) => ({ ...x, productId: j.items[0].id, supplierId: j.items[0].supplierId ?? "" }));
    });
    fetch("/api/suppliers").then((r) => r.json()).then((j) => setSuppliers(j.items ?? []));
  }, []);

  const sel = products.find((p) => p.id === f.productId);
  const after = sel ? (mode === "IN" ? sel.stock + (+f.qty || 0) : sel.stock - (+f.qty || 0)) : 0;
  const invalid = !sel || +f.qty < 1 || (mode === "OUT" && +f.qty > sel.stock);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg("");
    const r = await fetch(`/api/transactions/${mode === "IN" ? "in" : "out"}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
    });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) { setMsg("❌ " + (j.error || "Gagal")); return; }
    setMsg(`✅ Berhasil. Stok ${j.before} → ${j.after} (${j.trx.code})`);
    setProducts((ps) => ps.map((p) => (p.id === f.productId ? { ...p, stock: j.after } : p)));
  }

  return (
    <AppShell user={user}>
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-xs text-slate-500">{desc}</p>
      <div className="grid lg:grid-cols-3 gap-4">
        <form onSubmit={submit} className="card p-5 space-y-3 lg:col-span-2">
          <div><label className="text-xs font-medium">Pilih Barang*</label>
            <select className="input mt-1" value={f.productId} onChange={(e) => setF({ ...f, productId: e.target.value })}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} — stok {p.stock} ({p.sku})</option>)}
            </select></div>
          {mode === "IN" && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Supplier</label>
                <select className="input mt-1" value={f.supplierId} onChange={(e) => setF({ ...f, supplierId: e.target.value })}>
                  <option value="">— ikut default barang —</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.company}</option>)}
                </select></div>
              <div><label className="text-xs font-medium">No. Nota / PO</label><input className="input mt-1 font-mono" value={f.refNo} onChange={(e) => setF({ ...f, refNo: e.target.value })} placeholder="PO-2026-…" /></div>
            </div>
          )}
          {mode === "OUT" && (
            <div><label className="text-xs font-medium">Tujuan / Keterangan*</label>
              <select className="input mt-1" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })}>
                <option value="SALE">Terjual</option><option value="DAMAGED">Rusak</option><option value="SERVICE">Servis</option><option value="RETURN">Retur</option>
              </select></div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium">Jumlah {mode === "IN" ? "Masuk" : "Keluar"}*</label>
              <div className="flex gap-2 mt-1">
                <button type="button" className="btn-ghost" onClick={() => setF({ ...f, qty: Math.max(1, +f.qty - 1) })}>−</button>
                <input type="number" min={1} className="input text-center" value={f.qty} onChange={(e) => setF({ ...f, qty: +e.target.value })} />
                <button type="button" className="btn-ghost" onClick={() => setF({ ...f, qty: +f.qty + 1 })}>+</button>
              </div></div>
            <div><label className="text-xs font-medium">Tanggal</label><input type="date" className="input mt-1" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
          </div>
          <div><label className="text-xs font-medium">Catatan</label><textarea className="input mt-1" rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
          {msg && <p className="text-xs rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 border">{msg}</p>}
          <button disabled={invalid || loading} className="btn-primary w-full justify-center">{loading ? "Menyimpan…" : `Simpan ${mode === "IN" ? "Masuk" : "Keluar"}`}</button>
          {mode === "OUT" && sel && +f.qty > sel.stock && <p className="text-xs text-red-600">⚠️ Qty melebihi stok ({sel.stock}). Transaksi akan ditolak sistem.</p>}
        </form>
        <div className="card p-5 h-fit space-y-2">
          <h3 className="text-sm font-semibold">Ringkasan Live</h3>
          {sel ? (<>
            <p className="text-sm font-medium">{sel.name}</p>
            <p className="font-mono text-xs text-slate-500">{sel.sku}</p>
            <div className="flex items-center gap-2 text-2xl font-bold tabular-nums"><span>{sel.stock}</span><span className="text-slate-400">→</span><span className={after < 0 ? "text-red-600" : "text-green-600"}>{after}</span></div>
            <p className="text-[11px] text-slate-500">Atomic: cek + update stok dalam 1 DB transaction. Jurnal immutable.</p>
          </>) : <p className="text-xs text-slate-500">Pilih barang dulu</p>}
        </div>
      </div>
    </AppShell>
  );
}
