import Link from 'next/link'
import { LanguageProvider } from '@/lib/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-black text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src="/yarkaita-logo.png" alt="YARKAITA Logo" className="h-10 w-auto" />
            </div>
            {/* Navigation Links */}
            <div className="flex items-center space-x-6 font-semibold">
              <Link href="/admin" className="hover:text-gray-300 transition">Dashboard</Link>
              <Link href="/admin/orders" className="hover:text-gray-300 transition">Orders</Link>
              <Link href="/admin/customers" className="hover:text-gray-300 transition">Customers</Link>
              <Link href="/admin/products" className="hover:text-gray-300 transition">Products</Link>
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-6">
          {children}
        </main>
      </div>
    </LanguageProvider>
  )
}