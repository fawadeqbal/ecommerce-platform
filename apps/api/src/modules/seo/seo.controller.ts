import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SeoService } from './seo.service';

@ApiTags('SEO')
@ApiBearerAuth()
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('status')
  status() {
    return this.seoService.status();
  }
}
