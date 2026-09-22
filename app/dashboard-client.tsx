"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Package, Boxes, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";
import { rupiah, stockStatus, timeAgo, cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

type Dash = {
  kpi: { totalSku: number; totalStock: number; inToday: number; outToday: number; lowCount: number };
  trend: { date: string; masuk: number; keluar: number }[];
  donut: { name: string; value: number; color: string }[];
  lowStock: any[];
  recent: any[];
};

function Kpi({ icon, label, value, sub, alert }: any) {
  const Icon = icon;
  return (
    <div className={cn("card p-4", alert && "border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20")}>
      <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-medium">
        <Icon size={15} /> {label}
      </div>
      <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
      <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>
    </div>
  );
}

export default function DashboardClient({ user, lowStock }: { user: any; lowStock: number }) {
  const [d, setD] = useState<Dash | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setD);
  }, []);

  if (!d) return <AppShell user={user} lowStock={lowStock}><p className="text-sm text-slate-500">Memuat dashboard…</p></AppShell>;

  return (
    <AppShell user={user} lowStock={d.kpi.lowCount}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Overview Stok</h1>
          <p className="text-xs text-slate-500">Ringkasan operasional hari ini & tren 14 hari terakhir</p>
        </div>
        <div className="flex gap-2">
          <Link href="/transactions-in" className="btn-primary !py-1.5"><Plus size={15} /> Barang Masuk</Link>
          <Link href="/transactions-out" className="btn-ghost !py-1.5">Barang Keluar</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <Kpi icon={Package} label="Jenis Barang" value={d.kpi.totalSku} sub="SKU aktif" />
        <Kpi icon={Boxes} label="Total Stok" value={d.kpi.totalStock.toLocaleString("id-ID")} sub="semua gudang" />
        <Kpi icon={ArrowDownToLine} label="Masuk Hari Ini" value={d.kpi.inToday} sub="unit diterima" />
        <Kpi icon={ArrowUpFromLine} label="Keluar Hari Ini" value={d.kpi.outToday} sub="terjual / rusak / servis" />
        <Kpi icon={AlertTriangle} label="Stok Menipis" value={d.kpi.lowCount} sub="perlu restock" alert />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold">Tren Masuk vs Keluar (14 hari)</h3>
          <div className="h-64 mt-2">
            <ResponsiveContainer>
              <AreaChart data={d.trend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="masuk" stroke="#16A34A" fill="#16A34A33" name="Masuk" />
                <Area type="monotone" dataKey="keluar" stroke="#DC2626" fill="#DC262633" name="Keluar" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-semibold">Stok per Kategori</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={d.donut} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {d.donut.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">⚠️ Stok Kritis — perlu restock</h3>
            <Link href="/products?status=low" className="text-xs text-blue-600">Lihat semua</Link>
          </div>
          <table className="data w-full mt-2">
            <thead><tr><th>Barang</th><th>Stok</th><th>Status</th></tr></thead>
            <tbody>
              {d.lowStock.map((p: any) => {
                const st = stockStatus(p.stock, p.minStock);
                return (
                  <tr key={p.id}>
                    <td><p className="font-medium">{p.name}</p><p className="text-[11px] text-slate-500 font-mono">{p.sku}</p></td>
                    <td className="tabular-nums">{p.stock}/{p.minStock}</td>
                    <td><span className={cn("badge", st.tone === "danger" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>{st.label}</span></td>
                  </tr>
                );
              })}
              {d.lowStock.length === 0 && <tr><td colSpan={3} className="text-center text-slate-500 py-6">Semua stok aman 🎉</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Aktivitas Terakhir</h3>
            <Link href="/transactions" className="text-xs text-blue-600">Riwayat lengkap</Link>
          </div>
          <div className="mt-3 space-y-3">
            {d.recent.map((t: any) => (
              <div key={t.id} className="flex gap-3 text-sm">
                <span className={cn("mt-1 h-2.5 w-2.5 rounded-full shrink-0", t.type === "IN" ? "bg-green-500" : "bg-red-500")} />
                <div className="min-w-0">
                  <p className="truncate"><b>{t.type === "IN" ? "+" : "-"}{t.qty}</b> {t.product?.name} <span className="text-slate-500">• {t.reason}</span></p>
                  <p className="text-[11px] text-slate-500">{timeAgo(t.date)} • oleh {t.createdBy?.name}</p>
                </div>
                <span className="ml-auto text-[11px] font-mono text-slate-500">{t.stockBefore}→{t.stockAfter}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
