# Token-Based Authentication - Implementation Summary

## ✅ What Has Been Implemented

### 1. **Authentication Utilities** (`src/utils/auth.js`)

A centralized utility for managing JWT tokens with the following features:

- Store token, expiration date, and user data from login response
- Check token validity and expiration
- Clear authentication data on logout
- Provide authentication headers for API requests

### 2. **API Request Utilities** (`src/utils/api.js`)

A wrapper around `fetch` that automatically:

- Adds `Authorization: Bearer <token>` header to all requests
- Handles 401 (Unauthorized) responses by clearing auth and redirecting to login
- Provides convenient methods: `get()`, `post()`, `put()`, `del()`
- Parses JSON responses consistently

### 3. **Route Guards** (`src/router/index.js`)

Navigation guards that:

- Protect all pages except login with `requiresAuth: true`
- Redirect unauthenticated users to login page
- Redirect authenticated users away from login page
- Automatically check token expiration before each navigation

### 4. **Updated Login Page** (`src/views/LoginPage.vue`)

The login page now:

- Correctly parses your API response format:
  ```json
  {
    "responseCode": "200",
    "responseMessage": "success",
    "data": {
      "token": "...",
      "expiresAt": "...",
      "user": { ... }
    }
  }
  ```
- Stores token, expiration, and user data using `setAuthData()`
- Redirects to merchant home after successful login

### 5. **Updated Logout** (`src/views/MerchantHome.vue`)

The logout functionality now:

- Uses `clearAuth()` to remove all authentication data
- Redirects to login page

## 📋 How It Works

### Login Flow

1. User enters credentials on login page
2. API returns token + expiration + user data
3. Token is stored in localStorage as `auth_token`
4. Expiration is stored as `token_expiry`
5. User data is stored as `user_data`
6. User is redirected to merchant home

### Protected Routes

1. User tries to access `/merchants` or `/merchants/:id`
2. Router guard checks `isAuthenticated()`
3. If no token or expired → redirect to `/login`
4. If valid token → allow access

### API Requests (for future use)

When you're ready to fetch real data from your backend:

```javascript
import { get, post } from '@/utils/api'

// GET request - token automatically included
const products = await get('/merchants/123/products')

// POST request - token automatically included
const result = await post('/merchants/123/transactions', {
  items: [...],
  total: 50000
})
```

### Auto-Logout on 401

If any API request returns 401 (Unauthorized):

- Auth data is cleared automatically
- User is redirected to login page
- This handles expired tokens gracefully

## 🔒 Security Features

1. **Token Expiration Check**: Tokens are validated before each navigation
2. **Auto-Redirect on Expiry**: Expired tokens trigger automatic redirect to login
3. **401 Handling**: Invalid/expired tokens detected by API are handled automatically
4. **Protected Routes**: All merchant pages require valid authentication

## 📂 Files Created/Modified

### Created:

- ✨ `src/utils/auth.js` - Authentication utilities
- ✨ `src/utils/api.js` - API request utilities
- ✨ `AUTHENTICATION.md` - Comprehensive documentation
- ✨ `src/utils/api-usage-example.js` - Example code for using the API

### Modified:

- 🔧 `src/router/index.js` - Added navigation guards
- 🔧 `src/views/LoginPage.vue` - Updated to use new auth utils
- 🔧 `src/views/MerchantHome.vue` - Updated logout to use auth utils

## 🧪 Testing Checklist

Test the authentication system with these scenarios:

- [ ] **Login Success**: Login with valid credentials → redirects to merchant home
- [ ] **Login Failure**: Login with invalid credentials → shows error message
- [ ] **Direct Access (No Token)**: Try to access `/merchants` without logging in → redirects to login
- [ ] **Direct Access (With Token)**: Login, then manually navigate to `/merchants` → works
- [ ] **Token Expiration**: Login, set `token_expiry` to past date in localStorage, navigate → redirects to login
- [ ] **Logout**: Login, then logout → clears auth data and redirects to login
- [ ] **Login While Authenticated**: Login, then try to navigate to `/login` → redirects to merchants

## 📖 Next Steps

Your components are currently using hardcoded data. When you're ready to connect to real backend APIs:

1. Update components to use the API utility (see `api-usage-example.js`)
2. Replace hardcoded data with `get()` requests to your backend
3. Use `post()`, `put()`, `del()` for mutations
4. The token will be automatically included in all requests

Example migration:

```javascript
// Before (hardcoded)
const products = ref([
  { id: 1, name: "Coffee", price: 18000 },
  // ...
]);

// After (from API)
import { get } from "@/utils/api";

const products = ref([]);
const fetchProducts = async () => {
  const response = await get("/merchants/123/products");
  if (response.responseCode === "200") {
    products.value = response.data;
  }
};

onMounted(() => {
  fetchProducts();
});
```

## 🎯 Summary

Your application now has **complete token-based authentication**:

- ✅ Login stores token with expiration
- ✅ All pages (except login) require valid token
- ✅ Token automatically added to API requests
- ✅ Expired/invalid tokens trigger automatic logout
- ✅ Route guards protect all merchant pages

The system is ready to use! When you need to make API calls from your components, just import and use the functions from `@/utils/api`.
