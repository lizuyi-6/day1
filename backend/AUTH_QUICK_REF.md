# JWT Authentication Quick Reference

## Quick Setup Checklist

- [x] Install dependencies: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`
- [x] Set `JWT_SECRET` in `.env` file (minimum 32 characters)
- [x] Import `AuthModule` in `app.module.ts`
- [x] Start the backend server
- [x] Test registration and login endpoints

## Common Usage Patterns

### 1. Protect a Controller
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('resource')
@UseGuards(JwtAuthGuard)
export class ResourceController {
  // All routes protected
}
```

### 2. Get Current User
```typescript
import { User } from '../auth/jwt-auth.decorator';

@Get('my-data')
getMyData(@User() user: any) {
  console.log(user.id);      // User UUID
  console.log(user.email);   // User email
  console.log(user.username); // Username
  console.log(user.role);    // 'user' or 'admin'
}
```

### 3. Create Public Route
```typescript
import { Public } from '../auth/jwt-auth.decorator';

@Public()
@Get('public-data')
getPublicData() {
  return { message: 'Anyone can access' };
}
```

### 4. Create Admin-Only Route
```typescript
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../auth/entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Roles(UserRole.ADMIN)
  @Get('users')
  getAllUsers() {
    // Only admins can access
  }
}
```

### 5. Get Specific User Property
```typescript
@Get('my-email')
getMyEmail(@User('email') email: string) {
  return { email };
}
```

## API Endpoints Reference

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login and get token |
| GET | `/auth/profile` | Yes | Get user profile |
| PUT | `/auth/change-password` | Yes | Change password |
| POST | `/auth/logout` | Yes | Logout (client-side) |
| GET | `/health` | No | Health check endpoint |

## cURL Examples

### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"pass123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Frontend Integration

### Axios Example
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('access_token', response.data.access_token);
  return response.data;
};

// Get profile
const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};
```

### Fetch API Example
```typescript
// Login
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
};

// Protected request
const getWorkflows = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:3000/workflow', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return await response.json();
};
```

## Error Handling

### Common HTTP Status Codes

| Status | Description | Solution |
|--------|-------------|----------|
| 401 | Unauthorized - Invalid or missing token | Check token is valid and sent in Authorization header |
| 403 | Forbidden - Insufficient permissions | User role doesn't have required permissions |
| 409 | Conflict - User already exists | Use different email or username |
| 404 | Not Found - User not found | User may have been deleted |
| 422 | Unprocessable Entity - Validation error | Check request body format |

### Error Response Format
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## Security Best Practices

1. **Never expose JWT_SECRET** - Always use environment variables
2. **Use HTTPS in production** - Protect tokens in transit
3. **Implement token refresh** - Current implementation uses 7-day expiration
4. **Validate input data** - DTOs use class-validator for validation
5. **Hash passwords** - Using bcrypt with 10 salt rounds
6. **Role-based access** - Use RolesGuard for admin endpoints
7. **Rate limiting** - Consider implementing rate limiting on auth endpoints

## Database Schema

```sql
-- User table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT current_timestamp,
  updated_at TIMESTAMP DEFAULT current_timestamp
);
```

## User Roles

- **user**: Default role for regular users
- **admin**: Administrative role with elevated permissions

## Testing

Run the test script:
```bash
node test-auth.js
```

This will test:
- User registration
- User login
- Profile access
- Protected endpoints
- Password change
- Public endpoints

## Troubleshooting

### "JWT_SECRET not defined"
- Add `JWT_SECRET=your-secret-key-min-32-chars` to `.env` file

### "Cannot connect to database"
- Check PostgreSQL is running
- Verify database credentials in `.env`

### "401 Unauthorized"
- Verify token is valid and not expired
- Check token format: `Bearer <token>`

### "403 Forbidden"
- User doesn't have required role
- Check user role in database

## File Locations

```
backend/src/auth/
├── auth.controller.ts       # Auth endpoints
├── auth.service.ts          # Business logic
├── auth.module.ts           # Module config
├── entities/
│   └── user.entity.ts       # User entity
├── dto/
│   └── login.dto.ts         # DTOs
├── guards/
│   ├── jwt-auth.guard.ts    # JWT guard
│   └── roles.guard.ts       # Roles guard
├── decorators/
│   └── roles.decorator.ts   # Roles decorator
├── strategies/
│   └── jwt.strategy.ts      # JWT strategy
└── jwt-auth.decorator.ts    # @User, @Public
```

## Migration Guide

If migrating from another auth system:

1. **Install dependencies** (already done)
2. **Import AuthModule** in app.module.ts (already done)
3. **Update environment variables** in `.env`
4. **Run database migration/sync** to create users table
5. **Update controllers** to use guards (already done)
6. **Update frontend** to handle JWT tokens

## Support

For detailed information, see `AUTH_GUIDE.md`
