/* eslint-disable no-console */
import { Prisma, PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const ROLES: { name: string; description: string }[] = [
  {
    name: 'SUPER_ADMIN',
    description: 'Full access including system settings, roles and permissions',
  },
  { name: 'ADMIN', description: 'Full platform control' },
  { name: 'CONTENT_MANAGER', description: 'CMS pages, banners, menus, blog' },
  { name: 'MARKETING_MANAGER', description: 'Coupons, promotions, email campaigns' },
  { name: 'SUPPORT_AGENT', description: 'Tickets, returns, customer queries' },
  { name: 'WAREHOUSE_STAFF', description: 'Picking, packing, shipping' },
  { name: 'VENDOR', description: 'Marketplace seller (store owner)' },
  { name: 'VENDOR_STAFF', description: 'Sub-user of a vendor' },
  { name: 'CUSTOMER', description: 'Registered shopper' },
];

const PERMISSION_GROUPS: Record<string, string[]> = {
  catalog: [
    'product.read',
    'product.create',
    'product.update',
    'product.delete',
    'product.approve',
    'category.manage',
  ],
  inventory: ['stock.read', 'stock.adjust', 'warehouse.manage'],
  orders: ['order.read', 'order.update', 'order.refund', 'order.create'],
  returns: ['return.read', 'return.process'],
  customers: ['customer.read', 'customer.update', 'customer.block'],
  vendors: [
    'vendor.read',
    'vendor.approve',
    'vendor.suspend',
    'payout.manage',
    'commission.manage',
  ],
  promotions: ['coupon.manage', 'promotion.manage', 'giftcard.manage'],
  loyalty: ['loyalty.manage'],
  cms: ['page.manage', 'banner.manage', 'menu.manage', 'blog.manage', 'faq.manage'],
  marketing: ['campaign.manage', 'subscriber.manage'],
  support: ['ticket.read', 'ticket.reply', 'review.moderate', 'dispute.manage'],
  reports: ['report.read', 'report.export'],
  settings: [
    'settings.manage',
    'role.manage',
    'user.manage',
    'email-template.manage',
    'audit.read',
  ],
};

const ROLE_PERMISSION_GROUPS: Record<string, string[] | '*'> = {
  SUPER_ADMIN: '*',
  ADMIN: Object.keys(PERMISSION_GROUPS).filter((g) => g !== 'settings'),
  CONTENT_MANAGER: ['cms'],
  MARKETING_MANAGER: ['promotions', 'marketing', 'loyalty', 'reports'],
  SUPPORT_AGENT: ['support', 'returns', 'customers'],
  WAREHOUSE_STAFF: ['inventory'],
};

async function seedRbac() {
  const permissionKeys = Object.entries(PERMISSION_GROUPS).flatMap(([group, perms]) =>
    perms.map((p) => `${group}.${p}`),
  );

  for (const key of permissionKeys) {
    await prisma.permission.upsert({ where: { key }, update: {}, create: { key } });
  }

  for (const role of ROLES) {
    const saved = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { ...role, isSystem: true },
    });

    const groups = ROLE_PERMISSION_GROUPS[role.name];
    if (!groups) continue;
    const keys =
      groups === '*'
        ? permissionKeys
        : permissionKeys.filter((k) => groups.includes(k.split('.')[0]!));
    const perms = await prisma.permission.findMany({ where: { key: { in: keys } } });
    await prisma.rolePermission.createMany({
      data: perms.map((p) => ({ roleId: saved.id, permissionId: p.id })),
      skipDuplicates: true,
    });
  }
  console.log(`  ✓ ${ROLES.length} roles, ${permissionKeys.length} permissions`);
}

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';
  const role = await prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } });

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: await argon2.hash(password),
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      roles: { create: { roleId: role.id } },
    },
  });
  console.log(`  ✓ super admin: ${email}`);
}

async function seedLocalization() {
  await prisma.currency.upsert({
    where: { code: 'USD' },
    update: {},
    create: { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1, isDefault: true },
  });
  await prisma.currency.upsert({
    where: { code: 'PKR' },
    update: {},
    create: { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs', exchangeRate: 280 },
  });
  await prisma.language.upsert({
    where: { code: 'en' },
    update: {},
    create: { code: 'en', name: 'English', isDefault: true },
  });
  console.log('  ✓ currencies & languages');
}

async function seedSettings() {
  const settings: { key: string; group: string; value: unknown }[] = [
    { key: 'store.name', group: 'general', value: 'Ecommerce' },
    { key: 'store.supportEmail', group: 'general', value: 'support@example.com' },
    { key: 'store.maintenanceMode', group: 'general', value: false },
    { key: 'marketplace.productApprovalRequired', group: 'vendors', value: true },
    { key: 'marketplace.defaultCommissionRate', group: 'vendors', value: 10 },
    { key: 'marketplace.payoutCycle', group: 'vendors', value: 'MONTHLY' },
    { key: 'checkout.guestCheckout', group: 'checkout', value: true },
    { key: 'checkout.reservationMinutes', group: 'checkout', value: 15 },
    { key: 'loyalty.pointsPerCurrencyUnit', group: 'loyalty', value: 1 },
    { key: 'loyalty.pointValue', group: 'loyalty', value: 0.01 },
    { key: 'marketing.abandonedCartDelaysHours', group: 'marketing', value: [1, 24, 72] },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, group: s.group, value: s.value as Prisma.InputJsonValue },
    });
  }

  for (const [name, minPoints] of [
    ['Silver', 0],
    ['Gold', 5000],
    ['Platinum', 20000],
  ] as const) {
    await prisma.tier.upsert({ where: { name }, update: {}, create: { name, minPoints } });
  }

  for (const handle of ['header', 'footer']) {
    await prisma.menu.upsert({ where: { handle }, update: {}, create: { handle, name: handle } });
  }
  console.log('  ✓ settings, loyalty tiers, menus');
}

async function main() {
  console.log('Seeding database…');
  await seedRbac();
  await seedAdmin();
  await seedLocalization();
  await seedSettings();
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
