import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const checks = await prisma.qualityCheck.findMany({
    include: {
      productionTask: true,
      checkedBy: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(checks)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { productionTaskId, checkedById, status, notes } = body

  if (!productionTaskId || !status) {
    return NextResponse.json({ error: 'productionTaskId and status are required' }, { status: 400 })
  }

  const check = await prisma.qualityCheck.create({
    data: {
      productionTaskId,
      checkedById,
      status,
      notes,
    },
  })
  return NextResponse.json(check, { status: 201 })
}