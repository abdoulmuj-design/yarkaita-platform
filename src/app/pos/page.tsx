'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function POSPage() {
  const { language } = useLanguage()
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const translations = {
    en: {
      title: 'POS Dashboard',
      subtitle: 'Overview of sales activities',
      totalSales: 'Total Sales',
      totalOrders: 'Total Orders',
      totalCustomers: 'Total Customers',
      recentOrders: 'Recent Orders',
      loading: 'Loading...',
      noOrders: 'No recent orders found.',
    },
    ha: {
      title: 'POS Dashboard',
      subtitle: 'Bayani kan ayyukan siyarwa',
      totalSales: 'Jimlar Siyarwa',
      totalOrders: 'Jimlar Oda',
      totalCustomers: 'Jimlar Abokan Ciniki',
      recentOrders: 'Odarin Kwanan Nan',
      loading: 'Ana loda...',
      noOrders: 'Babu odar da aka samu kwanan nan.',
    },
  }

  const t = translations[language]

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('yarkaita_token')
        const headers = { 'Authorization': `Bearer ${token}` }

        const [ordersRes, customersRes] = await Promise.all([
          fetch('/api/orders', { headers }),
          fetch('/api/customers', { headers }),
        ])

        const [orders, customers] = await Promise.all([
          ordersRes.json(),
          customersRes.json(),
        ])

        const ordersArray = Array.isArray(orders) ? orders : []
        const customersArray = Array.isArray(customers) ? customers : []

        // Calculate total sales from successful payments
        const totalSales = ordersArray.reduce((sum: number, order: any) => {
          return sum + (order.totalAmount || 0)
        }, 0)

        setStats({
          totalSales: totalSales,
          totalOrders: ordersArray.length,
          totalCustomers: customersArray.length,
        })
        setRecentOrders(ordersArray.slice(0, 5))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [language])

  return (
    <div className="container mx-auto p-6">
      <div className="bg-black text-white p-8 rounded-xl shadow-xl mb-8">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="mt-2 text-gray-300">{t.subtitle}</p>
      </div>

      {loading ? (
        <p className="text-gray-600">{t.loading}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
              <h3 className="text-gray-500 text-sm font-semibold">{t.totalSales}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">₦{stats.totalSales.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
              <h3 className="text-gray-500 text-sm font-semibold">{t.totalOrders}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
              <h3 className="text-gray-500 text-sm font-semibold">{t.totalCustomers}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCustomers}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">{t.recentOrders}</h2>
            {recentOrders.length === 0 ? (
              <p className="text-gray-600">{t.noOrders}</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="border-b pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{order.customer?.firstName} {order.customer?.lastName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₦{order.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{order.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}