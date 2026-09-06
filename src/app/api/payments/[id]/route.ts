import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { receiptUrl } = body

  const payment = await prisma.payment.update({
    where: { id },
    data: { receiptUrl },
  })
  return NextResponse.json(payment)
}