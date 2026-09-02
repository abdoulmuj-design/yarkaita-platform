import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const notifications = await prisma.notification.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(notifications)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { userId, title, message, type } = body

  if (!title || !message) {
    return NextResponse.json({ error: 'title and message are required' }, { status: 400 })
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type: type || 'INFO',
    },
  })
  return NextResponse.json(notification, { status: 201 })
}