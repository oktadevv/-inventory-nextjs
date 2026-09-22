import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "rr-store-dev-secret";
export type Session = { id: string; name: string; username: string; role: "ADMIN" | "STAFF" };

export function signToken(payload: Session) {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}
export function verifyToken(token: string): Session | null {
  try { return jwt.verify(token, SECRET) as Session; } catch { return null; }
}
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const t = store.get("rr_session")?.value;
  if (!t) return null;
  return verifyToken(t);
}
