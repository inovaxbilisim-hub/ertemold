export interface ClimateProfile {
  id: number;
  code: string;
  nameTr: string;
  conditionDescription: string;
  recommendationSuffix: string;
  sortOrder: number;
  active: boolean;
}

export interface CityClimate {
  id: number;
  citySlug: string;
  climateProfileId: number;
}

export interface ClimateProfileWithCity extends ClimateProfile {
  citySlug?: string;
}