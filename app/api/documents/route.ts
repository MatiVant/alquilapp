import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getDb } from "@/lib/db"
import { contractDocuments } from "@/lib/db/schema"
import { getR2 } from "@/lib/r2"

export async function POST(request: Request) {
  const form = await request.formData()
  const contractId = String(form.get("contractId") || "")
  const description = String(form.get("description") || "")
  const file = form.get("file")
  if (!contractId || !(file instanceof File)) return Response.json({ error: "Faltan contrato o archivo" }, { status: 400 })
  try {
    const { client, bucket } = getR2()
    const storageKey = `contracts/${contractId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: storageKey, Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type || "application/octet-stream" }))
    const [document] = await getDb().insert(contractDocuments).values({ contractId, name: file.name, description: description || null, storageKey, mimeType: file.type || null }).returning()
    return Response.json({ ...document, dataUrl: `/api/documents/${document.id}` }, { status: 201 })
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No se pudo guardar el documento" }, { status: 503 }) }
}
