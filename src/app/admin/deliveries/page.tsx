'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function AdminDeliveriesPage() {
  const { language } = useLanguage()
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<{ [orderId: string]: string }>({})
  const [loading, setLoading] = useState(true)

  const translations = {
    en: {
      title: 'Dispatch Management',
      subtitle: 'Assign delivery staff to orders that are ready for dispatch',
      noOrders: 'No orders ready for delivery.',
      order: 'Order',
      customer: 'Customer',
      amount: 'Amount',
      assign: 'Assign Staff',
      assignBtn: 'Assign',
      selectStaff: 'Select Staff',
      status: 'Status',
    },
    ha: {
      title: 'Sarrafa Kaya',
      subtitle: 'Sanya ma\'aikatan kai kaya ga odar da ke shirye',
      noOrders: 'Babu odar da ke shirye don kai kaya.',
      order: 'Oda',
      customer: 'Abokin Ciniki',
      amount: 'Adadin',
      assign: 'Sanya Ma\'aikaci',
      assignBtn: 'Sanya',
      selectStaff: 'Zaɓi Ma\'aikaci',
      status: 'Matsayi',
    },
  }

  const t = translations[language]

  async function fetchData() {
    try {
      const token = localStorage.getItem('yarkaita_token')
      const headers = { 'Authorization': `Bearer ${token}` }

      const [ordersRes, usersRes] = await Promise.all([
        fetch('/api/deliveries?role=admin', { headers }),
        fetch('/api/users', { headers }),
      ])

      const ordersData = await ordersRes.json()
      const usersData = await usersRes.json()

      setOrders(Array.isArray(ordersData) ? ordersData : [])
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [language])

  async function handleAssign(orderId: string) {
    const assignedUserId = selectedUser[orderId]
    if (!assignedUserId) {
      alert('Please select a staff member first.')
      return
    }

    try {
      const token = localStorage.getItem('yarkaita_token')
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, assignedUserId }),
      })

      if (!res.ok) throw new Error('Failed to assign delivery')

      alert('Delivery assigned successfully!')
      fetchData()
    } catch (err) {
      console.error(err)
      alert('Failed to assign delivery')
    }
  }

  if (loading) return <p className="text-gray-600">Loading...</p>

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t.title}</h2>
      <p className="text-gray-600 mb-6">{t.subtitle}</p>

      {orders.length === 0 ? (
        <p className="text-gray-600">{t.noOrders}</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-bold">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {t.customer}: {order.customer?.firstName} {order.customer?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t.amount}: ₦{Number(order.totalAmount).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t.status}: {order.status}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedUser[order.id] || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, [order.id]: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm flex-1"
                >
                  <option value="">{t.selectStaff}</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.roles?.[0]?.role?.name || 'Staff'})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssign(order.id)}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800"
                >
                  {t.assignBtn}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}