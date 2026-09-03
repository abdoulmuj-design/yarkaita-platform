'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StaffLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Language state (default: English)
  const [language, setLanguage] = useState<'en' | 'ha'>('en')

  const translations = {
    en: {
      title: 'Staff Login',
      subtitle: 'Welcome back! Please sign in to continue.',
      email: 'Email',
      password: 'Password',
      login: 'Sign In',
      error: 'Invalid email or password',
      loading: 'Signing in...',
      switchToHausa: 'Hausa',
    },
    ha: {
      title: 'Shiga Ma\'aikata',
      subtitle: 'Barka da dawowa! Don Allah ka shiga don ci gaba.',
      email: 'Imel',
      password: 'Kalmar sirri',
      login: 'Shiga',
      error: 'Imel ko kalmar sirri ba daidai ba ne',
      loading: 'Ana shiga...',
      switchToEnglish: 'English',
    },
  }

  const t = translations[language]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t.error)
        setLoading(false)
        return
      }

      // Store token in localStorage
      localStorage.setItem('yarkaita_token', data.token)
      localStorage.setItem('yarkaita_user', JSON.stringify(data.user))

      // Redirect to staff dashboard
      router.push('/staff')
    } catch (err) {
      setError(t.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <img src="/yarkaita-logo.png" alt="YARKAITA Logo" className="h-16 w-auto mx-auto" />
        </div>

        {/* Language Switcher */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${language === 'en' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('ha')}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${language === 'ha' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Hausa
          </button>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800">{t.title}</h1>
        <p className="text-gray-500 text-center mt-2 mb-6">{t.subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? t.loading : t.login}
          </button>
        </form>
      </div>
    </div>
  )
}