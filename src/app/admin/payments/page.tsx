'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function AdminPaymentsPage() {
  const { language } = useLanguage()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const translations = {
    en: {
      title: 'Payments',
      loading: 'Loading payments...',
      error: 'Failed to load payments',
      noPayments: 'No payments found.',
      reference: 'Reference',
      order: 'Order',
      amount: 'Amount',
      status: 'Status',
      date: 'Date',
    },
    ha: {
      title: 'Biyan Kuɗi',
      loading: 'Ana loda biyan kuɗi...',
      error: 'An kasa loda biyan kuɗi',
      noPayments: 'Babu biyan kuɗi da aka samu.',
      reference: 'Lambar',
      order: 'Oda',
      amount: 'Adadin',
      status: 'Matsayi',
      date: 'Kwanan wata',
    },
  }

  const t = translations[language]

  useEffect(() => {
    async function fetchPayments() {
      try {
        const token = localStorage.getItem('yarkaita_token')
        const res = await fetch('/api/payments', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch payments')
        const data = await res.json()
        setPayments(data)
      } catch (err) {
        setError(t.error)
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [language])

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{t.title}</h2>

      {loading ? (
        <p className="text-gray-600">{t.loading}</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : payments.length === 0 ? (
        <p className="text-gray-600">{t.noPayments}</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.reference}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.order}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.amount}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.date}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.reference}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.order?.orderNumber || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{payment.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      payment.status === 'SUCCESSFUL' ? 'bg-green-100 text-green-800' :
                      payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}