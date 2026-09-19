# Deployment

## Build

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

## Deploy Firebase rules only

```bash
firebase deploy --only firestore:rules,storage:rules,firestore:indexes
```

## Deploy static app

```bash
rsync -avz dist/ user@server:/var/www/alfredo-lms/
```

## Nginx config

- Use SPA fallback to `index.html`
- See `deployment/nginx.conf`

## SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Firebase Console checklist

- Enable Email/Password auth
- Enable Google auth
- Add authorized domains
- Confirm Firestore rules deployed
- Confirm Storage rules deployed
- Confirm indexes deployed
- Seed platform settings
- Create first admin manually
