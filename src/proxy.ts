import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * i18n Proxy - Accept-Language header'ina gore locale belirler.
 *
 * - Varsayilan: 'tr' (Turkce)
 * - Ingilizce tarayicilar icin: 'en'
 * - URL'de ?lang=tr veya ?lang=en parametresi ile override edilebilir
 * - Cookie'de locale varsa ona oncelik verilir
 */

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - admin (admin routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|admin).*)',
  ],
};

const SUPPORTED_LOCALES = ['tr', 'en'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: Locale = 'tr';

function getLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const locales = acceptLanguage
    .split(',')
    .map((lang) => {
      const [locale, quality = 'q=1'] = lang.trim().split(';');
      const q = parseFloat(quality.replace('q=', '')) || 1;
      return { locale: locale.split('-')[0].toLowerCase(), q };
    })
    .sort((a, b) => b.q - a.q);

  for (const { locale } of locales) {
    if (SUPPORTED_LOCALES.includes(locale as Locale)) {
      return locale as Locale;
    }
  }

  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const urlLang = request.nextUrl.searchParams.get('lang') as Locale | null;
  if (urlLang && SUPPORTED_LOCALES.includes(urlLang)) {
    const response = NextResponse.next();
    response.cookies.set('locale', urlLang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return response;
  }

  const cookieLocale = request.cookies.get('locale')?.value as Locale | undefined;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    const response = NextResponse.next();
    response.headers.set('x-locale', cookieLocale);
    return response;
  }

  const acceptLanguage = request.headers.get('accept-language');
  const detectedLocale = getLocaleFromAcceptLanguage(acceptLanguage);

  const response = NextResponse.next();
  response.headers.set('x-locale', detectedLocale);
  response.cookies.set('locale', detectedLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return response;
}
