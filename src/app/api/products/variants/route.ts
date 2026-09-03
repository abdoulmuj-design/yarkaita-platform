import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const variants = await prisma.productVariant.findMany({
    include: {
      product: true,
    },
  })
  return NextResponse.json(variants)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { productId, sku, color, size, price, stock, isActive } = body

  if (!productId || !sku || price === undefined) {
    return NextResponse.json({ error: 'productId, sku, and price are required' }, { status: 400 })
  }

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      sku,
      color,
      size,
      price,
      stock: stock || 0,
      isActive: isActive ?? true,
    },
  })
  return NextResponse.json(variant, { status: 201 })
}