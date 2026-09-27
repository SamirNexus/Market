import {
  PrismaClient,
  ProductStatus,
  UserRole,
} from '@prisma/client';
import {
  randomBytes,
  scrypt as nodeScrypt,
} from 'node:crypto';
import { promisify } from 'node:util';

const prisma = new PrismaClient();
const scrypt = promisify(nodeScrypt);
const KEY_LENGTH = 64;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return [
    'scrypt',
    salt.toString('base64url'),
    derived.toString('base64url'),
  ].join('$');
}

async function seedOwner(): Promise<void> {
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.OWNER_PASSWORD;

  if (!email && !password) {
    return;
  }

  if (!email || !password) {
    throw new Error(
      'OWNER_EMAIL and OWNER_PASSWORD must be provided together',
    );
  }

  if (password.length < 12) {
    throw new Error('OWNER_PASSWORD must be at least 12 characters');
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: UserRole.OWNER,
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      role: UserRole.OWNER,
      isActive: true,
    },
  });
}

async function seedProducts(): Promise<void> {
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

async function seedMerchantSettings(): Promise<void> {
  await prisma.merchantSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Market',
      currency: 'USD',
      locale: 'en-US',
      primaryColor: '#111827',
    },
  });
}

async function main(): Promise<void> {
  await seedProducts();
  await seedMerchantSettings();
  await seedOwner();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
