import { and, eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { agencies, monthlyPayments, ownerPayments, owners, properties } from "@/lib/db/schema"

const amount = (v: unknown) => String(Number(v) || 0)
const dateValue = (v: unknown) => v == null || v === "" ? new Date().toISOString().slice(0, 10) : String(v)

export async function POST(request: Request) {
  const body = await request.json()
  const db = getDb()
  const [agency] = await db.select({ id: agencies.id }).from(agencies).limit(1)
  if (!agency || !body.ownerName) return Response.json({ error: "Falta propietario" }, { status: 400 })
  const [owner] = await db.select({ id: owners.id }).from(owners).where(and(eq(owners.agencyId, agency.id), eq(owners.name, body.ownerName)))
  if (!owner) return Response.json({ error: "Propietario no encontrado" }, { status: 404 })
  const selected = Array.isArray(body.payments) ? body.payments : []
  let total = 0
  for (const item of selected) {
    const [property] = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, item.propertyDbId))
    if (!property) continue
    const [payment] = await db.select().from(monthlyPayments).where(and(eq(monthlyPayments.propertyId, property.id), eq(monthlyPayments.month, String(item.month))))
    if (!payment) continue
    total += Number(payment.rent) - Number(payment.commission)
    await db.update(monthlyPayments).set({ ownerPaid: true, ownerPaidDate: dateValue(body.date) }).where(eq(monthlyPayments.id, payment.id))
  }
  const [record] = await db.insert(ownerPayments).values({ ownerId: owner.id, date: dateValue(body.date), amount: amount(total), notes: body.notes || null }).returning()
  return Response.json({ ok: true, payment: record, total })
}
