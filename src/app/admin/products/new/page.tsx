'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProductPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [variants, setVariants] = useState([{ sku: '', color: '', size: '', price: 0, stock: 0 }])
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('yarkaita_token')
      
      // 1. Create Product
      const productRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, slug, description, categoryId }),
      })
      const product = await productRes.json()

      // 2. Upload images (5+)
      for (const file of images) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        if (uploadData.url) {
          await fetch(`/api/products/${product.id}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ url: uploadData.url, type: 'image' }),
          })
        }
      }

      // 3. Create variants (if any)
      for (const variant of variants) {
        if (variant.sku) {
          await fetch('/api/products/variants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ productId: product.id, ...variant }),
          })
        }
      }

      alert('Product added successfully!')
      router.push('/admin/products')
    } catch (err) {
      console.error(err)
      alert('Failed to add product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
          <input type="text" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Variants</h3>
          {variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 mb-2">
              <input placeholder="SKU" value={variant.sku} onChange={(e) => { const v = [...variants]; v[index].sku = e.target.value; setVariants(v); }} className="px-3 py-2 border rounded" />
              <input placeholder="Color" value={variant.color} onChange={(e) => { const v = [...variants]; v[index].color = e.target.value; setVariants(v); }} className="px-3 py-2 border rounded" />
              <input placeholder="Size" value={variant.size} onChange={(e) => { const v = [...variants]; v[index].size = e.target.value; setVariants(v); }} className="px-3 py-2 border rounded" />
              <input type="number" placeholder="Price" value={variant.price} onChange={(e) => { const v = [...variants]; v[index].price = Number(e.target.value); setVariants(v); }} className="px-3 py-2 border rounded" />
              <input type="number" placeholder="Stock" value={variant.stock} onChange={(e) => { const v = [...variants]; v[index].stock = Number(e.target.value); setVariants(v); }} className="px-3 py-2 border rounded" />
              <button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== index))} className="bg-red-500 text-white px-2 rounded">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => setVariants([...variants, { sku: '', color: '', size: '', price: 0, stock: 0 }])} className="bg-blue-500 text-white px-4 py-2 rounded">Add Variant</button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (5+)</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} className="w-full px-3 py-2 border rounded" />
          <p className="text-xs text-gray-500 mt-1">Upload 5+ images for this product.</p>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded-lg font-semibold">
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  )
}