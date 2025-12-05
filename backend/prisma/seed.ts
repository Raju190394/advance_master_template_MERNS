import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Create super admin
    const superAdminPassword = await bcrypt.hash('SuperAdmin@123', 10);
    const superAdmin = await prisma.user.upsert({
        where: { email: 'superadmin@admin.com' },
        update: {},
        create: {
            name: 'Super Administrator',
            email: 'superadmin@admin.com',
            password: superAdminPassword,
            role: 'super_admin',
            status: 'active',
        },
    });

    console.log('✅ Created Super Admin:', superAdmin.email);

    // Create admin
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@admin.com' },
        update: {},
        create: {
            name: 'Administrator',
            email: 'admin@admin.com',
            password: adminPassword,
            role: 'admin',
            status: 'active',
        },
    });

    console.log('✅ Created Admin:', admin.email);

    // Create regular user
    const userPassword = await bcrypt.hash('User@123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            name: 'Regular User',
            email: 'user@example.com',
            password: userPassword,
            role: 'user',
            status: 'active',
        },
    });

    console.log('✅ Created User:', user.email);

    console.log('\n📋 Default Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Super Admin:');
    console.log('  Email: superadmin@admin.com');
    console.log('  Password: SuperAdmin@123');
    console.log('\nAdmin:');
    console.log('  Email: admin@admin.com');
    console.log('  Password: Admin@123');
    console.log('\nUser:');
    console.log('  Email: user@example.com');
    console.log('  Password: User@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
