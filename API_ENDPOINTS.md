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
