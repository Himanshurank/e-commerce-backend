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

## 📝 Frontend Integration Guide

### TypeScript Types

Copy these types to your frontend project:

```typescript
// API Response Types
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: true;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors: any[];
  success: false;
}

// Homepage Types
export interface HomepageData {
  categories: CategoryDto[];
  featuredProducts: ProductDto[];
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  level: number;
  sortOrder: number;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: string;
  comparePrice: string | null;
  primaryImage: string | null;
  averageRating: string;
  reviewCount: number;
  hasDiscount: boolean;
  discountPercentage: number;
  isAvailable: boolean;
}
```

### Example Frontend Usage

#### React/Next.js Example

```typescript
import { ApiResponse, HomepageData } from "./types/api";

export async function getHomepageData(): Promise<HomepageData> {
  const response = await fetch("http://localhost:5000/api/homepage", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse<HomepageData> = await response.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

// Usage in component
const HomePage = () => {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHomepageData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h1>Categories</h1>
      {data.categories.map((category) => (
        <div key={category.id}>{category.name}</div>
      ))}

      <h1>Featured Products</h1>
      {data.featuredProducts.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.shortDescription}</p>
          <span>${product.price}</span>
        </div>
      ))}
    </div>
  );
};
```

#### Axios Example

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const homepageApi = {
  getHomepageData: async (): Promise<HomepageData> => {
    const response = await api.get<ApiResponse<HomepageData>>("/api/homepage");
    return response.data.data;
  },
};
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
- ✅ Health check APIs (`GET /health`, `GET /health/db`)
- ✅ Standard response format
- ✅ TypeScript type definitions

### Future Versions

- 🔄 Authentication APIs
- 🔄 Product catalog APIs
- 🔄 User management APIs
- 🔄 Order management APIs
- 🔄 Cart APIs

---

_Last updated: September 29, 2025_
_API Version: 1.0.0_
_Backend Version: 1.0.0_
