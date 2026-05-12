"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, CheckCircle2, XCircle, Star, Globe, AlertTriangle } from "lucide-react";
import Image from "next/image";

interface SyncStatus {
  configured: boolean;
  lastSync: {
    at: string;
    inserted: number;
    updated: number;
    total: number;
    errors?: string[];
  } | null;
  googleReviewCount: number;
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewed_at?: string;
  source: string;
  reviewer_avatar_url?: string;
  review_reply?: string;
}

export default function GoogleReviewsManagement() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/google-reviews/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      // ignore
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews?source=google_business_profile");
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    loadReviews();
  }, [loadStatus, loadReviews]);

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/google-reviews/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncResult({
          success: true,
          message: `Sync complete — ${data.inserted} new, ${data.updated} updated out of ${data.total} reviews.`,
        });
        await loadStatus();
        await loadReviews();
      } else {
        setSyncResult({ success: false, message: data.error || "Sync failed." });
      }
    } catch (err) {
      setSyncResult({
        success: false,
        message: err instanceof Error ? err.message : "Unexpected error during sync.",
      });
    } finally {
      setSyncing(false);
    }
  }

  function formatDate(iso?: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-brand-red" />
            Google Business Reviews
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Sync reviews from your Google Business Profile into the website.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing || !status?.configured}
          className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Sync Now"}
        </button>
      </div>

      {/* Config warning */}
      {!loadingStatus && !status?.configured && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Credentials not configured</p>
            <p>
              Add the following environment variables to enable syncing:
            </p>
            <ul className="mt-2 space-y-0.5 font-mono text-xs bg-amber-100 rounded-lg p-3">
              <li>GOOGLE_CLIENT_ID</li>
              <li>GOOGLE_CLIENT_SECRET</li>
              <li>GOOGLE_REFRESH_TOKEN</li>
              <li>GBP_ACCOUNT_ID &nbsp;(e.g. accounts/1234567890)</li>
              <li>GBP_LOCATION_ID &nbsp;(e.g. locations/9876543210)</li>
            </ul>
            <p className="mt-2">
              See <span className="font-semibold">SETUP_GUIDE.md</span> for the
              OAuth one-time setup steps.
            </p>
          </div>
        </div>
      )}

      {/* Sync result banner */}
      {syncResult && (
        <div
          className={`flex items-start gap-3 rounded-xl p-4 border ${
            syncResult.success
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {syncResult.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{syncResult.message}</p>
        </div>
      )}

      {/* Stats row */}
      {status && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Google Reviews in DB</p>
            <p className="text-2xl font-bold text-gray-900">{status.googleReviewCount}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Last Synced</p>
            <p className="text-sm font-semibold text-gray-800">
              {status.lastSync ? formatDate(status.lastSync.at) : "Never"}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                status.configured
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.configured ? "bg-green-500" : "bg-amber-500"}`} />
              {status.configured ? "Configured" : "Not Configured"}
            </span>
          </div>
        </div>
      )}

      {/* Imported reviews list */}
      {reviews.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Synced Reviews ({reviews.length} shown)
          </h3>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex gap-4"
              >
                {review.reviewer_avatar_url ? (
                  <Image
                    src={review.reviewer_avatar_url}
                    alt={review.user_name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-gray-500 text-sm font-bold">
                      {review.user_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{review.user_name}</p>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                      Google
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-3">{review.comment}</p>
                  )}
                  {review.review_reply && (
                    <div className="mt-2 pl-3 border-l-2 border-brand-red/30">
                      <p className="text-xs text-gray-500 font-semibold mb-0.5">Owner reply</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{review.review_reply}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">
                    {formatDate(review.reviewed_at || review.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loadingStatus && reviews.length === 0 && status?.configured && (
        <div className="text-center py-12 text-gray-400">
          <Globe className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No Google reviews synced yet. Click "Sync Now" to import them.</p>
        </div>
      )}
    </div>
  );
}
