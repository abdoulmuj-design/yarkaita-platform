'use client'

import { useState } from 'react'

export default function StaffPage() {
  const [lang, setLang] = useState<'en' | 'ha'>('en')

  const toggleLang = () => {
    setLang(lang === 'en' ? 'ha' : 'en')
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-black text-white p-10 rounded-xl shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-wide">
            {lang === 'en' ? 'Welcome!' : 'Barka da zuwa!'}
          </h1>
          <p className="mt-2 text-gray-300">
            {lang === 'en' ? 'Welcome to the YARKAITA Staff Portal.' : 'Barka da zuwa YARKAITA Staff Portal.'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">
            {lang === 'en' ? "Today's Date" : 'Ranar Yau'}
          </p>
          <p className="text-2xl font-semibold">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-semibold">
            {lang === 'en' ? 'Pending Tasks' : 'Ayyuka da Suke Jira'}
          </h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-semibold">
            {lang === 'en' ? 'In Progress' : 'Ayyuka da Suke Gudana'}
          </h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-semibold">
            {lang === 'en' ? 'Completed' : 'Ayyukan da Aka Kammala'}
          </h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4">
          {lang === 'en' ? 'Recent Activities' : 'Ayyukan Baya-baya'}
        </h2>
        <p className="text-gray-600">
          {lang === 'en' ? 'No recent production tasks assigned yet.' : 'Babu ayyukan samarwa da aka ba su ba tukuna.'}
        </p>
      </div>
    </div>
  )
}