# QA Storage Rules Results

Environment note: live Storage rule execution was not possible in this CLI-only audit. Results below are rule-audit based against `storage.rules` plus UI path inspection.

| Test | Expected | Actual | Status |
|---|---|---|---|
| User uploads own avatar | Allowed | `/avatars/{userId}` write allowed for same UID, 2 MB, image content type | Pass (rule audit) |
| User uploads another user's avatar | Denied | UID mismatch blocks write | Pass (rule audit) |
| Student uploads own assignment | Allowed | own UID path allowed, 20 MB limit, limited file types | Pass (rule audit) |
| Student overwrites another student's assignment | Denied | path requires same auth UID as path userId | Pass (rule audit) |
| Student reads own certificate | Allowed | own certificate path readable | Pass (rule audit) |
| Student reads another student's certificate | Denied | certificate read limited to same UID | Pass (rule audit) |
| File size limits enforced | Expected | explicit size checks exist | Pass (rule audit) |
| Invalid file type handling exists in UI | Partial | rules enforce type patterns, UI validation is limited and should be improved in-browser | Partial |

Recommendation: add client-side file type/size messaging before upload attempts for clearer UX parity with rule failures.
