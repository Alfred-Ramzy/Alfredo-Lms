# QA Auth Results

Environment note: full live auth execution was not possible in this CLI-only audit because no browser session, seeded role accounts, or Firebase console access were available here. Results below combine code-path verification, route wiring inspection, and command-level validation.

| Scenario | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|
| Register student by email | Auth user + Firestore profile | Code path verified in `src/pages/auth/RegisterPage.tsx` and `createStudentProfile()` | Pass (code audit) | Needs live Firebase confirmation |
| Login student | Redirect `/student/dashboard` | Redirect logic present in `src/pages/auth/LoginPage.tsx` | Pass (code audit) | Needs live account test |
| Login instructor | Redirect `/instructor/dashboard` | Role-based redirect uses Firestore role | Pass (code audit) | Needs live account test |
| Login admin | Redirect `/admin/dashboard` | Role-based redirect uses Firestore role | Pass (code audit) | Needs live account test |
| Wrong password | Friendly error | Firebase errors mapped to user-friendly text | Pass (code audit) | English mapping verified |
| Forgot password | Reset email sent | `resetPassword()` wired in `ForgotPasswordPage` | Pass (code audit) | Needs live mail test |
| Google login new user | Student profile created | `ensureGoogleProfile()` creates Firestore user doc | Pass (code audit) | Needs live Google provider test |
| Inactive user login | Access blocked | Login flow logs out and throws friendly message | Pass (code audit) | Needs seeded inactive account |
| Logout | Store cleared + redirect | `logout()` wired in shell and auth store clear on auth change | Pass (code audit) | Manual browser check recommended |
| Refresh protected route | Auth restores correctly | `AuthContext` subscribes to auth state and `ProtectedRoute` handles loading/redirect | Pass (code audit) | Needs browser refresh test |

Overall: auth implementation is coherent and build-safe, but live pass/fail still requires real Firebase test accounts.
