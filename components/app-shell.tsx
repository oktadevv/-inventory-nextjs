"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Truck, ArrowDownToLine, ArrowUpFromLine, History, LogOut, Menu, X, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Barang", icon: Package },
  { href: "/suppliers", label: "Supplier", icon: Truck },
  { href: "/transactions-in", label: "Barang Masuk", icon: ArrowDownToLine },
  { href: "/transactions-out", label: "Barang Keluar", icon: ArrowUpFromLine },
  { href: "/transactions", label: "Riwayat", icon: History },
];

export function ThemeToggle() {
  return (
    <button
      className="btn-ghost !px-2.5"
      onClick={() => {
        const el = document.documentElement;
        const dark = el.classList.toggle("dark");
        try { localStorage.theme = dark ? "dark" : "light"; } catch {}
      }}
      title="Dark/Light"
    >
      <span className="dark:hidden">🌙</span>
      <span className="hidden dark:inline">☀️</span>
    </button>
  );
}

export function AppShell({ children, lowStock = 0, user }: { children: React.ReactNode; lowStock?: number; user?: { name: string; role: string } | null }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const side = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-200 dark:border-slate-800">
        <div className="h-8 w-8 rounded-lg bg-blue-600 text-white grid place-items-center font-bold">R</div>
        <div>
          <p className="text-sm font-bold leading-none">RR Store</p>
          <p className="text-[11px] text-slate-500">Inventory System</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {NAV.map((n) => {
          const active = path === n.href;
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                active ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800")}>
              <Icon size={18} />
              {n.label}
              {n.label === "Barang" && lowStock > 0 && (
                <span className={cn("ml-auto text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1",
                  active ? "bg-white/20" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300")}>
                  <AlertTriangle size={12} />{lowStock}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 grid place-items-center text-xs font-bold">
            {(user?.name || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">{user?.name || "User"}</p>
            <p className="text-[11px] text-slate-500">{user?.role || "STAFF"}</p>
          </div>
          <button onClick={logout} className="ml-auto p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden lg:block w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 h-screen">
        {side}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900">{side}</div>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 px-4">
          <button className="lg:hidden btn-ghost !px-2.5" onClick={() => setOpen(true)}><Menu size={18} /></button>
          <form action="/products" className="hidden sm:block flex-1 max-w-md">
            <input name="q" placeholder="Cari barang / SKU…  ( / )" className="input" />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <span className="hidden md:inline text-xs text-slate-500">Rabu, 9 Sep 2026</span>
          </div>
        </header>
        <main className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">{children}</main>
      </div>
    </div>
  );
}
