import { and, eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { agencies, monthClosings } from "@/lib/db/schema"
export async function POST(request:Request){const body=await request.json();const [agency]=await getDb().select({id:agencies.id}).from(agencies).limit(1);if(!agency||!body.month)return Response.json({error:"Mes incompleto"},{status:400});const values={agencyId:agency.id,month:body.month,status:body.status||"Abierto",closedAt:body.status==="Cerrado"?new Date():null};const [row]=await getDb().insert(monthClosings).values(values).onConflictDoUpdate({target:[monthClosings.agencyId,monthClosings.month],set:{status:values.status,closedAt:values.closedAt}}).returning();return Response.json(row)}
