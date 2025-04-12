// src/modules/users/dto/create-user.dto.ts

import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'Password123!' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @ApiPropertyOptional({ example: 'John' })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiPropertyOptional({ example: 'Doe' })
    @IsString()
    @IsOptional()
    lastName?: string;
}
// src/modules/users/dto/update-password.dto.ts

// import { IsNotEmpty, IsString, MinLength } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    newPassword: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    confirmPassword: string;
}