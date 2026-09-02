import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(logs)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { userId, action, entityType, entityId, oldValue, newValue, ipAddress, userAgent } = body

  if (!action || !entityType) {
    return NextResponse.json({ error: 'action and entityType are required' }, { status: 400 })
  }

  const log = await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
    },
  })
  return NextResponse.json(log, { status: 201 })
}