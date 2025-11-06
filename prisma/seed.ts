import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Default Tenant',
      slug: 'default',
      settings: {},
    },
  });

  console.log('✅ Created tenant:', tenant.name);

  // Create test users (matching acme-auth-service for integration testing)
  const hashedPassword = await bcrypt.hash('SecurePass123!', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      tenantId: tenant.id,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: {},
    create: {
      email: 'agent@example.com',
      password: hashedPassword,
      firstName: 'Agent',
      lastName: 'User',
      role: UserRole.AGENT,
      tenantId: tenant.id,
    },
  });

  console.log('✅ Created agent user:', agentUser.email);

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: hashedPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: UserRole.USER,
      tenantId: tenant.id,
    },
  });

  console.log('✅ Created regular user:', regularUser.email);

  // Create sample tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Test Ticket 1 - Created by Regular User',
      description: 'This is a test ticket created by regular user',
      priority: 'medium',
      tenantId: tenant.id,
      createdById: regularUser.id,
    },
  });

  console.log('✅ Created ticket 1:', ticket1.title);

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Test Ticket 2 - Created by Agent',
      description: 'This is a test ticket created by agent',
      priority: 'high',
      tenantId: tenant.id,
      createdById: agentUser.id,
    },
  });

  console.log('✅ Created ticket 2:', ticket2.title);

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Test users created:');
  console.log('  - admin@example.com (ADMIN role)');
  console.log('  - agent@example.com (AGENT role)');
  console.log('  - user@example.com (USER role)');
  console.log('  Password for all: SecurePass123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
