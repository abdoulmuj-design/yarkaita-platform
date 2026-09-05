'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const res = await fetch(`/api/orders/track/${orderNumber}`)
      if (!res.ok) throw new Error('Order not found')
      const data = await res.json()
      setOrder(data)
    } catch (err) {
      setError('Order not found. Please check the order number and try again.')
    } finally {
      setLoading(false)
    }
  }

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
            <Link href="/cart" className="hover:text-gray-300 transition">Cart</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Track Your Order</h1>

        <form onSubmit={handleSearch} className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Enter order number (e.g., ORD-123456)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition mt-4 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="max-w-md mx-auto bg-red-50 text-red-600 p-4 rounded-lg mt-4 text-center">
            {error}
          </div>
        )}

        {order && (
          <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>
            <p><strong>Order Number:</strong> {order.orderNumber}</p>
            <p><strong>Status:</strong> <span className="font-semibold text-blue-600">{order.status}</span></p>
            <p><strong>Total:</strong> ₦{order.totalAmount.toLocaleString()}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>

            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Items</h3>
            <ul className="space-y-2">
              {order.items?.map((item: any) => (
                <li key={item.id} className="border-b pb-2">
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    {item.color} / {item.size} - ₦{item.unitPrice.toLocaleString()} x {item.quantity}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}