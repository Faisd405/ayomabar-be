import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create superadmin user
  const superadminPassword = await bcrypt.hash('superadmin123', 10);
  
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      username: 'superadmin',
      password: superadminPassword,
      roles: ['superadmin', 'admin', 'user'],
    },
  });

  console.log('✅ Created superadmin user:', {
    id: superadmin.id,
    email: superadmin.email,
    username: superadmin.username,
    roles: superadmin.roles,
  });

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

  // Create sample notes for superadmin
  const superadminNotes = await prisma.note.createMany({
    data: [
      {
        content: 'Superadmin note: Full system access granted.',
        userId: superadmin.id,
      },
      {
        content: 'Monitor system health and user activities regularly.',
        userId: superadmin.id,
      },
    ],
  });

  console.log(`✅ Created ${superadminNotes.count} sample notes for superadmin user`);

  // Create games
  console.log('\n🎮 Creating games...');

  const valorant = await prisma.game.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Valorant',
      genre: 'FPS, Tactical Shooter',
      platform: 'PC',
      releaseDate: new Date('2020-06-02'),
    },
  });

  console.log('✅ Created game:', valorant.title);

  const mobileLegends = await prisma.game.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Mobile Legends: Bang Bang',
      genre: 'MOBA',
      platform: 'Mobile (Android, iOS)',
      releaseDate: new Date('2016-07-14'),
    },
  });

  console.log('✅ Created game:', mobileLegends.title);

  // Create Valorant ranks
  console.log('\n🏆 Creating Valorant ranks...');

  const valorantRanks = [
    { name: 'Iron', tier: 1, orderIndex: 1 },
    { name: 'Iron', tier: 2, orderIndex: 2 },
    { name: 'Iron', tier: 3, orderIndex: 3 },
    { name: 'Bronze', tier: 1, orderIndex: 4 },
    { name: 'Bronze', tier: 2, orderIndex: 5 },
    { name: 'Bronze', tier: 3, orderIndex: 6 },
    { name: 'Silver', tier: 1, orderIndex: 7 },
    { name: 'Silver', tier: 2, orderIndex: 8 },
    { name: 'Silver', tier: 3, orderIndex: 9 },
    { name: 'Gold', tier: 1, orderIndex: 10 },
    { name: 'Gold', tier: 2, orderIndex: 11 },
    { name: 'Gold', tier: 3, orderIndex: 12 },
    { name: 'Platinum', tier: 1, orderIndex: 13 },
    { name: 'Platinum', tier: 2, orderIndex: 14 },
    { name: 'Platinum', tier: 3, orderIndex: 15 },
    { name: 'Diamond', tier: 1, orderIndex: 16 },
    { name: 'Diamond', tier: 2, orderIndex: 17 },
    { name: 'Diamond', tier: 3, orderIndex: 18 },
    { name: 'Ascendant', tier: 1, orderIndex: 19 },
    { name: 'Ascendant', tier: 2, orderIndex: 20 },
    { name: 'Ascendant', tier: 3, orderIndex: 21 },
    { name: 'Immortal', tier: 1, orderIndex: 22 },
    { name: 'Immortal', tier: 2, orderIndex: 23 },
    { name: 'Immortal', tier: 3, orderIndex: 24 },
    { name: 'Radiant', tier: 1, orderIndex: 25 },
  ];

  for (const rank of valorantRanks) {
    const uniqueKey = {
      gameId: valorant.id,
      name: rank.name,
      tier: rank.tier !== null ? rank.tier : null,
    };
    
    await prisma.rank.upsert({
      where: {
        gameId_name_tier: uniqueKey as any,
      },
      update: {},
      create: {
        gameId: valorant.id,
        name: rank.name,
        tier: rank.tier,
        orderIndex: rank.orderIndex,
      },
    });
  }

  console.log(`✅ Created ${valorantRanks.length} Valorant ranks`);

  // Create Mobile Legends ranks
  console.log('\n🏆 Creating Mobile Legends ranks...');

  const mlRanks = [
    { name: 'Warrior', tier: 1, orderIndex: 1 },
    { name: 'Warrior', tier: 2, orderIndex: 2 },
    { name: 'Warrior', tier: 3, orderIndex: 3 },
    { name: 'Elite', tier: 1, orderIndex: 4 },
    { name: 'Elite', tier: 2, orderIndex: 5 },
    { name: 'Elite', tier: 3, orderIndex: 6 },
    { name: 'Master', tier: 1, orderIndex: 7 },
    { name: 'Master', tier: 2, orderIndex: 8 },
    { name: 'Master', tier: 3, orderIndex: 9 },
    { name: 'Master', tier: 4, orderIndex: 10 },
    { name: 'Grandmaster', tier: 1, orderIndex: 11 },
    { name: 'Grandmaster', tier: 2, orderIndex: 12 },
    { name: 'Grandmaster', tier: 3, orderIndex: 13 },
    { name: 'Grandmaster', tier: 4, orderIndex: 14 },
    { name: 'Grandmaster', tier: 5, orderIndex: 15 },
    { name: 'Epic', tier: 1, orderIndex: 16 },
    { name: 'Epic', tier: 2, orderIndex: 17 },
    { name: 'Epic', tier: 3, orderIndex: 18 },
    { name: 'Epic', tier: 4, orderIndex: 19 },
    { name: 'Epic', tier: 5, orderIndex: 20 },
    { name: 'Legend', tier: 1, orderIndex: 21 },
    { name: 'Legend', tier: 2, orderIndex: 22 },
    { name: 'Legend', tier: 3, orderIndex: 23 },
    { name: 'Legend', tier: 4, orderIndex: 24 },
    { name: 'Legend', tier: 5, orderIndex: 25 },
    { name: 'Mythic', tier: 1, orderIndex: 26 },
    { name: 'Mythic Honor', tier: 2, orderIndex: 27 },
    { name: 'Mythic Glory', tier: 3, orderIndex: 28 },
    { name: 'Mythic Immortal', tier: 4, orderIndex: 29 },
  ];

  for (const rank of mlRanks) {
    const uniqueKey = {
      gameId: mobileLegends.id,
      name: rank.name,
      tier: rank.tier !== null ? rank.tier : null,
    };
    
    await prisma.rank.upsert({
      where: {
        gameId_name_tier: uniqueKey as any,
      },
      update: {},
      create: {
        gameId: mobileLegends.id,
        name: rank.name,
        tier: rank.tier,
        orderIndex: rank.orderIndex,
      },
    });
  }

  console.log(`✅ Created ${mlRanks.length} Mobile Legends ranks`);

  // Get rank IDs for room creation
  const valorantSilver1 = await prisma.rank.findFirst({
    where: { gameId: valorant.id, name: 'Silver', tier: 1 },
  });
  const valorantDiamond3 = await prisma.rank.findFirst({
    where: { gameId: valorant.id, name: 'Diamond', tier: 3 },
  });
  const valorantGold1 = await prisma.rank.findFirst({
    where: { gameId: valorant.id, name: 'Gold', tier: 1 },
  });
  const valorantPlatinum3 = await prisma.rank.findFirst({
    where: { gameId: valorant.id, name: 'Platinum', tier: 3 },
  });

  const mlEpic1 = await prisma.rank.findFirst({
    where: { gameId: mobileLegends.id, name: 'Epic', tier: 1 },
  });
  const mlLegend5 = await prisma.rank.findFirst({
    where: { gameId: mobileLegends.id, name: 'Legend', tier: 5 },
  });
  const mlMaster1 = await prisma.rank.findFirst({
    where: { gameId: mobileLegends.id, name: 'Master', tier: 1 },
  });
  const mlGrandmaster5 = await prisma.rank.findFirst({
    where: { gameId: mobileLegends.id, name: 'Grandmaster', tier: 5 },
  });

  // Create sample rooms for Valorant
  console.log('\n🚪 Creating sample Valorant rooms...');

  const valorantRoom1 = await prisma.room.create({
    data: {
      gameId: valorant.id,
      userId: user.id,
      minSlot: 3,
      maxSlot: 5,
      rankMinId: valorantSilver1?.id,
      rankMaxId: valorantDiamond3?.id,
      typePlay: 'competitive',
      roomType: 'public',
      roomCode: 'VAL-COMP-2024',
      status: 'open',
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    },
  });

  await prisma.roomRequest.create({
    data: {
      roomId: valorantRoom1.id,
      userId: user.id,
      status: 'accepted',
      isHost: true,
    },
  });

  console.log('✅ Created Valorant room: Competitive Public (Silver 1 - Diamond 3)');

  const valorantRoom2 = await prisma.room.create({
    data: {
      gameId: valorant.id,
      userId: admin.id,
      minSlot: 5,
      maxSlot: 5,
      rankMinId: valorantGold1?.id,
      rankMaxId: valorantPlatinum3?.id,
      typePlay: 'casual',
      roomType: 'private',
      roomCode: 'https://discord.gg/valorant-casual',
      status: 'open',
      scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    },
  });

  await prisma.roomRequest.create({
    data: {
      roomId: valorantRoom2.id,
      userId: admin.id,
      status: 'accepted',
      isHost: true,
    },
  });

  console.log('✅ Created Valorant room: Casual Private (Gold 1 - Platinum 3)');

  const valorantRoom3 = await prisma.room.create({
    data: {
      gameId: valorant.id,
      userId: superadmin.id,
      minSlot: 4,
      maxSlot: 5,
      typePlay: 'custom',
      roomType: 'public',
      status: 'open',
    },
  });

  await prisma.roomRequest.create({
    data: {
      roomId: valorantRoom3.id,
      userId: superadmin.id,
      status: 'accepted',
      isHost: true,
    },
  });

  console.log('✅ Created Valorant room: Custom Public (No rank requirement)');

  // Create sample rooms for Mobile Legends
  console.log('\n🚪 Creating sample Mobile Legends rooms...');

  const mlRoom1 = await prisma.room.create({
    data: {
      gameId: mobileLegends.id,
      userId: user.id,
      minSlot: 3,
      maxSlot: 5,
      rankMinId: mlEpic1?.id,
      rankMaxId: mlLegend5?.id,
      typePlay: 'competitive',
      roomType: 'public',
      roomCode: 'ML-RANK-PUSH',
      status: 'open',
      scheduledAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
    },
  });

  await prisma.roomRequest.create({
    data: {
      roomId: mlRoom1.id,
      userId: user.id,
      status: 'accepted',
      isHost: true,
    },
  });

  console.log('✅ Created Mobile Legends room: Competitive Public (Epic 1 - Legend 5)');

  const mlRoom2 = await prisma.room.create({
    data: {
      gameId: mobileLegends.id,
      userId: admin.id,
      minSlot: 5,
      maxSlot: 5,
      rankMinId: mlMaster1?.id,
      rankMaxId: mlGrandmaster5?.id,
      typePlay: 'casual',
      roomType: 'private',
      roomCode: 'https://discord.gg/mlbb-squad',
      status: 'open',
      scheduledAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    },
  });

  await prisma.roomRequest.create({
    data: {
      roomId: mlRoom2.id,
      userId: admin.id,
      status: 'accepted',
      isHost: true,
    },
  });

  console.log('✅ Created Mobile Legends room: Casual Private (Master 1 - Grandmaster 5)');

  const mlRoom3 = await prisma.room.create({
    data: {
      gameId: mobileLegends.id,
      userId: superadmin.id,
      minSlot: 2,
      maxSlot: 5,
      typePlay: 'custom',
      roomType: 'public',
      status: 'open',
    },
  });

  await prisma.roomRequest.create({
    data: {
      roomId: mlRoom3.id,
      userId: superadmin.id,
      status: 'accepted',
      isHost: true,
    },
  });

  console.log('✅ Created Mobile Legends room: Custom Public (No rank requirement)');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('━'.repeat(50));
  console.log('Superadmin User:');
  console.log('  Email: superadmin@example.com');
  console.log('  Password: superadmin123');
  console.log('  Roles: superadmin, admin, user');
  console.log('');
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
  console.log('\n🎮 Games Created:');
  console.log('━'.repeat(50));
  console.log('1. Valorant');
  console.log('   - 25 ranks (Iron 1 → Radiant)');
  console.log('   - 3 sample rooms created');
  console.log('');
  console.log('2. Mobile Legends: Bang Bang');
  console.log('   - 29 ranks (Warrior 1 → Mythic Immortal)');
  console.log('   - 3 sample rooms created');
  console.log('━'.repeat(50));
  console.log('\n🚪 Room Settings Available:');
  console.log('━'.repeat(50));
  console.log('Type Play:');
  console.log('  - Casual: Relaxed gameplay');
  console.log('  - Competitive: Ranked matches');
  console.log('  - Custom: Custom rules and settings');
  console.log('');
  console.log('Room Type:');
  console.log('  - Public: Open to everyone');
  console.log('  - Private: Invite-only or host selection');
  console.log('');
  console.log('Features:');
  console.log('  - Rank range filtering (min/max)');
  console.log('  - Player slots (min/max)');
  console.log('  - Scheduled matches');
  console.log('  - Room codes/links (configurable)');
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
