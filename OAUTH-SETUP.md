# OAuth Setup Instructions

## Local Development Setup

1. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials
2. Make sure to set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for local development

## Supabase Configuration

1. Go to your Supabase dashboard
2. Navigate to Authentication > URL Configuration
3. Set the Site URL to your production URL (your Vercel domain)
4. Add `http://localhost:3000` to the "Redirect URLs" list for local development

## Google OAuth Configuration

To fix the "redirect_uri_mismatch" error, you need to configure the correct redirect URIs in your Google Cloud Console:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Find and edit your OAuth 2.0 Client ID
5. Add the following URLs to the "Authorized redirect URIs" section:
   - `https://qzdammtmzocjatkinbxe.supabase.co/auth/v1/callback`
   - `https://your-vercel-domain.vercel.app/auth/callback` (replace with your actual Vercel domain)
   - `http://localhost:3000/auth/callback` (for local development)
6. Click "Save"

## Vercel Environment Variables

Make sure to set these environment variables in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (set to your Vercel deployment URL)
