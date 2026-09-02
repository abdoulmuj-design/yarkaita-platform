import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const category = await prisma.category.findUnique({
    where: { id },
    include: { products: true },
  })
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }
  return NextResponse.json(category)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { name, slug, description } = body
  const category = await prisma.category.update({
    where: { id },
    data: { name, slug, description },
  })
  return NextResponse.json(category)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.category.delete({
    where: { id },
  })
  return NextResponse.json({ message: 'Category deleted' })
}