// src/modules/categories/categories.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controllers';

@Module({
    imports: [PrismaModule],
    controllers: [CategoriesController],
    providers: [CategoriesService],
    exports: [CategoriesService],
})
export class CategoriesModule { }