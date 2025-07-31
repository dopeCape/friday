import type { Metadata } from 'next'
import { dark } from '@clerk/themes'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import './globals.css'
import Navbar from '@/components/Navbar/Navbar'
import { Toaster } from "@/components/ui/sonner"
import NextTopLoader from 'nextjs-toploader';


export const metadata: Metadata = {
  title: 'Friday',
  description: 'AI powered learning platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider appearance={
      { baseTheme: dark }
    }>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
          <link href="https://www.nerdfonts.com/assets/css/webfont.css" rel="stylesheet" />
          <link
            rel="icon"
            href="/icon.svg"
            type="image/svg"
          />
        </head>
        <body className={` antialiased bg-[var(--friday-background)] dark nf`}>
          <NextTopLoader
            showSpinner={false}
            color="#63a1ff"
          />
          <Navbar />
          <div className=''>
            {children}
          </div>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
