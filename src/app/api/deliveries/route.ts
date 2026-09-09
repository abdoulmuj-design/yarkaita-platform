import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const deliveries = await prisma.order.findMany({
    where: {
      status: { in: ['OUT_FOR_DELIVERY', 'DELIVERED'] },
    },
    include: {
      customer: true,
      items: true,
      address: true,
    },
  })
  return NextResponse.json(deliveries)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { orderId, assignedUserId } = body

  if (!orderId || !assignedUserId) {
    return NextResponse.json({ error: 'orderId and assignedUserId are required' }, { status: 400 })
  }

  // Add a note to the order about delivery assignment
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'OUT_FOR_DELIVERY',
    },
  })

  return NextResponse.json(order, { status: 201 })
}