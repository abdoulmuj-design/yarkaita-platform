import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { products: true },
  })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, slug, description } = body

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
  }

  const category = await prisma.category.create({
    data: { name, slug, description },
  })
  return NextResponse.json(category, { status: 201 })
}