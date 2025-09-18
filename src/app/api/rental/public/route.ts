import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

// GET /api/rental/public - Get rental cars and categories for public rental page
export async function GET() {
  try {
    // Get categories
    const { data: categories, error: categoriesError } = await supabaseService
      .from('rental_categories')
      .select('*')
      .order('name');

    if (categoriesError) {
      console.error('Error fetching rental categories:', categoriesError);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    // Get cars with categories
    const { data: cars, error: carsError } = await supabaseService
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

    if (carsError) {
      console.error('Error fetching rental cars:', carsError);
      return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
    }

    return NextResponse.json({ 
      categories: categories || [],
      cars: cars || []
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
