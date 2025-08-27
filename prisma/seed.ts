import { PrismaClient, Product } from "@prisma/client";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function getUnsplashImage(query: string) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query
  )}&per_page=1&orientation=squarish&client_id=${
    process.env.UNSPLASH_ACCESS_KEY
  }`;

  const response = await fetch(url);
  const data: any = await response.json();
  return data.results[0]?.urls?.regular || "https://via.placeholder.com/400";
}

async function main() {
  console.log("Start seeding...");

  // First, create a test user if needed
  const testUser = await prisma.user.upsert({
    where: { email: "usertesting@testing.com" },
    update: {},
    create: {
      name: "Testuser1",
      email: "usertesting@testing.com",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    },
  });

  const mockProducts = [
    {
      name: "Dell Inspiron 14 Laptop",
      description:
        "Used Dell Inspiron 14 with Intel i5, 8GB RAM, and 256GB SSD. Reliable for school work and online classes.",
      price: 38000,
      // images: [
      //   'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'
      // ],
      category: "Electronics",
      condition: "used",
      status: "available",
      userId: testUser.id,
    },
    {
      name: "Ergonomic Office Chair",
      description:
        "Comfortable ergonomic chair with adjustable height. Minor wear but still sturdy and supportive.",
      price: 4500,
      // images: [
      //   'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'
      // ],
      category: "Furniture",
      condition: "used",
      status: "available",
      userId: testUser.id,
    },
    {
      name: "iPhone XR 64GB",
      description:
        "Pre-owned iPhone XR in good condition. Battery health 85%. Includes charger.",
      price: 28000,
      // images: [
      //   'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'
      // ],
      category: "Phones",
      condition: "used",
      status: "available",
      userId: testUser.id,
    },
    {
      name: "Anker Soundcore Earbuds",
      description:
        "Wireless earbuds with great sound quality and noise isolation. Comes with charging case.",
      price: 3500,
      // images: [
      //   'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400'
      // ],
      category: "Electronics",
      condition: "used",
      status: "available",
      userId: testUser.id,
    },
    {
      name: "Calculus Textbook by James Stewart",
      description:
        "7th Edition calculus textbook, lightly used. Perfect for engineering and math students.",
      price: 2200,
      // images: [
      //   'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400'
      // ],
      category: "Books",
      condition: "used",
      status: "available",
      userId: testUser.id,
    },

    {
      name: "2-Burner Gas Cooker",
      description:
        "Compact double-burner gas cooker, ideal for hostels and bedsitters.",
      price: 4800,
      images: [
        "https://images.unsplash.com/photo-1616627562521-f6d524f5b6b8?w=400",
      ],
      category: "Appliances",
      condition: "used",
      status: "available",
      userId: testUser.id,
    },
    {
      name: "Ramtons 90L Mini Fridge",
      description:
        "Mini fridge in good condition, ideal for student hostels or small apartments.",
      price: 15000,
      // images: [
      //   'https://images.unsplash.com/photo-1586201375754-1231b9f18c97?w=400'
      // ],
      category: "Appliances",
      condition: "used",
      status: "available",
      userId: testUser.id,
    },
    {
      name: "Nike Air Force 1 Sneakers",
      description: "White Air Force 1 sneakers, men’s size 43. Lightly worn.",
      price: 6000,
      // images: [
      //   'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400'
      // ],
      category: "Fashion",
      condition: "used",
      status: "available",
      userId: testUser.id,
    },
    {
      name: "HP Laptop Backpack",
      description:
        "Durable padded laptop bag with multiple compartments, fits laptops up to 15.6 inches.",
      price: 2500,
      // images: [
      //   'https://images.unsplash.com/photo-1598032894284-6ac597c968d0?w=400'
      // ],
      category: "Accessories",
      condition: "used",
      status: "available",
      userId: testUser.id,
    },
    {
      name: "PlayStation 4 (500GB)",
      description:
        "PS4 console with one controller and three games included. Excellent condition.",
      price: 28000,
      // images: [
      //   'https://images.unsplash.com/photo-1606813907291-46c6ab810edb?w=400'
      // ],
      category: "Gaming",
      condition: "used",
      status: "available",
      userId: testUser.id,
    },
    {
      name: "Samsung 20L Microwave Oven",
      description:
        "Compact microwave oven, works perfectly. Suitable for small kitchens.",
      price: 8500,
      // images: [
      //   'https://images.unsplash.com/photo-1594623930572-7f9b2b6e8df1?w=400'
      // ],
      category: "Appliances",
      condition: "used",
      status: "available",
      userId: testUser.id,
    },
    {
      name: "Mountain Bike 26”",
      description:
        "Sturdy mountain bike with front suspension. Great for commuting and exercise.",
      price: 12000,
      // images: [
      //   'https://images.unsplash.com/photo-1595433562696-a8da6c92b6d4?w=400'
      // ],
      category: "Sports",
      condition: "used",
      status: "available",
      userId: testUser.id,
    },
  ];

  for (const product of mockProducts) {
    const image = await getUnsplashImage(product.name);

    // await prisma.product.updateMany({
    //   where: { name: product.name }, // match existing product by name
    //   data: { images: [image] },
    // });
    await prisma.product.upsert({
      where: { id: product.id }, // assumes id is unique
      update: { images: [image] },
      create: {
        ...product,
        images: [image],
        userId: testUser.id,
      },
    })
    console.log(`Created product: ${product.name}`);
  }

  // Create products
  // for (const product of mockProducts) {
  //   const createdProduct = await prisma.product.create({
  //     data: {
  //       ...product,
  //       userId: testUser.id,
  //     },
  //   })
  //   console.log(`Created product: ${createdProduct.name}`)
  // }

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

 