import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      roles: {
        include: {
          role: true,
        },
      },
      staffProfile: true,
    },
  })
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { email, password, name, role, department, position } = body

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'email, password, and name are required' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        status: 'ACTIVE',
        staffProfile: department || position ? {
          create: {
            employeeCode: `EMP-${Date.now()}`,
            department: department || 'General',
            position: position || 'Staff',
          },
        } : undefined,
      },
    })

    if (role) {
      const roleRecord = await prisma.role.upsert({
        where: { name: role },
        update: {},
        create: { name: role, description: `${role} Role` },
      })

      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: roleRecord.id,
        },
      })
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'This email is already registered' }, { status: 409 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}