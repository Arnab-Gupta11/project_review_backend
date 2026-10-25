import readline from 'readline';
import argon2 from 'argon2';
import { connectDB, disconnectDB, prisma } from '../app/db/index.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> =>
  new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    await connectDB();

    console.log('\n--- Create New Admin ---\n');
    const name = await question('Name: ');
    const email = await question('Email: ');

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.log('Error: User with this email already exists.');
      return;
    }

    const password = await question('Password: ');
    const confirmPassword = await question('Confirm Password: ');

    if (password !== confirmPassword) {
      console.log('Error: Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      console.log('Error: Password must be at least 6 characters.');
      return;
    }

    const passwordHash = await argon2.hash(password);

    const admin = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log(`\n✅ Admin account created successfully!`);
    console.log(`ID:    ${admin.id}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role:  ${admin.role}\n`);
  } catch (error) {
    console.error('Failed to create admin:', error);
  } finally {
    rl.close();
    await disconnectDB();
  }
}

createAdmin();
