// src/modules/categories/dto/create-category.dto.ts

import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Electronics' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Electronic devices and accessories' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 'parent-category-uuid' })
    @IsString()
    @IsOptional()
    parentId?: string;
}