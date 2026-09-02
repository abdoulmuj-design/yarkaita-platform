import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const check = await prisma.qualityCheck.findUnique({
    where: { id },
    include: {
      productionTask: true,
      checkedBy: true,
    },
  })
  if (!check) {
    return NextResponse.json({ error: 'Quality check not found' }, { status: 404 })
  }
  return NextResponse.json(check)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, notes } = body

  const check = await prisma.qualityCheck.update({
    where: { id },
    data: { status, notes },
  })
  return NextResponse.json(check)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.qualityCheck.delete({
    where: { id },
  })
  return NextResponse.json({ message: 'Quality check deleted' })
}