import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'Password123!' })
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RefreshTokenDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}

// src/common/decorators/roles.decorator.ts

import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// src/common/decorators/current-user.decorator.ts

import { createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        return data ? user?.[data] : user;
    },
);

// src/modules/auth/auth.controller.ts

import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User successfully registered',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Email already in use',
    })
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User successfully logged in',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid credentials',
    })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh authentication token' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Token successfully refreshed',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid refresh token',
    })
    refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout user (invalidate current refresh token)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User successfully logged out',
    })
    logout(
        @CurrentUser('id') userId: string,
        @Body() refreshTokenDto: RefreshTokenDto,
    ) {
        return this.authService.logout(userId, refreshTokenDto.refreshToken);
    }

    @Post('logout-all')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout from all devices (invalidate all refresh tokens)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User successfully logged out from all devices',
    })
    logoutAll(@CurrentUser('id') userId: string) {
        return this.authService.logoutAll(userId);
    }
}

// src/modules/auth/auth.module.ts
