import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * SearchService — full-text search, filters, autocomplete.
 * Starts with ILIKE matching; upgrade to pg_trgm similarity + tsvector ranking
 * (extension enabled in docker/postgres/init.sql and schema.prisma).
 */
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  autocomplete(q: string, limit = 8) {
    if (!q || q.trim().length < 2) return [];
    return this.prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
        name: { contains: q.trim(), mode: 'insensitive' },
      },
      select: { id: true, name: true, slug: true, basePrice: true },
      orderBy: { soldCount: 'desc' },
      take: limit,
    });
  }
}
