import { PrismaClient } from '@prisma/client'
import { mockProducts } from '../src/data/mock-data'

const prisma = new PrismaClient()

async function main() {
  // Insert mock user
  const user = await prisma.user.upsert({
    where: { email: 'jane.doe@example.com' },
    update: {},
    create: {
      id: 'user-123',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
  })

  // Insert products
  for (const product of mockProducts) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        category: product.category,
        condition: product.condition,
        status: product.status,
        userId: user.id,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
