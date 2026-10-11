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
    { key: 'checkout.codFee', group: 'checkout', value: 0 },
    { key: 'checkout.codMaxOrderTotal', group: 'checkout', value: 5000 },
    { key: 'payments.onlineMethods', group: 'payments', value: 'CARD,WALLET' },
    { key: 'shipping.flatRatePerVendor', group: 'shipping', value: 5 },
    { key: 'shipping.freeShippingAbove', group: 'shipping', value: 50 },
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

async function seedCategories() {
  const tree: Record<string, string[]> = {
    Electronics: ['Smartphones', 'Laptops', 'Headphones', 'Smart Watches'],
    Fashion: ['Men', 'Women', 'Kids', 'Shoes'],
    'Home & Kitchen': ['Furniture', 'Kitchen Appliances', 'Decor'],
    'Health & Beauty': ['Skincare', 'Fragrances'],
    Sports: ['Fitness Equipment', 'Outdoor'],
  };
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/&/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  let position = 0;
  for (const [rootName, children] of Object.entries(tree)) {
    const root = await prisma.category.upsert({
      where: { slug: slug(rootName) },
      update: {},
      create: { name: rootName, slug: slug(rootName), position: position++ },
    });
    for (const [i, child] of children.entries()) {
      await prisma.category.upsert({
        where: { slug: slug(child) },
        update: {},
        create: { name: child, slug: slug(child), parentId: root.id, position: i },
      });
    }
  }
  console.log(`  ✓ categories (${Object.keys(tree).length} top-level)`);
}

async function seedBrands() {
  const brands = [
    'Apple',
    'Samsung',
    'Xiaomi',
    'Sony',
    'Dell',
    'HP',
    'Lenovo',
    'Nike',
    'Adidas',
    "L'Oréal",
  ];
  const slug = (s: string) =>
    s
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/'/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  for (const name of brands) {
    await prisma.brand.upsert({
      where: { slug: slug(name) },
      update: {},
      create: { name, slug: slug(name) },
    });
  }
  console.log(`  ✓ brands (${brands.length})`);
}

async function seedAttributes() {
  type Seed = { name: string; code: string; type: 'select' | 'color'; values: [string, string?][] };
  const attributes: Seed[] = [
    {
      name: 'Color',
      code: 'color',
      type: 'color',
      values: [
        ['Black', '#111827'],
        ['White', '#ffffff'],
        ['Gray', '#6b7280'],
        ['Red', '#dc2626'],
        ['Blue', '#2563eb'],
        ['Green', '#16a34a'],
      ],
    },
    {
      name: 'Size',
      code: 'size',
      type: 'select',
      values: [['XS'], ['S'], ['M'], ['L'], ['XL'], ['XXL']],
    },
    {
      name: 'Storage',
      code: 'storage',
      type: 'select',
      values: [['64GB'], ['128GB'], ['256GB'], ['512GB'], ['1TB']],
    },
    { name: 'RAM', code: 'ram', type: 'select', values: [['4GB'], ['8GB'], ['16GB'], ['32GB']] },
    {
      name: 'Material',
      code: 'material',
      type: 'select',
      values: [['Cotton'], ['Polyester'], ['Leather'], ['Denim']],
    },
  ];

  for (const [position, a] of attributes.entries()) {
    const attribute = await prisma.attribute.upsert({
      where: { code: a.code },
      update: {},
      create: { name: a.name, code: a.code, type: a.type, position },
    });
    for (const [i, [label, swatch]] of a.values.entries()) {
      const value = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await prisma.attributeValue.upsert({
        where: { attributeId_value: { attributeId: attribute.id, value } },
        update: {},
        create: { attributeId: attribute.id, value, label, swatch: swatch ?? null, position: i },
      });
    }
  }
  console.log(`  ✓ attributes (${attributes.length})`);
}

async function seedVendors() {
  const role = await prisma.role.findUniqueOrThrow({ where: { name: 'VENDOR' } });
  const vendors = [
    {
      email: 'vendor@example.com',
      firstName: 'Demo',
      lastName: 'Seller',
      store: 'Demo Electronics',
      slug: 'demo-electronics',
      status: 'APPROVED' as const,
      description: 'Phones, laptops and accessories from trusted brands.',
    },
    {
      email: 'pending@example.com',
      firstName: 'Pending',
      lastName: 'Seller',
      store: 'Pending Fashion',
      slug: 'pending-fashion',
      status: 'PENDING' as const,
      description: 'Clothing and shoes for men and women.',
    },
  ];
  const passwordHash = await argon2.hash('Vendor@12345');

  for (const v of vendors) {
    const user = await prisma.user.upsert({
      where: { email: v.email },
      update: {},
      create: {
        email: v.email,
        firstName: v.firstName,
        lastName: v.lastName,
        passwordHash,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        roles: { create: { roleId: role.id } },
        emailPreference: { create: {} },
      },
    });
    await prisma.vendor.upsert({
      where: { slug: v.slug },
      update: {},
      create: {
        ownerId: user.id,
        name: v.store,
        slug: v.slug,
        email: v.email,
        description: v.description,
        status: v.status,
        approvedAt: v.status === 'APPROVED' ? new Date() : null,
        commissionRate: v.status === 'APPROVED' ? 10 : null,
        policies:
          v.status === 'APPROVED'
            ? {
                shipping: 'Ships in 1–2 business days nationwide.',
                returns: '7-day returns on unused items.',
              }
            : undefined,
      },
    });
  }
  console.log(`  ✓ vendors (${vendors.length}) — password Vendor@12345`);
}

async function seedProducts() {
  const vendor = await prisma.vendor.findUnique({ where: { slug: 'demo-electronics' } });
  if (!vendor) return;
  const currency = (await prisma.currency.findFirst({ where: { isDefault: true } }))?.code ?? 'USD';
  const category = async (slug: string) =>
    (await prisma.category.findUniqueOrThrow({ where: { slug } })).id;
  const brand = async (slug: string) =>
    (await prisma.brand.findUniqueOrThrow({ where: { slug } })).id;

  const products = [
    {
      slug: 'galaxy-s24-ultra-256gb',
      name: 'Galaxy S24 Ultra 256GB',
      category: 'smartphones',
      brand: 'samsung',
      sku: 'SAM-S24U-256',
      price: 1199.99,
      compareAt: 1299.99,
      status: 'PUBLISHED' as const,
      specs: [
        { label: 'Screen', value: '6.8" QHD+ AMOLED' },
        { label: 'Storage', value: '256 GB' },
        { label: 'Battery', value: '5000 mAh' },
      ],
    },
    {
      slug: 'iphone-15-128gb',
      name: 'iPhone 15 128GB',
      category: 'smartphones',
      brand: 'apple',
      sku: 'APL-IP15-128',
      price: 799,
      compareAt: null,
      status: 'PUBLISHED' as const,
      specs: [
        { label: 'Screen', value: '6.1" Super Retina XDR' },
        { label: 'Storage', value: '128 GB' },
      ],
    },
    {
      slug: 'dell-xps-13',
      name: 'Dell XPS 13 (Intel Core Ultra 7, 16GB)',
      category: 'laptops',
      brand: 'dell',
      sku: 'DEL-XPS13-U7-16',
      price: 1399,
      compareAt: 1499,
      status: 'PENDING_REVIEW' as const,
      specs: [
        { label: 'Processor', value: 'Intel Core Ultra 7' },
        { label: 'RAM', value: '16 GB' },
      ],
    },
    {
      slug: 'sony-wh-1000xm5',
      name: 'Sony WH-1000XM5 Wireless Headphones',
      category: 'headphones',
      brand: 'sony',
      sku: 'SNY-WH1000XM5',
      price: 349.99,
      compareAt: 399.99,
      status: 'DRAFT' as const,
      specs: [{ label: 'Battery life', value: 'Up to 30 hours' }],
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        vendorId: vendor.id,
        categoryId: await category(p.category),
        brandId: await brand(p.brand),
        name: p.name,
        slug: p.slug,
        shortDescription: `${p.name} — sold by ${vendor.name}.`,
        description: `${p.name}. Sample product created by the seed script. Replace the images and description from the seller center.`,
        specifications: p.specs,
        basePrice: p.price,
        compareAtPrice: p.compareAt,
        currency,
        status: p.status,
        publishedAt: p.status === 'PUBLISHED' ? new Date() : null,
        variants: {
          create: { sku: p.sku, price: p.price, compareAtPrice: p.compareAt, isDefault: true },
        },
      },
    });
  }
  console.log(`  ✓ products (${products.length}) for ${vendor.name}`);
}

async function seedInventory() {
  const vendor = await prisma.vendor.findUnique({ where: { slug: 'demo-electronics' } });
  if (!vendor) return;
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'DEMO-ELECTRONICS-MAIN' },
    update: {},
    create: {
      vendorId: vendor.id,
      name: 'Main warehouse',
      code: 'DEMO-ELECTRONICS-MAIN',
      address: { city: 'Lahore', country: 'Pakistan' },
    },
  });
  // In stock, low, in stock, out — so every inventory state is visible.
  const stock: Record<string, number> = {
    'SAM-S24U-256': 25,
    'APL-IP15-128': 3,
    'DEL-XPS13-U7-16': 12,
    'SNY-WH1000XM5': 0,
  };
  for (const [sku, quantity] of Object.entries(stock)) {
    const variant = await prisma.productVariant.findUnique({ where: { sku } });
    if (!variant) continue;
    const existing = await prisma.stockLevel.findUnique({
      where: { variantId_warehouseId: { variantId: variant.id, warehouseId: warehouse.id } },
    });
    if (existing) continue;
    await prisma.stockLevel.create({
      data: { variantId: variant.id, warehouseId: warehouse.id, quantity },
    });
    if (quantity > 0) {
      await prisma.stockMovement.create({
        data: {
          variantId: variant.id,
          warehouseId: warehouse.id,
          type: 'PURCHASE',
          quantity,
          note: 'Opening stock (seed)',
        },
      });
    }
  }
  console.log('  ✓ inventory (main warehouse + opening stock)');
}

async function main() {
  console.log('Seeding database…');
  await seedRbac();
  await seedAdmin();
  await seedLocalization();
  await seedSettings();
  await seedCategories();
  await seedBrands();
  await seedAttributes();
  await seedVendors();
  await seedProducts();
  await seedInventory();
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
