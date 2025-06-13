import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

const inter = Inter({ subsets: ['latin'] })

// Import local fonts


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={` `}>
      <body className={inter.className}>{children}</body>
    </html>
  )
} 