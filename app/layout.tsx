// app/layout.tsx

import { type Metadata } from 'next'
import './globals.css'
import { NextAuthProvider } from "./providers";

export const metadata: Metadata = {
  title: 'Loop',
  description: 'Minimal Satck Clone',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="type-theme">
      <body suppressHydrationWarning className={`antialiased`}>
        <NextAuthProvider>
          <main>
            {children}
          </main>
        </NextAuthProvider>
      </body>
    </html>
  )
}