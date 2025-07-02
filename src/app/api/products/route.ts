import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Return published products only
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'published' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST: Create new product with user association
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, price, images, category, condition, status, userId } = body
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        images,
        category,
        condition,
        status,
        userId,
      },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
