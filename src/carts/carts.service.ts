// src/modules/carts/carts.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartsService {
    constructor(private prisma: PrismaService) { }

    async findUserCart(userId: string) {
        // Find user cart or create if it doesn't exist
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                stock: true,
                                images: true,
                            },
                        },
                    },
                },
            },
        });

        // If cart doesn't exist, create a new one
        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true,
                                    stock: true,
                                    images: true,
                                },
                            },
                        },
                    },
                },
            });
        }

        // Calculate cart totals
        const subtotal = cart.items.reduce(
            (sum, item) => sum + Number(item.product.price) * item.quantity,
            0,
        );

        return {
            ...cart,
            subtotal,
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        };
    }

    async addItem(userId: string, addCartItemDto: AddCartItemDto) {
        const { productId, quantity } = addCartItemDto;

        // Check if product exists and is active
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                isActive: true,
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found or is inactive`);
        }

        // Check if product has enough stock
        if (product.stock < quantity) {
            throw new BadRequestException(`Product has insufficient stock. Available: ${product.stock}`);
        }

        // Get cart or create if it doesn't exist
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
            });
        }

        // Check if item already exists in cart
        const existingCartItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
        });

        if (existingCartItem) {
            // Update existing item quantity
            const newQuantity = existingCartItem.quantity + quantity;

            // Check if new quantity exceeds stock
            if (newQuantity > product.stock) {
                throw new BadRequestException(`Cannot add ${quantity} more items. Max available: ${product.stock - existingCartItem.quantity}`);
            }

            await this.prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: newQuantity },
            });
        } else {
            // Add new item to cart
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
            });
        }

        // Return updated cart
        return this.findUserCart(userId);
    }

    async updateItem(userId: string, cartItemId: string, updateCartItemDto: UpdateCartItemDto) {
        const { quantity } = updateCartItemDto;

        // Find cart
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: { items: true },
        });

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        // Find cart item
        const cartItem = await this.prisma.cartItem.findFirst({
            where: {
                id: cartItemId,
                cartId: cart.id,
            },
            include: {
                product: true,
            },
        });

        if (!cartItem) {
            throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
        }

        // Check if product has enough stock
        if (cartItem.product.stock < quantity) {
            throw new BadRequestException(`Product has insufficient stock. Available: ${cartItem.product.stock}`);
        }

        // Update cart item
        await this.prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
        });

        // Return updated cart
        return this.findUserCart(userId);
    }

    async removeItem(userId: string, cartItemId: string) {
        // Find cart
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: { items: true },
        });

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        // Find cart item
        const cartItem = cart.items.find(item => item.id === cartItemId);
        if (!cartItem) {
            throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
        }

        // Remove item from cart
        await this.prisma.cartItem.delete({
            where: { id: cartItemId },
        });

        // Return updated cart
        return this.findUserCart(userId);
    }

    async clearCart(userId: string) {
        // Find cart
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        // Remove all items from cart
        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        // Return empty cart
        return this.findUserCart(userId);
    }
}
