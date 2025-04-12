// src/modules/products/products.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductsController } from './productsAll';
import { ProductsService } from './products.service';

@Module({
    imports: [PrismaModule],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService],
})
export class ProductsModule { }