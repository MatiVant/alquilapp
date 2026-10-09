import { createHash, createHmac, randomBytes, scrypt as scryptCallback } from "node:crypto"
import { promisify } from "node:util"

const scrypt = promisify(scryptCallback)
const secret = () => process.env.AUTH_SECRET || "alquilapp-development-secret-change-me"
const base64url = (value: string) => Buffer.from(value).toString("base64url")

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const derived = await scrypt(password, salt, 64) as Buffer
  return `${salt}:${derived.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":")
  if (!salt || !expected) return false
  const derived = await scrypt(password, salt, 64) as Buffer
  return createHash("sha256").update(derived).digest("hex") === createHash("sha256").update(Buffer.from(expected, "hex")).digest("hex")
}

export async function signSession(username: string) {
  const payload = `${username}|${Date.now() + 1000 * 60 * 60 * 24 * 7}`
  const signature = createHmac("sha256", secret()).update(payload).digest().toString("base64url")
  return `${base64url(payload)}.${signature}`
}

export function verifySession(value?: string) {
  if (!value) return null
  try { const [encoded, signature] = value.split("."); const payload = Buffer.from(encoded, "base64url").toString(); const expected = createHmac("sha256", secret()).update(payload).digest().toString("base64url"); if (signature !== expected) return null; const [username, expires] = payload.split("|"); if (!username || Number(expires) < Date.now()) return null; return { username } } catch { return null }
}
