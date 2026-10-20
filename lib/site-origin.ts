/**
 * Canonical public website origin used by SEO metadata and billing redirects.
 *
 * Configure one NEXT_PUBLIC_SITE_URL per environment (for example,
 * https://your-domain.example). Do not use service-specific endpoints here.
 */
const SITE_URL_SETTING = "NEXT_PUBLIC_SITE_URL";

export function getSiteOrigin(options: { requireConfigured?: boolean } = {}): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configured && options.requireConfigured) {
    throw new Error(`Missing configuration: ${SITE_URL_SETTING}`);
  }

  // Only a deployment preview or local development may use an automatic fallback.
  // Production should explicitly set NEXT_PUBLIC_SITE_URL as the canonical hostname.
  const candidate = configured
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error(`Invalid ${SITE_URL_SETTING}: expected an absolute website URL`);
  }

  if (
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    (parsed.protocol !== "https:" &&
      !(parsed.protocol === "http:" && parsed.hostname === "localhost"))
  ) {
    throw new Error(`Invalid ${SITE_URL_SETTING}: use an HTTPS website origin (or HTTP localhost)`);
  }

  return parsed.origin;
}
