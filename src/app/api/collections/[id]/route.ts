import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      products: true,
    },
  })
  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
  }
  return NextResponse.json(collection)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { name, slug, description, isActive } = body
  const collection = await prisma.collection.update({
    where: { id },
    data: { name, slug, description, isActive },
  })
  return NextResponse.json(collection)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.collection.delete({
    where: { id },
  })
  return NextResponse.json({ message: 'Collection deleted' })
}