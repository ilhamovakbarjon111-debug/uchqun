# Uchqun Government Panel

Davlat nazorat paneli - maktablar, reytinglar va statistika boshqaruvi.

## Features

- Dashboard - umumiy statistika
- Maktablar - maktablar ro'yxati va baholari
- Reytinglar - maktablar reytinglari
- To'lovlar - to'lov statistikasi
- Statistika - batafsil statistika

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Build output will be in the `dist` folder.

## Environment Variables

```env
VITE_API_URL=https://uchqun-production.up.railway.app/api
```

## Netlify Deployment

See [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) for detailed deployment instructions.

### Quick Setup on Netlify:

1. **Base directory**: `government` (or leave empty if deploying from root)
2. **Build command**: `npm install && npm run build`
3. **Publish directory**: `dist`
4. **Environment variable**: `VITE_API_URL=https://uchqun-production.up.railway.app/api`

**Important**: Make sure `netlify.toml` file exists in the `government` folder for proper SPA routing.
