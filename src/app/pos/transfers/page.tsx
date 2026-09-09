'use client'

import { useEffect, useState } from 'react'

export default function PosTransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const t = {
    title: 'Stock Transfers to Abuja',
    noTransfers: 'No transfers waiting for confirmation.',
    confirmBtn: 'Accept & Add to Stock',
    details: 'Details',
  }

  useEffect(() => {
    fetchTransfers()
  }, [])

  async function fetchTransfers() {
    try {
      const token = localStorage.getItem('yarkaita_token')
      const res = await fetch('/api/stock-transfers', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      setTransfers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleReceive(transferId: string) {
    if (!confirm('Are you sure you want to accept this transfer and add to stock?')) return

    try {
      const token = localStorage.getItem('yarkaita_token')
      const res = await fetch(`/api/stock-transfers/${transferId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'RECEIVED' }),
      })

      if (!res.ok) throw new Error('Failed to receive transfer')

      alert('Transfer received! Stock added to Abuja POS.')
      fetchTransfers()
    } catch (err) {
      console.error(err)
      alert('Failed to receive transfer')
    }
  }

  if (loading) return <p className="text-gray-600">Loading...</p>

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{t.title}</h2>

      {transfers.length === 0 ? (
        <p className="text-gray-600">{t.noTransfers}</p>
      ) : (
        <div className="space-y-4">
          {transfers.map((tr) => (
            <div key={tr.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">TRF: {tr.transferNumber} <span className="text-sm text-yellow-600">({tr.status})</span></p>
                  <p className="text-sm text-gray-500">{tr.fromLocation?.name} → {tr.toLocation?.name}</p>
                  <p className="text-sm text-gray-600 mt-2"><strong>{t.details}:</strong> {tr.items?.map((i: any) => `${i.variant?.product?.name || 'Item'} (${i.variant?.color}/${i.variant?.size}) Qty: ${i.quantity}`).join(', ')}</p>
                </div>
                <button
                  onClick={() => handleReceive(tr.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  {t.confirmBtn}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}