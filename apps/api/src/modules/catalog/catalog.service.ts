import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@ecommerce/database';
import { paginate } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../prisma/prisma.service';
import type { ProductQueryDto, ProductSort } from './dto/product-query.dto';

const SORT: Record<ProductSort, Prisma.ProductOrderByWithRelationInput> = {
  newest: { publishedAt: 'desc' },
  price_asc: { basePrice: 'asc' },
  price_desc: { basePrice: 'desc' },
  popular: { soldCount: 'desc' },
  rating: { ratingAverage: 'desc' },
};

/**
 * CatalogService — products, variants, attributes, categories, brands.
 * TODO: product CRUD for vendors/admin, moderation (approve/reject), CSV import/export (imports queue),
 * attribute management, dynamic attribute filters, translations.
 */
@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(q: ProductQueryDto) {
    const where: Prisma.ProductWhereInput = {
      status: 'PUBLISHED',
      deletedAt: null,
      ...(q.category ? { category: { slug: q.category } } : {}),
      ...(q.brand ? { brand: { slug: q.brand } } : {}),
      ...(q.vendor ? { vendor: { slug: q.vendor } } : {}),
      ...(q.minPrice !== undefined || q.maxPrice !== undefined
        ? { basePrice: { gte: q.minPrice, lte: q.maxPrice } }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: SORT[q.sort ?? 'newest'],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        include: {
          images: { orderBy: { position: 'asc' }, take: 1 },
          vendor: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);
    return paginate(items, total, q.page, q.limit);
  }

  async getProduct(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: 'PUBLISHED', deletedAt: null },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
          include: {
            attributes: { include: { attributeValue: { include: { attribute: true } } } },
          },
        },
        category: true,
        brand: true,
        vendor: {
          select: { id: true, name: true, slug: true, logoUrl: true, ratingAverage: true },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  categoryTree() {
    return this.prisma.category.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { position: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
          include: { children: { where: { isActive: true }, orderBy: { position: 'asc' } } },
        },
      },
    });
  }

  brands() {
    return this.prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }
}
