'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<any>(null)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        if (!res.ok) throw new Error('Failed to fetch product')
        const data = await res.json()
        setProduct(data)
        if (data.variants?.length > 0) {
          setSelectedVariant(data.variants[0])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.id])

  function handleAddToCart() {
    if (!selectedVariant) return
    const cart = JSON.parse(localStorage.getItem('yarkaita_cart') || '[]')
    const existing = cart.find((item: any) => item.variantId === selectedVariant.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push({
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.name,
        sku: selectedVariant.sku,
        color: selectedVariant.color,
        size: selectedVariant.size,
        unitPrice: selectedVariant.price,
        quantity: quantity,
      })
    }
    localStorage.setItem('yarkaita_cart', JSON.stringify(cart))
    alert('Added to cart!')
  }

  if (loading) return <p className="text-center text-gray-600">Loading...</p>
  if (!product) return <p className="text-center text-red-600">Product not found</p>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 rounded-xl flex items-center justify-center h-96">
            {product.media?.[0] ? (
              <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover rounded-xl" />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-2">{product.description}</p>
            <p className="text-gray-500 mt-2">{product.category?.name}</p>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900">Select Variant:</h3>
              <div className="mt-2 space-y-2">
                {product.variants?.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-full py-2 px-4 rounded-lg border-2 transition ${
                      selectedVariant?.id === variant.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {variant.color} / {variant.size} - ₦{variant.price.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {selectedVariant && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900">Quantity:</h3>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-200 px-3 py-1 rounded-lg"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-gray-200 px-3 py-1 rounded-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition mt-8"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}