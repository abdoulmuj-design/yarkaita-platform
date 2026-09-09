'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function StaffDeliveriesPage() {
  const { language } = useLanguage()
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const t = language === 'en' ? {
    title: 'My Deliveries',
    noDeliveries: 'No deliveries assigned to you.',
    loading: 'Loading deliveries...',
  } : {
    title: 'Kayayyakin da Na Kai',
    noDeliveries: 'Babu kayayyakin da aka sanya maka.',
    loading: 'Ana loda kayayyaki...',
  }

  useEffect(() => {
    async function fetchDeliveries() {
      try {
        const token = localStorage.getItem('yarkaita_token')
        const headers = { 'Authorization': `Bearer ${token}` }

        const res = await fetch('/api/deliveries', { headers })
        const data = await res.json()
        setDeliveries(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDeliveries()
  }, [])

  if (loading) return <p className="text-gray-600">{t.loading}</p>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t.title}</h2>

      {deliveries.length === 0 ? (
        <p className="text-gray-600">{t.noDeliveries}</p>
      ) : (
        <div className="space-y-4">
          {deliveries.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
              <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
              <p className="text-sm text-gray-500">
                Customer: {order.customer?.firstName} {order.customer?.lastName}
              </p>
              <p className="text-sm text-gray-500">
                Address: {order.address?.address || 'No address provided'}
              </p>
              <p className="text-sm text-gray-500">
                Total: ₦{order.totalAmount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}