import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySessionEdge } from "@/lib/session-edge"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  if (path === "/login" || path.startsWith("/_next") || path === "/favicon.ico" || path === "/api/auth/login" || path === "/api/health") return NextResponse.next()
  const valid = await verifySessionEdge(request.cookies.get("alquilapp_session")?.value)
  if (valid) return NextResponse.next()
  if (path.startsWith("/api/")) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  return NextResponse.redirect(new URL("/login", request.url))
}

export const config = { matcher: ["/((?!.*\\..*).*)"] }
