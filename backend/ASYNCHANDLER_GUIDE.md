# AsyncHandler Utility Guide

## Overview

The `asyncHandler` is a utility wrapper that eliminates repetitive try-catch blocks in Express route handlers. It automatically catches errors thrown in async functions and passes them to the global error handler middleware.

## Location
`src/utils/asyncHandler.js`

## Basic Usage

### Without asyncHandler (Verbose)
```javascript
router.get('/:id', async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);  // Must manually pass to handler
  }
});
```

### With asyncHandler (Clean)
```javascript
import { asyncHandler } from '../utils/asyncHandler.js';

router.get('/:id', asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  res.json({ success: true, data: user });
  // Errors are automatically caught and passed to error handler
}));
```

## Real-World Examples

### Example 1: User Controller with asyncHandler

```javascript
import { asyncHandler } from '../utils/asyncHandler.js';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors.js';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../services/userService.js';

const createUserController = asyncHandler(async (req, res) => {
  const { email, name, phone } = req.body;

  if (!email || !name) {
    throw new ValidationError('Email and name are required');
  }

  const userData = {
    email,
    name,
    phone: phone || null,
    created_at: new Date(),
  };

  const result = await createUser(userData);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: result[0],
  });
});

const getAllUsersController = asyncHandler(async (req, res) => {
  const users = await getAllUsers();

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: users,
  });
});

const getUserByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    throw new ValidationError('Valid user ID is required');
  }

  const user = await getUserById(id);

  if (!user) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: user,
  });
});

const updateUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, name, phone } = req.body;

  if (!id || isNaN(id)) {
    throw new ValidationError('Valid user ID is required');
  }

  if (!email && !name && phone === undefined) {
    throw new ValidationError('At least one field must be provided for update');
  }

  const userData = {};
  if (email) userData.email = email;
  if (name) userData.name = name;
  if (phone !== undefined) userData.phone = phone;

  const result = await updateUser(id, userData);

  if (!result || result.length === 0) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: result[0],
  });
});

const deleteUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    throw new ValidationError('Valid user ID is required');
  }

  const result = await deleteUser(id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
};
```

### Example 2: Route Definition with asyncHandler

```javascript
import express from 'express';
import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
} from '../controllers/userController.js';

const router = express.Router();

// All routes automatically have error handling
router.post('/create', createUserController);
router.get('/all', getAllUsersController);
router.get('/:id', getUserByIdController);
router.patch('/:id', updateUserController);
router.delete('/:id', deleteUserController);

export default router;
```

### Example 3: Service Layer with asyncHandler

```javascript
import { getSupabaseClient } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError, ConflictError } from '../utils/errors.js';

const createUser = asyncHandler(async (userData) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select();

  if (error) {
    if (error.message.includes('duplicate')) {
      throw new ConflictError('A user with this email already exists');
    }
    throw new AppError(error.message, 400);
  }

  return data;
});

export { createUser };
```

## How It Works

The `asyncHandler` utility:

1. **Accepts** an async function (route handler)
2. **Returns** a middleware function compatible with Express
3. **Wraps** the async function with `Promise.resolve()`
4. **Catches** any rejected promise (thrown errors)
5. **Passes** caught errors to the global error handler via `next(error)`

```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

## Error Flow

```
Controller throws error
        ↓
asyncHandler catches it
        ↓
Passes to error handler middleware
        ↓
Global error handler formats response
        ↓
Client receives standardized error JSON
```

## Best Practices

### ✅ DO:
- Use `asyncHandler` for all async route handlers
- Throw specific error types (`ValidationError`, `NotFoundError`, etc.)
- Keep controller logic in controllers, service logic in services
- Let asyncHandler manage all error passing

```javascript
router.post('/users', asyncHandler(async (req, res) => {
  // Clean, readable code without try-catch
  if (!req.body.email) {
    throw new ValidationError('Email required');
  }
  const user = await userService.create(req.body);
  res.json({ success: true, data: user });
}));
```

### ❌ DON'T:
- Mix asyncHandler with try-catch (redundant)
- Manually call `next(error)` when using asyncHandler
- Use asyncHandler for sync-only handlers

```javascript
// ❌ BAD - mixing approaches
router.post('/users', asyncHandler(async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    res.json(user);
  } catch (error) {
    next(error);  // Redundant when using asyncHandler
  }
}));

// ❌ BAD - no need for asyncHandler on sync handlers
router.get('/status', asyncHandler((req, res) => {
  res.json({ status: 'ok' });
}));
```

## Using with Middleware

AsyncHandler also works with custom middleware:

```javascript
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthError } from '../utils/errors.js';

const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new AuthError('No token provided');
  }
  
  const user = await verifyJWT(token);
  if (!user) {
    throw new AuthError('Invalid token');
  }
  
  req.user = user;
  next();
});

export { verifyToken };
```

## Comparison: Before vs After

### Before (Verbose)
```javascript
const routes = [
  {
    path: '/users',
    method: 'post',
    handler: async (req, res, next) => {
      try {
        const data = await userService.create(req.body);
        res.json(data);
      } catch (e) { next(e); }
    }
  },
  {
    path: '/users/:id',
    method: 'get',
    handler: async (req, res, next) => {
      try {
        const data = await userService.getById(req.params.id);
        res.json(data);
      } catch (e) { next(e); }
    }
  },
  {
    path: '/users/:id',
    method: 'patch',
    handler: async (req, res, next) => {
      try {
        const data = await userService.update(req.params.id, req.body);
        res.json(data);
      } catch (e) { next(e); }
    }
  }
];
// 23 lines, lots of boilerplate
```

### After (Clean)
```javascript
const createUserHandler = asyncHandler(async (req, res) => {
  const data = await userService.create(req.body);
  res.json(data);
});

const getUserHandler = asyncHandler(async (req, res) => {
  const data = await userService.getById(req.params.id);
  res.json(data);
});

const updateUserHandler = asyncHandler(async (req, res) => {
  const data = await userService.update(req.params.id, req.body);
  res.json(data);
});

const routes = [
  { path: '/users', method: 'post', handler: createUserHandler },
  { path: '/users/:id', method: 'get', handler: getUserHandler },
  { path: '/users/:id', method: 'patch', handler: updateUserHandler },
];
// 16 lines, clear business logic
```

## Testing with asyncHandler

```javascript
// handlers.test.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { ValidationError } from '../utils/errors.js';

describe('asyncHandler', () => {
  it('should pass errors to next()', (done) => {
    const handler = asyncHandler(async (req, res) => {
      throw new ValidationError('Test error');
    });

    const mockNext = (error) => {
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test error');
      done();
    };

    handler({}, {}, mockNext);
  });

  it('should execute handler successfully', (done) => {
    const handler = asyncHandler(async (req, res) => {
      res.json({ success: true });
    });

    const mockRes = {
      json: (data) => {
        expect(data.success).toBe(true);
        done();
      }
    };

    handler({}, mockRes, () => {});
  });
});
```

## Summary

| Feature | Benefit |
|---------|---------|
| Automatic error catching | No manual `next(error)` calls |
| Reduces boilerplate | ~50% less code in controllers |
| Works with AppError | Seamless integration with error types |
| Express compatible | Standard Express middleware |
| Type-safe | Works with TypeScript interfaces |

---

**Pair with:** Use `asyncHandler` together with [AppError utility](APPERROR_GUIDE.md) for complete error handling.
