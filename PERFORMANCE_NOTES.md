# Performance Notes

## Main chunks

- `firebase`: Firebase modular SDK imports
- `vendor`: React, React DOM, React Router
- `query`: React Query and Zustand
- `ui`: Framer Motion and Lucide
- `charts`: certificate-related heavy libs (`html2canvas`, `jspdf`, `qrcode.react`)

## Known heavy pages

- Course player because of protected media UI
- Certificate generation because canvas/PDF work happens client-side
- Course builder due to multi-tab editing workflows
- Analytics pages when datasets grow

## Firestore read minimization

- Paginated list queries use `limit()`
- Student dashboard limits enrollments, notifications, recommendations, and deadlines
- Realtime listeners are constrained to notifications and active messaging surfaces
- Course joins use batched ID lookups instead of broad collection scans

## Target

- Lighthouse goal: 90+ on production hosting with compressed assets and a warm CDN path
