/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper: get current userId (mocked for now)
function getCurrentUserId(req: NextRequest) {
  // In real app, extract from auth/session
  return req.headers.get('x-user-id') || 'user-123'
}

// GET: Single product by ID (published only, or owner's draft)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getCurrentUserId(req)
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { user: true },
    })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (product.status === 'published' || product.userId === userId) {
      return NextResponse.json(product)
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PUT: Update product (owner only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getCurrentUserId(req)
  try {
    const body = await req.json()
    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (product.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(updated)
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE: Delete product (owner only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getCurrentUserId(req)
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (product.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

// PATCH: Toggle product status (draft/published)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getCurrentUserId(req)
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (product.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const newStatus = product.status === 'published' ? 'draft' : 'published'
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: { status: newStatus },
    })
    return NextResponse.json(updated)
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to toggle status' }, { status: 500 })
  }
}
