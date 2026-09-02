import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tasks = await prisma.productionTask.findMany({
    include: {
      productionJob: true,
      assignedUser: true,
      qualityChecks: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { productionJobId, assignedUserId, department, taskType, priority, dueDate, notes } = body

  if (!productionJobId || !department || !taskType) {
    return NextResponse.json({ error: 'productionJobId, department, and taskType are required' }, { status: 400 })
  }

  const task = await prisma.productionTask.create({
    data: {
      productionJobId,
      assignedUserId,
      department,
      taskType,
      priority: priority || 'NORMAL',
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
    },
  })
  return NextResponse.json(task, { status: 201 })
}