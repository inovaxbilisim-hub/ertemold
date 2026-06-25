// src/app/api/admin/reviews/route.ts
// Reviews management API: Create, read, update, delete reviews

import { revalidatePath, revalidateTag } from 'next/cache';
import { dbAll, dbGet, dbDelete, dbRun } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, badRequest, serverError, notFound } from '@/core/api/response';
import type { GoogleReview, ReviewListResponse } from '@/core/types/reviews';

/** Tüm 3 handler'da tekrarlanan business_metadata recalc mantığı */
async function recalcBusinessMetadata(businessId: string) {
  const stats = await dbGet<{ count: number; avg_rating: number }>(
    `SELECT COUNT(*) as count, AVG(rating) as avg_rating
     FROM google_reviews
     WHERE business_id = ? AND verified = TRUE`,
    [businessId]
  );

  const metadataId = `biz_${businessId}`;
  await dbRun(
    `INSERT INTO business_metadata
     (id, google_business_profile_id, business_name, total_reviews, average_rating, last_sync)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO UPDATE SET
       total_reviews = $4,
       average_rating = $5,
       last_sync = $6,
       updated_at = CURRENT_TIMESTAMP`,
    [
      metadataId,
      businessId,
      'Ertem Epoksi',
      stats?.count || 0,
      stats?.avg_rating ? parseFloat(Number(stats.avg_rating).toFixed(1)) : 0,
      new Date().toISOString(),
    ]
  );
}

/**
 * GET /api/admin/reviews
 * List reviews with filtering
 */
export async function GET(req: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    
    // Query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');
    const businessId = searchParams.get('business_id');
    const verified = searchParams.get('verified');
    const minRating = searchParams.get('min_rating');
    const maxRating = searchParams.get('max_rating');

    // Build query
    let query = 'SELECT * FROM google_reviews WHERE 1=1';
    const params: any[] = [];

    if (businessId) {
      query += ' AND business_id = ?';
      params.push(businessId);
    }

    if (verified !== null) {
      query += ' AND verified = ?';
      params.push(verified === 'true' ? 1 : 0);
    }

    if (minRating) {
      query += ' AND rating >= ?';
      params.push(parseInt(minRating));
    }

    if (maxRating) {
      query += ' AND rating <= ?';
      params.push(parseInt(maxRating));
    }

    query += ' ORDER BY review_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Fetch reviews
    const reviews = await dbAll<GoogleReview>(query, params);

    // Count total
    let countQuery = 'SELECT COUNT(*) as count FROM google_reviews WHERE 1=1';
    const countParams: any[] = [];

    if (businessId) {
      countQuery += ' AND business_id = ?';
      countParams.push(businessId);
    }
    if (verified !== null) {
      countQuery += ' AND verified = ?';
      countParams.push(verified === 'true' ? 1 : 0);
    }
    if (minRating) {
      countQuery += ' AND rating >= ?';
      countParams.push(parseInt(minRating));
    }
    if (maxRating) {
      countQuery += ' AND rating <= ?';
      countParams.push(parseInt(maxRating));
    }

    const countResult = await dbGet<{ count: number }>(countQuery, countParams);
    const total = countResult?.count || 0;

    const response: ReviewListResponse = {
      reviews: reviews || [],
      total,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit
    };

    return ok(response);
  } catch (error) {
    console.error('GET /api/admin/reviews error:', error);
    return serverError('Failed to fetch reviews');
  }
}

/**
 * POST /api/admin/reviews
 * Create or import reviews
 */
export async function POST(req: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await req.json();
    const items = Array.isArray(data) ? data : [data];

    if (!items.length) {
      return badRequest('No items to import');
    }

    let insertedCount = 0;
    const businessIds = new Set<string>();

    for (const review of items) {
      // Validate required fields
      if (!review.business_id || !review.reviewer_name || !review.rating || !review.review_text || !review.review_date) {
        console.warn('Skipping invalid review:', review);
        continue;
      }

      // Validate rating
      const rating = parseInt(review.rating);
      if (rating < 1 || rating > 5) {
        console.warn('Invalid rating for review:', review);
        continue;
      }

      const reviewId = review.id || `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      try {
        await dbRun(
          `INSERT INTO google_reviews 
           (id, business_id, reviewer_name, rating, review_text, review_date, verified, source)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             reviewer_name = $3,
             rating = $4,
             review_text = $5,
             review_date = $6,
             verified = $7,
             source = $8,
             updated_at = CURRENT_TIMESTAMP`,
          [
            reviewId,
            review.business_id,
            review.reviewer_name,
            rating,
            review.review_text,
            new Date(review.review_date).toISOString(),
            review.verified || false,
            review.source || 'manual'
          ]
        );

        insertedCount++;
        businessIds.add(review.business_id);
      } catch (error) {
        console.error('Error inserting review:', error, review);
      }
    }

    // Update business_metadata aggregates
    for (const businessId of businessIds) {
      try {
        await recalcBusinessMetadata(businessId);
      } catch (error) {
        console.error('Error updating business_metadata:', error);
      }
    }

    // Revalidate schema and pages
    revalidateTag('reviews', 'default');
    revalidatePath('/hizmetler');

    return ok({
      success: true,
      imported: insertedCount,
      businessesUpdated: businessIds.size
    });
  } catch (error) {
    console.error('POST /api/admin/reviews error:', error);
    return serverError('Failed to import reviews');
  }
}

/**
 * PUT /api/admin/reviews/[id]
 * Update review verification status
 */
export async function PUT(req: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return badRequest('Missing review id');
    }

    const data = await req.json();
    const { verified } = data;

    if (typeof verified !== 'boolean') {
      return badRequest('verified must be boolean');
    }

    // Get review first
    const review = await dbGet<GoogleReview>(
      'SELECT * FROM google_reviews WHERE id = ? LIMIT 1',
      [reviewId]
    );

    if (!review) {
      return notFound('Review not found');
    }

    // Update review
    await dbRun(
      'UPDATE google_reviews SET verified = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [verified ? 1 : 0, reviewId]
    );

    // Recalculate business_metadata
    await recalcBusinessMetadata(review.business_id);

    // Revalidate
    revalidateTag('reviews', 'default');
    revalidatePath('/hizmetler');

    return ok({ success: true, review: { ...review, verified } });
  } catch (error) {
    console.error('PUT /api/admin/reviews error:', error);
    return serverError('Failed to update review');
  }
}

/**
 * DELETE /api/admin/reviews
 * Delete a review
 */
export async function DELETE(req: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return badRequest('Missing review id');
    }

    // Get review for business_id (to recalculate aggregates)
    const review = await dbGet<GoogleReview>(
      'SELECT * FROM google_reviews WHERE id = ? LIMIT 1',
      [reviewId]
    );

    if (!review) {
      return notFound('Review not found');
    }

    // Delete
    await dbDelete('google_reviews', 'id', reviewId);

    // Recalculate aggregates
    await recalcBusinessMetadata(review.business_id);

    // Revalidate
    revalidateTag('reviews', 'default');
    revalidatePath('/hizmetler');

    return ok({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/reviews error:', error);
    return serverError('Failed to delete review');
  }
}

