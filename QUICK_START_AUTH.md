# 🚀 Quick Start - Token Authentication

## ✅ Implementation Complete!

Your application now has **full token-based authentication**. Here's what you need to know:

## 🎯 What's Working Now

### ✓ Login

- Login page stores token, expiration, and user data from API response
- Automatically redirects to merchant home after successful login
- Handles your API response format correctly

### ✓ Protected Routes

- All pages except `/login` require authentication
- Unauthenticated users are automatically redirected to login
- Authenticated users can't access login page (redirected to merchants)

### ✓ Token Management

- Token expiration is checked automatically
- Expired tokens trigger automatic logout and redirect to login
- All auth data is cleared on logout

### ✓ API Integration

- Utility functions ready to use for authenticated API requests
- Token automatically added to all API calls
- 401 responses trigger automatic logout

## 🧪 Quick Test

1. **Start your development server:**

   ```bash
   npm run serve
   ```

2. **Test the authentication flow:**

   - Open browser to `http://localhost:8080`
   - Should redirect to `/login`
   - Enter credentials and login
   - Should redirect to `/merchants` with token stored
   - Open DevTools → Application → Local Storage
   - You should see: `auth_token`, `token_expiry`, `user_data`

3. **Test protected routes:**
   - While logged in, try to navigate to `/login`
   - Should redirect back to `/merchants`
4. **Test logout:**
   - Click logout button
   - Should clear all auth data and redirect to `/login`

## 📝 Using the API Utility

When you're ready to fetch real data from your backend:

```javascript
// In any component
import { get, post } from "@/utils/api";

// GET request (token automatically included)
const fetchProducts = async () => {
  try {
    const response = await get("/merchants/123/products");
    if (response.responseCode === "200") {
      products.value = response.data;
    }
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
};

// POST request (token automatically included)
const createTransaction = async (data) => {
  try {
    const response = await post("/merchants/123/transactions", data);
    if (response.responseCode === "200") {
      return response.data;
    }
  } catch (error) {
    console.error("Failed to create transaction:", error);
  }
};
```

## 🔍 Debugging

### Check if user is authenticated:

```javascript
import { isAuthenticated, getUser } from "@/utils/auth";

if (isAuthenticated()) {
  const user = getUser();
  console.log("Logged in as:", user.name);
} else {
  console.log("Not authenticated");
}
```

### Check token in console:

```javascript
// In browser console
localStorage.getItem("auth_token");
localStorage.getItem("token_expiry");
localStorage.getItem("user_data");
```

### Clear auth data manually:

```javascript
import { clearAuth } from "@/utils/auth";
clearAuth();
```

## 📁 Key Files

| File                         | Purpose                    |
| ---------------------------- | -------------------------- |
| `src/utils/auth.js`          | Token management functions |
| `src/utils/api.js`           | Authenticated API requests |
| `src/router/index.js`        | Route protection guards    |
| `src/views/LoginPage.vue`    | Login + token storage      |
| `src/views/MerchantHome.vue` | Logout functionality       |

## 📚 Documentation

- `IMPLEMENTATION_SUMMARY.md` - Complete overview of implementation
- `AUTHENTICATION.md` - Detailed documentation and usage examples
- `AUTHENTICATION_FLOW.md` - Visual flow diagrams
- `src/utils/api-usage-example.js` - Code examples

## 🎨 Your Next Steps

1. **Test the authentication** - Make sure login/logout works
2. **Update components** - Replace hardcoded data with API calls when ready
3. **Configure backend URL** - Update `.env` files with correct backend URL
4. **Deploy** - Your authentication is production-ready!

## ⚙️ Configuration

Make sure your environment variables are set correctly:

**.env.development:**

```
VUE_APP_BACKEND_URL=https://apinofudev.bengkelfajarjaya.com/api/customer
VUE_APP_GPS_ENABLED=false
```

**.env.production:**

```
VUE_APP_BACKEND_URL=https://api.production.com/api/customer
VUE_APP_GPS_ENABLED=true
```

## ❓ Common Questions

**Q: Where is the token stored?**
A: In localStorage as `auth_token`

**Q: How long is the token valid?**
A: Until the `expiresAt` timestamp from the API response

**Q: What happens when token expires?**
A: User is automatically logged out and redirected to login

**Q: Do I need to add the token manually to API requests?**
A: No! Just use `get()`, `post()`, `put()`, or `del()` from `@/utils/api`

**Q: How do I check if a user is logged in?**
A: Use `isAuthenticated()` from `@/utils/auth`

## 🎉 Ready to Go!

Your authentication system is fully implemented and ready to use. Test it out and let me know if you need any adjustments!
