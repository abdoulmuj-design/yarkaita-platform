'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import Link from 'next/link'

export default function AdminPage() {
  const { language } = useLanguage()
  const [stats, setStats] = useState({
    orders: 0,
    customers: 0,
    products: 0,
    payments: 0,
    productionJobs: 0,
  })
  const [loading, setLoading] = useState(true)

  const translations = {
    en: {
      title: 'Admin Dashboard',
      subtitle: 'Overview of YARKAITA business operations',
      orders: 'Orders',
      customers: 'Customers',
      products: 'Products',
      payments: 'Payments',
      production: 'Production Jobs',
      loading: 'Loading...',
      manage: 'Manage',
    },
    ha: {
      title: 'Admin Dashboard',
      subtitle: 'Bayani kan ayyukan kasuwancin YARKAITA',
      orders: 'Oda',
      customers: 'Abokan ciniki',
      products: 'Samfura',
      payments: 'Biyan kuɗi',
      production: 'Ayyukan samarwa',
      loading: 'Ana loda...',
      manage: 'Sarrafa',
    },
  }

  const t = translations[language]

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('yarkaita_token')
        const headers = { 'Authorization': `Bearer ${token}` }

        const [ordersRes, customersRes, productsRes, paymentsRes, jobsRes] = await Promise.all([
          fetch('/api/orders', { headers }),
          fetch('/api/customers', { headers }),
          fetch('/api/products', { headers }),
          fetch('/api/payments', { headers }),
          fetch('/api/production/jobs', { headers }),
        ])

        const [orders, customers, products, payments, jobs] = await Promise.all([
          ordersRes.json(),
          customersRes.json(),
          productsRes.json(),
          paymentsRes.json(),
          jobsRes.json(),
        ])

        setStats({
          orders: Array.isArray(orders) ? orders.length : 0,
          customers: Array.isArray(customers) ? customers.length : 0,
          products: Array.isArray(products) ? products.length : 0,
          payments: Array.isArray(payments) ? payments.length : 0,
          productionJobs: Array.isArray(jobs) ? jobs.length : 0,
        })
      } catch (err) {
        console.error('Failed to fetch stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: t.orders, value: stats.orders, color: 'border-blue-500' },
    { label: t.customers, value: stats.customers, color: 'border-green-500' },
    { label: t.products, value: stats.products, color: 'border-yellow-500' },
    { label: t.payments, value: stats.payments, color: 'border-purple-500' },
    { label: t.production, value: stats.productionJobs, color: 'border-red-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-black text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/yarkaita-logo.png" alt="YARKAITA Logo" className="h-10 w-auto" />
          </div>
          <div className="space-x-6 font-semibold">
            <Link href="/admin" className="hover:text-gray-300 transition">Dashboard</Link>
            <Link href="/admin/orders" className="hover:text-gray-300 transition">Orders</Link>
            <Link href="/admin/customers" className="hover:text-gray-300 transition">Customers</Link>
            <Link href="/admin/products" className="hover:text-gray-300 transition">Products</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-6">
        <div className="bg-black text-white p-8 rounded-xl shadow-xl mb-8">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="mt-2 text-gray-300">{t.subtitle}</p>
        </div>

        {loading ? (
          <p className="text-gray-600">{t.loading}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, index) => (
              <div key={index} className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${card.color}`}>
                <h3 className="text-gray-500 text-sm font-semibold">{card.label}</h3>
                <p className="text-4xl font-bold text-gray-800 mt-2">{card.value}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}