# Clerk Authentication Setup

## Quick Setup Steps

1. **Create a Clerk Account**
   - Go to https://clerk.com
   - Sign up for a free account
   - Create a new application

2. **Get Your Publishable Key**
   - In your Clerk Dashboard, go to API Keys
   - Copy your Publishable Key
   - Paste it in your `.env` file:
     ```
     VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
     ```

3. **Configure Email/Magic Link**
   - In Clerk Dashboard, go to "User & Authentication" → "Email, Phone, Username"
   - Enable "Email address" 
   - Under "Authentication strategies", enable "Email verification link"
   - Disable password if you only want magic link (optional)

4. **Customize Appearance (Optional)**
   - Go to "Customization" → "Theme" in Clerk Dashboard
   - Match your app's dark theme

## What's Integrated

- ✅ Sign in modal (no separate page needed)
- ✅ Magic link email authentication
- ✅ User button with profile/sign out
- ✅ Protected dashboard route
- ✅ Matches your app's theme

## How It Works

- Click "Sign In" in header → Modal opens
- Enter email → Receive magic link
- Click link → Automatically signed in
- User button appears in header with profile options
