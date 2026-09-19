# Seeding Guide

## First admin creation

Option A:

1. Register normally in the app.
2. Open Firebase Console.
3. Find `users/{uid}` for that account.
4. Change `role` to `admin` manually.
5. Reload the app.

The client app must not auto-create the first admin securely.

## Local development seed

- Use `scripts/seed-sample.ts` only for local/dev projects.
- Ensure `.env.local` points at a non-production Firebase project.
- Seed users, categories, courses, lessons, quizzes, assignments, activation codes, and platform settings after manually preparing the first admin profile.
