# E-Commerce Backend API Endpoints

## Authentication & User Management

### Register User

**POST** `/api/v1/auth/users/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER", // Optional: "CUSTOMER" | "SELLER"
  "phoneNumber": "+1234567890" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "role": "CUSTOMER",
      "status": "ACTIVE",
      "emailVerified": false,
      "phoneNumber": "+1234567890",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here",
    "expiresIn": 86400,
    "emailVerificationRequired": true,
    "message": "User created successfully"
  },
  "message": "User registered successfully"
}
```

### Login User

**POST** `/api/v1/auth/users/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "rememberMe": false // Optional
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "role": "CUSTOMER",
      "status": "ACTIVE",
      "emailVerified": true,
      "phoneNumber": "+1234567890",
      "canLogin": true,
      "canSellProducts": false,
      "canAccessAdminPanel": false,
      "needsApproval": false
    },
    "token": "jwt_token_here",
    "expiresIn": 86400,
    "sellerProfile": {
      // Only if user is SELLER
      "id": "uuid",
      "businessName": "My Business",
      "isVerified": true,
      "canReceivePayouts": true,
      "hasCompleteProfile": true
    },
    "message": "Login successful"
  },
  "message": "Login successful"
}
```

### Logout User

**POST** `/api/v1/auth/users/logout`

**Request Body:** None

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Get User Profile

**GET** `/api/v1/auth/users/profile`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Get user profile endpoint - to be implemented",
    "userId": "uuid"
  }
}
```

### Update User Profile

**PUT** `/api/v1/auth/users/profile`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Request Body:**

```json
{
  "firstName": "John", // Optional
  "lastName": "Doe", // Optional
  "phoneNumber": "+1234567890" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Update user profile endpoint - to be implemented",
    "userId": "uuid",
    "requestBody": {}
  }
}
```

### Verify Email

**GET** `/api/v1/auth/users/verify-email/:token`

**URL Parameters:**

- `token`: Email verification token

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Email verification endpoint - to be implemented",
    "token": "verification_token"
  }
}
```

### Resend Email Verification

**POST** `/api/v1/auth/users/resend-verification`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Request Body:** None

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Resend email verification endpoint - to be implemented",
    "userId": "uuid"
  }
}
```

### Request Password Reset

**POST** `/api/v1/auth/users/request-password-reset`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Password reset request endpoint - to be implemented",
    "email": "user@example.com"
  }
}
```

### Reset Password

**POST** `/api/v1/auth/users/reset-password/:token`

**URL Parameters:**

- `token`: Password reset token

**Request Body:**

```json
{
  "password": "NewPassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Password reset endpoint - to be implemented",
    "token": "reset_token"
  }
}
```

---

## Product Management

### Get Product by ID or Slug

**GET** `/api/v1/products/:identifier`

**URL Parameters:**

- `identifier`: Product ID (UUID) or slug

**Query Parameters:**

- `increment_view`: Set to "true" to increment view count (optional)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "slug": "product-name",
    "description": "Product description",
    "shortDescription": "Short description",
    "sellerId": "seller_uuid",
    "categoryId": "category_uuid",
    "basePrice": 99.99,
    "discountPrice": 79.99,
    "currency": "USD",
    "stockQuantity": 100,
    "lowStockThreshold": 10,
    "sku": "PROD-001",
    "weight": 1.5,
    "dimensions": {
      "length": 10,
      "width": 5,
      "height": 3
    },
    "images": ["image1.jpg", "image2.jpg"],
    "tags": ["electronics", "gadget"],
    "metaTitle": "SEO Title",
    "metaDescription": "SEO Description",
    "status": "ACTIVE",
    "visibility": "PUBLIC",
    "viewCount": 150,
    "salesCount": 25,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Products with Filtering

**GET** `/api/v1/products`

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `category_id`: Filter by category ID
- `seller_id`: Filter by seller ID
- `min_price`: Minimum price filter
- `max_price`: Maximum price filter
- `status`: Filter by status (ACTIVE, INACTIVE, DRAFT)
- `visibility`: Filter by visibility (PUBLIC, PRIVATE, UNLISTED)
- `search`: Search in name and description
- `sort_by`: Sort field (name, price, created_at, view_count, sales_count)
- `sort_order`: Sort order (asc, desc)
- `tags`: Filter by tags (comma-separated)

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Product Name",
        "slug": "product-name",
        "description": "Product description",
        "sellerId": "seller_uuid",
        "categoryId": "category_uuid",
        "basePrice": 99.99,
        "discountPrice": 79.99,
        "currency": "USD",
        "stockQuantity": 100,
        "images": ["image1.jpg"],
        "status": "ACTIVE",
        "visibility": "PUBLIC",
        "viewCount": 150,
        "salesCount": 25,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### Create Product

**POST** `/api/v1/products`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Required Roles:** SELLER, ADMIN

**Request Body:**

```json
{
  "name": "Product Name",
  "description": "Detailed product description",
  "shortDescription": "Brief description", // Optional
  "categoryId": "category_uuid",
  "basePrice": 99.99,
  "discountPrice": 79.99, // Optional
  "currency": "USD", // Optional, defaults to USD
  "stockQuantity": 100,
  "lowStockThreshold": 10, // Optional
  "sku": "PROD-001", // Optional
  "weight": 1.5, // Optional
  "dimensions": {
    // Optional
    "length": 10,
    "width": 5,
    "height": 3
  },
  "images": ["image1.jpg", "image2.jpg"], // Optional
  "tags": ["electronics", "gadget"], // Optional
  "metaTitle": "SEO Title", // Optional
  "metaDescription": "SEO Description", // Optional
  "status": "ACTIVE", // Optional: ACTIVE, INACTIVE, DRAFT
  "visibility": "PUBLIC" // Optional: PUBLIC, PRIVATE, UNLISTED
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "slug": "product-name",
    "description": "Detailed product description",
    "sellerId": "seller_uuid",
    "categoryId": "category_uuid",
    "basePrice": 99.99,
    "discountPrice": 79.99,
    "currency": "USD",
    "stockQuantity": 100,
    "status": "ACTIVE",
    "visibility": "PUBLIC",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "message": "Product created successfully"
  }
}
```

### Update Product

**PUT** `/api/v1/products/:id`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Required Roles:** SELLER (own products), ADMIN (any product)

**URL Parameters:**

- `id`: Product ID (UUID)

**Request Body:** Same as Create Product (all fields optional)

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Product updated successfully",
    "productId": "uuid"
  }
}
```

### Delete Product

**DELETE** `/api/v1/products/:id`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Required Roles:** SELLER (own products), ADMIN (any product)

**URL Parameters:**

- `id`: Product ID (UUID)

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Product deleted successfully",
    "productId": "uuid"
  }
}
```

### Get Seller's Products

**GET** `/api/v1/seller/my-products`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Required Roles:** SELLER, ADMIN

**Query Parameters:** Same as Get Products endpoint

**Response:** Same format as Get Products endpoint

---

## Category Management

### Get All Categories

**GET** `/api/v1/categories`

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)
- `parent_id`: Filter by parent category ID
- `level`: Filter by category level (0 = root categories)
- `status`: Filter by status (ACTIVE, INACTIVE)
- `sort_by`: Sort field (name, level, created_at)
- `sort_order`: Sort order (asc, desc)

**Response:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Electronics",
        "slug": "electronics",
        "description": "Electronic products",
        "parentId": null,
        "level": 0,
        "status": "ACTIVE",
        "productCount": 150,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 25,
      "itemsPerPage": 50
    }
  }
}
```

### Get Category Tree

**GET** `/api/v1/categories/tree`

**Query Parameters:**

- `max_depth`: Maximum depth to retrieve (default: 3)
- `include_product_count`: Include product count (default: false)

**Response:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Electronics",
        "slug": "electronics",
        "description": "Electronic products",
        "level": 0,
        "status": "ACTIVE",
        "productCount": 150,
        "children": [
          {
            "id": "uuid",
            "name": "Smartphones",
            "slug": "smartphones",
            "level": 1,
            "status": "ACTIVE",
            "productCount": 75,
            "children": []
          }
        ]
      }
    ]
  }
}
```

### Get Category by ID

**GET** `/api/v1/categories/:id`

**URL Parameters:**

- `id`: Category ID (UUID)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic products",
    "parentId": null,
    "level": 0,
    "status": "ACTIVE",
    "productCount": 150,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Category

**POST** `/api/v1/categories`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Required Roles:** ADMIN

**Request Body:**

```json
{
  "name": "Category Name",
  "description": "Category description", // Optional
  "parentId": "parent_category_uuid", // Optional
  "status": "ACTIVE" // Optional: ACTIVE, INACTIVE
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Category Name",
    "slug": "category-name",
    "description": "Category description",
    "parentId": "parent_category_uuid",
    "level": 1,
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "message": "Category created successfully"
  }
}
```

### Update Category

**PUT** `/api/v1/categories/:id`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Required Roles:** ADMIN

**URL Parameters:**

- `id`: Category ID (UUID)

**Request Body:** Same as Create Category (all fields optional)

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Category updated successfully",
    "categoryId": "uuid"
  }
}
```

### Delete Category

**DELETE** `/api/v1/categories/:id`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Required Roles:** ADMIN

**URL Parameters:**

- `id`: Category ID (UUID)

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Category deleted successfully",
    "categoryId": "uuid"
  }
}
```

## Error Response Format

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": [] // Optional validation details
  }
}
```

## Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
