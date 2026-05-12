import { NextResponse } from "next/server";
import { syncGoogleReviews } from "@/lib/reviewSync";
import { isConfigured } from "@/lib/googleBusinessProfile";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    if (!isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Google Business Profile credentials are not configured. " +
            "Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, " +
            "GBP_ACCOUNT_ID and GBP_LOCATION_ID to your environment variables.",
        },
        { status: 400 }
      );
    }

    const result = await syncGoogleReviews();

    // Store last-sync timestamp in settings table
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('gbp_last_sync', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [JSON.stringify({ at: new Date().toISOString(), ...result })]
      );
    } catch {
      // settings table may not have this key yet; non-fatal
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
