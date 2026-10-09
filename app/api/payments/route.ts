import { and, eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { monthlyPayments, properties } from "@/lib/db/schema"

const amount = (v: unknown) => String(Number(v) || 0)
const dateValue = (v: unknown) => v == null || v === "" ? null : String(v)

export async function POST(request: Request) {
  const body = await request.json()
  const propertyId = body.propertyDbId
  if (!propertyId || !body.month) return Response.json({ error: "Faltan propiedad o mes" }, { status: 400 })
  const [property] = await getDb().select({ id: properties.id }).from(properties).where(eq(properties.id, propertyId))
  if (!property) return Response.json({ error: "Propiedad no encontrada" }, { status: 404 })
  const values = { propertyId, month: String(body.month), status: body.status || "Pendiente", paidDate: dateValue(body.paidDate), rent: amount(body.rent), taxes: amount(body.taxes), commission: amount(body.commission), collected: amount(body.collected), pending: amount(body.pending), ownerPaid: Boolean(body.ownerPaid), ownerPaidDate: dateValue(body.ownerPaidDate) }
  const [payment] = await getDb().insert(monthlyPayments).values(values).onConflictDoUpdate({ target: [monthlyPayments.propertyId, monthlyPayments.month], set: values }).returning()
  return Response.json(payment, { status: 201 })
}

export async function PATCH(request: Request) { return POST(request) }
