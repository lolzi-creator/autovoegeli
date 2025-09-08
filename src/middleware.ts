import { NextRequest, NextResponse } from 'next/server';

const locales = ['de', 'fr', 'en'];
const defaultLocale = 'de';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Only redirect if there is no locale and it's not already a locale path
  if (pathnameIsMissingLocale && pathname !== '/de' && pathname !== '/fr' && pathname !== '/en') {
    // Get locale from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    let locale = defaultLocale;
    
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(',')[0]
        .split('-')[0]
        .toLowerCase();
      
      if (locales.includes(preferredLocale)) {
        locale = preferredLocale;
      }
    }

    // Redirect to the locale-specific URL
    const redirectUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, static files)
    '/((?!_next|api|favicon.ico|.*\\.).*)',
  ],
};
