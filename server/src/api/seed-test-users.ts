import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedTestUsers() {
  const password = 'tocktocktock';
  const hashedPassword = await bcrypt.hash(password, 10);

  const testUsers = [
    { email: 'test1@test.com', username: 'test1', firstName: 'Test', lastName: 'User1' },
    { email: 'test2@test.com', username: 'test2', firstName: 'Test', lastName: 'User2' },
    { email: 'test3@test.com', username: 'test3', firstName: 'Test', lastName: 'User3' },
    { email: 'test4@test.com', username: 'test4', firstName: 'Test', lastName: 'User4' },
  ];

  for (const user of testUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        username: user.username,
        passwordHash: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: true,
      },
    });
    console.log(`Created/Updated user: ${user.email}`);
  }

  console.log('Test users seeded successfully!');
}

seedTestUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
