import { createClient } from "@supabase/supabase-js"
import { getSiteUrl } from "./url-utils"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "pkce",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use the site URL for redirects
    redirectTo: `${typeof window !== "undefined" ? window.location.origin : getSiteUrl()}/auth/callback`,
  },
})
