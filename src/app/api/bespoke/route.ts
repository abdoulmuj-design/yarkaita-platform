import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const requests = await prisma.bespokeRequest.findMany({
    include: {
      customer: true,
      media: true,
      quotes: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(requests)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { customerId, description, status } = body

  if (!customerId || !description) {
    return NextResponse.json({ error: 'customerId and description are required' }, { status: 400 })
  }

  const requestNumber = `BSP-${Date.now()}`

  const bespokeRequest = await prisma.bespokeRequest.create({
    data: {
      requestNumber,
      customerId,
      description,
      status: status || 'PENDING',
    },
  })
  return NextResponse.json(bespokeRequest, { status: 201 })
}