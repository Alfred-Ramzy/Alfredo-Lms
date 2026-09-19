# QA Data Consistency Results

| Test | Expected | Actual | Status |
|---|---|---|---|
| Payment approval creates one enrollment | Single enrollment | deterministic enrollment ID `${studentId}_${courseId}` reduces duplication | Pass |
| Activation code cannot be reused | One use | `isUsed`/`isActive` query + update flow exists | Pass (code audit) |
| `studentsCount` increments once | One increment | approval/redemption batches increment once | Pass (code audit) |
| XP not duplicated on refresh | Single award | source-doc award flags added | Pass (code audit) |
| Certificate generated once per enrollment | One logical credential | generation writes to enrollment; UI still depends on operator discipline/live flow | Partial |
| Device records avoid duplication | Minimal duplicates | fingerprint-based doc IDs reduce duplicates | Pass |
| Notifications not spammed | Avoid repeated spam | some actions guarded, but repeated admin campaign triggers intentionally re-send | Partial |
