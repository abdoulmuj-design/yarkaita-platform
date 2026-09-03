import { LanguageProvider } from '@/lib/LanguageContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  )
}