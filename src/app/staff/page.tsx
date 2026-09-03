'use client'

import { useLanguage } from '@/lib/LanguageContext'

export default function StaffPage() {
  const { language } = useLanguage()

  const translations = {
    en: {
      welcome: 'Welcome!',
      subtitle: 'Welcome to the YARKAITA Staff Portal.',
      pending: 'Pending Tasks',
      inProgress: 'In Progress',
      completed: 'Completed',
      recent: 'Recent Activities',
      noRecent: 'No recent production tasks assigned yet.',
      today: "Today's Date",
    },
    ha: {
      welcome: 'Barka da zuwa!',
      subtitle: 'Barka da zuwa YARKAITA Staff Portal.',
      pending: 'Aikace-aikacen da suke jiran',
      inProgress: 'Ana aiki',
      completed: 'An kammala',
      recent: 'Ayyukan Kwanan Nan',
      noRecent: 'Babu aikin samarwa da aka sanya ba kwanan nan ba.',
      today: "Kwanan yau",
    },
  }

  const t = translations[language]

  return (
    <div className="space-y-6">
      <div className="bg-black text-white p-10 rounded-xl shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-wide">{t.welcome}</h1>
          <p className="mt-2 text-gray-300">{t.subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">{t.today}</p>
          <p className="text-2xl font-semibold">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-semibold">{t.pending}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-semibold">{t.inProgress}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-semibold">{t.completed}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900">{t.recent}</h2>
        <p className="text-gray-600">{t.noRecent}</p>
      </div>
    </div>
  )
}