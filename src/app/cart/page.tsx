'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [receipt, setReceipt] = useState<File | null>(null)

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem('yarkaita_cart') || '[]')
      setCart(saved)
    } catch (error) {
      console.error('Error loading cart:', error)
      setCart([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
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

  const bankDetails = {
    bankName: 'Access Bank',
    accountNumber: '1234567890',
    accountName: 'YARKAITA FASHION',
  }

  async function handleCheckout() {
    setCheckingOut(true)
    try {
      // Don logout ko admin, ko walk-in, muna ƙirƙirar Customer na walk-in
      const customerRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Walk-In',
          lastName: 'Customer',
          acquisitionSource: 'WEBSITE',
        }),
      })
      const customer = await customerRes.json()
      
      if (!customerRes.ok) {
        throw new Error(customer.error || 'Failed to create customer')
      }

      const customerId = customer.id

      // Yanzu mu ƙirƙiri Order da Payment
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          salesChannel: 'WEBSITE',
          items: cart,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Checkout failed')
      }

      const data = await res.json()
      setOrderNumber(data.order.orderNumber)
      localStorage.removeItem('yarkaita_cart')
      setCart([])
      setShowPaymentInfo(true)
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Checkout failed. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  function handleCopyAccountNumber() {
    navigator.clipboard.writeText(bankDetails.accountNumber)
    alert('Account number copied!')
  }

  async function handleUploadReceipt() {
    if (!receipt) {
      alert('Please select a receipt file first.')
      return
    }

    const formData = new FormData()
    formData.append('file', receipt)
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    
    // A nan za mu iya haɗa receipt URL tare da order (a nan dai an ajiye shi a upload folder)
    alert('Receipt uploaded! You can now complete your payment.')
    // Za mu iya sake tura shi zuwa shafin gida
    router.push('/')
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
        {/* Payment Instructions Section */}
        {showPaymentInfo && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-green-800 mb-2">Payment Instructions</h2>
            <p className="text-green-700 mb-4">Order <strong>{orderNumber}</strong> created. Please transfer the total amount to the account below:</p>
            
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <p className="text-gray-700"><strong>Bank:</strong> {bankDetails.bankName}</p>
              <p className="text-gray-700"><strong>Account Number:</strong> {bankDetails.accountNumber}</p>
              <p className="text-gray-700"><strong>Account Name:</strong> {bankDetails.accountName}</p>
              <button
                onClick={handleCopyAccountNumber}
                className="mt-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800"
              >
                Copy Account Number
              </button>
            </div>

            <p className="text-green-700 mb-2">Upload your payment receipt for verification:</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setReceipt(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
            />
            <button
              onClick={handleUploadReceipt}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
            >
              Upload Receipt
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <button onClick={loadCart} className="bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">
            Refresh Cart
          </button>
        </div>

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