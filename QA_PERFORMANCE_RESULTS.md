# QA Performance Results

| Check | Result | Status |
|---|---|---|
| Clean production build | Passed | Pass |
| Firebase chunk separated | `firebase-*.js` emitted | Pass |
| Heavy pages lazy-loaded | route lazy loading present; player lazy-loaded | Pass |
| Images lazy-loaded | no strong systematic image strategy found beyond limited image usage | Partial |
| Lists paginated | catalog and many list pages use `limit()` | Pass |
| Listener cleanup | key listeners use cleanup functions | Pass |
| Memory leaks from intervals/listeners | cleanup exists for main intervals/listeners found | Pass (code audit) |
| Initial bundle reasonableness | main app chunks moderate, certificate/charts chunk large | Partial |

Notes:

- `charts-BUkH4KyY.js` is still heavy due `html2canvas` + `jspdf` + QR generation. This is expected for client certificate generation but should stay off the critical path.
- A transient build memory error happened once during a parallel validation run, but a direct re-run succeeded immediately. Treat as tooling flake unless it reproduces consistently.
