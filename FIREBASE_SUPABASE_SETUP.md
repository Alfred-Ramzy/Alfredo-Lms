# Firebase + Supabase Initial Setup

## Stack

- Firebase Auth for authentication
- Firestore for application data
- Supabase Storage for simple file uploads only
- External video URLs for lessons
- No Firebase Storage runtime usage
- No Supabase Database usage
- No Supabase Auth usage

This version is positioned as a production-ready academic MVP for university LMS discussion and academic use.

## Architecture confirmation

- Firebase Auth is the only auth system
- Firestore is the only database
- Supabase is used only for Storage
- Firebase Storage is disabled at runtime
- Course videos use external URLs only
- No backend, no Cloud Functions, no Next.js, and no API routes are used

## Environment

```env
VITE_FIREBASE_API_KEY=AIzaSyAf48HUnopW5GfBDYvvV2qM-q1KFr6KvWQ
VITE_FIREBASE_AUTH_DOMAIN=lmsproject-8974c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lmsproject-8974c
VITE_FIREBASE_STORAGE_BUCKET=lmsproject-8974c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=334688009759
VITE_FIREBASE_APP_ID=1:334688009759:web:28b861dfa3a33ee2389f2a
VITE_FIREBASE_MEASUREMENT_ID=G-R04CYSF6L7
VITE_ENABLE_FIREBASE_STORAGE=false
VITE_STORAGE_PROVIDER=supabase
VITE_SUPABASE_URL=https://whngntbrmppzledovojb.supabase.co
VITE_SUPABASE_ANON_KEY=<frontend-anon-key>
```

## Supabase bucket usage

- `avatars`: public
- `course-thumbnails`: public
- `certificates`: public/shareable if accepted
- `assignment-files`: public for the current academic MVP simplicity, but should move to private/signed URLs in stricter production
- `payment-proofs`: public for the current academic MVP simplicity, but should move to private/signed URLs in stricter production

## Firestore required docs

- `platformSettings/display_currency`
- `platformSettings/currency_rates`
- `platformSettings/registration_open`
- `platformSettings/maintenance_mode`
- `platformSettings/payment_instructions`
- `platformSettings/max_devices_global`
- `platformSettings/license_status`

## Sample seed accounts

- `admin@alfredo.demo` / `Demo123!`
- `instructor@alfredo.demo` / `Demo123!`
- `student@alfredo.demo` / `Demo123!`

## Sample seed content

- 1 category
- 1 published course
- 1 top-level lesson using an external `lesson.videoUrl`
- 1 activation code: `DEMO-2026-ALMS`
- 1 quiz
- 1 text-friendly assignment

## Why Firebase Storage is disabled

Firebase Storage is not used at runtime in this architecture because this version keeps Firebase on Spark-friendly Auth + Firestore while Supabase Storage handles simple file uploads.

## Current production notes

- Uploaded files are public where needed for academic MVP simplicity
- External lesson video URLs can still be inspected in browser DevTools
- This version is production-ready for academic MVP/discussion usage, but highly sensitive file privacy should be hardened later with signed URLs, backend services, Supabase Auth, or Firebase Storage Blaze
- True private video delivery would require signed URLs or a dedicated private video provider later

## Commands

```bash
npm install
npm install @supabase/supabase-js
npm run dev
npm run build
firebase deploy --only firestore:rules,firestore:indexes --project lmsproject-8974c
```
