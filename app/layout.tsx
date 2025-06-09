import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { LanguageProvider } from "@/contexts/language-context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PicTour",
  description: "地图导览应用",
  icons: {
    icon: "/logo.png",
  },
  generator: "v0.dev",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}