import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { getDb } from "@/lib/db"
import { agencies, authUsers } from "@/lib/db/schema"
import { hashPassword, signSession, verifyPassword } from "@/lib/auth"

export async function POST(request: Request) {
  const body = await request.json()
  const username = String(body.username || "").trim()
  const password = String(body.password || "")
  const initialUsername = process.env.AUTH_INITIAL_USERNAME || "studioinmobiliaria"
  const initialPassword = process.env.AUTH_INITIAL_PASSWORD || "123123123"
  const db = getDb()
  const [agency] = await db.select({ id: agencies.id }).from(agencies).limit(1)
  if (!agency) return Response.json({ error: "No hay una inmobiliaria configurada" }, { status: 503 })
  let [user] = await db.select().from(authUsers).where(eq(authUsers.agencyId, agency.id))
  if (!user && username === initialUsername && password === initialPassword) { [user] = await db.insert(authUsers).values({ agencyId: agency.id, username: initialUsername, passwordHash: await hashPassword(initialPassword) }).returning() }
  if (!user || user.username !== username || !(await verifyPassword(password, user.passwordHash))) return Response.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 })
  const cookieStore = await cookies(); cookieStore.set("alquilapp_session", await signSession(user.username), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7, path: "/" })
  return Response.json({ ok: true, username: user.username })
}
