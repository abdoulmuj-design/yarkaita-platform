'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function POSPage() {
  const { language } = useLanguage()
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const translations = {
    en: {
      title: 'Point of Sale',
      search: 'Search products...',
      addToCart: 'Add to Cart',
      cart: 'Cart',
      emptyCart: 'Cart is empty. Select a product to add.',
      total: 'Total',
      checkout: 'Checkout',
      completeOrder: 'Complete Order',
    },
    ha: {
      title: 'Wurin Sayarwa',
      search: 'Nemo samfura...',
      addToCart: 'Ƙara zuwa Cart',
      cart: 'Cart',
      emptyCart: 'Cart babu komai. Zaɓi samfuri don ƙara.',
      total: 'Jimlar',
      checkout: 'Kammala',
      completeOrder: 'Kammala Oda',
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
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  function handleAddToCart(product: any, variant: any) {
    const existing = cart.find((item) => item.variantId === variant.id)
    if (existing) {
      setCart(cart.map((item) =>
        item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item
      ))
    } else {
      setCart([...cart, {
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        unitPrice: variant.price,
        quantity: 1,
      }])
    }
  }

  function handleRemoveFromCart(variantId: string) {
    setCart(cart.filter((item) => item.variantId !== variantId))
  }

  function handleQuantityChange(variantId: string, change: number) {
    setCart(cart.map((item) =>
      item.variantId === variantId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
    ))
  }

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  async function handleCheckout() {
    if (cart.length === 0) return

    try {
      const token = localStorage.getItem('yarkaita_token')
      const user = JSON.parse(localStorage.getItem('yarkaita_user') || '{}')
      
      const customerRes = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: 'Walk-In',
          lastName: 'Customer',
          acquisitionSource: 'WALK_IN',
        }),
      })
      const customer = await customerRes.json()

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: customer.id,
          salesChannel: 'ABUJA_POS',
          items: cart.map((item) => ({
            productName: item.productName,
            sku: item.sku,
            size: item.size,
            color: item.color,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        }),
      })
      const order = await orderRes.json()

      await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: total,
          reference: `POS-${Date.now()}`,
          status: 'SUCCESSFUL',
        }),
      })

      setCart([])
      alert(`Order ${order.orderNumber} completed successfully! Total: ₦${total.toLocaleString()}`)
    } catch (err) {
      console.error('Checkout failed', err)
      alert('Checkout failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-black text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/yarkaita-logo.png" alt="YARKAITA Logo" className="h-10 w-auto" />
          </div>
          <h1 className="text-xl font-bold">{t.title}</h1>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            {loading ? (
              <p className="text-gray-600">Loading products...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                    {/* An gyara nan: sanya text-gray-900 don ya zama dark */}
                    <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category?.name}</p>
                    <div className="mt-3 space-y-2">
                      {product.variants?.map((variant: any) => (
                        <button
                          key={variant.id}
                          onClick={() => handleAddToCart(product, variant)}
                          className="w-full bg-black text-white py-1 px-2 rounded text-sm hover:bg-gray-800 transition"
                        >
                          {variant.color} / {variant.size} - ₦{variant.price.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.cart}</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500">{t.emptyCart}</p>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.variantId} className="border-b pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            {item.color} / {item.size} - ₦{item.unitPrice.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.variantId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleQuantityChange(item.variantId, -1)}
                          className="bg-gray-200 px-2 py-1 rounded"
                        >
                          -
                        </button>
                        <span className="text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.variantId, 1)}
                          className="bg-gray-200 px-2 py-1 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="text-lg font-bold text-gray-900">
                    {t.total}: ₦{total.toLocaleString()}
                  </p>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition mt-4"
                  >
                    {t.completeOrder}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}