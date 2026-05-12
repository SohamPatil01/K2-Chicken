/**
 * Fetches reviews from Google Business Profile and upserts them into the
 * local `reviews` table.  Returns a summary of what was imported.
 */

import pool from "@/lib/db";
import { fetchGBPReviews, starRatingToInt } from "@/lib/googleBusinessProfile";

export interface SyncResult {
  inserted: number;
  updated: number;
  total: number;
  errors: string[];
}

export async function syncGoogleReviews(): Promise<SyncResult> {
  const gbpReviews = await fetchGBPReviews();

  let inserted = 0;
  let updated = 0;
  const errors: string[] = [];

  const client = await pool.connect();
  try {
    for (const r of gbpReviews) {
      try {
        // Skip completely anonymous reviews without any comment.
        if (r.reviewer.isAnonymous && !r.comment) continue;

        const userName = r.reviewer.isAnonymous
          ? "Anonymous"
          : r.reviewer.displayName || "Google Reviewer";

        const rating = starRatingToInt(r.starRating);
        const comment = r.comment ?? null;
        const avatarUrl = r.reviewer.profilePhotoUrl ?? null;
        const reviewedAt = r.createTime ? new Date(r.createTime) : null;
        const reviewReply = r.reviewReply?.comment ?? null;

        const res = await client.query(
          `
          INSERT INTO reviews
            (user_name, rating, comment, is_approved, is_featured, display_order,
             source, external_review_id, reviewer_avatar_url, review_reply, reviewed_at)
          VALUES ($1,$2,$3,true,false,0,'google_business_profile',$4,$5,$6,$7)
          ON CONFLICT (external_review_id)
            WHERE external_review_id IS NOT NULL
          DO UPDATE SET
            user_name            = EXCLUDED.user_name,
            rating               = EXCLUDED.rating,
            comment              = EXCLUDED.comment,
            reviewer_avatar_url  = EXCLUDED.reviewer_avatar_url,
            review_reply         = EXCLUDED.review_reply,
            reviewed_at          = EXCLUDED.reviewed_at,
            updated_at           = CURRENT_TIMESTAMP
          RETURNING (xmax = 0) AS was_inserted
          `,
          [userName, rating, comment, r.reviewId, avatarUrl, reviewReply, reviewedAt]
        );

        if (res.rows[0]?.was_inserted) {
          inserted++;
        } else {
          updated++;
        }
      } catch (err) {
        errors.push(
          `reviewId ${r.reviewId}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  } finally {
    client.release();
  }

  return { inserted, updated, total: gbpReviews.length, errors };
}
