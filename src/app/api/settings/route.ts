import { NextRequest, NextResponse } from 'next/server';
import { supabaseService, supabaseClient } from '@/lib/supabase';

// GET /api/settings?key=homepage_featured_vehicle_ids
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  try {
    console.log(`Settings API GET called for key: ${key}`);
    
    const client = supabaseClient || supabaseService;
    if (!client) {
      console.error('No Supabase client available');
      return NextResponse.json({ value: null });
    }

    const { data, error } = await client.from('settings').select('value').eq('key', key).maybeSingle();
    if (error) {
      console.error('Supabase GET error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log(`Settings GET result for ${key}:`, data);
    
    // Parse the value if it's a JSON string
    let parsedValue = data?.value ?? null;
    if (typeof parsedValue === 'string') {
      try {
        parsedValue = JSON.parse(parsedValue);
      } catch (parseError) {
        console.warn(`Could not parse value for key ${key}:`, parseError);
        // Keep the string value if parsing fails
      }
    }
    
    return NextResponse.json({ value: parsedValue });
  } catch (e: any) {
    console.error('Settings API GET error:', e);
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}

// POST /api/settings  { key: string, value: any }
export async function POST(req: NextRequest) {
  try {
    console.log('Settings API POST called');
    
    if (!supabaseService) {
      console.error('Supabase service not configured');
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }
    
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    
    console.log('Request body:', body);
    
    const { key, value } = body || {};
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    
    // Ensure value is properly serialized
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    console.log(`Upserting settings: key=${key}, value=`, serializedValue);
    
    const { data, error } = await supabaseService
      .from('settings')
      .upsert({ key, value: serializedValue }, { onConflict: 'key' })
      .select();
    
    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('Settings upsert successful:', data);
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error('Settings API error:', e);
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


