# Security Audit

## Rules summary

- Roles live in Firestore, never custom claims
- Admin-only writes guard payments, settings, activation code generation, campaigns, and most platform operations
- Students cannot edit their role and cannot read other students' profile or progress docs
- Instructors are limited to their own course surfaces by rule checks
- Storage paths are size-limited and now include basic content-type checks
- Public certificate verification uses a sanitized `certificates` collection rather than raw private profile data

## Risk areas

- XP and some completion awards remain client-triggered; rules narrow damage but cannot make them tamper-proof without a server
- Activation code redemption may still require admin fallback if production rules become stricter
- Device fingerprinting is heuristic only
- Browser-playable video URLs cannot be fully hidden in a pure client app

## Manual tests

- Confirm student cannot update `users/{uid}.role`
- Confirm student cannot create admin payments or activation codes
- Confirm instructor cannot update another instructor's course
- Confirm anonymous user can verify only public certificate data
- Confirm certificate PDFs remain private in Storage

## Client-only limitation

This architecture is secure by Firebase rule boundaries, not by trusted server execution. It resists casual misuse but cannot guarantee perfect anti-tamper behavior for business logic that runs entirely on the client.
