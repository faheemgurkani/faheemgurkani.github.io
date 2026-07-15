import type React from "react"
import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import { GeistPixelGrid } from "geist/font/pixel"
import "./globals.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
})

const geistPixelGrid = GeistPixelGrid

export const metadata: Metadata = {
  title: "Faheem.dev — AI Engineer | ML Engineer | Backend Engineer",
  description:
    "Muhammad Faheem — AI & Machine Learning Engineer building LLMs, computer vision systems, agentic workflows, and production backends.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-dark-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${geistPixelGrid.variable}`}>
      <body className="font-mono antialiased">
        {children}
      </body>
    </html>
  )
}
