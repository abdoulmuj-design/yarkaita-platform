'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products')
        if (!res.ok) throw new Error('Failed to fetch products')
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Get unique categories
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category?.name || 'Other')))]

  // Filter products by category
  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter((p) => p.category?.name === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/yarkaita-logo.png" alt="YARKAITA Logo" className="h-10 w-auto" />
          </div>
          <div className="space-x-6 font-semibold">
            <Link href="/" className="hover:text-gray-300 transition">Home</Link>
            <Link href="/products" className="hover:text-gray-300 transition">Products</Link>
            <Link href="/custom-request" className="hover:text-gray-300 transition">Custom Request</Link>
            <Link href="/cart" className="hover:text-gray-300 transition">Cart</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">All Products</h1>

        {/* Category Filter */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-black hover:text-black'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-600">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="block">
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                  {/* An gyara nan: aspect-[3/4] */}
                  <div className="bg-gray-200 aspect-[3/4] flex items-center justify-center">
                    {product.media?.[0] ? (
                      <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category?.name}</p>
                    {product.variants?.[0] && (
                      <p className="text-gray-900 font-bold mt-2">From ₦{product.variants[0].price.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-black text-white py-6 mt-10">
        <div className="container mx-auto text-center">
          <p>© 2026 YARKAITA. All rights reserved.</p>
          <p className="mt-2 text-gray-400 text-sm">Designed & Built by abdoulmuj-design</p>
        </div>
      </footer>
    </div>
  )
}