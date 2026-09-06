import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { sku, color, size, price, stock, isActive } = body

  const variant = await prisma.productVariant.update({
    where: { id },
    data: { sku, color, size, price, stock, isActive },
  })
  return NextResponse.json(variant)
}