# E-commerce Backend API

A modular NestJS backend API for e-commerce applications using Prisma ORM and PostgreSQL created 90% using AI. Save it here for learning purpose.

## Tech Stack

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications
- **Prisma**: Next-generation ORM for Node.js and TypeScript
- **PostgreSQL**: Powerful, open-source object-relational database system
- **TypeScript**: Typed superset of JavaScript
- **JWT**: JSON Web Tokens for authentication
- **Swagger**: API documentation
- **Docker**: Containerization for development and deployment

## Project Structure

The project follows a modular architecture with a clean separation of concerns:

```
e-commerce-backend/
├── src/
│   ├── app.module.ts           # Root module
│   ├── main.ts                 # Entry point
│   ├── common/                 # Shared code
│   │   ├── decorators/         # Custom decorators
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Custom guards
│   │   ├── interceptors/       # Custom interceptors
│   │   ├── pipes/              # Custom pipes
│   │   ├── dto/                # Shared DTOs
│   │   └── utils/              # Utility functions
│   ├── config/                 # Configuration
│   │   ├── app.config.ts       # App configuration
│   │   ├── database.config.ts  # Database configuration
│   │   └── jwt.config.ts       # JWT configuration
│   ├── modules/                # Feature modules
│   │   ├── auth/               # Authentication module
│   │   ├── users/              # Users module
│   │   ├── products/           # Products module
│   │   ├── categories/         # Categories module
│   │   ├── carts/              # Cart module
│   │   ├── orders/             # Orders module
│   │   ├── addresses/          # Addresses module
│   │   └── reviews/            # Reviews module
│   └── prisma/                 # Prisma service
│       └── prisma.service.ts
├── prisma/
│   └── schema.prisma           # Prisma schema
├── .env                        # Environment variables
├── docker-compose.yml          # Docker Compose configuration
├── package.json                # Project dependencies
└── tsconfig.json               # TypeScript configuration
```

## Features

- **Authentication**: JWT-based authentication with refresh tokens
- **User Management**: CRUD operations for users with role-based access control
- **Product Management**: CRUD operations for products with filtering, sorting, and pagination
- **Category Management**: CRUD operations for hierarchical product categories
- **Cart Management**: Add, update, remove items from cart
- **Order Management**: Create, update, cancel orders with payment processing
- **Address Management**: CRUD operations for user addresses
- **Review System**: Product reviews and ratings
- **API Documentation**: Swagger UI

### Prerequisites

- Node.js (v16+)
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd e-commerce-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory with the following content:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce?schema=public"
JWT_SECRET="your-secret-key-here"
PORT=3000
NODE_ENV=development
```

4. Start PostgreSQL with Docker:

```bash
docker-compose up -d
```

5. Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

6. Start the development server:

```bash
npm run start:dev
```

7. Access the API documentation at:

```
http://localhost:3000/docs
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh auth token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/logout-all` - Logout from all devices

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)
- `PATCH /api/users/:id/password` - Update user password

### Products
- `POST /api/products` - Create product (admin/staff only)
- `GET /api/products` - Get all products with filtering and pagination
- `GET /api/products/:id` - Get product by ID
- `PATCH /api/products/:id` - Update product (admin/staff only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories
- `POST /api/categories` - Create category (admin/staff only)
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `PATCH /api/categories/:id` - Update category (admin/staff only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PATCH /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders (To be implemented)
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Cancel order

### Addresses (To be implemented)
- `POST /api/addresses` - Create address
- `GET /api/addresses` - Get user addresses
- `GET /api/addresses/:id` - Get address by ID
- `PATCH /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address
- `PATCH /api/addresses/:id/default` - Set address as default

### Reviews (To be implemented)
- `POST /api/reviews` - Create review
- `GET /api/products/:id/reviews` - Get product reviews
- `GET /api/reviews/:id` - Get review by ID
- `PATCH /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## Data Models

The core entities in the system are:

- **User**: Stores user information, authentication details, and role
- **Product**: Stores product details, pricing, inventory, and categorization
- **Category**: Organizes products in a hierarchical structure
- **Cart & CartItem**: Manages user shopping carts
- **Order & OrderItem**: Tracks user orders and purchased items
- **Address**: Manages user shipping addresses
- **Review**: Stores product reviews and ratings

## Code Organization

Each feature module is organized with the following structure:

- **controller.ts**: Handles HTTP requests and route definitions
- **service.ts**: Contains business logic and database operations
- **dto/**: Data Transfer Objects for validation and documentation
- **entities/**: Entity definitions and relationships
- **module.ts**: Module definitions and dependency injection

## Authorization and Security

The API implements role-based access control with three user roles:

- **ADMIN**: Full access to all resources
- **STAFF**: Access to manage products, categories, and limited order operations
- **CUSTOMER**: Regular user with access to their own data and public resources

## Future Enhancements

- Implement payment gateway integration
- Add product inventory management
- Implement order fulfillment workflow
- Add email notifications
- Implement product search with Elasticsearch
- Create dashboard for admin/staff
- Add analytics and reporting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
