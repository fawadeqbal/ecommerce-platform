import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * SettingsService — Store settings, currencies, languages, taxes.
 *
 * Scope responsibilities:
 *  - Key/value store settings (cached in Redis)
 *  - Currencies with exchange rates; languages
 *  - Tax rates; maintenance mode
 */
@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  status() {
    return { module: 'settings', status: 'scaffolded' };
  }
}
