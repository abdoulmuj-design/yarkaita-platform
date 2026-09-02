import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const payments = await prisma.payment.findMany({
    include: {
      order: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(payments)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { orderId, amount, reference, status } = body

  if (!orderId || !amount || !reference) {
    return NextResponse.json({ error: 'orderId, amount, and reference are required' }, { status: 400 })
  }

  // Create payment
  const payment = await prisma.payment.create({
    data: {
      orderId,
      amount,
      reference,
      status: status || 'SUCCESSFUL',
    },
  })

  // If payment is successful, update order status to CONFIRMED
  if (payment.status === 'SUCCESSFUL') {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    })
  }

  return NextResponse.json(payment, { status: 201 })
}
