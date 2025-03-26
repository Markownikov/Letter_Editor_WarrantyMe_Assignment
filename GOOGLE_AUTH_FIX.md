# Fixing Google Sign-In Issues in Production

The "Failed to sign in with Google" error usually occurs due to one of these common causes:

## 1. Firebase Configuration Issues

### Solution:
1. Copy your Firebase configuration from your Firebase console to your `.env.production` file
2. Ensure all variables are correctly set during the build process

### Verifying the fix:
- Check browser console for any Firebase initialization errors
- Ensure Firebase Auth domain is correct for your production environment

## 2. Google API OAuth Redirect URI Configuration

### Solution:
1. Go to [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > Credentials
2. Find your OAuth Client ID used for the app
3. Add your production domain to "Authorized JavaScript origins" (e.g., `https://your-app.onrender.com`)
4. Add your production redirect URIs (e.g., `https://your-app.onrender.com`)
5. Save the changes

## 3. CORS Issues

### Solution:
1. Update the CORS configuration in your backend server:

```javascript
// Update cors configuration in server.js
app.use(cors({ 
  origin: [
    'https://your-production-domain.com', 
    'http://localhost:3000'
  ], 
  credentials: true 
}));
```

## 4. API URL Configuration

### Solution:
1. Ensure your client is connecting to the correct production API URL:

```javascript
// In your API service or fetch calls, use:
const API_URL = process.env.REACT_APP_API_URL || 'https://your-production-api.com';
```

## 5. Deployment With Proper Environment Variables

### Solution:
1. Update your render.yaml to include all needed environment variables:

```yaml
# In render.yaml, add these to envVars section:
- key: REACT_APP_FIREBASE_API_KEY
  sync: false
- key: REACT_APP_FIREBASE_AUTH_DOMAIN
  sync: false
- key: REACT_APP_FIREBASE_PROJECT_ID
  sync: false
```

2. When deploying, ensure the build process has access to these variables

## 6. Rebuild After Updating Configuration

After making any of these changes:
1. Rebuild your application: `npm run build`
2. Redeploy the updated build to your hosting platform
3. Clear browser cache and cookies before testing again

## 7. Cookie/Session Issues

In production with HTTPS, cookies require proper settings:

```javascript
// In server.js
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: true, // Important for HTTPS sites
    sameSite: 'none', // For cross-origin requests
    maxAge: 3600000 
  }
}));
```

## Quick Implementation Steps

1. Update Firebase configuration
2. Add your production domain to Google Cloud Console
3. Update CORS settings in server.js
4. Update API URLs to point to production
5. Rebuild and redeploy
6. Test again in incognito mode (to avoid cached credentials)
