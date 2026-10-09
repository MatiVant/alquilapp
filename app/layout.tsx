import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = { title: "AlquilApp · Administración simple", description: "Administrá alquileres, propietarios y rentabilidad." }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html> }
