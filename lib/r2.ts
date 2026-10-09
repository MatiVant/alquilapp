import { S3Client } from "@aws-sdk/client-s3"

export function getR2() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!accountId || !accessKeyId || !secretAccessKey || !process.env.R2_BUCKET) throw new Error("R2 no está configurado")
  return { client: new S3Client({ region: "auto", endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey }, forcePathStyle: true }), bucket: process.env.R2_BUCKET }
}
