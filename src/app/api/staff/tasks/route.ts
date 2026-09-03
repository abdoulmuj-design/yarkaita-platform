import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  // Get user ID from token (in a real app, you'd verify JWT here)
  // For now, we'll get it from the query params or headers
  const userId = request.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  const tasks = await prisma.productionTask.findMany({
    where: { assignedUserId: userId },
    include: {
      productionJob: {
        include: {
          product: true,
          order: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(tasks)
}