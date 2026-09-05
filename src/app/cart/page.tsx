'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('yarkaita_cart') || '[]')
    setCart(saved)
    setLoading(false)
  }, [])

  function handleRemove(variantId: string) {
    const updated = cart.filter((item) => item.variantId !== variantId)
    setCart(updated)
    localStorage.setItem('yarkaita_cart', JSON.stringify(updated))
  }

  function handleQuantityChange(variantId: string, change: number) {
    const updated = cart.map((item) =>
      item.variantId === variantId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
    )
    setCart(updated)
    localStorage.setItem('yarkaita_cart', JSON.stringify(updated))
  }

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  async function handleCheckout() {
    setCheckingOut(true)
    try {
      const token = localStorage.getItem('yarkaita_token')
      const user = JSON.parse(localStorage.getItem('yarkaita_user') || '{}')
      let customerId = user.id

      // If not logged in, create a walk-in customer
      if (!customerId) {
        const customerRes = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }, // No auth header needed
          body: JSON.stringify({
            firstName: 'Walk-In',
            lastName: 'Customer',
            acquisitionSource: 'WEBSITE',
          }),
        })
        const customer = await customerRes.json()
        customerId = customer.id
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: JSON.stringify({ customerId, salesChannel: 'WEBSITE', items: cart }),
      })

      if (!res.ok) throw new Error('Checkout failed')

      const data = await res.json()
      localStorage.removeItem('yarkaita_cart')
      setCart([])
      alert(`Order ${data.order.orderNumber} completed successfully! Total: ₦${total.toLocaleString()}`)
      router.push('/')
    } catch (err) {
      console.error(err)
      alert('Checkout failed. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  if (loading) return <p className="text-center text-gray-600">Loading cart...</p>

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

      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Cart</h1>

        {cart.length === 0 ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            {cart.map((item) => (
              <div key={item.variantId} className="border-b py-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                  <p className="text-sm text-gray-500">
                    {item.color} / {item.size} - ₦{item.unitPrice.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleQuantityChange(item.variantId, -1)} className="bg-gray-200 px-3 py-1 rounded-lg">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.variantId, 1)} className="bg-gray-200 px-3 py-1 rounded-lg">+</button>
                  <button onClick={() => handleRemove(item.variantId)} className="text-red-500 hover:text-red-700">✕</button>
                </div>
              </div>
            ))}
            <div className="mt-6 text-right">
              <p className="text-2xl font-bold text-gray-900">Total: ₦{total.toLocaleString()}</p>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition mt-4 disabled:opacity-50"
              >
                {checkingOut ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}