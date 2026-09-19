# QA Firestore Rules Results

Environment note: Firebase Emulator Suite was not configured in this workspace and live rules execution was not available from this CLI session. Results are based on rule audit in `firestore.rules` and required manual follow-up steps.

| Test Name | Actor | Operation | Expected | Actual | Status | Fix Applied if Failed |
|---|---|---|---|---|---|---|
| Student cannot elevate own role | student | update `users/{uid}.role` | Denied | Rule preserves existing role on self-update | Pass (rule audit) | n/a |
| Student cannot read another student profile | student | read `users/{otherUid}` | Denied | Only admin or owner allowed | Pass (rule audit) | n/a |
| Student cannot approve payment | student | update `payments/{id}` | Denied | payment update is admin-only | Pass (rule audit) | n/a |
| Student cannot create activation codes | student | create `activationCodes/{id}` | Denied | activation codes admin-only | Pass (rule audit) | n/a |
| Student cannot edit instructor course | student | update `courses/{id}` | Denied | update limited to admin or owning instructor | Pass (rule audit) | n/a |
| Instructor cannot edit another instructor course | instructor | update foreign `courses/{id}` | Denied | ownership check on course instructorId | Pass (rule audit) | n/a |
| Instructor cannot update platform settings | instructor | update `platformSettings/{key}` | Denied | admin-only writes | Pass (rule audit) | n/a |
| Unauthenticated user cannot read private dashboard data | public | read private collections | Denied | most collections require auth or admin | Pass (rule audit) | n/a |
| Unauthenticated user cannot write payments/enrollments | public | create payment/enrollment | Denied | signed-in/admin-only restrictions | Pass (rule audit) | n/a |
| Public user can read safe course data | public | read published `courses/{id}` | Allowed only if published | rule allows published course reads | Pass (rule audit) | n/a |
| Student can read own profile | student | read `users/{uid}` | Allowed | owner read explicitly allowed | Pass (rule audit) | n/a |
| Student can update allowed profile fields | student | update safe fields | Allowed | self-update allowed while role/uid immutable | Pass (rule audit) | n/a |
| Student can create own payment request | student | create payment | Allowed | payment create checks `studentId == auth.uid` | Pass (rule audit) | n/a |
| Admin can approve payment | admin | update payment/create enrollment | Allowed | admin writes permitted | Pass (rule audit) | n/a |
| Instructor can edit own course | instructor | update owned course | Allowed | ownership rule present | Pass (rule audit) | n/a |
| Admin can manage users/settings/codes | admin | full admin operations | Allowed | admin-only rule helpers cover these paths | Pass (rule audit) | n/a |

Manual follow-up:

- Run Emulator Suite or Firebase Console Rules Playground with seeded actors
- Validate nested paths used in app, especially `conversations/{id}/messages` and `quizzes/{id}/attempts`
- Validate certificate public-read decision matches deployment intent
