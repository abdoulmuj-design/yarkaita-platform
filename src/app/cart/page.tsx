'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [showPendingMessage, setShowPendingMessage] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  // Walk-in Customer Details
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  // ✅ HANYA KARATUN HOTO (Don Rage Girma Kafin Upload)
  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 800
          const MAX_HEIGHT = 800
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not compress image'))
                return
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            },
            'image/jpeg',
            0.7
          )
        }
        img.onerror = reject
      }
      reader.onerror = reject
    })
  }

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
      const customerRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: name || 'Walk-In',
          lastName: 'Customer',
          phone: phone,
          email: email,
          acquisitionSource: 'WEBSITE',
        }),
      })
      const customer = await customerRes.json()
      
      if (!customerRes.ok) throw new Error(customer.error || 'Failed to create customer')

      const customerId = customer.id

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          salesChannel: 'WEBSITE',
          items: cart,
          receiptUrl: null,
          address: address ? { address, city, state } : undefined,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Checkout failed')
      }

      const data = await res.json()
      
      setOrderNumber(data.order.orderNumber)
      setPaymentId(data.payment.id)
      
      localStorage.removeItem('yarkaita_cart')
      setCart([])
      
      setShowBankDetails(true)
      setCheckingOut(false)
      
    } catch (error) {
      console.error(error)
      alert((error as Error).message || 'Checkout failed. Please try again.')
      setCheckingOut(false)
    }
  }

  async function handleReceiptUpload() {
    if (!receiptFile || !paymentId) {
      alert('Please select a receipt file first.')
      return
    }

    setCheckingOut(true)
    try {
      // ✅ COMPRESS IMAGE BEFORE UPLOAD
      const compressedFile = await compressImage(receiptFile)

      const formData = new FormData()
      formData.append('file', compressedFile)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const uploadData = await uploadRes.json()

      if (!uploadData.url) throw new Error('Upload failed')

      await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptUrl: uploadData.url }),
      })

      alert('Receipt uploaded! Payment is now pending admin approval.')
      setShowPendingMessage(true)
      setShowBankDetails(false)
      setReceiptFile(null)
      router.push('/')
    } catch (error) {
      console.error(error)
      alert((error as Error).message || 'Failed to upload receipt. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  function copyAccountNumber() {
    navigator.clipboard.writeText(bankDetails.accountNumber)
    alert('Account number copied!')
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <button onClick={loadCart} className="bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">
            Refresh Cart
          </button>
        </div>

        {showPendingMessage ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-center max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Payment Pending Approval</h2>
            <p className="text-gray-600">Your receipt has been submitted. Please wait for YARKAITA to confirm your payment.</p>
            <Link href="/" className="text-blue-600 hover:underline mt-4 block">Back to Home</Link>
          </div>
        ) : showBankDetails ? (
          <div className="bg-white rounded-xl shadow-md p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
            <p className="text-gray-600 mb-4">Order {orderNumber} created! Please transfer:</p>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600">Bank Name: <strong>{bankDetails.bankName}</strong></p>
              <p className="text-sm text-gray-600 mt-2">Account Number: <strong>{bankDetails.accountNumber}</strong></p>
              <p className="text-sm text-gray-600 mt-2">Account Name: <strong>{bankDetails.accountName}</strong></p>
              <button onClick={copyAccountNumber} className="mt-3 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800">
                Copy Account Number
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Receipt (Reference)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
            />
            <p className="text-xs text-gray-500 mt-1">Upload screenshot after you transfer.</p>

            <button
              onClick={handleReceiptUpload}
              disabled={checkingOut}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition mt-4 disabled:opacity-50"
            >
              {checkingOut ? 'Uploading...' : 'Upload Receipt & Submit'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            {cart.length === 0 ? (
              <p className="text-gray-600">Your cart is empty.</p>
            ) : (
              <>
                {/* Walk-in Customer Form */}
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-semibold mb-2">Your Details (for delivery)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="px-3 py-2 border rounded" />
                    <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="px-3 py-2 border rounded" />
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="px-3 py-2 border rounded" />
                    <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="px-3 py-2 border rounded" />
                    <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="px-3 py-2 border rounded" />
                    <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className="px-3 py-2 border rounded" />
                  </div>
                </div>

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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}