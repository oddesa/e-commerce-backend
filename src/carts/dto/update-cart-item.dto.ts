
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
    @ApiProperty({ example: 2 })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    quantity: number;
}