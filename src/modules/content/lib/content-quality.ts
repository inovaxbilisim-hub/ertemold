/**
 * Content Quality & Threshold Checker
 * Prevents thin content by validating minimum data requirements
 */

import type { SiteSettings } from '@/core/types';

export interface ContentQualityCheck {
  passesThreshold: boolean;
  reason?: string;
  score: number; // 0-100
  details: {
    hasProjects: boolean;
    projectCount: number;
    hasReferences: boolean;
    referenceCount: number;
    hasUniqueProfile: boolean;
  };
}

/**
 * Check if a city page meets minimum content quality standards
 */
export function checkCityContentQuality(
  _citySlug: string,
  cityStats: { totalProjects: number; totalSqm: number } | null,
  cityReferences: any[],
  metadata: any | null,
  settings: SiteSettings | null
): ContentQualityCheck {
  const minProjects = settings?.content_min_projects ?? 2;
  const minReferences = settings?.content_min_references ?? 1;
  const requireUniqueData = settings?.content_require_unique_data ?? false;

  const projectCount = cityStats?.totalProjects || 0;
  const referenceCount = cityReferences?.length || 0;
  const hasMetadata = Boolean(metadata);
  
  // Calculate quality score (0-100)
  let score = 0;
  
  // Projects contribute 40 points
  if (projectCount >= minProjects) {
    score += 40;
  } else if (projectCount > 0) {
    score += (projectCount / minProjects) * 40;
  }
  
  // References contribute 30 points
  if (referenceCount >= minReferences) {
    score += 30;
  } else if (referenceCount > 0) {
    score += (referenceCount / minReferences) * 30;
  }
  
  // Metadata contributes 30 points
  if (hasMetadata) {
    score += 30;
  }

  // Check thresholds
  const hasProjects = projectCount >= minProjects;
  const hasReferences = referenceCount >= minReferences;
  const hasUniqueProfile = hasMetadata;

  let passesThreshold = false;
  let reason: string | undefined;

  if (hasProjects || hasReferences) {
    // Pass if has projects OR references
    passesThreshold = true;
  } else if (requireUniqueData && hasUniqueProfile) {
    // Pass if unique profile required and exists
    passesThreshold = true;
  } else {
    // Fail
    passesThreshold = false;
    reason = `Insufficient data: ${projectCount} projects (min: ${minProjects}), ${referenceCount} references (min: ${minReferences})`;
  }

  return {
    passesThreshold,
    reason,
    score: Math.round(score),
    details: {
      hasProjects,
      projectCount,
      hasReferences,
      referenceCount,
      hasUniqueProfile,
    },
  };
}

/**
 * Get recommendation for improving content quality
 */
function getQualityRecommendation(check: ContentQualityCheck): string {
  if (check.passesThreshold) {
    if (check.score >= 80) {
      return 'Excellent content quality';
    } else if (check.score >= 60) {
      return 'Good content quality, consider adding more projects or references';
    } else {
      return 'Passes minimum threshold, but more data would improve quality';
    }
  }

  const { details } = check;
  const recommendations: string[] = [];

  if (!details.hasProjects) {
    recommendations.push(`Add at least ${2 - details.projectCount} more project(s)`);
  }
  if (!details.hasReferences) {
    recommendations.push(`Add at least ${1 - details.referenceCount} more reference(s)`);
  }
  if (!details.hasUniqueProfile) {
    recommendations.push('Add city-specific metadata (climate, OSB, industry profile)');
  }

  return recommendations.join('; ');
}

/**
 * Should we create/show this city page?
 */
export function shouldShowCityPage(
  check: ContentQualityCheck,
  settings: SiteSettings | null
): boolean {
  // If redirect setting is enabled and threshold not met, don't show
  if (settings?.content_redirect_to_main && !check.passesThreshold) {
    return false;
  }

  // Always show if passes threshold
  if (check.passesThreshold) {
    return true;
  }

  // Don't show if score is too low (below 30)
  return check.score >= 30;
}
