import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { identifier, password, remember } = await req.json();
  if (!identifier || !password)
    return NextResponse.json({ error: "Lengkapi username/email & password" }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }], isActive: true },
  });
  if (!user) return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 401 });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Password salah" }, { status: 401 });

  const token = signToken({ id: user.id, name: user.name, username: user.username, role: user.role as "ADMIN" | "STAFF" });
  const res = NextResponse.json({ ok: true, role: user.role, name: user.name });
  res.cookies.set("rr_session", token, {
    httpOnly: true, path: "/", sameSite: "lax",
    maxAge: remember ? 30 * 24 * 3600 : 8 * 3600,
  });
  return res;
}
