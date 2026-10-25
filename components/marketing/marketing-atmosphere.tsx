/**
 * Shared visual background for secondary marketing pages.
 * Intentionally separate from the homepage's original hero-scan animation.
 */
export function MarketingAtmosphere() {
  return (
    <div className="kv-subpage-atmosphere" aria-hidden="true">
      <div className="kv-subpage-grid" />
      <div className="kv-subpage-glow kv-subpage-glow-a" />
      <div className="kv-subpage-glow kv-subpage-glow-b" />
      <div className="kv-subpage-scan" />
    </div>
  );
}
