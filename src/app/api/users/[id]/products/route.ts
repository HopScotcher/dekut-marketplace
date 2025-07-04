/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: User's products with optional status filter
export async function GET(req: NextRequest) {
  // Extract user id from URL
  const url = req.nextUrl || new URL(req.url)
  const parts = url.pathname.split('/')
  const userId = parts[parts.length - 2]
  const status = url.searchParams.get('status')
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json([])
    const where: import('@prisma/client').Prisma.ProductWhereInput = { userId }
    if (status === 'draft' || status === 'published') {
      where.status = status as any
    }
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user products' }, { status: 500 })
  }
}
