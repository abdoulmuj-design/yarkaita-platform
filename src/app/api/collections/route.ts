import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const collections = await prisma.collection.findMany({
    include: {
      products: true,
    },
  })
  return NextResponse.json(collections)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, slug, description } = body

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
  }

  const collection = await prisma.collection.create({
    data: { name, slug, description },
  })
  return NextResponse.json(collection, { status: 201 })
}