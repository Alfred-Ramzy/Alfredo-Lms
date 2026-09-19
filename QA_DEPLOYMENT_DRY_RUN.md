# QA Deployment Dry Run

## Build

- `npm run build` passed

## Preview

- `npm run preview -- --host 127.0.0.1` started successfully
- Direct route probes returned `200` for:
  - `/admin/dashboard`
  - `/student/catalog`
  - `/verify/test-id`

## SPA fallback

- Preview behavior confirms SPA route serving works in local preview
- `deployment/nginx.conf` includes:

```nginx
try_files $uri $uri/ /index.html;
```

## Status

- Pass for local deployment dry run
- Production still requires real Firebase env values and deployed rules/indexes
