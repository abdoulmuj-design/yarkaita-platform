import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.json()
  const { customerId, items, salesChannel, address, receiptUrl, locationId } = body

  if (!customerId || !items || items.length === 0) {
    return NextResponse.json({ error: 'customerId and items are required' }, { status: 400 })
  }

  // Generate order number
  const orderNumber = `ORD-${Date.now()}`

  // Calculate total
  let totalAmount = 0
  for (const item of items) {
    totalAmount += item.unitPrice * item.quantity
  }

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId,
      salesChannel: salesChannel || 'WEBSITE',
      totalAmount,
      items: {
        create: items.map((item: any) => ({
          productName: item.productName,
          sku: item.sku,
          size: item.size,
          color: item.color,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          totalPrice: item.unitPrice * item.quantity,
        })),
      },
      ...(address && {
        address: {
          create: {
            address: address.address,
            city: address.city,
            state: address.state,
            country: address.country,
          },
        },
      }),
    },
  })

  // Create payment
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: totalAmount,
      reference: `PAY-${Date.now()}`,
      status: 'SUCCESSFUL',
      receiptUrl: receiptUrl || null,
    },
  })

  // Update order status
  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'CONFIRMED' },
  })

  // **AN KARA WANNAN SASHEN: DEDUCT STOCK**
  if (locationId) {
    for (const item of items) {
      // Duba idan stock ya isa
      const existingBalance = await prisma.inventoryBalance.findUnique({
        where: {
          variantId_locationId: {
            variantId: item.variantId,
            locationId: locationId,
          },
        },
      })

      if (!existingBalance || existingBalance.quantity < item.quantity) {
        // Idan stock bai isa ba, mu mayar da order din
        return NextResponse.json({ error: `Insufficient stock for variant: ${item.sku}` }, { status: 400 })
      }

      // Rage stock
      await prisma.inventoryBalance.update({
        where: { id: existingBalance.id },
        data: { quantity: { decrement: item.quantity } },
      })

      // Yi recording na movement
      await prisma.inventoryMovement.create({
        data: {
          variantId: item.variantId,
          locationId: locationId,
          type: 'SALE',
          quantity: item.quantity,
          referenceId: order.id,
        },
      })
    }
  }

  return NextResponse.json({ order, payment }, { status: 201 })
}