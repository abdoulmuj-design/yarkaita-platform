import { LanguageProvider } from '@/lib/LanguageContext'

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  )
}