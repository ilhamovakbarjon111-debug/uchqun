# Teacher Management System

## Overview

The system now supports teacher-managed parent accounts. Teachers can create parent accounts and set their passwords, which parents then use to log in.

## How It Works

1. **Teachers create parent accounts** - Teachers (or admins) can create parent accounts with email and password
2. **Teachers set passwords** - Teachers set initial passwords for parents and can reset them if needed
3. **Parents log in** - Parents log in using their email and the password provided by the teacher
4. **Parents can change passwords** - Once logged in, parents can change their own passwords if desired

## API Endpoints

### Get All Parents
```
GET /api/teacher/parents
Authorization: Bearer <teacher_token>
Query params: search, limit, offset
```

**Response:**
```json
{
  "parents": [...],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

### Get Single Parent
```
GET /api/teacher/parents/:id
Authorization: Bearer <teacher_token>
```

### Create Parent Account
```
POST /api/teacher/parents
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "email": "parent@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1 (555) 123-4567"
}
```

### Update Parent Account
```
PUT /api/teacher/parents/:id
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1 (555) 987-6543",
  "email": "newemail@example.com"
}
```

### Set/Reset Parent Password
```
PUT /api/teacher/parents/:id/password
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "password": "newpassword123"
}
```

### Delete Parent Account
```
DELETE /api/teacher/parents/:id
Authorization: Bearer <teacher_token>
```

**Note:** Cannot delete parent if they have associated children.

## Authentication Flow

1. **Teacher logs in:**
   ```
   POST /api/auth/login
   {
     "email": "teacher@example.com",
     "password": "teacher123"
   }
   ```

2. **Teacher creates parent:**
   ```
   POST /api/teacher/parents
   Authorization: Bearer <teacher_token>
   {
     "email": "parent@example.com",
     "password": "parent123",
     "firstName": "Sarah",
     "lastName": "Johnson"
   }
   ```

3. **Parent logs in:**
   ```
   POST /api/auth/login
   {
     "email": "parent@example.com",
     "password": "parent123"
   }
   ```

## Security

- Only teachers and admins can access parent management endpoints
- Passwords are automatically hashed using bcrypt
- Minimum password length: 6 characters
- Email addresses must be unique

## Example Usage

### Using cURL

**Create a parent account:**
```bash
curl -X POST http://localhost:5000/api/teacher/parents \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newparent@example.com",
    "password": "securepass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Set parent password:**
```bash
curl -X PUT http://localhost:5000/api/teacher/parents/PARENT_ID/password \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newpassword456"
  }'
```

## Frontend Integration

Teachers will need a frontend interface to:
1. View list of parents
2. Create new parent accounts
3. Set/reset parent passwords
4. Update parent information
5. Delete parent accounts (if no children associated)

Parents continue to use the existing login flow with their teacher-provided credentials.



