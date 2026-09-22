"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Plus, Pencil, Trash2, X, Phone } from "lucide-react";

export default function SuppliersClient({ user, isAdmin }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ company: "", picName: "", whatsapp: "", address: "", note: "" });

  async function load() {
    const j = await fetch("/api/suppliers").then((r) => r.json());
    setItems(j.items ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const url = editing ? `/api/suppliers/${editing.id}` : "/api/suppliers";
    await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShow(false); setEditing(null); load();
  }

  return (
    <AppShell user={user}>
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Manajemen Supplier</h1><p className="text-xs text-slate-500">{items.length} supplier aktif</p></div>
        <button onClick={() => { setEditing(null); setForm({ company: "", picName: "", whatsapp: "", address: "", note: "" }); setShow(true); }} className="btn-primary"><Plus size={15} /> Tambah Supplier</button>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((s) => (
          <div key={s.id} className="card p-4 space-y-1">
            <div className="flex items-start justify-between">
              <div><p className="font-mono text-[11px] text-slate-500">{s.code}</p><h3 className="font-semibold">{s.company}</h3></div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(s); setForm({ company: s.company, picName: s.picName ?? "", whatsapp: s.whatsapp ?? "", address: s.address ?? "", note: s.note ?? "" }); setShow(true); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Pencil size={15} /></button>
                  <button onClick={async () => { if (confirm(`Hapus ${s.company}?`)) { await fetch(`/api/suppliers/${s.id}`, { method: "DELETE" }); load(); } }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                </div>
              )}
            </div>
            <p className="text-xs">PIC: {s.picName || "-"}</p>
            <p className="text-xs flex items-center gap-1"><Phone size={12} /> {s.whatsapp || "-"}</p>
            <p className="text-xs text-slate-500">{s.address || "-"}</p>
            {s.note && <p className="text-[11px] bg-slate-50 dark:bg-slate-800 rounded p-2 mt-1">{s.note}</p>}
          </div>
        ))}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShow(false)} />
          <form onSubmit={save} className="relative card p-5 w-full max-w-md space-y-3">
            <div className="flex justify-between items-center"><h3 className="font-bold">{editing ? "Edit" : "Tambah"} Supplier</h3><button type="button" onClick={() => setShow(false)}><X size={18} /></button></div>
            {[["company", "Nama Perusahaan / Toko*"], ["picName", "Nama Kontak / Sales"], ["whatsapp", "No. WhatsApp"], ["address", "Alamat"], ["note", "Catatan"]].map(([k, l]) => (
              <div key={k}><label className="text-xs">{l}</label><input className="input mt-1" value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required={k === "company"} /></div>
            ))}
            <button className="btn-primary w-full justify-center">Simpan</button>
          </form>
        </div>
      )}
    </AppShell>
  );
}
