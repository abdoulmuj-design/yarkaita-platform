import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Create a new stock transfer (waybill)
export async function POST(request: Request) {
  const body = await request.json()
  const { fromLocationId, toLocationId, items, notes } = body

  if (!fromLocationId || !toLocationId || !items || items.length === 0) {
    return NextResponse.json({ error: 'fromLocationId, toLocationId, and items are required' }, { status: 400 })
  }

  const transferNumber = `TRF-${Date.now()}`

  const transfer = await prisma.stockTransfer.create({
    data: {
      transferNumber,
      fromLocationId,
      toLocationId,
      status: 'REQUESTED',
      notes,
      items: {
        create: items.map((item: any) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  })

  return NextResponse.json(transfer, { status: 201 })
}

// Get all stock transfers
export async function GET() {
  const transfers = await prisma.stockTransfer.findMany({
    include: {
      fromLocation: true,
      toLocation: true,
      items: {
        include: {
          variant: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(transfers)
}