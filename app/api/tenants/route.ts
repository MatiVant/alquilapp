import { and, eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { agencies, tenants } from "@/lib/db/schema"

async function agencyId(){const [a]=await getDb().select({id:agencies.id}).from(agencies).limit(1);return a?.id}
export async function PATCH(request:Request){const body=await request.json();const id=await agencyId();if(!id||!body.oldName||!body.name)return Response.json({error:"Datos incompletos"},{status:400});const [row]=await getDb().update(tenants).set({name:String(body.name).trim(),phone:body.phone||null,email:body.email||null,document:body.document||null,notes:body.notes||null}).where(and(eq(tenants.agencyId,id),eq(tenants.name,body.oldName))).returning();if(!row)return Response.json({error:"Inquilino no encontrado"},{status:404});return Response.json(row)}
