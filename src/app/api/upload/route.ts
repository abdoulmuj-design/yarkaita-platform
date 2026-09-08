import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  // Convert file to base64 string (demo only - works on Vercel)
  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const mimeType = file.type || 'image/jpeg'
  const dataUrl = `data:${mimeType};base64,${base64}`

  return NextResponse.json({ url: dataUrl }, { status: 201 })
}