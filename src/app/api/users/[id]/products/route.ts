import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: User's products with optional status filter
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  try {
    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) return NextResponse.json([])
    const where: any = { userId: params.id }
    if (status === 'draft' || status === 'published') {
      where.status = status
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
