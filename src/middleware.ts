import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const method = request.method

  // Allow public access to these routes (no token needed)
  const isPublicRoute =
    path.startsWith('/api/auth') ||
    (path.startsWith('/api/products') && method === 'GET') ||
    (path.startsWith('/api/categories') && method === 'GET') ||
    (path.startsWith('/api/collections') && method === 'GET') ||
    (path.startsWith('/api/checkout') && method === 'POST') ||
    (path.startsWith('/api/customers') && method === 'POST')

  if (isPublicRoute) {
    return NextResponse.next()
  }

  const token = request.headers.get('authorization')?.split(' ')[1]

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch (e) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }
}

export const config = {
  matcher: ['/api/:path*'],
}