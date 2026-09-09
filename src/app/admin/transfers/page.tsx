'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function AdminTransfersPage() {
  const { language } = useLanguage()
  const [transfers, setTransfers] = useState<any[]>([])

  // ... code for displaying transfers
}