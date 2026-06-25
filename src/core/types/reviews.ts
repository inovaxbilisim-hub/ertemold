// src/core/types/reviews.ts
// Type definitions for review management system

export interface GoogleReview {
  id: string;
  business_id: string;
  reviewer_name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  review_text: string;
  review_date: string; // ISO date
  verified: boolean;
  source: 'google' | 'manual' | 'api';
  created_at: string;
  updated_at: string;
}

interface BusinessMetadata {
  id: string;
  google_business_profile_id?: string;
  business_name: string;
  total_reviews: number;
  average_rating: number;
  last_sync?: string;
  updated_at: string;
  created_at: string;
}

interface CreateReviewInput {
  business_id: string;
  reviewer_name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  review_text: string;
  review_date: string;
  verified?: boolean;
  source?: 'google' | 'manual' | 'api';
}

interface ReviewListQuery {
  limit?: number;
  offset?: number;
  business_id?: string;
  verified?: boolean;
  min_rating?: number;
  max_rating?: number;
}

export interface ReviewListResponse {
  reviews: GoogleReview[];
  total: number;
  page: number;
  pageSize: number;
}

interface AggregateRating {
  '@type': 'AggregateRating';
  ratingValue: string;
  reviewCount: number;
  bestRating?: string;
  worstRating?: string;
}

interface ReviewSchema {
  '@type': 'Review';
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
  reviewBody: string;
  author?: {
    '@type': 'Person';
    name: string;
  };
  datePublished?: string;
}
