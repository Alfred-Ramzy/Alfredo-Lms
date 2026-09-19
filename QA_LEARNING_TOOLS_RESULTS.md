# QA Learning Tools Results

## Quiz

| Test | Expected | Actual | Status |
|---|---|---|---|
| Attempt limit enforced | Limited attempts | current quiz model has attempts fields but UI does not enforce strict limit yet | Partial |
| Timer auto-submit works | Auto-submit at zero | code path exists in `QuizPage` | Pass (code audit) |
| Score calculation correct | Correct score | implementation compares answers and totals points | Pass (code audit) |
| Pass/fail correct | Correct threshold | compares against `passingScore` | Pass (code audit) |
| XP awarded once | Single award | source-doc flag guard added in gamification | Pass (code audit) |
| Perfect score bonus once | Single bonus | separate source-doc guard exists | Pass (code audit) |

## Assignment

| Test | Expected | Actual | Status |
|---|---|---|---|
| File type validation | Invalid files blocked | Storage rules block many invalid types; UI pre-validation is limited | Partial |
| File size validation | Large files blocked | Storage rules enforce limit | Pass (rule audit) |
| Correct Storage path | `assignments/{assignmentId}/{studentId}/{filename}` | upload helper uses expected path | Pass |
| Submission status updates | Pending/graded visible | submission status model exists | Pass (code audit) |
| Instructor grade visible to student | Visible | student assignment page reads submission feedback/status | Pass (code audit) |
| Notification created | Sent on grading/submission | some actions notify, but grading-specific notification is not fully wired | Partial |
