# Token-Based Authentication Implementation

This document describes the token-based authentication system implemented in the NOFU Merchant Frontend application.

## Overview

After successful login, the application receives a JWT token from the backend API and uses it to authenticate subsequent requests. All pages except the login page require a valid token to access.

## API Response Format

The login API returns the following response structure:

```json
{
  "responseCode": "200",
  "responseMessage": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-12-20T12:33:13.616094028Z",
    "user": {
      "name": "alice",
      "email": "a@a.com",
      "username": "a@a.com"
    }
  }
}
```

## Implementation Details

### 1. Authentication Utilities (`src/utils/auth.js`)

Provides functions to manage authentication data:

- `setAuthData(data)` - Store token, expiry, and user data after login
- `getToken()` - Retrieve the stored authentication token
- `getUser()` - Retrieve the stored user data
- `isTokenExpired()` - Check if the token has expired
- `isAuthenticated()` - Check if user has a valid, non-expired token
- `clearAuth()` - Remove all authentication data
- `getAuthHeaders()` - Get Authorization header for API requests

**Storage Keys:**

- `auth_token` - JWT token
- `token_expiry` - Token expiration timestamp
- `user_data` - User information (name, email, username)

### 2. API Utilities (`src/utils/api.js`)

Provides convenience methods for making authenticated API requests:

- `apiRequest(endpoint, options)` - Base request function with automatic token injection
- `get(endpoint, options)` - GET request
- `post(endpoint, data, options)` - POST request
- `put(endpoint, data, options)` - PUT request
- `del(endpoint, options)` - DELETE request

**Features:**

- Automatically adds `Authorization: Bearer <token>` header to all requests
- Handles 401 (Unauthorized) responses by clearing auth data and redirecting to login
- Parses JSON responses and handles errors consistently

### 3. Route Guards (`src/router/index.js`)

Navigation guards protect routes based on authentication status:

**Route Meta Fields:**

- `requiresAuth: true` - Route requires authentication (e.g., MerchantHome)
- `requiresGuest: true` - Route is only for unauthenticated users (e.g., LoginPage)

**Guard Behavior:**

- If user tries to access protected route without token → redirect to `/login`
- If authenticated user tries to access login page → redirect to `/merchants`
- Token expiration is checked automatically before each navigation

### 4. Login Page Updates (`src/views/LoginPage.vue`)

The login page now:

1. Parses the new API response format correctly
2. Stores token, expiry, and user data using `setAuthData()`
3. Handles both successful and failed login responses
4. Redirects to the merchant home page after successful login

### 5. Logout Functionality (`src/views/MerchantHome.vue`)

The logout handler:

1. Uses `clearAuth()` to remove all authentication data
2. Clears the active tab preference
3. Redirects to the login page

## Usage Examples

### Making Authenticated API Requests

```javascript
import { get, post } from "@/utils/api";

// GET request
const products = await get("/merchants/123/products");

// POST request
const transaction = await post("/merchants/123/transactions", {
  customerId: 456,
  amount: 50000,
});
```

### Checking Authentication Status

```javascript
import { isAuthenticated, getUser } from "@/utils/auth";

if (isAuthenticated()) {
  const user = getUser();
  console.log(`Welcome, ${user.name}!`);
}
```

### Manual Token Retrieval

```javascript
import { getToken, getAuthHeaders } from "@/utils/auth";

// Get token directly
const token = getToken();

// Get authorization headers for custom fetch
const headers = {
  "Content-Type": "application/json",
  ...getAuthHeaders(),
};
```

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage. For enhanced security, consider using httpOnly cookies for production.

2. **Token Expiration**: The system automatically checks token expiration before navigation and clears expired tokens.

3. **401 Handling**: The API utility automatically handles 401 responses by clearing auth data and redirecting to login.

4. **HTTPS**: Always use HTTPS in production to protect tokens during transmission.

## Testing

To test the authentication system:

1. **Login Flow**:

   - Navigate to `/login`
   - Enter valid credentials
   - Verify token is stored in localStorage
   - Verify redirect to merchant home page

2. **Protected Routes**:

   - Clear localStorage
   - Try to access `/merchants` directly
   - Verify redirect to `/login`

3. **Token Expiration**:

   - Login successfully
   - Manually set token_expiry to a past date in localStorage
   - Navigate to any route
   - Verify redirect to `/login`

4. **Logout**:
   - Login successfully
   - Click logout
   - Verify all auth data is cleared
   - Verify redirect to `/login`

## Migration Notes

Components that previously accessed `localStorage.getItem('auth_token')` directly should be updated to use the auth utilities for consistency and better error handling.

Example migration:

```javascript
// Before
const token = localStorage.getItem("auth_token");

// After
import { getToken } from "@/utils/auth";
const token = getToken();
```
