import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const products = [
    {
      title: 'Wireless Security Camera',
      slug: 'wireless-security-camera',
      sku: 'CAM-001',
      description: 'Indoor/outdoor connected security camera.',
      price: 89.99,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb',
      stock: 25,
      status: ProductStatus.ACTIVE,
    },
    {
      title: 'Smart Video Doorbell',
      slug: 'smart-video-doorbell',
      sku: 'DOOR-001',
      description: 'Connected video doorbell with mobile alerts.',
      price: 119.99,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827',
      stock: 18,
      status: ProductStatus.ACTIVE,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
