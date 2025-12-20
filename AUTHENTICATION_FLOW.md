# Authentication Flow Diagram

## 🔐 Login Flow

```
┌─────────────┐
│   User      │
│ Opens App   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Router Guard    │
│ Checks Auth     │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Has     │
    │ Token?  │
    └────┬────┘
         │
    ┌────┴────────────────────┐
    │                         │
    NO                       YES
    │                         │
    ▼                         ▼
┌────────────┐         ┌─────────────┐
│ Redirect   │         │  Allow      │
│ to /login  │         │  Access     │
└─────┬──────┘         └─────────────┘
      │
      ▼
┌──────────────────┐
│  Login Page      │
│  User enters     │
│  credentials     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│  POST /merchants/login           │
│  { username, password }          │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  API Response:                   │
│  {                               │
│    "responseCode": "200",        │
│    "data": {                     │
│      "token": "eyJ...",          │
│      "expiresAt": "2025-...",    │
│      "user": { ... }             │
│    }                             │
│  }                               │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  setAuthData(data)               │
│  └─ localStorage.setItem(        │
│      'auth_token', token)        │
│  └─ localStorage.setItem(        │
│      'token_expiry', expiresAt)  │
│  └─ localStorage.setItem(        │
│      'user_data', user)          │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────┐
│ Redirect to      │
│ /merchants/:id   │
└──────────────────┘
```

## 🛡️ Protected Route Access

```
┌───────────────┐
│  User clicks  │
│  navigation   │
└───────┬───────┘
        │
        ▼
┌────────────────────┐
│  router.beforeEach │
│  (Navigation Guard)│
└────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│  isAuthenticated()  │
│  ├─ getToken()      │
│  ├─ isTokenExpired()│
│  └─ Return bool     │
└────────┬────────────┘
         │
    ┌────┴────┐
    │ Valid   │
    │ Token?  │
    └────┬────┘
         │
    ┌────┴──────────────┐
    │                   │
   YES                 NO
    │                   │
    ▼                   ▼
┌─────────┐      ┌──────────────┐
│ Allow   │      │  clearAuth() │
│ Access  │      │  Redirect to │
└─────────┘      │  /login      │
                 └──────────────┘
```

## 🔄 API Request with Auto-Authentication

```
┌──────────────────────┐
│  Component calls     │
│  get('/merchants/...')│
└─────────┬────────────┘
          │
          ▼
┌──────────────────────────────┐
│  api.js                      │
│  ├─ Get token from storage   │
│  ├─ Add Authorization header │
│  ├─ Make fetch request       │
│  └─ Handle response          │
└─────────┬────────────────────┘
          │
          ▼
┌──────────────────────┐
│  Backend API         │
│  Validates token     │
└─────────┬────────────┘
          │
     ┌────┴────┐
     │ Token   │
     │ Valid?  │
     └────┬────┘
          │
     ┌────┴─────────────┐
     │                  │
    YES                NO
     │                  │
     ▼                  ▼
┌─────────┐      ┌──────────────┐
│ Return  │      │  Return 401  │
│ Data    │      │  Unauthorized│
└────┬────┘      └──────┬───────┘
     │                  │
     │                  ▼
     │           ┌──────────────┐
     │           │  clearAuth() │
     │           │  Redirect to │
     │           │  /login      │
     │           └──────────────┘
     │
     ▼
┌────────────┐
│ Component  │
│ receives   │
│ data       │
└────────────┘
```

## 🚪 Logout Flow

```
┌──────────────┐
│  User clicks │
│  Logout      │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  handleLogout()  │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────────┐
│  clearAuth()                 │
│  └─ Remove 'auth_token'      │
│  └─ Remove 'token_expiry'    │
│  └─ Remove 'user_data'       │
│  └─ Remove 'merchant'        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────┐
│  Redirect to     │
│  /login          │
└──────────────────┘
```

## 📊 Token Storage Structure

```
localStorage
├─ auth_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
├─ token_expiry: "2025-12-20T12:33:13.616094028Z"
├─ user_data: '{"name":"alice","email":"a@a.com","username":"a@a.com"}'
└─ merchant: '{"id":123,...}' (for backward compatibility)
```

## 🔑 Key Functions

### auth.js

- `setAuthData(data)` - Store token + user info
- `getToken()` - Retrieve token
- `getUser()` - Retrieve user info
- `isAuthenticated()` - Check token validity
- `clearAuth()` - Clear all auth data

### api.js

- `get(endpoint)` - Authenticated GET request
- `post(endpoint, data)` - Authenticated POST request
- `put(endpoint, data)` - Authenticated PUT request
- `del(endpoint)` - Authenticated DELETE request

### router/index.js

- `router.beforeEach()` - Navigation guard that checks authentication
