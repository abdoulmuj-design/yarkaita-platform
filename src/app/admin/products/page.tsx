'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import Link from 'next/link'

export default function AdminProductsPage() {
  const { language } = useLanguage()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const translations = {
    en: {
      title: 'Products',
      addNew: 'Add New Product',
      loading: 'Loading products...',
      error: 'Failed to load products',
      noProducts: 'No products found.',
      name: 'Name',
      category: 'Category',
      variants: 'Variants',
      price: 'Price',
      status: 'Status',
      edit: 'Edit',
    },
    ha: {
      title: 'Samfura',
      addNew: 'Ƙara Sabon Samfuri',
      loading: 'Ana loda samfura...',
      error: 'An kasa loda samfura',
      noProducts: 'Babu samfura da aka samu.',
      name: 'Suna',
      category: 'Sashe',
      variants: 'Bambance-bambance',
      price: 'Farashi',
      status: 'Matsayi',
      edit: 'Gyara',
    },
  }

  const t = translations[language]

  useEffect(() => {
    async function fetchProducts() {
      try {
        const token = localStorage.getItem('yarkaita_token')
        const res = await fetch('/api/products', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch products')
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        setError(t.error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [language])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">{t.title}</h2>
        <Link href="/admin/products/new" className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition">
          {t.addNew}
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-600">{t.loading}</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600">{t.noProducts}</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.name}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.category}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.variants}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.price}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.edit}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.variants?.length || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.variants?.length > 0 ? `₦${product.variants[0].price.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link href={`/admin/products/${product.id}`} className="text-blue-600 hover:text-blue-800">
                      {t.edit}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}