import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const movements = await prisma.inventoryMovement.findMany({
    include: {
      variant: true,
      location: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(movements)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { variantId, locationId, type, quantity, referenceId, notes, createdById } = body

  if (!variantId || !locationId || !type || quantity === undefined) {
    return NextResponse.json({ error: 'variantId, locationId, type, and quantity are required' }, { status: 400 })
  }

  const movement = await prisma.inventoryMovement.create({
    data: { variantId, locationId, type, quantity, referenceId, notes, createdById },
  })
  return NextResponse.json(movement, { status: 201 })
}