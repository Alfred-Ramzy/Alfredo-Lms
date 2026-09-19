# QA Routing Results

Method: static route audit of `src/router/index.tsx` and `src/router/ProtectedRoute.tsx`, plus preview probing of direct URLs.

| Test | Expected | Actual | Status |
|---|---|---|---|
| Student blocked from admin routes | Redirect to correct student dashboard | `ProtectedRoute` rejects wrong roles and redirects with `getDashboardPath(role)` | Pass (code audit) |
| Student blocked from instructor routes | Redirect to student dashboard | Same role gate logic applies | Pass (code audit) |
| Instructor blocked from admin routes | Redirect to instructor dashboard | Same role gate logic applies | Pass (code audit) |
| Instructor blocked from other instructors' course builder pages | Route protected by instructor role only; data ownership enforced separately by rules | Partial | UI route allows instructor area, ownership restriction relies on Firestore rules and page logic |
| Admin access to admin routes | Allowed | Protected admin routes present | Pass (code audit) |
| Direct SPA refresh on protected routes | Returns app shell HTML | Preview returned `200` for `/admin/dashboard` and `/student/catalog` | Pass |

Note: route authorization is role-based in the SPA; fine-grained resource ownership still depends on Firestore rules.
