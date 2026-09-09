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
    markDelivered: 'Mark as Delivered',
  } : {
    title: 'Kayayyakin da Na Kai',
    noDeliveries: 'Babu kayayyakin da aka sanya maka.',
    loading: 'Ana loda kayayyaki...',
    markDelivered: 'Yi alamar An Kai',
  }

  useEffect(() => {
    async function fetchDeliveries() {
      try {
        const token = localStorage.getItem('yarkaita_token')
        const user = JSON.parse(localStorage.getItem('yarkaita_user') || '{}')

        const res = await fetch('/api/deliveries?role=staff', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-user-id': user.id,
          },
        })
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

  async function handleMarkDelivered(orderId: string) {
    if (!confirm('Are you sure you want to mark this order as delivered?')) return

    try {
      const token = localStorage.getItem('yarkaita_token')
      const res = await fetch('/api/deliveries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, status: 'DELIVERED' }),
      })

      if (!res.ok) throw new Error('Failed to mark as delivered')

      alert('Order marked as delivered!')
      // Refetch deliveries
      const user = JSON.parse(localStorage.getItem('yarkaita_user') || '{}')
      const updated = await fetch('/api/deliveries?role=staff', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': user.id,
        },
      })
      const data = await updated.json()
      setDeliveries(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      alert('Failed to mark as delivered')
    }
  }

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
                Total: ₦{Number(order.totalAmount).toLocaleString()}
              </p>
              <button
                onClick={() => handleMarkDelivered(order.id)}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
              >
                {t.markDelivered}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}