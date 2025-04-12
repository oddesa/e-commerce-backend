
// src/modules/users/users.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdatePasswordDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({
        status: 201,
        description: 'The user has been successfully created.',
    })
    @ApiResponse({ status: 409, description: 'Email already in use.' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.ADMIN)
    @ApiBearerAuth()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a user by id' })
    @ApiResponse({
        status: 200,
        description: 'User found.',
    })
    @ApiResponse({ status: 404, description: 'User not found.' })
    // @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a user' })
    @ApiResponse({
        status: 200,
        description: 'User updated successfully.',
    })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiResponse({ status: 409, description: 'Email already in use.' })
    // @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user' })
    @ApiResponse({
        status: 200,
        description: 'User deleted successfully.',
    })
    @ApiResponse({ status: 404, description: 'User not found.' })
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.ADMIN)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @Patch(':id/password')
    @ApiOperation({ summary: 'Update user password' })
    @ApiResponse({
        status: 200,
        description: 'Password updated successfully.',
    })
    @ApiResponse({ status: 400, description: 'Invalid password data.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    // @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    updatePassword(
        @Param('id') id: string,
        @Body() updatePasswordDto: UpdatePasswordDto,
    ) {
        return this.usersService.updatePassword(id, updatePasswordDto);
    }
}