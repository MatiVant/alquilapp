import { HeadBucketCommand } from "@aws-sdk/client-s3"
import { sql } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { getR2 } from "@/lib/r2"

export async function GET() {
  let database: "connected" | "not_configured" | "error" = "not_configured"
  let r2: "connected" | "not_configured" | "error" = "not_configured"
  if (process.env.DATABASE_URL) { try { await getDb().execute(sql`select 1`); database = "connected" } catch { database = "error" } }
  if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET) { try { const storage = getR2(); await storage.client.send(new HeadBucketCommand({ Bucket: storage.bucket })); r2 = "connected" } catch { r2 = "error" } }
  const ok = database === "connected" && r2 !== "error"
  return Response.json({ ok, database, r2 }, { status: ok ? 200 : 503 })
}
