# JWT Authentication System Guide

## Overview
This authentication system provides complete JWT-based authentication and authorization for the NestJS backend.

## Features
- JWT-based authentication with 7-day token expiration
- Role-based access control (RBAC) with 'user' and 'admin' roles
- Password hashing using bcrypt
- Protected endpoints with `@UseGuards(JwtAuthGuard)`
- Public endpoints with `@Public()` decorator
- Admin-only endpoints with `@Roles(UserRole.ADMIN)` decorator
- User registration and login
- Password change functionality
- User profile retrieval

## Installation

Dependencies are already installed:
```bash
npm install --save @nestjs/jwt @nestjs/passport passport passport-jwt @nestjs/config bcrypt
npm install --save-dev @types/passport-jwt @types/bcrypt
```

## Environment Variables

Add these to your `.env` file:

```env
# JWT Secret (minimum 32 characters, change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Database (if not already configured)
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=password
DB_NAME=aether_flow
```

## API Endpoints

### Public Endpoints

#### Register a new user
```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "id": "uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "user",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "username": "johndoe",
    "role": "user"
  }
}
```

### Protected Endpoints (Require JWT Token)

All protected endpoints require the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

#### Get user profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

#### Change password
```http
PUT /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

Note: In a stateless JWT system, logout is handled client-side by removing the token.

## Usage in Controllers

### Protect All Routes in a Controller
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('workflow')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
  // All routes are protected
}
```

### Access User Information
```typescript
import { User } from '../auth/jwt-auth.decorator';

@Post()
create(@Body() data: any, @User() user: any) {
  // user.id, user.email, user.username, user.role are available
  console.log('User ID:', user.id);
  console.log('User Role:', user.role);
}
```

### Create Public Routes
```typescript
import { Public } from '../auth/jwt-auth.decorator';

@Public()
@Get('health')
getHealth() {
  return { status: 'ok' };
}
```

### Create Admin-Only Routes
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
    // Only admin users can access
  }
}
```

## Database Schema

The authentication system creates a `users` table with the following structure:

```sql
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

- **user**: Regular user with standard access
- **admin**: Administrator with elevated privileges

## Security Best Practices

1. **Never commit JWT_SECRET to version control** - Always use environment variables
2. **Use strong passwords** - Minimum 6 characters for registration
3. **Change JWT_SECRET in production** - Use at least 32 characters
4. **Use HTTPS** - Always transmit tokens over secure connections
5. **Token expiration** - Tokens expire after 7 days
6. **Password hashing** - Using bcrypt with salt rounds of 10

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Access Protected Endpoint
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Frontend Integration

### Store Token
```typescript
// After login
localStorage.setItem('access_token', response.access_token);
```

### Use Token in Requests
```typescript
const token = localStorage.getItem('access_token');

fetch('http://localhost:3000/workflow', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Remove Token on Logout
```typescript
localStorage.removeItem('access_token');
```

## Troubleshooting

### "Unauthorized" Error
- Check that JWT_SECRET is set in .env file
- Verify token is not expired
- Ensure token is sent in Authorization header: `Bearer <token>`

### "User not found or inactive"
- User account may be deactivated
- User ID in token may be invalid

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in .env
- Ensure database exists

## File Structure

```
backend/src/auth/
├── auth.controller.ts       # Authentication endpoints
├── auth.module.ts           # Auth module configuration
├── auth.service.ts          # Business logic for auth
├── decorators/
│   └── roles.decorator.ts   # Roles decorator
├── dto/
│   └── login.dto.ts         # Login/Register DTOs
├── entities/
│   └── user.entity.ts       # User database entity
├── jwt-auth.decorator.ts    # @User, @Public decorators
├── jwt-auth.guard.ts        # JWT authentication guard
├── jwt.strategy.ts          # Passport JWT strategy
├── roles.guard.ts           # Role-based access guard
└── types/
    └── user.types.ts        # TypeScript interfaces
```

## Next Steps

1. Set up your `.env` file with a secure JWT_SECRET
2. Start the backend server
3. Register a new user
4. Login to get your JWT token
5. Use the token to access protected endpoints
6. Implement user authorization in your frontend

## Support

For issues or questions, refer to:
- NestJS Documentation: https://docs.nestjs.com/
- Passport Documentation: http://www.passportjs.org/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
