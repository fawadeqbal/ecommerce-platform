import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@ecommerce/database';
import type {
  CategoryTreeNode,
  Paginated,
  StorefrontOption,
  StorefrontProductCard,
  StorefrontProductDetail,
  StorefrontVariant,
} from '@ecommerce/types';
import { paginate } from '../../common/dto/pagination.dto';
import { availableByVariant } from '../../common/utils/stock-availability';
import { PrismaService } from '../../prisma/prisma.service';
import type { ProductQueryDto, ProductSort } from './dto/product-query.dto';

const SORT: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> = {
  newest: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  price_asc: [{ basePrice: 'asc' }],
  price_desc: [{ basePrice: 'desc' }],
  popular: [{ soldCount: 'desc' }],
  rating: [{ ratingAverage: 'desc' }, { ratingCount: 'desc' }],
};

/** Only published, not deleted products of approved vendors are ever visible. */
const VISIBLE: Prisma.ProductWhereInput = {
  status: 'PUBLISHED',
  deletedAt: null,
  vendor: { status: 'APPROVED' },
};

const cardInclude = {
  brand: { select: { name: true } },
  vendor: { select: { name: true, slug: true } },
  images: { orderBy: { position: 'asc' }, take: 1, select: { url: true } },
  variants: {
    where: { isActive: true },
    select: { id: true, _count: { select: { attributes: true } } },
  },
} satisfies Prisma.ProductInclude;

const detailInclude = {
  category: { select: { name: true, slug: true } },
  brand: { select: { name: true, slug: true } },
  vendor: { select: { name: true, slug: true, logoUrl: true } },
  images: { orderBy: { position: 'asc' }, select: { url: true, altText: true } },
  variants: {
    where: { isActive: true },
    orderBy: [{ isDefault: 'desc' }, { position: 'asc' }],
    include: { attributes: { include: { attributeValue: { include: { attribute: true } } } } },
  },
} satisfies Prisma.ProductInclude;

/** Public storefront catalog. */
@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(q: ProductQueryDto): Promise<Paginated<StorefrontProductCard>> {
    const categoryIds = q.category ? await this.categoryWithDescendants(q.category) : null;
    const where: Prisma.ProductWhereInput = {
      ...VISIBLE,
      ...(q.vendor ? { vendor: { status: 'APPROVED', slug: q.vendor } } : {}),
      ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
      ...(q.brand ? { brand: { slug: q.brand } } : {}),
      ...(q.featured ? { isFeatured: true } : {}),
      ...(q.q ? { name: { contains: q.q, mode: 'insensitive' as const } } : {}),
      ...(q.minPrice !== undefined || q.maxPrice !== undefined
        ? { basePrice: { gte: q.minPrice, lte: q.maxPrice } }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: cardInclude,
        orderBy: SORT[q.sort ?? 'newest'],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    const stock = await availableByVariant(
      this.prisma,
      rows.flatMap((p) => p.variants.map((v) => v.id)),
    );
    const cards: StorefrontProductCard[] = rows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      imageUrl: p.images[0]?.url ?? null,
      price: Number(p.basePrice),
      compareAtPrice: p.compareAtPrice === null ? null : Number(p.compareAtPrice),
      currency: p.currency,
      brandName: p.brand?.name ?? null,
      vendor: p.vendor,
      ratingAverage: Number(p.ratingAverage),
      ratingCount: p.ratingCount,
      inStock: p.variants.some((v) => (stock.get(v.id) ?? 0) > 0),
      hasOptions: p.variants.some((v) => v._count.attributes > 0),
    }));
    return paginate(cards, total, q.page, q.limit);
  }

  async getProduct(slug: string): Promise<StorefrontProductDetail> {
    const p = await this.prisma.product.findFirst({
      where: { ...VISIBLE, slug },
      include: detailInclude,
    });
    if (!p || p.variants.length === 0) throw new NotFoundException('Product not found');

    const stock = await availableByVariant(
      this.prisma,
      p.variants.map((v) => v.id),
    );

    const options = new Map<
      string,
      StorefrontOption & { position: number; valuePositions: Map<string, number> }
    >();
    const variants: StorefrontVariant[] = p.variants.map((v) => {
      const values: Record<string, string> = {};
      for (const { attributeValue: val } of v.attributes) {
        values[val.attributeId] = val.id;
        const option = options.get(val.attributeId) ?? {
          attributeId: val.attributeId,
          name: val.attribute.name,
          type: val.attribute.type,
          values: [],
          position: val.attribute.position,
          valuePositions: new Map<string, number>(),
        };
        if (!option.values.some((x) => x.id === val.id)) {
          option.values.push({ id: val.id, label: val.label ?? val.value, swatch: val.swatch });
          option.valuePositions.set(val.id, val.position);
        }
        options.set(val.attributeId, option);
      }
      return {
        id: v.id,
        sku: v.sku,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice === null ? null : Number(v.compareAtPrice),
        isDefault: v.isDefault,
        available: stock.get(v.id) ?? 0,
        values,
        label: v.name,
      };
    });

    const defaultVariant =
      variants.find((v) => v.isDefault && v.available > 0) ??
      variants.find((v) => v.available > 0) ??
      variants[0];

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      description: p.description,
      specifications: Array.isArray(p.specifications)
        ? (p.specifications as unknown as { label: string; value: string }[])
        : [],
      images: p.images,
      currency: p.currency,
      price: Number(p.basePrice),
      compareAtPrice: p.compareAtPrice === null ? null : Number(p.compareAtPrice),
      ratingAverage: Number(p.ratingAverage),
      ratingCount: p.ratingCount,
      category: p.category,
      brand: p.brand,
      vendor: p.vendor,
      options: [...options.values()]
        .sort((a, b) => a.position - b.position)
        .map(({ position: _p, valuePositions, ...o }) => ({
          ...o,
          values: [...o.values].sort(
            (a, b) => (valuePositions.get(a.id) ?? 0) - (valuePositions.get(b.id) ?? 0),
          ),
        })),
      variants,
      defaultVariantId: defaultVariant.id,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
    };
  }

  /** Active categories as a nested tree (any depth) for storefront navigation. */
  async categoryTree(): Promise<CategoryTreeNode[]> {
    const rows = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      select: { id: true, parentId: true, name: true, slug: true, imageUrl: true },
    });
    const build = (parentId: string | null): CategoryTreeNode[] =>
      rows
        .filter((r) => r.parentId === parentId)
        .map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          imageUrl: r.imageUrl,
          children: build(r.id),
        }));
    return build(null);
  }

  /** A category slug expands to itself + all active descendants, so "Electronics" includes "Smartphones". */
  private async categoryWithDescendants(slug: string): Promise<string[]> {
    const all = await this.prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, parentId: true, slug: true },
    });
    const root = all.find((c) => c.slug === slug);
    if (!root) return ['__none__'];
    const ids = [root.id];
    for (let i = 0; i < ids.length; i++) {
      for (const c of all) if (c.parentId === ids[i]) ids.push(c.id);
    }
    return ids;
  }
}
