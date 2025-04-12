// src/modules/categories/categories.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/all.guards';
import { Roles } from 'src/auth/authAll';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new category' })
    @ApiResponse({
        status: 201,
        description: 'The category has been successfully created.',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request.',
    })
    @ApiResponse({
        status: 409,
        description: 'Category with the same name already exists.',
    })
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all categories' })
    findAll() {
        return this.categoriesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a category by id' })
    @ApiResponse({
        status: 200,
        description: 'Category found.',
    })
    @ApiResponse({
        status: 404,
        description: 'Category not found.',
    })
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a category' })
    @ApiResponse({
        status: 200,
        description: 'Category updated successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request.',
    })
    @ApiResponse({
        status: 404,
        description: 'Category not found.',
    })
    @ApiResponse({
        status: 409,
        description: 'Category name already in use.',
    })
    update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a category' })
    @ApiResponse({
        status: 200,
        description: 'Category deleted successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Category has associated products or child categories.',
    })
    @ApiResponse({
        status: 404,
        description: 'Category not found.',
    })
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(id);
    }
}