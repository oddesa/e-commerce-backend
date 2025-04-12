// src/modules/categories/categories.service.ts

import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(createCategoryDto: CreateCategoryDto) {
        const { name, description, parentId } = createCategoryDto;

        // Check if category with the same name already exists
        const existingCategory = await this.prisma.category.findUnique({
            where: { name },
        });

        if (existingCategory) {
            throw new ConflictException(`Category with name '${name}' already exists`);
        }

        // If parentId is provided, check if parent category exists
        if (parentId) {
            const parentCategory = await this.prisma.category.findUnique({
                where: { id: parentId },
            });

            if (!parentCategory) {
                throw new BadRequestException(`Parent category with ID ${parentId} not found`);
            }
        }

        // Create new category
        return this.prisma.category.create({
            data: {
                name,
                description,
                parentId,
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async findAll() {
        return this.prisma.category.findMany({
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                        _count: {
                            select: {
                                products: true,
                            },
                        },
                    },
                },
                products: {
                    take: 10,
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        images: true,
                    },
                },
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto) {
        const { name, description, parentId } = updateCategoryDto;

        // Check if category exists
        await this.findOne(id);

        // Check if name is being updated and it's not already in use
        if (name) {
            const existingCategory = await this.prisma.category.findFirst({
                where: {
                    name,
                    id: { not: id },
                },
            });

            if (existingCategory) {
                throw new ConflictException(`Category with name '${name}' already exists`);
            }
        }

        // If parentId is provided, check if parent category exists
        if (parentId) {
            // Prevent circular references - can't set a child as its own parent
            if (parentId === id) {
                throw new BadRequestException('A category cannot be its own parent');
            }

            // Check if the parent exists
            const parentCategory = await this.prisma.category.findUnique({
                where: { id: parentId },
            });

            if (!parentCategory) {
                throw new BadRequestException(`Parent category with ID ${parentId} not found`);
            }

            // Check for deeper circular references (e.g., setting a grandchild as parent)
            const isCircular = await this.checkForCircularReference(id, parentId);
            if (isCircular) {
                throw new BadRequestException('Circular category reference detected');
            }
        }

        // Update category
        return this.prisma.category.update({
            where: { id },
            data: {
                name,
                description,
                parentId,
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async remove(id: string) {
        // Check if category exists
        await this.findOne(id);

        // Check if category has products
        const categoryProducts = await this.prisma.product.findFirst({
            where: { categoryId: id },
        });

        if (categoryProducts) {
            throw new BadRequestException('Cannot delete category with associated products');
        }

        // Check if category has children
        const categoryChildren = await this.prisma.category.findFirst({
            where: { parentId: id },
        });

        if (categoryChildren) {
            throw new BadRequestException('Cannot delete category with child categories');
        }

        // Delete category
        await this.prisma.category.delete({
            where: { id },
        });

        return {
            success: true,
            message: 'Category deleted successfully',
        };
    }

    private async checkForCircularReference(categoryId: string, potentialParentId: string): Promise<boolean> {
        // Start from the potential parent and traverse up the tree
        let currentId = potentialParentId;

        // Set to track visited nodes to avoid infinite loops
        const visited = new Set<string>();

        while (currentId) {
            // If we see the original category in the parent chain, it's circular
            if (currentId === categoryId) {
                return true;
            }

            // If we've seen this node before, there's a loop (but not involving our target)
            if (visited.has(currentId)) {
                break;
            }

            visited.add(currentId);

            // Get the parent of the current node
            const current = await this.prisma.category.findUnique({
                where: { id: currentId },
                select: { parentId: true },
            });

            // If no parent, we've reached the top of the tree
            if (!current || !current.parentId) {
                break;
            }

            // Move up to the parent
            currentId = current.parentId;
        }

        return false;
    }
}