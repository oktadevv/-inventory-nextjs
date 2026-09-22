"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("admin@rrstore.id");
  const [password, setPassword] = useState("admin123");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr("");
    const r = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password, remember }),
    });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) { setErr(j.error || "Login gagal"); return; }
    router.push("/"); router.refresh();
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-100 dark:bg-slate-950 p-4">
      <div className="card w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white grid place-items-center font-bold text-lg">R</div>
          <div>
            <h1 className="font-bold">RR Store Inventory</h1>
            <p className="text-xs text-slate-500">Login Admin / Staff</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-medium">Email / Username</label>
            <input className="input mt-1" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium">Password</label>
            <input type="password" className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me (30 hari)
          </label>
          {err && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">{err}</p>}
          <button className="btn-primary w-full justify-center" disabled={loading}>{loading ? "Memeriksa…" : "Masuk Dashboard"}</button>
        </form>
        <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
          Demo: <b>admin@rrstore.id / admin123</b> (ADMIN)<br />atau <b>staff@rrstore.id / staff123</b> (STAFF)
        </div>
      </div>
    </div>
  );
}
