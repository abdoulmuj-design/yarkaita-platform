import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Allowed status transitions
const statusTransitions: Record<string, string[]> = {
  PENDING: ['CONFIRMED'],
  CONFIRMED: ['PROCESSING'],
  PROCESSING: ['READY'],
  READY: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      address: true,
      payments: true,
      customer: true,
    },
  })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  return NextResponse.json(order)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status } = body

  if (!status) {
    return NextResponse.json({ error: 'Status is required' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Check if status transition is allowed
  const allowed = statusTransitions[order.status]
  if (!allowed || !allowed.includes(status)) {
    return NextResponse.json({ error: `Invalid status transition from ${order.status} to ${status}` }, { status: 400 })
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: true,
      address: true,
      payments: true,
    },
  })
  return NextResponse.json(updatedOrder)
}