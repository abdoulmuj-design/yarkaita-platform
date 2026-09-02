import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const quotes = await prisma.quote.findMany({
    include: {
      items: true,
      bespokeRequest: true,
      bridalRequest: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(quotes)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { bespokeRequestId, bridalRequestId, status, notes, items } = body

  if (!bespokeRequestId && !bridalRequestId) {
    return NextResponse.json({ error: 'bespokeRequestId or bridalRequestId is required' }, { status: 400 })
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'items are required' }, { status: 400 })
  }

  const quoteNumber = `QTE-${Date.now()}`

  let totalAmount = 0
  for (const item of items) {
    totalAmount += item.unitPrice * item.quantity
  }

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      bespokeRequestId,
      bridalRequestId,
      status: status || 'DRAFT',
      totalAmount,
      notes,
      items: {
        create: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
        })),
      },
    },
    include: {
      items: true,
      bespokeRequest: true,
      bridalRequest: true,
    },
  })
  return NextResponse.json(quote, { status: 201 })
}