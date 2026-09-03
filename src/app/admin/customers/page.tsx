'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function AdminCustomersPage() {
  const { language } = useLanguage()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const translations = {
    en: {
      title: 'Customers',
      loading: 'Loading customers...',
      error: 'Failed to load customers',
      noCustomers: 'No customers found.',
      code: 'Code',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      acquisitionSource: 'Source',
      createdAt: 'Date',
    },
    ha: {
      title: 'Abokan Ciniki',
      loading: 'Ana loda abokan ciniki...',
      error: 'An kasa loda abokan ciniki',
      noCustomers: 'Babu abokan ciniki da aka samu.',
      code: 'Lamba',
      name: 'Suna',
      email: 'Imel',
      phone: 'Waya',
      acquisitionSource: 'Tushen',
      createdAt: 'Kwanan wata',
    },
  }

  const t = translations[language]

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const token = localStorage.getItem('yarkaita_token')
        const res = await fetch('/api/customers', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch customers')
        const data = await res.json()
        setCustomers(data)
      } catch (err) {
        setError(t.error)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [language])

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{t.title}</h2>

      {loading ? (
        <p className="text-gray-600">{t.loading}</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : customers.length === 0 ? (
        <p className="text-gray-600">{t.noCustomers}</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.code}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.name}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.email}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.phone}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.acquisitionSource}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.createdAt}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.customerCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.firstName} {customer.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.acquisitionSource}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(customer.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}