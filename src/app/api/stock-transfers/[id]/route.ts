import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Confirm and receive stock transfer
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, receivedAt } = body

  const transfer = await prisma.stockTransfer.update({
    where: { id },
    data: {
      status,
      receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
    },
  })

  if (status === 'RECEIVED') {
    // Get transfer items
    const items = await prisma.stockTransferItem.findMany({
      where: { transferId: id },
    })

    // Add stock to destination location
    for (const item of items) {
      await prisma.inventoryBalance.upsert({
        where: {
          variantId_locationId: {
            variantId: item.variantId,
            locationId: transfer.toLocationId,
          },
        },
        update: {
          quantity: { increment: item.quantity },
        },
        create: {
          variantId: item.variantId,
          locationId: transfer.toLocationId,
          quantity: item.quantity,
        },
      })
    }
  }

  return NextResponse.json(transfer)
}