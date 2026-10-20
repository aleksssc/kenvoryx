# Kenvoryx rebrand migration checklist

Brand: **Kenvoryx** — **Monitor. Manage. Secure.**

## Deployment sequencing

This branch begins the public-facing brand migration. It deliberately preserves all identifiers used by deployed agents, databases, services and providers. DO NOT blindly search-and-replace lowercase `sentinelgrid`, uppercase `SENTINELGRID`, binaries or filenames: they form external interfaces and may break enrolled devices, remote sessions and upgrades.

## External integrations / manual confirmation

- [ ] **Domain / DNS**: register and verify a Kenvoryx domain (not yet verified), configure DNS, SSL and redirects from the previous live URL. Keep existing URLs available during transition.
- [ ] **Vercel**: add and verify the new domain; update project display name only after deployment and any webhook integrations are revised. Current `sentinelgrid-one.vercel.app` remains the canonical fallback in metadata, pending the new domain.
- [ ] **Supabase Auth**: configure Site URL and redirect allowlist for the new domain; review OAuth providers, magic-link and invitation templates, SMTP sender identity, CORS and storage URLs. Keep existing DB table/column names and UUIDs unless an explicit migration is written and tested.
- [ ] **Stripe**: update business/public descriptor, checkout product names, customer portal branding and return URLs, emails and webhook endpoints if hostname changes. Preserve price IDs, customer IDs, subscription IDs, secrets and webhook signing secrets.
- [ ] **Upstash/Redis**: preserve namespaces `sentinelgrid:...` during phased rollout; update all producers and consumers atomically or implement dual-read migration. Includes remote tickets, rate limits, pubsub channels and RDP.
- [ ] **Relay / realtime**: maintain `SENTINELGRID_*\` environment variables and shared secrets until Vercel and relay are changed together; investigate `SENTINGRID_RELAY_PORT` compatibility alias.
- [ ] **Windows agent**: stage an upgrade that preserves enrollment, service identity, paths, registry keys, protocols, config and tokens. Plan any rename of `SentinelGridAgent`, updater, RDP connector, `SentinelGridVideo.dll`, and MSI UpgradeCode/ProductCode carefully. Existing agents must update before old identifiers are retired.
- [ ] **Code signing & release pipeline**: update Authenticode certificate publisher/display names only with correct signing identity. Review MSI metadata, PE version resources, Go module imports, release manifests, object storage and CI workflows; preserve old download/update paths until the installed fleet migrates.
- [ ] **API & compatibility**: preserve `/api/agent/*`, existing enroll formats, auth tokens, signing keys, endpoint contracts and callback IDs until rollout is validated.
- [ ] **Repository/CI**: rename `aleksssc/sentinelgrid` only after reviewing Vercel, deployment hooks, release scripts, Git remote, checkout references and GitHub Actions.
- [ ] **Assets**: create an original Kenvoryx mark, wordmark, favicon, OG images, Windows icons and splash art. Current `/logos/sentinelgrid-*.svg` files remain in place temporarily; the visual logo is **not rebranded yet**.
- [ ] **Legal**: check Kenvoryx trademark clearance in Portuguese INPI, EUIPO and target markets; domain checks and name-search results are not trademark clearance.
- [ ] **Verification**: run `npm run build`, tests, agent Windows build, MSI upgrade/uninstall regression, RDP relay and real-time smoke tests in staging prior to merge.

## Notable coupling in repository

- `app/layout.tsx` contains fallback `sentinelgrid-one.vercel.app`.
- `components/brand-logo.tsx` loads `/logos/sentinelgrid-*.svg`.
- `lib/remote/rdp.ts`, `lib/realtime/pubsub.ts`, `lib/remote/rate-limit.ts` use Redis keys/channels under the legacy prefix.
- `relay/rdp-relay.mjs`, `relay/realtime-config.mjs`, `relay/Dockerfile` use `SENTINELGRID_*` env vars.
- `agent/go.mod` and source imports use the `sentinelgrid/agent` module path.
- `agent/cmd/sentinelgrid-*` and `installer/windows` control installed service/update compatibility.
- `native/video/SentinelGridVideo` controls native DLL name and metadata.

## Rollout

1. Review and merge customer-facing text separately from compatibility migrations.
2. Deploy new original assets and domain after legal clearance.
3. Add backward-compatible dual-name support and signed agent transition release.
4. Validate existing installed agents, RDP, enrollment, Stripe billing and Supabase authentication.
5. Retire old names only after fleet migration and monitoring.
