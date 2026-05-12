import { NextResponse } from "next/server";
import { isConfigured } from "@/lib/googleBusinessProfile";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const configured = isConfigured();

    let lastSync: Record<string, unknown> | null = null;
    let googleReviewCount = 0;

    const client = await pool.connect();
    try {
      // Last sync metadata
      const syncRes = await client.query(
        `SELECT value FROM settings WHERE key = 'gbp_last_sync' LIMIT 1`
      );
      if (syncRes.rows.length > 0) {
        lastSync = JSON.parse(syncRes.rows[0].value);
      }

      // Count synced reviews currently in DB
      const countRes = await client.query(
        `SELECT COUNT(*) FROM reviews WHERE source = 'google_business_profile'`
      );
      googleReviewCount = parseInt(countRes.rows[0].count, 10);
    } catch {
      // settings table or column may not exist yet; non-fatal
    } finally {
      client.release();
    }

    return NextResponse.json({
      configured,
      lastSync,
      googleReviewCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
