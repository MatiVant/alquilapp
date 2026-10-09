import { and, eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { agencies, owners, properties } from "@/lib/db/schema"

async function agencyId() {
  const [agency] = await getDb().select({ id: agencies.id }).from(agencies).limit(1)
  return agency?.id
}

export async function GET() {
  const id = await agencyId()
  if (!id) return Response.json([])
  return Response.json(await getDb().select().from(owners).where(eq(owners.agencyId, id)))
}

export async function POST(request: Request) {
  const id = await agencyId()
  if (!id) return Response.json({ error: "No hay una inmobiliaria configurada" }, { status: 400 })
  const body = await request.json()
  const [owner] = await getDb().insert(owners).values({ agencyId: id, name: String(body.name || "").trim(), phone: body.phone || null, email: body.email || null, address: body.address || null, document: body.document || null, bankAccount: body.bank || null, notes: body.notes || null }).returning()
  return Response.json(owner, { status: 201 })
}

export async function PATCH(request: Request) {
  const id = await agencyId()
  const body = await request.json()
  if (!id || !body.oldName || !body.name) return Response.json({ error: "Nombre incompleto" }, { status: 400 })
  const [owner] = await getDb().update(owners).set({ name: String(body.name).trim(), phone: body.phone || null, email: body.email || null, address: body.address || null, document: body.document || null, bankAccount: body.bank || null, notes: body.notes || null }).where(and(eq(owners.agencyId, id), eq(owners.name, body.oldName))).returning()
  if (!owner) return Response.json({ error: "Propietario no encontrado" }, { status: 404 })
  return Response.json(owner)
}

export async function DELETE(request: Request) {
  const id = await agencyId()
  const body = await request.json()
  if (!id || !body.name) return Response.json({ error: "Propietario incompleto" }, { status: 400 })
  const [owner] = await getDb().select({ id: owners.id }).from(owners).where(and(eq(owners.agencyId, id), eq(owners.name, body.name)))
  if (!owner) return Response.json({ error: "Propietario no encontrado" }, { status: 404 })
  await getDb().update(properties).set({ ownerId: null }).where(eq(properties.ownerId, owner.id))
  await getDb().delete(owners).where(eq(owners.id, owner.id))
  return Response.json({ ok: true })
}
