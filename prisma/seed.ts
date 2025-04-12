// prisma/seed.ts

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function main() {
    console.log('Starting seed...');

    // Create admin user
    const adminPassword = await hashPassword('Admin123!');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: Role.ADMIN,
        },
    });
    console.log(`Created admin user: ${admin.email}`);

    // Create staff user
    const staffPassword = await hashPassword('Staff123!');
    const staff = await prisma.user.upsert({
        where: { email: 'staff@example.com' },
        update: {},
        create: {
            email: 'staff@example.com',
            password: staffPassword,
            firstName: 'Staff',
            lastName: 'User',
            role: Role.STAFF,
        },
    });
    console.log(`Created staff user: ${staff.email}`);

    // Create customer user
    const customerPassword = await hashPassword('Customer123!');
    const customer = await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            email: 'customer@example.com',
            password: customerPassword,
            firstName: 'Customer',
            lastName: 'User',
            role: Role.CUSTOMER,
        },
    });
    console.log(`Created customer user: ${customer.email}`);

    // Create cart for users
    await prisma.cart.upsert({
        where: { userId: admin.id },
        update: {},
        create: { userId: admin.id },
    });

    await prisma.cart.upsert({
        where: { userId: staff.id },
        update: {},
        create: { userId: staff.id },
    });

    await prisma.cart.upsert({
        where: { userId: customer.id },
        update: {},
        create: { userId: customer.id },
    });

    // Create categories
    const electronics = await prisma.category.upsert({
        where: { name: 'Electronics' },
        update: {},
        create: {
            name: 'Electronics',
            description: 'Electronic devices and accessories',
        },
    });
    console.log(`Created category: ${electronics.name}`);

    const smartphones = await prisma.category.upsert({
        where: { name: 'Smartphones' },
        update: {},
        create: {
            name: 'Smartphones',
            description: 'Mobile phones and accessories',
            parentId: electronics.id,
        },
    });
    console.log(`Created category: ${smartphones.name}`);

    const laptops = await prisma.category.upsert({
        where: { name: 'Laptops' },
        update: {},
        create: {
            name: 'Laptops',
            description: 'Notebooks and laptops',
            parentId: electronics.id,
        },
    });
    console.log(`Created category: ${laptops.name}`);

    const clothing = await prisma.category.upsert({
        where: { name: 'Clothing' },
        update: {},
        create: {
            name: 'Clothing',
            description: 'Apparel and fashion items',
        },
    });
    console.log(`Created category: ${clothing.name}`);

    const menClothing = await prisma.category.upsert({
        where: { name: 'Men\'s Clothing' },
        update: {},
        create: {
            name: 'Men\'s Clothing',
            description: 'Clothing for men',
            parentId: clothing.id,
        },
    });
    console.log(`Created category: ${menClothing.name}`);

    const womenClothing = await prisma.category.upsert({
        where: { name: 'Women\'s Clothing' },
        update: {},
        create: {
            name: 'Women\'s Clothing',
            description: 'Clothing for women',
            parentId: clothing.id,
        },
    });
    console.log(`Created category: ${womenClothing.name}`);

    // Create products
    const products = [
        {
            name: 'Smartphone X Pro',
            description: 'The latest smartphone with advanced features',
            price: 999.99,
            stock: 50,
            categoryId: smartphones.id,
            images: ['smartphone1.jpg', 'smartphone2.jpg'],
        },
        {
            name: 'Laptop Ultra',
            description: 'Powerful laptop for professionals',
            price: 1499.99,
            stock: 30,
            categoryId: laptops.id,
            images: ['laptop1.jpg', 'laptop2.jpg'],
        },
        {
            name: 'Men\'s T-shirt',
            description: 'Comfortable cotton t-shirt for men',
            price: 29.99,
            stock: 100,
            categoryId: menClothing.id,
            images: ['tshirt1.jpg', 'tshirt2.jpg'],
        },
        {
            name: 'Women\'s Dress',
            description: 'Elegant dress for women',
            price: 79.99,
            stock: 75,
            categoryId: womenClothing.id,
            images: ['dress1.jpg', 'dress2.jpg'],
        },
        {
            name: 'Budget Smartphone',
            description: 'Affordable smartphone with good features',
            price: 299.99,
            stock: 80,
            categoryId: smartphones.id,
            images: ['budget-phone1.jpg', 'budget-phone2.jpg'],
        },
        {
            name: 'Gaming Laptop',
            description: 'High-performance laptop for gaming',
            price: 1999.99,
            stock: 20,
            categoryId: laptops.id,
            images: ['gaming-laptop1.jpg', 'gaming-laptop2.jpg'],
        },
    ];

    // for (const product of products) {
    //     const createdProduct = await prisma.product.upsert({
    //         where: { name: product.name },
    //         update: {},
    //         create: product,
    //     });
    //     console.log(`Created product: ${createdProduct.name}`);
    // }
    // for (const product of products) {
    //     const createdProduct = await prisma.product.upsert({
    //         where: {name: product.name},
    //         update: {},
    //         create: product,
    //     });
    //     console.log(`Created product: ${createdProduct.name}`);
    // }

    for (const product of products) {
        try {
            const createdProduct = await prisma.product.create({
                data: product,
            });
            console.log(`Created product: ${createdProduct.name}`);
        } catch (error) {
            console.log(`Failed to create product ${product.name}: ${error.message}`);
        }
    }

    // Create addresses for customer
    const customerAddress = await prisma.address.upsert({
        where: {
            id: 'customer-address-1', // This will likely create a new record as the ID won't match
        },
        update: {},
        create: {
            userId: customer.id,
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
            isDefault: true,
        },
    });
    console.log(`Created address for customer: ${customerAddress.id}`);

    console.log('Seed completed successfully');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });