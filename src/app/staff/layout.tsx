import Link from 'next/link'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">YARKAITA Staff</h1>
          <div className="space-x-4">
            <Link href="/staff" className="hover:underline">Dashboard</Link>
            <Link href="/staff/tasks" className="hover:underline">My Tasks</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  )
}