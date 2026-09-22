"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { rupiah, stockStatus, cn } from "@/lib/utils";
import { Pencil, Trash2, Plus, Download, X } from "lucide-react";

export default function ProductsClient({ user, initialQ, initialStatus, isAdmin }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus);
  const [cat, setCat] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const [form, setForm] = useState({ name: "", sku: "", categoryId: "", supplierId: "", buyPrice: 0, sellPrice: 0, stock: 0, minStock: 5 });
  const [suppliers, setSuppliers] = useState<any[]>([]);

  async function load() {
    const r = await fetch(`/api/products?q=${encodeURIComponent(q)}&status=${status}&category=${cat}`);
    const j = await r.json();
    setItems(j.items ?? []);
    const s = await fetch("/api/suppliers").then((x) => x.json());
    setSuppliers(s.items ?? []); setCats(s.categories ?? []);
    if (!form.categoryId && s.categories?.[0]) setForm((f) => ({ ...f, categoryId: s.categories[0].id }));
  }
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [q, status, cat]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const url = editing ? `/api/products/${editing.id}` : "/api/products";
    const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!r.ok) { alert((await r.json()).error || "Gagal simpan"); return; }
    setShowForm(false); setEditing(null); load();
  }
  function openAdd() { setEditing(null); setForm({ name: "", sku: "", categoryId: cats[0]?.id ?? "", supplierId: "", buyPrice: 0, sellPrice: 0, stock: 0, minStock: 5 }); setShowForm(true); }
  function openEdit(p: any) { setEditing(p); setForm({ name: p.name, sku: p.sku, categoryId: p.categoryId, supplierId: p.supplierId ?? "", buyPrice: p.buyPrice, sellPrice: p.sellPrice, stock: p.stock, minStock: p.minStock }); setShowForm(true); }

  function exportCsv() {
    const rows = [["SKU", "Nama", "Kategori", "Beli", "Jual", "Stok", "Min", "Supplier", "Status"],
      ...items.map((p) => [p.sku, `"${p.name}"`, p.category?.name, p.buyPrice, p.sellPrice, p.stock, p.minStock, p.supplier?.company ?? "", stockStatus(p.stock, p.minStock).label])];
    const blob = new Blob([rows.map((r) => r.join(";")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "barang.csv"; a.click();
  }

  return (
    <AppShell user={user}>
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Manajemen Barang</h1><p className="text-xs text-slate-500">{items.length} SKU • search live, filter & pagination client</p></div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="btn-ghost"><Download size={15} /> Excel/CSV</button>
          {isAdmin && <button onClick={openAdd} className="btn-primary"><Plus size={15} /> Tambah</button>}
        </div>
      </div>

      <div className="card p-3 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Live search nama / SKU…" className="input !w-64" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="input !w-44">
          <option value="">Semua Kategori</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-40">
          <option value="">Semua Status</option><option value="safe">Aman</option><option value="low">Menipis</option><option value="out">Habis</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="data w-full min-w-[900px]">
          <thead><tr><th>SKU / Nama</th><th>Kategori</th><th>Beli</th><th>Jual</th><th>Stok</th><th>Supplier</th><th>Status</th>{isAdmin && <th>Aksi</th>}</tr></thead>
          <tbody>
            {items.map((p) => {
              const st = stockStatus(p.stock, p.minStock);
              return (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td><p className="font-medium">{p.name}</p><p className="text-[11px] font-mono text-slate-500">{p.sku}</p></td>
                  <td><span className="badge bg-slate-100 dark:bg-slate-800">{p.category?.name}</span></td>
                  <td className="tabular-nums">{rupiah(p.buyPrice)}</td>
                  <td className="tabular-nums">{rupiah(p.sellPrice)}</td>
                  <td className="tabular-nums font-semibold">{p.stock}<span className="text-slate-400 font-normal">/{p.minStock}</span></td>
                  <td className="text-xs">{p.supplier?.company ?? "-"}</td>
                  <td><span className={cn("badge", st.tone === "success" && "bg-green-100 text-green-700", st.tone === "warning" && "bg-amber-100 text-amber-700", st.tone === "danger" && "bg-red-100 text-red-700")}>{st.label}</span></td>
                  {isAdmin && (
                    <td><div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Pencil size={15} /></button>
                      <button onClick={() => setDel(p)} className="p-1.5 hover:bg-red-50 text-red-600 rounded"><Trash2 size={15} /></button>
                    </div></td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <form onSubmit={save} className="relative card p-5 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between"><h3 className="font-bold">{editing ? "Edit Barang" : "Tambah Barang"}</h3><button type="button" onClick={() => setShowForm(false)}><X size={18} /></button></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="text-xs">Nama Barang*</label><input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label className="text-xs">SKU (kosong = auto)</label><input className="input mt-1 font-mono" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
              <div><label className="text-xs">Kategori*</label><select className="input mt-1" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="text-xs">Harga Beli</label><input type="number" className="input mt-1" value={form.buyPrice} onChange={(e) => setForm({ ...form, buyPrice: +e.target.value })} /></div>
              <div><label className="text-xs">Harga Jual</label><input type="number" className="input mt-1" value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: +e.target.value })} /></div>
              {!editing && <div><label className="text-xs">Stok Awal</label><input type="number" className="input mt-1" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} /></div>}
              <div><label className="text-xs">Min. Stok (alert)</label><input type="number" className="input mt-1" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: +e.target.value })} /></div>
              <div className="col-span-2"><label className="text-xs">Supplier</label><select className="input mt-1" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}><option value="">— Tanpa supplier —</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.company}</option>)}</select></div>
            </div>
            <button className="btn-primary w-full justify-center">Simpan</button>
          </form>
        </div>
      )}

      {del && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDel(null)} />
          <div className="relative card p-5 w-full max-w-sm space-y-3">
            <h3 className="font-bold text-red-600">Hapus Barang? (Soft Delete)</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300"><b>{del.name}</b> ({del.sku}) akan diarsipkan. Riwayat transaksi tetap tersimpan.</p>
            <div className="flex gap-2">
              <button onClick={() => setDel(null)} className="btn-ghost flex-1 justify-center">Batal</button>
              <button onClick={async () => { await fetch(`/api/products/${del.id}`, { method: "DELETE" }); setDel(null); load(); }} className="flex-1 rounded-lg bg-red-600 text-white text-sm py-2">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
