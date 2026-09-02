import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const bridalRequest = await prisma.bridalRequest.findUnique({
    where: { id },
    include: {
      customer: true,
      media: true,
      quotes: true,
    },
  })
  if (!bridalRequest) {
    return NextResponse.json({ error: 'Bridal request not found' }, { status: 404 })
  }
  return NextResponse.json(bridalRequest)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, description } = body

  const bridalRequest = await prisma.bridalRequest.update({
    where: { id },
    data: { status, description },
  })
  return NextResponse.json(bridalRequest)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.bridalRequest.delete({
    where: { id },
  })
  return NextResponse.json({ message: 'Bridal request deleted' })
}