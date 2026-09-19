# Alfredo LMS Cost Guardrails

## Free-tier assumptions

- The app is designed for Firebase Spark or a tightly monitored low-cost Blaze setup.
- Firestore is used as the primary app database with sparse reads, batched page loads, and limited real-time listeners.
- Authentication is limited to email/password and Google sign-in.
- Storage is reserved for small assets such as avatars, thumbnails, assignment uploads, and generated certificates.

## Firestore read and write risk

- Every route must avoid unnecessary `onSnapshot` listeners because continuous listeners can multiply read costs fast.
- Role checks should fetch the signed-in user's profile once and reuse it in client state.
- Dashboard lists must always be paginated and filtered instead of loading entire collections.
- Counters, analytics, and denormalized badges should be updated deliberately because frequent writes can become the main hidden cost driver.

## Storage bandwidth risk

- Large downloads and repeated media streaming are the fastest path to exceeding free limits.
- User uploads should be compressed, size-limited, and scoped by path-based rules.
- Public assets should stay in the app bundle or CDN when possible instead of Firebase Storage.

## Video delivery guidance

- Course video files should not be hosted directly in Firebase Storage for production scale.
- Use external video providers, HLS platforms, or compressed private links with signed access patterns when Batch 2 introduces deeper media handling.
- Firebase Storage remains acceptable for trailers, thumbnails, or very small protected media samples only.

## Real-time listener policy

- Real-time listeners are intentionally limited to authentication, notifications, and a few high-value interactive areas.
- Most reads should use one-off fetches through React Query to reduce idle read churn.
- Any future chat, analytics, or progress feeds must justify why real-time behavior is essential.

## Pagination requirement

- Pagination is mandatory for courses, users, notifications, messages, enrollments, payments, and audit-heavy collections.
- Infinite scroll or load-more patterns should cap batch sizes and preserve cursors.
- Admin screens are especially sensitive because broad reads over large collections can spike cost quickly.

## What Alfred must monitor in Firebase Console

- Firestore daily document reads, writes, and deletes.
- Storage egress bandwidth and total stored media size.
- Authentication sign-in provider usage and unusual spikes.
- Slow queries, unindexed queries, and security advisor warnings.
- Rule denials that may cause client retry loops.
- Any collection that begins growing without pagination, archival, or aggregation strategy.
