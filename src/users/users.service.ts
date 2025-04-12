// src/modules/users/users.service.ts

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UpdatePasswordDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto, role: Role = Role.CUSTOMER) {
        const { email, password, firstName, lastName } = createUserDto;

        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        // Hash password
        const hashedPassword = await this.hashPassword(password);

        // Create new user
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role,
            },
        });

        // Create an empty cart for new user
        await this.prisma.cart.create({
            data: {
                userId: user.id,
            },
        });

        const { password: _, ...result } = user;
        return result;
    }

    async findAll() {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return users;
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        // Check if user exists
        await this.findOne(id);

        // Check if email is being updated and it's not already in use
        if (updateUserDto.email) {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    email: updateUserDto.email,
                    id: { not: id },
                },
            });

            if (existingUser) {
                throw new ConflictException('Email already in use');
            }
        }

        // Update user
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return updatedUser;
    }

    async remove(id: string) {
        // Check if user exists
        await this.findOne(id);

        // Delete user
        await this.prisma.user.delete({
            where: { id },
        });

        return { success: true, message: 'User deleted successfully' };
    }

    async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
        const { currentPassword, newPassword, confirmPassword } = updatePasswordDto;

        // Validate new password
        if (newPassword !== confirmPassword) {
            throw new BadRequestException('New password and confirm password do not match');
        }

        // Get user with password
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await this.hashPassword(newPassword);

        // Update password
        await this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });

        return { success: true, message: 'Password updated successfully' };
    }

    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }
}
