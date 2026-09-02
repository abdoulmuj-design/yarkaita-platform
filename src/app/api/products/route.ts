import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      variants: true,
      media: true,
      category: true,
    },
  })
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, slug, description, categoryId } = body

  if (!name || !slug || !categoryId) {
    return NextResponse.json({ error: 'Name, slug, and categoryId are required' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      categoryId,
    },
  })
  return NextResponse.json(product, { status: 201 })
}