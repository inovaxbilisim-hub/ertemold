import { verifySession } from '@/core/auth/auth';
import { v2 as cloudinary } from 'cloudinary';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';
import { getCloudinaryConfig } from '@/modules/settings/lib/data-settings';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'image/svg+xml', 'image/x-icon'
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  // Get Cloudinary config from cache (5-min TTL) with env fallback
  const dbConfig = await getCloudinaryConfig();
  const cloudName = (dbConfig?.cloudinary_cloud_name || process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = (dbConfig?.cloudinary_api_key || process.env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = (dbConfig?.cloudinary_api_secret || process.env.CLOUDINARY_API_SECRET || '').trim();

  const hasCloudinaryConfig = Boolean(cloudName && apiKey && apiSecret);

  if (!hasCloudinaryConfig) {
    return badRequest('Cloudinary yapılandırması eksik. .env dosyanızı veya Ayarlar panelini kontrol edin.');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return badRequest('Dosya bulunamadı.');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return badRequest('Sadece resim dosyaları yüklenebilir.');
    }

    if (file.size > MAX_SIZE) {
      return badRequest('Dosya boyutu 10MB\'ı aşamaz.');
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      console.log('Starting Cloudinary upload for:', file.name, 'to cloud:', cloudName);
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `uploads${folder && folder !== 'uploads' ? `/${folder}` : ''}`,
              use_filename: true,
              unique_filename: true,
              resource_type: 'image',
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary stream error:', error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          )
          .end(buffer);
      });

      console.log('Cloudinary upload success:', uploadResult.secure_url);
      return ok({ url: uploadResult.secure_url });
    } catch (cloudinaryErr: any) {
      console.error('Cloudinary upload error details:', JSON.stringify(cloudinaryErr, null, 2));
      const message = cloudinaryErr?.message || cloudinaryErr?.error?.message || 'Bilinmeyen Cloudinary hatası';
      return serverError(`Cloudinary Hatası: ${message}`);
    }
  } catch (error) {
    console.error('Upload error:', error);
    return serverError(error);
  }
}


export async function OPTIONS() {
  return ok({ ok: true });
}
