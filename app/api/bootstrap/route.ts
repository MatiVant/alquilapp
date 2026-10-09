import { getDb } from "@/lib/db"
import { agencies, contractDocuments, contractIncidents, contracts, monthClosings, monthlyPayments, movements, owners, properties, propertyCharges, tenants } from "@/lib/db/schema"

export async function GET() {
  if (!process.env.DATABASE_URL) return Response.json({ enabled: false })
  try {
    const db = getDb()
    const [agencyRows, ownerRows, tenantRows, propertyRows, chargeRows, contractRows, incidentRows, documentRows, paymentRows, movementRows, closingRows] = await Promise.all([
      db.select().from(agencies), db.select().from(owners), db.select().from(tenants), db.select().from(properties), db.select().from(propertyCharges), db.select().from(contracts), db.select().from(contractIncidents), db.select().from(contractDocuments), db.select().from(monthlyPayments), db.select().from(movements), db.select().from(monthClosings),
    ])
    return Response.json({ enabled: true, agency: agencyRows[0] || null, owners: ownerRows, tenants: tenantRows, properties: propertyRows, charges: chargeRows, contracts: contractRows, incidents: incidentRows, documents: documentRows, payments: paymentRows, movements: movementRows, monthCloses: closingRows })
  } catch (error) {
    return Response.json({ enabled: false, error: error instanceof Error ? error.message : "No se pudo cargar Neon" }, { status: 503 })
  }
}
