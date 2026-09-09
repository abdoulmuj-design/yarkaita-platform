import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const balances = await prisma.inventoryBalance.findMany({
    include: {
      variant: {
        include: {
          product: true,
        },
      },
      location: true,
    },
  })
  return NextResponse.json(balances)
}