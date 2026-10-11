import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { DiscoveryService } from './discovery.service';
import { AdminAttributesController } from './attributes/admin-attributes.controller';
import { AttributesService } from './attributes/attributes.service';
import { AdminBrandsController } from './brands/admin-brands.controller';
import { BrandsService } from './brands/brands.service';
import { AdminCategoriesController } from './categories/admin-categories.controller';
import { CategoriesService } from './categories/categories.service';
import { AdminProductsController } from './products/admin-products.controller';
import { ProductsService } from './products/products.service';
import { VendorProductsController } from './products/vendor-products.controller';

@Module({
  imports: [NotificationsModule],
  controllers: [
    CatalogController,
    AdminCategoriesController,
    AdminBrandsController,
    AdminAttributesController,
    VendorProductsController,
    AdminProductsController,
  ],
  providers: [
    CatalogService,
    CategoriesService,
    BrandsService,
    AttributesService,
    ProductsService,
    DiscoveryService,
  ],
  exports: [CatalogService, CategoriesService, BrandsService, AttributesService, ProductsService],
})
export class CatalogModule {}
