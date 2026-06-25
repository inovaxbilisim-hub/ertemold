export function cloudinaryAutoFormat(src?: string | null, cloudName?: string): string | undefined {
  if (!src || typeof src !== 'string') return undefined;

  const resolvedCloudName = cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // If the src is a relative path and we have a cloudName, construct the full Cloudinary URL
  if (!src.startsWith('http')) {
    // If no cloudName is configured, we cannot resolve a relative path → return undefined
    if (!resolvedCloudName) return undefined;
    
    // Check if the src already has a transformation
    if (/(?:f_auto|q_auto|w_auto|c_limit|[a-z0-9,_:]+\/)/.test(src)) {
      return `https://res.cloudinary.com/${resolvedCloudName}/image/upload/${src}`;
    }
    // Prepend default transformations
    return `https://res.cloudinary.com/${resolvedCloudName}/image/upload/f_auto,q_auto:eco,w_auto,c_limit/${src}`;
  }

  // Fallback for existing full URLs
  if (!src.includes('res.cloudinary.com')) return src;
  if (!src.includes('/upload/')) return src;

  // If Cloudinary already has a format/quality/width transformation, leave it alone.
  if (/\/upload\/(?:f_auto|q_auto|w_auto|c_limit|[a-z0-9,_:]+\/)/.test(src)) {
    return src;
  }

  // Insert transformations after /upload/ and before version or public_id
  // e.g., /upload/v1234567890/ -> /upload/f_auto,q_auto:eco,w_auto,c_limit/v1234567890/
  return src.replace('/upload/', '/upload/f_auto,q_auto:eco,w_auto,c_limit/');
}
