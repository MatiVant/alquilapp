import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { getDb } from "@/lib/db"
import { authUsers } from "@/lib/db/schema"
import { hashPassword, verifyPassword, verifySession } from "@/lib/auth"

export async function POST(request: Request) {
  const session = verifySession((await cookies()).get("alquilapp_session")?.value)
  if (!session) return Response.json({ error: "No autenticado" }, { status: 401 })
  const body = await request.json(); const currentPassword = String(body.currentPassword || ""); const newPassword = String(body.newPassword || "")
  if (newPassword.length < 8) return Response.json({ error: "La nueva contraseña debe tener al menos 8 caracteres" }, { status: 400 })
  const db = getDb(); const [user] = await db.select().from(authUsers).where(eq(authUsers.username, session.username))
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) return Response.json({ error: "La contraseña actual no es correcta" }, { status: 400 })
  await db.update(authUsers).set({ passwordHash: await hashPassword(newPassword), updatedAt: new Date() }).where(eq(authUsers.id, user.id))
  return Response.json({ ok: true })
}
