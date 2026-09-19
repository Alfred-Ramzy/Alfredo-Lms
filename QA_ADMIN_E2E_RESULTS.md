# QA Admin E2E Results

| Step | Result | Status | Notes |
|---|---|---|---|
| Login as admin | Implemented | Ready for live test | Firestore role-based redirect exists |
| View dashboard stats | Implemented | Ready for live test | dashboard aggregates client-fetched data |
| Change currency | Implemented | Ready for live test | settings writes supported |
| Update exchange rates | Partial | Not fully surfaced in current UI | store supports rates, settings UI does not expose all rates yet |
| Generate activation codes | Implemented | Ready for live test | admin page creates codes |
| Export codes CSV | Missing | Fail | no CSV export UI found; document as release limitation |
| Approve pending payment | Implemented | Ready for live test | payment batch approval exists |
| Change user role | Implemented | Ready for live test | admin users page supports role change |
| Deactivate/reactivate user | Implemented | Ready for live test | admin users page supports toggle |
| Revoke a device | Implemented | Ready for live test | devices page supports revoke |
| Send campaign notification | Implemented | Ready for live test | marketing page batch-creates notifications |
| Toggle maintenance/license status | Partial | Ready for live test | license status supported, maintenance mode data exists but global UI lockdown is license-driven |

Admin conclusion: acceptable for release candidate, but CSV export is still missing and should be tracked if required for launch scope.
