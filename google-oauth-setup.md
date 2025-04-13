# Google OAuth Setup Instructions

To fix the "redirect_uri_mismatch" error, you need to configure the correct redirect URI in your Google Cloud Console:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Find and edit your OAuth 2.0 Client ID
5. Add the following URLs to the "Authorized redirect URIs" section:
   - `https://qzdammtmzocjatkinbxe.supabase.co/auth/v1/callback`
   - `https://your-vercel-domain.vercel.app/auth/callback` (replace with your actual Vercel domain)
   - `http://localhost:3000/auth/callback` (for local development)
6. Click "Save"

After updating these settings, the OAuth flow should work correctly in both development and production environments.
