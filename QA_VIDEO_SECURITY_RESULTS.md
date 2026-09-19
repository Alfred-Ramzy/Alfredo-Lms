# QA Video Security Results

| Test | Expected | Actual | Status |
|---|---|---|---|
| Non-enrolled user blocked | Blocked | player checks enrollment and shows error | Pass (code audit) |
| Expired enrollment blocked | Blocked | not fully enforced in current player logic | Partial |
| Suspended enrollment blocked | Blocked | only active status is checked indirectly; more explicit suspended handling recommended | Partial |
| Device count limit enforced | Blocked at limit | device registration exists, hard max-device denial is not fully enforced yet | Partial |
| Revoked device loses access | Blocked | revocation data path exists but player does not fully deny revoked devices yet | Partial |
| Watermark includes name + UID fragment + timestamp | Present | current watermark includes email + timestamp, not UID fragment | Partial |
| Right-click disabled | Disabled as deterrent | event handler exists | Pass |
| F12/Ctrl+U/Ctrl+S blocked | Disabled as deterrent | keydown handler exists | Pass |
| Hidden tab pauses video | Pauses | visibilitychange handler exists | Pass |
| Watch progress resumes | Saves last position | progress save exists; explicit resume seek behavior still needs live check | Partial |

Important limitation: browser-level video protection here is deterrence only, not true DRM. Without a backend or DRM provider, a determined user can still inspect browser-delivered media.
