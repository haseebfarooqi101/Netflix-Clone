import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Netflix',
  description: 'Watch TV shows and movies anytime, anywhere.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-netflix-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}
