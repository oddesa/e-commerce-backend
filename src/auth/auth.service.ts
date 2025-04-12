// src/modules/auth/auth.service.ts
import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto, RefreshTokenDto } from './authAll';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private prisma: PrismaService,
    ) { }

    async register(registerDto: RegisterDto) {
        const user = await this.usersService.create(registerDto);
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            user,
            ...tokens,
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user by email
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role);
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            ...tokens,
        };
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto) {
        const { refreshToken } = refreshTokenDto;

        // Find refresh token in database
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Check if token is expired
        if (tokenRecord.expiresAt < new Date()) {
            await this.prisma.refreshToken.delete({
                where: { id: tokenRecord.id },
            });
            throw new UnauthorizedException('Refresh token expired');
        }

        // Delete the used refresh token
        await this.prisma.refreshToken.delete({
            where: { id: tokenRecord.id },
        });

        // Generate new tokens
        const { user } = tokenRecord;
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // Return user and new tokens
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            ...tokens,
        };
    }

    async logout(userId: string, refreshToken: string) {
        await this.prisma.refreshToken.deleteMany({
            where: {
                userId,
                token: refreshToken,
            },
        });

        return { success: true, message: 'Logged out successfully' };
    }

    async logoutAll(userId: string) {
        await this.prisma.refreshToken.deleteMany({
            where: {
                userId,
            },
        });

        return { success: true, message: 'Logged out from all devices successfully' };
    }

    async validateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    private async generateTokens(userId: string, email: string, role: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(userId, email, role),
            this.generateRefreshToken(userId),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    private async generateAccessToken(userId: string, email: string, role: string): Promise<string> {
        const payload = {
            sub: userId,
            email,
            role,
        };

        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('jwt.secret'),
            expiresIn: this.configService.get<string>('jwt.accessTokenExpiration'),
        });
    }

    private async generateRefreshToken(userId: string): Promise<string> {
        const token = uuidv4();
        const expiresIn = this.configService.get<string>('jwt.refreshTokenExpiration', '7d');

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setMilliseconds(
            expiresAt.getMilliseconds() + this.parseDuration(expiresIn),
        );

        // Save refresh token to database
        await this.prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });

        return token;
    }

    private parseDuration(duration: string): number {
        const regex = /^(\d+)([smhd])$/;
        const match = duration.match(regex);

        if (!match) {
            return 7 * 24 * 60 * 60 * 1000; // Default to 7 days
        }

        const value = parseInt(match[1], 10);
        const unit = match[2];

        switch (unit) {
            case 's':
                return value * 1000; // seconds to milliseconds
            case 'm':
                return value * 60 * 1000; // minutes to milliseconds
            case 'h':
                return value * 60 * 60 * 1000; // hours to milliseconds
            case 'd':
                return value * 24 * 60 * 60 * 1000; // days to milliseconds
            default:
                return 7 * 24 * 60 * 60 * 1000; // Default to 7 days
        }
    }
}
