# Scriva Voice - Chrome Extension for Voice Transcription

Scriva Voice is a powerful Chrome extension that lets you dictate text into any field across the web.

## Features

- Unmatched accuracy with premium speech-to-text technology
- Unlimited usage with affordable subscription plans
- Privacy-focused with local storage of transcriptions
- Simple to use with keyboard shortcuts

## Getting Started

### Prerequisites

- Node.js 18.18 or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

\`\`\`bash
git clone https://github.com/yourusername/scriva-voice.git
cd scriva-voice
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
# or
yarn
\`\`\`

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

4. Set up the database:

Run the SQL commands in `supabase/schema.sql` in your Supabase SQL editor.

5. Run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication

Scriva Voice uses Supabase for authentication. Users can:

- Sign up with email and password
- Sign in with email and password
- Reset their password
- Update their profile information

## User Management

Users can manage their profiles and subscription plans through the dashboard.

## Subscription Management

Subscription management is handled through PayPal (coming soon).

## License

This project is licensed under the MIT License - see the LICENSE file for details.
