const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./src/generated/prisma/client');
const bcrypt = require('bcryptjs');

async function seed() {
  const adapter = new PrismaPg({
    connectionString: 'postgresql://rtx:RtxSystem2026!SecureDb@localhost:5432/rtx?schema=public'
  });
  const prisma = new PrismaClient({ adapter });

  const users = [
    { name: 'OPEN APPS', phone: '01558282760', password: '123456', role: 'MANAGER' },
    { name: 'Ali', phone: '01067662255', password: '123456', role: 'MANAGER' },
    { name: 'Mostafa', phone: '01125692128', password: '123456', role: 'USER' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    try {
      await prisma.user.upsert({
        where: { phone: u.phone },
        update: { name: u.name, password: hash, role: u.role },
        create: { name: u.name, phone: u.phone, password: hash, role: u.role },
      });
      console.log('OK:', u.name);
    } catch (e) {
      console.error('ERR:', u.name, e.message);
    }
  }

  await prisma.$disconnect();
  console.log('Done!');
}

seed().catch(e => { console.error(e); process.exit(1); });
