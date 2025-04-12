// src/modules/carts/carts.controller.ts
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
import { CurrentUser } from 'src/auth/authAll';
import { CartsService } from './carts.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartsController {
    constructor(private readonly cartsService: CartsService) { }

    @Get()
    @ApiOperation({ summary: 'Get user cart' })
    @ApiResponse({
        status: 200,
        description: 'Returns the user\'s cart.',
    })
    findUserCart(@CurrentUser('id') userId: string) {
        return this.cartsService.findUserCart(userId);
    }

    @Post('items')
    @ApiOperation({ summary: 'Add item to cart' })
    @ApiResponse({
        status: 201,
        description: 'Item added to cart successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Product has insufficient stock.',
    })
    @ApiResponse({
        status: 404,
        description: 'Product not found or is inactive.',
    })
    addItem(
        @CurrentUser('id') userId: string,
        @Body() addCartItemDto: AddCartItemDto,
    ) {
        return this.cartsService.addItem(userId, addCartItemDto);
    }

    @Patch('items/:id')
    @ApiOperation({ summary: 'Update cart item quantity' })
    @ApiResponse({
        status: 200,
        description: 'Cart item updated successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Product has insufficient stock.',
    })
    @ApiResponse({
        status: 404,
        description: 'Cart item not found.',
    })
    updateItem(
        @CurrentUser('id') userId: string,
        @Param('id') cartItemId: string,
        @Body() updateCartItemDto: UpdateCartItemDto,
    ) {
        return this.cartsService.updateItem(userId, cartItemId, updateCartItemDto);
    }

    @Delete('items/:id')
    @ApiOperation({ summary: 'Remove item from cart' })
    @ApiResponse({
        status: 200,
        description: 'Cart item removed successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'Cart item not found.',
    })
    removeItem(
        @CurrentUser('id') userId: string,
        @Param('id') cartItemId: string,
    ) {
        return this.cartsService.removeItem(userId, cartItemId);
    }

    @Delete('clear')
    @ApiOperation({ summary: 'Clear cart' })
    @ApiResponse({
        status: 200,
        description: 'Cart cleared successfully.',
    })
    clearCart(@CurrentUser('id') userId: string) {
        return this.cartsService.clearCart(userId);
    }
}