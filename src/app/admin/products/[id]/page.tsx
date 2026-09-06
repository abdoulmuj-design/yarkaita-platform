'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function AdminEditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [variants, setVariants] = useState<any[]>([])
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`/api/products/${params.id}`)
      const data = await res.json()
      if (data) {
        setName(data.name || '')
        setDescription(data.description || '')
        setCategoryId(data.categoryId || '')
        if (data.variants) {
          setVariants(data.variants.map((v: any) => ({
            id: v.id || '',
            sku: v.sku || '',
            color: v.color || '',
            size: v.size || '',
            price: v.price || 0,
            stock: v.stock || 0,
            isActive: v.isActive ?? true,
          })))
        }
      }
    }
    fetchProduct()
  }, [params.id])

  // Add a new empty variant
  function handleAddVariant() {
    setVariants([...variants, { id: '', sku: '', color: '', size: '', price: 0, stock: 0, isActive: true }])
  }

  // Remove a variant
  function handleRemoveVariant(index: number) {
    setVariants(variants.filter((_, i) => i !== index))
  }

  // Update a specific variant field
  function handleVariantChange(index: number, field: string, value: any) {
    const updated = [...variants]
    updated[index][field] = value
    setVariants(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('yarkaita_token')

      // 1. Update product details
      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: JSON.stringify({ name, description, categoryId }),
      })
      const data = await res.json()

      // 2. Upload new images
      for (const file of images) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        if (uploadData.url) {
          await fetch(`/api/products/${params.id}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
            body: JSON.stringify({ url: uploadData.url, type: 'image' }),
          })
        }
      }

      // 3. Update existing variants & create new ones
      for (const variant of variants) {
        if (variant.id) {
          // Update existing variant
          await fetch(`/api/products/variants/${variant.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
            body: JSON.stringify({
              sku: variant.sku,
              color: variant.color,
              size: variant.size,
              price: Number(variant.price),
              stock: Number(variant.stock),
              isActive: variant.isActive,
            }),
          })
        } else if (variant.sku) {
          // Create new variant
          await fetch('/api/products/variants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
            body: JSON.stringify({
              productId: params.id,
              sku: variant.sku,
              color: variant.color,
              size: variant.size,
              price: Number(variant.price),
              stock: Number(variant.stock),
              isActive: variant.isActive,
            }),
          })
        }
      }

      alert('Product updated successfully!')
      router.push('/admin/products')
    } catch (err) {
      console.error(err)
      alert('Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name (Editable)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Variants (Editable)</h3>
          {variants.map((variant, index) => (
            <div key={index} className="border p-3 rounded-lg mb-2">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input placeholder="SKU" value={variant.sku} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} className="px-3 py-2 border rounded" />
                <input placeholder="Color" value={variant.color} onChange={(e) => handleVariantChange(index, 'color', e.target.value)} className="px-3 py-2 border rounded" />
                <input placeholder="Size" value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} className="px-3 py-2 border rounded" />
                <input type="number" placeholder="Price" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))} className="px-3 py-2 border rounded" />
                <input type="number" placeholder="Stock" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))} className="px-3 py-2 border rounded" />
                <button type="button" onClick={() => handleRemoveVariant(index)} className="bg-red-500 text-white px-2 rounded">Remove</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={handleAddVariant} className="bg-blue-500 text-white px-4 py-2 rounded">Add Variant</button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (5+)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
          />
          <p className="text-xs text-gray-500 mt-2">Upload 5+ images for this product.</p>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded-lg font-semibold">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}