/**
 * Google Business Profile review sync service.
 *
 * Uses a stored OAuth2 refresh token to obtain short-lived access tokens and
 * calls the My Business Business Information / My Business Lodging APIs.
 *
 * Required env vars (server-side only – never expose to the browser):
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REFRESH_TOKEN      – long-lived refresh token from one-time OAuth flow
 *   GBP_ACCOUNT_ID            – e.g.  "accounts/123456789012345"
 *   GBP_LOCATION_ID           – e.g.  "locations/9876543210123456"
 *                               OR the full resource name accepted by the API:
 *                               "accounts/123.../locations/987..."
 */

export interface GBPReview {
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
    isAnonymous?: boolean;
  };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;     // ISO 8601
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
  name: string;           // full resource name
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

const STAR_MAP: Record<GBPReview["starRating"], number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

function isConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    (process.env.GBP_ACCOUNT_ID || process.env.GBP_LOCATION_ID)
  );
}

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${body}`);
  }

  const data: TokenResponse = await res.json();
  return data.access_token;
}

/** Build the full location resource name regardless of what the user supplied. */
function getLocationName(): string {
  // If GBP_LOCATION_ID already looks like a full path, use it as-is.
  const loc = process.env.GBP_LOCATION_ID ?? "";
  if (loc.startsWith("accounts/")) return loc;

  const acct = process.env.GBP_ACCOUNT_ID ?? "";
  // accounts/xxx/locations/yyy
  if (loc) return `${acct}/locations/${loc}`;
  // Fallback: caller supplied only GBP_ACCOUNT_ID (we can still list locations)
  return acct;
}

export async function fetchGBPReviews(): Promise<GBPReview[]> {
  if (!isConfigured()) {
    throw new Error(
      "Google Business Profile credentials are not configured. " +
        "Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, " +
        "GBP_ACCOUNT_ID and GBP_LOCATION_ID in your environment."
    );
  }

  const token = await getAccessToken();
  const location = getLocationName();

  // My Business Reviews API v4
  const url = `https://mybusiness.googleapis.com/v4/${location}/reviews?pageSize=50`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GBP reviews fetch failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return (data.reviews as GBPReview[]) ?? [];
}

/** Convert a GBP star-rating string to an integer (1-5). */
export function starRatingToInt(star: GBPReview["starRating"]): number {
  return STAR_MAP[star] ?? 5;
}

export { isConfigured };
