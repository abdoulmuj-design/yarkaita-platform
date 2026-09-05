'use client'

import { LanguageProvider } from '@/lib/LanguageContext'
import { usePathname } from 'next/navigation'

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
          {children}
        </div>
      )}
    </LanguageProvider>
  )
}