import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { name, status, department, position } = body

  const user = await prisma.user.update({
    where: { id },
    data: {
      name,
      status,
      staffProfile: department || position ? {
        update: {
          department,
          position,
        },
      } : undefined,
    },
  })
  return NextResponse.json(user)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Soft delete: sanya status zuwa INACTIVE
  const user = await prisma.user.update({
    where: { id },
    data: { status: 'INACTIVE' },
  })
  return NextResponse.json({ message: 'User deactivated', user })
}