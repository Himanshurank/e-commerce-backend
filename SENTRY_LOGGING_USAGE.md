# 🔍 Simple Sentry Logging Usage Guide

## ✅ **What's Already Working Automatically:**

### **1. All API Calls Are Logged:**

- ✅ **Every request** is automatically logged when it starts
- ✅ **Every response** is automatically logged when it completes
- ✅ **All errors** are automatically caught and logged
- ✅ **Performance data** (response time) is tracked

### **2. What You Get in Sentry Dashboard:**

```
API Call Started: GET /api/v1/pages/homepage
API Call Success: GET /api/v1/pages/homepage (245ms)
API Call Failed: GET /api/v1/nonexistent (404)
Unhandled Error: My first Sentry error!
Console Log: This is a console.log message
Console Warn: This is a console.warn message
Console Error: This is a console.error message
```

## 🛠️ **How to Add Manual Logging (Optional):**

### **Method 1 - Use Console Logs (Simplest):**

```typescript
// Anywhere in your code - these automatically go to Sentry!
console.log("User logged in successfully", { userId: 123 });
console.warn("Low inventory detected", { productId: 456, stock: 2 });
console.error("Payment processing failed", { orderId: 789, error: "timeout" });
```

### **Method 2 - Use SentryLogger (More Structured):**

```typescript
import { SentryLogger } from "../shared/utils/sentry-logger";

// In any controller, use case, or repository:
try {
  const product = await this.productRepository.create(data);

  // Log success
  SentryLogger.logSuccess("Product created successfully", {
    action: "product_created",
    productId: product.id,
    userId: req.user?.userId,
  });

  return product;
} catch (error) {
  // Log error (this happens automatically, but you can add context)
  SentryLogger.logError("Product creation failed", error, {
    action: "product_create_failed",
    userId: req.user?.userId,
    categoryId: data.categoryId,
  });

  throw error; // Re-throw so middleware catches it
}
```

### **Business Events Logging:**

```typescript
// Log important business events
SentryLogger.logBusinessEvent("user_registered", {
  userId: user.id,
  email: user.email,
});

SentryLogger.logBusinessEvent("order_placed", {
  orderId: order.id,
  userId: user.id,
  amount: order.totalAmount,
});

SentryLogger.logBusinessEvent("payment_processed", {
  orderId: order.id,
  paymentMethod: "stripe",
  amount: payment.amount,
});
```

### **Wrap Any Function with Logging:**

```typescript
// Automatically log success/failure of any operation
const result = await SentryLogger.withLogging(
  async () => {
    return await this.complexOperation(data);
  },
  {
    operation: "complex_operation",
    userId: user.id,
    dataType: "product",
  }
);
```

## 📊 **What Gets Logged Automatically:**

### **✅ API Requests:**

- Method (GET, POST, PUT, DELETE)
- Path (/api/v1/products)
- Query parameters
- User ID (if authenticated)
- IP address
- User agent
- Response time
- Status code

### **✅ Errors:**

- Error message
- Stack trace
- Request context
- User context
- Timestamp

### **✅ Performance:**

- Slow requests (>1000ms) are flagged
- Database query times
- API response times

## 🎯 **Current Implementation Status:**

### **✅ Already Working:**

1. **All API calls logged** - Every request/response
2. **All errors caught** - Automatic error logging
3. **Performance monitoring** - Response times tracked
4. **User context** - User ID included when available

### **📝 Optional Additions (Use When Needed):**

1. **Business event logging** - Use `SentryLogger.logBusinessEvent()`
2. **Custom success logging** - Use `SentryLogger.logSuccess()`
3. **Additional error context** - Use `SentryLogger.logError()`

## 🚀 **Example Usage in Controllers:**

```typescript
// In ProductController
async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    // This API call is already logged automatically
    const result = await this.createProductUseCase.execute(request);

    // Optional: Log business event
    SentryLogger.logBusinessEvent('product_created', {
      productId: result.product.id,
      sellerId: req.user?.userId,
      categoryId: result.product.categoryId
    });

    res.status(201).json(result);
    // Success is logged automatically
  } catch (error) {
    // Error is logged automatically by middleware
    res.status(500).json({ error: 'Product creation failed' });
  }
}
```

## 📈 **Sentry Dashboard View:**

You'll see logs like:

```
INFO: API Call Started: POST /api/v1/products
INFO: Product created successfully
INFO: Business Event: product_created
INFO: API Call Success: POST /api/v1/products (156ms)
```

Or for errors:

```
INFO: API Call Started: POST /api/v1/products
ERROR: Product creation failed
ERROR: Unhandled Error: Validation failed
ERROR: API Call Failed: POST /api/v1/products (89ms)
```

## 🎉 **That's It!**

Your e-commerce backend now automatically logs:

- ✅ Every API call
- ✅ Every error
- ✅ Performance metrics
- ✅ User context

**No additional code required** - it all works automatically!
