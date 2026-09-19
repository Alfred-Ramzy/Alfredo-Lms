# Client-Side Logic Audit

| Business Logic | File | Firebase Operation | Security Rule Dependency | Limitation |
|---|---|---|---|---|
| Registration profile | `src/pages/auth/RegisterPage.tsx` | `setDoc users/{uid}` | self-create only | client-originated |
| Role routing | `src/contexts/AuthContext.tsx` | `getDoc users/{uid}` | user/admin read | role stored in Firestore |
| Payment approval | `src/pages/admin/PaymentsPage.tsx` | batch update payment/enrollment | admin only | no external gateway |
| XP award | `src/lib/gamification/index.ts` | `increment`, `arrayUnion` | user progress write path | client integrity limitation |
| Certificate | `src/lib/certificates/generateCertificate.ts` | Storage upload + enrollment/certificate write | student-owned storage + enrollment write | client generated |
| Device check | `src/components/student/SecureVideoPlayer.tsx` | query/create `studentDevices` | student scoped | fingerprint not perfect |
| License | `src/lib/license/verifier.ts` | read `platformSettings/license_status` | public read | Firebase availability dependency |
| Activation redemption | `src/lib/activation/redeemActivationCode.ts` | batch update code/payment/enrollment | depends on rules | client-only redemption may need admin fallback |
| Messaging | `src/components/messages/MessagesWorkspace.tsx` | realtime conversations/messages | participant-only reads | no trusted server moderation |

This app intentionally stays backend-free. Security is enforced primarily through Firebase rules, scoped storage paths, and narrow client flows. It does not claim server-grade anti-tamper guarantees.
