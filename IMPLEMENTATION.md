# Library Management System

A modern library management system built with Next.js, MongoDB, and NextAuth.js featuring secure user authentication and authorization.

## Features Implemented

### ✅ User Registration

- Registration form with fields: first name, last name, email, and password
- Client-side and server-side validation
- Password confirmation with matching validation
- Duplicate email detection (409 Conflict response)
- Success confirmation message after registration
- Automatic redirect to login page after successful registration
- Password hashing using bcryptjs for security

### ✅ User Login

- Login form with email and password fields
- Secure credential verification using NextAuth.js
- Redirect to dashboard on successful login
- Error messages for incorrect credentials
- Persistent authentication (users remain logged in until logout)
- Session management using JWT tokens

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB Atlas
- **ORM**: Mongoose
- **Authentication**: NextAuth.js v4
- **Password Hashing**: bcryptjs
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Project Structure

```
knjige/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts   # NextAuth configuration
│   │       └── register/route.ts        # Registration API endpoint
│   ├── dashboard/
│   │   └── page.tsx                     # Protected dashboard page
│   ├── login/
│   │   └── page.tsx                     # Login page
│   ├── register/
│   │   └── page.tsx                     # Registration page
│   ├── globals.css                      # Global styles
│   ├── layout.tsx                       # Root layout with AuthProvider
│   └── page.tsx                         # Home page
├── components/
│   └── AuthProvider.tsx                 # Session provider wrapper
├── lib/
│   └── mongodb.ts                       # MongoDB connection utility
├── models/
│   └── User.ts                          # User model with Mongoose
├── types/
│   └── next-auth.d.ts                   # NextAuth type definitions
└── .env.local                           # Environment variables
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://test:test@cluster0.f3pktyv.mongodb.net/library?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

**Important**: Change the `NEXTAUTH_SECRET` to a secure random string in production. You can generate one using:

```bash
openssl rand -base64 32
```

### 3. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## User Flow

### Registration Flow

1. Navigate to `/register` or click "Get Started - Register" from home page
2. Fill in the registration form:
   - First Name (2-50 characters)
   - Last Name (2-50 characters)
   - Email (valid email format)
   - Password (minimum 6 characters)
   - Confirm Password (must match password)
3. Submit the form
4. Receive confirmation message
5. Automatically redirected to login page

### Login Flow

1. Navigate to `/login` or click "Sign In" from home page
2. Enter email and password
3. On successful authentication:
   - Redirected to `/dashboard`
   - Session created and persisted
4. On failed authentication:
   - Error message displayed
   - User remains on login page

### Dashboard Access

- Protected route that requires authentication
- Displays user information (first name, last name, email)
- Shows welcome message
- Includes logout functionality
- Unauthenticated users are redirected to login page

## Database Schema

### User Model

```typescript
{
  firstName: String (required, 2-50 chars, trimmed)
  lastName: String (required, 2-50 chars, trimmed)
  email: String (required, unique, lowercase, validated)
  password: String (required, hashed, min 6 chars)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

## API Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
	"firstName": "John",
	"lastName": "Doe",
	"email": "john@example.com",
	"password": "password123"
}
```

**Success Response (201):**

```json
{
	"message": "Registration successful! You can now log in.",
	"user": {
		"id": "507f1f77bcf86cd799439011",
		"firstName": "John",
		"lastName": "Doe",
		"email": "john@example.com"
	}
}
```

**Error Responses:**

- 400: Validation error (missing fields, invalid format)
- 409: Email already exists
- 500: Server error

### POST /api/auth/callback/credentials

NextAuth endpoint for authentication (handled internally).

**Credentials:**

- email: string
- password: string

## Security Features

1. **Password Security**

   - Passwords hashed using bcryptjs with salt rounds of 10
   - Never stored or transmitted in plain text
   - Never included in API responses

2. **Session Management**

   - JWT-based sessions
   - 30-day session expiration
   - Secure HTTP-only cookies
   - CSRF protection built into NextAuth

3. **Input Validation**

   - Client-side validation for immediate feedback
   - Server-side validation for security
   - MongoDB schema validation as final layer
   - Email format validation using regex
   - Password length requirements

4. **Database Security**
   - Mongoose ORM prevents SQL injection
   - Unique email constraint at database level
   - Connection string stored in environment variables

## Acceptance Criteria Verification

### ✅ Story 1: User Registration

| Criteria                                                           | Status | Implementation                         |
| ------------------------------------------------------------------ | ------ | -------------------------------------- |
| Registration form includes: first name, last name, email, password | ✅     | `app/register/page.tsx`                |
| User receives confirmation message                                 | ✅     | Success state with green alert         |
| Duplicate emails not allowed                                       | ✅     | Unique constraint + 409 error response |

### ✅ Story 2: User Login

| Criteria                                    | Status | Implementation                       |
| ------------------------------------------- | ------ | ------------------------------------ |
| Login form includes email and password      | ✅     | `app/login/page.tsx`                 |
| Correct credentials → redirect to dashboard | ✅     | NextAuth + router.push('/dashboard') |
| Incorrect credentials → error message       | ✅     | Error state with red alert           |
| Users remain authenticated until logout     | ✅     | NextAuth JWT session (30 days)       |

## Future Enhancements

- Email verification
- Password reset functionality
- Profile editing
- Book catalog and reservation system
- User roles and permissions
- Activity logging
- Rate limiting on authentication endpoints
- Two-factor authentication (2FA)

## Development Notes

- The application uses Next.js App Router (not Pages Router)
- All components use TypeScript for type safety
- Tailwind CSS is configured for styling
- Dark mode support is included
- The MongoDB connection uses a cached connection to prevent exhausting database connections

## Troubleshooting

### MongoDB Connection Issues

- Verify the connection string in `.env.local`
- Ensure IP address is whitelisted in MongoDB Atlas
- Check network connectivity

### NextAuth Errors

- Ensure `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your application URL
- Check browser cookies are enabled

### Port Already in Use

```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## License

This project is for educational purposes as part of the FERI MAG program.
