import { LanguageProvider } from '@/lib/LanguageContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </LanguageProvider>
  )
}