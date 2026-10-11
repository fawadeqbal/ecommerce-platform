import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * ReviewsService — Ratings, reviews, moderation, Q&A.
 *
 * Scope responsibilities:
 *  - Verified-purchase reviews with photos
 *  - Moderation queue; vendor replies
 *  - Product Q&A with vendor answers
 *  - Maintain Product.ratingAverage / ratingCount
 */
@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'reviews', status: 'scaffolded' };
  }
}
