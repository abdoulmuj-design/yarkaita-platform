'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function POSPage() {
  const { language } = useLanguage()
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalCustomers: 0 })
  const [inventory, setInventory] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [abujaLocationId, setAbujaLocationId] = useState('')
  const [cart, setCart] = useState<any[]>([])
  const [checkingOut, setCheckingOut] = useState(false)
  const [loading, setLoading] = useState(true)

  const t = language === 'en' ? {
    title: 'POS Dashboard',
    totalSales: 'Total Sales',
    totalOrders: 'Total Orders',
    totalCustomers: 'Total Customers',
    stockInventory: 'Stock Inventory (Abuja)',
    noStock: 'No stock available for this location.',
    available: 'Available',
    sell: 'Sell',
    cart: 'Cart',
    total: 'Total',
    checkout: 'Checkout',
    checkoutSuccess: 'Order completed! Stock deducted.',
    emptyCart: 'Cart is empty. Select an item to sell.',
  } : {
    title: 'Wurin Sayarwa',
    totalSales: 'Jimlar Siyarwa',
    totalOrders: 'Jimlar Oda',
    totalCustomers: 'Jimlar Abokan Ciniki',
    stockInventory: 'Kayan da ke Abuja',
    noStock: 'Babu kaya a wannan wuri.',
    available: 'Akwai',
    sell: 'Sayar',
    cart: 'Cart',
    total: 'Jimlar',
    checkout: 'Kammala',
    checkoutSuccess: 'An kammala oda! An cire kaya daga stock.',
    emptyCart: 'Cart babu komai. Zaɓi kayan da za ka sayar.',
  }

  useEffect(() => {
    async function fetchAllData() {
      try {
        const token = localStorage.getItem('yarkaita_token')
        const headers = { 'Authorization': `Bearer ${token}` }

        const [paymentsRes, ordersRes, customersRes, invRes, locRes] = await Promise.all([
          fetch('/api/payments', { headers }),
          fetch('/api/orders', { headers }),
          fetch('/api/customers', { headers }),
          fetch('/api/inventory/balances', { headers }),
          fetch('/api/locations', { headers }),
        ])

        const payments = await paymentsRes.json()
        const orders = await ordersRes.json()
        const customers = await customersRes.json()
        const inventory = await invRes.json()
        const locations = await locRes.json()

        // Total Sales (Number)
        const totalSales = payments
          .filter((p: any) => p.status === 'SUCCESSFUL')
          .reduce((sum: number, p: any) => sum + Number(p.amount), 0)

        setStats({
          totalSales: totalSales,
          totalOrders: Array.isArray(orders) ? orders.length : 0,
          totalCustomers: Array.isArray(customers) ? customers.length : 0,
        })

        const abuja = locations.find((l: any) => l.code === 'ABJ')
        if (abuja) {
          setAbujaLocationId(abuja.id)
          const abujaInv = inventory.filter((item: any) => item.locationId === abuja.id)
          setInventory(abujaInv)
        }
        setLocations(locations)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAllData()
  }, [])

  function handleAddToCart(item: any) {
    const variant = item.variant
    if (!variant) return

    const existing = cart.find((cartItem) => cartItem.variantId === variant.id)
    if (existing) {
      setCart(cart.map((cartItem) =>
        cartItem.variantId === variant.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
      ))
    } else {
      setCart([...cart, {
        variantId: variant.id,
        productName: variant.product?.name || 'Product',
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

  const totalCart = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  async function handleCheckout() {
    if (cart.length === 0) {
      alert('Please add items to cart first.')
      return
    }
    if (!abujaLocationId) {
      alert('Abuja location not found.')
      return
    }

    setCheckingOut(true)
    try {
      const token = localStorage.getItem('yarkaita_token')

      // Create walk-in customer (simplified)
      const customerRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: JSON.stringify({ firstName: 'Walk-In', lastName: 'Customer', acquisitionSource: 'WALK_IN' }),
      })
      const customer = await customerRes.json()
      const customerId = customer.id

      // Create order & deduct stock
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: JSON.stringify({
          customerId,
          salesChannel: 'ABUJA_POS',
          locationId: abujaLocationId, // Wannan shine yadda zai san yanki
          items: cart,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Checkout failed')
      }

      alert(`${t.checkoutSuccess} Total: ₦${totalCart.toLocaleString()}`)
      setCart([])
      // Reload inventory
      const updatedInv = await fetch('/api/inventory/balances', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await updatedInv.json()
      setInventory(data.filter((item: any) => item.locationId === abujaLocationId))
    } catch (err) {
      console.error(err)
      alert(err.message || 'Checkout failed.')
    } finally {
      setCheckingOut(false)
    }
  }

  if (loading) return <p className="text-center text-gray-600">Loading...</p>

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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-semibold">{t.totalSales}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">₦{Number(stats.totalSales).toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-semibold">{t.totalOrders}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm font-semibold">{t.totalCustomers}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalCustomers}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inventory */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">{t.stockInventory}</h2>
            {inventory.length === 0 ? (
              <p className="text-gray-600">{t.noStock}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color/Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.available}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.variant?.product?.name || 'Product'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.variant?.color || 'N/A'} / {item.variant?.size || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.quantity <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={item.quantity === 0}
                            className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
                          >
                            {t.sell}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">{t.cart}</h2>
            {cart.length === 0 ? (
              <p className="text-gray-600">{t.emptyCart}</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.variantId} className="border-b pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-sm text-gray-500">
                          {item.color} / {item.size} - ₦{item.unitPrice.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <button onClick={() => handleRemoveFromCart(item.variantId)} className="text-red-500 hover:text-red-700">✕</button>
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <p className="text-xl font-bold">{t.total}: ₦{totalCart.toLocaleString()}</p>
                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition mt-4 disabled:opacity-50"
                  >
                    {checkingOut ? 'Processing...' : t.checkout}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}