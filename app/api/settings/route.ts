import { eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { agencies } from "@/lib/db/schema"

export async function PATCH(request: Request) { const body = await request.json(); const [agency] = await getDb().select({ id: agencies.id }).from(agencies).limit(1); if (!agency) return Response.json({ error: "No hay inmobiliaria" }, { status: 400 }); const [updated] = await getDb().update(agencies).set({ name: body.name || "", legalName: body.legalName || null, taxId: body.cuit || null, address: body.address || null, phone: body.phone || null, email: body.email || null, defaultCommission: String(Number(body.defaultCommission) || 0), contractFeePercent: String(Number(body.contractFeePercent) || 0) }).where(eq(agencies.id, agency.id)).returning(); return Response.json(updated) }
