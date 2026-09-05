'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CustomRequestPage() {
  const router = useRouter()
  const [type, setType] = useState('BESPOKE')
  const [description, setDescription] = useState('')
  const [measurements, setMeasurements] = useState('')
  const [colors, setColors] = useState('')
  const [isNearCompany, setIsNearCompany] = useState(false)
  const [materialDescription, setMaterialDescription] = useState('')
  const [images, setImages] = useState<File[]>([]) // Changed to File[]
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Upload images first
      const imageUrls: string[] = []
      for (const file of images) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const uploadData = await uploadRes.json()
        imageUrls.push(uploadData.url)
      }

      // 2. Get or create customer
      const token = localStorage.getItem('yarkaita_token')
      const user = JSON.parse(localStorage.getItem('yarkaita_user') || '{}')
      let customerId = user.id
      if (!customerId) {
        const customerRes = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
          body: JSON.stringify({ firstName: 'Walk-In', lastName: 'Customer', acquisitionSource: 'WEBSITE' }),
        })
        const customer = await customerRes.json()
        customerId = customer.id
      }

      // 3. Submit custom request
      const res = await fetch('/api/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: JSON.stringify({
          type,
          customerId,
          description,
          measurements,
          colors,
          isNearCompany,
          materialDescription,
          images: imageUrls,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit request')

      alert('Request submitted successfully! We will contact you shortly.')
      router.push('/')
    } catch (err) {
      console.error(err)
      alert('Failed to submit request. Please try again.')
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
            <Link href="/cart" className="hover:text-gray-300 transition">Cart</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Request a Custom Wear</h1>
        <p className="text-gray-600 mb-8">Fill the form below to request a Bespoke or Bridal wear.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Wear Type</label>
            {/* An gyara nan: sanya text-gray-900 da bg-white */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white"
            >
              <option value="BESPOKE">Bespoke</option>
              <option value="BRIDAL">Bridal</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Describe the Design</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              rows={4}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Describe Your Measurements</label>
            <textarea
              value={measurements}
              onChange={(e) => setMeasurements(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              rows={3}
              placeholder="e.g., Bust: 40, Waist: 32, Hips: 45..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Type</label>
            <input
              type="text"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g., Black, Red, White..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Are you near YARKAITA (Katsina/Abuja)?</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsNearCompany(true)}
                className={`px-4 py-2 rounded-lg ${isNearCompany ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setIsNearCompany(false)}
                className={`px-4 py-2 rounded-lg ${!isNearCompany ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                No
              </button>
            </div>
          </div>

          {!isNearCompany && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Describe Material & Colors (if not near)</label>
              <textarea
                value={materialDescription}
                onChange={(e) => setMaterialDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                rows={3}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Reference Images (5+)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files || []))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
            />
            <p className="text-xs text-gray-500 mt-2">You can upload 5+ images. Recommended ratio: 3:4 (Instagram style).</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}