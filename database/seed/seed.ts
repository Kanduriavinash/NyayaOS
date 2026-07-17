import { PrismaClient } from '../../packages/database/src/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Users
  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@nyayaos.gov.in' },
    update: {},
    create: {
      name: 'Rajesh Kumar',
      email: 'citizen@nyayaos.gov.in',
      role: 'CITIZEN',
      phone: '+919999912345'
    }
  });
  console.log(`Created Citizen: ${citizen.name} (ID: ${citizen.id})`);

  const lawyer = await prisma.user.upsert({
    where: { email: 'lawyer@nyayaos.gov.in' },
    update: {},
    create: {
      name: 'Aditya Sen',
      email: 'lawyer@nyayaos.gov.in',
      role: 'LAWYER',
      phone: '+919999967890'
    }
  });
  console.log(`Created Lawyer: ${lawyer.name} (ID: ${lawyer.id})`);

  const judge = await prisma.user.upsert({
    where: { email: 'judge@nyayaos.gov.in' },
    update: {},
    create: {
      name: 'Justice D.Y. Chandrachud',
      email: 'judge@nyayaos.gov.in',
      role: 'JUDGE',
      phone: '+919999900001'
    }
  });
  console.log(`Created Judge: ${judge.name} (ID: ${judge.id})`);

  const registry = await prisma.user.upsert({
    where: { email: 'registry@nyayaos.gov.in' },
    update: {},
    create: {
      name: 'Sunita Sharma',
      email: 'registry@nyayaos.gov.in',
      role: 'REGISTRY_OFFICER',
      phone: '+919999911111'
    }
  });
  console.log(`Created Registry Officer: ${registry.name} (ID: ${registry.id})`);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nyayaos.gov.in' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@nyayaos.gov.in',
      role: 'ADMIN',
      phone: '+919999999999'
    }
  });
  console.log(`Created Admin: ${admin.name} (ID: ${admin.id})`);

  // Create Court
  const court = await prisma.court.create({
    data: {
      name: 'District Court of New Delhi (Patiala House)',
      location: 'New Delhi',
      jurisdiction: 'New Delhi District (ZIP 11xxxx)'
    }
  });
  console.log(`Created Court: ${court.name} (ID: ${court.id})`);

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
