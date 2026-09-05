'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function AdminReportsPage() {
  const { language } = useLanguage()
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalPayments: 0,
    totalProductionJobs: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const translations = {
    en: {
      title: 'Reports & Analytics',
      subtitle: 'Overview of YARKAITA business performance',
      totalSales: 'Total Sales',
      totalOrders: 'Total Orders',
      totalCustomers: 'Total Customers',
      totalPayments: 'Total Payments',
      totalProductionJobs: 'Total Production Jobs',
      loading: 'Loading reports...',
      error: 'Failed to load reports',
    },
    ha: {
      title: 'Rahotanni & Bincike',
      subtitle: 'Bayani kan aikin kasuwancin YARKAITA',
      totalSales: 'Jimlar Siyarwa',
      totalOrders: 'Jimlar Oda',
      totalCustomers: 'Jimlar Abokan Ciniki',
      totalPayments: 'Jimlar Biyan Kuɗi',
      totalProductionJobs: 'Jimlar Ayyukan Samarwa',
      loading: 'Ana loda rahotanni...',
      error: 'An kasa loda rahotanni',
    },
  }

  const t = translations[language]

  useEffect(() => {
    async function fetchReports() {
      try {
        const token = localStorage.getItem('yarkaita_token')
        const headers = { 'Authorization': `Bearer ${token}` }

        const [ordersRes, customersRes, paymentsRes, jobsRes] = await Promise.all([
          fetch('/api/orders', { headers }),
          fetch('/api/customers', { headers }),
          fetch('/api/payments', { headers }),
          fetch('/api/production/jobs', { headers }),
        ])

        const [orders, customers, payments, jobs] = await Promise.all([
          ordersRes.json(),
          customersRes.json(),
          paymentsRes.json(),
          jobsRes.json(),
        ])

        const ordersArray = Array.isArray(orders) ? orders : []
        const paymentsArray = Array.isArray(payments) ? payments : []

        const totalSales = paymentsArray.reduce((sum: number, p: any) => {
          return p.status === 'SUCCESSFUL' ? sum + p.amount : sum
        }, 0)

        setStats({
          totalSales: totalSales,
          totalOrders: ordersArray.length,
          totalCustomers: Array.isArray(customers) ? customers.length : 0,
          totalPayments: paymentsArray.length,
          totalProductionJobs: Array.isArray(jobs) ? jobs.length : 0,
        })
      } catch (err) {
        setError(t.error)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [language])

  const statCards = [
    { label: t.totalSales, value: `₦${stats.totalSales.toLocaleString()}`, color: 'border-green-500', icon: '💰' },
    { label: t.totalOrders, value: stats.totalOrders.toString(), color: 'border-blue-500', icon: '📦' },
    { label: t.totalCustomers, value: stats.totalCustomers.toString(), color: 'border-yellow-500', icon: '👥' },
    { label: t.totalPayments, value: stats.totalPayments.toString(), color: 'border-purple-500', icon: '💳' },
    { label: t.totalProductionJobs, value: stats.totalProductionJobs.toString(), color: 'border-red-500', icon: '🏭' },
  ]

  return (
    <div>
      <div className="bg-black text-white p-8 rounded-xl shadow-xl mb-8">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="mt-2 text-gray-300">{t.subtitle}</p>
      </div>

      {loading ? (
        <p className="text-gray-600">{t.loading}</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${card.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 text-sm font-semibold">{card.label}</h3>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}