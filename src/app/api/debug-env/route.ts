import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL || !!process.env.SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !!process.env.SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
    // Don't expose actual values, just check if they exist
    supabaseUrlLength: (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').length,
    anonKeyLength: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').length,
    serviceKeyLength: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').length,
  });
}
