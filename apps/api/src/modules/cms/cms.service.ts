import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * CmsService — Pages, banners, menus, blog, FAQs.
 *
 * Scope responsibilities:
 *  - Block-based pages per locale
 *  - Scheduled banners by placement
 *  - Header/footer menus
 *  - Blog posts, categories, tags; FAQs
 */
@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'cms', status: 'scaffolded' };
  }
}
