# Firebase Authentication Setup Guide

This guide will help you set up Firebase authentication with a new Google account for the Quantize website.

## Prerequisites

- A new Google account
- Access to the Firebase Console

## Step 1: Create a New Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your new Google account

2. **Create a New Project**
   - Click "Create a project"
   - Enter project name: `quantize-website-auth` (or your preferred name)
   - Choose whether to enable Google Analytics (optional)
   - Click "Create project"

## Step 2: Set Up Authentication

1. **Enable Authentication**
   - In your Firebase project dashboard, click "Authentication" in the left sidebar
   - Click "Get started" if this is your first time

2. **Configure Sign-in Methods**
   - Go to the "Sign-in method" tab
   - Enable "Email/Password":
     - Click on "Email/Password"
     - Toggle "Enable" to ON
     - Click "Save"
   
   - Enable "Google":
     - Click on "Google"
     - Toggle "Enable" to ON
     - Enter your project support email
     - Click "Save"

3. **Add Authorized Domains**
   - In the "Sign-in method" tab, scroll down to "Authorized domains"
   - Add your domains:
     - `localhost` (for development)
     - Your production domain (if you have one)

## Step 3: Get Firebase Configuration

1. **Add a Web App**
   - Go to Project Settings (gear icon in sidebar)
   - Scroll down to "Your apps" section
   - Click "Add app" → Web app icon (`</>`)
   - Enter app nickname: `quantize-website`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

2. **Copy Configuration**
   - Copy the `firebaseConfig` object that appears
   - It should look like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456",
     measurementId: "G-XXXXXXXXXX"
   };
   ```

## Step 4: Update Environment Variables

1. **Open your `.env.local` file** in the project root

2. **Replace the Firebase variables** with your new configuration:
   ```bash
   # Firebase Configuration (Replace with your new Firebase project credentials)
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

## Step 5: Test the Setup

1. **Start the development server**:
   ```bash
   yarn launch
   ```

2. **Navigate to the onboarding page**:
   - Go to `http://localhost:3001/onboarding`

3. **Test authentication**:
   - Try creating a new account with email/password
   - Try signing in with Google
   - Check that users appear in Firebase Console → Authentication → Users

## Step 6: Configure Google OAuth (Important!)

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Select your Firebase project

2. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in required fields:
     - App name: "Quantize Website"
     - User support email: your email
     - Developer contact information: your email

3. **Add Authorized Domains**
   - In OAuth consent screen, add authorized domains:
     - `localhost` (for development)
     - Your production domain

4. **Configure OAuth Client**
   - Go to "APIs & Services" → "Credentials"
   - Find your OAuth 2.0 client ID (created by Firebase)
   - Add authorized JavaScript origins:
     - `http://localhost:3001` (for development)
     - Your production URL

## Troubleshooting

### Common Issues

1. **"This app isn't verified" warning**
   - This is normal for new projects
   - Click "Advanced" → "Go to Quantize Website (unsafe)" during development

2. **"Unauthorized domain" error**
   - Make sure your domain is added to Firebase authorized domains
   - Check Google Cloud Console OAuth settings

3. **Google sign-in popup blocked**
   - Allow popups in your browser
   - Try disabling popup blockers

4. **Environment variables not loading**
   - Restart your development server after updating `.env.local`
   - Make sure variable names start with `VITE_`

### Testing Checklist

- [ ] Email/password signup works
- [ ] Email/password login works
- [ ] Google sign-in works
- [ ] Users appear in Firebase Console
- [ ] No console errors
- [ ] Onboarding flow completes successfully

## Security Notes

- Never commit your actual Firebase config to version control
- Use environment variables for all sensitive data
- Regularly review Firebase security rules
- Monitor authentication usage in Firebase Console

## Next Steps

After setup is complete:
1. Configure Firebase Security Rules
2. Set up user data storage (Firestore)
3. Configure email verification (optional)
4. Set up password reset functionality
5. Add user profile management

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Check Firebase Console for authentication logs
4. Ensure all domains are properly authorized