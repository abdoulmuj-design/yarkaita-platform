import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      customer: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { customerId, salesChannel, items, address } = body

  if (!customerId || !salesChannel || !items || items.length === 0) {
    return NextResponse.json({ error: 'customerId, salesChannel, and items are required' }, { status: 400 })
  }

  // Generate order number
  const orderNumber = `ORD-${Date.now()}`

  // Calculate total amount
  let totalAmount = 0
  for (const item of items) {
    totalAmount += item.unitPrice * item.quantity
  }

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId,
      salesChannel,
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
    include: {
      items: true,
      address: true,
      payments: true,
    },
  })
  return NextResponse.json(order, { status: 201 })
}