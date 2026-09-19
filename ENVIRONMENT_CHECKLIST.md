# Environment Checklist

- Pass: `.env.example` exists and documents all required `VITE_FIREBASE_*` variables
- Pass: Firebase config reads only client-safe frontend variables from `import.meta.env`
- Pass: `src/lib/firebase/config.ts` now throws a friendly developer-facing error when required Firebase env vars are missing
- Pass: No obvious service keys or private key material were found in app source or docs during repository scan
- Pass: Firebase frontend config uses Auth, Firestore, and Storage only
- Note: `.env.local` still needs real project values before live QA against Firebase can be completed

Required variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
