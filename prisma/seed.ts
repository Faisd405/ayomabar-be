import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      username: 'admin',
      password: adminPassword,
      roles: ['admin', 'user'],
    },
  });

  console.log('✅ Created admin user:', {
    id: admin.id,
    email: admin.email,
    username: admin.username,
    roles: admin.roles,
  });

  // Create regular test user
  const userPassword = await bcrypt.hash('user123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@example.com',
      username: 'testuser',
      password: userPassword,
      roles: ['user'],
    },
  });

  console.log('✅ Created test user:', {
    id: user.id,
    email: user.email,
    username: user.username,
    roles: user.roles,
  });

  // Create sample notes for the test user
  const notes = await prisma.note.createMany({
    data: [
      {
        content: 'This is a sample note created by the seeder. Feel free to edit or delete it!',
        userId: user.id,
      },
      {
        content: 'Here are some tips for using this application:\n1. Create new notes\n2. Edit existing notes\n3. Delete notes you no longer need',
        userId: user.id,
      },
      {
        content: 'Check out the Swagger documentation at /api for all available endpoints.',
        userId: user.id,
      },
    ],
  });

  console.log(`✅ Created ${notes.count} sample notes for test user`);

  // Create sample notes for admin
  const adminNotes = await prisma.note.createMany({
    data: [
      {
        content: 'This is an admin note. Admin users have special privileges.',
        userId: admin.id,
      },
      {
        content: 'System is configured and ready to use.',
        userId: admin.id,
      },
    ],
  });

  console.log(`✅ Created ${adminNotes.count} sample notes for admin user`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('━'.repeat(50));
  console.log('Admin User:');
  console.log('  Email: admin@example.com');
  console.log('  Password: admin123');
  console.log('  Roles: admin, user');
  console.log('');
  console.log('Regular User:');
  console.log('  Email: user@example.com');
  console.log('  Password: user123');
  console.log('  Roles: user');
  console.log('━'.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
