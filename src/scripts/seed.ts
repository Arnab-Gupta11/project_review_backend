import argon2 from 'argon2';
import { connectDB, disconnectDB, prisma } from '../app/db/index.js';

async function seed() {
  try {
    await connectDB();
    console.log('Seeding database...');

    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const passwordHash = await argon2.hash('admin123456');
      const admin = await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: adminEmail,
          password: passwordHash,
          role: 'MENTOR',
          isActive: true,
        },
      });
      console.log(
        `Admin account created: ${admin.email} (password: admin123456)`
      );
    } else {
      console.log(`ℹAdmin account already exists: ${existingAdmin.email}`);
    }

    console.log('Seed completed successfully (only admin seeded).');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await disconnectDB();
  }
}

seed();
