import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.json()
  const { type, customerId, description, isNearCompany, materialDescription, images } = body

  if (!customerId || !description) {
    return NextResponse.json({ error: 'customerId and description are required' }, { status: 400 })
  }

  const requestNumber = `${type === 'BESPOKE' ? 'BSP' : 'BRD'}-${Date.now()}`

  if (type === 'BESPOKE') {
    const bespoke = await prisma.bespokeRequest.create({
      data: {
        requestNumber,
        customerId,
        description,
        isNearCompany: isNearCompany || false,
        materialDescription,
        media: {
          create: (images || []).map((url: string) => ({ url, type: 'image' })),
        },
      },
    })
    return NextResponse.json(bespoke, { status: 201 })
  } else {
    const bridal = await prisma.bridalRequest.create({
      data: {
        requestNumber,
        customerId,
        description,
        isNearCompany: isNearCompany || false,
        materialDescription,
        media: {
          create: (images || []).map((url: string) => ({ url, type: 'image' })),
        },
      },
    })
    return NextResponse.json(bridal, { status: 201 })
  }
}