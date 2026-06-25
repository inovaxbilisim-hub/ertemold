import { ClimateRepository } from './repository';
import type { ClimateProfile } from './types';

export class ClimateService {
  static async getProfileForCity(citySlug: string): Promise<ClimateProfile> {
    const profile = await ClimateRepository.getProfileForCity(citySlug);
    if (profile) return profile;
    
    const defaultProfile = await ClimateRepository.getDefaultProfile();
    if (defaultProfile) return defaultProfile;
    
    // Fallback to hardcoded default (should never happen after migration)
    return {
      id: 0,
      code: 'karasal',
      nameTr: 'Karasal İklim',
      conditionDescription: 'gece-gündüz arası yüksek sıcaklık farklarına',
      recommendationSuffix: 'termal şoklara ve sıcaklık farklılıklarına karşı esnekliğini koruyan, çatlama yapmayan özel poliüretan destekli sistemler sunuyoruz.',
      sortOrder: 0,
      active: true,
    };
  }

  static async getAllProfiles(): Promise<ClimateProfile[]> {
    return ClimateRepository.getAllProfiles();
  }

  static async getProfileByCode(code: string): Promise<ClimateProfile | null> {
    return ClimateRepository.getProfileByCode(code);
  }
}