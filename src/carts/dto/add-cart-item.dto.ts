// src/modules/carts/dto/add-cart-item.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class AddCartItemDto {
    @ApiProperty({ example: 'product-uuid' })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    quantity: number;
}