import { NextRequest, NextResponse } from 'next/server';
import { supabaseService, supabaseClient } from '@/lib/supabase';

// GET /api/settings?key=homepage_featured_vehicle_ids
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  try {
    const client = supabaseClient || supabaseService;
    if (!client) return NextResponse.json({ value: null });

    const { data, error } = await client.from('settings').select('value').eq('key', key).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ value: data?.value ?? null });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}

// POST /api/settings  { key: string, value: any }
export async function POST(req: NextRequest) {
  try {
    if (!supabaseService) return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    const body = await req.json();
    const { key, value } = body || {};
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    const { error } = await supabaseService.from('settings').upsert({ key, value });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


