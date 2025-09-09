import "./globals.css"
import type { Metadata } from "next"
import Providers from "@/components/Providers"

export const metadata: Metadata = {
  title: "LiveDocs",
  description: "A Google Docs clone with realtime collaboration",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}