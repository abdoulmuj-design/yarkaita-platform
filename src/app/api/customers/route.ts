import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(customers)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { firstName, lastName, email, phone, gender, acquisitionSource, notes } = body

  if (!firstName || !lastName || !acquisitionSource) {
    return NextResponse.json({ error: 'firstName, lastName, and acquisitionSource are required' }, { status: 400 })
  }

  // Generate customer code
  const customerCode = `CUS-${Date.now()}`

  const customer = await prisma.customer.create({
    data: {
      customerCode,
      firstName,
      lastName,
      email,
      phone,
      gender,
      acquisitionSource,
      notes,
    },
  })
  return NextResponse.json(customer, { status: 201 })
}