'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function AdminStaffPage() {
  const { language } = useLanguage()
  const [staff, setStaff] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('TAILOR') // Default role
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const translations = {
    en: {
      title: 'Staff Management',
      addStaff: 'Add New Staff',
      name: 'Name',
      email: 'Email',
      password: 'Password',
      role: 'Role',
      department: 'Department',
      actions: 'Actions',
      loading: 'Loading staff...',
      error: 'Failed to load staff',
      noStaff: 'No staff found.',
      delete: 'Deactivate',
      activate: 'Activate',
    },
    ha: {
      title: 'Sarrafa Ma\'aikata',
      addStaff: 'Ƙara Sabon Ma\'aikaci',
      name: 'Suna',
      email: 'Imel',
      password: 'Kalmar sirri',
      role: 'Matsayi',
      department: 'Sashe',
      actions: 'Ayyuka',
      loading: 'Ana loda ma\'aikata...',
      error: 'An kasa loda ma\'aikata',
      noStaff: 'Babu ma\'aikata da aka samu.',
      delete: 'Kashe',
      activate: 'Kunna',
    },
  }

  const t = translations[language]

  const roles = ['TAILOR', 'CUTTER', 'IRONER', 'STONE_WORKER', 'DISPATCH', 'POS', 'MANAGER']

  useEffect(() => {
    fetchStaff()
  }, [language])

  async function fetchStaff() {
    try {
      const token = localStorage.getItem('yarkaita_token')
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setStaff(data)
    } catch (err) {
      setError(t.error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('yarkaita_token')
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email, password, role, department }),
      })

      if (!res.ok) throw new Error('Failed to add staff')

      setSuccess('Staff added successfully!')
      setName('')
      setEmail('')
      setPassword('')
      setDepartment('')
      await fetchStaff()
    } catch (err) {
      console.error(err)
      setError('Failed to add staff. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleStatus(userId: string, currentStatus: string) {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      const token = localStorage.getItem('yarkaita_token')
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update')
      await fetchStaff()
    } catch (err) {
      console.error(err)
      alert('Failed to update staff status')
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{t.title}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Staff Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4">{t.addStaff}</h3>
          <form onSubmit={handleAddStaff} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.role}</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.department}</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Production"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : t.addStaff}
            </button>
          </form>

          {success && <p className="text-green-600 text-sm mt-3">{success}</p>}
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>

        {/* Staff List */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-gray-600">{t.loading}</p>
          ) : staff.length === 0 ? (
            <p className="text-gray-600">{t.noStaff}</p>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.name}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.email}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.role}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staff.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.roles?.map((r: any) => r.role.name).join(', ') || 'No Role'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            className="text-red-600 hover:text-red-800 underline"
                          >
                            {t.delete}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            className="text-green-600 hover:text-green-800 underline"
                          >
                            {t.activate}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}