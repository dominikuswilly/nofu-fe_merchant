# 404 Page Not Found - Feature Documentation

## ✅ Implementation Complete

A beautiful, **mobile-friendly and responsive 404 (Page Not Found)** page has been added to your application!

## 📱 Preview

![404 Page Preview](C:/Users/domin/.gemini/antigravity/brain/845f2e42-44b1-4f37-bc8a-1376c27214b5/notfound_page_preview_1766231141369.png)

## 🎯 Features

### ✨ Visual Design

- **Modern gradient background** matching your login page style
- **Animated elements** for engaging user experience:
  - Bouncing magnifying glass icon 🔍
  - Pulsing "404" text with gradient
  - Smooth slide-up animation on page load
- **Clean, premium look** with soft shadows and rounded corners
- **Clear typography** for easy reading on all devices

### 📱 Responsive Design

- **Optimized for mobile devices** (320px - 480px)
- **Tablet-friendly** (481px - 768px)
- **Desktop compatible** (769px+)
- Uses modern CSS with `dvh` units for better mobile support
- Adjusts font sizes and spacing for different screen sizes

### 🎨 User-Friendly Features

- **Contextual navigation**:
  - Shows "Dashboard" link if user is authenticated
  - Shows "Login" link if user is not authenticated
  - "Back" button to return to previous page
  - "Home" button that goes to appropriate page based on auth status
- **Clear messaging** in Indonesian (Bahasa Indonesia)
- **Helpful guidance** to get users back on track

## 🔧 Implementation Details

### Files Created/Modified

**Created:**

- ✨ `src/views/NotFound.vue` - The 404 page component

**Modified:**

- 🔧 `src/router/index.js` - Added catch-all route for undefined paths

### Route Configuration

The router now includes a catch-all route that must be **last** in the routes array:

```javascript
{
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: NotFound
}
```

This route will match ANY path that doesn't match the routes defined before it.

### Smart Navigation

The 404 page intelligently redirects users based on authentication:

```javascript
// If authenticated
"Kembali ke Beranda" → /merchants (Dashboard)

// If not authenticated
"Kembali ke Beranda" → /login (Login page)

// Always available
"Kembali" → Go to previous page
"Dashboard" link → /merchants (if authenticated)
"Login" link → /login (if not authenticated)
```

## 🧪 Testing

Test the 404 page by navigating to undefined routes:

```
http://localhost:8080/nonexistent-page
http://localhost:8080/random/path/that/does/not/exist
http://localhost:8080/merchants/999999/invalid
http://localhost:8080/anything-else
```

All of these will show the 404 page!

## 🎨 Design Specifications

### Colors

- **Background Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Primary Text**: `#2d3748` (dark gray)
- **Secondary Text**: `#4a5568` (medium gray)
- **Helper Text**: `#718096` (light gray)
- **Primary Button**: Purple gradient matching background
- **Secondary Button**: `#f7fafc` (very light gray)
- **Links**: `#667eea` (purple)

### Typography

- **404 Code**: 5em (4em on mobile, 3.5em on small mobile)
- **Title**: 1.75em (1.5em on mobile, 1.3em on small mobile)
- **Body Text**: 1em (0.95em on mobile)
- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif

### Animations

1. **Page Load**: Slide up with fade in (0.6s)
2. **Magnifying Glass**: Bounce up and down (2s infinite)
3. **404 Text**: Pulse opacity (2s infinite)
4. **Buttons**: Lift on hover with shadow increase
5. **Links**: Lift and background change on hover

### Responsive Breakpoints

- **≤ 360px**: Extra small mobile (smallest font sizes)
- **361px - 480px**: Small mobile (reduced font sizes)
- **481px+**: Normal sizes

## 🌐 Internationalization (i18n) Ready

Currently in Indonesian, but designed to be easily translated. To add English or other languages in the future, simply update these text strings:

```vue
<!-- Current Indonesian -->
<h1>Halaman Tidak Ditemukan</h1>
<p>Maaf, halaman yang Anda cari tidak dapat ditemukan...</p>
<button>Kembali ke Beranda</button>
<button>Kembali</button>

<!-- Future English example -->
<h1>Page Not Found</h1>
<p>Sorry, the page you are looking for could not be found...</p>
<button>Back to Home</button>
<button>Go Back</button>
```

## 🔒 Security Considerations

- **No authentication required** - The 404 page is accessible to everyone
- **Safe navigation** - Uses router methods, not direct window.location
- **No sensitive info** - Doesn't expose route structure or other pages
- **Contextual links** - Only shows Dashboard link if user is authenticated

## ♿ Accessibility

- **Semantic HTML** - Proper heading hierarchy
- **Sufficient contrast** - All text meets WCAG AA standards
- **Touch-friendly** - Buttons are large enough for touch targets
- **Keyboard navigation** - All interactive elements are keyboard accessible
- **Screen reader friendly** - Clear, descriptive text

## 🚀 Performance

- **Lightweight** - No external dependencies
- **Fast load** - Simple CSS animations
- **Optimized images** - Uses emoji for icons (no image files)
- **Minimal JavaScript** - Only router navigation logic

## 📝 Usage Examples

### Programmatic Navigation to 404

If you need to programmatically navigate to the 404 page:

```javascript
import { useRouter } from "vue-router";

const router = useRouter();

// Navigate to 404 page
router.push({ name: "NotFound" });

// Or with a specific path
router.push("/page-does-not-exist");
```

### Custom 404 Handling in API

You might want to show the 404 page when an API resource isn't found:

```javascript
import { get } from "@/utils/api";
import { useRouter } from "vue-router";

const router = useRouter();

try {
  const merchant = await get(`/merchants/${id}`);
} catch (error) {
  if (error.message.includes("404")) {
    router.push({ name: "NotFound" });
  }
}
```

## 🎉 Summary

Your application now has a **complete 404 error handling system** with:

- ✅ Beautiful, modern design
- ✅ Fully responsive (mobile-first)
- ✅ Smooth animations
- ✅ Smart contextual navigation
- ✅ Consistent with app style
- ✅ Easy to maintain and customize

Users will never see a blank page or browser error when they navigate to an undefined route!

## 🔗 Related Documentation

- `src/router/index.js` - Route configuration
- `src/views/NotFound.vue` - 404 page component
- `AUTHENTICATION.md` - Authentication system (for contextual navigation)
