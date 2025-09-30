# E-Commerce Backend API Documentation

## Base URL

```
http://localhost:5000
```

## Common Headers

```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

## Standard Response Format

### Success Response

```typescript
interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: true;
}
```

### Error Response

```typescript
interface ApiError {
  statusCode: number;
  message: string;
  errors: any[];
  success: false;
}
```

---

## 🏠 Homepage APIs

### Get Homepage Data

Retrieves categories and featured products for homepage display.

**Endpoint:** `GET /api/homepage`

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Parameters:** None

**Response Type:**

```typescript
interface HomepageResponse {
  statusCode: 200;
  data: {
    categories: CategoryDto[];
    featuredProducts: ProductDto[];
  };
  message: "Homepage data retrieved successfully";
  success: true;
}

interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  level: number;
  sortOrder: number;
}

interface ProductDto {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: string; // Decimal as string
  comparePrice: string | null; // Decimal as string
  primaryImage: string | null;
  averageRating: string; // Decimal as string
  reviewCount: number;
  hasDiscount: boolean;
  discountPercentage: number;
  isAvailable: boolean;
}
```

**Example Request:**

```bash
curl -X GET http://localhost:5000/api/homepage \
  -H "Content-Type: application/json"
```

**Example Response:**

```json
{
  "statusCode": 200,
  "data": {
    "categories": [
      {
        "id": "942682d2-d260-48f5-8f3d-988899c94ad6",
        "name": "Electronics",
        "slug": "electronics",
        "description": "Latest electronic devices and gadgets",
        "imageUrl": null,
        "level": 0,
        "sortOrder": 0
      }
    ],
    "featuredProducts": [
      {
        "id": "7cb4608c-9c14-4cf6-8d23-f52e937770c0",
        "name": "iPhone 15 Pro",
        "slug": "iphone-15-pro",
        "shortDescription": "Premium smartphone with cutting-edge technology",
        "price": "999.99",
        "comparePrice": "1099.99",
        "primaryImage": "https://example.com/iphone15pro-1.jpg",
        "averageRating": "0.00",
        "reviewCount": 0,
        "hasDiscount": false,
        "discountPercentage": 0,
        "isAvailable": true
      }
    ]
  },
  "message": "Homepage data retrieved successfully",
  "success": true
}
```

**Error Responses:**

- `500` - Internal server error
- `503` - Database connection error

---

## 🔐 Authentication APIs

### User Signup

Register a new user account.

**Endpoint:** `POST /api/auth/signup`

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Parameters:**

- `email` (string, required) - Valid email address
- `password` (string, required) - Password (min 8 chars, must contain uppercase, lowercase, and number)
- `firstName` (string, required) - First name (min 2 characters)
- `lastName` (string, required) - Last name (min 2 characters)
- `phone` (string, optional) - Phone number
- `role` (string, optional) - User role: "customer", "seller", "admin" (defaults to "customer")

**Request Body:**

```typescript
interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: "customer" | "seller" | "admin";
}
```

**Response Type:**

```typescript
interface SignupResponse {
  statusCode: 201;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: "customer" | "seller" | "admin";
    status: "pending" | "approved" | "rejected" | "suspended";
    emailVerified: boolean;
    createdAt: string; // ISO date string
  };
  message: "User created successfully";
  success: true;
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "customer"
  }'
```

**Example Response:**

```json
{
  "statusCode": 201,
  "data": {
    "id": "778da7f0-f634-445d-aa6d-b83228ad8ea4",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "customer",
    "status": "approved",
    "emailVerified": false,
    "createdAt": "2025-09-29T17:39:56.794Z"
  },
  "message": "User created successfully",
  "success": true
}
```

**Error Responses:**

- `400` - Validation error (invalid email, weak password, etc.)
- `409` - Email already exists
- `500` - Internal server error

**Validation Rules:**

- **Email**: Must be valid email format
- **Password**: Minimum 8 characters, must contain:
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one number
- **First Name**: Minimum 2 characters
- **Last Name**: Minimum 2 characters
- **Phone**: Optional, must be valid phone format if provided
- **Role**: Must be one of: "customer", "seller", "admin"

### User Signin

Authenticate an existing user and sign them in.

**Endpoint:** `POST /api/auth/signin`

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Parameters:**

- `email` (string, required) - Valid email address
- `password` (string, required) - User's password

**Request Body:**

```typescript
interface SigninRequest {
  email: string;
  password: string;
}
```

**Response Type:**

```typescript
interface SigninResponse {
  statusCode: 200;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: "customer" | "seller" | "admin";
    status: "pending" | "approved" | "rejected" | "suspended";
    emailVerified: boolean;
    createdAt: string; // ISO date string
    token?: string; // JWT token (future implementation)
  };
  message: "User signed in successfully";
  success: true;
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123"
  }'
```

**Example Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": "778da7f0-f634-445d-aa6d-b83228ad8ea4",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "customer",
    "status": "approved",
    "emailVerified": false,
    "createdAt": "2025-09-29T17:39:56.794Z"
  },
  "message": "User signed in successfully",
  "success": true
}
```

**Error Responses:**

- `400` - Validation error (invalid email format, missing fields)
- `401` - Invalid email or password
- `403` - Account not active (suspended, pending, etc.)
- `500` - Internal server error

**Validation Rules:**

- **Email**: Must be valid email format
- **Password**: Required field

### User Logout

Log out an authenticated user and end their session.

**Endpoint:** `POST /api/auth/logout`

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Parameters:**

- `userId` (string, optional) - User ID (can be extracted from token/session in future)

**Request Body:**

```typescript
interface LogoutRequest {
  userId?: string;
}
```

**Response Type:**

```typescript
interface LogoutResponse {
  statusCode: 200;
  data: {
    success: boolean;
    message: string;
    loggedOutAt: string; // ISO date string
  };
  message: "User logged out successfully";
  success: true;
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "778da7f0-f634-445d-aa6d-b83228ad8ea4"
  }'
```

**Example Response:**

```json
{
  "statusCode": 200,
  "data": {
    "success": true,
    "message": "User logged out successfully",
    "loggedOutAt": "2025-09-29T18:30:00.000Z"
  },
  "message": "User logged out successfully",
  "success": true
}
```

**Error Responses:**

- `400` - Validation error (invalid request format)
- `500` - Internal server error

**Notes:**

- Currently performs basic logout logging
- Future implementation will include JWT token invalidation
- No authentication required in current version (will be added with JWT)

---

## 🛒 Cart APIs

### Add to Cart

Add a product to the user's shopping cart.

**Endpoint:** `POST /api/cart/add`

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Parameters:**

- `userId` (string, required) - User ID (will be extracted from JWT token in future)
- `productId` (string, required) - Product ID to add to cart
- `quantity` (number, required) - Quantity of the product (must be greater than 0)

**Request Body:**

```typescript
interface AddToCartRequest {
  userId: string;
  productId: string;
  quantity: number;
}
```

**Response Type:**

```typescript
interface AddToCartResponse {
  statusCode: 201;
  data: {
    success: boolean;
    message: string;
    cartItemId: string;
    productId: string;
    quantity: number;
    addedAt: string; // ISO date string
  };
  message: "Product added to cart successfully";
  success: true;
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "productId": "product-456",
    "quantity": 2
  }'
```

**Example Response:**

```json
{
  "statusCode": 201,
  "data": {
    "success": true,
    "message": "Product added to cart successfully",
    "cartItemId": "cart-item-uuid",
    "productId": "product-456",
    "quantity": 2,
    "addedAt": "2025-09-29T18:30:00.000Z"
  },
  "message": "Product added to cart successfully",
  "success": true
}
```

**Error Responses:**

- `400` - Validation error (missing fields, invalid quantity)
- `500` - Internal server error

**Validation Rules:**

- **User ID**: Required field
- **Product ID**: Required field
- **Quantity**: Must be greater than 0 and a whole number

### Get Cart

Retrieve all items in the user's shopping cart.

**Endpoint:** `GET /api/cart/`

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Parameters:**

- `userId` (string, optional) - User ID as query parameter (will be extracted from JWT token in future)

**Response Type:**

```typescript
interface GetCartResponse {
  statusCode: 200;
  data: {
    userId: string;
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
    updatedAt: string; // ISO date string
  };
  message: "Cart retrieved successfully";
  success: true;
}

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  addedAt: string; // ISO date string
}
```

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/cart/?userId=user-123" \
  -H "Content-Type: application/json"
```

**Example Response:**

```json
{
  "statusCode": 200,
  "data": {
    "userId": "user-123",
    "items": [],
    "totalItems": 0,
    "totalAmount": 0,
    "updatedAt": "2025-09-29T18:30:00.000Z"
  },
  "message": "Cart retrieved successfully",
  "success": true
}
```

**Error Responses:**

- `400` - Validation error (missing user ID)
- `500` - Internal server error

**Notes:**

- Currently returns empty cart (no database integration yet)
- Future implementation will include actual cart data from database
- User authentication will be handled via JWT tokens

---

## 🔧 Health Check APIs

### Server Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Headers:** None required

**Parameters:** None

**Response Type:**

```typescript
interface HealthResponse {
  status: "OK";
  timestamp: string; // ISO date string
  service: "e-commerce-backend";
}
```

**Example Response:**

```json
{
  "status": "OK",
  "timestamp": "2025-09-29T16:57:40.689Z",
  "service": "e-commerce-backend"
}
```

### Database Health Check

Check database connection status.

**Endpoint:** `GET /health/db`

**Headers:** None required

**Parameters:** None

**Response Type:**

```typescript
interface DatabaseHealthResponse {
  status: "OK" | "ERROR";
  database: "PostgreSQL";
  connection: string;
  timestamp: string; // ISO date string
}
```

**Example Response:**

```json
{
  "status": "OK",
  "database": "PostgreSQL",
  "connection": "PostgreSQL Database Service - Pool size: 5/10",
  "timestamp": "2025-09-29T16:57:40.689Z"
}
```

---

## 🚀 Future API Additions

When adding new APIs, please follow this format:

### API Name

Brief description of what the API does.

**Endpoint:** `METHOD /api/path`

**Headers:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>" // if auth required
}
```

**Parameters:**

- `param1` (string, required) - Description
- `param2` (number, optional) - Description

**Request Body:** (if applicable)

```typescript
interface RequestBody {
  field1: string;
  field2: number;
}
```

**Response Type:**

```typescript
interface ResponseType {
  // Define response structure
}
```

**Example Request:**

```bash
curl -X METHOD http://localhost:5000/api/path \
  -H "Content-Type: application/json" \
  -d '{"field1": "value"}'
```

**Example Response:**

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success message",
  "success": true
}
```

**Error Responses:**

- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Internal server error

---

## 📋 Status Codes

| Code | Description                                     |
| ---- | ----------------------------------------------- |
| 200  | OK - Request successful                         |
| 201  | Created - Resource created successfully         |
| 400  | Bad Request - Invalid request parameters        |
| 401  | Unauthorized - Authentication required          |
| 403  | Forbidden - Access denied                       |
| 404  | Not Found - Resource not found                  |
| 409  | Conflict - Resource already exists              |
| 422  | Unprocessable Entity - Validation error         |
| 500  | Internal Server Error - Server error            |
| 503  | Service Unavailable - Database connection error |

---

## 🔄 Changelog

### v1.0.0 (Current)

- ✅ Homepage API (`GET /api/homepage`)
- ✅ User Signup API (`POST /api/auth/signup`)
- ✅ User Signin API (`POST /api/auth/signin`)
- ✅ User Logout API (`POST /api/auth/logout`)
- ✅ Add to Cart API (`POST /api/cart/add`)
- ✅ Get Cart API (`GET /api/cart/`)
- ✅ Health check APIs (`GET /health`, `GET /health/db`)
- ✅ Standard response format
- ✅ TypeScript type definitions
- ✅ Input validation and error handling
- ✅ Password hashing and security
- ✅ CORS configuration for frontend integration

### Future Versions

- 🔄 JWT Token Authentication
- 🔄 Password Reset APIs
- 🔄 Email Verification APIs
- 🔄 Product catalog APIs
- 🔄 User management APIs
- 🔄 Order management APIs
- 🔄 Cart database integration

---

_Last updated: September 29, 2025_
_API Version: 1.0.0_
_Backend Version: 1.0.0_
