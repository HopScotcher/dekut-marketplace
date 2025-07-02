import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Product } from '@/lib/types'

const prisma = new PrismaClient()

function getCurrentUserId(req: NextRequest) {
  return req.headers.get('x-user-id') || 'user-123'
}

// DELETE: Bulk delete published products
export async function DELETE(req: NextRequest) {
  const userId = getCurrentUserId(req)
  try {
    const { ids } = await req.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No product IDs provided' }, { status: 400 })
    }
    // Only allow deleting products owned by current user and published
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, userId, status: 'published' },
    })
    const foundIds = products.map((p) => p.id)
    const toDelete = foundIds.length
    const toError = ids.length - toDelete
    await prisma.product.deleteMany({ where: { id: { in: foundIds } } })
    return NextResponse.json({ deleted: toDelete, failed: toError })
  } catch (error) {
    return NextResponse.json({ error: 'Bulk delete failed' }, { status: 500 })
  }
}
