import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const jobs = await prisma.productionJob.findMany({
    include: {
      order: true,
      product: true,
      tasks: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(jobs)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { orderId, productId, priority, dueDate, notes } = body

  if (!orderId && !productId) {
    return NextResponse.json({ error: 'orderId or productId is required' }, { status: 400 })
  }

  const jobNumber = `JOB-${Date.now()}`

  const job = await prisma.productionJob.create({
    data: {
      jobNumber,
      orderId,
      productId,
      priority: priority || 'NORMAL',
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
    },
  })
  return NextResponse.json(job, { status: 201 })
}