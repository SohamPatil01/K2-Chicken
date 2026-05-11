/**
 * Canonical public origin (no trailing slash). Used for metadata, sitemap, JSON-LD.
 *
 * 1. NEXT_PUBLIC_SITE_URL — set in Vercel → Environment Variables (recommended for stable SEO).
 * 2. VERCEL_PROJECT_PRODUCTION_URL — provided on Vercel production deployments.
 * 3. VERCEL_URL — current deployment hostname (previews / fallback).
 * 4. http://localhost:3001 — local dev (see package.json dev port).
 */
export function getSiteUrl(): string {
  const noTrailingSlash = (s: string) => s.replace(/\/+$/, "");

  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    const withProto = explicit.startsWith("http")
      ? explicit
      : `https://${explicit}`;
    return noTrailingSlash(withProto);
  }

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) {
    const host = noTrailingSlash(production.replace(/^https?:\/\//, ""));
    return `https://${host}`;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = noTrailingSlash(vercel.replace(/^https?:\/\//, ""));
    return `https://${host}`;
  }

  return "http://localhost:3001";
}

/** Absolute URL for a site path or already-absolute URL. */
export function absoluteUrl(path: string): string {
  if (!path) return getSiteUrl();
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getSiteUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
