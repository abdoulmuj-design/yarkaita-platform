import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public routes (no token required)
  const publicRoutes = ['/api/auth', '/api/products', '/api/categories', '/api/collections']
  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next()
  }

  // Protected routes - require token
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