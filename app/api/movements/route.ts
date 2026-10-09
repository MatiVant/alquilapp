import { eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { agencies, movements, properties } from "@/lib/db/schema"

const amount = (v: unknown) => String(Number(v) || 0)
const dateValue = (v: unknown) => v == null || v === "" ? new Date().toISOString().slice(0, 10) : String(v)

export async function POST(request: Request) {
  const body = await request.json()
  const [agency] = await getDb().select({ id: agencies.id }).from(agencies).limit(1)
  if (!agency) return Response.json({ error: "No hay inmobiliaria configurada" }, { status: 400 })
  let propertyId: string | undefined
  if (body.propertyDbId) { const [property] = await getDb().select({ id: properties.id }).from(properties).where(eq(properties.id, body.propertyDbId)); propertyId = property?.id }
  const [movement] = await getDb().insert(movements).values({ agencyId: agency.id, propertyId, kind: body.kind || "Otro", concept: body.concept || null, amount: amount(body.amount), applied: amount(body.applied), date: dateValue(body.date), notes: body.notes || null, metadata: body.metadata || null }).returning()
  return Response.json(movement, { status: 201 })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  if (!body.id) return Response.json({ error: "Falta el movimiento" }, { status: 400 })
  const [movement] = await getDb().update(movements).set({ applied: amount(body.applied), notes: body.notes || null }).where(eq(movements.id, body.id)).returning()
  if (!movement) return Response.json({ error: "Movimiento no encontrado" }, { status: 404 })
  return Response.json(movement)
}
