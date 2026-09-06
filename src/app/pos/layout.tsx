'use client'

import { LanguageProvider } from '@/lib/LanguageContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function PosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/pos/login'

  return (
    <LanguageProvider>
      {isLoginPage ? (
        <div className="min-h-screen bg-black">
          {children}
        </div>
      ) : (
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-black text-white p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img src="/yarkaita-logo.png" alt="YARKAITA Logo" className="h-10 w-auto" />
              </div>
              <div className="space-x-6 font-semibold">
                <Link href="/pos" className="hover:text-gray-300 transition">Dashboard</Link>
              </div>
            </div>
          </nav>
          <main className="container mx-auto p-6">
            {children}
          </main>
        </div>
      )}
    </LanguageProvider>
  )
}