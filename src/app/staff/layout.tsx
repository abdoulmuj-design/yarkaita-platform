import Link from 'next/link'
import { LanguageProvider } from '@/lib/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-black text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img src="/yarkaita-logo.png" alt="YARKAITA Logo" className="h-10 w-auto" />
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/staff" className="hover:text-gray-100 transition">Dashboard</Link>
              <Link href="/staff/tasks" className="hover:text-gray-100 transition">My Tasks</Link>
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-6 text-gray-100">
          {children}
        </main>
      </div>
    </LanguageProvider>
  )
}