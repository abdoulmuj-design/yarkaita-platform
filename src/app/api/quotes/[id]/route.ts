import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      items: true,
      bespokeRequest: true,
      bridalRequest: true,
    },
  })
  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }
  return NextResponse.json(quote)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, notes } = body

  const quote = await prisma.quote.update({
    where: { id },
    data: { status, notes },
  })
  return NextResponse.json(quote)
}