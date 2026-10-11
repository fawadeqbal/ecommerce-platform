import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import type {
  AttributeDto,
  BrandDto,
  CategoryTreeNode,
  Paginated,
  StorefrontProductCard,
  StorefrontProductDetail,
} from '@ecommerce/types';
import { AttributesService } from './attributes/attributes.service';
import { BrandsService } from './brands/brands.service';
import { CatalogService } from './catalog.service';
import { ProductQueryDto } from './dto/product-query.dto';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly brandsService: BrandsService,
    private readonly attributesService: AttributesService,
  ) {}

  @Public()
  @Get('products')
  listProducts(@Query() query: ProductQueryDto): Promise<Paginated<StorefrontProductCard>> {
    return this.catalogService.listProducts(query);
  }

  @Public()
  @Get('products/:slug')
  getProduct(@Param('slug') slug: string): Promise<StorefrontProductDetail> {
    return this.catalogService.getProduct(slug);
  }

  @Public()
  @Get('categories')
  categories(): Promise<CategoryTreeNode[]> {
    return this.catalogService.categoryTree();
  }

  @Public()
  @Get('brands')
  brands(): Promise<BrandDto[]> {
    return this.brandsService.listActive();
  }

  @Public()
  @Get('attributes')
  attributes(): Promise<AttributeDto[]> {
    return this.attributesService.listFilterable();
  }

  /** Every attribute (used by the seller center variant builder). */
  @Public()
  @Get('attributes/all')
  allAttributes(): Promise<AttributeDto[]> {
    return this.attributesService.list();
  }
}
