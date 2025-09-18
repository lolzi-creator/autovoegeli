import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

// GET /api/rental/cars - Get all rental cars with categories
export async function GET() {
  try {
    const { data, error } = await supabaseService
      .from('rental_cars')
      .select(`
        *,
        rental_categories (
          id,
          name,
          description,
          color
        )
      `)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching rental cars:', error);
      return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
    }

    return NextResponse.json({ cars: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/rental/cars - Create new rental car
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, brand, model, category_id, price_per_day, image_url,
      features, transmission, fuel_type, seats, doors, airbags,
      abs, air_conditioning, bluetooth, navigation,
      max_weight, cargo_volume, engine_size
    } = body;

    // Validate required fields
    if (!name || !brand || !model || !category_id || !price_per_day || 
        !transmission || !fuel_type || !seats || !doors || !airbags) {
      return NextResponse.json({ 
        error: 'Required fields: name, brand, model, category_id, price_per_day, transmission, fuel_type, seats, doors, airbags' 
      }, { status: 400 });
    }

    const { data, error } = await supabaseService
      .from('rental_cars')
      .insert([{
        name, brand, model, category_id, price_per_day, image_url,
        features: features || [],
        transmission, fuel_type, seats, doors, airbags,
        abs: abs || false,
        air_conditioning: air_conditioning || false,
        bluetooth: bluetooth || false,
        navigation: navigation || false,
        max_weight, cargo_volume, engine_size
      }])
      .select(`
        *,
        rental_categories (
          id,
          name,
          description,
          color
        )
      `)
      .single();

    if (error) {
      console.error('Error creating rental car:', error);
      return NextResponse.json({ error: 'Failed to create car' }, { status: 500 });
    }

    return NextResponse.json({ car: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/rental/cars - Update rental car
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id, name, brand, model, category_id, price_per_day, image_url,
      features, transmission, fuel_type, seats, doors, airbags,
      abs, air_conditioning, bluetooth, navigation,
      max_weight, cargo_volume, engine_size
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Car ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseService
      .from('rental_cars')
      .update({
        name, brand, model, category_id, price_per_day, image_url,
        features: features || [],
        transmission, fuel_type, seats, doors, airbags,
        abs: abs || false,
        air_conditioning: air_conditioning || false,
        bluetooth: bluetooth || false,
        navigation: navigation || false,
        max_weight, cargo_volume, engine_size,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        rental_categories (
          id,
          name,
          description,
          color
        )
      `)
      .single();

    if (error) {
      console.error('Error updating rental car:', error);
      return NextResponse.json({ error: 'Failed to update car' }, { status: 500 });
    }

    return NextResponse.json({ car: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/rental/cars - Delete rental car (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Car ID is required' }, { status: 400 });
    }

    // Soft delete by setting is_active to false
    const { error } = await supabaseService
      .from('rental_cars')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting rental car:', error);
      return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
