import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const job = await prisma.productionJob.findUnique({
    where: { id },
    include: {
      order: true,
      product: true,
      tasks: {
        include: {
          qualityChecks: true,
          assignedUser: true,
        },
      },
    },
  })
  if (!job) {
    return NextResponse.json({ error: 'Production job not found' }, { status: 404 })
  }
  return NextResponse.json(job)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, priority, dueDate, notes } = body

  const job = await prisma.productionJob.update({
    where: { id },
    data: {
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
    },
  })
  return NextResponse.json(job)
}