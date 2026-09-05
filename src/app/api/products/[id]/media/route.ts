import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { url, type } = body

  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

  const media = await prisma.productMedia.create({
    data: { productId: id, url, type: type || 'image' },
  })
  return NextResponse.json(media, { status: 201 })
}