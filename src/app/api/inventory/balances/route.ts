import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const balances = await prisma.inventoryBalance.findMany({
    include: {
      variant: true,
      location: true,
    },
  })
  return NextResponse.json(balances)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { variantId, locationId, quantity } = body

  if (!variantId || !locationId || quantity === undefined) {
    return NextResponse.json({ error: 'variantId, locationId, and quantity are required' }, { status: 400 })
  }

  const balance = await prisma.inventoryBalance.create({
    data: { variantId, locationId, quantity },
  })
  return NextResponse.json(balance, { status: 201 })
}