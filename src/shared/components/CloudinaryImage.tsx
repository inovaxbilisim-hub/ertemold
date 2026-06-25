'use client';

import Image, { type ImageProps } from 'next/image';
import { cloudinaryAutoFormat } from '@/shared/lib/cloudinary';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '@/modules/settings/context/SettingsContext';

export interface CloudinaryImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  locationName?: string;
  serviceName?: string;
}

export default function CloudinaryImage({ src, alt, fallbackSrc, locationName, serviceName, style, fill, className, ...props }: CloudinaryImageProps) {
  const [error, setError] = useState(false);
  const { settings } = useSettings() || {};
  
  // Localize alt tag if placeholders exist
  const resolvedAlt = alt
    .replace(/{location}/g, locationName || settings?.pseo_location_suffix || '')
    .replace(/{service}/g, serviceName || '');

  const cloudName = settings?.cloudinary_cloud_name;
  // cloudinaryAutoFormat cloudName yoksa undefined döner → o zaman ham src'yi kullan
  // src boş/null ise fallbackSrc'e düş, o da yoksa Star ikonu göster
  const primarySrc = cloudinaryAutoFormat(src || undefined, cloudName) || src || undefined;
  const resolvedSrc = !error ? (primarySrc || fallbackSrc) : (fallbackSrc || primarySrc);

  if (!resolvedSrc) {
    return <Star size={24} className="admin-reference-fallback-icon" />;
  }

  // If fill prop is used, don't override width/height in style
  const mergedStyle = fill ? {
    ...style,
  } : {
    width: 'auto',
    height: 'auto',
    ...style,
  };

  // Determine sizes prop to avoid Next.js warnings when using fill
  const defaultSizes = fill ? "(max-width: 768px) 100vw, 50vw" : undefined;
  const imageSizes = props.sizes || defaultSizes;

  return (
    <Image 
      src={resolvedSrc} 
      alt={resolvedAlt} 
      fill={fill}
      sizes={imageSizes}
      onError={() => setError(true)}
      style={mergedStyle} 
      className={className}
      unoptimized={/^https?:\/\//.test(resolvedSrc)}
      {...props} 
    />
  );
}
