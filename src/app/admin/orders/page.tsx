'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import Link from 'next/link'

export default function AdminOrdersPage() {
  const { language } = useLanguage()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const translations = {
    en: {
      title: 'Orders',
      loading: 'Loading orders...',
      error: 'Failed to load orders',
      noOrders: 'No orders found.',
      orderNumber: 'Order Number',
      customer: 'Customer',
      status: 'Status',
      total: 'Total',
      date: 'Date',
      salesChannel: 'Sales Channel',
    },
    ha: {
      title: 'Oda',
      loading: 'Ana loda oda...',
      error: 'An kasa loda oda',
      noOrders: 'Babu oda da aka samu.',
      orderNumber: 'Lambar Oda',
      customer: 'Abokin ciniki',
      status: 'Matsayi',
      total: 'Jimlar',
      date: 'Kwanan wata',
      salesChannel: 'Hanyar Sayarwa',
    },
  }

  const t = translations[language]

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const token = localStorage.getItem('yarkaita_token')
        if (!token) {
          setError('No token found. Please login again.')
          setLoading(false)
          return
        }

        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` },
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch orders: ${res.status}`)
        }

        const data = await res.json()
        if (Array.isArray(data)) {
          setOrders(data)
          setError('')
        } else {
          setError('Invalid data format received.')
        }
      } catch (err) {
        console.error(err)
        setError(t.error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [language])

  if (loading) return <p className="text-gray-600">{t.loading}</p>
  if (error) return <p className="text-red-600">{error}</p>
  if (orders.length === 0) return <p className="text-gray-600">{t.noOrders}</p>

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{t.title}</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.orderNumber}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.customer}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.total}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.date}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.salesChannel}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer?.firstName} {order.customer?.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{order.totalAmount?.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.salesChannel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}