import type { Prisma, Vendor } from '@ecommerce/database';
import type {
  VendorAdminDto,
  VendorDto,
  VendorListItem,
  VendorPolicies,
  VendorPublicDto,
  VendorSelfDto,
  VendorStatus,
} from '@ecommerce/types';

export const vendorAdminInclude = {
  owner: { select: { id: true, email: true, firstName: true, lastName: true } },
  _count: { select: { products: true, vendorOrders: true } },
} satisfies Prisma.VendorInclude;

export type VendorWithOwner = Prisma.VendorGetPayload<{ include: typeof vendorAdminInclude }>;

const policiesOf = (v: Vendor) => (v.policies as unknown as VendorPolicies | null) ?? null;

export function toVendorDto(v: Vendor): VendorDto {
  return {
    id: v.id,
    name: v.name,
    slug: v.slug,
    email: v.email,
    phone: v.phone,
    logoUrl: v.logoUrl,
    bannerUrl: v.bannerUrl,
    description: v.description,
    policies: policiesOf(v),
    status: v.status as VendorStatus,
    statusReason: v.statusReason,
    commissionRate: v.commissionRate === null ? null : Number(v.commissionRate),
    ratingAverage: Number(v.ratingAverage),
    approvedAt: v.approvedAt?.toISOString() ?? null,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  };
}

export function toVendorSelfDto(v: Vendor): VendorSelfDto {
  return {
    ...toVendorDto(v),
    payout: {
      bankAccountName: v.bankAccountName,
      bankAccountNumber: v.bankAccountNumber,
      bankName: v.bankName,
      iban: v.iban,
    },
  };
}

export function toVendorAdminDto(v: VendorWithOwner): VendorAdminDto {
  return {
    ...toVendorSelfDto(v),
    owner: v.owner,
    productCount: v._count.products,
    orderCount: v._count.vendorOrders,
  };
}

export function toVendorListItem(v: VendorWithOwner): VendorListItem {
  return {
    id: v.id,
    name: v.name,
    slug: v.slug,
    email: v.email,
    logoUrl: v.logoUrl,
    status: v.status as VendorStatus,
    ownerName: `${v.owner.firstName} ${v.owner.lastName}`.trim(),
    productCount: v._count.products,
    createdAt: v.createdAt.toISOString(),
  };
}

export function toVendorPublicDto(v: Vendor): VendorPublicDto {
  return {
    id: v.id,
    name: v.name,
    slug: v.slug,
    logoUrl: v.logoUrl,
    bannerUrl: v.bannerUrl,
    description: v.description,
    policies: policiesOf(v),
    ratingAverage: Number(v.ratingAverage),
    createdAt: v.createdAt.toISOString(),
  };
}
