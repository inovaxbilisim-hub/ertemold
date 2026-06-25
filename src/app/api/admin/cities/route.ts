import { ok, unauthorized, serverError } from '@/core/api/response';
import { verifySession } from '@/core/auth/auth';
import { getCities } from '@/modules/content/lib/locations';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const citySlug = searchParams.get('city_slug');

    if (citySlug) {
      const city = (await getCities()).find(c => c.slug === citySlug);
      return ok(city ? [city] : []);
    }

    const cities = await getCities();
    return ok(cities);
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}
