# AppError Utility Class Guide

## Overview
The `AppError` utility class provides a standardized way to handle errors throughout the backend application. It extends the native JavaScript `Error` class and includes built-in HTTP status codes for consistent error responses.

## Location
`src/utils/errors.js`

## Base Class: AppError

### Usage
```javascript
import { AppError } from '../utils/errors.js';

// Basic usage
throw new AppError('Something went wrong', 500);

// With default status code (500)
throw new AppError('Internal error');
```

### Constructor
```javascript
constructor(message, statusCode = 500)
```

**Parameters:**
- `message` (string): Error description
- `statusCode` (number, optional): HTTP status code (default: 500)

**Properties:**
- `message`: Error message
- `statusCode`: HTTP status code
- `timestamp`: ISO timestamp when error was created
- `name`: Error class name

## Specialized Error Classes

### ValidationError (400)
Used for validation failures and invalid input:
```javascript
import { ValidationError } from '../utils/errors.js';

if (!email) {
  throw new ValidationError('Email is required');
}

if (!isValidEmail(email)) {
  throw new ValidationError('Invalid email format');
}
```

### AuthError (401)
Used for authentication failures:
```javascript
import { AuthError } from '../utils/errors.js';

if (!token) {
  throw new AuthError('No authentication token provided');
}

if (!isValidToken(token)) {
  throw new AuthError('Invalid or expired token');
}
```

### ForbiddenError (403)
Used when user lacks sufficient permissions:
```javascript
import { ForbiddenError } from '../utils/errors.js';

if (user.role !== 'admin') {
  throw new ForbiddenError('Admin access required');
}
```

### NotFoundError (404)
Used when a resource doesn't exist:
```javascript
import { NotFoundError } from '../utils/errors.js';

const user = await getUserById(userId);
if (!user) {
  throw new NotFoundError(`User with ID ${userId} not found`);
}
```

### ConflictError (409)
Used for data conflicts (e.g., duplicate entries):
```javascript
import { ConflictError } from '../utils/errors.js';

const existingUser = await findUserByEmail(email);
if (existingUser) {
  throw new ConflictError('A user with this email already exists');
}
```

### InternalServerError (500)
Used for unexpected server errors:
```javascript
import { InternalServerError } from '../utils/errors.js';

try {
  // Some operation
} catch (error) {
  throw new InternalServerError('Failed to process your request');
}
```

### ServiceUnavailableError (503)
Used when external services are unavailable:
```javascript
import { ServiceUnavailableError } from '../utils/errors.js';

if (databaseIsDown) {
  throw new ServiceUnavailableError('Database service is temporarily unavailable');
}
```

## Real-World Examples

### Example 1: User Controller
```javascript
import { AppError, ValidationError, NotFoundError } from '../utils/errors.js';

const getUserByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validation
    if (!id || isNaN(id)) {
      throw new ValidationError('Valid user ID is required');
    }

    // Service call
    const user = await getUserById(id);

    // Not found check
    if (!user) {
      throw new NotFoundError(`User ${id} not found`);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};
```

### Example 2: User Service
```javascript
import { getSupabaseClient } from '../config/database.js';
import { AppError, ConflictError } from '../utils/errors.js';

const createUser = async (userData) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();

    if (error) {
      // Handle Supabase specific errors
      if (error.message.includes('duplicate')) {
        throw new ConflictError('User with this email already exists');
      }
      throw new AppError(error.message, 400);
    }

    return data;
  } catch (error) {
    throw error; // Re-throw for controller to handle
  }
};
```

### Example 3: Route with Error Handling
```javascript
import express from 'express';
import {
  createUserController,
  getUserByIdController,
  updateUserController,
} from '../controllers/userController.js';

const router = express.Router();

// All errors from controllers are caught by the global error handler
router.post('/create', createUserController);
router.get('/:id', getUserByIdController);
router.patch('/:id', updateUserController);

export default router;
```

## Error Response Format

When an error is thrown, the global error handler returns:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Email and name are required",
  "error": "Bad Request"
}
```

In development mode, stack trace is included:
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Server Error",
  "stack": "Error: Internal server error\n    at ..."
}
```

## Best Practices

1. **Use Specific Error Classes**
   - ✅ `throw new ValidationError('...')` for validation
   - ❌ `throw new AppError('...', 400)` (less semantic)

2. **Include Helpful Messages**
   - ✅ `'User with ID 123 not found'`
   - ❌ `'Not found'`

3. **Handle Errors in Controllers/Services**
   ```javascript
   try {
     const result = await someService();
     return result;
   } catch (error) {
     // Wrap or transform error if needed
     throw new AppError(error.message, 500);
   }
   ```

4. **Use next() to Pass to Global Handler**
   ```javascript
   // In controllers
   router.get('/:id', async (req, res, next) => {
     try {
       // ...
     } catch (error) {
       next(error); // Must use next() to reach global handler
     }
   });
   ```

5. **Don't Expose Sensitive Information**
   - ❌ `throw new AppError(error.stack, 500)`
   - ✅ `throw new AppError('An error occurred', 500)`

## Extending AppError

You can create custom error classes:

```javascript
// In src/utils/errors.js or a new file
import { AppError } from './errors.js';

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

export { DatabaseError };
```

Then use it:
```javascript
import { DatabaseError } from '../utils/errors.js';

throw new DatabaseError('Failed to query users table');
```

## Testing Errors

```javascript
import { ValidationError, NotFoundError } from '../utils/errors.js';

// Test throwing errors
try {
  throw new ValidationError('Test error');
} catch (error) {
  console.log(error.statusCode); // 400
  console.log(error.message);    // Test error
  console.log(error.name);       // ValidationError
}
```

## Summary

| Class | Status | Purpose |
|-------|--------|---------|
| `AppError` | 500 | Base error class (generic errors) |
| `ValidationError` | 400 | Input validation failures |
| `AuthError` | 401 | Authentication failures |
| `ForbiddenError` | 403 | Authorization failures |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Data conflicts/duplicates |
| `InternalServerError` | 500 | Unexpected errors |
| `ServiceUnavailableError` | 503 | External service issues |

---

For more information, see [Global Error Handler Guide](LINTING_GUIDE.md).
