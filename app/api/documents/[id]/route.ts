import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { contractDocuments } from "@/lib/db/schema"
import { getR2 } from "@/lib/r2"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [document] = await getDb().select().from(contractDocuments).where(eq(contractDocuments.id, id))
  if (!document) return new Response("Documento no encontrado", { status: 404 })
  try { const { client, bucket } = getR2(); const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: document.storageKey }), { expiresIn: 300 }); return Response.redirect(url) } catch { return new Response("R2 no está configurado", { status: 503 }) }
}
