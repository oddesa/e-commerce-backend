// src/modules/products/dto/create-product.dto.ts

import { IsNotEmpty, IsString, IsNumber, IsOptional, IsPositive, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @ApiProperty({ example: 'Smartphone X Pro' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Latest smartphone with advanced features' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 999.99 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Type(() => Number)
    price: number;

    @ApiProperty({ example: 100 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    stock: number;

    @ApiProperty({ example: 'category-uuid' })
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @ApiPropertyOptional({ example: ['image1.jpg', 'image2.jpg'] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];
}

// src/modules/products/dto/update-product.dto.ts

import { PartialType } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) { }

// src/modules/products/dto/product-query.dto.ts

import { IsBoolean, Max } from 'class-validator';

export class ProductQueryDto {
    @ApiPropertyOptional({ example: 'smartphone' })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ example: 'category-uuid' })
    @IsString()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional({ example: 10.00 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    minPrice?: number;

    @ApiPropertyOptional({ example: 1000.00 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    maxPrice?: number;

    @ApiPropertyOptional({ default: 1 })
    @IsNumber()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({ default: 10 })
    @IsNumber()
    @Min(1)
    @Max(100)
    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;

    @ApiPropertyOptional({ example: 'price' })
    @IsString()
    @IsOptional()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({ example: 'asc' })
    @IsString()
    @IsOptional()
    sortOrder?: 'asc' | 'desc' = 'desc';

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    active?: boolean;
}

// src/modules/products/products.controller.ts

import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Roles } from 'src/auth/authAll';
import { ProductsService } from './products.service';
import { RolesGuard } from 'src/auth/guards/all.guards';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new product' })
    @ApiResponse({
        status: 201,
        description: 'The product has been successfully created.',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request.',
    })
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products with filtering and pagination' })
    findAll(@Query() query: ProductQueryDto) {
        return this.productsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by id' })
    @ApiResponse({
        status: 200,
        description: 'Product found.',
    })
    @ApiResponse({
        status: 404,
        description: 'Product not found.',
    })
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a product' })
    @ApiResponse({
        status: 200,
        description: 'Product updated successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'Product not found.',
    })
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a product' })
    @ApiResponse({
        status: 200,
        description: 'Product deleted successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'Product not found.',
    })
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }
}