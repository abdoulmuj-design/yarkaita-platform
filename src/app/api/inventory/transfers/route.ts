import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const transfers = await prisma.stockTransfer.findMany({
    include: {
      fromLocation: true,
      toLocation: true,
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(transfers)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { fromLocationId, toLocationId, notes, items } = body

  if (!fromLocationId || !toLocationId || !items || items.length === 0) {
    return NextResponse.json({ error: 'fromLocationId, toLocationId, and items are required' }, { status: 400 })
  }

  // Generate transfer number
  const transferNumber = `TRF-${Date.now()}`

  const transfer = await prisma.stockTransfer.create({
    data: {
      transferNumber,
      fromLocationId,
      toLocationId,
      notes,
      items: {
        create: items.map((item: any) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: true,
    },
  })
  return NextResponse.json(transfer, { status: 201 })
}