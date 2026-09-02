import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { url, type } = body

  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  const bridalRequest = await prisma.bridalRequest.findUnique({
    where: { id },
  })
  if (!bridalRequest) {
    return NextResponse.json({ error: 'Bridal request not found' }, { status: 404 })
  }

  const media = await prisma.bridalMedia.create({
    data: {
      bridalRequestId: id,
      url,
      type: type || 'image',
    },
  })
  return NextResponse.json(media, { status: 201 })
}