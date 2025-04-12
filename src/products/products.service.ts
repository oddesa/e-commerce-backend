// src/modules/products/products.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './productsAll';
@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(createProductDto: CreateProductDto) {
        // Check if category exists
        const category = await this.prisma.category.findUnique({
            where: { id: createProductDto.categoryId },
        });

        if (!category) {
            throw new BadRequestException(`Category with ID ${createProductDto.categoryId} not found`);
        }

        return this.prisma.product.create({
            data: createProductDto,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async findAll(query: ProductQueryDto) {
        const {
            search,
            categoryId,
            minPrice,
            maxPrice,
            active,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = query;

        // Create where clause for filtering
        const where: any = {};

        // Add search filter
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Add category filter
        if (categoryId) {
            where.categoryId = categoryId;
        }

        // Add price range filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) {
                where.price.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                where.price.lte = maxPrice;
            }
        }

        // Add active filter
        if (active !== undefined) {
            where.isActive = active;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Create sort order
        const orderBy = { [sortBy]: sortOrder };

        // Get products with pagination
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            this.prisma.product.count({ where }),
        ]);

        // Calculate pagination metadata
        const lastPage = Math.ceil(total / limit);

        return {
            data: products,
            meta: {
                total,
                page,
                limit,
                lastPage,
            },
        };
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto) {
        // Check if product exists
        await this.findOne(id);

        // Check if category exists if it's being updated
        if (updateProductDto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: updateProductDto.categoryId },
            });

            if (!category) {
                throw new BadRequestException(`Category with ID ${updateProductDto.categoryId} not found`);
            }
        }

        return this.prisma.product.update({
            where: { id },
            data: updateProductDto,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async remove(id: string) {
        // Check if product exists
        await this.findOne(id);

        await this.prisma.product.delete({
            where: { id },
        });

        return {
            success: true,
            message: 'Product deleted successfully',
        };
    }

    async updateStock(id: string, quantity: number) {
        const product = await this.findOne(id);

        if (product.stock + quantity < 0) {
            throw new BadRequestException('Insufficient stock');
        }

        return this.prisma.product.update({
            where: { id },
            data: {
                stock: {
                    increment: quantity,
                },
            },
        });
    }
}
