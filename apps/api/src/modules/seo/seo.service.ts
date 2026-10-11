import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * SeoService — Sitemaps, meta, redirects, structured data.
 *
 * Scope responsibilities:
 *  - Sitemap data endpoint for the storefront
 *  - 301 redirect manager
 *  - Structured data helpers (Product, Breadcrumb, Review, Organization)
 */
@Injectable()
export class SeoService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'seo', status: 'scaffolded' };
  }
}
