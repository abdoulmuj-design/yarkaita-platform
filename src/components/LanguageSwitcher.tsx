'use client'

import { useLanguage } from '@/lib/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
          language === 'en' ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('ha')}
        className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
          language === 'ha' ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'
        }`}
      >
        Hausa
      </button>
    </div>
  )
}