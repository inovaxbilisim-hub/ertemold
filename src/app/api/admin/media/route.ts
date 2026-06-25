import { verifySession } from '@/core/auth/auth';
import { v2 as cloudinary } from 'cloudinary';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';
import { getCloudinaryConfig } from '@/modules/settings/lib/data-settings';

function extractCloudinaryPublicId(url: string): string | null {
  try {
    const u = new URL(url);
    const marker = '/upload/';
    const idx = u.pathname.indexOf(marker);
    if (idx < 0) return null;

    let afterUpload = u.pathname.slice(idx + marker.length);
    // remove version segment like v1777856594/
    afterUpload = afterUpload.replace(/^v\d+\//, '');

    // strip extension from last segment
    const parts = afterUpload.split('/');
    const last = parts.pop();
    if (!last) return null;
    const withoutExt = last.replace(/\.[a-zA-Z0-9]+$/, '');
    parts.push(withoutExt);

    return parts.join('/');
  } catch {
    return null;
  }
}

async function getCloudinaryCredentials() {
  // Try DB config first (cache-lı), fallback to env vars
  const dbConfig = await getCloudinaryConfig();
  return {
    cloudName: (dbConfig?.cloudinary_cloud_name || process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    apiKey: (dbConfig?.cloudinary_api_key || process.env.CLOUDINARY_API_KEY || '').trim(),
    apiSecret: (dbConfig?.cloudinary_api_secret || process.env.CLOUDINARY_API_SECRET || '').trim(),
    uploadPreset: (dbConfig?.cloudinary_upload_preset || process.env.CLOUDINARY_UPLOAD_PRESET || '').trim(),
  };
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  const { cloudName, apiKey, apiSecret } = await getCloudinaryCredentials();

  const hasCloudinaryConfig = Boolean(cloudName && apiKey && apiSecret);

  if (!hasCloudinaryConfig) {
    return ok({ 
      files: [], 
      warning: 'Cloudinary yapılandırması eksik. Görselleri görmek için .env dosyasını veya Ayarlar panelini kontrol edin.' 
    });
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  try {
    const result = await cloudinary.api.resources({ 
      type: 'upload', 
      max_results: 500,
      resource_type: 'image' 
    });
    
    const files = (result.resources || []).map((resource: any) => ({
      url: resource.secure_url,
      name: resource.public_id.split('/').pop() || resource.public_id,
      size: resource.bytes,
      date: new Date(resource.created_at),
      source: 'cloud' as const
    }));
    
    files.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
    return ok({ files });
  } catch (err: any) {
    console.error('Cloudinary listing error details:', err);
    return serverError(`Cloudinary listeleme hatası: ${err.message || 'Bilinmeyen hata'}`);
  }
}

export async function DELETE(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  const { cloudName, apiKey, apiSecret } = await getCloudinaryCredentials();

  const hasCloudinaryConfig = Boolean(cloudName) && Boolean(apiKey) && Boolean(apiSecret);

  if (!hasCloudinaryConfig) {
    return badRequest('Cloudinary yapılandırması eksik.');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  try {
    const { url } = await request.json();
    if (!url) return badRequest('URL is required');

    if (url.includes('cloudinary.com')) {
      const publicId = extractCloudinaryPublicId(url);
      if (!publicId) {
        return badRequest('Cloudinary public_id çözümlenemedi.');
      }

      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      return ok({ success: true, source: 'cloud' });
    }

    return badRequest('Sadece Cloudinary üzerinden yüklenen dosyalar silinebilir.');
  } catch (error) {
    return serverError(error);
  }
}


export async function OPTIONS() {
  return ok({ ok: true });
}
