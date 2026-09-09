import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const task = await prisma.productionTask.findUnique({
    where: { id },
    include: {
      productionJob: {
        include: {
          order: {
            include: {
              customer: true,
            },
          },
          product: true,
        },
      },
      assignedUser: true,
      qualityChecks: true,
    },
  })
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }
  return NextResponse.json(task)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, priority, dueDate, startedAt, completedAt, notes, assignedUserId } = body

  const task = await prisma.productionTask.update({
    where: { id },
    data: {
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      startedAt: startedAt ? new Date(startedAt) : null,
      completedAt: completedAt ? new Date(completedAt) : null,
      notes,
      assignedUserId,
    },
  })
  return NextResponse.json(task)
}