// Reference domain input validation
// Thin content prevention: zorunlu alanlar

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateReferenceInput(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Zorunlu alanlar
  if (!data.name || String(data.name).trim().length === 0) {
    errors.push('Firma adı zorunludur.');
  }

  // Thin content prevention: en az bir lokasyon alanı
  if (!data.city_name && !data.city_slug && !data.service_slug) {
    warnings.push('Thin content riski: Şehir veya hizmet bilgisi girilmedi. SEO için önerilir.');
  }

  // Proje detayı kontrolü
  if (!data.projectSummary && !data.description) {
    warnings.push('Thin content riski: Proje özeti veya açıklama girilmedi. Google değerlendirmesi için önerilir.');
  }

  // Medya kontrolü
  if (!data.featuredImageUrl && !data.beforeImageUrl && !data.afterImageUrl) {
    warnings.push('Görsel önerisi: En az bir görsel (öne çıkan, önceki veya sonraki) yüklenmesi önerilir.');
  }

  // m² kontrolü
  if (data.project_size !== undefined && data.project_size !== null && String(data.project_size).length > 0) {
    const size = Number(data.project_size);
    if (isNaN(size) || size < 1) {
      warnings.push('Geçerli bir alan (m²) değeri giriniz.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}