import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const transfer = await prisma.stockTransfer.findUnique({
    where: { id },
    include: {
      items: true,
      fromLocation: true,
      toLocation: true,
    },
  })
  if (!transfer) {
    return NextResponse.json({ error: 'Transfer not found' }, { status: 404 })
  }
  return NextResponse.json(transfer)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, notes, shippedAt, receivedAt, approvedById } = body

  const transfer = await prisma.stockTransfer.update({
    where: { id },
    data: { status, notes, shippedAt, receivedAt, approvedById },
  })
  return NextResponse.json(transfer)
}