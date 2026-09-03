import Link from 'next/link'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-black text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src="/yarkaita-logo.png" alt="YARKAITA Logo" className="h-10 w-auto" />
          </div>
          {/* Navigation Links */}
          <div className="space-x-6 font-semibold">
            <Link href="/staff" className="hover:text-gray-300 transition">Dashboard</Link>
            <Link href="/staff/tasks" className="hover:text-gray-300 transition">My Tasks</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  )
}