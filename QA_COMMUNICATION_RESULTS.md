# QA Communication Results

## Notifications

| Test | Expected | Actual | Status |
|---|---|---|---|
| Unread count updates realtime | Realtime | `NotificationBell` listens on user notifications | Pass (code audit) |
| Mark one read | Works | implemented | Pass |
| Mark all read | Works | implemented with batch of updates | Pass |
| Action URL navigates | Works | bell click navigates to `href` | Pass |
| Campaign notifications audience only | Targeted | current marketing page sends to fetched users broadly, not advanced segmented audience | Partial |

## Messaging

| Test | Expected | Actual | Status |
|---|---|---|---|
| Start conversation | Works | implemented | Pass (code audit) |
| Send message | Works | implemented | Pass |
| Receive realtime message | Works | active conversation listener present | Pass |
| Attachment upload works | Works | not implemented in current message UI | Fail |
| Read state updates | Works | limited unread counts exist; per-message read UX is minimal | Partial |
| Unauthorized read denied | Denied | rules scoped to participants/admin | Pass (rule audit) |
