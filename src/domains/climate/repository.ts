import 'server-only';
import { dbGet, dbAll } from '@/core/database/db';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import type { ClimateProfile, CityClimate } from './types';

export class ClimateRepository {
  static getAllProfiles = cache(unstable_cache(
    async (): Promise<ClimateProfile[]> => {
      const rows = await dbAll<Record<string, unknown>>(
        'SELECT id, code, name_tr, condition_description, recommendation_suffix, sort_order, active FROM climate_profiles WHERE active = true ORDER BY sort_order ASC'
      );
      return rows.map(r => ({
        id: Number(r.id),
        code: String(r.code),
        nameTr: String(r.name_tr),
        conditionDescription: String(r.condition_description),
        recommendationSuffix: String(r.recommendation_suffix),
        sortOrder: Number(r.sort_order ?? 0),
        active: Boolean(r.active),
      }));
    },
    ['climate-profiles'],
    { tags: ['climate'], revalidate: 86400 }
  ));

  static getProfileByCode = cache(unstable_cache(
    async (code: string): Promise<ClimateProfile | null> => {
      const row = await dbGet<Record<string, unknown>>(
        'SELECT id, code, name_tr, condition_description, recommendation_suffix, sort_order, active FROM climate_profiles WHERE code = $1 AND active = true LIMIT 1',
        [code]
      );
      if (!row) return null;
      return {
        id: Number(row.id),
        code: String(row.code),
        nameTr: String(row.name_tr),
        conditionDescription: String(row.condition_description),
        recommendationSuffix: String(row.recommendation_suffix),
        sortOrder: Number(row.sort_order ?? 0),
        active: Boolean(row.active),
      };
    },
    ['climate-profile-by-code'],
    { tags: ['climate'], revalidate: 86400 }
  ));

  static getCityClimate = cache(unstable_cache(
    async (citySlug: string): Promise<CityClimate | null> => {
      const row = await dbGet<Record<string, unknown>>(
        'SELECT id, city_slug, climate_profile_id FROM city_climate WHERE city_slug = $1 LIMIT 1',
        [citySlug]
      );
      if (!row) return null;
      return {
        id: Number(row.id),
        citySlug: String(row.city_slug),
        climateProfileId: Number(row.climate_profile_id),
      };
    },
    ['city-climate'],
    { tags: ['climate'], revalidate: 86400 }
  ));

  static getProfileForCity = cache(unstable_cache(
    async (citySlug: string): Promise<ClimateProfile | null> => {
      const cityClimate = await ClimateRepository.getCityClimate(citySlug);
      if (!cityClimate) return null;
      
      const rows = await dbAll<Record<string, unknown>>(
        'SELECT id, code, name_tr, condition_description, recommendation_suffix, sort_order, active FROM climate_profiles WHERE id = $1 AND active = true LIMIT 1',
        [cityClimate.climateProfileId]
      );
      if (rows.length === 0) return null;
      
      const r = rows[0];
      return {
        id: Number(r.id),
        code: String(r.code),
        nameTr: String(r.name_tr),
        conditionDescription: String(r.condition_description),
        recommendationSuffix: String(r.recommendation_suffix),
        sortOrder: Number(r.sort_order ?? 0),
        active: Boolean(r.active),
      };
    },
    ['climate-profile-for-city'],
    { tags: ['climate'], revalidate: 86400 }
  ));

  static getDefaultProfile = cache(unstable_cache(
    async (): Promise<ClimateProfile | null> => {
      const row = await dbGet<Record<string, unknown>>(
        'SELECT id, code, name_tr, condition_description, recommendation_suffix, sort_order, active FROM climate_profiles WHERE code = \'karasal\' AND active = true LIMIT 1'
      );
      if (!row) return null;
      return {
        id: Number(row.id),
        code: String(row.code),
        nameTr: String(row.name_tr),
        conditionDescription: String(row.condition_description),
        recommendationSuffix: String(row.recommendation_suffix),
        sortOrder: Number(row.sort_order ?? 0),
        active: Boolean(row.active),
      };
    },
    ['climate-default-profile'],
    { tags: ['climate'], revalidate: 86400 }
  ));
}