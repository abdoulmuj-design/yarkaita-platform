'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function AdminTransfersPage() {
  const { language } = useLanguage()
  const [locations, setLocations] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [transfers, setTransfers] = useState<any[]>([])

  const [fromLocationId, setFromLocationId] = useState('')
  const [toLocationId, setToLocationId] = useState('')
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const t = language === 'en' ? {
    title: 'Stock Transfers (Waybill)',
    create: 'Create New Transfer',
    from: 'From Location',
    to: 'To Location',
    selectVariant: 'Select Variant',
    qty: 'Quantity',
    addItem: 'Add Item',
    items: 'Items',
    submit: 'Submit Transfer',
    transfers: 'Recent Transfers',
    noTransfers: 'No transfers yet.',
  } : {
    title: 'Canja Kaya (Waybill)',
    create: 'Ƙirƙiri Sabon Canja Kaya',
    from: 'Daga Wuri',
    to: 'Zuwa Wuri',
    selectVariant: 'Zaɓi Variant',
    qty: 'Adadin',
    addItem: 'Ƙara Item',
    items: 'Items',
    submit: 'Aika Canja Kaya',
    transfers: 'Canja Kaya na Kwanan Nan',
    noTransfers: 'Babu canja kaya tukuna.',
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('yarkaita_token')
        const headers = { 'Authorization': `Bearer ${token}` }

        const [locRes, prodRes, transRes] = await Promise.all([
          fetch('/api/locations', { headers }),
          fetch('/api/products', { headers }),
          fetch('/api/stock-transfers', { headers }),
        ])

        const locData = await locRes.json()
        const prodData = await prodRes.json()
        const transData = await transRes.json()

        setLocations(locData)
        setProducts(prodData)
        setTransfers(Array.isArray(transData) ? transData : [])

        // Set default locations
        const katsina = locData.find((l: any) => l.code === 'KAT')
        const abuja = locData.find((l: any) => l.code === 'ABJ')
        if (katsina) setFromLocationId(katsina.id)
        if (abuja) setToLocationId(abuja.id)
      } catch (err) {
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const allVariants = products.flatMap((p: any) =>
    (p.variants || []).map((v: any) => ({ ...v, productName: p.name }))
  )

  function handleAddItem() {
    if (!selectedVariantId || !quantity) return
    const variant = allVariants.find((v: any) => v.id === selectedVariantId)
    if (!variant) return

    setItems([...items, { variantId: variant.id, sku: variant.sku, name: `${variant.productName} (${variant.color}/${variant.size})`, quantity }])
    setSelectedVariantId('')
    setQuantity(1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) {
      alert('Please add items to the transfer.')
      return
    }

    try {
      const token = localStorage.getItem('yarkaita_token')
      const res = await fetch('/api/stock-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fromLocationId,
          toLocationId,
          items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      })

      if (!res.ok) throw new Error('Failed to create transfer')

      alert('Transfer created successfully!')
      setItems([])
      // Refetch transfers
      const updatedTransfers = await fetch('/api/stock-transfers', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await updatedTransfers.json()
      setTransfers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      alert('Failed to create transfer')
    }
  }

  if (loading) return <p className="text-gray-600">Loading...</p>

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{t.title}</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">{t.create}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.from}</label>
            <select value={fromLocationId} onChange={(e) => setFromLocationId(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.to}</label>
            <select value={toLocationId} onChange={(e) => setToLocationId(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <select
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg"
          >
            <option value="">{t.selectVariant}</option>
          {allVariants.map((v: any) => <option key={v.id} value={v.id}>{v.name} ({v.color || 'N/A'} / {v.size || 'N/A'}) - ₦{v.price.toLocaleString()}</option>)}
          </select>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-24 px-3 py-2 border rounded-lg"
          />
          <button type="button" onClick={handleAddItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg">{t.addItem}</button>
        </div>

        {items.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">{t.items}</h4>
            <ul className="list-disc pl-5">
              {items.map((item, idx) => (
                <li key={idx}>{item.name} - Qty: {item.quantity}</li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" className="w-full bg-black text-white py-2 rounded-lg font-semibold">{t.submit}</button>
      </form>

      <div>
        <h3 className="text-xl font-bold mb-4">{t.transfers}</h3>
        {transfers.length === 0 ? (
          <p className="text-gray-600">{t.noTransfers}</p>
        ) : (
          <div className="space-y-4">
            {transfers.map((tr) => (
              <div key={tr.id} className="bg-white p-4 rounded-lg shadow">
                <p className="font-bold">TRF: {tr.transferNumber} <span className={`text-sm ${tr.status === 'RECEIVED' ? 'text-green-600' : tr.status === 'REQUESTED' ? 'text-yellow-600' : 'text-blue-600'}`}>({tr.status})</span></p>
                <p className="text-sm text-gray-500">{tr.fromLocation?.name} → {tr.toLocation?.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}