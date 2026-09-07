import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { receiptUrl, status } = body // status zai zama 'APPROVED' ko 'SUCCESSFUL'

  const payment = await prisma.payment.update({
    where: { id },
    data: { receiptUrl, status },
  })

  // Idan admin ya approve (SUCCESSFUL), mu canza Order status zuwa CONFIRMED
  if (status === 'SUCCESSFUL') {
    const fullPayment = await prisma.payment.findUnique({ where: { id } })
    if (fullPayment) {
      await prisma.order.update({
        where: { id: fullPayment.orderId },
        data: { status: 'CONFIRMED' },
      })
    }
  }

  return NextResponse.json(payment)
}