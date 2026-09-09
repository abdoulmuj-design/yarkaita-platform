import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/deliveries?role=admin | role=staff
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role')

  try {
    if (role === 'admin') {
      // Admin: Show orders that are CONFIRMED/PROCESSING and not yet assigned
      const orders = await prisma.order.findMany({
        where: {
          status: { in: ['READY', 'PROCESSING', 'CONFIRMED'] },
          deliveryAssignedUserId: null,
        },
        include: {
          customer: true,
          items: true,
          address: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(orders)
    } else if (role === 'staff') {
      // Staff: Show orders assigned to them
      const userId = request.headers.get('x-user-id')
      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 })
      }

      const orders = await prisma.order.findMany({
        where: {
          status: { in: ['OUT_FOR_DELIVERY', 'DELIVERED'] },
          deliveryAssignedUserId: userId,
        },
        include: {
          customer: true,
          items: true,
          address: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(orders)
    }

    // Default: Show all
    const orders = await prisma.order.findMany({
      where: { status: { in: ['OUT_FOR_DELIVERY', 'DELIVERED'] } },
      include: { customer: true, items: true, address: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 })
  }
}

// POST /api/deliveries - Assign delivery to staff
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, assignedUserId } = body

    if (!orderId || !assignedUserId) {
      return NextResponse.json({ error: 'orderId and assignedUserId are required' }, { status: 400 })
    }

    // Duba idan user din na nan kafin mu sanya
    const userExists = await prisma.user.findUnique({
      where: { id: assignedUserId },
      select: { id: true },
    })

    if (!userExists) {
      return NextResponse.json({ error: 'Assigned staff user not found' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryAssignedUserId: assignedUserId,
        status: 'OUT_FOR_DELIVERY',
      },
    })
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to assign delivery' }, { status: 500 })
  }
}

// PUT /api/deliveries - Update order status (Mark as Delivered)
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })
    return NextResponse.json(order)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}