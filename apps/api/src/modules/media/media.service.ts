import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * MediaService — Uploads, image processing, storage.
 *
 * Scope responsibilities:
 *  - Signed upload URLs to S3-compatible storage
 *  - Image resizing / WebP/AVIF variants via media queue
 *  - Media library listing for admin and vendors
 */
@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'media', status: 'scaffolded' };
  }
}
